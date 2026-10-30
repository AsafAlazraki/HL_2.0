/* ============================================================
   THE RECORD — one row as a spec sheet, opened UNDER its row on a
   desk and as the whole screen in a hand. Every column the file holds
   for the row, under the table's own section headings, label over
   value, every value a button that becomes a field on Enter with the
   engine's refusal in a pill beneath it.

   WHY UNDER THE ROW AND NOT BESIDE THE LIST. The built sheet kept a
   record panel down the right at the same `--spacing(90)` the quotes
   register and Data's plate use, and the critic measured the three
   screens as one composition (built-critique-m2.md §6). The price list
   has no right-hand column at any width: the record opens where the
   eye already is, beside the model's spine and below the row it is
   about, and the rows under it move down to make room — the reference
   the direction board cites for the motion is the one height change,
   in `--duration-press`, stilled under reduced motion.

   `boats/highfield-sport-560-specs.png` sets the shape — a light
   label over a heavier value — and `boats/apple-compare-specs.png`
   the section heading with its hairline.

   NOTHING HERE IS A SECOND ENGINE. Every value is `paintOf`, every
   commit goes through the same `commit` the grid uses, and the cost
   sections say the same word the column heads say.
   ============================================================ */
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon, TrashIcon, XIcon } from '@phosphor-icons/react'
import { Button, Input, Kbd, Refusal } from '@/ui'
import { isImageValue, primaryImage, type EntityDef, type FieldDef } from '@/domain/model'
import type { ViewRow } from '@/domain/catalogue/table/core'
import { deleteRowRadius } from '@/domain/catalogue/commands'
import type { CatalogueData } from '@/domain/catalogue/sheet'
import type { Held } from './pictures'
import { LinePicture, type LineOption } from './LinePicture'
import {
  COST_WORD,
  HELD_AS_A_LINK,
  isCost,
  isSourceColumn,
  codeOfRow,
  paintOf,
  pathSaid,
  recordSaid,
  PICTURE_CELL_REFUSAL,
  seedOf,
  sourceSaid,
} from './read'
import type { Written } from './Grid'

export interface RecordProps {
  table: EntityDef
  row: ViewRow
  /** the drawers this row is filed under, outermost first */
  path: string[]
  /** the column that names the row */
  pinFieldId?: string
  heldCopy: (address: string | undefined, rowId?: string) => Held | null
  commit: (rowId: string, fieldId: string, text: string) => Written
  /** the sheet, for the delete's counted radius */
  data: CatalogueData
  onDelete: (rowId: string, said: string) => void
  /** a new row filed under this row's model — "Add a variant to Roll Up 230 KAM" —
   *  where every level of its path has a value; undefined where one does not */
  onAdd?: { label: string; press: () => void }
  /** A BOAT'S WAY TO WHAT GOES ON IT: "What goes on this boat", opening Fitment already on this
   *  line (exposure.md: the details showed Min HP and Max HP and led nowhere). Boats only. */
  fits?: { href: string; go: () => void }
  /** the option a dealer may add their own picture to; it stands where the picture is drawn */
  option?: LineOption
  onClose: () => void
  /** a hand: the record is the screen, so it says so and offers the way back first */
  hand: boolean
}

/* THE PICTURE IS THE PICTURE. The record draws the held copy itself (or
   says, once, why none is held), so its column is not listed again as
   words among the facts — "Image Link: held, 1100 × 619" was a line of
   the file read aloud (built-critique-m2-close.md). AND WHERE THE LINE
   CAME FROM IS SAID ONCE, in words, in its own section (`sourceSaid`):
   "Source Boat Module!R284" among the facts was the file's own address
   read aloud (built-m3.md, the sheet). */
const listed = (f: FieldDef): boolean => f.type !== 'image' && !isSourceColumn(f)

