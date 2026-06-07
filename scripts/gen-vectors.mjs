// Generates the shared conformance vectors in `spec/*.json`.
//
// Correctness is established two ways so the vectors are not circular:
//   1. An INDEPENDENT re-implementation of the check-digit algorithms lives in
//      this file (separate from packages/ts). Every generated value is computed
//      here and then cross-checked against the built `br-kit` library — if they
//      ever disagree, the script throws.
//   2. Hard RFB/official anchors are asserted explicitly (e.g. the alphanumeric
//      CNPJ "12ABC34501DE" must yield check digits "35").
//
// Deterministic: same inputs in, same JSON out. Re-run after changing the suite:
//   node scripts/gen-vectors.mjs
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import * as cpf from "../packages/ts/dist/cpf.js";
import * as cnpj from "../packages/ts/dist/cnpj.js";
import * as cep from "../packages/ts/dist/cep.js";
import * as phone from "../packages/ts/dist/phone.js";
import * as currency from "../packages/ts/dist/currency.js";
import * as dates from "../packages/ts/dist/dates.js";

const SPEC_DIR = new URL("../spec/", import.meta.url);
const failures = [];
const assert = (cond, msg) => {
  if (!cond) failures.push(msg);
};

// ---- independent check-digit implementations -------------------------------
function cpfCheckDigit(digits, length) {
  let sum = 0;
  for (let i = 0; i < length; i++) sum += Number(digits[i]) * (length + 1 - i);
  const mod = sum % 11;
  return mod < 2 ? 0 : 11 - mod;
}
function cpfFromBase(base9) {
  const d1 = cpfCheckDigit(base9, 9);
  const d2 = cpfCheckDigit(base9 + d1, 10);
  return `${base9}${d1}${d2}`;
}

const DV1_W = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const DV2_W = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
function cnpjCheckDigit(chars, weights) {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) sum += (chars.charCodeAt(i) - 48) * weights[i];
  const mod = sum % 11;
  return mod < 2 ? 0 : 11 - mod;
}
function cnpjFromBase(base12) {
  const d1 = cnpjCheckDigit(base12, DV1_W);
  const d2 = cnpjCheckDigit(base12 + d1, DV2_W);
  return `${base12}${d1}${d2}`;
}

// ---- RFB / official anchors ------------------------------------------------
assert(cpfFromBase("390533447") === "39053344705", "CPF anchor 390.533.447-05");
assert(cpfFromBase("123456789") === "12345678909", "CPF anchor 123.456.789-09");
assert(cnpjFromBase("112223330001") === "11222333000181", "CNPJ numeric anchor 0001-81");
assert(cnpjFromBase("12ABC34501DE") === "12ABC34501DE35", "CNPJ alphanumeric RFB anchor DE-35");

// ---- builders that cross-check the library ---------------------------------
function validCpf(base9) {
  const full = cpfFromBase(base9);
  assert(cpf.isValid(full), `lib disagrees: cpf.isValid(${full}) should be true`);
  return full;
}
function validCnpj(base12) {
  const full = cnpjFromBase(base12);
  assert(cnpj.isValid(full), `lib disagrees: cnpj.isValid(${full}) should be true`);
  return full;
}

// Map ASCII digits to their FULLWIDTH Unicode counterparts (U+FF10..U+FF19).
// Used to pin TS↔Py parity: JS \d is ASCII-only, Python's \d is Unicode-aware —
// both implementations must REJECT these (Python uses [0-9] to match JS).
const fw = (s) =>
  [...s]
    .map((c) => (c >= "0" && c <= "9" ? String.fromCharCode(0xff10 + (c.charCodeAt(0) - 48)) : c))
    .join("");

