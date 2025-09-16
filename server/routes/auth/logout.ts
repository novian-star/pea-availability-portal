export default defineEventHandler(async (event) => {
	const {
		oauth: {
			keycloak: { realm, serverUrl },
		},
		allowedOrigins: allowedOriginsEnv,
	} = useRuntimeConfig();

	await clearUserSession(event);

	const logoutUrl = new URL(
		`${serverUrl}/realms/${realm}/protocol/openid-connect/logout`
	);

	const allowedOrigins = allowedOriginsEnv
		? allowedOriginsEnv.split(',').map((origin) => origin.trim())
		: [];

	let redirectOrigin = getRequestHeader(event, 'origin');
	if (!redirectOrigin) {
		const referer = getRequestHeader(event, 'referer');
		if (referer) {
			try {
				redirectOrigin = new URL(referer).origin;
			} catch {
				throw createError({
					statusCode: 400,
					statusMessage: 'Invalid Referer header format',
				});
			}
		}
	}

	if (!redirectOrigin) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Origin or Referer header is required for logout redirect',
		});
	}

	if (!allowedOrigins.includes(redirectOrigin)) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Invalid origin for logout redirect',
		});
	}

	const idToken = getCookie(event, 'id_token');
	if (idToken) {
		logoutUrl.searchParams.set('post_logout_redirect_uri', redirectOrigin);
		logoutUrl.searchParams.set('id_token_hint', idToken);
	}

	return sendRedirect(event, logoutUrl.toString());
});
