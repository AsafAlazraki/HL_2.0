/* ============================================================
   THE ENGINE, AT ONE DOOR.

   WHAT THIS IS. `src/domain` is the whole of HelmLogic's reasoning —
   the solver, the rule engine, fitment, the price ladders, the quote
   derivations, the readings every screen draws from — and it is
   pure: no React, no store, no DOM, no Dexie (`tools/check.ts`
   enforces it). This file is the list of what it answers, so a
   screen, a store or a future adapter can see the surface in one
   read instead of by grepping 150 files.

   WHAT "CURATED" MEANS HERE, because a barrel that re-exports
   everything is not a surface, it is a second copy of the folder
   listing. Published below is the DOOR of each area — the function
   you call to get an answer, and the types you need to hold the
   answer. A helper that exists to serve one area is reached by its
   own path, exactly as it is today: `@/domain/rules/sentence/drop`,
   `@/domain/catalogue/table/sections`, `@/domain/modules/writeCaps`.
   Nothing is hidden and nothing is renamed; a name absent here is a
   name that has not yet been asked for from outside its own area.

   THREE WORDS ARE DELIBERATELY NOT PUBLISHED, because two areas
   answer different questions with the same word and a barrel that
   picked one would be deciding what the word means for the whole
   app:

     · `buildGroups` — the review's rollup groups
       (`@/domain/rules/review/rollup`) and the grid's row groups
       (`@/domain/catalogue/table/grouping`).
     · `optionsOf` — the solver's remaining values for a field
       (`@/domain/rules/configure`) and the register's browse options
       (`@/domain/catalogue/search`).
     · `Candidate` and `Verdict` — the contract owns both
       (`model/offer.ts`, and they are published here through the
       contract); discovery's own `Candidate` and `Verdict` are a
       different pair of ideas and stay at
       `@/domain/rules/constraints/discover`.

   IMPORTING FROM HERE IS NEVER REQUIRED. Every path this file
   re-exports from still works, and inside `src/domain` a module
   imports its neighbour directly — a barrel between two files of one
   engine is a cycle waiting to happen.
   ============================================================ */

/* ---------------------------------------------------------- */
/* The contract                                               */
/* ---------------------------------------------------------- */

/* Every type in the app, and the small functions that belong to the
   shapes themselves (`makeCtx`, `isImageValue`, `displayFieldOf`,
   `PAIR_FIELDS`, `standingOf`). */
export * from './model'

/* ---------------------------------------------------------- */
/* Identity, figures, marks                                   */
/* ---------------------------------------------------------- */

export { newId, nowIso } from './id'
export { money } from './money'
export { markOf } from './mark'

/** THE ONE ORDERING, shared by the solver and the rule engine so a
 *  preview and a run can never disagree — and measurement-aware, so
 *  "10 HP" is ten horsepower rather than a word beginning with 1. */
export { compareValues, isEmptyValue, asBoolean } from './compare'
export type { CompareOutcome } from './compare'

/* ---------------------------------------------------------- */
/* Rules — the engine, the solver, formulas, the linter        */
/* ---------------------------------------------------------- */

export {
  runRule,
  validateRule,
  nodeLabel,
  MAX_PAIR_STEPS,
  MAX_LOOP_ITERATIONS,
} from './rules/engine'
export type {
  RuleRunContext,
  RuleRunResult,
  RuleIssue,
  RuleView,
  RunPair,
  RunTrace,
  PendingEffect,
  RowRef,
} from './rules/engine'

export { solve, explain, warningsFor, describeChange, compare, isBlank } from './rules/configure'
export type { ConfigureInput, SolveState, ValueWarning, FieldDomain } from './rules/configure'

export { compileFormula, validateFormula, FORMULA_FUNCTIONS, FormulaError } from './rules/formula'
export type { CompiledFormula, ValidationResult } from './rules/formula'

export { lintProject, applyLintFix } from './rules/lint'
export type { LintFinding, LintFix, FindingSeverity, CatalogueWrites } from './rules/lint'

/* The sentence a rule is read as. The editor's own pieces — the
   plate, the field menus, the drop targets — stay at
   `@/domain/rules/sentence/*`. */
export {
  describeClause,
  describeGroup,
  describeAction,
  formatCell,
} from './rules/sentence/describe'

