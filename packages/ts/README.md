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

## Módulos (v0.1)

`cpf` · `cnpj` (numérico + alfanumérico) · `cep` · `phone` · `currency` · `dates`

## ✅ Pronto para o CNPJ alfanumérico (julho/2026)

A partir de julho de 2026 a Receita Federal emite CNPJs com letras (A–Z) nos 12
primeiros caracteres (IN RFB 2.229/2024). `cnpj` valida ambos os formatos de
forma transparente — `/\d{14}/` quebra, `br-kit` não.

Licença MIT. Documentação completa e suíte de conformidade:
<https://github.com/victorhugo/br-kit>
