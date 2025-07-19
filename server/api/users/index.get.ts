import { schemas } from '~~/server/database';

export default defineEventHandler({
  onRequest: [requireAdminEventHandler()],

  handler: async (_event) => {
    const drizzle = useDrizzle();

    try {
      const users = await drizzle.select().from(schemas.user);

      return {
        data: users,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
      });
    }
  },
});