/* ---------------------------------------------------------- */
/* Constraints — the rules a person writes, and the ones the  */
/* price file already follows                                 */
/* ---------------------------------------------------------- */

export {
  getConstraints,
  getConstraint,
  loadConstraints,
  createConstraint,
  putConstraint,
  setConstraintEnabled,
  registerConstraints,
  clearConstraints,
  deleteConstraint,
  restoreConstraint,
} from './rules/constraints/constraintDefs'
export type {
  PutConstraint,
  RemoveConstraint,
  NewConstraint,
} from './rules/constraints/constraintDefs'

/** Reading the file for the rules it already obeys. An observed
 *  pattern may never be stored as 'block' — `adopt.ts` owns that rule
 *  and every seam applies it. */
export { discover, relatedPairs } from './rules/constraints/discover'
export type { DiscoveryReport, DiscoveryProject } from './rules/constraints/discover'
export {
  adoptObserved,
  sanitiseObserved,
  sanitiseAllObserved,
  isObservedConstraint,
  OBSERVED_SOURCE,
  OBSERVED_ID_PREFIX,
  OBSERVED_SEVERITY,
} from './rules/adopt'
export type { ObservedPattern, Adoption } from './rules/adopt'

/** The measured rates the workbook's own rules hold at, carried as
 *  data with their numerator and denominator. */
export { WORKBOOK_RULES } from './rules/constraints/workbookRules'

/** What a rule run adds up to, for the review register. */
export { buildLedger, collapseWhy, resolveOpenRule } from './rules/review/rollup'
export type { Roll, RollGroup, RuleRow } from './rules/review/rollup'

/* ---------------------------------------------------------- */
/* Fitment — what goes with what, and why                     */
/* ---------------------------------------------------------- */

export { readFit, compileFit, fitSay, describeFit, fitTrouble } from './fitment/fit'
export type { FitDraft, FitCompiled, FitSay, FitTrouble } from './fitment/fit'

export { readFanOut, readRoles } from './fitment/reading'
export type { Fan, FanReading, RoleSpread } from './fitment/reading'

export { readRig, readStarters } from './fitment/rigReading'
export type { RigReading, RigInput, RigOption, RigSlot } from './fitment/rigReading'

export {
  TRAILER_FITMENT,
  selectPartners,
  readCatalogue,
  readMarques,
  readPartnerRows,
} from './fitment/trailerFitment'
export type { FitmentResult, FitmentScope, CatalogueReading } from './fitment/trailerFitment'

/* ---------------------------------------------------------- */
/* Prices — the declared ladder, and the acts on it            */
/* ---------------------------------------------------------- */

export {
  TABLE_LEVEL_KEY,
  levelKeyOf,
  buildLevelModel,
  levelColumns,
  standingsAt,
  tallyAt,
  planSet,
  planReset,
  planLines,
  describeDone,
} from './pricing/levels'
export type {
  LevelModel,
  LevelNode,
  LevelColumn,
  SetPlan,
  PlanLine,
  RowStanding,
  Tally,
} from './pricing/levels'

/* ---------------------------------------------------------- */
/* The quote — every derivation over a document                */
/* ---------------------------------------------------------- */

/* THE QUOTE ENGINE ITSELF — minting a quote from a view, freezing a
   customer, the twenty-five commands with their inverses — is
   `@/domain/quote/freeze` and `@/domain/quote/commands`. It is not
   published here yet: it lands with its own barrel, and a door named
   before it is built is a door that has to be renamed. What is below
   is the reading half, which is settled. */

export {
  priceLevelsFor,
  isPriced,
  freezeLevels,
  priceAtLevel,
  quoteLevelChoices,
  repricedAt,
  defaultLevelKey,
  parseAmount,
  signedMoney,
  isCostColumn,
  rungIncludes,
} from './quote/pricing'
export type { PricedAt, QuoteLevelChoice, ChargeableLine } from './quote/pricing'

export {
  quoteTotals,
  lineAmount,
  linesOf,
  looseLines,
  issueBlockers,
  isEmptyQuote,
  needsOverrideReason,
  unexplainedOverrides,
  adjustmentSign,
} from './quote/totals'
export type { QuoteTotals, LineAmount } from './quote/totals'

export {
  buildSteps,
  reachOf,
  firstOpenStep,
  stepAfter,
  stepBefore,
  decidedCount,
  SUBJECT_STEP,
  HANDOVER_STEP,
} from './quote/steps'
export type { BuildStep, StepState, StepReach } from './quote/steps'