// ---- CPF -------------------------------------------------------------------
const cpfValidBases = ["390533447", "123456789", "111444777", "529982247", "087654321", "246813579"];
const cpfValid = cpfValidBases.map(validCpf);
const cpfVectors = {
  module: "cpf",
  isValid: [
    { input: "390.533.447-05", expected: true },
    ...cpfValid.map((v) => ({ input: v, expected: true })),
    { input: "111.111.111-11", expected: false },
    { input: "000.000.000-00", expected: false },
    { input: "390.533.447-00", expected: false },
    { input: "123.456.789-00", expected: false },
    { input: "1234567890", expected: false },
    { input: "123456789012", expected: false },
    { input: "abcdefghijk", expected: false },
    { input: "390.533.447-0X", expected: false },
    { input: fw("39053344705"), expected: false },
    { input: "", expected: false },
  ],
  validateDetailed: [
    { input: "390.533.447-05", valid: true, reason: null },
    { input: "111.111.111-11", valid: false, reason: "repeated-digits" },
    { input: "000.000.000-00", valid: false, reason: "repeated-digits" },
    { input: "390.533.447-00", valid: false, reason: "invalid-check-digit" },
    { input: "1234567890", valid: false, reason: "invalid-length" },
    { input: "390.533.447-0X", valid: false, reason: "invalid-characters" },
    { input: fw("39053344705"), valid: false, reason: "invalid-characters" },
    { input: "abc", valid: false, reason: "invalid-characters" },
    { input: "", valid: false, reason: "invalid-characters" },
  ],
  format: [
    { input: "39053344705", expected: "390.533.447-05" },
    { input: "390.533.447-05", expected: "390.533.447-05" },
    { input: "12345", error: true },
    { input: "390.533.447-0X", error: true },
  ],
  strip: [
    { input: "390.533.447-05", expected: "39053344705" },
    { input: "39053344705", expected: "39053344705" },
  ],
};

// ---- CNPJ ------------------------------------------------------------------
const cnpjNumericBases = ["112223330001", "114447770001", "603918120001"];
const cnpjAlphaBases = [
  "12ABC34501DE",
  "ABCDEFGH0001",
  "BRKIT00000A1",
  "1A2B3C4D5E6F",
  "00ABCDEF1234",
  "SP00ALPHA001",
];
const cnpjNumericValid = cnpjNumericBases.map(validCnpj);
const cnpjAlphaValid = cnpjAlphaBases.map(validCnpj);
const cnpjVectors = {
  module: "cnpj",
  isValid: [
    { input: "11.222.333/0001-81", expected: true },
    ...cnpjNumericValid.map((v) => ({ input: v, expected: true })),
    { input: "12.ABC.345/01DE-35", expected: true },
    { input: "12abc34501de35", expected: true },
    ...cnpjAlphaValid.map((v) => ({ input: v, expected: true })),
    { input: "11.222.333/0001-80", expected: false },
    { input: "00.000.000/0000-00", expected: false },
    { input: "12.ABC.345/01DE-34", expected: false },
    { input: "12ABC34501DE3", expected: false },
    { input: "12ABC34501DEAB", expected: false },
    { input: "12@BC34501DE35", expected: false },
    { input: "", expected: false },
  ],
  validateDetailed: [
    { input: "11.222.333/0001-81", valid: true, reason: null },
    { input: "12.ABC.345/01DE-35", valid: true, reason: null },
    { input: "00000000000000", valid: false, reason: "repeated-digits" },
    { input: "12.ABC.345/01DE-34", valid: false, reason: "invalid-check-digit" },
    { input: "12ABC34501DE3", valid: false, reason: "invalid-length" },
    { input: "12ABC34501DEAB", valid: false, reason: "invalid-characters" },
    { input: "1$ABC34501DE35", valid: false, reason: "invalid-characters" },
  ],
  isAlphanumeric: [
    { input: "12ABC34501DE35", expected: true },
    { input: "12.ABC.345/01DE-35", expected: true },
    { input: "12abc34501de35", expected: true },
    { input: "11222333000181", expected: false },
    { input: "11.222.333/0001-81", expected: false },
    { input: "123", expected: false },
  ],
  format: [
    { input: "12ABC34501DE35", expected: "12.ABC.345/01DE-35" },
    { input: "11222333000181", expected: "11.222.333/0001-81" },
    { input: "12abc34501de35", expected: "12.ABC.345/01DE-35" },
    { input: "123", error: true },
    { input: "12ABC34501DEAB", error: true },
  ],
  strip: [
    { input: "12.ABC.345/01DE-35", expected: "12ABC34501DE35" },
    { input: "12abc34501de35", expected: "12ABC34501DE35" },
    { input: "11.222.333/0001-81", expected: "11222333000181" },
  ],
};

