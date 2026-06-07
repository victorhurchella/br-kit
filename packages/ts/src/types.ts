/**
 * Shared, type-only foundation for every module. Erased at build time, so it
 * adds zero runtime weight and does not break the "no cross-module imports"
 * rule — modules never depend on each other, only on these types.
 */

/**
 * Result of a `validateDetailed` call. When `valid` is `true`, `reason` is
 * always `null`; when `false`, `reason` carries a stable, machine-readable code.
 */
export type ValidationResult<Reason extends string = string> =
  | { valid: true; reason: null }
  | { valid: false; reason: Reason };
