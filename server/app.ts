import 'dotenv/config'; // loads SEARCH_API_KEY from .env (if present) before anything reads env
import express, { Request, Response } from 'express';
import cors from 'cors';
import {
  getAllCachedAccounts,
  getAccountByIdOrName,
  runResearchPipeline,
  askAccountCopilot,
  deleteAccount,
} from './orchestrator';
import { isWebSearchEnabled } from './researchProvider';
import { AgentStepProgress, AccountSummary } from './types';

const app = express();

app.use(cors());
app.use(express.json());

const router = express.Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'AccountIQ — IBM Storage Account Intelligence',
    researchMode: isWebSearchEnabled() ? 'web-verified' : 'ai-analysis',
    timestamp: new Date().toISOString(),
  });
});

// List all accounts the SE has already researched
router.get('/accounts', (_req: Request, res: Response) => {
  const summary: AccountSummary[] = getAllCachedAccounts()
    .map((a) => ({
      id: a.id,
      companyName: a.companyName,
      ticker: a.ticker,
      industry: a.industry,
      opportunityScore: a.opportunityScore,
      opportunityStage: a.opportunityStage,
      revenue: a.revenue,
      researchMode: a.researchMode,
      lastUpdated: a.lastUpdated,
    }))
    .sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : -1));
  res.json(summary);
});

router.get('/accounts/:id', (req: Request, res: Response) => {
  const account = getAccountByIdOrName(String(req.params.id));
  if (!account) {
    res.status(404).json({ error: 'Account not found' });
    return;
  }
  res.json(account);
});

router.delete('/accounts/:id', (req: Request, res: Response) => {
  const ok = deleteAccount(String(req.params.id));
  res.status(ok ? 200 : 404).json({ ok });
});

// POST /api/research — SSE progress stream or plain JSON
router.post('/research', async (req: Request, res: Response) => {
  const { companyName } = req.body;
  if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
    res.status(400).json({ error: 'companyName is required' });
    return;
  }

  const isStream = req.query.stream === 'true' || req.headers.accept === 'text/event-stream';

  if (isStream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    const send = (event: string, data: any) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    try {
      const report = await runResearchPipeline(companyName.trim(), (p: AgentStepProgress) => send('progress', p));
      send('complete', report);
      res.end();
    } catch (err: any) {
      console.error('[Research SSE] error:', err);
      send('error', { message: err?.message || 'Research failed' });
      res.end();
    }
  } else {
    try {
      const report = await runResearchPipeline(companyName.trim());
      res.json(report);
    } catch (err: any) {
      console.error('[Research] error:', err);
      res.status(500).json({ error: err?.message || 'Research failed' });
    }
  }
});

// POST /api/chat — copilot grounded in an already-researched account
router.post('/chat', async (req: Request, res: Response) => {
  const { accountId, companyName, question, history } = req.body;
  if (!question) {
    res.status(400).json({ error: 'question is required' });
    return;
  }
  const account = getAccountByIdOrName(accountId || companyName || '');
  if (!account) {
    res.status(404).json({ error: 'Research this account first, then ask the copilot.' });
    return;
  }
  try {
    const answer = await askAccountCopilot(account, question, history || []);
    res.json({ answer });
  } catch (err: any) {
    console.error('[Chat] error:', err);
    res.status(500).json({ error: err?.message || 'Copilot failed' });
  }
});

// Mount on both /api (direct/proxied calls) and / (rewritten calls)
app.use('/api', router);
app.use('/', router);

export default app;

