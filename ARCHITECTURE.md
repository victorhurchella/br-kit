# Arquitetura — br-kit

> Como o projeto é montado e **por que** cada decisão foi tomada. Um engenheiro
> sênior deve entender o repositório em 10 minutos.

## 1. O que é

`br-kit` é uma **biblioteca dupla, zero-dependência** (TypeScript no npm, Python
no PyPI) para validação, formatação, parsing e geração de documentos e dados
brasileiros. Não é um serviço: não há runtime, banco, fila ou rede. Isso muda o
modelo de ameaça e, consequentemente, o que "segurança como fundação" significa
aqui (ver §6).

## 2. Estrutura

```
br-kit/                         # monorepo (workspace npm + projeto Python)
├── spec/                       # ⭐ vetores de conformidade (FONTE DA VERDADE)
│   ├── *.json                  #    casos compartilhados pelas duas linguagens
│   └── manifest.json           #    mapa de funções p/ o gate de paridade
├── packages/
│   ├── ts/                     # publica "br-kit" no npm
│   │   ├── src/{cpf,cnpj,cep,phone,currency,dates}.ts + types.ts + index.ts
│   │   └── test/               # vitest; carrega ../../spec/*.json
│   └── py/                     # publica "br-kit" no PyPI (import: br_kit)
│       ├── src/br_kit/         # mesmos módulos, snake_case + _types.py
│       └── tests/              # pytest; carrega ../../spec/*.json
├── docs/                       # algoritmos documentados (PT + EN)
├── scripts/                    # gen-vectors · check-parity · check-size
└── .github/workflows/ci.yml    # lint+test (2 linguagens) + paridade + size
```

**Regra de ouro:** cada módulo é um arquivo único, **sem imports cruzados entre
módulos** (cpf não importa cnpj). A única base compartilhada é o tipo
`ValidationResult` (`types.ts` / `_types.py`), que não tem peso de runtime —
preservando tree-shaking e imports granulares.

## 3. Stack e por quê

| Item | Escolha | Por que esta, e não a alternativa |
|------|---------|------------------------------------|
| Build TS | **tsup** | gera ESM + CJS + `.d.ts`/`.d.cts` com uma config; multi-entry dá os subpaths granulares (`br-kit/cpf`) de graça. |
| Lint/format TS | **Biome v2** | um binário para lint + format; ordens de magnitude mais rápido que ESLint+Prettier e config única. |
| Testes TS | **Vitest** | nativo a ESM/TS, `it.each` consome os vetores JSON diretamente, zero config. |
| Tipos TS | **TypeScript 5.9** | última 5.x **estável e suportada pelo toolchain**. A 6.0 (recém-lançada) deprecia `baseUrl`, que o gerador de `.d.ts` do tsup injeta internamente → quebra o build de tipos. Maturidade > bleeding-edge (ver MEMORY). |
| Build Py | **hatchling** | backend PEP 517 moderno, layout `src/`, `py.typed` sem plugins. |
| Lint Py | **ruff** | lint + isort num binário, extremamente rápido; regras `E,F,I,UP,B,SIM`. |
| Tipos Py | **mypy --strict** | barra mais alta de tipagem; roda só sobre `src/`. |
| Testes Py | **pytest** | `parametrize` consome os vetores JSON, espelhando o `it.each` do TS. |
| Bundle | esbuild (só no `check-size`) | mede o budget min+gzip sem virar dependência publicada. |

**Nenhuma dependência de runtime** em nenhuma das duas linguagens. É feature, não
detalhe: é o que permite a lib entrar em qualquer projeto (e em código gerado por
IA) sem fricção e sem superfície de supply chain.

## 4. A suíte de conformidade compartilhada

`spec/*.json` é a fonte da verdade do comportamento. Ambas as suítes de teste a
carregam, então as duas implementações são submetidas aos **mesmos** inputs e
outputs. Os vetores são gerados por `scripts/gen-vectors.mjs`, que:

1. Mantém uma **reimplementação independente** dos dígitos verificadores (separada
   de `packages/ts`), para os vetores não serem circulares.
2. Crava **âncoras oficiais** (RFB/numéricas) — ex.: `12ABC34501DE` → DV `35`.
3. **Cruza** cada caso contra a lib TS já compilada antes de gravar.

A CI ainda regenera os vetores e falha se `spec/` divergir do que o código produz.

## 5. Paridade

`scripts/check-parity.mjs` lê `spec/manifest.json` e exige que **toda** função
listada exista nas duas linguagens (TS `camelCase` ⇄ Py `snake_case`). Uma função
presente em uma e ausente na outra falha a CI. Comportamento idêntico é garantido
pelos vetores; existência é garantida pela paridade.

## 6. Segurança como fundação (modelo de ameaça de uma lib)

Sem Docker, sem `.env`, sem servidor — então a fundação de segurança aqui é:

- **Supply chain:** zero dependências de runtime = zero árvore transitiva no
  consumidor. `npm audit --audit-level=high` roda na CI; lock files commitados.
- **Sem segredos:** não há nenhum no repo (nada a vazar); `.gitignore` cobre
  `.env*` por higiene preventiva.
- **Sem rede no core:** nenhuma chamada externa — nada de SSRF/exfiltração possível
  a partir da lib.
- **Pureza:** funções sem estado e sem efeitos colaterais; `generate()` é
  explicitamente marcado "apenas para testes/fixtures".
- **Corretude como segurança:** um validador incorreto é uma falha de segurança
  (aceitar documento inválido). Daí as âncoras oficiais e o cross-check duplo.

## 7. Como rodar

Ver a seção **Desenvolvimento** do [`README`](./README.md#desenvolvimento). Resumo:
`npm install && npm run build && npm test` (TS) e `pip install -e
"packages/py[dev]" && pytest packages/py` (Python); `npm run parity` para o gate
cruzado.

## 8. Versionamento

SemVer **sincronizado** entre os dois pacotes; changelog único
([`CHANGELOG.md`](./CHANGELOG.md)). Um release sobe a mesma versão no npm e no PyPI.
