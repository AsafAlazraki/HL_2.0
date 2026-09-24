import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react'
import { Button, Kbd, closesStage, stageKeyOf } from '@/ui'
import { TABLE_KINDS, type AccentKey, type TableKind } from '@/domain/model'
import { CUSTOMER_TABLE_ID } from '@/domain/people/customers'
import {
  FILED_AT_THIS_DESK,
  kindWord,
  type PagePairing,
  type TableFacts,
  type TablePage,
} from '@/domain/modules/register'
import { markFor, type MarkChoice } from '@/screens/home/ledgers'
import { packedOn, provenanceOfSheet } from './file'
import { lineupShown, type Lineup } from './lineup'

/* ============================================================
   THE SPREAD — what pressing a maker OPENS, and it is not a panel.

   The critique of 2026-09-23 (#6) measured the page this replaces as
   the same composition as the quotes register and the sheet: a list
   on the left and a --spacing(90) column on the right, one token under
   three names, one set of steps. "The assignment moved the repetition
   behind a state rather than removing it." So pressing a plate no
   longer draws a column BESIDE the rows. It opens the maker, the way a
   brochure opens: the ledger steps away and the room under the shelf
   becomes that maker's spread — its own mark large on its own paper,
   its name, what it holds and how the file cuts it, what pairs with
   it, drawn in the inks the kinds carry, and the one act that opens
   its sheet. The shelf stays above it, lit on the maker that is open,
   so another maker is one press away and the way back is named for
   where it goes ("Back to the tables").

   A SPREAD, IN TWO PAGES. The left page is the maker — the cover and,
   under it, the lineup; the right page is what a dealer does with it —
   the name, the act, and what pairs with it. The facts the file keeps
   about the table run across the foot of both. A row's table and a
   pairing list open the same way, so the whole screen has one answer
   to "what does a press do": it opens the thing pressed, here.

   EVERY FIGURE IS THE REGISTER'S OR THE LINEUP'S, and both are counted
   off the store. A bar's length is its heading's rows over the largest
   heading's, and the count it stands for is printed at its end.

   COLOUR, where the owner asked for it and where it is honest: the
   spread's top edge and its lineup are drawn in the ink of the table's
   own kind (a boat maker is the file's blue), and each pairing is a
   tile carrying the other table's mark on paper where the ledger holds
   one, or a block of its kind's ink where it does not. Nothing is set
   in a kind's ink on paper — none of the seven reaches 3:1 there.
   ============================================================ */

/** Said where the press happened, when nothing handed this screen a
 *  way to the sheet. Said in what would have happened, never in an
 *  address pattern (rule (c), 2026-09-23). */
export const NO_WAY_TO_THE_SHEET =
  'This screen was handed no way to the sheet, so nothing was opened. Every table opens as a sheet of its own rows, where a cell can be changed.'
/** Said on the customers register's spread, when nothing handed this
 *  screen a way to that screen. */
export const NO_WAY_TO_CUSTOMERS =
  'This screen was handed no way to the customers register, so nothing was opened. It is Customers, on the bar every screen carries.'
/** Said where a table's workbook sentence would stand, for a table the
 *  file brought with no description on it. */
export const NO_PROVENANCE = 'No provenance note on this table'

/** HOW MANY HEADINGS A SPREAD DRAWS AS BARS before it counts the rest.
 *  Eight is what the left page holds at 1280×800 beside five pairing
 *  tiles without either scrolling — measured 2026-09-23 on Highfield
 *  (7 series) and Stacer (22 series, so 14 are counted). */
export const LINEUP_ROOM = 8

const accentOf = (kind: TableKind): AccentKey => TABLE_KINDS[kind].accent
const n = (value: number): string => value.toLocaleString('en-AU')

const STANDING_HEAD: Record<PagePairing['standing'], string> = {
  owner: 'What pairs with it',
  far: 'The boats it pairs with',
  rider: 'The pairing lists it rides on',
}

/** The kind of the table on the OTHER end of a pairing, from where the
 *  spread stands: a boat's spread lists what pairs with it, in those
 *  tables' kinds; a motor's lists boats. */
const otherKind = (p: PagePairing): TableKind => (p.standing === 'owner' ? p.farKind : 'boat')

