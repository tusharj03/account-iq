import app from './app';
import { isWebSearchEnabled } from './researchProvider';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`[AccountIQ Backend] Server running on http://localhost:${PORT}`);
});
