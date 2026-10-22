import type { Opens } from '@/domain/fitment/boat'

/**
 * THE PRICE LIST'S OWN ADDRESS FOR ONE LINE, OR ONE LIST WITH WORDS TYPED — `at` and `find`
 * are the sheet's own two words for a position (`src/routes/data.$table.tsx`), so a press on a
 * struck trailer opens the sheet on the very line whose series decides it, and a press on a
 * motor not made for this boat opens the list of what fits which boat, narrowed to this one.
 * The sheet writes its position with `replace`, so one Back returns here.
 */
export function sheetHref(opens: Opens): string {
  const q = new URLSearchParams()
  if (opens.at) q.set('at', opens.at)
  if (opens.find) q.set('find', opens.find)
  const tail = q.toString()
  return `/data/${encodeURIComponent(opens.tableId)}${tail === '' ? '' : `?${tail}`}`
}
