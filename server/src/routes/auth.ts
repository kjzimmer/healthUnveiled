import { Router, Request, Response } from 'express';
import { login, refresh, logout } from '../services/AuthService';
import { requireAdmin } from '../middleware/auth';
import { loginLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', loginLimiter, async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password required' });
    return;
  }

  const result = await login(email, password);
  if (!result.success) {
    res.status(401).json({ success: false, error: result.error });
    return;
  }

  res.cookie('refresh_token', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: result.expiresAt,
    path: '/api/auth/refresh',
  });

  res.json({ success: true, accessToken: result.accessToken });
});

router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const raw = req.cookies?.refresh_token as string | undefined;
  if (!raw) {
    res.status(401).json({ success: false, error: 'No refresh token' });
    return;
  }

  const result = await refresh(raw);
  if (!result.success) {
    res.status(401).json({ success: false, error: result.error });
    return;
  }

  res.json({ success: true, accessToken: result.accessToken });
});

router.post('/logout', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const raw = req.cookies?.refresh_token as string | undefined;
  if (raw && req.admin) {
    await logout(req.admin.sub, raw);
  }
  res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
  res.json({ success: true });
});

router.get('/me', requireAdmin, (req: Request, res: Response): void => {
  res.json({ success: true, admin: req.admin });
});

export default router;
