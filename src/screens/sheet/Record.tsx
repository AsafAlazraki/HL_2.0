/* ============================================================
   THE RECORD — direction C's best idea kept as the side panel: one
   row as a spec sheet under the table's own section headings, label
   over value, every value a button that becomes a field on Enter with
   the pill beneath on refusal. It keeps the row lit in the grid, and
   in a hand it is the door that survives: a full-screen sheet with a
   way back.

   `boats/highfield-sport-560-specs.png` sets the shape — a light label
   over a heavier value, four across on a wide screen — and
   `boats/apple-compare-specs.png` sets the section heading with its
   hairline. Two across here, because the panel is a column beside the
   grid and not a page.

   NOTHING HERE IS A SECOND ENGINE. Every value is `paintOf`, every
   commit goes through the same `commit` the grid uses, and the cost
   sections say the same word the column heads say.
   ============================================================ */
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Button, Input } from '@/ui'
import { isImageValue, primaryImage, type EntityDef, type FieldDef } from '@/domain/model'
import type { ViewRow } from '@/domain/catalogue/table/core'
import { deleteRowRadius } from '@/domain/catalogue/commands'
import type { CatalogueData } from '@/domain/catalogue/sheet'
import type { Held } from './pictures'
import { COST_WORD, HELD_AS_A_LINK, isCost, paintOf, PICTURE_CELL_REFUSAL, seedOf } from './read'
import type { Written } from './Outline'

export interface RecordProps {
  table: EntityDef
  row: ViewRow
  /** the drawers this row is filed under, outermost first */
  path: string[]
  /** the column that names the row */
  pinFieldId?: string
  heldCopy: (address: string | undefined) => Held | null
  commit: (rowId: string, fieldId: string, text: string) => Written
  /** the sheet, for the delete's counted radius */
  data: CatalogueData
  onDelete: (rowId: string, said: string) => void
  onClose: () => void
  /** a hand: the record is the screen, so it says so and offers the way back first */
  hand: boolean
}

export function Record({
  table,
  row,
  path,
  pinFieldId,
  heldCopy,
  commit,
  data,
  onDelete,
  onClose,
  hand,
}: RecordProps) {
  const name = pinFieldId ? (row.text[pinFieldId] ?? '') : ''
  const image = table.fields.find((f) => f.type === 'image')
  const held = image ? heldOf(row, image, heldCopy) : null
  const sections = table.sections ?? []
  const unbanded = table.fields.filter(
    (f) => f.sectionId === undefined || !sections.some((s) => s.id === f.sectionId),
  )
  const radius = deleteRowRadius(data, table.id, row.rowId)
  const [asked, setAsked] = useState(false)

  return (
    <div className="sh-record" data-testid="sheet-record">
      <div className="sh-record__top">
        <p className="sh-record__path">{path.length > 0 ? path.join(' ▸ ') : table.name}</p>
        <Button intent="veiled" size="sm" onClick={onClose} aria-label="Close the record">
          {hand ? '← Back to the sheet' : 'Close'}
        </Button>
      </div>
      <h2 className="sh-record__name">{name || '(no name)'}</h2>

      {image ? (
        held ? (
          <img
            className="sh-record__picture"
            src={held.held.at}
            width={held.held.w}
            height={held.held.h}
            alt={`${name}, ${held.held.verdict === 'scene' ? 'on the water' : 'the maker’s render'}`}
          />
        ) : (
          <p className="sh-record__nopicture">
            {held === null && image && isLinked(row, image)
              ? `The picture is ${HELD_AS_A_LINK}: the price file carries the maker’s address and this browser holds no copy of it.`
              : 'No picture is held for this row.'}
          </p>
        )
      ) : null}

      {sections.map((section) => {
        const fields = table.fields.filter((f) => f.sectionId === section.id)
        if (fields.length === 0) return null
        const cost = /cost|markup|margin/i.test(section.name)
        return (
          <section key={section.id} className="sh-record__section" aria-label={section.name}>
            <h3 className="sh-record__heading">
              {section.name}
              {cost ? (
                <span className="sh-record__cost"> · {COST_WORD}, the dealer’s own</span>
              ) : null}
            </h3>
            <dl className="sh-record__facts">
              {fields.map((f) => (
                <Fact
                  key={f.id}
                  table={table}
                  row={row}
                  field={f}
                  heldCopy={heldCopy}
                  commit={commit}
                />
              ))}
            </dl>
          </section>
        )
      })}
      {unbanded.length > 0 ? (
        <section className="sh-record__section" aria-label="Other columns">
          <dl className="sh-record__facts">
            {unbanded.map((f) => (
              <Fact
                key={f.id}
                table={table}
                row={row}
                field={f}
                heldCopy={heldCopy}
                commit={commit}
              />
            ))}
          </dl>
        </section>
      ) : null}

      <div className="sh-record__acts">
        {asked ? (
          <section className="sh-record__ask" aria-label="Delete this row">
            <p className="sh-record__askwhy">
              This takes <b>{name || 'the row'}</b> off {table.name}.
              {radius.said ? ` ${radius.said}` : ' Nothing else on the sheet names it.'} It can be
              put back with Undo.
            </p>
            <div className="sh-record__askacts">
              <Button
                intent="primary"
                size="sm"
                onClick={() => {
                  setAsked(false)
                  onDelete(row.rowId, radius.said)
                }}
              >
                Delete it
              </Button>
              <Button intent="veiled" size="sm" onClick={() => setAsked(false)}>
                Keep it
              </Button>
            </div>
          </section>
        ) : (
          <Button intent="veiled" size="sm" onClick={() => setAsked(true)}>
            Delete this row…
          </Button>
        )}
      </div>

      <p className="sh-record__provenance">
        {table.description ? `${table.description} ` : ''}
        {rowSource(table, row)}
      </p>
    </div>
  )
}

