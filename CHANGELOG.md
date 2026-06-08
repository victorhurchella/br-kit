# Changelog

Único para os dois pacotes (npm `br-kit` + PyPI `br-kit`), com versões
**sincronizadas**. Formato baseado em [Keep a Changelog](https://keepachangelog.com),
versionamento [SemVer](https://semver.org).

## [Unreleased]

## [0.1.0] — MVP

Primeira versão. Biblioteca dupla (TypeScript + Python), zero dependências de
runtime, com paridade total de API garantida por uma suíte de vetores
compartilhada.

### Adicionado

- **`cpf`** — `isValid`, `validateDetailed`, `format`, `strip`, `generate`.
- **`cnpj`** — `isValid`, `validateDetailed`, `format`, `strip`, `generate`,
  `isAlphanumeric`. **Suporte completo ao CNPJ alfanumérico** (IN RFB 2.229/2024):
  letras A–Z nos 12 primeiros caracteres, DV numérico sobre os valores ASCII.
- **`cep`** — `isValid`, `format`, `strip` (validação estrutural).
- **`phone`** — `isValid`, `format`, `strip`, `parse` (regras Anatel: nono dígito,
  DDDs válidos, `+55` opcional).
- **`currency`** — `formatBRL`, `parseBRL` (parsing tolerante).
- **`dates`** — `formatPtBr`, `parsePtBr` (pt-BR ↔ ISO, sem timezone).
- **`spec/`** — suíte de vetores de conformidade compartilhada (padrão aberto).
- **`docs/`** — algoritmo do DV do CNPJ alfanumérico documentado (PT + EN).
- CI: lint + testes nas duas linguagens + gate de paridade + budget de bundle.

[Unreleased]: https://github.com/victorhurchella/br-kit/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/victorhurchella/br-kit/releases/tag/v0.1.0
