import { Router } from 'express';
import { RegistrationController } from '../controllers/registration.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerEventSchema, cancelRegistrationSchema } from '../validators/registration.validator';

const router = Router({ mergeParams: true }); // Important for accessing :id from parent router if nested

router.use(requireAuth);

router.post('/register', validate(registerEventSchema), RegistrationController.registerForEvent);
router.delete('/cancel', validate(cancelRegistrationSchema), RegistrationController.cancelRegistration);

export default router;
