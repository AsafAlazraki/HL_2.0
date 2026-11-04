import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ArrowRightIcon,
  ClipboardTextIcon,
  DownloadSimpleIcon,
  EyeIcon,
  FileXlsIcon,
  ImageSquareIcon,
  LockSimpleIcon,
  ReceiptIcon,
  ScalesIcon,
  SlidersHorizontalIcon,
  SwapIcon,
  TrashIcon,
  UploadSimpleIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react'
import { Button, Icon, Plate, Refusal } from '@/ui'
import { useCatalogue, usePrefs, useQuotes } from '@/app/useStores'
import { catalogue, ctxFrom, dataOf } from '@/state/catalogue'
import { prefs, type PrefValue } from '@/state/prefs'
import { session } from '@/state/session'
import { isDone } from '@/domain/catalogue/commands'
import { makeCtx, type QuoteDef } from '@/domain/model'
import { draftsBehind, quoteName, type DraftBehind } from '@/domain/quote/listMoved'
import { WorkbookRefusal, readWorkbook, type Workbook } from '@/domain/io/workbook'
import { planNewFile, sheetsOnThePriceList, type NewFilePlan } from '@/domain/io/newFile'
import {
  NO_CHOICES,
  changeSetOf,
  chosenCommand,
  draftsMoved,
  tally,
  type ChangeSet,
  type Choices,
} from '@/domain/io/changeSet'
import {
  appliedSince,
  noteApplied,
  noteCleared,
  notePutBack,
  noteRead,
  notesOf,
  type BroughtNote,
} from '@/domain/io/brought'
import { validateEnvelope, type ProjectFile } from '@/domain/io/envelope'
import {
  copyHolds,
  editionHere,
  editionOfCopy,
  type PriceListEdition,
} from '@/domain/io/copyEdition'
import { PACK_ORG_ID } from '@/data/pack/boot'
import type { NarrowBy } from '@/domain/io/swing'
import { packedOn, provenanceOfSheet, shippedFile } from '@/screens/data/file'
import { BROUGHT_PREF, LAST_COPY_PREF, apartRefusal, clearThePriceList, saveACopy } from './acts'
import { bytesOf, inflateRaw, sizeOf } from './files'
import {
  count,
  dollars,
  forgetOwnSaid,
  inventoryOf,
  kindsSaid,
  plural,
  whenSaid,
  type Inventory,
} from './read'
import { Changes } from './Changes'
import { useDrop } from './drop'
import { Paste } from './Paste'
import { BringBack, ClearPage, ForgetPage } from './Pages'
import './shelf.css'

/* ============================================================
   THE SHELF, ROUND 2 — board A, "One working table"
   (docs/directions/data-round/shelf/boards/a.html), with C's opening
   sentence and its triage of the lines to look at first, and B's
   "Save a copy now" after Apply grafted on (the three judges).

   WHAT IT IS FOR. Two things a dealership does rarely and fears doing:
   bringing in a new version of its Master Price File, and keeping its
   own work safe. The rest page opens on WHICH PRICE LIST THIS COMPUTER
   HOLDS (the date it came with the app, its fingerprint, and every
   workbook applied since), then the account of every workbook brought
   in on this computer and what became of it, then the copy: what one
   would hold, and the way one comes back. The two acts that take
   things away stay at the foot, each a page of its own.

   THE CHANGE SHEET is one working table (`./Changes`): what does not
   move, said first; four counts that are also filters; a toolbar that
   stays in view; every line, every figure named; a tick on each line;
   and Apply pinned in view with what it will write counted beside it.

   EVERY POSITION IS AN ADDRESS (`see`, and the sheet's narrowing). What
   was read stays while a person moves about the app, and a reload
   forgets it — and says so where it was, rather than landing silently.
   ============================================================ */

export type ShelfSee =
  | 'changes'
  | 'paste'
  | 'restore'
  | 'clear'
  | 'forget'
  | 'back'
  | 'cleared'
  /** the change sheet or the copy was asked for after the page was opened again, and is gone */
  | 'unread'
  | 'uncopied'

export interface ShelfProps {
  see: ShelfSee | undefined
  onSee: (see: ShelfSee | undefined) => void
  narrow?: NarrowBy
  onNarrow?: (next: NarrowBy) => void
  /** opens a quote being written, from the shelf's word on what the price list moved under it */
  openQuote?: (id: string) => void
}

export { BROUGHT_PREF }

/** A workbook read on this visit, with what it would do. */
export interface Brought {
  book: Workbook
  fileName: string
  size: number
  /** ISO: the day the file says it was last saved on this computer */
  saved: string | null
  /** how long reading it took, in milliseconds, measured here */
  readMs: number
  /** its entry in the account */
  noteId: string
  /** the price list it was read against, and what it would do to it */
  against: unknown
  plan: NewFilePlan
  set: ChangeSet
}

/** What Apply did, while its Undo is still the one to press. */
export interface Applied {
  eventId: string
  /** the changes it wrote: what was kept */
  changes: number
  /** ISO: when it was written, so a copy saved before it is never said to hold it */
  at: string
  fileName: string
  /** THE CHANGE SHEET AS IT WAS APPLIED, so it reads what it wrote until Undo puts it back */
  plan: NewFilePlan
  set: ChangeSet
  choices: Choices
}

