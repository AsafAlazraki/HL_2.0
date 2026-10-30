import { specsSaid, type SpecSaid } from './specSay'

/* ============================================================
   THE PRINTED QUOTE'S SPECIFICATION PAGE: every fact the file holds
   for what is sold, grouped as a brochure groups it.

   The paper-handoff walk (2026-10-30, item 2): "Every fact the price
   list carries for the model, grouped (dimensions, weights, power
   range, capacity, material…), never 'OA Length', 'Tube Dia', 'Int
   Length' or 'Bottomsides' as the file spells them. Units should be
   consistent (5.66 m beside 382 cm today)."

   WORDS AND GROUPING ONLY, AND ONE CONVERSION. The labels are
   `specsSaid`'s. The groups are read off the label's own words. The
   one figure that changes form is a length of a metre or more written
   in centimetres, which is said in metres (382 cm is 3.82 m: the same
   length, by arithmetic), so a page that says 5.66 m does not say
   382 cm beside it. A tube's diameter stays in centimetres. No unit is
   ever added to a figure that has none.

   NOT A RECORD FIELD. A table's supplier, its codes, its discontinued
   flag and its price columns are the dealer's, and none of them is a
   fact about the boat; they never reach this page.

   PURE. No React, no store, no DOM.
   ============================================================ */

export type SpecGroupId = 'size' | 'weight' | 'power' | 'capacity' | 'build' | 'more'

export interface SpecGroup {
  id: SpecGroupId
  /** the group's heading, in a brochure's words */
  name: string
  rows: SpecSaid[]
}

const GROUPS: ReadonlyArray<{ id: SpecGroupId; name: string; test: RegExp }> = [
  {
    id: 'size',
    name: 'Size',
    test: /length|beam|width|draft|deadrise|dead rise|diameter|loa\b|height|guards|boats of/i,
  },
  { id: 'weight', name: 'Weight', test: /weight|displacement|atm|tare|tow/i },
  {
    id: 'power',
    name: 'Power',
    test: /power|\bhp\b|shaft|engine|cylinder|starting|control|trim|tilt|rev|motor|gearbox|prop/i,
  },
  {
    id: 'capacity',
    name: 'Capacity',
    test: /fuel|water|people|load|berth|cabin|head|ballast|capacity|persons/i,
  },
  {
    id: 'build',
    name: 'Construction',
    test: /sides|thickness|sheets|chamber|transom|material|hull|tube|winch|wheel/i,
  },
]

/** The order a label is asked in: power before size, since "Shaft length" is a motor's fact. */
const ASKED = [...GROUPS.filter((g) => g.id === 'power'), ...GROUPS.filter((g) => g.id !== 'power')]

/** The file's own record fields and every money column: never a fact about the boat. */
const NOT_A_FACT =
  /supplier|code|discontinued|dealer|operation|matrix|source|price|cost|sell|rrp|nett|landed|freight|rego|registration|margin|\bmu\b|gp\b|warranty|cash|trade/i

/** A length in centimetres of a metre or more, said in metres; anything else as it is. */
function inMetres(label: string, value: string): string {
  if (/diameter|tube/i.test(label)) return value
  const cm = /^(\d+(?:\.\d+)?)\s*cm$/.exec(value.trim())
  if (!cm) return value
  const n = Number(cm[1])
  if (!Number.isFinite(n) || n < 100) return value
  return `${Number((n / 100).toFixed(3)).toLocaleString('en-AU')} m`
}

/**
 * Every specification, said and grouped, in the order the groups are listed and, inside a group,
 * the order the file gives. A group with nothing in it is not drawn.
 */
export function specSheet(specs: readonly { label: string; value: string }[]): SpecGroup[] {
  const said = specsSaid(specs.filter((spec) => !NOT_A_FACT.test(spec.label)))
  const out = new Map<SpecGroupId, SpecGroup>()
  for (const spec of said) {
    if (spec.value.trim() === '') continue
    /* power is asked first, so a shaft's length is power and not size */
    const group = ASKED.find((g) => g.test.test(spec.label)) ?? {
      id: 'more' as const,
      name: 'Details',
    }
    const into = out.get(group.id) ?? { id: group.id, name: group.name, rows: [] }
    if (into.rows.some((row) => row.label === spec.label)) continue
    into.rows.push({ label: spec.label, value: inMetres(spec.label, spec.value) })
    out.set(group.id, into)
  }
  const order: SpecGroupId[] = ['size', 'weight', 'power', 'capacity', 'build', 'more']
  return order.flatMap((id) => {
    const group = out.get(id)
    return group ? [group] : []
  })
}

/**
 * THE FOUR FACTS THE COVER SETS LARGE — a brochure's strip under the name: the first two of its
 * size, then its power and its weight, each only where the sheet holds one. Never more than four,
 * and fewer where the file holds fewer.
 */
export function keyFacts(sheet: readonly SpecGroup[]): SpecSaid[] {
  const of = (id: SpecGroupId, n: number) => sheet.find((g) => g.id === id)?.rows.slice(0, n) ?? []
  const picked = [...of('size', 2), ...of('power', 1), ...of('weight', 1)]
  if (picked.length < 4) picked.push(...of('capacity', 4 - picked.length))
  return picked.slice(0, 4)
}

/**
 * AN ITEM'S OWN FACTS, ALREADY SAID (`lineFacts.ts`), GROUPED THE SAME WAY — the specification
 * page of a quote that is not for a boat: a repower's motor reads "Power 115 hp", "Weight 171 kg",
 * never the file's "HP Rating 115" and "Prop Opt".
 */
export function factSheet(facts: readonly { label: string; value: string }[]): SpecGroup[] {
  const out = new Map<SpecGroupId, SpecGroup>()
  for (const fact of facts) {
    const group = ASKED.find((g) => g.test.test(fact.label)) ?? {
      id: 'more' as const,
      name: 'Details',
    }
    const into = out.get(group.id) ?? { id: group.id, name: group.name, rows: [] }
    into.rows.push({ label: fact.label, value: fact.value })
    out.set(group.id, into)
  }
  /* AN ITEM IS LED BY WHAT IT DOES: a motor's power before its weight */
  const order: SpecGroupId[] = ['power', 'size', 'weight', 'capacity', 'build', 'more']
  return order.flatMap((id) => {
    const group = out.get(id)
    return group ? [group] : []
  })
}
