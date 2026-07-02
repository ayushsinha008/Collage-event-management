import { z } from 'zod';

export const registerEventSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Event ID'),
  }),
});

export const cancelRegistrationSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Event ID'),
  }),
});
