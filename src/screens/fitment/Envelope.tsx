import { useMemo, useRef, type KeyboardEvent } from 'react'
import { offeredOf, type MotorDot, type MotorFit } from '@/domain/fitment/boat'
import { refusedSaid } from '@/domain/fitment/say'

/* ============================================================
   THE HORSEPOWER, AS A PLACE — direction B's envelope, grafted into
   board C's transom callout (docs/directions/fitment-boards/, the
   verdict's graft).

   Every single-motor Yamaha the price list sells is one dot, stood on
   its horsepower along a square-root axis — the axis the board drew,
   because 2.5 hp and 450 hp are both on it and a straight scale would
   crush every outboard under 50 hp into one column. The hp this boat's
   own row states is a lit band. The motors the price list makes for
   this boat are solid; the ones inside the band and not made for it are
   rings; the rest are faint. So "takes 150–200 hp" is something a dealer
   can point at beside the buyer, and the 30 rings are the 30 motors he
   could ask the price list about. One made for it that a dealer's own
   rule refuses is a struck ring in the refusal's ink, and the key
   counts it apart, as the build does (`offeredOf`).

   NOTHING HERE IS A FIGURE OF ITS OWN. Every dot, every count and every
   bound is the reading's (`@/domain/fitment/boat`), and the twin and
   triple rigs, which the boat's row cannot place, are counted beside
   the plot rather than drawn on it.

   A DOT IS A MARK, AND THE PRESSABLE ONES ARE BUTTONS. The kit has no
   primitive for a mark on a chart, and a 7px dot is not a control the
   kit draws; it is drawn here the way Data draws its own chips, as a
   real `<button>` with its own name. The plot is ONE tab stop: the
   arrow keys walk the pressable dots, lightest first (the roving
   tabindex), so a keyboard does not have to cross 37 stops to leave it.
   ============================================================ */

/** made for this boat, and refused by one of the dealer's own rules */
const refused = (dot: MotorDot): boolean =>
  dot.standing === 'made' && dot.rule?.severity === 'blocked'

const PITCH = 9 /* px between two dots in one column, a 7px dot and 2px of air */
const NOMINAL = 360 /* the width the columns are spaced for, in px */

interface Column {
  hp: number
  x: number
  dots: MotorDot[]
}

const ORDER: Record<MotorDot['standing'], number> = {
  made: 0,
  inside: 1,
  under: 2,
  over: 2,
  unplaced: 2,
}

function columnsOf(motor: MotorFit): { columns: Column[]; band: [number, number] | null } {
  const byHp = new Map<number, MotorDot[]>()
  for (const d of motor.dots) byHp.set(d.hp, [...(byHp.get(d.hp) ?? []), d])
  const single = motor.envelope?.rigs.find((e) => e.count === 1) ?? null
  const values = [...byHp.keys()]
  const bounds = [single?.min, single?.max].filter((v): v is number => typeof v === 'number')
  const lo = Math.sqrt(Math.min(...values, ...bounds))
  const hi = Math.sqrt(Math.max(...values, ...bounds))
  const raw = (hp: number): number => (hi === lo ? 0.5 : (Math.sqrt(hp) - lo) / (hi - lo))

  /* COLUMNS NEVER TOUCH: 2.5, 4, 5 and 6 hp sit within 7px of each other on the root
     scale, so each column is pushed right of the last by a dot's pitch, and pulled back
     from the end the same way. The order is the scale's; only the crowding is undone. */
  const gap = PITCH / NOMINAL
  const columns: Column[] = [...byHp.entries()]
    .toSorted(([a], [b]) => a - b)
    .map(([hp, dots]) => ({
      hp,
      x: raw(hp),
      dots: dots.toSorted((a, b) => ORDER[a.standing] - ORDER[b.standing]),
    }))
  for (let i = 1; i < columns.length; i++) {
    columns[i]!.x = Math.max(columns[i]!.x, columns[i - 1]!.x + gap)
  }
  for (let i = columns.length - 1; i >= 0; i--) {
    const room = i === columns.length - 1 ? 1 : columns[i + 1]!.x - gap
    columns[i]!.x = Math.min(columns[i]!.x, room)
  }
  const at = (hp: number): number => columns.find((c) => c.hp === hp)?.x ?? raw(hp)
  const band: [number, number] | null =
    single && (single.min !== null || single.max !== null)
      ? [at(single.min ?? Math.min(...values)), at(single.max ?? Math.max(...values))]
      : null
  return { columns, band }
}

const AU = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 1 })

export interface EnvelopeProps {
  motor: MotorFit
  /** the dot whose note is open, by its key */
  at: string
  onInspect: (key: string) => void
}

