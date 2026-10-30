/* ============================================================
   TWO SENTENCES THE CONFIGURATOR BUILDS FROM COUNTS AND FROM THE
   DOCUMENT, kept out of the JSX so each has one place to be right and
   a test that holds it there.

   `totalNoteSay` is the one line under the total that says what is
   not in it. It said "1 of them carry no price at all" once
   (built-critique-m2.md #25) — a counted figure with the wrong verb —
   and then "Not priced on this quote" in four places on one screen; it
   is one sentence now, in the dealer's words, with its verb agreeing.

   `pictureSays` is the caption under the stage photograph
   (built-critique-m2.md #24). The hero ledger holds one photograph per
   MODEL, taken by the maker, in the maker's own finish and with the
   maker's own outboard on the transom — on the Sport 560 that is a
   Mercury, while the quote on the desk may carry a Yamaha F90XB and a
   different colourway. The picture belongs to the model it depicts and
   is never swapped for a stand-in and never cropped to hide what is on
   it; what a customer reading it is owed is one sentence saying what
   the photograph shows and one saying what THIS quote carries, in the
   chapter it is chosen in.

   AND EVERY OTHER SENTENCE THE BUILD SAYS IN ITS OWN VOICE (the
   M2-close critique, #4). The build printed the engine's words to a
   salesperson with a customer at the desk: "a quote is written against
   ONE row … choosing another re-roots the document", "no price column
   on this table" under six rows of one chapter, "699 of this table's
   2,937 rows", "on the shelf", "rung", "frozen lines". Every sentence
   below says the same fact in the words a dealer uses (docs/WORDS.md)
   — a boat, a finish, a price, what is made for this boat — and each is
   a function with a test, so the words have one place to be right and
   the vocabulary test in `say.test.ts` fails the day an engine word
   comes back.

   PURE: no React, no store. Tested against the real pack in
   `say.test.ts`.
   ============================================================ */
import { CHARGE_TITLE, type CatalogueCtx, type QuoteDef, type RungCharge } from '@/domain/model'
import { OFFER_CAP, type AlreadyIncluded, type StepReason } from '@/domain/quote'
import { hullPriceOf } from '@/domain/quote/nought'
import { saidOnQuote } from '@/domain/quote/spoken'
import { money } from '@/domain/money'
/* types only: `chapters.ts` reads `chargeSay` from here, so a value
   import back would be a cycle */
import type { Chapter, ChapterTable, Rail, UnpricedWhy } from './chapters'
import type { StageArt } from './stage'

/** en-AU digits, so a large count is written the way every other
 *  figure on the screen is. */
const au = (n: number): string => n.toLocaleString('en-AU')

/**
 * WHAT IS NOT IN THE TOTAL, SAID ONCE, UNDER THE TOTAL (docs/WORDS.md, "one fact, one place"). It
 * was said four ways on one screen — "Not priced on this quote" on the chapter's head, a
 * paragraph over Dealer fit, a note under the finale's act, and the paper's own line — and in the
 * engine's words ("carries no price on this quote, and the paper prints it as not priced"). Now
 * one sentence, in the words a dealer says it to the customer beside him, under the figure it is
 * about: in the masthead while the build is worked, and under the finale's total once the finale
 * is open. '' where everything on the quote is priced.
 *
 * WHERE THE BOAT ITSELF HAS NO PRICE (a Haines Signature, which the file holds at nought —
 * m2-last-critique.md blocker 1) the figure is everything but the boat, and that is said first:
 * "$8,473" under a boat's name reads as the boat's price.
 *
 * WHERE A WHOLE LIST HAS NO PRICE (`lists`, beside `names` one for one: the list's own name as
 * its heading in the chapter says it, or '' where the line's list prices other things), the
 * sentence says the list and then the line: "Rigging Kits have no price on the price list, so the
 * rigging kit for the F90LB is not in this total." At 1440 the same fact stood in one window
 * three times more — the level's "3 of 4 items priced", and the tag beside "Rigging Kits" in
 * Dealer fit (the refine round, 2026-10-21). Said here, it covers the list's other kits too, and
 * the tag is drawn only over a list nothing on the quote comes from (`unpricedTag`).
 *
 * A LIST WHOSE PRICE IS NOT CHOSEN IS NOT A LIST WITH NO PRICE (built-critique-m3.md, blocker 1).
 * "Dealer Fit Packages have no price on the price list" stood under the Classic 340's total while
 * the Tube Covers' line holds Sell $2,790 and Act Sell $2,834, and Prices said the list holds two
 * sell figures and names none. `why`, beside `names` one for one (`Rail.unpricedWhy`), says which
 * it is: `unchosen` says the choice Northside has not made, `before` says the line went on before
 * its list had a price, and `none` (the default) keeps the sentence above for a line the price
 * list has no figure for at all.
 */
