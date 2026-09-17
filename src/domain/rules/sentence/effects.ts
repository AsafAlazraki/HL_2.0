/* ============================================================
   Pending effects → store writes.

   The engine never touches the store: a run returns SERIALISABLE
   effects describing writes (`PendingEffect`), and this file is
   the only place that commits them.

   Everything is checked against the CURRENT store before it is
   written — a run is a snapshot, and rows or fields it named may
   have been deleted since. Anything stale is reported in the
   effects panel rather than applied.

   PORT NOTE (HL_2.0). `useProjectStore.getState()` was read twice —
   once per effect in `blockedReason`, once for the two mutators in
   `applyPendingEffects` — and neither is available to a pure module.
   The read is now a `CatalogueCtx` the caller takes at the top of the
   event, and the two writes are callbacks beside it.

   "EVERYTHING IS CHECKED AGAINST THE CURRENT STORE" SURVIVES, and it
   is the one thing the caller must now honour rather than inherit.
   `blockedReason` is still re-run per effect, for exactly the reason
   the comment below gives — an earlier effect may have changed the
   world — so `applyPendingEffects` takes its context as a FUNCTION,
   `() => CatalogueCtx`, not as one snapshot. A caller that hands back
   a stale snapshot is committing writes against a world that has
   moved, which is the defect this file exists to prevent.
   ============================================================ */

import type { CatalogueCtx, CellValue } from '@/domain/model'
import type { PendingEffect } from './engine'

/** What this file reads of the world. */
export type EffectCtx = Pick<CatalogueCtx, 'entities' | 'rowsByEntity'>

/** The two writes a commit makes. Both keep the store's own return:
 *  `addRow` answers the row it wrote, or nothing when it refused. */
export interface EffectWrites {
  updateCell: (entityId: string, rowId: string, fieldId: string, value: CellValue) => void
  addRow: (entityId: string, values?: Record<string, CellValue>) => unknown
}

/** What a plan row tells the results rail. */
export interface EffectPlanItem {
  id: string
  kind: PendingEffect['kind']
  nodeId: string
  /** the engine's own human sentence */
  description: string
  /** false ⇒ shown struck through with `reason`; APPLY skips it */
  applicable: boolean
  reason?: string
}

/** Why an effect cannot be committed, or undefined when it can. */
function blockedReason(state: EffectCtx, effect: PendingEffect): string | undefined {
  if (effect.kind === 'flag') return 'display only'

  const entityId = effect.kind === 'link' ? effect.joinEntityId : effect.entityId
  const entity = state.entities[entityId]
  if (!entity) return 'that table no longer exists'

  if (effect.kind === 'set') {
    const rows = state.rowsByEntity[entityId] ?? []
    if (!rows.some((r) => r.id === effect.rowId)) return 'that row no longer exists'
    if (!entity.fields.some((f) => f.id === effect.fieldId)) {
      return 'that field no longer exists'
    }
  }

  return undefined
}

/** What APPLY would do, in the order it would do it. */
export function planEffects(
  ctx: EffectCtx,
  effects: readonly PendingEffect[] | undefined,
): EffectPlanItem[] {
  return (effects ?? []).map((e) => {
    const reason = blockedReason(ctx, e)
    return {
      id: e.id,
      kind: e.kind,
      nodeId: e.nodeId,
      description: e.description,
      applicable: !reason,
      reason,
    }
  })
}

/** Commit every applicable effect. Returns how many writes landed. */
export function applyPendingEffects(
  ctx: () => EffectCtx,
  store: EffectWrites,
  effects: readonly PendingEffect[] | undefined,
): number {
  let applied = 0

  for (const effect of effects ?? []) {
    /* re-checked per effect: an earlier one may have changed the store */
    if (blockedReason(ctx(), effect)) continue

    switch (effect.kind) {
      case 'set':
        store.updateCell(effect.entityId, effect.rowId, effect.fieldId, effect.value)
        applied += 1
        break
      case 'create':
        if (store.addRow(effect.entityId, effect.values)) applied += 1
        break
      case 'link':
        /* a join row is an ordinary row whose reference fields carry the pair —
           the engine has already put both row ids into `values` */
        if (store.addRow(effect.joinEntityId, effect.values)) applied += 1
        break
      case 'flag':
        /* display only — a flag marks the run, it never writes data */
        break
    }
  }

  return applied
}
