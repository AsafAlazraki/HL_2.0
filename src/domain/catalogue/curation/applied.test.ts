/* ============================================================
   THE MECHANISM IS APPLIED, AND THAT IS CHECKED.

   `hl-journeys.md` §4's finding is not "HelmLogic lacks a curation
   toolbar" — it HAS one, on step 5, and it is good. The finding is
   that it has exactly ONE and the other twelve screens narrow in
   silence. A shared component does not prevent that on its own: the
   next surface to narrow can still roll its own count chip and
   quietly drop rows, and nothing in `tsc`, `vitest` or the check
   would see it.

   So this reads the source of every surface that curates and
   asserts it goes through `@/domain/catalogue/curation`. It is the
   same move `trailerFitment.test.ts` makes when it reads its own
   file to prove no length column is consulted: a claim about how the
   code is written, checked by reading how the code is written.

   ADDING A SURFACE HERE IS THE POINT. When a new screen narrows a
   list by a rule, its path goes in this list, and the day it does
   the four properties come with it.

   ── WHAT MILESTONE 0 CAN READ, AND WHAT IT CANNOT ────────────────

   The surface half of this guard read seven `.tsx` files. HL_2.0 has
   no screens yet — every one is built from its own reference sweep
   and its own picked direction in Milestone 1 — so there is nothing
   to read and a guard over an empty list would pass vacuously, which
   is worse than not having it. The list is written out here, with
   what each one curates, so that putting a screen back under the
   guard is one line in `curation.raw.d.ts` and one in the array
   below:

     · a view page's related block          (was `views/BlockCard`)
     · the picker inside a quote section    (was `quote/QuoteEditor`)
     · one step of a quote being built      (was `quote/QuoteBuild`)
     · the measured trailer selector        (was `TrailerFitmentPanel`)
     · a module's catalogue, narrowed to one drawer  (`ModuleIndex`)
     · the rule that picks, on the fan-out   (was `fitment/FanOut`)
     · the drawing of the note itself        (was `CurationNote`),
       whose own assertion was that it publishes nothing to the
       action bar — the bar's vocabulary is closed on purpose.

   THE OLD LIST'S JUDGEMENT IS KEPT WHOLE, because an absence
   explains nothing. A surface belongs on it when a RULE decides what
   a person may see; it does not belong when the PERSON decides, and
   the test is who would be surprised by the count. Explaining a
   narrowing back to whoever just typed it is furniture, and it would
   teach a reader to skip the sentence on the screens where it is the
   whole point. Deliberately never on the list:

     · `table/**` — the register's column filters, its sort, and the
       band strip. A person set them, from a control still on screen,
       and the register already prints what they left. Nothing was
       withheld and there is nothing to switch off that is not
       already switched by hand.
     · `search/**` — the Finder searches everything by construction.
       It is the thing property 2 reaches WITH. It narrows nothing.
     · `crm/**` — the customer list, same reason as the register: a
       state filter a person chose from a visible control.
     · the rules panes and the discovery panels — they list RULES,
       not stock. A candidate left out is a rule nobody adopted, and
       `discoverSay.ts` already says why per rule, which is more than
       a count could say.
     · a drawing budget (the old `INDEX_CAP` and `LIST_CAP`
       sentences) — cosmetic, and `curation.ts` states outright that
       its three counts are taken BEFORE any cosmetic filter. Folding
       a cap into the pool would make the chip move as the window
       resized.

   And one that narrows by a rule and still must not be here: the
   new-module dialog narrows the tables it offers to bundle, by the
   same rule `modules/split.ts` uses to judge a finished module. It
   mounts nothing from this feature and it should not. A curation is
   a narrowing a person may switch off; that one is a REFUSAL —
   switching it off is precisely how the two bags on that dashboard
   were made — so it takes the refusal shape instead, and says why in
   place, with the count of tables read off the sheet. A surface that
   cannot honestly offer property 3 must not pretend to the other
   three.
   ============================================================ */

import { describe, expect, it } from 'vitest'
/* `?raw`, not `node:fs` — `src/` carries no node types except the
   pack fixture's own, and `trailerFitment.test.ts` set the precedent
   for reading a file's own source through the bundler instead. The
   specifier is declared in `curation.raw.d.ts`, one at a time.

   oxlint's import plugin resolves the specifier with the query
   stripped, reads the real module, and reports the default it does
   not have — a false positive about a module that exists only at
   build time. Silenced here rather than for the repository, exactly
   as `trailerFitment.test.ts` silences it. */
// oxlint-disable-next-line import/default
import curationSource from '@/domain/catalogue/curation/curation.ts?raw'

describe('the mechanism keeps its own promises', () => {
  it('claims no rate the project did not measure', () => {
    /* `measured` is the one field that could put a plausible-sounding
       figure on screen, so nothing in this feature may write one.
       Every rate it prints is assembled by `measuredRate` from two
       counts a caller measured. */
    /* COMMENTS STRIPPED FIRST, exactly as the check strips them: this
       file's own header quotes the exemplar sentence, and a guard
       that cannot tell an example in prose from a literal in code is
       a guard that has to be switched off. */
    const code = curationSource.replace(/\/\*[\s\S]*?\*\//g, '')
    expect(code.match(/holds on \d/g)).toBeNull()
    /* and no hand-written percentage either */
    expect(code.match(/\d\s?%/g)).toBeNull()
  })

  it('says the discontinued half in the contract’s own words', () => {
    /* Not "imports something from sellable" — imports the two clause
       builders, which is what makes the picker, the block and the
       index print one sentence instead of three near-identical ones. */
    expect(curationSource).toContain('withheldClause')
    expect(curationSource).toContain('stillOnTheSheet')
  })
})
