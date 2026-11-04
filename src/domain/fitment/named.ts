/* ============================================================
   WHICH VERSION A LINE NAMED FOR THE BOAT IS MADE FOR, and the lines
   Northside may offer on it from the rest of a list (fit flow, walk 2,
   2026-11-05).

   THE WALK: "Which of these 40 'Patrol · PA600 OB PVC · LG-W-DG' do I
   want? They have no description and no price … and it let me put the
   light-grey package on a Black / Black / Black boat." The 40 are
   pre-delivery packages, one per version, and the price list says
   which: each carries its version's own code in its Code column
   ("9HI_HBP 189_PD" is the Patrol 600 Open, PVC, Black / Black / Black,
   whose Model Code is HBP189). So a line named for the model is read
   against the model's versions by that code:

     · THIS — made for the version on the page. Offered on it alone.
     · VERSION — made for another version the price list sells. Said as
       counted, never offered here: its own version's page offers it.
     · UNLISTED — its code is a version code of the model's own shape
       (HBP191) that no version on the price list carries. Counted, with
       its codes, and never offered.
     · MODEL — no version code at all ("Sundeck for PA600"): named for
       the model, and offered on every version, as before.

   Nothing here says a line fits. The code is read, never guessed: a
   line that names no version is the model's, and a model whose versions
   share no code stem has no UNLISTED.

   OFFERING SOMETHING ELSE (walk 2: "there is also no way to offer a
   part the file lists for other boats"). `offerableOf` finds, by the
   words typed, the lines of the boat's own fit-out lists that are not
   offered on it, not named for it and not taken off it.

   Pure: no React, no store.
   ============================================================ */
import { isDiscontinued, isRetired, readCell, rowLabel } from '@/domain/model'
import type { CatalogueCtx, EntityDef, RowData } from '@/domain/model'
import { lineSaid } from '@/domain/quote/spoken'
import { nameOnPaper } from '@/domain/quote/paperWords'
import { pricer, type BoatFit, type BoatFound, type Place } from './boat'
import { packageSaid, type PageLine } from './page'

const AU = new Intl.NumberFormat('en-AU')
const count = (n: number): string => AU.format(n)

export type NamedScope =
  | { kind: 'this'; code: string }
  | { kind: 'version'; code: string; version: BoatFound }
  | { kind: 'unlisted'; code: string }
  | { kind: 'model' }

const rowOf = (ctx: CatalogueCtx, place: Place): RowData | undefined =>
  (ctx.rowsByEntity[place.tableId] ?? []).find((r) => r.id === place.rowId)

/** Every Code column of the row, together: a package files its own and its accessory's. */
function codesOf(table: EntityDef, row: RowData): string {
  const out: string[] = []
  for (const f of table.fields) {
    if (f.name.trim().toLowerCase() !== 'code') continue
    const v = readCell(row, f.id)
    if (typeof v === 'string' && v.trim() !== '') out.push(v.trim())
  }
  return out.join(' ')
}

const compact = (s: string): string => s.replace(/\s+/g, '')
const escape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** "HBP189" standing as a code of its own in "9HI_HBP 189_PD", the file's spaces read out. */
export function codeIn(text: string, code: string): boolean {
  const c = compact(code)
  if (c === '') return false
  return new RegExp(`(?:^|[^a-z0-9])${escape(c)}(?![a-z0-9])`, 'i').test(compact(text))
}

/** The letters every version's code opens with, before its figures: "HBP" for HBP181 … HBP190.
 *  '' where the versions share no such stem. */
export function codeStem(versions: readonly BoatFound[]): string {
  const stems = new Set(
    versions.map((v) => /^([a-z]+)\d+$/i.exec(v.code.trim())?.[1]?.toUpperCase() ?? ''),
  )
  if (stems.size !== 1) return ''
  return [...stems][0] ?? ''
}

/** The version a line named for the model is made for, read off its Code columns. */
export function namedScopeOf(
  ctx: CatalogueCtx,
  line: Pick<PageLine, 'place'>,
  versions: readonly BoatFound[],
  here: Place,
): NamedScope {
  const table = ctx.entities[line.place.tableId]
  const row = rowOf(ctx, line.place)
  if (!table || !row) return { kind: 'model' }
  const codes = codesOf(table, row)
  if (codes === '') return { kind: 'model' }
  for (const v of versions) {
    if (v.code.trim() === '' || !codeIn(codes, v.code)) continue
    return v.place.rowId === here.rowId
      ? { kind: 'this', code: v.code.trim() }
      : { kind: 'version', code: v.code.trim(), version: v }
  }
  const stem = codeStem(versions)
  if (stem !== '') {
    const m = new RegExp(`(?:^|[^a-z0-9])(${escape(stem)}\\d+)(?![a-z0-9])`, 'i').exec(
      compact(codes),
    )
    if (m?.[1]) return { kind: 'unlisted', code: m[1].toUpperCase() }
  }
  return { kind: 'model' }
}

