from __future__ import annotations

import re

import pytest

from _loader import load_vectors
from br_kit import cpf

_V = load_vectors("cpf")


@pytest.mark.parametrize("case", _V["isValid"])
def test_is_valid(case: dict) -> None:
    assert cpf.is_valid(case["input"]) == case["expected"]


@pytest.mark.parametrize("case", _V["validateDetailed"])
def test_validate_detailed(case: dict) -> None:
    result = cpf.validate_detailed(case["input"])
    assert result.valid == case["valid"]
    assert result.reason == case["reason"]


@pytest.mark.parametrize("case", _V["format"])
def test_format(case: dict) -> None:
    if case.get("error"):
        with pytest.raises(ValueError):
            cpf.format(case["input"])
    else:
        assert cpf.format(case["input"]) == case["expected"]


@pytest.mark.parametrize("case", _V["strip"])
def test_strip(case: dict) -> None:
    assert cpf.strip(case["input"]) == case["expected"]


def test_generate() -> None:
    for _ in range(500):
        assert cpf.is_valid(cpf.generate())
    assert re.fullmatch(r"\d{3}\.\d{3}\.\d{3}-\d{2}", cpf.generate(formatted=True))
    assert re.fullmatch(r"\d{11}", cpf.generate())
