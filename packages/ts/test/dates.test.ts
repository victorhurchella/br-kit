import { describe, expect, it } from "vitest";
import * as dates from "../src/dates";
import { loadVectors, type ValueCase } from "./vectors";

const v = loadVectors<{ parsePtBr: ValueCase[]; formatPtBr: ValueCase[] }>("dates");

describe("dates — shared vectors", () => {
  it.each(v.parsePtBr)("parsePtBr($input)", ({ input, expected, error }) => {
    if (error) expect(() => dates.parsePtBr(input)).toThrow();
    else expect(dates.parsePtBr(input)).toBe(expected);
  });
  it.each(v.formatPtBr)("formatPtBr($input)", ({ input, expected, error }) => {
    if (error) expect(() => dates.formatPtBr(input)).toThrow();
    else expect(dates.formatPtBr(input)).toBe(expected);
  });

  it("formatPtBr accepts a Date", () => {
    expect(dates.formatPtBr(new Date(2025, 11, 31))).toBe("31/12/2025");
  });
});
