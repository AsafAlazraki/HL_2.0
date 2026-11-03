/* ============================================================
   WHAT THE REVIEW SCREEN SAYS — its words, off the counts and the
   cases the domain made (`src/domain/rules/review/checks.ts`,
   `cases.ts`). Nothing here counts anything; every figure arrives
   counted, and every sentence is built from what the file says.

   EVERY CASE IS SAID AS ITS FIX (direction E, judged 2026-10-28,
   after Dependabot's "Upgrade addressable to fix 1 alert"): the
   title is what the press does, the lede is why, in the file's own
   figures, and what does not move is said before the press, as
   Apple's storage panel says what is kept.

   IN THE DEALER'S WORDS (the judge of 2026-11-04, B5): a name is said
   by the one namer (`lineSaid`), and a word the file types in capitals
   ("YAMAHA", "MINN KOTA", "OBSOLETE PARTS") is said with its first
   letter only, short codes ("CYL", "PVC", "RT") kept as written. A toast
   says what the title says, never the file's whole string.
   ============================================================ */

import { lineSaid, nameFirst } from '@/domain/quote/spoken'
import { money } from '@/domain/money'
import type { Meant, Reband } from '@/domain/rules/review/checks'
import type { Case, CaseKind } from '@/domain/rules/review/cases'
import { saysWhatItComesWith } from '@/domain/rules/review/notes'
import type { LeftAs } from '@/domain/rules/review/standing'
import type { KindCounted } from '@/domain/rules/review/leftDay'
import type { PriceNow, PricesSaid } from '@/domain/rules/review/pricesNow'
import type { PrefValue } from '@/state/prefs'

export type { LeftAs }

/** Where this computer kept what a dealer left alone before 2026-11-04 (now kept with Northside's
 *  file, `OrgProfile.leftAlone`): still read, so nothing left before comes back unasked. */
export const MEANT_PREF = 'review.meant'

/** The meant record, read off a pref that may hold anything. */
export function meantOf(value: PrefValue | undefined): Meant {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(value)) if (typeof v === 'string') out[k] = v
  return out
}

/** The address's word for the case after the queue: the tidy suggestions. */
export const TIDY = 'tidy'

/** What each check is called while it finds something, the rail's chip, and what is true once
 *  it finds nothing — the clean day says the third, each with its tick, in the same order. */
export const CHECK_WORDS: Record<CaseKind, { wrong: string; chip: string; true: string }> = {
  boat: {
    wrong: 'A boat on sale at $0',
    chip: 'Boats at $0',
    true: 'Every boat on sale has a price.',
  },
  band: {
    wrong: 'Registered as the wrong size',
    chip: 'Wrong size',
    true: 'Every trailer is registered as the size its weight says.',
  },
  cost: {
    wrong: 'Sold below its cost',
    chip: 'Below cost',
    true: 'Nothing is sold below what it costs Northside.',
  },
  two: {
    wrong: 'One name, two prices',
    chip: 'Two prices',
    true: 'Every name on sale has one price.',
  },
  none: {
    wrong: 'On sale with no price',
    chip: 'No price',
    true: 'Every part and package on sale has a price.',
  },
  note: {
    wrong: 'A note on sale',
    chip: 'Notes on sale',
    true: 'No note or empty line is on sale.',
  },
  house: {
    wrong: 'Breaks the price list’s own rule',
    chip: 'Own rules broken',
    true: 'Every offer keeps the rules your price list asserts.',
  },
  twins: {
    wrong: 'Two headings, one name',
    chip: 'Two headings, one name',
    true: 'No list has two headings of one name.',
  },
  nameless: {
    wrong: 'Nothing to name it',
    chip: 'Nothing to name it',
    true: 'Every line on sale has a name.',
  },
}

/** A count with its noun. */
export const counted = (n: number, one: string, many: string): string =>
  `${n.toLocaleString('en-AU')} ${n === 1 ? one : many}`

export const kg = (n: number): string => `${n.toLocaleString('en-AU')} kg`

