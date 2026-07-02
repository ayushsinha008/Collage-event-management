import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/:id', TicketController.getTicketById);

export default router;
