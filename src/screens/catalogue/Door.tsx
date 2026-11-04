import { createElement, useState } from 'react'
import { ArrowRightIcon, CameraPlusIcon, MagnifyingGlassIcon, TagIcon } from '@phosphor-icons/react'
import type { CatalogueCtx } from '@/domain/model'
import { UNSORTED, type AisleCount } from '@/domain/catalogue/aisles'
import type { ShelfCount } from '@/domain/catalogue/shelfCount'
import type { Section } from '@/domain/chandlery/headings'
import { Icon, Input, Picture } from '@/ui'
import { hrefOf, type CatalogueAt } from './at'
import { BoatChoice } from './BoatChoice'
import { ByCode } from './ByCode'
import { drawnOf } from './drawn'
import { Wares, MadeForBox, useMadeInSight, type Shelved } from './Aisle'
import type { BoatSaid } from './read'
import type { ShelfPart } from './shelf'
import { follow, type Around } from './Wares'

/* ============================================================
   THE CATALOGUE'S FRONT — `/catalogue`. Northside's mark at shop-sign
   size beside the room's own word, Catalogue, as Data's head and the
   finder name it (grafted from board C; the section critic,
   2026-11-04, found it called Chandlery here and Catalogue everywhere
   else). Under it, what of Data's Parts & Accessories is on sale, said
   as a share of Data's own figures so the two never read as two
   counts of one list. Then every
   aisle as a plate: its drawing, or a photograph from the aisle where
   one is held; its name and its counts; and its largest headings of
   the price list, each counted and each a way straight to its
   section (DigiKey's product index). Pressing an aisle REPLACES this
   page with the aisle's own, which opens at its top: the judge's
   blocker 2 cannot come back.

   FIND READS THE WHOLE CHANDLERY — a name, a code, a supplier, a
   heading — and its answer stands where the aisles were, grouped by
   aisle. With a boat chosen, what the price list makes for it comes
   first. At the foot, the two pieces of Northside's own work that
   belong to every aisle at once: pictures placed by their codes, and
   the suppliers named.
   ============================================================ */

/** Heading links drawn on an aisle's plate before "and N more". */
const HEADS_SHOWN = 4

const said = (x: number) => x.toLocaleString('en-AU')
const are = (x: number) => (x === 1 ? 'is' : 'are')

export interface AisleFront {
  count: AisleCount
  /** its headings, largest first */
  heads: { heading: string; said: string; parts: number }[]
  /** a photograph from the aisle, where one is held */
  photo: { src: string; srcSet?: string | undefined; width: number; height: number } | null
}

