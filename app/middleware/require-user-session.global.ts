export default defineNuxtRouteMiddleware(async () => {
  const userSession = useUserSession();

  if (!userSession.loggedIn.value) {
    return navigateTo('/auth/login', { external: true });
  }
});
