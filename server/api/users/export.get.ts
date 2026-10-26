import { schemas } from '~~/server/database';

export default defineEventHandler({
  onRequest: [requireAdminEventHandler()],

  handler: async (event) => {
    try {
      const drizzle = useDrizzle();

      const users = await drizzle
        .select()
        .from(schemas.user)
        .orderBy(schemas.user.createdAt);

      if (users.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'No user found',
        });
      }

      const rows = users.map((user) => ({
        รหัสพนักงาน: user.employeeId,
        'ชื่อ-นามสกุล': user.name,
        อีเมล: user.email,
        แผนก: user.department,
        ตำแหน่ง: user.position,
        ลงทะเทียนเมื่อ: user.createdAt.toLocaleString('th-TH'),
        แก้ไขล่าสุดเมื่อ: user.updatedAt.toLocaleString('th-TH'),
      }));

      const csv = `\uFEFF${jsonToCsv(rows)}`;

      const stream = new ReadableStream<unknown>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(csv));
          controller.close();
        },
      });

      sendStream(event, stream);
    } catch (error) {
      console.error('Error downloading sheet data:', error);

      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to download data',
      });
    }
  },
});
