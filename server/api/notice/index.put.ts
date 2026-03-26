import { updateNoticeValidation } from '#shared/validations/notice';

import { eq } from 'drizzle-orm';
import * as v from 'valibot';

import { schemas } from '~~/server/database';

export default defineEventHandler({
  onRequest: [requireAdminEventHandler()],

  handler: async (event) => {
    const userSession = await requireUserSession(event);

    const drizzle = useDrizzle();

    const body = await readValidatedBody(
      event,
      v.parser(updateNoticeValidation),
    );

    try {
      // Fetch the first (and only) notice record
      const notices = await drizzle.select().from(schemas.notice).limit(1);

      // If toggling off, delete the notice
      if (!body.isEnabled) {
        if (notices.length > 0) {
          await drizzle
            .delete(schemas.notice)
            .where(eq(schemas.notice.id, notices[0].id));

          await logAction(userSession.user.id, 'Disabled and deleted notice');
        }

        return {
          data: null,
        };
      }

      // Validate that title and content are provided when enabling
      if (!body.title || body.title.trim() === '') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Title is required when enabling notice',
        });
      }

      if (!body.content || body.content.trim() === '') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Content is required when enabling notice',
        });
      }

      let notice;

      if (notices.length === 0) {
        // If no notice exists, create one
        [notice] = await drizzle
          .insert(schemas.notice)
          .values({
            title: body.title,
            content: body.content,
            isEnabled: body.isEnabled,
            showInBanner: body.showInBanner,
            updatedAt: new Date(),
          })
          .returning();
      } else {
        // Update existing notice
        [notice] = await drizzle
          .update(schemas.notice)
          .set({
            title: body.title,
            content: body.content,
            isEnabled: body.isEnabled,
            showInBanner: body.showInBanner,
            updatedAt: new Date(),
          })
          .where(eq(schemas.notice.id, notices[0].id))
          .returning();
      }

      await logAction(
        userSession.user.id,
        `Updated notice: "${body.title}" (${body.isEnabled ? 'enabled' : 'disabled'})`,
      );

      return {
        data: {
          id: notice.id,
          title: notice.title,
          content: notice.content,
          isEnabled: notice.isEnabled,
          showInBanner: notice.showInBanner,
          updatedAt: notice.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      console.error('Error updating notice:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
      });
    }
  },
});
