/// <reference types="node" />
/* ============================================================
   THE LATER LEDGERS, MEASURED THE WAY THE FIRST ONE IS.

   `pack.test.ts` proves `images.json` thoroughly: every address
   accounted for exactly once, every held picture with its fetchedAt,
   its pixels, its sha1, its host and its verdict, a file really on
   disk, a measured refusal reason on every refused address. The two
   ledgers written after it are held to the same here:

     · `pictures.json` — the pictures attached to a MODEL (the catalogue
       tier in `public/seed-images`, the hero tier in
       `public/hero-images`), each because a person marked it as that
       exact item on a contact sheet, and the findings a person wrote on
       rows' own addresses. Since 2026-10-20 it is the one place a hero
       is recorded: the old `heroes-ledger.json` was migrated into it.
     · `marks-ledger.json` — the makers' marks and the dealership's own.

   THE BYTES ARE HASHED, not just counted. A ledger that records a
   sha256 and never compares it is a ledger recording a hope: a file
   replaced by hand, a fetch rerun against a changed address, a webp
   re-encoded at a different quality all leave the name and the size
   alone. A hundred and eighty small files hash in well under a second
   and the provenance is then a fact rather than a claim.

   AND THE JUDGES' WORD IS FINAL: every picture a verdict under
   `docs/research/imagery/proposals/` accepted is held, unless its
   licence bars it, and no picture a verdict rejected is attached to the
   model it was rejected for.
   ============================================================ */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { pictureBook, type PictureEntry, type PicturesFile } from '@/domain/model/pictures'
import { fitItemsOf } from '@/domain/catalogue/fitItems'
import { fleetOf } from '@/screens/picker/fleet'
import { loadPack } from '@/test/fixtures/pack'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const DATA = path.join(ROOT, 'data', 'northside')
const HERO_DIR = path.join(ROOT, 'public', 'hero-images')
const SEED_DIR = path.join(ROOT, 'public', 'seed-images')
const MARK_DIR = path.join(ROOT, 'public', 'brand-marks')
const PROPOSALS = path.join(ROOT, 'docs', 'research', 'imagery', 'proposals')

const readJson = <T>(...parts: string[]): T =>
  JSON.parse(readFileSync(path.join(...parts), 'utf8')) as T

const sha256Of = (file: string): string =>
  createHash('sha256').update(readFileSync(file)).digest('hex')

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
  /** 'organisation' for the dealership's own mark; absent for a maker's */
  role?: 'organisation'
  /** measured off the pixels: a dark-ink mark prints on white paper, a white-ink one cannot */
  printsOnWhite?: boolean
  verdicts?: string
}

/** One verdict a person wrote on a contact sheet. */
interface Verdict {
  n: number
  decision: 'accept' | 'reject'
  kind?: string
  table?: string
  model?: string
  models?: string[]
  url: string
  licence?: string
}

/** The proposal it judged. */
interface Proposal {
  n: number
  table: string
  model: string
  models?: string[]
  kind: string
}

const pack = await loadPack()
const doc = readJson<PicturesFile>(DATA, 'pictures.json')
const entries = doc.pictures
const heroes = entries.filter((e) => e.tier === 'hero')
const catalogue = entries.filter((e) => e.tier === 'catalogue')
const marks = readJson<Mark[]>(DATA, 'marks-ledger.json')
const images = readJson<{ images: { address: string }[] }>(DATA, 'images.json').images

/** Every verdict, joined to the proposal it judged. */
const verdicts = readdirSync(PROPOSALS)
  .filter((f) => f.endsWith('.verdicts.json'))
  .flatMap((f) => {
    const v = readJson<{ verdicts: Verdict[] }>(PROPOSALS, f).verdicts
    const p = readJson<{ proposals: Proposal[] }>(PROPOSALS, f.replace('.verdicts', '')).proposals
    return v.map((x) => {
      const q = p.find((y) => y.n === x.n)!
      return {
        ...x,
        ref: `${f}#${x.n}`,
        kind: x.kind ?? q.kind,
        table: x.table ?? q.table,
        models: x.models ?? q.models ?? [x.model ?? q.model],
      }
    })
  })

