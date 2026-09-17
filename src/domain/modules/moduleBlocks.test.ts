/* ============================================================
   A MODULE'S BLOCKS BELONG TO THE TABLE WHOSE PAGE THEY ARE ON.

   THE TRACE THIS FILE INVERTS. docs/audit/MODULE_BLOCK_TRACE.md
   measured `createModule` over the seven boat brand tables of the
   real Northside seed and found ELEVEN blocks, written onto ONE
   brand's page, each bound to a DIFFERENT brand's join. Counted
   per brand, blocks that could ever resolve: Highfield 5 of 11,
   Haines 2, Stacer 1, Stabicraft 1, Jeanneau 1, Surtees 1 — and
   Surtees' one was the OBSOLETE trailer join, a page of nothing
   but discontinued stock — and Formosa 0 of 11.

   The cause was a set test. The seed asked "does ANY join name ANY
   of this module's tables?", so `Highfield × Yamaha` passed on
   HIGHFIELD and its block was then written onto the PRIMARY
   table's view. It asks per table now, through the one derivation
   in `@/domain/catalogue/views/relations`, which is also what a
   table's own page has always used.

   WHY A TEST AND NOT A NOTE. The two derivations were once the
   same and drifted; the drift was invisible because both compiled,
   both ran and both produced blocks. Only counting them catches
   it. So the numbers below are MEASURED against the real seed
   through the real derivation, and the invariant under them —
   no block bound to a join that does not name its own table — is
   asserted structurally, over every table, with no list of brands
   to keep up to date.

   AND IT MUST BE GENERIC. The last test builds a three-make
   tractor dealer with no marine table in it and asserts the same
   shape, because the rule the app ships is "which table carries a
   reference column to this one", never "which brand is this".
   ============================================================ */

/* ============================================================
   PORTED 2026-09-17 FROM `features/modules/moduleBlocks.test.ts`,
   whole: eleven cases, every assertion and every measured figure
   unchanged, and every one of them still true on the pack.

   THE SEED IS THE PACK AND THE MINT IS PURE. The old file called
   `buildNorthsideProject()`, pushed it through `replaceProject`, and
   then made a module with the store's own `createModule` — which
   minted a view per member table and seeded each one with
   `defaultBlocksFor(entities, tableId)`. There is no project store
   here. `loadPack()` is the seed, `mintModules` is the module, and
   `createViewFor` is the page: the view's blocks come off the same
   `defaultBlocksFor` the store action called, so what is under test
   is the same derivation reached the way the app reaches it.

   The brand ids and the table names below were re-measured against
   `data/northside/entities.json` before this port was written: seven
   `kind: 'boat'` base tables, twenty-eight joins, and the same per
   brand block counts the trace recorded — 4, 6, 5, 6, 3, 6, 4.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import {
  isRetired,
  type CatalogueCtx,
  type EntityDef,
  type FieldDef,
  type ViewDef,
} from '@/domain/model'
import { makeCtx } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import { isCuratedOnly } from '@/domain/catalogue/views/describe'
import { defaultBlocksFor } from '@/domain/catalogue/views/relations'
import { createViewFor } from '@/domain/catalogue/views/viewFor'
import { makeEngine, relatedRows, type Ctx, type JoinRef } from '@/domain/catalogue/views/pairs'
import { mintModules, type SeedModule } from './mint'

const pack = await loadPack()

/* ---------------------------------------------------------- */
/* The real seed, through the real derivation                  */
/* ---------------------------------------------------------- */

interface Seeded {
  ctx: CatalogueCtx
  entities: Record<string, EntityDef>
  byName: (name: string) => EntityDef
  /** the boat brand tables, in the order the seed declares them */
  brands: EntityDef[]
  viewFor: (tableId: string) => ViewDef | undefined
  moduleViewId: string
}

/** Makes ONE module mastering all seven boat brand tables and hands
 *  back what it produced. Every call starts from a fresh context, so
 *  no page one case arranged is in another case's world. */
