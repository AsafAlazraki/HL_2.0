import {
  CameraPlusIcon,
  ImageIcon,
  TrashIcon,
  UploadSimpleIcon,
  UserCircleIcon,
} from '@phosphor-icons/react'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
  type ReactNode,
} from 'react'
import type { TableKind } from '@/domain/model'
import { keepSeparators } from '@/domain/quote/wrap'
import type { PictureTaken } from '@/domain/catalogue/pictureCommands'
import {
  DROPPED_NO_FILE,
  addedLine,
  isAnAddress,
  manyFiles,
  pastedWords,
  type OwnPicture,
} from '@/domain/model/ownPictures'
import { Button } from './Button'
import { Icon } from './Icon'
import { Picture } from './Picture'
import { Refusal } from './Refusal'
import { say, undo } from './Toaster'
import { Toggle } from './Toggle'
import { readOptionPicture, type PictureRead } from './pictureFile'

/* ============================================================
   ADD A PICTURE — the one control that puts Northside's own picture on
   ONE option: a colour, a finish, a flooring, a part, a motor, a
   trailer, any priced line. What the original HelmLogic's users valued
   (docs/directions/flow/original.md §3), done the way this app does
   everything: on the option itself, three ways in, said, and undone.

   THREE WAYS IN, ONE PLACE. The frame is the option's picture and the
   way to change it at once:
     · PRESS IT (a pointer, Enter or Space) and the file chooser opens;
     · DROP a file on it, and it is taken;
     · PASTE while the frame — or anything in this control — has the
       caret: a copied picture is taken, copied words are refused with
       the reason (an address is never fetched; `pastedWords`).
   So the keyboard path is Tab to the frame, then Enter, or Ctrl V.

   WHAT IS DRAWN IN IT is the picture the option is drawn with
   everywhere else, by the one reader's rule (`withOwnPictures`): the
   dealer's where they chose it or where nothing of the exact item is
   held, the maker's of the exact item otherwise — and, with nothing
   at all, the empty frame that asks for one. Never a stand-in.

   THE PREVIEW IS THE STEP. The picture is redrawn (`readOptionPicture`,
   1,100 pixels at most), put on the option as one step, and drawn in
   the frame at once with what was kept said under it ("Kept at 1100 ×
   825, 96 kB, from 3.4 MB"). Undo, in the toast, takes it back; there
   is no "Are you sure", because a step that can be taken back does not
   need asking twice.

   ITS PROVENANCE IS ITS LINE: "Added by Asaf, 30 October 2026", under
   the frame, wherever the control stands.

   A REFUSAL IS A SENTENCE UNDER THE FRAME — not a picture, too large,
   several files, an address, nobody at the desk — and the frame points
   a reader at it (`aria-describedby`). Nothing here is ever disabled.

   THE STORE IS THE CALLER'S. The control is handed what stands and
   three acts, each answering with a step or a refusal; the app's
   binding to the catalogue's commands is `src/app/optionPicture.ts`,
   so a screen writes `<AddPicture {...useOptionPicture(…)} />`.
   ============================================================ */

/** What one of the control's acts did: a step with its way back, or why it did not. */
export type PictureStep = { said: string; undo: () => string } | { refused: string }

/** A picture of the exact item the app already has, drawn where the dealer's does not win. */
export interface HeldOptionPicture {
  src: string
  width: number
  height: number
  srcSet?: string
}

export interface AddPictureProps {
  /** the option as the dealer reads it: "Yamaha F60LC", "Battery MFM50" */
  option: string
  /** Northside's own picture standing on this option, or null */
  own: OwnPicture | null
  /** the maker's picture of this exact item, where the app has one */
  held?: HeldOptionPicture | null
  /** put this picture on the option, in place of any it had */
  onAdd: (picture: PictureTaken) => PictureStep
  /** take Northside's picture off the option */
  onRemove: () => PictureStep
  /** show Northside's picture over the maker's of the exact item, or the maker's again */
  onChoose?: (chosen: boolean) => PictureStep
  /** the kind of thing the option is, for the toast's glyph */
  kind?: TableKind
  /** how a file is read and redrawn: the browser's own (`readOptionPicture`); a test hands its own */
  read?: (file: File, option: string) => Promise<PictureRead>
}

const KINDS = 'image/jpeg,image/png,image/webp,image/gif'

/** True of a drag that carries files, as a drag from the desktop does. */
const carriesFiles = (e: DragEvent): boolean => Array.from(e.dataTransfer.types).includes('Files')

/** The files a drag or a paste carries, the pictures and the rest alike. */
function filesOf(list: FileList | null | undefined): File[] {
  return list ? Array.from(list) : []
}

