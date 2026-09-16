/* ============================================================
   Domain model — the single source of truth for all features.
   Do not fork these shapes locally; import from '@/domain/model'
   (path alias '@' -> src, see vite.config / tsconfig).

   The contract is split by concern across this folder and the
   barrel in index.ts re-exports every name, so a reader imports
   from '@/domain/model' and never from a file inside it.
   ============================================================ */

import type { ImageRef } from './images'

/** Accent ink an entity or group is drawn with. */
export type AccentKey = 'blue' | 'carmine' | 'viridian' | 'ochre' | 'violet' | 'teal' | 'graphite'

export const ACCENT_KEYS: AccentKey[] = [
  'blue',
  'carmine',
  'viridian',
  'ochre',
  'violet',
  'teal',
  'graphite',
]

/** CSS custom-property name for an accent. */
export const accentVar = (a: AccentKey): string => `var(--accent-${a})`

/* ---------------------------------------------------------- */
/* Fields                                                     */
/* ---------------------------------------------------------- */

export type FieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'select' /* list of predefined options */
  | 'reference' /* link to a row of another entity — draws ERD edges */
  | 'formula' /* calculated from other fields */
  | 'image' /* one or more images; the FIRST is the primary */

export interface FieldTypeMeta {
  label: string /* human name shown in pickers */
  tag: string /* 3-char mono tag, e.g. NUM */
  cssVar: string /* color token, e.g. var(--type-number) */
}

export const FIELD_TYPES: Record<FieldType, FieldTypeMeta> = {
  text: { label: 'Text', tag: 'TXT', cssVar: 'var(--type-text)' },
  number: { label: 'Number', tag: 'NUM', cssVar: 'var(--type-number)' },
  boolean: { label: 'Yes / No', tag: 'Y/N', cssVar: 'var(--type-boolean)' },
  date: { label: 'Date', tag: 'DAT', cssVar: 'var(--type-date)' },
  select: { label: 'List', tag: 'LST', cssVar: 'var(--type-select)' },
  reference: { label: 'Link', tag: 'REF', cssVar: 'var(--type-reference)' },
  formula: { label: 'Calculated', tag: 'FX', cssVar: 'var(--type-formula)' },
  image: { label: 'Images', tag: 'IMG', cssVar: 'var(--type-image)' },
}

/** A named band of columns — "Pricing", "Dimensions", "Rego".
 *  Columns carrying the same `sectionId` are drawn together under one
 *  spanning header, tinted with the section's ink, and can be collapsed
 *  as a group. Order comes from the field order; a section is simply the
 *  run of consecutive columns that share its id. */
export interface ColumnSection {
  id: string
  name: string
  accent?: AccentKey
  /** collapsed sections show a summary chip instead of their columns */
  collapsed?: boolean
}

export interface FieldDef {
  id: string
  name: string
  type: FieldType
  description?: string
  required?: boolean
  /** the band this column belongs to, if any */
  sectionId?: string
  /** select: the allowed options */
  options?: string[]
  /** reference: the entity this field links to */
  refEntityId?: string
  /** formula: expression source, e.g. "[Price] * [Qty] * (1 - [Discount])" */
  formula?: string
  /** default cell value for new rows (not used for formula fields) */
  defaultValue?: CellValue
}

/** What actually lives in a row cell.
 *  - date: ISO 'YYYY-MM-DD' string
 *  - reference: id of a row in the referenced entity
 *  - image: an ordered ImageRef[] — index 0 is the primary
 *  - formula fields are NOT stored; they are computed on read.
 *
 *  NOTE for consumers: this union is no longer all-primitive. Anything
 *  that formats, compares, sorts, searches or exports a cell must handle
 *  the array case — see `isImageValue` / `primaryImage` below. */
export type CellValue = string | number | boolean | null | ImageRef[]

export const isImageValue = (v: CellValue): v is ImageRef[] => Array.isArray(v)

/** The image a catalogue tile or quote header should show. */
export function primaryImage(v: CellValue): ImageRef | undefined {
  return isImageValue(v) ? v[0] : undefined
}

/** Cell text for search, sort, copy and export. Images contribute their
 *  count, never a blob of URLs. */
export function imageCellText(v: CellValue): string {
  if (!isImageValue(v)) return ''
  return v.length === 0 ? '' : `${v.length} image${v.length === 1 ? '' : 's'}`
}
