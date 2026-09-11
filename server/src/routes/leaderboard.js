import { Router } from 'express';
import { getLeaderboard, getStats } from '../lib/leaderboard.js';
import { wrap } from '../lib/wrap.js';

const router = Router();

router.get(
  '/',
  wrap(async (_req, res) => {
    res.json(await getLeaderboard());
  })
);

router.get(
  '/stats',
  wrap(async (_req, res) => {
    res.json(await getStats());
  })
);

export default router;
