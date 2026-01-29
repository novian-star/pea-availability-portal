export class AuthenticationAppsScriptService {
  constructor(
    private readonly appsScriptUrl: string,
    private readonly appsScriptKey: string,
  ) {}

  async generateToken(userId: string, maxAge: number): Promise<string> {
    const url = new URL(this.appsScriptUrl);
    url.searchParams.append('apiKey', this.appsScriptKey);

    const token = crypto.randomUUID();
    const expiredAt = Date.now() + maxAge * 1000;

    const response = await $fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: {
        userId,
        token,
        expiredAt,
      },
    });

    if (response !== 'Created') {
      throw new Error(`Failed to generate token in Apps Script: ${response}`);
    }

    return token;
  }
}

export function useAuthenticationAppsScriptService({
  appsScriptUrl,
  appsScriptKey,
}: {
  appsScriptUrl: string;
  appsScriptKey: string;
}): AuthenticationAppsScriptService {
  return new AuthenticationAppsScriptService(appsScriptUrl, appsScriptKey);
}
