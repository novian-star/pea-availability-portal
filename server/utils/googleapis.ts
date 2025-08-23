import google from 'googleapis';

export function useGoogleAuth(scopes?: string[]): google.Auth.GoogleAuth {
  const auth = new google.Auth.GoogleAuth({
    scopes: scopes,
    keyFile: 'service-account.json',
  });

  return auth;
}

export function useGoogleSheets(
  auth: google.Auth.GoogleAuth
): google.sheets_v4.Sheets {
  const sheets = new google.sheets_v4.Sheets({ auth });

  return sheets;
}
