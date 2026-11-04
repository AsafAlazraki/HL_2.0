import { useMemo } from 'react'
import { ArrowRightIcon } from '@phosphor-icons/react'
import { Button } from '@/ui'
import { useCatalogue } from '@/app/useStores'
import { standingGalleries, standingOwnPictures } from '@/domain/catalogue/pictureCommands'
import { decidedElsewhere, whenSaid } from '@/domain/northside/decided'

/* ============================================================
   DECIDED ELSEWHERE — the rest of the index of everything Northside has
   decided (the judge of Settings, 2026-11-04, L4). Settings keeps the
   letterhead, the quote's words, the people and the look; five other
   rooms keep a decision each, and this says each one counted, with its
   door and who changed it last where that is kept.

   EVERY COUNT IS OF RECORDS NORTHSIDE MADE (`decidedElsewhere`), never a
   figure of the price file, and a count of nothing says what nothing
   means there.
   ============================================================ */

export function Elsewhere({ go }: { go?: (href: string) => void }) {
  const org = useCatalogue((s) => s.org)
  const stamps = useCatalogue((s) => s.stamps)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const index = useCatalogue((s) => s.index)
  const own = useCatalogue((s) => s.ownPictures)
  const arranged = useCatalogue((s) => s.galleries)
  const all = useMemo(() => {
    const data = { tables, rows, index, ownPictures: own, galleries: arranged } as Parameters<
      typeof standingOwnPictures
    >[0]
    return decidedElsewhere({
      org,
      stamps,
      pictures: standingOwnPictures(data),
      galleries: standingGalleries(data),
    })
  }, [org, stamps, tables, rows, index, own, arranged])
  const now = new Date()

  return (
    <section
      className="mg-elsewhere"
      data-ground="plate"
      id="mg-elsewhere"
      aria-labelledby="mg-elsewhere-title"
      data-testid="manage-elsewhere"
    >
      <div className="mg-elsewhere__head">
        <h2 className="mg-eyebrow" id="mg-elsewhere-title">
          Decided elsewhere
        </h2>
        <p className="mg-head__say">
          What Northside has decided in the price list’s rooms, each counted from what Northside
          kept.
        </p>
      </div>
      <ul className="mg-elsewhere__list">
        {all.map((d) => (
          <li className="mg-decided" key={d.key} data-none={d.count === 0 ? '' : undefined}>
            <p className="mg-decided__name">{d.name}</p>
            <p className="mg-decided__count">{d.said}</p>
            <p className="mg-decided__holds">{d.holds}</p>
            {d.last ? (
              <p className="mg-decided__last">
                {`Last ${d.last.by ? `by ${d.last.by}, ` : ''}${whenSaid(d.last.at, now)}`}
              </p>
            ) : null}
            <Button
              intent="quiet"
              size="sm"
              icon={ArrowRightIcon}
              href={d.door}
              onClick={go ? () => go(d.door) : undefined}
              aria-label={`${d.name}: open ${d.room}`}
            >
              {`Open ${d.room}`}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
