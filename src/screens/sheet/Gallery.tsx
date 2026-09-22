/* ============================================================
   THE GALLERY — direction B's best idea kept as the second door: the
   unit is the MODEL, not the row. One card per innermost drawer under
   its branch's heading — the held render or the maker's mark, the
   model's name, its count in the dealer's word, and the lowest and
   highest figure in the table's own price column. A card opens to its
   rows as a small register with the same cells and the same edit, and
   "Every row" is the last door, labelled.

   `tools/nocodb-gallery.png` is the shape — a plate of cards, each a
   picture over two lines of facts — and `boats/highfield-sport-560-specs.png`
   is the reason the picture belongs here and not in a 28 px row: the
   maker prints a render per colourway at card size, captioned with
   the very codes the Variant column holds.

   ON A TABLE WITH NO PICTURE COLUMN the card is the category, its
   count and its price band, drawn first, because 32 of Highfield's 67
   models hold no picture either: the card that holds nothing is the
   common card and is designed as one, never left as a hole.
   ============================================================ */
import { useMemo } from 'react'
import { Button } from '@/ui'
import type { EntityDef } from '@/domain/model'
import type { Card } from './read'
import { NO_PICTURE_FOR_MODEL } from './read'
import type { HeldMark } from './pictures'

export interface GalleryProps {
  table: EntityDef
  cards: Card[]
  mark: HeldMark | null
  /** how many rows the outline holds, for the last door */
  rowCount: number
  noun: { one: string; many: string }
  onOpen: (key: string) => void
  onEveryRow: () => void
}

export function Gallery({ table, cards, mark, rowCount, noun, onOpen, onEveryRow }: GalleryProps) {
  /* cards under the heading they are filed under, in the file's order */
  const shelves = useMemo(() => {
    const out: { under: string; cards: Card[] }[] = []
    for (const card of cards) {
      const last = out[out.length - 1]
      if (last && last.under === card.under) last.cards.push(card)
      else out.push({ under: card.under, cards: [card] })
    }
    return out
  }, [cards])

  return (
    <div className="sh-gallery" data-testid="sheet-gallery">
      {shelves.map((shelf) => (
        <section
          key={`${shelf.under}:${shelf.cards[0]?.key ?? ''}`}
          className="sh-shelf"
          aria-label={shelf.under || table.name}
        >
          {shelf.under ? (
            <h2 className="sh-shelf__head">
              {shelf.under}
              <span className="sh-shelf__count">
                {shelf.cards.length} {shelf.cards.length === 1 ? 'card' : 'cards'}
              </span>
            </h2>
          ) : null}
          <ul className="sh-cards">
            {shelf.cards.map((card) => (
              <li key={card.key} className="sh-card">
                <button
                  type="button"
                  className="sh-card__button"
                  onClick={() => onOpen(card.key)}
                  aria-label={`${card.name}, ${card.count}${card.priceBand ? `, ${card.priceLabel} ${card.priceBand}` : ''}`}
                >
                  <span className="sh-card__plate" data-held={card.picture ? '' : undefined}>
                    {card.picture ? (
                      <img
                        className="sh-card__picture"
                        src={card.picture.at}
                        width={card.picture.w}
                        height={card.picture.h}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ) : mark ? (
                      <img
                        className="sh-card__mark"
                        src={mark.at}
                        width={mark.w}
                        height={mark.h}
                        alt=""
                      />
                    ) : (
                      <span className="sh-card__type">{card.name}</span>
                    )}
                    {card.picture ? null : (
                      <span className="sh-card__nopicture">
                        {card.linkedOnly
                          ? `${NO_PICTURE_FOR_MODEL} — held as a link`
                          : NO_PICTURE_FOR_MODEL}
                      </span>
                    )}
                  </span>
                  <span className="sh-card__name">{card.name}</span>
                  <span className="sh-card__facts">
                    <span>{card.count}</span>
                    {card.priceBand ? (
                      <span className="sh-card__price">
                        {card.priceLabel} {card.priceBand}
                      </span>
                    ) : null}
                    {card.recommended ? (
                      <span className="sh-card__recommended">recommends {card.recommended}</span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className="sh-gallery__foot">
        <Button intent="veiled" onClick={onEveryRow}>
          Every {noun.one === 'row' ? 'row' : noun.many} ({rowCount.toLocaleString('en-AU')})
        </Button>
        <p className="sh-gallery__say">The outline: every row of {table.name} in one scroll.</p>
      </div>
    </div>
  )
}