export const signed = (n: number): string => (n > 0 ? `+${money(n)}` : `−${money(-n)}`)

/** A list of names as a person reads one: "A, B and C", or "A, B and 4 more". */
export function andMore(names: readonly string[], shown = 2): string {
  if (names.length === 0) return ''
  if (names.length <= shown + 1) {
    if (names.length === 1) return names[0]!
    return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
  }
  return `${names.slice(0, shown).join(', ')} and ${names.length - shown} more`
}

/** "Sell", "Sell or Sell inc Install", "Cash, Trade or Warranty". */
export function joined(words: readonly string[], last: 'or' | 'and'): string {
  if (words.length <= 1) return words[0] ?? ''
  return `${words.slice(0, -1).join(', ')} ${last} ${words[words.length - 1]}`
}

/** A typed maker in place of a mark: the list's name less its kind ("REDCO / Tinka"). */
export const makerTyped = (tableName: string): string =>
  tableName.replace(/\s+(trailers|outboards|boats)$/i, '')

/**
 * WORDS THE FILE TYPES IN CAPITALS, said in a person's case: a run of capitalised words with one
 * of four letters or more in it is said with each word's first letter only ("MINN KOTA" is Minn
 * Kota, "NOT TO BE SUPPLIED" is Not To Be Supplied), and a short code on its own ("CYL", "PVC",
 * "RT", "DBW") or a word with a figure in it ("F150D", "2.8L") keeps its case.
 */
const isCaps = (w: string): boolean => /^[A-Z][A-Z'&/.-]*[A-Z]$/.test(w) && !/[0-9]/.test(w)

export function capsSaid(text: string): string {
  const tokens = text.split(/(\s+)/)
  const out = [...tokens]
  let i = 0
  while (i < tokens.length) {
    if (!isCaps(tokens[i] ?? '')) {
      i += 1
      continue
    }
    /* the run: capitalised words with only spaces between them */
    let j = i
    while (j + 2 < tokens.length && isCaps(tokens[j + 2] ?? '')) j += 2
    const run = tokens.slice(i, j + 1).filter((_, k) => k % 2 === 0)
    if (run.some((w) => w.replace(/[^A-Z]/g, '').length >= 4))
      for (let k = i; k <= j; k += 2) {
        const w = tokens[k]!
        out[k] = w.charAt(0) + w.slice(1).toLowerCase()
      }
    i = j + 1
  }
  return out.join('')
}

/**
 * A CATEGORY AS A PERSON READS IT. The price list types its categories in capitals
 * ("ANCHOR WINCHES - Lone Star"); a word in capitals is said with its first letter only, and a
 * code with a figure in it ("E163") keeps its case.
 */
export const spokenCategory = (category: string): string =>
  category
    .split(' ')
    .map((w) =>
      w.length > 2 && w === w.toUpperCase() && !/[0-9]/.test(w)
        ? w.charAt(0) + w.slice(1).toLowerCase()
        : w,
    )
    .join(' ')

/** the separator `lineSaid` puts between the parts of a name */
const SAID_SEP = ' · '

/**
 * A trailer as the build says it, less its series and the maker's word where the maker's mark
 * stands beside it: "DUNBIER Alloy Loader Pro Series – ALP 5.3M-13B …" under Dunbier's mark is
 * the ALP 5.3M-13B.
 */
export function trailerSaid(line: TrailerLine): string {
  const whole = nameFirst(lineSaid(line.label, line.tableName), line.code || undefined)
  const pieces = whole.split(SAID_SEP)
  const said =
    pieces.length > 1 && /\bseries$/i.test(pieces[0] ?? '') ? pieces.slice(1).join(SAID_SEP) : whole
  const words = said.split(' ')
  return words.length > 1 && makersOf(line.tableName).has(words[0]?.toLowerCase() ?? '')
    ? words.slice(1).join(' ')
    : said
}

/** The model alone, as a sentence says it: "ALP 5.3M-13B", without its rating in brackets or the
 *  word "Trailer" the sentence already ends on. WHAT THE FILE WRITES AFTER THE RATING STAYS (the
 *  verifier of 2026-11-04, round 2, minor 2): Dunbier carries two ALP 5.3M-13Bs, "… (1,450kgs)"
 *  and "… (1,450kgs) Fibreglass Boat", and a title that dropped the second's last words named the
 *  one already registered Large. */
export function trailerModel(line: TrailerLine): string {
  const model = trailerSaid(line)
    /* only a rating in brackets goes, "(1,450kgs)"; a code in brackets is the model */
    .replace(/\s*\(\s*[\d,.]+\s*(?:kgs?|t)?\s*\)/gi, ' ')
    /* the rating the namer says after a dot where the file ends on it: "… · 1,450 kgs" */
    .replace(/\s+·\s+[\d,.]+\s*(?:kgs?|t)?\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+trailer$/i, '')
  /* A NAME THAT IS ITS CODE KEEPS IT: Tinka's "TINKA Aluminium - TA450MO-B" is said "Aluminium"
     once its code is set aside, which is also what its TA450 brother is called */
  const code = line.code.trim()
  return code !== '' &&
    line.label.toLowerCase().includes(code.toLowerCase()) &&
    !model.toLowerCase().includes(code.toLowerCase())
    ? `${model}${SAID_SEP}${code}`
    : model
}

/** What a trailer namer reads off a line: its name in the file, its list and its code. */
type TrailerLine = Pick<Reband, 'label' | 'tableName' | 'code'>

/** The words of a list's own name, lower-cased: "Dunbier Trailers" is dunbier and trailers. */
const makersOf = (tableName: string): Set<string> =>
  new Set(
    tableName
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 1),
  )

