import { z } from 'zod';

export const verifyRoleSchema = z.object({
  body: z.object({
    passcode: z.string().min(1, 'Passcode is required'),
    role: z.enum(['organizer', 'volunteer']),
  }),
});

export const staffLoginSchema = z.object({
  body: z.object({
    passcode: z.string().min(1, 'Passcode is required'),
    role: z.enum(['organizer', 'volunteer']),
  }),
});
