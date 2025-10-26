import { createIssueSchema } from '~~/shared/validations/issue';
import { schemas } from '~~/server/database';

export default defineEventHandler({
  onRequest: [requireUserSessionEventHandler()],

  handler: async (event) => {
    const userSession = await requireUserSession(event);
    const drizzle = useDrizzle();

    try {
      // Validate request body
      const body = await readValidatedBody(event, createIssueSchema.parse);

      // Create the issue
      const createdIssues = await drizzle
        .insert(schemas.issue)
        .values({
          userId: userSession.user.id,
          title: body.title,
          description: body.description,
          contactNumber: body.contactNumber,
          status: 'OPEN',
        })
        .returning();

      if (createdIssues.length === 0) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
          message: 'Failed to create issue',
        });
      }

      // Log the creation action
      await logAction(
        userSession.user.id,
        `สร้างรายงานปัญหา: "${createdIssues[0].title}"`,
      );

      return {
        data: createdIssues[0],
        message: 'Issue created successfully',
      };
    } catch (error) {
      console.error('Error creating issue:', error);

      // Handle validation errors
      if (error instanceof Error && 'issues' in error) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Invalid input data',
        });
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to create issue',
      });
    }
  },
});
