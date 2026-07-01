import { Response, Request } from 'express';
import { EventService } from '../services/event.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

export class EventController {
  static async getEvents(req: Request, res: Response) {
    const { events, total } = await EventService.getEvents(req.query);
    sendSuccess(req as any, res, 200, 'Events fetched successfully', { total, events });
  }

  static async getEvent(req: Request, res: Response) {
    const event = await EventService.getEventById(req.params.id as string);
    sendSuccess(req as any, res, 200, 'Event fetched successfully', event);
  }

  static async createEvent(req: AuthRequest, res: Response) {
    try {
      const event = await EventService.createEvent(req.body, req.user!);
      res.status(201).json({
        success: true,
        message: 'Event created successfully.',
        data: event
      });
    } catch (error) {
      console.error('CREATE EVENT ERROR:', error);
      throw error;
    }
  }

  static async updateEvent(req: AuthRequest, res: Response) {
    const event = await EventService.updateEvent(req.params.id as string, req.body, req.user!);
    sendSuccess(req, res, 200, 'Event updated successfully', event);
  }

  static async deleteEvent(req: AuthRequest, res: Response) {
    await EventService.softDeleteEvent(req.params.id as string, req.user!);
    sendSuccess(req, res, 200, 'Event deleted successfully');
  }
}
