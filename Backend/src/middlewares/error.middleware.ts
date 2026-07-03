import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ApiError } from '../utils/ApiError';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

export const errorMiddleware = (
  err: any,
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors: any[] = [];

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((el: any) => el.message);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    errors = [Object.keys(err.keyValue).map(key => `${key} already exists`)];
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Zod Error formatting
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Input Validation Failed';
    const issues = err.errors || err.issues || [];
    errors = issues.map((e: any) => `${e.path?.join('.')}: ${e.message}`);
  }

  console.error(`[ERROR MIDDLEWARE TRIGGERED]`, err.stack);
  
  if (process.env.NODE_ENV !== 'test') {
    logger.error(`[Error Middleware] ${message}`, { 
      statusCode, 
      stack: err.stack,
      requestId: req.requestId,
      body: req.body,
      query: req.query
    });
  } else {
    console.error(`[TEST ERROR] ${message}`, err.stack);
  }

  require('fs').appendFileSync('backend_errors.log', JSON.stringify({ message, statusCode, stack: err.stack, query: req.query }) + '\\n');

  sendError(req, res, statusCode, message, errors.length > 0 ? errors : undefined);
};
