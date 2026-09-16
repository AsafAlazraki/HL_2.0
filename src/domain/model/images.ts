/* ---------------------------------------------------------- */
/* Images                                                     */
/* ---------------------------------------------------------- */

/** One image on a row. A cell of type 'image' holds an ordered list of
 *  these, and **order is meaning**: index 0 is the primary — the one a
 *  catalogue tile or a quote header shows. Reordering re-elects the
 *  primary; there is no separate "isPrimary" flag to fall out of sync.
 *
 *  `src` is an object/data URL while we are local-only. When a backend
 *  arrives it becomes a storage path and nothing above this type changes.
 *
 *  ON THE SEEDED FILE `src` STAYS THE MANUFACTURER'S ADDRESS. The held
 *  copy under public/seed-images resolves at paint time through the
 *  image ledger (`ImageLedgerEntry` in pack.ts), keyed by this address,
 *  so a frozen quote and an export keep naming where the picture came
 *  from and nothing is ever matched by resemblance. */
export interface ImageRef {
  id: string
  src: string
  /** original filename, shown on hover and used in exports */
  name?: string
  /** natural pixel size when known — lets a grid reserve space */
  w?: number
  h?: number
  /** author-supplied alt text; falls back to the row's label */
  alt?: string
}

/** What kind of picture this is, measured off its pixels and never
 *  guessed from its maker: the seed holds both kinds for one brand
 *  (Stacer's Assault Pro is an on-water photograph; its Outlaw is a
 *  package render on white). A `scene` may fill a chapter; a `studio`
 *  shot sits large on a quiet ground; `unknown` is the honest answer
 *  for a picture nobody has read, and is treated like a studio shot
 *  because that can only make a screen quieter, never louder.
 *
 *  The packer computes it once (an edge-ring saturation reading) and
 *  writes it into the ledger, so the browser never decodes a picture
 *  to answer a question that cannot change. */
export type ImageVerdict = 'scene' | 'studio' | 'unknown'
