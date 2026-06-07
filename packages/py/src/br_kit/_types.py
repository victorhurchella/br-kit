"""Shared, dependency-free foundation for every module.

Mirrors ``packages/ts/src/types.ts``. Modules never import one another — only
this tiny shared type — so granular imports stay cheap and independent.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class ValidationResult:
    """Result of a ``validate_detailed`` call.

    When ``valid`` is ``True``, ``reason`` is ``None``; when ``False``, ``reason``
    carries a stable, machine-readable code.
    """

    valid: bool
    reason: str | None = None
