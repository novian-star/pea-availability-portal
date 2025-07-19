import { updateUserValidation } from '#shared/validations/user';

import { eq } from 'drizzle-orm';
import * as v from 'valibot';

import { schemas } from '~~/server/database';

export default defineEventHandler({
  onRequest: [requireAdminEventHandler()],

  handler: async (event) => {
    const userSession = await requireUserSession(event);

    const drizzle = useDrizzle();

    const id = getRouterParam(event, 'id');

    const body = await readValidatedBody(event, v.parser(updateUserValidation));

    try {
      const existingUser = (
        await drizzle
          .select()
          .from(schemas.user)
          .where(eq(schemas.user.id, String(id)))
      )[0];

      if (!existingUser) {
        throw createError({
          statusCode: 404,
          statusMessage: 'User not found',
        });
      }

      // Admin flag logic.
      const isCurrentUser = existingUser.id === userSession.user.id;
      const isSuperAdmin = userSession.user.isSuperAdmin;
      const isAdmin = userSession.user.isAdmin;

      if (isCurrentUser) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Cannot modify your own user data',
        });
      }

      // Prevent super admins from followings:
      // - Change their own admin status.
      // - Change other super admins admin status.
      if (isSuperAdmin) {
        let statusMessage: string | undefined;
        if (existingUser.isSuperAdmin) {
          statusMessage = "Cannot modify another super admin's status";
        }

        if (statusMessage) {
          throw createError({
            statusCode: 403,
            statusMessage,
          });
        }
      }
      // Prevent admins from followings:
      // - Change their own admin status.
      // - Change other admins admin status.
      // - Change super admins admin status.
      if (isAdmin && !isSuperAdmin) {
        let statusMessage: string | undefined;
        if (existingUser.isSuperAdmin) {
          statusMessage = "Cannot modify a super admin's status";
        } else if (existingUser.isAdmin) {
          statusMessage = "Cannot modify another admin's status";
        }

        if (statusMessage) {
          throw createError({
            statusCode: 403,
            statusMessage,
          });
        }
      }

      const updatedUser = (
        await drizzle
          .update(schemas.user)
          .set({
            ...body,
          })
          .where(eq(schemas.user.id, String(id)))
          .returning()
      )[0];

      return {
        data: updatedUser,
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
      });
    }
  },
});
