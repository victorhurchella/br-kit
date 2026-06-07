"""Loads the shared conformance vectors at the repo root."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

_SPEC_DIR = Path(__file__).resolve().parents[3] / "spec"


def load_vectors(name: str) -> dict[str, Any]:
    return json.loads((_SPEC_DIR / f"{name}.json").read_text(encoding="utf-8"))
