/// <reference types="node" />
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { readCell, type EntityDef, type RowData } from '@/domain/model'
import { colourwayOf, splitVariant } from './colourway'
import {
  LEDGER,
  SWATCH_NAMES,
  codeBeside,
  lineSaid,
  materialCellWords,
  measured,
  modelWords,
  readNamesLedger,
  registerOf,
  saidOnQuote,
  spokenBoat,
  spokenModel,
  swatchesOf,
  type NamesLedger,
} from './spoken'

/* ============================================================
   A boat as a person says it, read off the real pack.

   Every label below is a real cell of the Northside file, and the
   whole-register cases walk every boat row the file carries, so the
   derivation cannot agree with a string somebody typed here and
   disagree with the sheet. The expected WORDS for a handful of rows are
   written out, because the point of the module is those words — each is
   a maker's page heading recorded in data/northside/names.json, or the
   file's own words, or the decode in colourway.ts.
   ============================================================ */

let pack: PackFixture
let ledger: NamesLedger
let highfield: EntityDef
let hfRows: RowData[]

const boatTables = (): EntityDef[] => pack.entities.filter((e) => e.kind === 'boat')
const labelOf = (table: EntityDef, row: RowData): string =>
  String(readCell(row, table.displayFieldId ?? '') ?? '')

beforeAll(async () => {
  pack = await loadPack()
  ledger = readNamesLedger(readFileSync(path.join(pack.dataDir, 'names.json'), 'utf8'))
  highfield = pack.byKey('boat_highfield')
  hfRows = pack.rowsByEntity[highfield.id] ?? []
})

