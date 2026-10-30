# Milestone 4, built: the critic (2026-10-30)

Read on the tree at `d328025` plus the uncommitted Settings close. I read `docs/directions/built-m4.md`, every screenshot under `docs/directions/{places,manage,shelf}/built/`, a sample of the other `m4-*` shots (document, data), the three sweeps' notes and the source. Nothing was run. Every claim below is either a pixel in a named screenshot or a line of code, and it names which.

## Verdict

**Not accepted.** The best idea in the milestone is Settings' letterhead. It is the real paper, and each empty line is a dashed box that opens where it prints. The shelf's change sheet is also good: "15,688 of 15,691 lines stay exactly as they are", with one Apply and one Undo. But the milestone promised that a given quote is a photograph, and on this tree it is not. A backup and restore strips the letterhead and the preparer from a given quote. A later brand colour recolours its paper. The shelf promises the opposite in two sentences. A dealer who restores onto a new computer and reprints quote 20261030-01 sends a different document under the same number.

## Blockers

1. **Shelf / Document: a restore changes what a given quote prints.** `FrozenLetterhead` and `FrozenPreparer` exist (`src/domain/model/quote.ts:369-373`), and `issue` writes them. `src/domain/io/envelope.ts` never mentions `letterhead` or `preparer` (grep: 0 hits), so `normQuote` drops both when a copy comes back. `m4-document--1440-after-restore.png` shows the 529 with the mark, the reference and "Issued…", and no ABN, address, phone, email or valid-until. `529-after-restore.pdf` matches it.
2. **Shelf: two sentences that are false on this tree.** `src/screens/shelf/Shelf.tsx:717` says "A quote comes back exactly as it was given…". `src/screens/shelf/Pages.tsx:233` says "The copy's N quotes join them, each as it was given". Blocker 1 disproves both.
3. **Settings → Document: the brand colour reaches a quote that was already given.** The paper's rules, reference and accents read the live `var(--color-accent)` (`document.css:655, 737, 845, 898, 995`), and `FrozenLetterhead` has no colour. Changing the colour after the give moves amber to blue on the issued paper (measured in built-m4.md).
4. **Settings: the colour refusal cannot be read.** The one sentence the step exists to say ("White on #FFEA28 is 1.23 : 1…") is drawn by `<Refusal>` in its paper ink on the navy water: 2.18 : 1 at 1440 and 1.99 : 1 at 390 (`m4-manage--1440-colour-refused.png`). A pressed nearest chip's own text measures about 1.7 : 1. The page refuses an unreadable colour with an unreadable sentence.
5. **Shelf: the one switch does not enforce.** "May change prices and settings" is checked only in the catalogue store's `apply` (`src/state/catalogue.ts:650-655`). `bringBack`, `clearThePriceList` and `forgetEverything` (`src/screens/shelf/acts.ts`) write the repositories directly, and neither `Pages.tsx` nor `acts.ts` calls `changeRefusal`. So a person who is set apart can still do three things:
   - replace every price and setting with a copy's;
   - put the price list back to the file;
   - wipe everything.
6. **Places: a photograph stands for models it does not show.** The opened place's series tiles (`src/screens/places/Place.tsx:316-337`) wear one model's photograph, uncaptioned and with `alt=""`, under the series name. In `m4-places--1440-stacer.png`:
   - "SKIMMAS · 5 models" wears the 309 Skimma;
   - "ASSAULT PROS" wears the 409 Assault Pro, which is also the hero.

   The sweep promised that the caption always prints (`docs/research/refs/places/notes.md` §1.3), and CLAUDE.md allows no stand-ins.
7. **Gate: the refusal ruler has measured nothing on this tree, and a walk is red.** `Button intent="slot"` (Manage.tsx:424, 800) is not in `DRAWN_FOR` (`e2e/rulers/measure/refusals.ts:85-94`), so `fixture.spec.ts:364/422` and `refusal.spec.ts:180` fail. `data.spec.ts:469` counts five rooms where `ways.ts` now has six. These are nine failures, all caused by the app, so the exit is not green.

## Majors

