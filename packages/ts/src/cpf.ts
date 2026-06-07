import type { ValidationResult } from "./types";

/** Machine-readable reasons a CPF can be invalid. */
export type CpfReason =
  | "invalid-characters"
  | "invalid-length"
  | "repeated-digits"
  | "invalid-check-digit";

const CPF_LENGTH = 11;
const ONLY_DIGITS = /^\d+$/;
const MASK = /[.\-\s]/g;
const REPEATED = /^(\d)\1{10}$/;

/** Remove mask characters (dots, hyphen, whitespace), keeping only digits. */
export function strip(value: string): string {
  return value.replace(MASK, "");
}

/**
 * Compute a CPF check digit over the first `length` digits using the official
 * descending weights (`length + 1` down to `2`) and modulo 11.
 */
function checkDigit(digits: string, length: number): number {
  let sum = 0;
  let weight = length + 1;
  for (let i = 0; i < length; i++) {
    sum += Number(digits[i]) * weight;
    weight--;
  }
  const mod = sum % 11;
  return mod < 2 ? 0 : 11 - mod;
}

/**
 * Validate a CPF and explain *why* it is invalid. Accepts values with or
 * without the `000.000.000-00` mask.
 */
export function validateDetailed(value: string): ValidationResult<CpfReason> {
  const cleaned = strip(value);
  if (cleaned.length === 0 || !ONLY_DIGITS.test(cleaned)) {
    return { valid: false, reason: "invalid-characters" };
  }
  if (cleaned.length !== CPF_LENGTH) {
    return { valid: false, reason: "invalid-length" };
  }
  if (REPEATED.test(cleaned)) {
    return { valid: false, reason: "repeated-digits" };
  }
  const d1 = checkDigit(cleaned, 9);
  const d2 = checkDigit(cleaned, 10);
  if (d1 !== Number(cleaned[9]) || d2 !== Number(cleaned[10])) {
    return { valid: false, reason: "invalid-check-digit" };
  }
  return { valid: true, reason: null };
}

/** `true` when `value` is a structurally valid CPF with correct check digits. */
export function isValid(value: string): boolean {
  return validateDetailed(value).valid;
}

/** Format 11 digits as `000.000.000-00`. Throws on a non-11-digit input. */
export function format(value: string): string {
  const c = strip(value);
  if (c.length !== CPF_LENGTH || !ONLY_DIGITS.test(c)) {
    throw new RangeError(`Invalid CPF: cannot format ${JSON.stringify(value)}`);
  }
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`;
}

export interface GenerateOptions {
  /** Return the masked form `000.000.000-00` instead of bare digits. */
  formatted?: boolean;
}

/**
 * Generate a syntactically valid CPF. **For tests and fixtures only** — a valid
 * check digit says nothing about a real, issued document.
 */
export function generate(options: GenerateOptions = {}): string {
  let base = "";
  for (let i = 0; i < 9; i++) {
    base += Math.floor(Math.random() * 10);
  }
  if (new Set(base).size === 1) {
    base = base.slice(0, 8) + ((Number(base[8]) + 1) % 10);
  }
  const d1 = checkDigit(base, 9);
  const full = `${base}${d1}${checkDigit(`${base}${d1}`, 10)}`;
  return options.formatted ? format(full) : full;
}
