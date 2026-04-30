export default defineEventHandler({
  onRequest: [requireUserSessionEventHandler()],

  handler: defineCachedEventHandler(
    async (_event) => {
      const { statisticsSheetId } = useRuntimeConfig();
      // const userSession = await requireUserSession(event);

      try {
        const auth = useGoogleAuth([
          'https://www.googleapis.com/auth/spreadsheets.readonly',
        ]);
        const sheets = useGoogleSheets(auth);

        const result = await sheets.spreadsheets.values.get({
          spreadsheetId: statisticsSheetId,
          range: "' PEA AVA Ranking FRTU'!A1:E",
        });

        result.data.values?.splice(0, 1); // Remove header row

        const data = result.data.values?.map((row) => {
          return {
            region: String(row[0]),
            online: Number(row[1]),
            total: Number(row[2]),
            percentage: Number(row[3]),
            ranking: Number(row[4]),
          };
        });
        if (!data) {
          throw createError({
            statusCode: 404,
            statusMessage: 'No data found',
          });
        }

        return {
          data: data,
        };
      } catch (error) {
        console.error('Error fetching availability statistics:', error);
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
        });
      }
    },
    {
      maxAge: 5 * 60, // Cache for 5 minutes
    },
  ),
});
