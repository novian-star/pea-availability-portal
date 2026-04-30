/**
 * Gets timestamp from 'DD/MM/YYYY HH:MM u.'
 */
export function getTimestamp(string: string | undefined): Date | null {
  if (!string) {
    return null;
  }

  const rawTimestamp = String(string);

  const rawDate = rawTimestamp.slice(0, 10).replace(/[^/0-9]/g, '');

  const [year, month, day] = rawDate.split(/\//g).toReversed();

  const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

  const time = rawTimestamp.slice(-8, -3);

  return new Date(`${date}T${time}:00+07:00`);
}
