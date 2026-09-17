/* ============================================================
   TWO LINT RULES TURNED OFF FOR THIS FILE, EACH WITH ITS REASON —
   never as a convenience, and never anywhere else in the repository.

   `jsx-a11y/prefer-tag-over-role` asks for `<table>`, `<tr>` and
   `<td>` instead of `role="grid"`, `role="row"` and
   `role="gridcell"`. Two things make that the wrong trade HERE, and
   both were measured rather than assumed:

     1. The density ruler reads `document.querySelectorAll(
        '[role="row"]')` (`e2e/rulers/measure/density.ts`). A CSS
        attribute selector matches WRITTEN attributes and not implicit
        roles, so a register built out of `<tr>` elements reports zero
        readable rows — the exact "0 below threshold means the parser
        broke" failure the rulers were rebuilt to stop.
     2. A row here is a CSS grid at a desk and a two-line block in a
        hand (`quotes.css`). Changing `display` on a table element
        drops its implicit table semantics in browsers, so a `<table>`
        laid out this way announces LESS than these divs do, not more.
        And writing the roles back onto the table tags is refused by
        `no-redundant-roles` and `no-interactive-element-to-
        noninteractive-role`, which is how the two rules meet.

   `jsx-a11y/click-events-have-key-events` asks each clickable row for
   its own key handler. This grid uses the APG's `aria-activedescendant`
   pattern: ONE tab stop on the grid, which owns the whole keyboard
   vocabulary, and rows that are pointed at rather than focused. A key
   handler per row is the roving-tabindex pattern, which this
   deliberately is not — and eighteen tab stops in a register is
   exactly the shape a person presses Tab through and gives up on.
   ============================================================ */
/* eslint-disable jsx-a11y/prefer-tag-over-role, jsx-a11y/click-events-have-key-events */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { Button, Input, Kbd, PriceFigure, closesStage, isField, stageKeyOf } from '@/ui'
import type { QuoteDef } from '@/domain/model'
import { FIND_FIELD_AT, NOTHING_FOUND } from '@/domain/quote/find'
import { newVersionOf } from '@/domain/quote/commands'
import { referenceForNow } from '@/domain/quote/freeze'
import {
  ageSay,
  readRegister,
  type RegisterBand,
  type RegisterRow,
  type RegisterStateId,
} from '@/domain/quote/register'
import { useCatalogue, useQuotes } from '@/app/useStores'
import { quotes as quotesStore } from '@/state/quotes'
import { Panel } from './Panel'
import './quotes.css'

