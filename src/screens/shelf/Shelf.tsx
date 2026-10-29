import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ArrowCounterClockwiseIcon,
  ArrowRightIcon,
  ClipboardTextIcon,
  DownloadSimpleIcon,
  EyeIcon,
  FileArrowUpIcon,
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
import { Button, Icon, Plate, Refusal, Water } from '@/ui'
import { useCatalogue, usePrefs, useQuotes } from '@/app/useStores'
import { letterheadNow } from '@/app/northside'
import { catalogue } from '@/state/catalogue'
import { isDone } from '@/domain/catalogue/commands'
import { WorkbookRefusal, readWorkbook, type Workbook } from '@/domain/io/workbook'
import {
  newFileCommand,
  planNewFile,
  sheetsOnThePriceList,
  type NewFilePlan,
} from '@/domain/io/newFile'
import { validateEnvelope, type ProjectFile } from '@/domain/io/envelope'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { LAST_COPY_PREF, saveACopy } from './acts'
import { bytesOf, inflateRaw, sizeOf } from './files'
import { count, inventoryOf, plural, whenSaid, type Inventory } from './read'
import { Changes } from './Changes'
import { useDrop } from './drop'
import { Paste } from './Paste'
import { BringBack, ClearPage, ForgetPage } from './Pages'
import './shelf.css'

/* ============================================================
   THE SHELF — direction D, "The safe" (docs/directions/shelf-boards/
   d-the-safe.html), with C's glyphs and its Undo said before the act
   grafted on (the verdict's graft), and the change sheet drawn as D's
   own (its must-change).

   WHAT IT IS FOR, AND NOTHING MORE. Two things a dealership does
   rarely and fears doing: bringing in a new version of its Master Price
   File, and keeping its own work safe — one file out, the same file
   back on a new computer. Northside's own mark leads, as the showpiece;
   the new price list is one blue band; the work is an inventory,
   counted; the two acts that take things away are at the foot, far
   from Save, each a page of its own and never a box everybody clicks
   through.

   EVERY POSITION IS AN ADDRESS (`see`): the change sheet, the paste,
   bringing a copy back, and the two pages that take things away. What
   was read stays in this screen while a person moves between them, and
   a reload forgets it — a workbook is read again by choosing it again.
   ============================================================ */

export type ShelfSee = 'changes' | 'paste' | 'restore' | 'clear' | 'forget' | 'back' | 'cleared'

export interface ShelfProps {
  see: ShelfSee | undefined
  onSee: (see: ShelfSee | undefined) => void
}

/** A workbook read on this visit. */
export interface Brought {
  book: Workbook
  fileName: string
  size: number
}

/** What Apply did, while its Undo is still the one to press. */
export interface Applied {
  eventId: string
  changes: number
  fileName: string
}

