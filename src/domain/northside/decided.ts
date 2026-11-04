/* ============================================================
   EVERYTHING NORTHSIDE HAS DECIDED, IN ONE INDEX — counted, each with
   its door and who changed it last (the judge of Settings, 2026-11-04,
   L4: "the deep backend configuration is spread over five rooms, and
   none of them says what Northside has decided as a whole").

   EVERY FIGURE IS A COUNT OF RECORDS NORTHSIDE MADE, never a figure of
   the price file: lines of the letterhead set, people kept, colour
   letters named, supplier codes named, headings placed in an aisle,
   findings left alone on Review, lists whose price was chosen here,
   pictures added and covers chosen. A count of nothing is said as
   nothing, with what that means.

   WHO AND WHEN are read from what is kept, not the session's steps: a
   setting's stamp (`./stamped.ts`), a list's price stamp
   (`domain/pricing/chosen.ts`), a Review press's own stamp, a picture's
   `addedAt` and an arrangement's `at`. A change made before any of it
   was kept has no who, and none is said.

   Pure: no React, no store, no clock.
   ============================================================ */

import type { OrgProfile } from '@/domain/model'
import type { GalleryOrder } from '@/domain/model/gallery'
import type { OwnPicture } from '@/domain/model/ownPictures'
import type { Stamps } from '@/domain/catalogue/table/stamps'
import { readStamp } from '@/domain/rules/review/standing'
import { lastChanged } from './stamped'

/** When and by whom, where it is kept. */
export interface Changed {
  at: string
  by?: string
}

/** One kind of thing Northside decided in another room. */
export interface DecidedElsewhere {
  key: 'colours' | 'suppliers' | 'aisles' | 'leftAlone' | 'prices' | 'pictures'
  /** what it is, as the index names it */
  name: string
  /** how many Northside has made */
  count: number
  /** the count in words, value first — "3 named", "None named" */
  said: string
  /** what it means, in one line */
  holds: string
  /** the room it is set in */
  door: string
  /** the room's word, as the pill and the finder say it */
  room: string
  last: Changed | null
}

const latest = (a: Changed | null, b: Changed | null): Changed | null =>
  !a ? b : !b ? a : b.at > a.at ? b : a

const size = (map: Readonly<Record<string, unknown>> | undefined): number =>
  map ? Object.keys(map).length : 0

const plural = (n: number, one: string, many: string): string =>
  `${String(n)} ${n === 1 ? one : many}`

/** The kept settings' last change, for the keys a room writes. */
const settingLast = (stamps: Stamps, key: string): Changed | null => {
  const s = lastChanged(stamps, [key])
  return s ? { at: s.at, ...(s.by ? { by: s.by } : {}) } : null
}

/**
 * WHAT NORTHSIDE DECIDED OUTSIDE SETTINGS, room by room. `pictures` and `galleries` are the
 * standing records the catalogue keeps (`standingOwnPictures`, `standingGalleries`).
 */
