/* ============================================================
   WHAT NORTHSIDE LEFT ALONE ON REVIEW, read where it is kept — on
   Northside's own profile, with its file (`OrgProfile.leftAlone`,
   2026-11-04), over what this computer kept in its own preferences
   before then (`review.meant`). Every screen that counts Review's
   cases (Review, Data's door, the chandlery's "put it right") reads
   this one hook, so a case left alone is left alone on every one.
   ============================================================ */
import { useMemo } from 'react'
import { useCatalogue, usePrefs } from '@/app/useStores'
import { meantFrom } from '@/domain/rules/review/standing'
import type { Meant } from '@/domain/rules/review/checks'
import { MEANT_PREF, meantOf } from './read'

export function useLeftAlone(): Meant {
  const onProfile = useCatalogue((s) => s.org?.leftAlone)
  const onThisComputer = usePrefs((s) => s.values[MEANT_PREF])
  return useMemo(() => meantFrom(onProfile, meantOf(onThisComputer)), [onProfile, onThisComputer])
}