export interface SpreadProps {
  hold: RefObject<HTMLElement | null>
  page: TablePage
  lineup: Lineup | null
  /** which plate on the shelf it was opened from, so the spread's top edge can point at it */
  from: { index: number; of: number } | null
  onClose: () => void
  onOpen: (tableId: string) => void
  canOpen: boolean
  openCustomers?: () => void
  fileProvenance: ReturnType<typeof provenanceOfSheet>
}

export function Spread({
  hold,
  page,
  lineup,
  from,
  onClose,
  onOpen,
  canOpen,
  openCustomers,
  fileProvenance,
}: SpreadProps) {
  const f: TableFacts = page.facts
  const isPairingList = page.ends !== null
  const customers = f.id === CUSTOMER_TABLE_ID
  const accent = isPairingList ? 'graphite' : accentOf(f.kind)
  const standing = page.pairings[0]?.standing ?? 'owner'
  const shown = lineup ? lineupShown(lineup, LINEUP_ROOM) : null
  const branchWord = f.branch ? (f.branches === 1 ? f.branch.one : f.branch.many) : 'headings'

  /* THE SPREAD KEEPS ITS OWN TWO KEYS. It takes the focus when it is
     opened from the ledger — the ledger steps away, so the focus has
     to go somewhere a person can see — and while it has it, Enter does
     what the amber act says and Escape goes back to the tables. A key
     pressed on one of its own buttons is that button's. */
  const onKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (event.key === 'Escape' && closesStage(stageKeyOf(event.nativeEvent))) {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key === 'Enter' && event.target === event.currentTarget) {
      event.preventDefault()
      onOpen(f.id)
    }
  }

  const pointsAt: CSSProperties | undefined = from
    ? ({ '--at': from.index, '--of': from.of } as CSSProperties)
    : undefined

  return (
    <section
      className="dt-spread"
      ref={hold}
      tabIndex={-1}
      aria-labelledby="dt-spread-name"
      data-testid="data-page"
      data-accent={accent}
      data-from={from ? '' : undefined}
      data-lineup={shown ? '' : undefined}
      data-pairs={!isPairingList ? '' : undefined}
      style={pointsAt}
      onKeyDown={onKeyDown}
    >
      {/* ---- the left page: the cover --------------------------- */}
      <div className="dt-spread__cover">
        {isPairingList && page.ends ? (
          <Ends owner={page.ends.ownerName} far={page.ends.farName} />
        ) : (
          <Cover name={f.name} choice={markFor(f.name, 'paper')} />
        )}
      </div>

      {/* ---- the right page: who it is, and the act ------------- */}
      <div className="dt-spread__who">
        <p className="dt-spread__kind">
          <span className="dt-tick" data-accent={accent} aria-hidden="true" />
          {isPairingList ? 'Pairing list' : f.kindWord}
          {f.retired ? <span className="dt-spread__retired"> · no longer sold</span> : null}
        </p>
        <h2 className="dt-spread__name" id="dt-spread-name">
          {f.name}
        </h2>
        <p className="dt-spread__holds">
          {isPairingList && page.ends ? (
            <>
              {f.holds} · {page.ends.ownerName} with {page.ends.farName}
              {page.ends.extras.length > 0 ? `, carrying ${page.ends.extras.join(', ')}` : ''}
            </>
          ) : (
            f.holds
          )}
          {f.retired ? (
            <span className="dt-spread__quiet">
              {' '}
              — history rather than stock, so nothing from it is offered to a customer
            </span>
          ) : null}
        </p>
        {!isPairingList && f.kind === 'boat' ? <WhyNoMark name={f.name} /> : null}

        <div className="dt-spread__acts">
          <span className="dt-spread__act">
            <Button
              intent="act"
              onClick={() => onOpen(f.id)}
              refusedBecause={canOpen ? undefined : NO_WAY_TO_THE_SHEET}
            >
              Open the sheet
              <Kbd>Enter</Kbd>
            </Button>
          </span>
          <Button intent="veiled" onClick={onClose}>
            Back to the tables
            <Kbd>Esc</Kbd>
          </Button>
        </div>
        <p className="dt-spread__where">
          On the sheet, {f.rows === 1 ? 'its' : 'all'} {f.leafSay} can be read and changed.
        </p>
        {customers ? (
          <div className="dt-spread__more">
            <Button
              intent="veiled"
              onClick={openCustomers}
              refusedBecause={openCustomers ? undefined : NO_WAY_TO_CUSTOMERS}
            >
              Open the customers register
            </Button>
            <p className="dt-spread__where">Each person there has a page of their own.</p>
          </div>
        ) : null}
      </div>

      {/* ---- the left page, under the cover: the lineup --------- */}
      {shown && lineup ? (
        <section className="dt-lineup" aria-labelledby="dt-lineup-head">
          <p className="dt-spread__head" id="dt-lineup-head">
            {shown.more > 0
              ? `The first ${n(shown.shown.length)} of ${n(lineup.branches.length)} ${branchWord}`
              : `Its ${n(lineup.branches.length)} ${branchWord}`}
            {' · '}
            {f.leafSay}
          </p>
          <ol className="dt-lineup__list">
            {shown.shown.map((b) => (
              <li className="dt-bar" key={b.name}>
                <span className="dt-bar__name" title={b.name}>
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
              </li>
            ))}
          </ol>
          {shown.more > 0 || lineup.unfiled > 0 ? (
            <p className="dt-lineup__rest">
              {shown.more > 0
                ? `and ${n(shown.more)} more in the file’s order, holding ${n(shown.moreRows)}, all on the sheet`
                : ''}
              {shown.more > 0 && lineup.unfiled > 0 ? ' · ' : ''}
              {lineup.unfiled > 0 ? `${n(lineup.unfiled)} filed under none` : ''}
            </p>
          ) : null}
        </section>
      ) : null}

      {/* ---- the right page, under the act: what pairs with it -- */}
      {!isPairingList ? (
        <section className="dt-pairs" aria-labelledby="dt-pairs-head">
          <p className="dt-spread__head" id="dt-pairs-head">
            {STANDING_HEAD[standing]}
            {page.pairings.length > 0
              ? ` · ${n(page.pairings.length)} ${page.pairings.length === 1 ? 'list' : 'lists'} · ${n(page.pairingRows)} pairings`
              : ''}
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
                ? 'No pairing list hangs off it yet: nothing in the file says what motor, trailer, fit or part goes on it.'
                : 'No boat pairs with it: no pairing list in the file names a row of it.'}
            </p>
          )}
        </section>
      ) : null}

      {/* ---- across the foot: what the file keeps about it ------ */}
      <dl className="dt-facts">
        <div className="dt-facts__row">
          <dt>Columns</dt>
          <dd>
            {n(f.columns)}
            {f.costColumns > 0 ? (
              <span className="dt-spread__quiet">
                {' '}
                · {n(f.costColumns)} of them the dealer&rsquo;s own figures, kept off every
                customer surface
              </span>
            ) : null}
          </dd>
        </div>
        <div className="dt-facts__row">
          <dt>Priced at</dt>
          <dd>
            {f.levels.length > 0 ? (
              f.levels.join(' · ')
            ) : (
              <span className="dt-spread__quiet">No price ladder is declared on it</span>
            )}
          </dd>
        </div>
        <div className="dt-facts__row dt-facts__row--wide">
          <dt>Where from</dt>
          <dd>
            {f.provenance.kind === 'file' ? (
              /* THE WORKBOOK, THE SHEET AND THE ROWS, in one line; the packer's
                 reading notes after it are the file's own words and are kept
                 whole, one press away, rather than set as a paragraph a dealer
                 reads past to reach the act. */
              <>
                {f.provenance.line}
                {f.provenance.whole !== f.provenance.line ? (
                  <details className="dt-note">
                    <summary>The file&rsquo;s whole note on it</summary>
                    <p>{f.provenance.whole}</p>
                  </details>
                ) : null}
              </>
            ) : f.provenance.kind === 'desk' ? (
              <>
                {FILED_AT_THIS_DESK}, on {packedOn(f.provenance.madeOn)}
                {f.provenance.whole ? ` — ${f.provenance.whole}` : ''}
                <span className="dt-spread__quiet"> · it is not in the packed file</span>
              </>
            ) : (
              <span className="dt-spread__quiet">{NO_PROVENANCE}</span>
            )}
          </dd>
        </div>
        {f.provenance.kind === 'file' ? (
          <div className="dt-facts__row dt-facts__row--wide">
            <dt>The file</dt>
            <dd>
              {fileProvenance.known ? (
                <>
                  Packed {packedOn(fileProvenance.file.packedAt)}
                  {/* ONE sha256 FOR THE WHOLE FILE, labelled and whole, one press
                      away: sixty-four characters of mono on every spread is a
                      checksum set where a dealer reads, and it is for checking a
                      re-import, which is an admin's moment and not a sale's. */}
                  <details className="dt-note">
                    <summary>Its sha256, to check a re-import against</summary>
                    <p>
                      <code className="dt-hash">{fileProvenance.file.sha256}</code>
                    </p>
                  </details>
                </>
              ) : (
                <span className="dt-spread__quiet">{fileProvenance.because}</span>
              )}
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  )
}