/* WHAT WAS READ OUTLIVES A WALK AWAY FROM THE SHELF (built-critique-m4.md, minor 3): the workbook,
   what was left out and placed, which of the lines to look at first were looked at, and the
   Apply whose Undo is still the next step back. A reload forgets all of it, together. */
interface Visit {
  brought: Brought | null
  choices: Choices
  looked: ReadonlySet<string>
  applied: Applied | null
}
let visit: Visit = { brought: null, choices: NO_CHOICES, looked: new Set(), applied: null }

const stillTheNextStepBack = (a: Applied | null): a is Applied =>
  a !== null && catalogue.getState().undoable()?.eventId === a.eventId

const writeNotes = (next: BroughtNote[]): void =>
  prefs.getState().set(BROUGHT_PREF, next as unknown as PrefValue)

const readNotes = (): BroughtNote[] => notesOf(prefs.getState().values[BROUGHT_PREF])

const WIDE: NarrowBy = {}
const NOWHERE = (): void => {}

export function Shelf({ see, onSee, narrow = WIDE, onNarrow = NOWHERE, openQuote }: ShelfProps) {
  const status = useCatalogue((s) => s.status)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const modules = useCatalogue((s) => s.modules)
  const constraintDefs = useCatalogue((s) => s.constraintDefs)
  const org = useCatalogue((s) => s.org)
  const version = useCatalogue((s) => s.version)
  const priceLevels = useCatalogue((s) => s.priceLevels)
  const quoteList = useQuotes((s) => s.quotes)
  const quotesRead = useQuotes((s) => s.loaded)
  const lastCopy = usePrefs((s) => s.values[LAST_COPY_PREF])
  const notes = notesOf(usePrefs((s) => s.values[BROUGHT_PREF]))

  const [brought, setBrought] = useState<Brought | null>(visit.brought)
  const [choices, setChoices] = useState<Choices>(visit.choices)
  const [looked, setLooked] = useState<ReadonlySet<string>>(visit.looked)
  const [applied, setApplied] = useState<Applied | null>(() =>
    stillTheNextStepBack(visit.applied) ? visit.applied : null,
  )
  const [reading, setReading] = useState<string | null>(null)
  const [doorSaid, setDoorSaid] = useState<string | null>(null)
  /* the workbook whose changes Undo has just put back, so the shelf says so; null otherwise */
  const [putBack, setPutBack] = useState<string | null>(null)
  const [copy, setCopy] = useState<{
    data: ProjectFile
    fileName: string
    /** the price list the copy names, or null when it was saved before copies named one */
    edition: PriceListEdition | null
  } | null>(null)
  const [copySaid, setCopySaid] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    visit = { brought, choices, looked, applied }
  }, [brought, choices, looked, applied])

  const read = status === 'ready' && quotesRead
  const inventory = useMemo(
    () => inventoryOf({ tables, rows, modules, constraintDefs, org }, quoteList),
    [tables, rows, modules, constraintDefs, org, quoteList],
  )
  /* THE PLAN, read again only when the price list moved under it since it was read */
  const fresh = useMemo<{ plan: NewFilePlan; set: ChangeSet } | null>(() => {
    if (!brought || status !== 'ready' || applied) return null
    if (brought.against === rows) return { plan: brought.plan, set: brought.set }
    const plan = planNewFile(brought.book, { tables, rows }, brought.fileName)
    return { plan, set: changeSetOf(plan, brought.book, { tables, rows }) }
  }, [brought, status, tables, rows, applied])

  const sheet = useMemo(
    () => (applied ? { plan: applied.plan, set: applied.set } : fresh),
    [applied, fresh],
  )
  /* THE DRAFTS A WORKBOOK WOULD MOVE, each named as the quote heads itself (verify-2.md, gap 3:
     "20261104-01 Highfield SP660 (PVC) W-W-WB", where the quote reads "Highfield Sport 660 ·
     PVC · White / White / White/Blue") */
  const drafts = useMemo(() => {
    if (!sheet) return []
    const byId = new Map(quoteList.map((q) => [q.id, q]))
    return draftsMoved(quoteList, sheet.set, applied?.choices ?? choices).map((d) => {
      const q = byId.get(d.quoteId)
      return { ...d, name: q ? quoteName(q) : d.subject }
    })
  }, [sheet, quoteList, applied, choices])
  /* AND THE DRAFTS THE PRICE LIST HAS ALREADY MOVED UNDER, read off the quotes and the price list
     as they are, so the shelf still says it after a reload (verify-2.md, gap 2) */
  const behind = useMemo<DraftBehind[]>(() => {
    if (status !== 'ready') return []
    const writing = quoteList.filter((q: QuoteDef) => q.state === 'draft')
    if (writing.length === 0) return []
    const data = dataOf(catalogue.getState())
    return draftsBehind(
      makeCtx({ ...ctxFrom(data), views: { ...data.views }, orgId: PACK_ORG_ID }),
      writing,
    )
    // the price list is read whole off the store; these are what move it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, quoteList, rows, tables, priceLevels])
  const edition = provenanceOfSheet(version)

  /* a page reached with nothing to show — a reload on the change sheet — goes back to the shelf */
  useEffect(() => {
    if (!read) return
    if (see === 'changes' && !sheet) onSee('unread')
    if (see === 'restore' && !copy) onSee('uncopied')
  }, [read, see, sheet, copy, onSee])

  /* A REFUSAL STANDS WHERE IT WAS REFUSED, AND ONLY UNTIL THE PERSON MOVES ON (verify-2.md, gap 8:
     "Dealer_Fit_Module.xlsx is a workbook, not a saved copy" still stood after a workbook was
     read, applied, undone and left) */
  useEffect(() => {
    setDoorSaid(null)
    setCopySaid(null)
  }, [see])

  async function bringIn(file: File): Promise<void> {
    setDoorSaid(null)
    setCopySaid(null)
    setPutBack(null)
    if (!/\.xlsx$/i.test(file.name)) {
      setDoorSaid(
        /\.json$/i.test(file.name)
          ? `${file.name} is a saved copy of Northside’s work, not a price list. It comes back through Bring back a copy, below.`
          : `${file.name} is not an Excel workbook. A new Master Price File comes in as the .xlsx workbook it arrives as; to bring in a few lines from any spreadsheet, paste them from Excel.`,
      )
      return
    }
    setReading(file.name)
    try {
      const started = performance.now()
      const wanted = sheetsOnThePriceList({ tables, rows })
      const book = await readWorkbook(await bytesOf(file), inflateRaw, (n) => wanted.has(n))
      if (book.sheets.length === 0) {
        setDoorSaid(
          `${file.name} has no sheet the price list here is read from. Its sheets are ${book.names.slice(0, 6).join(', ')}${book.names.length > 6 ? ' and more' : ''}; the price list’s lines come from ${[...wanted].slice(0, 8).join(', ')}.`,
        )
        return
      }
      const plan = planNewFile(book, { tables, rows }, file.name)
      const set = changeSetOf(plan, book, { tables, rows })
      const readMs = performance.now() - started
      const at = new Date().toISOString()
      const savedOn =
        Number.isFinite(file.lastModified) && file.lastModified > 0
          ? new Date(file.lastModified).toISOString()
          : null
      const noted = noteRead(readNotes(), {
        file: file.name,
        bytes: file.size,
        saved: savedOn,
        read: at,
        by: session.getState().name,
        changes: set.changing,
        adding: set.adding,
        cannot: set.cannot,
      })
      writeNotes(noted.notes)
      setApplied(null)
      setChoices(NO_CHOICES)
      setLooked(new Set())
      setBrought({
        book,
        fileName: file.name,
        size: file.size,
        saved: savedOn,
        readMs,
        noteId: noted.id,
        against: rows,
        plan,
        set,
      })
    } catch (error) {
      setDoorSaid(
        error instanceof WorkbookRefusal
          ? error.message
          : `${file.name} could not be read on this computer: ${error instanceof Error ? error.message : String(error)}`,
      )
    } finally {
      setReading(null)
    }
  }

  function putDown(): void {
    setBrought(null)
    setChoices(NO_CHOICES)
    setLooked(new Set())
    onSee(undefined)
  }

  async function openCopy(file: File): Promise<void> {
    setCopySaid(null)
    setDoorSaid(null)
    if (!/\.json$/i.test(file.name)) {
      setCopySaid(
        /\.xlsx$/i.test(file.name)
          ? `${file.name} is a workbook, not a saved copy. A new Master Price File comes in through Bring in a workbook, above.`
          : `${file.name} is not a copy this app saved. A copy is the .json file Save a copy writes.`,
      )
      return
    }
    let raw: unknown
    try {
      raw = JSON.parse(await file.text())
    } catch {
      setCopySaid(
        `${file.name} has been changed since it was saved, or did not finish downloading, so nothing in it can be read. Try the copy it was made from.`,
      )
      return
    }
    const checked = validateEnvelope(raw, PACK_ORG_ID)
    if (!checked.ok || !checked.data.rows) {
      setCopySaid(
        `${file.name} is not a whole copy of Northside’s work, so nothing in it is brought back. A whole copy is what Save a copy writes.`,
      )
      return
    }
    setCopy({ data: checked.data, fileName: file.name, edition: editionOfCopy(raw) })
    onSee('restore')
  }

  function applyIt(): string | null {
    if (!fresh || !brought) return null
    const counted = tally(fresh.set, choices)
    const command = chosenCommand(
      fresh.plan,
      fresh.set,
      choices,
      `${brought.fileName}: ${plural(counted.in, 'change', 'changes')} brought into the price list`,
    )
    if (!command) {
      return 'Every line is left out, so nothing would change the price list. Tick a line to keep it.'
    }
    const outcome = catalogue.getState().apply(command)
    if (!isDone(outcome)) return outcome.refused || 'Nothing in it would change the price list.'
    const at = new Date().toISOString()
    setApplied({
      eventId: outcome.event.id,
      changes: counted.in,
      at,
      fileName: brought.fileName,
      plan: fresh.plan,
      set: fresh.set,
      choices,
    })
    writeNotes(noteApplied(readNotes(), brought.noteId, counted.in, at))
    setPutBack(null)
    return null
  }

  function undoIt(): string | null {
    if (!applied) return null
    const outcome = catalogue.getState().undo(applied.eventId)
    if (!isDone(outcome)) return outcome.refused || 'There is nothing to put back.'
    if (brought) writeNotes(notePutBack(readNotes(), brought.noteId, new Date().toISOString()))
    setApplied(null)
    setPutBack(applied.fileName)
    return null
  }

  async function save(): Promise<void> {
    setSaved(await saveACopy())
  }

  async function clearIt(): Promise<string | null> {
    const apart = apartRefusal()
    if (apart) return apart
    writeNotes(noteCleared(readNotes(), new Date().toISOString(), session.getState().name))
    return clearThePriceList()
  }

  if (!read) {
    return (
      <main className="sf" data-testid="shelf">
        <p className="sf-wait" aria-live="polite">
          Reading what this computer keeps for Northside…
        </p>
      </main>
    )
  }

  /* THE DAY IS ONE WORD TO A LINE BREAK (verify-1.md, gap 8): "16 / September 2026" at 390 */
  const editionName = edition.known
    ? `The price list of ${packedOn(edition.file.packedAt, 'long').replace(/ /g, '\u00a0')}`
    : 'The price list on this computer'
  const fingerprint = edition.known ? edition.file.sha256.slice(0, 12) : null
  const copiedAt = typeof lastCopy === 'string' ? lastCopy : null
  const since = appliedSince(notes)
  const latest = since[since.length - 1]

  if (see === 'changes' && sheet && (brought || applied)) {
    return (
      <Changes
        plan={sheet.plan}
        set={sheet.set}
        file={{
          name: applied?.fileName ?? brought?.fileName ?? sheet.plan.fileName,
          size: brought?.size ?? null,
          saved: brought?.saved ?? null,
          readMs: brought?.readMs ?? null,
        }}
        edition={editionName}
        fingerprint={fingerprint}
        choices={applied?.choices ?? choices}
        setChoices={setChoices}
        looked={looked}
        setLooked={setLooked}
        narrow={narrow}
        onNarrow={onNarrow}
        applied={applied}
        apply={applyIt}
        undo={undoIt}
        drafts={drafts}
        save={save}
        saved={saved}
        lastCopy={copiedAt}
        held={applied ? copyHolds(copiedAt, applied.at) : false}
        putBack={applied ? null : putBack}
        back={() => onSee(undefined)}
        paste={() => onSee('paste')}
        putDown={putDown}
      />
    )
  }
  if (see === 'paste') return <Paste back={() => onSee(undefined)} />
  if (see === 'restore' && copy) {
    return (
      <BringBack
        copy={copy.data}
        fileName={copy.fileName}
        copyEdition={copy.edition}
        here={inventory}
        hereRows={rows}
        hereQuotes={quoteList}
        hereEdition={editionHere(shippedFile(), version, notes)}
        save={save}
        saved={saved}
        lastCopy={copiedAt}
        back={() => onSee(undefined)}
      />
    )
  }
  if (see === 'clear') {
    return (
      <ClearPage
        here={inventory}
        save={save}
        saved={saved}
        lastCopy={copiedAt}
        act={clearIt}
        back={() => onSee(undefined)}
      />
    )
  }
  if (see === 'forget') {
    return (
      <ForgetPage
        here={inventory}
        lastCopy={copiedAt}
        save={save}
        saved={saved}
        back={() => onSee(undefined)}
      />
    )
  }

  const now = new Date()

  return (
    <main className="sf sf-rest" data-testid="shelf" data-read="">
      <header className="sf-head">
        <div className="sf-head__words">
          <p className="sf-eyebrow">The shelf · this computer holds</p>
          <h1 className="sf-title">{editionName}</h1>
          <p className="sf-head__meta">
            <span>{plural(inventory.lists, 'list', 'lists')}</span>
            <span>{plural(inventory.lines, 'line', 'lines')}</span>
            {fingerprint ? (
              <span>
                fingerprint <code className="sf-code">{fingerprint}</code>
              </span>
            ) : null}
            <span>
              {latest
                ? `${plural(since.length, 'workbook', 'workbooks')} applied since, the last ${whenSaid(latest.at ?? latest.read, now)}`
                : 'no workbook applied since'}
            </span>
          </p>
          {!edition.known ? <p className="sf-head__say">{edition.because}</p> : null}
        </div>
        <SaveNow
          lastCopy={copiedAt}
          saved={saved}
          save={() => void save()}
          latest={latest ?? null}
        />
      </header>

      {see === 'back' || see === 'cleared' || see === 'unread' || see === 'uncopied' ? (
        <p className="sf-landed" aria-live="polite">
          {see === 'back'
            ? `The copy is back: ${[kindsSaid(inventory), `${count(inventory.lines)} lines of the price list`].filter(Boolean).join(', and ')}.`
            : see === 'cleared'
              ? `The price list is back as the Master Price File came with the app.${kindsSaid(inventory) ? ` Still here: ${kindsSaid(inventory)}.` : ''}`
              : see === 'unread'
                ? 'The page was opened again, and a workbook read before that is not kept. Bring it in again to see its changes; what was done with it is listed under Files brought in.'
                : 'The page was opened again, and a copy chosen before that is not kept. Choose it again to set it beside this computer.'}
        </p>
      ) : null}

      <FilesBroughtIn
        notes={notes}
        reading={reading}
        said={doorSaid}
        brought={brought && !applied ? brought : null}
        applied={applied}
        putBack={putBack}
        fingerprint={fingerprint}
        packedAt={edition.known ? edition.file.packedAt : null}
        lines={inventory.lines}
        lists={inventory.lists}
        drafts={inventory.quotes - inventory.given}
        moved={drafts.length}
        behind={behind}
        openQuote={openQuote}
        bringIn={(f) => void bringIn(f)}
        see={() => onSee('changes')}
        paste={() => onSee('paste')}
        undo={undoIt}
      />

      <div className="sf-keep">
        <SaveACopy inventory={inventory} saved={saved} />
        <BringBackACopy said={copySaid} open={(f) => void openCopy(f)} />
      </div>

      <section className="sf-away" aria-labelledby="sf-away-title">
        <h2 id="sf-away-title" className="sf-away__title">
          Starting again
        </h2>
        <p className="sf-away__say">
          Each says what goes and what stays on a page of its own, before anything is taken.
        </p>
        <div className="sf-away__cards">
          <AwayCard
            title="Clear the price list from this computer"
            goes={
              <>
                The price list here, <strong>{plural(inventory.lists, 'list', 'lists')}</strong> and{' '}
                <strong>{plural(inventory.lines, 'line', 'lines')}</strong>, and every change made
                to it on this computer.
              </>
            }
            stays={
              <>
                Every quote, as given: a quote is a photograph of what was offered on the day.
                Customers, the rules Northside wrote, its places and prices, its settings.
              </>
            }
            act="Clear the price list…"
            open={() => onSee('clear')}
          />
          <AwayCard
            title="Forget everything on this computer"
            goes={
              /* without its noughts, as its own page says it (verify-2.md, gap 7) */
              <>
                The price list
                {forgetOwnSaid(inventory) ? (
                  <>
                    , <strong>{forgetOwnSaid(inventory)}</strong>
                  </>
                ) : null}
                , its settings and pictures, and the name given at the start.
              </>
            }
            stays={
              typeof lastCopy === 'string' ? (
                <>Copies saved from this computer, the last {whenSaid(lastCopy, now)}.</>
              ) : (
                <>
                  Copies saved from this computer. <strong>None saved yet</strong>: save one first.
                </>
              )
            }
            act="Forget everything…"
            open={() => onSee('forget')}
          />
        </div>
      </section>
    </main>
  )
}

/* ---------------------------------------------------------- */
/* save a copy, now: the one amber act at the head              */
/* ---------------------------------------------------------- */

function SaveNow({
  lastCopy,
  saved,
  save,
  latest,
}: {
  lastCopy: string | null
  saved: string | null
  save: () => void
  /** the last workbook applied and still on the price list, or null */
  latest: BroughtNote | null
}) {
  const now = new Date()
  /* A COPY HOLDS AN APPLY ONLY WHEN IT WAS SAVED AFTER IT (verify-1.md, gap 2): measured against
     the account, so it holds across a reload and a walk away from the shelf as well */
  const unheld = latest !== null && !copyHolds(lastCopy, latest.at ?? latest.read)
  return (
    <Plate as="aside" pad="md" label="Save a copy">
      <div className="sf-savenow">
        <p className="sf-savenow__say" aria-live="polite" data-none={lastCopy ? undefined : ''}>
          {unheld ? (
            <>
              <strong>
                {latest.file}:{' '}
                {plural(latest.applied ?? latest.changes, 'change is', 'changes are')} on the price
                list
              </strong>{' '}
              that no copy holds yet
              {lastCopy ? `; the last copy was saved ${whenSaid(lastCopy, now)}, before Apply` : ''}
              .
            </>
          ) : saved && lastCopy ? (
            <>
              <strong>Last copy saved {whenSaid(lastCopy, now)}</strong>, as {saved}. Keep it
              somewhere a new computer can reach.
            </>
          ) : lastCopy ? (
            <>
              <strong>Last copy saved {whenSaid(lastCopy, now)}.</strong>
            </>
          ) : (
            <>
              <strong>No copy saved yet.</strong> Nothing of Northside’s could come back on another
              computer.
            </>
          )}
        </p>
        <span className="sf-savenow__act">
          <Button intent="act" icon={DownloadSimpleIcon} onClick={save}>
            {unheld ? 'Save a copy now' : lastCopy ? 'Save another copy' : 'Save a copy'}
          </Button>
        </span>
      </div>
    </Plate>
  )
}

/* ---------------------------------------------------------- */
/* files brought in: the account, and the way a new one comes  */
/* ---------------------------------------------------------- */

const dayOf = (iso: string, now: Date): string => {
  const at = new Date(iso)
  if (Number.isNaN(at.getTime())) return ''
  if (at.toDateString() === now.toDateString()) return 'Today'
  return at.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function NowSaid({ note }: { note: BroughtNote }) {
  const word =
    note.now === 'applied'
      ? `Applied: ${count(note.applied ?? 0)}`
      : note.now === 'put-back'
        ? 'Put back by Undo'
        : note.now === 'cleared'
          ? 'Cleared'
          : 'Read, not applied'
  return (
    <span className="sf-now" data-now={note.now}>
      {word}
    </span>
  )
}

function FilesBroughtIn({
  notes,
  reading,
  said,
  brought,
  applied,
  putBack,
  fingerprint,
  packedAt,
  lines,
  lists,
  drafts,
  moved,
  behind,
  openQuote,
  bringIn,
  see,
  paste,
  undo,
}: {
  notes: BroughtNote[]
  reading: string | null
  said: string | null
  brought: Brought | null
  applied: Applied | null
  putBack: string | null
  fingerprint: string | null
  packedAt: string | null
  lines: number
  lists: number
  drafts: number
  moved: number
  /** the quotes being written whose lines the price list now reads differently */
  behind: DraftBehind[]
  openQuote: ((id: string) => void) | undefined
  bringIn: (file: File) => void
  see: () => void
  paste: () => void
  undo: () => string | null
}) {
  const input = useRef<HTMLInputElement>(null)
  const { ref: zone, over } = useDrop<HTMLElement>(bringIn)
  const [undoSaid, setUndoSaid] = useState<string | null>(null)
  const now = new Date()
  const open = brought ?? null
  return (
    <section
      ref={zone}
      className="sf-files"
      data-over={over ? '' : undefined}
      aria-labelledby="sf-files-title"
      data-ground="plate"
    >
      <header className="sf-files__head">
        <div className="sf-files__words">
          <h2 id="sf-files-title" className="sf-h2">
            Files brought in
          </h2>
          <p className="sf-files__say">
            Every workbook read on this computer, what it offered and what was done with it. Drop a
            new one here, or choose it.
          </p>
        </div>
        <div className="sf-files__acts">
          <Button intent="secondary" icon={FileXlsIcon} onClick={() => input.current?.click()}>
            {open ? 'Bring in a different workbook' : 'Bring in a workbook'}
          </Button>
          <Button intent="quiet" icon={ClipboardTextIcon} onClick={paste}>
            Paste lines
          </Button>
        </div>
        <input
          ref={input}
          className="sf-file"
          type="file"
          accept=".xlsx"
          tabIndex={-1}
          aria-hidden="true"
          data-testid="shelf-workbook"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) bringIn(file)
          }}
        />
      </header>
      {said ? (
        <Refusal on="room" wide>
          {said}
        </Refusal>
      ) : null}

      {reading ? (
        <p className="sf-files__reading" aria-live="polite">
          Reading {reading}… Only the sheets the price list here is read from are opened.
        </p>
      ) : null}

      {open ? (
        <div className="sf-open" aria-live="polite">
          <p className="sf-open__title">
            <strong>{open.fileName} is read. Nothing is written yet.</strong>{' '}
            {putBack ? 'Put back: nothing from it is on the price list now. ' : ''}
          </p>
          <dl className="sf-open__counts">
            <div data-fate="change">
              <dt>change</dt>
              <dd>{count(open.set.changing)}</dd>
            </div>
            <div data-fate="new">
              <dt>new</dt>
              <dd>{count(open.set.adding)}</dd>
            </div>
            <div data-fate="cannot">
              <dt>can’t place</dt>
              <dd>{count(open.set.cannot)}</dd>
            </div>
          </dl>
          <span className="sf-open__act">
            <Button intent="primary" icon={ArrowRightIcon} onClick={see}>
              See every change
            </Button>
          </span>
        </div>
      ) : applied ? (
        <div className="sf-open" data-applied="" aria-live="polite">
          <p className="sf-open__title">
            <strong>
              {applied.fileName} is on the price list:{' '}
              {plural(applied.changes, 'change', 'changes')}.
            </strong>{' '}
            Undo puts every one of them back in one step. A quote already given keeps its figures.
          </p>
          <span className="sf-open__act sf-open__act--two">
            <Button intent="secondary" icon={EyeIcon} onClick={see}>
              See what it changed
            </Button>
            <Button
              intent="secondary"
              onClick={() => setUndoSaid(undo())}
              refusedBecause={undoSaid ?? undefined}
            >
              Undo
            </Button>
          </span>
        </div>
      ) : putBack ? (
        <p className="sf-files__reading" aria-live="polite">
          Put back: nothing from {putBack} is on the price list now.
        </p>
      ) : null}

      <table className="sf-ledger">
        <caption className="sf-visually-hidden">Files brought in</caption>
        <thead>
          <tr className="sf-ledger__row sf-ledger__row--head">
            <th scope="col">File</th>
            <th scope="col">Read</th>
            <th scope="col">Change</th>
            <th scope="col">New</th>
            <th scope="col">Can’t place</th>
            <th scope="col">Now</th>
          </tr>
        </thead>
        <tbody>
          {notes.map((n) => (
            <tr className="sf-ledger__row" key={n.id} data-now={n.now}>
              <td className="sf-ledger__file">
                <strong>{n.now === 'cleared' ? 'The price list, cleared' : n.file}</strong>
                <small>
                  {n.now === 'cleared'
                    ? `back as it came with the app${n.by ? ` · by ${n.by}` : ''}`
                    : [
                        sizeOf(n.bytes),
                        n.saved ? `saved on this computer ${dayOf(n.saved, now)}` : null,
                        n.by ? `by ${n.by}` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                </small>
              </td>
              <td data-label="Read">{dayOf(n.read, now)}</td>
              <td data-label="Change" className="sf-fig">
                {n.now === 'cleared' ? '—' : count(n.changes)}
              </td>
              <td data-label="New" className="sf-fig">
                {n.now === 'cleared' ? '—' : count(n.adding)}
              </td>
              <td data-label="Can’t place" className="sf-fig">
                {n.now === 'cleared' ? '—' : count(n.cannot)}
              </td>
              <td data-label="Now">
                <NowSaid note={n} />
              </td>
            </tr>
          ))}
          <tr className="sf-ledger__row" data-now="came">
            <td className="sf-ledger__file">
              <strong>The Master Price File, as it came with the app</strong>
              <small>
                {plural(lists, 'list', 'lists')} · {plural(lines, 'line', 'lines')} here now
                {fingerprint ? (
                  <>
                    {' · '}
                    <code className="sf-code">{fingerprint}</code>
                  </>
                ) : null}
              </small>
            </td>
            <td data-label="Read">{packedAt ? packedOn(packedAt) : '—'}</td>
            <td data-label="Change" className="sf-fig">
              —
            </td>
            <td data-label="New" className="sf-fig">
              —
            </td>
            <td data-label="Can’t place" className="sf-fig">
              —
            </td>
            <td data-label="Now">
              <span className="sf-now" data-now="came">
                Came with the app
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <DraftsHere
        drafts={drafts}
        moved={moved}
        open={open !== null}
        behind={behind}
        openQuote={openQuote}
      />
    </section>
  )
}

/* ---------------------------------------------------------- */
/* the quotes being written, and what the price list did to them */
/* ---------------------------------------------------------- */

const SAID_ONCE =
  'A line on a quote keeps the price it had when it was chosen; a line chosen after Apply reads the new one. A quote already given never moves.'

/**
 * THE QUOTES BEING WRITTEN, AS THE PRICE LIST STANDS UNDER THEM. Before Apply, the lines a workbook
 * would move are counted on its changes; otherwise the drafts whose lines the price list now reads
 * differently are named, read off the quotes and the price list themselves, so a reload does not
 * forget them (verify-2.md, gap 2), each named as it heads itself and opened in one press.
 */
function DraftsHere({
  drafts,
  moved,
  open,
  behind,
  openQuote,
}: {
  drafts: number
  moved: number
  open: boolean
  behind: DraftBehind[]
  openQuote: ((id: string) => void) | undefined
}) {
  if (drafts === 0 || open || behind.length === 0) {
    return (
      <p className="sf-drafts">
        <Icon glyph={ReceiptIcon} />
        <span>
          {drafts === 0 ? (
            <>
              <strong>No quote is being written on this computer</strong>, so no workbook would move
              one.
            </>
          ) : open ? (
            moved === 0 ? (
              <strong>
                {plural(drafts, 'quote is', 'quotes are')} being written, and this workbook moves no
                line of {drafts === 1 ? 'it' : 'them'}.
              </strong>
            ) : (
              <>
                <strong>
                  {plural(moved, 'quote being written carries', 'quotes being written carry')} a
                  line this workbook moves
                </strong>
                , counted on its changes before Apply.
              </>
            )
          ) : (
            <>
              <strong>
                {plural(drafts, 'quote is', 'quotes are')} being written, and the price list reads
                every line of {drafts === 1 ? 'it' : 'them'} at the price it keeps.
              </strong>{' '}
              When a workbook is read, the lines of them it would move are counted before Apply.
            </>
          )}{' '}
          {SAID_ONCE}
        </span>
      </p>
    )
  }
  const lines = behind.reduce((n, d) => n + d.lines.length, 0)
  return (
    <div className="sf-drafts sf-drafts--behind">
      <Icon glyph={ReceiptIcon} />
      <div className="sf-drafts__in">
        <p>
          <strong>
            {plural(behind.length, 'quote being written carries', 'quotes being written carry')}{' '}
            {plural(lines, 'line', 'lines')} the price list now reads differently.
          </strong>{' '}
          Each line keeps the price it had when it was chosen. The quote says so under its total,
          with today’s price one press away; a quote already given never moves.
        </p>
        <ul className="sf-drafts__list">
          {behind.map((d) => (
            <li key={d.quoteId} className="sf-drafts__quote">
              <span className="sf-drafts__words">
                <strong className="sf-drafts__name">{d.name}</strong>
                <span className="sf-drafts__ref">
                  quote {d.reference}
                  {d.customer ? ` for ${d.customer}` : ''}
                </span>
                {d.lines.map((l) => (
                  <span key={l.lineId} className="sf-drafts__line">
                    {l.name} keeps <span className="sf-fig">{dollars(l.keeps)}</span>; the price
                    list reads <strong className="sf-fig">{dollars(l.reads)}</strong>
                  </span>
                ))}
              </span>
              {openQuote ? (
                <span className="sf-drafts__open">
                  <Button
                    intent="secondary"
                    size="sm"
                    icon={ArrowRightIcon}
                    onClick={() => openQuote(d.quoteId)}
                  >
                    Open the quote
                  </Button>
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* save a copy: the inventory                                  */
/* ---------------------------------------------------------- */

function SaveACopy({ inventory: n, saved }: { inventory: Inventory; saved: string | null }) {
  const settings = [
    n.details > 0 ? plural(n.details, 'detail', 'details') : null,
    n.people > 0 ? plural(n.people, 'person', 'people') : null,
    n.look ? 'the look' : null,
  ].filter(Boolean)
  const drafts = n.quotes - n.given
  return (
    <Plate as="section" pad="lg" labelledBy="sf-save-title">
      <div className="sf-save">
        <header className="sf-save__head">
          <h2 id="sf-save-title" className="sf-h2">
            What a copy holds
          </h2>
          <p className="sf-save__say">
            Everything Northside would need on a new computer, in one file.
          </p>
        </header>
        <ul className="sf-kinds">
          <Kind
            glyph={ReceiptIcon}
            name="Quotes"
            say={
              n.quotes === 0
                ? 'none yet · each travels with its own figures'
                : `${count(n.given)} given, ${count(drafts)} being written`
            }
            figure={n.quotes}
          />
          <Kind
            glyph={UsersThreeIcon}
            name="Customers"
            say={n.customers === 0 ? 'none yet' : 'the people Northside sells to'}
            figure={n.customers}
          />
          <Kind
            glyph={ScalesIcon}
            name="Rules Northside wrote"
            say={n.rules === 0 ? 'none yet' : 'each kept on or off as it is'}
            figure={n.rules}
          />
          <Kind
            glyph={SlidersHorizontalIcon}
            name="Settings"
            say={settings.length > 0 ? settings.join(' · ') : 'none set yet'}
            figure={n.details}
          />
          <Kind
            glyph={ImageSquareIcon}
            name="Pictures Northside chose"
            say={
              n.pictures === 0
                ? 'none chosen yet'
                : `on ${plural(n.placesDressed, 'place', 'places')} and in Settings`
            }
            figure={n.pictures}
          />
          <Kind
            glyph={FileXlsIcon}
            name="The price list, as it is here"
            say={`${plural(n.lists, 'list', 'lists')}, with every change made on this computer`}
            figure={n.lines}
          />
        </ul>
        <p className="sf-save__note">
          {saved
            ? `Saved as ${saved}. The browser chose where it went.`
            : 'A copy is one .json file, handed to the browser to save. Save a copy is at the top of the page.'}
        </p>
      </div>
    </Plate>
  )
}

function Kind({
  glyph,
  name,
  say,
  figure,
}: {
  glyph: typeof ReceiptIcon
  name: string
  say: string
  figure: number
}) {
  return (
    <li className="sf-kind">
      <span className="sf-kind__glyph" aria-hidden="true">
        <Icon glyph={glyph} />
      </span>
      <span className="sf-kind__words">
        <span className="sf-kind__name">{name}</span>
        <span className="sf-kind__say">{say}</span>
      </span>
      <span className="sf-kind__figure" data-zero={figure === 0 ? '' : undefined}>
        {count(figure)}
      </span>
    </li>
  )
}

/* ---------------------------------------------------------- */
/* bring back a copy                                           */
/* ---------------------------------------------------------- */

function BringBackACopy({ said, open }: { said: string | null; open: (file: File) => void }) {
  const input = useRef<HTMLInputElement>(null)
  const { ref: zone, over } = useDrop<HTMLDivElement>(open)
  return (
    <Plate as="section" pad="lg" labelledBy="sf-back-title">
      <div className="sf-back">
        <h2 id="sf-back-title" className="sf-h2">
          Bring back a copy
        </h2>
        <div ref={zone} className="sf-drop" data-over={over ? '' : undefined}>
          <Icon glyph={UploadSimpleIcon} size="lg" />
          <p className="sf-drop__say">Drop a saved copy here</p>
          <Button intent="secondary" onClick={() => input.current?.click()}>
            Choose a copy on this computer
          </Button>
          <input
            ref={input}
            className="sf-file"
            type="file"
            accept=".json,application/json"
            tabIndex={-1}
            aria-hidden="true"
            data-testid="shelf-copy"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) open(file)
            }}
          />
        </div>
        {said ? <Refusal>{said}</Refusal> : null}
        <ul className="sf-promises">
          <li>
            <Icon glyph={EyeIcon} />
            <span>
              It is set beside this computer, kind by kind, <strong>before</strong> anything is
              replaced.
            </span>
          </li>
          <li>
            <Icon glyph={SwapIcon} />
            <span>
              This computer’s price list, customers, rules, places and settings become the copy’s.
            </span>
          </li>
          <li>
            <Icon glyph={LockSimpleIcon} />
            <span>
              A quote already here stays exactly as it is; the copy’s others come here as they were
              given.
            </span>
          </li>
        </ul>
      </div>
    </Plate>
  )
}

/* ---------------------------------------------------------- */
/* the two that take things away                               */
/* ---------------------------------------------------------- */

function AwayCard({
  title,
  goes,
  stays,
  act,
  open,
}: {
  title: string
  goes: ReactNode
  stays: ReactNode
  act: string
  open: () => void
}) {
  return (
    <Plate as="article" pad="md" label={title}>
      <div className="sf-away-card">
        <h3 className="sf-away-card__title">
          <Icon glyph={TrashIcon} />
          {title}
        </h3>
        <dl className="sf-goes">
          <dt>Goes</dt>
          <dd>{goes}</dd>
          <dt>Stays</dt>
          <dd>{stays}</dd>
        </dl>
        <span className="sf-away-card__act">
          <Button intent="secondary" onClick={open}>
            {act}
          </Button>
        </span>
      </div>
    </Plate>
  )
}
