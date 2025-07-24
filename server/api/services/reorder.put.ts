import { schemas } from '~~/server/database';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
	const drizzle = useDrizzle();

	const body = await readBody<{ ids: string[] }>(event);

	if (!body?.ids || !Array.isArray(body.ids)) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid request body',
		});
	}

	// Fetch all service ids from DB
	const dbServices = await drizzle
		.select({ id: schemas.service.id })
		.from(schemas.service);
	const dbIds = dbServices.map((s) => s.id);

	// Check that all input ids exist in DB
	const missingInputIds = body.ids.filter((id) => !dbIds.includes(id));
	if (missingInputIds.length > 0) {
		throw createError({
			statusCode: 400,
			statusMessage: `Some input ids do not exist: ${missingInputIds.join(
				', '
			)}`,
		});
	}

	// Check that all DB ids are included in input
	const missingDbIds = dbIds.filter((id) => !body.ids.includes(id));
	if (missingDbIds.length > 0) {
		throw createError({
			statusCode: 400,
			statusMessage: `Some service ids are missing in input: ${missingDbIds.join(
				', '
			)}`,
		});
	}

	// Update each service's orderIndex based on its position in the array
	for (let i = 0; i < body.ids.length; i++) {
		await drizzle
			.update(schemas.service)
			.set({ orderIndex: i + 1 })
			.where(eq(schemas.service.id, body.ids[i]));
	}

	setResponseStatus(event, 204); // No content
	return;
});
