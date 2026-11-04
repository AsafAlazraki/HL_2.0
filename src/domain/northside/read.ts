/* ============================================================
   NORTHSIDE'S DETAILS, READ BACK DEFENSIVELY — out of this computer's
   store, or out of a backup somebody chose. Whatever is not the shape is
   left out rather than repaired; a value that cannot mean anything is
   not kept. One reader, so the store and the backup cannot disagree
   about what survives.
   ============================================================ */

import type {
  DepositRule,
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
import { COLOUR_CHOICES } from '@/domain/catalogue/table/colourKey'

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

/** A deposit rule: a share from 1 to 100, or a fixed figure over $0 (src/domain/northside/deposit.ts). */
export function depositRule(raw: unknown): DepositRule | undefined {
  if (!isBag(raw)) return undefined
  const share = num(raw.share, 1, 100)
  if (share !== undefined && raw.amount === undefined) return { share }
  const amount = num(raw.amount, 0.01, 10_000_000)
  if (amount !== undefined && raw.share === undefined) return { amount }
  return undefined
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
  const rule = depositRule(raw.depositRule)
  if (rule) out.depositRule = rule
  const l = look(raw.look)
  if (l) out.look = l
  const h = home(raw.home)
  if (h) out.home = h
  const c = colours(raw.colours)
  if (c) out.colours = c
  const s = words(raw.suppliers, 80, 40)
  if (s) out.suppliers = s
  const a = words(raw.aisles, 400, 40)
  if (a) out.aisles = a
  /* what Northside left alone on Review: a finding's key and the stamp of the press (2026-11-04) */
  const left = words(raw.leftAlone, 400, 200)
  if (left) out.leftAlone = left
  return out
}

/** A small map of Northside's own words (the chandlery's supplier names and aisle placings): each
 *  key and word a non-empty string within its bound; anything else is left out. */
function words(raw: unknown, keyMax: number, wordMax: number): Record<string, string> | undefined {
  if (!isBag(raw)) return undefined
  const out: Record<string, string> = {}
  for (const [key, v] of Object.entries(raw)) {
    const word = text(v)
    if (key.trim() !== '' && key.length <= keyMax && word && word.length <= wordMax) out[key] = word
  }
  return Object.keys(out).length > 0 ? out : undefined
}

/** The colour key's letters Northside named: a capital letter or three, each a colour it can draw. */
function colours(raw: unknown): Record<string, string> | undefined {
  if (!isBag(raw)) return undefined
  const out: Record<string, string> = {}
  for (const [token, v] of Object.entries(raw)) {
    const name = text(v)
    if (/^[A-Z]{1,3}$/.test(token) && name && COLOUR_CHOICES.includes(name)) out[token] = name
  }
  return Object.keys(out).length > 0 ? out : undefined
}
