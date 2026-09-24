/* ============================================================
   HOW A PERSON SAYS A BOAT — "Highfield ADV7 · Hypalon · Black /
   Grey / Black", where the file writes "Highfield - ADV7 (HYP) B-G-B".

   The critique of Milestone 2's second close
   (docs/directions/built-critique-m2-close-2.md, major 5 and its one
   thing to change first) found the file's key string as the headline
   of the build, the row of the register, the line of History, the
   customer's card, the cascade and 36px on page 1 of the quotation.
   The words were already half in the app — `colourway.ts` decodes the
   colourway — and printed on one caption. This is the one place a
   boat's name is said, and every screen asks it.

   WHERE EVERY WORD COMES FROM, and nothing else:

     maker      the register's own maker, as its rows write it before
                " - " — `data/northside/names.json` `makers`, each with
                the rows that say so.
     model      the file's own words where it has them ("519 Sea Ranger
                SDF", "1450 Frontier", "Coaster"). Where the file carries
                only a code (Highfield's ADV7, SP560, PA600ST), the
                maker's own page for that model, read and recorded in the
                ledger's `models` with its address: SP560 is "Sport 560"
                because highfieldboats.com's page for it is headed "Sport
                560". The letters the page does not name (ST, EW, KAM,
                WL(Windlass)) are kept as the file writes them, so
                PA600ST is "Patrol 600 ST" and never a guess at what ST
                stands for. A code no page names (SP300) is the code.
                THE MAKER CALLS THE ADV7 "ADV7" — its page is headed
                "ADV7" and titled "Highfield ADV 7" — so that is its
                name, and "Adventure 7" (a caption somebody wrote) is not.
     material   the ledger's `materials`: HYP is Hypalon, PVC is PVC,
                with the evidence for each. A material code the ledger
                does not carry is printed as written.
     colourway  `colourwayOf`, all or nothing: B-G-B is "Black / Grey /
                Black", and O-G-DG (O has no decode) is "O-G-DG".

   THE FILE'S OWN STRING IS KEPT. `label` is the key verbatim, for the
   dealer who orders by it; a screen prints it where the dealer needs it
   (the sheet, the note beside the paper) and never on the customer's
   paper.

   ONLY PUNCTUATION IS TIDIED, never a word: runs of spaces are one,
   a spaced hyphen between two parts of a name ("495 - Pro Fisher",
   "Signature Sport Fisher- 543SF") is a space, a trailing full stop
   ("Pro Fisher.") and an underscore ("1295_Coupe") are workbook
   keystrokes, and a bracket after the name ("(Centre Console)") is
   said after it ("· Centre Console"). A typo stays a typo: "Surtess -
   770 Game Fisher XL" is not the maker's name and is not corrected
   here — the sheet is where the dealer corrects his file.

   PURE. The ledger is static bytes bundled with the app, like the
   decode map in `colourway.ts`; nothing here reads a store or a page,
   so a frozen quote's label and its table say the same thing on every
   screen and on every day.
   ============================================================ */

import namesRaw from '../../../data/northside/names.json?raw'
import { splitUnit } from '@/domain/catalogue/views/columns'
import { colourwayOf, type Colourway } from './colourway'

/* ---------------------------------------------------------- */
/* The ledger                                                  */
/* ---------------------------------------------------------- */

export interface NamesLedger {
  makers: Array<{ table: string; maker: string; source: string }>
  models: Array<{
    table: string
    /** the part of the file's code the page names — "PA600" */
    code: string
    /** the page's own heading — "Patrol 600" */
    name: string
    /** every code of the file this names */
    fileCodes: string[]
    pageUrl: string
    pageHeading: string
    pageTitle: string
    fetchedAt: string
  }>
  unnamed: Array<{ table: string; code: string; fileCodes: string[]; why: string }>
  materials: Array<{ table: string; code: string; name: string; source: string }>
  units: Array<{ table: string; label: string; unit: string; source: string }>
  /** a shortened word the file also writes in full for the same thing
   *  — "Sng" is "Single" — each with the cells where it does */
  words: Array<{ short: string; long: string; source: string }>
}

/** Read the ledger's text. Exported so a test can hand in the bytes
 *  on disk and prove the bundled copy is the same file. */
