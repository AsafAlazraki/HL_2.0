/* ============================================================
   THE WRITE IS THE DIFFERENCE, NOT THE PROJECT.

   Ported from the old repo's `db/repository.ts`, where the argument
   was measured. WHAT WAS THERE, AND WHAT IT COST. `saveAll` cleared
   all seven stores and wrote the entire project back on every
   debounced flush. Measured in the built app against the Northside
   file:

     rows on disk   records written per cell edit   transaction
       3,566              3,651 (+7 clears)            1,195 ms
      10,698             10,783 (+7 clears)           10,539 ms

   Ten and a half seconds to record ONE typed letter, at a scale the
   file is heading for. IT ARRIVED, and then it kept going: the seed
   is 15,691 rows now (SEED_AT_FULL_SCALE.md §8.2, since both
   libraries carry their whole sheet), so the second row of that table
   is not the projection any more — it is below the sheet a dealer
   opens. Worse than the length is the arithmetic: the
   flush is debounced at 400ms, so a person typing at a normal pace
   starts a new ten-second write every six hundred milliseconds, and
   the queue never drains — eight keystrokes issued eight full-project
   writes and fifty-six store clears. That is the "stops draining"
   failure, and no amount of tuning the debounce fixes it, because the
   work per flush is O(the whole project).

   WHAT REPLACES IT, AND WHY THIS AND NOT A DIRTY FLAG. The obvious
   answer is to have every mutation declare what it touched. That
   means editing forty call sites in the store and being right at all
   forty, for ever; one missed declaration is a silently unsaved edit,
   which is the worst class of bug this app can have.

   The store is already immutable and structurally shared: a row that
   did not change in this update is THE SAME OBJECT as the row that
   was written last time. So the difference can be READ rather than
   declared — one identity comparison per record — and it cannot go
   stale, because it is derived from the data that is actually being
   saved. A cell edit touches one row object, so one row is written.

   THE CONTRACT IS UNCHANGED. `saveAll(s)` still means "after this
   resolves, the disk holds exactly `s`". Records that left the
   snapshot are deleted; records that arrived or changed are put;
   records whose object is the same one we last wrote are left alone.
   Restoring is byte-for-byte what it was.

   WHAT IT COSTS TO KEEP. One `Map<id, object>` per store — pointers,
   not copies, so ~11,000 of them is a few hundred kilobytes against
   the megabytes the rows themselves already occupy.

   THE LEDGER MAY NEVER BE AHEAD OF THE DISK. It is updated only after
   the transaction resolves, and a failed write throws it away
   entirely, so the next save falls back to writing everything. A
   ledger that recorded an intention rather than a fact would quietly
   skip records that never landed.

   AND WRITES DO NOT OVERLAP. `saveAll` is chained behind whatever is
   already in flight. Two full-project writes racing was survivable
   because each was self-contained; two DIFFERENTIAL writes racing
   would read the same ledger and both decide a record was unchanged.

   IN THIS BUILD THE LEDGER LIVES PER STORE INSIDE THE DEXIE ADAPTER
   (`repositories.ts`), one map per table, and the seam above it
   never sees it: `RecordStore.saveAll` is the contract, this is how
   the browser adapter keeps it cheaply.
   ============================================================ */

/** What one store's write comes to: the records to put, the keys to
 *  delete, and the ledger the write leaves behind if it lands. */
export interface StoreDiff<T> {
  put: T[]
  remove: string[]
  next: Map<string, T>
  /** nothing to do at all — skip the store */
  quiet: boolean
}

/** THE DIFFERENCE, BY IDENTITY. `known` is what the last successful
 *  write left on disk; anything whose object is not that exact object
 *  is written again, because a changed record is always a new object
 *  in an immutable store. Exported for the unit test. */
export function diffStore<T extends { id: string }>(
  next: readonly T[],
  known: Map<string, T>,
): StoreDiff<T> {
  const nextMap = new Map<string, T>()
  const put: T[] = []
  for (const item of next) {
    nextMap.set(item.id, item)
    if (known.get(item.id) !== item) put.push(item)
  }
  const remove: string[] = []
  for (const id of known.keys()) if (!nextMap.has(id)) remove.push(id)
  return { put, remove, next: nextMap, quiet: put.length === 0 && remove.length === 0 }
}