export function totalNoteSay(
  names: readonly string[],
  boatUnpriced: boolean,
  lists: readonly string[] = [],
  why: readonly UnpricedWhy[] = [],
): string {
  const whyOf = (at: number): UnpricedWhy => why[at] ?? 'none'
  const at = names.map((_, i) => i)
  /* THE LINES WITH NO FIGURE ON THE PRICE LIST, said as they always were */
  const none = at.filter((i) => whyOf(i) === 'none')
  const said = none.map((i) => `the ${inSentence(names[i]!)}`)
  const one = said.length === 1
  /* each whole list once, by its name, then any item whose own list prices other things */
  const wholes = [...new Set(none.map((i) => lists[i] ?? '').filter((list) => list !== ''))]
  const others = none
    .filter((i) => (lists[i] ?? '') === '')
    .map((i) => `the ${inSentence(names[i]!)}`)
  const whyNone =
    wholes.length === 0
      ? `${capital(listed(said))} ${one ? 'has' : 'have'} no price on the price list`
      : `${capital(listed([...wholes, ...others]))} have no price on the price list`
  /* AND THE ONES WHOSE PRICE IS NOT CHOSEN, OR WAS CHOSEN SINCE (built-critique-m3.md, blocker
     1): the price list holds their figures, so "no price on the price list" was false */
  const causes = (['unchosen', 'before'] as const)
    .map((cause) => causeSay(cause, names, lists, why, boatUnpriced ? 'it' : 'this total'))
    .filter((c) => c !== '')
  if (boatUnpriced) {
    const head = 'The boat has no price yet, so this total is everything but the boat.'
    const tail =
      said.length === 0
        ? ''
        : wholes.length === 0
          ? ` ${whyNone} either.`
          : ` ${whyNone} either, so ${listed(said)} ${one ? 'is' : 'are'} not in it.`
    return [head + tail, ...causes].join(' ')
  }
  const noneSay =
    said.length === 0
      ? ''
      : wholes.length === 0
        ? `${whyNone}, so ${one ? 'it is' : 'they are'} not in this total.`
        : `${whyNone}, so ${listed(said)} ${one ? 'is' : 'are'} not in this total.`
  return [...causes, noneSay].filter((c) => c !== '').join(' ')
}

/** ONE SENTENCE PER CAUSE, naming each list once and then its lines: "Northside has not chosen
 *  which figure prices Dealer Fit Packages, so the Tube Covers … is not in this total." */
function causeSay(
  cause: 'unchosen' | 'before',
  names: readonly string[],
  lists: readonly string[],
  why: readonly UnpricedWhy[],
  total: string,
): string {
  const at = names.map((_, i) => i).filter((i) => why[i] === cause)
  if (at.length === 0) return ''
  const these = at.map((i) => `the ${inSentence(names[i]!)}`)
  const of = [...new Set(at.map((i) => lists[i] || 'its list'))]
  const one = these.length === 1
  return cause === 'unchosen'
    ? `Northside has not chosen which figure prices ${listed(of)}, so ${listed(these)} ${one ? 'is' : 'are'} not in ${total}.`
    : `${capital(listed(these))} went on before ${listed(of)} had a price, so ${one ? 'it is' : 'they are'} not in ${total} yet.`
}

