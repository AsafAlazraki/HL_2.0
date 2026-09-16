/**
 * THE IMAGE LEDGER — what the packer and the fetcher share.
 *
 * One entry per distinct image address in the seed, in sorted order. An address is HELD
 * (a copy under public/seed-images, with its provenance), REFUSED (asked, and refused with
 * the measured reason) or UNHELD (nobody has asked yet). Nothing is matched by resemblance
 * and nothing is substituted; the row keeps the manufacturer's address in every state.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import type { PackImageEntry, PackImagesFile } from '../../src/data/pack/images'

/* WHAT A CARD AND A DETAIL PAGE ACTUALLY NEED. 1100 px on the long
   edge covers an enlarged plate at 1x with room, and every thumbnail
   at 2x. Above that we would be shipping detail no surface can draw.
   Source pictures run to 3000x2000. */
export const LONG_EDGE = 1100
export const QUALITY = 74

export const sha1Hex = (s: string): string => createHash('sha1').update(s, 'utf8').digest('hex')
export const sha256Hex = (b: Uint8Array): string => createHash('sha256').update(b).digest('hex')

/** The name the dealership's remediation gave this address's copy —
 *  sixteen hex characters of SHA-1 over the address BYTE FOR BYTE: not
 *  unescaped, not normalised, not lowercased. If the workbook's
 *  address differs from theirs by one percent-escape the key differs
 *  and no picture arrives, which is the correct outcome: we would not
 *  be able to prove the copy belongs to this row. */
export const mirrorKey = (url: string): string => sha1Hex(url).slice(0, 16)

export const hostOf = (url: string): string => url.split('/')[2] ?? ''

/** The host as a person says it — `www.` is noise on a plate. */
export const plainly = (host: string): string => (host.startsWith('www.') ? host.slice(4) : host)

/** A filename a person can recognise, plus enough of the address's
 *  hash to keep two identically-named pictures on two hosts apart. */
export function stemFor(url: string): string {
  let last = url.replace(/\/+$/, '').split('/').pop()?.split('?')[0] ?? ''
  try {
    last = decodeURIComponent(last)
  } catch {
    /* an address that is not valid percent-encoding keeps its raw leaf */
  }
  last = last.replace(/\.(jpe?g|png|webp|gif|ashx|aspx)$/i, '')
  const slug = last
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/^-+|-+$/g, '')
  return `${slug || 'picture'}-${sha1Hex(url).slice(0, 8)}`
}

/* WHY A PICTURE IS NOT HERE, IN WORDS SOMEBODY READS ON A PLATE.
   Each of these lands inside a sentence, so every one has to read as
   a CLAUSE as well as a sentence: it names the host, and it never
   opens with "this" or "it". Written at the point of measurement,
   rather than guessed at later by a surface that has no idea what
   happened. */
export function refusal(
  host: string,
  status: number,
  ctype: string,
  cf: boolean,
  signin = false,
): string {
  const h = plainly(host)
  if (signin) return `${h} needs a sign-in to read`
  if (status === 404) return `${h} no longer has that picture`
  if (status === 403 && cf) return `${h} serves its pictures to its own site only`
  if (status === 403) return `${h} refuses the request`
  if (status && status !== 200) return `${h} answered ${status} for it`
  if (ctype.includes('html')) return `${h} answers with a web page rather than a picture`
  if (!status) return `${h} could not be reached`
  return `${h} answers with ${ctype || 'nothing we can read'}`
}

/** What may be done with the picture, in words — the licence or the
 *  absence of one, never blank. None of the twelve hosts publishes a
 *  licence the workbook records, so every note says so and says what
 *  the copy is instead. */
export function licenceNoteFor(
  e: Pick<PackImageEntry, 'host' | 'file' | 'error' | 'via' | 'mirror'>,
): string {
  const h = plainly(e.host)
  if (e.file) {
    if (e.via === 'mpf-mirror') {
      return `No licence is recorded. The address is ${h}'s own, typed into the dealer's price file; the host refuses a plain request, so the bytes were taken off the dealership's own mirror of this same address (${e.mirror ?? 'mpf-mirror'}), keyed by the address's sha1. The copy is a downscaled build artefact resolved at paint time, and the row keeps the address.`
    }
    return `No licence is recorded. The address is ${h}'s own, typed into the dealer's price file; the copy under public/seed-images is a downscaled build artefact resolved at paint time, and the row keeps the address.`
  }
  if (e.error) {
    return `No licence is recorded and no copy is held — ${h} was asked and the row shows the address.`
  }
  return `No licence is recorded and no copy has been asked for yet — the row shows the address.`
}

export const LEDGER_NOTE =
  'One entry per distinct image address in the seed. `file` names a copy under public/seed-images; an entry with `error` carries the measured reason the picture could not be obtained, and an entry with neither has not been asked for yet. In every state the row keeps the manufacturer’s address. `via: mpf-mirror` says the bytes were taken off the dealership’s own mirror of THAT SAME ADDRESS because the host refuses a plain request; `mirror` names the object and `mirrorKey` is sha1(address)[:16], which is how the object was addressed. `verdict` is scene or studio, measured off the pixels at pack time. Nothing is matched by resemblance and nothing is substituted.'

/* ---------------------------------------------------------- */
/* reading and writing                                        */
/* ---------------------------------------------------------- */

export const ledgerPath = (dataDir: string): string => path.join(dataDir, 'images.json')

export function readLedger(dataDir: string): PackImagesFile {
  const file = ledgerPath(dataDir)
  if (!existsSync(file)) throw new Error(`no image ledger at ${file} — run the packer first`)
  return JSON.parse(readFileSync(file, 'utf8')) as PackImagesFile
}

/** The ledger as bytes: one entry per line, sorted by address, so a
 *  diff reads as the addresses that changed. Written from Node as
 *  UTF-8, never through a shell. */
export function writeLedger(dataDir: string, doc: PackImagesFile): void {
  const images = doc.images.toSorted((a, b) => (a.address < b.address ? -1 : 1))
  const text = `{\n"meta": ${JSON.stringify(doc.meta, null, 1)},\n"images": [\n${images
    .map((e) => JSON.stringify(e))
    .join(',\n')}\n]\n}\n`
  writeFileSync(ledgerPath(dataDir), text, 'utf8')
}
