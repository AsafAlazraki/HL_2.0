/* ============================================================
   WHAT FITS — one boat at a time, and what goes on it.

   Rebuilt 2026-11-05 as direction A of the fit flow, "Two doors, one
   page" (docs/directions/fit-flow/directions.md). The owner, 2026-11-04:
   "we should be able to do the what fits from the home boats thing not
   just open quote and stuff … the whole experience … was just so
   confuising". The plate whose three lines opened one place at a time
   below it, the Show all register and the toasts are gone: one page per
   boat reads top to bottom (`Boat.tsx`), and a bar at the window's foot
   says the quote it starts.

   Before a boat is chosen, the chooser stands where the boat's name goes
   (`Chooser.tsx`), as it did.
   ============================================================ */
import { useMemo, type ReactNode } from 'react'
import { DatabaseIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Button, Icon } from '@/ui'
import { useCatalogue, useQuotes } from '@/app/useStores'
import { ctxFrom } from '@/state/catalogue'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { makeCtx, rowLabel } from '@/domain/model'
import { readBoatFit, type BoatFound } from '@/domain/fitment/boat'
import { versionsOf } from '@/domain/fitment/versions'
import { spokenBoat } from '@/domain/quote/spoken'
import { useFinder } from '@/screens/shell/scope'
import { BoatPage, type At, type BoatChoice, type From } from './Boat'
import { useStart } from './useStart'
import { AnotherBoat, ChooseABoat } from './Chooser'
import './fitment.css'
import './boat.css'

export interface FitmentPosition {
  maker?: string
  model?: string
  boat?: string
  motor?: string
  trailer?: string
  fit?: string
  at?: string
  /** 1 while changing what Northside offers; 0 leaves it */
  change?: number
}

export interface FitmentProps {
  /** the boat, by its line on the price list; '' for none chosen */
  boat: string
  /** before a boat is chosen, the maker and the model open in the chooser; '' for none */
  maker?: string
  model?: string
  /** where the page was reached from: 'home', or Data's room ('') */
  from?: From
  /** the motor and trailer chosen for the quote, by pairing; 'none'; '' for the recommended */
  motor?: string
  trailer?: string
  /** the fit-out lines ticked for the quote, by pairing */
  fit?: readonly string[]
  /** the place asked for in the address, scrolled to on arrival */
  at?: At
  /** changing what Northside offers, rather than choosing for a quote */
  changing?: boolean
  onPosition: (next: FitmentPosition) => void
  openBoat: (rowId: string) => void
  openTheFile: () => void
  /** any address of the app, pressed from a link here (Prices, Home, Data) */
  openHref?: (href: string) => void
  /** the build, on the quote just started here */
  openQuote?: (quoteId: string) => void
  /** today, for "Taken off today" (a test hands its own) */
  today?: Date
}

/** nothing ticked for the quote */
const NONE_TICKED: readonly string[] = []

/** a link with nowhere to go, for a component test with no router */
const NOWHERE = (): void => {}

