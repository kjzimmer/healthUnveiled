// Express entry point — serves static public/ files and mounts API routes.
import express from 'express';
import path from 'path';
import { formLimiter } from './middleware/rateLimiter';
import subscribeRouter from './routes/subscribe';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/subscribe', formLimiter, subscribeRouter);

app.listen(PORT, () => {
  console.log(`[server] running on port ${PORT}`);
});
