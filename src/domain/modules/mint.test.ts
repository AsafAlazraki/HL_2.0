/* ============================================================
   THE PACK ARRIVES WITH ITS PLACES ALREADY MADE.

   THE HOLE THIS CLOSES. Pressing Modules on a freshly seeded
   browser landed on the dashboard's empty state — correct, well
   written, and the wrong screen for a set that ships 25 base
   tables and 15,691 rows.

   WHAT IS ASSERTED, and why each one is here rather than left to
   a screenshot:

     1. NINE PLACES, through the real minting function. A module
        written straight into a map would draw and still be wrong:
        `mintModules` is what reads the table keys back, counts the
        face off the rows and numbers the dashboard.
     2. THE BRAND IS THE SHAPE OF THE INDEX. The owner's ruling,
        stated twice: "by boats I mean like highfield and stacer".
        A flat brandless list is a failed build, so the seven
        brand sections are asserted by name and by count through
        the SAME functions the index draws with.
     3. NO REFUSED VERB IS SWITCHED ON. `capabilityStates` refuses
        `quote` on a module whose tables price nothing; a seed that
        switched it on anyway would ship a screen apologising for
        its own configuration.
     4. NOTHING IS ORPHANED. Every base table on the sheet belongs
        to exactly one module — ruling 3 — checked against the
        data rather than against the list above it.
     5. IT SURVIVES A NON-MARINE ORG. A blank sheet mints no
        modules and meets the dashboard's own empty state; that
        state is a real dealer's first screen and must not be
        collateral damage.
     6. EVERY PLACE IS ONE SORT OF THING. `splitReading` is the rule
        the owner's "split the modules better" became when it was
        written down, and this asserts the seeded list satisfies it —
        so the pack cannot quietly grow a bag again. It was five
        names and two of them were bags: Parts & Accessories held
        accessories beside a package library, and Rates & Charges
        held three tables whose only agreement was that the app
        cannot classify any of them.

   WHAT DOES NOT COME ACROSS FROM THE OLD SUITE, and why. Four of
   its tests were about `northsideDrift` / `isStaleNorthside` — the
   seed freshness machinery the plan drops by name, because a pack
   carries one version string and needs no stamp to compare against.
   One more counted the blocks `createModule` seeded onto each member
   table's page; its subject is the views derivation and it belongs
   with that port, not with the places.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import type { EntityDef } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import {
  buildEntries,
  categoryDrawers,
  censusLine,
  DRAWER_FLOOR,
  groupEntries,
  listedTables,
  moduleCensus,
  moduleTables,
  relatedTables,
} from './read'
import { capabilityStates } from './designer'
import { siblingOffer, splitReading } from './split'
import { mintModules } from './mint'

const pack = await loadPack()
const entities = pack.ctx.entities
const { rowsByEntity } = pack

/** The places, minted from the pack the way the app mints them —
 *  already in dashboard order, because `order` is the position. */
const ordered = () => mintModules(entities, rowsByEntity, { orgId: pack.ctx.orgId })

const named = (name: string) => {
  const hit = ordered().find((m) => m.name === name)
  if (!hit) throw new Error(`no module called ${name}`)
  return hit
}

