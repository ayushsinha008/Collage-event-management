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
router.get('/registrations/export', OrganizerController.exportRegistrations);

router.get('/announcements', OrganizerController.getAnnouncements);
router.post('/announcements', OrganizerController.createAnnouncement);
router.post('/announcement', OrganizerController.createAnnouncement);
router.post('/announcements/:id/send', OrganizerController.sendAnnouncement);
router.delete('/announcements/:id', OrganizerController.deleteAnnouncement);

router.get('/settings', OrganizerController.getSettings);
router.put('/settings', OrganizerController.updateSettings);

router.get('/notifications', OrganizerController.getNotifications);
router.put('/notifications/read-all', OrganizerController.readAllNotifications);
router.put('/notifications/:id/read', OrganizerController.readNotification);

router.get('/profile', OrganizerController.getProfile);
router.put('/profile', OrganizerController.updateProfile);

router.get('/events/:eventId/volunteers', OrganizerController.getVolunteers);
router.post('/events/:eventId/volunteers', OrganizerController.inviteVolunteer);
router.put('/events/:eventId/volunteers/:id', OrganizerController.updateVolunteer);
router.delete('/events/:eventId/volunteers/:id', OrganizerController.removeVolunteer);

router.get('/events/:eventId/settings', OrganizerController.getEventSettings);
router.put('/events/:eventId/settings', OrganizerController.updateEventSettings);
router.get('/events/:eventId/live-attendance', OrganizerController.getLiveAttendance);

export default router;
