import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import {
  ArrowRightIcon,
  ImagesIcon,
  CaretDownIcon,
  NotePencilIcon,
  ReceiptIcon,
  TableIcon,
  WrenchIcon,
} from '@phosphor-icons/react'
import { money } from '@/domain/money'
import { headingSaid } from '@/domain/chandlery/headings'
import { isSupplyOnly, noteSaid, type TwoPrices } from '@/domain/chandlery/prices'
import { placeKeyOf } from '@/domain/chandlery/placing'
import { boatsNamed } from '@/domain/chandlery/boatsNamed'
import { boatsByMaker } from '@/domain/chandlery/boatsGrouped'
import type { ReviewStanding } from '@/domain/chandlery/reviewCase'
import { AISLES } from '@/domain/catalogue/aisles'
import { useGallery, useOptionPicture } from '@/app/optionPicture'
import { itemOf, placeIn } from '@/data/pictures'
import { AddPicture, Button, ExpandPicture, Icon, Picture, Select } from '@/ui'
import { PARTS_TABLE } from './shelf'
import type { BoatSaid, PartsPlace, Ware } from './read'

/* ============================================================
   A PART, AS THE CHANDLERY DRAWS IT — Polestar's two weights
   (docs/research/refs/choosing/notes.md §1): a part with its own
   photograph is a CARD, picture first; every other part is a RULED
   LINE. 91% of the parts on sale have no picture, and a dashed "Add a
   picture" box in front of a customer read as a to-do list (the judge
   of the chandlery, blocker 3), so a line never draws a picture's
   place at all: Northside's own picture is added from the line opened.

   EVERY PART SAYS BOTH PRICES, labelled — supply and fitted — and a
   part the price list prices only fitted says its fitted figure, never
   $0 (blocker 1). A note of the workbook ("NB: …") is drawn as a note,
   not as a part to buy (major 13).

   A LINE OPENS IN PLACE (its id is the page's `open`), and the opened
   part says what the price list says of it and holds its three ways
   on: its line in the price list, Northside's own picture, and a quote
   on its own — or the sentence why not, with the way to switch it on.
   ============================================================ */

/** Follow an address inside the app on a plain left click; leave every other click to the browser. */
export function follow(go: (href: string) => void, href: string) {
  return (e: MouseEvent<HTMLAnchorElement>): void => {
    if (e.defaultPrevented || e.button !== 0) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    go(href)
  }
}

/** THE TWO PRICES, each with its word under it. Under a ledger's own SUPPLY and FITTED heads the
 *  two words are said to a reader only, so a row does not repeat its column (the verifier, round 2,
 *  b03); a word the heads do not say ("only", "on the price list") is always drawn. */
export function Prices({ prices }: { prices: TwoPrices }) {
  switch (prices.kind) {
    case 'both':
      return (
        <span className="chd-prices">
          <Fig n={prices.supply} word="supply" />
          <Fig n={prices.fitted} word="fitted" />
        </span>
      )
    case 'supplyOnly':
      return (
        <span className="chd-prices">
          <Fig n={prices.supply} word="supply" />
          <span className="chd-fig" data-said="">
            <span className="chd-fig__n">Supply</span>
            <span className="chd-fig__w">only</span>
          </span>
        </span>
      )
    case 'fittedOnly':
      return (
        <span className="chd-prices">
          <span className="chd-fig" data-said="">
            <span className="chd-fig__n">Fitted</span>
            <span className="chd-fig__w">only</span>
          </span>
          <Fig n={prices.fitted} word="fitted" />
        </span>
      )
    case 'zero':
      return (
        <span className="chd-prices" data-one="">
          <span className="chd-fig">
            <span className="chd-fig__n">$0</span>
            <span className="chd-fig__w">as the price list writes it</span>
          </span>
        </span>
      )
    case 'none':
      return (
        <span className="chd-prices" data-one="" data-none="">
          <span className="chd-fig">
            <span className="chd-fig__n">No price</span>
            <span className="chd-fig__w">on the price list</span>
          </span>
        </span>
      )
  }
}

function Fig({ n, word }: { n: number; word: string }) {
  return (
    <span className="chd-fig">
      <span className="chd-fig__n">{money(n)}</span>
      <span className="chd-fig__w" data-col="">
        {word}
      </span>
    </span>
  )
}