// ---- CEP -------------------------------------------------------------------
const cepVectors = {
  module: "cep",
  isValid: [
    { input: "01310-100", expected: true },
    { input: "01310100", expected: true },
    { input: "00000-000", expected: true },
    { input: "1310100", expected: false },
    { input: "013101000", expected: false },
    { input: "0131O-100", expected: false },
    { input: "", expected: false },
  ],
  format: [
    { input: "01310100", expected: "01310-100" },
    { input: "01310-100", expected: "01310-100" },
    { input: "1310100", error: true },
  ],
  strip: [
    { input: "01310-100", expected: "01310100" },
    { input: "01310100", expected: "01310100" },
  ],
};

// ---- PHONE -----------------------------------------------------------------
const phoneVectors = {
  module: "phone",
  isValid: [
    { input: "(11) 91234-5678", expected: true },
    { input: "11912345678", expected: true },
    { input: "1133334444", expected: true },
    { input: "(11) 3333-4444", expected: true },
    { input: "5511912345678", expected: true },
    { input: "11812345678", expected: false },
    { input: "2012345678", expected: false },
    { input: "1191234567", expected: false },
    { input: "119123456789", expected: false },
    { input: fw("11912345678"), expected: false },
    { input: "", expected: false },
  ],
  format: [
    { input: "11912345678", expected: "(11) 91234-5678" },
    { input: "1133334444", expected: "(11) 3333-4444" },
    { input: "5511912345678", expected: "(11) 91234-5678" },
    { input: "2012345678", error: true },
  ],
  strip: [
    { input: "(11) 91234-5678", expected: "11912345678" },
    { input: "+55 (11) 3333-4444", expected: "551133334444" },
  ],
  parse: [
    { input: "11912345678", expected: { ddd: "11", number: "912345678", type: "mobile" } },
    { input: "1133334444", expected: { ddd: "11", number: "33334444", type: "landline" } },
    { input: "5511912345678", expected: { ddd: "11", number: "912345678", type: "mobile" } },
    { input: "2012345678", expected: null },
    { input: "garbage", expected: null },
  ],
};

// ---- CURRENCY --------------------------------------------------------------
const currencyVectors = {
  module: "currency",
  formatBRL: [
    { input: 1234.56, expected: "R$ 1.234,56" },
    { input: 0, expected: "R$ 0,00" },
    { input: 0.5, expected: "R$ 0,50" },
    { input: 0.01, expected: "R$ 0,01" },
    { input: -1234.56, expected: "-R$ 1.234,56" },
    { input: -0.5, expected: "-R$ 0,50" },
    { input: 1000, expected: "R$ 1.000,00" },
    { input: 1000000, expected: "R$ 1.000.000,00" },
    { input: 999999.99, expected: "R$ 999.999,99" },
    { input: 1234.5, expected: "R$ 1.234,50" },
    { input: 1234.567, expected: "R$ 1.234,57" },
  ],
  parseBRL: [
    { input: "R$ 1.234,56", expected: 1234.56 },
    { input: "1.234,56", expected: 1234.56 },
    { input: "1234,56", expected: 1234.56 },
    { input: "R$1.234,56", expected: 1234.56 },
    { input: "1234.56", expected: 1234.56 },
    { input: "1.234", expected: 1234 },
    { input: "1.23", expected: 1.23 },
    { input: "R$ 0,00", expected: 0 },
    { input: "R$ 50", expected: 50 },
    { input: "-R$ 1.234,56", expected: -1234.56 },
    { input: "(R$ 1.234,56)", expected: -1234.56 },
    { input: "1.000.000,00", expected: 1000000 },
    { input: "abc", error: true },
    { input: fw("1234"), error: true },
    { input: "", error: true },
  ],
};

