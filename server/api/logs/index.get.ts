import { count, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { schemas } from '~~/server/database';

const querySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(20),
});

export default defineEventHandler({
	onRequest: [requireAdminEventHandler()],

	handler: async (event) => {
		const drizzle = useDrizzle();

		try {
			const query = await getValidatedQuery(event, querySchema.parse);
			const { page, limit } = query;
			const offset = (page - 1) * limit;

			// Get total count
			const totalResult = await drizzle
				.select({ count: count() })
				.from(schemas.log);
			const total = totalResult[0]?.count || 0;

			// Get paginated logs with user data
			const results = await drizzle
				.select()
				.from(schemas.log)
				.leftJoin(schemas.user, eq(schemas.log.userId, schemas.user.id))
				.orderBy(desc(schemas.log.timestamp))
				.limit(limit)
				.offset(offset);

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
