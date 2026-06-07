const MASK = /[.\-\s]/g;
const ONLY_DIGITS = /^\d{8}$/;

/** Remove mask characters (dot, hyphen, whitespace), keeping only digits. */
export function strip(value: string): string {
  return value.replace(MASK, "");
}

/**
 * Structural validation only: a CEP is eight digits. Existence of the postal
 * code is out of scope (no network calls in the core — see design principle 6).
 */
export function isValid(value: string): boolean {
  return ONLY_DIGITS.test(strip(value));
}

/** Format eight digits as `00000-000`. Throws on a non-8-digit input. */
export function format(value: string): string {
  const c = strip(value);
  if (!ONLY_DIGITS.test(c)) {
    throw new RangeError(`Invalid CEP: cannot format ${JSON.stringify(value)}`);
  }
  return `${c.slice(0, 5)}-${c.slice(5)}`;
}
