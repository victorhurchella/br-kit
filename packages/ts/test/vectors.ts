import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Tests consume the shared conformance suite at the repo root so TS and Python
// are held to identical inputs/outputs.
const SPEC_DIR = new URL("../../../spec/", import.meta.url);

export interface ValueCase {
  input: string;
  expected?: unknown;
  error?: boolean;
}
export interface DetailedCase {
  input: string;
  valid: boolean;
  reason: string | null;
}

export function loadVectors<T = Record<string, unknown>>(name: string): T {
  const path = fileURLToPath(new URL(`${name}.json`, SPEC_DIR));
  return JSON.parse(readFileSync(path, "utf8")) as T;
}
