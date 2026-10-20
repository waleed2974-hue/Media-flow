/**
 * Formats a duration in seconds into MM:SS or HH:MM:SS
 */
export function formatDuration(seconds?: number): string {
  if (seconds === undefined || seconds === null || isNaN(seconds) || seconds < 0) {
    return '--:--';
  }

  const sec = Math.floor(seconds);
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const remainingSec = sec % 60;

  const paddedMin = String(minutes).padStart(hours > 0 ? 2 : 1, '0');
  const paddedSec = String(remainingSec).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${paddedSec}`;
  }

  return `${paddedMin}:${paddedSec}`;
}

/**
 * Parses an ISO 8601 duration string (e.g., PT3M45S, PT1H2M10S) to seconds
 */
export function parseISO8601Duration(iso: string): number {
  if (!iso) return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}
