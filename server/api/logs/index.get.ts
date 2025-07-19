import { desc, eq } from 'drizzle-orm';
import { schemas } from '~~/server/database';

export default defineEventHandler({
  onRequest: [requireAdminEventHandler()],

  handler: async (_event) => {
    const drizzle = useDrizzle();

    try {
      const results = await drizzle
        .select()
        .from(schemas.log)
        .leftJoin(schemas.user, eq(schemas.log.userId, schemas.user.id))
        .orderBy(desc(schemas.log.timestamp));

      const logs = results.map((result) => ({
        ...result.log,
        user: result.user,
      }));

      return {
        data: logs,
      };
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
      });
    }
  },
});
