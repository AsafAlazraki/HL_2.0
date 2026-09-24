/* ============================================================
   THE PICTURES DOOR — the same table read by its held pictures: one
   card per model where the rows are a model's variants (Highfield),
   one card per row where each row IS a hull (Stacer, Formosa, the
   trailers, the motors), under the heading it is filed under. Pressing
   any of them opens the price list ON it, with the row the picture
   depicts lit and its record showing.

   PICTURES ARE DRAWN AS PICTURES, AND ONLY THEY ARE. The second
   critique found 7 of Roll-Up's 8 tiles grey, each printing the same 22
   words — 32 of Highfield's 67 — so the door that exists to make the
   table visual had a refusal as its loudest content
   (built-critique-m2-close.md §9). Now a shelf is two things
   (`shelvesOf` in src/domain/catalogue/table/shelves.ts): its PICTURES,
   large, each on a plate of the file's palest blue — a maker's studio
   render sits INTO the plate (its white ground multiplied into the
   blue), a photograph on the water fills it — and its NAMES, the ones
   with no picture here, as a short price list beside them, each still a
   press. The reason is said once for the whole door, beside the first
   list it is about; every later list carries only its heading. A door
   with no picture on it at all says so in one sentence and offers the
   price list, which has every one of them.

   THE SHAPE FOLLOWS WHAT A SHELF HOLDS (the app's rule (e): honest
   emptiness is composed, not left over): a lone picture is a FEATURE —
   one wide plate with its words beside it; one or two pictures beside
   names are a SPREAD — Roll-Up's one render large, its seven other
   models listed beside it; three or more are a WALL with the names in a
   column that stays in view beside it; and a shelf with none is its
   NAMES.

   NOTHING STANDS IN FOR A MISSING PICTURE and no picture is drawn
   larger than the copy held: its width and height are the ceiling
   (`maxInlineSize`, `maxBlockSize`), and a plate larger than the copy
   shows the plate around it. One hull's photograph never stands for a
   series of different hulls — `blockPicture` in the engine.

   A NAME IS NEVER CUT. The lead every name on a shelf shares ("Stacer -
   ", "MACKAY MLKR Series Trailer - ") is said by the maker's mark and
   the shelf's heading, so a card prints what is its own and wraps
   rather than ending in "…"; its accessible name keeps the whole.

   `tools/nocodb-gallery.png` is the shape — a plate of cards, each a
   picture over two lines of facts — and
   `boats/highfield-sport-560-specs.png` is the reason the picture
   belongs here and on the spine, and not in a 28 px row.
   ============================================================ */
import { useMemo } from 'react'
import { Button } from '@/ui'
import type { LeafNoun } from '@/domain/catalogue/table/grouping'
import { shelvesOf, shortName, tallyOf, type Shelf } from '@/domain/catalogue/table/shelves'
import type { Card } from './read'
import { noPictureAtAll, noPictureSentence } from './read'

export interface GalleryProps {
  tableName: string
  cards: Card[]
  /** what one card is: a model, a boat, a trailer, a motor */
  noun: LeafNoun
  onOpen: (card: Card) => void
  /** the way back to the price list, offered where there is no picture to show */
  onPriceList: () => void
}

export function Gallery({ tableName, cards, noun, onOpen, onPriceList }: GalleryProps) {
  const shelves = useMemo(() => shelvesOf(cards), [cards])
  const tally = useMemo(() => tallyOf(shelves), [shelves])

  if (cards.length === 0) {
    return (
      <div className="sh-gallery" data-testid="sheet-gallery" data-none="">
        <div className="sh-none">
          <p className="sh-none__say">Nothing on this sheet matches the find field.</p>
        </div>
      </div>
    )
  }

  if (tally.pictured === 0) {
    const none = noPictureAtAll(tally.cards, tally.linked, noun)
    return (
      <div className="sh-gallery" data-testid="sheet-gallery" data-none="">
        <div className="sh-none">
          <p className="sh-none__say">{none.say}</p>
          <p className="sh-none__why">{none.why}</p>
          <Button intent="primary" onClick={onPriceList}>
            Back to the price list
          </Button>
        </div>
      </div>
    )
  }

  /* the reason, once, beside the first list of names it is about */
  const firstBare = shelves.findIndex((s) => s.bare.length > 0)
  const why =
    tally.bare === 0
      ? ''
      : noPictureSentence(
          tally.bare,
          tally.linked,
          tally.shelvesWithBare > 1 ? { of: tally.cards, noun } : undefined,
        )

  return (
    <div className="sh-gallery" data-testid="sheet-gallery">
      {shelves.map((shelf, i) => (
        <ShelfOf
          key={`${shelf.under}:${[...shelf.pictured, ...shelf.bare][0]?.key ?? ''}`}
          shelf={shelf}
          tableName={tableName}
          why={i === firstBare ? why : ''}
          onOpen={onOpen}
        />
      ))}
    </div>
  )
}

