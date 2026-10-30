import { AddPicture } from '@/ui'
import { itemOf } from '@/data/pictures'
import { useOptionPicture } from '@/app/optionPicture'
import type { TableKind } from '@/domain/model'

/* ============================================================
   A LINE'S OWN PICTURE, ADDED WHERE THE LINE IS KEPT (the flow round,
   2026-10-30). The original's users valued "adding images to colors
   and parts and flooring", and the price list's details are where a
   dealer manages one option outside the build: a part, a colourway,
   a trailer. The control is the kit's (`AddPicture`), bound to the
   catalogue's own commands by the one hand (`useOptionPicture`), so
   the picture belongs to this line alone, with who added it and when.
   ============================================================ */

export interface LineOption {
  table: string
  row: string
  /** the line's image address on the price list, where it has one */
  address?: string
  /** the line as a person says it */
  name: string
  kind?: TableKind
}

export function LinePicture({ option }: { option: LineOption }) {
  const bound = useOptionPicture(
    itemOf(option.table, option.row, option.address),
    option.name,
    option.kind,
  )
  return (
    <div className="sh-record__own">
      <AddPicture {...bound} />
    </div>
  )
}
