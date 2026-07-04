import { Router } from 'express';
import { sendSuccess } from '../utils/response';
import { env } from '../config/env.config';
import { runSeedCleanup } from '../utils/cleanupSeedData';
import { ApiError } from '../utils/ApiError';

const router = Router();

router.get('/', (req, res) => {
  sendSuccess(req as any, res, 200, 'Health check passed', {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/** Remove seeded mock events/users from the connected database (production-safe). */
router.post('/cleanup-seed', async (req, res) => {
  const passcode = req.body?.passcode;
  if (passcode !== env.ORGANIZER_PASSCODE) {
    throw new ApiError(403, 'Invalid passcode');
  }
  const result = await runSeedCleanup();
  sendSuccess(req as any, res, 200, 'Seed cleanup complete', result);
});

export default router;
