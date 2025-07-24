import { desc, eq } from 'drizzle-orm';

import { schemas } from '~~/server/database';
import { jsonToCsv } from '~~/server/utils/json';

export default defineEventHandler({
	onRequest: [requireAdminEventHandler()],

	handler: async (event) => {
		const drizzle = useDrizzle();

		try {
			const results = await drizzle
				.select()
				.from(schemas.log)
				.leftJoin(schemas.user, eq(schemas.log.userId, schemas.user.id))
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
