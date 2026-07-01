import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateProfileSchema } from '../validators/user.validator';

const router = Router();

// Protect all routes
router.use(requireAuth);

router.get('/profile', UserController.getProfile);
router.patch('/profile', validate(updateProfileSchema), UserController.updateProfile);
router.get('/me/events', UserController.getUserEvents);
router.get('/me/tickets', UserController.getUserTickets);

export default router;
