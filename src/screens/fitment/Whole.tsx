/* ============================================================
   SHOW ALL — one of the boat's places, the whole of what is on sale
   for it, grouped by the reason each thing is or is not offered.

   The answer to the brief's hard question 1: a list of hundreds where
   most are not offered is drawn GROUPED BY REASON, the reason said once
   as the group's head and counted — never one sentence repeated down two
   thousand rows. "Made for this boat" leads; what follows is each reason
   and what it holds.

   The answer to hard question 2, changed by built-critique-m3.md (major
   6): NOTHING HERE IS STRUCK. "Show these 74" opened seventy-four struck
   names under a head that already said why, and it read as a deleted
   list, not a list to read. Inside a named group the group's head IS the
   reason, so its lines are set in the list's own ink, plain, to be read,
   found by their words and opened on the price list. The one strike left
   on this screen is the example on a reason's row on the plate, where it
   stands alone beside its sentence — and only where that sentence holds
   it off the boat (`Held.struck`).

   ONE TAB STOP, THE REGISTER'S WAY (`src/screens/quotes/Quotes.tsx`,
   `src/screens/history/History.tsx`): the grid owns the keyboard, the
   arrows walk its lines and Enter opens the line's place on the price
   list. The pointer presses the line's own link.
   ============================================================ */
/* eslint-disable jsx-a11y/prefer-tag-over-role, jsx-a11y/click-events-have-key-events */
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { motion } from 'motion/react'
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  ListBulletsIcon,
  MagnifyingGlassIcon,
  StarIcon,
} from '@phosphor-icons/react'
import { Button, Icon, Input, PriceFigure, move } from '@/ui'
import type { Opens, WholeList, WholeRow } from '@/domain/fitment/boat'
import { findInWhole } from '@/domain/fitment/whole'

/** Lines drawn in one group before it says how many more it is holding and asks for a word. */
export const DRAWN = 150

export interface WholeProps {
  list: WholeList
  /** one reason's group, from its "Show these" on the plate: '' for the whole list. A group
   *  split by maker ('another:Stacer') is reached by its reason's own id ('another'). */
  only: string
  find: string
  onFind: (words: string) => void
  /** from one reason's group out to the whole list */
  onWiden: () => void
  onClose: () => void
  sheetHref: (opens: Opens) => string
  openSheet: (opens: Opens) => void
}

const AU = new Intl.NumberFormat('en-AU')

