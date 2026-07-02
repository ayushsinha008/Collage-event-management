import { Response, Request } from 'express';
import { RegistrationService } from '../services/registration.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

export class TicketController {
  static async getTicketById(req: AuthRequest, res: Response) {
    const ticket = await RegistrationService.getTicketById(req.params.id as string, req.user!);
    sendSuccess(req, res, 200, 'Ticket fetched successfully', ticket);
  }

  static async getUserTickets(req: AuthRequest, res: Response) {
    const tickets = await RegistrationService.getUserTickets(req.user!._id, req.query);
    sendSuccess(req, res, 200, 'User tickets fetched successfully', tickets);
  }
}