function seedBoatsModule(): Seeded {
  const entities: Record<string, EntityDef> = {}
  for (const e of pack.entities) entities[e.id] = e
  const ctx = makeCtx({
    orgId: 'northside',
    entities,
    rowsByEntity: pack.rowsByEntity,
    now: () => pack.manifest.packedAt,
  })

  /* read off the data, never off a list written here: every base table
     whose kind is 'boat' is a brand, which is how the app finds them */
  const brands = pack.entities.filter((e) => e.kind === 'boat' && e.role !== 'join')
  const seed: SeedModule = {
    name: 'Boats',
    desc: 'Seven brands.',
    tables: brands.map((b) => b.id),
  }
  /* the page per member table is the store action's own second half,
     and here it is the callback the mint takes for exactly that */
  for (const brand of brands) createViewFor(ctx, brand.id)
  const [mod] = mintModules(
    entities,
    pack.rowsByEntity,
    {
      orgId: 'northside',
      now: () => pack.manifest.packedAt,
      viewIdFor: (primaryTableId) => createViewFor(ctx, primaryTableId).id,
    },
    [seed],
  )
  expect(mod).not.toBeNull()

  const views = Object.values(ctx.views)
  return {
    ctx,
    entities,
    byName: (name) => {
      const hit = Object.values(entities).find((e) => e.name === name)
      if (!hit) throw new Error(`no table named ${name}`)
      return hit
    },
    brands,
    viewFor: (tableId) => views.find((v) => v.rootTableId === tableId),
    moduleViewId: mod.viewId ?? '',
  }
}

/** Every table a join points at, read off its reference columns —
 *  the same question `findJoinTable` answers, asked the other way
 *  round so the assertion cannot borrow the code under test. */
const joinTargets = (join: EntityDef): string[] =>
  join.fields
    .filter((f) => f.type === 'reference' && f.refEntityId)
    .map((f) => f.refEntityId as string)

/* ---------------------------------------------------------- */

