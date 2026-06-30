import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    college: z.string().max(100).optional(),
    department: z.string().max(100).optional(),
    year: z.string().max(10).optional(),
  }),
});
