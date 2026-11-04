import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import {
  ArrowUUpLeftIcon,
  CheckIcon,
  PlusIcon,
  UploadSimpleIcon,
  UserIcon,
  UserSwitchIcon,
} from '@phosphor-icons/react'
import { Button, Field, Input, Plate, Refusal, Segmented, Toggle, say, undo } from '@/ui'
import { useCatalogue, useQuotes, useSession } from '@/app/useStores'
import { heldPaperMark, letterheadNow } from '@/app/northside'
import { Letterhead, type LetterheadLine } from '@/screens/document/Document'
import { isDone, type CatalogueCommand } from '@/domain/catalogue/commands'
import { changeOrg, withKey } from '@/domain/catalogue/orgCommands'
import { newId } from '@/domain/id'
import type { OrgPerson, OrgProfile, QuoteDef } from '@/domain/model'
import {
  DETAIL_LINES,
  detailSaid,
  detailText,
  readDetail,
  type DetailKey,
} from '@/domain/northside/details'
import {
  changeRefusal,
  mayChange,
  personNameRefusal,
  setApartRefusal,
} from '@/domain/northside/people'
import {
  depositDue,
  depositRuleSaid,
  depositTypedOf,
  depositWayOf,
  readDepositRule,
  type DepositWay,
} from '@/domain/northside/deposit'
import { lastSaid, preparedBy } from '@/domain/northside/decided'
import { MARK_FLOOR } from '@/domain/northside/pixels'
import { saidRatio } from '@/domain/northside/colour'
import { quoteTotals } from '@/domain/quote/totals'
import { money } from '@/domain/money'
import { catalogue } from '@/state/catalogue'
import { readMark } from './measure'
import { DESK, clearOfTheToast, useMedia, useReading, useStuck } from './hooks'
import { LANDS, Proof, litOf, type Lit } from './Proof'
import { Elsewhere } from './Elsewhere'
import { Water } from './Water'
import './manage.css'

/* ============================================================
   SETTINGS — "Paper and water", board C of docs/directions/manage-boards/,
   the judge's pick of 2026-10-29, deepened by the data round's judge of
   2026-11-04 (docs/directions/data-round/manage/judge.md, DEEPEN).

   ONE PAGE SPLIT DOWN ITS MIDDLE BY WHERE A CHOICE LANDS. The left half
   is the white paper — what prints on every quote: the letterhead as the
   quote itself draws it (the document's own `Letterhead`, on the newest
   draft), every empty line a dashed box that prints nothing and opens its
   field when pressed; what every quote says, the deposit now a rule the
   quote works out from its own total; who prepares it, as the cards they
   print; and, at a desk, the quote's own first and last pages with the
   line being set lit where it lands. The right half is the water — what
   shows on every screen: Home drawn small, standing beside its choices at
   a desk, wearing the colour and the photograph before anything is kept,
   with "Changed, not kept" docked at the window's foot.

   ONE INDEX OF EVERYTHING NORTHSIDE HAS DECIDED: the page's own parts as
   a row of words (standing at the window's head in a hand), who changed
   a setting last, and the decisions kept in other rooms, counted, at the
   page's end.

   NOTHING IS WRITTEN FOR NORTHSIDE. Every line starts empty and prints
   nothing. No address, phone or ABN is offered: docs/DECISIONS.md holds no
   yes to the original HelmLogic's.

   EVERY CHANGE IS ONE STEP WITH ITS UNDO, through the catalogue's own
   stack (`src/domain/catalogue/orgCommands.ts`), and a person Northside
   has set apart is refused here, at the top of the page, once, in a
   sentence — never by a silently dead control.
   ============================================================ */

/** Where a person is on this screen: which line or person is open. A URL search param. */
export interface ManagePlace {
  /** the letterhead line, or what every quote says, being set; 'mark' for the paper's mark */
  line?: string
  /** the person being set, by id, or 'new' */
  person?: string
}

export interface ManageProps {
  place?: ManagePlace
  /** move to another place on this screen (the route writes it with `replace`) */
  onPlace?: (next: ManagePlace) => void
  /** SOMEONE ELSE AT THE DESK: the name given at the door is let go and the door asks again
   *  (exposure.md: `signOut` had no caller, so a shared computer kept one name on every quote) */
  onChangeDesk?: () => void
  /** follow a door to another screen without a page load */
  go?: (href: string) => void
}

/** Said where no price list is open: there is no business to keep details for. */
export const NOTHING_OPEN =
  'No price list is open on this computer, so there is no business to set details for. Open the Master Price File first.'

/** Apply a settings change; a refusal comes back as its sentence, a kept change as a toast. */
function keep(command: CatalogueCommand): string | null {
  const outcome = catalogue.getState().apply(command)
  if (!isDone(outcome)) return outcome.refused === '' ? null : outcome.refused
  const eventId = outcome.event.id
  undo(
    outcome.said,
    () => {
      const back = catalogue.getState().undo(eventId)
      if (isDone(back)) say(back.said, { id: 'manage-step' })
      else if (back.refused !== '') say(back.refused, { id: 'manage-step' })
    },
    { id: 'manage-step', testId: 'manage-step' },
  )
  clearOfTheToast()
  return null
}

/** AN EDITOR OPENED STANDS CLEAR OF THE FOOT, where the Undo of the last step may still stand (the
 *  judge, P3: at 390 it covered the person editor's Email field) */
function useClearOfTheFoot<T extends HTMLElement>(): RefObject<T | null> {
  const box = useRef<T>(null)
  useEffect(() => {
    const el = box.current
    if (!el || typeof el.scrollIntoView !== 'function') return
    const frame = requestAnimationFrame(() => el.scrollIntoView({ block: 'nearest' }))
    return () => cancelAnimationFrame(frame)
  }, [])
  return box
}

