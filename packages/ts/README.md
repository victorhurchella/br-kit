# br-kit (TypeScript / JavaScript)

> Validação, formatação, parsing e geração de documentos brasileiros — **zero
> dependências**, **tree-shakeable**, pronto para o **CNPJ alfanumérico** (julho/2026).
>
> Validation, formatting, parsing and generation of Brazilian documents — **zero
> dependencies**, **tree-shakeable**, ready for the **alphanumeric CNPJ** (July 2026).

API espelhada com o pacote PyPI [`br-kit`](https://pypi.org/project/br-kit/)
(TS `camelCase` ↔ Py `snake_case`), com comportamento travado por uma suíte de
vetores de conformidade compartilhada. ESM + CJS, tipos incluídos.

## Instalação

```bash
npm install br-kit
```

## Uso

```ts
import { cpf, cnpj, currency } from "br-kit";
// ou granular: import { isValid } from "br-kit/cpf";

cpf.isValid("390.533.447-05");          // true
cpf.format("39053344705");              // "390.533.447-05"
cpf.validateDetailed("111.111.111-11"); // { valid: false, reason: "repeated-digits" }

cnpj.isValid("12.ABC.345/01DE-35");     // true  ← alfanumérico
cnpj.isAlphanumeric("12ABC34501DE35");  // true

currency.formatBRL(1234.56);            // "R$ 1.234,56"
currency.parseBRL("R$ 1.234,56");       // 1234.56
```

## API (v0.1)

| Módulo | Funções |
|---|---|
| `cpf` | `isValid` · `validateDetailed` · `format` · `strip` · `generate` |
| `cnpj` | `isValid` · `isAlphanumeric` · `validateDetailed` · `format` · `strip` · `generate` |
| `cep` | `isValid` · `format` · `strip` |
| `phone` | `isValid` · `parse` · `format` · `strip` |
| `currency` | `formatBRL` · `parseBRL` |
| `dates` | `parsePtBr` · `formatPtBr` |

**Contrato (idêntico ao pacote Python, em `camelCase`):**

- `isValid(value)` → `boolean`, **nunca lança**.
- `validateDetailed(value)` → `{ valid, reason }`. `reason` é estável:
  `invalid-characters` · `invalid-length` · `repeated-digits` · `invalid-check-digit`.
- `format(value)` / `parse(value)` **lançam `RangeError`** em input inválido
  (em Python: `ValueError`).
- `strip(value)` remove a máscara; `generate()` é **só para testes/fixtures** —
  nunca trate o resultado como documento real.

API completa e tipada (`.d.ts` incluído). Documentação do algoritmo do CNPJ
alfanumérico: [docs/cnpj-alphanumeric.md](https://github.com/victorhurchella/br-kit/blob/main/docs/cnpj-alphanumeric.md).

## ✅ Pronto para o CNPJ alfanumérico (julho/2026)

A partir de julho de 2026 a Receita Federal emite CNPJs com letras (A–Z) nos 12
primeiros caracteres (IN RFB 2.229/2024). `cnpj` valida ambos os formatos de
forma transparente — `/\d{14}/` quebra, `br-kit` não.

Licença MIT. Documentação completa e suíte de conformidade:
<https://github.com/victorhurchella/br-kit>
