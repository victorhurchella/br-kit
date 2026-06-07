# `spec/` — shared conformance vectors

> 🇧🇷 A fonte da verdade do br-kit. / 🇬🇧 The br-kit source of truth.

These JSON files are the **single source of truth** for `br-kit`'s behaviour. Both
the TypeScript and Python test suites load them, so the two implementations are
held to the *exact same* inputs and outputs — that is what "parity" means here.

This suite is published as an **open conformance standard**: any Brazilian-document
library, in any language, can consume these vectors to prove compatibility. PRs that
add cases (especially edge cases and real alphanumeric CNPJs) are welcome.

## Files

| File | Module | Notable coverage |
|------|--------|------------------|
| `cpf.json` | CPF | valid/invalid, every `validateDetailed` reason |
| `cnpj.json` | CNPJ | **alphanumeric battery with RFB-anchored check digits** + numeric |
| `cep.json` | CEP | structural validation |
| `phone.json` | phone | Anatel: ninth digit, valid DDDs, `+55` |
| `currency.json` | currency | `formatBRL` / `parseBRL` (tolerant) |
| `dates.json` | dates | pt-BR ↔ ISO, leap years, 2-digit years |
| `manifest.json` | — | parity gate: function ↔ name map for both languages |

## Shape

Each file is `{ "module": string, "<fn>": Case[] }`. A `Case` is either an
expectation or an error expectation:

```jsonc
{ "input": "39053344705", "expected": "390.533.447-05" } // value expectation
{ "input": "12345",       "error": true }                // must throw / raise
// validateDetailed cases carry { valid, reason } instead of expected
```

## Regenerating / validating

`spec/*.json` is produced by `scripts/gen-vectors.mjs`, which holds an
**independent** re-implementation of the check-digit algorithms, asserts the
official RFB/numeric anchors, and cross-checks every case against the built
library before writing. To regenerate after editing the suite:

```bash
npm run build && node scripts/gen-vectors.mjs
```

The anchors that pin correctness (not circular):

- CPF `390.533.447-05` and `123.456.789-09`
- CNPJ numeric `11.222.333/0001-81`
- CNPJ **alphanumeric** `12.ABC.345/01DE-35` (RFB IN 2.229/2024 algorithm)
