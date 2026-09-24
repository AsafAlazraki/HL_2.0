/* ============================================================
   THE COLUMNS HELD ONE PRESS AWAY, and the one structural act.

   The price list draws the columns a dealer reads first
   (`readingColumns`); everything else is here, listed by where its
   words already are — said once in the table's head, said on each
   model's spine, a cost, empty on every row — and one press puts any
   of them back in the grid as a column, kept in the address (`?show=`)
   so a write never takes it away again. "Every column" is the door
   for all of them at once.

   ADD A COLUMN IS THE LAST LINE, BEHIND AN ACT A PERSON CHOSE TO
   PRESS. The built sheet rested its record panel on an ADD A COLUMN
   form with an amber act already refusing — the brightest thing on
   the screen saying no before anybody touched it (critique §11). Here
   the offer is not drawn until "Add a column…" is pressed; then it is
   a sentence naming the table, the column and how many rows it lands
   empty on, with the act under it — and the act refuses nothing until
   it has been pressed, because a refusal is the answer to a press.
   `structure.test.ts` reads this file to hold the one structural call
   here (docs/LATER.md's owed guard, ported).
   ============================================================ */
import { useState } from 'react'
import { Button, Input, Popover, Select } from '@/ui'
import type { EntityDef, FieldDef } from '@/domain/model'
import { addField, type CatalogueCommand } from '@/domain/catalogue/commands'
import { COLUMN_KINDS } from '@/domain/catalogue/table/columnKinds'
import { countLabel, type LeafNoun } from '@/domain/catalogue/table/grouping'
import type { Elsewhere, HeldColumn } from '@/domain/catalogue/table/priceList'
import { COST_WORD, isCost } from './read'
import type { Written } from './Grid'

/** Where a held column's words are, in the dealer's own terms. */
const WHERE: Record<Elsewhere, string> = {
  head: 'The same on every row — said once at the top',
  spine: 'Said once on each',
  cost: 'The dealer’s own cost — never on a quote',
  empty: 'Empty on every row',
  picture: 'Pictures — on each head and in the record',
  name: 'Says what the name already says',
  other: 'Varies by row',
}

const ORDER: Elsewhere[] = ['other', 'spine', 'cost', 'head', 'name', 'picture', 'empty']

export interface MoreProps {
  table: EntityDef
  held: readonly HeldColumn[]
  /** columns a person pressed into the grid, which can be put back */
  shown: readonly FieldDef[]
  /** the spine level's own name, plural — "models" */
  spineNoun: LeafNoun | null
  rowCount: number
  noun: LeafNoun
  onShow: (fieldId: string) => void
  onHide: (fieldId: string) => void
  apply: (command: CatalogueCommand) => Written
}

