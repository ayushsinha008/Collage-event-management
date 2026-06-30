import { Response } from 'express';
import { AuthRequest } from '../types';

export const sendSuccess = (
  req: AuthRequest,
  res: Response,
  statusCode: number,
  message: string,
  data: any = {}
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    requestId: req.requestId,
  });
};

export const sendError = (
  req: AuthRequest,
  res: Response,
  statusCode: number,
  message: string,
  errors: any[] = []
) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
    requestId: req.requestId,
  });
};
