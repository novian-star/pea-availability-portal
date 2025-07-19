export default defineEventHandler(async (event) => {
  const {
    oauth: {
      keycloak: { realm, serverUrl },
    },
  } = useRuntimeConfig();

  await clearUserSession(event);

  return sendRedirect(
    event,
    `${serverUrl}/realms/${realm}/protocol/openid-connect/logout`
  );
});
