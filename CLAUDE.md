# CLAUDE.md — br-kit

Contexto específico do produto. As instruções globais do time (em `~/.claude`)
continuam valendo; isto **endurece** a barra para este repositório, nunca afrouxa.

## O que é

Biblioteca **dupla, zero-dependência** (TypeScript no npm + Python no PyPI) para
documentos e dados brasileiros: CPF, CNPJ (numérico **e alfanumérico**), CEP,
phone, currency, dates. Gancho de lançamento: **CNPJ alfanumérico (julho/2026)**.

Nome do pacote nos dois registries: **`br-kit`** (Python importa `br_kit`). O
diretório do repo ainda se chama `brazil-utils` (placeholder histórico da spec);
isso não afeta os pacotes publicados.

## Decisões cravadas (não reabrir sem motivo forte)

- **Zero dependências de runtime** nas duas linguagens. Inegociável. Qualquer PR
  que adicione uma dep de runtime é rejeitado por padrão.
- **`spec/*.json` é a fonte da verdade.** Comportamento muda lá primeiro; as duas
  implementações seguem. Não editar os JSON à mão para "passar no teste" — eles
  são gerados/cruzados por `scripts/gen-vectors.mjs`.
- **Sem imports cruzados entre módulos de domínio** (cpf não importa cnpj). Só o
  tipo `ValidationResult` é compartilhado.
- **Sem rede no core.** Consultas externas (ViaCEP, BrasilAPI) → pacote futuro
  `br-kit-api`.
- **TypeScript fixado na linha 5.x** enquanto tsup injetar `baseUrl` (deprecado na
  6.0). Revisar quando tsup suportar TS 6 limpo.
- **CNPJ:** valor do caractere = `ASCII − 48`; pesos `5..2` (DV1) e `6..2` (DV2);
  letras só nos 12 primeiros, DV sempre numérico; input normalizado p/ maiúsculas.
- **currency:** formatação manual (sem `Intl`/`locale`) p/ output idêntico TS↔Py;
  arredondamento `floor(x*100 + 0.5)` p/ casar com `Math.round`.

## Baseline-ready endurecido (gates de CI, todos obrigatórios)

1. **100% dos vetores de `spec/`** passando nas duas linguagens.
2. **Paridade verde** (`scripts/check-parity.mjs`): nenhuma função em uma
   linguagem e ausente na outra.
3. **`spec/` regenerável** sem diff (CI roda `gen-vectors` e compara).
4. **Bundle TS < 8 kB min+gzip** (`npm run size`).
5. **`npm audit --audit-level=high` limpo**; **ruff + mypy --strict** limpos.
6. Lock files commitados; zero deps de runtime nas duas linguagens.

## Glossário de domínio

- **CPF** — pessoa física, 11 dígitos, 2 DV (mód. 11, pesos 10..2 / 11..2).
- **CNPJ** — pessoa jurídica, 14 caracteres, 2 DV numéricos. Desde 2026, os 12
  da base podem ser alfanuméricos (IN RFB 2.229/2024).
- **DV** — dígito verificador.
- **DDD** — código de área (2 dígitos). Móvel: 11 dígitos, nono dígito `9`. Fixo:
  10 dígitos, primeiro do assinante `2`–`5`.
- **CEP** — código postal, 8 dígitos. `br-kit` valida só estrutura.
- **linha digitável / BR Code / chave de acesso** — boleto / Pix / NF-e (v0.2).

## Convenções

- TS `camelCase`, Python `snake_case`. Fora disso, paridade total de nomes,
  parâmetros e comportamento.
- `validate*Detailed` retorna `reason` estável: `invalid-characters`,
  `invalid-length`, `repeated-digits`, `invalid-check-digit`.
- `format`/`parse` lançam (`RangeError` em TS, `ValueError` em Py) em input
  inválido; `isValid` nunca lança.
- `generate()` é **só para testes/fixtures**; nunca tratar como documento real.

## Roadmap

v0.2 boleto/pix/nfe/placa/secundários · v0.3 IE por UF + CLI · v0.4 `br-kit-mcp`
· paralelo `br-kit-api`.