/* ============================================================
   THE QUOTES REGISTER — direction A, "The ledger", from
   docs/research/refs/quotes/notes.md §6. Provisional until the owner
   looks (docs/SCREENS.md).

   WHY A, CHOSEN RATHER THAN PICKED. The owner handed the picks over,
   and this is the only one of the four whose STRUCTURE is the state:
   three bands — Draft · Issued · Superseded — each a header of glyph,
   word and count, so no row spends width on a coloured word and on
   day one the screen prints three honest zeros instead of an apology.
   It is also the only one that fits the requirement this screen was
   given: eighteen readable rows on a dealer's laptop, which a
   photograph-led grid (C) and a centred day book (B) both spend on
   air, and which D's one-field screen does not show until somebody
   types.

   ── WHAT THE SWEEP DECIDED, AND WHERE ─────────────────────────

   THE ROW'S WEIGHT: `ref/tables/github-issues.png` and
   `live/github-pulls-vscode.png`. A leading glyph, the title at full
   weight, everything else in one quiet line. For a quote the title
   slot is the BOAT and the CUSTOMER; the reference and the age are
   the quiet line; and the total is the one thing GitHub has no
   equivalent for, so it takes a column of its own — right-aligned and
   tabular, the way `live4/mercury-banking.png` sets a balance on a
   dark register, whose "+ Create Account" is also why the act on this
   screen is the LAST ROW rather than a bar over the rows.

   THE BAND IS THE STATE: `live/linear-filters.png` — no state column
   exists; rows sit under group headers that are the state, each
   carrying an `n / m` fraction. `live4/linear-issue-status.png` adds
   the rest: the glyph's SHAPE carries the stage and hue is a tint of
   the shape, never the message. Superseded is a band and not a third
   peer state because `live4/shopify-order-statuses-scrolled.png` says
   so in as many words — an additional status, explained in a
   sentence, which this screen prints on that band's header.

   FIND BY ANYTHING, NOT A FILTER BAR: `live/stripe-search.png`
   publishes the grammar ("No additional context is necessary for most
   searches") and `live4/bringatrailer-results.png` writes it as a
   placeholder. One field, no facets, no chips nobody presses. The
   matcher is `domain/quote/find`'s own, which exists precisely so two
   surfaces cannot disagree about whether a query hits.

   WHAT THE SWEEP SAID TO AVOID, and what this screen does instead.
   `marine/boattrader-au.png` puts seven checkboxes, two dropdowns, a
   pager and two ad units above the rows and shows THREE at 1440×900;
   everything above the first row here is ONE line — the business, the
   title, the find field, the two stamp lines and the way back all sit
   on it. `marine/whitworths-search-empty.png` answers
   a search that matched nothing with 550px of white; this quotes the
   query back. `live3/github-issues-zero.png` dims `New issue` with
   nothing saying why; every refusal here is a sentence under the
   control that refused.

   ── WHAT IS TRUE ON THIS BUILD AND WOULD NOT BE ON A BOARD ────

     · EVERY ROW OPENS, AND THE SEAM WAS CUT ON 2026-09-18. This
       register shipped with three of the peek's six controls refused
       and two of those refusals false: "the quote document has no
       screen yet" and "the picker is not built yet", printed on a
       tree where both screens were live. `QuotesProps` declared no
       way out at all, so the sentences were not stale strings — the
       join had never been made, and the version this screen had just
       minted could not be opened by the screen that minted it. Both
       are gone, deleted rather than reworded, and what is left is the
       one honest case: a render handed no way anywhere, which is a
       component test and never a browser.
     · A DRAFT AND AN ISSUED QUOTE OPEN IN DIFFERENT PLACES, and the
       act says which. A draft opens where it is written — the
       configurator, which can still change it — and an issued one
       opens as the paper the customer was given. Home decided this on
       2026-09-18 and this screen does not disagree with it: the state
       travels with the id and the ROUTE owns both addresses, so the
       register knows what it is opening and not where that is.
     · MAKE A NEW VERSION REALLY WORKS. It is the one act on this
       screen that changes a document, and it goes through
       `newVersionOf` — the supersedes link the contract already
       carries — and `quotes.file`, so the new draft is filed, the
       issued one is untouched, and the band it moves to is derived
       from the link rather than written anywhere. Having somewhere to
       open it is what finishes that act: it now says the reference it
       made and the panel moves onto it, live.
     · NO PHOTOGRAPH STANDS HERE. A picture belongs to the row it
       depicts; a boat photograph over an empty register would be a
       stand-in for a quote that does not exist. The empty state says
       that out loud rather than leaving a hole.
   ============================================================ */

/* ============================================================
   THE TWO REFUSALS LEFT ON THIS SCREEN, and neither is about an
   unbuilt screen. Both describe the ONE state in which this register
   genuinely has nowhere to send anybody: a render that was handed no
   way there. The screen never reaches for the router (so it can be
   drawn and pressed in a component test), which means "no way there"
   is a real state it has to have words for — and a control that keeps
   its name, its focus and a sentence is the house rule for it
   (`src/ui/Button.tsx`: there is no `disabled` prop).
   ============================================================ */

/** Said where the press happened, when nothing handed this screen a
 *  way to a document. */
export const NO_WAY_TO_OPEN =
  'This screen was handed no way to open a document, so nothing was opened. A draft opens at /quote/$id and an issued quote at /quote/$id/document.'
/** Said at the act, when nothing handed this screen a way to the picker. */
export const NO_WAY_TO_THE_PICKER =
  'This screen was handed no way to the picker, so nothing was started. The picker is at /quote/new.'
export const ONLY_ISSUED_IS_VERSIONED =
  'This one is still a draft, so it can simply be changed. A new version is how an ISSUED quote is reopened without editing what the customer was given.'
export const ISSUED_IS_NOT_DISCARDED =
  'This quote has been given to the customer, so it stays. Make a new version if the deal has changed.'

/* HOW MANY QUOTES BEFORE THERE IS A FIND FIELD AT ALL, and why the
   domain's own constant is the right one rather than a new number.

   `domain/quote/find` carries `FIND_FIELD_AT = 8` with its
   measurement: 90px rows in a 761px port, so 7.46 fit and the eighth
   is where the list starts hiding things — "a list that fits needs no
   tool for finding things in it", and a filter bar over a five-item
   menu is the clutter that rule exists to remove.

   This register's rows are 28px and it owes eighteen at 1280×800, so
   at a desk it hides nothing until the nineteenth. But the threshold
   belongs to the viewport that shows LEAST, not most: 844×390 is a
   phone on its side and shows about eight rows, and 390×844 draws
   two-line rows and shows fewer. Eight is therefore still the number,
   and it is the one the domain already states rather than a second
   one written here to disagree with it. */

