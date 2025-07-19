import { eq } from 'drizzle-orm';

import { schemas } from '~~/server/database';

export default defineEventHandler({
  onRequest: [requireAdminEventHandler()],

  handler: async (event) => {
    const userSession = await requireUserSession(event);

    const drizzle = useDrizzle();

    const id = getRouterParam(event, 'id');

    try {
      const existingService = (
        await drizzle
          .select()
          .from(schemas.service)
          .where(eq(schemas.service.id, String(id)))
      )[0];

      if (!existingService) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Not Found',
        });
      }

      // Soft delete logic
      if (!existingService.deletedAt) {
        await drizzle
          .update(schemas.service)
          .set({ deletedAt: new Date() })
          .where(eq(schemas.service.id, String(id)));

        await logAction(
          userSession.user.id,
          `ลบบริการ ${existingService.name}`
        );

        return setResponseStatus(event, 204);
      }

      // Hard delete logic
      await drizzle
        .delete(schemas.service)
        .where(eq(schemas.service.id, String(id)));

      await logAction(
        userSession.user.id,
        `ลบบริการ ${existingService.name} (ถาวร)`
      );

      return setResponseStatus(event, 204);
    } catch (error) {
      console.error('Error deleting service:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
      });
    }
  },
});
