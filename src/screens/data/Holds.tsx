/* ============================================================
   TWO LINT RULES TURNED OFF FOR THIS FILE, for the reasons the quotes
   register gives in `src/screens/quotes/Quotes.tsx`: the ledger of
   lists is an APG grid with ONE tab stop (`aria-activedescendant`),
   whose rows are divs laid out as CSS grids, not `<tr>`s.
   ============================================================ */
/* eslint-disable jsx-a11y/prefer-tag-over-role, jsx-a11y/click-events-have-key-events */
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent, ReactNode, Ref } from 'react'
import { ArrowRightIcon, BoatIcon, PlusIcon } from '@phosphor-icons/react'
import { Button, Icon, KindMark } from '@/ui'
import { kindWord, type Plate, type RegisterRow } from '@/domain/modules/register'
import type { FitsMatrix } from '@/domain/modules/fitsMatrix'
import { markFor } from '@/screens/home/ledgers'
import type { FileFacts } from './facts'
import { markName } from './turn'

/* ============================================================
   WHAT THE FILE HOLDS — under the state, the inventory: the makers as
   eight tiles (the eighth is every maker, on Fitment, so no slot is
   ever empty), the lists you sell from as a ledger in their groups,
   and the 28 lists of what fits which boat as one table of maker
   against kind (board C's matrix, grafted onto direction A).
   ============================================================ */

const n = (value: number): string => value.toLocaleString('en-AU')
const plural = (count: number, one: string, many: string): string =>
  `${n(count)} ${count === 1 ? one : many}`

/** One id per row, so `aria-activedescendant` names the row a reader is on. */
export const rowId = (tableId: string): string => `dt-row-${tableId}`
const tileId = (tableId: string): string => `dt-tile-${tableId}`

/** A click a pointer made: a key's click has a `detail` of 0. */
export const byPointer = (event: { detail: number }): boolean => event.detail > 0

/** What a maker holds, as Home and the picker count it: its models, in the series the file
 *  cuts them into. A list whose lines are its models already says so. */
export function holdsSay(plate: Plate, models: number | undefined): string {
  if (models === undefined || models === 0 || models === plate.rows) return plate.holds
  const said = `${n(models)} ${models === 1 ? 'model' : 'models'}`
  return plate.branchSay ? `${said} ${plate.branchSay}` : said
}

/** A maker's mark from the ledger, or its name set in type: never a stand-in. */
function Mark({
  name,
  id,
  flies,
  alt = '',
}: {
  name: string
  id: string
  flies: boolean
  alt?: string
}) {
  const choice = markFor(name, 'paper')
  return choice.drawn ? (
    <img
      className="dt-mark__img"
      src={choice.mark.src}
      alt={alt}
      width={choice.mark.width}
      height={choice.mark.height}
      decoding="async"
      /* the mark the sheet's masthead carries under the same name, so it travels there */
      style={flies ? { viewTransitionName: markName(id) } : undefined}
    />
  ) : (
    <span className="dt-mark__typed">{name}</span>
  )
}

/* ---------------------------------------------------------- */
/* The makers                                                  */
/* ---------------------------------------------------------- */

