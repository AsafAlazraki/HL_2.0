import { useMemo, useState, type ComponentType } from 'react'
import {
  AnchorIcon,
  ArrowsOutSimpleIcon,
  BatteryChargingIcon,
  BoatIcon,
  CheckIcon,
  DotsSixVerticalIcon,
  DropIcon,
  FanIcon,
  FishSimpleIcon,
  LifebuoyIcon,
  LightbulbIcon,
  LightningIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  QuestionIcon,
  RadioIcon,
  SpeakerHifiIcon,
  SteeringWheelIcon,
  StickerIcon,
  ToolboxIcon,
  TruckTrailerIcon,
  UmbrellaIcon,
  WavesIcon,
  WrenchIcon,
  type IconProps as PhosphorProps,
} from '@phosphor-icons/react'
import type { CatalogueCtx, QuoteLine } from '@/domain/model'
import { aisleById, aislesOf, makersOf, UNSORTED } from '@/domain/catalogue/aisles'
import { money } from '@/domain/money'
import { itemOf } from '@/data/pictures'
import { useOptionPicture } from '@/app/optionPicture'
import {
  AddPicture,
  Button,
  Chip,
  ExpandPicture,
  Icon,
  Input,
  Picture,
  type LightboxPicture,
} from '@/ui'
import { DRAG_HOW, usePart } from './drag'
import {
  PARTS_TABLE,
  hasPicture,
  matchesName,
  pricerFor,
  shelfOf,
  type PartTile,
  type ShelfPart,
} from './shelf'
import './chandlery.css'

/* ============================================================
   THE CHANDLERY — direction B of docs/directions/choosing.md, picked
   2026-10-30: the parts catalogue, found by what a part is for, the
   same component inside a quote's fit chapter and on /catalogue
   ("one catalogue in two places, learned once").

   WHAT IT IS, TOP TO BOTTOM:
     · the boat it is fitting, held as a chip with what the price list
       makes for it, and "What fits this boat", one press from Fitment
       already on that boat (`/fitment?boat=`);
     · a find field that answers to a part's NAME, never its code;
     · what is on this quote, once, as a basket with each part's way off
       (the walk: parts showed twice, "and not in the list above");
     · what the price list makes for this boat, first;
     · the eighteen aisles and "Not sorted yet", each a drawing, a name
       and its counts measured off the file (`aislesOf`) — every aisle
       at a desk, two counted columns in a hand;
     · the open aisle: its makers as chips with the count set apart from
       the name, and its parts as cards one size, picture or not.

   A PART'S CARD: its own picture, fitted and never cropped, on one
   frame shared by every card (must-change 1), and a press that opens it
   large — or, where the ledger holds none, the dealer's own picture
   door (`AddPicture`), never a drawing in a picture's place
   (must-change 2). Its name, its price at the quote's level, and Add —
   one press, and the same act by dragging it onto the total or by the
   keyboard through its grip (`drag.tsx`).

   A POSITION IS A SEARCH PARAM: the open aisle and its maker are the
   screen's (`aisle`, `maker`), so Back and a shared link land on them.
   What is typed into its find field is the field's alone.
   ============================================================ */

type Phosphor = ComponentType<PhosphorProps>

/** THE DRAWING EACH AISLE IS NAMED BY: a kind of thing, never a product (BCF's "shop by"). */
const DRAWN: Record<string, Phosphor> = {
  sounders: WavesIcon,
  radios: RadioIcon,
  stereo: SpeakerHifiIcon,
  safety: LifebuoyIcon,
  anchoring: AnchorIcon,
  power: BatteryChargingIcon,
  lights: LightbulbIcon,
  trailer: TruckTrailerIcon,
  covers: UmbrellaIcon,
  fishing: FishSimpleIcon,
  electric: LightningIcon,
  propellers: FanIcon,
  steering: SteeringWheelIcon,
  plumbing: DropIcon,
  deck: WrenchIcon,
  highfield: BoatIcon,
  decals: StickerIcon,
  workshop: ToolboxIcon,
  [UNSORTED]: QuestionIcon,
}

/** How many cards an aisle shows before "Show the next". */
const PAGE = 24

export interface ChandleryFitting {
  /** the boat as a person says it: "Highfield Sport 560" */
  boat: string
  /** Fitment, already on this boat */
  fitsHref: string
  /** the parts the price list makes for this boat, by row id, in its order */
  madeFor: readonly string[]
  /** the parts on the quote: row id to the line that carries it */
  on: ReadonlyMap<string, string>
  /** the lines on the quote from this list that the shelf no longer sells, by name */
  put: (line: QuoteLine) => void
  takeOff: (lineId: string) => void
  /** the one sentence every press here is refused for, where there is one */
  refusedBy?: string | undefined
}

