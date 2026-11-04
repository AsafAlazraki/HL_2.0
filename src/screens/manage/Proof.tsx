import { useEffect, useRef, useState } from 'react'
import { FileTextIcon, PlusIcon } from '@phosphor-icons/react'
import { Button } from '@/ui'
import type { QuoteDef } from '@/domain/model'
import { Document } from '@/screens/document/Document'

/* ============================================================
   THE QUOTE THESE PRINT ON — the judge of Settings, 2026-11-04, L1:
   "the screen draws only the letterhead strip, never the quote that the
   terms and deposit print on".

   AT A DESK, THE QUOTE'S OWN PAGES. The newest draft on this computer,
   drawn by the document itself (`<Document proof>`): the same sheaf a
   customer's quote prints, wearing Northside's letterhead, people, GST,
   deposit and terms as they stand today — a draft prints today's — so
   a line kept on the left lands on the page under it without a step
   between. Its first page carries the letterhead, who prepared it, the
   total, the GST and the deposit; its last carries the terms; the pages
   between carry the items, which are not Settings', so they are left
   out and said. The line being set is lit where it lands.

   IN A HAND, A DOOR. An A4 page drawn at a phone's width is type at
   five pixels (the document's own reason for its column under 826px),
   so the same pages open on their own address, full size.

   NOTHING IS DRAWN THAT IS NOT A QUOTE. With no draft on this computer
   the frame says so and offers the one way to start one; no quote is
   ever made up to be drawn on.
   ============================================================ */

/** An A4 page's width in CSS pixels: 210 mm. */
const PAGE_PX = 793.7
/** THE LARGEST THE PAGES ARE DRAWN AT: about two thirds, where the cover's type still reads and two
 *  pages stand about as tall as the water beside them (measured at 1440 × 900) */
const MOST = 0.66

/** What each line being set lights on the pages. */
export type Lit = 'letterhead' | 'valid' | 'gst' | 'deposit' | 'terms' | 'by' | 'name'

/** The line open on Settings, as the place on the pages it lands. */
export function litOf(line: string | undefined, person: string | undefined): Lit | null {
  if (person) return 'by'
  switch (line) {
    case undefined:
      return null
    case 'name':
      return 'name'
    case 'validDays':
      return 'valid'
    case 'gstRate':
      return 'gst'
    case 'deposit':
      return 'deposit'
    case 'quoteTerms':
      return 'terms'
    default:
      return 'letterhead'
  }
}

/** Where on the pages each lit line is, said under its field. */
export const LANDS: Record<Lit, string> = {
  letterhead: 'Lit on the first page, under the mark.',
  name: 'Lit at the head of the last page, as on every page after the first.',
  valid: 'Lit on the first page, under the quote’s number.',
  gst: 'Lit on the first page, under the total.',
  deposit: 'Lit on the first page, under the total.',
  terms: 'On the last page, lit there once written.',
  by: 'Lit on the first page, under Prepared by.',
}

export function Proof({
  draft,
  given,
  lit,
  desk,
  go,
}: {
  draft: QuoteDef | null
  given: number
  lit: Lit | null
  desk: boolean
  go?: (href: string) => void
}) {
  const at = draft ? `/quote/${encodeURIComponent(draft.id)}/document` : '/'
  const follow = go ? () => go(at) : undefined

  return (
    <section className="mg-group mg-proof-group" id="mg-proof" aria-labelledby="mg-proof-title">
      <div className="mg-group__head">
        <h3 className="mg-group__title" id="mg-proof-title">
          The quote these print on
        </h3>
        <p className="mg-group__say">
          {draft
            ? `${draft.reference}, ${draft.customer.name.trim() !== '' ? `for ${draft.customer.name.trim()}` : 'a draft for nobody yet'}`
            : 'No draft on this computer'}
        </p>
      </div>

      {!draft ? (
        <div className="mg-proof-none" data-testid="manage-proof-none">
          <p className="mg-proof-none__say">
            {given > 0
              ? 'Every quote on this computer has been given, and a given quote keeps what it was given with. The next draft started draws here, page by page, with these lines on it.'
              : 'No quote has been started on this computer yet, so there are no pages to draw these lines on. The first one started draws here, page by page.'}
          </p>
          <Button
            intent="secondary"
            size="sm"
            icon={PlusIcon}
            href="/"
            onClick={go ? () => go('/') : undefined}
          >
            Start a quote on Home
          </Button>
        </div>
      ) : desk ? (
        <>
          <p className="mg-proof__say">
            Its first page and its last, where these lines print; the pages between carry the items.
            A draft prints the lines as they stand, so each one kept here is on it at once.
          </p>
          <Pages quoteId={draft.id} lit={lit} />
          <div className="mg-row-acts">
            <Button intent="quiet" size="sm" icon={FileTextIcon} href={at} onClick={follow}>
              {`Open ${draft.reference} as it prints`}
            </Button>
          </div>
        </>
      ) : (
        <div className="mg-proof-door">
          <p className="mg-proof-none__say">
            Its pages open full size on their own: the first carries the letterhead, who prepared
            it, the total, the GST and the deposit; the last carries the terms.
          </p>
          <Button intent="secondary" size="sm" icon={FileTextIcon} href={at} onClick={follow}>
            {`Open ${draft.reference} as it prints`}
          </Button>
        </div>
      )}
    </section>
  )
}

/** The pages, drawn by the document, at the width of the paper's half. */
function Pages({ quoteId, lit }: { quoteId: string; lit: Lit | null }) {
  const frame = useRef<HTMLDivElement>(null)
  const [k, setK] = useState(MOST)
  useEffect(() => {
    const el = frame.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const watch = new ResizeObserver(() => {
      const w = el.clientWidth
      if (w > 0) setK(Math.min(MOST, w / PAGE_PX))
    })
    watch.observe(el)
    return () => watch.disconnect()
  }, [])
  return (
    <div
      className="mg-proof"
      ref={frame}
      data-testid="manage-proof"
      data-lit={lit ?? undefined}
      /* a picture of the quote: read by its own address, never tabbed into here */
      inert
    >
      <div className="mg-proof__in" style={{ zoom: k }}>
        <Document quoteId={quoteId} proof />
      </div>
    </div>
  )
}
