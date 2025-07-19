import * as v from 'valibot';
import type { schemas } from '~~/server/database';

export const createServiceValidation = v.object({
  name: v.pipe(v.string(), v.trim(), v.nonEmpty()),
  description: v.nullable(
    v.pipe(
      v.string(),
      v.trim(),
      v.transform((value) => value || null)
    )
  ),
  url: v.pipe(v.string(), v.trim(), v.url()),
  urlType: v.picklist(['external', 'embedded']),
}) satisfies v.GenericSchema<typeof schemas.service.$inferInsert>;

export const updateServiceValidation = createServiceValidation;
