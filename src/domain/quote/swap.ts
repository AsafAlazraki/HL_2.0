/* ============================================================
   A CHANGE OF MIND, AS ONE COMMAND — and the rigging kit a motor
   names, read off the lines.

   THE CUSTOMER SAYS "ACTUALLY, THE 115" (build-close-critique.md,
   2026-10-19, majors 1 and 2). `addLine` adds and `removeLine`
   removes, and both stay exactly as they are: a quote really does
   carry two batteries, and the ADV7's six rigging pairings of one
   motor (DECISIONS 2026-09-17/18). What the build lacked was the
   act the customer asked for. With the F90LB on the 519, pressing
   the F115LB put a second outboard on a hull rated 60–115 hp and
   the total went from $55,223 to $71,890; the swap took three
   presses, and the F90LB's rigging kit stayed on the quote with
   nothing said, so the workshop rail printed "Motor Yamaha - F90LB"
   beside an F115LB.

   SO A SWAP IS THE ENGINE'S OWN TWO COMMANDS, RUN IN ONE: every line
   in `off` comes off by `removeLine` (by value, at the index it
   held), and every line in `on` goes on by `addLine`, in that order,
   on the document as the previous one left it. It mints ONE event
   naming everything it changed, and hands back ONE inverse: the
   sub-commands' own inverses run backwards, which puts back exactly
   what was there — the frozen figures, the level, the place in the
   section. Its own way back is the swap again, with the same lines,
   so Undo and Put it back are one toast's two words.

   THE RIGGING KIT A MOTOR NAMES IS THE FILE'S, NEVER A GUESS. A
   motor's pairing carries a `Rigging Kit Option` fact naming its
   kit, and a kit's pairing carries a `Motor` fact naming its motor
   (`pairFacts`, frozen onto the line from the join it was picked
   off). Two names are one name when their letters and figures are
   the same in the same order — "Yamaha - F90LB" and "Yamaha · F90LB"
   — and never by resemblance: "F90LB2 - White" is not the F90LB.

   PURE: no React, no store.
   ============================================================ */

import type {
  CatalogueCtx,
  QuoteChange,
  QuoteDef,
  QuoteEvent,
  QuoteLine,
  RowData,
} from '@/domain/model'
import { readCell } from '@/domain/model'
import { newId } from '@/domain/id'
import { addLine, removeLine, isDone, type Done, type QuoteCommand } from './commands'
import { kitGoesWith, kitNamedBy, motorNamedBy, nameKey } from './kits'

/** One line going on, into the section it was offered in. */
export interface GoingOn {
  blockId: string
  line: QuoteLine
}

export interface Swap {
  /** the lines coming off, by id */
  off: readonly string[]
  /** the lines going on, each into its section */
  on: readonly GoingOn[]
  /** what the swap says it did, and what its way back says */
  said: string
  back: string
}

/** Nothing happened and nothing is owed. */
const NOTHING = { refused: '' }

/**
 * TAKE `off` OFF AND PUT `on` ON, AS ONE STEP. Refused with silence
 * when a line it would take off is no longer there, or one it would
 * put on already is — the document moved since the offer was read,
 * and half a swap is a swap nobody asked for.
 */
export function swapLines(swap: Swap): QuoteCommand {
  return (quote, now) => {
    if (swap.off.some((id) => !quote.lines.some((l) => l.id === id))) return NOTHING
    if (swap.on.some(({ line }) => quote.lines.some((l) => l.id === line.id))) return NOTHING
    const steps: QuoteCommand[] = [
      ...swap.off.map((id) => removeLine(id)),
      ...swap.on.map(({ blockId, line }) => addLine(blockId, line)),
    ]
    const done = runAll(quote, now, steps)
    if (done === null) return NOTHING
    const changed: QuoteChange[] = [
      ...swap.off.map((id) => {
        const label = quote.lines.find((l) => l.id === id)?.label ?? null
        return { path: `lines.${id}.label`, from: label, to: null }
      }),
      ...swap.on.map(({ line }) => ({
        path: `lines.${line.id}.label`,
        from: null,
        to: line.label,
      })),
    ]
    const event = eventOf(now, swap.said, changed, swap.on[0]?.line.id)
    return {
      next: done.next,
      said: swap.said,
      event,
      inverse: (current, at) => {
        /* THE WAY BACK RUNS THE SUB-COMMANDS' OWN INVERSES BACKWARDS, so each puts back what
           its own command moved, where it stood; a line already put back by hand is left */
        if (swap.on.some(({ line }) => !current.lines.some((l) => l.id === line.id))) return NOTHING
        const back = runAll(current, at, done.inverses.toReversed())
        if (back === null) return NOTHING
        return {
          next: back.next,
          said: swap.back,
          event: eventOf(
            at,
            swap.back,
            changed.map((c) => ({ path: c.path, from: c.to, to: c.from })),
            swap.off[0],
          ),
          inverse: swapLines(swap),
        }
      },
    }
  }
}

