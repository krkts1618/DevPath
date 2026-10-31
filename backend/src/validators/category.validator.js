import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase alphanumeric characters and hyphens').optional(),
  description: z.string().max(1000).optional().nullable(),
  displayOrder: z.number().int().min(0).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