export interface ShownNamed extends PageLine {
  scope: NamedScope
}

export interface NamedSplit {
  /** made for this version, or named for the model alone: the lines the page shows */
  shown: ShownNamed[]
  /** made for another version the price list sells */
  otherVersions: number
  /** the version codes the price list sells no version under, in the file's order */
  unlisted: string[]
}

/** The lines named for the model, split by the version each is made for. */
export function namedSplitOf(
  ctx: CatalogueCtx,
  named: readonly PageLine[],
  versions: readonly BoatFound[],
  here: Place,
): NamedSplit {
  const out: NamedSplit = { shown: [], otherVersions: 0, unlisted: [] }
  for (const line of named) {
    const scope = namedScopeOf(ctx, line, versions, here)
    if (scope.kind === 'version') out.otherVersions += 1
    else if (scope.kind === 'unlisted') out.unlisted.push(scope.code)
    else out.shown.push({ ...line, scope })
  }
  return out
}

/** "Pre Delivery Allowance (8 hrs) · made for this version, HBP181" */
export function namedFactsSaid(line: ShownNamed): string {
  const made = line.scope.kind === 'this' ? `made for this version, ${line.scope.code}` : ''
  return [line.facts, made].filter((s) => s !== '').join(' · ')
}

/** The named lines the page does not show, counted: "9 more are made for the Patrol 600’s other
 *  versions, one each, and can be offered only there; 30 are made for versions the price list does
 *  not carry (HBP191 to HBP220), so they are offered on none." '' for none. */
export function namedApartSaid(split: NamedSplit, short: string): string {
  const parts: string[] = []
  const more = split.shown.length > 0 ? ' more' : ''
  const o = split.otherVersions
  if (o > 0) {
    parts.push(
      `${count(o)}${more} ${o === 1 ? 'is made for another version' : `are made for the ${short}’s other versions`}, and can be offered only there`,
    )
  }
  const n = split.unlisted.length
  if (n > 0) {
    const first = split.unlisted[0]!
    const last = split.unlisted.at(-1)!
    const codes = n === 1 ? first : n === 2 ? `${first} and ${last}` : `${first} to ${last}`
    parts.push(
      `${count(n)}${o > 0 ? '' : more} ${n === 1 ? 'is made for a version' : 'are made for versions'} the price list does not carry (${codes}), so ${n === 1 ? 'it is' : 'they are'} offered on none`,
    )
  }
  if (parts.length === 0) return ''
  const said = parts.join('; ')
  return `${said.charAt(0).toUpperCase()}${said.slice(1)}.`
}

/* ---------------------------------------------------------- */
/* Something else to offer                                     */
/* ---------------------------------------------------------- */

export interface Offerable {
  lines: PageLine[]
  /** every line the words found, of which `lines` is the first few */
  found: number
}

/**
 * THE LINES OF THE BOAT'S OWN FIT-OUT LISTS THE WORDS FIND that are not offered on it: never one
 * listed for it, named for it or taken off it (`apart`), and never one no longer sold. Every word
 * typed is somewhere in the line's name, its accessory or its code. Fewer than two letters find
 * nothing, so the list is not the whole library.
 */
export function offerableOf(
  ctx: CatalogueCtx,
  fit: BoatFit,
  query: string,
  apart: ReadonlySet<string>,
  most = 8,
): Offerable {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w !== '')
  if (words.join('').length < 2) return { lines: [], found: 0 }
  const price = pricer(ctx, fit)
  const made = new Set(fit.lists.flatMap((l) => l.made.map((m) => m.place.rowId)))
  const lines: PageLine[] = []
  let found = 0
  for (const list of fit.lists) {
    const table = ctx.entities[list.tableId]
    if (!table || isRetired(table)) continue
    for (const row of ctx.rowsByEntity[table.id] ?? []) {
      if (isDiscontinued(row) || made.has(row.id) || apart.has(row.id)) continue
      const label = rowLabel(table, row)
      const hay = `${label} ${packageSaid(table, row)} ${codesOf(table, row)}`.toLowerCase()
      if (!words.every((w) => hay.includes(w))) continue
      found += 1
      if (lines.length >= most) continue
      lines.push({
        slot: table.id,
        place: { tableId: table.id, rowId: row.id },
        name: nameOnPaper(lineSaid(label, table.name)),
        facts: packageSaid(table, row),
        price: price(table, row),
      })
    }
  }
  return { lines, found }
}
