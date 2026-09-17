/* ============================================================
   UNDO — the history engine, tested where it actually lives.

   Pure logic, no DOM: every assertion here is about what `past` /
   `future` hold and what the data looks like after a step.

   WHAT MOVED, AND WHAT DID NOT. The old suite drove
   `useProjectStore` — the engine and the mutators were one file, so
   the only way to test the stack was to edit a cell. The engine is
   `src/domain/undo.ts` now and the catalogue store is READ-ONLY in
   Milestone 1 (its named commands arrive in M2), so the mutators the
   assertions need are a HARNESS below: the same six acts, over the
   same slice, doing the same immutable writes. Not one assertion is
   edited. The label strings, the burst arithmetic, the typing
   window, the bound, the redo rules and the cascade promise are the
   ones that shipped.

   WHAT COULD NOT BE PORTED, AND IS NOT PRETENDED. Four groups of the
   old suite drove acts this build does not have yet and this port
   may not invent:

     · the rule canvas (create/delete a rule, a step, a wire) — the
       plan drops the flow-graph canvas by name; the engine ports,
       the 5.5k lines of xyflow do not;
     · zones (`createGroup`, `deleteGroup`);
     · a module made, renamed, reordered or deleted ON ITS OWN — the
       nine places are minted by app code that is not written;
     · "an undo is written through" — the catalogue store takes no
       mutations in M1, so there is no write-behind to assert against
       and a green test here would be a test of the harness.

   AND A FIFTH GROUP LEFT THIS FILE RATHER THAN BEING DROPPED, which
   the first version of this header failed to say. "When the business
   was set up" (4 cases, TENANCY §4.6) was never about the history
   stack — it was in the old suite because `setOrganisation` was in
   the old store, beside `undo`. It is
   `src/domain/people/organisation.test.ts` now, whole, against the
   pure act; that file's header carries the accounting for it and for
   the two other suites that were about the same property.

   The one module assertion that IS about the engine — a module comes
   back when it went with a table that was deleted, because modules
   are in the slice — is ported, because the cascade is what makes it
   true and the cascade is here.
   ============================================================ */
import { beforeEach, describe, expect, it } from 'vitest'
import type { CellValue, EntityDef, ModuleDef, RowData, ViewDef } from '@/domain/model'
import { createHistory, HISTORY_DEPTH, type HistoryStacks } from './undo'

/* ============================================================
   THE HARNESS — six acts over four maps.

   It is the smallest thing that can be the engine's host: it reads
   and writes a slice, it keeps the two stacks, and it hands over a
   clock a test can drive. Every mutator is `commit(op, fn)` around
   an immutable write, which is the shape `state/catalogue.ts` takes
   in Milestone 2.
   ============================================================ */

const ISO = '2026-01-01T00:00:00.000Z'
const ORG = 'test'

/** the four maps history restores — everything that is project DATA */
interface DataSlice {
  entities: Record<string, EntityDef>
  rowsByEntity: Record<string, RowData[]>
  views: Record<string, ViewDef>
  modules: Record<string, ModuleDef>
}

interface Harness {
  data: DataSlice
  stacks: HistoryStacks<DataSlice>
  /** not data, and deliberately never a step */
  selection: string | null
  clock: number
}

function boats(): EntityDef {
  return {
    id: 'e-boats',
    orgId: ORG,
    name: 'Boats',
    accent: 'blue',
    fields: [
      { id: 'f-model', name: 'Model', type: 'text' },
      { id: 'f-price', name: 'Price', type: 'number' },
    ],
    displayFieldId: 'f-model',
    position: { x: 0, y: 0 },
    createdAt: ISO,
    updatedAt: ISO,
  }
}

function row(id: string, model: string, price: number): RowData {
  return {
    id,
    orgId: ORG,
    entityId: 'e-boats',
    values: { 'f-model': model, 'f-price': price },
    createdAt: ISO,
    updatedAt: ISO,
  }
}

