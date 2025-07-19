import { and, eq, isNull } from 'drizzle-orm';

import { schemas } from '~~/server/database';

export default defineEventHandler({
  onRequest: [requireUserSessionEventHandler()],

  handler: async (event) => {
    const userSession = await requireUserSession(event);

    const drizzle = useDrizzle();

    const id = getRouterParam(event, 'id');

    try {
      // If the user is an admin, fetch a service by ID,
      // otherwise fetch only a non-deleted service.
      const service = (
        await drizzle
          .select()
          .from(schemas.service)
          .where(
            and(
              eq(schemas.service.id, String(id)),
              userSession.user.isAdmin
                ? undefined
                : isNull(schemas.service.deletedAt)
            )
          )
      )[0];

      if (!service) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Not Found',
        });
      }

      return {
        data: service,
      };
    } catch (error) {
      console.error('Error fetching service:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
      });
    }
  },
});
