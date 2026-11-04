/* ============================================================
   WHO LAST CHANGED EACH OF NORTHSIDE'S SETTINGS, AND WHEN — KEPT, NOT
   ONLY FOR THE SESSION (the judge of Settings, 2026-11-04, L4: "on a
   shared computer the admin needs to see who changed the GST rate, and
   when").

   The catalogue already keeps who last wrote each cell, and who chose
   each list's price (`domain/pricing/chosen.ts`), as stamps kept with
   the price list. A setting is kept the same way: one stamp per key of
   Northside's profile, under a row id no line of any list can carry
   (`settings:<key>`), written by the step that changed it. A way back
   puts the whole profile back and names no key, so it is stamped under
   `settings:org`, said as a step undone.

   Pure. The store hands each step's event in and keeps what comes
   back; nothing here reads a clock or a name.
   ============================================================ */

import type { CatalogueEvent } from '@/domain/catalogue/commands'
import { stampId, type CellStamp, type Stamps } from '@/domain/catalogue/table/stamps'

const PREFIX = 'settings:'
const FIELD = 'last'

/** The row id a setting's last change is kept under. */
export const settingRow = (key: string): string => `${PREFIX}${key}`

/** `org.<key>` (a change) or `org` (a way back, which puts the whole profile back) */
const SETTING_PATH = /^org(?:\.([^.]+))?/

function keysChanged(
  e: CatalogueEvent,
  by?: string,
  at?: string,
): Array<{ key: string; at: string; by?: string }> {
  const whoNow = e.by ?? by
  const whenNow = e.at || at || ''
  if (e.events && e.events.length > 0)
    return e.events.flatMap((inner) => keysChanged(inner, whoNow, whenNow))
  if (e.kind !== 'settings-changed' && e.kind !== 'undone' && e.kind !== 'redone') return []
  const keys = new Set<string>()
  for (const c of e.changed) {
    const m = SETTING_PATH.exec(c.path)
    if (m) keys.add(m[1] ?? 'org')
  }
  return [...keys].map((key) => ({ key, at: whenNow, ...(whoNow ? { by: whoNow } : {}) }))
}

/** The stamps after one step, with each setting it changed stamped. The same object back when it
 *  changed none, so a store that writes by identity writes nothing. */
export function settingsStamped(stamps: Stamps, e: CatalogueEvent, orgId: string): Stamps {
  const keys = keysChanged(e)
  if (keys.length === 0) return stamps
  const next: Record<string, CellStamp> = { ...stamps }
  for (const k of keys) {
    const rowId = settingRow(k.key)
    const id = stampId(rowId, FIELD)
    next[id] = { id, orgId, rowId, fieldId: FIELD, at: k.at, ...(k.by ? { by: k.by } : {}) }
  }
  return next
}

/** One setting's last change, as it is kept. */
export interface SettingChanged {
  key: string
  at: string
  by?: string
}

/** THE LAST CHANGE OF ANY OF THESE KEYS (every setting where none is named), or null where none is
 *  kept: a change made before this was kept, or on another computer. */
export function lastChanged(stamps: Stamps, keys?: readonly string[]): SettingChanged | null {
  let last: SettingChanged | null = null
  const wanted = keys ? new Set(keys) : null
  for (const s of Object.values(stamps)) {
    if (!s.rowId.startsWith(PREFIX)) continue
    const key = s.rowId.slice(PREFIX.length)
    if (wanted && !wanted.has(key)) continue
    if (!last || s.at > last.at) last = { key, at: s.at, ...(s.by ? { by: s.by } : {}) }
  }
  return last
}
