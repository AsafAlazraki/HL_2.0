/* ============================================================
   THE FOUR SENTENCES THE COLUMN SETUP SAYS BEFORE IT DESTROYS
   SOMETHING — pinned to what the store actually does.

   Every confirm sheet on the old surface used to end with "This app
   has no undo." All four were false, and a false sentence in a
   destructive dialog is the one kind of wrong wording that changes
   what a person does: it stops them doing something they could
   safely try. Each was pressed in the running app and taken back
   with Ctrl+Z before it was rewritten; this file is so the
   sentences cannot quietly become false again.

   WHAT IS TESTED HERE AND NOT IN `domain/undo.test.ts`. That file
   pins a bare retype, a bare column delete and a bare table delete
   over its own harness. Two things it does not: the shapes the
   DESIGNER actually calls, which were multi-call sequences that had
   to fold into ONE step —

     RetypeSheet, "keep what converts"   updateField(type) then one
                                         updateCell per carried value
     the link retarget                   updateField(refEntityId) then
                                         one updateCell(null) per link

   — and the CASCADE behind a table delete, which is the half the
   sheet's own sentence promises: the link columns on other tables
   and the rules rooted on this one come back with it.

   PORT NOTE — `features/designer/confirmSheetTruth.test.ts`, eight
   cases. The two multi-call sequences are ONE COMMAND each now:
   `retypeField` carries the values that convert, `retargetField`
   empties the links, and "folds into ONE step" is what each asserts
   of the stack. The old store's `undo()` returned the step's label;
   this store's returns the sentence it announces, which is that
   label with "Undone — " in front, and the assertions carry the
   prefix. The old surface's `.tsx` sheets are not here to read, so
   the two prose guards read the commands' own source and their
   counted radii — the sentence a confirm will print is the sentence
   `deleteFieldRadius`, `retypeRadius`, `retargetRadius` and
   `deleteTableRadius` compute, and each is proved computed.
   ============================================================ */
import { beforeEach, describe, expect, it } from 'vitest'
import type { EntityDef, RowData, RuleDef } from '@/domain/model'
import {
  deleteField,
  deleteFieldRadius,
  deleteTable,
  deleteTableRadius,
  isDone,
  retargetField,
  retargetRadius,
  retypeField,
  retypeRadius,
  type Outcome,
} from '@/domain/catalogue/commands'
import { memoryCatalogue } from '@/data/memory/repositories'
import { createCatalogueStore, dataOf, type CatalogueStore } from './catalogue'

/* the sources whose prose is guarded at the foot of this file.
   oxlint's import plugin resolves the specifier with the query
   stripped and reports a default the real module does not have —
   silenced here, exactly as `curation/applied.test.ts` silences it */
// oxlint-disable-next-line import/default
import commandsSrc from '@/domain/catalogue/commands.ts?raw'
// oxlint-disable-next-line import/default
import columnFactsSrc from '@/domain/catalogue/columnFacts.ts?raw'

const ISO = '2026-01-01T00:00:00.000Z'
let store: CatalogueStore
const state = () => store.getState()
const saidOf = (o: Outcome): string => (isDone(o) ? o.said : `refused: ${o.refused}`)
/** the blast radius an act kept on its event */
const alsoOf = (o: Outcome): string | undefined =>
  isDone(o) ? o.event.also : `refused: ${o.refused}`

/* ---------------------------------------------------------- */
/* two tables and a rule, in the shape the seed uses: a brand   */
/* price file, and a join table with a link column pointed at   */
/* it. Nothing here is a business fact — they are the smallest  */
/* structures that carry the four acts.                         */
/* ---------------------------------------------------------- */

function boats(): EntityDef {
  return {
    id: 'e-boats',
    orgId: 'test',
    name: 'Boats',
    accent: 'blue',
    sections: [
      { id: 's-id', name: 'Identity' },
      { id: 's-price', name: 'Pricing' },
    ],
    fields: [
      { id: 'f-model', name: 'Model', type: 'text', sectionId: 's-id' },
      { id: 'f-code', name: 'Model Code', type: 'text', sectionId: 's-id' },
      { id: 'f-cash', name: 'Cash', type: 'number', sectionId: 's-price' },
    ],
    displayFieldId: 'f-model',
    position: { x: 0, y: 0 },
    createdAt: ISO,
    updatedAt: ISO,
  }
}

