/**
 * THE COLUMN KEYS, READ OFF THE SEED'S OWN TEXT.
 *
 * A field on the pack is `<seed key>.<column key>` — `boat_stacer.qr` is Stacer's Cash
 * column, and it stays `boat_stacer.qr` through a Postgres import. The old builder mints a
 * nanoid per column and keeps the column key private (`SeedTable.cols[].k`, inside a
 * module-level `TABLES` that is not exported), so the only place the key exists is the
 * committed source. It is read here as UTF-8 by Node — never a shell pipe — and every key
 * list is verified against the BUILT table before it is used: the same count, the same
 * column names in the same order, the same types. A mismatch throws. Nothing is guessed.
 *
 * The generated layout this reads is `emit.py`'s and is fixed: one table per
 * `  {` block, `    k: "…",` at four spaces, `    cols: [` … `    ],` at four, and one
 * column per line at six, `      { k: "…", n: "…", t: "…", …}`.
 */

export interface SeedColumn {
  key: string
  name: string
  type: string
}

/** A JSON string literal, as the generator writes them (double quotes, JSON escapes). */
const STR = '"((?:[^"\\\\]|\\\\.)*)"'
const TABLE_KEY = new RegExp(`^    k: ${STR},$`, 'gm')
const COLUMN = new RegExp(`^      \\{ k: ${STR}, n: ${STR}, t: ${STR}`, 'gm')

const unquote = (literal: string): string => JSON.parse(`"${literal}"`) as string

/** seed key → its columns, in sheet order. */
export function readSeedColumns(source: string): Map<string, SeedColumn[]> {
  const start = source.indexOf('\nconst TABLES: SeedTable[] = [\n')
  if (start < 0) throw new Error('northside.ts: the TABLES literal was not found')
  const end = source.indexOf('\n]\n', start)
  if (end < 0) throw new Error('northside.ts: the TABLES literal does not close')
  const block = source.slice(start, end)

  const keys: { key: string; at: number }[] = []
  for (const m of block.matchAll(TABLE_KEY)) keys.push({ key: unquote(m[1]), at: m.index })
  if (keys.length === 0) throw new Error('northside.ts: no table keys in the TABLES literal')

  const out = new Map<string, SeedColumn[]>()
  keys.forEach((k, i) => {
    const slice = block.slice(k.at, i + 1 < keys.length ? keys[i + 1].at : block.length)
    const colsAt = slice.indexOf('\n    cols: [\n')
    const colsEnd = slice.indexOf('\n    ],\n', colsAt)
    if (colsAt < 0 || colsEnd < 0) throw new Error(`northside.ts: ${k.key} has no cols block`)
    const cols: SeedColumn[] = []
    for (const m of slice.slice(colsAt, colsEnd).matchAll(COLUMN)) {
      cols.push({ key: unquote(m[1]), name: unquote(m[2]), type: unquote(m[3]) })
    }
    if (cols.length === 0) throw new Error(`northside.ts: ${k.key} has no columns`)
    out.set(k.key, cols)
  })
  return out
}

/** How many rows the seed literal types for each table — one row per
 *  line at six spaces inside `const ROWS_<key>: SeedRow[] = [ … ]`. The
 *  built count must equal it, or a pairing was dropped and the ordinal
 *  in the file is not the ordinal on the sheet. */
export function readSeedRowCounts(source: string): Map<string, number> {
  const out = new Map<string, number>()
  const HEAD = /^const ROWS_([A-Za-z0-9_]+): SeedRow\[\] = \[$/gm
  for (const m of source.matchAll(HEAD)) {
    const start = m.index + m[0].length
    const end = source.indexOf('\n]\n', start)
    if (end < 0) throw new Error(`northside.ts: ROWS_${m[1]} does not close`)
    let n = 0
    for (const line of source.slice(start, end).split('\n')) if (/^ {6}\{ /.test(line)) n += 1
    out.set(m[1], n)
  }
  if (out.size === 0) throw new Error('northside.ts: no ROWS literals found')
  return out
}

/** The built table this key list must describe, or the reason it does not. */
export function verifyColumns(
  key: string,
  cols: readonly SeedColumn[],
  fields: ReadonlyArray<{ name: string; type: string }>,
): void {
  if (cols.length !== fields.length) {
    throw new Error(
      `${key}: the source lists ${cols.length} columns and the built table has ${fields.length} fields`,
    )
  }
  cols.forEach((c, i) => {
    const f = fields[i]
    if (c.name !== f.name || c.type !== f.type) {
      throw new Error(
        `${key}: column ${i + 1} reads “${c.name}” (${c.type}) in the source and “${f.name}” (${f.type}) on the built table`,
      )
    }
  })
}
