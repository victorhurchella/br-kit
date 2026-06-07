"""pt-BR date parsing and formatting. Mirrors ``dates.ts``.

No timezone magic: pure string transforms between ``dd/mm/yyyy`` and ISO
``yyyy-mm-dd``. A ``date``/``datetime`` is accepted as a convenience for
``format_pt_br``.
"""

from __future__ import annotations

import re
from datetime import date

# [0-9] (not \d) to match JavaScript's ASCII \d exactly (parity with dates.ts).
_PT_BR = re.compile(r"^([0-9]{1,2})[/\-.]([0-9]{1,2})[/\-.]([0-9]{2}|[0-9]{4})$")
_ISO = re.compile(r"^([0-9]{4})-([0-9]{2})-([0-9]{2})(?:[T ].*)?$")
_DAYS_IN_MONTH = (31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31)


def _is_leap_year(year: int) -> bool:
    return (year % 4 == 0 and year % 100 != 0) or year % 400 == 0


def _assert_valid_date(year: int, month: int, day: int, source: str) -> None:
    if not 1 <= month <= 12:
        raise ValueError(f"Invalid date: {source!r}")
    max_day = 29 if (month == 2 and _is_leap_year(year)) else _DAYS_IN_MONTH[month - 1]
    if not 1 <= day <= max_day:
        raise ValueError(f"Invalid date: {source!r}")


def parse_pt_br(value: str) -> str:
    """Parse a pt-BR date string into an ISO date ``yyyy-mm-dd``.

    Accepts ``/``, ``-`` or ``.`` separators and 2- or 4-digit years
    (``00``-``69`` -> ``2000``-``2069``, ``70``-``99`` -> ``1970``-``1999``).
    Validates the calendar day, including leap years. Raises on a malformed
    or impossible date.
    """
    match = _PT_BR.match(value.strip())
    if not match:
        raise ValueError(f"Cannot parse pt-BR date: {value!r}")
    day = int(match.group(1))
    month = int(match.group(2))
    raw_year = match.group(3)
    year = int(raw_year)
    if len(raw_year) == 2:
        year = 2000 + year if year <= 69 else 1900 + year
    _assert_valid_date(year, month, day, value)
    return f"{year:04d}-{month:02d}-{day:02d}"


def format_pt_br(value: str | date) -> str:
    """Format an ISO date string or a ``date``/``datetime`` as pt-BR ``dd/mm/yyyy``.

    Raises on a malformed or impossible date.
    """
    if isinstance(value, date):
        # datetime is a subclass of date; both expose year/month/day.
        year, month, day = value.year, value.month, value.day
    else:
        match = _ISO.match(value.strip())
        if not match:
            raise ValueError(f"Cannot format date: {value!r}")
        year, month, day = int(match.group(1)), int(match.group(2)), int(match.group(3))
    _assert_valid_date(year, month, day, str(value))
    return f"{day:02d}/{month:02d}/{year:04d}"
