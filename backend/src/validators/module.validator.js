import { z } from 'zod';

export const createModuleSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().optional().nullable(),
  startingDay: z.number().int().min(1, 'Starting day must be at least 1'),
  endingDay: z.number().int().min(1, 'Ending day must be at least 1'),
  displayOrder: z.number().int().min(0).optional(),
}).refine((data) => data.startingDay <= data.endingDay, {
  message: 'startingDay must be less than or equal to endingDay',
  path: ['endingDay'],
});

export const updateModuleSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().optional().nullable(),
  startingDay: z.number().int().min(1).optional(),
  endingDay: z.number().int().min(1).optional(),
  displayOrder: z.number().int().min(0).optional(),
}).refine((data) => {
  if (data.startingDay !== undefined && data.endingDay !== undefined) {
    return data.startingDay <= data.endingDay;
  }
  return true;
}, {
  message: 'startingDay must be less than or equal to endingDay',
  path: ['endingDay'],
});
