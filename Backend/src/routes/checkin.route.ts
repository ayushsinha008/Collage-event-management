import { Router } from 'express';
import { CheckInController } from '../controllers/checkin.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { checkInSchema } from '../validators/checkin.validator';
import { Role } from '../types';

const router = Router();

router.use(requireAuth);
// Organizers and Volunteers can perform check-ins
router.use(requireRole([Role.ORGANIZER, Role.VOLUNTEER, Role.ADMIN]));

router.post('/', validate(checkInSchema), CheckInController.processCheckIn);

export default router;
