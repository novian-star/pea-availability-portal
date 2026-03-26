import * as v from 'valibot';
import type { schemas } from '~~/server/database';

export const updateNoticeValidation = v.object({
  title: v.optional(v.pipe(v.string(), v.trim())),
  content: v.optional(v.pipe(v.string(), v.trim())),
  isEnabled: v.boolean(),
}) satisfies v.GenericSchema<
  Omit<typeof schemas.notice.$inferInsert, 'id' | 'updatedAt'>
>;
