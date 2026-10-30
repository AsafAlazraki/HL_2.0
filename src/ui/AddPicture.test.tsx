import { describe, expect, test, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import type { PictureTaken } from '@/domain/catalogue/pictureCommands'
import {
  DROPPED_NO_FILE,
  manyFiles,
  pastedWords,
  type OwnPicture,
} from '@/domain/model/ownPictures'
import { AddPicture, type AddPictureProps, type PictureStep } from './AddPicture'
import { Toaster } from './Toaster'
import type { PictureRead } from './pictureFile'

/* ============================================================
   ADD A PICTURE, BY ROLE AND BY ITS WORDS.

   happy-dom has no canvas, so the browser's redraw is the one seam a
   test hands in (`read`): it answers as `readOptionPicture` does, with
   a refusal or a redrawn picture. Everything else is the control's.
   The bytes are a test's own `data:` string, never a picture.
   ============================================================ */

const BYTES = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA='
const NOON = new Date(2026, 9, 30, 12).toISOString()

const redrawn = (file: File): Promise<PictureRead> =>
  Promise.resolve({
    ok: true,
    picture: { src: BYTES, width: 1100, height: 825, file: file.name },
    note: 'Kept at 1100 × 825, 44 B, from 3.4 MB. Your own file is not changed.',
  })

const own = (more: Partial<OwnPicture> = {}): OwnPicture => ({
  id: 'p1',
  orgId: 'northside',
  table: 'parts',
  row: 'parts:119',
  option: 'MFM50 - Battery MFM50',
  name: 'Battery MFM50',
  src: BYTES,
  width: 1100,
  height: 825,
  bytes: 44,
  addedBy: 'Asaf',
  addedAt: NOON,
  chosen: false,
  ...more,
})

/** The control on a page of its own, holding what a store would: one picture, or none. */
function Harness(props: Partial<AddPictureProps> & { start?: OwnPicture | null }) {
  const [held, setHeld] = useState<OwnPicture | null>(props.start ?? null)
  const onAdd = (p: PictureTaken): PictureStep => {
    const was = held
    setHeld(own({ src: p.src, width: p.width, height: p.height }))
    return {
      said: 'Your picture is on the Battery MFM50 now.',
      undo: () => {
        setHeld(was)
        return 'Your picture is off the Battery MFM50.'
      },
    }
  }
  const onRemove = (): PictureStep => {
    const was = held
    setHeld(null)
    return {
      said: 'Your picture is off the Battery MFM50.',
      undo: () => {
        setHeld(was)
        return 'Your picture is back on the Battery MFM50.'
      },
    }
  }
  return (
    <>
      <Toaster />
      <AddPicture
        option="Battery MFM50"
        own={held}
        onAdd={onAdd}
        onRemove={onRemove}
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

describe('AddPicture', () => {
  test('asks for a picture of the option, and says the three ways in', () => {
    render(<Harness />)
    expect(screen.getByRole('button', { name: 'Add a picture of the Battery MFM50' })).toBeVisible()
    expect(screen.getByText('Drop a picture here, paste one, or press to choose it.')).toBeVisible()
    expect(screen.queryByRole('button', { name: /Take it off/ })).toBeNull()
  })

  test('takes a chosen file, draws it, says what was kept and who added it', async () => {
    const { container } = render(<Harness />)
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
    await userEvent.upload(input, jpeg())
    expect(await screen.findByText('Added by Asaf, 30 October 2026')).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent(/^Kept at 1100 × 825/)
    expect(container.querySelector('img')?.getAttribute('src')).toBe(BYTES)
    expect(
      screen.getByRole('button', { name: 'Put another picture on the Battery MFM50' }),
    ).toBeVisible()
    expect(await screen.findByText('Your picture is on the Battery MFM50 now.')).toBeVisible()
  })

  test('opens the chooser when the frame is pressed, by pointer or by keyboard', async () => {
    const { container } = render(<Harness />)
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
    const click = vi.spyOn(input, 'click')
    const frame = screen.getByRole('button', { name: 'Add a picture of the Battery MFM50' })
    await userEvent.click(frame)
    frame.focus()
    await userEvent.keyboard('{Enter}')
    expect(click).toHaveBeenCalledTimes(2)
  })

  test('takes a dropped file, and refuses several, or an address, with a sentence', async () => {
    render(<Harness />)
    const frame = screen.getByRole('button', { name: 'Add a picture of the Battery MFM50' })
    fireEvent.drop(frame, {
      dataTransfer: { files: [jpeg('a.jpg'), jpeg('b.jpg')], types: ['Files'] },
    })
    expect(await screen.findByText(manyFiles(2))).toBeVisible()
    expect(frame).toHaveAccessibleDescription(new RegExp(manyFiles(2).slice(0, 30)))

    fireEvent.drop(frame, { dataTransfer: { files: [], types: ['text/uri-list'] } })
    expect(await screen.findByText(DROPPED_NO_FILE)).toBeVisible()

    fireEvent.drop(frame, { dataTransfer: { files: [jpeg()], types: ['Files'] } })
    expect(await screen.findByText('Added by Asaf, 30 October 2026')).toBeVisible()
    expect(screen.queryByText(DROPPED_NO_FILE)).toBeNull()
  })

  test('takes a pasted picture, and refuses pasted words and addresses', async () => {
    render(<Harness />)
    const frame = screen.getByRole('button', { name: 'Add a picture of the Battery MFM50' })
    fireEvent.paste(frame, { clipboardData: words('https://example.com/mfm50.jpg') })
    expect(await screen.findByText(pastedWords(true))).toBeVisible()
    fireEvent.paste(frame, { clipboardData: words('Battery MFM50') })
    expect(await screen.findByText(pastedWords(false))).toBeVisible()
    fireEvent.paste(frame, { clipboardData: { files: [jpeg()], getData: () => '' } })
    expect(await screen.findByText('Added by Asaf, 30 October 2026')).toBeVisible()
  })

  test('says a file that is not a picture is refused, in the reader’s own sentence', async () => {
    render(<Harness read={refusedRead} />)
    const frame = screen.getByRole('button', { name: 'Add a picture of the Battery MFM50' })
    fireEvent.drop(frame, {
      dataTransfer: { files: [new File(['%PDF'], 'brochure.pdf')], types: ['Files'] },
    })
    expect(await screen.findByText('“brochure.pdf” is not a picture.')).toBeVisible()
    expect(screen.queryByText(/^Added by/)).toBeNull()
  })

  test('takes it off with Undo, and the Undo puts the same picture back', async () => {
    render(<Harness start={own()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Take it off' }))
    expect(screen.getByRole('button', { name: 'Add a picture of the Battery MFM50' })).toHaveFocus()
    expect(screen.queryByText('Added by Asaf, 30 October 2026')).toBeNull()
    /* the toast this press raised: earlier tests' toasts may still be leaving */
    const said = (await screen.findAllByText('Your picture is off the Battery MFM50.')).at(-1)!
    const card = said.closest<HTMLElement>('.ui-toast')!
    await userEvent.click(within(card).getByRole('button', { name: 'Undo' }))
    expect(await screen.findByText('Added by Asaf, 30 October 2026')).toBeVisible()
    expect(await screen.findByText('Your picture is back on the Battery MFM50.')).toBeVisible()
  })

  test('draws the maker’s picture of the exact item over a kept one, until the dealer chooses theirs', async () => {
    const onChoose = vi.fn<(chosen: boolean) => PictureStep>(() => ({
      said: 'The Battery MFM50 shows your picture instead of the maker’s.',
      undo: () => 'The Battery MFM50 shows the maker’s picture again.',
    }))
    const held = { src: '/seed-images/mfm50.webp', width: 1100, height: 733 }
    const { container, rerender } = render(
      <AddPicture
        option="Battery MFM50"
        own={own()}
        held={held}
        onAdd={() => ({ refused: '' })}
        onRemove={() => ({ refused: '' })}
        onChoose={onChoose}
      />,
    )
    expect(container.querySelector('img')?.getAttribute('src')).toBe(held.src)
    expect(
      screen.getByText(/Yours is kept: added by Asaf, 30 October 2026\. The maker’s picture/),
    ).toBeVisible()
    const toggle = screen.getByRole('switch', { name: 'Show yours instead of the maker’s' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(toggle)
    expect(onChoose).toHaveBeenCalledWith(true)

    rerender(
      <AddPicture
        option="Battery MFM50"
        own={own({ chosen: true })}
        held={held}
        onAdd={() => ({ refused: '' })}
        onRemove={() => ({ refused: '' })}
        onChoose={onChoose}
      />,
    )
    expect(container.querySelector('img')?.getAttribute('src')).toBe(BYTES)
    expect(screen.getByText('Added by Asaf, 30 October 2026')).toBeVisible()
  })

  test('says a step the caller refuses, under the frame, and never as a toast', async () => {
    render(<Harness onAdd={() => ({ refused: 'Nobody is named at the desk.' })} />)
    const frame = screen.getByRole('button', { name: 'Add a picture of the Battery MFM50' })
    await act(async () => {
      fireEvent.drop(frame, { dataTransfer: { files: [jpeg()], types: ['Files'] } })
    })
    const said = await screen.findAllByText('Nobody is named at the desk.')
    expect(said).toHaveLength(1)
    expect(said[0]!.closest('.ui-refusal')).not.toBeNull()
    expect(said[0]!.closest('.ui-toast')).toBeNull()
  })
})