/** two cell values that are the same value. Two distinct arrays are
 *  never assumed equal — a picture list is re-ordered in place by
 *  building a new one, and calling that "unchanged" would lose it. */
const cellUnchanged = (a: unknown, b: unknown): boolean => a === b || (a == null && b == null)

const h: Harness = {
  data: { entities: {}, rowsByEntity: {}, views: {}, modules: {} },
  stacks: { past: [], future: [] },
  selection: null,
  clock: 1_700_000_000_000,
}

const history = createHistory<DataSlice>({
  read: () => h.data,
  write: (slice) => {
    h.data = slice
    /* A SELECTION MUST NOT OUTLIVE ITS SUBJECT. Undoing "table added"
       strikes the table the inspector is pointing at; leaving the id
       behind is how a panel draws a rectangle with nothing in it.
       The engine has no opinion about selections, so the host mends
       its own here. */
    if (h.selection !== null && !slice.entities[h.selection]) h.selection = null
  },
  stacks: () => h.stacks,
  setStacks: (next) => {
    h.stacks = next
  },
  now: () => h.clock,
  /* one turn of the event loop is one step — the same grouping the
     store used, driven by the same microtask */
  schedule: (fn) => queueMicrotask(fn),
})

const nameOf = (entityId: string): string | undefined => h.data.entities[entityId]?.name

