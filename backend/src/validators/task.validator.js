import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(300),
  description: z.string().optional().nullable(),
  taskType: z.enum(['learn', 'code', 'practice', 'revise', 'project', 'assessment']).optional(),
  estimatedDuration: z.number().int().min(5).optional(),
  isRequired: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
  githubUrl: z.string().url().max(500).optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).max(300).optional(),
  description: z.string().optional().nullable(),
  taskType: z.enum(['learn', 'code', 'practice', 'revise', 'project', 'assessment']).optional(),
  estimatedDuration: z.number().int().min(5).optional(),
  isRequired: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
  githubUrl: z.string().url().max(500).optional().nullable(),
});

export const toggleTaskCompletionSchema = z.object({
  completed: z.boolean(),
  notes: z.string().optional().nullable(),
});

export const reassignTaskSchema = z.object({
  newRoadmapDayId: z.string().uuid('Invalid newRoadmapDayId UUID'),
  reason: z.string().optional().nullable(),
});
