# O dígito verificador do CNPJ alfanumérico (2026)

> 🇧🇷 Português. English version: [`cnpj-alphanumeric.md`](./cnpj-alphanumeric.md).

A partir de **julho de 2026**, a Receita Federal passa a emitir CNPJs
**alfanuméricos** (Instrução Normativa RFB nº 2.229/2024). A mudança é cirúrgica,
mas quebra praticamente toda validação que assume `\d{14}`:

- Os **12 primeiros caracteres** (raiz + ordem do estabelecimento) podem conter
  **letras A–Z e dígitos 0–9**.
- Os **2 últimos caracteres** (dígitos verificadores) continuam **sempre numéricos**.
- O comprimento total continua **14**.

```
 0 0 . A B C . 3 4 5 / 0 1 D E - 3 5
 └────────── 12 base ──────────┘  └DV┘
        letras OU dígitos        numérico
```

## Como o DV é calculado

O algoritmo é o **mesmo módulo 11 de sempre**, com uma única adaptação: cada
caractere é convertido para um valor numérico pela regra oficial da RFB —

> **valor = código ASCII do caractere − 48**

Isso preserva os dígitos (`'0'` → 0 … `'9'` → 9) e estende para letras
(`'A'` → 17, `'B'` → 18, … `'Z'` → 42). Repare que `'0'` é ASCII 48, então
`48 − 48 = 0`; e `'A'` é ASCII 65, então `65 − 48 = 17`.

Os pesos são os tradicionais do CNPJ:

| | pesos (da esquerda para a direita) |
|---|---|
| **1º DV** (sobre os 12 caracteres base) | `5 4 3 2 9 8 7 6 5 4 3 2` |
| **2º DV** (sobre os 12 base + o 1º DV) | `6 5 4 3 2 9 8 7 6 5 4 3 2` |

Para cada DV:

1. Multiplique o valor de cada caractere pelo peso correspondente e some tudo.
2. Calcule `resto = soma mod 11`.
3. `DV = 0` se `resto < 2`; caso contrário `DV = 11 − resto`.

## Exemplo completo, conferido

CNPJ alfanumérico **`12.ABC.345/01DE-35`** (base `12ABC34501DE`):

### 1º dígito verificador

| char | `1` | `2` | `A` | `B` | `C` | `3` | `4` | `5` | `0` | `1` | `D` | `E` |
|------|----|----|----|----|----|----|----|----|----|----|----|----|
| valor (ASCII−48) | 1 | 2 | 17 | 18 | 19 | 3 | 4 | 5 | 0 | 1 | 20 | 21 |
| peso | 5 | 4 | 3 | 2 | 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2 |
| produto | 5 | 8 | 51 | 36 | 171 | 24 | 28 | 30 | 0 | 4 | 60 | 42 |

`soma = 459` → `459 mod 11 = 8` → como `8 ≥ 2`, `1º DV = 11 − 8 = 3`.

### 2º dígito verificador

Agora sobre `12ABC34501DE` **+ `3`** (o 1º DV recém-calculado):

| char | `1` | `2` | `A` | `B` | `C` | `3` | `4` | `5` | `0` | `1` | `D` | `E` | `3` |
|------|----|----|----|----|----|----|----|----|----|----|----|----|----|
| valor | 1 | 2 | 17 | 18 | 19 | 3 | 4 | 5 | 0 | 1 | 20 | 21 | 3 |
| peso | 6 | 5 | 4 | 3 | 2 | 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2 |
| produto | 6 | 10 | 68 | 54 | 38 | 27 | 32 | 35 | 0 | 5 | 80 | 63 | 6 |

`soma = 424` → `424 mod 11 = 6` → como `6 ≥ 2`, `2º DV = 11 − 6 = 5`.

**DV = `35`** ✅ — exatamente o que aparece em `12.ABC.345/01DE-35`.

> O CNPJ numérico é apenas o caso particular em que os 12 caracteres base são
> todos dígitos — o mesmo algoritmo cobre os dois formatos sem ramificações.

## Implementação de referência (a do `br-kit`)

```ts
const DV1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const DV2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const value = (c: string) => c.charCodeAt(0) - 48; // regra RFB

function checkDigit(chars: string, weights: number[]): number {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) sum += value(chars[i]) * weights[i];
  const mod = sum % 11;
  return mod < 2 ? 0 : 11 - mod;
}

const base = "12ABC34501DE";
const d1 = checkDigit(base, DV1);          // 3
const d2 = checkDigit(base + d1, DV2);     // 5
// base + "35" → "12ABC34501DE35"
```

A mesma lógica, caractere a caractere, vive em
[`packages/ts/src/cnpj.ts`](../packages/ts/src/cnpj.ts) e
[`packages/py/src/br_kit/cnpj.py`](../packages/py/src/br_kit/cnpj.py).

## Armadilhas comuns

- **`/\d{14}/` e `cnpj.replace(/\D/g, '')`** descartam as letras — todo regex
  numérico precisa virar `/[0-9A-Z]{12}[0-9]{2}/`.
- **Letras minúsculas:** a RFB usa maiúsculas; normalize com `toUpperCase()`
  antes de validar (o `br-kit` faz isso).
- **Calcular o DV sobre os caracteres, não sobre um “número”:** não existe
  “converter o CNPJ alfanumérico para inteiro”. O valor é por caractere
  (ASCII − 48), posição a posição.
- **Os DVs nunca são letras.** Se algum dos dois últimos caracteres não for
  dígito, o documento é inválido por construção.

## Fonte

- Instrução Normativa RFB nº 2.229, de 15/10/2024.
- Nota técnica do Serpro sobre o cálculo do DV do CNPJ alfanumérico.
