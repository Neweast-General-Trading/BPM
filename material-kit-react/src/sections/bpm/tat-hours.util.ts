/** TAT is stored as a decimal hour count (1.5 = 1 hour and 30 minutes). */

function normName(value: string | undefined | null): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function isTatHoursField(field: { key?: string; label?: string }): boolean {
  const key = normName(field.key);
  const label = normName(field.label);
  return (
    key === 'tat' ||
    label === 'tat' ||
    label === 'tatminutes' ||
    label === 'tathours' ||
    label === 'tatdays'
  );
}

/**
 * Bare numbers are hours. 1.5 → "1 Hour - 30 Minutes".
 * Free text ("≤ 1 Business Day", "30 minutes") is left unchanged.
 */
export function formatTatHoursDisplay(raw: unknown): string {
  if (raw === undefined || raw === null) return '';
  const text = (Array.isArray(raw) ? raw.map((v) => String(v ?? '')).join(', ') : String(raw)).trim();
  if (!text) return '';
  const bare = text.match(/^\d+(?:\.\d+)?$/);
  const withHours = text.match(/^(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)$/i);
  const numeric = bare?.[0] ?? withHours?.[1];
  if (!numeric) return text;
  const hours = Number(numeric);
  if (!Number.isFinite(hours) || hours < 0) return text;
  const totalMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (wholeHours > 0) {
    parts.push(`${wholeHours} ${wholeHours === 1 ? 'Hour' : 'Hours'}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'Minute' : 'Minutes'}`);
  }
  return parts.length ? parts.join(' - ') : '0 Hours';
}