/**
 * WHY A QUOTE CARRYING A LINE WHOSE PRICE IS NOT CHOSEN IS NOT GIVEN (built-critique-m3.md,
 * blocker 1, "change first"): the paper printed "Price to be confirmed" under a total that left
 * the line out without a word, when the price list holds its figures. One sentence per cause,
 * each naming its lists once and its lines; a line the price list has no figure for at all is
 * not refused, and prints as it always has.
 */
export function unpricedGiveSay(
  names: readonly string[],
  why: readonly UnpricedWhy[],
  lists: readonly string[],
): string[] {
  const out: string[] = []
  for (const cause of ['unchosen', 'before'] as const) {
    const at = names.map((_, i) => i).filter((i) => why[i] === cause)
    if (at.length === 0) continue
    const these = at.map((i) => `the ${inSentence(names[i]!)}`)
    const of = [...new Set(at.map((i) => lists[i] || 'its list'))]
    const one = these.length === 1
    out.push(
      cause === 'unchosen'
        ? `Northside has not chosen which figure prices ${listed(of)}, so ${listed(these)} ${one ? 'has' : 'have'} no price and this quote cannot be given. Choose it on Prices, or put a price on ${one ? 'the line' : 'each line'} here.`
        : `${capital(listed(these))} went on before ${listed(of)} had a price, so this quote cannot be given until ${one ? 'it takes' : 'they take'} that price. Price ${one ? 'it' : 'them'} here.`,
    )
  }
  return out
}

/**
 * THE SAME CAUSES, SAID AS ONE OF SEVERAL (built-critique-m3-2.md, major 5): the Classic 340's
 * finale ran "No customer’s name … so it cannot be given. Northside has not chosen which figure
 * … and this quote cannot be given. Choose it on Prices, or put a price on the line here." into
 * one paragraph. Where more than one thing stands in the way, the finale says "cannot be given"
 * once, over the list (`giveWaitsLead`), and each cause is its own line saying only the cause
 * and what puts it right. One cause alone is still said whole (`unpricedGiveSay`).
 */
export function unpricedWaitSay(
  names: readonly string[],
  why: readonly UnpricedWhy[],
  lists: readonly string[],
): string[] {
  const out: string[] = []
  for (const cause of ['unchosen', 'before'] as const) {
    const at = names.map((_, i) => i).filter((i) => why[i] === cause)
    if (at.length === 0) continue
    const these = at.map((i) => `the ${inSentence(names[i]!)}`)
    const of = [...new Set(at.map((i) => lists[i] || 'its list'))]
    const one = these.length === 1
    out.push(
      cause === 'unchosen'
        ? `Northside has not chosen which figure prices ${listed(of)}, so ${listed(these)} ${one ? 'has' : 'have'} no price. Put one on ${one ? 'it' : 'each'} above, or choose it on Prices.`
        : `${capital(listed(these))} went on before ${listed(of)} had a price. Price ${one ? 'it' : 'them'} above.`,
    )
  }
  return out
}

/** The name the give waits for, as one of several causes: `ADDRESSED_TO_NOBODY` says "so it
 *  cannot be given" itself, which the list's lead says once for all of them. */
export const NOBODY_WAITS = 'No customer’s name is on it yet.'

/** "It cannot be given yet, for two reasons:" — the one place a list of causes says what they
 *  stop. */
export function giveWaitsLead(count: number): string {
  return `It cannot be given yet, for ${saidCount(count).toLowerCase()} reasons:`
}

/** "the rigging kit …" at the start of a sentence */
const capital = (text: string): string => `${text.charAt(0).toUpperCase()}${text.slice(1)}`

/** A name as it stands inside a sentence: the build's own "Rigging kit for …" takes a small r;
 *  a name the price list wrote keeps its capitals (`kitSaid` in chapters.ts makes the first). */
export function inSentence(name: string): string {
  return name.startsWith('Rigging kit for ') ? `r${name.slice(1)}` : name
}

/* ---------------------------------------------------------- */
/* A change of mind                                            */
/* ---------------------------------------------------------- */