/**
 * THE SERIES A TRAILER IS SOLD IN, as a person reads it beside the maker's mark: the file's
 * "DUNBIER Alloy Loader Pro Series - ALP 5.3M-13B …" under Dunbier's mark is the Alloy Loader
 * Pro Series (built-critique-m3-2.md, M13). The maker's own word is left to the mark, and a word
 * the file types in capitals is said with its first letter only. '' where the name does not lead
 * with a series.
 */
export function trailerSeries(line: TrailerLine): string {
  const pieces = nameFirst(lineSaid(line.label, line.tableName), line.code || undefined).split(
    SAID_SEP,
  )
  const first = pieces[0] ?? ''
  if (pieces.length < 2 || !/\bseries$/i.test(first)) return ''
  const words = spokenCategory(first).split(' ')
  return (
    makersOf(line.tableName).has(words[0]?.toLowerCase() ?? '') ? words.slice(1) : words
  ).join(' ')
}

/**
 * A COLUMN'S NAME AS A HEADING, without the unit the file writes after it in brackets: "ATM (KG)"
 * is ATM and "Rego ($)" is Rego (built-critique-m3-2.md, M13). The unit is said with the figure
 * instead, "1,450 kg" and "$166", so it is said once.
 */
export const heading = (name: string): string =>
  name.replace(/\s*\((?:kgs?|\$|%|mm|m|hp|ltr)\)\s*$/i, '').trim() || name

/** A price's name in a sentence: "Sell inc Install (if appl.)" is Sell inc Install. */
export const priceSaid = (name: string): string =>
  name.replace(/\s*\(if appl\.?\)\s*$/i, '').trim() || name

/**
 * WHERE A SIZE IS READ FROM, as the dealer reads it: the fee list's own label alone ("“Up to
 * 1.02t”"), without the workbook's cell address ("Registration Costs!C16") the band record keeps
 * beside it. null where the record holds no quoted label.
 */
export function labelRead(readFrom: string): string | null {
  const label = readFrom.split(' · ')[0]?.trim() ?? ''
  return /^“.+”$/.test(label) ? label : null
}

