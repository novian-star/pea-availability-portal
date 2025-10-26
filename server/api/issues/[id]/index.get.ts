import { and, eq } from 'drizzle-orm';
import { schemas } from '~~/server/database';

export default defineEventHandler({
  onRequest: [requireUserSessionEventHandler()],

  handler: async (event) => {
    const userSession = await requireUserSession(event);
    const drizzle = useDrizzle();
    const issueId = getRouterParam(event, 'id');

    if (!issueId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Issue ID is required',
      });
    }

    try {
      // Get the issue that belongs to the user
      const issues = await drizzle
        .select()
        .from(schemas.issue)
        .where(
          and(
            eq(schemas.issue.id, issueId),
            eq(schemas.issue.userId, userSession.user.id),
          ),
        )
        .limit(1);

      if (issues.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Not Found',
          message: 'Issue not found or you do not have permission to view it',
        });
      }

      return {
        data: issues[0],
      };
    } catch (error) {
      console.error('Error fetching issue:', error);

      // Re-throw custom errors
      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error;
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to fetch issue',
      });
    }
  },
});