/** "Two", "Three": a count a person says, to ten, and digits past it. */
const SAID_COUNT = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
]
const saidCount = (n: number): string => SAID_COUNT[n] ?? au(n)

/**
 * MORE THAN ONE LINE FROM ONE LIST, SAID AS A PERSON SAYS IT (build-close-critique.md, 2026-10-19,
 * major 1). It was the engine's "2 lines from Yamaha Outboards are on this quote — … A pick here
 * goes on BESIDE what is already there and never in its place, so every one of them is charged."
 * A press on a motor now puts it on instead of the one there, so two motors are on a boat only
 * where somebody put the second beside the first — on a hull whose own row says it takes two, or
 * on a quote written before. Where the hull's row says nothing of two, the sentence asks.
 */
export function severalSay(kind: string, names: readonly string[], takesTwo: boolean): string {
  if (names.length < 2) return ''
  if (kind === 'motor') {
    const the = names.map((name) => `the ${name}`)
    return `${saidCount(names.length)} motors are on this boat now, ${listed(the)}, and each is charged.${takesTwo ? '' : ' Was that meant? Pressing one takes it off.'}`
  }
  return `${listed(names)} are ${names.length === 2 ? 'both' : 'all'} on this quote, and each is charged.`
}

/**
 * What putting one motor on in place of another says, and what its way back says.
 *
 * ITS FIGURE IS WHAT THE CHANGE OF MIND DID TO THE TOTAL, signed, which is the figure the tile
 * showed before the press (the refine round, 2026-10-21). It was the new motor's own price: after
 * a swap "$16,667" stood in the toast, in the chapter's head and on the tile at once. The motor's
 * price is the head's; the toast says what the press changed. `change` is null where the motor
 * going on has no price, and the toast says that instead.
 */
export function swapSay(
  on: string,
  off: string,
  withKit: boolean,
  change: number | null,
): { said: string; back: string } {
  const figure =
    change === null
      ? ' · no price on it'
      : change === 0
        ? ' · no change to the total'
        : ` · ${change > 0 ? '+' : ''}${money(change)}`
  return {
    said: `${on} put on the quote instead of the ${off}${withKit ? ', with its rigging kit' : ''}${figure}`,
    back: `${on} off the quote again, and the ${off} back on${withKit ? ' with its rigging kit' : ''}`,
  }
}

/**
 * A KIT FOR A MOTOR THAT IS NOT ON THE BOAT (build-close-critique.md, 2026-10-19, major 2). After a
 * swap made by hand the F90LB's Binnacle Mount Rigging Kit stayed on the quote with nothing said,
 * and the paper's workshop rail printed it beside an F115LB. Said at the kit and in the finale.
 */
export function orphanSay(kit: string, motor: string): string {
  return `The ${inSentence(kit)} is on this quote, and no ${motor} is on this boat now.`
}

/** A rule's because as it stands inside a sentence: its own words, without the stop it ended on. */
const becauseOf = (because: string): string => because.trim().replace(/[.\s]+$/, '')

/**
 * A LINE THE DEALER'S OWN RULE REFUSES, STILL ON THE QUOTE, AT THE GIVE (built-critique-m3-2.md,
 * blocker 1). A draft started before the rule was written keeps what it carried — a rule never
 * takes a line off — but it is not a quote the dealer has agreed to sell, so the give is refused
 * with the rule's own because, once per rule, and the sentence says what puts it right.
 */
export function ruledGiveSay(names: readonly string[], because: string, rule: string): string {
  const one = names.length === 1
  const why = becauseOf(because)
  const reason = why === '' ? `by your rule “${rule}”` : `because ${why}`
  return `${capital(listed(names.map((n) => `the ${inSentence(n)}`)))} ${one ? 'is' : 'are'} on this quote, and your rule refuses ${one ? 'it' : 'them'} on this boat, ${reason}. Take ${one ? 'it' : 'them'} off before it goes to the customer.`
}

/**
 * A LINE ON THE QUOTE THE DEALER'S OWN RULE WARNS ABOUT, SAID BESIDE THE GIVE (built-critique-m3-2.md,
 * major 3: the warning lived only above a list that scrolled away, and the finale said nothing).
 * A warning never refuses: the dealer reads it, and the give stays theirs to press.
 */
