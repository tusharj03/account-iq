/**
 * Web research layer.
 *
 * DORMANT BY DEFAULT. With no key configured, the app runs in honest "AI analysis"
 * mode: findings come from the model's own knowledge and are clearly labeled as
 * not web-verified. We never fabricate source URLs or dates in this mode.
 *
 * To enable genuine web-sourced findings, set SEARCH_API_KEY (and optionally
 * SEARCH_PROVIDER=tavily). The orchestrator will then run real searches and attach
 * real URLs + dates to findings, flipping the report into "web-verified" mode.
 *
 * Tavily is used because it has a free tier and returns clean, citable results.
 */

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
}

export function isWebSearchEnabled(): boolean {
  return Boolean(process.env.SEARCH_API_KEY && process.env.SEARCH_API_KEY.trim());
}

export async function webSearch(query: string, maxResults = 6): Promise<SearchResult[]> {
  if (!isWebSearchEnabled()) return [];

  const provider = (process.env.SEARCH_PROVIDER || 'tavily').toLowerCase();
  try {
    if (provider === 'tavily') {
      return await tavilySearch(query, maxResults);
    }
    console.warn(`[researchProvider] Unknown SEARCH_PROVIDER "${provider}" — skipping.`);
    return [];
  } catch (err: any) {
    console.warn(`[researchProvider] Search failed for "${query}":`, err?.message || err);
    return [];
  }
}

async function tavilySearch(query: string, maxResults: number): Promise<SearchResult[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.SEARCH_API_KEY,
        query,
        max_results: maxResults,
        search_depth: 'advanced',
        include_answer: false,
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Tavily HTTP ${res.status}`);
    const data: any = await res.json();
    return (data.results || []).map((r: any) => ({
      title: r.title,
      url: r.url,
      snippet: r.content,
      publishedDate: r.published_date,
    }));
  } finally {
    clearTimeout(timer);
  }
}

/** Flatten a batch of searches into a context block for the LLM, with indexed citations. */
export function formatResultsForPrompt(results: SearchResult[], snippetCap = 420): string {
  if (results.length === 0) return '';
  return results
    .map(
      (r, i) =>
        `[${i + 1}] ${r.title}${r.publishedDate ? ` (${r.publishedDate})` : ''}\nURL: ${r.url}\n${(r.snippet || '').slice(0, snippetCap)}`
    )
    .join('\n\n');
}
