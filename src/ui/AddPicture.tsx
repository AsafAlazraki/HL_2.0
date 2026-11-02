import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CameraPlusIcon,
  ImageIcon,
  PlusIcon,
  StarIcon,
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
  type Ref,
} from 'react'
import type { TableKind } from '@/domain/model'
import { keepSeparators } from '@/domain/quote/wrap'
import type { PictureTaken } from '@/domain/catalogue/pictureCommands'
import { DROPPED_NO_FILE, isAnAddress, pastedWords } from '@/domain/model/ownPictures'
import { Button } from './Button'
import { Icon } from './Icon'
import { Lightbox, type LightboxPicture } from './Lightbox'
import { Picture } from './Picture'
import { Refusal } from './Refusal'
import { say, undo } from './Toaster'
import { readOptionPicture, type PictureRead } from './pictureFile'

/* ============================================================
   ONE OPTION'S PICTURES — the gallery of one row of the price list (a
   colour, a finish, a part, a motor, a trailer, a boat), its cover, and
   the way Northside adds to it, orders it and takes its own off. What
   the original HelmLogic's users valued (docs/directions/flow/
   original.md §3) and the owner asked for on 2026-10-31 ("per boat and
   product the ability to have more than one image and cover image and
   whatnot"), done the way this app does everything: on the option
   itself, said, and undone.

   WHAT IS DRAWN is the row's gallery as the one reader orders it
   (`galleryOf` in `@/data/pictures`): the held pictures and every one
   the dealer added, the cover first. Never a stand-in: a row with
   nothing has the empty frame that asks for one.

   THE FRAME IS THE PICTURE PICKED, and a press on it opens the whole
   gallery large (`Lightbox`) at that picture. Empty, the frame is the
   way to add the first. Under it, where there are two or more, every
   picture small, a press each, the cover marked; then the picked one's
   provenance ("Added by Asaf, 2 November 2026", or the maker's host),
   and its acts: Make it the cover, Earlier and Later among the others,
   Take it off for one of Northside's — only the ones that apply to
   that picture are drawn, so nothing here is ever a dead control.

   THREE WAYS TO ADD, ONE PLACE: "Add pictures" opens the chooser
   (several at once); a file DROPPED anywhere on the control is taken;
   a picture PASTED while anything here has the caret is taken, and
   pasted words are refused with the reason (an address is never
   fetched; `pastedWords`). The keyboard's path is Tab to "Add
   pictures", then Enter, or Ctrl V.

   THE PREVIEW IS THE STEP. Each picture is redrawn (`readOptionPicture`,
   1,100 pixels at most) and all of them put on the option as one step,
   drawn at once with what was kept said under them. Undo, in the toast,
   takes them back; there is no "Are you sure", because a step that can
   be taken back does not need asking twice.

   A REFUSAL IS A SENTENCE UNDER THE FRAME — not a picture, too large,
   an address, nobody at the desk — and the frame points a reader at it
   (`aria-describedby`).

   THE STORE IS THE CALLER'S. The control is handed the gallery and its
   acts, each answering with a step or a refusal; the app's binding to
   the catalogue's commands is `src/app/optionPicture.ts`, so a screen
   writes `<AddPicture {...useOptionPicture(…)} />`.
   ============================================================ */

/** What one of the control's acts did: a step with its way back, or why it did not. */
export type PictureStep = { said: string; undo: () => string } | { refused: string }

/** ONE PICTURE OF AN OPTION'S GALLERY, as the control draws it. */
export interface GalleryShot {
  /** its id in the gallery: what the acts are handed back */
  id: string
  src: string
  /** the held pixels: never drawn past them */
  width: number
  height: number
  srcSet?: string
  /** what it shows, for a reader */
  alt: string
  /** where it came from: "Added by Asaf, 2 November 2026", "Photograph from stabicraft.com.au" */
  source: string
  /** what it shows that is not exactly this option, or '' */
  standing: string
  /** one of Northside's own: the one kind that may be taken off */
  own: boolean
}

/** A picture of the exact item the app already has (the kit's specimens). */
export interface HeldOptionPicture {
  src: string
  width: number
  height: number
  srcSet?: string
}