export interface QuotesProps {
  /** whose register it is, read off what was opened; null is honest */
  business?: string | null
  /** the way back to Home, handed in so the screen never reaches for
   *  the router and can be pressed in a component test */
  goHome?: () => void
  /** the door to the Master Price File, for a browser with no sheet */
  openTheFile?: () => void
  /* ── THE TWO SEAMS, CUT 2026-09-18 ──────────────────────────
     Each is handed in rather than reached for, exactly as `goHome`
     and `openTheFile` are, so this screen can be rendered and pressed
     without a router — and so the ADDRESSES stay in `src/routes`,
     which is the only place in this app that knows what a URL is. */
  /** the picker, at `/quote/new`, where a quote is started */
  newQuote?: () => void
  /** ONE FILED DOCUMENT, OPENED WHERE IT BELONGS. The state travels
   *  with the id because the two states open in two different places
   *  — a draft where it is written, an issued quote as the paper the
   *  customer was given — and which address that is belongs to the
   *  route, not to a register. */
  openQuote?: (id: string, state: RegisterStateId) => void
  /** the clock, injected: a test says which instant it is asking about */
  now?: () => Date
  /** the query the address arrived with */
  query?: string
  /** the row the address arrived at, by reference */
  at?: string
  /** how the address is kept in step — see THE ADDRESS, below */
  onPosition?: (position: { find?: string; at?: string }) => void
}

/* ============================================================
   THE ADDRESS. A position inside a screen is a URL search param
   (CLAUDE.md), and this screen has two: what was typed into the find
   field, and which row is open in the panel. Both are read ONCE, from
   the props the route hands in, and written back up as they change.

   THE ADDRESS FOLLOWS THE SCREEN AND THE SCREEN DOES NOT FOLLOW THE
   ADDRESS AFTER THE FIRST READ, deliberately. A register where every
   arrow key is a history entry has a Back button that walks a person
   through eighteen rows one at a time instead of taking them back to
   where they came from; and a field whose value is round-tripped
   through the router on every keystroke is a field that lags behind
   the typing. So the route writes with `replace`, the address is
   always shareable and reloadable, and the keyboard stays immediate.
   ============================================================ */

/** The clock, as a stable reference: a default written inline is a
 *  new function every render, and the callbacks that depend on it
 *  would be rebuilt on every keystroke. */
const THE_CLOCK = (): Date => new Date()

