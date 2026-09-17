/* ============================================================
   THE QUOTE — one door onto the engine that turns live data into a
   document and then never reads live data again.

     import { mintQuote, apply, setLevel, quoteTotals, buildSteps }
       from '@/domain/quote'

   WHAT THE PIECES ARE, AND THE ORDER THEY RUN IN

     freeze.ts    the ONLY place live data becomes a quote. Reads a
                  `CatalogueCtx` once, at pick time, and produces
                  frozen values. Nothing here is called while a quote
                  is being drawn.
     commands.ts  every way a document changes, each with its own
                  inverse, its own sentence and its own event. One
                  `apply` holds the draft/issued line.
     totals.ts    sums frozen values and never reads the catalogue.
     steps/bands  a reading of a document that is already written
                  down — the walk and the bands it is drawn in.
     pricing.ts   the rungs: what a column means, what a rung already
                  contains, and what a line charges at each one.

   WHY THE DOOR IS NARROW. A quote is a photograph, and the whole
   correctness story is that only ONE of these files may see the
   sheet. Publishing `freeze`'s readers beside the pure ones makes
   that visible: everything below the first group takes a document
   and returns a reading of it, and nothing below the first group
   takes a `CatalogueCtx` at all.

   WHAT IS NOT HERE. The screens. The configurator, the picker, the
   document and the cascade sheet arrive in Milestone 1 from their
   own reference sweeps and their own picked directions, and they
   read these functions rather than reimplement them. A module this
   barrel does not publish is still reached by its own path —
   `quote/cascade`, `quote/conflict`, `quote/distinguish`,
   `quote/colourway`, `quote/marque`, `quote/find`, `quote/day`,
   `quote/subjectRules`, `quote/start` — exactly as every caller
   reached them before. A door that widens on the way through a port
   is a door nobody decided to widen.
   ============================================================ */

/* ---------------------------------------------------------- */
/* PICK TIME — the one group that reads the catalogue          */
/* ---------------------------------------------------------- */

export {
  mintQuoteFromView,
  mintLine,
  mintFreeLine,
  freezeSpecs,
  refinishSubject,
  candidateOffer,
  candidatesFor,
  stepOffer,
  stepReason,
  sectionKinds,
  sectionTableIsGone,
  subjectStillOnSheet,
  unsellableSubject,
  priceChanges,
  referenceFor,
  customerBook,
  hasCustomerRegister,
  freezeCustomer,
  fileCustomer,
  OFFER_CAP,
  PAIR_SLOT_LABEL,
  SUBJECT_BLOCK,
  HANDOVER_TITLE,
} from './freeze'
export type {
  Candidate,
  CustomerWrites,
  MintLineArgs,
  MintQuoteArgs,
  Offer,
  PriceChange,
  StepMeasure,
  StepOffer,
  StepOfferOptions,
  StepReason,
} from './freeze'

/* ---------------------------------------------------------- */
/* CHANGING ONE — commands, inverses, events                   */
/* ---------------------------------------------------------- */

export {
  apply,
  isDone,
  ISSUED_REFUSAL,
  mintQuote,
  newVersionOf,
  addAdjustment,
  addFreeLine,
  addLine,
  applyPriceChanges,
  issue,
  linkCustomer,
  refinish,
  removeAdjustment,
  removeLine,
  setAdjustmentMagnitude,
  setCustomer,
  setLevel,
  setLineLevel,
  setNote,
  setOverride,
  setPreparedBy,
  setQty,
  setTaxRate,
  unlinkCustomer,
  updateAdjustment,
} from './commands'
export type { Done, MintArgs, Minted, Outcome, QuoteCommand, Refused } from './commands'

/* ---------------------------------------------------------- */
/* READING ONE — no catalogue below this line                  */
/* ---------------------------------------------------------- */

export {
  lineAmount,
  linesOf,
  looseLines,
  quoteTotals,
  issueBlockers,
  isEmptyQuote,
  needsOverrideReason,
  totalIsNothingByDefault,
  unexplainedOverrides,
  adjustmentSign,
} from './totals'
export type { LineAmount, QuoteTotals } from './totals'

export {
  buildSteps,
  decidedCount,
  firstOpenStep,
  reachOf,
  savedNote,
  stepAfter,
  stepBefore,
  weighPick,
  HANDOVER_STEP,
  SUBJECT_STEP,
} from './steps'
export type { BuildStep, StepReach, StepState, Weighing } from './steps'

export { orderBands, stateSay, BANDS } from './bands'
export type { Band, BandId, BandSpec, BandTable } from './bands'

/* ---------------------------------------------------------- */
/* THE RUNGS                                                   */
/* ---------------------------------------------------------- */

export {
  chargeAlreadyIn,
  chargeAlreadyInSentence,
  chargeNamedBy,
  defaultLevelKey,
  freezeLevels,
  isCostColumn,
  isPriced,
  looksMonetary,
  money,
  normName,
  parseAmount,
  priceAtLevel,
  priceLevelsFor,
  quoteLevelChoices,
  repricedAt,
  rungIncludes,
  signedMoney,
} from './pricing'
export type { AlreadyIncluded, ChargeableLine, PricedAt, QuoteLevelChoice } from './pricing'
