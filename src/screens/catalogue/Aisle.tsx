import { createElement, useEffect, useId, useRef, useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import type { CatalogueCtx } from '@/domain/model'
import { AISLES, UNSORTED, type Aisle as AisleDef } from '@/domain/catalogue/aisles'
import type { Section } from '@/domain/chandlery/headings'
import { isPlaced, placeKeyOf, type Placings } from '@/domain/chandlery/placing'
import type { SupplierCount } from '@/domain/chandlery/suppliers'
import { Button, Chip, Icon, Input, Picture, Segmented, Select } from '@/ui'
import { hrefOf, type CatalogueAt, type Show, type Sort } from './at'
import { BoatChoice } from './BoatChoice'
import { drawnOf } from './drawn'
import type { AisleFront } from './Door'
import type { BoatSaid, Ware } from './read'
import { StepSaid, type Said } from './Step'
import { Card, Line, follow, type Around } from './Wares'

/* ============================================================
   ONE AISLE AS ITS OWN PAGE — `/catalogue?aisle=anchoring` (direction
   A, "the aisle as a page", picked 2026-11-03). The aisle replaces the
   front, so it opens at the top of the window at every size.

   TOP TO BOTTOM:
     · the way back to every aisle; the aisle's name large, with its
       parts, its headings and its pictures counted, and its headings
       of the price list a press away;
     · THE DOCK, which stays under the bar while the parts scroll
       (Apple's Cases & Protection, scrolled): find in this aisle, and
       once the name has gone under it, which aisle, supplier and boat
       this is;
     · Pictured | All | Without, the suppliers in Northside's words,
       the order, and the customer's boat;
     · what the price list makes for that boat, in this aisle, first;
     · the price list's own headings as sections, each counted: the
       pictured parts as cards first, then every other part as a line.
   ============================================================ */

/** A part as this page shows it: priced, named and ready to draw. */
export type Shelved = Ware

/** ONE SECTION: its cards (the pictured parts) first, then its lines. */
export function Wares({
  title,
  section,
  around,
  show,
  extra,
}: {
  title: string
  section: Section<Shelved>
  around: Around
  show: Show
  extra?: React.ReactNode
}) {
  const id = useId()
  const cards =
    show === 'without' ? [] : section.parts.filter((w) => w.tile?.picture && w.kind === 'part')
  const lines =
    show === 'pictured' ? [] : section.parts.filter((w) => !(w.tile?.picture && w.kind === 'part'))
  const pictured = section.parts.filter((w) => w.tile?.picture).length
  return (
    <section className="chd-section" aria-labelledby={id} data-heading={section.heading}>
      <header className="chd-section__head">
        <h2 id={id} className="chd-section__title">
          {title}
        </h2>
        <span className="chd-section__count">{section.parts.length.toLocaleString('en-AU')}</span>
        {pictured > 0 && show === 'all' && lines.length > 0 ? (
          <span className="chd-section__say">{`${pictured.toLocaleString('en-AU')} pictured, first`}</span>
        ) : null}
        {extra}
      </header>
      {cards.length > 0 ? (
        <ul className="chd-cards" aria-label={`${title}, pictured`}>
          {cards.map((w) => (
            <Card key={w.id} w={w} around={around} />
          ))}
        </ul>
      ) : null}
      {lines.length > 0 ? (
        <div className="chd-ledger">
          <p className="chd-cols" aria-hidden="true">
            <span>Part</span>
            <span>Code</span>
            <span>Supplier</span>
            <span className="chd-cols__fig">Supply</span>
            <span className="chd-cols__fig">Fitted</span>
          </p>
          <ul className="chd-lines" aria-label={title}>
            {lines.map((w) => (
              <Line key={w.id} w={w} around={around} />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

/** WHAT THE PRICE LIST MAKES FOR THE CUSTOMER'S BOAT, first. */
export function MadeForBox({
  boat,
  here,
  elsewhere,
  around,
  aisleName,
  allHref,
}: {
  boat: BoatSaid
  here: readonly Shelved[]
  /** the aisles the rest of them are in, each counted */
  elsewhere: readonly { name: string; parts: number }[]
  around: Around
  aisleName?: string
  allHref?: string
}) {
  const id = useId()
  const others = elsewhere.reduce((n, e) => n + e.parts, 0)
  const total = here.length + others
  return (
    <section className="chd-made" aria-labelledby={id}>
      <header className="chd-made__head">
        <h2 id={id} className="chd-made__title">{`Made for the ${boat.full}`}</h2>
        <p className="chd-made__count">
          {total === 0
            ? 'The price list makes no part for this boat in particular. Every part it sells is in the aisles.'
            : aisleName
              ? `${here.length.toLocaleString('en-AU')} in ${aisleName}, of the ${total.toLocaleString('en-AU')} the price list makes for it`
              : `${total.toLocaleString('en-AU')} part${total === 1 ? '' : 's'} the price list makes for it`}
        </p>
      </header>
      {here.length > 0 ? (
        <ul className="chd-lines" aria-label={`Made for the ${boat.full}`}>
          {here.map((w) => (
            <Line key={w.id} w={w} around={around} openKey={`made:${w.id}`} />
          ))}
        </ul>
      ) : null}
      {others > 0 ? (
        <p className="chd-said">
          {`The other ${others.toLocaleString('en-AU')} ${others === 1 ? 'is' : 'are'} in ${elsewhere.map((e) => e.name).join(', ')}.`}{' '}
          {allHref ? (
            <a className="chd-way" href={allHref} onClick={follow(around.go, allHref)}>
              {`See all ${total.toLocaleString('en-AU')}`}
              <Icon glyph={ArrowRightIcon} size="sm" />
            </a>
          ) : null}
        </p>
      ) : null}
    </section>
  )
}

const SORTS: { value: Sort; label: string }[] = [
  { value: 'file', label: 'As the price list orders them' },
  { value: 'price', label: 'Lowest price first' },
  { value: 'quoted', label: 'Most often quoted here' },
]

const BACK = 'back'

export function AislePage({
  ctx,
  at,
  go,
  aisle,
  front,
  aisleCount,
  sections,
  total,
  pictured,
  suppliers,
  wrongSupplier,
  boat,
  madeHere,
  madeElsewhere,
  madeTotal,
  placed,
  placeHeading,
  step,
  back,
  around,
}: {
  ctx: CatalogueCtx
  at: CatalogueAt
  go: (next: Partial<CatalogueAt>, page?: boolean) => void
  aisle: AisleDef
  front: AisleFront | undefined
  aisleCount: number
  sections: readonly Section<Shelved>[]
  /** the aisle's parts, before any narrowing */
  total: number
  pictured: number
  suppliers: readonly SupplierCount[]
  wrongSupplier: boolean
  boat: BoatSaid | null
  madeHere: readonly Shelved[]
  madeElsewhere: readonly { name: string; parts: number }[]
  madeTotal: number
  placed: Placings | undefined
  placeHeading: (key: string, aisle: string | null, said: string) => void
  step: Said | null
  back: () => void
  around: Around
}) {
  const photo = front?.photo ?? null
  const headCount = front?.heads.length ?? sections.length
  const [typed, setTyped] = useState(at.find)
  const sentinel = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)
  const shown = sections.reduce((n, s) => n + s.parts.length, 0)

  /* THE DOCK SAYS WHERE YOU ARE once the aisle's name has gone under it */
  useEffect(() => {
    const mark = sentinel.current
    if (!mark || typeof IntersectionObserver === 'undefined') return
    const inset =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--shell-inset')) || 0
    const seen = new IntersectionObserver(
      ([e]) => setStuck(e ? !e.isIntersecting && e.boundingClientRect.top < inset + 1 : false),
      { rootMargin: `-${inset}px 0px 0px 0px` },
    )
    seen.observe(mark)
    return () => seen.disconnect()
  }, [])

  /* A LINK FROM THE FRONT TO ONE HEADING lands on its section, once */
  const landed = useRef('')
  useEffect(() => {
    if (at.heading === '' || landed.current === at.heading) return
    landed.current = at.heading
    const el = document.querySelector(`[data-heading="${CSS.escape(at.heading)}"]`)
    if (el instanceof HTMLElement) el.scrollIntoView({ block: 'start' })
  }, [at.heading])

  const backHref = hrefOf({ boat: at.boat })
  const where = [aisle.name, at.supplier, boat?.full].filter((w): w is string => !!w).join(' · ')
  /* WHICH PARTS: offered only where there is a choice. An aisle with no picture has no
     "Pictured" to press, so none is drawn, and its counts already say 0 pictured */
  const showOptions: { value: Show; label: string }[] = [
    ...(pictured > 0
      ? [{ value: 'pictured' as const, label: `Pictured ${pictured.toLocaleString('en-AU')}` }]
      : []),
    { value: 'all', label: `All ${total.toLocaleString('en-AU')}` },
    ...(pictured < total && pictured > 0
      ? [
          {
            value: 'without' as const,
            label: `No picture ${(total - pictured).toLocaleString('en-AU')}`,
          },
        ]
      : []),
  ]

  return (
    <div className="chd-page" data-testid="catalogue-aisle">
      <a className="chd-back" href={backHref} onClick={follow(around.go, backHref)}>
        <Icon glyph={ArrowLeftIcon} size="sm" />
        {`Every aisle · ${aisleCount}`}
      </a>
      <header className="chd-head">
        <span className="chd-head__tile" data-photo={photo ? '' : undefined} aria-hidden="true">
          {photo ? (
            <Picture
              src={photo.src}
              srcSet={photo.srcSet}
              sizes="96px"
              alt=""
              width={photo.width}
              height={photo.height}
              fit="contain"
            />
          ) : (
            createElement(drawnOf(aisle.id), { size: '100%', weight: 'light' })
          )}
        </span>
        <div className="chd-head__words">
          <h1 className="chd-head__title">{aisle.name}</h1>
          <p className="chd-head__count">
            <b>{total.toLocaleString('en-AU')}</b> part{total === 1 ? '' : 's'} under{' '}
            <b>{headCount.toLocaleString('en-AU')}</b> heading{headCount === 1 ? '' : 's'} of the
            price list · <b>{pictured.toLocaleString('en-AU')}</b> of{' '}
            {total.toLocaleString('en-AU')} pictured
          </p>
          {aisle.id === UNSORTED ? (
            <p className="chd-said">
              These are filed under a heading no aisle names, or under none. Northside can put each
              in its aisle, below, and it moves there for every screen.
            </p>
          ) : null}
        </div>
        {/* THE CUSTOMER'S BOAT, held at the head of the aisle (Mazda's BT-50 accessories) */}
        <div className="chd-head__boat">
          <BoatChoice
            ctx={ctx}
            boat={boat}
            made={madeTotal}
            onBoat={(id) => go({ boat: id, open: '' })}
          />
        </div>
      </header>

      <div ref={sentinel} className="chd-sentinel" aria-hidden="true" />
      <div className="chd-dock" data-stuck={stuck ? '' : undefined}>
        <p className="chd-dock__where" aria-hidden={!stuck}>
          {where}
        </p>
        <div className="chd-find">
          <Input
            type="search"
            icon={MagnifyingGlassIcon}
            value={typed}
            onValueChange={(next) => {
              setTyped(next)
              go({ find: next.trim() === '' ? '' : next, open: '' })
            }}
            placeholder="In this aisle: a name, a code or a supplier"
            aria-label={`Find in ${aisle.name}`}
          />
        </div>
        {showOptions.length > 1 ? (
          <div className="chd-dock__show">
            <Segmented<Show>
              label="Which parts"
              value={showOptions.some((o) => o.value === at.show) ? at.show : 'all'}
              onValueChange={(show) => go({ show, open: '' })}
              options={showOptions}
            />
          </div>
        ) : null}
      </div>

      <div className="chd-tools">
        <div className="chd-tools__row">
          {suppliers.length > 1 ? (
            <fieldset className="chd-suppliers" aria-label={`${aisle.name} by supplier`}>
              <Chip
                count={total}
                selected={at.supplier === ''}
                onSelect={() => go({ supplier: '', open: '' })}
              >
                Every supplier
              </Chip>
              {suppliers.map((s) => (
                <Chip
                  key={s.said}
                  count={s.lines}
                  selected={at.supplier === s.said}
                  onSelect={() => go({ supplier: at.supplier === s.said ? '' : s.said, open: '' })}
                >
                  {s.said}
                </Chip>
              ))}
            </fieldset>
          ) : null}
          {suppliers.length > 1 ? (
            <div className="chd-suppliers-folded">
              <Select
                aria-label={`${aisle.name} by supplier`}
                value={at.supplier === '' ? BACK : at.supplier}
                options={[
                  { value: BACK, label: 'Every supplier', trail: total.toLocaleString('en-AU') },
                  ...suppliers.map((s) => ({
                    value: s.said,
                    label: s.said,
                    trail: s.lines.toLocaleString('en-AU'),
                  })),
                ]}
                onValueChange={(v) => go({ supplier: v === null || v === BACK ? '' : v, open: '' })}
              />
            </div>
          ) : null}
          <div className="chd-sort">
            <Select<Sort>
              aria-label="The order inside each heading"
              value={at.sort}
              options={SORTS}
              onValueChange={(v) => go({ sort: v ?? 'file', open: '' })}
            />
          </div>
        </div>
        {wrongSupplier ? (
          <output className="chd-said">
            {`Nothing in ${aisle.name} is sold by ${at.supplier}. Every supplier of it is above.`}
          </output>
        ) : null}
        <StepSaid said={step} back={back} />
      </div>

      {boat ? (
        <MadeForBox
          boat={boat}
          here={madeHere}
          elsewhere={madeElsewhere}
          around={around}
          aisleName={aisle.name}
          allHref={hrefOf({ boat: at.boat })}
        />
      ) : null}

      {sections.length === 0 ? (
        <output className="chd-said chd-nothing">
          {at.find.trim() !== ''
            ? `Nothing in ${aisle.name} answers to “${at.find.trim()}” by its name, its code, its supplier or its heading.`
            : `Nothing in ${aisle.name} is shown with ${at.show === 'pictured' ? 'a picture' : 'no picture'} here.`}
        </output>
      ) : (
        <div className="chd-sections" aria-label={`${shown.toLocaleString('en-AU')} parts`}>
          {sections.map((s) => {
            const first = s.parts[0]
            const key = first ? placeKeyOf(first) : ''
            const placedHere = first ? isPlaced(first, placed) : false
            const canPlace = s.heading !== '' && (aisle.id === UNSORTED || placedHere)
            return (
              <Wares
                key={s.heading}
                title={s.said}
                section={s}
                around={around}
                show={at.show}
                extra={
                  canPlace ? (
                    <PlaceHeading
                      said={s.said}
                      placed={placedHere}
                      onPlace={(to) => placeHeading(key, to, s.said)}
                    />
                  ) : null
                }
              />
            )
          })}
        </div>
      )}
      {aisle.id !== UNSORTED && sections.length > 0 ? (
        <p className="chd-foot">
          <Button
            intent="quiet"
            size="sm"
            icon={ArrowLeftIcon}
            href={backHref}
            onClick={() => around.go(backHref)}
          >
            {`Every aisle · ${aisleCount}`}
          </Button>
        </p>
      ) : null}
    </div>
  )
}

/** A HEADING NO AISLE NAMES, PUT IN ONE BY NORTHSIDE — or taken back to where the list puts it. */
function PlaceHeading({
  said,
  placed,
  onPlace,
}: {
  said: string
  placed: boolean
  onPlace: (aisle: string | null) => void
}) {
  const id = useId()
  return (
    <span className="chd-place chd-place--head">
      <label className="chd-place__label" htmlFor={id}>
        {placed ? 'Northside put this heading here' : 'Put this heading in an aisle'}
      </label>
      <Select
        id={id}
        value={null}
        placeholder={placed ? 'Move it, or take it back' : 'Choose its aisle'}
        aria-label={`Where ${said} goes`}
        options={[
          ...(placed ? [{ value: BACK, label: 'Back where the price list puts it' }] : []),
          ...AISLES.map((a) => ({ value: a.id, label: a.name })),
        ]}
        onValueChange={(v) => {
          if (v === null) return
          onPlace(v === BACK ? null : v)
        }}
      />
    </span>
  )
}
