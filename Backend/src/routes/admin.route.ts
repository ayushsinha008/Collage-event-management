import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { Role } from '../types';

const router = Router();

router.use(requireAuth);
router.use(requireRole([Role.ADMIN]));

router.get('/dashboard', AdminController.getDashboard);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);
router.get('/events', AdminController.getEvents);
router.delete('/events/:id', AdminController.deleteEvent);

export default router;