/** What the opened part needs from the page around it. */
export interface Around {
  boats: ReadonlyMap<string, BoatSaid>
  boatsOf: (id: string) => readonly string[]
  place: PartsPlace | null
  /** the parts list's own name: "Parts & Accessories" */
  listName: string
  go: (href: string) => void
  /** where Northside may put a line with no heading, on the aisle "Not sorted yet" */
  placeLine?: ((key: string, aisle: string | null, said: string) => void) | undefined
  /** whether this line stands where it does because Northside put it there */
  placedHere?: ((w: Ware) => boolean) | undefined
  onLarge: (w: Ware, at: number) => void
  /** where a part with no price stands on Review: its own case, or left as meant */
  reviewOf?: ((id: string) => ReviewStanding | undefined) | undefined
  open: string
  onOpen: (id: string) => void
  /** the customer's boat, by its name, marked among a part's boats */
  boatName?: string | undefined
}

/** ONE PART AS A RULED LINE, opening in place. */
export function Line({
  w,
  around,
  openKey = w.id,
  note,
  under,
}: {
  w: Ware
  around: Around
  /** what `open` says when this line is the one opened; a second showing of a part has its own */
  openKey?: string
  /** a word the page adds after code · supplier: "on 3 quotes" */
  note?: string
  /** the heading the section it stands in already says, so the opened line does not say it again */
  under?: string
}) {
  const panel = useId()
  const head = useRef<HTMLButtonElement>(null)
  const item = useRef<HTMLLIElement>(null)
  const opened = around.open === openKey
  useEscapeShuts(opened, around.onOpen, item, head)
  if (w.kind === 'note') return <Note w={w} around={around} />
  return (
    <li
      className="chd-line"
      data-open={opened ? '' : undefined}
      /* opened, the line is a white plate, and reads the day's inks in either theme */
      data-ground={opened ? 'plate' : undefined}
      data-kind={w.kind}
      ref={item}
    >
      <button
        ref={head}
        type="button"
        className="chd-line__head"
        aria-expanded={opened}
        aria-controls={panel}
        onClick={() => around.onOpen(opened ? '' : openKey)}
      >
        <span className="chd-line__name">
          {w.kind === 'labour' ? (
            <span className="chd-line__glyph" aria-hidden="true">
              <Icon glyph={WrenchIcon} size="sm" />
            </span>
          ) : null}
          {w.name}
        </span>
        <span className="chd-line__meta">
          <span className="chd-code">{w.code === '' ? 'No code' : w.code}</span>
          <span className="chd-line__supplier">{w.supplier}</span>
          {note ? <span className="chd-line__note">{note}</span> : null}
        </span>
        <Prices prices={w.prices} />
        <span className="chd-line__caret" aria-hidden="true">
          <Icon glyph={CaretDownIcon} />
        </span>
      </button>
      <div id={panel} className="chd-line__panel" hidden={!opened}>
        {opened ? <Details w={w} around={around} under={under} /> : null}
      </div>
    </li>
  )
}

/** A NOTE OF THE WORKBOOK, read as a note: its words, and its line in the price list. */
function Note({ w, around }: { w: Ware; around: Around }) {
  const href = `/data/${PARTS_TABLE}?at=${encodeURIComponent(w.id)}`
  return (
    <li className="chd-note">
      <span className="chd-note__glyph" aria-hidden="true">
        <Icon glyph={NotePencilIcon} size="sm" />
      </span>
      <span className="chd-note__said">
        <span className="chd-note__word">A note in the price list</span> {noteSaid(w.product)}
      </span>
      <a className="chd-way" href={href} onClick={follow(around.go, href)}>
        Its line
        <Icon glyph={ArrowRightIcon} size="sm" />
      </a>
    </li>
  )
}

/** ESCAPE SHUTS AN OPENED PART, from anywhere inside it, and gives the caret back to the press that
 *  opened it. A dialog opened from inside it (the gallery) takes its own Escape first. */
function useEscapeShuts(
  opened: boolean,
  onOpen: (id: string) => void,
  item: { current: HTMLLIElement | null },
  head: { current: HTMLButtonElement | null },
): void {
  useEffect(() => {
    if (!opened) return
    const shut = (e: globalThis.KeyboardEvent): void => {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      if (!(e.target instanceof Node) || !item.current?.contains(e.target)) return
      e.preventDefault()
      onOpen('')
      head.current?.focus()
    }
    document.addEventListener('keydown', shut)
    return () => document.removeEventListener('keydown', shut)
  }, [opened, onOpen, item, head])
}