/** The row's own Source cell, where the packer wrote one. */
function rowSource(table: EntityDef, row: ViewRow): string {
  const src = table.fields.find((f) => f.name.trim().toLowerCase() === 'source')
  const at = src ? (row.text[src.id] ?? '') : ''
  return at === '' ? '' : `This row was read from ${at}.`
}

function heldOf(
  row: ViewRow,
  field: FieldDef,
  heldCopy: (address: string | undefined) => Held | null,
): { held: Held } | null {
  const v = row.values[field.id]
  if (v === undefined || v === null || !isImageValue(v)) return null
  const held = heldCopy(primaryImage(v)?.src)
  return held ? { held } : null
}

function isLinked(row: ViewRow, field: FieldDef): boolean {
  const v = row.values[field.id]
  return v !== undefined && v !== null && isImageValue(v) && v.length > 0
}

/* ---------------------------------------------------------- */
/* One fact: label over value, the value a button              */
/* ---------------------------------------------------------- */

function Fact({
  table,
  row,
  field,
  heldCopy,
  commit,
}: {
  table: EntityDef
  row: ViewRow
  field: FieldDef
  heldCopy: (address: string | undefined) => Held | null
  commit: (rowId: string, fieldId: string, text: string) => Written
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const [pill, setPill] = useState<string | null>(null)
  const opener = useRef<HTMLElement>(null)
  const editing = draft !== null

  /* the focus goes back to the button the field came from, so a
     keyboard that opened a value lands where it was — and ONLY then:
     a record opening beside the grid must not take the focus off the
     grid, or the next J would land on a fact instead of a row */
  const wasEditing = useRef(false)
  useEffect(() => {
    if (wasEditing.current && !editing) opener.current?.focus({ preventScroll: true })
    wasEditing.current = editing
  }, [editing])

  const finish = (): void => {
    if (draft === null) return
    const typed = draft
    setDraft(null)
    if (typed === seedOf(field, row)) return
    const outcome = commit(row.rowId, field.id, typed)
    setPill('refused' in outcome && outcome.refused !== '' ? outcome.refused : null)
  }

  const open = (): void => {
    if (field.type === 'image') {
      setPill(PICTURE_CELL_REFUSAL)
      return
    }
    if (field.type === 'formula') {
      setPill(`${field.name} is worked out from other columns — there is no cell to write.`)
      return
    }
    if (field.type === 'boolean') {
      const v = row.values[field.id]
      const outcome = commit(row.rowId, field.id, v === true ? 'no' : 'yes')
      setPill('refused' in outcome && outcome.refused !== '' ? outcome.refused : null)
      return
    }
    setPill(null)
    setDraft(seedOf(field, row))
  }

  const onKey = (e: ReactKeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      finish()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setDraft(null)
    }
  }

  const value =
    field.type === 'image' ? pictureWords(row, field, heldCopy) : paintOf(table, field, row)
  const num = field.type === 'number'
  return (
    <div className="sh-fact" data-cost={isCost(table, field) ? '' : undefined}>
      <dt className="sh-fact__label">
        {field.name}
        {isCost(table, field) ? <span className="sh-fact__cost"> {COST_WORD}</span> : null}
      </dt>
      <dd className="sh-fact__value">
        {editing ? (
          <Input
            aria-label={`${field.name}, editing`}
            value={draft}
            onValueChange={setDraft}
            onKeyDown={onKey}
            onBlur={finish}
            mono={num}
            inputMode={num ? 'decimal' : undefined}
            autoFocus
          />
        ) : (
          <button
            ref={(el) => {
              opener.current = el
            }}
            type="button"
            className="sh-fact__button"
            data-num={num ? '' : undefined}
            onClick={open}
            aria-label={`${field.name}: ${value === '' ? 'empty' : value}. Press to change it.`}
          >
            {value === '' ? <span className="sh-fact__empty">—</span> : value}
          </button>
        )}
        {pill ? (
          <span className="sh-pill sh-pill--fact" role="alert">
            {pill}
          </span>
        ) : null}
      </dd>
    </div>
  )
}

function pictureWords(
  row: ViewRow,
  field: FieldDef,
  heldCopy: (address: string | undefined) => Held | null,
): string {
  const v = row.values[field.id]
  if (v === undefined || v === null || !isImageValue(v) || v.length === 0) return ''
  const first = primaryImage(v)
  const held = heldCopy(first?.src)
  return held ? `held, ${held.w} × ${held.h}` : `${HELD_AS_A_LINK}: ${first?.src ?? ''}`
}
