"""Brazilian Real (BRL) formatting and tolerant parsing. Mirrors ``currency.ts``.

Grouping/decimal formatting is done by hand (not via ``locale``) so output is
byte-for-byte identical to the TypeScript implementation and locale-independent.
"""

from __future__ import annotations

import math
import re

_THOUSANDS = re.compile(r"(?<=\d)(?=(?:\d{3})+(?!\d))")


def format_brl(value: float) -> str:
    """Format a number as Brazilian Real, e.g. ``1234.56`` -> ``"R$ 1.234,56"``."""
    if not math.isfinite(value):
        raise ValueError(f"Invalid amount: {value}")
    negative = value < 0
    # floor(x + 0.5) matches JavaScript Math.round for non-negative input,
    # keeping the two implementations bit-for-bit aligned at the cent boundary.
    cents = math.floor(abs(value) * 100 + 0.5)
    int_part = str(cents // 100)
    dec_part = f"{cents % 100:02d}"
    grouped = _THOUSANDS.sub(".", int_part)
    sign = "-" if negative else ""
    return f"{sign}R$ {grouped},{dec_part}"


def parse_brl(value: str) -> float:
    """Parse a Brazilian Real string into a number.

    Tolerant of the ``R$`` prefix, whitespace, and the common shapes
    ``1.234,56``, ``1234,56``, ``R$1.234,56``. A leading ``-`` or wrapping
    parentheses denote a negative value. ``,`` is the decimal separator and
    ``.`` groups thousands; a lone ``.`` with one or two trailing digits is
    treated as a decimal point. Raises on unparseable input.
    """
    s = value.strip()
    negative = False
    if s.startswith("-"):
        negative = True
        s = s[1:].strip()
    if re.fullmatch(r"\(.*\)", s):
        negative = True
        s = s[1:-1].strip()
    s = re.sub(r"r\$", "", s, count=1, flags=re.IGNORECASE)
    s = re.sub(r"\s", "", s)
    if s.startswith("-"):
        negative = True
        s = s[1:]

    if "," in s:
        s = s.replace(".", "").replace(",", ".")
    else:
        dot_count = s.count(".")
        # [0-9] (not \d) to match JavaScript's ASCII \d exactly (parity with currency.ts).
        if not (dot_count == 1 and re.search(r"\.[0-9]{1,2}$", s)):
            s = s.replace(".", "")

    if not re.fullmatch(r"[0-9]+(\.[0-9]+)?", s):
        raise ValueError(f"Cannot parse BRL value: {value!r}")
    n = float(s)
    return -n if negative else n