const store = {
  past: () => h.stacks.past,
  future: () => h.stacks.future,
  undo: () => history.undo(),
  redo: () => history.redo(),

  replaceProject: (next: {
    entities: EntityDef[]
    rowsByEntity?: Record<string, RowData[]>
    views?: Record<string, ViewDef>
    modules?: Record<string, ModuleDef>
  }) => {
    const entities: Record<string, EntityDef> = {}
    for (const e of next.entities) entities[e.id] = e
    h.data = {
      entities,
      rowsByEntity: next.rowsByEntity ?? {},
      views: next.views ?? {},
      modules: next.modules ?? {},
    }
    h.selection = null
    history.forget()
  },

  select: (id: string | null) => {
    h.selection = id
  },

  /** where a table sits on the drawing — never a step */
  moveEntity: (entityId: string, position: { x: number; y: number }) => {
    const e = h.data.entities[entityId]
    if (!e) return
    h.data = {
      ...h.data,
      entities: { ...h.data.entities, [entityId]: { ...e, position } },
    }
  },

  updateCell: (entityId: string, rowId: string, fieldId: string, value: CellValue) =>
    history.commit(
      { one: 'Cell edit', many: (n) => `${n} cell edits`, where: nameOf(entityId) },
      () => {
        const rows = h.data.rowsByEntity[entityId] ?? []
        const at = rows.findIndex((r) => r.id === rowId)
        if (at < 0) return false
        /* pressing Enter writes the value straight back; recording it
           would spend an undo on a keystroke that did nothing */
        if (cellUnchanged(rows[at].values[fieldId], value)) return false
        const next = [...rows]
        next[at] = { ...rows[at], values: { ...rows[at].values, [fieldId]: value } }
        h.data = { ...h.data, rowsByEntity: { ...h.data.rowsByEntity, [entityId]: next } }
        return true
      },
    ),

  addRow: (entityId: string): RowData | null => {
    let made: RowData | null = null
    history.commit(
      { one: 'Row added', many: (n) => `${n} rows added`, where: nameOf(entityId) },
      () => {
        if (!h.data.entities[entityId]) return false
        const rows = h.data.rowsByEntity[entityId] ?? []
        made = {
          id: `r-new-${rows.length + 1}`,
          orgId: ORG,
          entityId,
          values: {},
          createdAt: ISO,
          updatedAt: ISO,
        }
        h.data = {
          ...h.data,
          rowsByEntity: { ...h.data.rowsByEntity, [entityId]: [...rows, made] },
        }
        return true
      },
    )
    return made
  },

  deleteRow: (entityId: string, rowId: string) =>
    history.commit(
      { one: 'Row deleted', many: (n) => `${n} rows deleted`, where: nameOf(entityId) },
      () => {
        const rows = h.data.rowsByEntity[entityId] ?? []
        if (!rows.some((r) => r.id === rowId)) return false
        h.data = {
          ...h.data,
          rowsByEntity: {
            ...h.data.rowsByEntity,
            [entityId]: rows.filter((r) => r.id !== rowId),
          },
        }
        return true
      },
    ),

  removeField: (entityId: string, fieldId: string) =>
    history.commit(
      { one: 'Column deleted', many: (n) => `${n} columns deleted`, where: nameOf(entityId) },
      () => {
        const e = h.data.entities[entityId]
        if (!e?.fields.some((f) => f.id === fieldId)) return false
        const next: EntityDef = { ...e, fields: e.fields.filter((f) => f.id !== fieldId) }
        if (next.displayFieldId === fieldId) delete next.displayFieldId
        const rows = (h.data.rowsByEntity[entityId] ?? []).map((r) => {
          const values = { ...r.values }
          delete values[fieldId]
          return { ...r, values }
        })
        h.data = {
          ...h.data,
          entities: { ...h.data.entities, [entityId]: next },
          rowsByEntity: { ...h.data.rowsByEntity, [entityId]: rows },
        }
        return true
      },
    ),

  updateField: (entityId: string, fieldId: string, patch: { type: 'text' | 'number' }) =>
    history.commit({ one: 'Column retyped', where: nameOf(entityId) }, () => {
      const e = h.data.entities[entityId]
      const field = e?.fields.find((f) => f.id === fieldId)
      if (!e || !field || field.type === patch.type) return false
      const next: EntityDef = {
        ...e,
        fields: e.fields.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)),
      }
      /* a retype drops what the new type cannot hold */
      const rows = (h.data.rowsByEntity[entityId] ?? []).map((r) => {
        const values = { ...r.values }
        delete values[fieldId]
        return { ...r, values }
      })
      h.data = {
        ...h.data,
        entities: { ...h.data.entities, [entityId]: next },
        rowsByEntity: { ...h.data.rowsByEntity, [entityId]: rows },
      }
      return true
    }),

  updateEntity: (entityId: string, patch: { name: string }) =>
    history.commit(
      /* a per-keystroke write — see TYPING_MS */
      { one: 'Table renamed', where: nameOf(entityId), key: `entity:${entityId}:name` },
      () => {
        const e = h.data.entities[entityId]
        if (!e || e.name === patch.name) return false
        h.data = {
          ...h.data,
          entities: { ...h.data.entities, [entityId]: { ...e, ...patch } },
        }
        return true
      },
    ),

  /** THE CASCADE: a table takes its pages and its modules with it */
  deleteEntity: (entityId: string) =>
    history.commit({ one: 'Table deleted', where: nameOf(entityId) }, () => {
      if (!h.data.entities[entityId]) return false
      const entities = { ...h.data.entities }
      delete entities[entityId]
      const rowsByEntity = { ...h.data.rowsByEntity }
      delete rowsByEntity[entityId]

      const views: Record<string, ViewDef> = {}
      for (const [id, v] of Object.entries(h.data.views)) {
        if (v.rootTableId === entityId) continue
        views[id] = { ...v, blocks: v.blocks.filter((b) => b.tableId !== entityId) }
      }
      const modules: Record<string, ModuleDef> = {}
      for (const [id, m] of Object.entries(h.data.modules)) {
        const tableIds = m.tableIds.filter((t) => t !== entityId)
        if (tableIds.length === 0) continue
        modules[id] = { ...m, tableIds }
      }
      h.data = { entities, rowsByEntity, views, modules }
      return true
    }),
}