describe('the blocks a module seeds, measured on the real seed', () => {
  it('gives each brand its OWN relationships, and no other brand any of them', () => {
    const s = seedBoatsModule()

    for (const brand of s.brands) {
      const view = s.viewFor(brand.id)
      expect(view, `${brand.name} has no page`).toBeDefined()
      for (const block of view!.blocks) {
        const join = block.joinTableId ? s.entities[block.joinTableId] : undefined
        expect(join, `${brand.name}: a block with no join`).toBeDefined()
        const targets = joinTargets(join!)
        /* THE WHOLE FIX, IN ONE ASSERTION. The join a block is bound
           to must name the table whose page the block is on — and the
           table the block draws. A block seeded from another brand's
           join fails the first half. */
        expect(targets, `${brand.name}: bound to ${join!.name}`).toContain(brand.id)
        expect(targets, `${brand.name}: ${join!.name} does not reach the block's table`).toContain(
          block.tableId,
        )
      }
    }
  })

  it('counts what the trace counted, inverted — nobody gets 11 and nobody gets 0', () => {
    const s = seedBoatsModule()
    const counted = Object.fromEntries(
      s.brands.map((b) => [b.name, s.viewFor(b.id)?.blocks.length ?? 0]),
    )

    /* MEASURED, not chosen. Each is the number of distinct live tables
       the brand's own joins reach — more than its join count wherever
       one join carries three reference columns, which is how a Motor
       Fitment join brings BOTH the outboard and the rigging kit. */
    expect(counted).toEqual({
      Stacer: 4,
      Stabicraft: 6,
      Surtees: 5,
      Jeanneau: 6,
      'Haines Signature': 3,
      'Highfield Inflatables': 6,
      Formosa: 4,
    })

    /* the trace's two headline failures, named */
    expect(counted.Formosa).toBeGreaterThan(0)
    for (const n of Object.values(counted)) expect(n).not.toBe(11)
  })

  it('opens Formosa on its own three joins, and on nothing borrowed', () => {
    const s = seedBoatsModule()
    const formosa = s.byName('Formosa')
    const drawn = (s.viewFor(formosa.id)?.blocks ?? []).map((b) => s.entities[b.tableId]?.name)

    expect(new Set(drawn)).toEqual(
      new Set(['NSM Custom Trailers', 'Yamaha Outboards', 'Rigging Kits', 'Parts & Accessories']),
    )
    /* the seven that used to be on it, belonging to other brands */
    for (const borrowed of [
      'GFAB Trailers',
      'Stacer Trailers',
      'Dunbier / Haines BMT Trailers',
      'Dealer Fit Packages',
      'Jeanneau Factory Packages',
      'Haines Signature Factory Packages',
      'OBSOLETE Trailers — No Longer Available',
    ]) {
      expect(drawn).not.toContain(borrowed)
    }
  })

  it('gives Highfield its five joins — six blocks, because one join carries rigging', () => {
    const s = seedBoatsModule()
    const highfield = s.byName('Highfield Inflatables')
    const blocks = s.viewFor(highfield.id)?.blocks ?? []
    const drawn = blocks.map((b) => s.entities[b.tableId]?.name)

    expect(new Set(drawn)).toEqual(
      new Set([
        'NSM Custom Trailers',
        'GFAB Trailers',
        'Yamaha Outboards',
        'Rigging Kits',
        'Parts & Accessories',
        'Dealer Fit Packages',
      ]),
    )
    /* GFAB IS THE SIXTH AND IT IS NOT A NEW RULE. `Highfield × GFAB —
       Trailer Fitment` is a join the specification always admitted and
       the seed could never fill: while Highfield carried 40 of its 588
       hulls, not one of the 40 named a GFAB trailer, so the table came
       out empty and the block was not there to draw. At full scale the
       join has 51 pairings (SEED_AT_FULL_SCALE.md §2.2) and the same
       derivation, unchanged, finds it. A block appearing because the
       data arrived is the behaviour this file is asserting. */
    /* rigging arrives BECAUSE THE JOIN CARRIES IT — the Motor Fitment
       join names boat, outboard and kit, so the kit is a declared
       relationship rather than a guess from the motor */
    const rigging = blocks.find((b) => s.entities[b.tableId]?.name === 'Rigging Kits')
    expect(s.entities[rigging!.joinTableId!].name).toBe('Highfield × Yamaha — Motor Fitment')
  })

  it('never seeds Surtees the OBSOLETE join — five blocks, all of them sellable', () => {
    const s = seedBoatsModule()
    const surtees = s.byName('Surtees')
    const blocks = s.viewFor(surtees.id)?.blocks ?? []
    expect(blocks).toHaveLength(5)

    const obsoleteTable = s.byName('OBSOLETE Trailers — No Longer Available')
    const obsoleteJoin = s.byName('Surtees × OBSOLETE Trailers')
    expect(isRetired(obsoleteTable)).toBe(true)
    expect(isRetired(obsoleteJoin)).toBe(true)

    /* refused twice: the related table is retired AND so is the join */
    expect(blocks.map((b) => b.tableId)).not.toContain(obsoleteTable.id)
    expect(blocks.map((b) => b.joinTableId)).not.toContain(obsoleteJoin.id)
  })

  it('and holds it back at the gate too, if somebody ever puts it on a page', () => {
    /* the seed refuses it, and `relatedRows` refuses it again — the
       withholding is not carried by the seed alone */
    const s = seedBoatsModule()
    const surtees = s.byName('Surtees')
    const obsoleteJoin = s.byName('Surtees × OBSOLETE Trailers')
    const obsoleteTable = s.byName('OBSOLETE Trailers — No Longer Available')

    const refs = obsoleteJoin.fields.filter((f) => f.type === 'reference')
    const join: JoinRef = {
      entityId: obsoleteJoin.id,
      sourceFieldId: refs.find((f) => f.refEntityId === surtees.id)!.id,
      targetFieldId: refs.find((f) => f.refEntityId === obsoleteTable.id)!.id,
    }
    const ctx: Ctx = { entities: s.entities, rowsByEntity: s.ctx.rowsByEntity }
    const sourceRow = (s.ctx.rowsByEntity[surtees.id] ?? [])[0]
    expect(sourceRow).toBeDefined()

    const result = relatedRows({
      ctx,
      engine: makeEngine(ctx),
      sourceEntity: surtees,
      sourceRow,
      targetEntityId: obsoleteTable.id,
      join,
    })
    expect(result.rows).toEqual([])
    expect(result.historic).toBe('table')
  })

  it('seeds every block CURATED, so one boat never draws all 640 rigging kits', () => {
    /* a block with no rule matches every candidate. The old seed wrote
       none, so each of its blocks would have drawn the whole target
       table under a single hull. */
    const s = seedBoatsModule()
    for (const brand of s.brands) {
      for (const block of s.viewFor(brand.id)?.blocks ?? []) {
        expect(isCuratedOnly(block.rule), `${brand.name} · ${block.tableId}`).toBe(true)
      }
    }
  })

  it('leaves a page somebody has already arranged exactly as they left it', () => {
    const s = seedBoatsModule()
    const stacer = s.byName('Stacer')
    const view = s.viewFor(stacer.id)!

    /* somebody curates: one block, their order */
    s.ctx.views[view.id] = { ...view, blocks: [view.blocks[0]] }
    /* a second module over the same table must not rearrange it */
    mintModules(
      s.entities,
      s.ctx.rowsByEntity,
      {
        orgId: 'northside',
        now: () => pack.manifest.packedAt,
        viewIdFor: (primaryTableId) => createViewFor(s.ctx, primaryTableId).id,
      },
      [{ name: 'Stacer', desc: 'One brand.', tables: [stacer.id] }],
    )
    expect(s.ctx.views[view.id].blocks).toHaveLength(1)
  })

  it('names the PRIMARY table s page as the module s view, and mints one per table', () => {
    const s = seedBoatsModule()
    const primary = s.brands[0]
    expect(s.moduleViewId).toBe(s.viewFor(primary.id)?.id)
    /* seven tables, seven pages — `viewId` is singular and points at
       the first; every other brand is opened on its own view */
    for (const brand of s.brands) expect(s.viewFor(brand.id)).toBeDefined()
  })
})

