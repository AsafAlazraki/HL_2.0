/* ============================================================
   WHAT GOES ON THE COVER OF A SHEET OF PAPER, AND WHAT IS SAID WHERE
   NOTHING CAN.

   THE SAME READER THE BUILD'S STAGE ASKS, AND THE PAPER'S OWN QUESTION.
   Since 2026-10-20 the cover asks `coverOfQuote` (`forCover` in
   `@/domain/model/pictures`): the model on the water where a person
   marked that photograph (a hero the machine chose stays on the
   screens), the row's own copy, or a picture a person marked as exactly
   this row — never one a
   person refused for it (the REDCO and TINKA logos a trailer row points
   at; the 529 Assault photograph the 509's row points at), and never a
   render of the model in another colourway, which a screen may show
   captioned as the model's and a customer's paper may not.
   Until 2026-09-28 this file read the catalogue ledger for itself, by
   the row's address alone, and never the heroes ledger — so the Stacer
   519 Sea Ranger SDF, photographed on the water on the picker, the
   build's stage, Home and the Quotes register, printed Stacer's logo on
   a pale box as its cover, and the note beside the paper said "no copy
   of it is held here" (the components critique, blocker 3). The picture
   is now `pictureOfQuote` in `@/data/pictures`, the one reader every
   screen of the sale asks: the model on the water, then the row's own
   copy, then nothing. It is asked with the quote alone — by the label
   the quote froze — because the paper renders with no catalogue at all.
   So the photograph the picker's card showed and the stage stood on is
   the photograph that lands on the cover, and the plan's one
   choreography ends on the boat.

   A MARK ON PAPER NEEDS DARK INK, which is the one thing this ladder
   asks differently from the stage. `docs/research/refs/document/
   notes.md` §6 counted it: Mercury publishes its mark in WHITE INK ONLY,
   so on paper Mercury is a word. `markOnPaper` refuses it
   with that reason, and the note beside the paper says it.

   THE DEALER'S OWN MARK IS THE LETTERHEAD (since 2026-10-20). §6 again:
   a quote is letterhead. Northside Marine's dark-ink mark, taken from
   its own site's header, is in `marks-ledger.json` as the organisation's
   mark, and the cover prints it (`letterheadOf` in `@/data/pictures`).
   Where none is held, the name is set as type and the note says so once,
   rather than drawing a grey rectangle where a logo would go.

   THE BOAT IS THE PAGE (2026-11-02, direction A of
   docs/directions/quote-3/cover-boards; cover-pick.md). Until this date
   the cover picture was a band inside the margins and never a bleed,
   argued at 300 dpi: no held picture is 3508 px tall, so a cover that
   FILLED the page would enlarge it. The cover does not fill the page:
   a photograph runs off the sheet's top and both sides at the sheet's
   width where its own pixels reach it — never wider in CSS px than they
   are, the rule the band kept — and stops where they stop, its foot
   melting into the night's ink below. Which ground the top of the page
   is, and how far a photograph spans, are read here (`groundOf`,
   `spanOf`); how it is drawn is the stylesheet's.
   ============================================================ */
import {
  coverOfQuote,
  creditOf,
  hostOf,
  letterheadOf,
  markOnPaper,
  pictures,
  type HeldMark,
  type HeldPicture,
} from '@/data/pictures'
import type { FrozenLetterhead, QuoteDef } from '@/domain/model'

export { hostOf }

/** What the cover draws for this boat, and why it draws that. */
export type CoverArt =
  | { kind: 'photograph'; held: HeldPicture }
  | { kind: 'mark'; mark: HeldMark; because: string }
  | { kind: 'word'; because: string }

/**
 * WHAT TO PUT ON THE COVER for this quote's boat, down the ladder: the
 * boat's picture (the model on the water, then the row's own copy), then
 * the maker's mark in the ink paper needs, then the name set as type —
 * each rung carrying, in the dealer's words, the reason the rung above it
 * could not be taken.
 */