export function decidedElsewhere(input: {
  org: OrgProfile | undefined
  stamps: Stamps
  pictures: readonly OwnPicture[]
  galleries: readonly GalleryOrder[]
}): DecidedElsewhere[] {
  const { org, stamps, pictures, galleries } = input

  /* the findings left alone, each stamped with its own press's instant and person */
  let leftLast: Changed | null = null
  for (const stamp of Object.values(org?.leftAlone ?? {})) {
    const read = readStamp(stamp)
    if (read.at === '') continue
    leftLast = latest(leftLast, { at: read.at, ...(read.who ? { by: read.who } : {}) })
  }
  const left = size(org?.leftAlone)

  /* a list's price, chosen here: one stamp per list (`prices:<table>`) */
  let priced = 0
  let pricedLast: Changed | null = null
  for (const s of Object.values(stamps)) {
    if (!s.rowId.startsWith('prices:')) continue
    priced += 1
    pricedLast = latest(pricedLast, { at: s.at, ...(s.by ? { by: s.by } : {}) })
  }

  let picturesLast: Changed | null = null
  for (const p of pictures)
    picturesLast = latest(picturesLast, { at: p.addedAt, ...(p.addedBy ? { by: p.addedBy } : {}) })
  const covers = galleries.filter((g) => g.cover !== undefined).length
  for (const g of galleries) picturesLast = latest(picturesLast, { at: g.at, by: g.by })

  const colours = size(org?.colours)
  const suppliers = size(org?.suppliers)
  const aisles = size(org?.aisles)

  return [
    {
      key: 'prices',
      name: 'Prices',
      count: priced,
      said: priced === 0 ? 'None chosen here' : `${plural(priced, 'list', 'lists')} chosen here`,
      holds:
        priced === 0
          ? 'Every list prices as the price list sets it'
          : 'Which figure each list quotes at, chosen by Northside',
      door: '/levels',
      room: 'Prices',
      last: pricedLast,
    },
    {
      key: 'leftAlone',
      name: 'Left alone on Review',
      count: left,
      said: left === 0 ? 'None' : plural(left, 'finding', 'findings'),
      holds:
        left === 0
          ? 'Every finding stands in Review’s queue'
          : 'Findings marked as meant or as a known fault, out of the queue',
      door: '/review',
      room: 'Review',
      last: leftLast,
    },
    {
      key: 'suppliers',
      name: 'Supplier names',
      count: suppliers,
      said: suppliers === 0 ? 'None named' : plural(suppliers, 'code named', 'codes named'),
      holds:
        suppliers === 0
          ? 'Each supplier code reads as the parts list writes it'
          : 'The parts list’s supplier codes, each with the maker’s name Northside gave it',
      door: '/catalogue',
      room: 'Catalogue',
      last: settingLast(stamps, 'suppliers'),
    },
    {
      key: 'aisles',
      name: 'Aisles',
      count: aisles,
      said: aisles === 0 ? 'None placed' : plural(aisles, 'heading placed', 'headings placed'),
      holds:
        aisles === 0
          ? 'A heading the aisles do not name stands in Not sorted yet'
          : 'Headings and lines Northside put in an aisle of the chandlery',
      door: '/catalogue',
      room: 'Catalogue',
      last: settingLast(stamps, 'aisles'),
    },
    {
      key: 'colours',
      name: 'Colour letters',
      count: colours,
      said: colours === 0 ? 'None named' : plural(colours, 'letter named', 'letters named'),
      holds:
        colours === 0
          ? 'Each colour letter the price list does not name reads as written'
          : 'Letters of the colour key Northside named, as in I for White',
      door: '/data',
      room: 'Data',
      last: settingLast(stamps, 'colours'),
    },
    {
      key: 'pictures',
      name: 'Pictures',
      count: pictures.length + covers,
      said:
        pictures.length + covers === 0
          ? 'None added'
          : [
              pictures.length > 0 ? plural(pictures.length, 'added', 'added') : '',
              covers > 0 ? plural(covers, 'cover chosen', 'covers chosen') : '',
            ]
              .filter((s) => s !== '')
              .join(' · '),
      holds:
        pictures.length + covers === 0
          ? 'Every line shows the pictures the app holds of it'
          : 'Northside’s own pictures on its lines, and the covers it chose',
      door: '/catalogue',
      room: 'Catalogue',
      last: picturesLast,
    },
  ]
}

/** The keys of Northside's profile, as the index and its last-change line name them. */
export const SETTING_SAID: Readonly<Record<string, string>> = {
  name: 'The trading name',
  legalName: 'The legal name',
  abn: 'The ABN',
  address: 'The street address',
  phone: 'The phone',
  email: 'The email',
  website: 'The website',
  marks: 'The mark',
  gstRate: 'The GST rate',
  validDays: 'How long a quote stands',
  deposit: 'The deposit wording',
  depositRule: 'The deposit',
  quoteTerms: 'The terms',
  people: 'Northside’s people',
  look: 'The colour, a picture or the shape',
  home: 'Home’s arrangement',
  colours: 'A colour letter’s name',
  suppliers: 'A supplier’s name',
  aisles: 'An aisle’s headings',
  leftAlone: 'What Review leaves alone',
  org: 'A step undone',
}

/** A kept instant, as a person says it beside today: "today at 10:12", or "3 November". */
export function whenSaid(at: string, now: Date): string {
  const then = new Date(at)
  if (Number.isNaN(then.getTime())) return ''
  const sameDay =
    then.getFullYear() === now.getFullYear() &&
    then.getMonth() === now.getMonth() &&
    then.getDate() === now.getDate()
  if (sameDay)
    return `today at ${then.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}`
  return then.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    ...(then.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  })
}

/** "The GST rate, by Asaf today at 10:12" — the last setting changed, or null where none is kept. */
export function lastSaid(stamps: Stamps, now: Date): string | null {
  const last = lastChanged(stamps)
  if (!last) return null
  const what = SETTING_SAID[last.key] ?? 'A setting'
  const when = whenSaid(last.at, now)
  return `${what}, ${last.by ? `by ${last.by} ` : ''}${when}`.trim()
}

/** How many quotes on this computer each person prepared, by name as a person says it. */
export function preparedBy(
  quotes: ReadonlyArray<{ preparedBy?: string | undefined }>,
  name: string,
): number {
  const asked = name.trim().toLowerCase()
  if (asked === '') return 0
  return quotes.filter((q) => (q.preparedBy ?? '').trim().toLowerCase() === asked).length
}
