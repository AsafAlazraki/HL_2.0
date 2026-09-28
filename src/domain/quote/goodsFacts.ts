import { readCell, type EntityDef, type RowData } from '@/domain/model'

/* ============================================================
   A MOTOR'S FACTS ON ONE LINE, AS THE PRICE FILE STATES THEM:
   "90 hp · 162 kg · 20″ shaft".

   THE BUILD'S MOTOR WAS A PARAGRAPH OF RIGGING KIT (the component
   critique, 2026-09-28, blocker 1). /kit drew the same Yamaha F90LB as
   a photographed tile with its power, its weight and its shaft, and
   the build drew it as "Rigging Kit Option Mech Rigging Kit · 704
   Binnacle Mount …" with no picture and no facts. These are the three
   facts a person chooses an outboard by, read off the motor's own row
   by the columns Northside's motor registers carry — `HP Rating`,
   `WEIGHT kg` and `Shaft Length` — and nothing else. A register
   without one of them (ePropulsion files no weight) says the ones it
   has; a row with none of them says nothing, never a dash.

   NO MONEY PASSES THROUGH HERE. The three columns are named; no other
   cell of the row is read.
   ============================================================ */

export interface MotorFacts {
  /** "90", as the file writes its rating */
  hp: string | null
  kg: number | null
  /** '20"', as the file writes it */
  shaft: string | null
}

const text = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() !== '' ? v.trim() : null
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)

/** The three facts one motor row carries, by its register's own column names. */
export function motorFactsOf(entity: EntityDef, row: RowData): MotorFacts {
  const at = (name: string): unknown => {
    const field = entity.fields.find((f) => f.name === name)
    return field ? readCell(row, field.id) : undefined
  }
  return {
    hp: text(at('HP Rating')),
    kg: num(at('WEIGHT kg')),
    shaft: text(at('Shaft Length')),
  }
}

/** "115 hp · 171 kg · 20″ shaft" — the file's inch mark set as the double prime it means. */
export function motorFactsSaid(facts: MotorFacts): string {
  return [
    facts.hp ? `${facts.hp} hp` : null,
    facts.kg !== null ? `${facts.kg.toLocaleString('en-AU')} kg` : null,
    facts.shaft ? `${facts.shaft.replace(/"$/, '″')} shaft` : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

/** What the build says under a motor's name, or '' for any row that is not a motor's. */
export function goodsFacts(entity: EntityDef | undefined, row: RowData | undefined): string {
  if (!entity || !row || entity.kind !== 'motor') return ''
  return motorFactsSaid(motorFactsOf(entity, row))
}