export interface ChandleryProps {
  ctx: CatalogueCtx
  /** the price level a figure is said at: the quote's, or Cash */
  levelKey: string
  /** the aisle open, or '' */
  aisle: string
  /** the maker the open aisle is narrowed to, or '' */
  maker: string
  /** where a press writes the open aisle and its maker */
  onAisle: (aisle: string, maker: string) => void
  onLarge: (set: readonly LightboxPicture[], at: number, title: string) => void
  /** inside a quote: what it is fitting, and how a part goes on and off */
  fitting?: ChandleryFitting | undefined
  /** follow an address without a page load */
  go?: ((href: string) => void) | undefined
}

export function Chandlery({
  ctx,
  levelKey,
  aisle,
  maker,
  onAisle,
  onLarge,
  fitting,
  go,
}: ChandleryProps) {
  const [find, setFind] = useState('')
  const [shown, setShown] = useState(PAGE)
  const shelf = useMemo(() => shelfOf(ctx), [ctx])
  const price = useMemo(() => pricerFor(ctx, levelKey), [ctx, levelKey])
  const counted = useMemo(() => aislesOf(shelf, hasPicture), [shelf])
  const byId = useMemo(() => new Map(shelf.map((p) => [p.id, p])), [shelf])

  const open = aisle === '' ? undefined : aisleById(aisle)
  const inAisle = useMemo(
    () => (open ? shelf.filter((p) => p.aisle === open.id) : []),
    [shelf, open],
  )
  const makers = useMemo(() => makersOf(inAisle.map((p) => p.maker)), [inAisle])
  const narrowed = maker === '' ? inAisle : inAisle.filter((p) => p.maker === maker)
  const query = find.trim()
  const found = useMemo(
    () => (query.length < 2 ? [] : shelf.filter((p) => matchesName(p, query))),
    [shelf, query],
  )

  const madeFor = (fitting?.madeFor ?? []).flatMap((id) => {
    const part = byId.get(id)
    return part ? [part] : []
  })
  const onQuote = fitting
    ? [...fitting.on.keys()].flatMap((id) => {
        const part = byId.get(id)
        return part ? [part] : []
      })
    : []

  if (shelf.length === 0) {
    return (
      <p className="cat-none">
        The price list carries no parts and accessories, so there is nothing to choose here.
      </p>
    )
  }

  const goFits = (href: string) => (go ? () => go(href) : undefined)

  return (
    <div className="cat" data-testid="chandlery">
      <div className="cat-head">
        {/* THE BOAT IT IS FITTING, held as the chandlery's own chip (Rivian's gear shop holds the
            vehicle in its header), with what the price list makes for it */}
        <p className="cat-fitting" data-none={fitting ? undefined : ''}>
          <span className="cat-fitting__glyph" aria-hidden="true">
            <Icon glyph={BoatIcon} />
          </span>
          {fitting ? (
            <span>
              Fitting the {fitting.boat}
              <span className="cat-fitting__count">
                {madeFor.length === 0
                  ? ' · nothing made for it on the price list'
                  : ` · ${madeFor.length.toLocaleString('en-AU')} made for it`}
              </span>
            </span>
          ) : (
            <span>
              Fitting no boat
              <span className="cat-fitting__count">{` · ${shelf.length.toLocaleString('en-AU')} on sale`}</span>
            </span>
          )}
        </p>
        <div className="cat-find">
          <label className="cat-find__label" htmlFor="cat-find">
            Find a part by its name
          </label>
          <Input
            id="cat-find"
            type="search"
            icon={MagnifyingGlassIcon}
            value={find}
            onValueChange={(next) => {
              setFind(next)
              setShown(PAGE)
            }}
            placeholder="anchor, vhf, battery box"
          />
        </div>
        <Button
          intent="veiled"
          size="sm"
          icon={ArrowsOutSimpleIcon}
          href={fitting?.fitsHref ?? '/fitment'}
          onClick={goFits(fitting?.fitsHref ?? '/fitment')}
        >
          {fitting ? 'What fits this boat' : 'What fits a boat'}
        </Button>
      </div>

      {fitting && onQuote.length > 0 ? (
        <section className="cat-basket" aria-label="Parts on this quote">
          <h4 className="cat-sub">
            On this quote <span className="cat-count">{onQuote.length}</span>
          </h4>
          <ul className="cat-basket__list">
            {onQuote.map((part) => (
              <Basketed
                key={part.id}
                part={part}
                tile={price(part)}
                lineId={fitting.on.get(part.id)!}
                takeOff={fitting.takeOff}
                refusedBy={fitting.refusedBy}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {query.length >= 2 ? (
        <Shelf
          title={`Named “${query}”`}
          count={found.length}
          parts={found}
          shown={shown}
          more={() => setShown((n) => n + PAGE)}
          price={price}
          fitting={fitting}
          onLarge={onLarge}
          empty={`No part on the price list is named “${query}”. A code is not a name: try what the part is.`}
        />
      ) : (
        <>
          {fitting ? (
            madeFor.length > 0 ? (
              <Shelf
                title={`Made for the ${fitting.boat}`}
                count={madeFor.length}
                parts={madeFor}
                shown={madeFor.length}
                more={() => {}}
                price={price}
                fitting={fitting}
                onLarge={onLarge}
                empty=""
              />
            ) : (
              <p className="cat-said">
                The price list makes no part for the {fitting.boat} in particular. Every part it
                sells is in the aisles.
              </p>
            )
          ) : null}

          <section className="cat-aisles" aria-label="The aisles">
            <h4 className="cat-sub">
              The aisles <span className="cat-count">{counted.length}</span>
            </h4>
            <ul className="cat-aisles__grid">
              {counted.map(({ aisle: a, parts, pictured }) => {
                const Drawn = DRAWN[a.id] ?? QuestionIcon
                const on = open?.id === a.id
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      className="cat-aisle"
                      aria-pressed={on}
                      onClick={() => {
                        setShown(PAGE)
                        onAisle(on ? '' : a.id, '')
                      }}
                    >
                      <span className="cat-aisle__drawn" aria-hidden="true">
                        <Drawn size="100%" weight="light" />
                      </span>
                      <span className="cat-aisle__name">{a.name}</span>
                      <span className="cat-aisle__counts">
                        {`${parts.toLocaleString('en-AU')} part${parts === 1 ? '' : 's'}`}
                        <span className="cat-aisle__pictured">
                          {pictured === 0
                            ? ' · no pictures yet'
                            : ` · ${pictured.toLocaleString('en-AU')} pictured`}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>

          {open ? (
            <section className="cat-open" aria-label={open.name}>
              <h4 className="cat-sub">
                {open.name}{' '}
                <span className="cat-count">{inAisle.length.toLocaleString('en-AU')}</span>
              </h4>
              <p className="cat-said">{open.holds}.</p>
              {makers.length > 1 ? (
                <fieldset className="cat-makers" aria-label={`${open.name} by maker`}>
                  <Chip
                    count={inAisle.length}
                    selected={maker === ''}
                    onSelect={() => onAisle(open.id, '')}
                  >
                    Every maker
                  </Chip>
                  {makers.map((m) => (
                    <Chip
                      key={m.maker}
                      count={m.parts}
                      selected={maker === m.maker}
                      onSelect={() => {
                        setShown(PAGE)
                        onAisle(open.id, maker === m.maker ? '' : m.maker)
                      }}
                    >
                      {m.maker}
                    </Chip>
                  ))}
                </fieldset>
              ) : null}
              <Shelf
                title=""
                count={narrowed.length}
                parts={narrowed}
                shown={shown}
                more={() => setShown((n) => n + PAGE)}
                price={price}
                fitting={fitting}
                onLarge={onLarge}
                empty={`Nothing in ${open.name} is sold by ${maker}.`}
              />
            </section>
          ) : null}
        </>
      )}

      {fitting ? (
        <p className="cat-how" id="cat-how">
          {DRAG_HOW}
        </p>
      ) : null}
    </div>
  )
}

/** One run of part cards, with the pictures among them opened large in turn. */
function Shelf({
  title,
  count,
  parts,
  shown,
  more,
  price,
  fitting,
  onLarge,
  empty,
}: {
  title: string
  count: number
  parts: readonly ShelfPart[]
  shown: number
  more: () => void
  price: (part: ShelfPart) => PartTile | null
  fitting: ChandleryFitting | undefined
  onLarge: (set: readonly LightboxPicture[], at: number, title: string) => void
  empty: string
}) {
  const tiles = [...parts].slice(0, shown).flatMap((part) => {
    const tile = price(part)
    return tile ? [{ part, tile }] : []
  })
  const pictured = tiles.filter((t) => t.tile.picture !== null)
  const large: LightboxPicture[] = pictured.map(({ tile }) => ({
    src: tile.picture!.src,
    width: tile.picture!.width,
    height: tile.picture!.height,
    ...(tile.picture!.srcSet ? { srcSet: tile.picture!.srcSet } : {}),
    alt: tile.name,
    caption: tile.name,
    credit: tile.picture!.credit,
  }))
  const rest = count - tiles.length
  return (
    <section className="cat-shelf" aria-label={title === '' ? undefined : title}>
      {title === '' ? null : (
        <h4 className="cat-sub">
          {title} <span className="cat-count">{count.toLocaleString('en-AU')}</span>
        </h4>
      )}
      {tiles.length === 0 ? (
        empty === '' ? null : (
          <p className="cat-said">{empty}</p>
        )
      ) : (
        <ul className="cat-parts">
          {tiles.map(({ part, tile }) => (
            <PartCard
              key={part.id}
              part={part}
              tile={tile}
              fitting={fitting}
              onLarge={
                tile.picture
                  ? () =>
                      onLarge(
                        large,
                        pictured.findIndex((t) => t.part.id === part.id),
                        title === '' ? 'Parts' : title,
                      )
                  : undefined
              }
            />
          ))}
        </ul>
      )}
      {rest > 0 ? (
        <div className="cat-more">
          <Button intent="veiled" size="sm" icon={PlusIcon} onClick={more}>
            {`Show the next ${Math.min(PAGE, rest).toLocaleString('en-AU')} of ${rest.toLocaleString('en-AU')}`}
          </Button>
        </div>
      ) : null}
    </section>
  )
}

/** One part's card: its picture or the door to the dealer's, its name and price, and Add. */
function PartCard({
  part,
  tile,
  fitting,
  onLarge,
}: {
  part: ShelfPart
  tile: PartTile
  fitting: ChandleryFitting | undefined
  onLarge: (() => void) | undefined
}) {
  const lineId = fitting?.on.get(part.id)
  const on = lineId !== undefined
  const live = fitting !== undefined && !on && fitting.refusedBy === undefined
  const put = (): void => fitting?.put(tile.line)
  const {
    tile: { place: liftPlace, onPointerDown, 'data-lifted': lifted },
    grip: { place: gripPlace, onKeyDown, 'aria-pressed': held },
  } = usePart(part.id, { name: tile.name, amount: tile.amount, put }, live)
  return (
    <li
      className="cat-part"
      ref={liftPlace}
      onPointerDown={onPointerDown}
      data-lifted={lifted}
      data-on={on ? '' : undefined}
    >
      <div className="cat-part__pic">
        {tile.picture ? (
          <>
            <span className="cat-part__frame">
              <Picture
                src={tile.picture.src}
                srcSet={tile.picture.srcSet}
                sizes="240px"
                alt=""
                width={tile.picture.width}
                height={tile.picture.height}
                fit="contain"
                lazy
              />
            </span>
            {onLarge ? (
              <span className="cat-part__expand">
                <ExpandPicture label="See its picture larger" onExpand={onLarge} />
              </span>
            ) : null}
          </>
        ) : (
          <OwnPicture part={part} name={tile.name} />
        )}
      </div>
      <p className="cat-part__name">{tile.name}</p>
      <p className="cat-part__fig">
        {tile.amount === null ? 'No price on the price list' : money(tile.amount)}
      </p>
      {fitting ? (
        <div className="cat-part__acts">
          {on ? (
            <>
              <span className="cat-part__on">
                <Icon glyph={CheckIcon} size="sm" />
                On the quote
              </span>
              <Button
                intent="quiet"
                size="sm"
                onClick={() => fitting.takeOff(lineId)}
                refusedBy={fitting.refusedBy}
              >
                Take it off
              </Button>
            </>
          ) : (
            <>
              <Button
                intent="secondary"
                size="sm"
                icon={PlusIcon}
                onClick={put}
                refusedBy={fitting.refusedBy}
                aria-label={`Add the ${tile.name} to the quote`}
              >
                Add
              </Button>
              {live ? (
                <button
                  type="button"
                  className="cat-part__grip"
                  aria-label={`Lift the ${tile.name} to drag it to the quote`}
                  aria-describedby="cat-how"
                  ref={gripPlace}
                  onKeyDown={onKeyDown}
                  aria-pressed={held}
                >
                  <Icon glyph={DotsSixVerticalIcon} />
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </li>
  )
}

/** The dealer's own picture door, on a part that has no picture of its own. */
function OwnPicture({ part, name }: { part: ShelfPart; name: string }) {
  const props = useOptionPicture(itemOf(PARTS_TABLE, part.id), name, 'accessory')
  return <AddPicture {...props} />
}

/** One part on the quote, in the basket, with its way off. */
function Basketed({
  part,
  tile,
  lineId,
  takeOff,
  refusedBy,
}: {
  part: ShelfPart
  tile: PartTile | null
  lineId: string
  takeOff: (lineId: string) => void
  refusedBy: string | undefined
}) {
  const name = tile?.name ?? part.product
  return (
    <li className="cat-basket__item">
      <span className="cat-basket__pic" aria-hidden="true">
        {tile?.picture ? (
          <Picture
            src={tile.picture.src}
            alt=""
            width={tile.picture.width}
            height={tile.picture.height}
            fit="contain"
          />
        ) : (
          <Icon glyph={ToolboxIcon} />
        )}
      </span>
      <span className="cat-basket__name">{name}</span>
      <Button
        intent="quiet"
        size="sm"
        onClick={() => takeOff(lineId)}
        refusedBy={refusedBy}
        aria-label={`Take the ${name} off the quote`}
      >
        Take it off
      </Button>
    </li>
  )
}
