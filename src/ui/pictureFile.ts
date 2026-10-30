/* ============================================================
   A PICTURE NORTHSIDE GIVES THE APP — a place's mark or photograph,
   or an option's own picture — read in the browser, BOUNDED, and said.

   ONE WAY, NOT TWO. This was `src/screens/places/files.ts`, Milestone
   4's half of the logo rule, beside the place's file input. An option's
   picture is the same act — plan, read, redraw — so the half moved here,
   into the kit, where the control that takes an option's picture
   (`AddPicture`) and the place's settings both reach it; the places
   file re-exports it unchanged.

   THE RULES ARE THE DOMAIN'S and are not decided again here: a mark is
   `logoPlan`'s (`@/domain/modules/logo`), an option's picture is
   `ownPicturePlan`'s (`@/domain/model/ownPictures`). Each refuses or
   proceeds before a byte is read, and this does the three browser
   things that rule cannot: read, decode, redraw.

   AN OPTION'S PICTURE IS ALWAYS REDRAWN, to `OWN_PICTURE_EDGE` (1,100
   pixels, the largest any screen or paper draws an option's picture)
   on its longest side, as WebP so a part cut out on a clear ground
   keeps it. A browser that cannot write WebP hands back a PNG, and it is
   drawn again as a JPEG on the plate's own white. Redrawing is also
   what makes the bytes ours: whatever the file carried beyond its
   pixels does not survive the canvas.
   ============================================================ */
import type { ImageRef } from '@/domain/model'
import { newId } from '@/domain/id'
import {
  LOGO_MAX_EDGE,
  bytesOfDataUrl,
  fitWithin,
  logoPlan,
  shrinkNote,
  sizeSay,
} from '@/domain/modules/logo'
import { OWN_PICTURE_EDGE, ownPicturePlan, unreadable } from '@/domain/model/ownPictures'
import type { PictureTaken } from '@/domain/catalogue/pictureCommands'

/** The longest side a photograph Northside gives a place is kept at. */
export const HERO_EDGE = 1600

export type FileRead = { ok: true; image: ImageRef; note?: string } | { ok: false; why: string }

const NOT_A_PICTURE = 'That file is not a picture this screen can read.'

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result)))
    reader.addEventListener('error', () => reject(reader.error ?? new Error('unreadable')))
    reader.readAsDataURL(file)
  })
}

function decode(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', () => reject(new Error('undecodable')))
    img.src = src
  })
}

/** THE PLATE'S WHITE, read off the tokens, for a picture redrawn without a clear ground. */
function plateWhite(): string {
  const read = getComputedStyle(document.documentElement).getPropertyValue('--color-white').trim()
  return read === '' ? 'Canvas' : read
}

async function redraw(
  src: string,
  edge: number,
  type: 'image/png' | 'image/jpeg' | 'image/webp',
  ground?: boolean,
): Promise<{ src: string; w: number; h: number } | null> {
  const img = await decode(src)
  if (!(img.naturalWidth > 0) || !(img.naturalHeight > 0)) return null
  const box = fitWithin(img.naturalWidth, img.naturalHeight, edge)
  const canvas = document.createElement('canvas')
  canvas.width = box.w
  canvas.height = box.h
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  if (ground) {
    ctx.fillStyle = plateWhite()
    ctx.fillRect(0, 0, box.w, box.h)
  }
  ctx.drawImage(img, 0, 0, box.w, box.h)
  return { src: canvas.toDataURL(type, 0.82), w: box.w, h: box.h }
}

/** A mark: kept as it is when small, redrawn to 512 px when not, refused when it is not one. */
export async function readMark(file: File): Promise<FileRead> {
  const plan = logoPlan({ type: file.type, size: file.size })
  if (plan.do === 'refuse') return { ok: false, why: plan.why }
  try {
    const src = await readAsDataUrl(file)
    if (plan.do === 'keep') return { ok: true, image: { id: newId(), src, name: file.name } }
    const drawn = await redraw(src, LOGO_MAX_EDGE, 'image/png')
    if (!drawn) return { ok: true, image: { id: newId(), src, name: file.name } }
    return {
      ok: true,
      image: { id: newId(), src: drawn.src, name: file.name, w: drawn.w, h: drawn.h },
      note: shrinkNote(file.size, bytesOfDataUrl(drawn.src), drawn.w, drawn.h),
    }
  } catch {
    return { ok: false, why: NOT_A_PICTURE }
  }
}

/** A photograph: always redrawn to 1,600 px on its longest side, and what was done said. */
export async function readPhotograph(file: File): Promise<FileRead> {
  const plan = logoPlan({ type: file.type, size: file.size })
  if (plan.do === 'refuse') return { ok: false, why: plan.why }
  try {
    const src = await readAsDataUrl(file)
    const drawn = await redraw(src, HERO_EDGE, 'image/jpeg')
    if (!drawn) return { ok: false, why: NOT_A_PICTURE }
    return {
      ok: true,
      image: { id: newId(), src: drawn.src, name: file.name, w: drawn.w, h: drawn.h },
      note: shrinkNote(file.size, bytesOfDataUrl(drawn.src), drawn.w, drawn.h),
    }
  } catch {
    return { ok: false, why: NOT_A_PICTURE }
  }
}

/** What an option's picture read hands back: the picture to keep and what was done to it. */
export type PictureRead =
  { ok: true; picture: PictureTaken; note: string } | { ok: false; why: string }

/** What was done to the dealer's picture, in their words. */
export function keptNote(before: number, after: number, w: number, h: number): string {
  return `Kept at ${w} × ${h}, ${sizeSay(after)}${
    before > after ? `, from ${sizeSay(before)}` : ''
  }. Your own file is not changed.`
}

/**
 * AN OPTION'S PICTURE: refused before a byte is read where it is not a picture or is too large
 * (`ownPicturePlan`), then read, decoded and always redrawn to 1,100 pixels at most. A file the
 * browser cannot open is refused with its own sentence. `option` is the option's name, for the
 * refusal: "“brochure.pdf” is not a picture, so it cannot be the Yamaha F60LC’s."
 */
export async function readOptionPicture(file: File, option: string): Promise<PictureRead> {
  const name = file.name && file.name !== 'image.png' ? file.name : undefined
  const plan = ownPicturePlan({ type: file.type, size: file.size, name }, option)
  if (plan.do === 'refuse') return { ok: false, why: plan.why }
  try {
    const src = await readAsDataUrl(file)
    let drawn = await redraw(src, OWN_PICTURE_EDGE, 'image/webp')
    /* a browser that cannot write WebP answers in PNG: drawn again as a JPEG on white */
    if (drawn && !drawn.src.startsWith('data:image/webp')) {
      drawn = await redraw(src, OWN_PICTURE_EDGE, 'image/jpeg', true)
    }
    if (!drawn) return { ok: false, why: unreadable(name) }
    return {
      ok: true,
      picture: { src: drawn.src, width: drawn.w, height: drawn.h, ...(name ? { file: name } : {}) },
      note: keptNote(file.size, bytesOfDataUrl(drawn.src), drawn.w, drawn.h),
    }
  } catch {
    return { ok: false, why: unreadable(name) }
  }
}
