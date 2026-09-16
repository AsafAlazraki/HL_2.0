/* ============================================================
   THE VERSION OF THE SET, DERIVED FROM THE SET.

   This is the old app's `northsideSeedFingerprint()` — its algorithm
   ported so the pack can be proved equal to what the old app loaded,
   table by table: every table name and, for anything that is not a
   join (whose size is a function of its two sides rather than a fact
   the seed states), its row count, plus how many modules the old set
   minted. Change a row in the workbook and regenerate, and this
   changes with it. Nobody has to remember anything.

   THE MODULE COUNT IS A CONSTANT HERE. The old algorithm appended
   `m9` — the length of its own module list — and the pack carries no
   modules, because the nine places are minted by app code from table
   keys. The nine is kept as the number it was, so the fingerprint the
   manifest records and the one computed over the pack are the same
   function of the same facts.

   FNV-1a, 32-bit, base 36: this is a version tag being compared for
   equality, not a checksum defending against anybody.
   ============================================================ */

/** how many places the old set minted on top of the tables */
export const OLD_MODULE_COUNT = 9

export interface FingerprintedTable {
  name: string
  role?: string
  rowCount: number
}

export function seedFingerprint(
  tables: readonly FingerprintedTable[],
  modules: number = OLD_MODULE_COUNT,
): string {
  let h = 2166136261
  const push = (s: string): void => {
    for (let i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
  }
  for (const t of tables) push(`${t.name}:${t.role === 'join' ? 'j' : String(t.rowCount)}`)
  push(`m${String(modules)}`)
  return (h >>> 0).toString(36)
}
