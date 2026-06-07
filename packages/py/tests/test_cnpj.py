from __future__ import annotations

import re

import pytest

from _loader import load_vectors
from br_kit import cnpj

_V = load_vectors("cnpj")


@pytest.mark.parametrize("case", _V["isValid"])
def test_is_valid(case: dict) -> None:
    assert cnpj.is_valid(case["input"]) == case["expected"]


@pytest.mark.parametrize("case", _V["validateDetailed"])
def test_validate_detailed(case: dict) -> None:
    result = cnpj.validate_detailed(case["input"])
    assert result.valid == case["valid"]
    assert result.reason == case["reason"]


@pytest.mark.parametrize("case", _V["isAlphanumeric"])
def test_is_alphanumeric(case: dict) -> None:
    assert cnpj.is_alphanumeric(case["input"]) == case["expected"]


@pytest.mark.parametrize("case", _V["format"])
def test_format(case: dict) -> None:
    if case.get("error"):
        with pytest.raises(ValueError):
            cnpj.format(case["input"])
    else:
        assert cnpj.format(case["input"]) == case["expected"]


@pytest.mark.parametrize("case", _V["strip"])
def test_strip(case: dict) -> None:
    assert cnpj.strip(case["input"]) == case["expected"]


def test_generate_numeric() -> None:
    for _ in range(500):
        assert cnpj.is_valid(cnpj.generate())


def test_generate_alphanumeric() -> None:
    saw_letter = False
    for _ in range(500):
        value = cnpj.generate(alphanumeric=True)
        assert cnpj.is_valid(value)
        if re.search(r"[A-Z]", value[:12]):
            saw_letter = True
    assert saw_letter
    assert re.fullmatch(r"\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}", cnpj.generate(formatted=True))
