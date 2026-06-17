// POST /api/subscribe — validates email and persists subscriber via SubscriberService.
import { Router, Request, Response } from 'express';
import { subscribe } from '../services/SubscriberService';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email?: string };

  if (!email || !EMAIL_RE.test(email)) {
    res.status(400).json({ success: false, error: 'Invalid email' });
    return;
  }

  console.log(`[subscribe] received: ${email}`);
  const result = await subscribe(email);
  res.json(result);
});

export default router;