/** A name in a list as the build says it, in a person's case: "Minn Kota · RT Terrova". */
export const nameSaid = (name: string, tableName: string): string =>
  capsSaid(lineSaid(name, tableName))

/** A boat in a sentence: the maker's dash and the brackets said as the namer says them. */
export const boatSaid = (name: string, tableName: string): string => nameSaid(name, tableName)

/** What a list's lines are, in a title: "boats", "trailers", "kits" or "lines". */
const nounOf = (tableKind: string | undefined, n: number): string =>
  tableKind === 'boat'
    ? n === 1
      ? 'boat'
      : 'boats'
    : tableKind === 'trailer'
      ? n === 1
        ? 'trailer'
        : 'trailers'
      : n === 1
        ? 'line'
        : 'lines'

/** Where a line came from in the workbook, as a person says it. */
export const sourceSaid = (source: { tab: string; line: number } | null): string =>
  source ? `line ${source.line.toLocaleString('en-AU')} of the ${source.tab} tab` : ''

/** Do two prices' codes differ, so the lines may be two products? */
export const codesDiffer = (c: Extract<Case, { kind: 'two' }>): boolean =>
  new Set(c.item.lines.map((l) => l.code).filter((code) => code !== '')).size > 1

/** Does every line of a $0 case say what it comes with? Then its $0 is likely meant. */
export const allSayWhatTheyComeWith = (c: Extract<Case, { kind: 'none' }>): boolean =>
  c.group.kind === 'zero' && c.group.lines.every((l) => saysWhatItComesWith(l.name))

/**
 * THE CASE'S TITLE: the fix, said as the press does it.
 */
export function titleOf(c: Case, tableKind?: string): string {
  switch (c.kind) {
    case 'band': {
      const name = trailerModel(c.line)
      return c.line.to
        ? `Rego the ${name} as a ${c.line.to.word} trailer.`
        : `Choose the rego type for the ${name}.`
    }
    case 'two':
      return codesDiffer(c)
        ? `Choose one price for the ${capsSaid(trailerSaid({ label: c.item.name, tableName: c.tableName, code: '' }))}, or name the two apart.`
        : `Choose one price for the ${capsSaid(trailerSaid({ label: c.item.name, tableName: c.tableName, code: '' }))}.`
    case 'boat': {
      const g = c.group
      const n = g.lines.length
      return n === 1
        ? `Price the ${boatSaid(g.lines[0]?.name ?? '', g.tableName)}, on sale at $0.`
        : `Price the ${n} ${makerTyped(g.tableName)} boats on sale at $0.`
    }
    case 'none': {
      const g = c.group
      const n = g.lines.length
      const what =
        n === 1
          ? nameSaid(g.lines[0]?.name ?? '', g.tableName)
          : g.category
            ? `the ${n} lines in ${spokenCategory(g.category)}`
            : `the ${n} ${g.tableName} ${nounOf(tableKind, n)}`
      if (allSayWhatTheyComeWith(c))
        return `Leave ${what} at $0, as ${n === 1 ? 'it says' : 'each says'} what ${n === 1 ? 'it comes' : 'they come'} with.`
      return g.kind === 'zero'
        ? `Price ${what}, or leave ${n === 1 ? 'it' : 'them'} at $0.`
        : `Give ${what} a price.`
    }
    case 'cost': {
      const g = c.group
      const n = g.lines.length
      return n === 1
        ? `Raise the ${priceSaid(g.priceName)} of ${nameSaid(g.lines[0]?.name ?? '', g.tableName)} above its cost.`
        : `Raise the ${priceSaid(g.priceName)} of ${n} lines in ${g.tableName} above their cost.`
    }
    case 'note': {
      const g = c.group
      const n = g.lines.length
      const empty = g.lines.filter((l) => l.why === 'empty').length
      const what =
        empty === n
          ? n === 1
            ? 'the empty line'
            : `the ${n} empty lines`
          : empty === 0
            ? n === 1
              ? 'the note'
              : `the ${n} notes`
            : `the ${n} notes and empty lines`
      return `Take ${what} in ${g.tableName} off sale.`
    }
    case 'house': {
      const n = c.clause.breaks.length
      return n === 1
        ? 'Correct the offer that breaks your price list’s own rule.'
        : `Correct the ${n} offers that break your price list’s own rule.`
    }
    case 'twins':
      return `Rename one of the two “${c.twin.name}” headings in ${c.twin.tableName}.`
    case 'nameless': {
      const n = c.group.items.length
      return n === 1
        ? `Name the line in ${c.group.tableName} that has no name.`
        : `Name the ${n} lines in ${c.group.tableName} that have no name.`
    }
  }
}