export function readNamesLedger(text: string): NamesLedger {
  const raw = JSON.parse(text) as Partial<NamesLedger>
  return {
    makers: raw.makers ?? [],
    models: raw.models ?? [],
    unnamed: raw.unnamed ?? [],
    materials: raw.materials ?? [],
    units: raw.units ?? [],
    words: raw.words ?? [],
  }
}

/** The ledger bundled with the app. */
export const LEDGER: NamesLedger = readNamesLedger(namesRaw)

/* ---------------------------------------------------------- */
/* A boat                                                      */
/* ---------------------------------------------------------- */

export interface SpokenBoat {
  /** the maker as its rows write it — "Highfield"; '' when neither the
   *  ledger nor the label says */
  maker: string
  /** the model as a person says it — "ADV7", "Sport 560", "519 Sea
   *  Ranger SDF", "Coaster" */
  model: string
  /** the file's words between the model and its material — "Open",
   *  "540 open", "Enc"; '' when none */
  qualifier: string
  /** what the file adds in brackets after a name that has no material
   *  — "Centre Console", "Tiller", "Dune"; '' when none */
  trim: string
  /** the material in words — "Hypalon", "PVC"; '' when none */
  material: string
  /** the colourway, read all-or-nothing; null when the label has none */
  colour: Colourway | null
  /** maker, model and qualifier: "Highfield ADV7", "Highfield Patrol
   *  540 Open" — what a headline sets */
  name: string
  /** everything after the name, joined with " · " — "Hypalon · Black
   *  / Grey / Black"; '' when there is nothing after it */
  detail: string
  /** the whole of it — "Highfield ADV7 · Hypalon · Black / Grey /
   *  Black" */
  say: string
  /** the file's own string, verbatim, for the dealer */
  label: string
  /** where the model's words came from: the file's own words, the
   *  maker's page, or neither (the code, shown as it is) */
  from: 'file' | 'maker' | 'code'
  /** the maker's page, when `from` is 'maker'; '' otherwise */
  source: string
}

const SEP = ' · '

/** Runs of spaces are one; a spaced hyphen between two parts of a
 *  name is a space; an underscore is a space; a trailing full stop
 *  goes. A hyphen inside a word ("Roll-Up", "B-G-B", "S/S") is kept. */
function tidy(text: string): string {
  return text
    .replace(/_/g, ' ')
    .replace(/\s+-\s*|\s*-\s+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.$/, '')
    .trim()
}

const same = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase()

/** The maker a register's rows write before their model. */
function makerOf(ledger: NamesLedger, tableId: string): string {
  return ledger.makers.find((m) => m.table === tableId)?.maker ?? ''
}

/** Does this register name its models by code alone? It does when the
 *  ledger holds names for it. */
const namesByCode = (ledger: NamesLedger, tableId: string): boolean =>
  ledger.models.some((m) => m.table === tableId) || ledger.unnamed.some((m) => m.table === tableId)

/** A model token written in the file's code alphabet — "ADV7",
 *  "SP560", "PA600ST", "SP700WL(Windlass)" — and not a word. */
const CODE = /^[A-Z]{2,}\d/

/**
 * THE MODEL'S WORDS for one model token of one register.
 *
 * The ledger entry whose code is the longest prefix of the token names
 * it, and what follows that prefix is kept as the file writes it —
 * with a space before a bracket, which is typography and not a word.
 * A prefix must end where the token's number ends ("SP56" never names
 * "SP560"), so the rest may not begin with a digit.
 */
