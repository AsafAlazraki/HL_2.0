import { useState } from 'react'
import {
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  EqualsIcon,
  EyeIcon,
  LockSimpleIcon,
  PlusIcon,
  QuestionIcon,
} from '@phosphor-icons/react'
import { Button, Icon, KindMark, Plate } from '@/ui'
import type { CannotBecause, FileLine, FileList, NewFilePlan } from '@/domain/io/newFile'
import { markFor } from '@/screens/home/ledgers'
import type { Applied } from './Shelf'
import { count, dollars, plural } from './read'

/* ============================================================
   EVERY CHANGE, BEFORE IT IS WRITTEN — the shelf's centre, drawn as
   D's own (the verdict's must-change) with C's glyphs in the gutter.

   IT OPENS ON WHAT DOES NOT MOVE: the share of the price list a
   workbook leaves exactly as it is, large, before a single change. Then
   the figures that more than doubled or fell below half, to look at
   first. Then each list folded to one sentence a dealer reads ("1,457
   lines change at Sell: 684 higher, 530 lower"), opening to its lines,
   each marked → change, + new, ? can't be placed. Apply sits at the
   foot, in the page and never floating over it, with its Undo said
   BEFORE the press; the moment after, the same place says what is now
   on the price list and offers the Undo.
   ============================================================ */

const STEP = 40
const FIRST_CHECKS = 6

const BECAUSE: Record<CannotBecause, string> = {
  'shared-name': 'two lines here share this name, so it cannot say which it means',
  'said-twice': 'an earlier line of the workbook already names the same line here',
  'no-list': 'no list here carries this name, and its sheet feeds several',
  'two-lists': 'two lists here carry this name',
}

export function Changes({
  plan,
  applied,
  apply,
  undo,
  back,
}: {
  plan: NewFilePlan
  applied: Applied | null
  apply: () => string | null
  undo: () => string | null
  back: () => void
}) {
  const [refused, setRefused] = useState<string | null>(null)
  const [allChecks, setAllChecks] = useState(false)
  const share = plan.totalRows === 0 ? 100 : (plan.unmoved / plan.totalRows) * 100
  const checks = allChecks ? plan.checkFirst : plan.checkFirst.slice(0, FIRST_CHECKS)
  const lists = new Map(plan.lists.map((l) => [l.tableId, l]))

  return (
    <main className="sf sf-changes" data-testid="shelf" data-read="" data-see="changes">
      <nav className="sf-crumb" aria-label="The shelf">
        <Button intent="quiet" size="sm" icon={ArrowLeftIcon} onClick={back}>
          Back to the shelf
        </Button>
      </nav>

      <header className="sf-ch-head">
        <p className="sf-eyebrow">{plan.fileName} · read against the price list on this computer</p>
        <h1 className="sf-ch-title">
          <span className="sf-ch-title__figure">{count(plan.unmoved)}</span> of{' '}
          {count(plan.totalRows)} lines stay exactly as they are.
        </h1>
        <div className="sf-ch-share" aria-hidden="true">
          <span className="sf-ch-share__kept" style={{ inlineSize: `${share}%` }} />
        </div>
        <ul className="sf-ch-census" aria-label="What it would do">
          <li data-fate="change">
            <Glyph fate="change" />
            <strong>{count(plan.changing)}</strong> change
          </li>
          <li data-fate="new">
            <Glyph fate="new" />
            <strong>{count(plan.adding)}</strong> new
          </li>
          <li data-fate="cannot">
            <Glyph fate="cannot" />
            <strong>{count(plan.cannot)}</strong> can’t be placed, and stay out
          </li>
          <li data-fate="kept">
            <Glyph fate="kept" />
            <strong>0</strong> taken away: a workbook never removes a line
          </li>
        </ul>
        <p className="sf-ch-say">
          It is not dated inside, so nothing here says which is newer. Standard inclusions and
          factory options are on no line of the price list here: they arrive with Northside’s Boat
          Module and Factory Options Module workbooks.
        </p>
      </header>

      {plan.checkFirst.length > 0 ? (
        <section className="sf-check" data-ground="plate" aria-labelledby="sf-check-title">
          <h2 id="sf-check-title" className="sf-check__title">
            <Icon glyph={EyeIcon} />
            Look at these first
          </h2>
          <p className="sf-check__say">
            {plural(
              plan.checkFirst.length,
              'price more than doubles or falls below half',
              'prices more than double or fall below half',
            )}
            . Each may be right; each is worth a look before you apply.
          </p>
          <ul className="sf-lines">
            {checks.map((l) => (
              <Line key={`${l.tableId}:${l.at}`} line={l} list={lists.get(l.tableId)} swing />
            ))}
          </ul>
          {plan.checkFirst.length > FIRST_CHECKS ? (
            <Button intent="quiet" size="sm" onClick={() => setAllChecks((v) => !v)}>
              {allChecks ? 'Show the first six' : `Show all ${count(plan.checkFirst.length)}`}
            </Button>
          ) : null}
        </section>
      ) : null}

      <section className="sf-lists" aria-label="Each list it changes">
        {plan.lists.map((l) => (
          <ListPlate key={l.tableId} list={l} />
        ))}
        {plan.unplaced.length > 0 ? <Unplaced lines={plan.unplaced} /> : null}
        <p className="sf-lists__rest">
          <Glyph fate="kept" />
          {plural(plan.listsUntouched, 'other list is', 'other lists are')} not in this workbook and
          stay exactly as they are.
          {plan.sheetsLeft.length > 0
            ? ` ${plural(plan.sheetsLeft.length, 'sheet', 'sheets')} of it feed${plan.sheetsLeft.length === 1 ? 's' : ''} no list here and ${plan.sheetsLeft.length === 1 ? 'is' : 'are'} not read: ${plan.sheetsLeft.slice(0, 5).join(', ')}${plan.sheetsLeft.length > 5 ? ' and more' : ''}.`
            : ''}
        </p>
      </section>

      <footer className="sf-apply" data-applied={applied ? '' : undefined}>
        {applied ? (
          <>
            <p className="sf-apply__said" aria-live="polite">
              <Icon glyph={CheckCircleIcon} weight="fill" />
              <span>
                <strong>
                  {plural(applied.changes, 'change is', 'changes are')} on the price list.
                </strong>{' '}
                Undo puts all {count(applied.changes)} back in one step.
              </span>
            </p>
            <p className="sf-apply__lock">
              <Icon glyph={LockSimpleIcon} />A quote already given: untouched.
            </p>
            <span className="sf-apply__act">
              <Button
                intent="secondary"
                icon={ArrowCounterClockwiseIcon}
                onClick={() => setRefused(undo())}
                refusedBecause={refused ?? undefined}
              >
                Undo
              </Button>
            </span>
          </>
        ) : plan.changes === 0 ? (
          <>
            <p className="sf-apply__said" aria-live="polite">
              <Icon glyph={EqualsIcon} />
              <span>
                <strong>Nothing to apply.</strong> Every line this workbook names already reads as
                it does here.
              </span>
            </p>
            <span className="sf-apply__act">
              <Button intent="secondary" icon={ArrowLeftIcon} onClick={back}>
                Back to the shelf
              </Button>
            </span>
          </>
        ) : (
          <>
            <p className="sf-apply__said">
              <Icon glyph={ArrowCounterClockwiseIcon} />
              <span>
                <strong>Undo puts all {count(plan.changes)} back in one step.</strong>
              </span>
            </p>
            <p className="sf-apply__lock">
              <Icon glyph={LockSimpleIcon} />A quote already given: untouched. A quote is a
              photograph of what was offered on the day.
            </p>
            <span className="sf-apply__act">
              <Button
                intent="act"
                icon={ArrowRightIcon}
                onClick={() => setRefused(apply())}
                refusedBecause={refused ?? undefined}
              >
                {`Apply ${plural(plan.changes, 'change', 'changes')}`}
              </Button>
            </span>
          </>
        )}
      </footer>
    </main>
  )
}

