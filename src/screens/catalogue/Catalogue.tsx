import { useCallback, useMemo, useState } from 'react'
import { useCatalogue } from '@/app/useStores'
import { ctxFrom } from '@/state/catalogue'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { makeCtx } from '@/domain/model'
import { defaultLevelKey } from '@/domain/quote/pricing'
import { aislesOf } from '@/domain/catalogue/aisles'
import type { Item } from '@/data/pictures'
import { RowGallery } from '@/app/RowGallery'
import { Button } from '@/ui'
import { Chandlery } from './Chandlery'
import { hasPicture, partsTable, shelfOf } from './shelf'
import './catalogue.css'

/* ============================================================
   /catalogue — THE PARTS AND ACCESSORIES, ON THEIR OWN. The same
   chandlery a quote's fit chapter opens (`Chandlery`), with no boat in
   it: every part the price list sells, in its aisles, at the price the
   price list sets for it, each with its own picture or the door to
   Northside's. A room of the price list, so Data is lit while it is
   open (src/app/ways.ts).

   THE REFLOW is the chandlery's own (chandlery.css); this page adds a
   head and the gutter: 16px in a hand, 32 on a tablet, 56 at a desk,
   and the page's measure capped at 90rem so the aisles at 1920 are a
   grid and not a line.
   ============================================================ */

export interface CatalogueProps {
  aisle: string
  maker: string
  onAisle: (aisle: string, maker: string) => void
  /** the way back to the door, for a browser with no price file in it */
  openTheFile?: () => void
  go?: (href: string) => void
}

export function Catalogue({ aisle, maker, onAisle, openTheFile, go }: CatalogueProps) {
  const sheet = useCatalogue((s) => s)
  const ready = sheet.status === 'ready' && Object.keys(sheet.tables).length > 0
  const ctx = useMemo(
    () => makeCtx({ ...ctxFrom(sheet), views: { ...sheet.views }, orgId: PACK_ORG_ID }),
    [sheet],
  )
  /* THE PART WHOSE GALLERY IS OPEN, kept after it shuts so the plate's own exit is seen */
  const [large, setLarge] = useState<{ item: Item; name: string; at: number | null } | null>(null)
  const onAt = useCallback(
    (at: number | null) => setLarge((was) => (was ? { ...was, at } : null)),
    [],
  )

  const table = ready ? partsTable(ctx) : undefined
  const shelf = useMemo(() => (table ? shelfOf(ctx) : []), [ctx, table])
  const pictured = useMemo(
    () => aislesOf(shelf, hasPicture).reduce((sum, a) => sum + a.pictured, 0),
    [shelf],
  )

  return (
    <main className="catp" data-testid="catalogue">
      <header className="catp-head">
        <p className="catp-eyebrow">The price list · parts and accessories</p>
        <h1 className="catp-title">The chandlery</h1>
        {table ? (
          <p className="catp-lede">
            {`${shelf.length.toLocaleString('en-AU')} parts on sale in 18 aisles · ${pictured.toLocaleString('en-AU')} with their own picture.`}{' '}
            The same aisles and cards a quote&rsquo;s dealer fit opens, fitting its boat.
          </p>
        ) : null}
      </header>
      {sheet.status === 'empty' || sheet.status === 'loading' ? (
        <output className="catp-none">Reading the price list kept on this computer…</output>
      ) : !ready ? (
        <section className="catp-none">
          <p>
            The price list is not open on this computer, so its parts cannot be shown. Open the
            Master Price File to see them.
          </p>
          {openTheFile ? (
            <Button intent="secondary" onClick={openTheFile}>
              Open the price list
            </Button>
          ) : null}
        </section>
      ) : !table ? (
        <p className="catp-none">The price list carries no parts and accessories.</p>
      ) : (
        <Chandlery
          ctx={ctx}
          levelKey={defaultLevelKey(table)}
          aisle={aisle}
          maker={maker}
          onAisle={onAisle}
          onLarge={() => undefined}
          onGallery={(item, name, at) => setLarge({ item, name, at })}
          go={go}
        />
      )}
      {/* A PART'S GALLERY, with the dealer's acts on the picture open: this is a page of the
          price list, never in front of a customer */}
      {large ? (
        <RowGallery
          item={large.item}
          name={large.name}
          kind="accessory"
          at={large.at}
          onAt={onAt}
        />
      ) : null}
    </main>
  )
}
