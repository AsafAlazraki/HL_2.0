/* ============================================================
   WHAT THE PRICE LIST SAYS OF ITS OWN SUPPLIER CODES — read on day
   one, before Northside names anything (the verifier of the
   chandlery, round 2, J3 and J12: "On day one 'yamaha' finds 439 of
   the 671 on-sale Yamaha lines, and the chips print YAM 263 · Yam
   175").

   The parts list writes a supplier as a code, but the same price list
   says the maker in words elsewhere, and where it does so without a
   doubt the chandlery reads it so. TWO READINGS, each measured with
   its numerator and denominator, and NOTHING ELSE IS READ:

     · ANOTHER LIST NAMES IT: another list of the price list writes
       its supplier in words, and exactly one such supplier begins
       with the code's letters (Yamaha Outboards name their supplier
       "Yamaha" on 209 of 209 lines, so YAM and Yam read Yamaha).
     · A HEADING NAMES IT: every one of a code's lines sits under a
       heading whose first word is the maker's (all 144 LOW lines under
       LOWRANCE, so LOW reads Lowrance) — `headingProposals`.

   A code no list and no heading names reads as the code. Northside's
   own name for a code (`OrgProfile.suppliers`, `nameSuppliers`) is
   said over any reading, and taking it back returns to the reading.

   PURE: the lists in, the readings out.
   ============================================================ */
import type { EntityDef, RowData } from '@/domain/model'
import { headingProposals, type SupplierNames } from './suppliers'

/** A supplier another list writes in words: the list, the words, and how many of its lines. */
export interface SupplierElsewhere {
  /** the list's own name: "Yamaha Outboards" */
  list: string
  /** the supplier as that list writes it: "Yamaha" */
  supplier: string
  /** its lines that write it, of the list's lines */
  lines: number
  of: number
}

/** One code read as a maker, and why. */
export type SupplierReading =
  | {
      code: string
      name: string
      from: 'list'
      /** every list that writes the supplier, with its lines */
      lists: SupplierElsewhere[]
      supplier: string
    }
  | { code: string; name: string; from: 'heading'; agree: number; lines: number }

/**
 * THE SUPPLIERS EVERY OTHER LIST WRITES IN WORDS: each list but the parts list with a field called
 * Supplier, each distinct supplier it writes, and its lines of the list's.
 */
export function suppliersElsewhere(
  entities: Readonly<Record<string, EntityDef>>,
  rowsByEntity: Readonly<Record<string, readonly RowData[]>>,
  exceptId: string,
): SupplierElsewhere[] {
  const out: SupplierElsewhere[] = []
  for (const entity of Object.values(entities)) {
    if (entity.id === exceptId) continue
    const field = entity.fields.find((f) => f.name.trim().toLowerCase() === 'supplier')
    if (!field) continue
    const rows = rowsByEntity[entity.id] ?? []
    const by = new Map<string, number>()
    for (const row of rows) {
      const v = row.values[field.id]
      const said = typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : ''
      if (said !== '') by.set(said, (by.get(said) ?? 0) + 1)
    }
    for (const [supplier, lines] of by)
      out.push({ list: entity.name, supplier, lines, of: rows.length })
  }
  return out
}

/** The letters a word is matched by: its capitals, with nothing but letters and digits. */
const lettersOf = (w: string): string => w.toUpperCase().replace(/[^A-Z0-9]/g, '')

/** The fewest letters a code needs before a list's word may be read for it. */
const CODE_MIN = 3

/**
 * A SUPPLIER'S WORDS AS A MAKER IS SAID: what comes before " - " or " / " ("EPROPULSION - Electric
 * Outboards" is EPROPULSION), and a word written all in capitals takes the casing its own list's
 * name gives it ("ePropulsion Outboards"), else a capital and small letters.
 */
export function makerWords(supplier: string, lists: readonly string[]): string {
  const head = (supplier.split(/\s+[-/–]\s+/)[0] ?? supplier).trim()
  return head
    .split(' ')
    .map((word) => {
      if (word.length <= CODE_MIN || word !== word.toUpperCase() || !/[A-Z]/.test(word)) return word
      for (const list of lists)
        for (const w of list.split(/\s+/)) if (w.toUpperCase() === word && w !== word) return w
      return word.charAt(0) + word.slice(1).toLowerCase()
    })
    .join(' ')
}

/**
 * EVERY CODE THE PRICE LIST NAMES ITSELF. A code is read from another list where exactly one
 * supplier written elsewhere begins with its letters (and is longer than it), else from its
 * headings where every one of its lines agrees. Most lines first.
 */
export function supplierReadings(
  lines: readonly { maker: string; heading: string }[],
  elsewhere: readonly SupplierElsewhere[],
): SupplierReading[] {
  const counts = new Map<string, number>()
  for (const line of lines) {
    const code = line.maker.trim()
    if (code !== '') counts.set(code, (counts.get(code) ?? 0) + 1)
  }
  const bySupplier = new Map<string, SupplierElsewhere[]>()
  for (const e of elsewhere) bySupplier.set(e.supplier, [...(bySupplier.get(e.supplier) ?? []), e])
  const headings = new Map(headingProposals(lines, undefined).map((p) => [p.code, p]))
  const out: { reading: SupplierReading; lines: number }[] = []
  for (const [code, n] of counts) {
    const letters = lettersOf(code)
    const named =
      letters.length < CODE_MIN || letters !== code.replace(/\s/g, '').toUpperCase()
        ? []
        : [...bySupplier.keys()].filter((s) => {
            const first = lettersOf(s.split(/\s+/)[0] ?? '')
            return first.length > letters.length && first.startsWith(letters)
          })
    if (named.length === 1) {
      const supplier = named[0]!
      const lists = bySupplier.get(supplier) ?? []
      out.push({
        reading: {
          code,
          name: makerWords(
            supplier,
            lists.map((l) => l.list),
          ),
          from: 'list',
          lists,
          supplier,
        },
        lines: n,
      })
      continue
    }
    const head = headings.get(code)
    if (head)
      out.push({
        reading: { code, name: head.name, from: 'heading', agree: head.agree, lines: head.lines },
        lines: n,
      })
  }
  return out
    .toSorted((a, b) => b.lines - a.lines || a.reading.code.localeCompare(b.reading.code))
    .map((o) => o.reading)
}

/**
 * HOW EVERY CODE IS SAID: the price list's reading, and over it Northside's own name where it gave
 * one. What `supplierSaid` and `suppliersIn` take.
 */
export function saidNames(
  readings: readonly SupplierReading[],
  named: SupplierNames | undefined,
): SupplierNames {
  const out: Record<string, string> = {}
  for (const r of readings) out[r.code] = r.name
  for (const [code, name] of Object.entries(named ?? {}))
    if (name.trim() !== '') out[code] = name.trim()
  return out
}
