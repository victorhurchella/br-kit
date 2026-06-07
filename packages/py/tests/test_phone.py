from __future__ import annotations

import pytest

from _loader import load_vectors
from br_kit import phone

_V = load_vectors("phone")


@pytest.mark.parametrize("case", _V["isValid"])
def test_is_valid(case: dict) -> None:
    assert phone.is_valid(case["input"]) == case["expected"]


@pytest.mark.parametrize("case", _V["format"])
def test_format(case: dict) -> None:
    if case.get("error"):
        with pytest.raises(ValueError):
            phone.format(case["input"])
    else:
        assert phone.format(case["input"]) == case["expected"]


@pytest.mark.parametrize("case", _V["strip"])
def test_strip(case: dict) -> None:
    assert phone.strip(case["input"]) == case["expected"]


@pytest.mark.parametrize("case", _V["parse"])
def test_parse(case: dict) -> None:
    result = phone.parse(case["input"])
    expected = case["expected"]
    if expected is None:
        assert result is None
    else:
        assert result is not None
        assert result.ddd == expected["ddd"]
        assert result.number == expected["number"]
        assert result.type == expected["type"]
