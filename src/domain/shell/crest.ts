/* ============================================================
   THE CREST — what the pill's leading cap draws, as a pure function
   of what the file has named.

   Written 2026-09-23 against the critique of Milestone 2 (#21): "The
   crest is a blank blue disc before a file is read … the only mark in
   the app is a hole." `business` is null until the catalogue has read
   a file — on every cold load for the ~300 ms of the IndexedDB read,
   for as long as eighteen seconds on a loaded machine, and for good
   in a browser that holds no copy of the file — and the crest drew
   `initialsOf(null)`, which is the empty string, in a blue disc.

   THE OWNER'S SENTENCE IS "I want the logo to be the showpiece
   thing", so the one mark in the app can never be a hole. Three
   honest things could stand there before a business is named, and
   this is why it is the third:

     · the PERSON'S initials, from the session, would draw an avatar.
       An avatar is a person's own place — who is signed in, where
       they sign out — and this cap is neither: it is the dealership's
       mark and the door Home. It would also be replaced by different
       letters a moment later, which reads as the account changing.
     · the product's name as LETTERS ("HL") has the second fault
       without the first: two letters in a roundel are read as some
       business's initials, and they would turn into other letters.
     · THE PRODUCT'S OWN SIGN, which is what is drawn: the helm this
       app is named for, as a drawing and not as letters. It says
       nothing about any dealership, so it cannot be mistaken for one,
       and a reader hears the app's name — the same name the browser's
       own tab already prints (`index.html`, `APP_NAME` in
       `src/app/ways.ts`). When the file names its business, the
       business's initials take the cap and the helm is not seen again.

   NOTHING HERE IS INVENTED. The initials are the first letter of the
   first two words the file calls its business; a business with no
   letters in its name gets the helm too, rather than a guess.
   ============================================================ */

/** What the crest draws: a business's initials, or the product's own sign. */
export type Crest =
  | {
      kind: 'initials'
      /** at most two letters, upper case */
      initials: string
      /** the business, as the file names it — the crest's accessible name */
      name: string
    }
  | {
      kind: 'helm'
      /** the product, as the browser's tab names it — the crest's accessible name */
      name: string
    }

/** THE INITIALS, WHEN THERE IS NO MARK. Two letters at most: the
 *  first letter of the first two words a business calls itself.
 *  Punctuation is dropped, so "J. & R. Marine" is JR, not J&. */
export function initialsOf(business: string | null): string {
  if (!business) return ''
  const words = business
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter((w) => w !== '')
  return words
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

/**
 * The crest for a business the file may or may not have named.
 *
 * @param business what the catalogue read as the business's name; null before a file is read
 * @param product  the app's own name, which the helm stands for
 */
export function crestOf(business: string | null, product: string): Crest {
  const initials = initialsOf(business)
  if (business !== null && initials !== '') {
    return { kind: 'initials', initials, name: business.trim() }
  }
  return { kind: 'helm', name: product }
}
