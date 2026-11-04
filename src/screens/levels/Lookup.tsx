import { useMemo, useState } from 'react'
import {
  ArrowSquareOutIcon,
  LockSimpleIcon,
  MagnifyingGlassIcon,
  TableIcon,
  XIcon,
} from '@phosphor-icons/react'
import { Button, Icon, Input, Tile } from '@/ui'
import { money } from '@/domain/money'
import { buyersOf, searchLines, type BuyerPrice } from '@/domain/pricing/buyers'
import { GroupHead, Joints, LinePicture } from './bits'
import { lineEntries, sampleOf, type Column, type Sheet } from './read'

/* ============================================================
   EACH BUYER'S PRICE FOR ONE LINE — the look-up the salesperson asks
   most at the desk, "what does a trade buyer pay for this?" (the judge
   of Prices, 2026-11-04, L4 and S2). A line is found by its name or its
   code, as the build names it; chosen, its price for a customer, a
   trade buyer, a warranty job, fitted and a sub-dealer stands with the
   column and the workbook cell each is read from, read exactly as a
   quote reads it (`src/domain/pricing/buyers.ts`).

   THE LINE CHOSEN IS A POSITION, so it is in the address (`?line=`,
   its list and its line) and a reload keeps it. What is being typed is
   not a position: it is the field's own.
   ============================================================ */

/** `line` in the address: the list and the line, one token. */
export const lineToken = (tableId: string, rowId: string): string => `${tableId}~${rowId}`

function readToken(token: string): { tableId: string; rowId: string } | null {
  const at = token.indexOf('~')
  if (at <= 0 || at === token.length - 1) return null
  return { tableId: token.slice(0, at), rowId: token.slice(at + 1) }
}

/** What a buyer's figure is, beside it, in words. */
function stateSaid(b: BuyerPrice, listName: string): string {
  switch (b.state) {
    case 'reads':
      return b.northsideOnly ? 'Northside’s own: a quote at it cannot be given yet' : ''
    case 'falls':
      return `The list has no Trade price, so a trade quote reads ${b.column}`
    case 'blank':
      return `No ${b.column} figure on this line, so a quote at it cannot price it`
    case 'unchosen':
      return `Northside has not chosen which figure prices ${listName}, so a quote prices it by hand`
    case 'said':
      return 'On the price list; a quote is priced for a customer or a trade buyer, never a sub-dealer'
  }
}

export function Lookup({
  sheet,
  columns,
  line,
  onLine,
  go,
  openList,
}: {
  sheet: Sheet
  columns: readonly Column[]
  /** the chosen line's token, or '' */
  line: string
  onLine: (line: string) => void
  go: (href: string) => void
  /** open a list's own prices on this page */
  openList: (columnId: string) => void
}) {
  const [typed, setTyped] = useState('')
  const entries = useMemo(() => lineEntries(sheet, columns), [sheet, columns])
  const search = useMemo(() => searchLines(entries, typed), [entries, typed])
  const found = search.lines
  const at = readToken(line)
  const table = at ? sheet.tables[at.tableId] : undefined
  const row = at && table ? sheet.rows[at.tableId]?.find((r) => r.id === at.rowId) : undefined
  const col = at ? columns.find((c) => c.tableIds.includes(at.tableId)) : undefined
  const chosen = table && row && col ? { table, row, col } : null
  const asking = typed.trim().length >= 2

  return (
    <section className="lv-group lv-find" aria-labelledby="lv-find">
      <GroupHead
        id="lv-find"
        title="Each buyer’s price"
        note="Any line on sale, by its name or its code"
      />
      <div className="lv-find__plate" data-ground="plate">
        <div className="lv-find__field">
          <span className="lv-find__word">Find a line</span>
          <Input
            type="search"
            value={typed}
            onValueChange={setTyped}
            icon={MagnifyingGlassIcon}
            placeholder="F90XB, 309 Skimma, a kit or a part"
            aria-label="Find a line by its name or its code"
            autoComplete="off"
          />
        </div>
        {asking ? (
          found.length > 0 ? (
            <>
              <ul className="lv-find__hits" aria-label="Lines found">
                {found.map((e) => (
                  <li key={`${e.tableId}~${e.rowId}`}>
                    <Tile
                      shape="row"
                      label={`${e.name}, ${e.list}${e.code !== '' ? `, ${e.code}` : ''}`}
                      onSelect={() => {
                        onLine(lineToken(e.tableId, e.rowId))
                        setTyped('')
                      }}
                    >
                      <span className="lv-hit">
                        <span className="lv-hit__name">{e.name}</span>
                        <span className="lv-hit__where">
                          {e.list}
                          {e.code !== '' && !e.name.includes(e.code) ? ` · ${e.code}` : ''}
                        </span>
                      </span>
                    </Tile>
                  </li>
                ))}
              </ul>
              {search.total > found.length ? (
                <p className="lv-find__more">
                  {`${found.length} of the ${search.total.toLocaleString('en-AU')} lines that answer, every list’s best first. Type more of the name, or the code, to narrow them.`}
                </p>
              ) : null}
            </>
          ) : (
            <output className="lv-find__none">
              Nothing on sale is called “{typed.trim()}”. A line is found by the name the build
              gives it or by its code.
            </output>
          )
        ) : null}
        {chosen && !asking ? (
          <Answer
            sheet={sheet}
            chosen={chosen}
            onClear={() => onLine('')}
            go={go}
            openList={openList}
          />
        ) : null}
      </div>
    </section>
  )
}

