import { z } from 'zod';

export const createRoadmapSchema = z.object({
  categoryId: z.string().uuid('Invalid categoryId UUID'),
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  slug: z.string().min(2).max(220).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase alphanumeric characters and hyphens').optional(),
  description: z.string().optional().nullable(),
  duration: z.number().int().min(1, 'Duration must be at least 1 day'),
  targetDailyStudyTime: z.number().int().min(10, 'Target daily study time must be at least 10 minutes').optional(),
  startDate: z.string().datetime().optional().nullable(),
  status: z.enum(['active', 'completed', 'archived']).optional(),
  displayOrder: z.number().int().min(0).optional(),
  iconIdentifier: z.string().max(50).optional().nullable(),
  themeIdentifier: z.string().max(50).optional().nullable(),
});

export const updateRoadmapSchema = createRoadmapSchema.partial();