/** The file's own models, as the picker collapses them: `table::name` → their row ids. */
const fileModels = new Map<string, string[]>()
{
  const tables = Object.fromEntries(pack.entities.map((e) => [e.id, e]))
  for (const kind of ['boat', 'motor', 'trailer']) {
    for (const brand of fleetOf(tables, pack.rowsByEntity, kind).brands) {
      for (const m of brand.models) {
        fileModels.set(
          `${m.tableId}::${m.name}`,
          m.variants.map((v) => v.rowId),
        )
      }
    }
  }
  /* a part, a package, a rigging kit or a consumable is its own name in its register */
  for (const m of fitItemsOf(tables, pack.rowsByEntity)) {
    fileModels.set(
      `${m.tableId}::${m.name}`,
      m.variants.map((v) => v.rowId),
    )
  }
}

const dirOf = (e: PictureEntry): string => (e.tier === 'hero' ? HERO_DIR : SEED_DIR)

describe('the pictures of models (pictures.json)', () => {
  it('names each picture once, and holds heroes and catalogue copies both', () => {
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length)
    expect(heroes.length).toBeGreaterThan(0)
    expect(catalogue.length).toBeGreaterThan(0)
  })

  it('gives every picture a held file that exists, and the bytes on disk are the bytes recorded', () => {
    for (const e of entries) {
      const file = path.join(dirOf(e), e.file)
      expect(existsSync(file), `${e.id}: ${e.file} is not on disk`).toBe(true)
      expect(e.sha256, e.id).toMatch(/^[0-9a-f]{64}$/)
      expect(sha256Of(file), `${e.file} is not the file this ledger recorded`).toBe(e.sha256)
      expect(readFileSync(file).byteLength, e.id).toBe(e.bytes)
      expect(e.file.endsWith('.webp'), e.id).toBe(true)
    }
  })

  /* THE PROVENANCE THE RULES NAME: the address, the page it was found on, the host, the date
     fetched, the source size, the held size, sha256 (above), the licence note, the item it
     depicts, its kind, and who verified it and how. */
  it('gives every picture its full provenance', () => {
    for (const e of entries) {
      expect(new URL(e.url).protocol, e.id).toBe('https:')
      expect(e.host, e.id).toBe(new URL(e.url).host)
      if (e.rowAddress) expect(e.pageUrl, e.id).toBe('')
      else
        expect(new URL(e.pageUrl).protocol, `${e.id} names no page it was found on`).toBe(
          'https:',
        )
      expect(e.fetchedAt, e.id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(e.sourceWidth, e.id).toBeGreaterThan(0)
      expect(e.sourceHeight, e.id).toBeGreaterThan(0)
      expect(e.width, e.id).toBeGreaterThan(0)
      expect(e.height, e.id).toBeGreaterThan(0)
      expect(e.licenceNote.trim().length, e.id).toBeGreaterThan(0)
      expect(e.depicts.trim().length, `${e.id} says nothing of what it depicts`).toBeGreaterThan(0)
      expect(e.subject.trim().length, e.id).toBeGreaterThan(0)
      expect(['scene', 'studio'], e.id).toContain(e.verdict)
      expect(['model', 'hull', 'series'], e.id).toContain(e.scope)
      expect(e.verification.trim().length, e.id).toBeGreaterThan(0)
      expect(e.verifiedBy.trim().length, `${e.id} says nobody verified it`).toBeGreaterThan(0)
      expect(typeof e.person, e.id).toBe('boolean')
      /* a picture no person marked says what did choose it */
      if (!e.person) expect(e.verifiedBy, e.id).toMatch(/^automatic: /)
      expect(e.verdicts.trim().length, e.id).toBeGreaterThan(0)
    }
  })

  it('never holds a copy larger than its source, nor larger than its tier', () => {
    for (const e of entries) {
      expect(e.width, `${e.id} is wider than its source`).toBeLessThanOrEqual(e.sourceWidth)
      expect(e.height, `${e.id} is taller than its source`).toBeLessThanOrEqual(e.sourceHeight)
      const edge = Math.max(e.width, e.height)
      if (e.tier === 'catalogue') {
        expect(edge, e.id).toBeLessThanOrEqual(1100)
      } else {
        expect(edge, e.id).toBeLessThanOrEqual(2560)
        expect(e.width, `${e.id} is no wider than a catalogue copy, so it is not a hero`)
          .toBeGreaterThan(1100)
      }
    }
  })

  /* THE NARROWER COPIES ARE THE SAME PICTURE, SMALLER (tools/seed/hero-widths.ts). */
  it('records every narrower copy, never enlarged, with the bytes on disk', () => {
    for (const h of heroes) {
      for (const w of h.widths ?? []) {
        const file = path.join(HERO_DIR, w.file)
        expect(existsSync(file), w.file).toBe(true)
        expect(sha256Of(file), `${w.file} is not the file this ledger recorded`).toBe(w.sha256)
        expect(readFileSync(file).byteLength, w.file).toBe(w.bytes)
        expect(w.width, w.file).toBeLessThan(h.width)
        expect(w.height, w.file).toBeLessThan(h.height)
        expect(w.bytes, w.file).toBeLessThan(h.bytes)
        expect(w.file.startsWith(h.file.replace(/\.webp$/, '')), w.file).toBe(true)
      }
    }
  })

  it('accounts for every file in public/hero-images, one for one — one place records a hero', () => {
    const onDisk = readdirSync(HERO_DIR).filter((f) => !f.startsWith('.'))
    const listed = heroes.flatMap((h) => [h.file, ...(h.widths ?? []).map((w) => w.file)])
    expect(new Set(listed).size).toBe(listed.length)
    expect(onDisk.toSorted()).toEqual(listed.toSorted())
    expect(existsSync(path.join(DATA, 'heroes-ledger.json'))).toBe(false)
    expect(existsSync(path.join(DATA, 'heroes.json'))).toBe(false)
  })

  /* "A picture belongs only to the exact model it depicts." Each entry names models by the
     file's own names, and the rows it may be drawn for are EXACTLY those models' rows. */
  it('attaches every picture to models the file carries, and to exactly their rows', () => {
    for (const e of entries) {
      expect(Object.keys(e.rows).toSorted(), e.id).toEqual([...e.models].toSorted())
      expect(e.models.length, e.id).toBeGreaterThan(0)
      if (e.scope === 'model') {
        expect(e.models, `${e.id} is a model picture of two models`).toHaveLength(1)
      }
      for (const model of e.models) {
        const rows = fileModels.get(`${e.table}::${model}`)
        expect(rows, `${e.id}: ${e.table} carries no model "${model}"`).toBeDefined()
        expect(e.rows[model], `${e.id}: the rows of ${model}`).toEqual(rows)
      }
      const all = Object.values(e.rows).flat()
      for (const row of e.exactRows) expect(all, `${e.id}: ${row}`).toContain(row)
      /* a hull's picture cannot tell its models apart, so it is exact for none of them */
      if (e.scope !== 'model') expect(e.exactRows, e.id).toEqual([])
    }
  })

  it('never gives two pictures of one tier to the same model', () => {
    for (const tier of ['hero', 'catalogue'] as const) {
      const keys = entries
        .filter((e) => e.tier === tier)
        .flatMap((e) => e.models.map((m) => `${e.table}::${m}`))
      expect(new Set(keys).size, tier).toBe(keys.length)
    }
  })

  /* THE JUDGES' WORD IS FINAL. A picture a verdict rejected is attached to none of the models
     it was rejected for, and the reader never draws a row's own address a verdict rejected for
     that row; a picture accepted but barred by its licence is not held at all. */
  it('attaches no picture the verdicts rejected, and holds every one they accepted', () => {
    expect(verdicts.length).toBeGreaterThan(0)
    for (const v of verdicts) {
      if (v.kind === 'mark') continue
      const tier = v.kind === 'hero' ? 'hero' : 'catalogue'
      const attached = entries.filter(
        (e) =>
          e.tier === tier &&
          e.url === v.url &&
          e.table === v.table &&
          e.models.some((m) => v.models.includes(m)),
      )
      if (v.decision === 'reject' || v.licence) {
        expect(attached, `${v.ref} was not accepted, or its licence bars it`).toEqual([])
      } else {
        expect(attached, `${v.ref} was accepted and is not held`).toHaveLength(1)
      }
    }
    const book = pictureBook({ images: { images }, pictures: doc }, '/')
    for (const v of verdicts.filter((x) => x.decision === 'reject' && x.kind === 'catalogue')) {
      for (const model of v.models) {
        for (const row of fileModels.get(`${v.table}::${model}`) ?? []) {
          expect(book.rowCopy({ table: v.table, row, address: v.url }), `${v.ref} on ${row}`)
            .toBeNull()
          const line = book.forLine({ table: v.table, row })
          expect(line.held ? line.picture.address : '', `${v.ref} on a line of ${row}`).not.toBe(
            v.url,
          )
        }
      }
    }
  })

  it('rules only on addresses the price file itself carries, for rows that carry them', () => {
    const known = new Set(images.map((i) => i.address))
    for (const f of doc.findings) {
      expect(known.has(f.address), `${f.address} is not one of the file's own addresses`).toBe(true)
      expect(f.rule.trim().length, f.address).toBeGreaterThan(0)
      expect(f.verification.trim().length, f.address).toBeGreaterThan(0)
      expect(['refuse', 'note'], f.address).toContain(f.decision)
      expect(pack.rowsByEntity[f.table], f.table).toBeDefined()
      for (const row of f.rows) {
        const r = pack.rowsByEntity[f.table]!.find((x) => x.id === row)
        expect(r, `${f.table} has no row ${row}`).toBeDefined()
        expect(JSON.stringify(r!.values), `${row} does not carry ${f.address}`).toContain(
          f.address,
        )
      }
    }
    /* the logo sheet the REDCO SP560 trailer row points at is refused for every row */
    expect(
      doc.findings.some(
        (f) =>
          /redco-tinka-logos-01\.png$/.test(f.address) &&
          f.decision === 'refuse' &&
          f.rows.length === 0,
      ),
    ).toBe(true)
  })

  /* EVERY BYTE SHIPS TO EVERY REVIEWER: the pictures of models stay inside the round's budget */
  it('keeps the pictures of models inside 90 MB', () => {
    const bytes = entries.reduce(
      (n, e) => n + e.bytes + (e.widths ?? []).reduce((m, w) => m + w.bytes, 0),
      0,
    )
    expect(bytes).toBeLessThan(90 * 1024 * 1024)
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

  /* THE HONEST GAP IS NAMED, NOT FILLED. A brand with no mark has an entry with a reason and no
     file, and a screen that wants its mark says the brand's name in type. The reason has to be
     a measured clause, not an apology, and it must never offer a substitute — the same shape
     `images.json`'s refusals take. (Stabicraft was the one such brand until 2026-10-20, when a
     person accepted its full mark off Northside's own site; the shape still holds for the next.) */
  it('records a measured reason on every refused mark, and offers no stand-in', () => {
    for (const m of marks.filter((x) => x.error)) {
      const why = m.error!
      expect(why.trim().length, m.id).toBeGreaterThan(0)
      expect(why, m.id).not.toMatch(/[.!?]$/)
      expect(why, m.id).not.toMatch(/similar|instead|stand-in|placeholder|sorry/i)
      expect(m.file, m.id).toBeUndefined()
      expect(m.variant, m.id).toBeUndefined()
    }
  })

  /* THE LETTERHEAD PRINTS ON WHITE PAPER. Northside's own mark is held in dark ink for it, and
     a white-ink mark — the dealership's water copy, Mercury's, Stabicraft's — says it cannot. */
  it('holds the dealership’s own mark in an ink white paper can carry, and says which cannot', () => {
    const own = marks.filter((m) => m.role === 'organisation' && m.file)
    expect(own.some((m) => m.variant === 'dark' && m.printsOnWhite === true)).toBe(true)
    for (const m of marks.filter((x) => x.file && x.printsOnWhite !== undefined)) {
      expect(m.printsOnWhite, m.id).toBe(m.variant === 'dark')
    }
    const stabicraft = marks.find((m) => m.brand === 'Stabicraft' && m.file)
    expect(stabicraft?.variant).toBe('white')
    expect(stabicraft?.verdicts).toMatch(/northside\.verdicts\.json#3$/)
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
    /* The dealership's own mark is not a brand the file sells: it is the file's owner, and the
       pack's own name says so. */
    for (const m of marks.filter((x) => x.role === 'organisation')) {
      expect(m.brand, m.id).toBe(pack.manifest.name)
    }
    for (const brand of new Set(
      marks.filter((m) => m.role !== 'organisation').map((m) => m.brand),
    )) {
      const named = tableNames.toLowerCase().includes(brand.toLowerCase()) || inRows(brand)
      expect(named, `"${brand}" is not a brand this price file carries`).toBe(true)
    }
  })
})
