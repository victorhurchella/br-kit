import { describe, expect, it } from "vitest";
import * as cep from "../src/cep";
import { loadVectors, type ValueCase } from "./vectors";

const v = loadVectors<{ isValid: ValueCase[]; format: ValueCase[]; strip: ValueCase[] }>("cep");

describe("cep — shared vectors", () => {
  it.each(v.isValid)("isValid($input) === $expected", ({ input, expected }) => {
    expect(cep.isValid(input)).toBe(expected);
  });
  it.each(v.format)("format($input)", ({ input, expected, error }) => {
    if (error) expect(() => cep.format(input)).toThrow();
    else expect(cep.format(input)).toBe(expected);
  });
  it.each(v.strip)("strip($input) === $expected", ({ input, expected }) => {
    expect(cep.strip(input)).toBe(expected);
  });
});