export function Makers({
  plates,
  facts,
  open,
  tabAt,
  onTab,
  onPress,
  every,
  go,
}: {
  plates: readonly Plate[]
  facts: FileFacts
  /** the maker whose spread is open, or '' */
  open: string
  tabAt: string
  onTab: (id: string) => void
  onPress: (tableId: string, pointer: boolean) => void
  /** whether the eighth tile, every maker, is drawn */
  every: boolean
  go?: (href: string) => void
}) {
  const stop = tabAt !== '' && plates.some((p) => tileId(p.id) === tabAt) ? tabAt : tileId(plates[0]?.id ?? '')
  /* THE TILES ARE ONE TAB STOP: ← → move between makers, Home and End to the ends */
  const onKey = (event: ReactKeyboardEvent<HTMLUListElement>): void => {
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End']
    if (!keys.includes(event.key) || event.metaKey || event.ctrlKey || event.altKey) return
    const items = [...event.currentTarget.querySelectorAll<HTMLElement>('[data-tile]')]
    const at = items.findIndex((el) => el === document.activeElement)
    if (at < 0) return
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : event.key === 'ArrowRight' || event.key === 'ArrowDown'
            ? Math.min(items.length - 1, at + 1)
            : Math.max(0, at - 1)
    event.preventDefault()
    items[next]?.focus()
  }
  const lines = facts.matrix.lines
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <ul
      className="dt-makers"
      aria-label="The boat makers"
      data-testid="data-shelf"
      onKeyDown={onKey}
      onFocus={(event) => {
        const el = event.target
        if (el instanceof HTMLElement && el.dataset['tile'] !== undefined) onTab(el.id)
      }}
    >
      {plates.map((plate) => {
        const holds = holdsSay(plate, facts.models.get(plate.id))
        const on = open === plate.id
        return (
          <li key={plate.id} data-testid="plate">
            <button
              type="button"
              className="dt-maker"
              id={tileId(plate.id)}
              data-tile=""
              data-ground="plate"
              data-on={on ? '' : undefined}
              tabIndex={stop === tileId(plate.id) ? 0 : -1}
              aria-label={`${plate.name} · ${holds}`}
              aria-pressed={on}
              onClick={(event) => onPress(plate.id, byPointer(event))}
            >
              <span className="dt-mark">
                <Mark name={plate.name} id={plate.id} flies={true} />
              </span>
              <span className="dt-maker__a">
                {holds}
                {plate.retired ? ' · no longer sold' : ''}
              </span>
              <span className="dt-maker__b">
                {plate.pairings.length > 0 ? (
                  <>
                    <span>{`${plural(plate.pairings.length, 'list', 'lists')} of what fits`}</span>
                    <span>{plural(plate.pairingRows, 'line', 'lines')}</span>
                  </>
                ) : (
                  'Nothing goes with it yet'
                )}
              </span>
            </button>
          </li>
        )
      })}
      {every ? (
        <li>
          <a
            className="dt-maker dt-maker--every"
            href="/fitment"
            id="dt-tile-every"
            data-tile=""
            data-ground="plate"
            tabIndex={stop === 'dt-tile-every' ? 0 : -1}
            aria-label={`Every maker · ${n(facts.boats.models)} models, on Fitment`}
            onClick={
              go
                ? (event: MouseEvent) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey) return
                    event.preventDefault()
                    go('/fitment')
                  }
                : undefined
            }
          >
            <span className="dt-mark dt-mark--every">
              <KindMark kind="boat" size="sm" />
              <span>Every maker</span>
            </span>
            <span className="dt-maker__a">
              {`${plural(facts.boats.models, 'model', 'models')} · ${plural(facts.boats.lines, 'line', 'lines')}`}
            </span>
            <span className="dt-maker__b">
              <span>{`${plural(facts.matrix.lists, 'list', 'lists')} of what fits`}</span>
              <span>{plural(lines, 'line', 'lines')}</span>
            </span>
          </a>
        </li>
      ) : null}
    </ul>
  )
}

/* ---------------------------------------------------------- */
/* The lists you sell from                                     */
/* ---------------------------------------------------------- */

interface Group {
  placeId: string
  place: string
  rows: RegisterRow[]
}

function groupsOf(rows: readonly RegisterRow[]): Group[] {
  const out: Group[] = []
  for (const row of rows) {
    const last = out[out.length - 1]
    if (last && last.placeId === row.placeId) last.rows.push(row)
    else out.push({ placeId: row.placeId, place: row.place, rows: [row] })
  }
  return out
}

/** WHAT A LIST FITS, in the dealer's words. A list no boat names says so: "named by no boat"
 *  for a thing that can be fitted, "not tied to a boat" for rates and costs. */
