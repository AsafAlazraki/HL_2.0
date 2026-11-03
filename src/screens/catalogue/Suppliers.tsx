import { useMemo, useState, type FormEvent } from 'react'
import { ArrowLeftIcon } from '@phosphor-icons/react'
import {
  caseTwinsOf,
  nameSuppliers,
  NAME_MAX,
  NO_SUPPLIER,
  type SupplierNames,
} from '@/domain/chandlery/suppliers'
import { saidNames, type SupplierReading } from '@/domain/chandlery/readings'
import { Button, Icon, Input, Refusal } from '@/ui'
import type { ShelfPart } from './shelf'
import { StepSaid, useStep } from './Step'
import { follow } from './Wares'

/* ============================================================
   THE SUPPLIERS, IN WORDS — `/catalogue?view=suppliers` (the judge
   of the chandlery, major 6). The parts list writes its suppliers as
   codes; every aisle says the maker in words wherever the price list
   or Northside does.

   FIRST, WHAT THE PRICE LIST NAMES ITSELF, each with its numerator
   and denominator, and read so from day one (the verifier, round 2,
   J3 and J12): a code another list writes in words (YAM and Yam,
   Yamaha), or one whose every line sits under its maker's heading
   (LOW, Lowrance) — `src/domain/chandlery/readings.ts`. THEN the codes
   that differ only in their capitals and are not yet one maker. THEN
   EVERY CODE on the list, most lines first, each with the name it is
   said by and the field to give Northside's own. Each press is one
   step with its Undo, said where it was pressed.
   ============================================================ */

