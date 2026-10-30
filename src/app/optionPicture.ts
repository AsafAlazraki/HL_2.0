/* ============================================================
   ONE OPTION'S PICTURE, BOUND TO THE APP — what a screen hands
   `AddPicture` (src/ui/AddPicture.tsx) so the control acts on the
   catalogue's own commands, as the person at the desk:

     <AddPicture {...useOptionPicture(itemOf(table, row, address), name)} />

   The control is the kit's and knows no store; the commands are the
   domain's (`src/domain/catalogue/pictureCommands.ts`) and know no
   React. This is the one hand between them, so every screen that puts
   the control on an option — the build's tiles, the catalogue, the
   price list's details — binds it the same way and no screen writes
   its own.

   WHAT STANDS is read from the store (`ownPictureFor`, the picture
   whose option is still named as it was) and the maker's picture of
   the exact item from the one reader (`exactHeldOf`), so the frame
   draws what every other screen draws for that option.

   EACH ACT IS ONE STEP on the catalogue's stack, answered with its
   sentence and its way back, pinned to that step (`undo(eventId)`).
   ============================================================ */
import { useMemo } from 'react'
import { isDone, type CatalogueCommand } from '@/domain/catalogue/commands'
import {
  addOwnPicture,
  chooseOwnPicture,
  ownPictureFor,
  removeOwnPicture,
} from '@/domain/catalogue/pictureCommands'
import { exactHeldOf, itemOf, srcSetOf, type Item } from '@/data/pictures'
import { catalogue } from '@/state/catalogue'
import { session } from '@/state/session'
import type { TableKind } from '@/domain/model'
import type { AddPictureProps, PictureStep } from '@/ui'
import { useCatalogue } from './useStores'

/** One command on the catalogue's stack, as the control's step. */
export function stepOf(command: CatalogueCommand): PictureStep {
  const store = catalogue.getState()
  const outcome = store.apply(command)
  if (!isDone(outcome)) return { refused: outcome.refused }
  const eventId = outcome.event.id
  return {
    said: outcome.said,
    undo: () => {
      const back = catalogue.getState().undo(eventId)
      return isDone(back) ? back.said : back.refused
    },
  }
}

/**
 * THE CONTROL'S PROPS FOR ONE OPTION. `name` is the option as this screen says it ("Yamaha
 * F60LC"); the price list's own name is filed beside it by the command, whatever is said here.
 */
export function useOptionPicture(
  item: Item,
  name: string,
  kind?: TableKind,
): Omit<AddPictureProps, 'read'> {
  const { table, row, address } = item
  const own = useCatalogue((s) => ownPictureFor(s, table, row))
  /* the maker's picture of the exact item, which the dealer's does not displace unless chosen;
     the reader's answer moves only with the price list, so it is asked again when the option
     changes and not on every paint */
  const held = useMemo(() => {
    const p = exactHeldOf(itemOf(table, row, address))
    return p ? { src: p.src, width: p.width, height: p.height, srcSet: srcSetOf(p) } : null
  }, [table, row, address])
  return {
    option: name,
    own,
    held,
    kind,
    onAdd: (picture) =>
      stepOf(addOwnPicture({ table, row, name, picture, by: session.getState().name })),
    onRemove: () =>
      own ? stepOf(removeOwnPicture(own.id, session.getState().name)) : { refused: '' },
    onChoose: (chosen) =>
      own ? stepOf(chooseOwnPicture(own.id, chosen, session.getState().name)) : { refused: '' },
  }
}
