import { z } from 'zod';

export const createIssueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().min(1, 'Description is required'),
  contactNumber: z
    .string()
    .min(1, 'Contact number is required')
    .max(255, 'Contact number is too long'),
});

export const updateIssueSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title is too long')
    .optional(),
  description: z.string().min(1, 'Description is required').optional(),
  contactNumber: z
    .string()
    .min(1, 'Contact number is required')
    .max(255, 'Contact number is too long')
    .optional(),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
