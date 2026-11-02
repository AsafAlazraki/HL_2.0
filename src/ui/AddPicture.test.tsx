import { describe, expect, test, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import type { PictureTaken } from '@/domain/catalogue/pictureCommands'
import { moveIn } from '@/domain/model/gallery'
import { DROPPED_NO_FILE, pastedWords } from '@/domain/model/ownPictures'
import {
  AddPicture,
  largeOf,
  type AddPictureProps,
  type GalleryShot,
  type PictureStep,
} from './AddPicture'
import { Toaster } from './Toaster'
import type { PictureRead } from './pictureFile'

/* ============================================================
   ONE OPTION'S PICTURES, BY ROLE AND BY ITS WORDS.

   happy-dom has no canvas, so the browser's redraw is the one seam a
   test hands in (`read`): it answers as `readOptionPicture` does, with
   a refusal or a redrawn picture. The harness holds a gallery as the
   store would, the cover first; everything else is the control's.
   The bytes are a test's own `data:` string, never a picture.

   REWRITTEN 2026-11-02 to the owner's new truth ("per boat and product
   the ability to have more than one image and cover image"): the frame
   that showed a picture used to open the chooser and carry "Put another
   picture on the …"; the switch "Show yours instead of the maker's"
   chose one picture over another; several files dropped at once were
   refused. Now a picture in the frame opens the gallery large, "Add
   pictures" adds beside it, the cover is chosen among all of them, and
   several files are several pictures.
   ============================================================ */

const BYTES = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA='
const MAKERS = '/seed-images/mfm50.webp'

const redrawn = (file: File): Promise<PictureRead> =>
  Promise.resolve({
    ok: true,
    picture: { src: `${BYTES}#${file.name}`, width: 1100, height: 825, file: file.name },
    note: 'Kept at 1100 × 825, 44 B, from 3.4 MB. Your own file is not changed.',
  })

const makers: GalleryShot = {
  id: 'battery-catalogue',
  src: MAKERS,
  width: 1100,
  height: 733,
  alt: 'Battery MFM50',
  source: 'Picture from century.com.au',
  standing: '',
  own: false,
}
const mine = (n: number, src = BYTES): GalleryShot => ({
  id: `own:p${n}`,
  src,
  width: 1100,
  height: 825,
  alt: 'Battery MFM50',
  source: 'Added by Asaf, 2 November 2026',
  standing: '',
  own: true,
})

/** The control on a page of its own, holding a gallery as a store would: the cover first. */
function Harness(props: Partial<AddPictureProps> & { start?: GalleryShot[] }) {
  const [gallery, setGallery] = useState<GalleryShot[]>(props.start ?? [])
  const step = (said: string, next: GalleryShot[], back: string): PictureStep => {
    const was = gallery
    setGallery(next)
    return {
      said,
      undo: () => {
        setGallery(was)
        return back
      },
    }
  }
  const onAdd = (pictures: PictureTaken[]): PictureStep =>
    step(
      pictures.length === 1
        ? 'Your picture is on the Battery MFM50 now.'
        : `Your ${pictures.length} pictures are on the Battery MFM50 now.`,
      [...gallery, ...pictures.map((p, i) => mine(gallery.length + i + 1, p.src))],
      'Your picture is off the Battery MFM50.',
    )
  const onRemove = (id: string): PictureStep =>
    step(
      'Your picture is off the Battery MFM50.',
      gallery.filter((s) => s.id !== id),
      'Your picture is back on the Battery MFM50.',
    )
  const onCover = (id: string): PictureStep => {
    const it = gallery.find((s) => s.id === id)!
    return step(
      'The Battery MFM50’s cover is your picture now.',
      [it, ...gallery.filter((s) => s !== it)],
      'The Battery MFM50’s cover is as it was.',
    )
  }
  const onMove = (id: string, to: number): PictureStep => {
    const ids = moveIn(
      gallery.map((s) => s.id),
      id,
      to,
    )
    return step(
      `Your picture is ${to + 1} of ${gallery.length} on the Battery MFM50 now.`,
      ids.map((x) => gallery.find((s) => s.id === x)!),
      'The Battery MFM50’s pictures are in the order they were.',
    )
  }
  return (
    <>
      <Toaster />
      <AddPicture
        option="Battery MFM50"
        gallery={gallery}
        onAdd={onAdd}
        onRemove={onRemove}
        onCover={onCover}
        onMove={onMove}
        read={redrawn}
        {...props}
      />
    </>
  )
}

const jpeg = (name = 'mfm50.jpg') => new File(['x'], name, { type: 'image/jpeg' })

/** what a paste of words carries */
const words = (text: string) => ({ files: [], getData: () => text })

/** the reader's answer to a file that is not a picture */
const refusedRead = (): Promise<PictureRead> =>
  Promise.resolve({ ok: false, why: '“brochure.pdf” is not a picture.' })

const frameOf = (): HTMLElement => document.querySelector<HTMLElement>('.ui-addpic-frame')!
const strip = (): HTMLElement => screen.getByRole('list', { name: 'The Battery MFM50’s pictures' })

describe('AddPicture', () => {
  test('asks for a picture of the option, and says the three ways in', () => {
    render(<Harness />)
    expect(screen.getByRole('button', { name: 'Add a picture of the Battery MFM50' })).toBeVisible()
    expect(
      screen.getByText('Drop pictures here, paste one, or press to choose them.'),
    ).toBeVisible()
    expect(screen.queryByRole('button', { name: /Take it off/ })).toBeNull()
    expect(screen.queryByRole('list', { name: /pictures/ })).toBeNull()
  })

  test('takes a chosen file, draws it, says what was kept and who added it', async () => {
    const { container } = render(<Harness />)
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
    expect(input.multiple).toBe(true)
    await userEvent.upload(input, jpeg())
    expect(await screen.findByText('Added by Asaf, 2 November 2026')).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent(/^Kept at 1100 × 825/)
    expect(container.querySelector('.ui-addpic-frame img')?.getAttribute('src')).toContain(BYTES)
    expect(
      screen.getByRole('button', { name: 'See the Battery MFM50 larger: picture 1 of 1' }),
    ).toBeVisible()
    expect(await screen.findByText('Your picture is on the Battery MFM50 now.')).toBeVisible()
  })

  test('opens the chooser from the empty frame and from Add pictures, by pointer or by keyboard', async () => {
    const { container } = render(<Harness />)
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
    const click = vi.spyOn(input, 'click')
    const frame = screen.getByRole('button', { name: 'Add a picture of the Battery MFM50' })
    await userEvent.click(frame)
    frame.focus()
    await userEvent.keyboard('{Enter}')
    expect(click).toHaveBeenCalledTimes(2)
  })

  test('adds beside the maker’s picture, never in its place, and the picked one is the new one', async () => {
    const { container } = render(<Harness start={[makers]} />)
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
    const click = vi.spyOn(input, 'click')
    await userEvent.click(screen.getByRole('button', { name: 'Add pictures' }))
    expect(click).toHaveBeenCalledTimes(1)
    await userEvent.upload(input, jpeg())
    const list = await screen.findByRole('list', { name: 'The Battery MFM50’s pictures' })
    const thumbs = within(list).getAllByRole('button')
    expect(thumbs.map((b) => b.getAttribute('aria-label'))).toEqual([
      'Picture 1 of 2, the cover',
      'Picture 2 of 2, Northside’s own',
    ])
    expect(thumbs[1]).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Added by Asaf, 2 November 2026')).toBeVisible()
    /* the maker's picture is still the cover, and still there */
    await userEvent.click(thumbs[0]!)
    expect(screen.getByText('Picture from century.com.au')).toBeVisible()
    expect(frameOf()).toHaveAccessibleName(
      'See the Battery MFM50 larger: picture 1 of 2, the cover',
    )
  })

  test('takes several files dropped at once as one step, and refuses a drop of an address', async () => {
    render(<Harness />)
    const frame = screen.getByRole('button', { name: 'Add a picture of the Battery MFM50' })
    fireEvent.drop(frame, { dataTransfer: { files: [], types: ['text/uri-list'] } })
    expect(await screen.findByText(DROPPED_NO_FILE)).toBeVisible()
    expect(frame).toHaveAccessibleDescription(new RegExp(DROPPED_NO_FILE.slice(0, 30)))

    fireEvent.drop(frame, {
      dataTransfer: { files: [jpeg('a.jpg'), jpeg('b.jpg')], types: ['Files'] },
    })
    expect(await screen.findByText('Your 2 pictures are on the Battery MFM50 now.')).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent('2 pictures kept.')
    expect(screen.queryByText(DROPPED_NO_FILE)).toBeNull()
    expect(within(strip()).getAllByRole('button')).toHaveLength(2)
  })

  test('takes a pasted picture, and refuses pasted words and addresses', async () => {
    render(<Harness />)
    const frame = screen.getByRole('button', { name: 'Add a picture of the Battery MFM50' })
    fireEvent.paste(frame, { clipboardData: words('https://example.com/mfm50.jpg') })
    expect(await screen.findByText(pastedWords(true))).toBeVisible()
    fireEvent.paste(frame, { clipboardData: words('Battery MFM50') })
    expect(await screen.findByText(pastedWords(false))).toBeVisible()
    fireEvent.paste(frame, { clipboardData: { files: [jpeg()], getData: () => '' } })
    expect(await screen.findByText('Added by Asaf, 2 November 2026')).toBeVisible()
  })

  test('says a file that is not a picture is refused, and that none of a drop was added', async () => {
    const { rerender } = render(<Harness read={refusedRead} />)
    fireEvent.drop(frameOf(), {
      dataTransfer: { files: [new File(['%PDF'], 'brochure.pdf')], types: ['Files'] },
    })
    expect(await screen.findByText('“brochure.pdf” is not a picture.')).toBeVisible()
    rerender(<Harness read={refusedRead} />)
    fireEvent.drop(frameOf(), {
      dataTransfer: { files: [jpeg(), new File(['%PDF'], 'brochure.pdf')], types: ['Files'] },
    })
    expect(
      await screen.findByText('“brochure.pdf” is not a picture. None of the 2 was added.'),
    ).toBeVisible()
    expect(screen.queryByText(/^Added by/)).toBeNull()
  })

  test('makes another picture the cover, which then leads the strip and is said', async () => {
    render(<Harness start={[makers, mine(1)]} />)
    expect(screen.queryByRole('button', { name: 'Make it the cover' })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Picture 2 of 2, Northside’s own' }))
    await userEvent.click(screen.getByRole('button', { name: 'Make it the cover' }))
    expect(await screen.findByText('The Battery MFM50’s cover is your picture now.')).toBeVisible()
    const thumbs = within(strip()).getAllByRole('button')
    expect(thumbs[0]).toHaveAccessibleName('Picture 1 of 2, the cover, Northside’s own')
    expect(thumbs[0]).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByRole('button', { name: 'Make it the cover' })).toBeNull()
  })

  test('moves a picture among the others, never before the cover, and offers only the moves there are', async () => {
    render(<Harness start={[makers, mine(1), mine(2)]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Picture 2 of 3, Northside’s own' }))
    /* second: it may go later, and not earlier, which is the cover's place */
    expect(screen.queryByRole('button', { name: /^Earlier/ })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Later, to 3 of 3' }))
    expect(
      await screen.findByText('Your picture is 3 of 3 on the Battery MFM50 now.'),
    ).toBeVisible()
    const thumbs = within(strip()).getAllByRole('button')
    expect(thumbs[2]).toHaveAttribute('aria-pressed', 'true')
    /* last: it may go earlier, not later */
    expect(screen.queryByRole('button', { name: /^Later/ })).toBeNull()
    expect(screen.getByRole('button', { name: 'Earlier, to 2 of 3' })).toBeVisible()
  })

  test('takes one of Northside’s off with Undo, and offers no taking off for the maker’s', async () => {
    render(<Harness start={[makers, mine(1)]} />)
    expect(screen.queryByRole('button', { name: 'Take it off' })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Picture 2 of 2, Northside’s own' }))
    await userEvent.click(screen.getByRole('button', { name: 'Take it off' }))
    expect(screen.getByRole('button', { name: 'Add pictures' })).toHaveFocus()
    expect(screen.queryByText('Added by Asaf, 2 November 2026')).toBeNull()
    /* the toast this press raised: earlier tests' toasts may still be leaving */
    const said = (await screen.findAllByText('Your picture is off the Battery MFM50.')).at(-1)!
    const card = said.closest<HTMLElement>('.ui-toast')!
    await userEvent.click(within(card).getByRole('button', { name: 'Undo' }))
    expect(await screen.findByText('Your picture is back on the Battery MFM50.')).toBeVisible()
    expect(within(strip()).getAllByRole('button')).toHaveLength(2)
  })

  test('opens the whole gallery large on the picture in the frame, the cover first and marked', async () => {
    render(<Harness start={[makers, mine(1)]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Picture 2 of 2, Northside’s own' }))
    await userEvent.click(frameOf())
    const large = await screen.findByRole('dialog')
    expect(large).toHaveTextContent('2 of 2 · Battery MFM50')
    expect(within(large).getByText('Added by Asaf, 2 November 2026')).toBeVisible()
    const every = within(large).getByRole('list', { name: 'Every picture · Battery MFM50' })
    await userEvent.click(within(every).getByRole('button', { name: 'Picture 1 of 2, the cover' }))
    expect(large).toHaveTextContent('Cover1 of 2 · Battery MFM50')
    expect(within(large).getByText('Picture from century.com.au')).toBeVisible()
  })

  test('says a step the caller refuses, under the frame, and never as a toast', async () => {
    render(<Harness onAdd={() => ({ refused: 'Nobody is named at the desk.' })} />)
    await act(async () => {
      fireEvent.drop(frameOf(), { dataTransfer: { files: [jpeg()], types: ['Files'] } })
    })
    const said = await screen.findAllByText('Nobody is named at the desk.')
    expect(said).toHaveLength(1)
    expect(said[0]!.closest('.ui-refusal')).not.toBeNull()
    expect(said[0]!.closest('.ui-toast')).toBeNull()
  })
})

describe('largeOf', () => {
  test('hands the lightbox the gallery as it is, naming the option and marking the cover', () => {
    const large = largeOf('Battery MFM50', [makers, mine(1)])
    expect(large.map((p) => [p.caption, p.credit, p.cover ?? false])).toEqual([
      ['Battery MFM50', 'Picture from century.com.au', true],
      ['Battery MFM50', 'Added by Asaf, 2 November 2026', false],
    ])
    /* one picture is not a gallery: nothing to mark */
    expect(largeOf('Battery MFM50', [makers])[0]?.cover).toBeUndefined()
  })
})
