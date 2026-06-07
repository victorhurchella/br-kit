import type { ValidationResult } from "./types";

/** Machine-readable reasons a CNPJ can be invalid. */
export type CnpjReason =
  | "invalid-characters"
  | "invalid-length"
  | "repeated-digits"
  | "invalid-check-digit";

const CNPJ_LENGTH = 14;
const MASK = /[.\-/\s]/g;
const BASE_CHARS = /^[0-9A-Z]{12}$/;
const DV_CHARS = /^[0-9]{2}$/;
const ALL_SAME = /^(.)\1{13}$/;

// Official RFB weights (modulo 11). The first check digit is computed over the
// 12 base characters; the second over the 12 base characters plus the first DV.
const DV1_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
const DV2_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;

const ALPHANUM = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMERIC = "0123456789";

/** Remove mask characters and upper-case letters, keeping base + check digits. */
export function strip(value: string): string {
  return value.replace(MASK, "").toUpperCase();
}

/**
 * RFB alphanumeric rule: the numeric value of a character is its ASCII code
 * minus 48 (`'0'` → 0 … `'9'` → 9, `'A'` → 17 … `'Z'` → 42).
 */
function charValue(char: string): number {
  return char.charCodeAt(0) - 48;
}

function checkDigit(chars: string, weights: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += charValue(chars[i] as string) * (weights[i] as number);
  }
  const mod = sum % 11;
  return mod < 2 ? 0 : 11 - mod;
}

/**
 * Validate a CNPJ and explain *why* it is invalid. Transparently accepts both
 * the legacy numeric format and the 2026 alphanumeric format (A–Z allowed in
 * the 12 base characters; the two check digits are always numeric). Accepts
 * masked or unmasked, upper- or lower-case input.
 */
export function validateDetailed(value: string): ValidationResult<CnpjReason> {
  const cleaned = strip(value);
  if (cleaned.length !== CNPJ_LENGTH) {
    return { valid: false, reason: "invalid-length" };
  }
  const base = cleaned.slice(0, 12);
  const dv = cleaned.slice(12);
  if (!BASE_CHARS.test(base) || !DV_CHARS.test(dv)) {
    return { valid: false, reason: "invalid-characters" };
  }
  if (ALL_SAME.test(cleaned)) {
    return { valid: false, reason: "repeated-digits" };
  }
  const d1 = checkDigit(base, DV1_WEIGHTS);
  const d2 = checkDigit(`${base}${d1}`, DV2_WEIGHTS);
  if (d1 !== Number(dv[0]) || d2 !== Number(dv[1])) {
    return { valid: false, reason: "invalid-check-digit" };
  }
  return { valid: true, reason: null };
}

/** `true` when `value` is a valid CNPJ (numeric or alphanumeric). */
export function isValid(value: string): boolean {
  return validateDetailed(value).valid;
}

/**
 * `true` when the CNPJ uses the alphanumeric format — i.e. at least one letter
 * appears in the 12 base characters. Structural check only; it does not
 * validate the check digits.
 */
export function isAlphanumeric(value: string): boolean {
  const cleaned = strip(value);
  if (cleaned.length !== CNPJ_LENGTH) {
    return false;
  }
  return /[A-Z]/.test(cleaned.slice(0, 12));
}

/** Format 14 characters as `00.000.000/0000-00`. Throws on malformed input. */
export function format(value: string): string {
  const c = strip(value);
  if (c.length !== CNPJ_LENGTH || !BASE_CHARS.test(c.slice(0, 12)) || !DV_CHARS.test(c.slice(12))) {
    throw new RangeError(`Invalid CNPJ: cannot format ${JSON.stringify(value)}`);
  }
  return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12)}`;
}

export interface GenerateOptions {
  /** Return the masked form `00.000.000/0000-00` instead of bare characters. */
  formatted?: boolean;
  /** Generate an alphanumeric CNPJ (A–Z in the 12 base characters). */
  alphanumeric?: boolean;
}

/**
 * Generate a syntactically valid CNPJ. **For tests and fixtures only.** Pass
 * `{ alphanumeric: true }` to exercise the 2026 format.
 */
export function generate(options: GenerateOptions = {}): string {
  const pool = options.alphanumeric ? ALPHANUM : NUMERIC;
  let base = "";
  for (let i = 0; i < 12; i++) {
    base += pool[Math.floor(Math.random() * pool.length)];
  }
  if (new Set(base).size === 1) {
    base = (base[0] === "0" ? "1" : "0") + base.slice(1);
  }
  const d1 = checkDigit(base, DV1_WEIGHTS);
  const full = `${base}${d1}${checkDigit(`${base}${d1}`, DV2_WEIGHTS)}`;
  return options.formatted ? format(full) : full;
}
