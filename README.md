<div align="center">

# br-kit

**Validação, formatação, parsing e geração de documentos brasileiros — zero dependências, em TypeScript e Python.**

[![CI](https://github.com/victorhurchella/br-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/victorhurchella/br-kit/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/br-kit?logo=npm&color=cb3837)](https://www.npmjs.com/package/br-kit)
[![PyPI](https://img.shields.io/pypi/v/br-kit?logo=pypi&logoColor=white&color=3775a9)](https://pypi.org/project/br-kit/)
[![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![deps](https://img.shields.io/badge/runtime%20deps-0-brightgreen)](#princ%C3%ADpios)

*Pare de copiar validador de CPF do Stack Overflow — e esteja pronto para o CNPJ alfanumérico desde o dia 1.*

</div>

---

## ✅ Pronto para o CNPJ alfanumérico (julho/2026)

A partir de **julho de 2026** a Receita Federal emite CNPJs **alfanuméricos**
(IN RFB nº 2.229/2024): letras A–Z nos 12 primeiros caracteres, dígitos
verificadores ainda numéricos. **A maioria das validações em produção (`\d{14}`)
quebra.** O `br-kit` já nasce compatível:

```ts
cnpj.isValid("12.ABC.345/01DE-35");    // true  ← alfanumérico
cnpj.isValid("11.222.333/0001-81");    // true  ← numérico (mesmo algoritmo)
cnpj.isAlphanumeric("12ABC34501DE35"); // true
```

> O algoritmo do dígito verificador, conferido passo a passo, está em
> [`docs/cnpj-alfanumerico.md`](./docs/cnpj-alfanumerico.md)
> ([English](./docs/cnpj-alphanumeric.md)).

---

## Instalação

```bash
npm install br-kit      # TypeScript / JavaScript
pip install br-kit      # Python
```

Zero dependências de runtime nas duas linguagens. Nada de árvore transitiva.

## Uso

<table>
<tr><th>TypeScript</th><th>Python</th></tr>
<tr><td>

```ts
import { cpf, cnpj, currency } from "br-kit";
// granular: import { isValid } from "br-kit/cpf";

cpf.isValid("390.533.447-05");
// true
cpf.format("39053344705");
// "390.533.447-05"
cpf.validateDetailed("111.111.111-11");
// { valid: false, reason: "repeated-digits" }

cnpj.isValid("12.ABC.345/01DE-35");
// true

currency.formatBRL(1234.56);
// "R$ 1.234,56"
currency.parseBRL("R$ 1.234,56");
// 1234.56
```

</td><td>

```python
from br_kit import cpf, cnpj, currency
# granular: from br_kit.cpf import is_valid

cpf.is_valid("390.533.447-05")
# True
cpf.format("39053344705")
# "390.533.447-05"
cpf.validate_detailed("111.111.111-11")
# ValidationResult(valid=False, reason="repeated-digits")

cnpj.is_valid("12.ABC.345/01DE-35")
# True

currency.format_brl(1234.56)
# "R$ 1.234,56"
currency.parse_brl("R$ 1.234,56")
# 1234.56
```

</td></tr>
</table>

Convenção: TS em `camelCase`, Python em `snake_case`. Fora isso, **paridade total**
de nomes, parâmetros e comportamento — garantida por uma suíte de vetores
compartilhada (ver abaixo).

## Funcionalidades (v0.1)

| Módulo | Funções | Destaque |
|--------|---------|----------|
| `cpf` | `isValid` · `validateDetailed` · `format` · `strip` · `generate` | rejeita sequências repetidas; com ou sem máscara |
| `cnpj` | `isValid` · `validateDetailed` · `format` · `strip` · `generate` · `isAlphanumeric` | **numérico + alfanumérico** (DV oficial RFB) |
| `cep` | `isValid` · `format` · `strip` | validação estrutural (sem rede) |
| `phone` | `isValid` · `format` · `strip` · `parse` | regras Anatel: nono dígito, DDDs válidos, `+55` |
| `currency` | `formatBRL` · `parseBRL` | parsing tolerante (`1.234,56`, `1234,56`, `R$ …`) |
| `dates` | `formatPtBr` · `parsePtBr` | pt-BR ↔ ISO, sem timezone mágica |

`validateDetailed` retorna o **motivo** (`invalid-check-digit`, `repeated-digits`,
`invalid-length`, `invalid-characters`), não só `false`.

## Princípios

1. **Zero dependências de runtime** — entra em qualquer projeto (e em código
   gerado por IA) sem fricção.
2. **Paridade entre linguagens** — mesmos nomes, mesmo comportamento, mesma
   suíte de testes.
3. **Validar ≠ formatar ≠ gerar** — funções pequenas, puras, ortogonais.
4. **Tree-shakeable (TS) / import granular (Py)** — quem usa só CPF não carrega o resto.
5. **Sem rede no core** — consultas (ViaCEP, BrasilAPI) ficam para um pacote separado.

## Suíte de conformidade compartilhada

[`spec/`](./spec) contém os **vetores de teste em JSON** que ambas as
implementações consomem — a fonte da verdade. É um **padrão aberto de
conformidade**: qualquer lib, em qualquer linguagem, pode usá-lo para provar
compatibilidade. PRs com novos casos (especialmente CNPJs alfanuméricos reais)
são bem-vindos.

## Desenvolvimento

```bash
npm install                 # instala o workspace TS
npm run build               # compila o pacote TS (ESM + CJS + tipos)
npm run test:ts             # vitest
npm run size                # checa o budget de bundle (< 8 kB min+gzip)

python3 -m venv .venv && . .venv/bin/activate
pip install -e "packages/py[dev]"
ruff check packages/py && mypy packages/py/src && pytest packages/py

npm run parity              # gate de paridade TS ⇄ Python
```

Detalhes de arquitetura e decisões técnicas: [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Roadmap

- **v0.2:** `boleto`, `pix` (BR Code), `nfe`, `placa`, documentos secundários (PIS, CNH, RENAVAM, título).
- **v0.3:** Inscrição Estadual por UF (comunidade), CLI (`npx br-kit cpf validate …`).
- **v0.4:** MCP server (`br-kit-mcp`) expondo as validações como tools para agentes.
- **Paralelo:** `br-kit-api` (pacote separado, com rede: ViaCEP, BrasilAPI).

## Licença

[MIT](./LICENSE) © 2026 Victor Hugo

---

<div align="center">

### English

**Zero-dependency Brazilian document utils — CPF, CNPJ (alphanumeric-ready), CEP, phone, currency, dates — mirrored in TypeScript and Python.**

</div>

`br-kit` validates, formats, parses and generates Brazilian documents with **zero
runtime dependencies** in both languages. Its headline feature: it is **ready for
the alphanumeric CNPJ** that Receita Federal starts issuing in **July 2026**
(RFB IN 2,229/2024) — where naive `\d{14}` validators break.

```ts
import { cpf, cnpj } from "br-kit";
cpf.isValid("390.533.447-05");        // true
cnpj.isValid("12.ABC.345/01DE-35");   // true ← alphanumeric
```
```python
from br_kit import cpf, cnpj
cpf.is_valid("390.533.447-05")        # True
cnpj.is_valid("12.ABC.345/01DE-35")   # True ← alphanumeric
```

- **Zero runtime deps**, ESM + CJS, typed; tree-shakeable (TS) / granular imports (Py).
- **Full cross-language parity**, pinned by the shared JSON conformance suite in
  [`spec/`](./spec) — an open standard any library can adopt.
- TS in `camelCase`, Python in `snake_case`; everything else identical.

The alphanumeric CNPJ check-digit algorithm is documented, step by step, in
[`docs/cnpj-alphanumeric.md`](./docs/cnpj-alphanumeric.md). MIT licensed.