export function Fitment({
  boat,
  maker = '',
  model = '',
  from = '',
  motor = '',
  trailer = '',
  fit: ticked = NONE_TICKED,
  at = '',
  changing = false,
  onPosition,
  openBoat,
  openTheFile,
  openHref = NOWHERE,
  openQuote = NOWHERE,
  today,
}: FitmentProps) {
  const sheet = useCatalogue((s) => s)
  const filed = useQuotes((s) => s.quotes)
  const read = sheet.status === 'ready' || sheet.status === 'failed'
  const open = sheet.status === 'ready' && Object.keys(sheet.tables).length > 0

  const ctx = useMemo(
    () => makeCtx({ ...ctxFrom(sheet), orgId: PACK_ORG_ID }),
    // the catalogue state object is replaced on every write, which is the dependency wanted
    [sheet],
  )
  const place = useMemo(() => {
    const row = sheet.index?.rowById?.[boat]
    return row ? { tableId: row.entityId, rowId: row.id } : null
  }, [sheet, boat])
  const fit = useMemo(() => (open && place ? readBoatFit(ctx, place) : null), [ctx, open, place])
  const boatModel = useMemo(
    () => (open && place ? versionsOf(ctx, place) : null),
    [ctx, open, place],
  )
  const { start, refused } = useStart(openQuote)
  const shellFinder = useFinder()

  /* THE BOATS ALREADY ON QUOTES, most recent first, offered before a word is typed */
  const recent = useMemo<BoatFound[]>(() => {
    if (!open) return []
    const seen = new Set<string>()
    const out: BoatFound[] = []
    for (const q of filed.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt))) {
      if (seen.has(q.rootRowId) || out.length >= 6) continue
      const table = ctx.entities[q.rootTableId]
      const row = (ctx.rowsByEntity[q.rootTableId] ?? []).find((r) => r.id === q.rootRowId)
      if (!table || table.kind !== 'boat' || !row) continue
      seen.add(q.rootRowId)
      const said = spokenBoat(table.id, rowLabel(table, row))
      out.push({
        place: { tableId: table.id, rowId: row.id },
        name: said.name,
        detail: said.detail,
        maker: said.maker,
        code: '',
      })
    }
    return out
  }, [filed, ctx, open])

  if (!read || !open) {
    return (
      <main className="ft" data-testid="fitment" data-read={read ? '' : undefined}>
        <header className="ft-head">
          <p className="ft-eyebrow">What fits</p>
          <h1 className="ft-title">What goes on a boat</h1>
        </header>
        <div className="ft-empty">
          <span className="ft-empty__glyph" aria-hidden="true">
            <Icon glyph={DatabaseIcon} size="lg" />
          </span>
          {read ? (
            <>
              <p className="ft-empty__say">
                No price list is open on this computer, so there is no boat to fit.
              </p>
              <Button intent="primary" icon={DatabaseIcon} onClick={openTheFile}>
                Load the Master Price File
              </Button>
            </>
          ) : (
            <p className="ft-empty__say">Looking for the price list…</p>
          )}
        </div>
      </main>
    )
  }

  if (!fit) {
    return (
      <main className="ft" data-testid="fitment" data-read="" data-mode="choose">
        <div className="ft-top">
          <p className="ft-eyebrow">What fits · what goes on a boat</p>
        </div>
        <ChooseABoat
          world={ctx}
          onChoose={openBoat}
          recent={recent}
          missing={boat !== ''}
          at={{ maker, model }}
          onAt={(next) => onPosition(next)}
        />
      </main>
    )
  }

  /* ANOTHER BOAT IS FIND ITSELF, the same dialog as Home's (direction A); a screen drawn with no
     shell above it keeps the chooser in a popover */
  const another: ReactNode = shellFinder ? (
    <Button intent="secondary" icon={MagnifyingGlassIcon} onClick={() => shellFinder('')}>
      Another boat
    </Button>
  ) : (
    <AnotherBoat world={ctx} onChoose={openBoat} recent={recent} />
  )

  const choice: BoatChoice = { motor, trailer, fit: ticked }

  return (
    <main
      className="ft"
      data-testid="fitment"
      data-read=""
      data-boat={fit.place.rowId}
      data-mode={changing ? 'change' : 'page'}
    >
      <BoatPage
        key={fit.place.rowId}
        ctx={ctx}
        fit={fit}
        model={boatModel}
        choice={choice}
        onChoice={(next) =>
          onPosition({
            ...(next.motor === undefined ? {} : { motor: next.motor }),
            ...(next.trailer === undefined ? {} : { trailer: next.trailer }),
            ...(next.fit === undefined ? {} : { fit: next.fit.join(',') }),
          })
        }
        from={from}
        at={at}
        onAt={(next) => onPosition({ at: next })}
        changing={changing}
        onChanging={(on) => {
          onPosition({ change: on ? 1 : 0 })
          window.scrollTo({ top: 0 })
        }}
        onVersion={(rowId) => onPosition({ boat: rowId, motor: '', trailer: '', fit: '' })}
        another={another}
        openHref={openHref}
        start={start}
        startRefused={refused}
        {...(today ? { today } : {})}
      />
    </main>
  )
}
