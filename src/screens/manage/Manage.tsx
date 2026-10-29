import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ArrowUUpLeftIcon,
  CheckIcon,
  PlusIcon,
  UploadSimpleIcon,
  UserIcon,
} from '@phosphor-icons/react'
import { Button, Field, Input, Plate, Refusal, Toggle, say, undo } from '@/ui'
import { useCatalogue, useQuotes, useSession } from '@/app/useStores'
import { PRICE_LIST_ROOMS } from '@/app/ways'
import { heldPaperMark, letterheadNow } from '@/app/northside'
import { glyphOfWay } from '@/screens/shell/glyphs'
import { Letterhead, type LetterheadLine } from '@/screens/document/Document'
import { isDone, type CatalogueCommand } from '@/domain/catalogue/commands'
import { changeOrg, withKey } from '@/domain/catalogue/orgCommands'
import { newId } from '@/domain/id'
import type { OrgPerson, OrgProfile, QuoteDef } from '@/domain/model'
import {
  DETAIL_LINES,
  QUOTE_KEYS,
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
import { MARK_FLOOR } from '@/domain/northside/pixels'
import { saidRatio } from '@/domain/northside/colour'
import { catalogue } from '@/state/catalogue'
import { readMark } from './measure'
import { Water } from './Water'
import './manage.css'

/* ============================================================
   SETTINGS — "Paper and water", board C of docs/directions/manage-boards/,
   the judge's pick of 2026-10-29, with board B's stage grafted onto the
   water and the judge's must-change made on the paper.

   ONE PAGE SPLIT DOWN ITS MIDDLE BY WHERE A CHOICE LANDS. The left half
   is the white paper — what prints on every quote: the letterhead as the
   quote itself draws it (the document's own `Letterhead`, on the newest
   draft), every empty line a dashed box that prints nothing and opens its
   field when pressed; what every quote says; and who prepares it, as the
   cards they print. The right half is the water — what shows on every
   screen: Home drawn small with the colour and the photograph already on
   it before anything is kept, the colour measured as white words on it,
   the photographs each with the veil its own pixels asked for, Home's
   sections, and the shape of things. A manager learns why the mark comes
   twice — dark on paper, white on water — without reading a word.

   NOTHING IS WRITTEN FOR NORTHSIDE. Every line starts empty and prints
   nothing. No address, phone or ABN is offered: docs/DECISIONS.md holds no
   yes to the original HelmLogic's. The one name known on day one is the
   one typed at the door, and it is drawn as that.

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
  /** follow an address without a page load */
  go?: (href: string) => void
  /** the shelf's address, where a new version of the price list is brought in, if built */
  shelf?: string | null
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
  return null
}

const NOWHERE: ManagePlace = {}

