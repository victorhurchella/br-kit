export type PhoneType = "mobile" | "landline";

export interface PhoneParts {
  /** Two-digit area code (DDD). */
  ddd: string;
  /** Subscriber number without the area code. */
  number: string;
  /** `"mobile"` (9 digits, leading 9) or `"landline"` (8 digits, leading 2–5). */
  type: PhoneType;
}

// Valid Brazilian area codes (DDDs) per Anatel's national numbering plan.
const VALID_DDD = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43,
  44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77,
  79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

/** Remove every non-digit character. */
export function strip(value: string): string {
  return value.replace(/\D/g, "");
}

/** Drop an optional `55` country code when present (12- or 13-digit input). */
function normalize(value: string): string {
  const digits = strip(value);
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
    return digits.slice(2);
  }
  return digits;
}

/**
 * Parse a phone number into its parts, applying Anatel rules: valid DDD, the
 * mobile ninth digit (`9`), and landline leading digit (`2`–`5`). Returns
 * `null` when the number is not valid. Accepts an optional `+55` country code.
 */
export function parse(value: string): PhoneParts | null {
  const digits = normalize(value);
  if (digits.length === 11) {
    if (!VALID_DDD.has(Number(digits.slice(0, 2))) || digits[2] !== "9") {
      return null;
    }
    return { ddd: digits.slice(0, 2), number: digits.slice(2), type: "mobile" };
  }
  if (digits.length === 10) {
    const lead = digits[2] as string;
    if (!VALID_DDD.has(Number(digits.slice(0, 2))) || lead < "2" || lead > "5") {
      return null;
    }
    return { ddd: digits.slice(0, 2), number: digits.slice(2), type: "landline" };
  }
  return null;
}

/** `true` when `value` is a valid Brazilian landline or mobile number. */
export function isValid(value: string): boolean {
  return parse(value) !== null;
}

/** Format as `(11) 91234-5678` (mobile) or `(11) 1234-5678` (landline). */
export function format(value: string): string {
  const parts = parse(value);
  if (!parts) {
    throw new RangeError(`Invalid phone: cannot format ${JSON.stringify(value)}`);
  }
  const { ddd, number, type } = parts;
  const split = type === "mobile" ? 5 : 4;
  return `(${ddd}) ${number.slice(0, split)}-${number.slice(split)}`;
}
