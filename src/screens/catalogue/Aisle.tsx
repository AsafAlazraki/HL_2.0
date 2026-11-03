import { createElement, useCallback, useEffect, useId, useRef, useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import type { CatalogueCtx } from '@/domain/model'
import { AISLES, UNSORTED, type Aisle as AisleDef } from '@/domain/catalogue/aisles'
import type { Section } from '@/domain/chandlery/headings'
import { isPlaced, placeKeyOf, type Placings } from '@/domain/chandlery/placing'
import { NO_SUPPLIER, type SupplierCount } from '@/domain/chandlery/suppliers'
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
    <section
      className="chd-section"
      aria-labelledby={id}
      data-heading={section.heading}
      data-said={title}
    >
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
            <Card key={w.id} w={w} around={around} under={section.heading} />
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
              <Line key={w.id} w={w} around={around} under={section.heading} />
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
    <section className="chd-made" data-ground="plate" aria-labelledby={id}>
      <header className="chd-made__head">
        <h2 id={id} className="chd-made__title" tabIndex={-1}>{`Made for the ${boat.full}`}</h2>
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
  { value: 'file', label: 'Price list order' },
  { value: 'price', label: 'Lowest price first' },
  { value: 'quoted', label: 'Most quoted here' },
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
  without,
  showCounts,
  suppliers,
  supplierCount,
  shownAll,
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
  /** its parts that could take a picture and have none */
  without: number
  /** Pictured · All · No picture, each counted under the supplier and the find chosen */
  showCounts: Record<Show, number>
  /** the suppliers, counted under which parts are shown and the find */
  suppliers: readonly SupplierCount[]
  /** how many suppliers the whole aisle has, so the chips stand whatever is shown */
  supplierCount: number
  shownAll: number
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
  const [headsOpen, setHeadsOpen] = useState(false)
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

  /* A LINK TO ONE HEADING LANDS IT JUST UNDER THE DOCK — from the front (whose press is not
     followed by the router's reset to the top, src/routes/catalogue.tsx), from "Its headings",
     or from an address. The dock is measured, not guessed, and grows once it is stuck (it says
     where you are), so the heading is set again while the dock settles and until a person
     scrolls (the verifier, g02–g05). */
  const dock = useRef<HTMLDivElement>(null)
  const land = useCallback((heading: string) => landOn(heading, dock.current), [])
  const madeInSight = useMadeInSight(at.boat, dock)
  useEffect(() => (at.heading === '' ? undefined : land(at.heading)), [at.heading, land])

  /* WHICH HEADING IS UNDER THE DOCK, so the dock can say it inside a 260-line section */
  const [inHeading, setInHeading] = useState('')
  useEffect(() => {
    /* nothing drawn, nothing to say; drawn again, read again */
    if (sections.length === 0) return
    let frame = 0
    const read = (): void => {
      frame = 0
      const edge = dock.current?.getBoundingClientRect().bottom ?? 0
      let said = ''
      for (const el of document.querySelectorAll<HTMLElement>('.chd-sections > .chd-section')) {
        /* a heading just landed under the dock is the one you are in */
        if (el.getBoundingClientRect().top > edge + LANDING_GAP * 2) break
        said = el.dataset.said ?? ''
      }
      setInHeading(said)
    }
    const onScroll = (): void => {
      if (frame === 0) frame = requestAnimationFrame(read)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [sections])

  const backHref = hrefOf({ boat: at.boat })
  const where = [aisle.name, stuck && sections.length > 0 ? inHeading : '', at.supplier, boat?.full]
    .filter((w): w is string => !!w)
    .join(' · ')
  /* the suppliers still written as the price list's codes: Northside names each maker once */
  const coded = suppliers.filter((s) => s.said !== NO_SUPPLIER)
  const unnamed = coded.filter((s) => !s.named).length
  const suppliersHref = hrefOf({ view: 'suppliers' })
  /* WHICH PARTS: offered only where there is a choice. An aisle with no picture has no
     "Pictured" to press, so none is drawn, and its counts already say 0 pictured */
  /* EACH LABEL COUNTS WHAT ITS PRESS WOULD DRAW under the supplier and find chosen. "No picture"
     is the parts that could take one; an aisle with none pictured offers it only when the
     worklist sent you to it (Workshop: All 157 · No picture 124, its labour under All alone) */
  const showOptions: { value: Show; label: string }[] = [
    ...(pictured > 0
      ? [
          {
            value: 'pictured' as const,
            label: `Pictured ${showCounts.pictured.toLocaleString('en-AU')}`,
          },
        ]
      : []),
    { value: 'all', label: `All ${showCounts.all.toLocaleString('en-AU')}` },
    ...(without > 0 && (pictured > 0 || at.show === 'without')
      ? [
          {
            value: 'without' as const,
            label: `No picture ${showCounts.without.toLocaleString('en-AU')}`,
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
        <span
          className="chd-head__tile"
          data-photo={photo ? '' : undefined}
          data-ground="plate"
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
            />
          ) : (
            createElement(drawnOf(aisle.id), { size: '100%', weight: 'light' })
          )}
        </span>
        <div className="chd-head__words">
          <h1 className="chd-head__title">{aisle.name}</h1>
          <p className="chd-head__count">
            {/* a figure and its noun are never parted by a line's end (the verifier, b01 at 390:
                "0 of / 66 pictured") */}
            <span className="chd-head__fig">
              <b>{total.toLocaleString('en-AU')}</b> part{total === 1 ? '' : 's'}
            </span>{' '}
            under{' '}
            <span className="chd-head__fig">
              <b>{headCount.toLocaleString('en-AU')}</b> heading{headCount === 1 ? '' : 's'}
            </span>{' '}
            {/* the separator ends its line, never starts the next */}
            of the <span className="chd-head__fig">price list ·</span>{' '}
            <span className="chd-head__fig">
              <b>{pictured.toLocaleString('en-AU')}</b> of {total.toLocaleString('en-AU')} pictured
            </span>
          </p>
          {front && front.heads.length > 1 ? (
            <details
              className="chd-heads"
              open={headsOpen}
              onToggle={(e) => setHeadsOpen(e.currentTarget.open)}
            >
              <summary className="chd-heads__summary">
                {`Its ${front.heads.length.toLocaleString('en-AU')} headings`}
              </summary>
              {/* drawn only while open: a shut list keeps no boxes for a ruler or a reader */}
              {headsOpen ? (
                <ul className="chd-heads__list">
                  {front.heads.map((h) => {
                    const to = hrefOf({ ...at, heading: h.heading, open: '' })
                    return (
                      <li key={h.heading}>
                        <a
                          href={to}
                          onClick={(e) =>
                            follow(() => {
                              if (at.heading === h.heading) land(h.heading)
                              else go({ heading: h.heading })
                            }, to)(e)
                          }
                        >
                          {h.said}
                        </a>{' '}
                        <span className="chd-heads__n">{h.parts.toLocaleString('en-AU')}</span>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </details>
          ) : null}
          {aisle.id === UNSORTED ? (
            <p className="chd-said">
              These sit under a heading no aisle names, or under none. Northside can put each in its
              aisle, below, and it moves there for every screen.
            </p>
          ) : null}
        </div>
        {/* THE CUSTOMER'S BOAT, held at the head of the aisle (Mazda's BT-50 accessories) */}
        <div className="chd-head__boat">
          <BoatChoice
            ctx={ctx}
            boat={boat}
            made={madeTotal}
            onBoat={(id) => {
              madeInSight()
              go({ boat: id, open: '' })
            }}
          />
        </div>
      </header>

      <div ref={sentinel} className="chd-sentinel" aria-hidden="true" />
      <div className="chd-dock" data-stuck={stuck ? '' : undefined} ref={dock}>
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
        {/* THE SUPPLIER, FOLDED TO ONE MENU where the chips have no room, AND THE ORDER: in the
            dock, so neither stands between two rows of chips (the verifier, b02 at 834) */}
        <div className="chd-dock__tools">
          {supplierCount > 1 ? (
            <div className="chd-suppliers-folded">
              <Select
                aria-label={`${aisle.name} by supplier`}
                value={at.supplier === '' ? BACK : at.supplier}
                options={[
                  { value: BACK, label: 'Every supplier', trail: shownAll.toLocaleString('en-AU') },
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
      </div>

      {supplierCount > 1 ? (
        <fieldset className="chd-suppliers" aria-label={`${aisle.name} by supplier`}>
          <Chip
            count={shownAll}
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
          {/* A CODE IS NOT A MAKER'S NAME: where the chips still print the price list's codes,
              the way to name them stands at their end (the verifier, J12) */}
          {unnamed > 0 ? (
            <a
              className="chd-way chd-suppliers__name"
              href={suppliersHref}
              onClick={follow(around.go, suppliersHref)}
            >
              {unnamed === coded.length
                ? 'These are the price list’s codes: name the makers'
                : `${unnamed.toLocaleString('en-AU')} still the price list’s code${unnamed === 1 ? '' : 's'}: name ${unnamed === 1 ? 'it' : 'them'}`}
              <Icon glyph={ArrowRightIcon} size="sm" />
            </a>
          ) : null}
        </fieldset>
      ) : null}
      {wrongSupplier ? (
        <output className="chd-said">
          {`Nothing in ${aisle.name} is sold by ${at.supplier}. Every supplier of it is above.`}
        </output>
      ) : null}
      <StepSaid said={step} back={back} />

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

/** The room left between the dock's foot and a heading landed under it. */
const LANDING_GAP = 12

/**
 * LAND A HEADING'S SECTION JUST UNDER THE DOCK, and keep it there while the dock settles — it
 * grows by the line that says where you are once it is stuck — until a person scrolls, presses
 * or types, or a second and a half has gone. A heading the page does not draw (narrowed away by
 * a find or a supplier) leaves the page at its top. The return stops it.
 */
function landOn(heading: string, dock: HTMLElement | null): () => void {
  const el = document.querySelector<HTMLElement>(
    `.chd-section[data-heading="${CSS.escape(heading)}"]`,
  )
  if (!el) {
    window.scrollTo({ top: 0, behavior: 'instant' })
    return () => undefined
  }
  return landUnder(el, dock)
}

/** Land one box just under the dock, and keep it there while the dock settles (`landOn`). */
function landUnder(el: HTMLElement, dock: HTMLElement | null): () => void {
  const align = (): void => {
    const edge = dock?.getBoundingClientRect().bottom ?? 0
    let off = el.getBoundingClientRect().top - edge - LANDING_GAP
    /* NEVER SHORT OF THE DOCK'S STICKING: a box just under the dock at rest would otherwise land
       with the aisle's head half under the bar and the dock not yet stuck (measured at 844 × 390:
       the dock 16 px short of its place, "Its 6 headings" cut by the bar). Its mark is the pixel
       above it, and its place is its sticky top, resolved by the browser */
    const mark = dock?.previousElementSibling
    if (dock && mark instanceof HTMLElement) {
      const top = parseFloat(getComputedStyle(dock).top) || 0
      off = Math.max(off, Math.ceil(mark.getBoundingClientRect().bottom - top) + 1)
    }
    if (Math.abs(off) >= 1) window.scrollBy({ top: off, behavior: 'instant' })
  }
  /* first past the dock, so it is stuck and its foot is where it will stay; then under it */
  el.scrollIntoView({ block: 'start', behavior: 'instant' })
  align()
  const watch = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(align)
  if (dock) watch?.observe(dock)
  const ends = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
  let done = false
  const stop = (): void => {
    if (done) return
    done = true
    watch?.disconnect()
    clearTimeout(timer)
    for (const e of ends) window.removeEventListener(e, stop)
  }
  const timer = setTimeout(stop, 1500)
  for (const e of ends) window.addEventListener(e, stop, { passive: true })
  return stop
}

/**
 * WHAT IS MADE FOR THE BOAT JUST CHOSEN, BROUGHT INTO SIGHT AND GIVEN THE CARET (the verifier of
 * the chandlery, round 2, J6: on a phone the find inside the popover had scrolled the page, so the
 * answer stood under the dock, and the caret fell to the page when the press that chose it went).
 * Where the box's head and its first part are already in sight between the dock (or the bar) and
 * the window's foot, nothing moves; else it lands just under the dock, or under the bar where
 * there is none (its scroll margin, catalogue.css). Returns the call a choice makes first.
 */
export function useMadeInSight(
  boatId: string,
  dock: { current: HTMLElement | null } | null,
): () => void {
  const asked = useRef(false)
  useEffect(() => {
    if (!asked.current || boatId === '') return
    asked.current = false
    let stop: () => void = () => undefined
    const frame = requestAnimationFrame(() => {
      const box = document.querySelector<HTMLElement>('.chd-made')
      if (!box) return
      const r = box.getBoundingClientRect()
      const edge = dock?.current?.getBoundingClientRect().bottom ?? 0
      /* the bar at a phone's foot, resolved by the browser: the box's own scroll margin */
      const foot =
        window.innerHeight - (parseFloat(getComputedStyle(box).scrollMarginBlockEnd) || 0)
      const seen = r.top >= edge && r.top + Math.min(r.height, MADE_SEEN) <= foot
      if (!seen) {
        if (dock?.current) stop = landUnder(box, dock.current)
        else box.scrollIntoView({ block: 'start', behavior: 'instant' })
      }
      box.querySelector<HTMLElement>('.chd-made__title')?.focus({ preventScroll: true })
    })
    return () => {
      cancelAnimationFrame(frame)
      stop()
    }
  }, [boatId, dock])
  return useCallback(() => {
    asked.current = true
  }, [])
}

/** How much of the box must be in sight to count as seen: its head and its first part. */
const MADE_SEEN = 180

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
        aria-label={`${placed ? 'Northside put this heading here' : 'Put this heading in an aisle'}: ${said}`}
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
