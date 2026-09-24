/* ============================================================
   WHICH BOAT A PHOTOGRAPH IS OF — one rule, for every screen.

   A picture ledger records, beside each photograph, the register its
   boat is a row of and the MODEL it depicts, spelled as the ledger's
   author read it off the maker's page: `ADV7`, `SP560`, `519 Sea
   Ranger SDF`. The price file spells the same boats two ways. Highfield
   files the model as a level of its own, so a row's names are `Sport`,
   `SP560`, `PVC W-W-WB`; Stacer files it inside a longer name, so a
   row's names are `SEA RANGER (CENTRE CONSOLES)` and `Stacer - 519 Sea
   Ranger SDF (Centre Console)`.

   WHY THIS FILE EXISTS (the M2-close critique, finding 11). Until
   2026-09-24 four screens each answered "is this photograph of that
   row?" for themselves, in `src/screens`, and they did not agree. Home
   took a model name standing on its own inside the row's label; the
   build and the cascade required a name of the row to EQUAL the
   model; Home's count took any name merely containing it. So Home
   sold the Stacer 519 Sea Ranger SDF with its photograph on the water
   and "2 versions of this boat on the price file", and quoting either
   version put the Stacer wordmark on the stage instead — "the same
   photograph is sold on Home and missing from the sale". Measured on
   the pack: all four Stacer photographs failed the build's rule, on
   six rows.

   THE RULE. A photograph depicts a row when the row is in the
   photograph's register AND the ledger's model is one of the row's
   names, or stands inside one as a whole run of words: the character
   before it and the character after it are not a letter or a digit.
   So `519 Sea Ranger SDF` is the 519 in `Stacer - 519 Sea Ranger SDF
   (Side Console)`, and `PA600` is never the `PA600EW` (the next
   character is a letter), and `519 Sea Ranger SDF` is never the `499
   Sea Ranger SDF` or the `519 SeaMaster`. Where two photographs of one
   register could both answer, the longer model wins, because a more
   specific name is never beaten by the shorter one inside it.

   WHAT THE ROW SAYS BEYOND THE MODEL is handed back with the match, in
   the file's own spelling: `Side Console`, `S/S`. A photograph belongs
   to the model it depicts and is drawn for every version of it, as the
   ADV7's one photograph is drawn for its seven colourways; the version
   THIS quote is written for is then said in words by the screen that
   draws it, never implied by the picture.

   PURE: no React, no store, no ledger. A screen reads its own ledger
   (a screen's folder is its own) and hands the rows in.
   ============================================================ */
import { isDiscontinued, type EntityDef, type RowData } from '@/domain/model'

/** What a picture ledger says one picture depicts. */
export interface Depicts {
  /** the register the boat it depicts is a row of */
  table: string
  /** the model it depicts, spelled as the ledger's author read it */
  model: string
}

/** How a model stands in one of a row's names: it IS the name, or it
 *  is a whole run of words inside a longer one. */
export type Standing = 'same' | 'within'

/** One picture matched to one row, with what the row says beyond it. */
export interface Depiction<P> {
  picture: P
  standing: Standing
  /** what the row's name says after the model, in the file's own
   *  spelling and without its brackets — `Side Console`, `S/S`. '' where
   *  a name of the row is the model, or nothing follows it. */
  beyond: string
}

const WORDLIKE = /[\p{L}\p{N}]/u

/** Case and the spaces at either end never decide a match. */
const fold = (text: string): string => text.trim().toLowerCase()

/**
 * THE NAMES THE FILE GIVES ONE ROW: the values of its register's
 * declared hierarchy, top first, or its display value where the
 * register declares none. Blank cells and cells that are not words are
 * left out. Never the label, which on Highfield also carries the
 * finish and the colourway.
 */
export function namesOfRow(table: EntityDef, row: RowData): string[] {
  const levels = table.hierarchy?.length ? table.hierarchy : [table.displayFieldId ?? '']
  const names: string[] = []
  for (const fieldId of levels) {
    const value = row.values[fieldId]
    if (typeof value === 'string' && value.trim() !== '') names.push(value.trim())
  }
  return names
}

