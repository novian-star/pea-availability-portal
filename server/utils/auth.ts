export function requireUserSessionEventHandler() {
  return defineEventHandler(async (event) => {
    await requireUserSession(event);
  });
}

export function requireAdminEventHandler() {
  return defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);
    if (!user?.isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
      });
    }
  });
}
