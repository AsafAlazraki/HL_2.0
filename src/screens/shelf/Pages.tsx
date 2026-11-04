import { useState, type ReactNode } from 'react'
import {
  ArrowLeftIcon,
  ArrowsClockwiseIcon,
  DownloadSimpleIcon,
  TrashIcon,
  WarningIcon,
} from '@phosphor-icons/react'
import { Button, Icon, Plate } from '@/ui'
import type { ProjectFile } from '@/domain/io/envelope'
import { sameEdition, type PriceListEdition } from '@/domain/io/copyEdition'
import { packedOn } from '@/screens/data/file'
import type { QuoteDef, RowData } from '@/domain/model'
import { CUSTOMER_TABLE_ID } from '@/domain/people/customers'
import { priceListsBeside, quotesBeside } from '@/domain/io/beside'
import { bringBack, forgetEverything } from './acts'
import {
  count,
  forgetRefusal,
  hasOwnWork,
  inventoryOfCopy,
  kindsSaid,
  listSaid,
  plural,
  whenSaid,
  type Inventory,
} from './read'

/* ============================================================
   THE THREE PAGES THAT REPLACE OR TAKE AWAY — each its own address,
   never a box over the shelf that everybody clicks through
   (docs/research/refs/shelf/notes.md §1.4, iOS's Erase All Content).

   EACH SAYS WHAT GOES AND WHAT STAYS, COUNTED, BEFORE ITS BUTTON, and
   each puts "Save a copy first" beside it as the amber one: the loud
   button on a page that takes things away is the one that keeps them.
   The act itself names its consequence in its own words.

   EACH ACT ANSWERS A SENTENCE OR GOES AHEAD. A person Northside set
   apart from changing prices and settings is told so under the act
   they pressed (`apartRefusal`, src/screens/shelf/acts.ts), and
   forgetting everything is refused, at rest and in the act, until a
   copy has been saved (`forgetRefusal`).
   ============================================================ */

interface PageProps {
  here: Inventory
  save: () => Promise<void>
  saved: string | null
  /** ISO: when the last copy was saved on this computer, or null when none ever was */
  lastCopy: string | null
  back: () => void
}

function Frame({
  title,
  say,
  goes,
  stays,
  saved,
  lastCopy,
  save,
  act,
  actSay,
  back,
  testid,
  tone,
  refused = null,
  beside = null,
}: {
  title: string
  say: string
  goes: ReactNode
  stays: ReactNode
  saved: string | null
  lastCopy: string | null
  save: (() => Promise<void>) | null
  /** null when it went ahead; otherwise the sentence it was refused with */
  act: () => Promise<string | null>
  actSay: string
  /** why the act cannot be pressed yet, said under it at rest */
  refused?: string | null
  back: () => void
  testid: string
  tone: 'away' | 'back'
  /** what is set beside this computer before the act, drawn above Goes and Stays */
  beside?: ReactNode
}) {
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const run = async (): Promise<void> => {
    setBusy(true)
    setFailed(null)
    try {
      const said = await act()
      if (said) {
        setBusy(false)
        setFailed(said)
      }
    } catch (error) {
      setBusy(false)
      setFailed(
        `This computer would not finish it: ${error instanceof Error ? error.message : String(error)}. Nothing has been taken that a reload does not show.`,
      )
    }
  }
  return (
    <main
      className="sf sf-page"
      data-testid="shelf"
      data-read=""
      data-see={testid}
      data-tone={tone}
    >
      <nav className="sf-crumb" aria-label="The shelf">
        <Button intent="quiet" icon={ArrowLeftIcon} onClick={back}>
          Back to the shelf
        </Button>
      </nav>
      <Plate as="section" pad="lg" labelledBy="sf-page-title">
        <div className="sf-page__body">
          <h1 id="sf-page-title" className="sf-page__title">
            <Icon glyph={tone === 'away' ? WarningIcon : ArrowsClockwiseIcon} size="lg" />
            {title}
          </h1>
          <p className="sf-page__say">{say}</p>
          {beside}
          <dl className="sf-goes sf-goes--page">
            <dt>Goes</dt>
            <dd>{goes}</dd>
            <dt>Stays</dt>
            <dd>{stays}</dd>
          </dl>
          {saved ? (
            <p className="sf-page__saved" aria-live="polite">
              Saved as {saved}. The browser chose where it went.
            </p>
          ) : lastCopy && save ? (
            /* A COPY SAVED A MOMENT AGO IS SAID, and "first" is not asked of it again (verify-1.md,
               gap 9): a copy saved before the page opened again is still a copy */
            <p className="sf-page__saved">Last copy saved {whenSaid(lastCopy, new Date())}.</p>
          ) : null}
          <div className="sf-page__acts">
            {save ? (
              <span className="sf-page__safe">
                <Button intent="act" icon={DownloadSimpleIcon} onClick={() => void save()}>
                  {saved || lastCopy ? 'Save another copy' : 'Save a copy first'}
                </Button>
              </span>
            ) : null}
            <Button
              /* with nothing here to save first, bringing the copy back is the page's one act */
              intent={save ? 'secondary' : 'act'}
              icon={tone === 'away' ? TrashIcon : ArrowsClockwiseIcon}
              onClick={() => void run()}
              refusedBecause={
                busy ? 'Working on it: this computer is writing.' : (failed ?? refused ?? undefined)
              }
            >
              {actSay}
            </Button>
          </div>
        </div>
      </Plate>
    </main>
  )
}

