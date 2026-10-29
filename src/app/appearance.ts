import type { PrefsStore } from '@/state/prefs'
import type { CatalogueStore } from '@/state/catalogue'
import { motionOf, personLookOf, styleText, type PersonLook } from '@/domain/northside/look'
import type { OrgProfile } from '@/domain/model'

/* ============================================================
   HOW THE APP LOOKS, WRITTEN ONCE AT BOOT AND AGAIN ON EVERY CHANGE —
   the one <style> element docs/CUSTOMISATION.md describes.

   Three layers over the SAME custom properties: tokens.css's defaults,
   Northside's (kept beside the sheet, `catalogue.org.look`), and this
   person's own (prefs, under `look`). They are written as two `:root`
   rules into one element in the head, Northside's first, so the
   person's wins where both speak and the designed value stands where
   neither does. No screen reads a choice; every screen reads tokens.

   Motion is the one choice that is not a property: "Less" is written
   on <html> as `data-motion`, which the kit already knows how to hold
   still (src/ui/MotionRoot.tsx), and the computer's own "reduce" wins
   whatever is chosen here.
   ============================================================ */

/** The pref a person's own layer is kept under. */
export const LOOK_PREF = 'look'

/** The id of the one element this writes. */
export const STYLE_ID = 'hl2-look'

/** The text the element holds for a profile and a person's own layer. */
export function lookText(org: OrgProfile | undefined, person: PersonLook): string {
  let text = styleText(org?.look, person)
  /* NORTHSIDE'S OWN MARK FOR THE WATER, where it added one: Home's showpiece reads `--org-mark`
     (src/screens/home/mark.ts), so the file is written as that property and nothing else */
  const water = org?.marks?.water
  if (water && water.src.startsWith('data:image/'))
    text += `/* Northside's mark on the water */\n:root {\n  --org-mark: url("${water.src.replace(/"/g, '%22')}");\n}\n`
  return text
}

/** Write the look now, and whenever Northside's or this person's changes. Returns the unbind. */
export function bindLook(doc: Document, catalogue: CatalogueStore, prefs: PrefsStore): () => void {
  let element = doc.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!element) {
    element = doc.createElement('style')
    element.id = STYLE_ID
    doc.head.append(element)
  }
  const style = element
  let shownOrg: OrgProfile | undefined
  let shownPerson: unknown = Symbol('none')
  const apply = (): void => {
    const org = catalogue.getState().org
    const personRaw = prefs.getState().get(LOOK_PREF)
    if (org === shownOrg && personRaw === shownPerson) return
    shownOrg = org
    shownPerson = personRaw
    const person = personLookOf(personRaw)
    const text = lookText(org, person)
    if (style.textContent !== text) style.textContent = text
    const root = doc.documentElement
    if (motionOf(org?.look, person) === 'less') root.dataset.motion = 'less'
    else delete root.dataset.motion
  }
  apply()
  const offOrg = catalogue.subscribe(apply)
  const offPrefs = prefs.subscribe(apply)
  return () => {
    offOrg()
    offPrefs()
  }
}
