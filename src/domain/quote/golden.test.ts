/* ============================================================
   THE GOLDEN DIFF — the Stacer 529 Assault Pro, frozen twice.

   THE CLAIM THIS FILE GUARDS, and it is the only claim that can
   settle whether the port moved a number: the OLD engine reading the
   OLD seed and the NEW engine reading the NEW pack produce the same
   document. Not a similar one. The same labels, the same figures,
   the same rungs with the same `RungContents`, the same provenance
   notes, the same five-way association on every pairing, the same
   star, the same denominators.

   WHERE THE LEFT-HAND SIDE CAME FROM. `src/test/fixtures/golden/
   529-assault-pro.json` was produced by running the OLD repo's own
   `mintQuoteFromView` and `candidateOffer` against its own committed
   `buildNorthsideProject()`, bundled once with esbuild. The fixture
   carries its own provenance so anybody can make it again: `command`
   is the exact command line, `script` is the whole source of the
   one-off that produced it, `source` names the old modules it ran,
   and `measured` is the date. Nothing in it was typed by hand, which
   is the whole point: a golden file somebody wrote out from reading
   the code proves only that they read it the same way twice.

   WHAT IS DELIBERATELY NOT DIFFED. Ids — the quote's, the lines',
   the sections' blockIds, the tables' and the rows'. They are minted
   per run in the old repo and are the seed key in the pack
   ('boat_stacer', 'boat_stacer:30'), by a decision this build made on
   purpose, so a diff on them would measure the packer rather than
   the freeze. Every id-free value a document prints IS diffed, and
   the sections are matched by TITLE, which is the dealer's own word
   for the table and is data rather than an id.

   A FAILURE HERE IS A PORT BUG OR A PACKER BUG AND NEVER A REASON TO
   EDIT THE FIXTURE.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import type { EntityDef, QuoteLine, RowData } from '@/domain/model'
import { rowLabel } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import golden from '@/test/fixtures/golden/529-assault-pro.json'
import { candidateOffer, mintQuoteFromView } from './freeze'

const SUBJECT = 'Stacer - 529 Assault Pro (Tournament)'

const pack = await loadPack()
const ctx = pack.ctx

/* THE HULL IS FOUND BY ITS NAME, not by the row id the pack happens
   to give it: a row id typed into a test is a test that goes green on
   the wrong boat the first time the seed is regenerated. */
const stacer: EntityDef = pack.byKey('boat_stacer')
const row = (pack.rowsByEntity[stacer.id] ?? []).find(
  (r: RowData) => rowLabel(stacer, r) === SUBJECT,
)

/** Every value a document prints, and not one id. The shape is the
 *  one the old-side script emitted, written out here so the two can
 *  be compared member for member rather than by a loose subset. */
const line = (l: QuoteLine) => ({
  label: l.label,
  qty: l.qty,
  unitPrice: l.unitPrice,
  priceColumnName: l.priceColumnName,
  levelKey: l.levelKey,
  levelResolved: l.levelResolved,
  levels: l.levels.map((v) => ({
    key: v.key,
    label: v.label,
    value: v.value,
    scope: v.scope,
    contains: v.contains ?? null,
  })),
  sourceNote: l.sourceNote ?? null,
  pairFacts: l.pairFacts ?? null,
  recommended: l.recommended ?? false,
  image: l.image?.src ?? null,
})

function freezeItNow() {
  expect(row, `the pack has no row labelled ${SUBJECT}`).toBeDefined()
  const view = createViewFor(ctx, stacer.id)
  const quote = mintQuoteFromView(ctx, {
    viewId: view.id,
    rowId: row!.id,
    reference: 'GOLDEN-0001',
  })
  expect(quote).not.toBeNull()
  return {
    subjectLabel: quote!.subjectLabel,
    subjectSpecs: quote!.subjectSpecs,
    subjectImage: quote!.subjectImage?.src ?? null,
    levelKey: quote!.levelKey,
    note: quote!.note ?? null,
    sections: quote!.sections.map((s) => ({
      title: s.title,
      tableName: ctx.entities[s.tableId]?.name ?? '',
      pickedCount: s.pickedCount ?? null,
      heldCount: s.heldCount ?? null,
      lines: s.lineIds
        .map((id) => quote!.lines.find((l) => l.id === id))
        .filter((l): l is QuoteLine => l !== undefined)
        .map(line),
    })),
    offers: quote!.sections.map((s) => {
      const offer = candidateOffer(ctx, quote!, s)
      return {
        title: s.title,
        pool: offer.pool,
        matched: offer.matched,
        heldCount: offer.heldCount,
        historic: offer.historic ?? null,
        reason: offer.reason,
        candidates: offer.candidates.map((c) => line(c.line)),
      }
    }),
  }
}

const now = freezeItNow()

describe('the 529 Assault Pro freezes the same way it always did', () => {
  it('names the same hull, at the same rung, with the same specs and photograph', () => {
    expect(now.subjectLabel).toEqual(golden.subjectLabel)
    expect(now.levelKey).toEqual(golden.levelKey)
    expect(now.subjectSpecs).toEqual(golden.subjectSpecs)
    expect(now.subjectImage).toEqual(golden.subjectImage)
    expect(now.note).toEqual(golden.note)
  })

  it('draws the same sections, in the same order, with the same counts', () => {
    expect(now.sections.map((s) => s.title)).toEqual(golden.sections.map((s) => s.title))
    expect(now.sections.map((s) => s.pickedCount)).toEqual(
      golden.sections.map((s) => s.pickedCount),
    )
    expect(now.sections.map((s) => s.heldCount)).toEqual(golden.sections.map((s) => s.heldCount))
  })

  /* THE THREE FIGURES THE TASK NAMES, asserted on their own as well
     as inside the whole diff, so a failure says which one moved. */
  it('prices the hull at $28,530', () => {
    const hull = now.sections[0].lines[0]
    expect(hull.label).toBe(SUBJECT)
    expect(hull.unitPrice).toBe(28530)
  })

  it('offers the six Yamahas and the TA1400 trailer', () => {
    const motors = now.offers.find((o) => o.title === 'Yamaha Outboards')
    expect(motors?.candidates).toHaveLength(6)
    const trailers = now.offers.find((o) => o.title === 'Stacer Trailers')
    expect(trailers?.candidates).toHaveLength(1)
    expect(trailers?.candidates[0].label).toContain('TA1400')
  })

  it('freezes every line of every section identically', () => {
    expect(now.sections).toEqual(golden.sections)
  })

  it('offers identically — every candidate, every denominator, every reason', () => {
    expect(now.offers).toEqual(golden.offers)
  })

  /* THE WHOLE DOCUMENT IN ONE ASSERTION. The five above say WHICH
     half moved when one does; this one says the answer is nothing at
     all. */
  it('is the same document, member for member', () => {
    const {
      '//': _note,
      command: _c,
      script: _script,
      source: _s,
      measured: _m,
      ...expected
    } = golden
    expect(now).toEqual(expected)
  })
})