export function coverArt(quote: QuoteDef, register: string): CoverArt {
  /* THE PAPER'S OWN QUESTION (`forCover`): never a picture a person refused for this row — a
     logo, a sister model — and never a render of the model in another colourway */
  const found = coverOfQuote(quote)
  if (found.held) return { kind: 'photograph', held: found.picture }

  const address = quote.subjectImage?.src.trim() ?? ''
  /* IN THE DEALER'S WORDS (docs/WORDS.md): the reader's sentence carries the person's reason as
     it was written in the picture ledger ("… on a centre-console row"), which is the engine's
     word. The note says what the photograph shows instead (`refusedSay`). Matched exactly, so a
     new wording in the reader falls back to one plain sentence. */
  const refused = /^The price file’s own picture for this item is refused: (.+)\.$/.exec(
    found.because,
  )
  const missing = refused
    ? refusedSay(refused[1])
    : /refused/.test(found.because)
      ? REFUSED_PLAIN
      : address === ''
        ? 'The price list names no picture for this boat, so none is printed.'
        : 'No photograph of this boat yet.'

  const mark = markOnPaper(register)
  return mark.drawn
    ? { kind: 'mark', mark: mark.mark, because: missing }
    : { kind: 'word', because: `${missing} ${mark.because}` }
}

/** A ledger note that counts the outboards in a picture: "two outboards in one picture…". */
const MANY = /^(two|three|four|five|six) outboards\b/i

const REFUSED_PLAIN = 'The price list’s photograph is of another model, so it is left off.'

/** The engine's words a person's reason may carry (docs/WORDS.md): with any of them the reason
 *  is not printed, only the plain sentence. */
const ENGINE = /\b(rows?|file|table|column|register)\b/i

/**
 * WHY THE PRICE LIST'S PHOTOGRAPH IS LEFT OFF THE COVER, as the dealer says it: what the
 * photograph shows, never where the ledger filed it. docs/WORDS.md's own sentence is the 519
 * Centre Console's: "The price list's photograph shows the side console, so it is left off."
 */
export function refusedSay(rule: string): string {
  const said = (shows: string): string =>
    ENGINE.test(shows)
      ? REFUSED_PLAIN
      : `The price list’s photograph shows ${shows}, so it is left off.`
  const model = /^not that exact model(?: \((.+)\))?$/.exec(rule.trim())
  if (!model) return said(rule.trim())
  const why = model[1] ?? ''
  /* "side console shown on a centre-console row" */
  const shown = /^(.+?) shown on an? .+$/.exec(why)
  if (shown) return said(`the ${shown[1]}`)
  /* "a sister floor: the AL render on a KAM row" */
  const render = /^a sister (\w+): the (\S+) render on an? (\S+) \w+$/.exec(why)
  if (render) return said(`the ${render[2]} ${render[1]}, not the ${render[3]}`)
  /* "a different configuration: steering console, not tiller" */
  const layout = /^a different configuration: (.+), not (.+)$/.exec(why)
  if (layout) return said(`a ${layout[1]}, not a ${layout[2]}`)
  /* "a sister model" */
  if (/^an? [\w -]+$/.test(why)) return said(why)
  return REFUSED_PLAIN
}

/**
 * THE LINE UNDER A PHOTOGRAPH OF THE MODEL, on the customer's paper.
 *
 * The heroes ledger holds one photograph per MODEL, taken by its maker in
 * the maker's own finish and with the maker's own rig — the build's stage
 * says so under it (`configurator/say.ts`, `pictureSays`), and the paper a
 * customer keeps owes them the same courtesy a brochure's "shown with
 * optional equipment" does. The row's own copy is the exact boat on the
 * quote and needs no line.
 */