/** one turn of the event loop — a burst closes on the next microtask,
 *  so this is what separates two acts into two undo steps */
const turn = () => Promise.resolve()

const rows = () => h.data.rowsByEntity['e-boats'] ?? []
const cell = (rowId: string, fieldId: string) => rows().find((r) => r.id === rowId)?.values[fieldId]

beforeEach(() => {
  /* replaceProject installs a project AND clears history — the same
     door the demo sets and the importer come through */
  store.replaceProject({
    entities: [boats()],
    rowsByEntity: {
      'e-boats': [row('r1', 'Surtees 540', 52000), row('r2', 'Highfield 460', 31000)],
    },
  })
})

describe('undo — a cell edit', () => {
  it('puts the old value back and says what it did', () => {
    store.updateCell('e-boats', 'r1', 'f-price', 61000)
    expect(cell('r1', 'f-price')).toBe(61000)

    const label = store.undo()
    expect(label).toBe('Cell edit · Boats')
    expect(cell('r1', 'f-price')).toBe(52000)
  })

  it('does not record a commit that changed nothing', async () => {
    store.updateCell('e-boats', 'r1', 'f-price', 61000)
    await turn()
    /* the editor closed on an untouched cell — the write still goes
       through, but it must not spend a step */
    store.updateCell('e-boats', 'r1', 'f-price', 61000)
    await turn()

    expect(store.past()).toHaveLength(1)
    store.undo()
    expect(cell('r1', 'f-price')).toBe(52000)
  })

  it('is nothing to undo on a fresh project', () => {
    expect(store.undo()).toBeNull()
    expect(store.past()).toHaveLength(0)
  })
})

describe('undo — a row delete', () => {
  it('brings the whole row back, values and all', () => {
    store.deleteRow('e-boats', 'r2')
    expect(rows()).toHaveLength(1)

    expect(store.undo()).toBe('Row deleted · Boats')
    expect(rows()).toHaveLength(2)
    expect(cell('r2', 'f-model')).toBe('Highfield 460')
  })

  it('takes a whole multi-row strike back in one step', async () => {
    /* the sheet deletes a selection with a synchronous loop of
       deleteRow calls — one act, so one step */
    for (const id of ['r1', 'r2']) store.deleteRow('e-boats', id)
    await turn()

    expect(store.past()).toHaveLength(1)
    expect(store.undo()).toBe('2 rows deleted · Boats')
    expect(rows()).toHaveLength(2)
  })
})

/* ============================================================
   WHAT THE CONFIRM SHEETS NOW PROMISE, IN WRITING.

   Two destructive confirms in the register said "There is no undo."
   Both were false, so the row strike became a toast with UNDO and the
   column sheet's sentence became "Ctrl+Z brings the column back, with
   every value in it." A sentence in front of somebody deciding whether
   to risk their price file has to be exactly true, and "it comes back"
   is not the same claim as "it comes back WHERE IT WAS" — a row that
   returned to the foot of an 11,116-row sheet, or a column that returned
   to the far right of a banded sheet, would make both sentences lies of
   a quieter kind. The tests above prove the values survive; these prove
   the POSITION does, which is the half the wording now rests on.
   ============================================================ */
