/* ============================================================
   THE TWO READINGS SETTINGS TAKES OF A PICTURE'S OWN PIXELS, in the
   browser: the veil a photograph needs under Home's words, and the ink
   a mark Northside adds is drawn in. The arithmetic is pure and lives in
   `src/domain/northside/pixels.ts`; this file only draws the picture
   into a canvas and hands the bytes over.
   ============================================================ */

import { useEffect, useState } from 'react'
import { inkOf, veilFor, type InkReading, type VeilReading } from '@/domain/northside/pixels'

/** The part of Home's sea the name and the greeting stand over: its middle, as a share. */
const WORDS = { x: 0.15, y: 0.2, w: 0.7, h: 0.6 }

/** How wide the picture is drawn to be read: enough pixels to find its bright parts. */
const READ_WIDTH = 240

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((done, fail) => {
    const img = new Image()
    img.decoding = 'async'
    img.addEventListener('load', () => done(img), { once: true })
    img.addEventListener('error', () => fail(new Error(`The picture at ${src} would not open.`)), {
      once: true,
    })
    img.src = src
  })
}

/** The picture's own pixels over the region Home's words stand on, read once and veiled. */
export async function readVeil(src: string): Promise<VeilReading> {
  const img = await load(src)
  const w = READ_WIDTH
  const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('This computer would not read the picture.')
  ctx.drawImage(img, 0, 0, w, h)
  const data = ctx.getImageData(
    Math.round(w * WORDS.x),
    Math.round(h * WORDS.y),
    Math.round(w * WORDS.w),
    Math.round(h * WORDS.h),
  ).data
  return veilFor(data)
}

/** A file Northside chose, read for its size, its pixels' ink and its own bytes. */
export async function readMark(
  file: File,
): Promise<{ src: string; width: number; height: number; ink: InkReading | null }> {
  const src = await new Promise<string>((done, fail) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => done(String(reader.result)), { once: true })
    reader.addEventListener('error', () => fail(new Error('That file would not open.')), {
      once: true,
    })
    reader.readAsDataURL(file)
  })
  const img = await load(src)
  const scale = Math.min(1, 400 / img.naturalWidth)
  const w = Math.max(1, Math.round(img.naturalWidth * scale))
  const h = Math.max(1, Math.round(img.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('This computer would not read that file.')
  ctx.drawImage(img, 0, 0, w, h)
  return {
    src,
    width: img.naturalWidth,
    height: img.naturalHeight,
    ink: inkOf(ctx.getImageData(0, 0, w, h).data),
  }
}

/** Every picture's veil, read as it can be; a picture still being read has none yet. */
export function useVeils(srcs: readonly { id: string; src: string }[]): Map<string, VeilReading> {
  const [read, setRead] = useState<Map<string, VeilReading>>(() => new Map())
  useEffect(() => {
    let alive = true
    if (typeof document === 'undefined' || typeof Image === 'undefined') return
    for (const { id, src } of srcs) {
      readVeil(src)
        .then((reading) => {
          if (!alive) return
          setRead((was) => new Map(was).set(id, reading))
        })
        .catch(() => {
          /* a picture that would not be read keeps no veil, and is not offered as Home's */
        })
    }
    return () => {
      alive = false
    }
    /* the caller hands the list memoised: a new list is a new reading */
  }, [srcs])
  return read
}
