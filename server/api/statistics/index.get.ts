export default defineEventHandler({
	onRequest: [requireUserSessionEventHandler()],

	handler: async (_event) => {
		const { statisticsSheetId, equipmentsSheetId } = useRuntimeConfig();
		// const userSession = await requireUserSession(event);

		try {
			const auth = useGoogleAuth([
				'https://www.googleapis.com/auth/spreadsheets.readonly',
			]);
			const sheets = useGoogleSheets(auth);

			const result = await Promise.all([
				sheets.spreadsheets.values.get({
					spreadsheetId: statisticsSheetId,
					range: "' PEA AVA Ranking FRTU'!A1:E",
				}),
				// Timestamp
				sheets.spreadsheets.values.get({
					spreadsheetId: equipmentsSheetId,
					range: "'ข้อมูล ณ เวลา'!A1:A2",
				}),
			]);
			result[0].data.values?.splice(0, 1); // Remove header row

			const rawTimestamp = String(result[1].data.values?.[1]?.[0]);
			const rawDate = rawTimestamp.slice(0, 10).replace(/[^/0-9]/g, '');
			const [year, month, day] = rawDate.split(/\//g).toReversed();
			const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
			const time = rawTimestamp.slice(-8, -3);
			const timestamp = new Date(`${date}T${time}:00+07:00`);

			const data = result[0].data.values?.map((row) => {
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
				timestamp: timestamp,
			};
		} catch (error) {
			console.error('Error fetching availability statistics:', error);
			throw createError({
				statusCode: 500,
				statusMessage: 'Internal Server Error',
			});
		}
	},
});
