import { z } from 'zod';
import { schemas } from '~~/server/database';

const querySchema = z
  .object({
    startDate: z.coerce.date().transform((date) => {
      // Set start date to the beginning of the day
      date.setHours(0, 0, 0, 0);
      return date;
    }),
    endDate: z.coerce.date().transform((date) => {
      // Set end date to the end of the day
      date.setHours(23, 59, 59, 999);
      return date;
    }),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'Start date must be before or equal to end date',
  });

export default defineEventHandler({
  onRequest: [requireAdminEventHandler()],

  handler: defineEventHandler(async (event) => {
    try {
      const query = await getValidatedQuery(event, querySchema.parse);
      const { startDate, endDate } = query;

      // Get total count
      const result = (await getLoginLogs()).filter((log) => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate && logDate < endDate;
      });

      const difference = Math.abs(
        new Date(endDate).getTime() - new Date(startDate).getTime(),
      );

      const timeDifference = 24 * 60 * 60 * 1000; // 1 day in milliseconds

      const intervals = Math.ceil(difference / timeDifference);

      const group = Array.from({ length: intervals }).map((_, i) => {
        const intervalStart = new Date(
          new Date(startDate).getTime() + i * timeDifference,
        );
        const intervalEnd = new Date(
          new Date(startDate).getTime() + (i + 1) * timeDifference,
        );
        const count = result.filter((log) => {
          const logDate = new Date(log.timestamp);
          return logDate >= intervalStart && logDate < intervalEnd;
        }).length;

        return {
          timestamp: intervalStart.toISOString(),
          logins: count,
        };
      });

      return {
        data: group,
      };
    } catch (error) {
      console.error('Error fetching login logs:', error);

      // Handle validation errors
      if (error instanceof z.ZodError) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: error.errors.map((e) => e.message).join(', '),
        });
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
      });
    }
  }),
});

const getLoginLogs = defineCachedFunction(
  async () => {
    const drizzle = useDrizzle();

    const result = await drizzle
      .select({
        timestamp: schemas.log.timestamp,
      })
      .from(schemas.log);

    return result;
  },
  {
    maxAge: 5 * 60 /* cache for 5 minutes */,
    name: `getLoginLogs`,
  },
);
