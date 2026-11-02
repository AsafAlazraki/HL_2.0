import { afterEach, beforeAll, describe, expect, test } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ModuleDef } from '@/domain/model'
import { catalogue } from '@/state/catalogue'
import { session } from '@/state/session'
import { coverOf, galleryOf, itemOf, lineOf, pictureOf } from '@/data/pictures'
import { holdGalleries, holdOwnPictures } from '@/data/ownPictures'
import { loadPack, type PackFixture } from '@/test/fixtures/pack'
import { AddPicture, Toaster } from '@/ui'
import type { PictureRead } from '@/ui/pictureFile'
import { useOptionPicture } from './optionPicture'

/* ============================================================
   THE CONTROL, BOUND TO THE APP: a picture dropped on the Battery
   MFM50 is the catalogue's own step, filed for the person at the desk,
   drawn by the one reader for that option and no other, and taken
   back by the toast's Undo.

   The price list is the real one; the redraw is the one seam (happy-dom
   has no canvas), and the bytes a test's own `data:` string.
   ============================================================ */

const BYTES = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA='
const BATTERY = itemOf('parts', 'parts:119')
const TWO = itemOf('parts', 'parts:121')

const redrawn = (file: File): Promise<PictureRead> =>
  Promise.resolve({
    ok: true,
    picture: { src: BYTES, width: 1100, height: 825, file: file.name },
    note: 'Kept at 1100 × 825.',
  })

function Bound() {
  return <AddPicture {...useOptionPicture(BATTERY, 'Battery MFM50', 'accessory')} read={redrawn} />
}

let pack: PackFixture

beforeAll(async () => {
  pack = await loadPack()
  await catalogue.getState().load({
    entities: pack.entities,
    rowsByEntity: pack.rowsByEntity,
    manifest: pack.manifest,
    modules: Object.values(pack.ctx.modules) as ModuleDef[],
  })
})

afterEach(() => {
  session.getState().signOut()
})

const drop = (name = 'mfm50.jpg') =>
  fireEvent.drop(screen.getByRole('button', { name: /picture of the Battery MFM50/ }), {
    dataTransfer: { files: [new File(['x'], name, { type: 'image/jpeg' })], types: ['Files'] },
  })

describe('useOptionPicture', () => {
  test('refuses a picture nobody at the desk could have added, with the sentence', async () => {
    session.getState().signOut()
    render(<Bound />)
    drop()
    expect(
      await screen.findByText(
        'Nobody is named at the desk, so the picture could not say who added it. Give your name at the door first.',
      ),
    ).toBeVisible()
    expect(catalogue.getState().ownPictures).toBeUndefined()
  })

  test('adds it as the catalogue’s step, drawn for that option only, and Undo takes it back', async () => {
    session.getState().signIn('Asaf')
    render(
      <>
        <Toaster />
        <Bound />
      </>,
    )
    expect(pictureOf(BATTERY)).toBeNull()
    drop()
    expect(await screen.findByText(/^Added by Asaf, /)).toBeVisible()
    const kept = Object.values(catalogue.getState().ownPictures ?? {})
    expect(kept.map((p) => [p.row, p.option, p.name, p.addedBy])).toEqual([
      ['parts:119', 'MFM50 - Battery MFM50', 'Battery MFM50', 'Asaf'],
    ])
    expect(pictureOf(BATTERY)?.src).toBe(BYTES)
    expect(pictureOf(TWO)?.src ?? null).not.toBe(BYTES)

    const said = (await screen.findAllByText('Your picture is on the Battery MFM50 now.')).at(-1)!
    await userEvent.click(
      within(said.closest<HTMLElement>('.ui-toast')!).getByRole('button', { name: 'Undo' }),
    )
    await waitFor(() => expect(catalogue.getState().ownPictures).toBeUndefined())
    expect(pictureOf(BATTERY)).toBeNull()
    expect(screen.getByRole('button', { name: 'Add a picture of the Battery MFM50' })).toBeVisible()
    holdOwnPictures([])
  })

  test('adds a second beside the first, makes it the cover the whole app draws, and Undo puts it back', async () => {
    session.getState().signIn('Asaf')
    render(
      <>
        <Toaster />
        <Bound />
      </>,
    )
    drop('first.jpg')
    expect(await screen.findByText(/^Added by Asaf, /)).toBeVisible()
    fireEvent.drop(screen.getByRole('button', { name: /^See the Battery MFM50 larger/ }), {
      dataTransfer: {
        files: [new File(['y'], 'second.jpg', { type: 'image/jpeg' })],
        types: ['Files'],
      },
    })
    const strip = await screen.findByRole('list', { name: 'The Battery MFM50’s pictures' })
    expect(within(strip).getAllByRole('button')).toHaveLength(2)
    const [first, second] = galleryOf(BATTERY)
    expect(coverOf(BATTERY)?.id).toBe(first?.id)

    await userEvent.click(within(strip).getByRole('button', { name: /^Picture 2 of 2/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Make it the cover' }))
    expect(
      (await screen.findAllByText('The Battery MFM50’s cover is your picture now.')).length,
    ).toBeGreaterThan(0)
    /* the cover chosen here is the one every screen and the paper ask for */
    expect(Object.values(catalogue.getState().galleries ?? {})).toMatchObject([
      { row: 'parts:119', cover: second?.id, by: 'Asaf' },
    ])
    expect(coverOf(BATTERY)?.id).toBe(second?.id)
    expect(pictureOf(BATTERY)?.id).toBe(second?.id)
    expect(lineOf(BATTERY)).toMatchObject({ held: true, picture: { id: second?.id } })

    const said = (await screen.findAllByText('The Battery MFM50’s cover is your picture now.')).at(
      -1,
    )!
    await userEvent.click(
      within(said.closest<HTMLElement>('.ui-toast')!).getByRole('button', { name: 'Undo' }),
    )
    await waitFor(() => expect(catalogue.getState().galleries).toBeUndefined())
    expect(coverOf(BATTERY)?.id).toBe(first?.id)
    holdOwnPictures([])
    holdGalleries([])
  })
})