export function ClearPage({
  here,
  save,
  saved,
  lastCopy,
  back,
  act,
}: PageProps & { act: () => Promise<string | null> }) {
  const own = kindsSaid({ quotes: 0, customers: here.customers, rules: here.rules })
  return (
    <Frame
      testid="clear"
      tone="away"
      title="Clear the price list from this computer"
      say="The price list goes back to the Master Price File as it came with the app. Use it when the price list here has gone wrong in ways Undo cannot reach."
      goes={
        <>
          The price list here, <strong>{plural(here.lists, 'list', 'lists')}</strong> and{' '}
          <strong>{plural(here.lines, 'line', 'lines')}</strong>, with every change made to it on
          this computer: typed on the price list, or brought in from a workbook.
        </>
      }
      stays={
        <>
          {here.quotes > 0 ? (
            <strong>{plural(here.quotes, 'quote', 'quotes')}</strong>
          ) : (
            'Every quote'
          )}
          : a clear never reaches a quote.{' '}
          {own ? (
            <>
              <strong>{own}</strong>, Northside’s places
            </>
          ) : (
            'Northside’s places'
          )}
          , the prices it decided and its settings.
        </>
      }
      saved={saved}
      lastCopy={lastCopy}
      save={save}
      act={act}
      actSay="Clear the price list from this computer"
      back={back}
    />
  )
}

export function ForgetPage({ here, lastCopy, save, saved, back }: PageProps) {
  /* what goes, without its noughts: a kind with none is not said (verify-1.md, gap 9) */
  const own = listSaid(
    [
      here.quotes > 0
        ? `${plural(here.quotes, 'quote', 'quotes')}${here.given > 0 ? ` (${count(here.given)} given)` : ''}`
        : null,
      here.customers > 0 ? plural(here.customers, 'customer', 'customers') : null,
      here.rules > 0 ? plural(here.rules, 'rule Northside wrote', 'rules Northside wrote') : null,
    ].filter((x): x is string => x !== null),
  )
  return (
    <Frame
      testid="forget"
      tone="away"
      title="Forget everything on this computer"
      say="This computer keeps nothing of Northside’s afterwards, and asks who is at the desk again. Use it before a computer is handed on."
      goes={
        <>
          The price list
          {own ? (
            <>
              , <strong>{own}</strong>
            </>
          ) : null}
          , its settings and pictures, and the name given at the start.
        </>
      }
      stays={
        saved || lastCopy ? (
          <>
            Copies saved from this computer
            {lastCopy ? `, the last ${whenSaid(lastCopy, new Date())}` : ''}. Bring one back on any
            computer to have all of it again.
          </>
        ) : (
          <>Copies saved from this computer.</>
        )
      }
      saved={saved}
      lastCopy={lastCopy}
      save={save}
      act={forgetEverything}
      refused={forgetRefusal(here, Boolean(saved || lastCopy))}
      actSay="Forget everything on this computer"
      back={back}
    />
  )
}