describe('undo — and the place the thing comes back to', () => {
  it('puts a struck row back at its own index, not at the end', async () => {
    store.replaceProject({
      entities: [boats()],
      rowsByEntity: {
        'e-boats': [
          row('r1', 'Surtees 540', 52000),
          row('r2', 'Highfield 460', 31000),
          row('r3', 'Stacer 429', 18000),
        ],
      },
    })

    store.deleteRow('e-boats', 'r2')
    await turn()
    expect(rows().map((r) => r.id)).toEqual(['r1', 'r3'])

    expect(store.undo()).toBe('Row deleted · Boats')
    expect(rows().map((r) => r.id)).toEqual(['r1', 'r2', 'r3'])
    expect(cell('r2', 'f-model')).toBe('Highfield 460')
    expect(cell('r2', 'f-price')).toBe(31000)
  })

  it('takes a whole strike of three rows back in one press, in order', async () => {
    store.replaceProject({
      entities: [boats()],
      rowsByEntity: {
        'e-boats': [
          row('r1', 'Surtees 540', 52000),
          row('r2', 'Highfield 460', 31000),
          row('r3', 'Stacer 429', 18000),
          row('r4', 'Formosa 480', 27000),
        ],
      },
    })

    /* what the toolbar's Delete button does: one synchronous loop */
    for (const id of ['r1', 'r2', 'r4']) store.deleteRow('e-boats', id)
    await turn()
    expect(rows().map((r) => r.id)).toEqual(['r3'])
    expect(store.past()).toHaveLength(1)

    expect(store.undo()).toBe('3 rows deleted · Boats')
    expect(rows().map((r) => r.id)).toEqual(['r1', 'r2', 'r3', 'r4'])
  })

  it('puts a removed column back at its own index, in its own band', () => {
    const banded: EntityDef = {
      ...boats(),
      sections: [{ id: 's-id', name: 'Identity' }],
      fields: [
        { id: 'f-model', name: 'Model', type: 'text', sectionId: 's-id' },
        { id: 'f-matrix', name: 'Matrix', type: 'text', sectionId: 's-id' },
        { id: 'f-price', name: 'Price', type: 'number' },
      ],
    }
    store.replaceProject({
      entities: [banded],
      rowsByEntity: {
        'e-boats': [
          {
            ...row('r1', 'Surtees 540', 52000),
            values: { 'f-model': 'Surtees 540', 'f-matrix': 'Surtees', 'f-price': 52000 },
          },
          {
            ...row('r2', 'Highfield 460', 31000),
            values: { 'f-model': 'Highfield 460', 'f-matrix': 'Highfield', 'f-price': 31000 },
          },
        ],
      },
    })

    store.removeField('e-boats', 'f-matrix')
    expect(h.data.entities['e-boats'].fields.map((f) => f.id)).toEqual(['f-model', 'f-price'])
    expect(cell('r1', 'f-matrix')).toBeUndefined()

    expect(store.undo()).toBe('Column deleted · Boats')
    /* the middle column, in the middle again — a column that came back
       at the far right would be inside no band, and the sheet would draw
       "Identity" twice with Price between the two halves */
    const back = h.data.entities['e-boats'].fields
    expect(back.map((f) => f.id)).toEqual(['f-model', 'f-matrix', 'f-price'])
    expect(back[1].sectionId).toBe('s-id')
    expect(cell('r1', 'f-matrix')).toBe('Surtees')
    expect(cell('r2', 'f-matrix')).toBe('Highfield')
  })

  it('gives back the name column the table was displaying by', () => {
    store.removeField('e-boats', 'f-model')
    expect(h.data.entities['e-boats'].displayFieldId).toBeUndefined()

    store.undo()
    expect(h.data.entities['e-boats'].displayFieldId).toBe('f-model')
  })
})

describe('undo — a paste', () => {
  it('is one step however many cells it wrote', async () => {
    /* what a paste does: create the rows it needs, then write every
       cell, all in one synchronous handler */
    const made = store.addRow('e-boats')
    expect(made).not.toBeNull()
    store.updateCell('e-boats', 'r1', 'f-model', 'Surtees 610')
    store.updateCell('e-boats', 'r1', 'f-price', 71000)
    store.updateCell('e-boats', 'r2', 'f-model', 'Highfield 500')
    await turn()

    expect(store.past()).toHaveLength(1)
    /* mixed ops, one table — counted, not guessed at */
    expect(store.undo()).toBe('4 changes · Boats')
    expect(rows()).toHaveLength(2)
    expect(cell('r1', 'f-model')).toBe('Surtees 540')
    expect(cell('r2', 'f-model')).toBe('Highfield 460')
  })
})

