import { Router } from 'express';
import { OrganizerController } from '../controllers/organizer.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { Role } from '../types';

const router = Router();

router.use(requireAuth);
router.use(requireRole([Role.ORGANIZER, Role.ADMIN]));

router.get('/dashboard', OrganizerController.getDashboard);
router.get('/analytics', OrganizerController.getAnalytics);
router.get('/events', OrganizerController.getEvents);
router.get('/registrations', OrganizerController.getRegistrations);
router.post('/announcement', OrganizerController.createAnnouncement);
router.get('/settings', OrganizerController.getSettings);
router.get('/profile', OrganizerController.getProfile);

export default router;