export function Whole({
  list,
  only,
  find,
  onFind,
  onWiden,
  onClose,
  sheetHref,
  openSheet,
}: WholeProps) {
  const id = useId()
  const [words, setWords] = useState(find)
  useEffect(() => setWords(find), [find])
  /* THE NARROWING IS NAMED AND COUNTED, AND SHOW ALL TAKES IT OFF (the curation contract); every
     figure of it is read in src/domain (`findInWhole`), never summed here */
  const seen = useMemo(() => findInWhole(list, only, words, DRAWN), [list, only, words])
  const { needles, narrowed, narrowedTo, groups, matched } = seen
  const lines = useMemo(() => groups.flatMap((g) => g.drawn), [groups])
  const [cursor, setCursor] = useState(0)
  const typed = needles.join(' ')
  useEffect(() => setCursor(0), [typed])
  const grid = useRef<HTMLDivElement>(null)
  const lineId = (key: string): string => `${id}-${key.replace(/[^A-Za-z0-9_-]/g, '-')}`
  const active = lines[Math.min(cursor, lines.length - 1)]

  useEffect(() => {
    if (!active) return
    document.getElementById(lineId(active.key))?.scrollIntoView({ block: 'nearest' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.key])

  const onKey = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      setCursor((c) => Math.min(lines.length - 1, Math.max(0, c + step)))
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setCursor(event.key === 'Home' ? 0 : lines.length - 1)
    } else if (event.key === 'Enter' && active?.opens) {
      event.preventDefault()
      openSheet(active.opens)
    }
  }

  return (
    <motion.section
      className="ft-whole"
      aria-labelledby={`${id}-title`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: move.enter }}
    >
      <div className="ft-whole__bar">
        <Button icon={ArrowLeftIcon} onClick={onClose}>
          Back to the boat
        </Button>
        <h2 className="ft-whole__title" id={`${id}-title`}>
          {list.title}
          <span className="ft-whole__count">
            {narrowed
              ? `${AU.format(narrowedTo)} of ${AU.format(list.total)}`
              : `${AU.format(list.made)} of ${AU.format(list.total)} offered on this boat`}
          </span>
        </h2>
        {narrowed ? (
          <Button intent="quiet" size="sm" icon={ListBulletsIcon} onClick={onWiden}>
            {`Show all ${AU.format(list.total)}`}
          </Button>
        ) : null}
        <span className="ft-whole__find">
          <Input
            type="search"
            icon={MagnifyingGlassIcon}
            aria-label={`Find in ${list.title}`}
            placeholder="A name or a code"
            value={words}
            onValueChange={(next) => {
              setWords(next)
              onFind(next)
            }}
          />
        </span>
      </div>

      {needles.length > 0 ? (
        <p className="ft-whole__found" role="status">
          {matched === 0
            ? `Nothing in ${list.title} is called that.`
            : `${AU.format(matched)} of ${AU.format(list.total)} ${matched === 1 ? 'carries' : 'carry'} those words.`}
        </p>
      ) : null}

      <div
        ref={grid}
        className="ft-list"
        data-ground="plate"
        role="grid"
        tabIndex={0}
        aria-label={`${list.title}, every one, grouped by why`}
        aria-activedescendant={active ? lineId(active.key) : undefined}
        onKeyDown={onKey}
      >
        {groups.map((g) => (
          <div
            key={g.id}
            role="rowgroup"
            className="ft-group"
            data-made={g.id === 'made' ? '' : undefined}
          >
            <div role="row" className="ft-group__head">
              <span role="columnheader" className="ft-group__say">
                <span className="ft-group__n">{AU.format(g.found.length)}</span>
                <span className="ft-group__why">
                  {g.head}
                  {g.note === '' ? null : <span className="ft-group__note"> {g.note}</span>}
                </span>
              </span>
            </div>
            {g.drawn.length === 0 ? (
              <div role="row" className="ft-group__empty">
                <span role="gridcell">Nothing on the price list is made for this boat here.</span>
              </div>
            ) : null}
            {g.drawn.map((row) => (
              <Line
                key={row.key}
                id={lineId(row.key)}
                row={row}
                current={active?.key === row.key}
                onPoint={() => setCursor(lines.indexOf(row))}
                href={row.opens ? sheetHref(row.opens) : null}
                onOpen={() => {
                  setCursor(lines.indexOf(row))
                  if (row.opens) openSheet(row.opens)
                }}
              />
            ))}
            {g.more > 0 ? (
              <div role="row" className="ft-group__more">
                <span role="gridcell">
                  {AU.format(g.more)} more here. Type a name or a code to find one.
                </span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {list.held === '' ? null : <p className="ft-whole__held">{list.held}</p>}
    </motion.section>
  )
}

function Line({
  id,
  row,
  current,
  href,
  onOpen,
  onPoint,
}: {
  id: string
  row: WholeRow
  current: boolean
  href: string | null
  onOpen: () => void
  /** a press anywhere on the line makes it the grid's own line */
  onPoint: () => void
}) {
  return (
    <div
      role="row"
      id={id}
      className="ft-line"
      data-current={current ? '' : undefined}
      aria-selected={current}
      onClick={onPoint}
    >
      <span role="gridcell" className="ft-line__name">
        {row.starred ? (
          <span className="ft-line__star" aria-label="Recommended">
            <Icon glyph={StarIcon} weight="fill" size="sm" />
          </span>
        ) : null}
        <span className="ft-line__said">{row.name}</span>
        {row.crosses ? <span className="ft-line__tag">On a new quote</span> : null}
        {row.rule && row.rule.because !== '' ? (
          <span className="ft-line__rule">{row.rule.because}</span>
        ) : null}
      </span>
      <span role="gridcell" className="ft-line__facts">
        {row.facts}
      </span>
      <span role="gridcell" className="ft-line__price">
        {row.price === null ? null : <PriceFigure amount={row.price} />}
      </span>
      <span role="gridcell" className="ft-line__open">
        {href && current ? (
          <Button
            intent="quiet"
            size="sm"
            href={href}
            icon={ArrowUpRightIcon}
            tabIndex={-1}
            aria-label={`See ${row.name} on the price list`}
            onClick={onOpen}
          >
            On the price list
          </Button>
        ) : null}
      </span>
    </div>
  )
}
