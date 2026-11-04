/**
 * Rork LLM client (keyless). Endpoint: https://toolkit.rork.com/text/llm/
 *
 * NOTE: the endpoint returns HTTP 403 unless the exact User-Agent below is sent.
 * This was verified empirically — do not remove it.
 */

export interface RorkMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface RorkResponse {
  completion?: string;
  error?: { code?: string; message?: string };
}

export class RorkError extends Error {}

export async function callRorkLlm(
  messages: RorkMessage[],
  options: { timeoutMs?: number; maxRetries?: number } = {}
): Promise<string> {
  const { timeoutMs = 60000, maxRetries = 3 } = options;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AccountIQ-Agent/1.0', // required — endpoint 403s without it
        },
        body: JSON.stringify({ messages }),
        signal: controller.signal,
      });

      const text = await response.text();
      if (!response.ok) {
        throw new RorkError(`Rork API HTTP ${response.status}: ${text.slice(0, 300)}`);
      }

      let data: RorkResponse;
      try {
        data = JSON.parse(text);
      } catch {
        throw new RorkError(`Rork returned non-JSON: ${text.slice(0, 200)}`);
      }

      if (data.error) throw new RorkError(`Rork error ${data.error.code || ''}: ${data.error.message || 'unknown'}`);
      if (typeof data.completion !== 'string') throw new RorkError('Rork response missing completion field');

      return data.completion;
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[RorkClient] attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);
      if (attempt < maxRetries) await new Promise((r) => setTimeout(r, 1200 * attempt));
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new RorkError('Failed to obtain completion from Rork LLM');
}

/**
 * Robust JSON extraction and repair engine:
 * 1. Strips markdown fences
 * 2. Isolates JSON object/array boundaries
 * 3. Strips JS single-line and multi-line comments outside of string literals
 * 4. Escapes literal newlines, tabs, and control chars inside strings
 * 5. Strips trailing commas before } and ]
 * 6. Repairs unclosed strings/brackets if the response was truncated
 */
export function cleanAndRepairJson(raw: string): string {
  let s = raw.trim();
  // Strip code fences
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // Find start of JSON structure
  const firstObj = s.indexOf('{');
  const firstArr = s.indexOf('[');
  let start = -1;
  if (firstObj === -1) start = firstArr;
  else if (firstArr === -1) start = firstObj;
  else start = Math.min(firstObj, firstArr);
  if (start !== -1) {
    s = s.slice(start);
  }

  // Strip comments & escape raw control chars inside strings
  let insideString = false;
  let escape = false;
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const next = s[i + 1];

    if (insideString) {
      if (escape) {
        escape = false;
        out += c;
      } else if (c === '\\') {
        escape = true;
        out += c;
      } else if (c === '"') {
        insideString = false;
        out += c;
      } else if (c === '\n') {
        out += '\\n';
      } else if (c === '\r') {
        out += '\\r';
      } else if (c === '\t') {
        out += '\\t';
      } else {
        out += c;
      }
    } else {
      if (c === '"') {
        insideString = true;
        out += c;
      } else if (c === '/' && next === '/') {
        // Line comment: skip until newline
        while (i < s.length && s[i] !== '\n' && s[i] !== '\r') i++;
        if (i < s.length) out += s[i];
      } else if (c === '/' && next === '*') {
        // Block comment: skip until */
        i += 2;
        while (i < s.length - 1 && !(s[i] === '*' && s[i + 1] === '/')) i++;
        i++;
      } else {
        out += c;
      }
    }
  }
  s = out.replace(/,\s*([}\]])/g, '$1');

  // Attempt standard parse; if it fails, attempt structural bracket balancing
  try {
    JSON.parse(s);
    return s;
  } catch {
    // Fix a common model malformation: array-element objects garbled with a stray quote,
    // e.g. `},"{"id":...` (should be `},{"id":...`) or `}",` (should be `},`).
    // Applied only here — after a normal parse has already failed — so valid JSON is untouched.
    s = s.replace(/\}"\s*([,\]])/g, '}$1'); // }" , -> },   and   }" ] -> }]
    s = s.replace(/([\[,])\s*"\s*\{/g, '$1{'); // ,"{ -> ,{   and   [ "{ -> [{

    // Repair truncated unclosed strings & brackets
    insideString = false;
    escape = false;
    const stack: string[] = [];

    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (insideString) {
        if (escape) escape = false;
        else if (c === '\\') escape = true;
        else if (c === '"') insideString = false;
      } else {
        if (c === '"') insideString = true;
        else if (c === '{' || c === '[') stack.push(c);
        else if (c === '}') {
          if (stack.length && stack[stack.length - 1] === '{') stack.pop();
        } else if (c === ']') {
          if (stack.length && stack[stack.length - 1] === '[') stack.pop();
        }
      }
    }

    let rep = s;
    if (insideString) rep += '"';
    rep = rep.trim().replace(/,\s*$/, '');
    rep = rep.replace(/:\s*$/, ': null');
    rep = rep.replace(/,\s*([}\]])/g, '$1');

    while (stack.length > 0) {
      const open = stack.pop();
      if (open === '{') rep += '}';
      else if (open === '[') rep += ']';
    }

    rep = rep.replace(/,\s*([}\]])/g, '$1');
    return rep;
  }
}

export async function callRorkJson<T = any>(
  systemPrompt: string,
  userPrompt: string,
  options: { timeoutMs?: number; maxRetries?: number; parseRetries?: number } = {}
): Promise<T> {
  const parseRetries = options.parseRetries ?? 2;
  let lastRaw = '';

  for (let attempt = 0; attempt <= parseRetries; attempt++) {
    const prompt =
      attempt === 0
        ? userPrompt
        : `${userPrompt}\n\nIMPORTANT: Your previous response was not valid JSON. Return ONLY compact, valid JSON and keep each text field concise enough that the entire JSON fits in one response. No commentary, no code fences.`;

    lastRaw = await callRorkLlm(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      options
    );

    try {
      return JSON.parse(cleanAndRepairJson(lastRaw)) as T;
    } catch {
      console.warn(`[RorkClient] parse attempt ${attempt + 1}/${parseRetries + 1} failed; retrying.`);
    }
  }

  console.error('[RorkClient] JSON parse failed after retries. Raw snippet:\n', lastRaw.slice(0, 1200));
  throw new RorkError('Could not parse JSON from LLM after retries');
}
