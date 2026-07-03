import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { verifyRoleSchema, staffLoginSchema } from '../validators/auth.validator';

const router = Router();

router.post('/staff-login', validate(staffLoginSchema), AuthController.staffLogin);
router.get('/me', requireAuth, UserController.getProfile);
router.post('/verify-role', requireAuth, validate(verifyRoleSchema), AuthController.verifyRole);

export default router;