export function modelWords(
  tableId: string,
  token: string,
  ledger: NamesLedger = LEDGER,
): { words: string; from: SpokenBoat['from']; source: string } {
  const clean = token.trim()
  let best: NamesLedger['models'][number] | null = null
  for (const entry of ledger.models) {
    if (entry.table !== tableId) continue
    if (!clean.startsWith(entry.code)) continue
    if (/^\d/.test(clean.slice(entry.code.length))) continue
    if (best === null || entry.code.length > best.code.length) best = entry
  }
  if (best) {
    const rest = clean
      .slice(best.code.length)
      .replace(/(\S)\(/g, '$1 (')
      .trim()
    return {
      words: rest === '' ? best.name : `${best.name} ${rest}`,
      from: 'maker',
      source: best.pageUrl,
    }
  }
  const coded = CODE.test(clean) && namesByCode(ledger, tableId)
  return { words: clean, from: coded ? 'code' : 'file', source: '' }
}

/** A material code in words — "HYP" is "Hypalon". A code the ledger
 *  does not carry is printed as the file writes it. */
export function materialWords(tableId: string, code: string, ledger: NamesLedger = LEDGER): string {
  const clean = code.trim()
  return ledger.materials.find((m) => m.table === tableId && m.code === clean)?.name ?? clean
}

const isMaterial = (ledger: NamesLedger, tableId: string, code: string): boolean =>
  ledger.materials.some((m) => m.table === tableId && m.code === code.trim())

/**
 * A VARIANT CELL IN WORDS — "HYP" is "Hypalon", "Open (PVC)" is "Open ·
 * PVC", "540 open (PVC)" is "540 open · PVC". The material half of a
 * Highfield variant, as `splitVariant` hands it back; a register with no
 * materials hands back its cell as written.
 */
export function materialCellWords(
  tableId: string,
  cell: string,
  ledger: NamesLedger = LEDGER,
): string {
  const clean = cell.replace(/\s+/g, ' ').trim()
  if (clean === '') return ''
  const bracket = /^(.*?)\s*\(([^()]+)\)$/.exec(clean)
  if (bracket && isMaterial(ledger, tableId, bracket[2]!)) {
    const head = bracket[1]!.trim()
    const words = materialWords(tableId, bracket[2]!, ledger)
    return head === '' ? words : `${head}${SEP}${words}`
  }
  return isMaterial(ledger, tableId, clean) ? materialWords(tableId, clean, ledger) : clean
}

/**
 * ONE BOAT, AS A PERSON SAYS IT, from its register and the file's own
 * string for it — which is all a frozen quote keeps (`rootTableId`,
 * `subjectLabel`), so the build, the paper, the register and History
 * say the same words for the same quote.
 */
export function spokenBoat(
  tableId: string,
  label: string,
  ledger: NamesLedger = LEDGER,
): SpokenBoat {
  const whole = label.replace(/\s+/g, ' ').trim()
  const known = makerOf(ledger, tableId)

  /* THE MAKER'S OWN PREFIX COMES OFF, where the row writes one. */
  let maker = known
  let rest = whole
  const cut = /^(.{1,40}?)\s*-\s+/.exec(whole)
  if (cut) {
    const prefix = cut[1]!.trim()
    const first = known.split(' ')[0] ?? ''
    if (known !== '' && (same(prefix, known) || same(prefix, first))) {
      maker = known
      rest = whole.slice(cut[0].length)
    } else if (known === '' && !/\d/.test(prefix) && prefix.split(' ').length === 1) {
      /* A REGISTER THE LEDGER DOES NOT KNOW, whose rows still write a
         one-word maker before " - " ("Yamaha - F90LB"): its own word. */
      maker = prefix
      rest = whole.slice(cut[0].length)
    }
  }

  /* THE MATERIAL, AND THE COLOURWAY AFTER IT — "(HYP) B-G-B". A
     bracket that is not a material and ends the name is a trim:
     "(Centre Console)", "(Tiller)", the ADV9's "(Dune)". */
  let head = rest
  let materialCode = ''
  let colourCode = ''
  let trim = ''
  const bracket = /^(.*)\(([^()]+)\)\s*(\S*)$/.exec(rest)
  if (bracket && isMaterial(ledger, tableId, bracket[2]!)) {
    head = bracket[1]!.trim()
    materialCode = bracket[2]!.trim()
    colourCode = bracket[3]!.trim()
  } else if (bracket && bracket[3] === '' && bracket[1]!.trim() !== '') {
    head = bracket[1]!.trim()
    trim = tidy(bracket[2]!)
  }

  /* THE MODEL IS THE HEAD'S FIRST TOKEN on a register that names by
     code, and the file's words after it are its qualifier; on every
     other register the head is the model, in the file's own words. */
  const tidied = tidy(head)
  let model = tidied
  let qualifier = ''
  let from: SpokenBoat['from'] = 'file'
  let source = ''
  if (namesByCode(ledger, tableId)) {
    const [token = '', ...after] = head.trim().split(' ')
    const words = modelWords(tableId, token, ledger)
    model = words.words
    from = words.from
    source = words.source
    qualifier = tidy(after.join(' '))
  }

  /* A MAKER NOT SAID TWICE. "Haines Signature" before "Signature
     Fisher 525F" is "Haines Signature Fisher 525F". */
  const makerWords = maker.split(' ').filter((w) => w !== '')
  const modelFirst = model.split(' ')[0] ?? ''
  /* and a model that already begins with its maker — a label written
     "Stacer 529 Assault Pro", with no hyphen to take off — is not given
     the maker a second time */
  const begins = maker !== '' && same(model.slice(0, maker.length + 1), `${maker} `)
  const overlap = begins
    ? ''
    : makerWords.length > 1 && same(makerWords[makerWords.length - 1]!, modelFirst)
      ? makerWords.slice(0, -1).join(' ')
      : maker
  const name = [overlap, model, qualifier].filter((s) => s !== '').join(' ')

  const colour = colourCode === '' ? null : colourwayOf(colourCode)
  const material = materialCode === '' ? '' : materialWords(tableId, materialCode, ledger)
  const detail = [trim, material, colour?.say ?? ''].filter((s) => s !== '').join(SEP)

  return {
    maker,
    model,
    qualifier,
    trim,
    material,
    colour,
    name: name === '' ? whole : name,
    detail,
    say:
      detail === '' ? (name === '' ? whole : name) : `${name === '' ? whole : name}${SEP}${detail}`,
    label: whole,
    from,
    source,
  }
}

/** One model of a register, by its model token — what a card on the
 *  picker prints. "SP560" on Highfield is "Highfield Sport 560". */
export function spokenModel(
  tableId: string,
  token: string,
  ledger: NamesLedger = LEDGER,
): { maker: string; model: string; name: string; from: SpokenBoat['from']; source: string } {
  const maker = makerOf(ledger, tableId)
  const words = namesByCode(ledger, tableId)
    ? modelWords(tableId, token, ledger)
    : { words: tidy(token), from: 'file' as const, source: '' }
  return {
    maker,
    model: words.words,
    name: [maker, words.words].filter((s) => s !== '').join(' '),
    from: words.from,
    source: words.source,
  }
}

/* ---------------------------------------------------------- */
/* A measure                                                   */
/* ---------------------------------------------------------- */

/** A figure, or a span of two, and nothing else. */
const FIGURE = /^-?\d[\d,]*(?:\.\d+)?(?:\s*[–-]\s*-?\d[\d,]*(?:\.\d+)?)?$/

/** A unit a column's name writes in brackets — "Hull Length (Mtr)". */
const BRACKETED: ReadonlyArray<{ pattern: RegExp; unit: string }> = [
  { pattern: /\s*\((?:mtr|mtrs|m)\)\s*$/i, unit: 'm' },
  { pattern: /\s*\((?:mm)\)\s*$/i, unit: 'mm' },
  { pattern: /\s*\((?:cm)\)\s*$/i, unit: 'cm' },
  { pattern: /\s*\((?:kg)\)\s*$/i, unit: 'kg' },
]

/**
 * A MEASURE WITH ITS UNIT. A frozen spec is `{ label, value }` as the
 * freeze wrote it, and where the column's name carried the unit at its
 * end the value already has it ("32 cm", "585 kg"). What is added here:
 *
 *   - a unit the column writes in brackets: "Hull Length (Mtr)" 3.07
 *     is "Hull Length" 3.07 m — the column's own word for metres;
 *   - a column whose name is only its unit: "HP" 90–140 is "Power"
 *     90–140 HP, in the file's own casing;
 *   - a unit the MAKER states for a column that names none, from the
 *     ledger's `units`: Highfield's "OA Length" 6.98 is 6.98 m because
 *     Highfield's page states "Overall Length 6.98m" for the same boat;
 *   - "16 °" is "16°".
 *
 * Nothing else. A column whose name and maker state no unit (Jeanneau's
 * Draft, Stabicraft's Int. Beam) keeps its bare figure: a unit assumed
 * is a figure invented.
 */
export function measured(
  tableId: string,
  spec: { label: string; value: string },
  ledger: NamesLedger = LEDGER,
): { label: string; value: string } {
  let label = spec.label.trim()
  let value = spec.value.trim().replace(/(\d)\s+°/g, '$1°')
  let unit = ''
  /* a unit the column writes at the end of its name ("Boat Weight kg"),
     where the value is a bare figure: the unit moves to the figure. A
     frozen spec already had it moved by the freeze; a picker's fact
     has not. */
  const tail = splitUnit(label)
  if (tail.unit !== undefined && FIGURE.test(value)) {
    label = tail.base
    unit = tail.unit
  }
  for (const b of BRACKETED) {
    if (unit !== '') break
    if (!b.pattern.test(label)) continue
    label = label.replace(b.pattern, '').trim()
    unit = b.unit
    break
  }
  if (unit === '' && /^hp$/i.test(label)) {
    unit = label
    label = 'Power'
  }
  if (unit === '') {
    unit = ledger.units.find((u) => u.table === tableId && same(u.label, label))?.unit ?? ''
  }
  if (unit !== '' && FIGURE.test(value)) value = `${value} ${unit}`
  return { label, value }
}

/* ---------------------------------------------------------- */
/* A colour, drawn                                             */
/* ---------------------------------------------------------- */

/**
 * THE COLOURS A SWATCH MAY DRAW — one per colour the decode NAMES, each
 * a token in `src/styles/tokens.css` (`--swatch-<name>`), defined once.
 * A part the decode names as two ("White/Blue") draws both; a part it
 * cannot name draws nothing, and an undecoded code draws no swatch at
 * all — the code is printed alone.
 */
const SWATCH: Readonly<Record<string, string>> = {
  White: 'white',
  Black: 'black',
  Grey: 'grey',
  'Dark Grey': 'dark-grey',
  'Light Grey': 'light-grey',
  Blue: 'blue',
  'Light Blue': 'light-blue',
  'Dark Blue': 'dark-blue',
  Wood: 'wood',
  'Wood Dark': 'wood-dark',
  'Military Black': 'military-black',
  Carbon: 'carbon',
}

/** Every swatch name a screen may ask for, so a test can prove each has
 *  its token. */
export const SWATCH_NAMES: readonly string[] = Object.values(SWATCH)

/** The swatches of one colourway, one list per part, in the code's own
 *  order. Empty when the colourway did not decode — all or nothing, as
 *  `colourwayOf` is. */
export function swatchesOf(colour: Colourway | null): Array<{ part: string; swatches: string[] }> {
  if (!colour || !colour.read) return []
  const out: Array<{ part: string; swatches: string[] }> = []
  for (const part of colour.parts) {
    const swatches: string[] = []
    for (const piece of part.split('/')) {
      const name = SWATCH[piece.trim()]
      if (name === undefined) return []
      swatches.push(name)
    }
    out.push({ part, swatches })
  }
  return out
}

/** The boat a quote is for, as a person says it — read off the two
 *  things the document froze, so every screen that names a quote's boat
 *  says the same words for it. */
export const boatOfQuote = (quote: { rootTableId: string; subjectLabel: string }): SpokenBoat =>
  spokenBoat(quote.rootTableId, quote.subjectLabel)

/* ---------------------------------------------------------- */
/* A line that is not the boat                                 */
/* ---------------------------------------------------------- */

/*
 * A MOTOR, A TRAILER, A KIT, AS A PERSON SAYS IT (m2-last-critique.md,
 * major 4: "Page 2 prints 'Yamaha - F250XCB', 'REDCO Custom / Highfield
 * ADV7 Aluminium - TA700T-EH' and '6X6 Sng Key Switch'. The build prints
 * 'Yamaha - F250XCB F250XCB'. The naming work covered boats only.")
 *
 * The file writes every row of these registers as a key: a name, a
 * spaced hyphen, then the maker's code — "Yamaha - F250XCB", "REDCO
 * Sportsman - RE1313", "Formosa GRT Tow Catch - RE1513Q-MO (Gal Steel,
 * Single Axle)" — and a kit as its parts between pipes. What changes
 * here is how those pieces are joined, the way `spokenBoat` joins
 * "Highfield - ADV7 (HYP) B-G-B" into "Highfield ADV7 · Hypalon · …":
 *
 *   - a pipe between a kit's parts is " · ";
 *   - the file's " - " between a name and what follows is " · ", and
 *     where the name is one word and that word is the maker the line's
 *     own register is named for — "Yamaha" of Yamaha Outboards,
 *     "EPROPULSION" of ePropulsion Outboards — the two are one name,
 *     "Yamaha F250XCB", as "Highfield ADV7" is. A hyphen between two
 *     figures is a range ("4.9 - 5.3m") and stays one;
 *   - a bracket that ends a part is said after it: "Yamaha F40SA ·
 *     Tiller", "RSX450-MO · Offroad, Single Axle";
 *   - a figure and its unit are set apart: "8.0 m Harness", "1,300 kg",
 *     "70 HP";
 *   - a Highfield code inside another line's name is said as the boat
 *     is said, from the same ledger entry: "REDCO Custom / Highfield
 *     Sport 560 Aluminium", beside a hull the same paper calls the
 *     "Highfield Sport 560";
 *   - a shortened word the FILE ITSELF also writes in full for the same
 *     thing is written in full, from the ledger's `words`, each with the
 *     cells that show it: "Sng" is "Single" and "Mnt" is "Mount".
 *
 * NOTHING ELSE. No word is added, none is dropped and none is guessed:
 * "6X6", "CL5" and "16 Pin" are the maker's part names and stay as
 * written, and a shortening the file never writes out ("Alum", "Surt")
 * is left as it is. PURE, like everything in this file.
 */

/** A figure written against its unit — "8.0m", "(1,300kg)", "70HP". */
const JOINED_UNIT = /(^|[\s(&/-])(\d[\d,]*(?:\.\d+)?)(mm|m|kgs|kg|HP)(?=$|[\s),/&])/g

const escaped = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** The ledger's shortened words, written in full, whole words only and
 *  in the file's own case: "Sng" is "Single", "SNG" is not touched. */
function wordsInFull(text: string, ledger: NamesLedger): string {
  let out = text
  for (const word of ledger.words) {
    const re = new RegExp(`(?<![\\w-])${escaped(word.short)}(?![\\w-])`, 'g')
    out = out.replace(re, word.long)
  }
  return out
}

/** A boat's code inside another line's name — "Highfield SP560" — said
 *  as the boat is: the maker's own name for it, from the same entry of
 *  the ledger that names the hull. A code no page names stays a code. */
function boatsInWords(text: string, ledger: NamesLedger): string {
  let out = text
  for (const maker of ledger.makers) {
    if (!namesByCode(ledger, maker.table)) continue
    const re = new RegExp(`(?<![\\w-])${escaped(maker.maker)} ([A-Z]{2,}\\d[A-Za-z0-9]*)`, 'g')
    out = out.replace(re, (whole, code: string) => {
      const words = modelWords(maker.table, code, ledger)
      return words.from === 'maker' ? `${maker.maker} ${words.words}` : whole
    })
  }
  return out
}

/** A figure, with or without its unit — "4.9", "5.3m", "4". */
const FIGURE_TOKEN = /^\d[\d,]*(?:\.\d+)?(?:mm|m|kgs|kg)?$/

/** The file's " - " between the parts of a name, said as " · " — but
 *  one between two figures is a range ("4.9 - 5.3m") and is left
 *  alone, and the first one after the register's own maker joins the
 *  two into one name: "Yamaha - F250XCB" from Yamaha Outboards is
 *  "Yamaha F250XCB". Which word is a maker is the register's to say:
 *  "Battery - AT12260D" from Parts & Accessories is "Battery ·
 *  AT12260D", because "Battery" is not who made it. */
function separated(text: string, register: string): string {
  const maker = (register.trim().split(' ')[0] ?? '').toLowerCase()
  let first = true
  return text.replace(/(?<=\S) - (?=\S)/g, (match, offset: number, whole: string) => {
    const before = whole.slice(0, offset)
    const after = whole.slice(offset + match.length)
    const last = before.split(' ').pop() ?? ''
    const next = after.split(' ')[0] ?? ''
    if (FIGURE_TOKEN.test(last) && FIGURE_TOKEN.test(next)) return match
    const joined = first && maker !== '' && before.toLowerCase() === maker
    first = false
    return joined ? ' ' : SEP
  })
}

/** One part of a line — the whole of a motor, one of a kit's pieces. */
function partSaid(part: string, register: string, ledger: NamesLedger): string {
  let text = part.replace(/\s+/g, ' ').trim()
  if (text === '') return ''
  text = wordsInFull(text, ledger)
  text = boatsInWords(text, ledger)
  text = separated(text, register)
  const bracket = /^(.*\S)\s*\(([^()]+)\)$/.exec(text)
  if (bracket && !bracket[1]!.endsWith(SEP.trim())) {
    text = `${bracket[1]}${SEP}${bracket[2]!.trim()}`
  }
  return text.replace(JOINED_UNIT, '$1$2 $3')
}

/**
 * A LINE THAT IS NOT THE BOAT, as the build, the cascade and the paper
 * say it — "Yamaha F250XCB", "REDCO Custom / Highfield ADV7 Aluminium ·
 * TA700T-EH", "DEC Rigging Kit · 6x9 Binnacle · CL5 Gauge Kit · 6X6
 * Single Key Switch · 16 Pin 8.0 m Harness · Fuel Filter" — where the
 * file writes "Yamaha - F250XCB", "REDCO Custom / Highfield ADV7
 * Aluminium - TA700T-EH" and "… | 6X6 Sng Key Switch | 16 Pin 8.0m
 * Harness | …". The file's own string stays on the line for the dealer.
 *
 * `register` is the name of the register the line was picked from, as
 * the quote froze it onto its section ("Yamaha Outboards"); it says
 * which word is a maker. Without it no two parts are joined, and the
 * motor reads "Yamaha · F250XCB" — still no key string.
 */
export function lineSaid(label: string, register = '', ledger: NamesLedger = LEDGER): string {
  return label
    .split('|')
    .map((part) => partSaid(part, register, ledger))
    .filter((part) => part !== '')
    .join(SEP)
}

/**
 * THE DEALER'S CODE BESIDE A NAME THAT ALREADY SAYS IT, is not printed a
 * second time: the build drew "Yamaha - F250XCB F250XCB", the name and
 * then the Model Code column, which is the same six characters. A code
 * every word of which is already in the name (brackets aside — "TA700T-EH
 * (ADV7)" beside "…Highfield ADV7 Aluminium · TA700T-EH") answers ''; any
 * other code is handed back to be printed, because it is what the dealer
 * orders by ("6XB-CL51L-00-08" beside a rigging kit, "HBA001" beside a
 * hull).
 */
export function codeBeside(said: string, code: string | null | undefined): string {
  const clean = (code ?? '').replace(/\s+/g, ' ').trim()
  if (clean === '') return ''
  const words = new Set(
    said
      .toLowerCase()
      .split(/[\s·/()]+/)
      .filter((w) => w !== ''),
  )
  const tokens = clean
    .toLowerCase()
    .split(/[\s/()]+/)
    .filter((w) => w !== '')
  return tokens.every((t) => words.has(t)) ? '' : clean
}

/** The name of the register a quote's line was picked from, as the quote
 *  froze it onto its section — '' for a line typed on the quote. */
export const registerOf = (
  quote: { sections: ReadonlyArray<{ tableId: string; title: string }> },
  entityId: string,
): string => quote.sections.find((s) => s.tableId === entityId)?.title ?? ''

/** Any line of a quote as its screens and its paper say it: the hull as
 *  `spokenBoat` says the quote's boat, a line a person typed on the
 *  quote in their own words exactly as typed, and every other line as
 *  `lineSaid` does, with the register it was picked from. The hull is
 *  known by the file's own string the quote froze for it, which no
 *  motor, trailer or kit ever shares; a typed line comes from no
 *  register at all (`entityId` ''). */
export const saidOnQuote = (
  quote: {
    rootTableId: string
    subjectLabel: string
    sections: ReadonlyArray<{ tableId: string; title: string }>
  },
  line: { entityId: string; label: string },
): string =>
  line.label === quote.subjectLabel
    ? boatOfQuote(quote).say
    : line.entityId === ''
      ? line.label.replace(/\s+/g, ' ').trim()
      : lineSaid(line.label, registerOf(quote, line.entityId))