describe('the pack seeds its own modules', () => {
  it('lands nine places on the dashboard, in order', () => {
    expect(ordered().map((m) => m.name)).toEqual([
      'Boats',
      'Motors',
      'Factory Packages',
      'Trailers',
      'Parts & Accessories',
      'Dealer Fit Packages',
      'Labour Rates',
      'Oils & Consumables',
      'Registration Costs',
    ])
    expect(ordered().map((m) => m.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('stamps the tenant key on every place it mints', () => {
    /* THE CONTRACT'S OWN RULE, and the one thing about a minted
       module that the old store action could not carry: a record that
       does not name its organisation cannot be filed. */
    for (const m of ordered()) expect(m.orgId, m.name).toBe('northside')
  })

  /* -- ruling 6: one place is one sort of thing --------------- */

  it('leaves no bag on the dashboard', () => {
    const bags = ordered()
      .map((m) => splitReading(m, entities))
      .filter((r) => !r.coherent)
      .map((r) => r.say)
    expect(bags).toEqual([])
  })

  it('would have called the old list a bag, twice', () => {
    const byName = (n: string) => Object.values(entities).find((e) => e.name === n)!
    /* THE TWO THAT WERE WRONG, rebuilt exactly as they were seeded
       before this split, so the rule is shown catching them rather
       than merely agreeing with the answer. */
    const asBefore = (name: string, names: string[]) => ({
      ...ordered()[0],
      name,
      tableIds: names.map((n) => byName(n).id),
    })
    const parts = splitReading(
      asBefore('Parts & Accessories', [
        'Parts & Accessories',
        'Rigging Kits',
        'Dealer Fit Packages',
      ]),
      entities,
    )
    expect(parts.coherent).toBe(false)
    expect(parts.say).toContain('2 tables of accessories')
    expect(parts.say).toContain('1 table of packages')

    const rates = splitReading(
      asBefore('Rates & Charges', ['Labour Rates', 'Oils & Consumables', 'Registration Costs']),
      entities,
    )
    expect(rates.coherent).toBe(false)
    /* three tables, three parts — `custom` is the absence of a kind
       and never an agreement between two tables that carry it */
    expect(rates.parts).toHaveLength(3)
    expect(rates.say).toContain('declares no kind at all')
  })

  it('will not OFFER the bag it just finished undoing', () => {
    /* THE OTHER HALF OF RULING 6, and the half that keeps it true
       tomorrow. Undoing the two bags in the seed is worth nothing if
       the panel that makes the tenth module offers to rebuild one, and
       it did: `e.kind === picked.kind` is true of two tables that both
       declared nothing, so picking Labour Rates put a tick box beside
       Oils & Consumables and Registration Costs. `siblingOffer` is the
       same predicate `splitReading` uses, asked one moment earlier. */
    const all = Object.values(entities).filter((e) => e.role === undefined || e.role === 'base')
    const byName = (n: string) => all.find((e) => e.name === n)!

    const rates = siblingOffer(byName('Labour Rates'), all)
    expect(rates.siblings).toEqual([])
    expect(rates.why).toContain('Labour Rates declares no kind')
    /* the count is READ off this sheet, never typed here: however
       many unclassified tables the workbook grows, the sentence and
       this assertion move together */
    const unclassified = all.filter((e) => e.kind === undefined || e.kind === 'custom').length
    expect(rates.why).toContain(`${unclassified - 1} other tables declare none either`)

    /* AND IT STILL OFFERS WHAT REALLY DOES AGREE. The seven brand
       price files are what makes Boats one module rather than seven,
       and that offer must survive the fix. */
    const boats = siblingOffer(byName('Highfield Inflatables'), all)
    expect(boats.why).toBe('')
    expect(boats.siblings.length).toBeGreaterThan(0)
    for (const e of boats.siblings) expect(e.kind).toBe('boat')
  })

  it('gives every module its own words, never the table’s provenance note', () => {
    for (const m of ordered()) {
      expect(m.description).not.toBe('')
      /* the failure the old module stage records: Highfield's own
         description is a 202-character note about a spreadsheet row */
      const primary = entities[m.tableIds[0]]
      expect(m.description).not.toBe(primary?.description)
      expect(m.description.length).toBeLessThan(200)
    }
  })

  it('never prints a count in its prose — the badge counts, live', () => {
    /* Rates & Charges read "64 charges" while its own badge said 65 the
       moment a row was added, and Parts & Accessories read "719 lines"
       against 738 seeded. The card counts its rows one line above the
       sentence, so a figure typed into the sentence can only ever
       drift out of true. No digit belongs in any of these. */
    for (const m of ordered()) {
      expect(m.description, m.name).not.toMatch(/\d/)
    }
  })

  /* -- ruling 2: the brand is the section -------------------- */

  it('opens Boats onto the seven brands, not onto a flat list of hulls', () => {
    const boats = named('Boats')
    const listed = listedTables(boats, entities)
    const sections = groupEntries(buildEntries(listed, rowsByEntity), listed)

    expect(sections.map((s) => `${s.name} ${s.count}`)).toEqual([
      'Highfield Inflatables 588',
      'Stabicraft 37',
      'Stacer 91',
      'Formosa 39',
      'Jeanneau 27',
      'Surtees 19',
      'Haines Signature 9',
    ])
    /* and INSIDE a brand, that brand's own levels — Highfield runs
       Series > Model > Variant, Formosa is flat */
    expect(sections[0].groups.length).toBeGreaterThan(1)
    expect(sections[3].groups.map((g) => g.trail)).toEqual([''])
  })

  it('cuts every other module at its own inner level too', () => {
    const shapeOf = (name: string): string[] => {
      const m = named(name)
      const listed = listedTables(m, entities)
      return groupEntries(buildEntries(listed, rowsByEntity), listed).map(
        (s) => `${s.name} ${s.count}`,
      )
    }

    expect(shapeOf('Motors')).toEqual(['Yamaha Outboards 209', 'ePropulsion Outboards 32'])
    /* THE TWO PACKAGE FILES ARE THEIR OWN PLACE NOW. Their own seed
       note says in capitals that they are NOT motors, and their
       `kind` says the same thing in a field: 'package' against the
       outboards' 'motor'. */
    expect(shapeOf('Factory Packages')).toEqual([
      'Haines Signature Factory Packages 39',
      'Jeanneau Factory Packages 50',
    ])
    expect(shapeOf('Trailers')).toEqual([
      'NSM Custom Trailers 73',
      'Dunbier Trailers 102',
      'Dunbier / Haines BMT Trailers 16',
      'Mackay Trailers 125',
      'REDCO / Tinka Trailers 52',
      'GFAB Trailers 32',
      'Stacer Trailers 34',
    ])
    /* THE COUNT A MODULE PRINTS IS LIVE STOCK, NOT ROWS ON THE SHEET, and
       that is the whole reason these three numbers are not the table sizes:
       Parts & Accessories holds 2,937 rows and shows 2,238, because 699 sit
       below the OBSOLETE PARTS divider; Dealer Fit holds 1,777 and shows
       1,576, because 201 sit below its own; Rigging Kits holds 650 and shows
       622. */
    expect(shapeOf('Parts & Accessories')).toEqual(['Parts & Accessories 2238', 'Rigging Kits 622'])
    expect(shapeOf('Dealer Fit Packages')).toEqual(['Dealer Fit Packages 1576'])
    expect(shapeOf('Labour Rates')).toEqual(['Labour Rates 18'])
    expect(shapeOf('Oils & Consumables')).toEqual(['Oils & Consumables 27'])
    expect(shapeOf('Registration Costs')).toEqual(['Registration Costs 19'])
  })

  it('files the retired trailer table without listing it', () => {
    const trailers = named('Trailers')
    const all = moduleTables(trailers, entities).map((e) => e.name)
    /* IN the module — ruling 3, every base table belongs somewhere */
    expect(all).toContain('OBSOLETE Trailers — No Longer Available')
    /* and OUT of the catalogue, which is what `sellableTables` is for */
    expect(listedTables(trailers, entities).map((e) => e.name)).not.toContain(
      'OBSOLETE Trailers — No Longer Available',
    )
  })

  /* -- the verbs -------------------------------------------- */

  it('switches on no verb the module itself would refuse', () => {
    for (const m of ordered()) {
      /* THE SHEET IS HANDED OVER, because one refusal is about tables
         this module does NOT hold — see `capabilityStates`. Without it
         the `relate` question cannot be answered and is not asked. */
      const states = capabilityStates(m, moduleTables(m, entities), entities)
      const wrong = states.filter((s) => s.on && s.refused)
      expect(
        wrong.map((s) => `${m.name}: ${s.label} — ${s.refused}`),
        'a switched-on verb the module refuses',
      ).toEqual([])
    }
  })

  it('differentiates the verbs from the data, not decoratively', () => {
    const verbs = (name: string) => named(name).capabilities
    /* a boat is the source of every fitment join, so relate is real */
    expect(verbs('Boats')).toContain('relate')
    /* a trailer is the far end of one — the decision is the boat's */
    expect(verbs('Trailers')).not.toContain('relate')
    /* a part is quoted as a line on a boat's quote */
    expect(verbs('Parts & Accessories')).not.toContain('quote')
    /* a fee register is read, not opened: no join names these three */
    for (const r of ['Labour Rates', 'Oils & Consumables', 'Registration Costs']) {
      expect(verbs(r), r).not.toContain('open')
    }
    /* nothing that WRITES is on anywhere */
    for (const m of ordered()) {
      for (const w of ['add', 'edit', 'delete'] as const) {
        expect(m.capabilities).not.toContain(w)
      }
    }
  })

  /* -- what a module knows that a table does not -------------- */

  it('knows what goes with the things in it, and on how many of them', () => {
    const boats = relatedTables(named('Boats'), entities)
    const say = boats.map((r) => `${r.name} ${r.on}/${r.of}`)

    /* six of the seven brands take Yamaha; Haines and Jeanneau use
       factory packages, and Jeanneau takes both */
    expect(say).toContain('Yamaha Outboards 6/7')
    /* only three brands have a Dealer Fit join — the asymmetry the
       module trace measured, stated instead of shipped as empty blocks */
    expect(say).toContain('Dealer Fit Packages 3/7')
    /* sorted by how much of the module it touches */
    expect(boats[0].on).toBeGreaterThanOrEqual(boats[boats.length - 1].on)
    /* and never a table the module already holds */
    const own = new Set(named('Boats').tableIds)
    for (const r of boats) expect(own.has(r.tableId)).toBe(false)
  })

  /* -- ruling 3: nothing is orphaned -------------------------- */

  it('files every base table on the sheet in exactly one module', () => {
    const filed = new Map<string, string[]>()
    for (const m of ordered()) {
      for (const id of m.tableIds) filed.set(id, [...(filed.get(id) ?? []), m.name])
    }
    const homeless: string[] = []
    const twice: string[] = []
    for (const e of Object.values(entities) as EntityDef[]) {
      if (e.role === 'join') continue
      const where = filed.get(e.id) ?? []
      if (where.length === 0) homeless.push(e.name)
      if (where.length > 1) twice.push(`${e.name} → ${where.join(', ')}`)
    }
    expect(homeless).toEqual([])
    expect(twice).toEqual([])
  })

  /* -- the fresh dealer --------------------------------------- */

  it('mints nothing on a blank sheet, so the empty state still stands', () => {
    expect(mintModules({}, {}, { orgId: 'org-a' })).toEqual([])
  })

  it('skips a key that resolves to nothing rather than leaving a gap', () => {
    /* A pharmacy's sheet carries none of these keys but one. The
       place it can make is made, numbered 0, and the eight it cannot
       are not drawn as holes. */
    const onlyParts = { parts: entities.parts }
    const made = mintModules(onlyParts, { parts: rowsByEntity.parts }, { orgId: 'org-a' })
    expect(made.map((m) => m.name)).toEqual(['Parts & Accessories'])
    expect(made[0].order).toBe(0)
    expect(made[0].tableIds).toEqual(['parts'])
  })
})

/* ============================================================
   AND WHAT EACH PLACE SAYS ABOUT ITSELF.

   "2,937 products" is a fact. "2,238 products across 180 categories ·
   699 no longer sold" is a picture, and the difference between them is
   the whole of the owner's "the counts should mean something". Every
   figure below is read off the loaded sheet by the same functions the
   dashboard card and the index header print, so a number that moves in
   the workbook moves here and nothing has to be re-typed.
   ============================================================ */
describe('what a module says it is made of', () => {
  it('counts a register in the dealer’s own nouns, not in rows', () => {
    const parts = moduleCensus(named('Parts & Accessories'), entities, rowsByEntity)

    /* 2,937 parts less the 699 below the sheet's own OBSOLETE divider,
       plus 650 rigging kits less the 28 below theirs */
    expect(parts.items).toBe(2238 + 622)
    expect(parts.held).toBe(699 + 28)
    /* both tables are `accessory` and their leaf columns disagree
       (Product / Rigging Kit), so the kind's own plural is the one
       true word for the set — that is `kindNoun`'s stated job */
    expect(parts.noun).toBe('accessories')
    /* and BOTH banner words are said, because "206 groups" is jargon
       and picking one table's word over the other's is a small lie
       about the other */
    expect(parts.branches).toEqual([
      { noun: 'categories', count: 179 },
      { noun: 'sections', count: 25 },
    ])
    expect(censusLine(parts)).toBe(
      '2,860 accessories across 179 categories and 25 sections · 727 no longer sold',
    )
  })

  it('says nothing it did not count', () => {
    /* a flat register with nothing held back: no "across", no
       "no longer sold", and the dealer's own word for one row */
    const rates = moduleCensus(named('Labour Rates'), entities, rowsByEntity)
    expect(rates.branches).toEqual([])
    expect(rates.held).toBe(0)
    expect(censusLine(rates)).toBe('18 rates')

    const oils = moduleCensus(named('Oils & Consumables'), entities, rowsByEntity)
    expect(censusLine(oils)).toBe('27 consumables')
  })

  it('holds the retired trailer table back in words, never in silence', () => {
    const trailers = moduleCensus(named('Trailers'), entities, rowsByEntity)
    expect(trailers.items).toBe(434)
    /* the ten rows of the OBSOLETE table, which is history rather
       than stock and has no section in the catalogue at all */
    expect(trailers.held).toBe(10)
    expect(censusLine(trailers)).toContain('10 no longer sold')
  })

  /* -- the drawers ------------------------------------------- */

  it('files a big register into its own banners, and leaves a small one alone', () => {
    const drawersOf = (name: string) => {
      const listed = listedTables(named(name), entities)
      return categoryDrawers(buildEntries(listed, rowsByEntity), listed)
    }

    const parts = drawersOf('Parts & Accessories')
    expect(parts).toHaveLength(206)
    expect(parts.length).toBeGreaterThanOrEqual(DRAWER_FLOOR)
    /* 179 categories and 25 sections that carry a name, plus one
       drawer per table for the lines the sheet banners under a spacer
       — every line lands in exactly one of them, so the page can state
       what a narrowing put away without a remainder */
    expect(parts.reduce((n, d) => n + d.count, 0)).toBe(2238 + 622)
    /* the sheet really does banner some lines under nothing, and the
       drawer that holds them says so rather than being given a name */
    expect(parts.some((d) => d.name === '')).toBe(true)
    /* the dealer's own banner word, per table */
    expect(new Set(parts.map((d) => d.of))).toEqual(new Set(['category', 'section']))

    /* four bands is a register to read, not one to open */
    expect(drawersOf('Registration Costs').length).toBeLessThan(DRAWER_FLOOR)
  })

  it('takes both ends of a drawer’s range off real rows in it', () => {
    const listed = listedTables(named('Parts & Accessories'), entities)
    const entries = buildEntries(listed, rowsByEntity)
    const drawers = categoryDrawers(entries, listed)

    for (const d of drawers) {
      const mine = entries.filter((e) => e.tableId === d.tableId && e.branch === d.name)
      const priced = mine.filter((e) => e.price !== '' && e.amount !== undefined)
      if (priced.length === 0) {
        expect(d.low, d.name).toBe('')
        expect(d.high, d.name).toBe('')
        continue
      }
      /* both ends are a row that is really in the drawer — never an
         average, never a rounding, never a figure nobody can find */
      expect(
        priced.map((e) => e.price),
        d.name,
      ).toContain(d.low)
      expect(
        priced.map((e) => e.price),
        d.name,
      ).toContain(d.high)
    }
  })
})