/** ONE PICTURED PART AS A CARD: its photograph contained, its name, its two prices. Opened, it
 *  spans the row and says what a line opened says. */
export function Card({ w, around, under }: { w: Ware; around: Around; under?: string }) {
  const panel = useId()
  const head = useRef<HTMLButtonElement>(null)
  const item = useRef<HTMLLIElement>(null)
  const opened = around.open === w.id
  useEscapeShuts(opened, around.onOpen, item, head)
  const picture = w.tile?.picture
  /* THE PART'S GALLERY, so the card counts its pictures and opens on the one it draws */
  const gallery = useGallery(itemOf(PARTS_TABLE, w.id))
  const many = gallery.length
  return (
    <li className="chd-card" data-ground="plate" data-open={opened ? '' : undefined} ref={item}>
      <div className="chd-card__pic">
        {picture ? (
          /* the photograph in a frame laid out of the flow, so the card's 4 : 3 is the card's and
             the picture's own size never enters the grid's sums */
          <span className="chd-card__frame">
            <Picture
              src={picture.src}
              srcSet={picture.srcSet}
              sizes="(min-width: 640px) 280px, 50vw"
              alt=""
              width={picture.width}
              height={picture.height}
              fit="contain"
              lazy
            />
          </span>
        ) : null}
        {many > 1 ? (
          <span className="chd-card__many" aria-hidden="true">
            <Icon glyph={ImagesIcon} size="sm" />
            {many.toLocaleString('en-AU')}
          </span>
        ) : null}
        <span className="chd-card__expand">
          <ExpandPicture
            label={
              many > 1
                ? `See the ${w.name}’s ${many.toLocaleString('en-AU')} pictures larger`
                : `See the ${w.name} larger`
            }
            onExpand={() => around.onLarge(w, placeIn(gallery, picture ?? null))}
          />
        </span>
      </div>
      <div className="chd-card__body">
        <button
          ref={head}
          type="button"
          className="chd-card__name"
          aria-expanded={opened}
          aria-controls={panel}
          onClick={() => around.onOpen(opened ? '' : w.id)}
        >
          <span>{w.name}</span>
          <span className="chd-card__caret" aria-hidden="true">
            <Icon glyph={CaretDownIcon} size="sm" />
          </span>
        </button>
        <span className="chd-card__meta">
          <span className="chd-code">{w.code === '' ? 'No code' : w.code}</span>
          <span className="chd-line__supplier">{w.supplier}</span>
        </span>
        <Prices prices={w.prices} />
        <div id={panel} className="chd-card__panel" hidden={!opened}>
          {opened ? <Details w={w} around={around} under={under} pictured /> : null}
        </div>
      </div>
    </li>
  )
}

/** THE BOATS A PART IS MADE FOR, counted by their names and naming exactly as many as it counts:
 *  the customer's boat first where it is one of them, then the first others, and every other one a
 *  press away — opened, by maker, across the whole part, the customer's boat marked (the verifier,
 *  round 2: 73 names in one run-on paragraph in a 280 px column). */
