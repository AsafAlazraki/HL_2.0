import {
  useEffect,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { ArrowRightIcon, CheckIcon } from '@phosphor-icons/react'
import { Button, Icon } from '@/ui'
import { CHECK_WORDS } from '@/screens/review/read'
import { CASE_KINDS } from '@/domain/rules/review/cases'
import { PRICE_LIST_ROOMS, pricesOf } from '@/app/ways'
import { glyphOfWay } from '@/screens/shell/glyphs'
import { whenSaid } from '@/screens/shelf/read'
import type { FileFacts } from './facts'
import { packedOn } from './file'

/* ============================================================
   THE PRICE FILE'S STATE, ABOVE ITS INVENTORY — direction A, "The
   Monday list" (docs/directions/data-round/data/boards/a.html, picked
   by three judges 2026-11-03).

   NEEDS NORTHSIDE is a checklist after GitHub Insights' Community
   standards: one line per kind of work the price file is waiting on
   Northside for, each with its figure, the numerator and denominator
   that figure is out of, and a door to the room where it is done. An
   item whose figure is nothing turns to a tick and says what is true.
   Every figure is the room's own reader's (`./facts.ts`).

   NEW SINCE THE PACKING says the zero as a figure (Wikipedia's Page
   information: "Recent number of edits: 0"), counts the lines written
   on this computer by list, each a door to its sheet, and says what
   Shelf keeps: the last copy of Northside's work.

   THE ROOMS are six counted doors, each with the figure its own reader
   counts, in the order the one list of rooms gives them
   (`PRICE_LIST_ROOMS`).
   ============================================================ */

const n = (value: number): string => value.toLocaleString('en-AU')
const plural = (count: number, one: string, many: string): string =>
  `${n(count)} ${count === 1 ? one : many}`

export interface Need {
  id: 'review' | 'prices' | 'dated' | 'unnamed' | 'rules' | 'loaded'
  done: boolean
  /** the figure, or null while it is still being counted */
  fig: number | null
  say: string
  sub?: ReactNode
  extra?: ReactNode
  /** what the figure is out of */
  of: string
  door?: { word: string; href?: string; press?: () => void }
}

export interface NeedsSeams {
  /** a list's spread on this screen */
  openSpread: (tableId: string) => void
  /** a list's sheet, at one heading */
  openSheet: (tableId: string, heading?: string) => void
  openTheFile?: () => void
}

/** THE CHECKLIST, IN THE ORDER IT COSTS NORTHSIDE: money first. */
export function needsOf(facts: FileFacts, seams: NeedsSeams): Need[] {
  const lines = facts.register.head.rows
  const out: Need[] = []
  const r = facts.review
  out.push(
    r === null
      ? {
          id: 'review',
          done: false,
          fig: null,
          say: 'Counting what is wrong in the price list…',
          of: '',
        }
      : r.cases === 0
        ? {
            id: 'review',
            done: true,
            fig: 0,
            say: 'cases to settle: nothing is wrong in the price list',
            of: `of ${n(lines)} lines read`,
            door: { word: 'Review', href: '/review' },
          }
        : {
            id: 'review',
            done: false,
            fig: r.cases,
            say: `${r.cases === 1 ? 'case' : 'cases'} to settle in the price list, the most money first`,
            sub: (
              <>
                {CASE_KINDS.filter((k) => r.byKind[k] > 0)
                  .map((k) => `${n(r.byKind[k])} ${CHECK_WORDS[k].chip.toLowerCase()}`)
                  .join(' · ')}
                {r.tidy > 0 ? `. Then ${n(r.tidy)} to tidy, none of them a price.` : '.'}
              </>
            ),
            of: `on ${plural(r.lines, 'line', 'lines')} of ${n(lines)}`,
            door: { word: 'Settle them', href: '/review' },
          },
  )

  const p = facts.prices
  out.push(
    p.open.length === 0
      ? {
          id: 'prices',
          done: true,
          fig: 0,
          say: 'answers about price are left to give: the price list says how every list prices',
          of: `${n(p.settled)} settled by the price list`,
          door: { word: 'Prices', href: '/levels' },
        }
      : {
          id: 'prices',
          done: false,
          fig: p.open.length,
          say: `${p.open.length === 1 ? 'answer' : 'answers'} about price only Northside can give`,
          sub: `They decide how ${plural(p.openLines, 'line prices', 'lines price')}: ${p.open
            .map((c) => `${c.name} ${n(c.lines)}`)
            .join(' · ')}.`,
          of: `${n(p.openLines)} of ${n(lines)} lines`,
          door: { word: 'Choose', href: pricesOf(p.open[0]!.id) },
        },
  )

  const d = facts.dated
  const oldest = d.sections[0]
  if (oldest) {
    const first = d.byYear[0]!
    out.push({
      id: 'dated',
      done: false,
      fig: d.sections.length,
      say:
        d.sections.length === 1
          ? 'section says in its heading the date it was priced'
          : 'sections say in their heading the date they were priced',
      sub: (
        <>
          The oldest, <q className="dt-need__q">{oldest.heading}</q> in {oldest.tableName}, says{' '}
          <span className="dt-nw">{packedOn(oldest.on, 'long')}</span>.{' '}
          {`${plural(first.sections, 'heading says', 'headings say')} ${first.year}, over ${plural(first.lines, 'line', 'lines')}.`}
        </>
      ),
      extra: <Years facts={facts} />,
      of: `of ${n(d.headingsInThose)} headings in the ${plural(d.lists.length, 'list', 'lists')} that date any`,
      door: { word: 'Oldest first', press: () => seams.openSheet(oldest.tableId, oldest.heading) },
    })
  }

  const u = facts.unnamed
  const sellable = facts.sellFrom.length
  const uLines = u.reduce((s, row) => s + row.rows, 0)
  const largest = u.toSorted((a, b) => b.rows - a.rows)[0]
  out.push(
    largest === undefined
      ? {
          id: 'unnamed',
          done: true,
          fig: 0,
          say: 'lists you sell from are left out: a list of what fits names every one',
          of: `of ${n(sellable)} lists you sell from`,
        }
      : {
          id: 'unnamed',
          done: false,
          fig: uLines,
          say: `${uLines === 1 ? 'line sits' : 'lines sit'} in ${plural(u.length, 'list', 'lists')} no list of what fits names`,
          sub: `${u.map((row) => `${row.name} ${n(row.rows)}`).join(' · ')}. No boat on the price list is fitted with them.`,
          of: `in ${n(u.length)} of the ${n(sellable)} lists you sell from`,
          door: { word: 'Largest first', press: () => seams.openSpread(largest.id) },
        },
  )

  const ru = facts.rules
  out.push(
    ru.noticed === 0
      ? {
          id: 'rules',
          done: true,
          fig: 0,
          say: 'rules are noticed in the price list and left unwritten',
          of: `${n(ru.written)} written by Northside`,
          door: { word: 'Rules', href: '/rules' },
        }
      : {
          id: 'rules',
          done: false,
          fig: ru.noticed,
          say: `${ru.noticed === 1 ? 'rule is' : 'rules are'} noticed in the price list, and not written`,
          sub: `Your price list keeps ${n(ru.kept)} on its own. ${
            ru.written === 0 ? 'Northside has written none' : `Northside has written ${n(ru.written)}`
          }, and a noticed one is not a rule until it is.`,
          of: `${n(ru.written)} written by Northside`,
          door: { word: 'Read them', href: '/rules' },
        },
  )

  const l = facts.loaded
  if (l.expected !== null) {
    const all = l.lists >= l.expected
    out.push(
      all
        ? {
            id: 'loaded',
            done: true,
            fig: l.lists,
            say: `lists of ${n(l.expected)} are on this computer, read in full`,
            of: 'nothing left to load',
          }
        : {
            id: 'loaded',
            done: false,
            fig: l.expected - l.lists,
            say: `of the price list’s ${n(l.expected)} lists did not load on this computer`,
            of: `${n(l.lists)} of ${n(l.expected)} here`,
            ...(seams.openTheFile
              ? { door: { word: 'Load the Master Price File', press: seams.openTheFile } }
              : {}),
          },
    )
  }
  return out
}

/* ---------------------------------------------------------- */

function Years({ facts }: { facts: FileFacts }) {
  const most = Math.max(...facts.dated.byYear.map((y) => y.sections))
  return (
    <ol
      className="dt-years"
      aria-label={`The ${n(facts.dated.sections.length)} dated headings by the year they say`}
    >
      {facts.dated.byYear.map((y) => (
        <li key={y.year} style={{ '--share': y.sections / most } as CSSProperties}>
          <span className="dt-years__bar" aria-hidden="true" />
          <span className="dt-years__y">{y.year}</span>
          <span className="dt-years__n">
            {n(y.sections)} · {plural(y.lines, 'line', 'lines')}
          </span>
        </li>
      ))}
    </ol>
  )
}

/** A door that is a link the router follows, or a press on this screen. */
function Door({
  door,
  go,
  label,
}: {
  door: NonNullable<Need['door']>
  go?: (href: string) => void
  label?: string
}) {
  const href = door.href
  return (
    <Button
      intent="quiet"
      size="sm"
      icon={ArrowRightIcon}
      href={href}
      aria-label={label}
      onClick={
        href !== undefined
          ? go
            ? (event: MouseEvent) => {
                event.preventDefault()
                go(href)
              }
            : undefined
          : door.press
      }
    >
      {door.word}
    </Button>
  )
}

/**
 * IN A HAND THE FIRST WINDOW ENDS ON A SEAM BETWEEN TWO NEEDS, never through one (refine-
 * critique.md, major 5, kept for this composition: a line half over the tab bar and half under
 * it is what the owner sees until the page moves). Each need above the seam takes the same air at
 * its foot — never more than `FOLD_AIR_MOST` — so the last whole need's border lands
 * `FOLD_GAP` above the bar's room, its own words a padding's height above that, and the next
 * need's first words under the bar (measured at 390 × 844 on 2026-11-03: a 12px gap left the
 * next need's figure at 785–815 across a bar edge at 790). Measured, not typed: the needs' own places on the
 * page with the air already given taken away, and the bar's room read off the list's
 * `scroll-margin-block-end`, which is `--shell-foot` (data.css) and 0 wherever the bar is not
 * at the foot. Where no seam is in reach, the needs keep the stylesheet's own padding.
 */
const FOLD_GAP = 2
const FOLD_AIR_MOST = 40
function useFoldAir(list: RefObject<HTMLOListElement | null>, items: number): void {
  useEffect(() => {
    const ol = list.current
    if (!ol || items === 0 || typeof ResizeObserver === 'undefined') return
    let given = 0
    let last = ''
    const fit = (): void => {
      const foot = Number.parseFloat(getComputedStyle(ol).scrollMarginBlockEnd) || 0
      let best: number | null = null
      if (foot > 0) {
        const fold = window.innerHeight - foot - FOLD_GAP
        const lis = [...ol.children] as HTMLElement[]
        for (const [k, li] of lis.entries()) {
          const bottom = li.getBoundingClientRect().bottom + window.scrollY - (k + 1) * given
          const air = Math.floor((fold - bottom) / (k + 1))
          if (air >= 0 && air <= FOLD_AIR_MOST) best = air
        }
      }
      const said = best === null ? '' : `${best}px`
      if (said === last) return
      last = said
      given = best ?? 0
      if (said === '') ol.style.removeProperty('--fold-air')
      else ol.style.setProperty('--fold-air', said)
    }
    fit()
    const watch = new ResizeObserver(fit)
    watch.observe(ol)
    window.addEventListener('resize', fit)
    return () => {
      watch.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [list, items])
}

export function Needs({ needs, go }: { needs: Need[]; go?: (href: string) => void }) {
  const list = useRef<HTMLOListElement>(null)
  useFoldAir(list, needs.length)
  const open = needs.filter((x) => !x.done).length
  const done = needs.length - open
  return (
    <section className="dt-needs" data-ground="plate" aria-labelledby="dt-needs-h" data-testid="data-needs">
      <header className="dt-sec-head">
        <h2 id="dt-needs-h">Needs Northside</h2>
        <p className="dt-sec-count">
          <b>{n(open)}</b> open · <b>{n(done)}</b> done
        </p>
      </header>
      <ol className="dt-needs__list" ref={list}>
        {needs.map((x) => (
          <li
            key={x.id}
            className="dt-need"
            data-need={x.id}
            data-done={x.done ? '' : undefined}
            data-counting={x.fig === null ? '' : undefined}
          >
            <p className="dt-need__fig">
              <span className="dt-need__dot" aria-hidden="true">
                {x.done ? <Icon glyph={CheckIcon} weight="bold" /> : null}
              </span>
              {x.fig === null ? null : <b>{n(x.fig)}</b>}
              {x.done ? <span className="dt-sr">, done:</span> : null}
            </p>
            <div className="dt-need__words">
              <p className="dt-need__say">{x.say}</p>
              {x.sub ? <p className="dt-need__sub">{x.sub}</p> : null}
              {x.extra}
            </div>
            <p className="dt-need__of">{x.of}</p>
            <span className="dt-need__door">
              {x.door ? <Door door={x.door} go={go} /> : null}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ---------------------------------------------------------- */

export function Fresh({
  facts,
  openSheet,
  openSpread,
  go,
}: {
  facts: FileFacts
  openSheet: (tableId: string) => void
  openSpread: (tableId: string) => void
  go?: (href: string) => void
}) {
  const c = facts.changed
  const packed = facts.provenance.known ? facts.provenance.file.packedAt : null
  const lines = facts.register.head.rows
  const shelf = { word: 'Shelf', href: '/shelf' }
  return (
    <section className="dt-fresh" data-ground="plate" aria-labelledby="dt-fresh-h" data-testid="data-new">
      <header className="dt-sec-head">
        <h2 id="dt-fresh-h">{packed ? `New since ${packedOn(packed, 'long')}` : 'New on this computer'}</h2>
      </header>
      {c ? (
        <p className="dt-zero">
          <b>{n(c.lines)}</b>
          <span>
            {c.lines === 1 ? 'line' : 'lines'} changed on this computer, of {n(lines)}
          </span>
        </p>
      ) : (
        <p className="dt-fresh__say">
          This price list is not the one the app was shipped with, so nothing can be told new
          against it.
        </p>
      )}
      {c && c.byList.length > 0 ? (
        <ul className="dt-fresh__lists" aria-label="Changed, by list">
          {c.byList.map((l) => (
            <li key={l.tableId}>
              <button type="button" className="dt-fresh__list" onClick={() => openSheet(l.tableId)}>
                <span>{l.tableName}</span>
                <b>{n(l.lines)}</b>
                <span className="dt-fresh__go" aria-hidden="true">
                  <Icon glyph={ArrowRightIcon} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <dl className="dt-fresh__facts">
        <div>
          <dt>Lists made here</dt>
          <dd>
            {facts.madeHere.length === 0 ? (
              <b>0</b>
            ) : (
              <span className="dt-fresh__made">
                {facts.madeHere.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    className="dt-fresh__name"
                    onClick={() => openSpread(row.id)}
                  >
                    {row.name}
                  </button>
                ))}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt>A copy of Northside’s work</dt>
          <dd>
            <span>{facts.lastCopy ? `Saved ${whenSaid(facts.lastCopy, new Date())}` : 'None saved'}</span>
            <Door door={shelf} go={go} label="A copy of Northside’s work: on Shelf" />
          </dd>
        </div>
        <div>
          <dt>A new price list</dt>
          <dd>
            <span>Its changes count above</span>
            <Door door={shelf} go={go} label="A new price list: brought in on Shelf" />
          </dd>
        </div>
      </dl>
    </section>
  )
}

/* ---------------------------------------------------------- */

interface RoomSay {
  fig: ReactNode
  sub: string
  testId?: string
  label: string
}

function roomSay(href: string, facts: FileFacts): RoomSay | null {
  switch (href) {
    case '/review': {
      const r = facts.review
      if (r === null) return { fig: 'Counting…', sub: 'what is wrong in the price list', label: 'Review — counting' }
      return r.cases === 0
        ? { fig: 'Nothing to settle', sub: `${n(r.tidy)} to tidy`, label: 'Review — nothing is wrong in your price list' }
        : {
            fig: (
              <>
                <b>{n(r.cases)}</b> to settle
              </>
            ),
            sub: r.tidy > 0 ? `then ${n(r.tidy)} to tidy` : 'nothing to tidy after them',
            testId: 'data-wrong',
            label: `Review — ${plural(r.cases, 'case', 'cases')} to settle in your price list`,
          }
    }
    case '/levels': {
      const p = facts.prices
      return {
        fig: (
          <>
            <b>{n(p.open.length)}</b> to choose
          </>
        ),
        sub: `${n(p.settled)} settled by the price list`,
        label: `Prices — ${n(p.open.length)} to choose`,
      }
    }
    case '/rules': {
      const r = facts.rules
      return {
        fig: (
          <>
            <b>{n(r.kept)}</b> kept by the price list
          </>
        ),
        sub: `${n(r.written)} written · ${n(r.noticed)} noticed`,
        label: `Rules — ${n(r.kept)} kept by the price list`,
      }
    }
    case '/fitment': {
      const b = facts.boats
      return {
        fig: (
          <>
            <b>{n(b.models)}</b> models
          </>
        ),
        sub: `from ${plural(b.makers, 'maker', 'makers')}, ${plural(facts.matrix.lists, 'list', 'lists')} of what fits`,
        label: `Fitment — ${n(b.models)} models`,
      }
    }
    case '/catalogue': {
      const c = facts.catalogue
      return {
        fig: (
          <>
            <b>{n(c.onSale)}</b> parts on sale
          </>
        ),
        sub: `in ${n(c.aisles)} aisles · ${n(c.pictured)} pictured`,
        label: `Catalogue — ${n(c.onSale)} parts on sale`,
      }
    }
    case '/shelf':
      return {
        fig: facts.lastCopy ? (
          <>Copy saved {whenSaid(facts.lastCopy, new Date())}</>
        ) : (
          <>
            <b>No</b> copy saved yet
          </>
        ),
        sub: 'a new price list comes in here',
        label: facts.lastCopy ? 'Shelf — a copy is saved' : 'Shelf — no copy saved yet',
      }
    default:
      return null
  }
}

export function Rooms({ facts, go }: { facts: FileFacts; go?: (href: string) => void }) {
  return (
    <nav className="dt-rooms" aria-labelledby="dt-rooms-h">
      <h2 className="dt-eyebrow" id="dt-rooms-h">
        The rooms of the price list
      </h2>
      <ul className="dt-rooms__list">
        {PRICE_LIST_ROOMS.map((room) => {
          const glyph = glyphOfWay(room.href)
          const said = roomSay(room.href, facts)
          return (
            <li key={room.href}>
              <a
                className="dt-room"
                href={room.href}
                aria-label={said?.label ?? room.word}
                title={room.say}
                data-ground="plate"
                onClick={
                  go
                    ? (event) => {
                        if (event.metaKey || event.ctrlKey || event.shiftKey) return
                        event.preventDefault()
                        go(room.href)
                      }
                    : undefined
                }
              >
                <span className="dt-room__glyph" aria-hidden="true">
                  {glyph ? <Icon glyph={glyph} /> : null}
                </span>
                <span className="dt-room__name">{room.word}</span>
                {said ? (
                  <>
                    <span className="dt-room__fig" data-testid={said.testId}>
                      {said.fig}
                    </span>
                    <span className="dt-room__sub">{said.sub}</span>
                  </>
                ) : null}
                <span className="dt-room__go" aria-hidden="true">
                  <Icon glyph={ArrowRightIcon} />
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
