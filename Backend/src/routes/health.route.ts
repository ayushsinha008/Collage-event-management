import { Router } from 'express';
import { sendSuccess } from '../utils/response';

const router = Router();

router.get('/', (req, res) => {
  sendSuccess(req as any, res, 200, 'Health check passed', {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
