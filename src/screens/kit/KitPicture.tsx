import { useRef, useState } from 'react'
import { isDone, type CatalogueCommand } from '@/domain/catalogue/commands'
import {
  addOwnPicture,
  chooseOwnPicture,
  ownPictureFor,
  removeOwnPicture,
} from '@/domain/catalogue/pictureCommands'
import type { CatalogueData } from '@/domain/catalogue/sheet'
import type { TableKind } from '@/domain/model'
import { useSession } from '@/app/useStores'
import { AddPicture, type HeldOptionPicture, type PictureStep } from '@/ui'

/* ============================================================
   A PICTURE NORTHSIDE ADDS, ON THE KIT — `AddPicture` on two real
   options of the 529: the trailer the price list names for it, of
   which no picture exists (so its frame is empty, truly), and the
   motor chosen above, whose maker's picture the app has.

   THE REAL COMMANDS, ON THE PAGE'S OWN COPY. Every press runs the
   catalogue's own command (`addOwnPicture`, `removeOwnPicture`,
   `chooseOwnPicture`) with its own sentence, provenance and way back,
   against a copy of the two lists this page read and holds in its own
   state. So the kit shows exactly what a screen will, and still keeps
   nothing: the picture leaves with the page, and nothing reaches this
   computer's copy of the price list or the paper.
   ============================================================ */

export interface KitOption {
  table: string
  row: string
  /** the option as a person says it: "Yamaha F115LB" */
  said: string
  kind: TableKind
  held: HeldOptionPicture | null
}

export function KitPictures({ sheet, options }: { sheet: CatalogueData; options: KitOption[] }) {
  const who = useSession((s) => s.name)
  const [data, setData] = useState(sheet)
  const latest = useRef(data)

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
        const own = ownPictureFor(data, o.table, o.row)
        return (
          <li key={o.row} className="kit-picture">
            <span className="kit-cap">{o.said}</span>
            <AddPicture
              option={o.said}
              own={own}
              held={o.held}
              kind={o.kind}
              onAdd={(picture) =>
                stepOf(
                  addOwnPicture({ table: o.table, row: o.row, name: o.said, picture, by: who }),
                )
              }
              onRemove={() => (own ? stepOf(removeOwnPicture(own.id, who)) : { refused: '' })}
              onChoose={(chosen) =>
                own ? stepOf(chooseOwnPicture(own.id, chosen, who)) : { refused: '' }
              }
            />
          </li>
        )
      })}
    </ul>
  )
}
