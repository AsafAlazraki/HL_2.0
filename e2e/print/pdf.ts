/* ============================================================
   READING A PDF WELL ENOUGH TO COUNT ITS PAGES.

   This repository ships no PDF library and does not want one: the
   only question a gate has to ask of the printed artefact is how many
   pages came out, and the answer is written in the file in plain
   bytes.

   THE TWO READINGS, AND BOTH ARE TAKEN. A PDF's page tree has one
   root node carrying `/Count n` — the total, stated once — and every
   leaf carries `/Type /Page`. Chromium writes both uncompressed at
   the top level today. Reading only the first would be trusting one
   key whose spelling can move; reading only the second would count a
   `/Type /Pages` node as a page. So both are read and they have to
   agree, and a file that yields neither is a failure with its own
   sentence rather than a zero that quietly passes a `toBe(0)`.

   The bytes are read as latin1, which is the one encoding that maps
   every byte to one character — a PDF is not UTF-8 and decoding it as
   though it were would silently replace bytes and move every offset.
   ============================================================ */
import { readFileSync } from 'node:fs'

export interface PdfPages {
  /** what the page tree's own `/Count` says */
  counted: number | null
  /** how many `/Type /Page` leaves are in the file */
  leaves: number
}

/** How many pages this PDF has, by both readings. */
export function readPdfPages(path: string): PdfPages {
  const bytes = readFileSync(path)
  const text = bytes.toString('latin1')

  /* the page tree's root, in either key order: `/Type /Pages` then
     `/Count n`, or `/Count n` then `/Type /Pages` */
  let counted: number | null = null
  const after = /\/Type\s*\/Pages\b[^>]*?\/Count\s+(\d+)/.exec(text)
  const before = /\/Count\s+(\d+)[^>]*?\/Type\s*\/Pages\b/.exec(text)
  const found = after ?? before
  if (found) counted = Number(found[1])

  /* a leaf is `/Type /Page` NOT followed by an `s`, which is what
     tells a page from the tree node above it */
  const leaves = (text.match(/\/Type\s*\/Page(?![\s\S]{0,1}s)/g) ?? []).length

  return { counted, leaves }
}

/** The page count, or a sentence saying why it could not be read. */
export function pageCountOf(path: string): number {
  const { counted, leaves } = readPdfPages(path)
  if (counted === null && leaves === 0) {
    throw new Error(
      `${path} yielded no page count: neither a /Count on the page tree nor a /Type /Page leaf was found in its bytes. The PDF may be using compressed object streams, which this reader does not walk.`,
    )
  }
  if (counted !== null && leaves > 0 && counted !== leaves) {
    throw new Error(
      `${path} disagrees with itself: the page tree says ${counted} pages and ${leaves} /Type /Page leaves were found.`,
    )
  }
  return counted ?? leaves
}
