import { z } from 'zod';

export const checkInSchema = z.object({
  body: z.object({
    qrToken: z.string().uuid('Invalid QR Token format'),
  }),
});
