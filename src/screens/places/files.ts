/* ============================================================
   A FILE NORTHSIDE GIVES A PLACE — a mark or a photograph — read in
   the browser, BOUNDED, and said.

   The rule is `src/domain/modules/logo.ts`'s and it is not decided
   again here: `logoPlan` refuses or sizes a mark before a byte is
   read, `fitWithin` is the box, `shrinkNote` says what was done. That
   file left "the browser half … beside the file input that opens it,
   where the canvas is", and this is that half: plan, read, redraw.

   A PHOTOGRAPH IS ALWAYS REDRAWN, to `HERO_EDGE` on its longest side
   as a JPEG. A phone's photograph is 4,000 px and several megabytes,
   carried in the place's record through every save and every backup;
   a card and a page head never draw one wider than 1,600 px. A mark
   is kept exactly as it is when it is small, which is the logo rule.
   ============================================================ */
import type { ImageRef } from '@/domain/model'
import { newId } from '@/domain/id'
import {
  LOGO_MAX_EDGE,
  bytesOfDataUrl,
  fitWithin,
  logoPlan,
  shrinkNote,
} from '@/domain/modules/logo'

/** The longest side a photograph Northside gives a place is kept at. */
export const HERO_EDGE = 1600

export type FileRead = { ok: true; image: ImageRef; note?: string } | { ok: false; why: string }

const NOT_A_PICTURE = 'That file is not a picture this screen can read.'

function readAsDataUrl(file: File): Promise<string> {
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

async function redraw(
  src: string,
  edge: number,
  type: 'image/png' | 'image/jpeg',
): Promise<{ src: string; w: number; h: number } | null> {
  const img = await decode(src)
  const box = fitWithin(img.naturalWidth, img.naturalHeight, edge)
  const canvas = document.createElement('canvas')
  canvas.width = box.w
  canvas.height = box.h
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
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
