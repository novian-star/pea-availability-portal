import { desc, eq, like, not } from 'drizzle-orm';
import z from 'zod';

import { schemas } from '~~/server/database';
import { jsonToCsv } from '~~/server/utils/json';

const querySchema = z.object({
	filter: z.enum(['all', 'login', 'other']).default('all').optional(),
});

export default defineEventHandler({
	onRequest: [requireAdminEventHandler()],

	handler: async (event) => {
		const drizzle = useDrizzle();

		try {
			const query = await getValidatedQuery(event, querySchema.parse);
			const { filter } = query;

			const results = await drizzle
				.select()
				.from(schemas.log)
				.leftJoin(schemas.user, eq(schemas.log.userId, schemas.user.id))
				.where(
					filter === 'login'
						? like(schemas.log.action, '%ลงชื่อเข้าใช้ระบบ%')
						: filter === 'other'
							? not(like(schemas.log.action, '%ลงชื่อเข้าใช้ระบบ%'))
							: undefined
				)
				.orderBy(desc(schemas.log.timestamp));

			const logs = results.map((result) => ({
				user: `${result.user?.name} (${result.user?.employeeId})`,
				department: result.user?.department,
				position: result.user?.position,
				action: result.log.action,
				timestamp: new Date(result.log.timestamp).toLocaleString('th-TH'),
			}));
			if (logs.length === 0) {
				throw createError({
					statusCode: 404,
					statusMessage: 'No logs found',
				});
			}

			const csv = `\uFEFF${jsonToCsv(logs)}`;

			const stream = new ReadableStream<unknown>({
				start(controller) {
					controller.enqueue(new TextEncoder().encode(csv));
					controller.close();
				},
			});

			sendStream(event, stream);
		} catch (error) {
			console.error('Error exporting logs:', error);
			throw createError({
				statusCode: 500,
				statusMessage: 'Internal Server Error',
			});
		}
	},
});
