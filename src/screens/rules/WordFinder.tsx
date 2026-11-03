import { useMemo, useState } from 'react'
import { Combobox } from '@base-ui/react/combobox'
import { CheckIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Icon } from '@/ui'
import type { PairValue } from '@/domain/rules/constraints/pairRules'

/* ============================================================
   A WORD CHOSEN FROM A LONG LIST — the boat's model out of 289, the
   motor's out of 241 — found by typing, read maker by maker.

   THE FAULT (judge.md, data round, 2026-11-03, B4): the model list was
   289 raw file strings in one unsearched list, "495 - Pro Fisher.",
   each trailed by a meaningless "1". Here each value is said as a
   person says that model (`modelsNamed`), grouped under its maker, and
   the list narrows as the name is typed. The trigger is the same
   chosen word every other word of the sentence is (`ui-select-trigger`
   in its `word` look), so the sentence reads as one sentence.

   Base UI's Combobox carries the listbox, the arrows, Home/End,
   Escape, the typed filter and focus back to the word. Only the
   drawing is this screen's.

   THE MAKERS IN THE ORDER THE COUNT BESIDE IT READS THEM, A to Z
   (verify 1, data round: the finder opened on Surtees while the count
   read Formosa to Surtees). ON A SHORT WINDOW (a phone on its side,
   390px tall) the list may stand over its own word rather than flip
   into the 180px left either side of it, so it shows more than two
   models (`data-short`, read when it opens).
   ============================================================ */

/** A window too short to hold the list on either side of its word. */
const SHORT = '(max-height: 520px)'

/** Room every list keeps from the window's edges, in px. */
const EDGE = 8

/**
 * WHAT THE SHELL'S PILL TAKES, read off the shell's own tokens when the list opens (verify 2, data
 * round: on a phone on its side the list opened unfiltered stood at y 10 over the pill, from Find
 * to Customers). The pill's clearance at the head (`--shell-inset`) and at the foot
 * (`--shell-foot`) is room the list keeps clear of, as it keeps clear of the window's edge.
 */
function px(name: string): number {
  if (typeof window === 'undefined' || typeof getComputedStyle !== 'function') return 0
  const n = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name))
  return Number.isFinite(n) ? n : 0
}

function shellRoom(): { top: number; bottom: number; left: number; right: number } {
  return {
    top: Math.max(EDGE, px('--shell-inset')),
    bottom: Math.max(EDGE, px('--shell-foot')),
    left: EDGE,
    right: EDGE,
  }
}

interface Item {
  value: string
  label: string
}

interface Group {
  maker: string
  items: Item[]
}

export function WordFinder({
  values,
  value,
  onValue,
  placeholder,
  'aria-label': ariaLabel,
  noun,
}: {
  values: readonly PairValue[]
  value: string
  onValue: (value: string) => void
  placeholder: string
  'aria-label': string
  /** what is being looked for, for the field's own words: "a boat model" */
  noun: string
}) {
  const groups = useMemo<Group[]>(() => {
    const at = new Map<string, Group>()
    for (const v of values) {
      const maker = v.group ?? ''
      const group = at.get(maker) ?? { maker, items: [] }
      group.items.push({ value: v.value, label: v.said })
      at.set(maker, group)
    }
    const out = [...at.values()].toSorted((a, b) =>
      a.maker.localeCompare(b.maker, 'en-AU', { numeric: true }),
    )
    for (const g of out)
      g.items.sort((a, b) => a.label.localeCompare(b.label, 'en-AU', { numeric: true }))
    return out
  }, [values])
  const chosen = useMemo(
    () => groups.flatMap((g) => g.items).find((i) => i.value === value) ?? null,
    [groups, value],
  )

  const [short, setShort] = useState(false)
  const [room, setRoom] = useState(() => ({ top: EDGE, bottom: EDGE, left: EDGE, right: EDGE }))

  return (
    <Combobox.Root<Item>
      items={groups}
      value={chosen}
      onValueChange={(next) => onValue(next?.value ?? '')}
      onOpenChange={(open) => {
        if (!open) return
        if (typeof window.matchMedia === 'function') setShort(window.matchMedia(SHORT).matches)
        setRoom(shellRoom())
      }}
      itemToStringLabel={(item) => item.label}
      isItemEqualToValue={(a, b) => a.value === b.value}
    >
      <Combobox.Trigger className="ui-select-trigger" data-look="word" aria-label={ariaLabel}>
        <Combobox.Value placeholder={placeholder} />
      </Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Positioner
          className="ui-positioner"
          sideOffset={6}
          align="start"
          collisionPadding={room}
          {...(short ? { collisionAvoidance: { side: 'shift', align: 'shift' } as const } : {})}
        >
          <Combobox.Popup
            className="hr-finder"
            data-ground="plate"
            data-short={short ? '' : undefined}
            aria-label={ariaLabel}
          >
            <div className="hr-finder__field">
              <Icon glyph={MagnifyingGlassIcon} />
              <Combobox.Input
                className="hr-finder__input"
                placeholder={`Type ${noun}’s name`}
                aria-label={`Find ${noun}`}
              />
            </div>
            <Combobox.Empty className="hr-finder__empty">
              {`No ${noun} on your price list is called that.`}
            </Combobox.Empty>
            <Combobox.List className="hr-finder__list">
              {(group: Group) => (
                <Combobox.Group key={group.maker} items={group.items} className="hr-finder__group">
                  {group.maker === '' ? null : (
                    <Combobox.GroupLabel className="hr-finder__maker">
                      {group.maker}
                    </Combobox.GroupLabel>
                  )}
                  <Combobox.Collection>
                    {(item: Item) => (
                      <Combobox.Item key={item.value} value={item} className="hr-finder__item">
                        <Combobox.ItemIndicator className="hr-finder__tick">
                          <Icon glyph={CheckIcon} />
                        </Combobox.ItemIndicator>
                        <span>{item.label}</span>
                      </Combobox.Item>
                    )}
                  </Combobox.Collection>
                </Combobox.Group>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}