export function More({
  table,
  held,
  shown,
  spineNoun,
  rowCount,
  noun,
  onShow,
  onHide,
  apply,
}: MoreProps) {
  const [open, setOpen] = useState(false)
  const groups = ORDER.map((where) => ({
    where,
    columns: held.filter((h) => h.where === where),
  })).filter((g) => g.columns.length > 0)

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      side="bottom"
      align="end"
      title={`${held.length} more ${held.length === 1 ? 'column' : 'columns'} of ${table.name}`}
      trigger={
        /* the count alone: which of them are cost is said inside, at each
           column, and on the head's own count line ("5 of them cost") — the
           head's last cell holds the lit row's button's width, no more */
        <button type="button" className="sh-more" data-testid="sheet-more" tabIndex={-1}>
          {held.length} more <span aria-hidden="true">▸</span>
        </button>
      }
    >
      <div className="sh-menu">
        {shown.length > 0 ? (
          <section className="sh-menu__group" aria-label="Shown as columns">
            <h3 className="sh-menu__head">Shown as columns</h3>
            <ul className="sh-menu__list">
              {shown.map((f) => (
                <li key={f.id} className="sh-menu__item">
                  <span className="sh-menu__name">{f.name}</span>
                  <button type="button" className="sh-menu__act" onClick={() => onHide(f.id)}>
                    Put back
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {groups.map((g) => (
          <section key={g.where} className="sh-menu__group" aria-label={WHERE[g.where]}>
            <h3 className="sh-menu__head">
              {g.where === 'spine' && spineNoun
                ? `${WHERE.spine} ${spineNoun.one}`
                : WHERE[g.where]}
            </h3>
            <ul className="sh-menu__list">
              {g.columns.map((h) => (
                <li key={h.field.id} className="sh-menu__item">
                  <span className="sh-menu__name">
                    {h.field.name}
                    {isCost(table, h.field) ? (
                      <span className="sh-menu__cost"> {COST_WORD}</span>
                    ) : null}
                  </span>
                  {h.field.type === 'image' ? null : (
                    <button
                      type="button"
                      className="sh-menu__act"
                      onClick={() => onShow(h.field.id)}
                    >
                      Show as a column
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
        <Offer table={table} rowCount={rowCount} noun={noun} apply={apply} />
      </div>
    </Popover>
  )
}

/* ---------------------------------------------------------- */
/* The offer: a column, named in a sentence before it is made   */
/* ---------------------------------------------------------- */

/** What a new column would be called before a person names it. */
const COLUMN_DRAFT = ''

export function Offer({
  table,
  rowCount,
  noun,
  apply,
}: {
  table: EntityDef
  rowCount: number
  noun: LeafNoun
  apply: (command: CatalogueCommand) => Written
}) {
  const [asked, setAsked] = useState(false)
  const [name, setName] = useState(COLUMN_DRAFT)
  const [kind, setKind] = useState<string>('text')
  const [sectionId, setSectionId] = useState<string | null>(null)
  const [tried, setTried] = useState(false)
  const [said, setSaid] = useState<string | null>(null)
  const clean = name.trim()
  const kinds = COLUMN_KINDS.filter((k) => k.type !== 'reference' && k.type !== 'formula')
  const sections = table.sections ?? []
  const where = sectionId ? sections.find((s) => s.id === sectionId)?.name : undefined

  if (!asked) {
    return (
      <div className="sh-menu__group sh-menu__group--offer">
        <button type="button" className="sh-menu__add" onClick={() => setAsked(true)}>
          Add a column…
        </button>
      </div>
    )
  }

  /* THE OFFER: the sentence names the table, the column, its kind and
     how many rows it lands empty on, and the act sits under the
     sentence. Nothing is written until it is pressed, and nothing
     refuses until then either. */
  const acceptColumn = (): void => {
    if (clean === '') {
      setTried(true)
      return
    }
    const outcome = apply(
      addField(table.id, {
        name: clean,
        type: kind as FieldDef['type'],
        ...(sectionId ? { sectionId } : {}),
      }),
    )
    setSaid('refused' in outcome ? outcome.refused : null)
    if ('said' in outcome) {
      setName(COLUMN_DRAFT)
      setTried(false)
    }
  }

  return (
    <section className="sh-menu__group sh-offer" aria-label="Add a column">
      <h3 className="sh-menu__head">Add a column</h3>
      <div className="sh-offer__fields">
        <Input
          aria-label="The new column's name"
          value={name}
          onValueChange={setName}
          placeholder="What the column is called"
        />
        <Select
          aria-label="What the column holds"
          options={kinds.map((k) => ({ value: k.type, label: k.label }))}
          value={kind}
          onValueChange={(v) => setKind(v ?? 'text')}
        />
        {sections.length > 0 ? (
          <Select
            aria-label="Which section it sits in"
            options={sections.map((s) => ({ value: s.id, label: s.name }))}
            value={sectionId}
            onValueChange={setSectionId}
            placeholder="At the end of the sheet"
          />
        ) : null}
      </div>
      <p className="sh-offer__say">
        {clean === ''
          ? `Name the column and this says what it would do to ${table.name}. Nothing is written until the act under it is pressed.`
          : `This adds a column called “${clean}” to ${table.name}, holding ${kinds.find((k) => k.type === kind)?.label.toLowerCase() ?? kind}, empty on all ${countLabel(rowCount, noun)}${where ? `, in ${where}` : ', at the end of the sheet'}. Nothing else changes, and it can be undone.`}
      </p>
      <Button
        intent="primary"
        size="sm"
        onClick={acceptColumn}
        refusedBecause={
          tried && clean === '' ? 'A column needs a name before it can be added.' : undefined
        }
      >
        Add the column
      </Button>
      {said ? (
        <p className="sh-alarm" role="alert">
          {said}
        </p>
      ) : null}
    </section>
  )
}
