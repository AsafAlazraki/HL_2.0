import { useMemo, useState } from 'react'
import {
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  LockSimpleIcon,
  PlusIcon,
} from '@phosphor-icons/react'
import { Button, Field, Icon, Input, Plate, Refusal, Select } from '@/ui'
import { useCatalogue } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { isDone } from '@/domain/catalogue/commands'
import { CUSTOMER_TABLE_ID } from '@/domain/people/customers'
import { pasteCommand, readPaste } from './pasted'
import { count, dollars, plural } from './read'

/* ============================================================
   PASTE FROM EXCEL — a handful of lines copied straight out of a
   spreadsheet onto one list, with the same promise as a workbook:
   every change shown first, nothing written until Apply, one Undo.
   ============================================================ */

const SHOWN = 60

export function Paste({ back }: { back: () => void }) {
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const [tableId, setTableId] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [applied, setApplied] = useState<{ eventId: string; changes: number } | null>(null)
  const [refused, setRefused] = useState<string | null>(null)

  const options = useMemo(
    () =>
      Object.values(tables)
        .filter((t) => t.role !== 'join' && t.id !== CUSTOMER_TABLE_ID)
        .map((t) => ({ value: t.id, label: t.name, trail: count(rows[t.id]?.length ?? 0) }))
        .toSorted((a, b) => a.label.localeCompare(b.label)),
    [tables, rows],
  )
  const chosen = tableId ? tables[tableId] : undefined
  const pasted = useMemo(
    () => (chosen && !applied ? readPaste(chosen, rows[chosen.id] ?? [], text) : null),
    [chosen, rows, text, applied],
  )
  const changes = pasted?.ok ? pasted.changing + pasted.adding : 0

  const apply = (): void => {
    if (!chosen || !pasted?.ok) return
    const outcome = catalogue
      .getState()
      .apply(
        pasteCommand(
          chosen.id,
          pasted.plan,
          `${plural(changes, 'change', 'changes')} pasted onto ${chosen.name}`,
        ),
      )
    if (!isDone(outcome)) {
      setRefused(outcome.refused || 'Nothing pasted would change the price list.')
      return
    }
    setRefused(null)
    setApplied({ eventId: outcome.event.id, changes })
  }
  const undo = (): void => {
    if (!applied) return
    const outcome = catalogue.getState().undo(applied.eventId)
    if (!isDone(outcome)) {
      setRefused(outcome.refused || 'There is nothing to put back.')
      return
    }
    setRefused(null)
    setApplied(null)
  }

  return (
    <main className="sf sf-paste" data-testid="shelf" data-read="" data-see="paste">
      <nav className="sf-crumb" aria-label="The shelf">
        <Button intent="quiet" size="sm" icon={ArrowLeftIcon} onClick={back}>
          Back to the shelf
        </Button>
      </nav>
      <header className="sf-ch-head">
        <p className="sf-eyebrow">The shelf · paste from Excel</p>
        <h1 className="sf-page__title">Paste lines onto one list.</h1>
        <p className="sf-ch-say">
          Copy the lines in Excel with their headings, choose the list they belong on, and paste
          them here. A line is found by its name; every change is shown before anything is written,
          and nothing is ever taken away.
        </p>
      </header>

      <Plate as="section" pad="lg" label="What is pasted">
        <div className="sf-paste__form">
          <Field label="The list they belong on">
            <Select
              options={options}
              value={tableId}
              onValueChange={(v) => {
                setTableId(v)
                setApplied(null)
              }}
              placeholder="Choose a list"
              aria-label="The list they belong on"
            />
          </Field>
          <Field label="The lines, pasted from Excel">
            <Input
              look="lines"
              value={text}
              onValueChange={(v) => {
                setText(v)
                setApplied(null)
              }}
              aria-label="The lines, pasted from Excel"
              placeholder={
                chosen ? `Name, then the figures, with their headings` : 'Choose the list first'
              }
            />
          </Field>
        </div>
      </Plate>

      {pasted && !pasted.ok && pasted.say ? (
        <p className="sf-paste__said">
          <Refusal on="room">{pasted.say}</Refusal>
        </p>
      ) : null}

      {pasted?.ok ? (
        <section className="sf-check" data-ground="plate" aria-label="What pasting would do">
          <p className="sf-check__say">
            Read {pasted.read.join(', ')}
            {pasted.left.length > 0
              ? `; left out, as nothing on ${chosen?.name} is called so: ${pasted.left.join(', ')}`
              : ''}
            .{' '}
            {`${plural(pasted.changing, 'line changes', 'lines change')} · ${count(pasted.adding)} new${pasted.cannot > 0 ? ` · ${count(pasted.cannot)} can’t be placed` : ''}.`}
          </p>
          <ul className="sf-lines">
            {pasted.lines.slice(0, SHOWN).map((l) => (
              <li key={l.key} className="sf-line" data-fate={l.fate}>
                <span className="sf-glyph" data-fate={l.fate} aria-hidden="true">
                  <Icon glyph={l.fate === 'new' ? PlusIcon : ArrowRightIcon} />
                </span>
                <span className="sf-line__name">
                  <span className="sf-visually-hidden">
                    {l.fate === 'new' ? 'new' : 'changes'}:{' '}
                  </span>
                  {l.name}
                </span>
                <span className="sf-line__figures">
                  {l.from != null && l.to != null ? (
                    <>
                      <s className="sf-line__was">{dollars(l.from)}</s>
                      <Icon glyph={ArrowRightIcon} />
                      <strong>{dollars(l.to)}</strong>
                    </>
                  ) : l.to != null ? (
                    <strong>{dollars(l.to)}</strong>
                  ) : (
                    <span className="sf-line__level">{plural(l.figures, 'figure', 'figures')}</span>
                  )}
                  {pasted.readAt && l.to != null ? (
                    <span className="sf-line__level"> {pasted.readAt}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
          {pasted.lines.length > SHOWN ? (
            <p className="sf-check__say">
              and {count(pasted.lines.length - SHOWN)} more, all applied together.
            </p>
          ) : null}
        </section>
      ) : null}

      {applied || changes > 0 ? (
        <footer className="sf-apply" data-applied={applied ? '' : undefined}>
          <p className="sf-apply__said" aria-live="polite">
            <Icon glyph={applied ? CheckCircleIcon : ArrowCounterClockwiseIcon} />
            <span>
              {applied ? (
                <>
                  <strong>
                    {plural(applied.changes, 'change is', 'changes are')} on {chosen?.name}.
                  </strong>{' '}
                  Undo puts all {count(applied.changes)} back in one step.
                </>
              ) : (
                <strong>Undo puts all {count(changes)} back in one step.</strong>
              )}
            </span>
          </p>
          <p className="sf-apply__lock">
            <Icon glyph={LockSimpleIcon} />A quote already given: untouched.
          </p>
          <span className="sf-apply__act">
            {applied ? (
              <Button
                intent="secondary"
                icon={ArrowCounterClockwiseIcon}
                onClick={undo}
                refusedBecause={refused ?? undefined}
              >
                Undo
              </Button>
            ) : (
              <Button
                intent="act"
                icon={ArrowRightIcon}
                onClick={apply}
                refusedBecause={refused ?? undefined}
              >
                {`Apply ${plural(changes, 'change', 'changes')}`}
              </Button>
            )}
          </span>
        </footer>
      ) : null}
    </main>
  )
}
