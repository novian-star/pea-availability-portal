import { createServiceValidation } from '#shared/validations/service';

import * as v from 'valibot';

import { schemas } from '~~/server/database';

export default defineEventHandler({
  onRequest: [requireAdminEventHandler()],

  handler: async (event) => {
    const userSession = await requireUserSession(event);

    const drizzle = useDrizzle();

    const body = await readValidatedBody(
      event,
      v.parser(createServiceValidation)
    );

    try {
      const service = (
        await drizzle.insert(schemas.service).values(body).returning()
      )[0];

      await logAction(userSession.user.id, `เพิ่มบริการ ${service.name}`);

      return {
        data: service,
      };
    } catch (error) {
      console.error('Error creating service:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to create service',
      });
    }
  },
});