export interface AddPictureProps {
  /** the option as the dealer reads it: "Yamaha F60LC", "Battery MFM50" */
  option: string
  /** the option's gallery, the cover first */
  gallery: readonly GalleryShot[]
  /** put these pictures on the option, beside the ones it has */
  onAdd: (pictures: PictureTaken[]) => PictureStep
  /** take one of Northside's pictures off the option */
  onRemove: (id: string) => PictureStep
  /** make one picture the option's cover */
  onCover?: (id: string) => PictureStep
  /** move one picture to a new place among them all (0 is the cover's) */
  onMove?: (id: string, to: number) => PictureStep
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

/** A row's gallery as the lightbox draws it: the option's name over each, its provenance under. */
export function largeOf(option: string, gallery: readonly GalleryShot[]): LightboxPicture[] {
  return gallery.map((s, i) => ({
    id: s.id,
    src: s.src,
    width: s.width,
    height: s.height,
    ...(s.srcSet ? { srcSet: s.srcSet } : {}),
    alt: s.alt,
    caption: option,
    credit: s.source,
    ...(s.standing !== '' ? { note: s.standing } : {}),
    ...(i === 0 && gallery.length > 1 ? { cover: true } : {}),
  }))
}

/* ---------------------------------------------------------- */
/* Taking pictures in, and answering an act                    */
/* ---------------------------------------------------------- */

interface Taking {
  /** read these files and put them on the option as one step */
  take: (files: File[]) => Promise<void>
  /** an act's step said with its Undo, or its refusal set: true where it was a step */
  answered: (step: PictureStep) => boolean
  /** open the chooser */
  choose: () => void
  why: string | null
  setWhy: (why: string | null) => void
  note: string | null
  setNote: (note: string | null) => void
  /** what is being read, while it is */
  busy: string | null
  /** the chooser itself, drawn by whoever holds this */
  chooser: ReactNode
}

/** THE ONE WAY A PICTURE COMES IN, shared by the control and the acts under a picture large. */
function useTaking(
  option: string,
  onAdd: AddPictureProps['onAdd'],
  read: NonNullable<AddPictureProps['read']>,
  kind: TableKind | undefined,
  /** told once the pictures are on the option */
  added: () => void,
): Taking {
  const base = useId()
  const toastId = `add-picture-${base}`
  const input = useRef<HTMLInputElement>(null)
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])
  const [why, setWhy] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

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
    setWhy(null)
    const taken: PictureTaken[] = []
    const notes: string[] = []
    for (const [i, file] of files.entries()) {
      setBusy(files.length > 1 ? `Reading ${i + 1} of ${files.length}…` : 'Reading the picture…')
      const got = await read(file, option)
      if (!alive.current) return
      if (!got.ok) {
        /* ONE THAT IS NOT A PICTURE STOPS THE DROP, said: the rest wait to be dropped again
           without it, rather than half a drop arriving */
        setBusy(null)
        setWhy(files.length > 1 ? `${got.why} None of the ${files.length} was added.` : got.why)
        return
      }
      taken.push(got.picture)
      notes.push(got.note)
    }
    setBusy(null)
    if (answered(onAdd(taken))) {
      added()
      setNote(taken.length === 1 ? (notes[0] ?? null) : `${taken.length} pictures kept.`)
    }
  }

  const chooser = (
    <input
      ref={input}
      className="ui-addpic-chooser"
      type="file"
      accept={KINDS}
      multiple
      tabIndex={-1}
      aria-hidden="true"
      onChange={(e) => {
        const files = filesOf(e.target.files)
        e.target.value = ''
        void take(files)
      }}
    />
  )
  return {
    take,
    answered,
    choose: () => input.current?.click(),
    why,
    setWhy,
    note,
    setNote,
    busy,
    chooser,
  }
}

/** Where the picture an act was about stands once it is done: a place, or the last. */
export type GalleryPlace = number | 'last'

/** THE ACTS ON THE PICKED PICTURE — only those that apply to it are drawn. */
function Acts({
  gallery,
  at,
  t,
  onRemove,
  onCover,
  onMove,
  placed,
  adder,
  quiet = false,
}: {
  gallery: readonly GalleryShot[]
  at: number
  t: Taking
  onRemove: AddPictureProps['onRemove']
  onCover: AddPictureProps['onCover']
  onMove: AddPictureProps['onMove']
  /** told where the picture stands once an act on it is done, and its id */
  placed: (place: GalleryPlace, id: string | null) => void
  adder?: Ref<HTMLElement>
  /** on the lightbox's plate: every act quiet, Add included */
  quiet?: boolean
}) {
  const shot = gallery[at]
  const n = gallery.length
  if (!shot) return null
  const act = (step: PictureStep, place: GalleryPlace, id: string | null): void => {
    t.setNote(null)
    if (t.answered(step)) placed(place, id)
  }
  return (
    <div className="ui-addpic-acts">
      <Button
        ref={adder}
        intent={quiet ? 'quiet' : 'secondary'}
        size="sm"
        icon={PlusIcon}
        onClick={t.choose}
      >
        Add pictures
      </Button>
      {at > 0 && onCover ? (
        <Button
          intent="quiet"
          size="sm"
          icon={StarIcon}
          onClick={() => act(onCover(shot.id), 0, shot.id)}
        >
          Make it the cover
        </Button>
      ) : null}
      {at > 1 && onMove ? (
        <Button
          intent="quiet"
          size="sm"
          icon={ArrowLeftIcon}
          onClick={() => act(onMove(shot.id, at - 1), at - 1, shot.id)}
          aria-label={`Earlier, to ${at} of ${n}`}
        >
          Earlier
        </Button>
      ) : null}
      {at > 0 && at < n - 1 && onMove ? (
        <Button
          intent="quiet"
          size="sm"
          icon={ArrowRightIcon}
          onClick={() => act(onMove(shot.id, at + 1), at + 1, shot.id)}
          aria-label={`Later, to ${at + 2} of ${n}`}
        >
          Later
        </Button>
      ) : null}
      {shot.own ? (
        <Button
          intent="quiet"
          size="sm"
          icon={TrashIcon}
          onClick={() => act(onRemove(shot.id), Math.max(0, at - 1), gallery[at - 1]?.id ?? null)}
        >
          Take it off
        </Button>
      ) : null}
    </div>
  )
}