export function warnedGiveSay(names: readonly string[], because: string, rule: string): string {
  const why = becauseOf(because)
  const reason = why === '' ? `: “${rule}”` : `, because ${why}`
  return `Your rule warns about ${listed(names.map((n) => `the ${inSentence(n)}`))} on this quote${reason}.`
}

/* ---------------------------------------------------------- */
/* The rail's own sentences                                    */
/* ---------------------------------------------------------- */

/** WHAT A CHAPTER'S HEAD ADDS AFTER THE ENGINE'S OWN CLAUSE: how many
 *  there are to choose between, where the clause has not already said
 *  it. It read "3 more offered · 4 on the shelf" — one count said twice
 *  in two words, the second of them a warehouse's. '' while a search is
 *  running, because then the head says what matched instead. */
export function choiceSay(chapter: Chapter, searching: boolean): string {
  if (searching || chapter.kind !== 'band' || chapter.offered <= 0) return ''
  if (chapter.finishes && chapter.finishes.rows.length > 1) {
    return ` · ${au(chapter.finishes.rows.length)} finishes`
  }
  if (/\boffered\b/.test(chapter.fact)) return ''
  /* WHAT IS STILL THERE TO CHOOSE, NOT WHAT IS DRAWN: a trailer chapter whose one trailer is
     on the quote read "chosen: … · 1 to choose from", counting the answer as the question */
  const open = chapter.tables.reduce((n, t) => n + t.rows.filter((r) => !r.fitted).length, 0)
  return open > 0 ? ` · ${au(open)} to choose from` : ''
}

/** WHAT EVERY PRICE IN A LIST ALREADY HAS IN IT, said once over the list, where every row
 *  carries the same word (`containsSay` in chapters.ts: "pre-delivery included"); '' where
 *  one row differs or says nothing. It stood on each Yamaha tile as "PRE-DELIVERY
 *  INCLUDED" — four copies in one chapter of the one sentence a list says once. */
export function includesSay(contains: readonly string[]): string {
  const first = contains[0] ?? ''
  if (first === '' || !contains.every((c) => c === first)) return ''
  const what = first.replace(/\s+included$/, '')
  return contains.length === 1
    ? `The price includes ${what}.`
    : `Every price here includes ${what}.`
}

/** WHAT THE LIST LEAVES UNDRAWN, where it does: "The first 50 are shown." Nothing else is
 *  counted over a list (build-close-critique-2.md major 2): "5 OF 2,238 PAIRED WITH THIS HULL"
 *  stood over every list in the database's capitals, beside a head that already says "13 more
 *  offered", a search that says how many it found and a switch that says "Show all 2,238". ''
 *  where every one is drawn. */
export function cappedSay(table: ChapterTable, cap: number = OFFER_CAP): string {
  return table.counts.capped ? `The first ${au(cap)} are shown.` : ''
}

/** WHY THE LIST IS THE LENGTH IT IS, where the counted line has not
 *  already said it. A list the price file wrote down needs nothing more
 *  than "paired with this hull"; the workbook name of that list and a
 *  file-wide rate ("It holds at 100% across the price file — 1,424 of
 *  1,424 live standard and first-alternative motors") are the rule's
 *  evidence and belong with the rules, not over a motor a customer is
 *  choosing. A list a RULE narrows keeps the rule's own clause, because
 *  that clause is the reason; one nothing narrows needs no sentence. */
export function reasonSay(table: ChapterTable): string {
  const reason: StepReason | null = table.reason
  if (!reason || table.paired || reason.what.startsWith('nothing narrows')) return ''
  return sentenceOf(reason.what)
}

/** A LIST WHOSE TABLE CARRIES NO PRICE AT ALL, said once over it, in the price list's words for
 *  it (docs/WORDS.md). Once something from it is on the quote, the line under the total says so
 *  instead, and the screen draws this only while nothing from it is. */
