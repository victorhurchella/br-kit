"""br-kit — zero-dependency Brazilian document utils.

Mirrors the npm ``br-kit`` package one-to-one (TS camelCase ↔ Py snake_case),
with behaviour pinned by the shared conformance vectors in ``spec/``.

    >>> from br_kit import cpf, cnpj
    >>> cpf.is_valid("390.533.447-05")
    True
    >>> cnpj.is_valid("12.ABC.345/01DE-35")  # alphanumeric (2026)
    True
"""

from __future__ import annotations

from . import cep, cnpj, cpf, currency, dates, phone
from ._types import ValidationResult

__all__ = [
    "ValidationResult",
    "cep",
    "cnpj",
    "cpf",
    "currency",
    "dates",
    "phone",
]
__version__ = "0.1.0"
