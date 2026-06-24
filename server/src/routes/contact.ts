import { Router, Request, Response } from 'express';
import { createMessage, listMessages, markRead } from '../services/ContactService';
import { requireAdmin } from '../middleware/auth';
import { formLimiter } from '../middleware/rateLimiter';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', formLimiter, async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, subject, message } = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
  };

  if (!name || !email || !subject || !message) {
    res.status(400).json({ success: false, error: 'name, email, subject, and message are required' });
    return;
  }
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ success: false, error: 'Invalid email' });
    return;
  }

  const msg = await createMessage({ name, email, phone, subject, message });
  res.json({ success: true, id: msg.id });
});

router.get('/', requireAdmin, async (_req: Request, res: Response): Promise<void> => {
  const messages = await listMessages();
  res.json({ success: true, messages });
});

router.patch('/:id/read', requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const msg = await markRead(req.params['id'] as string);
    res.json({ success: true, message: msg });
  } catch {
    res.status(404).json({ success: false, error: 'Message not found' });
  }
});

export default router;
