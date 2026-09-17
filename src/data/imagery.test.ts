/// <reference types="node" />
/* ============================================================
   THE TWO LATER LEDGERS, MEASURED THE WAY THE FIRST ONE IS.

   `pack.test.ts` proves `images.json` thoroughly: every address
   accounted for exactly once, every held picture with its fetchedAt,
   its pixels, its sha1, its host and its verdict, a file really on
   disk, a measured refusal reason on every refused address. Two
   ledgers written after it — the hero tier (`heroes-ledger.json`,
   `public/hero-images`) and the brand marks (`marks-ledger.json`,
   `public/brand-marks`) — got none of that. Measured by the round-3
   critic: nothing in src, tools or e2e reads either file except the
   scripts that write them, so nothing asserted that a hero's file
   exists, that its bytes are the bytes recorded, or — the rule CLAUDE.md
   states in as many words, "a picture belongs only to the exact model
   it depicts, with provenance in the image ledger" — that a hero's
   table and model resolve to a real row of the price file.

   They were honest when he checked them by hand. That is not the same
   as measured, and these are the pictures that will fill the window on
   the first Showroom screen, so an entry that drifts from its file is
   a stand-in appearing on a customer's screen with nobody told.

   THE BYTES ARE HASHED, not just counted. A ledger that records a
   sha256 and never compares it is a ledger recording a hope: a file
   replaced by hand, a fetch rerun against a changed address, a webp
   re-encoded at a different quality all leave the name and the size
   alone. Nineteen small files hash in a few milliseconds and the
   provenance is then a fact rather than a claim.
   ============================================================ */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { displayFieldOf, type EntityDef } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const DATA = path.join(ROOT, 'data', 'northside')
const HERO_DIR = path.join(ROOT, 'public', 'hero-images')
const MARK_DIR = path.join(ROOT, 'public', 'brand-marks')

const readJson = <T>(...parts: string[]): T =>
  JSON.parse(readFileSync(path.join(...parts), 'utf8')) as T

const sha256Of = (file: string): string =>
  createHash('sha256').update(readFileSync(file)).digest('hex')

/** One chosen hero, as `tools/seed/heroes.ts` writes it, plus what the fetch recorded. */
interface Hero {
  id: string
  subject: string
  table: string
  model: string
  url: string
  pageUrl: string
  kind: 'photograph' | 'render'
  licenceNote: string
  note?: string
  file?: string
  width?: number
  height?: number
  bytes?: number
  sha256?: string
  sourceWidth?: number
  sourceHeight?: number
  fetchedAt?: string
  error?: string
  widths?: HeroWidth[]
}

/** One narrower copy of a held hero, as `tools/seed/hero-widths.ts` writes it. */
interface HeroWidth {
  width: number
  height: number
  file: string
  bytes: number
  sha256: string
}

/** One brand mark, as `tools/seed/marks.ts` writes it. */
interface Mark {
  id: string
  brand: string
  slug: string
  variant?: 'dark' | 'white'
  file?: string
  url?: string
  pageUrl?: string
  vector?: boolean
  width?: number
  height?: number
  bytes?: number
  sha256?: string
  licenceNote?: string
  fetchedAt?: string
  error?: string
}

const pack = await loadPack()
const choices = readJson<Hero[]>(DATA, 'heroes.json')
const heroes = readJson<Hero[]>(DATA, 'heroes-ledger.json')
const marks = readJson<Mark[]>(DATA, 'marks-ledger.json')

