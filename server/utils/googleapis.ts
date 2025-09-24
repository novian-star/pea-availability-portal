import { sheets_v4 } from '@googleapis/sheets';
import { GoogleAuth } from 'google-auth-library';

export function useGoogleAuth(scopes?: string[]): GoogleAuth {
	const { googleClientEmail, googlePrivateKey } = useRuntimeConfig();

	const auth = new GoogleAuth({
		scopes: scopes,
		credentials: {
			client_email: googleClientEmail,
			private_key: googlePrivateKey.replace(/\\n/g, '\n'),
		},
	});

	return auth;
}

export function useGoogleSheets(auth: GoogleAuth): sheets_v4.Sheets {
	const sheets = new sheets_v4.Sheets({ auth });

	return sheets;
}
