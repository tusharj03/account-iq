import { AccountIntelligenceReport, AgentStepProgress, AccountSummary } from '../types';

export async function fetchAccounts(): Promise<AccountSummary[]> {
  const res = await fetch('/api/accounts');
  if (!res.ok) return [];
  return res.json();
}

export async function fetchAccount(id: string): Promise<AccountIntelligenceReport> {
  const res = await fetch(`/api/accounts/${id}`);
  if (!res.ok) throw new Error('Account not found');
  return res.json();
}

export async function deleteAccount(id: string): Promise<void> {
  await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
}

export async function fetchResearchMode(): Promise<'web-verified' | 'ai-analysis'> {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    return data.researchMode || 'ai-analysis';
  } catch {
    return 'ai-analysis';
  }
}

export interface ResearchHandlers {
  onProgress: (p: AgentStepProgress) => void;
  onComplete: (report: AccountIntelligenceReport) => void;
  onError: (message: string) => void;
}

/** Streams the research pipeline via SSE, parsing progress + complete + error events. */
export async function streamResearch(companyName: string, h: ResearchHandlers): Promise<void> {
  const response = await fetch('/api/research?stream=true', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ companyName }),
  });

  if (!response.ok || !response.body) {
    h.onError('Could not start research. Is the backend running?');
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() || '';
    for (const block of blocks) {
      if (!block.trim()) continue;
      const eventMatch = block.match(/event:\s*([^\n]+)/);
      const dataMatch = block.match(/data:\s*([\s\S]+)/);
      const event = eventMatch ? eventMatch[1].trim() : 'message';
      const dataStr = dataMatch ? dataMatch[1].trim() : '';
      if (!dataStr) continue;
      try {
        const data = JSON.parse(dataStr);
        if (event === 'progress') h.onProgress(data);
        else if (event === 'complete') h.onComplete(data);
        else if (event === 'error') h.onError(data.message || 'Research failed');
      } catch {
        /* ignore partial parse */
      }
    }
  }
}

export async function askCopilot(
  accountId: string,
  question: string,
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountId, question, history }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Copilot failed');
  return data.answer;
}
