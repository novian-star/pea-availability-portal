import type { sheets_v4 } from '@googleapis/sheets';

export class SheetService {
	constructor(private readonly sheets: sheets_v4.Sheets) {}

	/**
	 * Fetches FRTU sheet data from Google Sheets API.
	 */
	async fetchFrtuSheetData(region: string) {
		const { frtuSheetId } = useRuntimeConfig();

		const sheetName = region.toUpperCase();

		const response = await this.sheets.spreadsheets.values.get({
			spreadsheetId: frtuSheetId,
			range: `${sheetName}!A2:E`,
		});

		const headers = [
			'Site ID',
			'รหัสสั่งการ',
			'State SCADA',
			'ระยะเวลา Down ครั้งล่าสุด',
			'ข้อมูล ณ วันที่-เวลา',
		] as const;

		const data =
			response.data.values?.map((row) => ({
				[headers[0]]: String(row[0]),
				[headers[1]]: String(row[1]),
				[headers[2]]: String(row[2]),
				[headers[3]]: String(row[3]),
				[headers[4]]: String(row[4]),
			})) || [];

		return data;
	}

	/**
	 * Fetch substation sheet data from Google Sheets API
	 */
	async fetchSubstationSheetData(region: string) {
		const { substationSheetId } = useRuntimeConfig();

		const sheetName = `${region.toUpperCase()} SUB`;

		const response = await this.sheets.spreadsheets.values.get({
			spreadsheetId: substationSheetId,
			range: `'${sheetName}'!A2:E`,
		});

		const headers = [
			'Site ID',
			'สถานีไฟฟ้า',
			'State SCADA',
			'ระยะเวลา Down ครั้งล่าสุด',
			'ข้อมูล ณ วันที่-เวลา',
		] as const;

		const data =
			response.data.values?.map((row) => ({
				[headers[0]]: String(row[0]),
				[headers[1]]: String(row[1]),
				[headers[2]]: String(row[2]),
				[headers[3]]: String(row[3]),
				[headers[4]]: String(row[4]),
			})) || [];

		return data;
	}
}
