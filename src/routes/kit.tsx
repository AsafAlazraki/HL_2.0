import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { repositories } from '@/data'
import { crestMarkOf } from '@/data/crest'
import { PACK_ORG_ID } from '@/data/pack/boot'
import { loadEntities, loadImages, loadManifest, loadTable } from '@/data/pack/load'
import { catalogue } from '@/state/catalogue'
import { specimenOf, type KitSpecimen } from '@/domain/kit/specimen'
import { Kit } from '@/screens/kit/Kit'

/* ============================================================
   THE KIT'S SPECIMEN, AT /kit — every primitive in src/ui, in every
   state, on the 529 from the Master Price File: for the owner to see
   the component language whole, and for the rulers to hold it to
   contrast, overlap and cut at six sizes before any screen adopts it
   (e2e/routes.ts, a foundation screen).

   IT READS FIVE TABLES OF THE FILE AND KEEPS NOTHING. Every other
   screen reads this browser's copy of the file, and only Entry's door
   reads the file itself (src/routes/index.tsx says why). The kit is
   the one exception, on purpose: it has to draw on real content in a
   browser that has never been through the door — the owner opening
   /kit cold — and it draws one boat, so it asks the server for that
   boat's register, its two pairing tables, its motors' and trailers'
   registers, the table definitions and the picture ledger, and writes
   none of it anywhere.

   NO NAME IS ASKED FOR. The first-visit rule orders Entry before Home;
   the kit is neither, and a specimen that sent its reader through the
   door first would be measuring the door.

   NORTHSIDE'S OWN MARK, NOT A SENTENCE ABOUT IT (2026-10-21). The band
   said "The name in type, until Northside adds its mark." while Home and
   the paper already carried the mark. The band now stands on the same
   white-ink file the pill's crest reads (`crestMarkOf`, the marks ledger
   alone), for the business the file names. And the pill is handed this
   browser's copy of the file where it holds one — the Lost screen's own
   read, IndexedDB only, which cannot fetch — so a browser that has been
   through the door sees Northside's crest here too, not the product's.
   ============================================================ */

/** The boat's register, its two pairing tables, and the registers they pair it with. */
const TABLES = [
  'boat_stacer',
  'join_stacer_yam',
  'join_stacer_trl',
  'mot_yamaha',
  'trl_stacertrailers',
] as const

export const Route = createFileRoute('/kit')({
  component: KitRoute,
})

function KitRoute() {
  const [read, setRead] = useState<KitSpecimen | { refused: string } | null>(null)
  const [mark, setMark] = useState<string | null>(null)
  useEffect(() => {
    /* the pill's read, never the kit's: the kit draws from the server's file below */
    if (catalogue.getState().status === 'empty') {
      void catalogue.getState().load(repositories(PACK_ORG_ID).catalogue)
    }
    let live = true
    void (async () => {
      try {
        const manifest = await loadManifest()
        const [entities, images, ...tables] = await Promise.all([
          loadEntities(),
          loadImages(),
          ...TABLES.map((key) => loadTable(key, manifest)),
        ])
        const rows = Object.fromEntries(
          TABLES.map((key, i) => [
            manifest.tables.find((t) => t.key === key)?.id ?? key,
            tables[i] ?? [],
          ]),
        )
        if (live) {
          setMark(crestMarkOf(manifest.name))
          setRead(specimenOf({ business: manifest.name, entities, rows, images }))
        }
      } catch (error) {
        if (live)
          setRead({
            refused: `The kit could not read the price list: ${error instanceof Error ? error.message : String(error)}`,
          })
      }
    })()
    return () => {
      live = false
    }
  }, [])
  return <Kit read={read} mark={mark} />
}
