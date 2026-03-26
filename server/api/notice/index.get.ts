import { schemas } from '~~/server/database';

export default defineEventHandler({
  handler: async () => {
    const drizzle = useDrizzle();

    try {
      // Fetch the first (and only) notice record
      const notices = await drizzle.select().from(schemas.notice).limit(1);

      const notice = notices[0];

      // Only return the notice if it's enabled
      if (!notice || !notice.isEnabled) {
        return {
          data: null,
        };
      }

      return {
        data: {
          id: notice.id,
          title: notice.title,
          content: notice.content,
          isEnabled: notice.isEnabled,
          updatedAt: notice.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      console.error('Error fetching notice:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
      });
    }
  },
});
