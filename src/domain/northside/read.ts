/* ============================================================
   NORTHSIDE'S DETAILS, READ BACK DEFENSIVELY — out of this computer's
   store, or out of a backup somebody chose. Whatever is not the shape is
   left out rather than repaired; a value that cannot mean anything is
   not kept. One reader, so the store and the backup cannot disagree
   about what survives.
   ============================================================ */

import type {
  HomeSection,
  OrgGround,
  OrgHome,
  OrgLook,
  OrgMarkFile,
  OrgPerson,
  OrgProfile,
} from '@/domain/model'
import { parseHex } from './colour'
import { HOME_SECTIONS } from './home'
import { CORNERS, MOTIONS, SHADOWS, SPACINGS } from './look'

type Bag = Record<string, unknown>
const isBag = (v: unknown): v is Bag => typeof v === 'object' && v !== null && !Array.isArray(v)
const text = (v: unknown): string | undefined => {
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  return t === '' ? undefined : t
}
const num = (v: unknown, lo: number, hi: number): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi ? v : undefined

function person(raw: unknown): OrgPerson | undefined {
  if (!isBag(raw)) return undefined
  const id = text(raw.id)
  const name = text(raw.name)
  if (!id || !name) return undefined
  const out: OrgPerson = { id, name }
  for (const k of ['title', 'phone', 'email'] as const) {
    const v = text(raw[k])
    if (v) out[k] = v
  }
  if (raw.mayChange === false) out.mayChange = false
  return out
}

function markFile(raw: unknown): OrgMarkFile | undefined {
  if (!isBag(raw)) return undefined
  const src = text(raw.src)
  const width = num(raw.width, 1, 20_000)
  const height = num(raw.height, 1, 20_000)
  if (!src || !src.startsWith('data:image/') || !width || !height) return undefined
  if (raw.ink !== 'dark' && raw.ink !== 'light') return undefined
  return {
    src,
    width,
    height,
    ink: raw.ink,
    name: text(raw.name) ?? 'the file',
    keptAt: text(raw.keptAt) ?? '',
  }
}

function ground(raw: unknown): OrgGround | undefined {
  if (!isBag(raw)) return undefined
  const picture = text(raw.picture)
  const veil = num(raw.veil, 0, 1)
  return picture && veil !== undefined ? { picture, veil } : undefined
}

function look(raw: unknown): OrgLook | undefined {
  if (!isBag(raw)) return undefined
  const out: OrgLook = {}
  const brand = typeof raw.brand === 'string' ? parseHex(raw.brand) : null
  if (brand) out.brand = brand
  if (CORNERS.some((c) => c.value === raw.corners)) out.corners = raw.corners as OrgLook['corners']
  if (SHADOWS.some((c) => c.value === raw.shadow)) out.shadow = raw.shadow as OrgLook['shadow']
  if (SPACINGS.some((c) => c.value === raw.spacing)) out.spacing = raw.spacing as OrgLook['spacing']
  if (MOTIONS.some((c) => c.value === raw.motion)) out.motion = raw.motion as OrgLook['motion']
  const door = ground(raw.door)
  if (door) out.door = door
  const hero = ground(raw.hero)
  if (hero) out.hero = hero
  return Object.keys(out).length === 0 ? undefined : out
}

const sections = (raw: unknown): HomeSection[] =>
  Array.isArray(raw)
    ? raw.filter((s): s is HomeSection => (HOME_SECTIONS as readonly unknown[]).includes(s))
    : []

function home(raw: unknown): OrgHome | undefined {
  if (!isBag(raw)) return undefined
  const out: OrgHome = {}
  const order = sections(raw.order)
  if (order.length > 0) out.order = order
  const hidden = sections(raw.hidden)
  if (hidden.length > 0) out.hidden = hidden
  const first = Array.isArray(raw.first)
    ? raw.first.filter((s): s is string => typeof s === 'string' && s.trim() !== '')
    : []
  if (first.length > 0) out.first = first
  return Object.keys(out).length === 0 ? undefined : out
}

/** Northside's profile, read back. Undefined where there is no name, which is no profile. */
export function readOrg(raw: unknown, stamp = ''): OrgProfile | undefined {
  if (!isBag(raw)) return undefined
  const name = text(raw.name)
  if (!name || raw.industry !== 'marine') return undefined
  const out: OrgProfile = { name, industry: 'marine', createdAt: text(raw.createdAt) ?? stamp }
  const slug = text(raw.slug)
  if (slug) out.slug = slug
  for (const k of [
    'quoteTerms',
    'legalName',
    'abn',
    'address',
    'phone',
    'email',
    'website',
    'deposit',
  ] as const) {
    const v = text(raw[k])
    if (v) out[k] = v
  }
  const gst = num(raw.gstRate, 0, 100)
  if (gst !== undefined) out.gstRate = gst
  const days = num(raw.validDays, 1, 365)
  if (days !== undefined && Number.isInteger(days)) out.validDays = days
  const people = Array.isArray(raw.people)
    ? raw.people.map(person).filter((p): p is OrgPerson => p !== undefined)
    : []
  if (people.length > 0) out.people = people
  if (isBag(raw.marks)) {
    const paper = markFile(raw.marks.paper)
    const water = markFile(raw.marks.water)
    if (paper || water) out.marks = { ...(paper ? { paper } : {}), ...(water ? { water } : {}) }
  }
  const l = look(raw.look)
  if (l) out.look = l
  const h = home(raw.home)
  if (h) out.home = h
  return out
}
