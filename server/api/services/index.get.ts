import { isNull } from 'drizzle-orm';

import { schemas } from '~~/server/database';

export default defineEventHandler({
  onRequest: [requireUserSessionEventHandler()],

  handler: async (event) => {
    const userSession = await requireUserSession(event);

    const drizzle = useDrizzle();

    try {
      // If the user is an admin, fetch all services,
      // otherwise fetch only non-deleted services.
      const services = await drizzle
        .select()
        .from(schemas.service)
        .where(
          userSession.user.isAdmin
            ? undefined
            : isNull(schemas.service.deletedAt)
        );

      return {
        data: services,
      };
    } catch (error) {
      console.error('Error fetching services:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
      });
    }
  },
});
