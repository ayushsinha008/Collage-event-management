import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Alias for /api/users/profile
router.get('/me', requireAuth, UserController.getProfile);

export default router;