export function Envelope({ motor, at, onInspect }: EnvelopeProps) {
  const { columns, band } = useMemo(() => columnsOf(motor), [motor])
  const pressable = useMemo(
    () =>
      columns.flatMap((c) =>
        c.dots.filter((d) => d.standing === 'made' || d.standing === 'inside'),
      ),
    [columns],
  )
  const tall = Math.max(1, ...columns.map((c) => c.dots.length))
  const home =
    pressable.find((d) => d.key === at) ?? pressable.find((d) => d.starred) ?? pressable[0]
  const refs = useRef(new Map<string, HTMLButtonElement>())

  const onKey = (event: KeyboardEvent<HTMLDivElement>): void => {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowUp'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
          ? -1
          : 0
    if (step === 0 && event.key !== 'Home' && event.key !== 'End') return
    const here = pressable.findIndex(
      (d) => d.key === (document.activeElement as HTMLElement | null)?.dataset.key,
    )
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? pressable.length - 1
          : Math.min(pressable.length - 1, Math.max(0, (here < 0 ? 0 : here) + step))
    const dot = pressable[next]
    if (!dot) return
    event.preventDefault()
    refs.current.get(dot.key)?.focus()
  }

  const c = motor.counts
  const rangeCount = c.made + c.refused + c.inside
  const ruled = refusedSaid(c.refused, offeredOf(motor.made).rules)
  const lowest = columns[0]?.hp
  const highest = columns.at(-1)?.hp

  return (
    <div className="ft-env">
      <div className="ft-env__ends" aria-hidden="true">
        <span>{lowest === undefined ? '' : `${AU.format(lowest)} hp`}</span>
        <span>{highest === undefined ? '' : `${AU.format(highest)} hp`}</span>
      </div>
      {motor.takes === '' ? null : (
        <p className="ft-env__takes">
          <span className="ft-env__takes-word">Takes</span> {motor.takes}
        </p>
      )}
      <div
        className="ft-env__plot"
        role="toolbar"
        tabIndex={-1}
        aria-label={`Every single ${motor.tableName} motor, placed by its horsepower`}
        onKeyDown={onKey}
        style={{ ['--ft-tall' as string]: String(tall) }}
      >
        {band ? (
          <span
            className="ft-env__band"
            aria-hidden="true"
            style={{
              ['--x' as string]: band[0].toFixed(4),
              ['--w' as string]: (band[1] - band[0]).toFixed(4),
            }}
          />
        ) : null}
        {columns.map((col) =>
          col.dots.map((dot, i) => {
            /* two numbers, and the stylesheet places the dot from them */
            const place = { ['--x' as string]: col.x.toFixed(4), ['--i' as string]: String(i) }
            if (dot.standing !== 'made' && dot.standing !== 'inside') {
              return (
                <span
                  key={dot.key}
                  className="ft-dot"
                  data-standing={dot.standing}
                  aria-hidden="true"
                  style={place}
                />
              )
            }
            const open = dot.key === at
            return (
              <button
                key={dot.key}
                type="button"
                className="ft-dot"
                data-standing={dot.standing}
                data-starred={dot.starred ? '' : undefined}
                data-refused={refused(dot) ? '' : undefined}
                data-key={dot.key}
                ref={(el) => {
                  if (el) refs.current.set(dot.key, el)
                  else refs.current.delete(dot.key)
                }}
                tabIndex={dot.key === home?.key ? 0 : -1}
                aria-pressed={open}
                aria-label={`${dot.name}, ${AU.format(dot.hp)} hp, ${dot.standing === 'made' ? (refused(dot) ? 'made for this boat and refused by your rule' : 'made for this boat') : 'in its range and not made for it'}`}
                onClick={() => onInspect(open ? '' : dot.key)}
                style={place}
              />
            )
          }),
        )}
        <span className="ft-env__axis" aria-hidden="true" />
      </div>
      <p className="ft-env__counts">
        <span>{AU.format(c.under)} under</span>
        <span className="ft-env__in">{AU.format(rangeCount)} in its range</span>
        <span>{AU.format(c.over)} over</span>
      </p>
      <p className="ft-env__key">
        <span className="ft-key" data-standing="made">
          {AU.format(c.made)} made for this boat
        </span>
        {ruled === '' ? null : (
          <span className="ft-key" data-standing="made" data-refused="">
            {ruled}
          </span>
        )}
        <span className="ft-key" data-standing="inside">
          {AU.format(c.inside)} in its range, not made for it
        </span>
        <span className="ft-key" data-standing="over">
          {AU.format(c.under + c.over + c.unplaced)} outside it
        </span>
      </p>
    </div>
  )
}