export function unpricedSay(table: ChapterTable): string {
  if (!table.unpriced) return ''
  return table.unchosen !== ''
    ? `Northside has not chosen which figure prices ${table.title}, so they go on this quote unpriced.`
    : `${table.title} have no price on the price list, so they go on this quote unpriced.`
}

/** THE SAME FACT AS A TAG BESIDE THE LIST'S NAME (the refine round, 2026-10-21: "Say the unpriced
 *  fact once, as a tag … 'No price on the price list'"). Every line under it has no figure, and a
 *  kit tile with no figure and no word beside it read as a price forgotten; the tag says why, once,
 *  for the whole list. ONLY WHILE THE LINE UNDER THE TOTAL DOES NOT: once something from the list
 *  is on the quote, that line names the list itself ("Rigging Kits have no price on the price
 *  list, so …", `totalNoteSay`), and the tag in the same window said it again (the refine round's
 *  reader at 1440). `told` is the lists that line names (`Rail.unpricedLists`). */
export function unpricedTag(table: ChapterTable, told: readonly string[] = []): string {
  if (!table.unpriced || told.includes(table.title)) return ''
  /* a list whose figures Northside has not chosen between is not a list with no price
     (built-critique-m3.md, blocker 1): its tag is the door to where it is chosen */
  return table.unchosen !== '' ? 'Choose its price' : 'No price on the price list'
}

/** WHAT EVERY PRESS ON A LIST OF MOTORS DOES, said once over it rather than "instead of the F90LB"
 *  beside every figure (the refine round, 2026-10-21: three times down one chapter). Said only
 *  where two or more of the lines off the quote would each take the same motor off; one alone
 *  keeps its words on its own tile. */
export function insteadSay(instead: string): string {
  return instead === '' ? '' : `Each goes on in place of the ${instead}, for the difference shown.`
}

/** WHAT THE WHOLE LIST IS, once it is open — and nothing while it is shut, where the switch's own
 *  words say it ("Show all 2,238 in Parts & Accessories"). It was two sentences under every list
 *  at rest, explaining the switch before anybody pressed it (build-close-critique-2.md major 2). */
export function allSay(table: ChapterTable): string {
  if (!table.showingAll) return ''
  const gone = table.counts.pool - table.counts.catalogue
  const said = 'Anything not made for this boat says so.'
  return gone > 0
    ? `${said} ${au(gone)} no longer sold ${gone === 1 ? 'is' : 'are'} left out.`
    : said
}

/** THE SENTENCE UNDER THE SEARCH FIELD, resting and answering. */
export function searchSay(rail: Rail | null, open: boolean): string {
  if (!open) return 'Nothing to search until the price list is loaded.'
  /* AND NOTHING AT REST: the field's own label and placeholder say what it finds ("A name, a
     code, a rigging kit"), and this line said it a third time */
  if (rail === null || !rail.searching) return ''
  if (rail.hits === 0) return 'Nothing on this quote is called that.'
  const beyond = rail.beyond > 0 ? `, ${au(rail.beyond)} of them not made for this boat` : ''
  const capped = rail.drawn < rail.hits ? ` The first ${au(OFFER_CAP)} in each are shown.` : ''
  return `${au(rail.hits)} found${beyond}.${capped}`
}

/** A CHARGE ALREADY INSIDE A PRICE, said as a dealer says it, and the
 *  price by its level's declared name. The engine's sentence names the
 *  list's own column — "… is priced at Sell inc Rego, and that number
 *  already has registration in it" — and the finale printed it beside
 *  "Priced at Cash", so one quote named its one level three ways
 *  (m2-last-critique.md, major 5); its several-line case said "priced
 *  at a column" (M2-close critique #4). The facts — which lines, which
 *  price, which charge — are all `chargeAlreadyIn`'s. */
export function chargeSay(found: readonly AlreadyIncluded[], charge: RungCharge): string | null {
  if (found.length === 0) return null
  const what = CHARGE_TITLE[charge]
  if (found.length === 1) {
    const one = found[0]
    return `${one.line} already has ${what} in its ${one.level} price.`
  }
  const levels = new Set(found.map((f) => f.level))
  if (levels.size === 1) {
    return `${au(found.length)} items already have ${what} in their ${found[0].level} price — ${listed(found.map((f) => f.line))}.`
  }
  const names = found.map((f) => `${f.line} (${f.level})`)
  return `${au(found.length)} items already have ${what} in their price — ${listed(names)}.`
}