describe('undo — columns and tables', () => {
  it('takes back a retype, and the values it dropped', () => {
    store.updateField('e-boats', 'f-price', { type: 'text' })
    expect(cell('r1', 'f-price')).toBeUndefined()

    expect(store.undo()).toBe('Column retyped · Boats')
    expect(h.data.entities['e-boats'].fields[1].type).toBe('number')
    expect(cell('r1', 'f-price')).toBe(52000)
  })

  it('takes back a deleted column', () => {
    store.removeField('e-boats', 'f-price')
    expect(h.data.entities['e-boats'].fields).toHaveLength(1)

    expect(store.undo()).toBe('Column deleted · Boats')
    expect(h.data.entities['e-boats'].fields).toHaveLength(2)
    expect(cell('r1', 'f-price')).toBe(52000)
  })

  it('takes back a deleted table, with every row on it', () => {
    store.deleteEntity('e-boats')
    expect(h.data.entities['e-boats']).toBeUndefined()

    expect(store.undo()).toBe('Table deleted · Boats')
    expect(h.data.entities['e-boats'].name).toBe('Boats')
    expect(rows()).toHaveLength(2)
  })

  it('folds a name typed letter by letter into one step', async () => {
    for (const name of ['B', 'Bo', 'Boa', 'Boat', 'Boats!']) {
      store.updateEntity('e-boats', { name })
      await turn()
    }
    expect(store.past()).toHaveLength(1)
    expect(store.undo()).toBe('Table renamed · Boats')
    expect(h.data.entities['e-boats'].name).toBe('Boats')
  })

  it('opens a second step once the typing window has passed', async () => {
    /* THE OTHER HALF OF THE COALESCING RULE, and the half only an
       injected clock can assert: two keystrokes further apart than
       TYPING_MS are two acts, because a person who came back to a
       field after a pause expects one press of Ctrl+Z to undo the
       coming back rather than the whole name. The old suite could
       not reach this — it read the wall clock and every turn of the
       loop landed inside the window. */
    store.updateEntity('e-boats', { name: 'Bo' })
    await turn()
    h.clock += 2000
    store.updateEntity('e-boats', { name: 'Boats!' })
    await turn()

    expect(store.past()).toHaveLength(2)
    store.undo()
    expect(h.data.entities['e-boats'].name).toBe('Bo')
  })
})

describe('what history deliberately ignores', () => {
  it('does not record where a table sits on the drawing', async () => {
    store.moveEntity('e-boats', { x: 900, y: 400 })
    await turn()
    expect(store.past()).toHaveLength(0)
    expect(store.undo()).toBeNull()
  })

  it('does not record selection', async () => {
    store.select('e-boats')
    await turn()
    expect(store.past()).toHaveLength(0)
  })

  it('forgets everything on a project swap', async () => {
    store.updateCell('e-boats', 'r1', 'f-price', 61000)
    await turn()
    expect(store.past()).toHaveLength(1)

    store.replaceProject({ entities: [] })
    expect(store.past()).toHaveLength(0)
    expect(store.future()).toHaveLength(0)
    expect(store.undo()).toBeNull()
  })
})

describe('the bound', () => {
  it('keeps the newest HISTORY_DEPTH steps and drops the oldest', async () => {
    const over = HISTORY_DEPTH + 10
    for (let i = 1; i <= over; i += 1) {
      store.updateCell('e-boats', 'r1', 'f-price', i)
      await turn()
    }
    expect(store.past()).toHaveLength(HISTORY_DEPTH)

    /* every step back, and then one more than there are */
    for (let i = 0; i < HISTORY_DEPTH; i += 1) {
      expect(store.undo()).toBe('Cell edit · Boats')
    }
    expect(store.undo()).toBeNull()

    /* the oldest steps fell off the bottom, so the price does NOT go
       all the way home — it stops at the value the surviving window
       began from. That is what a bounded stack means. */
    expect(cell('r1', 'f-price')).toBe(over - HISTORY_DEPTH)
    expect(store.past()).toHaveLength(0)
  })
})