/**
 * THE ACTS ON ONE PICTURE OF A GALLERY, LARGE — for a screen that shows an option's pictures and
 * opens them in the lightbox (Fitment, the catalogue): add more, make the open one the cover,
 * move it, take one of Northside's off. `moved` is told where the open picture stands after.
 */
export function GalleryActs({
  option,
  gallery,
  at,
  moved,
  onAdd,
  onRemove,
  onCover,
  onMove,
  kind,
  read = readOptionPicture,
}: AddPictureProps & { at: number; moved: (place: GalleryPlace) => void }) {
  const t = useTaking(option, onAdd, read, kind, () => moved('last'))
  const whyId = useId()
  return (
    <div
      className="ui-addpic-large"
      onPaste={(e) => {
        const files = filesOf(e.clipboardData.files)
        if (files.length === 0) return
        e.preventDefault()
        void t.take(files)
      }}
    >
      {t.chooser}
      <Acts
        gallery={gallery}
        at={at}
        t={t}
        onRemove={onRemove}
        onCover={onCover}
        onMove={onMove}
        placed={(place) => moved(place)}
        quiet
      />
      {t.busy ? <output className="ui-addpic-note">{t.busy}</output> : null}
      {t.why ? <Refusal id={whyId}>{t.why}</Refusal> : null}
      {t.note ? <output className="ui-addpic-note">{t.note}</output> : null}
    </div>
  )
}

