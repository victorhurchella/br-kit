import { describe, expect, it } from "vitest";
import * as phone from "../src/phone";
import { loadVectors, type ValueCase } from "./vectors";

interface ParseCase {
  input: string;
  expected: { ddd: string; number: string; type: string } | null;
}

const v = loadVectors<{
  isValid: ValueCase[];
  format: ValueCase[];
  strip: ValueCase[];
  parse: ParseCase[];
}>("phone");

describe("phone — shared vectors", () => {
  it.each(v.isValid)("isValid($input) === $expected", ({ input, expected }) => {
    expect(phone.isValid(input)).toBe(expected);
  });
  it.each(v.format)("format($input)", ({ input, expected, error }) => {
    if (error) expect(() => phone.format(input)).toThrow();
    else expect(phone.format(input)).toBe(expected);
  });
  it.each(v.strip)("strip($input) === $expected", ({ input, expected }) => {
    expect(phone.strip(input)).toBe(expected);
  });
  it.each(v.parse)("parse($input)", ({ input, expected }) => {
    expect(phone.parse(input)).toEqual(expected);
  });
});
