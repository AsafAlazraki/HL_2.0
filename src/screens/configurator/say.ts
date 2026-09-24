/* ============================================================
   TWO SENTENCES THE CONFIGURATOR BUILDS FROM COUNTS AND FROM THE
   DOCUMENT, kept out of the JSX so each has one place to be right and
   a test that holds it there.

   `linesSay` is the masthead's line under the running total. It said
   "1 of them carry no price at all" (built-critique-m2.md #25) — a
   counted figure with the wrong verb, the kind of fault this repo has
   fixed twice already, so the agreement is now a function with a case
   per count rather than a template with a plural baked in.

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
   below says the same fact in the words a dealer uses — a hull, a
   finish, a price level, what is paired with this hull — and each is
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
/* types only: `chapters.ts` reads `chargeSay` from here, so a value
   import back would be a cycle */
import type { Chapter, ChapterTable, Rail } from './chapters'
import type { StageArt } from './stage'

/** en-AU digits, so a large count is written the way every other
 *  figure on the screen is. */
const au = (n: number): string => n.toLocaleString('en-AU')

/** The line under the running total: how many lines, and how many of
 *  them carry no price — with the verb agreeing with the count, and in
 *  the words the customer's paper prints for such a line (`cellWord`,
 *  "Not priced on this quote"), so the build, the cascade and the paper
 *  say one thing about it (built-critique-m2-close-2.md blocker 3). */
export function linesSay(lines: number, unpriced: number): string {
  const head =
    lines === 1
      ? '1 line, at the price it was picked at'
      : `${au(lines)} lines, each at the price it was picked at`
  if (unpriced <= 0) return head
  if (lines === 1) return `${head} · it is not priced on this quote`
  if (unpriced === 1) return `${head} · 1 of them is not priced on this quote`
  return `${head} · ${au(unpriced)} of them are not priced on this quote`
}

/** THE LINE UNDER THE RUNNING TOTAL, where the boat itself has no
 *  price (a Haines Signature, which the file holds at nought —
 *  m2-last-critique.md blocker 1). "$8,473 · 3 lines, 2 of them not
 *  priced" under a boat's name reads as the boat's price; the figure is
 *  everything but the boat, and the line under it says so first. */
export function totalSay(lines: number, unpriced: number, boatUnpriced: boolean): string {
  if (!boatUnpriced) return linesSay(lines, unpriced)
  const head = 'The boat has no price yet, so this is everything but the boat'
  const others = unpriced - 1
  if (others <= 0) return head
  return `${head} · ${others === 1 ? '1 more line is' : `${au(others)} more lines are`} not priced on this quote`
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
  return ` · ${au(chapter.offered)} to choose from`
}

/** THE COUNTED LINE OVER A LIST: how many are drawn, of how many the
 *  whole list holds, and what that narrowing is. "4 of 209 paired with
 *  this hull" where the price file wrote the pairings down; "offered"
 *  where a rule or nothing narrows it. Every figure is `stepOffer`'s. */
export function countsSay(table: ChapterTable, query: string): string {
  const counts = table.counts
  const drawn = Math.max(0, counts.admitted - counts.heldCount)
  /* named `clauses` because the cost guard reads a variable called
     parts, followed by a method, as a Parts-table cost column — and it
     is right to be that strict */
  const clauses = [
    `${au(drawn)} of ${au(counts.catalogue)} ${table.paired && !table.showingAll ? 'paired with this hull' : 'offered'}`,
  ]
  if (counts.heldCount > 0) clauses.push(`${au(counts.heldCount)} more no longer sold`)
  if (query !== '' && counts.matched > 0) clauses.push(`${au(counts.matched)} match`)
  if (counts.capped) clauses.push(`the first ${au(OFFER_CAP)} are shown`)
  return clauses.join(' · ')
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

/** A LIST WHOSE TABLE CARRIES NO PRICE AT ALL, said once over it. */
export function unpricedSay(table: ChapterTable): string {
  return table.unpriced
    ? `The price file gives ${table.title} no prices, so anything from it goes on this quote unpriced.`
    : ''
}

/** WHAT THE SWITCH UNDER A LIST DOES, and what it leaves out. */
export function allSay(table: ChapterTable): string {
  const counts = table.counts
  const said = table.showingAll
    ? `Everything in ${table.title} is listed. Whatever is not paired with this hull says why on its own line.`
    : `Anything in ${table.title} can go on this quote. Whatever is not paired with this hull says so on its own line.`
  const gone = counts.pool - counts.catalogue
  return gone > 0
    ? `${said} ${au(gone)} ${gone === 1 ? 'is' : 'are'} no longer sold and ${gone === 1 ? 'is' : 'are'} left out.`
    : said
}

/** THE SENTENCE UNDER THE SEARCH FIELD, resting and answering. */
export function searchSay(rail: Rail | null, open: boolean): string {
  if (!open) return 'There is nothing to search until the Master Price File is loaded.'
  if (rail === null) return ''
  if (!rail.searching) {
    return 'Type a name or a code and every chapter narrows to what matches — including what is not paired with this hull.'
  }
  if (rail.hits === 0) return 'Nothing on this quote is called that, in any chapter.'
  const beyond = rail.beyond > 0 ? ` — ${au(rail.beyond)} of them not paired with this hull` : ''
  const capped =
    rail.drawn < rail.hits ? ` The first ${au(OFFER_CAP)} in each chapter are shown.` : ''
  return `${au(rail.hits)} ${rail.hits === 1 ? 'option matches' : 'options match'}, each under its chapter${beyond}.${capped}`
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
    return `${au(found.length)} lines already have ${what} in their ${found[0].level} price — ${listed(found.map((f) => f.line))}.`
  }
  const names = found.map((f) => `${f.line} (${f.level})`)
  return `${au(found.length)} lines already have ${what} in their price — ${listed(names)}.`
}