export function Record({
  table,
  row,
  path,
  pinFieldId,
  heldCopy,
  commit,
  data,
  onDelete,
  onAdd,
  fits,
  option,
  onClose,
  hand,
}: RecordProps) {
  /* the file's own string stays on its fact below, where it is corrected; the heading says it */
  const name = recordSaid(
    table,
    pinFieldId ? (row.text[pinFieldId] ?? '') : '',
    codeOfRow(table, row.text),
  )
  /* a drawer the heading already names (its model) is not said a second time above it */
  const drawers = pathSaid(table.id, path).filter((d) => d !== '' && !name.startsWith(d))
  const image = table.fields.find((f) => f.type === 'image')
  const held = image ? heldOf(row, image, heldCopy) : null
  const sections = table.sections ?? []
  const unbanded = table.fields.filter(
    (f) => listed(f) && (f.sectionId === undefined || !sections.some((s) => s.id === f.sectionId)),
  )
  const radius = deleteRowRadius(data, table.id, row.rowId)
  const [asked, setAsked] = useState(false)

  return (
    <section
      className="sh-record"
      data-testid="sheet-record"
      data-ground="plate"
      data-hand={hand ? '' : undefined}
      aria-label={`Details: ${name || 'this variant'}`}
    >
      <div className="sh-record__top">
        {hand ? (
          <Button
            intent="quiet"
            size="sm"
            icon={ArrowLeftIcon}
            onClick={onClose}
            aria-label="Close the details"
          >
            Back to the price list
          </Button>
        ) : null}
        <p className="sh-record__path">{drawers.length > 0 ? drawers.join(' ▸ ') : table.name}</p>
        <h2 className="sh-record__name">{name || '(no name)'}</h2>
        {hand ? null : (
          <Button
            intent="quiet"
            size="sm"
            icon={XIcon}
            onClick={onClose}
            aria-label="Close the details"
          >
            Close
          </Button>
        )}
      </div>

      <div className="sh-record__body">
        {option ? (
          <LinePicture option={option} />
        ) : image ? (
          held ? (
            <figure className="sh-record__figure">
              <img
                className="sh-record__picture"
                src={held.held.at}
                width={held.held.w}
                height={held.held.h}
                alt={`${name}, ${held.held.verdict === 'scene' ? 'on the water' : 'the maker’s render'}`}
              />
            </figure>
          ) : (
            <p className="sh-record__nopicture">
              {isLinked(row, image)
                ? 'No picture of it yet: the price list gives the maker’s web address for one, with no copy on this computer.'
                : 'No picture of it yet.'}
            </p>
          )
        ) : null}

        <div className="sh-record__sections">
          {sections.map((section) => {
            const fields = table.fields.filter((f) => f.sectionId === section.id && listed(f))
            /* the file's own Source section holds only the line's address: said in words */
            const from = table.fields.some((f) => f.sectionId === section.id && isSourceColumn(f))
              ? rowSource(table, row)
              : ''
            if (fields.length === 0 && from === '') return null
            const cost = /cost|markup|margin/i.test(section.name)
            return (
              <section
                key={section.id}
                className="sh-record__section"
                aria-label={section.name}
                data-accent={section.accent ?? 'none'}
              >
                <h3 className="sh-record__heading">
                  {section.name}
                  {cost ? (
                    <span className="sh-record__cost"> · {COST_WORD}, the dealer’s own</span>
                  ) : null}
                </h3>
                {fields.length > 0 ? (
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
                ) : null}
                {from !== '' ? <p className="sh-record__provenance">{from}</p> : null}
              </section>
            )
          })}
          {unbanded.length > 0 ? (
            <section className="sh-record__section" aria-label="Other columns">
              <h3 className="sh-record__heading">Other columns</h3>
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
        </div>
      </div>

      <div className="sh-record__foot">
        {/* THE VOCABULARY, WHERE ITS ACTS ARE, under a pointer that has keys */}
        <p className="sh-keys" data-testid="sheet-keys">
          <Kbd>↑</Kbd> <Kbd>↓</Kbd> move and this follows · <Kbd>Enter</Kbd> edits ·{' '}
          <Kbd>Mod D</Kbd> fills down · <Kbd>Mod Z</Kbd> undoes · <Kbd>Esc</Kbd> closes
        </p>
        <div className="sh-record__acts">
          {asked ? (
            <section className="sh-record__ask" aria-label="Delete this line">
              <p className="sh-record__askwhy">
                This takes <b>{name || 'this line'}</b> off {table.name}.
                {radius.said ? ` ${radius.said}` : ' Nothing else on the price list names it.'} It
                can be put back with Undo.
              </p>
              <div className="sh-record__askacts">
                <Button
                  intent="primary"
                  size="sm"
                  icon={TrashIcon}
                  onClick={() => {
                    setAsked(false)
                    onDelete(row.rowId, radius.said)
                  }}
                >
                  Delete it
                </Button>
                <Button intent="quiet" size="sm" onClick={() => setAsked(false)}>
                  Keep it
                </Button>
              </div>
            </section>
          ) : (
            <>
              {fits ? (
                <Button
                  intent="primary"
                  size="sm"
                  icon={ArrowRightIcon}
                  href={fits.href}
                  onClick={fits.go}
                >
                  What goes on this boat
                </Button>
              ) : null}
              {/* ADDING A ROW IS THE RECORD'S ACT (2026-09-25): on the spine it was
                  painted over the model's facts on a tablet and out of the
                  keyboard's reach (built-critique-m2-close-2.md major 8) */}
              {onAdd ? (
                <Button intent="quiet" size="sm" icon={PlusIcon} onClick={onAdd.press}>
                  {onAdd.label}
                </Button>
              ) : null}
              <Button intent="quiet" size="sm" icon={TrashIcon} onClick={() => setAsked(true)}>
                Delete this line…
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

/** Where the line came from, in words, where the file says so. The table's own description
 *  is not read aloud here: it was the packer's notes ("rows 281–948 under the yellow brand
 *  banner … 588 of 588 SKUs seeded", built-m3.md, the sheet), not a dealer's sentence. */
function rowSource(table: EntityDef, row: ViewRow): string {
  const src = table.fields.find(isSourceColumn)
  return sourceSaid(src ? (row.text[src.id] ?? '') : '')
}

function heldOf(
  row: ViewRow,
  field: FieldDef,
  heldCopy: (address: string | undefined, rowId?: string) => Held | null,
): { held: Held } | null {
  const v = row.values[field.id]
  if (v === undefined || v === null || !isImageValue(v)) return null
  const held = heldCopy(primaryImage(v)?.src, row.rowId)
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
  heldCopy: (address: string | undefined, rowId?: string) => Held | null
  commit: (rowId: string, fieldId: string, text: string) => Written
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const [pill, setPill] = useState<string | null>(null)
  const opener = useRef<HTMLElement>(null)
  const editing = draft !== null

  /* the focus goes back to the button the field came from, so a
     keyboard that opened a value lands where it was — and ONLY then:
     a record opening under the row must not take the focus off the
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
            <Refusal>{pill}</Refusal>
          </span>
        ) : null}
      </dd>
    </div>
  )
}

function pictureWords(
  row: ViewRow,
  field: FieldDef,
  heldCopy: (address: string | undefined, rowId?: string) => Held | null,
): string {
  const v = row.values[field.id]
  if (v === undefined || v === null || !isImageValue(v) || v.length === 0) return ''
  const first = primaryImage(v)
  const held = heldCopy(first?.src, row.rowId)
  return held ? `saved, ${held.w} × ${held.h}` : `${HELD_AS_A_LINK}: ${first?.src ?? ''}`
}