export function BringBack({
  copy,
  fileName,
  here,
  hereRows,
  hereQuotes,
  hereEdition,
  copyEdition,
  save,
  saved,
  lastCopy,
  back,
}: PageProps & {
  copy: ProjectFile
  fileName: string
  hereRows: Readonly<Record<string, readonly RowData[]>>
  hereQuotes: readonly QuoteDef[]
  /** the price list this computer holds, as a copy saved now would name it */
  hereEdition: PriceListEdition
  /** the price list the copy names, or null when it was saved before copies named one */
  copyEdition: PriceListEdition | null
}) {
  const theirs = inventoryOfCopy(copy)
  const now = new Date()
  const saidOn = copy.exportedAt ? whenSaid(copy.exportedAt, now) : ''
  const hasWork = hasOwnWork(here)
  const lists = priceListsBeside(hereRows, copy.rows ?? {}, new Set([CUSTOMER_TABLE_ID]))
  const quotes = quotesBeside(hereQuotes, copy.quotes ?? [])
  const kinds: { name: string; here: number; copy: number }[] = [
    { name: 'Quotes', here: here.quotes, copy: theirs.quotes },
    { name: 'Customers', here: here.customers, copy: theirs.customers },
    { name: 'Rules Northside wrote', here: here.rules, copy: theirs.rules },
    { name: 'Details on Settings', here: here.details, copy: theirs.details },
    { name: 'Pictures Northside chose', here: here.pictures, copy: theirs.pictures },
    { name: 'Lists on the price list', here: here.lists, copy: theirs.lists },
    { name: 'Lines on the price list', here: here.lines, copy: theirs.lines },
  ]
  return (
    <Frame
      testid="restore"
      tone="back"
      title={`Bring back ${fileName}`}
      say={`${saidOn ? `Saved ${saidOn}. ` : ''}It is set beside this computer below, kind by kind. Nothing is replaced until you bring it back.`}
      beside={
        <div className="sf-beside">
          <table className="sf-beside__table">
            <caption className="sf-visually-hidden">This computer beside the copy</caption>
            <thead>
              <tr>
                <th scope="col">Kind</th>
                {/* in a hand the two short words, so the kind keeps the room (verify-1.md, gap 6) */}
                <th scope="col">
                  <span className="sf-beside__long">This computer</span>
                  <span className="sf-beside__short" aria-hidden="true">
                    Here
                  </span>
                </th>
                <th scope="col">
                  <span className="sf-beside__long">The copy</span>
                  <span className="sf-beside__short" aria-hidden="true">
                    Copy
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {kinds.map((k) => (
                <tr key={k.name} data-differs={k.here === k.copy ? undefined : ''}>
                  <th scope="row">{k.name}</th>
                  <td className="sf-fig">{count(k.here)}</td>
                  <td className="sf-fig">{count(k.copy)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="sf-beside__said">
            <li>
              <strong>The price list.</strong> This computer holds {editionSaid(hereEdition, now)}.{' '}
              {copyEdition === null
                ? 'The copy does not name its price list: it was saved before copies named the price list they carry.'
                : sameEdition(copyEdition, hereEdition)
                  ? 'The copy holds the same.'
                  : `The copy holds ${editionSaid(copyEdition, now)}.`}{' '}
              Of the copy’s {count(lists.same + lists.differ + lists.copyOnly)} lines,{' '}
              {count(lists.same)} read exactly as they do here
              {lists.differ > 0 ? `, ${count(lists.differ)} read differently` : ''}
              {lists.copyOnly > 0 ? `, and ${count(lists.copyOnly)} are only in the copy` : ''}
              {lists.hereOnly > 0 ? `; ${count(lists.hereOnly)} here are not in it and go` : ''}.
            </li>
            <li>
              <strong>Quotes.</strong>{' '}
              {quotes.fresh.length + quotes.already.length === 0
                ? 'The copy holds no quote.'
                : [
                    quotes.fresh.length > 0
                      ? `${plural(quotes.fresh.length, 'quote comes', 'quotes come')} here new, as ${quotes.fresh.length === 1 ? 'it was' : 'they were'} given`
                      : null,
                    quotes.already.length > 0
                      ? `${plural(quotes.already.length, 'quote is', 'quotes are')} already here and ${quotes.already.length === 1 ? 'stays' : 'stay'} exactly as ${quotes.already.length === 1 ? 'it is' : 'they are'}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join('; ') + '.'}
            </li>
          </ul>
        </div>
      }
      goes={
        <>
          This computer’s price list ({count(here.lines)} lines),{' '}
          {here.kept > 0 ? (
            <>
              <strong>{plural(here.kept, 'customer', 'customers')}</strong> kept on Customers,{' '}
            </>
          ) : null}
          the rules Northside wrote, its places and its settings: each becomes the copy’s.
        </>
      }
      stays={
        <>
          {here.quotes === 0 ? (
            'Every quote: there is none here now.'
          ) : (
            <>
              <strong>{plural(here.quotes, 'quote', 'quotes')}</strong> on this computer, untouched,
              with the customers they name.
            </>
          )}
        </>
      }
      saved={saved}
      lastCopy={lastCopy}
      save={hasWork ? save : null}
      act={() => bringBack(copy)}
      actSay="Bring this copy back"
      back={back}
    />
  )
}

/** A price list named as a person says it: the Master Price File it came from, and every workbook
 *  applied to it since, each with its day and how many of its changes. */
function editionSaid(e: PriceListEdition, now: Date): string {
  const from = e.packedAt
    ? `the price list of ${packedOn(e.packedAt, 'long')}${e.fingerprint ? ` (${e.fingerprint})` : ''}`
    : 'a price list this app was not shipped with'
  if (e.applied.length === 0) return `${from}, with no workbook applied since`
  return `${from}, with ${listSaid(
    e.applied.map(
      (a) => `${a.file} applied ${whenSaid(a.at, now)} (${plural(a.changes, 'change', 'changes')})`,
    ),
  )}`
}
