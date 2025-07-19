import { schemas } from '~~/server/database';

export async function logAction(userId: string, action: string) {
  const drizzle = useDrizzle();

  try {
    await drizzle.insert(schemas.log).values({
      userId,
      action,
    });
  } catch (error) {
    console.error('Failed to log action:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
}

export function logActionEventHandler(userId: string, action: string) {
  return defineEventHandler(async () => {
    await logAction(userId, action);
  });
}