export function Quotes({
  business = null,
  goHome,
  openTheFile,
  newQuote,
  openQuote,
  now = THE_CLOCK,
  query: askedFor = '',
  at: arrivedAt = '',
  onPosition,
}: QuotesProps) {
  const filed = useQuotes((s) => s.quotes)
  const read = useQuotes((s) => s.loaded)
  const problem = useQuotes((s) => s.problem)
  const sheetStatus = useCatalogue((s) => s.status)
  const sheetTables = useCatalogue((s) => s.tables)
  const sheetRows = useCatalogue((s) => s.rows)

  const [query, setQuery] = useState(askedFor)
  const register = useMemo(() => readRegister(filed, query), [filed, query])

  /* THE CURSOR IS A REFERENCE, NOT AN INDEX. A row's place in the list
     moves the moment a query narrows it or a version is made; a
     remembered index would then point at somebody else's quote. */
  const [wanted, setCursor] = useState<string>(arrivedAt)
  const [asked, setPeeking] = useState<boolean>(arrivedAt !== '')
  const [said, setSaid] = useState<string | null>(null)

  const list = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLElement>(null)
  const rowsRef = useRef(new Map<string, HTMLDivElement>())
  /* a held Space is one keydown that repeats; a tapped one is not */
  const heldSpaceAt = useRef<number | null>(null)

  const shown = register.shown

  /* THE CURSOR NEVER POINTS AT NOTHING WHILE THERE IS SOMETHING TO
     POINT AT, and it is DERIVED rather than repaired. A query that
     narrows the list out from under it, or a draft discarded while it
     was open, simply resolves to the first row that is still here —
     and the panel is shut, because the document it was showing is not
     on screen any more. Working this out during the render rather than
     in an effect is the difference between one paint and three, and
     between a rule a reader can follow and a sequence they have to
     replay in their head. */
  const known = shown.some((r) => r.reference === wanted)
  const cursor = known ? wanted : (shown[0]?.reference ?? '')
  /* THE PANEL FOLLOWS THE CURSOR, and shuts itself when there is no
     cursor to follow: a query that matches nothing, or a draft
     discarded while it was the last one, leaves the register bare and
     the panel goes back to saying what the register is. */
  const peeking = asked && cursor !== ''
  const here = shown.findIndex((r) => r.reference === cursor)
  const atRow: RegisterRow | undefined = here >= 0 ? shown[here] : undefined
  const chosen: QuoteDef | undefined = atRow ? filed.find((q) => q.id === atRow.id) : undefined

  useEffect(() => {
    onPosition?.({ find: query === '' ? undefined : query, at: peeking ? cursor : undefined })
  }, [onPosition, query, cursor, peeking])

  const goTo = useCallback((reference: string) => {
    setCursor(reference)
  }, [])

  const step = useCallback(
    (by: number) => {
      if (shown.length === 0) return
      const from = here < 0 ? 0 : here
      const next = Math.min(shown.length - 1, Math.max(0, from + by))
      setCursor(shown[next]!.reference)
    },
    [here, shown],
  )

  /* the cursor row is kept on screen, without smoothing: the sweep
     found one motion in 169 frames and it was a crossfade caught
     printing two boats over each other */
  /* A ROW ALREADY ON SCREEN IS NOT SCROLLED TO. `block: 'nearest'`
     reads as though it would leave a visible row alone and does not:
     measured at 1280×800 on a register of 23, the cursor landing on
     the first row at paint scrolled its own band header off the top,
     so the register opened with no word above its first rows. The
     port is asked first, and nothing moves unless the row is really
     outside it. */
  useEffect(() => {
    if (cursor === '') return
    const row = rowsRef.current.get(cursor)
    const port = list.current
    if (!row || !port) return
    const box = row.getBoundingClientRect()
    const inside = port.getBoundingClientRect()
    if (box.top >= inside.top && box.bottom <= inside.bottom) return
    row.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  /* ============================================================
     OPENING ONE, WHICH IS WHAT A REGISTER IS FOR.

     The peek is the second level of disclosure and there is no third
     (`Panel.tsx`), so the way OUT of it is a navigation and not a
     bigger panel. One function serves the button, the Enter key and a
     double press on the row, so the three cannot drift: whichever way
     a person asks, the same document opens in the same place and the
     same sentence is said where nothing could.
     ============================================================ */
  const openIt = useCallback(
    (row: RegisterRow) => {
      if (!openQuote) {
        setSaid(NO_WAY_TO_OPEN)
        return
      }
      openQuote(row.id, row.state)
    },
    [openQuote],
  )

  /** THE ACT AT THE FOOT OF THE REGISTER, pressed or typed. */
  const startOne = useCallback(() => {
    if (!newQuote) {
      setSaid(NO_WAY_TO_THE_PICKER)
      return
    }
    newQuote()
  }, [newQuote])

  /** THE ONE ACT ON THIS SCREEN THAT CHANGES A DOCUMENT. */
  const makeVersion = useCallback(
    (from: QuoteDef) => {
      if (from.state !== 'issued') {
        setSaid(ONLY_ISSUED_IS_VERSIONED)
        return
      }
      const at = now()
      const made = newVersionOf(from, referenceForNow(filed, at), at.toISOString())
      quotesStore.getState().file(made.quote, made.event)
      setCursor(made.quote.reference)
      setPeeking(true)
      setSaid(
        `${made.quote.reference} is a new version of ${from.reference}. It is a draft; nothing on ${from.reference} was changed, and it is now in Superseded.`,
      )
    },
    [filed, now],
  )

  /* THROWING A DRAFT AWAY. `discard` answers `{ refused: '' }` when it
     DID discard — an empty sentence is the store's way of saying there
     was nothing to refuse — so the test is the sentence's emptiness
     and not the shape of the outcome. A caller that read "refused" off
     the key alone would print nothing at all on the one act with no
     way back. */
  const discard = useCallback((quote: QuoteDef) => {
    const outcome = quotesStore.getState().discard(quote.id)
    const refusal = 'refused' in outcome && outcome.refused.trim() !== '' ? outcome.refused : null
    setSaid(refusal ?? `${quote.reference} was discarded. It is not filed here any more.`)
  }, [])

  /* ============================================================
     THE KEYBOARD, BOUND TO THE REGISTER AND NOT TO THE WINDOW.

     WCAG 2.2 SC 2.1.4 Character Key Shortcuts is a LEVEL A criterion,
     and `docs/reference/dense-tables-and-selection.md` records that
     nobody in the studied cohort meets it: Linear and Superhuman both
     ship large single-key vocabularies and neither documents
     remapping or disabling. The criterion's own third exemption is
     "Active only on focus", and that is what this is — every key
     below is handled on the grid, so a single keystroke means
     something here and nothing anywhere else in the app. The legend
     under the register says so rather than leaving it to be found.

     THE VOCABULARY IS THE SWEEP'S, taken from the two products that
     publish one: J/K and the arrows to move (Linear), tap Space to
     peek and hold Space to glance with the arrows live inside it
     (Linear's Peek, modelled on Quick Look), `/` to the find field,
     Escape to close. Each is printed where the act is.
     ============================================================ */
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (isField(event.target)) return
    const key = event.key
    const plain = !event.metaKey && !event.ctrlKey && !event.altKey

    if (!plain) return

    if (key === 'ArrowDown' || key === 'j' || key === 'J') {
      event.preventDefault()
      step(1)
      return
    }
    if (key === 'ArrowUp' || key === 'k' || key === 'K') {
      event.preventDefault()
      step(-1)
      return
    }
    if (key === 'Home') {
      event.preventDefault()
      if (shown[0]) setCursor(shown[0].reference)
      return
    }
    if (key === 'End') {
      event.preventDefault()
      const last = shown[shown.length - 1]
      if (last) setCursor(last.reference)
      return
    }
    if (key === ' ' || key === 'Spacebar') {
      event.preventDefault()
      if (event.repeat) return
      heldSpaceAt.current = now().getTime()
      setPeeking(true)
      return
    }
    if (key === 'Enter') {
      /* ENTER IS "OPEN IT", AND NOW IT OPENS IT. It used to open the
         PANEL, because opening was refused and the refusal was drawn
         under the control it belonged to; with somewhere to go, Enter
         is the key printed on that control and does what the control
         does. Space still peeks, which is the whole of the sweep's
         distinction: let me see, and let me read. */
      event.preventDefault()
      if (atRow) openIt(atRow)
      return
    }
    if (key === '/') {
      event.preventDefault()
      field.current?.focus()
      return
    }
    if (key === 'v' || key === 'V') {
      event.preventDefault()
      if (chosen) makeVersion(chosen)
      return
    }
    if (key === 'n' || key === 'N') {
      event.preventDefault()
      startOne()
      return
    }
    if (key === 'Escape' && closesStage(stageKeyOf(event.nativeEvent))) {
      event.preventDefault()
      if (peeking) setPeeking(false)
      else if (query !== '') setQuery('')
      return
    }
  }

  /** HOLD SPACE IS A GLANCE, TAP SPACE IS A PEEK. Linear's own
   *  ergonomics, and the sharpest single detail in the whole sweep:
   *  it separates "let me see" from "let me read" without inventing a
   *  mode. Under a fifth of a second the press was a tap and the
   *  panel stays; longer and it closes with the key. */
  const onKeyUp = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== ' ' && event.key !== 'Spacebar') return
    const down = heldSpaceAt.current
    heldSpaceAt.current = null
    if (down === null) return
    if (now().getTime() - down >= 200) setPeeking(false)
  }

  const onFieldKey = (event: ReactKeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Escape') {
      /* rung 2: a field owns its own Escape, so clearing the query
         here takes nothing from anything above (src/ui/keys.ts) */
      event.preventDefault()
      setQuery('')
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'Enter') {
      event.preventDefault()
      list.current?.focus()
      if (shown[0] && here < 0) setCursor(shown[0].reference)
    }
  }

  const sheetOpen = sheetStatus === 'ready' && Object.keys(sheetTables).length > 0
  const sheetRowCount = useMemo(
    () => Object.values(sheetRows).reduce((n, kept) => n + kept.length, 0),
    [sheetRows],
  )
  const findable = register.held >= FIND_FIELD_AT
  const narrowed = query.trim() !== ''

  return (
    <main className="qr" data-testid="quotes">
      <header className="qr-head">
        <div className="qr-head__who">
          <p className="qr-eyebrow">{business ?? 'This business has not been named yet'}</p>
          <h1 className="qr-title">Quotes</h1>
        </div>

        {/* THE FIND FIELD IS IN THE HEAD, ON THE HEAD'S OWN LINE, and
            that is a density decision as much as a composition one: a
            find row of its own costs this register forty-four pixels,
            which is a row and a half of the eighteen it owes at
            1280×800. The head is already two lines tall on both sides,
            so a 36px field sits inside the height it has.

            IT IS LABELLED BUT NOT CAPTIONED. The accessible name is on
            the control; the placeholder carries Stripe's own grammar
            ("No additional context is necessary for most searches"),
            written the way `live4/bringatrailer-results.png` writes
            it. A visible label beside it would spend 90px of the head
            saying what the placeholder already says. */}
        {findable ? (
          <div className="qr-find">
            <span className="qr-find__field">
              <Input
                id="qr-find-field"
                ref={field}
                type="search"
                aria-label="Find a quote"
                value={query}
                onValueChange={setQuery}
                onKeyDown={onFieldKey}
                aria-describedby={narrowed ? 'qr-find-said' : undefined}
                placeholder="Reference, customer, boat, or who prepared it"
              />
            </span>
            {/* the cap is the screen's child rather than the
                primitive's, so the screen can take it away where
                there is no keyboard to press it on */}
            <span className="qr-find__key">
              <Kbd>/</Kbd>
            </span>
          </div>
        ) : null}

        <div className="qr-head__stamp">
          {problem !== null ? (
            <p className="qr-stamp-line" role="alert">
              {problem}
            </p>
          ) : !read ? (
            <p className="qr-stamp-line">Reading what this browser has kept…</p>
          ) : (
            <p className="qr-stamp-line">
              <b>{register.held.toLocaleString('en-AU')}</b>{' '}
              {register.held === 1 ? 'quote is' : 'quotes are'} filed in this browser
              {/* WHY THERE IS NO FIELD, said beside the count it is
                  about rather than on a line of its own. `FIND_FIELD_AT`
                  is the domain's own measured threshold. */}
              {/* AND IT COUNTS ITSELF IN THE RIGHT NUMBER. "1 quote is
                  filed in this browser, and all of them are on this
                  screen" was printing a plural about one document. */}
              {register.held === 0 || findable
                ? ''
                : register.held === 1
                  ? ', and it is on this screen'
                  : ', and all of them are on this screen'}
            </p>
          )}
          <p className="qr-stamp-line qr-stamp-file">
            {sheetOpen ? (
              <>
                Priced from the Master Price File ·{' '}
                <b>{Object.keys(sheetTables).length.toLocaleString('en-AU')}</b> tables ·{' '}
                <b>{sheetRowCount.toLocaleString('en-AU')}</b> rows
              </>
            ) : (
              'No price file is open in this browser. A quote already written still reads: every figure on it was frozen when it was written.'
            )}
          </p>
        </div>

        {goHome ? (
          <div className="qr-head__back">
            <Button intent="veiled" onClick={goHome}>
              Home
            </Button>
          </div>
        ) : null}
      </header>

      {/* WHAT A NARROWING DID, SAID WHERE THE ROWS ARE — never under
          the field, where it would cost the register a line on every
          screen including the ones nobody is searching.
          `marine/marinemax-empty.png` quotes the term back in the
          results area and keeps the frame; this does the same, and the
          band headers carry the `n / m` fraction beside it. */}
      {narrowed ? (
        <p className="qr-narrowed" id="qr-find-said" role="status">
          {shown.length === 0
            ? NOTHING_FOUND(query)
            : `${shown.length.toLocaleString('en-AU')} of ${register.held.toLocaleString('en-AU')} match “${query.trim()}”. Every word has to hit something, so typing more narrows.`}
        </p>
      ) : null}

      <div className="qr-body" data-bare={register.bare ? '' : undefined}>
        <div className="qr-ledger" data-bare={register.bare ? '' : undefined}>
          <div
            className="qr-list"
            ref={list}
            role="grid"
            tabIndex={0}
            aria-label="Quotes"
            aria-rowcount={shown.length}
            aria-activedescendant={atRow ? rowId(atRow.reference) : undefined}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
          >
            {register.bands.map((band) => (
              <Band
                key={band.spec.id}
                band={band}
                bare={register.bare}
                narrowed={narrowed}
                cursor={cursor}
                peeking={peeking}
                now={now}
                onPoint={(reference) => {
                  goTo(reference)
                  setPeeking(true)
                  list.current?.focus()
                }}
                onOpen={openIt}
                hold={(reference, element) => {
                  if (element) rowsRef.current.set(reference, element)
                  else rowsRef.current.delete(reference)
                }}
              />
            ))}
          </div>

          {/* THE ACT IS THE LAST ROW OF THE REGISTER, not a bar over it
              and never a floating one: `live4/mercury-banking.png`
              puts "+ Create Account" exactly here, in the flow, where a
              person who has read to the bottom of the list is already
              looking. The list's bottom rule is this row's, so the two
              read as one frame.

              THE VOCABULARY IS PRINTED ON THAT SAME LINE. Superhuman
              renders the shortcut inline to teach it, and a legend on a
              line of its own was costing this register a row and a half
              of the eighteen it owes — measured at 1280×800, 44px for
              two lines of 11px. Each key is also printed beside its own
              act: N here, V and Enter in the panel, Esc on Close. */}
          <div className="qr-act">
            <span className="qr-act__who">
              {/* AMBER WHEN IT CAN ACT, AND NOT BEFORE — and it can
                  act now. The comment that stood here said this
                  control "will be amber the day the picker exists";
                  the picker has existed since 2026-09-17 and this was
                  still a dark chip under a false sentence. It is the
                  live `--color-act` while it is the thing to press.

                  AND IT STEPS BACK WHILE A DOCUMENT IS OPEN. One
                  screen has one act (`src/ui/Button.tsx`), and the
                  thing a person presses here depends on whether they
                  have found what they came for: with a document under
                  the cursor it is "open it", in the panel, and this
                  becomes the quieter of the two rather than a second
                  amber arguing with it across the screen.

                  THE KEY IS ON THE CONTROL, not beside it. Beside it
                  is where it was, and where it ended up 500px away:
                  the Button primitive is a frame sized by the widest
                  of the button and its refusal, so a sibling keycap
                  sits after the SENTENCE rather than after the
                  button. Inside, it is the shape a search field wears
                  its own `/` in, and `aria-label` keeps the
                  accessible name the two words a person would say. */}
              <Button
                intent={peeking ? 'veiled' : 'act'}
                aria-label="New quote"
                onClick={startOne}
                refusedBecause={newQuote ? undefined : NO_WAY_TO_THE_PICKER}
              >
                New quote
                <Kbd>N</Kbd>
              </Button>
            </span>

            {/* THE FOUR KEYS WHOSE ACT HAS NO CONTROL TO SIT BESIDE.
                V sits on "Make a new version", Esc on "Close" and N on
                the act to the left of this line, each printed where
                the act is; these four move and read, and there is
                nothing to print them on but the register itself. */}
            {/* AND IT IS NOT DRAWN WHERE THERE IS NO KEYBOARD. The
                critique counted this legend on a 390px phone, which
                has none of these keys; `pointer: coarse` is the
                browser's own answer to "is there a mouse and a
                keyboard here", and `quotes.css` takes the line away
                on a device that says no. Nothing is lost: every one
                of the four still works the moment a keyboard is
                plugged in, and the three whose act HAS a control are
                printed on it. */}
            <p className="qr-keys">
              <Kbd>J</Kbd>
              <Kbd>K</Kbd> move · <Kbd>Space</Kbd> peeks · <Kbd>Enter</Kbd> opens · <Kbd>Esc</Kbd>{' '}
              closes
            </p>
          </div>
        </div>

        <Panel
          bare={register.bare}
          read={read}
          register={register}
          quote={chosen}
          row={peeking ? atRow : undefined}
          all={filed}
          now={now}
          narrowed={narrowed}
          said={said}
          sheetOpen={sheetOpen}
          openTheFile={openTheFile}
          onGoTo={(reference) => {
            goTo(reference)
            setPeeking(true)
            list.current?.focus()
          }}
          onClose={() => {
            setPeeking(false)
            list.current?.focus()
          }}
          onNewVersion={makeVersion}
          onDiscard={discard}
          onOpen={openIt}
          canOpen={Boolean(openQuote)}
        />
      </div>
    </main>
  )
}

