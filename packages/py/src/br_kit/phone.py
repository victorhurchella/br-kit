"""Brazilian phone validation (Anatel rules). Mirrors ``phone.ts``."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Literal

PhoneType = Literal["mobile", "landline"]


@dataclass(frozen=True, slots=True)
class PhoneParts:
    """Parsed phone number."""

    ddd: str
    number: str
    type: PhoneType


# Valid Brazilian area codes (DDDs) per Anatel's national numbering plan.
_VALID_DDD = frozenset(
    {
        11, 12, 13, 14, 15, 16, 17, 18, 19,
        21, 22, 24, 27, 28,
        31, 32, 33, 34, 35, 37, 38,
        41, 42, 43, 44, 45, 46, 47, 48, 49,
        51, 53, 54, 55,
        61, 62, 63, 64, 65, 66, 67, 68, 69,
        71, 73, 74, 75, 77, 79,
        81, 82, 83, 84, 85, 86, 87, 88, 89,
        91, 92, 93, 94, 95, 96, 97, 98, 99,
    }
)  # fmt: skip

# [^0-9] (not \D) to match JavaScript's ASCII \D exactly (parity with phone.ts):
# Unicode digits must NOT survive strip, just as they don't in JS.
_NON_DIGIT = re.compile(r"[^0-9]")


def strip(value: str) -> str:
    """Remove every non-digit character."""
    return _NON_DIGIT.sub("", value)


def _normalize(value: str) -> str:
    digits = strip(value)
    if len(digits) in (12, 13) and digits.startswith("55"):
        return digits[2:]
    return digits


def parse(value: str) -> PhoneParts | None:
    """Parse a phone number into its parts, applying Anatel rules.

    Returns ``None`` when the number is not valid. Accepts an optional ``+55``.
    """
    digits = _normalize(value)
    if len(digits) == 11:
        if int(digits[:2]) not in _VALID_DDD or digits[2] != "9":
            return None
        return PhoneParts(ddd=digits[:2], number=digits[2:], type="mobile")
    if len(digits) == 10:
        lead = digits[2]
        if int(digits[:2]) not in _VALID_DDD or not ("2" <= lead <= "5"):
            return None
        return PhoneParts(ddd=digits[:2], number=digits[2:], type="landline")
    return None


def is_valid(value: str) -> bool:
    """Return ``True`` when ``value`` is a valid landline or mobile number."""
    return parse(value) is not None


def format(value: str) -> str:  # noqa: A001 - mirrors the cross-language API name
    """Format as ``(11) 91234-5678`` (mobile) or ``(11) 1234-5678`` (landline)."""
    parts = parse(value)
    if parts is None:
        raise ValueError(f"Invalid phone: cannot format {value!r}")
    split = 5 if parts.type == "mobile" else 4
    return f"({parts.ddd}) {parts.number[:split]}-{parts.number[split:]}"
