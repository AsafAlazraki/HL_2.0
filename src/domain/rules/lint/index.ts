/* ============================================================
   Lint engine — public barrel, exactly the REVIEW_SPEC.md API.
   ============================================================ */

export type { FindingSeverity, LintFinding, LintFix } from './types'
export { lintProject } from './lint'
/* `CatalogueWrites` joins the barrel because the caller now hands the
   writes in: the old `applyLintFix(fix)` reached for the store itself. */
export { applyLintFix, type CatalogueWrites } from './applyFix'
