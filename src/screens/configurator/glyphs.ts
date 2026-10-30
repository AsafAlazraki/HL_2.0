import { HandshakeIcon, MoneyIcon } from '@phosphor-icons/react'
import type { Glyph } from '@/ui'

/* ============================================================
   THE BUILD'S GLYPHS (the component kit, 2026-09-28).

   NO GLYPH STANDS BESIDE A SPECIFICATION any more (the build page's
   critic, 2026-10-31, P-12): a strip was given glyphs only where every
   label in it had one, so the Stabicraft's tiles wore a ruler, arrows
   and scales and the Highfield's, whose "Tube diameter" has none, wore
   nothing. Two boats, two drawings of one strip. The figure and its
   words are the tile, the same on every boat.
   ============================================================ */

/**
 * A PRICE LEVEL'S GLYPH, by the level's own key — the kit's own pairing
 * (src/screens/kit/Kit.tsx): money for Cash, a handshake for Trade. A
 * level this does not know keeps the money, since every level is a price.
 */
export const levelGlyph = (key: string): Glyph => (key === 'trade' ? HandshakeIcon : MoneyIcon)

export { boatTravel } from '@/screens/picker/travel'
