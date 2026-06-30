import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createEventSchema, updateEventSchema } from '../validators/event.validator';
import { Role } from '../types';
import registrationRoutes from './registration.route';

const router = Router();

// Public routes
router.get('/', EventController.getEvents);
router.get('/:id', EventController.getEvent);

// Registration routes (Nested)
router.use('/:id', registrationRoutes);

// Protected routes (Organizer and Admin)
router.use(requireAuth);
router.use(requireRole([Role.ADMIN, Role.ORGANIZER]));

router.post('/', validate(createEventSchema), EventController.createEvent);
router.patch('/:id', validate(updateEventSchema), EventController.updateEvent);
router.delete('/:id', EventController.deleteEvent);

export default router;