/** One id per row, so `aria-activedescendant` names the row a reader
 *  is on. The reference is unique per document and is what a person
 *  says out loud, which makes it a better key than a generated id. */
export const rowId = (reference: string): string => `qr-row-${reference}`

/* ---------------------------------------------------------- */
/* One band                                                    */
/* ---------------------------------------------------------- */

function Band({
  band,
  bare,
  narrowed,
  cursor,
  peeking,
  now,
  onPoint,
  onOpen,
  hold,
}: {
  band: RegisterBand
  bare: boolean
  narrowed: boolean
  cursor: string
  peeking: boolean
  now: () => Date
  onPoint: (reference: string) => void
  onOpen: (row: RegisterRow) => void
  hold: (reference: string, element: HTMLDivElement | null) => void
}) {
  const { spec } = band
  return (
    /* THE GROUP IS NAMED, so a reader entering it is told which band
       these rows are in — which is the whole point of a register whose
       state is its structure rather than a column. */
    <div className="qr-band" role="rowgroup" aria-label={spec.word} data-state={spec.id}>
      <div className="qr-bandhead" role="row">
        <div className="qr-bandhead__cell" role="gridcell" aria-colspan={5}>
          <span className="qr-glyph" data-state={spec.id} aria-hidden="true" />
          <span className="qr-bandhead__word">{spec.word}</span>
          <span className="qr-bandhead__count">
            {/* THE COUNT LIVES WITH THE THING IT COUNTS, and while a
                query is narrowing it is a fraction — Linear's own
                `2 / 11`, which says both what is here and what is
                filed. On day one it is a single honest zero. */}
            {narrowed
              ? `${band.rows.length.toLocaleString('en-AU')} / ${band.held.toLocaleString('en-AU')}`
              : band.held.toLocaleString('en-AU')}
          </span>
          {band.summed > 0 ? (
            <span className="qr-bandhead__sum">
              <PriceFigure amount={band.sum} />
              {band.summed < band.rows.length ? (
                <span className="qr-bandhead__of">
                  {' '}
                  from {band.summed} of {band.rows.length}
                </span>
              ) : null}
            </span>
          ) : null}
        </div>
      </div>

      {band.rows.length === 0 ? (
        <div className="qr-bandempty" role="row">
          <div className="qr-bandempty__cell" role="gridcell" aria-colspan={5}>
            <span className="qr-bandempty__was">
              {narrowed && band.held > 0
                ? `None of the ${band.held.toLocaleString('en-AU')} filed here match.`
                : spec.empty}
            </span>
            {/* WHAT THE BAND IS, said on the one day it is worth the
                height: a register with nothing in it is a register
                being read for the first time, and the three sentences
                are the whole structure of the screen. Once rows exist
                the header is glyph, word, count and sum, because a
                sentence repeated above eighteen rows is a sentence
                nobody reads twice. */}
            {bare ? <span className="qr-bandempty__say">{spec.say}</span> : null}
          </div>
        </div>
      ) : (
        band.rows.map((row) => (
          <Row
            key={row.id}
            row={row}
            on={row.reference === cursor}
            peeking={peeking && row.reference === cursor}
            now={now}
            onPoint={onPoint}
            onOpen={onOpen}
            hold={hold}
          />
        ))
      )}
    </div>
  )
}

