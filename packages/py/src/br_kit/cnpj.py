"""CNPJ validation with full alphanumeric support. Mirrors ``cnpj.ts``.

Supports both the legacy numeric format and the 2026 alphanumeric format
(IN RFB 2.229/2024): A-Z allowed in the 12 base characters, the two check
digits always numeric, computed over each character's ASCII value minus 48.
"""

from __future__ import annotations

import random
import re

from ._types import ValidationResult

CNPJ_LENGTH = 14
_MASK = re.compile(r"[.\-/\s]")
_BASE_CHARS = re.compile(r"^[0-9A-Z]{12}$")
_DV_CHARS = re.compile(r"^[0-9]{2}$")
_ALL_SAME = re.compile(r"^(.)\1{13}$")

# Official RFB weights (modulo 11).
_DV1_WEIGHTS = (5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2)
_DV2_WEIGHTS = (6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2)

_ALPHANUM = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
_NUMERIC = "0123456789"


def strip(value: str) -> str:
    """Remove mask characters and upper-case letters, keeping base + check digits."""
    return _MASK.sub("", value).upper()


def _char_value(char: str) -> int:
    # RFB alphanumeric rule: numeric value is the ASCII code minus 48
    # ('0' -> 0 ... '9' -> 9, 'A' -> 17 ... 'Z' -> 42).
    return ord(char) - 48


def _check_digit(chars: str, weights: tuple[int, ...]) -> int:
    total = sum(_char_value(chars[i]) * weights[i] for i in range(len(weights)))
    mod = total % 11
    return 0 if mod < 2 else 11 - mod


def validate_detailed(value: str) -> ValidationResult:
    """Validate a CNPJ (numeric or alphanumeric) and explain *why* it is invalid.

    Accepts masked or unmasked, upper- or lower-case input.
    """
    cleaned = strip(value)
    if len(cleaned) != CNPJ_LENGTH:
        return ValidationResult(False, "invalid-length")
    base, dv = cleaned[:12], cleaned[12:]
    if not _BASE_CHARS.match(base) or not _DV_CHARS.match(dv):
        return ValidationResult(False, "invalid-characters")
    if _ALL_SAME.match(cleaned):
        return ValidationResult(False, "repeated-digits")
    d1 = _check_digit(base, _DV1_WEIGHTS)
    d2 = _check_digit(f"{base}{d1}", _DV2_WEIGHTS)
    if d1 != int(dv[0]) or d2 != int(dv[1]):
        return ValidationResult(False, "invalid-check-digit")
    return ValidationResult(True, None)


def is_valid(value: str) -> bool:
    """Return ``True`` when ``value`` is a valid CNPJ (numeric or alphanumeric)."""
    return validate_detailed(value).valid


def is_alphanumeric(value: str) -> bool:
    """Return ``True`` when at least one letter appears in the 12 base characters.

    Structural check only; it does not validate the check digits.
    """
    cleaned = strip(value)
    if len(cleaned) != CNPJ_LENGTH:
        return False
    return any("A" <= c <= "Z" for c in cleaned[:12])


def format(value: str) -> str:  # noqa: A001 - mirrors the cross-language API name
    """Format 14 characters as ``00.000.000/0000-00``. Raises on malformed input."""
    c = strip(value)
    if len(c) != CNPJ_LENGTH or not _BASE_CHARS.match(c[:12]) or not _DV_CHARS.match(c[12:]):
        raise ValueError(f"Invalid CNPJ: cannot format {value!r}")
    return f"{c[:2]}.{c[2:5]}.{c[5:8]}/{c[8:12]}-{c[12:]}"


def generate(*, formatted: bool = False, alphanumeric: bool = False) -> str:
    """Generate a syntactically valid CNPJ. **For tests and fixtures only.**

    Pass ``alphanumeric=True`` to exercise the 2026 format.
    """
    pool = _ALPHANUM if alphanumeric else _NUMERIC
    base = "".join(random.choice(pool) for _ in range(12))
    if len(set(base)) == 1:
        base = ("1" if base[0] == "0" else "0") + base[1:]
    d1 = _check_digit(base, _DV1_WEIGHTS)
    full = f"{base}{d1}{_check_digit(f'{base}{d1}', _DV2_WEIGHTS)}"
    return format(full) if formatted else full
