from __future__ import annotations

from datetime import date

import pytest

from _loader import load_vectors
from br_kit import dates

_V = load_vectors("dates")


@pytest.mark.parametrize("case", _V["parsePtBr"])
def test_parse_pt_br(case: dict) -> None:
    if case.get("error"):
        with pytest.raises(ValueError):
            dates.parse_pt_br(case["input"])
    else:
        assert dates.parse_pt_br(case["input"]) == case["expected"]


@pytest.mark.parametrize("case", _V["formatPtBr"])
def test_format_pt_br(case: dict) -> None:
    if case.get("error"):
        with pytest.raises(ValueError):
            dates.format_pt_br(case["input"])
    else:
        assert dates.format_pt_br(case["input"]) == case["expected"]


def test_format_pt_br_accepts_date() -> None:
    assert dates.format_pt_br(date(2025, 12, 31)) == "31/12/2025"