describe('redo', () => {
  it('puts back what undo took, and says so', async () => {
    store.updateCell('e-boats', 'r1', 'f-price', 61000)
    await turn()

    store.undo()
    expect(cell('r1', 'f-price')).toBe(52000)
    expect(store.future()).toHaveLength(1)

    expect(store.redo()).toBe('Cell edit · Boats')
    expect(cell('r1', 'f-price')).toBe(61000)
    expect(store.future()).toHaveLength(0)
    expect(store.past()).toHaveLength(1)
  })

  it('walks a run of steps back and forward again', async () => {
    for (const v of [1, 2, 3]) {
      store.updateCell('e-boats', 'r1', 'f-price', v)
      await turn()
    }
    store.undo()
    store.undo()
    expect(cell('r1', 'f-price')).toBe(1)
    store.redo()
    store.redo()
    expect(cell('r1', 'f-price')).toBe(3)
    expect(store.redo()).toBeNull()
  })

  it('is cleared by a new change — nobody expects otherwise', async () => {
    store.updateCell('e-boats', 'r1', 'f-price', 61000)
    await turn()
    store.undo()
    expect(store.future()).toHaveLength(1)

    store.updateCell('e-boats', 'r2', 'f-price', 33000)
    await turn()

    expect(store.future()).toHaveLength(0)
    expect(store.redo()).toBeNull()
    /* and the branch it was on is gone for good, not half-applied */
    expect(cell('r1', 'f-price')).toBe(52000)
    expect(cell('r2', 'f-price')).toBe(33000)
  })
})

/* ============================================================
   THE PHANTOM ENTRY — the defect the plan names and `commit`
   closes.

   `record(op)` had to run BEFORE the mutation, and it kept the entry
   whether or not the mutation then ran. The store had a guard that
   could DECLINE a write after the recording, so a declined edit left
   a step on the stack that undid the change before it — a person
   pressing Ctrl+Z got back a document they had not been looking at,
   and nothing anywhere said so.
   ============================================================ */
describe('an entry is kept only if the mutation ran', () => {
  it('spends no step on an act that declined', async () => {
    const before = h.data
    history.commit({ one: 'Cell edit', where: 'Boats' }, () => false)
    await turn()

    expect(store.past()).toHaveLength(0)
    expect(store.undo()).toBeNull()
    expect(h.data).toBe(before)
  })

  it('spends no step on an act that wrote nothing, even without saying so', async () => {
    /* an act that reports nothing at all, and moves nothing: the
       slice is the arbiter, so the entry still does not survive */
    history.commit({ one: 'Cell edit', where: 'Boats' }, () => {})
    await turn()
    expect(store.past()).toHaveLength(0)
  })

  it('keeps the acts that DID run when one beside them declined', async () => {
    /* one handler, three acts, the middle one refused — the step is
       the two that happened and undoing gives back exactly those */
    store.updateCell('e-boats', 'r1', 'f-price', 61000)
    history.commit({ one: 'Cell edit', where: 'Boats' }, () => false)
    store.updateCell('e-boats', 'r2', 'f-price', 33000)
    await turn()

    expect(store.past()).toHaveLength(1)
    expect(store.undo()).toBe('2 cell edits · Boats')
    expect(cell('r1', 'f-price')).toBe(52000)
    expect(cell('r2', 'f-price')).toBe(31000)
  })
})

