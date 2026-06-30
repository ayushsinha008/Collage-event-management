import { Response, Request } from 'express';
import { RegistrationService } from '../services/registration.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

export class RegistrationController {
  static async registerForEvent(req: AuthRequest, res: Response) {
    const { id: eventId } = req.params;
    const result = await RegistrationService.registerForEvent(eventId as string, req.user!);
    sendSuccess(req, res, 201, 'Successfully registered for event', result);
  }

  static async cancelRegistration(req: AuthRequest, res: Response) {
    const { id: eventId } = req.params;
    await RegistrationService.cancelRegistration(eventId as string, req.user!);
    sendSuccess(req, res, 200, 'Registration cancelled successfully');
  }
}