export function Manage({ place = NOWHERE, onPlace, go, shelf = null }: ManageProps) {
  const status = useCatalogue((s) => s.status)
  const org = useCatalogue((s) => s.org)
  const business = useCatalogue((s) => s.business)
  const who = useSession((s) => s.name)
  const quotes = useQuotes((s) => s.quotes)
  const quotesRead = useQuotes((s) => s.loaded)

  const open = status === 'ready' && (business ?? '').trim() !== ''
  const apart = changeRefusal(org, who)
  const move = useCallback((next: ManagePlace) => onPlace?.(next), [onPlace])

  /* THE NEWEST DRAFT ON THIS COMPUTER: the letterhead is drawn on it, never on a made-up quote */
  const draft = useMemo(() => newestDraft(quotes), [quotes])

  return (
    <main
      className="mg"
      data-testid="manage"
      data-read={status === 'ready' && quotesRead ? '' : undefined}
    >
      {/* AT 390 THE HALVES STACK, paper first, and two words say where each begins */}
      <nav className="mg-jump" aria-label="Settings, in two halves">
        <a className="mg-jump__to" href="#mg-paper">
          What prints
        </a>
        <a className="mg-jump__to" href="#mg-water">
          What shows
        </a>
      </nav>

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
              place={place}
              move={move}
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

      <Elsewhere go={go} shelf={shelf} />
    </main>
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

function Paper({
  org,
  business,
  who,
  draft,
  place,
  move,
}: {
  org: OrgProfile | undefined
  business: string | null
  who: string | null
  draft: QuoteDef | null
  place: ManagePlace
  move: (next: ManagePlace) => void
}) {
  const today = useMemo(() => letterheadNow({ org, business }), [org, business])
  const held = useMemo(() => heldPaperMark(business), [business])
  const ownPaper = org?.marks?.paper
  const opened = place.line ?? null
  const inStrip = opened === 'mark' || opened === 'name' || isStripLine(opened)

  const pressLine = (line: string): void => move(opened === line ? {} : { line })

  return (
    <>
      <Head
        eyebrow="What prints"
        title="On every quote. A quote keeps the letterhead it was given with."
        id="mg-paper-title"
      />

      {/* THE LETTERHEAD, AS THE QUOTE ITSELF DRAWS IT */}
      <section className="mg-group" aria-labelledby="mg-letterhead">
        <div className="mg-group__head">
          <h3 className="mg-group__title" id="mg-letterhead">
            The letterhead
          </h3>
          <p className="mg-group__say">
            {ownPaper
              ? `Northside’s own file, ${ownPaper.name}`
              : held
                ? 'Northside’s own mark in dark ink, from northsidemarine.com.au · Northside to confirm'
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
              : 'No quote has been started on this computer yet, so the letterhead is drawn on its own.'}
            {' A dashed line prints nothing.'}
          </p>
        </div>
        {inStrip && opened ? (
          opened === 'mark' ? (
            <MarkEditor org={org} held={held !== null} close={() => move({})} />
          ) : (
            <LineEditor
              key={opened}
              which={opened as DetailKey}
              org={org}
              business={business}
              close={() => move({})}
            />
          )
        ) : null}
      </section>

      {/* WHAT EVERY QUOTE SAYS: value first, for what is not in the letterhead */}
      <section className="mg-group" aria-labelledby="mg-says">
        <div className="mg-group__head">
          <h3 className="mg-group__title" id="mg-says">
            What every quote says
          </h3>
          <p className="mg-group__say">Northside’s own words, never written for it</p>
        </div>
        <ul className="mg-lines">
          {QUOTE_KEYS.map((key) => {
            const shown = detailSaid(org, key)
            const isOpen = opened === key
            return (
              <li className="mg-line" key={key} data-open={isOpen ? '' : undefined}>
                <div className="mg-line__row">
                  <span className="mg-line__label">{DETAIL_LINES[key].label}</span>
                  <span className="mg-line__value" data-set={shown.set ? '' : undefined}>
                    {shown.said}
                  </span>
                  <Button
                    intent="quiet"
                    size="sm"
                    aria-expanded={isOpen}
                    aria-label={`${shown.set ? 'Change' : 'Set'} ${DETAIL_LINES[key].label.toLowerCase()}`}
                    onClick={() => pressLine(key)}
                  >
                    {isOpen
                      ? 'Close'
                      : shown.set
                        ? 'Change'
                        : DETAIL_LINES[key].long
                          ? 'Write'
                          : 'Set'}
                  </Button>
                </div>
                {isOpen ? (
                  <LineEditor
                    key={key}
                    which={key}
                    org={org}
                    business={business}
                    close={() => move({})}
                  />
                ) : null}
              </li>
            )
          })}
        </ul>
      </section>

      <People org={org} who={who} place={place} move={move} />
    </>
  )
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
            {name}
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
      {printed}
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
  gstRate: 'Copied onto each quote when it is started; the quote then shows its total before GST.',
  validDays: 'The quote prints the day it stands until, counted from the day it is given.',
  deposit: 'Under the total on the first page of each quote.',
  quoteTerms: 'Put on each quote when it is started, and printed on its last page.',
}

function LineEditor({
  which,
  org,
  business,
  close,
}: {
  which: DetailKey
  org: OrgProfile | undefined
  business: string | null
  close: () => void
}) {
  const line = DETAIL_LINES[which]
  const was = which === 'name' ? (org?.name ?? business ?? '') : detailText(org, which)
  const [typed, setTyped] = useState(was)
  const [refused, setRefused] = useState<string | null>(null)
  const field = useRef<HTMLElement>(null)
  const id = useId()

  useEffect(() => {
    field.current?.focus({ preventScroll: false })
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
    close()
  }

  return (
    <form
      className="mg-editor"
      data-testid="manage-editor"
      aria-label={line.label}
      onSubmit={(e) => {
        e.preventDefault()
        save(typed)
      }}
    >
      <Field label={line.label} description={PRINTS[which]}>
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
/* The mark on paper                                           */
/* ---------------------------------------------------------- */

function MarkEditor({
  org,
  held,
  close,
}: {
  org: OrgProfile | undefined
  held: boolean
  close: () => void
}) {
  const [refused, setRefused] = useState<string | null>(null)
  const [reading, setReading] = useState(false)
  const picker = useRef<HTMLInputElement>(null)
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
      else close()
    } catch (error) {
      setRefused(error instanceof Error ? error.message : 'That file would not open.')
    } finally {
      setReading(false)
    }
  }

  return (
    <fieldset className="mg-editor" data-testid="manage-editor" aria-label="The mark">
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
              else close()
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
  place,
  move,
}: {
  org: OrgProfile | undefined
  who: string | null
  place: ManagePlace
  move: (next: ManagePlace) => void
}) {
  const people = org?.people ?? []
  const [refused, setRefused] = useState<string | null>(null)
  const atDoor = who && !people.some((p) => p.name.toLowerCase() === who.toLowerCase()) ? who : null

  return (
    <section className="mg-group" aria-labelledby="mg-people">
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
      {refused ? (
        <p className="mg-editor__refused" role="alert">
          <Refusal>{refused}</Refusal>
        </p>
      ) : null}
      <ul className="mg-people">
        {people.map((person) =>
          place.person === person.id ? (
            <li key={person.id} className="mg-person" data-open="">
              <PersonEditor person={person} people={people} close={() => move({})} />
            </li>
          ) : (
            <li key={person.id} className="mg-person">
              <PersonCard
                person={person}
                isYou={who !== null && person.name.toLowerCase() === who.toLowerCase()}
                open={() => move({ person: person.id })}
                onSwitch={(next) => {
                  const no = setApartRefusal(people, person.id, next)
                  if (no) {
                    setRefused(no)
                    return
                  }
                  setRefused(
                    keep(
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
                    ),
                  )
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
              close={() => move({})}
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
  isYou,
  open,
  onSwitch,
}: {
  person: OrgPerson
  isYou: boolean
  open: () => void
  onSwitch: (next: boolean) => void
}) {
  const reach = [person.phone, person.email].filter((v): v is string => Boolean(v))
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
      <div className="mg-person__foot">
        <Toggle
          label="May change prices and settings"
          checked={mayChange(person)}
          onCheckedChange={onSwitch}
        />
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
    </Plate>
  )
}

function PersonEditor({
  person,
  start = '',
  people,
  close,
}: {
  person: OrgPerson | null
  start?: string
  people: readonly OrgPerson[]
  close: () => void
}) {
  const [name, setName] = useState(person?.name ?? start)
  const [title, setTitle] = useState(person?.title ?? '')
  const [phone, setPhone] = useState(person?.phone ?? '')
  const [email, setEmail] = useState(person?.email ?? '')
  const [refused, setRefused] = useState<string | null>(null)
  const first = useRef<HTMLElement>(null)
  useEffect(() => {
    first.current?.focus()
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
    else close()
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
    else close()
  }

  return (
    <form
      className="mg-editor mg-editor--person"
      data-testid="manage-person"
      aria-label={person ? `Change ${person.name}` : 'A new person'}
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
    >
      <Field label="Name" description="Printed as Prepared by, and offered at sign-in.">
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

/* ---------------------------------------------------------- */
/* Everything else Northside sets                              */
/* ---------------------------------------------------------- */

/** THE ONE WAY TO EVERY OTHER SETTING, on the seam: the price list's rooms by the one list the
 *  finder and Data read, then bringing in a new price list, then templates. */
function Elsewhere({ go, shelf }: { go?: (href: string) => void; shelf: string | null }) {
  return (
    <nav className="mg-elsewhere" aria-label="Everything else Northside sets">
      <p className="mg-elsewhere__lab">Everything else</p>
      <ul className="mg-elsewhere__list">
        {PRICE_LIST_ROOMS.map((room) => {
          const glyph = glyphOfWay(room.href)
          return (
            <li key={room.href}>
              <Button
                intent="quiet"
                size="sm"
                href={room.href}
                icon={glyph ?? undefined}
                title={room.say}
                onClick={go ? () => go(room.href) : undefined}
              >
                {room.word}
              </Button>
            </li>
          )
        })}
        {shelf ? (
          <li>
            <Button
              intent="quiet"
              size="sm"
              href={shelf}
              onClick={go ? () => go(shelf) : undefined}
            >
              Bring in a price list
            </Button>
          </li>
        ) : null}
        <li className="mg-elsewhere__not">Templates are not built yet</li>
      </ul>
    </nav>
  )
}
