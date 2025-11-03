/**
 * Date/time helpers for Asia/Jakarta timezone formatting.
 *
 * Exports:
 * - formatDateTimeJakarta(date, options?, locale?) -> human-readable date/time in Asia/Jakarta
 * - formatDateJakarta(date, locale?) -> YYYY-MM-DD (Jakarta local date)
 * - toJakartaIso(date) -> ISO-like string with +07:00 offset: YYYY-MM-DDTHH:mm:ss+07:00
 *
 * Usage examples:
 *   formatDateTimeJakarta(new Date())
 *   formatDateJakarta('2025-11-03T12:00:00Z')
 *   toJakartaIso(Date.now())
 */

const TIMEZONE = 'Asia/Jakarta';

function toDate(input?: Date | string | number): Date {
  if (!input) return new Date();
  return input instanceof Date ? input : new Date(input);
}

export function formatDateTimeJakarta(
  input?: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
  locale = 'id-ID',
) {
  const date = toDate(input);
  const opts: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: TIMEZONE,
    ...options,
  };

  return new Intl.DateTimeFormat(locale, opts).format(date);
}

export function formatDateJakarta(
  input?: Date | string | number,
  locale = 'id-ID',
) {
  const date = toDate(input);
  const opts: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: TIMEZONE,
  };

  return new Intl.DateTimeFormat(locale, opts).format(date);
}

/**
 * Build an ISO-like timestamp in Asia/Jakarta with explicit +07:00 offset.
 * Example: 2025-11-03T19:45:30+07:00
 */
export function toJakartaIso(input?: Date | string | number): string {
  const date = toDate(input);

  // Use formatToParts to extract numeric values in Jakarta timezone
  const df = new Intl.DateTimeFormat('id-ID', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = df.formatToParts(date).reduce<Record<string, string>>(
    (acc, p) => {
      if (p.type !== 'literal') acc[p.type] = p.value;
      return acc;
    },
    {} as Record<string, string>,
  );

  // parts will have year, month, day, hour, minute, second
  const y = parts.year ?? '0000';
  const m = parts.month ?? '00';
  const d = parts.day ?? '00';
  const hh = parts.hour ?? '00';
  const mm = parts.minute ?? '00';
  const ss = parts.second ?? '00';

  // Jakarta offset is +07:00
  const offset = '+07:00';

  return `${y}-${m}-${d}T${hh}:${mm}:${ss}${offset}`;
}

export default {
  formatDateTimeJakarta,
  formatDateJakarta,
  toJakartaIso,
};

/**
 * Convenience wrapper to format a timestamp into Jakarta ISO-like string.
 */
export function formatTimestampJakarta(input?: Date | string | number): string {
  return toJakartaIso(input);
}
