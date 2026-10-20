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
import { localDayOf } from '@/domain/quote/day'
import { localTimeOf } from '@/domain/quote/diary/days'
import { givenOn } from '@/domain/quote/diary/today'
import { boatOfQuote } from '@/domain/quote/spoken'
import { stillWanted } from '@/domain/quote/steps'
import { boatTravel } from '@/screens/picker/travel'
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
  /** the boat's headline and what follows it, as a photograph card sets
   *  them — "Highfield ADV7" over "Hypalon · Black / Grey / Black" — and
   *  its maker, whose mark stands in the well where no photograph of the
   *  boat is held (`domain/quote/spoken`'s `boatOfQuote`) */
  headline: string
  detail: string
  maker: string
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
  /** the time it was given, `10:42`, for a document given; '' for a draft */
  givenAt: string
  /** the rung it is priced at, by the dealer's own name for it, or
   *  null where the document carries no quote-wide rung at all */
  rung: string | null
  /** WHAT A DRAFT STILL WANTS, in the dealer's words ("No motor yet"), or null
   *  (`domain/quote/steps`'s `stillWanted`) */
  wants: string | null
  /** the held photograph of exactly this model, where one exists */
  picture: HeldPicture | undefined
  /** THE NAME ITS PHOTOGRAPH TRAVELS UNDER: the row it is written for, the
   *  name the build's stage and the paper's cover stand under (the picker's
   *  `boatTravel`), so a press carries the boat onto whichever one opens */
  travel: string
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
  /** EVERY DRAFT BEING WRITTEN, newest first — the register's own draft
   *  band, in its own order — for the desk that draws them as cards */
  writing: FiledCard[]
  /** THE QUOTES GIVEN TODAY and still the current word, newest given first
   *  (`diary/today`'s `givenOn`, read through the register's own issued
   *  band so a quote replaced since is not among them) */
  given: FiledCard[]
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
  const spoken = boatOfQuote(quote)
  return {
    id: row.id,
    reference: row.reference,
    state: row.state,
    word: spec?.word ?? '',
    boat: row.boat,
    headline: spoken.name,
    detail: spoken.detail,
    maker: spoken.maker,
    customer: row.customer,
    total: row.total,
    insteadOfTotal: row.insteadOfTotal,
    lines: row.lines,
    age: ageSay(row.updatedAt, nowMs),
    givenAt: quote.issuedAt ? localTimeOf(quote.issuedAt) : '',
    rung: level?.label ?? null,
    wants: stillWanted(quote),
    picture: pictureForSubject(quote.rootTableId, row.label),
    travel: boatTravel(quote.rootTableId, quote.rootRowId),
  }
}

/** The whole reading, in one pass over what this browser has kept. */
export function deskOf(quotes: readonly QuoteDef[], nowMs: number): Desk {
  const register = readRegister(quotes)
  const draft = register.bands.find((band) => band.spec.id === 'draft')
  const row = register.shown[0]
  const quote = row ? quotes.find((one) => one.id === row.id) : undefined
  const byId = new Map(quotes.map((one) => [one.id, one]))
  const writing = (draft?.rows ?? []).flatMap((one) => {
    const its = byId.get(one.id)
    return its ? [cardOf(one, its, nowMs)] : []
  })
  const issued = new Map(
    (register.bands.find((band) => band.spec.id === 'issued')?.rows ?? []).map((one) => [
      one.id,
      one,
    ]),
  )
  const given = givenOn(quotes, localDayOf(new Date(nowMs))).flatMap((its) => {
    const one = issued.get(its.id)
    return one ? [cardOf(one, its, nowMs)] : []
  })

  return {
    held: register.held,
    drafts: draft?.held ?? 0,
    bands: register.bands
      .filter((band) => band.held > 0)
      .map((band) => ({ id: band.spec.id, word: band.spec.word, held: band.held })),
    newest: row && quote ? cardOf(row, quote, nowMs) : null,
    writing,
    given,
    nothingOpen: draft?.spec.empty ?? '',
  }
}
