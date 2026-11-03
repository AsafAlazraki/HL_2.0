import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react'
import type { Worklist } from '@/domain/chandlery/worklist'
import { Icon } from '@/ui'
import { hrefOf } from './at'
import type { AisleFront } from './Door'
import type { Ware } from './read'
import { Line, follow, type Around } from './Wares'

/* ============================================================
   THE PARTS WITH NO PICTURE, ACROSS EVERY AISLE —
   `/catalogue?view=pictures` (the verifier of the chandlery, round 1,
   J9: "There is no worklist across aisles and no order by use on
   quotes").

   Northside's worklist for its own photographs, in the order that
   matters at the desk: first the parts the quotes on this computer
   carry, the most quoted first, each opening in place on the frame
   that takes its picture; then every aisle with how many of its parts
   still have none, each a press to that aisle's "No picture" view. A
   part on no quote is not ranked, because there is nothing to rank it
   by, and the page says so (`unpicturedByUse`).
   ============================================================ */

/** The most quoted parts drawn at once; the rest are counted, never dropped silently. */
const QUOTED_SHOWN = 60

export function Pictures({
  list,
  fronts,
  around,
  aisleCount,
  boat,
}: {
  list: Worklist<Ware>
  fronts: readonly AisleFront[]
  around: Around
  aisleCount: number
  /** the customer's boat, kept on the way back */
  boat: string
}) {
  const back = hrefOf({ boat })
  const shown = list.quoted.slice(0, QUOTED_SHOWN)
  const more = list.quoted.length - shown.length
  return (
    <div className="chd-pics" data-testid="catalogue-pictures">
      <a className="chd-back" href={back} onClick={follow(around.go, back)}>
        <Icon glyph={ArrowLeftIcon} size="sm" />
        {`Every aisle · ${aisleCount}`}
      </a>
      <header className="chd-pics__head">
        <h1 className="chd-pics__title">No picture yet</h1>
        <p className="chd-pics__lede">
          <b>{list.without.toLocaleString('en-AU')}</b> of {list.total.toLocaleString('en-AU')}{' '}
          parts on sale have no picture of their own. The ones the quotes on this computer carry
          come first; every aisle’s are a press away below.
          {list.untaken > 0
            ? ` The ${list.untaken.toLocaleString('en-AU')} labour lines and notes of the price list take no picture, so they are not counted.`
            : ''}
        </p>
      </header>

      <section className="chd-pics__block" aria-labelledby="chd-pics-quoted">
        <h2 id="chd-pics-quoted" className="chd-pics__h2">
          On quotes here, the most quoted first
          {list.quoted.length > 0 ? (
            <span className="chd-pics__n">{list.quoted.length.toLocaleString('en-AU')}</span>
          ) : null}
        </h2>
        {list.quoted.length === 0 ? (
          <p className="chd-said">
            No quote kept on this computer carries a part without a picture, so none comes first.
            Start with the aisle a customer asks about most.
          </p>
        ) : (
          <div className="chd-ledger">
            <ul className="chd-lines" aria-label="Parts on quotes here with no picture">
              {shown.map(({ part, times }) => (
                <Line
                  key={part.id}
                  w={part}
                  around={around}
                  note={`on ${times.toLocaleString('en-AU')} quote${times === 1 ? '' : 's'}`}
                />
              ))}
            </ul>
            {more > 0 ? (
              <p className="chd-said chd-pics__more">
                {`${more.toLocaleString('en-AU')} more on quotes here, each on fewer; every one is in its aisle.`}
              </p>
            ) : null}
          </div>
        )}
      </section>

      <section className="chd-pics__block" aria-labelledby="chd-pics-aisles">
        <h2 id="chd-pics-aisles" className="chd-pics__h2">
          Aisle by aisle
        </h2>
        <ul className="chd-pics__aisles">
          {fronts.map(({ count }) => {
            /* the aisle's parts that take a picture; labour and notes are left out */
            const takes = list.byAisle.get(count.aisle.id)?.takes ?? 0
            const without = list.byAisle.get(count.aisle.id)?.without ?? 0
            if (takes === 0) return null
            const href = hrefOf({ aisle: count.aisle.id, show: 'without', boat })
            return (
              <li key={count.aisle.id} className="chd-pics__aisle">
                <span className="chd-pics__name">{count.aisle.name}</span>
                <span className="chd-pics__count">
                  {without === 0
                    ? `Every one of its ${takes.toLocaleString('en-AU')} is pictured`
                    : `${without.toLocaleString('en-AU')} of ${takes.toLocaleString('en-AU')} with no picture`}
                </span>
                {without === 0 ? null : (
                  <a
                    className="chd-way"
                    href={href}
                    onClick={follow(around.go, href)}
                    aria-label={`Open them: the ${without.toLocaleString('en-AU')} in ${count.aisle.name} with no picture`}
                  >
                    Open them
                    <Icon glyph={ArrowRightIcon} size="sm" />
                  </a>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
