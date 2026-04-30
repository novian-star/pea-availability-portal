export default defineEventHandler({
  onRequest: [requireUserSessionEventHandler()],

  handler: defineCachedEventHandler(
    async (_event) => {
      const { equipmentsSheetId } = useRuntimeConfig();

      try {
        const auth = useGoogleAuth([
          'https://www.googleapis.com/auth/spreadsheets.readonly',
        ]);
        const sheets = useGoogleSheets(auth);

        const result = await sheets.spreadsheets.values.get({
          spreadsheetId: equipmentsSheetId,
          range: "'ข้อมูล ณ เวลา'!A1:A2",
        });

        const timestamp = getTimestamp(String(result.data.values?.[1]?.[0]));

        return {
          timestamp: timestamp,
        };
      } catch (error) {
        console.error('Error fetching timestamp:', error);
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