function ShelfOf({
  shelf,
  tableName,
  why,
  onOpen,
}: {
  shelf: Shelf<Card>
  tableName: string
  why: string
  onOpen: (card: Card) => void
}) {
  const all = shelf.pictured.length + shelf.bare.length
  const few = shelf.pictured.length > 2 ? 'many' : String(shelf.pictured.length)
  return (
    <section
      className="sh-shelf"
      data-shape={shelf.shape}
      data-pictured={few}
      aria-label={shelf.under || tableName}
    >
      {shelf.under ? (
        <h2 className="sh-shelf__head">
          <span className="sh-shelf__title">{shelf.under}</span>
          {/* a shelf of one says nothing a count could add */}
          {all > 1 ? (
            <span className="sh-shelf__count">
              {shelf.pictured.length === all
                ? `all ${all} with a picture`
                : `${shelf.pictured.length} of ${all} with a picture`}
            </span>
          ) : null}
        </h2>
      ) : null}
      <div className="sh-shelf__body">
        {shelf.pictured.length > 0 ? (
          <ul className="sh-cards">
            {shelf.pictured.map((card) => (
              <PictureCard key={card.key} card={card} lead={shelf.lead} onOpen={onOpen} />
            ))}
          </ul>
        ) : null}
        {shelf.bare.length > 0 ? (
          <div className="sh-bare">
            <p className="sh-bare__head">
              {shelf.pictured.length === 0 ? 'No picture held' : 'Without a picture'}
              <span className="sh-bare__count">{shelf.bare.length}</span>
            </p>
            {why ? <p className="sh-bare__why">{why}</p> : null}
            <ul className="sh-names">
              {shelf.bare.map((card) => (
                <NameCard key={card.key} card={card} lead={shelf.lead} onOpen={onOpen} />
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}

const labelOf = (card: Card): string =>
  `${card.name}${card.count ? `, ${card.count}` : ''}${card.price ? `, ${card.price}` : ''}. Open it on the price list.`

function Figures({ card }: { card: Card }) {
  if (card.figures.length === 0) return null
  return (
    <span className="sh-card__figures">
      {card.figures.map((f) => (
        <span key={`${f.lead}:${f.figure}`} className="sh-card__figure">
          {f.lead ? <span className="sh-card__lead">{f.lead}</span> : null}
          {f.figure}
        </span>
      ))}
    </span>
  )
}

function PictureCard({
  card,
  lead,
  onOpen,
}: {
  card: Card
  lead: string
  onOpen: (card: Card) => void
}) {
  const held = card.picture!
  return (
    <li className="sh-card" data-scene={held.verdict === 'scene' ? '' : undefined}>
      <button
        type="button"
        className="sh-card__button"
        onClick={() => onOpen(card)}
        aria-label={labelOf(card)}
      >
        <span className="sh-card__plate">
          <img
            className="sh-card__picture"
            src={held.at}
            width={held.w}
            height={held.h}
            /* never drawn larger than the copy that is held */
            style={{ maxInlineSize: held.w, maxBlockSize: held.h }}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </span>
        <span className="sh-card__words">
          <span className="sh-card__name">{shortName(card.name, lead)}</span>
          {card.count ? <span className="sh-card__meta">{card.count}</span> : null}
          <Figures card={card} />
          {/* what the picture depicts, where the model has more forms than it shows */}
          {card.caption ? (
            <span className="sh-card__caption">The picture: {card.caption}</span>
          ) : null}
          {card.recommended ? (
            <span className="sh-card__recommended">recommends {card.recommended}</span>
          ) : null}
        </span>
      </button>
    </li>
  )
}

function NameCard({
  card,
  lead,
  onOpen,
}: {
  card: Card
  lead: string
  onOpen: (card: Card) => void
}) {
  return (
    <li className="sh-card" data-bare="">
      <button
        type="button"
        className="sh-card__button"
        onClick={() => onOpen(card)}
        aria-label={labelOf(card)}
      >
        <span className="sh-card__words">
          <span className="sh-card__name">{shortName(card.name, lead)}</span>
          {card.count ? <span className="sh-card__meta">{card.count}</span> : null}
        </span>
        <Figures card={card} />
        <span className="sh-card__go" aria-hidden="true">
          ›
        </span>
      </button>
    </li>
  )
}
