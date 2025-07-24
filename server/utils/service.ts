import { eq, asc } from 'drizzle-orm';
import { schemas } from '~~/server/database';

/**
 * Reorders the 'order' field of all services after a service has been deleted.
 * Ensures order is continuous (1,2,3,...)
 */
export async function reorderServices() {
	const drizzle = useDrizzle();
	// Get all services ordered by 'order'
	const allServices = await drizzle
		.select()
		.from(schemas.service)
		.orderBy(asc(schemas.service.orderIndex));
	// Update each service's order to be its index + 1
	for (let i = 0; i < allServices.length; i++) {
		const service = allServices[i];
		if (service.orderIndex !== i + 1) {
			await drizzle
				.update(schemas.service)
				.set({ orderIndex: i + 1 })
				.where(eq(schemas.service.id, service.id));
		}
	}
}
