import { SheetService } from '~~/server/services/sheet';
import { z } from 'zod';

const VALID_TYPES = ['frtu', 'substation'] as const;

const querySchema = z.object({
	region: z
		.string()
		.regex(
			/^(C|N|NE|S)(1|2|3)$/,
			'Region ต้องอยู่ในรูปแบบ C1, C2, C3, N1, N2, N3, NE1, NE2, NE3, หรือ S1, S2, S3'
		),
	type: z.enum(VALID_TYPES, {
		errorMap: () => ({
			message: `Type ต้องเป็นหนึ่งใน: ${VALID_TYPES.join(', ')}`,
		}),
	}),
});

export default defineEventHandler({
	onRequest: [requireUserSessionEventHandler()],

	handler: async (event) => {
		const session = await getUserSession(event);

		try {
			const query = await getValidatedQuery(event, querySchema.parse);
			const { region, type } = query;

			// Initialize Google Sheets service
			const sheets = useGoogleSheets(
				useGoogleAuth(['https://www.googleapis.com/auth/spreadsheets.readonly'])
			);
			const sheetService = new SheetService(sheets);

			// Get XLSX data based on type
			const xlsxBuffer =
				type === 'frtu'
					? await sheetService.downloadFrtuSheetData(region)
					: await sheetService.downloadSubstationSheetData(region);

			// Generate filename
			const timestamp = new Date()
				.toISOString()
				.slice(0, 19)
				.replace(/:/g, '-');
			const filename = `${type.toUpperCase()}_${region}_${timestamp}.xlsx`;

			// Set response headers for file download
			setHeader(
				event,
				'Content-Type',
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			);
			setHeader(
				event,
				'Content-Disposition',
				`attachment; filename="${filename}"`
			);
			setHeader(event, 'Cache-Control', 'no-cache');
			setHeader(event, 'Content-Length', xlsxBuffer.length);

			await logAction(session.user!.id, `ดาวน์โหลดไฟล์ ${filename}`);

			return xlsxBuffer;
		} catch (error) {
			console.error('Error downloading sheet data:', error);

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
				message: 'Failed to download data',
			});
		}
	},
});