export function AddPicture({
  option,
  gallery,
  onAdd,
  onRemove,
  onCover,
  onMove,
  kind,
  read = readOptionPicture,
}: AddPictureProps) {
  const base = useId()
  const hintId = `${base}-hint`
  const whyId = `${base}-why`
  const lineId = `${base}-line`
  const adder = useRef<HTMLElement>(null)
  const [over, setOver] = useState(false)
  /* THE PICTURE PICKED, by its id; 'last' just after an add, so the new one is the one shown */
  const [picked, setPicked] = useState<string | null>(null)
  const [large, setLarge] = useState<number | null>(null)
  const t = useTaking(option, onAdd, read, kind, () => setPicked('last'))

  const n = gallery.length
  const at = (() => {
    if (picked === 'last') return Math.max(0, n - 1)
    const i = picked === null ? -1 : gallery.findIndex((s) => s.id === picked)
    return i === -1 ? 0 : i
  })()
  const shot = gallery[at]

  /* ---- a drag, anywhere on the control ---- */
  const onDragOver = (e: DragEvent<HTMLDivElement>): void => {
    /* only what could be a picture is welcomed; anything else drops nowhere */
    if (!carriesFiles(e) && !Array.from(e.dataTransfer.types).includes('text/uri-list')) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    if (!over) setOver(true)
  }
  const onDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    const to = e.relatedTarget
    if (to instanceof Node && e.currentTarget.contains(to)) return
    setOver(false)
  }
  const onDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    setOver(false)
    const files = filesOf(e.dataTransfer.files)
    if (files.length === 0) {
      t.setNote(null)
      t.setWhy(DROPPED_NO_FILE)
      return
    }
    void t.take(files)
  }

  /* ---- a paste, anywhere in the control ---- */
  const onPaste = (e: ClipboardEvent<HTMLDivElement>): void => {
    const files = filesOf(e.clipboardData.files)
    if (files.length > 0) {
      e.preventDefault()
      void t.take(files)
      return
    }
    const words = e.clipboardData.getData('text/plain')
    if (words.trim() === '') return
    e.preventDefault()
    t.setNote(null)
    t.setWhy(pastedWords(isAnAddress(words)))
  }

  const said = keepSeparators(option)
  const label = shot
    ? `See the ${option} larger: picture ${at + 1} of ${n}${at === 0 && n > 1 ? ', the cover' : ''}`
    : `Add a picture of the ${option}`
  const hint = shot
    ? 'Drop pictures anywhere here, paste one, or press Add pictures to choose them.'
    : 'Drop pictures here, paste one, or press to choose them.'
  const describedBy = [shot ? lineId : null, hintId, t.why ? whyId : null].filter(Boolean).join(' ')

  return (
    <div
      className="ui-addpic"
      data-ground="plate"
      onPaste={onPaste}
      onDragEnter={onDragOver}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="ui-addpic-stage">
        <button
          type="button"
          className="ui-addpic-frame"
          data-shows={shot ? (shot.own ? 'own' : 'held') : 'none'}
          data-over={over ? '' : undefined}
          aria-busy={t.busy !== null || undefined}
          aria-label={label}
          aria-describedby={describedBy}
          onClick={() => (shot ? setLarge(at) : t.choose())}
        >
          {shot ? (
            <span className="ui-addpic-shot">
              {/* the frame's own name says what it shows: inside a button, alt words would open it */}
              <Picture
                key={shot.id}
                src={shot.src}
                srcSet={shot.srcSet}
                sizes="(min-width: 640px) 420px, 100vw"
                alt=""
                width={shot.width}
                height={shot.height}
                fit="contain"
              />
            </span>
          ) : (
            <span className="ui-addpic-ask">
              <Icon glyph={CameraPlusIcon} size="lg" />
              <span>Add a picture of the {said}</span>
            </span>
          )}
          {/* the cover's mark is the frame's own, said in its name */}
          {shot && at === 0 && n > 1 ? (
            <span className="ui-addpic-cover" aria-hidden="true">
              <Icon glyph={StarIcon} size="sm" />
              Cover
            </span>
          ) : null}
          {over || t.busy ? (
            <span className="ui-addpic-veil" aria-hidden="true">
              <Icon glyph={UploadSimpleIcon} size="lg" />
              {t.busy ?? 'Drop them to add them'}
            </span>
          ) : null}
        </button>
      </div>
      {t.chooser}
      {n > 1 ? (
        <ul className="ui-addpic-strip" aria-label={`The ${option}’s pictures`}>
          {gallery.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className="ui-addpic-thumb"
                aria-pressed={i === at}
                aria-label={`Picture ${i + 1} of ${n}${i === 0 ? ', the cover' : ''}${s.own ? ', Northside’s own' : ''}`}
                onClick={() => {
                  t.setNote(null)
                  setPicked(s.id)
                }}
              >
                <img src={s.src} alt="" width={s.width} height={s.height} draggable={false} />
                {i === 0 ? (
                  <span className="ui-addpic-thumb-cover" aria-hidden="true">
                    <Icon glyph={StarIcon} size="sm" />
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {/* THE ORDER UNDER THE FRAME: whose the picked picture is, as its caption; why a picture was
          not taken, where it was refused; what was kept of one that was; then how to give one */}
      {shot ? (
        <p id={lineId} className="ui-addpic-line">
          {/* a person's glyph for a picture a person added; a picture's for the maker's */}
          <Icon glyph={shot.own ? UserCircleIcon : ImageIcon} />
          <span>
            {shot.source}
            {n > 1 ? <span className="ui-addpic-place">{` · ${at + 1} of ${n}`}</span> : null}
            {shot.standing !== '' ? (
              <span className="ui-addpic-standing">{shot.standing}</span>
            ) : null}
          </span>
        </p>
      ) : null}
      {t.why ? <Refusal id={whyId}>{t.why}</Refusal> : null}
      {t.note ? <output className="ui-addpic-note">{t.note}</output> : null}
      <p id={hintId} className="ui-addpic-hint">
        {hint}
      </p>
      {shot ? (
        <Acts
          gallery={gallery}
          at={at}
          t={t}
          onRemove={onRemove}
          onCover={onCover}
          onMove={onMove}
          adder={adder}
          placed={(_place, id) => {
            setPicked(id)
            /* the picture taken off had the caret: it goes to Add, which still stands */
            if (id === null || id !== shot.id) adder.current?.focus()
          }}
        />
      ) : null}
      <Lightbox
        pictures={largeOf(option, gallery)}
        at={large}
        onAt={(next) => {
          setLarge(next)
          if (next !== null) setPicked(gallery[next]?.id ?? null)
        }}
        title={option}
        strip
      />
    </div>
  )
}