/** THE PRICE LEVEL THE QUOTE IS ON, counted: "3 of 4 lines". */
export function levelCountSay(carriedBy: number, lines: number): string {
  return `${au(carriedBy)} of ${au(lines)} ${lines === 1 ? 'line' : 'lines'}`
}

/** What pressing another price level does, and where it is decided. */
export const LEVEL_SAY =
  'Another price level re-prices every line. You see what each one would cost before anything on this quote changes.'

/** Said where a quote has no price level to move between. */
export const NO_LEVEL_SAY =
  'No line on this quote has another price level, so there is nothing to move it to.'

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
  if (issued) return 'Kept in this browser exactly as it was given.'
  return 'Saved as you go — close this and come back to it any time.'
}

/** WHERE THE FINALE'S FIGURES CAME FROM. "Every price is the price
 *  file's own" is false on a quote whose boat the file holds at nought
 *  and the dealer priced by hand (`nought.ts`, m2-last-critique.md
 *  blocker 1), so that quote says which one is his. */
export function sourcesSay(quote: Pick<QuoteDef, 'lines' | 'sections'>): string {
  if (hullPriceOf(quote)?.state === 'typed') {
    return 'Every price but the boat’s is the price file’s own, with tax included. The file holds no price for the boat, so its price is the one put on it in 01 The hull. Nothing is converted and no tax is added on top.'
  }
  return 'Every price is the price file’s own, with tax included, so nothing on this quote is converted and no tax is added on top.'
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
 * `ours` names what this quote carries in their place — the hull's
 * finish where the model comes in more than one, and every motor line
 * on the document with the chapter it is chosen in. A quote with a
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
      ? `${held.subject}, as its maker photographed it — the maker’s own finish and rig.`
      : held.verdict === 'scene'
        ? 'This model on the water, as its maker photographed it — the maker’s own finish and rig.'
        : held.verdict === 'studio'
          ? 'This model in its maker’s own studio picture — the maker’s own finish and rig.'
          : 'This model as its maker pictured it — the maker’s own finish and rig.'

  const carries: string[] = []

  /* THE VERSION, where the photograph is of the model and this quote is
     one version of it that the file names in words: the Stacer 519 Sea
     Ranger SDF has one photograph and two consoles, so a quote on the
     Side Console says "Side Console" under a picture that may show the
     other (the M2-close critique, finding 11, which put the photograph
     on this stage for both). The words are the file's own, handed back
     by the one rule that matched the picture. */
  if (held.beyond !== '') carries.push(held.beyond)

  /* THE FINISH, where there is a choice of one. A model filed as one
     row has no finish to be mistaken, so nothing is said. */
  const hull = rail?.chapters.find((c) => c.finishes !== undefined)
  const finish = hull?.finishes?.rows.find((f) => f.current)
  if (finish && (hull?.finishes?.rows.length ?? 0) > 1) {
    /* IN WORDS (built-critique-m2-close-2.md): "Hypalon in Black / Grey /
       Black", not "HYP B-G-B"; a code the decode cannot read is the code */
    const colour = finish.colour.read ? finish.colour.say : finish.colour.code
    const word = [finish.materialSaid, colour].filter((w) => w !== '').join(' in ')
    if (word !== '') carries.push(word)
  }

  /* THE MOTOR, off the document's own lines and never off the picture.
     The chapter is named by the rail's own number and name, so the
     sentence points at the place the choice is made. */
  const chapter = rail?.chapters.find((c) => c.tables.some((t) => t.kind === 'motor'))
  if (chapter) {
    const where = chapter.num === '' ? chapter.name : `${chapter.num} ${chapter.name}`
    /* each as the paper names it, "the Yamaha F250XCB", never the file's
       "Yamaha - F250XCB" (m2-last-critique.md, major 4) */
    const motors = quote.lines
      .filter((line) => ctx.entities[line.entityId]?.kind === 'motor')
      .map((line) => saidOnQuote(quote, line))
    /* A GIVEN QUOTE TAKES NO MOTOR NOW, so it is not invited to: "02
       Motor is where one goes on" stood under a quote nothing can be
       added to (built-critique-m2-close-2.md minor 13). */
    carries.push(
      motors.length > 0
        ? `the ${listed(motors)} from ${where}`
        : quote.state === 'draft'
          ? `no motor yet — ${where} is where one goes on`
          : 'no motor',
    )
  }

  return {
    shows,
    ours: carries.length === 0 ? '' : `This quote: ${carries.join(', with ')}.`,
  }
}
