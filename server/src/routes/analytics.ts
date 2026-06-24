import { Router, Request, Response } from 'express';
import { fetchAnalytics, AnalyticsRange } from '../services/AnalyticsService';

const router = Router();
const VALID_RANGES: AnalyticsRange[] = [7, 14, 30];

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const raw = Number(req.query.range);
  const range: AnalyticsRange = (VALID_RANGES.includes(raw as AnalyticsRange) ? raw : 30) as AnalyticsRange;
  const data = await fetchAnalytics(range);
  res.json(data);
});

export default router;
