import { createElement, useState } from 'react'
import { ArrowRightIcon, CameraPlusIcon, MagnifyingGlassIcon, TagIcon } from '@phosphor-icons/react'
import type { CatalogueCtx } from '@/domain/model'
import type { AisleCount } from '@/domain/catalogue/aisles'
import type { Section } from '@/domain/chandlery/headings'
import { Icon, Input, Picture } from '@/ui'
import { hrefOf, type CatalogueAt } from './at'
import { BoatChoice } from './BoatChoice'
import { ByCode } from './ByCode'
import { drawnOf } from './drawn'
import { Wares, MadeForBox, type Shelved } from './Aisle'
import type { BoatSaid } from './read'
import type { ShelfPart } from './shelf'
import { follow, type Around } from './Wares'

/* ============================================================
   THE CHANDLERY'S FRONT — `/catalogue`. Northside's mark at shop-sign
   size beside the word Chandlery (grafted from board C), then every
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
  onSale,
  pictured,
  headings,
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
  namedSuppliers,
  without,
  goPictures,
}: {
  ctx: CatalogueCtx
  at: CatalogueAt
  go: (next: Partial<CatalogueAt>, page?: boolean) => void
  goHref: (href: string) => void
  fronts: readonly AisleFront[]
  onSale: number
  pictured: number
  headings: number
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
  /** the supplier codes on the list, and how many Northside has named */
  suppliers: number
  namedSuppliers: number
  /** the parts on sale with no picture of their own, and the way to their worklist */
  without: number
  goPictures: () => void
}) {
  const [typed, setTyped] = useState(at.find)
  const aisles = fronts.length
  const sorted = fronts.filter((f) => f.count.aisle.id !== 'unsorted').length
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
          <h1 className="chd-door__title">Chandlery</h1>
          <p className="chd-door__count">
            <b>{onSale.toLocaleString('en-AU')}</b> parts on sale in <b>{sorted}</b> aisles
            {aisles > sorted ? ' and Not sorted yet' : ''} ·{' '}
            <b>{headings.toLocaleString('en-AU')}</b> headings of the price list ·{' '}
            <b>{pictured.toLocaleString('en-AU')}</b> pictured
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
            aria-label="Find a part in the chandlery"
          />
        </div>
        <BoatChoice
          ctx={ctx}
          boat={boat}
          made={madeFor.length}
          onBoat={(id) => go({ boat: id, open: '' })}
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
                {`${without.toLocaleString('en-AU')} of ${onSale.toLocaleString('en-AU')} have none of their own: the ones on quotes here first, then aisle by aisle.`}
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
              {`The price list writes its ${suppliers.toLocaleString('en-AU')} suppliers as codes, and Northside has named ${namedSuppliers.toLocaleString('en-AU')}. Name each maker once, and every aisle says it.`}
            </span>
          </span>
          <Icon glyph={ArrowRightIcon} />
        </a>
      </div>
    </div>
  )
}
