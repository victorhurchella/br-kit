// Grouping/decimal formatting is implemented by hand (not via `Intl`) so the
// output is byte-for-byte identical to the Python implementation and independent
// of the host's locale data.

const THOUSANDS = /\B(?=(\d{3})+(?!\d))/g;

/** Format a number as Brazilian Real, e.g. `1234.56` → `"R$ 1.234,56"`. */
export function formatBRL(value: number): string {
  if (!Number.isFinite(value)) {
    throw new RangeError(`Invalid amount: ${value}`);
  }
  const negative = value < 0;
  const cents = Math.round(Math.abs(value) * 100);
  const intPart = Math.floor(cents / 100).toString();
  const decPart = (cents % 100).toString().padStart(2, "0");
  const grouped = intPart.replace(THOUSANDS, ".");
  return `${negative ? "-" : ""}R$ ${grouped},${decPart}`;
}

/**
 * Parse a Brazilian Real string into a number. Tolerant of the `R$` prefix,
 * surrounding whitespace, and the common shapes `1.234,56`, `1234,56`,
 * `R$1.234,56`. A leading `-` or wrapping parentheses denote a negative value.
 *
 * Brazilian convention: `,` is the decimal separator and `.` groups thousands.
 * A lone `.` followed by exactly one or two trailing digits (e.g. `"1234.56"`)
 * is treated as a decimal point. Throws on unparseable input.
 */
export function parseBRL(value: string): number {
  let s = value.trim();
  let negative = false;
  if (s.startsWith("-")) {
    negative = true;
    s = s.slice(1).trim();
  }
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1).trim();
  }
  s = s.replace(/r\$/i, "").replace(/\s/g, "");
  if (s.startsWith("-")) {
    negative = true;
    s = s.slice(1);
  }

  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else {
    const dotCount = (s.match(/\./g) ?? []).length;
    if (!(dotCount === 1 && /\.\d{1,2}$/.test(s))) {
      s = s.replace(/\./g, "");
    }
  }

  if (!/^\d+(\.\d+)?$/.test(s)) {
    throw new RangeError(`Cannot parse BRL value: ${JSON.stringify(value)}`);
  }
  const n = Number(s);
  return negative ? -n : n;
}