/** Run commands one after another on the document each leaves; null where any refused. */
function runAll(
  quote: QuoteDef,
  now: string,
  steps: readonly QuoteCommand[],
): { next: QuoteDef; inverses: QuoteCommand[] } | null {
  let next = quote
  const inverses: QuoteCommand[] = []
  for (const step of steps) {
    const outcome = step(next, now)
    if (!isDone(outcome)) return null
    next = (outcome satisfies Done).next
    inverses.push(outcome.inverse)
  }
  return { next, inverses }
}

const eventOf = (
  at: string,
  said: string,
  changed: QuoteChange[],
  lineId: string | undefined,
): QuoteEvent => ({
  id: newId(),
  kind: 'line-added',
  at,
  said,
  ...(lineId ? { lineId } : {}),
  changed,
})

/* ---------------------------------------------------------- */
/* The rigging kit a motor names                               */
/* ---------------------------------------------------------- */

/* the four readings stand in `kits.ts`, so the mint can ask them without a circle */
export { nameKey, motorNamedBy, kitNamedBy, kitGoesWith }

/** A line on the quote that names a motor nothing on the quote is, and no motor on it names. */
export interface Orphan {
  /** the line itself — a rigging kit, on this file */
  line: QuoteLine
  /** the motor it names, as the file writes it */
  motor: string
}

/**
 * EVERY LINE ON THE QUOTE THAT IS FOR A MOTOR THE BOAT DOES NOT CARRY. A kit whose `Motor` is a
 * line on the quote is that motor's; a kit a motor on the quote names as its own `Rigging Kit
 * Option` is that motor's too, whatever motor the kit's own row was written against. Anything
 * else names a motor that is not on this boat — taken off, swapped, or never put on — and the
 * rigger would be handed a kit for an engine he will not find.
 */
export function orphanedKits(quote: Pick<QuoteDef, 'lines'>): Orphan[] {
  const found: Orphan[] = []
  for (const line of quote.lines) {
    const motor = motorNamedBy(line)
    if (motor === '') continue
    const key = nameKey(motor)
    const carried = quote.lines.some(
      (other) =>
        other.id !== line.id &&
        (nameKey(other.label) === key || nameKey(kitNamedBy(other)) === nameKey(line.label)),
    )
    if (!carried) found.push({ line, motor })
  }
  return found
}

/* ---------------------------------------------------------- */
/* Whether the hull takes two motors                           */
/* ---------------------------------------------------------- */

/** The hull's own columns that say how it is powered. */
const POWER_FIELD = /\b(hp|eng|engine|motor|shaft|power)\b/i
/** "Sng UL or Twin XL", "2 x 300 HP": the file's own words for a hull rigged with two. */
const TWO_OF_THEM = /\btwin\b|\b2\s*x\s*\d/i

/**
 * THE HULL'S OWN ROW SAYS IT TAKES TWO MOTORS. Highfield and Stabicraft write it in their power
 * columns — "Max HP 2 x 300 HP", "Shaft Lgth Sng UL or Twin XL" — and a hull whose row says
 * nothing of the kind is rated for one. Read off the row the quote is rooted on, in the columns
 * about power only.
 */
export function hullTakesTwo(ctx: CatalogueCtx, quote: QuoteDef): boolean {
  const entity = ctx.entities[quote.rootTableId]
  const row: RowData | undefined = (ctx.rowsByEntity[quote.rootTableId] ?? []).find(
    (r) => r.id === quote.rootRowId,
  )
  if (!entity || !row) return false
  return entity.fields.some((field) => {
    if (!POWER_FIELD.test(field.name)) return false
    const value = readCell(row, field.id)
    return typeof value === 'string' && TWO_OF_THEM.test(value)
  })
}
