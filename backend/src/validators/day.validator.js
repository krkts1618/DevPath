import { z } from 'zod';

export const createDaySchema = z.object({
  moduleId: z.string().uuid('Invalid moduleId UUID').optional().nullable(),
  dayNumber: z.number().int().min(1, 'dayNumber must be at least 1'),
  title: z.string().min(2, 'Title must be at least 2 characters').max(255),
  objective: z.string().optional().nullable(),
  estimatedStudyTime: z.number().int().min(10).optional(),
  dayType: z.enum(['learning', 'practice', 'revision', 'project', 'assessment']).optional(),
});

export const updateDaySchema = z.object({
  moduleId: z.string().uuid().optional().nullable(),
  dayNumber: z.number().int().min(1).optional(),
  title: z.string().min(2).max(255).optional(),
  objective: z.string().optional().nullable(),
  estimatedStudyTime: z.number().int().min(10).optional(),
  dayType: z.enum(['learning', 'practice', 'revision', 'project', 'assessment']).optional(),
});
