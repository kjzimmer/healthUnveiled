// Express entry point — serves static public/ files and mounts API routes.
import express from 'express';
import path from 'path';
import subscribeRouter from './routes/subscribe';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/subscribe', subscribeRouter);

app.listen(PORT, () => {
  console.log(`[server] running on port ${PORT}`);
});
