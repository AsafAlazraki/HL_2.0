/* Reads every live part through the app's own shelf, aisles, namer and pricer, and writes the
   figures the catalogue boards draw. Run through vitest so the app's modules resolve as built. */
import { test } from 'vitest'
import { writeFileSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { loadPack } from '@/test/fixtures/pack'
import { shelfOf, pricerFor, hasPicture } from '@/screens/catalogue/shelf'
import { AISLES, UNSORTED_AISLE, aislesOf } from '@/domain/catalogue/aisles'

const OUT = process.env.FACTS_OUT as string

test('extract', async () => {
  const pack = await loadPack()
  const ctx = pack.ctx
  const shelf = shelfOf(ctx)
  const cash = pricerFor(ctx, 'cash')
  const fitted = pricerFor(ctx, 'fitted')
  const pics = JSON.parse(readFileSync(path.join(pack.dataDir, 'pictures.json'), 'utf8'))
    .pictures as {
    table: string
    exactRows?: string[]
    file: string
    host: string
    width: number
    height: number
    subject: string
  }[]
  const picOf = new Map<string, { file: string; host: string; w: number; h: number }>()
  for (const p of pics)
    if (p.table === 'parts')
      for (const r of p.exactRows ?? [])
        if (!picOf.has(r)) picOf.set(r, { file: p.file, host: p.host, w: p.width, h: p.height })
  const parts = shelf.map((s) => {
    const c = cash(s)
    const f = fitted(s)
    const v = s.row.values
    return {
      id: s.id,
      heading: s.heading,
      aisle: s.aisle,
      maker: s.maker,
      product: s.product,
      code:
        typeof v['parts.e'] === 'string'
          ? v['parts.e']
          : v['parts.e'] == null
            ? ''
            : String(v['parts.e']),
      op: v['parts.aa'] ?? '',
      install: v['parts.n'] ?? '',
      name: c?.name ?? s.product,
      supply: c?.amount ?? null,
      fittedAt: f?.amount ?? null,
      rawL: v['parts.l'] ?? null,
      rawY: v['parts.y'] ?? null,
      pictured: hasPicture(s.id),
      pic: picOf.get(s.id) ?? null,
    }
  })
  const aisles = aislesOf(shelf, hasPicture).map((a) => ({
    id: a.aisle.id,
    name: a.aisle.name,
    holds: a.aisle.holds,
    parts: a.parts,
    pictured: a.pictured,
    headings: a.headings,
  }))
  /* the pairing lists: P/D, which parts pair with which boat */
  const pd = pack.manifest.tables.filter((t) => /_pd$/.test(t.key))
  const pairings: { list: string; boat: string; part: string }[] = []
  for (const t of pd)
    for (const r of pack.rowsByEntity[t.id] ?? [])
      pairings.push({
        list: t.key,
        boat: String(r.values[`${t.key}.boat`]),
        part: String(r.values[`${t.key}.part`]),
      })
  /* boats, by id, with their label as the row carries it */
  const boats: Record<string, string> = {}
  for (const t of pack.manifest.tables.filter((t) => t.kind === 'boat'))
    for (const r of pack.rowsByEntity[t.id] ?? [])
      boats[r.id] = JSON.stringify(r.values).slice(0, 300)
  writeFileSync(
    OUT,
    JSON.stringify({
      parts,
      aisles,
      aisleOrder: [...AISLES.map((a) => a.id), UNSORTED_AISLE.id],
      pdLists: pd.map((t) => t.key),
      pairings,
      boats,
    }),
  )
}, 120000)
