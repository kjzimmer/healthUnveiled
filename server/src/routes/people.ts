import { Router, Request, Response } from 'express';
import { listPeople, getPerson, updatePerson, deletePerson } from '../services/PersonService';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const people = await listPeople();
  res.json({ success: true, people });
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const person = await getPerson(req.params['id'] as string);
  if (!person) {
    res.status(404).json({ success: false, error: 'Person not found' });
    return;
  }
  res.json({ success: true, person });
});

router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  const { name, phone, notes, tags } = req.body as {
    name?: string;
    phone?: string;
    notes?: string;
    tags?: string[];
  };

  try {
    const person = await updatePerson(req.params['id'] as string, { name, phone, notes, tags });
    res.json({ success: true, person });
  } catch {
    res.status(404).json({ success: false, error: 'Person not found' });
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await deletePerson(req.params['id'] as string);
    res.json({ success: true });
  } catch {
    res.status(404).json({ success: false, error: 'Person not found' });
  }
});

export default router;
