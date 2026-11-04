/* ============================================================
   A LIST NO LIST OF WHAT FITS NAMES, AND WHERE ITS MAKERS' FITTED
   LINES ARE (fit flow, round 2, the cold walk).

   Data said "REDCO / Tinka Trailers 52. No boat on the price list is
   fitted with them." It is true of that list: no list of what fits
   names it, and its series (Sportsman, Slider, Off Road, Tinka
   Aluminium) name no boat. But What fits recommends "REDCO Custom /
   Highfield Sport 560" and "REDCO Stabicraft" trailers, and a reader
   who sees REDCO on both screens reads one as wrong.

   They are another list's: NSM Custom Trailers, which lists of what
   fits do name. So the sentence says that too, measured off the lines
   themselves — the maker words a list's own lines begin with
   ("REDCO", "TINKA"), and the lists of what fits that carry lines
   beginning with the same words. Nothing is said where no other list
   does.

   Pure: no store, no React.
   ============================================================ */
import { isDiscontinued, rowLabel, type EntityDef, type RowData } from '@/domain/model'

export interface World {
  entities: Readonly<Record<string, EntityDef>>
  rowsByEntity: Readonly<Record<string, readonly RowData[]>>
}

/** The word a line's name begins with, where it is a maker's word written in capitals ("REDCO",
 *  "TINKA", "GFAB"); '' for a line that begins any other way. */
function makerWord(label: string): string {
  const first = label.trim().split(/[\s/–-]+/)[0] ?? ''
  return /^[A-Z]{3,}$/.test(first) ? first : ''
}

/** The maker words a list's live lines begin with, in the order they first appear. */
function makerWords(world: World, tableId: string): string[] {
  const entity = world.entities[tableId]
  if (!entity) return []
  const out: string[] = []
  for (const row of world.rowsByEntity[tableId] ?? []) {
    if (isDiscontinued(row)) continue
    const word = makerWord(rowLabel(entity, row))
    if (word !== '' && !out.includes(word)) out.push(word)
  }
  return out
}

/** A maker word as a reader says it: REDCO and GFAB keep their capitals; TINKA is Tinka only where
 *  the list's own name writes it so ("REDCO / Tinka Trailers"). */
function wordSaid(word: string, names: readonly string[]): string {
  const titled = `${word.charAt(0)}${word.slice(1).toLowerCase()}`
  return names.some((name) => name.includes(titled) && !name.includes(word)) ? titled : word
}

const joined = (names: readonly string[]): string =>
  names.length < 2 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)!}`

/**
 * WHERE THE MAKERS OF LISTS NO LIST OF WHAT FITS NAMES HAVE LINES THAT LISTS OF WHAT FITS DO NAME:
 * "The REDCO and Tinka trailers What fits offers for a boat are in NSM Custom Trailers." Only a
 * trailer, motor, package or part list of the same kind is looked in; '' where none carries them.
 */
export function elsewhereSay(
  world: World,
  unnamed: readonly { id: string; name: string; kind: string }[],
  fitted: readonly { id: string; name: string; kind: string }[],
): string {
  const said: string[] = []
  for (const kind of [...new Set(unnamed.map((u) => u.kind))]) {
    const mine = unnamed.filter((u) => u.kind === kind)
    const words = [...new Set(mine.flatMap((u) => makerWords(world, u.id)))]
    if (words.length === 0) continue
    const lists = fitted
      .filter((f) => f.kind === kind)
      .map((f) => ({ name: f.name, words: makerWords(world, f.id) }))
      .filter((f) => f.words.some((w) => words.includes(w)))
    if (lists.length === 0) continue
    const shared = words.filter((w) => lists.some((l) => l.words.includes(w)))
    const names = mine.map((u) => u.name)
    const noun = kind === 'trailer' ? 'trailers' : kind === 'motor' ? 'motors' : 'lines'
    said.push(
      `The ${joined(shared.map((w) => wordSaid(w, names)))} ${noun} What fits offers for a boat are in ${joined(lists.map((l) => l.name))}.`,
    )
  }
  return said.join(' ')
}
