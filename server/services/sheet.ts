import type { sheets_v4 } from '@googleapis/sheets';
import * as XLSX from 'xlsx';

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

	/**
	 * Converts array of objects to XLSX buffer
	 */
	private arrayToXlsx(data: Record<string, string>[]): Buffer {
		if (data.length === 0) {
			// Create empty workbook with headers if no data
			const headers = [
				'Site ID',
				'รหัสสั่งการ',
				'State SCADA',
				'ระยะเวลา Down ครั้งล่าสุด',
				'ข้อมูล ณ วันที่-เวลา',
			];
			const worksheet = XLSX.utils.aoa_to_sheet([headers]);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
			return Buffer.from(
				XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
			);
		}

		// Create worksheet from data
		const worksheet = XLSX.utils.json_to_sheet(data);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

		// Return as buffer
		return Buffer.from(
			XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
		);
	}

	/**
	 * Downloads FRTU sheet data as XLSX
	 */
	async downloadFrtuSheetData(region: string): Promise<Buffer> {
		const data = await this.fetchFrtuSheetData(region);
		return this.arrayToXlsx(data);
	}

	/**
	 * Downloads Substation sheet data as XLSX
	 */
	async downloadSubstationSheetData(region: string): Promise<Buffer> {
		const data = await this.fetchSubstationSheetData(region);
		return this.arrayToXlsx(data);
	}
}
