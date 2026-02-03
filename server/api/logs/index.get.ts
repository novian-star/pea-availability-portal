import { count, desc, eq, like, not } from 'drizzle-orm';
import { z } from 'zod';
import { schemas } from '~~/server/database';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  filter: z
    .enum(['all', 'login', 'access-service', 'other'])
    .default('all')
    .optional(),
});

export default defineEventHandler({
  onRequest: [requireAdminEventHandler()],

  handler: async (event) => {
    const drizzle = useDrizzle();

    try {
      const query = await getValidatedQuery(event, querySchema.parse);
      const { page, limit, filter } = query;
      const offset = (page - 1) * limit;

      // Get total count
      const totalResult = await drizzle
        .select({ count: count() })
        .from(schemas.log)
        .where(getFilterCondition(filter));
      const total = totalResult[0]?.count || 0;

      // Get paginated logs with user data
      const results = await drizzle
        .select()
        .from(schemas.log)
        .leftJoin(schemas.user, eq(schemas.log.userId, schemas.user.id))
        .orderBy(desc(schemas.log.timestamp))
        .limit(limit)
        .offset(offset)
        .where(getFilterCondition(filter));

      const logs = results.map((result) => ({
        ...result.log,
        user: result.user,
      }));

      return {
        data: logs,
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
      console.error('Error fetching logs:', error);

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

function getFilterCondition(filter: string | undefined) {
  switch (filter) {
    case 'login':
      return like(schemas.log.action, '%ลงชื่อเข้าใช้ระบบ%');
    case 'access-service':
      return like(schemas.log.action, '%เข้าถึงบริการ%');
    case 'other':
      return not(like(schemas.log.action, '%ลงชื่อเข้าใช้ระบบ%'));
    default:
      return undefined;
  }
}