/* ============================================================
   DELETING A TABLE TAKES ITS PAGES AND MODULES WITH IT, and the
   confirm sheet promises on screen that Ctrl+Z brings them back:
   "the pages and modules above come back with it."

   That sentence is a SAFETY CLAIM about the largest act in the app,
   so it is asserted here rather than inspected. It holds because the
   entry carries the whole slice — which includes `views` and
   `modules` — but "it holds because" is how a promise quietly stops
   holding.

   TYPED, NOT CAST. The first draft reached for `as ... as never` to
   satisfy the setter, and that cast is exactly why the typecheck
   passed: it silenced the checker on a fixture with `index: 'grid'`
   in it, which is not a `ModuleIndexMode` — the modes are 'rows' and
   'tiles'. A cast in a test is worse than one in source: a test is
   the one place a wrong shape should fail loudly, and this one was
   asserting a SAFETY promise while lying about its own fixture.
   ============================================================ */

const page = (over: Partial<ViewDef> & { id: string; rootTableId: string }): ViewDef => ({
  orgId: ORG,
  name: over.id,
  blocks: [],
  createdAt: ISO,
  updatedAt: ISO,
  ...over,
})

const place = (over: Partial<ModuleDef> & { id: string; tableIds: string[] }): ModuleDef => ({
  orgId: ORG,
  name: over.id,
  description: '',
  capabilities: [],
  index: 'rows',
  accent: 'blue',
  order: 0,
  createdAt: ISO,
  updatedAt: ISO,
  ...over,
})

describe('undo — a table delete that cascades', () => {
  beforeEach(() => {
    store.replaceProject({
      entities: [boats()],
      rowsByEntity: {
        'e-boats': [row('r1', 'Surtees 540', 52000), row('r2', 'Highfield 460', 31000)],
      },
      views: {
        'v-boats': page({ id: 'v-boats', name: 'Boats page', rootTableId: 'e-boats' }),
        'v-other': page({
          id: 'v-other',
          name: 'Rigs page',
          rootTableId: 'e-rigs',
          blocks: [
            { id: 'b1', tableId: 'e-boats' },
            { id: 'b2', tableId: 'e-rigs' },
          ],
        }),
      },
      modules: {
        'm-only': place({ id: 'm-only', name: 'Boats', tableIds: ['e-boats'], viewId: 'v-boats' }),
        'm-wider': place({ id: 'm-wider', name: 'Sales', tableIds: ['e-boats', 'e-rigs'] }),
      },
    })
  })

  it('takes the page, the module and the block', () => {
    store.deleteEntity('e-boats')
    expect(h.data.views['v-boats']).toBeUndefined()
    expect(h.data.modules['m-only']).toBeUndefined()
    /* the wider module keeps its place with one table fewer, and the
       page elsewhere loses only the block */
    expect(h.data.modules['m-wider'].tableIds).toEqual(['e-rigs'])
    expect(h.data.views['v-other'].blocks.map((b) => b.tableId)).toEqual(['e-rigs'])
  })

  it('puts all four back, which is what the sheet says out loud', () => {
    store.deleteEntity('e-boats')
    expect(store.undo()).toBe('Table deleted · Boats')

    expect(h.data.entities['e-boats']).toBeDefined()
    expect(h.data.views['v-boats']).toBeDefined()
    expect(h.data.modules['m-only']).toBeDefined()
    expect(h.data.modules['m-only'].viewId).toBe('v-boats')
    expect(h.data.modules['m-wider'].tableIds).toEqual(['e-boats', 'e-rigs'])
    expect(h.data.views['v-other'].blocks.map((b) => b.tableId)).toEqual(['e-boats', 'e-rigs'])
  })

  it('BRINGS A MODULE BACK when it went with a table that was deleted', () => {
    /* The cascade's whole promise, and the reason the module registry
       must not drop a switch on delete: the table's own step captured
       the slice, and modules are in it. */
    store.deleteEntity('e-boats')
    expect(h.data.modules['m-only']).toBeUndefined()

    store.undo()
    expect(h.data.modules['m-only']?.name).toBe('Boats')
    expect(h.data.entities['e-boats']).toBeDefined()
  })
})