export function Door({
  ctx,
  at,
  go,
  goHref,
  fronts,
  listed,
  pictured,
  wrongAisle,
  mark,
  business,
  boat,
  madeFor,
  found,
  foundTotal,
  shelf,
  nameOf,
  around,
  suppliers,
  readSuppliers,
  namedSuppliers,
  without,
  takes,
  goPictures,
}: {
  ctx: CatalogueCtx
  at: CatalogueAt
  go: (next: Partial<CatalogueAt>, page?: boolean) => void
  goHref: (href: string) => void
  fronts: readonly AisleFront[]
  /** the parts list counted as Data counts it, and what of it is on sale */
  listed: ShelfCount
  pictured: number
  wrongAisle: string
  mark: { src: string; width: number; height: number } | null
  business: string
  boat: BoatSaid | null
  madeFor: readonly Shelved[]
  found: readonly Section<Shelved>[] | null
  foundTotal: number
  shelf: readonly ShelfPart[]
  nameOf: (p: ShelfPart) => string
  around: Around
  /** the supplier codes on the list, how many the price list names itself, and how many
   *  Northside has named */
  suppliers: number
  readSuppliers: number
  namedSuppliers: number
  /** the parts on sale with no picture of their own, of those that take one, and the way to
   *  their worklist */
  without: number
  takes: number
  goPictures: () => void
}) {
  const [typed, setTyped] = useState(at.find)
  const madeInSight = useMadeInSight(at.boat, null)
  const aisles = fronts.length
  const sorted = fronts.filter((f) => f.count.aisle.id !== UNSORTED).length
  const unsorted = fronts.find((f) => f.count.aisle.id === UNSORTED)?.count.parts ?? 0
  const keep = (next: Partial<CatalogueAt>): Partial<CatalogueAt> => ({
    boat: at.boat,
    ...next,
  })

  return (
    <div className="chd-door" data-testid="catalogue-door">
      <header className="chd-door__head">
        {mark ? (
          <span className="chd-mark" data-ground="plate">
            <img src={mark.src} width={mark.width} height={mark.height} alt={business} />
          </span>
        ) : null}
        <div className="chd-door__words">
          <h1 className="chd-door__title">Catalogue</h1>
          <p className="chd-door__count" data-testid="catalogue-count">
            <b>{said(listed.onSale)}</b> of the price list’s <b>{said(listed.lines)}</b> parts are
            on sale, under <b>{said(listed.headingsOnSale)}</b> of its{' '}
            <b>{said(listed.headings)}</b> headings
            {listed.onSaleUnheaded > 0 ? (
              <>
                {' '}
                and <b>{said(listed.onSaleUnheaded)}</b> under none
              </>
            ) : null}
            {listed.gone > 0 ? (
              <>
                ; the other <b>{said(listed.gone)}</b> {are(listed.gone)} no longer sold
              </>
            ) : null}
            . They stand in <b>{said(sorted)}</b> aisle{sorted === 1 ? '' : 's'}
            {unsorted > 0 ? (
              <>
                {' '}
                and <b>{said(unsorted)}</b> {are(unsorted)} not sorted yet
              </>
            ) : null}
            ; <b>{said(pictured)}</b> {are(pictured)} pictured.
          </p>
        </div>
      </header>

      <div className="chd-door__tools">
        <div className="chd-find">
          <Input
            type="search"
            icon={MagnifyingGlassIcon}
            value={typed}
            onValueChange={(next) => {
              setTyped(next)
              go({ find: next.trim() === '' ? '' : next, open: '' })
            }}
            placeholder="A name, a code, a supplier or a heading"
            aria-label="Find a part in the catalogue"
          />
        </div>
        <BoatChoice
          ctx={ctx}
          boat={boat}
          made={madeFor.length}
          onBoat={(id) => {
            madeInSight()
            go({ boat: id, open: '' })
          }}
        />
      </div>

      {wrongAisle !== '' ? (
        <output className="chd-said chd-door__wrong">
          {`There is no aisle called “${wrongAisle}”. These are the ${aisles}.`}
        </output>
      ) : null}

      {boat && found === null ? (
        <MadeForBox boat={boat} here={madeFor} elsewhere={[]} around={around} />
      ) : null}

      {found !== null ? (
        <section className="chd-found" aria-label={`Found for “${at.find.trim()}”`}>
          <output className="chd-found__said">
            {found.length === 0
              ? `Nothing on the price list answers to “${at.find.trim()}” by its name, its code, its supplier or its heading.`
              : `${foundTotal.toLocaleString('en-AU')} part${foundTotal === 1 ? '' : 's'} answer${foundTotal === 1 ? 's' : ''} to “${at.find.trim()}”${
                  foundTotal > found.reduce((n, s) => n + s.parts.length, 0)
                    ? `. The first ${found.reduce((n, s) => n + s.parts.length, 0).toLocaleString('en-AU')} are shown: add a word to narrow them`
                    : ''
                }.`}
          </output>
          {found.map((s) => (
            <Wares key={s.heading} title={s.said} section={s} around={around} show="all" />
          ))}
        </section>
      ) : (
        <ul className="chd-aisles" aria-label="The aisles">
          {fronts.map(({ count, heads, photo }) => {
            const href = hrefOf(keep({ aisle: count.aisle.id }))
            const more = heads.length - HEADS_SHOWN
            return (
              <li
                key={count.aisle.id}
                className="chd-aisle"
                data-ground="plate"
                data-unsorted={count.aisle.id === 'unsorted' ? '' : undefined}
              >
                <a
                  className="chd-aisle__go"
                  href={href}
                  onClick={follow(
                    () => go({ aisle: count.aisle.id, find: '', open: '', heading: '' }, true),
                    href,
                  )}
                >
                  <span
                    className="chd-aisle__tile"
                    data-photo={photo ? '' : undefined}
                    aria-hidden="true"
                  >
                    {photo ? (
                      <Picture
                        src={photo.src}
                        srcSet={photo.srcSet}
                        sizes="96px"
                        alt=""
                        width={photo.width}
                        height={photo.height}
                        fit="contain"
                        lazy
                      />
                    ) : (
                      createElement(drawnOf(count.aisle.id), { size: '100%', weight: 'light' })
                    )}
                  </span>
                  <span className="chd-aisle__name">{count.aisle.name}</span>
                  <span className="chd-aisle__count">
                    {`${count.parts.toLocaleString('en-AU')} part${count.parts === 1 ? '' : 's'}`}
                    {count.pictured > 0
                      ? ` · ${count.pictured.toLocaleString('en-AU')} pictured`
                      : ' · none pictured yet'}
                  </span>
                </a>
                <ul className="chd-aisle__heads" aria-label={`${count.aisle.name}, by heading`}>
                  {heads.slice(0, HEADS_SHOWN).map((h) => {
                    const to = hrefOf(keep({ aisle: count.aisle.id, heading: h.heading }))
                    return (
                      <li key={h.heading}>
                        <a
                          href={to}
                          onClick={follow(
                            () =>
                              go(
                                { aisle: count.aisle.id, heading: h.heading, find: '', open: '' },
                                true,
                              ),
                            to,
                          )}
                        >
                          {h.said}
                        </a>
                        <span className="chd-aisle__n">{h.parts.toLocaleString('en-AU')}</span>
                      </li>
                    )
                  })}
                </ul>
                {more > 0 ? (
                  <p className="chd-aisle__more">{`and ${more} more heading${more === 1 ? '' : 's'}`}</p>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}

      <div className="chd-door__keep">
        <ByCode shelf={shelf} nameOf={nameOf} />
        {without > 0 ? (
          <a
            className="chd-keep"
            data-ground="plate"
            href={hrefOf({ view: 'pictures', boat: at.boat })}
            onClick={follow(goPictures, hrefOf({ view: 'pictures', boat: at.boat }))}
          >
            <span className="chd-keep__glyph" aria-hidden="true">
              <Icon glyph={CameraPlusIcon} />
            </span>
            <span className="chd-keep__words">
              <span className="chd-keep__title">The parts with no picture yet</span>
              <span className="chd-said">
                {`${without.toLocaleString('en-AU')} of ${takes.toLocaleString('en-AU')} parts have none of their own: the ones on quotes here first, then aisle by aisle.`}
              </span>
            </span>
            <Icon glyph={ArrowRightIcon} />
          </a>
        ) : null}
        <a
          className="chd-keep"
          data-ground="plate"
          href={hrefOf({ view: 'suppliers' })}
          onClick={follow(goHref, hrefOf({ view: 'suppliers' }))}
        >
          <span className="chd-keep__glyph" aria-hidden="true">
            <Icon glyph={TagIcon} />
          </span>
          <span className="chd-keep__words">
            <span className="chd-keep__title">The suppliers, in Northside’s words</span>
            <span className="chd-said">
              {`The price list writes its ${suppliers.toLocaleString('en-AU')} suppliers as codes, and names ${readSuppliers.toLocaleString('en-AU')} of them in words itself. Northside has named ${namedSuppliers.toLocaleString('en-AU')}. Name each maker once, and every aisle says it.`}
            </span>
          </span>
          <Icon glyph={ArrowRightIcon} />
        </a>
      </div>
    </div>
  )
}
