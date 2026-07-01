import { Response } from 'express';
import { CheckInService } from '../services/checkin.service';
import { AuthRequest } from '../types';
import { sendSuccess } from '../utils/response';

export class CheckInController {
  static async processCheckIn(req: AuthRequest, res: Response) {
    const { qrToken } = req.body;
    const result = await CheckInService.processCheckIn(qrToken, req.user!);
    sendSuccess(req, res, 200, 'Check-in successful', result);
  }
}