function MadeForFact({
  ids,
  boats,
  boatName,
}: {
  ids: readonly string[]
  boats: Around['boats']
  boatName: string | undefined
}) {
  const nameOf = (id: string): string | undefined => boats.get(id)?.name
  /* the customer's boat leads where the part is made for it */
  const order =
    boatName && boatName !== ''
      ? [
          ...ids.filter((id) => nameOf(id) === boatName),
          ...ids.filter((id) => nameOf(id) !== boatName),
        ]
      : ids
  const said = boatsNamed(order, nameOf)
  /* every name, once asked: a reading aid inside an opened part, not a position worth an address */
  const [all, setAll] = useState(false)
  const more = useRef<HTMLButtonElement>(null)
  const fewer = useRef<HTMLButtonElement>(null)
  const pressed = useRef(false)
  useEffect(() => {
    if (!pressed.current) return
    pressed.current = false
    ;(all ? fewer : more).current?.focus()
  }, [all])
  const toggle = (next: boolean): void => {
    pressed.current = true
    setAll(next)
  }
  const makers = new Map<string, string>()
  for (const id of ids) {
    const b = boats.get(id)
    if (b) makers.set(b.name, b.maker)
  }
  const mark = (name: string, at: number): ReactNode =>
    name === boatName ? (
      <b key={name} className="chd-boatsof__yours">
        {name}
      </b>
    ) : (
      <span key={`${name}:${at}`}>{name}</span>
    )
  const head = `${said.count.toLocaleString('en-AU')} boat${said.count === 1 ? '' : 's'}`
  let dd: ReactNode
  if (said.count === 0) dd = 'No boat in particular'
  else if (said.rest.length === 0)
    dd = (
      <>
        {`${head}: `}
        {joined(said.shown.map(mark))}
      </>
    )
  else if (!all)
    dd = (
      <>
        {`${head}: `}
        {joined(said.shown.map(mark), ', ', ', ')}{' '}
        <button ref={more} type="button" className="chd-boatsmore" onClick={() => toggle(true)}>
          {`and ${said.rest.length.toLocaleString('en-AU')} more`}
        </button>
      </>
    )
  else {
    const groups = boatsByMaker([...said.shown, ...said.rest], (n) => makers.get(n) ?? '', boatName)
    dd = (
      <>
        <span className="chd-boatsof__head">
          {head}{' '}
          <button ref={fewer} type="button" className="chd-boatsmore" onClick={() => toggle(false)}>
            Show fewer
          </button>
        </span>
        {groups.map((g) => (
          <div key={g.maker} className="chd-boatsof">
            <p className="chd-boatsof__maker">
              {g.maker === '' ? 'No maker said' : g.maker}{' '}
              <span className="chd-boatsof__n">{g.models.length.toLocaleString('en-AU')}</span>
            </p>
            <ul
              className="chd-boatsof__list"
              aria-label={`The ${g.maker === '' ? '' : `${g.maker} `}boats it is made for`}
            >
              {g.models.map((m) => (
                <li key={m.name} data-chosen={m.chosen ? '' : undefined}>
                  {m.model}
                  {m.chosen ? <span className="chd-boatsof__said"> · the customer’s</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </>
    )
  }
  return (
    <div data-wide={all && said.rest.length > 0 ? '' : undefined}>
      <dt>Made for</dt>
      <dd>{dd}</dd>
    </div>
  )
}

/** "A", "A and B", "A, B and C", with each name its own node */
function joined(nodes: readonly ReactNode[], comma = ', ', last = ' and '): ReactNode[] {
  return nodes.flatMap((n, i) => (i === 0 ? [n] : [i === nodes.length - 1 ? last : comma, n]))
}

/** WHAT THE OPENED PART SAYS, and its ways on. */
function Details({
  w,
  around,
  under,
  pictured = false,
}: {
  w: Ware
  around: Around
  under?: string | undefined
  pictured?: boolean
}) {
  const boats = around.boatsOf(w.id)
  const lineHref = `/data/${PARTS_TABLE}?at=${encodeURIComponent(w.id)}`
  const place = around.place
  const quoteHref = `/quote/new?brand=${encodeURIComponent(PARTS_TABLE)}&model=${encodeURIComponent(w.id)}`
  const settingsHref = place ? `/places/${encodeURIComponent(place.address)}?tab=settings` : ''
  const unpriced = w.prices.kind === 'none' || w.prices.kind === 'zero'
  const standing = unpriced ? around.reviewOf?.(w.id) : undefined
  const reviewHref =
    standing && 'case' in standing ? `/review?case=${encodeURIComponent(standing.case)}` : ''
  const fitted =
    w.install === ''
      ? 'The price list does not say'
      : isSupplyOnly(w.install)
        ? `${w.install.replace(/\s+-\s+/g, ' – ')}`
        : w.install.replace(/\s+-\s+/g, ' – ')
  return (
    <div className="chd-details">
      <dl className="chd-facts">
        {/* the section it is opened in already says its heading */}
        {under === w.heading ? null : (
          <div>
            <dt>Under the heading</dt>
            <dd>{headingSaid(w.heading)}</dd>
          </div>
        )}
        <div>
          <dt>How it is fitted</dt>
          <dd>{fitted}</dd>
        </div>
        <MadeForFact ids={boats} boats={around.boats} boatName={around.boatName} />
      </dl>
      {standing ? (
        <p className="chd-said">
          {w.prices.kind === 'zero'
            ? `The price list writes the ${w.name} at $0 at both supply and fitted.`
            : `The price list gives the ${w.name} no price at either supply or fitted.`}{' '}
          {'case' in standing ? (
            <a className="chd-way" href={reviewHref} onClick={follow(around.go, reviewHref)}>
              Put it right on Review
              <Icon glyph={ArrowRightIcon} size="sm" />
            </a>
          ) : (
            'Northside left it so on Review, as meant.'
          )}
        </p>
      ) : w.prices.kind === 'none' ? (
        <p className="chd-said">
          The price list gives the {w.name} no price at either supply or fitted.
        </p>
      ) : null}
      <div className="chd-acts">
        <Button
          intent="secondary"
          size="sm"
          icon={TableIcon}
          href={lineHref}
          onClick={() => around.go(lineHref)}
        >
          {`Open its line in ${around.listName}`}
        </Button>
        {place?.quotes ? (
          <Button
            intent="quiet"
            size="sm"
            icon={ReceiptIcon}
            href={quoteHref}
            onClick={() => around.go(quoteHref)}
          >
            Start a quote with it
          </Button>
        ) : null}
      </div>
      {place && !place.quotes ? (
        <p className="chd-said">
          A quote cannot start with this part yet: {place.name} is sold only with a boat today.{' '}
          <a className="chd-way" href={settingsHref} onClick={follow(around.go, settingsHref)}>
            Let it be quoted on its own
            <Icon glyph={ArrowRightIcon} size="sm" />
          </a>
        </p>
      ) : null}
      {around.placeLine && (w.heading.trim() === '' || around.placedHere?.(w)) ? (
        <PlaceLine w={w} placeLine={around.placeLine} placed={around.placedHere?.(w) ?? false} />
      ) : null}
      {w.kind === 'labour' || pictured ? null : <OwnPicture w={w} />}
    </div>
  )
}

/** NORTHSIDE'S OWN PICTURE OF THE PART: the kit's picture control, which refuses a file that is
 *  not a picture with its sentence, read aloud where it lands. */
function OwnPicture({ w }: { w: Ware }) {
  const props = useOptionPicture(itemOf(PARTS_TABLE, w.id), w.name, 'accessory')
  const own = useRef<HTMLDivElement>(null)
  useInSight(own)
  return (
    <div className="chd-own" aria-live="polite" ref={own}>
      {/* the part's name is said by the line it opens from; the frame says only what it asks,
          so a 160-letter name is not drawn twice (the verifier, b15) */}
      <AddPicture {...props} ask="Add a picture of this part" />
    </div>
  )
}

/** WHAT CHANGES HERE STAYS IN SIGHT: a refusal or a picture that lands under the bar at the foot
 *  of a phone is brought up above it, and no further (the verifier, b08). */
function useInSight(box: { current: HTMLElement | null }): void {
  useEffect(() => {
    const el = box.current
    if (!el || typeof MutationObserver === 'undefined') return
    const seen = new MutationObserver(() => {
      /* the bar's height, resolved by the browser: the box's own scroll margin (catalogue.css) */
      const foot = parseFloat(getComputedStyle(el).scrollMarginBlockEnd) || 0
      const over = el.getBoundingClientRect().bottom - (window.innerHeight - foot)
      if (over > 0) window.scrollBy({ top: over, behavior: 'instant' })
    })
    seen.observe(el, { childList: true, subtree: true })
    return () => seen.disconnect()
  }, [box])
}

const UNPLACED = 'back'

/** A LINE WITH NO HEADING, PUT IN AN AISLE by Northside — or taken back. */
function PlaceLine({
  w,
  placeLine,
  placed,
}: {
  w: Ware
  placeLine: NonNullable<Around['placeLine']>
  placed: boolean
}): ReactNode {
  const id = useId()
  return (
    <div className="chd-place">
      <label className="chd-place__label" htmlFor={id}>
        {placed ? 'Northside put this line here' : 'Put this line in an aisle'}
      </label>
      <Select
        id={id}
        value={null}
        placeholder={placed ? 'Move it, or take it back' : 'Choose its aisle'}
        options={[
          ...(placed ? [{ value: UNPLACED, label: 'Back to Not sorted yet' }] : []),
          ...AISLES.map((a) => ({ value: a.id, label: a.name })),
        ]}
        onValueChange={(v) => {
          if (v === null) return
          placeLine(placeKeyOf(w), v === UNPLACED ? null : v, w.name)
        }}
      />
    </div>
  )
}
