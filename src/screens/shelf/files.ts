/* ============================================================
   THE SHELF'S THREE BROWSER ERRANDS — the bytes of a file somebody
   chose, the inflate a workbook's compressed parts need, and handing a
   copy to the computer's Downloads. Nothing here decides anything; the
   reading is `src/domain/io/workbook.ts` and the copy is
   `buildExportPayload`.
   ============================================================ */

/** The bytes of a chosen or dropped file. */
export async function bytesOf(file: Blob): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer())
}

/** Inflate one deflated part of a workbook with the browser's own stream. */
export async function inflateRaw(raw: Uint8Array): Promise<Uint8Array> {
  const copy = new Uint8Array(raw.length)
  copy.set(raw)
  const stream = new Blob([copy]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

/** Hand text to the computer as a file, under the name given. */
export function download(text: string, name: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.rel = 'noopener'
  document.body.append(a)
  a.click()
  a.remove()
  /* a tick later, so the download has taken the address before it goes */
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** The size of a file, as a person reads it: 39.8 MB, 412 KB. */
export function sizeOf(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} KB`
  return `${bytes} bytes`
}