export { orderBands, stateSay, BANDS } from './quote/bands'
export type { Band, BandId, BandSpec, BandTable } from './quote/bands'

export { fitmentCascade, cascadeOfConflict } from './quote/cascade'
export { levelConflict, optionConflict, deltaSay } from './quote/conflict'
export type { Conflict, ConflictLine, Fix } from './quote/conflict'

export { quoteDoors, matchSubjects, subjectsIn, flowPreview } from './quote/start'
export type { QuoteDoor, SubjectList, FlowPreview } from './quote/start'

export { placeRules, subjectVerdict } from './quote/subjectRules'
export type { SubjectVerdict, SubjectNarrowing, PlaceRules } from './quote/subjectRules'

export { colourwayOf, isColourway, splitVariant } from './quote/colourway'
export type { Colourway } from './quote/colourway'
export { marqueOf } from './quote/marque'
export type { Lockup } from './quote/marque'
export { distinguishingFacts, reduceToDifference } from './quote/distinguish'
export type { Fact, ShownFact } from './quote/distinguish'
export { localDay, localDayOf } from './quote/day'

/* ---------------------------------------------------------- */
/* The catalogue — pages, the grid, search, curation           */
/* ---------------------------------------------------------- */

export {
  createViewFor,
  bestAnsweredRow,
  suggestRule,
  describeRule,
  summariseRule,
  sellableRows,
  sellableTables,
  sellableRowCount,
  countDiscontinued,
  heldBackSentence,
  retiredTablesSentence,
  relatedRows,
  readPairs,
  joinRefFor,
  findJoinTable,
  makeEngine,
} from './catalogue/views'
export type { RelatedRow, JoinRef, PairInfo, BestAnswered } from './catalogue/views'

export {
  applyView,
  distinctValues,
  resolveKey,
  coerceCellText,
  cellToText,
} from './catalogue/table/core'
export type { ViewRow, SortState, ColumnFilter, CellRef, Range } from './catalogue/table/core'
export { leafNoun, kindNoun, branchNoun, countLabel } from './catalogue/table/grouping'

export { buildSearchIndex, search, browse, normalizeQuery } from './catalogue/search'
export type { SearchIndex, SearchResult, RowHit, TableHit } from './catalogue/search'

export { readCuration, curationChip, curationNote, searchReach } from './catalogue/curation'
export type { CurationReading, CurationCounts } from './catalogue/curation'

export { foldModels, modelOf, priceOf } from './catalogue/fold'
export { cascadeOfDelete, cascadeSay } from './catalogue/deleteCascade'
export type { DeleteCascade } from './catalogue/deleteCascade'

/* ---------------------------------------------------------- */
/* Modules — the places a dealer works in                      */
/* ---------------------------------------------------------- */

export {
  moduleTables,
  listedTables,
  buildEntries,
  groupEntries,
  moduleCensus,
  censusLine,
  moduleFace,
} from './modules/read'
export type { IndexEntry, IndexGroup, ModuleCensus } from './modules/read'
export { moduleAt, placesOf, placeFilters } from './modules/places'
export type { Place } from './modules/places'
export {
  mayDo,
  grantedTo,
  offeredCapabilities,
  isUnrestricted,
  accessCensus,
} from './modules/access'

/* ---------------------------------------------------------- */
/* People, and the file on disk                                */
/* ---------------------------------------------------------- */

export {
  CUSTOMER_TABLE_ID,
  customerRegister,
  isCustomerRegister,
  readCustomer,
  readCustomers,
  matchCustomers,
  exactCustomer,
  customerFormFields,
} from './people/customers'
export type { CustomerRead } from './people/customers'

/* The business itself: minted once, kept through a rename, a change
   of industry and a project swap. */
export { setOrganisation, setQuoteTerms } from './people/organisation'

export { validateEnvelope } from './io/envelope'
export type { ProjectFile, Validated } from './io/envelope'
export { buildExportPayload } from './io/exportPayload'
export { applyReplace, applyMerge, keepingOrganisation } from './io/apply'
export type { ApplyPorts } from './io/apply'
export { buildTableCsv, planTableUpload, applyTableUpload, describePlan } from './io/tableCsv'
export type { TableUploadPlan, UploadResult } from './io/tableCsv'