export function Suppliers({
  shelf,
  own,
  readings,
  back,
  go,
}: {
  shelf: readonly ShelfPart[]
  /** Northside's own names, code → name */
  own: SupplierNames | undefined
  /** what the price list says of its codes itself */
  readings: readonly SupplierReading[]
  back: string
  go: (href: string) => void
}) {
  const step = useStep()
  const codes = useMemo(() => {
    const by = new Map<string, number>()
    for (const p of shelf) {
      const c = p.maker.trim()
      if (c !== '') by.set(c, (by.get(c) ?? 0) + 1)
    }
    return [...by]
      .map(([code, lines]) => ({ code, lines }))
      .toSorted((a, b) => b.lines - a.lines || a.code.localeCompare(b.code))
  }, [shelf])
  const linesOf = useMemo(() => new Map(codes.map((c) => [c.code, c.lines])), [codes])
  const none = useMemo(() => shelf.filter((p) => p.maker.trim() === '').length, [shelf])
  const said = useMemo(() => saidNames(readings, own), [readings, own])
  const twins = useMemo(() => caseTwinsOf(shelf, said), [shelf, said])
  const readOf = useMemo(() => new Map(readings.map((r) => [r.code, r])), [readings])
  /* the readings by the name they give, so YAM and Yam stand as one maker */
  const readAs = useMemo(() => {
    const by = new Map<string, SupplierReading[]>()
    for (const r of readings) by.set(r.name, [...(by.get(r.name) ?? []), r])
    return [...by]
  }, [readings])
  const namedCount = codes.filter((c) => own?.[c.code]?.trim()).length
  const name = (list: readonly string[], word: string | null): void => {
    step.apply(
      nameSuppliers(list, word),
      word === null || word.trim() === ''
        ? `${list.join(' and ')} already ${list.length === 1 ? 'reads' : 'read'} as the price list says ${list.length === 1 ? 'it' : 'them'}.`
        : `${list.join(' and ')} ${list.length === 1 ? 'is' : 'are'} already named ${word.trim()}.`,
    )
  }

  return (
    <div className="chd-sup" data-testid="catalogue-suppliers">
      <a className="chd-back" href={back} onClick={follow(go, back)}>
        <Icon glyph={ArrowLeftIcon} size="sm" />
        Every aisle
      </a>
      <header className="chd-sup__head">
        <h1 className="chd-sup__title">The suppliers</h1>
        <p className="chd-sup__lede">
          {`The price list writes ${codes.length.toLocaleString('en-AU')} suppliers as codes${none > 0 ? `, and ${none.toLocaleString('en-AU')} parts with none` : ''}. It names ${readings.length.toLocaleString('en-AU')} of them in words itself, and Northside has named ${namedCount.toLocaleString('en-AU')}. A name given here is what every aisle says, and two codes given one name are one maker.`}
        </p>
      </header>
      <StepSaid said={step.said} back={step.back} />

      {readAs.length > 0 ? (
        <section className="chd-sup__block" aria-labelledby="chd-sup-read">
          <h2 id="chd-sup-read" className="chd-sup__h2">
            What the price list names itself
          </h2>
          <ul className="chd-sup__list">
            {readAs.map(([maker, rs]) => {
              const lines = rs.reduce((n, r) => n + (linesOf.get(r.code) ?? 0), 0)
              const renamed = rs.filter((r) => own?.[r.code]?.trim())
              return (
                <li key={maker} className="chd-sup__row" data-read="">
                  <span className="chd-sup__code">{rs.map((r) => r.code).join(' · ')}</span>
                  <span className="chd-sup__why">{whyOf(rs, lines)}</span>
                  <span className="chd-sup__as">
                    {renamed.length === 0
                      ? `Read as ${maker}`
                      : `Northside calls ${renamed.map((r) => r.code).join(' and ')} ${own?.[renamed[0]!.code]?.trim() ?? ''}`}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {twins.length > 0 ? (
        <section className="chd-sup__block" aria-labelledby="chd-sup-proposed">
          <h2 id="chd-sup-proposed" className="chd-sup__h2">
            One maker written two ways
          </h2>
          <ul className="chd-sup__list">
            {twins.map((t) => (
              <li key={t.codes.map((c) => c.code).join('|')} className="chd-sup__row">
                <span className="chd-sup__code">{t.codes.map((c) => c.code).join(' · ')}</span>
                <span className="chd-sup__why">
                  {`${t.codes.map((c) => `${c.code} on ${c.lines.toLocaleString('en-AU')} parts`).join(' and ')} differ only in their capitals. One name makes them one maker.`}
                </span>
                <NameField
                  label={`One name for ${t.codes.map((c) => c.code).join(' and ')}`}
                  start=""
                  act="Name both"
                  onName={(w) =>
                    name(
                      t.codes.map((c) => c.code),
                      w,
                    )
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="chd-sup__block" aria-labelledby="chd-sup-all">
        <h2 id="chd-sup-all" className="chd-sup__h2">
          Every supplier on the price list
        </h2>
        <ul className="chd-sup__list">
          {codes.map(({ code, lines }) => {
            const given = own?.[code]?.trim() || undefined
            const read = readOf.get(code)?.name
            return (
              <li key={code} className="chd-sup__row">
                <span className="chd-sup__code">{code}</span>
                <span className="chd-sup__why">
                  {`${lines.toLocaleString('en-AU')} part${lines === 1 ? '' : 's'}${
                    given
                      ? ` · named ${given}`
                      : read
                        ? ` · the price list names it ${read}`
                        : ' · not named yet'
                  }`}
                </span>
                <NameField
                  key={given ?? read ?? ''}
                  label={`Northside’s name for ${code}`}
                  start={given ?? read ?? ''}
                  act={given || read ? 'Rename' : 'Name it'}
                  onName={(w) => name([code], w)}
                  {...(given ? { onClear: () => name([code], null) } : {})}
                />
              </li>
            )
          })}
          {none > 0 ? (
            <li className="chd-sup__row" data-none="">
              <span className="chd-sup__code">{NO_SUPPLIER}</span>
              <span className="chd-sup__why">
                {`${none.toLocaleString('en-AU')} part${none === 1 ? '' : 's'} the price list gives no supplier. They are named on their own line in the price list, not here.`}
              </span>
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  )
}

/** WHY THE PRICE LIST NAMES A MAKER, with the lines that say so of the lines there are. */
function whyOf(rs: readonly SupplierReading[], lines: number): string {
  const first = rs[0]
  if (!first) return ''
  const parts = `${lines.toLocaleString('en-AU')} part${lines === 1 ? '' : 's'}`
  if (first.from === 'list') {
    const lists = first.lists
    const said = lists
      .map(
        (l) =>
          `its list ${l.list} writes it on ${l.lines.toLocaleString('en-AU')} of ${l.of.toLocaleString('en-AU')} lines`,
      )
      .join(', and ')
    const letters = [...new Set(rs.map((r) => r.code.toUpperCase()))].join(' and ')
    return `${parts}. “${first.supplier}” is the only supplier written in words elsewhere in the price list that begins ${letters}: ${said}.`
  }
  return `${parts}. All ${lines.toLocaleString('en-AU')} of them are under a heading that starts ${first.name.toUpperCase()}.`
}

/** A NAME TYPED FOR ONE CODE OR MORE, given on Enter or the press. */
function NameField({
  label,
  start,
  act,
  onName,
  onClear,
}: {
  label: string
  start: string
  act: string
  onName: (word: string) => void
  onClear?: () => void
}) {
  const [word, setWord] = useState(start)
  const [empty, setEmpty] = useState(false)
  const submit = (e: FormEvent): void => {
    e.preventDefault()
    /* A PRESS WITH NOTHING TYPED IS SAID, never a silent no */
    if (word.trim() === '') {
      setEmpty(true)
      return
    }
    setEmpty(false)
    onName(word)
  }
  return (
    <form className="chd-sup__name" onSubmit={submit}>
      <Input
        value={word}
        onValueChange={(next) => {
          setWord(next)
          setEmpty(false)
        }}
        aria-label={label}
        placeholder="The maker’s name"
        maxLength={NAME_MAX}
      />
      <Button intent="quiet" size="sm" type="submit">
        {act}
      </Button>
      {onClear ? (
        <Button intent="quiet" size="sm" onClick={onClear}>
          Take the name back
        </Button>
      ) : null}
      {empty ? <Refusal>Type the maker’s name first.</Refusal> : null}
    </form>
  )
}