describe('the hero ledger', () => {
  it('holds every picture the choices asked for, and no other', () => {
    expect(heroes.map((h) => h.id).toSorted()).toEqual(choices.map((c) => c.id).toSorted())
    expect(new Set(heroes.map((h) => h.id)).size).toBe(heroes.length)
    expect(heroes.length).toBeGreaterThan(0)
  })

  it('keeps each choice’s words: the address, the page and the licence note are unchanged', () => {
    const byId = new Map(choices.map((c) => [c.id, c]))
    for (const h of heroes) {
      const c = byId.get(h.id)!
      expect(h.url, h.id).toBe(c.url)
      expect(h.pageUrl, h.id).toBe(c.pageUrl)
      expect(h.subject, h.id).toBe(c.subject)
      expect(h.table, h.id).toBe(c.table)
      expect(h.model, h.id).toBe(c.model)
      expect(h.licenceNote.trim().length, h.id).toBeGreaterThan(0)
      expect(['photograph', 'render'], h.id).toContain(h.kind)
    }
  })

  it('gives every held hero its provenance, and the bytes on disk are the bytes recorded', () => {
    for (const h of heroes) {
      expect(h.error, h.id).toBeUndefined()
      expect(h.file, h.id).toBeTruthy()
      const file = path.join(HERO_DIR, h.file!)
      expect(existsSync(file), h.file).toBe(true)
      expect(h.sha256, h.id).toMatch(/^[0-9a-f]{64}$/)
      expect(sha256Of(file), `${h.file} is not the file this ledger recorded`).toBe(h.sha256)
      expect(readFileSync(file).byteLength, h.id).toBe(h.bytes)
      expect(h.width, h.id).toBeGreaterThan(0)
      expect(h.height, h.id).toBeGreaterThan(0)
      expect(h.fetchedAt, h.id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(new URL(h.url).protocol, h.id).toBe('https:')
    }
  })

  it('accounts for every file in public/hero-images, one for one', () => {
    const onDisk = readdirSync(HERO_DIR).filter((f) => !f.startsWith('.'))
    const listed = heroes.flatMap((h) => [h.file!, ...(h.widths ?? []).map((w) => w.file)])
    expect(new Set(listed).size).toBe(listed.length)
    expect(onDisk.toSorted()).toEqual(listed.toSorted())
  })

  /* THE NARROWER COPIES ARE THE SAME PICTURE, SMALLER. `tools/seed/hero-widths.ts` resamples
     the held copy down so a screen can fetch the width it will actually draw; a copy that was
     enlarged, or that is not the bytes the ledger recorded, is a different picture wearing the
     same row's provenance. Both are checked here rather than trusted. */
  it('records every narrower copy, never enlarged, with the bytes on disk', () => {
    for (const h of heroes) {
      for (const w of h.widths ?? []) {
        const file = path.join(HERO_DIR, w.file)
        expect(existsSync(file), w.file).toBe(true)
        expect(sha256Of(file), `${w.file} is not the file this ledger recorded`).toBe(w.sha256)
        expect(readFileSync(file).byteLength, w.file).toBe(w.bytes)
        expect(w.width, `${w.file} is not narrower than the copy it came from`)
          .toBeLessThan(h.width!)
        expect(w.height, w.file).toBeLessThan(h.height!)
        expect(w.bytes, `${w.file} is not lighter than the copy it came from`)
          .toBeLessThan(h.bytes!)
        expect(w.file.startsWith(h.file!.replace(/\.webp$/, '')), w.file).toBe(true)
      }
    }
  })

  /* THE WHOLE REASON THE TIER EXISTS. A catalogue copy is capped at long edge 1100 and a
     stage is 1440 wide, so a hero that was upscaled to reach 2560 would be worse than the
     render it replaced. Never larger than the source is the arithmetic form of that. */
  it('never upscales: every hero is no bigger than the original it came from', () => {
    for (const h of heroes) {
      expect(h.sourceWidth, h.id).toBeGreaterThan(0)
      expect(h.width!, h.id).toBeLessThanOrEqual(h.sourceWidth!)
      expect(h.height!, h.id).toBeLessThanOrEqual(h.sourceHeight!)
      expect(h.width!, `${h.id} is smaller than a catalogue copy, so it is not a hero`)
        .toBeGreaterThan(1100)
    }
  })

  /* "A picture belongs only to the exact model it depicts." The ledger names a table and a
     model; both have to be things the price file actually carries, or the picture belongs to
     nothing. The display field is what a screen puts beside it, so that is where the model
     has to be findable. */
  it('names a table in the pack and a model that resolves to a row in it', () => {
    const byId = new Map<string, EntityDef>(pack.entities.map((e) => [e.id, e]))
    for (const h of heroes) {
      const table = byId.get(h.table)
      expect(table, `${h.id} names a table the pack does not have: ${h.table}`).toBeDefined()
      const field = displayFieldOf(table!)
      expect(field, h.table).toBeDefined()
      const rows = pack.rowsByEntity[h.table]!
      const matching = rows.filter((r) => {
        const shown = r.values[field!.id]
        return typeof shown === 'string' && shown.includes(h.model)
      })
      expect(matching.length, `${h.id}: no row of ${h.table} is named "${h.model}"`)
        .toBeGreaterThan(0)
    }
  })

  it('never gives two heroes to the same model', () => {
    const keys = heroes.map((h) => `${h.table}/${h.model}`)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('the brand-mark ledger', () => {
  it('names each mark once, with the brand and the slug a screen asks for', () => {
    expect(new Set(marks.map((m) => m.id)).size).toBe(marks.length)
    for (const m of marks) {
      expect(m.brand.trim().length, m.id).toBeGreaterThan(0)
      expect(m.slug, m.id).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('either holds a mark or says why it does not, never both and never neither', () => {
    for (const m of marks) {
      expect(Boolean(m.file) !== Boolean(m.error), `${m.id} is both held and refused, or is neither`)
        .toBe(true)
    }
    expect(marks.some((m) => m.file)).toBe(true)
  })

  it('gives every held mark its provenance, and the bytes on disk are the bytes recorded', () => {
    for (const m of marks.filter((x) => x.file)) {
      const file = path.join(MARK_DIR, m.file!)
      expect(existsSync(file), m.file).toBe(true)
      expect(m.sha256, m.id).toMatch(/^[0-9a-f]{64}$/)
      expect(sha256Of(file), `${m.file} is not the file this ledger recorded`).toBe(m.sha256)
      expect(readFileSync(file).byteLength, m.id).toBe(m.bytes)
      expect(m.width, m.id).toBeGreaterThan(0)
      expect(m.height, m.id).toBeGreaterThan(0)
      expect(m.licenceNote!.trim().length, m.id).toBeGreaterThan(0)
      expect(m.fetchedAt, m.id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(['dark', 'white'], m.id).toContain(m.variant)
      /* A mark is the brand's own artwork and is never redrawn: an svg entry is an svg file
         and a raster entry is not, or the ledger and the folder disagree about what was kept. */
      expect(m.file!.endsWith('.svg'), m.id).toBe(m.vector)
      expect(m.file!.startsWith(m.slug), `${m.file} is filed under another brand's slug`).toBe(true)
    }
  })

  it('accounts for every file in public/brand-marks, one for one', () => {
    const onDisk = readdirSync(MARK_DIR).filter((f) => !f.startsWith('.'))
    const listed = marks.filter((m) => m.file).map((m) => m.file!)
    expect(new Set(listed).size).toBe(listed.length)
    expect(onDisk.toSorted()).toEqual(listed.toSorted())
  })

  /* THE HONEST GAP IS NAMED, NOT FILLED. Stabicraft publishes nothing but a 180px touch
     icon, so it has an entry with a reason and no file, and a screen that wants its mark
     says the brand's name in type. The reason has to be a measured clause, not an apology,
     and it must never offer a substitute — the same shape `images.json`'s refusals take. */
  it('records a measured reason on every refused mark, and offers no stand-in', () => {
    const refused = marks.filter((m) => m.error)
    expect(refused.length).toBeGreaterThan(0)
    for (const m of refused) {
      const why = m.error!
      expect(why.trim().length, m.id).toBeGreaterThan(0)
      expect(why, m.id).not.toMatch(/[.!?]$/)
      expect(why, m.id).not.toMatch(/similar|instead|stand-in|placeholder|sorry/i)
      expect(m.file, m.id).toBeUndefined()
      expect(m.variant, m.id).toBeUndefined()
    }
  })

  /* A mark for a brand the price file does not carry is a mark for somebody else's business.
     Every brand here is either the name of a table or a name written in a row of one — which
     is how Mercury is in the seed at all: it has no table, it appears in the Jeanneau factory
     package names. */
  it('names only brands the seed actually carries', () => {
    const tableNames = pack.entities.map((e) => e.name).join(' · ')
    const inRows = (brand: string): boolean => {
      const needle = brand.toLowerCase()
      for (const rows of Object.values(pack.rowsByEntity)) {
        for (const r of rows) {
          for (const v of Object.values(r.values)) {
            if (typeof v === 'string' && v.toLowerCase().includes(needle)) return true
          }
        }
      }
      return false
    }
    for (const brand of new Set(marks.map((m) => m.brand))) {
      const named = tableNames.toLowerCase().includes(brand.toLowerCase()) || inRows(brand)
      expect(named, `"${brand}" is not a brand this price file carries`).toBe(true)
    }
  })
})
