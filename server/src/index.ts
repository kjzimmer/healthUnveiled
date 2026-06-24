import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { formLimiter } from './middleware/rateLimiter';
import { requireAdmin } from './middleware/auth';
import subscribeRouter from './routes/subscribe';
import authRouter from './routes/auth';
import peopleRouter from './routes/people';
import contactRouter from './routes/contact';
import analyticsRouter from './routes/analytics';

const REQUIRED_ENV = ['JWT_SECRET', 'DATABASE_URL'] as const;
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[startup] Missing required env var: ${key}`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/subscribe', formLimiter, subscribeRouter);
app.use('/api/auth', authRouter);
app.use('/api/people', requireAdmin, peopleRouter);
app.use('/api/contact', contactRouter);
app.use('/api/analytics', requireAdmin, analyticsRouter);

// Admin SPA catch-all — must come after all API routes
app.get(['/admin', '/admin/*path'], (_req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'admin', 'index.html'));
});

// Global JSON error handler — prevents Express returning HTML error pages to API clients
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[error]', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[server] running on port ${PORT}`);
});