/* ---------------------------------------------------------- */
/* The cover: the maker's own mark, large, on its own paper    */
/* ---------------------------------------------------------- */

function Cover({ name, choice }: { name: string; choice: MarkChoice }) {
  return (
    <div className="dt-cover">
      {choice.drawn ? (
        <img
          className="dt-cover__img"
          src={choice.mark.src}
          alt={`${name}’s own mark`}
          width={choice.mark.width}
          height={choice.mark.height}
          decoding="async"
        />
      ) : (
        /* A TABLE WITH NO MARK IS ITS NAME SET IN TYPE on the same paper —
           the plates' own rule, and never a stand-in. */
        <span className="dt-cover__typed">{name}</span>
      )}
    </div>
  )
}

/** A pairing list's cover is its two ends, each in its own mark where one is held. */
function Ends({ owner, far }: { owner: string; far: string }) {
  const one = markFor(owner, 'paper')
  const two = markFor(far, 'paper')
  const end = (name: string, choice: MarkChoice) =>
    choice.drawn ? (
      <img
        className="dt-cover__end"
        src={choice.mark.src}
        alt={name}
        width={choice.mark.width}
        height={choice.mark.height}
        decoding="async"
      />
    ) : (
      <span className="dt-cover__endtyped">{name}</span>
    )
  return (
    <div className="dt-cover dt-cover--ends">
      {end(owner, one)}
      <span className="dt-cover__with">with</span>
      {end(far, two)}
    </div>
  )
}

