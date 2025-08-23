import google from 'googleapis';

export function useGoogleAuth(scopes?: string[]): google.Auth.GoogleAuth {
  const { googleClientEmail, googlePrivateKey } = useRuntimeConfig();

  const auth = new google.Auth.GoogleAuth({
    scopes: scopes,
    credentials: {
      client_email: googleClientEmail,
      private_key: googlePrivateKey.replace(/\\n/g, '\n'),
    },
  });

  return auth;
}

export function useGoogleSheets(
  auth: google.Auth.GoogleAuth
): google.sheets_v4.Sheets {
  const sheets = new google.sheets_v4.Sheets({ auth });

  return sheets;
}