/**
 * WHERE A CASE'S LINES STAND ON SALE, said only as true of every line (the verifier's gap 4): "at
 * $0 at Sell and Sell inc Install" where every line holds $0 at both, "at $0 at Sell, with no Sell
 * inc Install" where every one leaves the second blank, and "at $0 or blank at …" where the lines
 * differ, each line then saying its own. Without what the lines read, the list's prices are said
 * as the check found them.
 */
export function onSaleAt(
  kind: 'zero' | 'blank',
  priceNames: readonly string[],
  prices?: PricesSaid,
): string {
  if (kind === 'blank') return `on sale with no price at ${joined(priceNames.map(priceSaid), 'or')}`
  if (!prices) return `on sale at $0 at ${joined(priceNames.map(priceSaid), 'and')}`
  /* in the list's own order of its prices, a run of prices read alike said together */
  const stateOf = (n: string): 'zero' | 'blank' | 'mixed' =>
    prices.zeroAll.includes(n) ? 'zero' : prices.blankAll.includes(n) ? 'blank' : 'mixed'
  const runs: Array<{ state: 'zero' | 'blank' | 'mixed'; names: string[] }> = []
  for (const n of priceNames) {
    const state = stateOf(n)
    const last = runs.at(-1)
    if (last && last.state === state) last.names.push(priceSaid(n))
    else runs.push({ state, names: [priceSaid(n)] })
  }
  const said = runs.map((r) =>
    r.state === 'zero'
      ? `at $0 at ${joined(r.names, 'and')}`
      : r.state === 'blank'
        ? `with no ${joined(r.names, 'or')}`
        : `at $0 or blank at ${joined(r.names, 'and')}`,
  )
  return `on sale ${joined(said, 'and')}`
}

/** One line's prices as it reads them, where the lines of its case differ: "$0 at Sell · no Sell
 *  inc Install". */
export const pricesOfLine = (now: readonly PriceNow[]): string =>
  now.map((p) => (p.zero ? `$0 at ${priceSaid(p.label)}` : `no ${priceSaid(p.label)}`)).join(' · ')

/**
 * WHAT A TYPED PRICE LEAVES (the judge's J3b, and the verifier's gap 4): each other price a line
 * needs, said as it reads now and stays until it is set on its line — "$0" where the line holds
 * $0 there, "blank" where it holds nothing, never "blank" of a cell that holds $0. '' where a typed
 * price leaves nothing.
 */
export function staysSaid(
  lines: ReadonlyArray<{ needs: readonly string[]; now: readonly PriceNow[] }>,
  boat: boolean,
): string {
  const needing = lines.filter((l) => l.needs.length > 0)
  if (needing.length === 0) return ''
  const labels = [...new Set(needing.flatMap((l) => l.needs))]
  const stateOf = (label: string): 'zero' | 'blank' | 'mixed' => {
    const states = new Set(
      needing
        .filter((l) => l.needs.includes(label))
        .map((l) => (l.now.find((p) => p.label === label)?.zero ? 'zero' : 'blank')),
    )
    return states.size > 1 ? 'mixed' : states.has('zero') ? 'zero' : 'blank'
  }
  const one = lines.length === 1
  const byState = (['zero', 'blank', 'mixed'] as const)
    .map((st) => ({ st, of: labels.filter((l) => stateOf(l) === st).map(priceSaid) }))
    .filter((x) => x.of.length > 0)
  const verb = (n: number): string => (boat || n > 1 ? 'stay' : 'stays')
  const how = (st: 'zero' | 'blank' | 'mixed'): string =>
    st === 'zero' ? '$0' : st === 'blank' ? 'blank' : one ? 'as it reads' : 'as each reads'
  const said = byState.map((x) => `${joined(x.of, 'and')} ${verb(x.of.length)} ${how(x.st)}`)
  if (boat)
    return `${capitalOf(joined(said, 'and'))} until they are set on the line in the price list.`
  const whose =
    needing.length === lines.length
      ? one
        ? 'Its'
        : 'Each one’s'
      : `${needing.length} of them carry an install type, and each one’s`
  return `${whose} ${joined(said, 'and')} until it is set on its line in the price list.`
}

