import { describe, expect, it } from 'vitest'
import {
  KEEP,
  appliedSince,
  noteApplied,
  noteCleared,
  notePutBack,
  noteRead,
  notesOf,
} from './brought'

/* ============================================================
   THE ACCOUNT OF WORKBOOKS BROUGHT IN: read, applied, put back,
   cleared, and what is on the price list since it came with the app.
   ============================================================ */

const read = (file: string, at: string) => ({
  file,
  bytes: 39_800_000,
  saved: '2026-09-12T01:00:00.000Z',
  read: at,
  by: 'Asaf',
  changes: 3082,
  adding: 817,
  cannot: 61,
})

describe('the account of files brought in', () => {
  it('keeps a file read, then applied, then put back, newest first', () => {
    const one = noteRead([], read('Parts Module (2).xlsx', '2026-11-04T01:00:00.000Z'))
    expect(one.notes[0]).toMatchObject({ now: 'read', applied: null, at: null })
    const applied = noteApplied(one.notes, one.id, 3918, '2026-11-04T01:05:00.000Z')
    expect(applied[0]).toMatchObject({ now: 'applied', applied: 3918 })
    expect(appliedSince(applied).map((n) => n.file)).toEqual(['Parts Module (2).xlsx'])
    const back = notePutBack(applied, one.id, '2026-11-04T01:06:00.000Z')
    expect(back[0].now).toBe('put-back')
    expect(appliedSince(back)).toEqual([])
  })

  it('says nothing brought in before a clear is on the price list', () => {
    const one = noteRead([], read('a.xlsx', '2026-11-01T01:00:00.000Z'))
    const applied = noteApplied(one.notes, one.id, 10, '2026-11-01T01:01:00.000Z')
    const cleared = noteCleared(applied, '2026-11-02T01:00:00.000Z', 'Asaf')
    expect(cleared[0]).toMatchObject({ now: 'cleared', by: 'Asaf' })
    expect(appliedSince(cleared)).toEqual([])
  })

  it('reads only what reads as the account, newest first, and keeps at most forty', () => {
    expect(notesOf('nonsense')).toEqual([])
    expect(notesOf([{ id: 1 }, null])).toEqual([])
    let notes = notesOf([])
    for (let i = 0; i < KEEP + 5; i++) {
      notes = noteRead(
        notes,
        read(`f${i}.xlsx`, `2026-11-04T01:${String(i).padStart(2, '0')}:00.000Z`),
      ).notes
    }
    expect(notes.length).toBe(KEEP)
    expect(notesOf([...notes].reverse())[0].file).toBe(`f${KEEP + 4}.xlsx`)
  })
})
