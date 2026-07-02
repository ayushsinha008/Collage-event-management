import { Router } from 'express';
import { getAllEvents, getEventById, createEvent } from '../controllers/eventController';

const router = Router();

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', createEvent);

export default router;
