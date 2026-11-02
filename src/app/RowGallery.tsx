import type { TableKind } from '@/domain/model'
import { galleryOf, type Item } from '@/data/pictures'
import { GalleryActs, Lightbox, largeOf } from '@/ui'
import { useOptionPicture } from './optionPicture'

/* ============================================================
   ONE OPTION'S GALLERY, LARGE, BOUND TO THE APP — the lightbox opened
   on a row wherever a screen only shows its picture (Fitment's boat, a
   catalogue card, the build's tiles): every picture of that one row,
   held and Northside's, the cover first and marked, with arrows, swipe,
   a count and the strip of them all — and, on a dealer's screen, the
   acts on the one open (Add pictures, Make it the cover, Earlier,
   Later, Take it off), each one step on the catalogue's stack.

   The kit's `Lightbox` knows no store and `GalleryActs` knows no
   command; this is the one hand between them and the catalogue
   (`useOptionPicture`), so no screen binds a gallery its own way.

   It stays mounted while closed, so the plate's own exit is seen: a
   screen keeps the row it last opened and sets `at` to null.
   ============================================================ */

export interface RowGalleryProps {
  /** the row whose gallery this is */
  item: Item
  /** the row as the screen says it: "Yamaha F60LC" */
  name: string
  kind?: TableKind
  /** which picture stands open, or null for none */
  at: number | null
  onAt: (at: number | null) => void
  /** offer the dealer's acts under the open picture; a customer-facing screen leaves them off */
  manage?: boolean
}

export function RowGallery({ item, name, kind, at, onAt, manage = true }: RowGalleryProps) {
  const bound = useOptionPicture(item, name, kind)
  const n = bound.gallery.length

  const open = at === null || n === 0 ? null : Math.min(at, n - 1)
  return (
    <Lightbox
      pictures={largeOf(name, bound.gallery)}
      at={open}
      onAt={onAt}
      title={name}
      strip
      acts={
        manage && open !== null ? (
          <GalleryActs
            {...bound}
            at={open}
            moved={(place) =>
              /* JUST AFTER AN ADD the new picture is the one shown: the store has handed the
                 reader the gallery that holds it before this is told */
              onAt(place === 'last' ? Math.max(0, galleryOf(item).length - 1) : place)
            }
          />
        ) : undefined
      }
    />
  )
}
