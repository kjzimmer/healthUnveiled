import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { formLimiter } from './middleware/rateLimiter';
import { requireAdmin } from './middleware/auth';
import subscribeRouter from './routes/subscribe';
import authRouter from './routes/auth';
import peopleRouter from './routes/people';
import contactRouter from './routes/contact';
import analyticsRouter from './routes/analytics';

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

app.listen(PORT, () => {
  console.log(`[server] running on port ${PORT}`);
});
