import { and, count, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { schemas } from '~~/server/database';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  filter: z
    .enum(['all', 'open', 'in_progress', 'resolved', 'closed'])
    .default('all')
    .catch('all'),
});

export default defineEventHandler({
  onRequest: [requireUserSessionEventHandler()],

  handler: async (event) => {
    const userSession = await requireUserSession(event);
    const drizzle = useDrizzle();

    try {
      const query = await getValidatedQuery(event, querySchema.parse);
      const { page, limit } = query;
      const offset = (page - 1) * limit;

      // Get total count
      const totalResult = await drizzle
        .select({ count: count() })
        .from(schemas.issue)
        .where(
          and(
            eq(schemas.issue.userId, userSession.user.id),
            transformStatusFilter(query.filter),
          ),
        );

      const total = totalResult[0]?.count || 0;

      // Get paginated issues for the user
      const issues = await drizzle
        .select()
        .from(schemas.issue)
        .where(
          and(
            eq(schemas.issue.userId, userSession.user.id),
            transformStatusFilter(query.filter),
          ),
        )
        .orderBy(desc(schemas.issue.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        data: issues,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error fetching issues:', error);

      // Handle validation errors
      if (error instanceof z.ZodError) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: error.errors.map((e) => e.message).join(', '),
        });
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
      });
    }
  },
});

function transformStatusFilter(filter: string) {
  switch (filter) {
    case 'open':
      return eq(schemas.issue.status, 'OPEN');
    case 'in_progress':
      return eq(schemas.issue.status, 'IN_PROGRESS');
    case 'resolved':
      return eq(schemas.issue.status, 'RESOLVED');
    case 'closed':
      return eq(schemas.issue.status, 'CLOSED');
    default:
      return undefined;
  }
}
