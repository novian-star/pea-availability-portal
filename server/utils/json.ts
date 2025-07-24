export function jsonToCsv(json: Record<string, unknown>[]): string {
	if (!json || json.length === 0) {
		return '';
	}

	const headers = Object.keys(json[0]);
	const csvRows = [
		headers.join(','), // header row
		...json.map((row) =>
			headers.map((header) => JSON.stringify(row[header] ?? '')).join(',')
		), // data rows
	];

	return csvRows.join('\n');
}