export function pictured(held: HeldPicture, title = '', boat = true): string | null {
  if (held.tier === 'hero' && held.subject !== '') {
    return `Pictured: the ${held.subject}, in its maker’s own finish and rig.`
  }
  /* A PICTURE OF MORE THAN ONE OUTBOARD (the printed quote's critic, 2026-10-31, blocker 1): a
     repower's cover drew Yamaha's white F115 beside a grey one for one grey F115LB, with nothing
     said. The ledger counts them (`differs`, "two outboards in one picture…"), and the line under
     the picture says the count and what is quoted. */
  const count = held.differs.map((d) => MANY.exec(d)?.[1]).find((n): n is string => n !== undefined)
  if (count !== undefined) {
    return title === ''
      ? `Pictured: ${count.toLowerCase()} outboards, as the maker’s own picture shows them. Yours is as quoted below.`
      : `Pictured: ${count.toLowerCase()} outboards, as the maker’s own picture shows them. Yours is the ${title} quoted below.`
  }
  /* A PERSON SAW SOMETHING IN IT THE QUOTE MAY NOT SAY — the 529's Evinrude, a bimini, a
     trailer under a render — recorded as `differs` in pictures.json. The customer is told
     only that the picture may differ; the dealer's note names what. */
  if (held.differs.length > 0) {
    return boat || title === ''
      ? 'Pictured with equipment that may differ from this quote. Your boat is as quoted below.'
      : `Pictured as its maker shows it, which may differ from this quote. Yours is the ${title} quoted below.`
  }
  return null
}

/**
 * WHAT THE COVER PRINTS AND WHOSE IT IS, said to the dealer on the note beside the paper: what the
 * picture shows and where it came from, never how the screen drew it (the refine critique, 18).
 * A maker's photograph of the model, the price list's own picture of this item, a picture
 * Northside added, or — where no picture prints — the reason, as the cover's ladder gave it.
 */
export function coverSay(art: CoverArt, noun: string): string {
  if (art.kind !== 'photograph') return art.because
  const held = art.held
  if (held.added) return `Northside’s own photograph. ${creditOf(held)}.`
  const what =
    held.tier === 'hero' && held.subject !== ''
      ? `The ${held.subject}, as its maker photographed it,`
      : held.id.startsWith('row:')
        ? `The price list’s own picture of this ${noun},`
        : held.verdict === 'scene'
          ? 'A photograph on the water,'
          : `A ${held.verdict} picture,`
  return `${what} from ${hostOf(held.address)}.`
}

/**
 * WHY THE PICTURE THE BUILD SHOWS IS NOT THE ONE THE COVER PRINTS, and what would print one (the
 * quote round's audit, 2026-11-02, D1). The Highfield Sport 560 stood on the build as Highfield's
 * photograph on the water and printed the price list's studio picture, and nothing beside the
 * paper said why. The paper takes a maker's photograph of a model only where a person checked it
 * shows that model (`forCover`): the machine once took a photograph off the Sport 660's page for
 * the Sport 600. So the dealer is told which picture the build shows, why the customer's copy leaves it
 * off, and, on a draft, the one thing he can do about it here: a photograph Northside adds to the
 * item in its pictures and makes its cover is printed. '' where the build shows what the cover
 * prints, or shows nothing.
 */
export function notPrintedSay(
  shown: HeldPicture | null,
  art: CoverArt,
  noun: string,
  draft: boolean,
): string {
  if (!shown) return ''
  if (art.kind === 'photograph' && (art.held.id === shown.id || art.held.src === shown.src))
    return ''
  const said =
    shown.tier === 'hero' && !shown.person && shown.subject !== ''
      ? `The build shows the ${shown.subject}, as its maker photographed it. Nobody has checked that it shows this model, so it is not printed.`
      : !shown.exact && !shown.added
        ? `The build shows a picture of the model that may not be this ${noun}’s finish, so it is not printed.`
        : ''
  if (said === '') return ''
  return draft
    ? `${said} A photograph Northside adds to this ${noun} and makes its cover is printed instead.`
    : said
}

