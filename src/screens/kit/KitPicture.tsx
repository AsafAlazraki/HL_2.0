import { useMemo, useRef, useState } from 'react'
import { isDone, type CatalogueCommand } from '@/domain/catalogue/commands'
import {
  addOwnPictures,
  coverPicture,
  movePicture,
  removeOwnPicture,
  standingGalleries,
  standingOwnPictures,
} from '@/domain/catalogue/pictureCommands'
import type { CatalogueData } from '@/domain/catalogue/sheet'
import { galleryKey, onceEach, withGalleries } from '@/domain/model/gallery'
import type { Item, Picture, PictureBook } from '@/domain/model/pictures'
import type { TableKind } from '@/domain/model'
import { heldPictures, itemOf } from '@/data/pictures'
import { shotsOf } from '@/app/optionPicture'
import { useSession } from '@/app/useStores'
import { AddPicture, type HeldOptionPicture, type PictureStep } from '@/ui'

/* ============================================================
   AN OPTION'S PICTURES, ON THE KIT — `AddPicture` on two real options
   of the 529: the trailer the price list names for it, of which no
   picture exists (so its frame is empty, truly), and the motor chosen
   above, whose maker's picture the app has.

   THE REAL COMMANDS, ON THE PAGE'S OWN COPY. Every press runs the
   catalogue's own command (`addOwnPictures`, `removeOwnPicture`,
   `coverPicture`, `movePicture`) with its own sentence, provenance and
   way back, against a copy of the two lists this page read and holds in
   its own state, and the gallery is the one reader's rule laid over the
   held ledgers (`withGalleries`). So the kit shows exactly what a screen
   will, and still keeps nothing: the picture leaves with the page, and
   nothing reaches this computer's copy of the price list or the paper.
   ============================================================ */

export interface KitOption {
  table: string
  row: string
  /** the option as a person says it: "Yamaha F115LB" */
  said: string
  kind: TableKind
  held: HeldOptionPicture | null
}

/** A specimen's picture as the reader answers with one: the maker's, of this exact option. */
function specimen(o: KitOption, held: HeldOptionPicture): Picture {
  return {
    id: `held:${o.row}`,
    src: held.src,
    width: held.width,
    height: held.height,
    widths: [{ src: held.src, width: held.width }],
    tier: 'catalogue',
    address: '',
    pageUrl: '',
    verdict: 'studio',
    subject: o.said,
    table: o.table,
    model: '',
    rows: [o.row],
    standing: 'row',
    exact: true,
    person: false,
    depicts: o.said,
    differs: [],
    verification: '',
    licenceNote: '',
    beyond: '',
  }
}

export function KitPictures({ sheet, options }: { sheet: CatalogueData; options: KitOption[] }) {
  const who = useSession((s) => s.name)
  const [data, setData] = useState(sheet)
  const latest = useRef(data)
  /* THE HELD BOOK, with each specimen's own picture as its option's held one: the kit reads a
     specimen's picture itself, so the reader is handed it rather than asked for it */
  const book = useMemo(() => {
    const base = heldPictures()
    const held = new Map<string, Picture>()
    for (const o of options) if (o.held) held.set(galleryKey(o.table, o.row), specimen(o, o.held))
    const of = (item: Item): Picture | undefined => held.get(galleryKey(item.table, item.row))
    const kit: PictureBook = {
      ...base,
      gallery: (item) => onceEach([of(item), ...base.gallery(item)]),
      exactHeld: (item) => of(item) ?? base.exactHeld(item),
    }
    return withGalleries(kit, standingOwnPictures(data), standingGalleries(data))
  }, [data, options])

  const stepOf = (command: CatalogueCommand): PictureStep => {
    const out = command(latest.current, new Date().toISOString())
    if (!isDone(out)) return { refused: out.refused }
    latest.current = out.next
    setData(out.next)
    return {
      said: out.said,
      undo: () => {
        const back = out.inverse(latest.current, new Date().toISOString())
        if (!isDone(back)) return back.refused
        latest.current = back.next
        setData(back.next)
        return back.said
      },
    }
  }

  return (
    <ul className="kit-pictures">
      {options.map((o) => {
        const gallery = shotsOf(book.gallery(itemOf(o.table, o.row)), o.said)
        const shown = gallery.map((s) => s.id)
        const at = { table: o.table, row: o.row, name: o.said }
        return (
          <li key={o.row} className="kit-picture">
            <span className="kit-cap">{o.said}</span>
            <AddPicture
              option={o.said}
              gallery={gallery}
              kind={o.kind}
              onAdd={(pictures) => stepOf(addOwnPictures({ ...at, pictures, by: who }))}
              onRemove={(id) =>
                id.startsWith('own:')
                  ? stepOf(removeOwnPicture(id.slice('own:'.length), who))
                  : { refused: '' }
              }
              onCover={(id) => stepOf(coverPicture({ ...at, shown, id, by: who }))}
              onMove={(id, to) => stepOf(movePicture({ ...at, shown, id, to, by: who }))}
            />
          </li>
        )
      })}
    </ul>
  )
}
