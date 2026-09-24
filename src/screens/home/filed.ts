/* ============================================================
   WHAT IS ACTUALLY FILED IN THIS BROWSER, read for the one column on
   Home that is about documents rather than about the price file.

   NOT ONE FIGURE AND NOT ONE WORD HERE IS THIS MODULE'S OWN. The
   bands, their counts, their words, the sentence an empty band says,
   the row's boat, customer, total, the sentence that stands where a
   total cannot, and the age are all `domain/quote/register`'s; the
   rung is `domain/quote/pricing`'s. There is no arithmetic in this
   file — no sum, no difference, no count of its own — because a
   derivation belongs in `src/domain` with a test (CLAUDE.md), and
   because the register screen and this column must never be able to
   disagree about how many drafts are open.

   THE NEWEST DOCUMENT IS THE ONE A DEALER COMES BACK TO, which is why
   it is `shown[0]` and not `quotes[0]`. `readRegister` draws its rows
   band by band — Draft, then Issued, then Superseded — and newest
   first inside each, so the first row it hands back is the newest
   draft where one is open, and the newest thing filed where none is.

   IT HOLDS NO CLOCK. `ageSay` needs an instant and a module that read
   `Date.now()` could not be tested; the screen is handed the clock
   (`HomeProps.now`) and hands it here, exactly as the register screen
   is.
   ============================================================ */
import type { QuoteDef } from '@/domain/model'
import { quoteLevelChoices } from '@/domain/quote/pricing'
import {
  REGISTER_BANDS,
  ageSay,
  readRegister,
  type RegisterRow,
  type RegisterStateId,
} from '@/domain/quote/register'
import { pictureForSubject, type HeldPicture } from './ledgers'

/** One filed document, as the card on Home draws it. */
export interface FiledCard {
  id: string
  reference: string
  state: RegisterStateId
  /** the band's own word for that state — Draft, Issued, Superseded */
  word: string
  /** the boat, as the document froze it */
  boat: string
  /** the name on the document, or null where nobody has been named */
  customer: string | null
  /** the figure the customer would read, or null when there is none */
  total: number | null
  /** the register's own sentence for where that figure would stand */
  insteadOfTotal: string | null
  /** how many lines it has, priced or not */
  lines: number
  /** how long ago it was last touched, in the register's own words */
  age: string
  /** the rung it is priced at, by the dealer's own name for it, or
   *  null where the document carries no quote-wide rung at all */
  rung: string | null
  /** the held photograph of exactly this model, where one exists */
  picture: HeldPicture | undefined
}

/** One band with something in it. */
export interface FiledBand {
  id: RegisterStateId
  word: string
  held: number
}

export interface Desk {
  /** every document in this browser */
  held: number
  /** how many of them are being written */
  drafts: number
  /** the bands that hold at least one, in the life of a document */
  bands: FiledBand[]
  /** the one to come back to, or null when nothing is filed */
  newest: FiledCard | null
  /** what an empty draft band means, in the register's own sentence */
  nothingOpen: string
}

function cardOf(row: RegisterRow, quote: QuoteDef, nowMs: number): FiledCard {
  const spec = REGISTER_BANDS.find((band) => band.id === row.state)
  /* THE RUNG IS READ OFF THE LINES AND NOT OFF A TABLE, which is what
     makes it answerable with the sheet gone — the same call the
     document makes for its masthead. A document whose lines carry no
     quote-wide rung answers null, and the card then prints no rung
     rather than a key nobody says out loud. */
  const level = quoteLevelChoices(quote.lines).find((choice) => choice.key === quote.levelKey)
  return {
    id: row.id,
    reference: row.reference,
    state: row.state,
    word: spec?.word ?? '',
    boat: row.boat,
    customer: row.customer,
    total: row.total,
    insteadOfTotal: row.insteadOfTotal,
    lines: row.lines,
    age: ageSay(row.updatedAt, nowMs),
    rung: level?.label ?? null,
    picture: pictureForSubject(quote.rootTableId, row.label),
  }
}

/** The whole reading, in one pass over what this browser has kept. */
export function deskOf(quotes: readonly QuoteDef[], nowMs: number): Desk {
  const register = readRegister(quotes)
  const draft = register.bands.find((band) => band.spec.id === 'draft')
  const row = register.shown[0]
  const quote = row ? quotes.find((one) => one.id === row.id) : undefined

  return {
    held: register.held,
    drafts: draft?.held ?? 0,
    bands: register.bands
      .filter((band) => band.held > 0)
      .map((band) => ({ id: band.spec.id, word: band.spec.word, held: band.held })),
    newest: row && quote ? cardOf(row, quote, nowMs) : null,
    nothingOpen: draft?.spec.empty ?? '',
  }
}