function Answer({
  sheet,
  chosen,
  onClear,
  go,
  openList,
}: {
  sheet: Sheet
  chosen: { table: Sheet['tables'][string]; row: Sheet['rows'][string][number]; col: Column }
  onClear: () => void
  go: (href: string) => void
  openList: (columnId: string) => void
}) {
  const { table, row, col } = chosen
  const sample = sampleOf(table, row)
  const buyers = buyersOf(sheet, table, row)
  const maker =
    col.shelf === 'boats' || col.shelf === 'motors' ? (table.name.split(' ')[0] ?? '') : ''
  const sheetAt = `/data/${encodeURIComponent(table.id)}?at=${encodeURIComponent(row.id)}`
  const unchosen = buyers.some((b) => b.state === 'unchosen')
  return (
    <article className="lv-answer" aria-label={`Each buyer’s price for ${sample.name}`}>
      <header className="lv-answer__head">
        <LinePicture sample={sample} maker={maker} />
        <p className="lv-answer__name">
          <span className="lv-answer__eyebrow">
            {col.tableIds.length === 1 || table.name.toLowerCase().includes(col.name.toLowerCase())
              ? table.name
              : `${col.name} · ${table.name}`}
          </span>
          <span>
            <Joints text={sample.name} />
          </span>
        </p>
        <span className="lv-answer__clear">
          <Button intent="quiet" size="sm" icon={XIcon} onClick={onClear}>
            Clear
          </Button>
        </span>
      </header>
      <dl className="lv-buyers" data-testid="buyers">
        {buyers.map((b) => {
          const why = stateSaid(b, col.name)
          return (
            <div key={b.key} className="lv-buyer" data-state={b.state}>
              <dt className="lv-buyer__who">{b.who}</dt>
              <dd className="lv-buyer__figure">
                {b.state === 'blank' || b.state === 'unchosen' ? (
                  <span className="lv-buyer__none">Not priced</span>
                ) : b.figure === null ? (
                  <span className="lv-buyer__none">None</span>
                ) : (
                  money(b.figure)
                )}
                {b.northsideOnly ? (
                  <span className="lv-buyer__lock" title="Northside’s own">
                    <Icon glyph={LockSimpleIcon} weight="fill" />
                  </span>
                ) : null}
              </dd>
              <dd className="lv-buyer__from">
                {b.column !== '' ? (
                  <span className="lv-buyer__column">
                    {b.column}
                    {b.cell !== '' ? <span className="lv-buyer__cell"> · {b.cell}</span> : null}
                  </span>
                ) : null}
                {why !== '' ? <span className="lv-buyer__why">{why}</span> : null}
                {b.could && b.could.length > 0 ? (
                  <span className="lv-buyer__rule">
                    {`It holds ${b.could.map((f) => `${f.label} ${money(f.figure)}`).join(', ')}.`}
                  </span>
                ) : null}
              </dd>
            </div>
          )
        })}
      </dl>
      <div className="lv-answer__acts">
        {unchosen ? (
          <Button
            intent="secondary"
            size="sm"
            icon={ArrowSquareOutIcon}
            onClick={() => openList(col.id)}
          >
            {`Choose how ${col.name} is priced`}
          </Button>
        ) : null}
        <Button
          intent="quiet"
          size="sm"
          icon={TableIcon}
          href={sheetAt}
          onClick={() => go(sheetAt)}
        >
          Open it on the price list
        </Button>
      </div>
    </article>
  )
}
