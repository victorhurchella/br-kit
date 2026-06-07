from __future__ import annotations

import math

import pytest

from _loader import load_vectors
from br_kit import currency

_V = load_vectors("currency")


@pytest.mark.parametrize("case", _V["formatBRL"])
def test_format_brl(case: dict) -> None:
    assert currency.format_brl(case["input"]) == case["expected"]


@pytest.mark.parametrize("case", _V["parseBRL"])
def test_parse_brl(case: dict) -> None:
    if case.get("error"):
        with pytest.raises(ValueError):
            currency.parse_brl(case["input"])
    else:
        assert currency.parse_brl(case["input"]) == case["expected"]


def test_format_brl_rejects_non_finite() -> None:
    with pytest.raises(ValueError):
        currency.format_brl(math.nan)
    with pytest.raises(ValueError):
        currency.format_brl(math.inf)