describe('the ledger', () => {
  it('is the bytes on disk, and every entry carries where it was read', () => {
    expect(LEDGER).toEqual(ledger)
    expect(ledger.models.length).toBeGreaterThan(0)
    for (const m of ledger.models) {
      expect(m.pageUrl).toMatch(/^https:\/\//)
      expect(m.pageHeading).toBe(m.name)
      expect(m.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
    for (const u of ledger.units) expect(u.source).toMatch(/https:\/\//)
    for (const m of ledger.makers) expect(m.source.length).toBeGreaterThan(20)
  })

  it('names only codes the file carries, and every Highfield code is named, unnamed or a word', () => {
    const tokens = new Set(hfRows.map((r) => String(readCell(r, 'boat_highfield.model'))))
    for (const m of ledger.models) for (const c of m.fileCodes) expect(tokens.has(c)).toBe(true)
    for (const u of ledger.unnamed) for (const c of u.fileCodes) expect(tokens.has(c)).toBe(true)
    const covered = new Set([
      ...ledger.models.flatMap((m) => m.fileCodes),
      ...ledger.unnamed.flatMap((m) => m.fileCodes),
    ])
    const left = [...tokens].filter((t) => !covered.has(t))
    /* the one model the file names in a word */
    expect(left).toEqual(['Coaster'])
  })

  it('writes every maker exactly as the rows it cites write it', () => {
    for (const m of ledger.makers) {
      const table = pack.byKey(m.table)
      const rows = pack.rowsByEntity[table.id] ?? []
      const said = rows.filter((r) =>
        labelOf(table, r)
          .replace(/\s+/g, ' ')
          .startsWith(`${m.maker.split(' ')[0]} - `),
      ).length
      /* Haines' rows begin with the range, not the maker — its ledger
         line says so, and so does the register's own name */
      if (m.table === 'boat_haines') expect(table.name).toBe(m.maker)
      else expect(said).toBeGreaterThan(0)
    }
  })
})

describe('spokenBoat — the words a person says', () => {
  it('says the ADV7 in Black / Grey / Black the way the maker and the decode do', () => {
    const b = spokenBoat('boat_highfield', 'Highfield - ADV7 (HYP) B-G-B')
    expect(b.say).toBe('Highfield ADV7 · Hypalon · Black / Grey / Black')
    expect(b.name).toBe('Highfield ADV7')
    expect(b.detail).toBe('Hypalon · Black / Grey / Black')
    expect(b.from).toBe('maker')
    expect(b.source).toBe('https://adventure.highfieldboats.com/boat/adv/adv7/')
    /* the file's own string is kept, verbatim, for the dealer */
    expect(b.label).toBe('Highfield - ADV7 (HYP) B-G-B')
  })

  it('names a Highfield code by the maker page recorded for it', () => {
    expect(spokenBoat('boat_highfield', 'Highfield - SP560 (PVC) LG-W-WB').say).toBe(
      'Highfield Sport 560 · PVC · Light Grey / White / White/Blue',
    )
    expect(spokenBoat('boat_highfield', 'Highfield - CL260 (HYP) W-W-WD').name).toBe(
      'Highfield Classic 260',
    )
  })

  it('keeps the letters the maker page does not name, as the file writes them', () => {
    expect(modelWords('boat_highfield', 'PA600ST').words).toBe('Patrol 600 ST')
    expect(modelWords('boat_highfield', 'RU230KAM').words).toBe('Roll Up 230 KAM')
    expect(modelWords('boat_highfield', 'SP700WL(Windlass)').words).toBe('Sport 700 WL (Windlass)')
    expect(modelWords('boat_highfield', 'CL310LS').words).toBe('Classic 310 LS')
  })

  it('shows a code no maker page names as the code it is', () => {
    const b = spokenBoat('boat_highfield', 'Highfield - SP300 (PVC) W-W-WB')
    expect(b.name).toBe('Highfield SP300')
    expect(b.from).toBe('code')
    expect(b.source).toBe('')
  })

  it('shows a colourway it cannot decode as the code, whole', () => {
    for (const code of ['O-G-DG', 'R-B-B', 'I-B-C', 'WH']) {
      const row = hfRows.find((r) =>
        String(readCell(r, 'boat_highfield.variant')).endsWith(` ${code}`),
      )
      expect(row, code).toBeDefined()
      const b = spokenBoat('boat_highfield', labelOf(highfield, row!))
      expect(b.colour?.read).toBe(false)
      expect(b.detail.endsWith(code)).toBe(true)
      expect(swatchesOf(b.colour)).toEqual([])
    }
  })

  it('reads the file’s qualifier, and a colourway the file names in a word', () => {
    expect(spokenBoat('boat_highfield', 'Highfield - PA540 Open (PVC) O-G-DG').say).toBe(
      'Highfield Patrol 540 Open · PVC · O-G-DG',
    )
    expect(spokenBoat('boat_highfield', 'Highfield - Coaster 540 open (PVC) LG-W-DG').name).toBe(
      'Highfield Coaster 540 open',
    )
    const adv9 = spokenBoat('boat_highfield', 'Highfield - ADV9 (Dune)')
    expect(adv9.say).toBe('Highfield ADV9 · Dune')
    expect(adv9.colour).toBeNull()
  })

  it('says every other maker in the file’s own words, punctuation tidied', () => {
    expect(spokenBoat('boat_stacer', 'Stacer - 519 Sea Ranger SDF (Centre Console)').say).toBe(
      'Stacer 519 Sea Ranger SDF · Centre Console',
    )
    expect(spokenBoat('boat_surtees', '495 - Pro Fisher.').say).toBe('Surtees 495 Pro Fisher')
    expect(spokenBoat('boat_haines', 'Signature Fisher - 525F').say).toBe(
      'Haines Signature Fisher 525F',
    )
    expect(spokenBoat('boat_jeanneau', 'Merry Fisher  -  695 S2').say).toBe(
      'Jeanneau Merry Fisher 695 S2',
    )
    expect(spokenBoat('boat_jeanneau', 'Merry Fisher - 1295_Coupe').say).toBe(
      'Jeanneau Merry Fisher 1295 Coupe',
    )
    /* a label that already begins with its maker is not given it twice */
    expect(spokenBoat('boat_stacer', 'Stacer 529 Assault Pro').say).toBe('Stacer 529 Assault Pro')
    /* A LEADING MAKER THE FILE MISSPELLS IS STILL THE MAKER, said once
       (2026-09-25). Until then this line pinned "Surtees Surtess 770 Game
       Fisher XL" — the maker twice, once misspelt — as right, and the
       gate was green over the headline of that boat's paper
       (m2-last-critique-2.md, major 1). The file's string stays verbatim
       in `label`, for the dealer. */
    const xl = spokenBoat('boat_surtees', 'Surtess  -  770 Game Fisher XL')
    expect(xl.say).toBe('Surtees 770 Game Fisher XL')
    expect(xl.maker).toBe('Surtees')
    expect(xl.label).toBe('Surtess - 770 Game Fisher XL')
  })

  it('takes a misspelt maker off only where the ledger records it, with its evidence, for that register', () => {
    const entry = ledger.misspelt.find((m) => m.written === 'Surtess')
    expect(entry).toMatchObject({ table: 'boat_surtees', maker: 'Surtees' })
    /* the evidence is the row itself: its own maker column says Surtees */
    const table = pack.byKey('boat_surtees')
    const row = (pack.rowsByEntity[table.id] ?? []).find((r) =>
      labelOf(table, r).startsWith('Surtess'),
    )
    expect(row, 'no row of boat_surtees is written "Surtess"').toBeDefined()
    expect(String(readCell(row!, 'boat_surtees.e'))).toBe('Surtees')
    expect(entry!.source).toContain(String(readCell(row!, 'boat_surtees.src')))
    /* the same prefix on any other register is not a maker it knows */
    expect(spokenBoat('boat_stacer', 'Surtess - 770 Game Fisher XL').say).toBe(
      'Stacer Surtess 770 Game Fisher XL',
    )
    /* and a ledger without the correction says what the file says */
    const bare: NamesLedger = { ...ledger, misspelt: [] }
    expect(spokenBoat('boat_surtees', 'Surtess  -  770 Game Fisher XL', bare).say).toBe(
      'Surtees Surtess 770 Game Fisher XL',
    )
  })

  it('reads every Highfield row: its maker, its material in words, its colourway whole', () => {
    for (const row of hfRows) {
      const b = spokenBoat(highfield.id, labelOf(highfield, row))
      const cell = String(readCell(row, 'boat_highfield.variant') ?? '')
      const { material, code } = splitVariant(cell)
      expect(b.maker).toBe('Highfield')
      expect(b.say.startsWith('Highfield ')).toBe(true)
      expect(b.say).not.toMatch(/\(HYP\)|\(PVC\)| - /)
      if (material !== '') {
        expect(b.colour?.code).toBe(code)
        expect(b.detail).toContain(colourwayOf(code).say)
        expect(b.material).toBe(/HYP/.test(material) ? 'Hypalon' : 'PVC')
      }
    }
  })

  it('reads every boat of every other maker, keeping every word the file wrote', () => {
    for (const table of boatTables()) {
      if (table.id === highfield.id) continue
      for (const row of pack.rowsByEntity[table.id] ?? []) {
        const label = labelOf(table, row)
        const b = spokenBoat(table.id, label)
        expect(b.from).toBe('file')
        expect(b.say).not.toMatch(/ - |\s{2,}|\.$/)
        /* nothing the file wrote is lost but its punctuation, and a
           misspelt maker the ledger records, which is said as the maker */
        const wrong = ledger.misspelt.filter((m) => m.table === table.id).map((m) => m.written)
        const words = label
          .replace(/[_.()-]/g, ' ')
          .split(/\s+/)
          .filter(
            (w) =>
              w !== '' &&
              !/^(Stacer|Stabicraft|Formosa|Jeanneau|Surtees)$/.test(w) &&
              !wrong.includes(w),
          )
        for (const w of words) expect(b.say, label).toContain(w)
        for (const w of wrong) expect(b.say, label).not.toContain(w)
      }
    }
  })
})

describe('spokenModel — a card', () => {
  it('names a model by its token', () => {
    expect(spokenModel('boat_highfield', 'SP560').name).toBe('Highfield Sport 560')
    expect(spokenModel('boat_highfield', 'ADV7').name).toBe('Highfield ADV7')
    expect(spokenModel('boat_highfield', 'Coaster')).toMatchObject({
      model: 'Coaster',
      from: 'file',
    })
  })
})

describe('materialCellWords', () => {
  it('says the material half of a variant cell in words', () => {
    expect(materialCellWords('boat_highfield', 'HYP')).toBe('Hypalon')
    expect(materialCellWords('boat_highfield', 'Open (PVC)')).toBe('Open · PVC')
    expect(materialCellWords('boat_highfield', '540 open (PVC)')).toBe('540 open · PVC')
    expect(materialCellWords('boat_stacer', 'Anything')).toBe('Anything')
  })
})

describe('measured — a unit on every measure the file or the maker states one for', () => {
  it('puts the maker’s metres on Highfield’s length and beam', () => {
    expect(measured('boat_highfield', { label: 'OA Length', value: '6.98' })).toEqual({
      label: 'OA Length',
      value: '6.98 m',
    })
    expect(measured('boat_highfield', { label: 'Beam', value: '2.68' }).value).toBe('2.68 m')
  })

  it('reads the unit a column writes in brackets', () => {
    expect(measured('boat_stacer', { label: 'Hull Length (Mtr)', value: '3.07' })).toEqual({
      label: 'Hull Length',
      value: '3.07 m',
    })
    expect(measured('boat_haines', { label: 'Hull Beam (mtr)', value: '2.13' }).value).toBe(
      '2.13 m',
    )
  })

  it('says a power envelope as power, in the file’s own casing', () => {
    expect(measured('boat_stacer', { label: 'HP', value: '2–6' })).toEqual({
      label: 'Power',
      value: '2–6 HP',
    })
  })

  it('leaves a value that already has its unit, and closes up a degree', () => {
    expect(measured('boat_highfield', { label: 'Tube Dia', value: '36 cm' }).value).toBe('36 cm')
    expect(measured('boat_stabicraft', { label: 'Deadrise', value: '16 °' }).value).toBe('16°')
  })

  it('moves a unit the column writes at the end of its name onto the figure', () => {
    expect(measured('boat_highfield', { label: 'Int Length cm', value: '154' })).toEqual({
      label: 'Int Length',
      value: '154 cm',
    })
    expect(measured('boat_highfield', { label: 'Boat Weight kg', value: '26' }).value).toBe('26 kg')
    /* "Beam" ends in an m and is not a unit */
    expect(measured('boat_jeanneau', { label: 'Beam (mtr)', value: '3.56' })).toEqual({
      label: 'Beam',
      value: '3.56 m',
    })
  })

  it('never assumes a unit nobody states', () => {
    expect(measured('boat_jeanneau', { label: 'Draft', value: '1.03' }).value).toBe('1.03')
    expect(measured('boat_stabicraft', { label: 'Int. Beam', value: '1.35' }).value).toBe('1.35')
    expect(measured('boat_highfield', { label: 'Max People', value: '6' }).value).toBe('6')
  })
})

describe('swatchesOf — a colour drawn only where the decode names it', () => {
  it('draws one swatch per named part, and both halves of a part named as two', () => {
    expect(swatchesOf(colourwayOf('B-G-B'))).toEqual([
      { part: 'Black', swatches: ['black'] },
      { part: 'Grey', swatches: ['grey'] },
      { part: 'Black', swatches: ['black'] },
    ])
    expect(swatchesOf(colourwayOf('LG-W-WB')).at(-1)).toEqual({
      part: 'White/Blue',
      swatches: ['white', 'blue'],
    })
  })

  it('has a token for every swatch it may ask for, declared once', () => {
    const tokens = readFileSync(
      path.join(pack.dataDir, '..', '..', 'src', 'styles', 'tokens.css'),
      'utf8',
    )
    for (const name of SWATCH_NAMES) {
      const declared = tokens.match(new RegExp(`--swatch-${name}\\s*:`, 'g')) ?? []
      expect(declared.length, name).toBe(1)
    }
  })

  it('draws a swatch for every part of every colourway the file writes that decodes', () => {
    for (const row of hfRows) {
      const { code } = splitVariant(String(readCell(row, 'boat_highfield.variant') ?? ''))
      const c = colourwayOf(code)
      if (!c.read) continue
      expect(swatchesOf(c).length, code).toBe(c.parts.length)
    }
  })
})

/* ============================================================
   A LINE THAT IS NOT THE BOAT (m2-last-critique.md, major 4: "Page 2
   prints 'Yamaha - F250XCB', 'REDCO Custom / Highfield ADV7 Aluminium -
   TA700T-EH' and '6X6 Sng Key Switch'. The build prints 'Yamaha -
   F250XCB F250XCB'.") Every label below is a real cell of the file.
   ============================================================ */

/** Every motor, trailer and kit register, with every label it writes. */
const lineRegisters = (): Array<{ table: EntityDef; labels: string[] }> =>
  pack.entities
    .filter((e) => ['motor', 'trailer', 'accessory'].includes(e.kind ?? ''))
    .map((table) => ({
      table,
      labels: [
        ...new Set(
          (pack.rowsByEntity[table.id] ?? [])
            .map((row) => labelOf(table, row).trim())
            .filter((l) => l !== ''),
        ),
      ],
    }))

/** Whether a string still carries the file's key " - ": a hyphen between
 *  two figures ("4.9 - 5.3 m", "4.1 m - 4.5 m") is a range, and "L2 -
 *  6X9" is not. */
const keyDash = (text: string): boolean =>
  text.replace(/(^|\s)(\d[\d,.]*(?: (?:mm|m|kgs|kg))?) - (?=\d)/g, '$1$2 ~ ').includes(' - ')

/** A string's words, for the "no word added" check: punctuation the
 *  saying moves is not a word, and a figure written against its unit
 *  ("8.0m") is the same two words set apart ("8.0 m"). */
const wordsOf = (text: string): string[] =>
  text
    .replace(/\|/g, ' ')
    .replace(/(\d)(mm|m|kgs|kg|HP)\b/g, '$1 $2')
    .split(/[\s·()]+/)
    .filter((w) => w !== '' && w !== '-')

describe('lineSaid — a motor, a trailer, a kit as a person says it', () => {
  it('says the ADV7’s own rig the way a person does', () => {
    expect(lineSaid('Yamaha - F250XCB', 'Yamaha Outboards')).toBe('Yamaha F250XCB')
    expect(
      lineSaid('REDCO Custom / Highfield ADV7  Aluminium - TA700T-EH', 'NSM Custom Trailers'),
    ).toBe('REDCO Custom / Highfield ADV7 Aluminium · TA700T-EH')
    expect(
      lineSaid(
        'DEC Rigging Kit | 6x9 Binnacle | CL5 Gauge Kit | 6X6 Sng Key Switch | 16 Pin 8.0m Harness | Fuel Filter',
        'Rigging Kits',
      ),
    ).toBe(
      'DEC Rigging Kit · 6x9 Binnacle · CL5 Gauge Kit · 6X6 Single Key Switch · 16 Pin 8.0 m Harness · Fuel Filter',
    )
  })

  it('joins a maker to its model only where the register is named for that maker', () => {
    expect(lineSaid('EPROPULSION - X12 Outboard (LS)', 'ePropulsion Outboards')).toBe(
      'EPROPULSION X12 Outboard · LS',
    )
    /* "Battery" is not who made it, so it is not joined */
    expect(lineSaid('Battery - AT12260D Supercharge', 'Parts & Accessories')).toBe(
      'Battery · AT12260D Supercharge',
    )
    /* and without a register nothing is joined, and still no key string */
    expect(lineSaid('Yamaha - F250XCB')).toBe('Yamaha · F250XCB')
  })

  it('says a closing bracket after the name, and sets a figure apart from its unit', () => {
    expect(lineSaid('Yamaha - F40SA (Tiller)', 'Yamaha Outboards')).toBe('Yamaha F40SA · Tiller')
    expect(lineSaid('Yamaha - F115XB2 (White)', 'Yamaha Outboards')).toBe('Yamaha F115XB2 · White')
    expect(
      lineSaid('Formosa GRT Tow Catch - RSX450-MO (Offroad, Single Axle)', 'NSM Custom Trailers'),
    ).toBe('Formosa GRT Tow Catch · RSX450-MO · Offroad, Single Axle')
    expect(lineSaid('REDCO Surtees Special - RE1513-MO (1,300kg)', 'NSM Custom Trailers')).toBe(
      'REDCO Surtees Special · RE1513-MO · 1,300 kg',
    )
  })

  it('leaves a range between two figures as the range it is', () => {
    expect(
      lineSaid('TA1298S13SB - T Alloy 1298 ATM S 13" Skid Braked - 4.9 - 5.3m', 'Stacer Trailers'),
    ).toBe('TA1298S13SB · T Alloy 1298 ATM S 13" Skid Braked · 4.9 - 5.3 m')
    expect(keyDash('Skid Braked · 4.1 m - 4.5 m')).toBe(false)
    expect(keyDash('Helm Master L2 - 6X9 Binnacle')).toBe(true)
    /* "L2" is a name and not a figure, so this is a separator */
    expect(lineSaid('Helm Master L2 - 6X9 Binnacle | Bolt on DES', 'Rigging Kits')).toBe(
      'Helm Master L2 · 6X9 Binnacle · Bolt on DES',
    )
  })

  it('says a Highfield code inside a trailer’s name as the hull on the same paper is said', () => {
    const trailer = lineSaid(
      'REDCO Custom / Highfield SP560 Aluminium - TA600-MOB',
      'NSM Custom Trailers',
    )
    expect(trailer).toBe('REDCO Custom / Highfield Sport 560 Aluminium · TA600-MOB')
    expect(trailer).toContain(spokenBoat('boat_highfield', 'Highfield - SP560 (PVC) W-W-WB').name)
    /* a code no maker page names stays the code */
    expect(lineSaid('GFAB Tandem Axel Trailer t/s Highfield SP300', 'GFAB Trailers')).toContain(
      'Highfield SP300',
    )
  })

  it('writes a shortened word in full only where the file itself writes both, whole words only', () => {
    expect(lineSaid('Sng Battery Switch', 'Parts & Accessories')).toBe('Single Battery Switch')
    expect(lineSaid('6x9 Flush Side Mnt', 'Rigging Kits')).toBe('6x9 Flush Side Mount')
    /* another case, and a shortening the file never writes out: left alone */
    expect(lineSaid('SNG OR SPORT SKI', 'GFAB Trailers')).toBe('SNG OR SPORT SKI')
    expect(lineSaid('Alum, Tandem Axle', 'NSM Custom Trailers')).toBe('Alum, Tandem Axle')
  })

  it('has, for every word the ledger writes in full, the file writing both forms', () => {
    const cells: string[] = []
    for (const table of pack.entities) {
      for (const row of pack.rowsByEntity[table.id] ?? []) {
        for (const v of Object.values(row.values)) if (typeof v === 'string') cells.push(v)
      }
    }
    const whole = (w: string): RegExp => new RegExp(`(?<![\\w-])${w}(?![\\w-])`)
    expect(ledger.words.length).toBeGreaterThan(0)
    for (const word of ledger.words) {
      expect(
        cells.some((c) => whole(word.short).test(c)),
        word.short,
      ).toBe(true)
      expect(
        cells.some((c) => whole(word.long).test(c)),
        word.long,
      ).toBe(true)
      expect(word.source).toMatch(/!R\d+/)
    }
  })

  it('reads every motor, trailer and kit on the file: no pipe, no key " - ", no word added', () => {
    const allowed = new Set<string>([
      ...ledger.words.map((w) => w.long),
      ...ledger.models.flatMap((m) => m.name.split(' ')),
    ])
    let read = 0
    for (const { table, labels } of lineRegisters()) {
      for (const label of labels) {
        const said = lineSaid(label, table.name)
        read += 1
        expect(said, label).not.toContain('|')
        /* a hyphen is left only between two figures */
        expect(keyDash(said), `${label} → ${said}`).toBe(false)
        const theirs = new Set(wordsOf(label))
        for (const word of wordsOf(said)) {
          expect(theirs.has(word) || allowed.has(word), `${label} → ${said}: "${word}"`).toBe(true)
        }
      }
    }
    expect(read).toBeGreaterThan(1000)
  })
})

describe('codeBeside — a code printed once', () => {
  it('drops a code the name already says, and keeps one it does not', () => {
    expect(codeBeside('Yamaha F250XCB', 'F250XCB')).toBe('')
    expect(codeBeside('Yamaha F250XSB2 · White', 'F250XSB2 White')).toBe('')
    expect(
      codeBeside('REDCO Custom / Highfield ADV7 Aluminium · TA700T-EH', 'TA700T-EH (ADV7)'),
    ).toBe('')
    expect(codeBeside('DEC Rigging Kit · 6x9 Binnacle', '6XB-CL51L-00-08')).toBe('6XB-CL51L-00-08')
    expect(codeBeside('Highfield ADV7 · Hypalon · Black / Grey / Black', 'HBA001')).toBe('HBA001')
    expect(codeBeside('Anything', undefined)).toBe('')
    expect(codeBeside('Anything', '  ')).toBe('')
  })
})

describe('saidOnQuote — one name for a line on every screen', () => {
  const quote = {
    rootTableId: 'boat_highfield',
    subjectLabel: 'Highfield - ADV7 (HYP) B-G-B',
    sections: [{ tableId: 'mot_yamaha', title: 'Yamaha Outboards' }],
  }

  it('says the hull as the boat, a picked line with its register, a typed line as typed', () => {
    expect(saidOnQuote(quote, { entityId: 'boat_highfield', label: quote.subjectLabel })).toBe(
      'Highfield ADV7 · Hypalon · Black / Grey / Black',
    )
    expect(saidOnQuote(quote, { entityId: 'mot_yamaha', label: 'Yamaha - F250XCB' })).toBe(
      'Yamaha F250XCB',
    )
    expect(saidOnQuote(quote, { entityId: '', label: 'Delivery - Cairns (by barge)' })).toBe(
      'Delivery - Cairns (by barge)',
    )
    expect(registerOf(quote, 'mot_yamaha')).toBe('Yamaha Outboards')
    expect(registerOf(quote, 'nowhere')).toBe('')
  })
})
