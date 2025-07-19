import { and, eq, isNotNull } from 'drizzle-orm';

import { schemas } from '~~/server/database';

export default defineEventHandler({
  onRequest: [requireAdminEventHandler()],

  handler: async (event) => {
    const userSession = await requireUserSession(event);
    const drizzle = useDrizzle();
    const id = getRouterParam(event, 'id');

    try {
      // Find the soft-deleted service
      const existingService = (
        await drizzle
          .select()
          .from(schemas.service)
          .where(
            and(
              eq(schemas.service.id, String(id)),
              isNotNull(schemas.service.deletedAt)
            )
          )
      )[0];

      if (!existingService) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Not Found or not deleted',
        });
      }

      // Restore the service (set deletedAt to null)
      const [restoredService] = await drizzle
        .update(schemas.service)
        .set({ deletedAt: null })
        .where(eq(schemas.service.id, String(id)))
        .returning();

      await logAction(
        userSession.user.id,
        `กู้คืนบริการ ${existingService.name}`
      );

      return {
        data: restoredService,
      };
    } catch (error) {
      console.error('Error restoring service:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
      });
    }
  },
});
