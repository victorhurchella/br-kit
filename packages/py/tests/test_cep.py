from __future__ import annotations

import pytest

from _loader import load_vectors
from br_kit import cep

_V = load_vectors("cep")


@pytest.mark.parametrize("case", _V["isValid"])
def test_is_valid(case: dict) -> None:
    assert cep.is_valid(case["input"]) == case["expected"]


@pytest.mark.parametrize("case", _V["format"])
def test_format(case: dict) -> None:
    if case.get("error"):
        with pytest.raises(ValueError):
            cep.format(case["input"])
    else:
        assert cep.format(case["input"]) == case["expected"]


@pytest.mark.parametrize("case", _V["strip"])
def test_strip(case: dict) -> None:
    assert cep.strip(case["input"]) == case["expected"]
