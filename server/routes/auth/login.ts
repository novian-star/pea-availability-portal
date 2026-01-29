import { eq } from 'drizzle-orm';
import { schemas } from '~~/server/database';
import { useAuthenticationAppsScriptService } from '~~/server/services/auth';

type ResultUser = {
  sub: string;
  hr_cost_center: string;
  hr_dept_change_code: string;
  hr_dept_sap: string;
  hr_stell_text_full: string;
  preferred_username: string;
  hr_fullname_th: string;
  hr_employee_id: string;
  email: string;
  hr_dept_sap_full: string;
  address: Record<string, unknown>;
  email_verified: boolean;
  hr_department: string;
  hr_lastname: string;
  hr_position: string;
  given_name: string;
  hr_mobilephone: string;
  hr_fullname_en: string;
  name: string;
  hr_posi_status_desc: string;
  hr_firstname: string;
  hr_officePhone: string;
  hr_posi_code: string;
  hr_business_area: string;
  family_name: string;
};

type ResultTokens = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  id_token: string;
};

export default defineLazyEventHandler(() => {
  const { authenticationAppsScriptUrl, authenticationAppsScriptKey } =
    useRuntimeConfig();
  if (!authenticationAppsScriptUrl) {
    throw new Error('Authentication Sheet ID is not defined in runtime config');
  }
  if (!authenticationAppsScriptKey) {
    throw new Error(
      'Authentication Apps Script Key is not defined in runtime config',
    );
  }

  const authenticationAppsScriptService = useAuthenticationAppsScriptService({
    appsScriptUrl: authenticationAppsScriptUrl,
    appsScriptKey: authenticationAppsScriptKey,
  });

  return defineOAuthKeycloakEventHandler({
    config: {
      scope: ['openid', 'profile', 'email'],
    },
    onSuccess: async (event, result) => {
      const resultUser = result.user as ResultUser;
      const resultTokens = result.tokens as ResultTokens;

      const upsertedUser = await upsertUser(resultUser);

      const token = await authenticationAppsScriptService.generateToken(
        upsertedUser.id,
        resultTokens.refresh_expires_in,
      );

      await setUserSession(
        event,
        {
          user: {
            id: upsertedUser.id,
            subjectId: upsertedUser.subjectId,
            employeeId: upsertedUser.employeeId,
            name: upsertedUser.name,
            email: upsertedUser.email,
            department: upsertedUser.department,
            position: upsertedUser.position,
            isAdmin: upsertedUser.isAdmin,
            isSuperAdmin: upsertedUser.isSuperAdmin,
            token,
          },
        },
        {
          maxAge: resultTokens.refresh_expires_in,
        },
      );

      await logAction(upsertedUser.id, 'ลงชื่อเข้าใช้ระบบ');

      setCookie(event, 'id_token', resultTokens.id_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: resultTokens.refresh_expires_in,
      });

      sendRedirect(event, '/');
    },
    onError: async (_event, error) => {
      console.error('Login failed:', error);
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      });
    },
  });
});

async function upsertUser(user: ResultUser) {
  const drizzle = useDrizzle();

  const fieldMap: Partial<
    Record<keyof typeof schemas.user.$inferInsert, keyof ResultUser>
  > = {
    subjectId: 'sub',
    employeeId: 'hr_employee_id',
    name: 'hr_fullname_th',
    email: 'email',
    department: 'hr_department',
    position: 'hr_position',
  };

  // Build insert/update data
  const data = Object.fromEntries(
    Object.entries(fieldMap).map(([schemaKey, userKey]) => [
      schemaKey,
      user[userKey],
    ]),
  ) as unknown as typeof schemas.user.$inferInsert;

  try {
    const [existingUser] = await drizzle
      .select()
      .from(schemas.user)
      .where(eq(schemas.user.subjectId, user.sub));

    if (existingUser) {
      const hasChanged = Object.entries(data).some(
        ([key, value]) =>
          existingUser[key as keyof typeof existingUser] !== value,
      );
      if (hasChanged) {
        return (
          await drizzle
            .update(schemas.user)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(schemas.user.subjectId, user.sub))
            .returning()
        )[0];
      }
      return existingUser;
    }
    return (await drizzle.insert(schemas.user).values(data).returning())[0];
  } catch (error) {
    console.error('Error upserting user:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
}