const NOWHERE: ManagePlace = {}

/** How long a line just kept stays lit: its Undo's own life (src/ui/Toaster.tsx, `undo`, 8 s). */
const AS_LONG_AS_ITS_UNDO = 8000

/** The parts of the page, in the order the index names them. */
const PARTS: ReadonlyArray<{ id: string; word: string }> = [
  { id: 'mg-letterhead-g', word: 'Letterhead' },
  { id: 'mg-says-g', word: 'Quote words' },
  { id: 'mg-people-g', word: 'People' },
  { id: 'mg-proof', word: 'The quote' },
  { id: 'mg-colour-g', word: 'Colour' },
  { id: 'mg-pictures-g', word: 'Pictures' },
  { id: 'mg-watermark-g', word: 'Mark' },
  { id: 'mg-home-arrange', word: 'Home' },
  { id: 'mg-shape-g', word: 'Shape' },
  { id: 'mg-elsewhere', word: 'Elsewhere' },
]
const PART_IDS = PARTS.map((p) => p.id)

export function Manage({ place = NOWHERE, onPlace, onChangeDesk, go }: ManageProps) {
  const status = useCatalogue((s) => s.status)
  const org = useCatalogue((s) => s.org)
  const business = useCatalogue((s) => s.business)
  const stamps = useCatalogue((s) => s.stamps)
  const who = useSession((s) => s.name)
  const quotes = useQuotes((s) => s.quotes)
  const quotesRead = useQuotes((s) => s.loaded)
  const desk = useMedia(DESK)

  const open = status === 'ready' && (business ?? '').trim() !== ''
  const apart = changeRefusal(org, who)
  const move = useCallback((next: ManagePlace) => onPlace?.(next), [onPlace])

  /* THE NEWEST DRAFT ON THIS COMPUTER: the letterhead and the pages are drawn on it, never on a
     made-up quote */
  const draft = useMemo(() => newestDraft(quotes), [quotes])
  /* COUNTED, so the note under the letterhead never says no quote was started when one was
     given (built-critique-m4.md, major 6: it counted drafts only) */
  const given = useMemo(() => quotes.filter((q) => q.state !== 'draft').length, [quotes])
  const last = lastSaid(stamps, new Date())
  const reading = useReading(PART_IDS, '.mg-index', open && !desk)

  return (
    <main
      className="mg"
      data-testid="manage"
      data-read={status === 'ready' && quotesRead ? '' : undefined}
    >
      {/* THE PAGE'S NAME, and who changed what last (the judge, P15 and L4) */}
      <header className="mg-top">
        <div className="mg-top__words">
          <h1 className="mg-title">Settings</h1>
          <p className="mg-top__say">
            {`${business?.trim() || 'Northside'}, as it prints on every quote and shows on every screen.`}
          </p>
        </div>
        {open ? (
          <p className="mg-top__last" data-testid="manage-last">
            {last
              ? `Last changed: ${last}.`
              : org
                ? 'Who changes a setting, and when, is kept from the next change.'
                : 'Nothing is set yet: every quote prints the name alone, and every screen shows as designed.'}
          </p>
        ) : null}
      </header>

      {/* THE INDEX: every part of the page by its word. In a hand it stands at the window's head,
          the part being read lit (the judge, L7: 6 to 11 screens of scroll with no way across) */}
      {open ? <Index reading={reading} desk={desk} /> : null}

      {apart ? (
        <output className="mg-apart">
          <Refusal>{apart}</Refusal>
        </output>
      ) : null}

      <div className="mg-halves">
        <section
          className="mg-paper"
          id="mg-paper"
          aria-labelledby="mg-paper-title"
          data-ground="plate"
        >
          {open ? (
            <Paper
              org={org}
              business={business}
              who={who}
              draft={draft}
              given={given}
              quotes={quotes}
              place={place}
              move={move}
              desk={desk}
              {...(go ? { go } : {})}
              {...(onChangeDesk ? { changeDesk: onChangeDesk } : {})}
            />
          ) : (
            <PaperClosed status={status} />
          )}
        </section>

        <section
          className="mg-water"
          id="mg-water"
          aria-labelledby="mg-water-title"
          data-ground="night"
        >
          <Water open={open} />
        </section>
      </div>

      {open ? <Elsewhere {...(go ? { go } : {})} /> : null}
    </main>
  )
}

/**
 * THE INDEX: every part of the page by its word. In a hand it stands at the window's head, the
 * part being read lit AND BROUGHT INTO THE STRIP'S MIDDLE as it is read (the verifier, L7: reading
 * Pictures lit "Colour" at x 367–431 of 390, off the strip), each end faded where more words
 * stand past it, so a word cut at the edge reads as more and never as a fault ("Co").
 */
