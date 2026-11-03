import { useMemo, useState, type FormEvent } from 'react'
import { ArrowLeftIcon, CheckIcon } from '@phosphor-icons/react'
import {
  caseTwinsOf,
  headingProposals,
  nameSuppliers,
  NAME_MAX,
  NO_SUPPLIER,
  type SupplierNames,
} from '@/domain/chandlery/suppliers'
import { Button, Icon, Input, Refusal } from '@/ui'
import type { ShelfPart } from './shelf'
import { StepSaid, useStep } from './Step'
import { follow } from './Wares'

/* ============================================================
   THE SUPPLIERS, NAMED BY NORTHSIDE — `/catalogue?view=suppliers`
   (the judge of the chandlery, major 6). The parts list writes its
   suppliers as codes; here Northside says once which maker each code
   is, and every aisle's supplier filter says the maker from then on.
   Two codes given one name are one maker.

   FIRST, WHAT THE PRICE LIST ITSELF PROPOSES, measured with its
   numerator and denominator and never applied without a press: the
   codes whose every line sits under a heading of the maker's name, and
   the codes that differ only in their capitals. THEN EVERY CODE on the
   list, most lines first, each with its name or the field to give it.
   Each press is one step with its Undo, said where it was pressed.
   ============================================================ */

export function Suppliers({
  shelf,
  named,
  back,
  go,
}: {
  shelf: readonly ShelfPart[]
  named: SupplierNames | undefined
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
  const none = useMemo(() => shelf.filter((p) => p.maker.trim() === '').length, [shelf])
  const proposals = useMemo(() => headingProposals(shelf, named), [shelf, named])
  const twins = useMemo(() => caseTwinsOf(shelf, named), [shelf, named])
  const namedCount = codes.filter((c) => named?.[c.code]).length
  const name = (list: readonly string[], word: string | null): void => {
    step.apply(
      nameSuppliers(list, word),
      word === null || word.trim() === ''
        ? `${list.join(' and ')} already ${list.length === 1 ? 'reads' : 'read'} as the price list writes ${list.length === 1 ? 'it' : 'them'}.`
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
          {`The price list writes ${codes.length.toLocaleString('en-AU')} suppliers as codes${none > 0 ? `, and ${none.toLocaleString('en-AU')} parts with none` : ''}. Northside has named ${namedCount.toLocaleString('en-AU')} of them. A name given here is what every aisle says, and two codes given one name are one maker.`}
        </p>
      </header>
      <StepSaid said={step.said} back={step.back} />

      {proposals.length > 0 || twins.length > 0 ? (
        <section className="chd-sup__block" aria-labelledby="chd-sup-proposed">
          <h2 id="chd-sup-proposed" className="chd-sup__h2">
            What the price list proposes
          </h2>
          <ul className="chd-sup__list">
            {proposals.map((p) => (
              <li key={p.code} className="chd-sup__row">
                <span className="chd-sup__code">{p.code}</span>
                <span className="chd-sup__why">
                  {`All ${p.lines.toLocaleString('en-AU')} of its parts are under a heading that starts ${p.name.toUpperCase()}.`}
                </span>
                <Button
                  intent="secondary"
                  size="sm"
                  icon={CheckIcon}
                  onClick={() => name([p.code], p.name)}
                >
                  {`Name it ${p.name}`}
                </Button>
              </li>
            ))}
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
            const given = named?.[code]
            return (
              <li key={code} className="chd-sup__row">
                <span className="chd-sup__code">{code}</span>
                <span className="chd-sup__why">
                  {`${lines.toLocaleString('en-AU')} part${lines === 1 ? '' : 's'}${given ? ` · named ${given}` : ' · not named yet'}`}
                </span>
                <NameField
                  label={`Northside’s name for ${code}`}
                  start={given ?? ''}
                  act={given ? 'Rename' : 'Name it'}
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
