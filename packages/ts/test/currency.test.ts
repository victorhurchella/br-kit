import { describe, expect, it } from "vitest";
import * as currency from "../src/currency";
import { loadVectors } from "./vectors";

interface NumCase {
  input: number;
  expected: string;
}
interface StrCase {
  input: string;
  expected?: number;
  error?: boolean;
}

const v = loadVectors<{ formatBRL: NumCase[]; parseBRL: StrCase[] }>("currency");

describe("currency — shared vectors", () => {
  it.each(v.formatBRL)("formatBRL($input) === $expected", ({ input, expected }) => {
    expect(currency.formatBRL(input)).toBe(expected);
  });
  it.each(v.parseBRL)("parseBRL($input)", ({ input, expected, error }) => {
    if (error) expect(() => currency.parseBRL(input)).toThrow();
    else expect(currency.parseBRL(input)).toBe(expected);
  });

  it("formatBRL throws on non-finite input", () => {
    expect(() => currency.formatBRL(Number.NaN)).toThrow();
    expect(() => currency.formatBRL(Number.POSITIVE_INFINITY)).toThrow();
  });
});
