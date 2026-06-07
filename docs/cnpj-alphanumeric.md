# The alphanumeric CNPJ check digit (2026)

> 🇬🇧 English. Versão em português: [`cnpj-alfanumerico.md`](./cnpj-alfanumerico.md).

Starting in **July 2026**, Brazil's Receita Federal issues **alphanumeric**
CNPJs (Normative Instruction RFB No. 2,229/2024). The change is surgical but it
breaks virtually every validator that assumes `\d{14}`:

- The **first 12 characters** (root + branch order) may contain **letters A–Z and
  digits 0–9**.
- The **last 2 characters** (check digits) remain **always numeric**.
- Total length is still **14**.

```
 0 0 . A B C . 3 4 5 / 0 1 D E - 3 5
 └────────── 12 base ──────────┘  └DV┘
       letters OR digits        numeric
```

## How the check digit is computed

It is the **same modulo-11 algorithm as always**, with a single twist: each
character is mapped to a numeric value by the official RFB rule —

> **value = character's ASCII code − 48**

This keeps digits intact (`'0'` → 0 … `'9'` → 9) and extends to letters
(`'A'` → 17, `'B'` → 18, … `'Z'` → 42). Note `'0'` is ASCII 48, so `48 − 48 = 0`;
and `'A'` is ASCII 65, so `65 − 48 = 17`.

The weights are the classic CNPJ weights:

| | weights (left to right) |
|---|---|
| **1st DV** (over the 12 base characters) | `5 4 3 2 9 8 7 6 5 4 3 2` |
| **2nd DV** (over the 12 base + the 1st DV) | `6 5 4 3 2 9 8 7 6 5 4 3 2` |

For each check digit:

1. Multiply each character's value by its weight and sum.
2. Compute `remainder = sum mod 11`.
3. `DV = 0` if `remainder < 2`; otherwise `DV = 11 − remainder`.

## Full worked example, verified

Alphanumeric CNPJ **`12.ABC.345/01DE-35`** (base `12ABC34501DE`):

### 1st check digit

| char | `1` | `2` | `A` | `B` | `C` | `3` | `4` | `5` | `0` | `1` | `D` | `E` |
|------|----|----|----|----|----|----|----|----|----|----|----|----|
| value (ASCII−48) | 1 | 2 | 17 | 18 | 19 | 3 | 4 | 5 | 0 | 1 | 20 | 21 |
| weight | 5 | 4 | 3 | 2 | 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2 |
| product | 5 | 8 | 51 | 36 | 171 | 24 | 28 | 30 | 0 | 4 | 60 | 42 |

`sum = 459` → `459 mod 11 = 8` → since `8 ≥ 2`, `1st DV = 11 − 8 = 3`.

### 2nd check digit

Now over `12ABC34501DE` **+ `3`** (the 1st DV just computed):

| char | `1` | `2` | `A` | `B` | `C` | `3` | `4` | `5` | `0` | `1` | `D` | `E` | `3` |
|------|----|----|----|----|----|----|----|----|----|----|----|----|----|
| value | 1 | 2 | 17 | 18 | 19 | 3 | 4 | 5 | 0 | 1 | 20 | 21 | 3 |
| weight | 6 | 5 | 4 | 3 | 2 | 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2 |
| product | 6 | 10 | 68 | 54 | 38 | 27 | 32 | 35 | 0 | 5 | 80 | 63 | 6 |

`sum = 424` → `424 mod 11 = 6` → since `6 ≥ 2`, `2nd DV = 11 − 6 = 5`.

**DV = `35`** ✅ — exactly what appears in `12.ABC.345/01DE-35`.

> The numeric CNPJ is just the special case where all 12 base characters are
> digits — one algorithm covers both formats with no branching.

## Reference implementation (the one `br-kit` ships)

```python
DV1 = (5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2)
DV2 = (6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2)

def value(c: str) -> int:
    return ord(c) - 48  # RFB rule

def check_digit(chars: str, weights: tuple[int, ...]) -> int:
    total = sum(value(chars[i]) * weights[i] for i in range(len(weights)))
    mod = total % 11
    return 0 if mod < 2 else 11 - mod

base = "12ABC34501DE"
d1 = check_digit(base, DV1)            # 3
d2 = check_digit(base + str(d1), DV2)  # 5
# base + "35" → "12ABC34501DE35"
```

The same logic lives in
[`packages/ts/src/cnpj.ts`](../packages/ts/src/cnpj.ts) and
[`packages/py/src/br_kit/cnpj.py`](../packages/py/src/br_kit/cnpj.py).

## Common pitfalls

- **`/\d{14}/` and `cnpj.replace(/\D/g, '')`** strip the letters out — every
  numeric regex must become `/[0-9A-Z]{12}[0-9]{2}/`.
- **Lowercase letters:** the RFB uses uppercase; normalize with `toUpperCase()`
  before validating (`br-kit` does this for you).
- **Compute the DV over characters, not over an integer:** there is no
  "convert the alphanumeric CNPJ to a number". The value is per character
  (ASCII − 48), position by position.
- **The check digits are never letters.** If either of the last two characters
  is not a digit, the document is invalid by construction.

## Source

- Normative Instruction RFB No. 2,229, of 2024-10-15.
- Serpro technical note on computing the alphanumeric CNPJ check digit.