/* ---------------------------------------------------------- */
/* One row                                                     */
/* ---------------------------------------------------------- */

function Row({
  row,
  on,
  peeking,
  now,
  onPoint,
  onOpen,
  hold,
}: {
  row: RegisterRow
  on: boolean
  peeking: boolean
  now: () => Date
  onPoint: (reference: string) => void
  onOpen: (row: RegisterRow) => void
  hold: (reference: string, element: HTMLDivElement | null) => void
}) {
  /* WHICH INSTANT THIS ROW IS AGED FROM. An issued quote is dated by
     the act that froze it; a draft by the last time somebody touched
     it. `live/github-releases-vscode.png` ages by the act, not by the
     record. */
  const at = row.issuedAt ?? row.updatedAt

  return (
    <div
      className="qr-row"
      role="row"
      id={rowId(row.reference)}
      ref={(element) => {
        hold(row.reference, element)
      }}
      data-state={row.state}
      data-on={on ? '' : undefined}
      data-peeking={peeking ? '' : undefined}
      aria-selected={on}
      onClick={() => onPoint(row.reference)}
      /* ONE PRESS PEEKS, TWO OPEN — the register vocabulary every desk
         already knows, and the pointer's half of `Space` and `Enter`.
         The double press fires two single ones first, which is exactly
         right here: the row is pointed at, the panel opens on it, and
         then the document opens. Nothing is undone and nothing is
         written. */
      onDoubleClick={() => onOpen(row)}
    >
      <span className="qr-cell qr-cell--glyph" role="gridcell" aria-label={stateWord(row.state)}>
        <span className="qr-glyph" data-state={row.state} aria-hidden="true" />
      </span>

      <span className="qr-cell qr-cell--who" role="gridcell">
        <span className="qr-boat">{row.boat}</span>
        <span className="qr-customer">{row.customer ?? 'Addressed to nobody yet'}</span>
        {row.supersedes ? (
          <span className="qr-chain">replaces {row.supersedes}</span>
        ) : row.supersededBy ? (
          <span className="qr-chain">replaced by {row.supersededBy}</span>
        ) : null}
      </span>

      <span className="qr-cell qr-cell--total" role="gridcell">
        {row.total === null ? (
          /* MarineMax puts "Request Pricing" exactly where the price
             stands. This says which of the two reasons it is. */
          <span className="qr-nofigure">{row.insteadOfTotal}</span>
        ) : (
          <PriceFigure amount={row.total} />
        )}
      </span>

      <span className="qr-cell qr-cell--ref" role="gridcell">
        {row.reference}
      </span>

      <span className="qr-cell qr-cell--age" role="gridcell">
        {ageSay(at, now().getTime())}
      </span>
    </div>
  )
}

/** The word a reader hears where a sighted person sees the glyph. */
export function stateWord(state: RegisterRow['state']): string {
  return state === 'draft' ? 'Draft' : state === 'issued' ? 'Issued' : 'Superseded'
}
