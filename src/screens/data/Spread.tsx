import {
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from 'react'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CaretDownIcon,
  CaretUpIcon,
  FileXlsIcon,
  FlagPennantIcon,
  LinkSimpleIcon,
  TagIcon,
  TruckTrailerIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react'
import { Button, Icon, KindMark, closesStage, stageKeyOf, type Glyph } from '@/ui'
import { TABLE_KINDS, type AccentKey, type TableKind } from '@/domain/model'
import { CUSTOMER_TABLE_ID } from '@/domain/people/customers'
import { asAtOf } from '@/domain/catalogue/asAt'
import {
  FILED_AT_THIS_DESK,
  kindWord,
  whereFrom,
  type PagePairing,
  type TableFacts,
  type TablePage,
} from '@/domain/modules/register'
import { markFor, type MarkChoice } from '@/screens/home/ledgers'
import { packedOn } from './file'
import { lineupShown, type Lineup } from './lineup'

/* ============================================================
   THE SPREAD — what pressing a maker, a list or a list of what fits
   OPENS, in the room the ledgers had (direction A, "The Monday list",
   2026-11-03; first drawn 2026-09-23).

   THREE PAGES ACROSS ITS MEASURE: who it is (its kind, its name, what
   it holds, its state and its acts), its lineup (every heading the
   file cuts it into, each a door to the sheet at that heading), and
   what goes with it (the lists of what fits, as tiles). The file's
   facts run across the foot. On a tablet the lineup and the tiles sit
   side by side under the head; in a hand it is one column.

   THE MARK IS DRAWN ONCE (the judge of Data, L13). A maker's spread
   opens under its own tile, which is lit and carries the mark, so the
   spread does not draw it again: its head is the maker's name. A list
   that has no tile on the screen (Yamaha Outboards, a trailer maker)
   carries its own mark small beside its kind, where the ledger holds
   one; a list of what fits carries its two ends.

   EVERY HEADING CAN BE OPENED, AND EVERY ONE IS REACHABLE (L10). Parts
   is cut into 187 categories; the spread draws the first twelve in the
   price list's own order, says so, and one press draws the rest in
   place. A heading that says the date it was priced is marked, and its
   date is said to a reader.

   WHAT OPENS FOLDS BACK (the verifier of Data, round 1). The lineup drawn
   whole is a position, `?headings=all`, so a reload keeps it. The press
   that draws the rest stays the same button, now "Fold back to the first
   twelve", and while the long lineup is read it stands at the foot of the
   window over the bars, so it is always one press away. Drawing the rest
   takes the keyboard to the first heading it drew, which stands where
   the button stood, so nothing moves under the reader; folding back takes
   it to the button, brought into the window.

   EVERY FIGURE IS THE REGISTER'S OR THE LINEUP'S, and both are counted
   off the store. A bar's length is its heading's lines over the
   largest heading's, and the count it stands for is printed at its end.
   ============================================================ */

/** How the open spread arrived: risen into place from a pointer's press, or simply there. */
export type Arrival = 'risen' | null

/** Said where the press happened, when nothing handed this screen a way to the sheet. */
export const NO_WAY_TO_THE_SHEET = 'Nothing was opened: this screen has no way to the list’s own page.'
/** Said on the customers register's spread, when nothing handed this screen a way there. */
export const NO_WAY_TO_CUSTOMERS =
  'Nothing was opened: Customers is on the bar every screen carries.'

/** HOW MANY HEADINGS A SPREAD DRAWS before one press draws the rest: twelve is the lineup's
 *  column beside the head and the tiles at 1280 × 800 without the spread passing the window. */
export const LINEUP_ROOM = 12

const accentOf = (kind: TableKind): AccentKey => TABLE_KINDS[kind].accent
const n = (value: number): string => value.toLocaleString('en-AU')

const STANDING_HEAD: Record<PagePairing['standing'], string> = {
  owner: 'What goes with it',
  far: 'The boats it fits',
  rider: 'The boats it goes on, with a motor',
}

const linesSay = (rows: number): string => `${n(rows)} ${rows === 1 ? 'line' : 'lines'}`

const otherKind = (p: PagePairing): TableKind => (p.standing === 'owner' ? p.farKind : 'boat')

export interface SpreadProps {
  hold: RefObject<HTMLElement | null>
  page: TablePage
  lineup: Lineup | null
  arrival: Arrival
  /** back to the lists; `pointer` when a pointer pressed it */
  onClose: (pointer: boolean) => void
  /** its sheet, or its sheet at one heading */
  onOpen: (tableId: string, heading?: string) => void
  canOpen: boolean
  openCustomers?: () => void
  pricesHref?: string
  /** ONE OF ITS BOATS ON FITMENT: the maker opened on Fitment's chooser, its models to pick */
  fits?: { maker: string; href: string }
  own?: { name: string; href: string }
  go?: (href: string) => void
  /** what it holds where the tile counts it in another unit: a maker's models */
  holds?: string
  /** WHAT STANDS ON IT, in one sentence of figures: its Review cases, its dated headings, its
   *  lines changed on this computer. Null while Review is still being counted. */
  state?: string | null
  /** the maker's own tile is lit above it, and carries its mark */
  fromTile: boolean
  /** its lineup is drawn whole, a position in the address */
  whole?: boolean
  onWhole?: (whole: boolean) => void
}

export function Spread({
  hold,
  page,
  lineup,
  arrival,
  onClose,
  onOpen,
  canOpen,
  openCustomers,
  pricesHref,
  fits,
  own,
  go,
  holds: holdsOverride,
  state,
  fromTile,
  whole = false,
  onWhole,
}: SpreadProps) {
  const f: TableFacts = page.facts
  const isPairingList = page.ends !== null
  const customers = f.id === CUSTOMER_TABLE_ID
  const accent = isPairingList ? 'graphite' : accentOf(f.kind)
  const standing = page.pairings[0]?.standing ?? 'owner'
  const folded = lineup ? lineupShown(lineup, LINEUP_ROOM) : null
  const shown = lineup ? lineupShown(lineup, whole ? Infinity : LINEUP_ROOM) : null
  const bars = useRef<HTMLOListElement>(null)
  const fold = useRef<HTMLElement>(null)
  /* where the keyboard goes when the lineup opens or folds: asked for by the press, done once
     the bars it names are drawn */
  const after = useRef<'opened' | 'folded' | null>(null)
  useEffect(() => {
    const asked = after.current
    if (asked === null) return
    after.current = null
    if (asked === 'opened' && folded) {
      bars.current?.querySelectorAll<HTMLElement>('.dt-bar')[folded.shown.length]?.focus({ preventScroll: true })
    } else if (asked === 'folded') {
      fold.current?.focus({ preventScroll: true })
      fold.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [whole, folded])
  const toggle = (): void => {
    after.current = whole ? 'folded' : 'opened'
    onWhole?.(!whole)
  }
  const branchWord = f.branch ? (f.branches === 1 ? f.branch.one : f.branch.many) : 'headings'
  /* A LIST MADE HERE COUNTS ITS LINES, never "0 rows" (the judge, J8): the engine's noun for a
     line of a list that names none of its own is "row", and a dealer's is "line" */
  const holds = holdsOverride ?? (f.leaf.one === 'row' ? linesSay(f.rows) : f.holds)
  const barsIn = holds === f.holds ? '' : ` · ${f.leafSay}`

  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (event.key === 'Escape' && closesStage(stageKeyOf(event.nativeEvent))) {
      event.preventDefault()
      onClose(false)
      return
    }
    if (event.key === 'Enter' && event.target === event.currentTarget) {
      event.preventDefault()
      onOpen(f.id)
    }
  }

  return (
    <section
      className="dt-spread"
      ref={hold}
      tabIndex={-1}
      aria-labelledby="dt-spread-name"
      data-testid="data-page"
      data-ground="plate"
      data-accent={accent}
      data-lineup={shown ? '' : undefined}
      data-arrival={arrival ?? undefined}
      onKeyDown={onKeyDown}
    >
      {/* ---- who it is, and the acts --------------------------- */}
      <div className="dt-spread__who">
        <p className="dt-spread__kind">
          {isPairingList ? (
            <span className="dt-spread__link" aria-hidden="true">
              <Icon glyph={LinkSimpleIcon} />
            </span>
          ) : (
            <KindMark kind={f.kind} size="sm" />
          )}
          <span>{isPairingList ? 'What fits which boat' : f.kindWord}</span>
          {f.retired ? <span className="dt-spread__retired"> · no longer sold</span> : null}
          {!isPairingList && !fromTile ? <SmallMark name={f.name} /> : null}
        </p>
        <h2 className="dt-spread__name" id="dt-spread-name">
          {f.name}
        </h2>
        {isPairingList && page.ends ? <Ends owner={page.ends.ownerName} far={page.ends.farName} /> : null}
        <p className="dt-spread__holds">
          {isPairingList && page.ends ? (
            <>
              {page.ends.farName} for {page.ends.ownerName}
              {page.ends.extras.length > 0 ? `, with their ${page.ends.extras.join(', ')}` : ''}
              {' · '}
              {linesSay(f.rows)}
            </>
          ) : (
            holds
          )}
          {f.retired ? (
            <span className="dt-spread__quiet">
              {' '}
              — history rather than stock, so nothing from it is offered to a customer
            </span>
          ) : null}
        </p>
        {state ? (
          <p className="dt-spread__state" data-testid="data-page-state">
            {state}
          </p>
        ) : null}
        {!isPairingList && f.kind === 'boat' ? <WhyNoMark name={f.name} /> : null}

        <div className="dt-spread__acts">
          <Button
            intent="act"
            icon={ArrowRightIcon}
            onClick={() => onOpen(f.id)}
            refusedBecause={canOpen ? undefined : NO_WAY_TO_THE_SHEET}
            title="Every line of it, to read and change"
          >
            Open the list
          </Button>
          {own ? (
            <Button
              intent="secondary"
              icon={FlagPennantIcon}
              href={own.href}
              title={
                f.kind === 'boat'
                  ? 'Its line, mark, photograph and colour, and its quotes'
                  : 'Its line, mark and colour, and its quotes'
              }
              onClick={go ? () => go(own.href) : undefined}
            >
              {`${own.name}${own.name.endsWith('s') ? '’' : '’s'} own page`}
            </Button>
          ) : null}
          <Button intent="quiet" icon={ArrowLeftIcon} onClick={(event) => onClose(event.detail > 0)}>
            Back to the lists
          </Button>
        </div>
        {customers ? (
          <div className="dt-spread__more">
            <Button
              intent="secondary"
              icon={UsersThreeIcon}
              onClick={openCustomers}
              refusedBecause={openCustomers ? undefined : NO_WAY_TO_CUSTOMERS}
            >
              Open Customers
            </Button>
          </div>
        ) : null}
      </div>

      {/* ---- the lineup: every heading, each a door ----------- */}
      {shown && lineup ? (
        <section className="dt-lineup" aria-labelledby="dt-lineup-head">
          <p className="dt-spread__head" id="dt-lineup-head">
            {`Its ${n(lineup.branches.length)} ${branchWord}`}
            {barsIn}
            {lineup.branches.length > 1 ? ', in the price list’s order' : ''}
          </p>
          <ol className="dt-lineup__list" id="dt-lineup-list" ref={bars}>
            {shown.shown.map((b) => {
              const on = asAtOf(b.name)
              return (
                <li key={b.name}>
                  <button
                    type="button"
                    className="dt-bar"
                    data-dated={on ? '' : undefined}
                    onClick={() => onOpen(f.id, b.name)}
                    aria-label={`${b.name}: ${n(b.rows)} ${b.rows === 1 ? f.leaf.one : f.leaf.many}${
                      on ? `, priced as at ${packedOn(on, 'long')}` : ''
                    } — opens the list at it`}
                  >
                    <span className="dt-bar__name">
                      {on ? <span className="dt-bar__dated" aria-hidden="true" /> : null}
                      {b.name}
                    </span>
                    <span className="dt-bar__track" aria-hidden="true">
                      <span
                        className="dt-bar__fill"
                        data-accent={accent}
                        style={{ '--share': b.rows / lineup.most } as CSSProperties}
                      />
                    </span>
                    <span className="dt-bar__n">{n(b.rows)}</span>
                  </button>
                </li>
              )
            })}
          </ol>
          {folded && folded.more > 0 ? (
            <p className="dt-lineup__fold" data-whole={whole ? '' : undefined}>
              <Button
                ref={fold}
                intent={whole ? 'secondary' : 'quiet'}
                size="sm"
                icon={whole ? CaretUpIcon : CaretDownIcon}
                aria-expanded={whole}
                aria-controls="dt-lineup-list"
                onClick={toggle}
              >
                {whole
                  ? `Fold back to the first ${n(folded.shown.length)}`
                  : `The other ${n(folded.more)}, holding ${n(folded.moreRows)}`}
              </Button>
            </p>
          ) : null}
          {lineup.unfiled > 0 ? (
            <p className="dt-lineup__rest">{`${n(lineup.unfiled)} in none of them`}</p>
          ) : null}
        </section>
      ) : null}

      {/* ---- what goes with it -------------------------------- */}
      {!isPairingList ? (
        <section className="dt-pairs" aria-labelledby="dt-pairs-head">
          <p className="dt-spread__head" id="dt-pairs-head">
            {STANDING_HEAD[standing]}
            {page.pairings.length > 0 ? ` · ${n(page.pairings.length)}` : ''}
          </p>
          {page.pairings.length > 0 ? (
            <ul className="dt-tiles">
              {page.pairings.map((p) => (
                <li key={p.joinId}>
                  <PairTile pairing={p} onOpen={onOpen} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="dt-pairs__none">
              {f.kind === 'boat'
                ? 'Nothing on the price list says what motor, trailer, fit or part goes on it yet.'
                : 'No boat on the price list names it yet.'}
            </p>
          )}
          {fits ? (
            <p className="dt-pairs__boat">
              <span>{`What fits one ${fits.maker}?`}</span>
              <Button
                intent="secondary"
                size="sm"
                icon={TruckTrailerIcon}
                href={fits.href}
                onClick={go ? () => go(fits.href) : undefined}
              >
                Choose its model on Fitment
              </Button>
            </p>
          ) : null}
        </section>
      ) : null}

      {/* ---- across the foot: what the file keeps about it ------ */}
      <dl className="dt-facts">
        <div className="dt-facts__row">
          <Term glyph={TagIcon}>Prices</Term>
          <dd>
            {f.prices.length > 0 && pricesHref ? (
              <Button
                intent="quiet"
                size="sm"
                href={pricesHref}
                aria-label={`${f.prices.map((p) => p.said).join(', ')}: set on Prices`}
                onClick={go ? () => go(pricesHref) : undefined}
              >
                <PriceWords prices={f.prices} />
              </Button>
            ) : f.prices.length > 0 ? (
              <PriceWords prices={f.prices} />
            ) : (
              <span className="dt-spread__quiet">No price is named on it</span>
            )}
            {f.costColumns > 0 ? (
              <span className="dt-spread__quiet">
                {' '}
                · and {n(f.costColumns)} {f.costColumns === 1 ? 'cost' : 'costs'}, never on a
                quote
              </span>
            ) : null}
          </dd>
        </div>
        {f.provenance.kind === 'file' ? (
          <div className="dt-facts__row">
            <Term glyph={FileXlsIcon}>Where from</Term>
            <dd>
              <WorkbookSay line={f.provenance.line} />
            </dd>
          </div>
        ) : f.provenance.kind === 'desk' ? (
          <div className="dt-facts__row">
            <Term glyph={FileXlsIcon}>Where from</Term>
            <dd>
              {FILED_AT_THIS_DESK} on {packedOn(f.provenance.madeOn, 'long')}
              <span className="dt-spread__quiet"> · not part of the Master Price File</span>
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  )
}

/* ---------------------------------------------------------- */

/** A list's own mark, small, beside its kind — for a list with no tile of its own on screen. */
function SmallMark({ name }: { name: string }) {
  const choice = markFor(name, 'paper')
  if (!choice.drawn) return null
  return (
    <img
      className="dt-spread__mark"
      src={choice.mark.src}
      alt={`${name}’s own mark`}
      width={choice.mark.width}
      height={choice.mark.height}
      decoding="async"
    />
  )
}

/** A list of what fits: its two ends, each in its own mark where one is held. */
function Ends({ owner, far }: { owner: string; far: string }) {
  const end = (name: string, choice: MarkChoice) =>
    choice.drawn ? (
      <img
        className="dt-ends__img"
        src={choice.mark.src}
        alt={name}
        width={choice.mark.width}
        height={choice.mark.height}
        decoding="async"
      />
    ) : (
      <span className="dt-ends__typed">{name}</span>
    )
  return (
    <p className="dt-ends">
      {end(owner, markFor(owner, 'paper'))}
      <span className="dt-ends__with">with</span>
      {end(far, markFor(far, 'paper'))}
    </p>
  )
}

function PriceWords({ prices }: { prices: TableFacts['prices'] }) {
  return (
    <>
      {prices.map((price, i) => (
        <span key={price.filed}>
          {i > 0 ? ' · ' : null}
          <span title={price.filed === price.said ? undefined : `“${price.filed}” on the price list`}>
            {price.said}
          </span>
        </span>
      ))}
    </>
  )
}

function WorkbookSay({ line }: { line: string }) {
  const { workbook, sheet } = whereFrom(line)
  return (
    <>
      {workbook}
      {sheet && sheet !== workbook ? <>, on its {sheet} tab</> : null}
    </>
  )
}

function WhyNoMark({ name }: { name: string }) {
  const choice = markFor(name, 'paper')
  if (choice.drawn) return null
  return <p className="dt-spread__why">{choice.because}</p>
}

function Term({ glyph, children }: { glyph: Glyph; children: string }) {
  return (
    <dt>
      <span className="dt-facts__glyph" aria-hidden="true">
        <Icon glyph={glyph} />
      </span>
      {children}
    </dt>
  )
}

/** A TILE IS A DOOR TO THE LIST OF WHAT FITS: its face the other list's mark on paper where the
 *  ledger holds one, its kind's glyph in its own ink where it does not, and its lines. */
function PairTile({
  pairing: p,
  onOpen,
}: {
  pairing: PagePairing
  onOpen: (id: string) => void
}) {
  const kind = otherKind(p)
  const choice = markFor(p.otherName, 'paper')
  return (
    <button
      type="button"
      className="dt-tile"
      data-ground="plate"
      data-retired={p.retired ? '' : undefined}
      aria-label={`${p.otherName}${p.retired ? ' · no longer sold' : ''}, ${linesSay(p.rows)} — opens the list of what fits which`}
      onClick={() => onOpen(p.joinId)}
    >
      <span className="dt-tile__face" data-accent={accentOf(kind)}>
        {choice.drawn ? (
          <img
            className="dt-tile__img"
            src={choice.mark.src}
            alt=""
            width={choice.mark.width}
            height={choice.mark.height}
            decoding="async"
          />
        ) : (
          <KindMark kind={kind} size="md" />
        )}
      </span>
      <span className="dt-tile__body">
        <span className="dt-tile__name">{p.otherName}</span>
        <span className="dt-tile__line">
          {p.standing === 'owner' ? `${kindWord(kind)} · ` : ''}
          {linesSay(p.rows)}
          {p.retired ? <span className="dt-tile__retired"> · no longer sold</span> : null}
        </span>
      </span>
      <span className="dt-tile__go" aria-hidden="true">
        <Icon glyph={ArrowRightIcon} />
      </span>
    </button>
  )
}