/** THE PRICE LEVEL THE QUOTE IS ON, counted: "3 of 4 lines". */
export function levelCountSay(carriedBy: number, lines: number): string {
  return `${au(carriedBy)} of ${au(lines)} ${lines === 1 ? 'item' : 'items'} priced`
}

/** What pressing another price does, and where it is decided (docs/WORDS.md: "See the quote at
 *  Trade before you change it"); the press itself says the first half. */
export const LEVEL_SAY = 'Nothing on this quote changes until you choose.'

/** Said where a quote has no price level to move between. */
export const NO_LEVEL_SAY = 'Nothing on this quote has a second price, such as Trade.'

/** THAT THE WORK IS KEPT, or why it is not. The engine's `savedNote`
 *  ended "nothing here is held on the screen", which is a sentence
 *  about memory; what a dealer is owed is that closing the tab loses
 *  nothing. A storage fault is passed straight through.
 *
 *  A GIVEN QUOTE IS NOT WORK IN PROGRESS. "Saved as you go — close this
 *  and come back to it any time" stood on an issued, read-only quote
 *  (built-critique-m2-close-2.md minor 19), inviting a return to change
 *  something nothing can change; it is kept, as it was given. */
export function savedSay(problem: string | null, issued = false): string {
  if (problem !== null && problem !== '') return problem
  if (issued) return ''
  return 'Saved as you go.'
}

/** WHERE THE FINALE'S FIGURES CAME FROM. "Every price is the price
 *  file's own" is false on a quote whose boat the file holds at nought
 *  and the dealer priced by hand (`nought.ts`, m2-last-critique.md
 *  blocker 1), so that quote says which one is his. */
export function sourcesSay(quote: Pick<QuoteDef, 'lines' | 'sections'>): string {
  if (hullPriceOf(quote)?.state === 'typed') {
    return 'Every price but the boat’s is the price list’s, and includes tax. The price list has none for the boat, so its price is the one put on it in 01 The hull.'
  }
  return 'Every price is the price list’s, and includes tax.'
}

/** A clause with no leading capital and no full stop, as a sentence. */
export function sentenceOf(clause: string): string {
  return clause === ''
    ? ''
    : `${clause.charAt(0).toUpperCase()}${clause.slice(1)}${/[.?!]$/.test(clause) ? '' : '.'}`
}

/* ---------------------------------------------------------- */
/* The words a dealer never reads                              */
/* ---------------------------------------------------------- */

/**
 * THE ENGINE'S AND THE DEVELOPER'S WORDS, which no sentence on the
 * build, the cascade or the customers screen may print. Each entry is
 * a word the M2-close critique quoted off one of those screens, or its
 * obvious sibling. The screens' tests read their rendered text against
 * this list, so a word that comes back fails a test rather than
 * waiting for the next critic.
 *
 * Matched as whole words, case-blind. "Row" is a word here and "rows"
 * too; a code that contains the letters (BROW, ARROW) is not.
 */
export const ENGINE_WORDS: readonly RegExp[] = [
  /\brows?\b/i,
  /\bregisters?\b/i,
  /\brungs?\b/i,
  /\bre-?roots?\b/i,
  /\brepository\b/i,
  /\bcolumns?\b/i,
  /\bthis table\b/i,
  /\ba table\b/i,
  /\bon the shelf\b/i,
  /\bshortlist\b/i,
  /\bfrozen\b/i,
  /\bcommitted\b/i,
  /\b\d+\s?ms\b/i,
  /\bmilliseconds?\b/i,
  /\bsubject\b/i,
  /\bentity\b/i,
  /\bschema\b/i,
]

/** Every engine word a text contains, as it appears there. */
export function engineWordsIn(text: string): string[] {
  const found: string[] = []
  for (const word of ENGINE_WORDS) {
    const hit = word.exec(text)
    if (hit) found.push(hit[0])
  }
  return found
}

