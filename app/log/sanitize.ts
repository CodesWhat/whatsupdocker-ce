/**
 * Sanitize a value for safe log interpolation.
 * Strips control characters and ANSI escapes to prevent log injection.
 */
export function sanitizeLogParam(value: unknown, maxLength = 200): string {
  const str = String(value ?? '');
  const cleaned = str.replace(/[\x00-\x1f\x7f]/g, '').replace(/\x1b\[[0-9;]*m/g, '');
  return cleaned.length > maxLength ? cleaned.slice(0, maxLength) + '...' : cleaned;
}