const capitalOf = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

/** "2 cases settled and 1 case new", "3 cases settled", "1 case new": since the Master Price File. */
export function sinceSaid(settled: number, arrived: number): string {
  const said = [
    settled > 0 ? `${counted(settled, 'case', 'cases')} settled` : '',
    arrived > 0 ? `${counted(arrived, 'case', 'cases')} new` : '',
  ].filter((p) => p !== '')
  return said.join(' and ')
}

/**
 * A CHECK THAT STILL FINDS SOMETHING ON THE CLEAN DAY, because Northside left it alone — counted as
 * it is said (the verifier's gaps 1 and 2, `leftDay.ts`): the trailers' money split by its way,
 * never the 7's figure on all 9, and a line counted once however many prices it is below cost at.
 */
export function leftSentence(kind: CaseKind, n: KindCounted): string {
  const by = 'left alone by your choice'
  switch (kind) {
    case 'band': {
      const ways = [
        n.under.n > 0 ? `${n.under.n} charged ${money(n.under.sum)} too little` : '',
        n.over.n > 0 ? `${n.over.n} charged ${money(n.over.sum)} too much` : '',
      ].filter((w) => w !== '')
      return `${counted(n.cases, 'trailer is', 'trailers are')} still registered as the wrong size, ${by}${ways.length > 0 ? `: on one sale of each, ${joined(ways, 'and')}` : ''}.`
    }
    case 'boat':
      return `${counted(n.lines, 'boat is', 'boats are')} still on sale at $0, ${by}.`
    case 'none':
      return `${counted(n.lines, 'line is', 'lines are')} still on sale with no price, ${by}.`
    case 'cost': {
      const both =
        n.twice === 0
          ? ''
          : n.twice === n.lines
            ? n.lines === 1
              ? ' at both its prices'
              : ', each at both its prices'
            : `, ${n.twice} of them at both their prices`
      return `${counted(n.lines, 'line still sells below its cost', 'lines still sell below their cost')}${both}, ${by}.`
    }
    case 'two':
      return `${counted(n.cases, 'name is', 'names are')} still at two prices, ${by}.`
    case 'note':
      return `${counted(n.lines, 'note is', 'notes are')} still on sale, ${by}.`
    case 'house':
      return `${counted(n.findings, 'offer still breaks', 'offers still break')} a rule your price list asserts, ${by}.`
    case 'twins':
      return `${counted(n.cases, 'pair of headings still shares', 'pairs of headings still share')} a name, ${by}.`
    case 'nameless':
      return `${counted(n.lines, 'line is', 'lines are')} still on sale with no name, ${by}.`
  }
}

/** THE CASE'S LEDE: why, in the file's own figures. `prices` is what a no-price case's lines read
 *  at each price, so the lede says only what every line holds. */