/** What the stage photograph shows, and what this quote carries that
 *  the photograph may not. `ours` is '' where the quote carries
 *  nothing the picture could be mistaken for. */
export interface PictureSay {
  shows: string
  ours: string
}

/** A list of names as a reader says it: "A", "A and B", "A, B and C". */
function listed(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1) ?? ''}`
}

/**
 * THE CAPTION FOR A PHOTOGRAPH ON THE STAGE, or null where the stage
 * draws a maker's mark or the name in type — neither of which shows a
 * boat anybody could mistake for the one being quoted.
 *
 * `shows` is the ledger's own subject line where the hero ledger has
 * one ("Highfield Sport 560 on the water"), and the packer's measured
 * verdict where only the catalogue copy is held. Either way it says
 * the finish and the rig are the maker's: the ledger records WHICH
 * MODEL a photograph depicts and nothing about the outboard or the
 * colourway in it, so the caption claims nothing about either beyond
 * whose choice they were.
 *
 * `ours` names what this quote carries in their place — the version
 * where the photograph is of the model and the quote one version of it,
 * and every motor line on the document. A quote with a
 * motor chapter and no motor on it says so rather than going quiet,
 * because the picture still shows one.
 */
export function pictureSays(
  art: StageArt,
  quote: QuoteDef,
  rail: Rail | null,
  ctx: CatalogueCtx,
): PictureSay | null {
  if (art.kind !== 'photograph') return null
  const held = art.held

  const shows =
    held.subject !== ''
      ? `${held.subject}, in the maker’s own finish and rig.`
      : held.verdict === 'scene'
        ? 'This model on the water, in the maker’s own finish and rig.'
        : held.verdict === 'studio'
          ? 'This model in its maker’s studio, in the maker’s own finish and rig.'
          : 'This model as its maker pictured it, in the maker’s own finish and rig.'

  const carries: string[] = []

  /* THE VERSION, where the photograph is of the model and this quote is
     one version of it that the file names in words: the Stacer 519 Sea
     Ranger SDF has one photograph and two consoles, so a quote on the
     Side Console says "Side Console" under a picture that may show the
     other (the M2-close critique, finding 11, which put the photograph
     on this stage for both). The words are the file's own, handed back
     by the one rule that matched the picture. */
  if (held.beyond !== '') carries.push(held.beyond)

  /* NOT THE FINISH: the boat's own material and colour stand under its name in the masthead, a
     few lines above, with a swatch of each colour (docs/WORDS.md, one fact once). The caption
     says only what the picture shows that the quote may not — the maker's finish, which its first
     line says — and the motor, which no other line near the picture names. */

  /* THE MOTOR, off the document's own lines and never off the picture, on a boat whose build
     has a motor chapter at all. SAID AS THE BOAT, NOT AS THE APP (the refine critique, 18): it
     read "This quote: the Yamaha F40LA · Tiller from 02 Motor.", pointing at where the screen
     keeps the choice. The chapter is one press away and says it in its own head; the caption
     says what is on this boat that the photograph may not show. */
  const chapter = rail?.chapters.find((c) => c.tables.some((t) => t.kind === 'motor'))
  if (chapter) {
    /* each as the paper names it, "the Yamaha F250XCB", never the file's
       "Yamaha - F250XCB" (m2-last-critique.md, major 4) */
    const motors = quote.lines
      .filter((line) => ctx.entities[line.entityId]?.kind === 'motor')
      .map((line) => saidOnQuote(quote, line))
    /* A GIVEN QUOTE TAKES NO MOTOR NOW, so "yet" is not said under a quote nothing can be added
       to (built-critique-m2-close-2.md minor 13). */
    carries.push(
      motors.length > 0
        ? `the ${listed(motors)}`
        : quote.state === 'draft'
          ? 'no motor yet'
          : 'no motor',
    )
  }

  return {
    shows,
    ours: carries.length === 0 ? '' : `On this quote: ${carries.join(', with ')}.`,
  }
}
