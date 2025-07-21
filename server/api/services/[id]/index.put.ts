import { updateServiceValidation } from '#shared/validations/service';

import { and, eq, isNull } from 'drizzle-orm';
import * as v from 'valibot';

import { schemas } from '~~/server/database';

export default defineEventHandler({
	onRequest: [requireAdminEventHandler()],

	handler: async (event) => {
		const userSession = await requireUserSession(event);

		const drizzle = useDrizzle();

		const id = getRouterParam(event, 'id');

		const body = await readValidatedBody(
			event,
			v.parser(updateServiceValidation)
		);

		try {
			const existingService = (
				await drizzle
					.select()
					.from(schemas.service)
					.where(
						and(
							eq(schemas.service.id, String(id)),
							isNull(schemas.service.deletedAt)
						)
					)
			)[0];

			if (!existingService) {
				throw createError({
					statusCode: 404,
					statusMessage: 'Not Found',
				});
			}

			const service = (
				await drizzle
					.update(schemas.service)
					.set(body)
					.where(eq(schemas.service.id, String(id)))
					.returning()
			)[0];

			await logAction(
				userSession.user.id,
				`แก้ไขบริการ ${existingService.name} -> ${service.name}`
			);

			return {
				data: service,
			};
		} catch (error) {
			console.error('Error updating service:', error);
			throw createError({
				statusCode: 500,
				statusMessage: 'Internal Server Error',
			});
		}
	},
});
