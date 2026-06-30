import { Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AuthRequest } from '../types';

export const validate = (schema: ZodSchema) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    console.error('DEBUG BODY:', req.body);
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      next(error); // Pass to global error handler which handles ZodError
    }
  };
};
