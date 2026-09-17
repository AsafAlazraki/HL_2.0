/* ============================================================
   THE DEFAULT PAGE FOR A TABLE — what `createViewFor` always was,
   with the shadow registry taken away.

   WHAT WENT. The old `viewDefs.ts` kept every `ViewDef` in a
   module-level `Map` published through React's own external-store
   hook, because the project store had no action for a view and the
   feature was not allowed to add one. The plan drops that registry by name —
   a page a person set up is lost on reload, which is the defect it
   admitted in its own header — and `ViewDef.orgId` in the contract
   says where a view lives now: it is a persisted table like any
   other. The hooks, the block editors (`addBlock`, `setBlockRule`,
   `removeBlock`) and the depth helpers went with it; they are the
   editing surface, and they come back as catalogue commands beside
   the screen that needs them.

   WHAT STAYED, WORD FOR WORD. The derivation. "Sensible" means: any
   relationship that has ALREADY been declared — a join table linking
   this one to another — is shown, as a curated block (only what
   someone put in it). No rule is invented and no join is created; a
   table with nothing declared yet opens empty and invites the first
   drag. The blocks come from `relations.ts`, which is also what a
   module seeds its tables with — one derivation, so the two surfaces
   cannot drift apart again (see that file's header for the
   measurement that made it one).

   IDEMPOTENT, AND NOW AGAINST THE CONTEXT RATHER THAN A MAP OF ITS
   OWN. Asking twice for the same table gives back the same view. The
   registry that made that true is gone, so the context's own `views`
   is what is asked — and a view minted here is put there, because a
   caller that mints one immediately quotes from it by id and a
   snapshot nobody wrote to could not answer. That is the one write
   in this file and it is the caller's own map; nothing module-level
   is kept, nothing is subscribed to, and a fresh context starts
   empty.
   ============================================================ */

import type { CatalogueCtx, ViewBlock, ViewDef } from '@/domain/model'
import { newId } from '@/domain/id'
import { defaultBlocksFor } from './relations'

/**
 * A sensible default view for a table — see the header.
 *
 * `ctx.now()` is the clock, injected: a pure module never calls
 * `Date` itself.
 */
export function createViewFor(ctx: CatalogueCtx, tableId: string): ViewDef {
  const already = Object.values(ctx.views).find((v) => v.rootTableId === tableId)
  if (already) return already

  const root = ctx.entities[tableId]
  const blocks: ViewBlock[] = defaultBlocksFor(ctx.entities, tableId)
  const stamp = ctx.now()

  const view: ViewDef = {
    id: newId(),
    orgId: ctx.orgId,
    name: root ? root.name : 'View',
    rootTableId: tableId,
    blocks,
    createdAt: stamp,
    updatedAt: stamp,
  }
  ctx.views[view.id] = view
  return view
}
