import { describe, expect, it } from "vitest";
import * as cpf from "../src/cpf";
import { type DetailedCase, loadVectors, type ValueCase } from "./vectors";

const v = loadVectors<{
  isValid: ValueCase[];
  validateDetailed: DetailedCase[];
  format: ValueCase[];
  strip: ValueCase[];
}>("cpf");

describe("cpf — shared vectors", () => {
  it.each(v.isValid)("isValid($input) === $expected", ({ input, expected }) => {
    expect(cpf.isValid(input)).toBe(expected);
  });

  it.each(v.validateDetailed)("validateDetailed($input)", ({ input, valid, reason }) => {
    expect(cpf.validateDetailed(input)).toEqual({ valid, reason });
  });

  it.each(v.format)("format($input)", ({ input, expected, error }) => {
    if (error) expect(() => cpf.format(input)).toThrow();
    else expect(cpf.format(input)).toBe(expected);
  });

  it.each(v.strip)("strip($input) === $expected", ({ input, expected }) => {
    expect(cpf.strip(input)).toBe(expected);
  });
});

describe("cpf — generate", () => {
  it("produces valid CPFs", () => {
    for (let i = 0; i < 500; i++) expect(cpf.isValid(cpf.generate())).toBe(true);
  });
  it("honors the formatted flag", () => {
    expect(cpf.generate({ formatted: true })).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
    expect(cpf.generate()).toMatch(/^\d{11}$/);
  });
});