export function ledeOf(c: Case, prices?: PricesSaid): string {
  switch (c.kind) {
    case 'band': {
      const l = c.line
      const size =
        l.way === 'heavier'
          ? `a size the fee list’s own label stops at ${kg(l.boundKg)}`
          : `a size the fee list’s own label starts at ${kg(l.boundKg)}`
      const cost = !l.to
        ? ''
        : l.to.delta > 0
          ? ` Every one sold is charged ${money(l.to.delta)} too little.`
          : l.to.delta < 0
            ? ` Every one sold is charged ${money(-l.to.delta)} too much.`
            : ''
      return `It is rated ${kg(l.atmKg)} and registered ${l.word}, ${size}.${cost}`
    }
    case 'two': {
      const n = c.item.lines.length
      const apart = codesDiffer(c)
        ? ` Their codes differ, so they may be two products under one name.`
        : ''
      return `${n === 2 ? 'Two' : n} lines in ${c.tableName} carry this name, at ${money(c.item.low)} and ${money(c.item.high)} ${c.priceName}. A salesperson who finds it by name could quote either.${apart}`
    }
    case 'boat': {
      const g = c.group
      const one = g.lines.length === 1
      const like = g.lines.find((l) => l.beside)?.beside
      const scale = like
        ? ` The ${boatSaid(like.name, g.tableName)}, the boat most like ${one ? 'it' : 'them'} in the list, sells at ${money(like.price)} ${g.priceName}.`
        : ''
      return `${one ? 'It is' : 'They are'} ${onSaleAt(g.kind, g.priceNames, prices)}, so a quote for ${one ? 'it' : 'one'} is a $0 quote.${scale}`
    }
    case 'none': {
      const g = c.group
      const one = g.lines.length === 1
      if (allSayWhatTheyComeWith(c))
        return `${one ? 'It is' : 'They are'} ${onSaleAt(g.kind, g.priceNames, prices)}, and ${one ? 'its name says' : 'each name says'} it comes with something already priced, so $0 is likely meant. If not, ${one ? 'it is' : 'each is'} priced on its own line in the price list.`
      return g.kind === 'zero'
        ? `${one ? 'It is' : 'They are'} ${onSaleAt(g.kind, g.priceNames, prices)}. If ${one ? 'it comes' : 'they come'} with something else, $0 is meant; if not, type ${one ? 'its' : 'each one’s'} price.`
        : `${one ? 'It is' : 'They are'} ${onSaleAt(g.kind, g.priceNames, prices)}, so a quote with ${one ? 'it' : 'one'} on it is $0.`
    }
    case 'cost': {
      const g = c.group
      const one = g.lines.length === 1
      return `${one ? 'It sells' : 'They sell'} at ${priceSaid(g.priceName)} for less than ${one ? 'it costs' : 'they cost'} Northside, so every one sold loses money. ${counted(g.lines.length, 'line', 'lines')} of the ${g.tested.toLocaleString('en-AU')} that carry both a ${priceSaid(g.priceName)} and its cost ${g.lines.length === 1 ? 'does' : 'do'}.`
    }
    case 'note': {
      const g = c.group
      const one = g.lines.length === 1
      const empty = g.lines.every((l) => l.why === 'empty')
      return empty
        ? `${one ? 'It has' : 'They have'} no name, no code and no price, and ${one ? 'is' : 'are'} on sale, so a salesperson could pick a blank line. Taken off sale, ${one ? 'it stays' : 'they stay'} in the price list and nothing offers ${one ? 'it' : 'them'}.`
        : `${one ? 'It is a note' : 'They are notes and lines'} the price list keeps for whoever orders, on sale as if ${one ? 'it were a product' : 'they were products'}. A note is not priced or named: taken off sale, it stays in the price list and nothing offers it.`
    }
    case 'house': {
      const cl = c.clause
      return `Your price list says: “${cl.said}” It holds on ${cl.held.toLocaleString('en-AU')} of the ${cl.tested.toLocaleString('en-AU')} offers it writes both sides of; ${cl.breaks.length === 1 ? 'this one breaks it' : `these ${cl.breaks.length} break it`}. Each is a line in the price list, corrected there.`
    }
    case 'twins':
      return `Anything that reads “${c.twin.name}” on a line of ${c.twin.tableName} could read either, and get the wrong one.`
    case 'nameless': {
      const one = c.group.items.length === 1
      return `${one ? 'It is' : 'They are'} on sale with nothing in ${c.group.items[0]?.nameField.name ?? 'its name'}, so a salesperson sees a blank line where ${one ? 'its' : 'each'} name should be.`
    }
  }
}

