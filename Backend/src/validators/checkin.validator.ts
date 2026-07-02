import { z } from 'zod';

export const checkInSchema = z.object({
  body: z.object({
    qrToken: z.string().min(1, 'Token or code is required'),
  }),
});
