import * as v from 'valibot';
import type { schemas } from '~~/server/database';

export const updateUserValidation = v.object({
  isAdmin: v.boolean(),
}) satisfies v.GenericSchema<Pick<typeof schemas.user.$inferSelect, 'isAdmin'>>;