function trailers(): EntityDef {
  return {
    id: 'e-trailers',
    orgId: 'test',
    name: 'Trailers',
    accent: 'ochre',
    fields: [{ id: 'f-tname', name: 'Model', type: 'text' }],
    displayFieldId: 'f-tname',
    position: { x: 400, y: 0 },
    createdAt: ISO,
    updatedAt: ISO,
  }
}

/** the join table — a link column aimed at Boats, which is what makes
 *  the table delete a cascade and the re-point possible */
function fitment(): EntityDef {
  return {
    id: 'e-fit',
    orgId: 'test',
    name: 'Boats × Trailers — Trailer Fitment',
    accent: 'violet',
    role: 'join',
    fields: [
      { id: 'f-label', name: 'Label', type: 'text' },
      { id: 'f-boat', name: 'Boat', type: 'reference', refEntityId: 'e-boats' },
    ],
    displayFieldId: 'f-label',
    position: { x: 200, y: 200 },
    createdAt: ISO,
    updatedAt: ISO,
  }
}

/** a rule ROOTED on Boats — `deleteTable` drops these outright */
function rootedRule(): RuleDef {
  return {
    id: 'r-fit',
    orgId: 'test',
    name: 'Trailer fitment',
    rootEntityId: 'e-boats',
    enabled: true,
    nodes: [],
    edges: [],
    createdAt: ISO,
    updatedAt: ISO,
  }
}

function boatRow(id: string, model: string, code: string, cash: number): RowData {
  return {
    id,
    orgId: 'test',
    entityId: 'e-boats',
    values: { 'f-model': model, 'f-code': code, 'f-cash': cash },
    createdAt: ISO,
    updatedAt: ISO,
  }
}

function fitRow(id: string, label: string, boatRowId: string): RowData {
  return {
    id,
    orgId: 'test',
    entityId: 'e-fit',
    values: { 'f-label': label, 'f-boat': boatRowId },
    createdAt: ISO,
    updatedAt: ISO,
  }
}

const boatFields = () => state().tables['e-boats'].fields
const fitFields = () => state().tables['e-fit'].fields
const boatRows = () => state().rows['e-boats'] ?? []
const fitRows = () => state().rows['e-fit'] ?? []
const boatCell = (rowId: string, fieldId: string) =>
  boatRows().find((r) => r.id === rowId)?.values[fieldId]

beforeEach(async () => {
  /* through a repository, because a rule is filed beside the sheet
     and a pack source carries none */
  const repo = memoryCatalogue('test')
  await repo.loadPack([boats(), trailers(), fitment()], {
    'e-boats': [
      boatRow('b1', '540 Pro Fisher', '540-PF', 52000),
      boatRow('b2', '610 Pro Fisher', '610-PF', 61000),
    ],
    'e-trailers': [
      {
        id: 't1',
        orgId: 'test',
        entityId: 'e-trailers',
        values: { 'f-tname': 'SRW5.7M-13TB' },
        createdAt: ISO,
        updatedAt: ISO,
      },
    ],
    'e-fit': [fitRow('x1', '540 · SRW5.7M', 'b1'), fitRow('x2', '610 · SRW5.7M', 'b2')],
  })
  await repo.rules.put(rootedRule())
  store = createCatalogueStore({ now: () => ISO, writeBehindMs: 0 })
  await store.getState().load(repo)
})

/* ---------------------------------------------------------- */

