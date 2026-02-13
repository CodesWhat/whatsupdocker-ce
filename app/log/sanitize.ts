/**
 * Sanitize a value for safe log interpolation.
 * Strips control characters and ANSI escapes to prevent log injection.
 */
// Built from strings so biome's noControlCharactersInRegex doesn't flag them.
// biome-ignore lint/complexity/useRegexLiterals: RegExp constructor needed to avoid noControlCharactersInRegex
const CONTROL_CHARS = new RegExp('[\\x00-\\x1f\\x7f]', 'g');
// biome-ignore lint/complexity/useRegexLiterals: RegExp constructor needed to avoid noControlCharactersInRegex
const ANSI_ESCAPES = new RegExp('\\x1b\\[[0-9;]*m', 'g');

export function sanitizeLogParam(value: unknown, maxLength = 200): string {
  const str = String(value ?? '');
  const cleaned = str.replace(CONTROL_CHARS, '').replace(ANSI_ESCAPES, '');
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength)}...` : cleaned;
}