/** Why a boat maker's cover is set in type: the ledger's own sentence. */
function WhyNoMark({ name }: { name: string }) {
  const choice = markFor(name, 'paper')
  if (choice.drawn) return null
  return <p className="dt-spread__why">{choice.because}</p>
}

/* ---------------------------------------------------------- */
/* One pairing, as a tile                                      */
/* ---------------------------------------------------------- */

/** A TILE IS A DOOR TO THE PAIRING LIST'S OWN SHEET — the rows that say
 *  which motor, trailer, fit or part goes on which boat. Its left block
 *  is the other table's mark on paper where the ledger holds one, and a
 *  block of its kind's ink where it does not: colour that says what
 *  kind of thing pairs, before a word of it is read. */
function PairTile({ pairing: p, onOpen }: { pairing: PagePairing; onOpen: (id: string) => void }) {
  const kind = otherKind(p)
  const choice = markFor(p.otherName, 'paper')
  return (
    <button
      type="button"
      className="dt-tile"
      data-retired={p.retired ? '' : undefined}
      title={p.joinName}
      aria-label={`${p.otherName} · ${n(p.rows)} pairings${p.retired ? ' · no longer sold' : ''} — opens that pairing list`}
      onClick={() => onOpen(p.joinId)}
    >
      <span className="dt-tile__face" data-accent={accentOf(kind)} data-drawn={choice.drawn ? '' : undefined}>
        {choice.drawn ? (
          <img
            className="dt-tile__img"
            src={choice.mark.src}
            alt=""
            width={choice.mark.width}
            height={choice.mark.height}
            decoding="async"
          />
        ) : null}
      </span>
      <span className="dt-tile__body">
        <span className="dt-tile__name">{p.otherName}</span>
        <span className="dt-tile__line">
          <b className="dt-tile__n">{n(p.rows)}</b> pairings ·{' '}
          <span className="dt-tile__kind" data-accent={accentOf(kind)}>
            {kindWord(kind)}
          </span>
          {p.retired ? ' · no longer sold' : ''}
        </span>
      </span>
    </button>
  )
}
