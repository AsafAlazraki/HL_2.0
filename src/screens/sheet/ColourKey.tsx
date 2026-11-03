/* ============================================================
   THE COLOUR KEY, ONE PRESS FROM THE COLUMN IT EXPLAINS (the sheet's
   verifier, 2026-11-03: no legend anywhere, and nothing a manager could
   complete). The stripes down a colourway column are a code's letters
   drawn as paint; the key says what each letter is, how many lines
   carry it, and who named it — the price file's own map, or Northside.
   A letter nobody has named stands first, with the colours it may be
   named, and naming it is one settings step with its Undo, after which
   every line that carries it draws its stripe.

   The words are the domain's (`colourKey`); this file only draws them.
   ============================================================ */
import { useState, type ReactElement } from 'react'
import { PaletteIcon } from '@phosphor-icons/react'
import { Icon, Popover, Refusal, Select } from '@/ui'
import type { CatalogueCommand } from '@/domain/catalogue/commands'
import {
  COLOUR_CHOICES,
  colourKey,
  nameColour,
  type KeyLine,
} from '@/domain/catalogue/table/colourKey'
import type { LeafNoun } from '@/domain/catalogue/table/grouping'
import type { Written } from './Grid'

const NOT_NAMED = '—'

export function ColourKey({
  codes,
  named,
  noun,
  apply,
}: {
  /** every line's colourway code, as the list carries it */
  codes: readonly string[]
  /** the letters Northside named itself */
  named: Readonly<Record<string, string>>
  noun: LeafNoun
  apply: (command: CatalogueCommand) => Written
}) {
  const [open, setOpen] = useState(false)
  const [said, setSaid] = useState<string | null>(null)
  const lines = colourKey(codes, named)
  if (lines.length === 0) return null
  const unnamed = lines.filter((l) => l.name === null).length

  const button: ReactElement = (
    <button
      type="button"
      className="sh-key"
      tabIndex={-1}
      aria-label={`The colour key: ${lines.length} letters${unnamed > 0 ? `, ${unnamed} not named yet` : ''}`}
    >
      <Icon glyph={PaletteIcon} />
      Key
      {unnamed > 0 ? <span className="sh-key__count">{unnamed}</span> : null}
    </button>
  )

  const name = (line: KeyLine, value: string | null): void => {
    const out = apply(nameColour(line.token, value === NOT_NAMED ? null : value))
    setSaid('refused' in out ? out.refused : null)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSaid(null)
      }}
      side="bottom"
      align="start"
      title="The colour key"
      trigger={button}
    >
      <div className="sh-keylist">
        <p className="sh-keylist__lead">
          Each letter of a colourway code, as its stripe is drawn.
          {unnamed > 0
            ? ` ${unnamed === 1 ? 'One letter is' : `${unnamed} letters are`} not named by the price file; name ${unnamed === 1 ? 'it' : 'them'} here and every line that carries ${unnamed === 1 ? 'it' : 'them'} draws its colour.`
            : ''}
        </p>
        <ul className="sh-keylist__lines">
          {lines.map((l) => (
            <li
              key={l.token}
              className="sh-keyline"
              data-unnamed={l.name === null ? '' : undefined}
            >
              <span
                className="sh-cell__stripe sh-keyline__stripe"
                data-unnamed={l.swatches.length === 0 ? '' : undefined}
                aria-hidden="true"
              >
                {l.swatches.map((s) => (
                  <span key={s} data-swatch={s} />
                ))}
              </span>
              <span className="sh-keyline__token">{l.token}</span>
              {l.by === 'file' ? (
                <span className="sh-keyline__name">{l.name}</span>
              ) : (
                <span className="sh-keyline__choose">
                  <Select
                    aria-label={`What ${l.token} is`}
                    options={[
                      { value: NOT_NAMED, label: 'Not named' },
                      ...COLOUR_CHOICES.map((c) => ({ value: c, label: c })),
                    ]}
                    value={l.name ?? NOT_NAMED}
                    onValueChange={(v) => name(l, v)}
                  />
                </span>
              )}
              <span className="sh-keyline__count">
                {l.lines.toLocaleString('en-AU')} {l.lines === 1 ? noun.one : noun.many}
                {l.by === 'northside' ? ' · named by Northside' : ''}
              </span>
            </li>
          ))}
        </ul>
        {said ? (
          <p className="sh-alarm" role="alert">
            <Refusal>{said}</Refusal>
          </p>
        ) : null}
      </div>
    </Popover>
  )
}