/* ---------------------------------------------------------- */
/* The same rule, on a sheet with no boat in it                */
/* ---------------------------------------------------------- */

const STAMP = '2026-01-01T00:00:00.000Z'

const field = (id: string, name: string, type: FieldDef['type'], ref?: string): FieldDef => ({
  id,
  name,
  type,
  ...(ref ? { refEntityId: ref } : {}),
})

const table = (
  id: string,
  name: string,
  fields: FieldDef[],
  extra: Partial<EntityDef> = {},
): EntityDef => ({
  id,
  orgId: 'northside',
  name,
  accent: 'blue',
  fields,
  position: { x: 0, y: 0 },
  createdAt: STAMP,
  updatedAt: STAMP,
  ...extra,
})

describe('a dealer with three makes and no boat anywhere', () => {
  /** Three makes, one shared implement table, one make-specific one,
   *  and a retired make-specific join — the same asymmetry the real
   *  seed has, with none of its nouns. */
  const entities: Record<string, EntityDef> = {}
  const put = (e: EntityDef): void => {
    entities[e.id] = e
  }

  for (const [id, name] of [
    ['make_a', 'Make A Tractors'],
    ['make_b', 'Make B Tractors'],
    ['make_c', 'Make C Tractors'],
  ] as const) {
    put(table(id, name, [field('model', 'Model', 'text')], { kind: 'custom', role: 'base' }))
  }
  put(
    table('loaders', 'Front Loaders', [field('model', 'Model', 'text')], {
      kind: 'custom',
      role: 'base',
    }),
  )
  put(
    table('cabs', 'Cab Kits', [field('model', 'Model', 'text')], { kind: 'custom', role: 'base' }),
  )
  put(
    table('old', 'Withdrawn Loaders', [field('model', 'Model', 'text')], {
      kind: 'custom',
      role: 'base',
      retired: true,
    }),
  )

  /* every make takes a loader; only Make A takes a cab kit, and it
     rides on the SAME join, exactly as a Motor Fitment join carries
     the rigging kit */
  put(
    table(
      'j_a',
      'Make A × Loaders',
      [
        field('m', 'Tractor', 'reference', 'make_a'),
        field('l', 'Loader', 'reference', 'loaders'),
        field('c', 'Cab kit', 'reference', 'cabs'),
      ],
      { role: 'join' },
    ),
  )
  put(
    table(
      'j_b',
      'Make B × Loaders',
      [field('m', 'Tractor', 'reference', 'make_b'), field('l', 'Loader', 'reference', 'loaders')],
      { role: 'join' },
    ),
  )
  put(
    table(
      'j_c',
      'Make C × Loaders',
      [field('m', 'Tractor', 'reference', 'make_c'), field('l', 'Loader', 'reference', 'loaders')],
      { role: 'join' },
    ),
  )
  /* and one relationship the business has stopped honouring */
  put(
    table(
      'j_old',
      'Make C × Withdrawn',
      [field('m', 'Tractor', 'reference', 'make_c'), field('l', 'Loader', 'reference', 'old')],
      { role: 'join', retired: true },
    ),
  )

  it('gives each make its own, with no kind test and no name matching anywhere', () => {
    const named = (id: string): string[] =>
      defaultBlocksFor(entities, id).map((b) => entities[b.tableId].name)

    expect(new Set(named('make_a'))).toEqual(new Set(['Front Loaders', 'Cab Kits']))
    expect(named('make_b')).toEqual(['Front Loaders'])
    /* the withdrawn relationship is refused, so Make C is not handed a
       page of stock it no longer sells */
    expect(named('make_c')).toEqual(['Front Loaders'])
  })

  it('gives a make nothing when nothing is declared about it', () => {
    const alone = { ...entities }
    alone.make_d = table('make_d', 'Make D Tractors', [field('model', 'Model', 'text')], {
      kind: 'custom',
      role: 'base',
    })
    expect(defaultBlocksFor(alone, 'make_d')).toEqual([])
  })
})
