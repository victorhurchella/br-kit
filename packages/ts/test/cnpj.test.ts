import { describe, expect, it } from "vitest";
import * as cnpj from "../src/cnpj";
import { type DetailedCase, loadVectors, type ValueCase } from "./vectors";

const v = loadVectors<{
  isValid: ValueCase[];
  validateDetailed: DetailedCase[];
  isAlphanumeric: ValueCase[];
  format: ValueCase[];
  strip: ValueCase[];
}>("cnpj");

describe("cnpj — shared vectors", () => {
  it.each(v.isValid)("isValid($input) === $expected", ({ input, expected }) => {
    expect(cnpj.isValid(input)).toBe(expected);
  });

  it.each(v.validateDetailed)("validateDetailed($input)", ({ input, valid, reason }) => {
    expect(cnpj.validateDetailed(input)).toEqual({ valid, reason });
  });

  it.each(v.isAlphanumeric)("isAlphanumeric($input) === $expected", ({ input, expected }) => {
    expect(cnpj.isAlphanumeric(input)).toBe(expected);
  });

  it.each(v.format)("format($input)", ({ input, expected, error }) => {
    if (error) expect(() => cnpj.format(input)).toThrow();
    else expect(cnpj.format(input)).toBe(expected);
  });

  it.each(v.strip)("strip($input) === $expected", ({ input, expected }) => {
    expect(cnpj.strip(input)).toBe(expected);
  });
});

describe("cnpj — generate", () => {
  it("produces valid numeric CNPJs", () => {
    for (let i = 0; i < 500; i++) expect(cnpj.isValid(cnpj.generate())).toBe(true);
  });
  it("produces valid alphanumeric CNPJs", () => {
    let sawLetter = false;
    for (let i = 0; i < 500; i++) {
      const value = cnpj.generate({ alphanumeric: true });
      expect(cnpj.isValid(value)).toBe(true);
      if (/[A-Z]/.test(value.slice(0, 12))) sawLetter = true;
    }
    expect(sawLetter).toBe(true);
  });
  it("honors the formatted flag", () => {
    expect(cnpj.generate({ formatted: true })).toMatch(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);
  });
});