export function AddPicture({
  option,
  own,
  held = null,
  onAdd,
  onRemove,
  onChoose,
  kind,
  read = readOptionPicture,
}: AddPictureProps) {
  const base = useId()
  const hintId = `${base}-hint`
  const whyId = `${base}-why`
  const lineId = `${base}-line`
  const toastId = `add-picture-${base}`
  const frame = useRef<HTMLButtonElement>(null)
  const chooser = useRef<HTMLInputElement>(null)
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const [why, setWhy] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)

  /* WHAT THE FRAME DRAWS: the reader's own rule, said once here */
  const ownDrawn = own !== null && (own.chosen || held === null)
  const shows: 'own' | 'held' | 'none' = ownDrawn ? 'own' : held ? 'held' : 'none'

  /** A step answered: said with its Undo, or its refusal set under the frame. */
  function answered(step: PictureStep): boolean {
    if ('refused' in step) {
      /* an empty refusal is "nothing to change", which is not a step and not a fault */
      if (step.refused !== '') setWhy(step.refused)
      return false
    }
    setWhy(null)
    undo(
      step.said,
      () => {
        setNote(null)
        say(step.undo(), { id: toastId, kind })
      },
      { id: toastId, kind },
    )
    return true
  }

  async function take(files: File[]): Promise<void> {
    setNote(null)
    if (files.length === 0) return
    if (files.length > 1) {
      setWhy(manyFiles(files.length))
      return
    }
    setWhy(null)
    setBusy(true)
    const got = await read(files[0]!, option)
    if (!alive.current) return
    setBusy(false)
    if (!got.ok) {
      setWhy(got.why)
      return
    }
    if (answered(onAdd(got.picture))) setNote(got.note)
  }

  function takeOff(): void {
    setNote(null)
    if (answered(onRemove())) frame.current?.focus()
  }

  function choose(chosen: boolean): void {
    if (!onChoose) return
    setNote(null)
    answered(onChoose(chosen))
  }

  /* ---- a drag ---- */
  const onDragOver = (e: DragEvent<HTMLButtonElement>): void => {
    /* only what could be a picture is welcomed; anything else drops nowhere */
    if (!carriesFiles(e) && !Array.from(e.dataTransfer.types).includes('text/uri-list')) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    if (!over) setOver(true)
  }
  const onDragLeave = (e: DragEvent<HTMLButtonElement>): void => {
    const to = e.relatedTarget
    if (to instanceof Node && e.currentTarget.contains(to)) return
    setOver(false)
  }
  const onDrop = (e: DragEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    setOver(false)
    const files = filesOf(e.dataTransfer.files)
    if (files.length === 0) {
      setNote(null)
      setWhy(DROPPED_NO_FILE)
      return
    }
    void take(files)
  }

  /* ---- a paste, anywhere in the control ---- */
  const onPaste = (e: ClipboardEvent<HTMLDivElement>): void => {
    const files = filesOf(e.clipboardData.files)
    if (files.length > 0) {
      e.preventDefault()
      void take(files)
      return
    }
    const words = e.clipboardData.getData('text/plain')
    if (words.trim() === '') return
    e.preventDefault()
    setNote(null)
    setWhy(pastedWords(isAnAddress(words)))
  }

  const label =
    shows === 'none'
      ? `Add a picture of the ${option}`
      : own
        ? `Put another picture on the ${option}`
        : `Add your own picture of the ${option}`
  const hint =
    shows === 'none'
      ? 'Drop a picture here, paste one, or press to choose it.'
      : 'Drop another picture on it, paste one, or press it to choose one.'

  let line: ReactNode = null
  if (own && ownDrawn) line = <span>{addedLine(own)}</span>
  else if (own)
    line = (
      <span>
        Yours is kept: {addedLine(own).replace(/^Added/, 'added')}. The maker’s picture of this
        exact item is shown.
      </span>
    )
  else if (held) line = <span>The maker’s picture of this exact item.</span>

  const drawn =
    shows === 'own' && own
      ? { key: own.id, src: own.src, width: own.width, height: own.height, srcSet: undefined }
      : shows === 'held' && held
        ? { key: 'held', ...held }
        : null

  return (
    <div className="ui-addpic" data-ground="plate" onPaste={onPaste}>
      <button
        ref={frame}
        type="button"
        className="ui-addpic-frame"
        data-shows={shows}
        data-over={over ? '' : undefined}
        aria-busy={busy || undefined}
        aria-label={label}
        aria-describedby={[line ? lineId : null, hintId, why ? whyId : null]
          .filter(Boolean)
          .join(' ')}
        onClick={() => chooser.current?.click()}
        onDragEnter={onDragOver}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {drawn ? (
          <span className="ui-addpic-shot">
            {/* the frame's own name says what it shows: inside a button, alt words would open it */}
            <Picture
              key={drawn.key}
              src={drawn.src}
              srcSet={drawn.srcSet}
              sizes="(min-width: 640px) 420px, 100vw"
              alt=""
              width={drawn.width}
              height={drawn.height}
              fit="contain"
            />
          </span>
        ) : (
          <span className="ui-addpic-ask">
            <Icon glyph={CameraPlusIcon} size="lg" />
            <span>Add a picture of the {keepSeparators(option)}</span>
          </span>
        )}
        {over || busy ? (
          <span className="ui-addpic-veil" aria-hidden="true">
            <Icon glyph={UploadSimpleIcon} size="lg" />
            {busy ? 'Reading the picture…' : 'Drop it to add it'}
          </span>
        ) : null}
      </button>
      <input
        ref={chooser}
        className="ui-addpic-chooser"
        type="file"
        accept={KINDS}
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const files = filesOf(e.target.files)
          e.target.value = ''
          void take(files)
        }}
      />
      {/* THE ORDER UNDER THE FRAME: whose picture it is, as its caption; why a picture was not
          taken, where it was refused; what was kept of one that was; then how to give one */}
      {line ? (
        <p id={lineId} className="ui-addpic-line">
          {/* a person's glyph for a picture a person added; a picture's for the maker's */}
          <Icon glyph={own ? UserCircleIcon : ImageIcon} />
          {line}
        </p>
      ) : null}
      {why ? <Refusal id={whyId}>{why}</Refusal> : null}
      {note ? <output className="ui-addpic-note">{note}</output> : null}
      <p id={hintId} className="ui-addpic-hint">
        {hint}
      </p>
      {own ? (
        <div className="ui-addpic-acts">
          <Button intent="quiet" size="sm" icon={TrashIcon} onClick={takeOff}>
            Take it off
          </Button>
          {held && onChoose ? (
            <Toggle
              label="Show yours instead of the maker’s"
              checked={own.chosen}
              onCheckedChange={choose}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