function Index({ reading, desk }: { reading: string | null; desk: boolean }) {
  const [nav, setNav] = useState<HTMLElement | null>(null)
  const list = useRef<HTMLUListElement>(null)
  useStuck(nav, !desk)

  /* which ends have more words past them */
  useEffect(() => {
    const el = list.current
    if (!el) return
    const read = (): void => {
      const more = [
        el.scrollLeft > 1 ? 'start' : '',
        el.scrollLeft + el.clientWidth < el.scrollWidth - 1 ? 'end' : '',
      ]
        .filter((w) => w !== '')
        .join(' ')
      if (more === '') el.removeAttribute('data-more')
      else el.setAttribute('data-more', more)
    }
    read()
    el.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', read)
    return () => {
      el.removeEventListener('scroll', read)
      window.removeEventListener('resize', read)
    }
  }, [])

  /* the lit word follows the reading into the strip's middle */
  useEffect(() => {
    const el = list.current
    if (desk || !el || !reading) return
    const chip = el.querySelector<HTMLElement>('[aria-current]')
    if (!chip) return
    const lb = el.getBoundingClientRect()
    const cb = chip.getBoundingClientRect()
    const by = cb.left + cb.width / 2 - (lb.left + lb.width / 2)
    if (Math.abs(by) < 2 || typeof el.scrollBy !== 'function') return
    const still =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: by, behavior: still ? 'instant' : 'smooth' })
  }, [reading, desk])

  return (
    <nav className="mg-index" aria-label="Settings, by part" ref={setNav}>
      <ul className="mg-index__list" ref={list}>
        {PARTS.map((p) => (
          <li key={p.id}>
            <a
              className="mg-index__to"
              href={`#${p.id}`}
              aria-current={reading === p.id ? 'location' : undefined}
              onClick={(e) => {
                const el = document.getElementById(p.id)
                if (!el) return
                e.preventDefault()
                el.scrollIntoView({ block: 'start' })
              }}
            >
              {p.word}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** The newest draft by when it was last changed, or none. */
export function newestDraft(quotes: readonly QuoteDef[]): QuoteDef | null {
  let best: QuoteDef | null = null
  for (const q of quotes) {
    if (q.state !== 'draft') continue
    if (!best || q.updatedAt.localeCompare(best.updatedAt) > 0) best = q
  }
  return best
}

function PaperClosed({ status }: { status: string }) {
  return (
    <>
      <Head eyebrow="What prints" title="On every quote" id="mg-paper-title" />
      <p className="mg-said">
        {status === 'loading' || status === 'empty' ? 'Opening…' : NOTHING_OPEN}
      </p>
    </>
  )
}

function Head({
  eyebrow,
  title,
  id,
  mark,
}: {
  eyebrow: string
  title: string
  id: string
  mark?: ReactNode
}) {
  return (
    <header className="mg-head">
      {mark}
      <div className="mg-head__words">
        <h2 className="mg-eyebrow" id={id}>
          {eyebrow}
        </h2>
        <p className="mg-head__say">{title}</p>
      </div>
    </header>
  )
}

/* ---------------------------------------------------------- */
/* The paper: what prints                                      */
/* ---------------------------------------------------------- */

/** The lines every quote says, in the order they are set: the deposit is one line, rule and words. */
const SAYS: readonly ('gstRate' | 'validDays' | 'deposit' | 'quoteTerms')[] = [
  'gstRate',
  'validDays',
  'deposit',
  'quoteTerms',
]

function Paper({
  org,
  business,
  who,
  draft,
  given,
  quotes,
  place,
  move,
  desk,
  go,
  changeDesk,
}: {
  org: OrgProfile | undefined
  business: string | null
  who: string | null
  draft: QuoteDef | null
  given: number
  quotes: readonly QuoteDef[]
  place: ManagePlace
  move: (next: ManagePlace) => void
  desk: boolean
  go?: (href: string) => void
  changeDesk?: () => void
}) {
  const today = useMemo(() => letterheadNow({ org, business }), [org, business])
  const held = useMemo(() => heldPaperMark(business), [business])
  const ownPaper = org?.marks?.paper
  const opened = place.line ?? null
  const inStrip = opened === 'mark' || opened === 'name' || isStripLine(opened)
  const setting = litOf(place.line, place.person)
  /* THE LINE JUST KEPT STAYS LIT WHILE ITS UNDO STANDS, so the page at the window's foot shows
     the line as it now prints, not only where it will (the verifier, J12: the lit part was never
     in view while setting it) */
  const [kept, setKept] = useState<Lit | null>(null)
  useEffect(() => {
    if (!kept) return
    const gone = setTimeout(() => setKept(null), AS_LONG_AS_ITS_UNDO)
    return () => clearTimeout(gone)
  }, [kept])
  const lit = setting ?? kept
  /* where the line being set lands on the pages, said under its field where the pages are drawn */
  const lands = draft && desk && setting ? LANDS[setting] : null
  const done = (): void => {
    setKept(setting)
    move({})
  }

  const pressLine = (line: string): void => move(opened === line ? {} : { line })

  return (
    <>
      <Head
        eyebrow="What prints"
        title="On every quote. A quote keeps the letterhead it was given with."
        id="mg-paper-title"
      />

      {/* THE LETTERHEAD, AS THE QUOTE ITSELF DRAWS IT */}
      <section className="mg-group" id="mg-letterhead-g" aria-labelledby="mg-letterhead">
        <div className="mg-group__head">
          <h3 className="mg-group__title" id="mg-letterhead">
            The letterhead
          </h3>
          <p className="mg-group__say">
            {ownPaper
              ? `Northside’s own file, ${ownPaper.name}`
              : held
                ? 'Northside’s own mark in dark ink, from northsidemarine.com.au'
                : 'No mark yet, so the name is set in type'}
          </p>
        </div>
        <div className="mg-sheet" data-testid="manage-letterhead">
          <Letterhead
            business={business}
            letterhead={today}
            reference={draft?.reference ?? ''}
            kind={draft ? 'Quotation · draft' : 'Quotation'}
            when={draft ? 'Not issued yet' : 'Dated the day it is given'}
            renderLine={(line, printed) => (
              <StripLine
                line={line}
                printed={printed}
                name={today?.name ?? business ?? ''}
                opened={opened}
                press={pressLine}
              />
            )}
          />
          <p className="mg-sheet__note">
            {draft
              ? `Drawn on ${draft.reference}, ${draft.customer.name.trim() !== '' ? `the draft for ${draft.customer.name.trim()}` : 'a draft for nobody yet'}, the newest quote on this computer.`
              : given > 0
                ? `${given === 1 ? 'The one quote on this computer has' : `All ${given} quotes on this computer have`} been given, so the letterhead is drawn on its own.`
                : 'No quote has been started on this computer yet, so the letterhead is drawn on its own.'}
            {' A dashed line prints nothing.'}
          </p>
        </div>
        {inStrip && opened ? (
          opened === 'mark' ? (
            <MarkEditor org={org} held={held !== null} close={() => move({})} done={done} />
          ) : (
            <LineEditor
              key={opened}
              which={opened as DetailKey}
              org={org}
              business={business}
              lands={lands}
              close={() => move({})}
              done={done}
            />
          )
        ) : null}
      </section>

      {/* WHAT EVERY QUOTE SAYS: value first, for what is not in the letterhead */}
      <section className="mg-group" id="mg-says-g" aria-labelledby="mg-says">
        <div className="mg-group__head">
          <h3 className="mg-group__title" id="mg-says">
            What every quote says
          </h3>
          <p className="mg-group__say">Northside’s own words and rules, never written for it</p>
        </div>
        <ul className="mg-lines">
          {SAYS.map((key) => {
            const isOpen = opened === key
            const shown =
              key === 'deposit'
                ? depositShown(org)
                : { ...detailSaid(org, key), label: DETAIL_LINES[key].label }
            return (
              <li className="mg-line" key={key} data-open={isOpen ? '' : undefined}>
                <div className="mg-line__row">
                  <span className="mg-line__label">{shown.label}</span>
                  <span className="mg-line__value" data-set={shown.set ? '' : undefined}>
                    {shown.said}
                  </span>
                  <Button
                    intent="quiet"
                    size="sm"
                    aria-expanded={isOpen}
                    aria-label={`${shown.set ? 'Change' : 'Set'} ${shown.label.toLowerCase()}`}
                    onClick={() => pressLine(key)}
                  >
                    {isOpen
                      ? 'Close'
                      : shown.set
                        ? 'Change'
                        : key === 'quoteTerms'
                          ? 'Write'
                          : 'Set'}
                  </Button>
                </div>
                {isOpen ? (
                  key === 'deposit' ? (
                    <DepositEditor
                      org={org}
                      draft={draft}
                      lands={lands}
                      close={() => move({})}
                      done={done}
                    />
                  ) : (
                    <LineEditor
                      key={key}
                      which={key}
                      org={org}
                      business={business}
                      lands={lands}
                      close={() => move({})}
                      done={done}
                    />
                  )
                ) : null}
              </li>
            )
          })}
        </ul>
      </section>

      <People
        org={org}
        who={who}
        quotes={quotes}
        place={place}
        move={move}
        lands={lands}
        done={done}
        {...(changeDesk ? { changeDesk } : {})}
      />

      <Proof draft={draft} given={given} lit={lit} desk={desk} {...(go ? { go } : {})} />
    </>
  )
}

/** The deposit as the line says it, value first: the rule, then Northside's own words. */
function depositShown(org: OrgProfile | undefined): { label: string; set: boolean; said: string } {
  const rule = org?.depositRule
  const words = org?.deposit?.trim() ?? ''
  if (!rule && words === '') return { label: 'Deposit', set: false, said: 'None, so none prints' }
  return {
    label: 'Deposit',
    set: true,
    said: [rule ? depositRuleSaid(rule) : 'No figure, words only', words === '' ? '' : `“${words}”`]
      .filter((s) => s !== '')
      .join('\n'),
  }
}

const STRIP_LINES: ReadonlySet<string> = new Set([
  'legalName',
  'abn',
  'address',
  'phone',
  'email',
  'website',
])
const isStripLine = (line: string | null): boolean => line !== null && STRIP_LINES.has(line)

/** A line of the letterhead as Settings draws it: what prints, pressable, or a dashed box. */
function StripLine({
  line,
  printed,
  name,
  opened,
  press,
}: {
  line: LetterheadLine | 'mark'
  printed: ReactNode | null
  name: string
  opened: string | null
  press: (line: string) => void
}) {
  if (line === 'mark') {
    return (
      <span className="mg-strip__mark">
        {printed}
        <span className="mg-strip__acts">
          <Button
            intent="quiet"
            size="sm"
            aria-expanded={opened === 'name'}
            aria-label={`Trading name, ${name} — change it`}
            onClick={() => press('name')}
          >
            <span className="mg-strip__words">{name}</span>
          </Button>
          <Button
            intent="quiet"
            size="sm"
            aria-expanded={opened === 'mark'}
            onClick={() => press('mark')}
          >
            Change the mark
          </Button>
        </span>
      </span>
    )
  }
  const label = DETAIL_LINES[line].label
  if (printed === null || printed === '') {
    return (
      <Button
        intent="slot"
        size="sm"
        aria-expanded={opened === line}
        aria-label={`${label} — none given, so none prints. Add it`}
        onClick={() => press(line)}
      >
        {label}
      </Button>
    )
  }
  return (
    <Button
      intent="quiet"
      size="sm"
      aria-expanded={opened === line}
      aria-label={`${label}, ${String(printed)} — change it`}
      onClick={() => press(line)}
    >
      {/* the screen's own words inside the kit's button may wrap: an address longer than the
          sheet is wide pushed the page to 545px at 390 (built-critique-m4.md, major 2) */}
      <span className="mg-strip__words">{printed}</span>
    </Button>
  )
}

/* ---------------------------------------------------------- */
/* One line, set                                               */
/* ---------------------------------------------------------- */

/** Where each line is printed, said under its field. */
const PRINTS: Record<DetailKey, string> = {
  name: 'At the head of every page after the first, and as the mark’s own words. Empty, the price list’s name prints.',
  legalName: 'On the letterhead’s small line, only where it differs from the trading name.',
  abn: 'On the letterhead’s small line, as ABN 12 345 678 901.',
  address: 'On the letterhead’s small line, on one line however it is typed.',
  phone: 'On the letterhead’s small line.',
  email: 'On the letterhead’s small line.',
  website: 'On the letterhead’s small line.',
  gstRate: 'Copied onto each quote when it is given; the quote then shows its total before GST.',
  validDays: 'The quote prints the day it stands until, counted from the day it is given.',
  deposit: 'Under the total on the first page of each quote.',
  quoteTerms: 'Put on each quote when it is given, and printed on its last page.',
}

function LineEditor({
  which,
  org,
  business,
  lands,
  close,
  done,
}: {
  which: DetailKey
  org: OrgProfile | undefined
  business: string | null
  lands: string | null
  close: () => void
  /** closes it once a change is kept */
  done: () => void
}) {
  const line = DETAIL_LINES[which]
  const was = which === 'name' ? (org?.name ?? business ?? '') : detailText(org, which)
  const [typed, setTyped] = useState(was)
  const [refused, setRefused] = useState<string | null>(null)
  const field = useRef<HTMLElement>(null)
  const box = useClearOfTheFoot<HTMLFormElement>()
  const id = useId()

  useEffect(() => {
    field.current?.focus({ preventScroll: true })
  }, [])

  const save = (raw: string): void => {
    const read = readDetail(which, raw)
    if (!read.ok) {
      setRefused(read.refused)
      return
    }
    const value =
      which === 'name' && read.value === undefined ? (business ?? undefined) : read.value
    const said =
      value === undefined
        ? `${line.label}: none, so none prints`
        : which === 'gstRate'
          ? `GST rate set to ${String(value)}%`
          : which === 'validDays'
            ? `A quote now stands for ${String(value)} ${value === 1 ? 'day' : 'days'}`
            : `${line.label} set`
    const out = keep(changeOrg(said, which, (o) => withKey(o, which, value as never) as OrgProfile))
    if (out) {
      setRefused(out)
      return
    }
    done()
  }

  return (
    <form
      ref={box}
      className="mg-editor"
      data-testid="manage-editor"
      aria-label={line.label}
      onSubmit={(e) => {
        e.preventDefault()
        save(typed)
      }}
    >
      <Field label={line.label} description={lands ? `${PRINTS[which]} ${lands}` : PRINTS[which]}>
        <Input
          ref={field}
          id={id}
          aria-label={line.label}
          look={line.long ? 'lines' : 'field'}
          inputMode={line.mode === 'decimal' || line.mode === 'numeric' ? line.mode : undefined}
          type={line.mode === 'email' ? 'email' : line.mode === 'tel' ? 'tel' : 'text'}
          autoComplete="off"
          value={typed}
          onValueChange={(next) => {
            setTyped(next)
            if (refused) setRefused(null)
          }}
          aria-invalid={refused ? true : undefined}
        />
      </Field>
      {refused ? (
        <p className="mg-editor__refused" role="alert">
          <Refusal>{refused}</Refusal>
        </p>
      ) : null}
      <div className="mg-editor__acts">
        <Button type="submit" intent="primary" size="sm" icon={CheckIcon}>
          Keep
        </Button>
        {was !== '' && which !== 'name' ? (
          <Button type="button" intent="quiet" size="sm" onClick={() => save('')}>
            Leave it empty
          </Button>
        ) : null}
        <Button type="button" intent="quiet" size="sm" onClick={close}>
          Close
        </Button>
      </div>
    </form>
  )
}

/* ---------------------------------------------------------- */
/* The deposit: a rule and Northside's own words                */
/* ---------------------------------------------------------- */

const DEPOSIT_WAYS: ReadonlyArray<{ value: DepositWay; label: string }> = [
  { value: 'none', label: 'No figure' },
  { value: 'share', label: 'A share' },
  { value: 'amount', label: 'A fixed figure' },
]

/**
 * THE DEPOSIT AS NORTHSIDE'S RULE (the judge, L3): a share of each quote's own total, or one fixed
 * figure, worked out on the quote and printed under its total — said here on the newest draft's
 * own total where there is one — with Northside's own words under it. One Keep, one step.
 */
function DepositEditor({
  org,
  draft,
  lands,
  close,
  done,
}: {
  org: OrgProfile | undefined
  draft: QuoteDef | null
  lands: string | null
  close: () => void
  done: () => void
}) {
  const rule = org?.depositRule
  const [way, setWay] = useState<DepositWay>(depositWayOf(rule))
  const [figure, setFigure] = useState(depositTypedOf(rule))
  const [words, setWords] = useState(org?.deposit ?? '')
  const [refused, setRefused] = useState<string | null>(null)
  const box = useClearOfTheFoot<HTMLFormElement>()
  const total = useMemo(() => (draft ? quoteTotals(draft).total : null), [draft])
  const read = readDepositRule(way, figure)
  const due = read.ok ? depositDue(read.rule, total) : null

  const save = (): void => {
    if (!read.ok) {
      setRefused(read.refused)
      return
    }
    const text = words.replace(/\r\n/g, '\n').trim()
    const ruleMoved = JSON.stringify(read.rule ?? null) !== JSON.stringify(rule ?? null)
    const said =
      read.rule === undefined && text === ''
        ? 'The deposit: none, so none prints'
        : read.rule
          ? `The deposit is ${depositRuleSaid(read.rule)}`
          : 'The deposit wording set'
    const out = keep(
      changeOrg(said, ruleMoved ? 'depositRule' : 'deposit', (o) =>
        withKey(withKey(o, 'depositRule', read.rule), 'deposit', text === '' ? undefined : text),
      ),
    )
    if (out) {
      setRefused(out)
      return
    }
    done()
  }

  return (
    <form
      ref={box}
      className="mg-editor"
      data-testid="manage-editor"
      aria-label="Deposit"
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
    >
      <p className="mg-editor__say">
        {`${PRINTS.deposit}${lands ? ` ${lands}` : ''} Each quote works the figure out from its own total, and a given quote keeps the rule it was given with.`}
      </p>
      <div className="mg-deposit">
        <Segmented<DepositWay>
          label="The deposit"
          options={DEPOSIT_WAYS}
          value={way}
          onValueChange={(next) => {
            setWay(next)
            setRefused(null)
          }}
        />
        {way === 'none' ? null : (
          <Field label={way === 'share' ? 'Share of the total, in %' : 'Fixed figure, in dollars'}>
            <Input
              aria-label={way === 'share' ? 'Share of the total, in %' : 'Fixed figure, in dollars'}
              inputMode="decimal"
              autoComplete="off"
              value={figure}
              onValueChange={(next) => {
                setFigure(next)
                setRefused(null)
              }}
              aria-invalid={refused ? true : undefined}
            />
          </Field>
        )}
      </div>
      {way !== 'none' && read.ok && read.rule ? (
        <p className="mg-editor__say" data-testid="manage-deposit-worked">
          {draft && due !== null
            ? `On ${draft.reference}, whose total is ${money(total ?? 0)}, the deposit prints as ${money(due)}.`
            : draft
              ? `${draft.reference} has no total yet, so it prints the rule in words until every price is confirmed.`
              : 'Each quote prints the figure worked from its own total.'}
        </p>
      ) : null}
      <Field
        label="Deposit wording"
        description="Printed under the figure, in Northside’s own words."
      >
        <Input
          aria-label="Deposit wording"
          look="lines"
          autoComplete="off"
          value={words}
          onValueChange={setWords}
        />
      </Field>
      {refused ? (
        <p className="mg-editor__refused" role="alert">
          <Refusal>{refused}</Refusal>
        </p>
      ) : null}
      <div className="mg-editor__acts">
        <Button type="submit" intent="primary" size="sm" icon={CheckIcon}>
          Keep
        </Button>
        <Button type="button" intent="quiet" size="sm" onClick={close}>
          Close
        </Button>
      </div>
    </form>
  )
}

/* ---------------------------------------------------------- */
/* The mark on paper                                           */
/* ---------------------------------------------------------- */

function MarkEditor({
  org,
  held,
  close,
  done,
}: {
  org: OrgProfile | undefined
  held: boolean
  close: () => void
  done: () => void
}) {
  const [refused, setRefused] = useState<string | null>(null)
  const [reading, setReading] = useState(false)
  const picker = useRef<HTMLInputElement>(null)
  const box = useClearOfTheFoot<HTMLFieldSetElement>()
  const own = org?.marks?.paper

  const chosen = async (file: File | undefined): Promise<void> => {
    if (!file) return
    setRefused(null)
    setReading(true)
    try {
      const read = await readMark(file)
      if (!read.ink) {
        setRefused('Nothing is drawn in this file, so there is no mark to print.')
        return
      }
      if (read.ink.ink === 'light') {
        setRefused(
          `This mark is drawn in light ink: on white paper it measures ${saidRatio(read.ink.onPaper)}, under the ${MARK_FLOOR} : 1 a mark needs to be seen. A quote prints a dark-ink file, the way Mercury’s white-only mark is set in type on paper. This one can stand on the water, on the right.`,
        )
        return
      }
      const out = keep(
        changeOrg('Northside’s own mark prints on every quote from now', 'marks', (o) => ({
          ...o,
          marks: {
            ...o.marks,
            paper: {
              src: read.src,
              width: read.width,
              height: read.height,
              ink: 'dark',
              name: file.name,
              keptAt: new Date().toISOString(),
            },
          },
        })),
      )
      if (out) setRefused(out)
      else done()
    } catch (error) {
      setRefused(error instanceof Error ? error.message : 'That file would not open.')
    } finally {
      setReading(false)
    }
  }

  return (
    <fieldset ref={box} className="mg-editor" data-testid="manage-editor" aria-label="The mark">
      <p className="mg-editor__say">
        {own
          ? `Every quote prints ${own.name}, Northside’s own. Quotes already given keep the mark they were given with.`
          : held
            ? 'Every quote prints the mark from Northside’s own site, in dark ink, up to 20 mm tall. A file of Northside’s own takes its place on quotes given from now.'
            : 'No mark is known, so every quote sets the name in type. A file in dark ink takes its place on quotes given from now.'}
      </p>
      {refused ? (
        <p className="mg-editor__refused" role="alert">
          <Refusal>{refused}</Refusal>
        </p>
      ) : null}
      <input
        ref={picker}
        className="mg-file"
        type="file"
        accept="image/png,image/svg+xml,image/jpeg,image/webp"
        aria-label="A file of Northside’s mark"
        tabIndex={-1}
        onChange={(e) => {
          void chosen(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <div className="mg-editor__acts">
        <Button
          intent="primary"
          size="sm"
          icon={UploadSimpleIcon}
          aria-busy={reading || undefined}
          onClick={() => picker.current?.click()}
        >
          {reading ? 'Reading it…' : 'Choose a file'}
        </Button>
        {own ? (
          <Button
            intent="quiet"
            size="sm"
            icon={ArrowUUpLeftIcon}
            onClick={() => {
              const out = keep(
                changeOrg(
                  held
                    ? 'The mark from Northside’s site prints again'
                    : 'The name prints in type again',
                  'marks',
                  (o) => {
                    const marks = { ...o.marks }
                    delete marks.paper
                    return withKey(o, 'marks', Object.keys(marks).length > 0 ? marks : undefined)
                  },
                ),
              )
              if (out) setRefused(out)
              else done()
            }}
          >
            {held ? 'Use the mark from the site' : 'Set the name in type'}
          </Button>
        ) : null}
        <Button intent="quiet" size="sm" onClick={close}>
          Close
        </Button>
      </div>
    </fieldset>
  )
}

/* ---------------------------------------------------------- */
/* Who prepares it                                             */
/* ---------------------------------------------------------- */

function People({
  org,
  who,
  quotes,
  place,
  move,
  lands,
  done,
  changeDesk,
}: {
  changeDesk?: () => void
  org: OrgProfile | undefined
  who: string | null
  quotes: readonly QuoteDef[]
  place: ManagePlace
  move: (next: ManagePlace) => void
  lands: string | null
  done: () => void
}) {
  const people = org?.people ?? []
  /* A SWITCH REFUSED IS SAID ON ITS OWN CARD, under the switch (the verifier, 2026-11-04: it stood
     at the head of People, 230px above the switch it refused) */
  const [refused, setRefused] = useState<{ id: string; said: string } | null>(null)
  /* THE PERSON WHOSE SWITCH WAS REFUSED: the sentence stands only while it is still true, so it
     goes the moment a second person who may is added (the judge, J5 and P4) */
  const [apartAsked, setApartAsked] = useState<string | null>(null)
  const apartSaid = apartAsked ? setApartRefusal(people, apartAsked, false) : null
  const atDoor = who && !people.some((p) => p.name.toLowerCase() === who.toLowerCase()) ? who : null

  return (
    <section className="mg-group" id="mg-people-g" aria-labelledby="mg-people">
      <div className="mg-group__head">
        <h3 className="mg-group__title" id="mg-people">
          Who prepares it
        </h3>
        <p className="mg-group__say">
          {people.length === 0
            ? 'A quote prints the name given at sign-in until a person is added'
            : `${people.length} ${people.length === 1 ? 'person' : 'people'} · each prints as Prepared by`}
        </p>
      </div>
      {who && changeDesk ? (
        <p className="mg-desk">
          <span>
            At this desk: <b>{who}</b>. Every quote started here is prepared by {who}.
          </span>
          <Button intent="quiet" size="sm" icon={UserSwitchIcon} onClick={changeDesk}>
            {`Not ${who}? Change who is at the desk`}
          </Button>
        </p>
      ) : null}
      <ul className="mg-people">
        {people.map((person) =>
          place.person === person.id ? (
            <li key={person.id} className="mg-person" data-open="">
              <PersonEditor
                person={person}
                people={people}
                lands={lands}
                close={() => move({})}
                done={done}
              />
            </li>
          ) : (
            <li key={person.id} className="mg-person">
              <PersonCard
                person={person}
                prepared={preparedBy(quotes, person.name)}
                isYou={who !== null && person.name.toLowerCase() === who.toLowerCase()}
                open={() => move({ person: person.id })}
                refused={
                  apartAsked === person.id && apartSaid
                    ? apartSaid
                    : refused?.id === person.id
                      ? refused.said
                      : null
                }
                onSwitch={(next) => {
                  const no = setApartRefusal(people, person.id, next)
                  if (no) {
                    setApartAsked(person.id)
                    return
                  }
                  setApartAsked(null)
                  const out = keep(
                    changeOrg(
                      next
                        ? `${person.name} may change prices and settings`
                        : `${person.name} is set apart from changing prices and settings`,
                      'people',
                      (o) => ({
                        ...o,
                        people: (o.people ?? []).map((p) => {
                          if (p.id !== person.id) return p
                          const copy = { ...p }
                          if (next) delete copy.mayChange
                          else copy.mayChange = false
                          return copy
                        }),
                      }),
                    ),
                  )
                  setRefused(out ? { id: person.id, said: out } : null)
                }}
              />
            </li>
          ),
        )}
        {atDoor && place.person !== 'new' ? (
          <li className="mg-person" data-door="">
            <Plate as="div" pad="md">
              <p className="mg-person__lab">Prepared by</p>
              <p className="mg-person__name">
                {atDoor} <span className="mg-person__from">given at sign-in</span>
              </p>
              <p className="mg-person__say">
                A quote prints “{atDoor}” alone. Keep {atDoor} as one of Northside’s people and a
                title, a phone and an email print under the name.
              </p>
              <Button
                intent="secondary"
                size="sm"
                icon={PlusIcon}
                onClick={() => move({ person: 'new' })}
              >
                {`Keep ${atDoor} as a person`}
              </Button>
            </Plate>
          </li>
        ) : null}
        <li className="mg-person" data-add="">
          {place.person === 'new' ? (
            <PersonEditor
              person={null}
              start={atDoor ?? ''}
              people={people}
              lands={lands}
              close={() => move({})}
              done={done}
            />
          ) : (
            <Button intent="slot" icon={PlusIcon} onClick={() => move({ person: 'new' })}>
              Add a person
            </Button>
          )}
        </li>
      </ul>
    </section>
  )
}

function PersonCard({
  person,
  prepared,
  isYou,
  open,
  refused,
  onSwitch,
}: {
  person: OrgPerson
  prepared: number
  isYou: boolean
  open: () => void
  /** the sentence a press of this card's switch was refused with, said under it */
  refused: string | null
  onSwitch: (next: boolean) => void
}) {
  const reach = [person.phone, person.email].filter((v): v is string => Boolean(v))
  const may = mayChange(person)
  return (
    <Plate as="div" pad="md">
      <p className="mg-person__lab">Prepared by</p>
      <p className="mg-person__name">
        {person.name}
        {isYou ? <span className="mg-person__from">at the keyboard</span> : null}
      </p>
      {person.title ? <p className="mg-person__title">{person.title}</p> : null}
      {reach.length > 0 ? (
        <p className="mg-person__reach">{reach.join(' · ')}</p>
      ) : (
        <p className="mg-person__say">No phone or email yet, so the name prints alone.</p>
      )}
      <p className="mg-person__count">
        {prepared === 0
          ? 'No quote prepared on this computer yet'
          : `${prepared} ${prepared === 1 ? 'quote' : 'quotes'} prepared on this computer`}
      </p>
      <div className="mg-person__foot">
        <Toggle label="May change prices and settings" checked={may} onCheckedChange={onSwitch} />
        <Button
          intent="quiet"
          size="sm"
          icon={UserIcon}
          onClick={open}
          aria-label={`Change ${person.name}`}
        >
          Change
        </Button>
      </div>
      {refused ? (
        <p className="mg-editor__refused mg-person__refused" role="alert">
          <Refusal>{refused}</Refusal>
        </p>
      ) : null}
      <p className="mg-person__may">
        {may
          ? 'Writes and gives quotes, and may change a price, the price list and these settings.'
          : 'Writes and gives quotes; changes no price and no setting.'}
      </p>
    </Plate>
  )
}

function PersonEditor({
  person,
  start = '',
  people,
  lands,
  close,
  done,
}: {
  person: OrgPerson | null
  start?: string
  people: readonly OrgPerson[]
  lands: string | null
  close: () => void
  done: () => void
}) {
  const [name, setName] = useState(person?.name ?? start)
  const [title, setTitle] = useState(person?.title ?? '')
  const [phone, setPhone] = useState(person?.phone ?? '')
  const [email, setEmail] = useState(person?.email ?? '')
  const [refused, setRefused] = useState<string | null>(null)
  const first = useRef<HTMLElement>(null)
  const box = useClearOfTheFoot<HTMLFormElement>()
  useEffect(() => {
    first.current?.focus({ preventScroll: true })
  }, [])

  const save = (): void => {
    const no = personNameRefusal(people, name, person?.id)
    if (no) {
      setRefused(no)
      return
    }
    for (const [key, value] of [
      ['phone', phone],
      ['email', email],
    ] as const) {
      const read = readDetail(key, value)
      if (!read.ok) {
        setRefused(read.refused)
        return
      }
    }
    const next: OrgPerson = { id: person?.id ?? newId(), name: name.trim() }
    if (title.trim()) next.title = title.trim()
    if (phone.trim()) next.phone = phone.trim()
    if (email.trim()) next.email = email.trim()
    if (person?.mayChange === false) next.mayChange = false
    const out = keep(
      changeOrg(
        person ? `${next.name} changed` : `${next.name} is one of Northside’s people`,
        'people',
        (o) => ({
          ...o,
          people: person
            ? (o.people ?? []).map((p) => (p.id === person.id ? next : p))
            : [...(o.people ?? []), next],
        }),
      ),
    )
    if (out) setRefused(out)
    else done()
  }

  const remove = (): void => {
    if (!person) return
    const left = people.filter((p) => p.id !== person.id)
    if (left.length > 0 && !left.some(mayChange)) {
      setRefused(
        'Somebody has to be able to change prices and settings, and everyone left is set apart.',
      )
      return
    }
    const out = keep(
      changeOrg(`${person.name} is no longer one of Northside’s people`, 'people', (o) =>
        withKey(o, 'people', left.length > 0 ? left : undefined),
      ),
    )
    if (out) setRefused(out)
    else done()
  }

  return (
    <form
      ref={box}
      className="mg-editor mg-editor--person"
      data-testid="manage-person"
      aria-label={person ? `Change ${person.name}` : 'A new person'}
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
    >
      {/* ONE SENTENCE OVER THE FOUR FIELDS, so no field carries a line the others do not and the
          four stand level two by two (the judge, P11: Name and Title 11px apart at 1440) */}
      <p className="mg-editor__say">
        {`Printed under Prepared by on each quote this person prepares, title, phone and email each only where given, and offered at sign-in.${lands ? ` ${lands}` : ''}`}
      </p>
      <Field label="Name">
        <Input
          ref={first}
          aria-label="Name"
          value={name}
          onValueChange={setName}
          autoComplete="off"
        />
      </Field>
      <Field label="Title">
        <Input aria-label="Title" value={title} onValueChange={setTitle} autoComplete="off" />
      </Field>
      <Field label="Phone">
        <Input
          aria-label="Phone"
          type="tel"
          value={phone}
          onValueChange={setPhone}
          autoComplete="off"
        />
      </Field>
      <Field label="Email">
        <Input
          aria-label="Email"
          type="email"
          value={email}
          onValueChange={setEmail}
          autoComplete="off"
        />
      </Field>
      {refused ? (
        <p className="mg-editor__refused" role="alert">
          <Refusal>{refused}</Refusal>
        </p>
      ) : null}
      <div className="mg-editor__acts">
        <Button type="submit" intent="primary" size="sm" icon={CheckIcon}>
          Keep
        </Button>
        {person ? (
          <Button type="button" intent="quiet" size="sm" onClick={remove}>
            {`Remove ${person.name}`}
          </Button>
        ) : null}
        <Button type="button" intent="quiet" size="sm" onClick={close}>
          Close
        </Button>
      </div>
    </form>
  )
}
