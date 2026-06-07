"""CEP (postal code) structural validation and formatting. Mirrors ``cep.ts``."""

from __future__ import annotations

import re

_MASK = re.compile(r"[.\-\s]")
# [0-9] (not \d) to match JavaScript's ASCII \d exactly (parity with cep.ts).
_ONLY_DIGITS = re.compile(r"^[0-9]{8}$")


def strip(value: str) -> str:
    """Remove mask characters (dot, hyphen, whitespace), keeping only digits."""
    return _MASK.sub("", value)


def is_valid(value: str) -> bool:
    """Structural validation only: a CEP is eight digits.

    Existence of the postal code is out of scope (no network calls in the core).
    """
    return bool(_ONLY_DIGITS.match(strip(value)))


def format(value: str) -> str:  # noqa: A001 - mirrors the cross-language API name
    """Format eight digits as ``00000-000``. Raises on a non-8-digit input."""
    c = strip(value)
    if not _ONLY_DIGITS.match(c):
        raise ValueError(f"Invalid CEP: cannot format {value!r}")
    return f"{c[:5]}-{c[5:]}"