// ---- DATES -----------------------------------------------------------------
const datesVectors = {
  module: "dates",
  parsePtBr: [
    { input: "31/12/2025", expected: "2025-12-31" },
    { input: "31/12/25", expected: "2025-12-31" },
    { input: "31-12-2025", expected: "2025-12-31" },
    { input: "01/01/2000", expected: "2000-01-01" },
    { input: "1/1/2020", expected: "2020-01-01" },
    { input: "29/02/2024", expected: "2024-02-29" },
    { input: "05/06/70", expected: "1970-06-05" },
    { input: "05/06/69", expected: "2069-06-05" },
    { input: "29/02/2023", error: true },
    { input: "31/04/2025", error: true },
    { input: "00/01/2025", error: true },
    { input: "32/01/2025", error: true },
    { input: "13/13/2025", error: true },
    { input: `${fw("31")}/${fw("12")}/${fw("2025")}`, error: true },
    { input: "not a date", error: true },
  ],
  formatPtBr: [
    { input: "2025-12-31", expected: "31/12/2025" },
    { input: "2024-02-29", expected: "29/02/2024" },
    { input: "2000-01-01", expected: "01/01/2000" },
    { input: "2025-06-05T10:30:00", expected: "05/06/2025" },
    { input: "2025-13-01", error: true },
    { input: "2025-02-30", error: true },
    { input: "garbage", error: true },
  ],
};

// ---- cross-check every vector against the built library --------------------
function checkSimple(mod, fn, cases, compare) {
  for (const c of cases) {
    if (c.error) {
      let threw = false;
      try {
        mod[fn](c.input);
      } catch {
        threw = true;
      }
      assert(threw, `lib should throw: ${mod.name ?? ""}${fn}(${JSON.stringify(c.input)})`);
    } else {
      const got = mod[fn](c.input);
      assert(
        compare(got, c.expected),
        `lib mismatch ${fn}(${JSON.stringify(c.input)}): got ${JSON.stringify(got)} want ${JSON.stringify(c.expected)}`,
      );
    }
  }
}
const eq = (a, b) => a === b;
const deepEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

checkSimple(cpf, "isValid", cpfVectors.isValid, eq);
checkSimple(cpf, "format", cpfVectors.format, eq);
checkSimple(cpf, "strip", cpfVectors.strip, eq);
for (const c of cpfVectors.validateDetailed) {
  const r = cpf.validateDetailed(c.input);
  assert(r.valid === c.valid && r.reason === c.reason, `cpf.validateDetailed(${c.input})`);
}
checkSimple(cnpj, "isValid", cnpjVectors.isValid, eq);
checkSimple(cnpj, "isAlphanumeric", cnpjVectors.isAlphanumeric, eq);
checkSimple(cnpj, "format", cnpjVectors.format, eq);
checkSimple(cnpj, "strip", cnpjVectors.strip, eq);
for (const c of cnpjVectors.validateDetailed) {
  const r = cnpj.validateDetailed(c.input);
  assert(r.valid === c.valid && r.reason === c.reason, `cnpj.validateDetailed(${c.input})`);
}
checkSimple(cep, "isValid", cepVectors.isValid, eq);
checkSimple(cep, "format", cepVectors.format, eq);
checkSimple(cep, "strip", cepVectors.strip, eq);
checkSimple(phone, "isValid", phoneVectors.isValid, eq);
checkSimple(phone, "format", phoneVectors.format, eq);
checkSimple(phone, "strip", phoneVectors.strip, eq);
checkSimple(phone, "parse", phoneVectors.parse, deepEq);
checkSimple(currency, "formatBRL", currencyVectors.formatBRL, eq);
checkSimple(currency, "parseBRL", currencyVectors.parseBRL, eq);
checkSimple(dates, "parsePtBr", datesVectors.parsePtBr, eq);
checkSimple(dates, "formatPtBr", datesVectors.formatPtBr, eq);

if (failures.length) {
  console.error(`✗ ${failures.length} cross-check failure(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

// ---- write -----------------------------------------------------------------
const all = {
  cpf: cpfVectors,
  cnpj: cnpjVectors,
  cep: cepVectors,
  phone: phoneVectors,
  currency: currencyVectors,
  dates: datesVectors,
};
for (const [name, data] of Object.entries(all)) {
  const path = fileURLToPath(new URL(`${name}.json`, SPEC_DIR));
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}
const counts = Object.entries(all)
  .map(([n, d]) => `${n}:${Object.values(d).filter(Array.isArray).reduce((s, a) => s + a.length, 0)}`)
  .join("  ");
console.log(`✓ all cross-checks passed against built library`);
console.log(`✓ wrote 6 vector files — case counts: ${counts}`);
