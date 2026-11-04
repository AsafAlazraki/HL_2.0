/* Reads the places the boards draw through the app's own readers, and writes every figure the
   three boards print: the fleet (the picker's own models, from-prices and series), the fitment
   reading (each model's motors, trailers and lists, as Fitment and the build offer them), the
   livery (mark, ground, partners) and the picture book. Run through vitest so the app's modules
   resolve as built. Nothing is summed here that a reader does not already count. */
import { test } from 'vitest'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { loadPack } from '@/test/fixtures/pack'
import { pictureBook, type Picture } from '@/domain/model/pictures'
import { isDiscontinued, readCell, rowLabel, type EntityDef, type RowData } from '@/domain/model'
import { fleetOf } from '@/screens/picker/fleet'
import { readBoatFit, imageAddressOf, offeredIn } from '@/domain/fitment/boat'
import { readPlaces, readPlace } from '@/screens/places/read'
import { priceLevelsFor } from '@/domain/quote/pricing'

const OUT = process.env.FACTS_OUT as string
const BASE = '../../../../../public/'

test('extract', async () => {
  const pack = await loadPack()
  const ctx = pack.ctx
  const raw = (f: string) => JSON.parse(readFileSync(path.join(pack.dataDir, f), 'utf8'))
  const book = pictureBook(
    { images: raw('images.json'), pictures: raw('pictures.json'), marks: raw('marks-ledger.json') },
    BASE,
  )
  const tables = ctx.entities
  const rows = ctx.rowsByEntity
  const world = { tables, rows, modules: ctx.modules, priceLevels: ctx.priceLevels }
  const read = readPlaces(world, book)

  const pic = (p: Picture | null) =>
    p
      ? {
          src: p.src,
          w: p.width,
          h: p.height,
          subject: p.subject,
          tier: p.tier,
          host: (() => {
            try {
              return new URL(p.address).host
            } catch {
              return ''
            }
          })(),
          onDisk: existsSync(path.resolve(pack.dataDir, '../../public', p.src.replace(BASE, ''))),
        }
      : null

  const cell = (e: EntityDef, r: RowData, name: string) => {
    const f = e.fields.find((x) => x.name.trim().toLowerCase() === name.toLowerCase())
    const v = f ? readCell(r, f.id) : null
    return v === undefined ? null : v
  }

  const placeOut = (address: string) => {
    const p = readPlace(world, read, address, [], book)
    if (!p) return null
    return {
      address,
      name: p.card.name,
      kind: p.card.kind,
      ground: p.card.ground,
      mark: p.card.mark,
      nameShown: p.card.nameShown,
      hero: p.card.hero.shown
        ? { ...pic((p.card.hero as unknown as { picture: Picture }).picture) }
        : null,
      figure: p.card.figure,
      photographs: p.card.photographs,
      range: p.range.map((r) => ({
        name: r.name,
        lines: r.lines,
        models: r.models,
        pictured: r.pictured,
      })),
      lines: p.lines.slice(0, 40),
      linesCount: p.lines.length,
      noun: p.noun,
      partners: p.partners.map((g) => ({
        name: g.name,
        kind: g.kind,
        fits: g.fits,
        address: g.address,
        mark: g.mark,
        ground: g.ground,
      })),
      prices: p.prices,
      pricesHref: p.pricesHref,
      edited: p.edited,
      quotable: p.quotable,
      quoteWord: p.quoteWord,
      tableIds: p.card.tableIds,
    }
  }

  const fleet = fleetOf(tables, rows)
  const brandOut = (id: string) => {
    const b = fleet.brands.find((x) => x.id === id)!
    const e = tables[id]
    const levels = priceLevelsFor(e)
    const brandRows = rows[id] ?? []
    const models = b.models.map((m) => {
      const anchor = brandRows.find((r) => r.id === m.key)!
      const all = brandRows.filter((r) => m.variants.some((v) => v.rowId === r.id))
      /* a column across the model's versions: numbers as a span, words (the file writes "3 + 1"
         people and "150 HP") as the distinct values it writes; n of `of` versions carry it */
      const span = (name: string) => {
        const got = all
          .map((r) => cell(e, r, name))
          .filter((v) => v !== null && v !== '' && !(typeof v === 'number' && v <= 0))
        if (got.length === 0) return null
        const nums = got.filter((v): v is number => typeof v === 'number')
        if (nums.length === got.length)
          return { lo: Math.min(...nums), hi: Math.max(...nums), n: got.length, of: all.length }
        return {
          words: [...new Set(got.map((v) => String(v).trim()))],
          n: got.length,
          of: all.length,
        }
      }
      const txt = (name: string) => {
        const v = cell(e, anchor, name)
        return v == null ? null : String(v)
      }
      const item = { table: id, row: anchor.id, address: imageAddressOf(e, anchor) }
      const fit = readBoatFit(ctx, { tableId: id, rowId: anchor.id })
      const motorsOffered = fit?.motor ? offeredIn(fit.motor.made) : []
      const trailers = fit?.trailer ? offeredIn(fit.trailer.made) : []
      const levelSpans = levels.map((l) => {
        const vals = all
          .map((r) => readCell(r, l.fieldId))
          .filter((v): v is number => typeof v === 'number' && v > 0)
        return {
          key: l.key,
          label: l.label,
          scope: l.scope,
          lo: vals.length ? Math.min(...vals) : null,
          hi: vals.length ? Math.max(...vals) : null,
          priced: vals.length,
          of: all.length,
        }
      })
      return {
        key: m.key,
        said: m.said,
        shown: m.shown,
        spoken: m.spoken,
        series: m.series,
        seriesLabel: m.seriesLabel,
        code: txt('Model Code'),
        rows: m.rows,
        materials: m.materials.map((x) => ({
          label: x.label,
          from: x.from,
          to: x.to,
          n: x.variants.length,
        })),
        from: m.from,
        to: m.to,
        priced: m.priced,
        zeroes: m.zeroes,
        rung: m.rung,
        facts: m.facts,
        spec: {
          length: span('OA Length') ?? span('Hull Length (mtr)') ?? span('LOA'),
          beam: span('Beam') ?? span('Beam (mtr)'),
          people: span('Max People'),
          load: span('Max Load kg'),
          weight: span('Boat Weight kg') ?? span('Displacement kg'),
          fuel: span('Fuel Capacity'),
          minHp: span('Min HP'),
          maxHp: span('Max HP'),
          tube: span('Tube Dia. cm'),
          chambers: span('Air Chambers'),
          cabins: span('Cabins'),
          berths: span('Berths'),
          shaft: txt('Shaft Lgth'),
          config: txt('Eng Configuration'),
        },
        levels: levelSpans,
        catalogue: pic(book.catalogue(item)),
        hero: pic(book.hero(item)),
        fit: fit
          ? {
              name: fit.name,
              motorTable: fit.motor?.tableName ?? null,
              motorTakes: fit.motor?.takes ?? null,
              motors: motorsOffered.length,
              motorsRefused: fit.motor ? fit.motor.made.length - motorsOffered.length : 0,
              starred: motorsOffered
                .filter((x) => x.starred)
                .map((x) => ({ name: x.name, facts: x.facts, price: x.price })),
              motorList: motorsOffered
                .slice(0, 8)
                .map((x) => ({ name: x.name, facts: x.facts, price: x.price, starred: x.starred })),
              trailers: trailers.length,
              trailerOne: fit.trailer?.oneTrailer ?? null,
              trailerList: trailers
                .slice(0, 6)
                .map((x) => ({
                  name: x.name,
                  facts: x.facts,
                  price: x.price,
                  capacity: x.capacity,
                  starred: x.starred,
                })),
              trailerOnSale: fit.trailer?.onSale ?? null,
              boatWeight: fit.trailer?.boatWeight ?? null,
              lists: fit.lists.map((l) => ({
                name: l.name,
                kind: l.kind,
                offered: offeredIn(l.made).length,
                live: l.live,
                first: offeredIn(l.made)
                  .slice(0, 4)
                  .map((x) => ({ name: x.name, price: x.price, facts: x.facts })),
              })),
              priceName: fit.priceName,
              price: fit.price,
            }
          : null,
      }
    })
    return {
      id,
      name: b.name,
      rows: b.rows,
      named: b.named,
      rung: b.rung,
      from: b.from,
      to: b.to,
      zeroes: b.zeroes,
      filesSeries: b.filesSeries,
      levels: levels.map((l) => ({ key: l.key, label: l.label, scope: l.scope })),
      series: b.series.map((s) => ({
        name: s.name,
        label: s.label,
        note: s.note,
        rows: s.rows,
        models: s.models.map((m) => m.key),
      })),
      models,
    }
  }

  /* Yamaha's motors, by horsepower, from its own columns */
  const yam = tables['mot_yamaha']
  const yamLevels = priceLevelsFor(yam)
  const motors = (rows['mot_yamaha'] ?? []).map((r) => ({
    id: r.id,
    label: rowLabel(yam, r),
    series: String(cell(yam, r, 'Series') ?? ''),
    hp: cell(yam, r, 'HP Rating'),
    shaft: cell(yam, r, 'Shaft Length'),
    control: cell(yam, r, 'Control'),
    starting: cell(yam, r, 'Starting'),
    weight: cell(yam, r, 'WEIGHT kg'),
    code: cell(yam, r, 'Model Code'),
    sell: yamLevels[0] ? readCell(r, yamLevels[0].fieldId) : null,
    gone: isDiscontinued(r),
  }))

  const lab = tables['labour_rates']
  const labour = (rows['labour_rates'] ?? []).map((r) => ({
    label: rowLabel(lab, r),
    code: cell(lab, r, 'Code'),
  }))

  const obs = tables['trl_obsolete']
  const obsolete = (rows['trl_obsolete'] ?? []).map((r) => ({
    label: rowLabel(obs, r),
    series: cell(obs, r, 'Series'),
    supplier: cell(obs, r, 'Supplier'),
    code: cell(obs, r, 'Code'),
    boatSize: cell(obs, r, 'Boat Size (Mtr)'),
    atm: cell(obs, r, 'ATM (KG)'),
    gone: isDiscontinued(r),
  }))

  const heroes = book
    .heroes()
    .filter((h) => h.table === 'boat_highfield')
    .map((h) => pic(h))

  writeFileSync(
    OUT,
    JSON.stringify(
      {
        packedAt: pack.manifest.packedAt,
        places: Object.fromEntries(
          [
            'boat_highfield',
            'boat_jeanneau',
            'mot_yamaha',
            'labour_rates',
            'trl_obsolete',
            'parts',
            'dealer_fit',
          ].map((id) => {
            const card = read.cards.find((c) => c.tableIds.includes(id))
            return [id, card ? placeOut(card.address) : null]
          }),
        ),
        allPlaces: read.cards.map((c) => ({
          address: c.address,
          name: c.name,
          kind: c.kind,
          hero: c.hero.shown,
          photographs: c.photographs,
        })),
        highfield: brandOut('boat_highfield'),
        jeanneau: brandOut('boat_jeanneau'),
        motors,
        yamLevels: yamLevels.map((l) => l.label),
        labour,
        labourLevels: priceLevelsFor(lab).length,
        obsolete,
        heroes,
        marks: {
          highfield: book.marksFor('Highfield Inflatables'),
          jeanneau: book.marksFor('Jeanneau'),
          yamaha: book.marksFor('Yamaha Outboards'),
        },
      },
      null,
      1,
    ),
  )
}, 300000)
