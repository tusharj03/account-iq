import app from './app';
import { isWebSearchEnabled } from './researchProvider';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`[AccountIQ] API on http://localhost:${PORT} — mode: ${isWebSearchEnabled() ? 'web-verified' : 'ai-analysis'}`);
});