/* ---------------------------------------------------------- */

function Glyph({ fate }: { fate: 'change' | 'new' | 'cannot' | 'kept' }) {
  const glyph =
    fate === 'change'
      ? ArrowRightIcon
      : fate === 'new'
        ? PlusIcon
        : fate === 'cannot'
          ? QuestionIcon
          : EqualsIcon
  return (
    <span className="sf-glyph" data-fate={fate} aria-hidden="true">
      <Icon glyph={glyph} />
    </span>
  )
}

const FATE_WORD = { change: 'changes', new: 'new', cannot: 'can’t be placed' } as const

function Line({
  line,
  list,
  swing,
}: {
  line: FileLine
  list?: FileList | undefined
  swing?: boolean
}) {
  const priced = line.from != null || line.to != null
  const others =
    line.fate === 'change' ? line.figures - (line.from != null && line.to != null ? 1 : 0) : 0
  const pct =
    line.from != null && line.to != null && line.from !== 0
      ? Math.round(((line.to - line.from) / Math.abs(line.from)) * 100)
      : null
  return (
    <li className="sf-line" data-fate={line.fate}>
      <Glyph fate={line.fate} />
      <span className="sf-line__name">
        <span className="sf-visually-hidden">{FATE_WORD[line.fate]}: </span>
        {line.name}
        {swing && list ? <span className="sf-line__list"> · {list.name}</span> : null}
        {line.because ? <span className="sf-line__why">{BECAUSE[line.because]}</span> : null}
      </span>
      <span className="sf-line__at">line {line.at}</span>
      <span className="sf-line__figures">
        {line.fate === 'change' && priced && line.from != null && line.to != null ? (
          <>
            <s className="sf-line__was">{dollars(line.from)}</s>
            <Icon glyph={ArrowRightIcon} />
            <strong>{dollars(line.to)}</strong>
            {list?.readAt ? <span className="sf-line__level"> {list.readAt}</span> : null}
          </>
        ) : line.fate === 'new' && line.to != null ? (
          <>
            <strong>{dollars(line.to)}</strong>
            {list?.readAt ? <span className="sf-line__level"> {list.readAt}</span> : null}
          </>
        ) : line.fate === 'change' ? (
          <span className="sf-line__level">{plural(line.figures, 'figure', 'figures')}</span>
        ) : null}
      </span>
      <span className="sf-line__more">
        {pct !== null ? (
          <span className="sf-line__pct" data-up={pct > 0 ? '' : undefined}>
            {pct > 0 ? '+' : '−'}
            {Math.abs(pct)}%
          </span>
        ) : null}
        {others > 0 && !swing ? (
          <span className="sf-line__others">
            and {plural(others, 'other figure', 'other figures')}
          </span>
        ) : null}
      </span>
    </li>
  )
}

