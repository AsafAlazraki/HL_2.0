/* ============================================================
   QUOTES — A SALESPERSON'S DESK OF DEALS (the flow round, 2026-10-30).

   The owner, 2026-10-30: "i dont like the quotes home page either".
   What he saw on the live site with one draft: three status bands
   (DRAFT 1, GIVEN 0, REPLACED 0) whose empty bands still took a row
   each, a full-width New quote bar inside the list, then a form-like
   detail card ("Started", "On the price list", "Items", "Priced at")
   with no picture of what is sold, the total in a grey box and small
   ghost buttons. It read as an admin record, not a desk of deals.

   WHAT THIS IS INSTEAD. One card per deal, led by the PICTURE of what
   is sold, the CUSTOMER and the TOTAL, with the one NEXT ACT for that
   deal on the card itself:

     · being written  → Carry on building      (and Discard, asked twice)
     · with the customer → Open the printed quote (and Make a new version,
                           or Open the new version where one is written)
     · replaced       → Open the printed quote, quietly

   The deals are grouped by where they stand, and a group with nothing
   in it is not drawn: an empty "Given 0" was a row saying nothing. No
   group sums its totals: two customers' totals added together are a
   figure nobody quotes (walk.md, $84,721). A given quote stays with
   the customer until its new version is GIVEN (`givenReplacements`,
   src/domain/quote/register.ts): the draft that will replace it is
   named on its card, and it moves to Replaced only when that is given.

   NOTHING HERE IS INVENTED. Every figure is one the document froze
   (`readRegister`), every picture is the one reader's of that quote's
   own row (`coverOf`), and a deal whose boat has no picture held
   shows the kind's glyph and no photograph. An empty desk says so in
   one quiet sentence beside the act that starts the first quote.

   SIMPLE WINS. No grid with a cursor and a reading pane: each card is
   its own words and its own buttons, reached by Tab like any page.
   The find field appears only when there are enough deals to need it
   (`FIND_FIELD_AT`). The two positions are still search params: what
   was typed (`find`), and the deal the address arrived at (`at`),
   which is drawn lit and brought into view.
   ============================================================ */
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import {
  ArrowRightIcon,
  ArrowsClockwiseIcon,
  ArrowUUpLeftIcon,
  DatabaseIcon,
  FilePlusIcon,
  FileTextIcon,
  MagnifyingGlassIcon,
  SailboatIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import { Button, Icon, Input, Picture, PriceFigure, STATE_GLYPH, move, type QuoteState } from '@/ui'
import type { QuoteDef } from '@/domain/model'
import { FIND_FIELD_AT, NOTHING_FOUND } from '@/domain/quote/find'
import { newVersionOf } from '@/domain/quote/commands'
import { referenceForNow } from '@/domain/quote/freeze'
import {
  ageSay,
  readRegister,
  type RegisterRow,
  type RegisterStateId,
} from '@/domain/quote/register'
import { useCatalogue, useQuotes } from '@/app/useStores'
import { quotes as quotesStore } from '@/state/quotes'
import { heroOfQuote, srcSetOf, type HeldPicture } from '@/data/pictures'
import { boatTravel } from '@/screens/picker/travel'
import { coverOf, heldCopyOf, type Cover } from './cover'
import './quotes.css'

/** Said where the press happened, when nothing handed this screen a way to a document. */
export const NO_WAY_TO_OPEN = 'This screen was given no way to open a quote, so nothing was opened.'
/** Said at the act, when nothing handed this screen a way to start one. */
export const NO_WAY_TO_THE_PICKER =
  'This screen was given no way to start a quote, so nothing was started.'
/** Said if a new version is asked of a draft: a draft is changed where it is written. */
export const ONLY_ISSUED_IS_VERSIONED =
  'A draft is changed where it is written. A new version is only for a quote already given.'
/** What an empty desk says, beside the act that starts the first quote. */
export const NOTHING_QUOTED_YET = 'Nothing has been quoted on this computer yet.'

/** WHERE A DEAL STANDS, in the salesperson's words, and the order the groups are read in. */
const GROUPS: ReadonlyArray<{ id: RegisterStateId; word: string; glyph: QuoteState }> = [
  { id: 'draft', word: 'Being written', glyph: 'draft' },
  { id: 'issued', word: 'With the customer', glyph: 'given' },
  { id: 'superseded', word: 'Replaced by a newer version', glyph: 'superseded' },
]

export interface QuotesProps {
  /** accepted from the route, and not drawn: the pill carries the business's own mark */
  business?: string | null
  /** accepted from the route, and not drawn: the pill carries Home */
  goHome?: () => void
  /** the door to the Master Price File, for a browser with no sheet */
  openTheFile?: () => void
  /** New quote, where a quote is started */
  newQuote?: () => void
  /** accepted from the route: New quote begun on one maker */
  newQuoteOf?: (tableId: string) => void
  /** ONE FILED DOCUMENT, OPENED WHERE IT BELONGS: a draft where it is written, a given or
   *  replaced quote as the paper the customer was given. The address is the route's. */
  openQuote?: (id: string, state: RegisterStateId) => void
  /** the clock, injected: a test says which instant it is asking about */
  now?: () => Date
  /** the find the address arrived with */
  query?: string
  /** the deal the address arrived at, by reference */
  at?: string
  /** how the address is kept in step */
  onPosition?: (position: { find?: string; at?: string }) => void
}

const THE_CLOCK = (): Date => new Date()

export function Quotes({
  openTheFile,
  newQuote,
  openQuote,
  now = THE_CLOCK,
  query: askedFor = '',
  at = '',
  onPosition,
}: QuotesProps) {
  const filed = useQuotes((s) => s.quotes)
  const read = useQuotes((s) => s.loaded)
  const problem = useQuotes((s) => s.problem)
  const sheetStatus = useCatalogue((s) => s.status)
  const sheetProblem = useCatalogue((s) => s.problem)
  const sheetTables = useCatalogue((s) => s.tables)

  const [query, setQuery] = useState(askedFor)
  const [lit, setLit] = useState(at)
  const [said, setSaid] = useState<{ at: string; words: string } | null>(null)
  const register = useMemo(() => readRegister(filed, query), [filed, query])
  const byId = useMemo(() => new Map(filed.map((q) => [q.id, q])), [filed])

  useEffect(() => {
    onPosition?.({ find: query === '' ? undefined : query, at: lit === '' ? undefined : lit })
  }, [onPosition, query, lit])

  /* THE DEAL THE ADDRESS NAMED IS BROUGHT INTO VIEW, once, when it is first drawn */
  const cards = useRef(new Map<string, HTMLElement>())
  const shownLit = register.shown.some((r) => r.reference === lit)
  useEffect(() => {
    if (!shownLit) return
    cards.current.get(lit)?.scrollIntoView({ block: 'nearest' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownLit])

  const nowMs = now().getTime()
  const sheetOpen = sheetStatus === 'ready' && Object.keys(sheetTables).length > 0
  const sheetLooking =
    (sheetStatus === 'empty' || sheetStatus === 'loading') && sheetProblem === null
  const findable = register.held >= FIND_FIELD_AT
  const narrowed = query.trim() !== ''

  const startOne = (): void => {
    if (!newQuote) {
      setSaid({ at: 'new', words: NO_WAY_TO_THE_PICKER })
      return
    }
    newQuote()
  }
  const openIt = (row: RegisterRow): void => {
    if (!openQuote) {
      setSaid({ at: row.reference, words: NO_WAY_TO_OPEN })
      return
    }
    openQuote(row.id, row.state)
  }
  const makeVersion = (from: QuoteDef): void => {
    if (from.state !== 'issued') {
      setSaid({ at: from.reference, words: ONLY_ISSUED_IS_VERSIONED })
      return
    }
    const when = now()
    const made = newVersionOf(from, referenceForNow(filed, when), when.toISOString())
    quotesStore.getState().file(made.quote, made.event)
    setLit(made.quote.reference)
    setSaid({
      at: made.quote.reference,
      words: `${made.quote.reference} is a new version of ${from.reference}, as a draft. ${from.reference} stays with the customer until this one is given.`,
    })
  }
  const discard = (quote: QuoteDef): void => {
    const outcome = quotesStore.getState().discard(quote.id)
    const refusal = 'refused' in outcome && outcome.refused.trim() !== '' ? outcome.refused : null
    setSaid({
      at: refusal ? quote.reference : 'desk',
      words: refusal ?? `${quote.reference} was discarded.`,
    })
  }

  return (
    <main className="qd" data-testid="quotes" data-read={read ? '' : undefined}>
      <header className="qd-head">
        <div className="qd-head__words">
          <h1 className="qd-title">Quotes</h1>
        </div>
        {findable ? (
          <span className="qd-find">
            <Input
              type="search"
              icon={MagnifyingGlassIcon}
              aria-label="Find a quote"
              value={query}
              onValueChange={setQuery}
              placeholder="Customer, boat or quote number"
            />
          </span>
        ) : null}
        {register.bare ? null : (
          <span className="qd-new">
            <Button intent="act" icon={FilePlusIcon} onClick={startOne}>
              New quote
            </Button>
          </span>
        )}
      </header>

      {problem !== null ? (
        <p className="qd-note" role="alert">
          {problem}
        </p>
      ) : null}
      {register.bare || sheetOpen ? null : (
        <p className="qd-note">
          <Icon glyph={DatabaseIcon} size="sm" />
          <span>
            {sheetLooking
              ? 'Looking for the price list…'
              : 'No price list is loaded. A quote already written still opens, as it was written.'}
          </span>
          {sheetLooking || !openTheFile ? null : (
            <Button intent="quiet" size="sm" onClick={openTheFile}>
              Load the Master Price File
            </Button>
          )}
        </p>
      )}
      {said && (said.at === 'new' || said.at === 'desk') ? (
        <output className="qd-said">{said.words}</output>
      ) : null}
      {narrowed ? (
        <output className="qd-said">
          {register.shown.length === 0
            ? NOTHING_FOUND(query)
            : `${register.shown.length.toLocaleString('en-AU')} of ${register.held.toLocaleString('en-AU')} match “${query.trim()}”.`}
        </output>
      ) : null}

      {register.bare ? (
        <section className="qd-empty" aria-label="No quotes yet">
          <span className="qd-empty__glyph" aria-hidden="true">
            <Icon glyph={FileTextIcon} size="lg" />
          </span>
          <p className="qd-empty__say">
            {read ? NOTHING_QUOTED_YET : 'Reading the quotes kept here…'}
          </p>
          {read ? (
            <Button intent="act" icon={FilePlusIcon} onClick={startOne}>
              New quote
            </Button>
          ) : null}
        </section>
      ) : (
        GROUPS.map((g) => {
          const band = register.bands.find((b) => b.spec.id === g.id)
          if (!band || band.rows.length === 0) return null
          const headId = `qd-${g.id}`
          return (
            <section key={g.id} className="qd-group" data-state={g.id} aria-labelledby={headId}>
              <h2 className="qd-group__head" id={headId}>
                <span className="qd-group__glyph" aria-hidden="true">
                  <Icon glyph={STATE_GLYPH[g.glyph]} weight="bold" size="sm" />
                </span>
                {g.word}
                <span className="qd-group__n">{band.rows.length}</span>
              </h2>
              <ul className="qd-deals" data-state={g.id}>
                {band.rows.map((row) => {
                  const quote = byId.get(row.id)
                  if (!quote) return null
                  return (
                    <Deal
                      key={row.id}
                      row={row}
                      quote={quote}
                      nowMs={nowMs}
                      lit={row.reference === lit}
                      said={said?.at === row.reference ? said.words : null}
                      keep={(el) => {
                        if (el) cards.current.set(row.reference, el)
                        else cards.current.delete(row.reference)
                      }}
                      onOpen={() => openIt(row)}
                      onOpenOther={(reference) => {
                        const other = register.shown.find((r) => r.reference === reference)
                        if (other) openIt(other)
                      }}
                      onVersion={() => makeVersion(quote)}
                      onDiscard={() => discard(quote)}
                    />
                  )
                })}
              </ul>
            </section>
          )
        })
      )}
    </main>
  )
}

/* ---------------------------------------------------------- */
/* One deal                                                    */
/* ---------------------------------------------------------- */

function Deal({
  row,
  quote,
  nowMs,
  lit,
  said,
  keep,
  onOpen,
  onOpenOther,
  onVersion,
  onDiscard,
}: {
  row: RegisterRow
  quote: QuoteDef
  nowMs: number
  lit: boolean
  said: string | null
  keep: (el: HTMLElement | null) => void
  onOpen: () => void
  onOpenOther: (reference: string) => void
  onVersion: () => void
  onDiscard: () => void
}) {
  const [asking, setAsking] = useState(false)
  const cover = useMemo(
    () =>
      coverOf<HeldPicture>(quote, {
        photo: (q) => heroOfQuote(q) ?? undefined,
        copy: heldCopyOf,
      }),
    [quote],
  )
  const titleId = `qd-deal-${row.id}`
  const when =
    row.state === 'draft'
      ? `started ${ageSay(row.createdAt, nowMs)}`
      : `given ${ageSay(row.issuedAt ?? row.updatedAt, nowMs)}`
  /* WHAT THIS DEAL IS TO ANOTHER, said once on its own card */
  const link =
    row.state === 'draft' && row.supersedes
      ? `A new version of ${row.supersedes}.`
      : row.state === 'issued' && row.supersededBy
        ? `A new version, ${row.supersededBy}, is being written.`
        : row.state === 'superseded' && row.supersededBy
          ? `Replaced by ${row.supersededBy}.`
          : ''

  return (
    <motion.li
      layout="position"
      transition={move.travel}
      className="qd-deal"
      data-ground="plate"
      data-state={row.state}
      data-lit={lit ? '' : undefined}
      ref={keep}
      aria-labelledby={titleId}
    >
      <span className="qd-deal__shot" data-rung={cover?.rung ?? 'none'}>
        {cover ? (
          <DealPicture cover={cover} quote={quote} alt={row.boat} />
        ) : (
          <span className="qd-deal__none" aria-hidden="true">
            <Icon glyph={SailboatIcon} size="lg" />
          </span>
        )}
      </span>

      <span className="qd-deal__words">
        <h3 className="qd-deal__who" id={titleId}>
          {row.customer ?? <span className="qd-deal__nobody">No customer named yet</span>}
        </h3>
        <span className="qd-deal__what">{row.boat}</span>
        <span className="qd-deal__ref">
          {row.reference} · {when}
          {row.preparedBy ? ` · ${row.preparedBy}` : ''}
        </span>
        {link === '' ? null : <span className="qd-deal__link">{link}</span>}
      </span>

      <span className="qd-deal__total">
        {row.total !== null ? (
          <PriceFigure
            amount={row.total}
            size="lg"
            tone={row.state === 'superseded' ? 'muted' : 'ink'}
          />
        ) : (
          <span className="qd-deal__instead">{row.insteadOfTotal}</span>
        )}
      </span>

      <span className="qd-deal__acts">
        {asking ? (
          <span className="qd-ask">
            <span className="qd-ask__say">
              Discard {row.reference}? A discarded draft cannot be put back.
            </span>
            <Button intent="primary" size="sm" icon={TrashIcon} onClick={onDiscard}>
              Discard it
            </Button>
            <Button
              intent="quiet"
              size="sm"
              icon={ArrowUUpLeftIcon}
              onClick={() => setAsking(false)}
            >
              Keep it
            </Button>
          </span>
        ) : row.state === 'draft' ? (
          <>
            <Button intent="primary" icon={ArrowRightIcon} onClick={onOpen}>
              Carry on building
            </Button>
            <Button intent="quiet" size="sm" icon={TrashIcon} onClick={() => setAsking(true)}>
              Discard
            </Button>
          </>
        ) : row.state === 'issued' ? (
          <>
            <Button intent="primary" icon={FileTextIcon} onClick={onOpen}>
              Open the printed quote
            </Button>
            {row.supersededBy ? (
              <Button
                intent="quiet"
                size="sm"
                icon={ArrowRightIcon}
                onClick={() => onOpenOther(row.supersededBy!)}
              >
                {`Open ${row.supersededBy}`}
              </Button>
            ) : (
              <Button intent="quiet" size="sm" icon={ArrowsClockwiseIcon} onClick={onVersion}>
                Make a new version
              </Button>
            )}
          </>
        ) : (
          <Button intent="quiet" size="sm" icon={FileTextIcon} onClick={onOpen}>
            Open the printed quote
          </Button>
        )}
      </span>
      {said ? <output className="qd-deal__said">{said}</output> : null}
    </motion.li>
  )
}

/** The picture of what is sold: the photograph on the water, or the exact studio copy. */
function DealPicture({
  cover,
  quote,
  alt,
}: {
  cover: Cover<HeldPicture>
  quote: QuoteDef
  alt: string
}) {
  if (cover.rung === 'photo') {
    return (
      <Picture
        src={cover.picture.src}
        srcSet={srcSetOf(cover.picture)}
        sizes="(max-width: 639px) 100vw, 220px"
        alt={alt}
        width={cover.picture.width}
        height={cover.picture.height}
        shared={boatTravel(quote.rootTableId, quote.rootRowId)}
      />
    )
  }
  return (
    <Picture
      src={cover.copy.src}
      alt={alt}
      width={cover.copy.width}
      height={cover.copy.height}
      fit="contain"
    />
  )
}
