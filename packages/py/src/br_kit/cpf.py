"""CPF validation, formatting, parsing and generation. Mirrors ``cpf.ts``."""

from __future__ import annotations

import random
import re

from ._types import ValidationResult

CPF_LENGTH = 11
# [0-9] (not \d) so Python's Unicode-aware regex matches JavaScript's ASCII \d
# exactly — otherwise fullwidth/other Unicode digits would diverge across languages.
_ONLY_DIGITS = re.compile(r"^[0-9]+$")
_MASK = re.compile(r"[.\-\s]")
_REPEATED = re.compile(r"^([0-9])\1{10}$")


def strip(value: str) -> str:
    """Remove mask characters (dots, hyphen, whitespace), keeping only digits."""
    return _MASK.sub("", value)


def _check_digit(digits: str, length: int) -> int:
    total = sum(int(digits[i]) * (length + 1 - i) for i in range(length))
    mod = total % 11
    return 0 if mod < 2 else 11 - mod


def validate_detailed(value: str) -> ValidationResult:
    """Validate a CPF and explain *why* it is invalid.

    Accepts values with or without the ``000.000.000-00`` mask.
    """
    cleaned = strip(value)
    if not cleaned or not _ONLY_DIGITS.match(cleaned):
        return ValidationResult(False, "invalid-characters")
    if len(cleaned) != CPF_LENGTH:
        return ValidationResult(False, "invalid-length")
    if _REPEATED.match(cleaned):
        return ValidationResult(False, "repeated-digits")
    d1 = _check_digit(cleaned, 9)
    d2 = _check_digit(cleaned, 10)
    if d1 != int(cleaned[9]) or d2 != int(cleaned[10]):
        return ValidationResult(False, "invalid-check-digit")
    return ValidationResult(True, None)


def is_valid(value: str) -> bool:
    """Return ``True`` when ``value`` is a valid CPF with correct check digits."""
    return validate_detailed(value).valid


def format(value: str) -> str:  # noqa: A001 - mirrors the cross-language API name
    """Format 11 digits as ``000.000.000-00``. Raises on a non-11-digit input."""
    c = strip(value)
    if len(c) != CPF_LENGTH or not _ONLY_DIGITS.match(c):
        raise ValueError(f"Invalid CPF: cannot format {value!r}")
    return f"{c[:3]}.{c[3:6]}.{c[6:9]}-{c[9:]}"


def generate(*, formatted: bool = False) -> str:
    """Generate a syntactically valid CPF. **For tests and fixtures only.**"""
    base = "".join(str(random.randint(0, 9)) for _ in range(9))
    if len(set(base)) == 1:
        base = base[:8] + str((int(base[8]) + 1) % 10)
    d1 = _check_digit(base, 9)
    full = f"{base}{d1}{_check_digit(f'{base}{d1}', 10)}"
    return format(full) if formatted else full
