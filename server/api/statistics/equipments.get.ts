export default defineEventHandler({
	onRequest: [requireUserSessionEventHandler()],

	handler: async (_event) => {
		const { equipmentsSheetId } = useRuntimeConfig();
		// const userSession = await requireUserSession(event);

		try {
			const auth = useGoogleAuth([
				'https://www.googleapis.com/auth/spreadsheets.readonly',
			]);
			const sheets = useGoogleSheets(auth);

			const result = await Promise.all([
				sheets.spreadsheets.values.get({
					spreadsheetId: equipmentsSheetId,
					range: "'AVA PEA FRTU'!A1:E",
				}),
				sheets.spreadsheets.values.get({
					spreadsheetId: equipmentsSheetId,
					range: "'AVA PEA SUB'!A1:E",
				}),
				sheets.spreadsheets.values.get({
					spreadsheetId: equipmentsSheetId,
					range: "'AVA SPP VSPP 115 kV'!A1:E",
				}),
			]);

			const timestampResult = await sheets.spreadsheets.values.get({
				spreadsheetId: equipmentsSheetId,
				range: "'ข้อมูล ณ เวลา'!A1:A2",
			});

			result.forEach((result) => result.data.values?.splice(0, 1)); // Remove header row

			const rawTimestamp = String(timestampResult.data.values?.[1]?.[0]);
			const rawDate = rawTimestamp.slice(0, 10).replace(/[^/0-9]/g, '');
			const [year, month, day] = rawDate.split(/\//g).toReversed();
			const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
			const time = rawTimestamp.slice(-8, -3);
			const timestamp = new Date(`${date}T${time}:00+07:00`);

			const regions = result[0].data.values?.map((row) => String(row[0])) || [];
			const data = {
				data: regions.map((region) => {
					const frtuData = result[0].data.values?.find(
						(row) => String(row[0]) === region
					);
					const subData = result[1].data.values?.find(
						(row) => String(row[0]) === region
					);
					const vspData = result[2].data.values?.find(
						(row) => String(row[0]) === region
					);

					return {
						region,
						frtu: frtuData
							? {
									online: Number(frtuData[1]),
									total: Number(frtuData[2]),
									percentage: Number(frtuData[3]),
									ranking: Number(frtuData[4]),
							  }
							: null,
						sub: subData
							? {
									online: Number(subData[1]),
									total: Number(subData[2]),
									percentage: Number(subData[3]),
									ranking: Number(subData[4]),
							  }
							: null,
						vsp: vspData
							? {
									online: Number(vspData[1]),
									total: Number(vspData[2]),
									percentage: Number(vspData[3]),
									ranking: Number(vspData[4]),
							  }
							: null,
					};
				}),
				timestamp: timestamp,
			};

			if (!data) {
				throw createError({
					statusCode: 404,
					statusMessage: 'No data found',
				});
			}

			return data;
		} catch (error) {
			console.error('Error fetching equipment statistics:', error);
			throw createError({
				statusCode: 500,
				statusMessage: 'Internal Server Error',
			});
		}
	},
});