describe('“Ctrl+Z takes the whole change back” — the retype sheet', () => {
  it('folds the type change and every carried value into ONE step', () => {
    /* what RetypeSheet's "Keep the N that convert" does: change the
       type, and write the survivors back — one command now */
    state().apply(retypeField('e-boats', 'f-cash', 'text'))

    expect(state().undoStack()).toHaveLength(1)
    expect(boatCell('b1', 'f-cash')).toBe('52000')

    state().undo()
    expect(boatFields()[2].type).toBe('number')
    expect(boatCell('b1', 'f-cash')).toBe(52000)
    expect(boatCell('b2', 'f-cash')).toBe(61000)
    /* one press, not three — a person who has to guess how many times
       to press Ctrl+Z has no undo worth the name */
    expect(state().undoStack()).toHaveLength(0)
  })

  it('takes back the clear-everything branch with the values it dropped', () => {
    state().apply(retypeField('e-boats', 'f-code', 'number'))
    expect(boatCell('b1', 'f-code')).toBeUndefined()

    expect(saidOf(state().undo())).toBe('Undone — Column retyped · Boats')
    expect(boatFields()[1].type).toBe('text')
    expect(boatCell('b1', 'f-code')).toBe('540-PF')
    expect(boatCell('b2', 'f-code')).toBe('610-PF')
  })
})

describe('“at its own place in this list and in its own band” — the delete sheet', () => {
  it('puts the middle column back in the middle, banded, with its values', () => {
    state().apply(deleteField('e-boats', 'f-code'))
    expect(boatFields().map((f) => f.id)).toEqual(['f-model', 'f-cash'])

    expect(saidOf(state().undo())).toBe('Undone — Column deleted · Boats')
    const back = boatFields()
    expect(back.map((f) => f.id)).toEqual(['f-model', 'f-code', 'f-cash'])
    expect(back[1].sectionId).toBe('s-id')
    expect(boatCell('b1', 'f-code')).toBe('540-PF')
  })
})

describe('“the table it pointed at, and every link emptied here” — the re-point sheet', () => {
  it('is ONE step, and gives back both the target and every link', () => {
    /* `commitRetarget`: re-aim the column, then null every filled cell,
       because a row id of the old target means nothing in the new one */
    state().apply(retargetField('e-fit', 'f-boat', 'e-trailers'))

    expect(state().undoStack()).toHaveLength(1)
    expect(fitFields()[1].refEntityId).toBe('e-trailers')
    expect(fitRows()[0].values['f-boat']).toBeNull()

    state().undo()
    expect(fitFields()[1].refEntityId).toBe('e-boats')
    expect(fitRows()[0].values['f-boat']).toBe('b1')
    expect(fitRows()[1].values['f-boat']).toBe('b2')
    expect(state().undoStack()).toHaveLength(0)
  })
})

describe('“every row on it and every link column and rule that went with it”', () => {
  it('brings the table, its rows, the cascaded link column and the rooted rule back', () => {
    expect(fitFields().some((f) => f.id === 'f-boat')).toBe(true)
    expect(state().rules['r-fit']).toBeDefined()

    state().apply(deleteTable('e-boats'))

    /* the three things the sheet names, all gone */
    expect(state().tables['e-boats']).toBeUndefined()
    expect(state().rows['e-boats']).toBeUndefined()
    expect(fitFields().map((f) => f.id)).toEqual(['f-label'])
    expect(state().rules['r-fit']).toBeUndefined()

    expect(saidOf(state().undo())).toBe('Undone — Table deleted · Boats')

    expect(state().tables['e-boats'].name).toBe('Boats')
    expect(boatRows()).toHaveLength(2)
    expect(boatCell('b2', 'f-cash')).toBe(61000)
    /* the cascade, which is the half a person cannot see going */
    const boat = fitFields().find((f) => f.id === 'f-boat')
    expect(boat?.refEntityId).toBe('e-boats')
    expect(fitRows()[0].values['f-boat']).toBe('b1')
    expect(state().rules['r-fit']?.name).toBe('Trailer fitment')
  })
})

describe('the sentences themselves', () => {
  it('nothing in the column acts still claims this app has no undo', () => {
    /* the four sheets said it, and two file headers argued from it. A
       text guard is the honest one: the claim is prose, and prose is
       exactly what drifts back. `?raw` reads the sources through the
       same resolver the app is built with — no fs, no node types. */
    const sources: Record<string, string> = {
      'commands.ts': commandsSrc,
      'columnFacts.ts': columnFactsSrc,
    }
    /* the phrase may appear as a QUOTATION of the old wording — every
       correction above quotes what it replaced — so the guard is on the
       assertion, not the string: no occurrence may stand without the
       words that mark it as struck. Prose wraps, so the marker is
       looked for in the lines around it rather than on its own. */
    const STRUCK = /used to|struck|was false|were false|the clause|the sentence/i
    for (const [name, src] of Object.entries(sources)) {
      const lines = src.split('\n')
      lines.forEach((line, i) => {
        if (!/no undo|cannot be undone/i.test(line)) return
        const near = lines.slice(Math.max(0, i - 2), i + 3).join(' ')
        expect(STRUCK.test(near), `${name}:${i + 1} — "${line.trim()}"`).toBe(true)
      })
    }
  })
})

