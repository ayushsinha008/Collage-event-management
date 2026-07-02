import { z } from 'zod';

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10),
    category: z.string(),
    venue: z.string(),
    date: z.string().datetime(), // ISO Date string
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be HH:MM format"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be HH:MM format"),
    capacity: z.number().int().min(1),
    tags: z.array(z.string()).optional(),
    club: z.string().optional(), // ObjectId as string
  }),
});

export const updateEventSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100).optional(),
    description: z.string().min(10).optional(),
    category: z.string().optional(),
    venue: z.string().optional(),
    date: z.string().datetime().optional(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be HH:MM format").optional(),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be HH:MM format").optional(),
    capacity: z.number().int().min(1).optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['Upcoming', 'Ongoing', 'Completed', 'Cancelled']).optional(),
  }),
});