export function fitsSay(boats: number, kind: RegisterRow['kind']): string {
  if (boats === 0) return kind === 'custom' ? 'not tied to a boat' : 'named by no boat'
  return `fits ${n(boats)} ${boats === 1 ? 'boat' : 'boats'}`
}

/** WHAT STANDS ON A LIST, for the wide row's last column and its spread: its Review cases, its
 *  dated headings and its lines changed on this computer. Empty when nothing does. */
export function standsSay(facts: FileFacts, tableId: string): string[] {
  const out: string[] = []
  const cases = facts.review?.byList.get(tableId) ?? 0
  if (cases > 0) out.push(`${n(cases)} to settle`)
  const dated = facts.datedByList.get(tableId) ?? 0
  if (dated > 0) out.push(`${n(dated)} dated ${dated === 1 ? 'heading' : 'headings'}`)
  const changed = facts.changed?.byList.find((l) => l.tableId === tableId)?.lines ?? 0
  if (changed > 0) out.push(`${n(changed)} changed here`)
  return out
}

export function Lists({
  rows,
  count,
  facts,
  cursor,
  open,
  listRef,
  holdRow,
  onKeyDown,
  onPoint,
  onOpen,
  onMake,
  head,
}: {
  rows: readonly RegisterRow[]
  /** the lists you sell from, the title's figure */
  count: number
  facts: FileFacts
  cursor: string
  /** the list whose spread is open */
  open: string
  listRef: Ref<HTMLDivElement>
  holdRow: (id: string, element: HTMLDivElement | null) => void
  onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void
  onPoint: (id: string) => void
  onOpen: (id: string) => void
  onMake?: () => void
  head?: ReactNode
}) {
  const lines = facts.sellFrom.reduce((s, r) => s + r.rows, 0)
  const at = rows.find((r) => r.id === cursor)
  return (
    <section className="dt-ledger" data-ground="plate" aria-labelledby="dt-lists-h">
      <header className="dt-ledger__head">
        <h3 id="dt-lists-h">{`${plural(count, 'list', 'lists')} you sell from`}</h3>
        <p>{plural(lines, 'line', 'lines')}</p>
        {onMake ? (
          <span className="dt-ledger__act">
            <Button intent="quiet" size="sm" icon={PlusIcon} onClick={onMake}>
              New list
            </Button>
          </span>
        ) : null}
      </header>
      {head}
      <div
        className="dt-list"
        ref={listRef}
        role="grid"
        tabIndex={0}
        aria-label="Lists"
        aria-rowcount={rows.length}
        aria-activedescendant={at ? rowId(at.id) : undefined}
        onKeyDown={onKeyDown}
      >
        {groupsOf(rows).map((group) => (
          <div className="dt-group" role="rowgroup" aria-label={group.place} key={group.placeId}>
            <p className="dt-group__head" aria-hidden="true">
              {group.place}
            </p>
            {group.rows.map((row) => (
              <Row
                key={row.id}
                row={row}
                on={row.id === cursor}
                peeking={row.id === open}
                stands={standsSay(facts, row.id)}
                onPoint={onPoint}
                onOpen={onOpen}
                hold={holdRow}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

function Row({
  row,
  on,
  peeking,
  stands,
  onPoint,
  onOpen,
  hold,
}: {
  row: RegisterRow
  on: boolean
  peeking: boolean
  stands: string[]
  onPoint: (id: string) => void
  onOpen: (id: string) => void
  hold: (id: string, element: HTMLDivElement | null) => void
}) {
  const unnamed = !row.retired && row.namedBy.models === 0 && row.kind !== 'custom'
  return (
    <div
      className="dt-row"
      role="row"
      id={rowId(row.id)}
      ref={(element) => {
        hold(row.id, element)
      }}
      data-on={on ? '' : undefined}
      data-peeking={peeking ? '' : undefined}
      data-retired={row.retired ? '' : undefined}
      aria-selected={on}
      onClick={() => onPoint(row.id)}
      onDoubleClick={() => onOpen(row.id)}
    >
      <span className="dt-cell dt-cell--kind" role="gridcell">
        <KindMark kind={row.kind} size="sm" />
      </span>
      <span className="dt-cell dt-cell--name" role="gridcell">
        <span className="dt-name">{row.name}</span>
      </span>
      <span className="dt-cell dt-cell--holds" role="gridcell">
        <b>{row.leafSay.split(' ')[0]}</b>
        {row.leafSay.slice(row.leafSay.indexOf(' '))}
        {row.branchSay ? ` ${row.branchSay}` : ''}
      </span>
      <span className="dt-cell dt-cell--fits" role="gridcell" data-zero={unnamed ? '' : undefined}>
        {row.retired ? 'no longer sold' : fitsSay(row.namedBy.models, row.kind)}
      </span>
      <span className="dt-cell dt-cell--stands" role="gridcell">
        {stands.length > 0 ? <span className="dt-stands">{stands.join(' · ')}</span> : null}
      </span>
      <span className="dt-cell dt-cell--go" role="gridcell" aria-hidden="true">
        <Icon glyph={ArrowRightIcon} />
      </span>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* The lists of what fits which boat                           */
/* ---------------------------------------------------------- */

export function Matrix({
  matrix,
  onOpen,
}: {
  matrix: FitsMatrix
  onOpen: (joinId: string) => void
}) {
  return (
    <section className="dt-matrix" data-ground="plate" aria-labelledby="dt-matrix-h">
      <header className="dt-ledger__head">
        <h3 id="dt-matrix-h">{`${plural(matrix.lists, 'list', 'lists')} of what fits which boat`}</h3>
        <p>{plural(matrix.lines, 'line', 'lines')}</p>
      </header>
      <table className="dt-matrix__table">
        <thead>
          <tr>
            <th scope="col">Maker</th>
            {matrix.columns.map((kind) => (
              <th scope="col" key={kind}>
                <span className="dt-matrix__col">
                  <KindMark kind={kind} size="sm" />
                  <span>{kindWord(kind)}</span>
                </span>
              </th>
            ))}
            <th scope="col" className="dt-matrix__n">
              Lines
            </th>
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">
                <span className="dt-mark dt-mark--sm">
                  <Mark name={row.name} id={row.id} flies={false} alt={row.name} />
                </span>
                <span className="dt-matrix__lists">{plural(row.lists, 'list', 'lists')}</span>
              </th>
              {row.cells.map((cell, i) => (
                <td
                  key={matrix.columns[i]}
                  data-col={kindWord(matrix.columns[i]!)}
                  data-none={cell.length === 0 ? '' : undefined}
                >
                  {cell.length === 0 ? (
                    <span className="dt-matrix__none" aria-label="no list">
                      ·
                    </span>
                  ) : (
                    cell.map((c) => (
                      <button
                        key={c.joinId}
                        type="button"
                        className="dt-pair"
                        data-retired={c.retired ? '' : undefined}
                        aria-label={`${row.name} with ${c.said}: ${plural(c.lines, 'line', 'lines')}${c.retired ? ', no longer sold' : ''}`}
                        onClick={() => onOpen(c.joinId)}
                      >
                        <b>{n(c.lines)}</b>
                        <span>{c.said}</span>
                      </button>
                    ))
                  )}
                </td>
              ))}
              <td className="dt-matrix__n" data-col="Lines">
                <b>{n(row.lines)}</b>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="dt-matrix__say">
        <span className="dt-matrix__glyph" aria-hidden="true">
          <Icon glyph={BoatIcon} />
        </span>
        Each figure is the lines in one list, and opens it. A dot is no list of that kind.
      </p>
    </section>
  )
}