describe('every sheet still counts', () => {
  /* ── THE PROPERTY, AND WHY IT IS GUARDED HERE ────────────────

     DESIGN_PRINCIPLES §7: "a confirm states its blast radius,
     computed." A sheet that loses its radius in a refactor does not
     fail anything — it just goes back to asking "are you sure?",
     which is the state the old surface was built out of, and the
     four sentences above would still pass while it did.

     The old guard read the `.tsx` sheets, which are not here. What
     is here is the radius each act computes — the same function the
     sheet will draw and the command reads — so the guard is on the
     radius being COMPUTED FROM THE SHEET rather than typed. */
  it('every one of the four destructive acts has a counted radius, and the act says the same sentence', () => {
    const data = dataOf(state())
    const radii = {
      'delete a column': deleteFieldRadius(data, 'e-boats', 'f-cash'),
      'retype one': retypeRadius(data, 'e-boats', 'f-code', 'number'),
      're-point a link': retargetRadius(data, 'e-fit', 'f-boat', 'e-trailers'),
      'delete the table': deleteTableRadius(data, 'e-boats'),
    }
    /* the four acts this surface destroys something with. A fifth
       appearing is not a failure — it is a reminder to read this file
       and decide whether rule 9 wanted a toast instead. */
    expect(Object.keys(radii)).toHaveLength(4)
    for (const [act, radius] of Object.entries(radii)) {
      expect(radius.refusal, act).toBeNull()
      expect(radius.said, act).not.toBe('')
    }
    expect(radii['delete a column'].said).toBe('This also removes 2 values.')
    expect(radii['retype one'].said).toBe(
      'None of the 2 values can be read as number, so all 2 are cleared.',
    )
    expect(radii['re-point a link'].said).toBe(
      '2 links emptied — a row id of Boats means nothing in Trailers.',
    )
    expect(radii['delete the table'].said).toBe(
      'This also removes 2 models, the Boat link on Boats × Trailers — Trailer Fitment and the rule Trailer fitment.',
    )

    /* and the act, when it runs, keeps exactly that sentence */
    expect(alsoOf(state().apply(deleteTable('e-boats')))).toBe(radii['delete the table'].said)
    state().undo()
    expect(alsoOf(state().apply(retypeField('e-boats', 'f-code', 'number')))).toBe(
      radii['retype one'].said,
    )
    state().undo()
    expect(alsoOf(state().apply(retargetField('e-fit', 'f-boat', 'e-trailers')))).toBe(
      radii['re-point a link'].said,
    )
    state().undo()
    expect(alsoOf(state().apply(deleteField('e-boats', 'f-cash')))).toBe(
      radii['delete a column'].said,
    )
  })

  /* THE FIGURES ARE READ, NEVER WRITTEN DOWN. A radius whose figure is
     a string literal is a guess dressed as a measurement, and it is the
     one failure mode that would look right on screen. Every figure in
     a radius sentence is a `${…}` read off the sheet. */
  it('never writes a figure into a radius by hand', () => {
    const nouns = 'values?|pairings?|rows?|links?|columns?|rules?|pages?|variants?|models?|boats?'
    const quoted = new RegExp(`'[^'\\n]*\\b\\d+ (?:${nouns})\\b[^'\\n]*'`, 'g')
    const templated = new RegExp('`[^`]*`', 'g')
    expect([...commandsSrc.matchAll(quoted)].map((m) => m[0])).toEqual([])
    const figured = [...commandsSrc.matchAll(templated)]
      .map((m) => m[0])
      .filter((t) => new RegExp(`\\b\\d+ (?:${nouns})\\b`).test(t))
    for (const t of figured) expect(t, t).toContain('${')
  })
})
