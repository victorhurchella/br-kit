// No timezone magic: these are pure string transforms between the Brazilian
// `dd/mm/yyyy` form and the ISO `yyyy-mm-dd` form. A `Date` is accepted as a
// convenience for `formatPtBr`, read via its local-time components.

const PT_BR = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2}|\d{4})$/;
const ISO = /^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function assertValidDate(year: number, month: number, day: number, source: string): void {
  if (month < 1 || month > 12) {
    throw new RangeError(`Invalid date: ${JSON.stringify(source)}`);
  }
  const max = month === 2 && isLeapYear(year) ? 29 : (DAYS_IN_MONTH[month - 1] as number);
  if (day < 1 || day > max) {
    throw new RangeError(`Invalid date: ${JSON.stringify(source)}`);
  }
}

/**
 * Parse a pt-BR date string into an ISO date `yyyy-mm-dd`. Accepts `/`, `-` or
 * `.` separators and 2- or 4-digit years (`00`–`69` → `2000`–`2069`, `70`–`99`
 * → `1970`–`1999`). Validates the calendar day, including leap years. Throws on
 * a malformed or impossible date.
 */
export function parsePtBr(value: string): string {
  const match = PT_BR.exec(value.trim());
  if (!match) {
    throw new RangeError(`Cannot parse pt-BR date: ${JSON.stringify(value)}`);
  }
  const day = Number(match[1]);
  const month = Number(match[2]);
  const rawYear = match[3] as string;
  let year = Number(rawYear);
  if (rawYear.length === 2) {
    year = year <= 69 ? 2000 + year : 1900 + year;
  }
  assertValidDate(year, month, day, value);
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Format an ISO date string (`yyyy-mm-dd`, optionally with a time part) or a
 * `Date` as pt-BR `dd/mm/yyyy`. Throws on a malformed or impossible date.
 */
export function formatPtBr(value: string | Date): string {
  let year: number;
  let month: number;
  let day: number;
  if (value instanceof Date) {
    year = value.getFullYear();
    month = value.getMonth() + 1;
    day = value.getDate();
  } else {
    const match = ISO.exec(value.trim());
    if (!match) {
      throw new RangeError(`Cannot format date: ${JSON.stringify(value)}`);
    }
    year = Number(match[1]);
    month = Number(match[2]);
    day = Number(match[3]);
  }
  assertValidDate(year, month, day, String(value));
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${String(year).padStart(4, "0")}`;
}