/** When a case left alone comes back on its own: said beside the two reasons, before the press. */
export function comesBackOf(c: Case): string {
  switch (c.kind) {
    case 'band':
      return 'it comes back if its weight or its size changes.'
    case 'two':
      return 'it comes back if either price changes.'
    case 'cost':
      return `${c.group.lines.length === 1 ? 'it comes' : 'each comes'} back if its price changes.`
    case 'boat':
    case 'none':
      return c.group.kind === 'zero'
        ? `${c.group.lines.length === 1 ? 'it comes' : 'each comes'} back if its $0 is cleared.`
        : `${c.group.lines.length === 1 ? 'it comes' : 'each comes'} back if it is given $0.`
    case 'note':
    case 'house':
    case 'twins':
    case 'nameless':
      return 'nothing in the price list changes.'
  }
}

/** How a case is said in the queue: its title, and its money where it has some. */
export function peekOf(c: Case, tableKind?: string): { title: string; money: string } {
  const delta = c.kind === 'band' ? (c.line.to?.delta ?? 0) : 0
  return {
    title: titleOf(c, tableKind),
    money: c.kind === 'boat' ? 'a $0 quote' : delta === 0 ? '' : signed(delta),
  }
}

/** What leaving it alone writes, said in the toast. */
export function leftSaid(n: number, as: LeftAs): string {
  const what = n === 1 ? 'It is' : `All ${n} are`
  return as === 'meant' ? `${what} left as meant.` : `${what} left, as a place the check is wrong.`
}

/**
 * ONE NEIGHBOUR, SAID ONCE (built-critique-m3-2.md, minor): the nine Formosa lines with no price
 * all have the same boat beside them, so it is said once over them; null when there is one line,
 * or when they differ.
 */
export function besideOnce<B extends { rowId: string }>(
  lines: ReadonlyArray<{ beside: B | null }>,
): B | null {
  const first = lines[0]?.beside
  if (lines.length < 2 || !first) return null
  return lines.every((l) => l.beside?.rowId === first.rowId) ? first : null
}

/**
 * A MODEL CODE IS NEVER BROKEN AT ITS HYPHEN (built-critique-m3-2.md, minor): at 390 the
 * headline wrapped "ALP 5.3M-13B" as "ALP 5.3M-" over "13B". A word joined by a hyphen between
 * two letters or figures, up to 20 characters, is handed back as one run to keep whole; every
 * other run may wrap where it likes.
 */
export function wholeRuns(text: string): Array<{ at: number; text: string; whole: boolean }> {
  const out: Array<{ at: number; text: string; whole: boolean }> = []
  let at = 0
  for (const m of text.matchAll(/[^\s]*[A-Za-z0-9]-[A-Za-z0-9][^\s]*/g)) {
    if (m[0].length > 20) continue
    if (m.index > at) out.push({ at, text: text.slice(at, m.index), whole: false })
    out.push({ at: m.index, text: m[0], whole: true })
    at = m.index + m[0].length
  }
  if (at < text.length) out.push({ at, text: text.slice(at), whole: false })
  return out
}

/** A heading's letter in the workbook, off the description the file wrote for it ("Rigging Kits!M
 *  · labelled here …" is column M). '' where the description names none. */
export const columnLetter = (description: string | undefined): string =>
  /![A-Z]{1,3}\b/.exec(description ?? '')?.[0].slice(1) ?? ''

/** A day and time as a dealer reads one: "4 Nov 2026, 9:12 am". '' for no instant. */
export function whenSaid(iso: string): string {
  if (iso === '') return ''
  const at = new Date(iso)
  if (Number.isNaN(at.getTime())) return ''
  return at.toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
