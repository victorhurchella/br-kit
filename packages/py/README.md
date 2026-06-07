# br-kit (Python)

> Validação, formatação, parsing e geração de documentos brasileiros — **zero
> dependências**, pronto para o **CNPJ alfanumérico** (julho/2026).
>
> Validation, formatting, parsing and generation of Brazilian documents — **zero
> dependencies**, ready for the **alphanumeric CNPJ** (July 2026).

API espelhada com o pacote npm [`br-kit`](https://www.npmjs.com/package/br-kit)
(TS `camelCase` ↔ Py `snake_case`), com comportamento travado por uma suíte de
vetores de conformidade compartilhada.

## Instalação

```bash
pip install br-kit
```

## Uso

```python
from br_kit import cpf, cnpj, currency

cpf.is_valid("390.533.447-05")            # True
cpf.format("39053344705")                 # "390.533.447-05"
cpf.validate_detailed("111.111.111-11")   # ValidationResult(valid=False, reason="repeated-digits")

cnpj.is_valid("12.ABC.345/01DE-35")       # True  ← alfanumérico
cnpj.is_alphanumeric("12ABC34501DE35")    # True

currency.format_brl(1234.56)              # "R$ 1.234,56"
currency.parse_brl("R$ 1.234,56")         # 1234.56
```

Import granular: `from br_kit.cpf import is_valid`.

## Módulos (v0.1)

`cpf` · `cnpj` (numérico + alfanumérico) · `cep` · `phone` · `currency` · `dates`

## ✅ Pronto para o CNPJ alfanumérico (julho/2026)

A partir de julho de 2026 a Receita Federal emite CNPJs com letras (A–Z) nos 12
primeiros caracteres (IN RFB 2.229/2024). `br-kit.cnpj` valida ambos os formatos
de forma transparente — `\d{14}` quebra, `br-kit` não.

Licença MIT. Documentação completa e suíte de conformidade:
<https://github.com/victorhugo/br-kit>
