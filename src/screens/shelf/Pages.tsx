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
import { bringBack, clearThePriceList, forgetEverything } from './acts'
import { count, inventoryOfCopy, plural, whenSaid, type Inventory } from './read'

/* ============================================================
   THE THREE PAGES THAT REPLACE OR TAKE AWAY — each its own address,
   never a box over the shelf that everybody clicks through
   (docs/research/refs/shelf/notes.md §1.4, iOS's Erase All Content).

   EACH SAYS WHAT GOES AND WHAT STAYS, COUNTED, BEFORE ITS BUTTON, and
   each puts "Save a copy first" beside it as the amber one: the loud
   button on a page that takes things away is the one that keeps them.
   The act itself names its consequence in its own words.
   ============================================================ */

interface PageProps {
  here: Inventory
  save: () => Promise<void>
  saved: string | null
  back: () => void
}

function Frame({
  title,
  say,
  goes,
  stays,
  saved,
  save,
  act,
  actSay,
  back,
  testid,
  tone,
}: {
  title: string
  say: string
  goes: ReactNode
  stays: ReactNode
  saved: string | null
  save: (() => Promise<void>) | null
  act: () => Promise<void>
  actSay: string
  back: () => void
  testid: string
  tone: 'away' | 'back'
}) {
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const run = async (): Promise<void> => {
    setBusy(true)
    setFailed(null)
    try {
      await act()
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
        <Button intent="quiet" size="sm" icon={ArrowLeftIcon} onClick={back}>
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
          <dl className="sf-goes sf-goes--page">
            <dt>Goes</dt>
            <dd>{goes}</dd>
            <dt>Stays</dt>
            <dd>{stays}</dd>
          </dl>
          {saved ? (
            <p className="sf-page__saved" aria-live="polite">
              Saved as {saved}, in this computer’s Downloads.
            </p>
          ) : null}
          <div className="sf-page__acts">
            {save ? (
              <span className="sf-page__safe">
                <Button intent="act" icon={DownloadSimpleIcon} onClick={() => void save()}>
                  {saved ? 'Save another copy' : 'Save a copy first'}
                </Button>
              </span>
            ) : null}
            <Button
              /* with nothing here to save first, bringing the copy back is the page's one act */
              intent={save ? 'secondary' : 'act'}
              icon={tone === 'away' ? TrashIcon : ArrowsClockwiseIcon}
              onClick={() => void run()}
              refusedBecause={
                busy ? 'Working on it: this computer is writing.' : (failed ?? undefined)
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

export function ClearPage({ here, save, saved, back }: PageProps) {
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
          <strong>{plural(here.quotes, 'quote', 'quotes')}</strong>, each exactly as given: a quote
          is a photograph of what was offered on the day.{' '}
          <strong>{plural(here.customers, 'customer', 'customers')}</strong>,{' '}
          {plural(here.rules, 'rule', 'rules')} Northside wrote, its places and the prices it
          decided, and its settings.
        </>
      }
      saved={saved}
      save={save}
      act={clearThePriceList}
      actSay="Clear the price list from this computer"
      back={back}
    />
  )
}

export function ForgetPage({
  here,
  lastCopy,
  save,
  saved,
  back,
}: PageProps & { lastCopy: string | null }) {
  return (
    <Frame
      testid="forget"
      tone="away"
      title="Forget everything on this computer"
      say="This computer keeps nothing of Northside’s afterwards, and asks who is at the desk again. Use it before a computer is handed on."
      goes={
        <>
          The price list, <strong>{plural(here.quotes, 'quote', 'quotes')}</strong> (
          {count(here.given)} given),{' '}
          <strong>{plural(here.customers, 'customer', 'customers')}</strong>,{' '}
          {plural(here.rules, 'rule', 'rules')} Northside wrote, its settings and pictures, and the
          name given at the start.
        </>
      }
      stays={
        saved || lastCopy ? (
          <>
            Copies saved to this computer’s Downloads
            {lastCopy ? `, the last ${whenSaid(lastCopy, new Date())}` : ''}. Bring one back on any
            computer to have all of it again.
          </>
        ) : (
          <>
            Copies saved to this computer’s Downloads. <strong>None has been saved yet</strong>, so
            nothing of this would come back: save a copy first.
          </>
        )
      }
      saved={saved}
      save={save}
      act={forgetEverything}
      actSay="Forget everything on this computer"
      back={back}
    />
  )
}

export function BringBack({
  copy,
  fileName,
  here,
  save,
  saved,
  back,
}: PageProps & { copy: ProjectFile; fileName: string }) {
  const theirs = inventoryOfCopy(copy)
  const saidOn = copy.exportedAt ? whenSaid(copy.exportedAt, new Date()) : ''
  const hasWork = here.quotes + here.customers + here.rules + here.pictures > 0
  return (
    <Frame
      testid="restore"
      tone="back"
      title={`Bring back ${fileName}`}
      say={`${saidOn ? `Saved ${saidOn}. ` : ''}It holds ${plural(theirs.quotes, 'quote', 'quotes')}, ${plural(theirs.customers, 'customer', 'customers')}, ${plural(theirs.rules, 'rule', 'rules')} Northside wrote, ${plural(theirs.details, 'detail', 'details')} of its settings, ${plural(theirs.pictures, 'picture', 'pictures')} it chose, and ${count(theirs.lines)} lines of the price list in ${plural(theirs.lists, 'list', 'lists')}.`}
      goes={
        <>
          This computer’s price list ({count(here.lines)} lines),{' '}
          <strong>{plural(here.customers, 'customer', 'customers')}</strong>,{' '}
          {plural(here.rules, 'rule', 'rules')} Northside wrote, its places and its settings: each
          becomes the copy’s.
        </>
      }
      stays={
        <>
          <strong>{plural(here.quotes, 'quote', 'quotes')}</strong> on this computer, exactly as
          they are. The copy’s {plural(theirs.quotes, 'quote', 'quotes')} join them, each as it was
          given; a quote already here by the same number is left as it is.
        </>
      }
      saved={saved}
      save={hasWork ? save : null}
      act={() => bringBack(copy)}
      actSay="Bring this copy back"
      back={back}
    />
  )
}