/** Where `model` stands inside `name`, with the index it starts at, or
 *  null where it does not stand there at all. */
function standingAt(model: string, name: string): { standing: Standing; at: number } | null {
  const wanted = fold(model)
  const said = fold(name)
  if (wanted === '' || said === '') return null
  if (said === wanted) return { standing: 'same', at: 0 }
  for (let at = said.indexOf(wanted); at !== -1; at = said.indexOf(wanted, at + 1)) {
    const before = at === 0 ? '' : said.charAt(at - 1)
    const after = said.charAt(at + wanted.length)
    if (!WORDLIKE.test(before) && !WORDLIKE.test(after)) return { standing: 'within', at }
  }
  return null
}

/** Whether `model` is `name`, or stands inside it as a whole run of
 *  words. The one test every screen's picture match is made of. */
export function standing(model: string, name: string): Standing | null {
  return standingAt(model, name)?.standing ?? null
}

/** The words after the model inside `name`, without the brackets and
 *  dashes that fence them off: "(Side Console)" → "Side Console". */
function beyondOf(model: string, name: string, at: number): string {
  const trimmed = name.trim()
  const rest = trimmed.slice(at + model.trim().length)
  return rest.replace(/^[\s()[\]\-–—,:/]+/u, '').replace(/[\s()[\]\-–—,:]+$/u, '')
}

/**
 * THE PICTURE THAT DEPICTS A ROW, or null.
 *
 * `names` are the names the file gives the row (`namesOfRow`) — or, for
 * a filed quote whose row is not in hand, the label it froze, which
 * carries the same model as a run of words. Only pictures of `tableId`
 * are asked; the longest model answers first; a name the model IS
 * beats a name it merely stands inside.
 */
export function depictionOf<P extends Depicts>(
  pictures: readonly P[],
  tableId: string,
  names: readonly string[],
): Depiction<P> | null {
  if (tableId.trim() === '' || names.length === 0) return null
  const candidates = pictures
    .filter((p) => p.table === tableId && fold(p.model) !== '')
    .toSorted((a, b) => fold(b.model).length - fold(a.model).length)
  for (const picture of candidates) {
    let within: Depiction<P> | null = null
    for (const name of names) {
      const found = standingAt(picture.model, name)
      if (!found) continue
      if (found.standing === 'same') return { picture, standing: 'same', beyond: '' }
      within ??= { picture, standing: 'within', beyond: beyondOf(picture.model, name, found.at) }
    }
    if (within) return within
  }
  return null
}

/** The picture that depicts one row of a register, or null. */
export const depictionOfRow = <P extends Depicts>(
  pictures: readonly P[],
  table: EntityDef,
  row: RowData,
): Depiction<P> | null => depictionOf(pictures, table.id, namesOfRow(table, row))

/**
 * HOW MANY ROWS OF A REGISTER ONE MODEL IS, by the same rule: the rows
 * the model is one of the names of, or stands inside one of. This is
 * the figure a photograph is captioned with ("2 versions of this boat
 * on the price file"), so it counts exactly the rows the build will
 * draw that photograph for.
 */
export function rowsOfModel(table: EntityDef, rows: readonly RowData[], model: string): number {
  if (fold(model) === '') return 0
  let n = 0
  for (const row of rows) {
    if (namesOfRow(table, row).some((name) => standing(model, name) !== null)) n += 1
  }
  return n
}

/**
 * THE FIRST ROW, IN THE FILE'S ORDER, THAT A PICTURE DEPICTS AND THE
 * FILE STILL SELLS — the version a door opens on when a photograph is
 * pressed. A row marked no longer sold is never a door. Undefined where
 * the register holds no such row, which a door then says rather than
 * opening somewhere else.
 */
export function firstRowDepicted<P extends Depicts>(
  pictures: readonly P[],
  picture: P,
  table: EntityDef,
  rows: readonly RowData[],
): RowData | undefined {
  if (picture.table !== table.id) return undefined
  return rows.find(
    (row) => !isDiscontinued(row) && depictionOfRow(pictures, table, row)?.picture === picture,
  )
}
