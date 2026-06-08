# MEMORY — br-kit

> Estado vivo do projeto. Limite ~200 linhas; acima disso, mover detalhe para
> `docs/topics/<assunto>.md` e deixar só o ponteiro aqui.

## Estado atual

- **v0.1.0 (MVP) implementada e verde** nas duas linguagens (2026-06-06).
- Módulos: `cpf`, `cnpj` (numérico + alfanumérico), `cep`, `phone`, `currency`,
  `dates`. Faltam (roadmap): boleto, pix, nfe, placa, secundários.
- Testes: **TS 161 / Python 159** passando, todos dirigidos por `spec/*.json`.
- Paridade: **22 funções** presentes nas duas linguagens. Bundle: **2.293 B
  min+gzip** (28% do budget de 8 kB).
- Ainda **não publicado** no npm/PyPI; **sem git inicializado** até decisão do owner.

## Decisões e por quê

- **Nome `br-kit`** (não `brazil-utils`): `brazil-utils` está ocupado no npm
  (pacote real de 2021, v1.0.1) e `brutils` no PyPI. `br-kit` está livre nos dois,
  é marca própria e escala para `br-kit-mcp`/`br-kit-api`. Escolhido pelo owner.
- **TypeScript 5.9, não 6.0.** A 6.0 (lançada há dias) deprecia `baseUrl`; o
  gerador de `.d.ts` do tsup injeta `baseUrl` internamente → `error TS5101` no
  build de DTS. Anti-pattern "bleeding-edge com armadilha" → ficamos na 5.x.
  Reavaliar quando tsup parar de injetar `baseUrl`.
- **Biome v2** (config migrada de 1.x via `biome migrate --write`): `files.ignore`
  virou `files.includes` com negação; `organizeImports` foi para `assist.actions`.
- **Vetores não-circulares:** `gen-vectors.mjs` tem uma 2ª implementação dos DVs
  + âncoras oficiais RFB + cross-check contra a lib compilada. O bug pego no
  primeiro run foi um typo MEU no vetor de `phone.strip` (dígito a mais) — exatamente
  o que o cross-check existe para pegar.
- **currency:** formatação manual (sem `Intl`) e `floor(x*100+0.5)` no Python para
  casar bit-a-bit com `Math.round` do JS no limite do centavo.
- **`\d` em Python é Unicode, em JS é ASCII** (pego no `/hm-qa`): `cpf.is_valid`
  de dígitos fullwidth (`３９０…`) retornava `True` no Python e `false` no TS —
  divergência de paridade + aceitar lixo como válido. Fix: todos os regexes Python
  voltados a input usam `[0-9]`/`[^0-9]`, não `\d`/`\D`. Travado por vetores
  fullwidth no `spec/`. (cnpj já usava `[0-9A-Z]`, não foi afetado.)

## Âncoras de corretude (conferidas à mão, ver docs/)

- CPF válido: `390.533.447-05`, `123.456.789-09`.
- CNPJ numérico válido: `11.222.333/0001-81`.
- CNPJ **alfanumérico** válido: `12.ABC.345/01DE-35` (base `12ABC34501DE` → DV `35`,
  algoritmo IN RFB 2.229/2024). Worked example em `docs/cnpj-alfanumerico.md`.

## Gotchas para a próxima sessão

- Binários do workspace ficam em **`node_modules/.bin`** na raiz (hoist), não em
  `packages/ts/node_modules/.bin`.
- `npx biome migrate` tenta baixar um pacote `migrate`; use o binário local
  (`node_modules/.bin/biome`).
- Mudar versão de dep em `package.json` **não** rebaixa o pacote já hoisteado;
  apague `node_modules` + `package-lock.json` e reinstale.
- `npm run parity` **buildar antes** (o script de root já faz `npm run build &&`).
- mypy roda só sobre `src/` (tests usam `dict` dinâmico dos vetores).
- Toolchain local: Node 20.20, Python 3.14.5, sem `bun`/`uv`.

## Próximos passos sugeridos

1. `git init` + primeiro commit (aguardando owner).
2. Reservar `br-kit` no npm e PyPI (publicar v0.1.0 ou um placeholder).
3. v0.2: `pix.parseBrCode` (CRC16) é a feature "uau" — priorizar.
4. Post técnico do gancho "seu validador de CNPJ vai quebrar em julho".
