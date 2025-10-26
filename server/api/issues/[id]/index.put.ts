import { and, eq } from 'drizzle-orm';
import { updateIssueSchema } from '~~/shared/validations/issue';
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
      // Validate request body
      const body = await readValidatedBody(event, updateIssueSchema.parse);

      // Check if the issue exists and belongs to the user
      const existingIssue = await drizzle
        .select()
        .from(schemas.issue)
        .where(
          and(
            eq(schemas.issue.id, issueId),
            eq(schemas.issue.userId, userSession.user.id),
          ),
        )
        .limit(1);

      if (existingIssue.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Not Found',
          message: 'Issue not found or you do not have permission to update it',
        });
      }

      const issue = existingIssue[0];

      // Check if the issue status is OPEN
      if (issue.status !== 'OPEN') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Forbidden',
          message: 'Only open issues can be updated',
        });
      }

      // Update the issue
      const updatedIssues = await drizzle
        .update(schemas.issue)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schemas.issue.id, issueId),
            eq(schemas.issue.userId, userSession.user.id),
          ),
        )
        .returning();

      if (updatedIssues.length === 0) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
          message: 'Failed to update issue',
        });
      }

      // Log the update action
      await logAction(
        userSession.user.id,
        `แก้ไขรายงานปัญหา: "${updatedIssues[0].title}"`,
      );

      return {
        data: updatedIssues[0],
        message: 'Issue updated successfully',
      };
    } catch (error) {
      console.error('Error updating issue:', error);

      // Handle validation errors
      if (error instanceof Error && 'issues' in error) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Invalid input data',
        });
      }

      // Re-throw custom errors
      if (error && typeof error === 'object' && 'statusCode' in error) {
        throw error;
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to update issue',
      });
    }
  },
});