function sentenceOf(l: FileList): string {
  const bits: string[] = []
  if (l.changing > 0) {
    const way =
      l.readAt && l.higher + l.lower > 0
        ? ` at ${l.readAt}: ${count(l.higher)} higher, ${count(l.lower)} lower${l.changing > l.higher + l.lower ? `, ${count(l.changing - l.higher - l.lower)} in other figures only` : ''}`
        : ''
    bits.push(`${plural(l.changing, 'line changes', 'lines change')}${way}`)
  }
  if (l.adding > 0) bits.push(`${count(l.adding)} new`)
  if (l.cannot > 0) bits.push(`${count(l.cannot)} can’t be placed`)
  if (bits.length === 0) bits.push('nothing changes')
  return bits.join(' · ')
}

function ListPlate({ list: l }: { list: FileList }) {
  const [open, setOpen] = useState(false)
  const [shown, setShown] = useState(STEP)
  const all = [...l.lines, ...l.cannotLines]
  const choice = markFor(l.name, 'paper')
  const id = `sf-list-${l.tableId}`
  return (
    <Plate as="article" pad="md" labelledBy={`${id}-name`}>
      <div className="sf-list">
        <div className="sf-list__head">
          <span className="sf-list__mark">
            {choice.drawn ? (
              <img
                src={choice.mark.src}
                width={choice.mark.width}
                height={choice.mark.height}
                alt=""
              />
            ) : l.kind ? (
              <KindMark kind={l.kind} />
            ) : null}
          </span>
          <div className="sf-list__words">
            <h2 id={`${id}-name`} className="sf-list__name">
              {l.name}
            </h2>
            <p className="sf-list__say">{sentenceOf(l)}</p>
            <p className="sf-list__kept">
              {plural(l.notInFile, 'line is', 'lines are')} not in this workbook and{' '}
              {l.notInFile === 1 ? 'stays' : 'stay'} as {l.notInFile === 1 ? 'it is' : 'they are'} ·
              from its sheet {l.sheet}
            </p>
          </div>
          {all.length > 0 ? (
            <span className="sf-list__open">
              <Button
                intent="secondary"
                size="sm"
                aria-expanded={open}
                aria-controls={id}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? 'Fold' : `See the ${count(all.length)}`}
              </Button>
            </span>
          ) : null}
        </div>
        {open ? (
          <div id={id}>
            <ul className="sf-lines">
              {all.slice(0, shown).map((line) => (
                <Line key={`${line.fate}:${line.at}`} line={line} list={l} />
              ))}
            </ul>
            {all.length > shown ? (
              <Button intent="quiet" size="sm" onClick={() => setShown((n) => n + STEP)}>
                {all.length - shown <= STEP
                  ? `Show the last ${count(all.length - shown)}`
                  : `Show ${count(STEP)} more of the ${count(all.length - shown)} left`}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </Plate>
  )
}

function Unplaced({ lines }: { lines: FileLine[] }) {
  const [open, setOpen] = useState(false)
  const sheets = [...new Set(lines.map((l) => l.sheet))]
  return (
    <Plate as="article" pad="md" labelledBy="sf-unplaced-name">
      <div className="sf-list">
        <div className="sf-list__head">
          <span className="sf-list__mark" data-fate="cannot">
            <Glyph fate="cannot" />
          </span>
          <div className="sf-list__words">
            <h2 id="sf-unplaced-name" className="sf-list__name">
              {plural(lines.length, 'line names', 'lines name')} nothing on the price list here
            </h2>
            <p className="sf-list__say">
              On {sheets.join(', ')}, which feeds several lists: nothing in such a line says which
              maker’s list it belongs on, so it stays out.
            </p>
          </div>
          <span className="sf-list__open">
            <Button
              intent="secondary"
              size="sm"
              aria-expanded={open}
              aria-controls="sf-unplaced"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? 'Fold' : `See the ${count(lines.length)}`}
            </Button>
          </span>
        </div>
        {open ? (
          <ul id="sf-unplaced" className="sf-lines">
            {lines.map((line) => (
              <Line key={`${line.sheet}:${line.at}`} line={line} />
            ))}
          </ul>
        ) : null}
      </div>
    </Plate>
  )
}
