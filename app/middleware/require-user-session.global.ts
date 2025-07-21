export default defineNuxtRouteMiddleware(async (to) => {
	const userSession = useUserSession();

	if (!userSession.loggedIn.value && !to.fullPath.startsWith('/login')) {
		return navigateTo('/login');
	}
});