/**
 * WHAT THE PANEL WHERE THE PAPER IS CHOSEN SAYS OF THE COVER, and only where the cover is not the
 * boat's photograph (the quote round's audit, round 2, 2026-11-02, D1: the owner's "using boats
 * photo" waits on a photograph a person checked, or on one Northside adds and makes the cover, and
 * the reason stood only at the foot of the note under the paper). Where the build shows a picture
 * the cover leaves off, which and why (`notPrintedSay`); where nothing is pictured at all, the
 * cover's own reason. '' where the cover is a photograph and nothing on the build differs from it,
 * or where it prints the exact item's studio picture and the build shows nothing else.
 */
export function coverAskSay(art: CoverArt, shown: HeldPicture | null, noun: string): string {
  const unprinted = notPrintedSay(shown, art, noun, false)
  if (unprinted !== '') return unprinted
  return art.kind === 'photograph' ? '' : art.because
}

/** SAID OVER THE CONTROL ON A DRAFT: the act that puts a photograph on the cover, and — where the
 *  gallery it opens shows the maker’s photograph marked as its cover, which the paper does not print —
 *  that it is not that one (the round’s walk, 2026-11-02: the gallery’s "Cover" stood on the Sport
 *  560’s maker photograph under a sentence that said the cover prints). */
export function coverAskAct(noun: string, shown: HeldPicture | null): string {
  const act = `Add Northside’s own photograph of this ${noun} and make it the cover, and the printed quote prints it on its cover.`
  return shown && shown.tier === 'hero' && !shown.person && !shown.added
    ? `${act} The maker’s photograph is not printed.`
    : act
}

/** What the top of the cover is: the photograph itself, or a pale studio panel. */
export type CoverGround = 'photo' | 'studio'

/**
 * THE GROUND THE TOP OF THE COVER IS. A photograph on the water — or a picture Northside added,
 * which is a photograph a person took — is the page's top and melts into the night under it. A
 * studio picture (a motor on white, a maker's render), a picture whose kind was never measured, a
 * maker's mark or a name in type has no water to melt, so it stands on a pale studio panel that
 * bleeds the same three edges: one composition for every quote, the boat's, the motor's, the
 * trailer's.
 */
export function groundOf(art: CoverArt): CoverGround {
  if (art.kind !== 'photograph') return 'studio'
  return art.held.verdict === 'scene' || art.held.verdict === 'own' ? 'photo' : 'studio'
}

/** A4's width and the tallest a cover photograph is drawn, in CSS px (210 mm; `--night-max`,
 *  170 mm, in document.css): 96 px to the inch. */
export const SHEET_PX = (210 / 25.4) * 96
export const NIGHT_MAX_PX = (170 / 25.4) * 96

/**
 * HOW FAR A COVER PHOTOGRAPH SPANS THE SHEET: 'full', off both sides, where its held pixels are at
 * least the sheet's width and its proportion at that width stands no taller than `--night-max`;
 * else 'narrow' — drawn whole at its own size, centred, its sides melting into the night as its
 * foot does. Never enlarged and never cropped to reach an edge.
 */
export function spanOf(held: Pick<HeldPicture, 'width' | 'height'>): 'full' | 'narrow' {
  if (held.width <= 0 || held.height <= 0) return 'narrow'
  return held.width >= SHEET_PX && (SHEET_PX * held.height) / held.width <= NIGHT_MAX_PX
    ? 'full'
    : 'narrow'
}

/**
 * NORTHSIDE'S MARK IN WHITE INK, FOR THE COVER'S PHOTOGRAPH: the held light version of the very
 * mark the letterhead prints in dark (`marks-ledger.json` holds both, from northsidemarine.com.au),
 * or null — no mark is held for this business, or the one printed was added on Settings, of which
 * no light ink exists — and the cover sets the name in type instead.
 */
export function nightMarkOf(
  business: string | null,
  letterhead: Pick<FrozenLetterhead, 'mark'> | null,
): HeldMark | null {
  const dark = letterheadOf(business)
  if (!dark.drawn) return null
  if (letterhead?.mark && letterhead.mark.src !== dark.mark.src) return null
  const light = pictures().organisation('white')
  return light.drawn ? light.mark : null
}
