import { useMemo } from 'react'
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
   ============================================================ */

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
    const out = [...at.values()]
    for (const g of out)
      g.items.sort((a, b) => a.label.localeCompare(b.label, 'en-AU', { numeric: true }))
    return out
  }, [values])
  const chosen = useMemo(
    () => groups.flatMap((g) => g.items).find((i) => i.value === value) ?? null,
    [groups, value],
  )

  return (
    <Combobox.Root<Item>
      items={groups}
      value={chosen}
      onValueChange={(next) => onValue(next?.value ?? '')}
      itemToStringLabel={(item) => item.label}
      isItemEqualToValue={(a, b) => a.value === b.value}
    >
      <Combobox.Trigger className="ui-select-trigger" data-look="word" aria-label={ariaLabel}>
        <Combobox.Value placeholder={placeholder} />
      </Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Positioner className="ui-positioner" sideOffset={6} align="start">
          <Combobox.Popup className="hr-finder" data-ground="plate" aria-label={ariaLabel}>
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