1. **Places and Data are one register drawn twice behind one door.** Compare `m4-places--1440-rest.png` with `m4-data--1440-ochre.png`. Both show the same 25 lists, the same grouping and the same figures ("67 models in 7 series", "209 motors in 9 series"), and both light Data on the pill. Settings' "Everything else" row is Data's six head links again. The owner's words were "simple wins". The simpler design is one register in which a maker's page also carries its line, mark, photograph and colour.
2. **Settings at 390 scrolls sideways.** Once the address and the mark's file name are in, the page is 410 px wide (`.mg-group__head`/`.mg-group__say`, `.mg-sheet`). The letterhead's QUOTATION column is cut at the edge (`m4-manage--390.png`, scrollbar visible).
3. **The printed reference breaks: "20261030–" / "02".** With Northside's contact line filled, the reference wraps on the customer's paper at 1440, at 1920 and in the PDF (`m4-document--1440-509-after-restore.png`). It is the one string a customer quotes back.
4. **The shelf names boats by the file's cell.** The change sheet prints "Stacer - 509 Assault Pro (Tournament)" and "line 49" (`Changes.tsx:258` prints `line.name` raw from the workbook; `m4-shelf--1440-changes-open.png`). That undoes the earlier round's one change: every boat named the way a person says it, everywhere.
5. **The shelf contradicts the pill.** The inventory says "Customers 0 · none yet" under a pill that reads "Customers 1", and the restore page says "0 customers" (`m4-shelf--1440-rest.png`, `m4-shelf--1440-restore.png`). The shelf counts only the book's rows (`read.ts:109`). The pill and Customers also count a name a quote carries, so R. Kelleher appears on Customers and not on the shelf.
6. **Two dealer-facing sentences that are false.**
   - The document's desk note always says "Northside Marine's own mark, from northsidemarine.com.au." (`Document.tsx:144, 854`), even when the mark printed is the file uploaded on Settings.
   - Settings' letterhead note says "No quote has been started on this computer yet" (`Manage.tsx:296`) while Quotes shows 2. It counts drafts only (`m4-manage--1920.png`).
7. **Settings' water shows its machinery.** A sales manager setting a colour reads:
   - "Nearest that pass, of 126,280 colours tried";
   - an eleven-step ramp with a ratio on every step;
   - "Eleven steps from one colour, never typed one by one. A step under 4.5 : 1 on paper (6 of them) is never used for words";
   - "a 48% veil" under every photograph.

   That shows the complex topic instead of making it clear. The page's job is two colour cards, a field and one sentence.
8. **On the Places cards the mark is not the showpiece.** The sweep's own rule is "a mark held at its neighbours' size is the showpiece". Highfield, Stabicraft and Stacer are large. Jeanneau is a faint mark about 70 px wide, and Haines Signature is a small script on a plate (`m4-places--1440-rest.png`). In Goes With, Parts & Accessories is a blank green swatch.
9. **Forget everything deletes every quote with no copy ever saved.** `Pages.tsx:182-193` says "None has been saved yet… save a copy first", and then lets the press through. That is a wipe that clears quotes, guarded only by a sentence. Refuse it until a copy has been saved, which is simpler and is the sentence's own advice.

## Minors

- The browser tab says "HelmLogic" until the script runs (`index.html:15`, `APP_NAME` in `ways.ts:334`).
- "The copy's 1 quote join them" (`Pages.tsx:233`).
- The shelf's Undo is gone once you leave the shelf.
- At 390 the navy "What shows" tab reads as the selected one, and "Arrange Home" lands at the top of Settings rather than on Home's section, about 4,360 px down.
- "Templates are not built yet" stands in Settings' foot (`Manage.tsx:1034`). That is the app talking about itself where a control would be.
- "Northside to confirm", beside the website mark and the website colour, offers no way to confirm.
- "Yours alone on this computer" spacing and motion is a second appearance layer that Northside never asked for.
- At 390 the chosen Places photograph tile drew blank (`m4-walk-390-06-places-settings.png`).
- "Try it" sits below the colour field's line instead of beside it (`m4-manage--1440-colour-refused.png`).
- The build's "Prepared by Asaf." has no title, while the paper prints "Asaf, Sales manager, 0400 111 222".
- The SCREENS.md rows for Places, the shelf and Settings name boards, not references, so the "no two rows share a primary reference set" rule cannot be checked for them.
- CLAUDE.md's `npm test` figure (about 110 s) is out of date: 6 min 57 s was measured, and the e2e run took 2 h 46 min.

## What to change first

Make a given quote a true photograph. Freeze everything it prints into the quote at the give: the letterhead, the preparer and the accent colour. Carry `letterhead` and `preparer` through `normQuote`, and print a frozen quote from its own colour. Pin it with one test: give a quote, change the phone and the colour, save a copy, forget everything, bring the copy back, and the quote prints identically. Until that holds, the downloaded quote is not one a dealer can stand behind, and two of the shelf's promises are false.