export function Shelf({ see, onSee }: ShelfProps) {
  const status = useCatalogue((s) => s.status)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const modules = useCatalogue((s) => s.modules)
  const constraintDefs = useCatalogue((s) => s.constraintDefs)
  const org = useCatalogue((s) => s.org)
  const business = useCatalogue((s) => s.business)
  const quoteList = useQuotes((s) => s.quotes)
  const quotesRead = useQuotes((s) => s.loaded)
  const lastCopy = usePrefs((s) => s.values[LAST_COPY_PREF])

  const [brought, setBrought] = useState<Brought | null>(null)
  const [reading, setReading] = useState<string | null>(null)
  const [doorSaid, setDoorSaid] = useState<string | null>(null)
  const [applied, setApplied] = useState<Applied | null>(null)
  const [putBack, setPutBack] = useState(false)
  const [copy, setCopy] = useState<{ data: ProjectFile; fileName: string } | null>(null)
  const [copySaid, setCopySaid] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  const read = status === 'ready' && quotesRead
  const inventory = useMemo(
    () => inventoryOf({ tables, rows, modules, constraintDefs, org }, quoteList),
    [tables, rows, modules, constraintDefs, org, quoteList],
  )
  const plan = useMemo<NewFilePlan | null>(
    () =>
      brought && status === 'ready'
        ? planNewFile(brought.book, { tables, rows }, brought.fileName)
        : null,
    [brought, status, tables, rows],
  )
  const mark = letterheadNow({ org, business })?.mark ?? null
  const name = org?.name ?? business ?? 'Northside Marine'

  /* a page reached with nothing to show — a reload on the change sheet — goes back to the shelf */
  useEffect(() => {
    if (!read) return
    if (see === 'changes' && !plan) onSee(undefined)
    if (see === 'restore' && !copy) onSee(undefined)
  }, [read, see, plan, copy, onSee])

  async function bringIn(file: File): Promise<void> {
    setDoorSaid(null)
    setApplied(null)
    setPutBack(false)
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
      const wanted = sheetsOnThePriceList({ tables, rows })
      const book = await readWorkbook(await bytesOf(file), inflateRaw, (n) => wanted.has(n))
      if (book.sheets.length === 0) {
        setDoorSaid(
          `${file.name} has no sheet the price list here is read from. Its sheets are ${book.names.slice(0, 6).join(', ')}${book.names.length > 6 ? ' and more' : ''}; the price list’s lines come from ${[...wanted].slice(0, 8).join(', ')}.`,
        )
        setBrought(null)
      } else {
        setBrought({ book, fileName: file.name, size: file.size })
      }
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

  async function openCopy(file: File): Promise<void> {
    setCopySaid(null)
    if (!/\.json$/i.test(file.name)) {
      setCopySaid(
        /\.xlsx$/i.test(file.name)
          ? `${file.name} is a workbook, not a saved copy. A new Master Price File comes in through the blue panel above.`
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
    setCopy({ data: checked.data, fileName: file.name })
    onSee('restore')
  }

  function applyIt(): string | null {
    if (!plan) return null
    const outcome = catalogue
      .getState()
      .apply(
        newFileCommand(
          plan,
          `${plan.fileName}: ${plural(plan.changes, 'change', 'changes')} brought into the price list`,
        ),
      )
    if (!isDone(outcome)) return outcome.refused || 'Nothing in it would change the price list.'
    setApplied({ eventId: outcome.event.id, changes: plan.changes, fileName: plan.fileName })
    setPutBack(false)
    return null
  }

  function undoIt(): string | null {
    if (!applied) return null
    const outcome = catalogue.getState().undo(applied.eventId)
    if (!isDone(outcome)) return outcome.refused || 'There is nothing to put back.'
    setApplied(null)
    setPutBack(true)
    return null
  }

  async function save(): Promise<void> {
    setSaved(await saveACopy())
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

  if (see === 'changes' && plan && brought) {
    return (
      <Changes
        plan={plan}
        applied={applied}
        apply={applyIt}
        undo={undoIt}
        back={() => onSee(undefined)}
      />
    )
  }
  if (see === 'paste') return <Paste back={() => onSee(undefined)} />
  if (see === 'restore' && copy) {
    return (
      <BringBack
        copy={copy.data}
        fileName={copy.fileName}
        here={inventory}
        save={save}
        saved={saved}
        back={() => onSee(undefined)}
      />
    )
  }
  if (see === 'clear') {
    return <ClearPage here={inventory} save={save} saved={saved} back={() => onSee(undefined)} />
  }
  if (see === 'forget') {
    return (
      <ForgetPage
        here={inventory}
        lastCopy={typeof lastCopy === 'string' ? lastCopy : null}
        save={save}
        saved={saved}
        back={() => onSee(undefined)}
      />
    )
  }

  return (
    <main className="sf" data-testid="shelf" data-read="">
      <header className="sf-head">
        <div className="sf-mark">
          {mark ? (
            <img src={mark.src} width={mark.width} height={mark.height} alt={name} />
          ) : (
            <span className="sf-mark__name">{name}</span>
          )}
        </div>
        <div className="sf-head__words">
          <p className="sf-eyebrow">The shelf</p>
          <h1 className="sf-title">{name.split(' ')[0]}’s work, kept safe.</h1>
          <p className="sf-lede">
            A new Master Price File comes in at the top, every change shown first. Everything
            Northside has made goes out as one file, and comes back on a new computer.
          </p>
        </div>
      </header>

      {see === 'back' || see === 'cleared' ? (
        <p className="sf-landed" aria-live="polite">
          {see === 'back'
            ? `The copy is back: ${plural(inventory.quotes, 'quote', 'quotes')}, ${plural(inventory.customers, 'customer', 'customers')}, ${plural(inventory.rules, 'rule', 'rules')} Northside wrote, and ${count(inventory.lines)} lines of the price list.`
            : `The price list is back as the Master Price File came with the app. ${plural(inventory.quotes, 'quote', 'quotes')}, ${plural(inventory.customers, 'customer', 'customers')} and ${plural(inventory.rules, 'rule', 'rules')} Northside wrote are still here.`}
        </p>
      ) : null}

      <NewPriceList
        reading={reading}
        said={doorSaid}
        brought={brought}
        plan={plan}
        applied={applied}
        putBack={putBack}
        bringIn={(f) => void bringIn(f)}
        see={() => onSee('changes')}
        paste={() => onSee('paste')}
        undo={undoIt}
      />

      <div className="sf-keep">
        <SaveACopy
          inventory={inventory}
          lastCopy={typeof lastCopy === 'string' ? lastCopy : null}
          saved={saved}
          save={() => void save()}
        />
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
              <>
                The price list, <strong>{plural(inventory.quotes, 'quote', 'quotes')}</strong>,{' '}
                <strong>{plural(inventory.customers, 'customer', 'customers')}</strong>, the rules,
                the settings, and the name given at the start.
              </>
            }
            stays={
              typeof lastCopy === 'string' ? (
                <>
                  Copies saved to this computer’s Downloads, the last{' '}
                  {whenSaid(lastCopy, new Date())}.
                </>
              ) : (
                <>
                  Copies saved to this computer’s Downloads. <strong>None saved yet</strong>: save
                  one first.
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
/* the blue band: a new Master Price File                      */
/* ---------------------------------------------------------- */

function NewPriceList({
  reading,
  said,
  brought,
  plan,
  applied,
  putBack,
  bringIn,
  see,
  paste,
  undo,
}: {
  reading: string | null
  said: string | null
  brought: Brought | null
  plan: NewFilePlan | null
  applied: Applied | null
  putBack: boolean
  bringIn: (file: File) => void
  see: () => void
  paste: () => void
  undo: () => string | null
}) {
  const input = useRef<HTMLInputElement>(null)
  const { ref: zone, over } = useDrop<HTMLElement>(bringIn)
  const [undoSaid, setUndoSaid] = useState<string | null>(null)

  let body: ReactNode
  if (reading) {
    body = (
      <div className="sf-band__words">
        <p className="sf-band__title">Reading {reading}…</p>
        <p className="sf-band__say">Only the sheets the price list here is read from are opened.</p>
      </div>
    )
  } else if (applied) {
    body = (
      <>
        <div className="sf-band__words">
          <p className="sf-band__title">
            {applied.fileName} is on the price list: {plural(applied.changes, 'change', 'changes')}.
          </p>
          <p className="sf-band__say">
            Undo puts all {count(applied.changes)} back in one step. A quote already given keeps its
            figures.
          </p>
        </div>
        <span className="sf-band__act">
          <Button
            intent="veiled"
            icon={ArrowCounterClockwiseIcon}
            onClick={() => setUndoSaid(undo())}
            refusedBecause={undoSaid ?? undefined}
          >
            Undo
          </Button>
        </span>
      </>
    )
  } else if (brought && plan) {
    body = (
      <>
        <div className="sf-band__words">
          <p className="sf-band__title">{brought.fileName} is read. Nothing is written yet.</p>
          <p className="sf-band__say">
            {putBack ? 'Put back: nothing from it is on the price list now. ' : ''}
            {sizeOf(brought.size)}, not dated inside, so nothing here says which is newer. A quote
            already given keeps its figures.
          </p>
        </div>
        <dl className="sf-band__counts">
          <div>
            <dt>change</dt>
            <dd>{count(plan.changing)}</dd>
          </div>
          <div>
            <dt>new</dt>
            <dd>{count(plan.adding)}</dd>
          </div>
          <div>
            <dt>can’t place</dt>
            <dd>{count(plan.cannot)}</dd>
          </div>
        </dl>
        <span className="sf-band__act">
          <Button intent="veiled" icon={ArrowRightIcon} onClick={see}>
            See every change
          </Button>
        </span>
      </>
    )
  } else {
    body = (
      <>
        <div className="sf-band__words">
          <p className="sf-band__title">A new Master Price File? Bring it in.</p>
          <p className="sf-band__say">
            Choose the workbook as it arrives, or drop it here. Every change is shown first, and
            nothing is written until you apply it.
          </p>
        </div>
        <span className="sf-band__act">
          <Button intent="veiled" icon={FileXlsIcon} onClick={() => input.current?.click()}>
            Choose a workbook
          </Button>
        </span>
      </>
    )
  }

  return (
    <div className="sf-new">
      <section
        ref={zone}
        className="sf-band"
        data-over={over ? '' : undefined}
        aria-label="A new Master Price File"
      >
        <Water />
        <span className="sf-band__glyph" aria-hidden="true">
          <Icon glyph={FileArrowUpIcon} size="lg" />
        </span>
        {body}
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
      </section>
      <div className="sf-new__foot">
        {said ? <Refusal on="room">{said}</Refusal> : null}
        {brought && !reading && !applied ? (
          <Button
            intent="quiet"
            size="sm"
            icon={FileXlsIcon}
            onClick={() => input.current?.click()}
          >
            Bring in a different workbook
          </Button>
        ) : null}
        <Button intent="quiet" size="sm" icon={ClipboardTextIcon} onClick={paste}>
          Paste lines from Excel instead
        </Button>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* save a copy: the inventory                                  */
/* ---------------------------------------------------------- */

function SaveACopy({
  inventory: n,
  lastCopy,
  saved,
  save,
}: {
  inventory: Inventory
  lastCopy: string | null
  saved: string | null
  save: () => void
}) {
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
            Save a copy
          </h2>
          <p className="sf-save__say">
            Everything Northside would need on a new computer, in one file.
          </p>
          <p className="sf-save__when" data-none={lastCopy ? undefined : ''}>
            {lastCopy ? `Last copy saved ${whenSaid(lastCopy, new Date())}` : 'No copy saved yet'}
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
                ? 'none chosen yet, on Places or Settings'
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
        <footer className="sf-save__foot">
          <p className="sf-save__note" aria-live="polite">
            {saved
              ? `Saved as ${saved}, in this computer’s Downloads. Keep it somewhere a new computer can reach.`
              : 'A copy goes to this computer’s Downloads as one .json file.'}
          </p>
          <span className="sf-save__act">
            <Button intent="act" icon={DownloadSimpleIcon} onClick={save}>
              Save a copy
            </Button>
          </span>
        </footer>
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
          <Button intent="secondary" size="sm" onClick={() => input.current?.click()}>
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
              It says what the copy holds, counted, <strong>before</strong> anything is replaced.
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
              A quote comes back exactly as it was given, and a quote already here stays as it is.
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
