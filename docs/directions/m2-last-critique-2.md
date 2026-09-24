# The last of Milestone 2, second pass, judged cold

Independent critique, 2026-09-25. Read-only: this file is the only thing written in the repository.

**What was read.**

- The whole of `docs/directions/built-critique-m2-close-2.md` (the specification).
- `docs/STATUS.md`'s top section.
- `docs/directions/built-m2-close-2.md`, `docs/directions/m2-last-critique.md` and `docs/directions/m2-last-2.md`.
- CLAUDE.md.
- Source only where the screen could not prove a thing:
  - `src/domain/quote/{spoken.ts,spoken.test.ts,cascade.ts}`
  - `src/screens/picker/Picker.tsx` (the material rule)
  - `src/screens/document/document.css` (the cover band)
  - `data/northside/names.json`
  - the two naming lines of `docs/DECISIONS.md`

**What was measured here, not inherited.**

- **Build and guards:** `npm run build` was green (3.6 s). `npx tsx tools/check.ts` reported **14 rules, no failures**. `npx vitest run` on golden, spoken, colourway and cascade passed **77 of 77**. `golden.test.ts` does not differ from HEAD.
- **How it was driven:** `dist/` was served by `vite preview` on port 6593. Each walk started from a fresh browser profile and went through the real door. Playwright scripts pressed what a person presses.
- **The whole sale, three times:** ADV7 → Black / Grey / Black → Start the quote → Yamaha F250XCB → See what Trade does → Leave it → the finale unnamed → R. Kelleher → Give → Open the document → Quotes, History, Customers, Home.
  - **1440 × 900** with a mouse.
  - **834 × 1112** with touch.
  - **390 × 844** with touch (mobile).
- **The picker press at 844 × 390** with touch.
- **The paper:** printed to PDF (two A4 pages) and read.
- **Other makers:** Surtees 770 Game Fisher XL, Jeanneau Merry Fisher 605 S2 and Haines Signature Fisher 525F were each started, given and their papers read. Plates were also read for Stacer, Formosa, Stabicraft and Haines.
- **Every boat on the file:** all 810 boat rows were said through `spokenBoat`, run with `tsx` against the ledger.
- **Refusal contrast:** measured in the page by day, and by night with `data-theme="night"` forced (the night has no control yet).
- **Searches:** Ctrl K and Home's field were asked the names the screens print.
- **Clean runs:** no page error and no console error on any walk. Sideways scroll was 0 at every size.

Evidence shots and PDFs are in this session's scratchpad (`…/scratchpad/crit2/shots/`), named by step and size.

---

## The three blockers and the one thing, item by item

| # | finding | verdict | what I saw |
|---|---|---|---|
| B1 | A refused act's reason at 1.23 : 1 | **CLOSED** | Finale, unnamed: "This quote is addressed to nobody…" is 41,70,90 on white, **9.92 : 1**, at 1440, 834 and 390. By night it is 159,182,196 on 6,32,51, **7.89 : 1**. The given peek's "…so it stays" is also 9.92 : 1. |
| B2 | On a tablet, pressing a boat does nothing | **CLOSED** | **834 × 1112, tapped:** the plate stands sticky at y 64–1052 beside the list. The pressed card is still in view at y 931. `Start the quote` is at 934–986 of 1,112. The chips are named. Choosing a colour did not move the window. **844 × 390:** chips at 143–187 and the act at 257–309 of 390, beside the card. **390 × 844:** the plate replaces the list with the act at 682–734. |
| B3 | The cascade calls a line "Standard" that the paper calls unpriced | **CLOSED** | No "Standard" at any size. The DEC kit reads "Not priced on this quote" on the cascade, the build, the finale ("Not priced 1") and both pages of the paper. `CascadeRow.standard` is gone from `cascade.ts`. |
| One thing | Every boat and colour said as a person says it; colour drawn as colour; a unit on every measure | **CLOSED for the ADV7 and for Highfield. Not yet true of every boat.** | See below. |

**The one thing, by surface, for the ADV7.** "Highfield ADV7 · Hypalon · Black / Grey / Black" appears on:

- the build: masthead, stage and hull chapter
- the cascade card and its row
- page 1 of the paper, with swatches, and page 2's hull line
- the saved PDF's title
- the register's row and peek
- History's line and its fortnight tile
- the customer's card, with edged swatches on the navy
- Ctrl K's quote row

The picker's chips carry swatches and names at 1440 and at 834. An undecoded code is shown as its code with no swatch: I-B-C on the Sport 560, WH on the Roll-Ups. The one plate that does this also says why, "No colour name is on file for I…".

Units print as 6.98 m, 2.68 m, 32 cm, 519 cm, 200 cm, 1,300 kg, 7.7 m, 530 L, 20°, 90–140 HP and 4 mm. Motors and trailers are said without the file's " - ".

**Where it is not yet true:**

- One boat of 289 is said with its maker twice (major 1).
- Jeanneau's Draft prints bare on the customer's paper (minor 4).
- On a phone the chips are unnamed until pressed (minor 5).
- The sheet's Variant column draws colour but prints the code (minor 7).

---

## Blockers

None found.

---

## Major

### 1. The Surtees 770 Game Fisher XL is "Surtees Surtess 770 Game Fisher XL" on the customer's paper (new this round)

**How the file writes it.** The file writes the row as `Surtess  -  770 Game Fisher XL`. The row's own maker column, `boat_surtees.e`, reads "Surtees".

**What `spokenBoat` does with it.** It takes a maker's prefix off only when the prefix equals the known maker. "Surtess" misses, so the typo stays in the name, and the known maker is then put in front of it (`spoken.ts` ~260–310).

**Where the doubled name was driven:**

- the build's masthead and stage
- the hull chapter
- page 1 of the paper, at display size under the kicker SURTEES
- page 2's hull line, "Surtees Surtess 770 Game Fisher XL $152,400"
- the register's row and peek
- History: the line, the opened line, the fortnight tile, and the sentence "A new draft for the same Surtees Surtess 770 Game Fisher XL…"

**The picker** says "Surtess 770 Game Fisher XL" among "770 Game Fisher" and "800 Game Fisher".

**Why the decision does not cover it.** `DECISIONS.md` records that "a typo such as 'Surtess' stays the dealer's to correct". It does not record saying the maker twice, and no person says "Surtees Surtess". `spoken.test.ts:173` pins `'Surtees Surtess 770 Game Fisher XL'` as the right answer, so the gate is green over it.

**What honest looks like.** Either the file's own maker column is read ("Surtees 770 Game Fisher XL"), or the typo is said alone as the file writes it ("Surtess 770 Game Fisher XL"). Both are honest; the current output is neither. It is a $152,400 boat, and the name is the first line under the picture.

### 2. The paper's only photograph crops the boat it sells (not new)

**The cause.** `.doc-shot` is a 72 mm band with `object-fit: cover` (`document.css` ~618–640). A maker's render is wider than it is tall, but not as wide as the band, so the band cuts off its top and bottom.

**What it cuts on the two papers read:**

- **The ADV7:** its studio render is 1,100 × 619. It is drawn 656 wide and 369 tall, and shown in a 270 px frame, so 99 px (27%) is cut. On page 1 the T-top canopy sits flush on the frame's top edge, and the antenna the source shows above it is gone.
- **The Surtees 770 XL:** it loses the tops of its rod holders.

**The note beside the paper is wrong.** It says "Held 1,100 × 619, printed at 656 × 369, never enlarged". The frame shows 656 × 270 of it.

**There is room for the whole picture.** Page 1 leaves about a quarter of the sheet empty under the summary. The owner's finish line is "a downloaded quote that is beautiful", and on that page the boat is cut.

---

## Minor

3. **Pressing a material chooses a colour nobody chose.**
   - **Two-material models** (Sport 560, every Roll-Up, Classic, Ultralite): pressing Hypalon or PVC selects that material's first colour and lights `Start the quote`. The Sport 560 gets "White / White / White/Blue · W-W-WB" (`Picker.tsx` 912–917, a recorded rule: "the colour is a refinement rather than a gate").
   - **One-material models** like the ADV7 refuse until a colour is pressed.
   - **The effect:** a dealer who presses Hypalon then Start the quote hands the customer a paper that now names, in words, a colourway nobody picked.
4. **Jeanneau's Draft is a bare figure on the customer's paper.** Page 1 of 20260925-04 reads "Draft 0.45", and the build and plate read the same, for all 27 Jeanneau boats. The decision to leave it bare is recorded and honest: the maker's 1.17 m for the DB/37 does not match the file's 1.03. But the customer is handed a measure with no unit. Leaving a unit-less measure off the paper is the owner's call to make.
5. **On a phone the colour chips carry no words.** At 390 the ADV7's seven chips are swatches only; the names are in `aria-label` and appear after a tap. Two chips differ only in "White/Blue" against "Light Blue". The verifier lists this as the owner's call; it is the one surface where "every colour the way a person says it" is not met.
6. **Names still break inside themselves.**
   - History at 390: "· R." then "Kelleher".
   - The finale's note and the given build at 390: "TA700T-" then "EH".
   - Home's issued card at 1440: "Hypalon · Black / Grey /" then "Black".
7. **The sheet's Variant column draws colour but prints the code.** Each cell has a 12 px stripe beside `B-G-B` or `LG-W-WB`. The words ("Black / Grey / Black") are only in the cell's `aria-label`. The spine's caption and the render's alt text say "B-G-B" too.
8. **A press that moves the build leaves a line sliced under the sticky head.**
   - At 1440, after the motor, the motor's "chosen" line is half hidden.
   - At 1440, after Give, the Dealer fit's first line is half hidden.
   - At 834, after Give, the search hint is cut.
   - At 390, the finale's LINES / NOT PRICED / TOTAL figures are cut.

   The head at 390 takes 175 px of 844, and 218 px once the quote is given.
9. **Home at 1440 × 900 scrolls by 11 px once one quote is issued** (911 / 900): the issued card's name takes three lines.
10. **The file's words on the customer's paper outside the boat:**
    - "GFAB Tandem Axel Trailer t/s Surtees 770 Series" (the file's typo and abbreviation)
    - "Helm Master L2 · 6X9 Binnacle · Bolt on DES · Straight Helm · EKS · Single"
    - "SIG 525F w Yamaha · F90XB"
    - Stabicraft's "Hull Weight @ (Dry)"

    The `words` ledger (Sng → Single, Mnt → Mount) shows the sourced way to say these.
11. **Still open from the specification, not owned by this round:**
    - Every tab reads "HelmLogic" except the paper, and `/favicon.ico` is 404.
    - The sheet is still a grid.
    - The register's three band tiles.
    - History's foot key bar cuts the fortnight when a line is open at 1440.
    - The register's hero stays on the ADV7 while the Surtees quote is in the peek.
    - The paper carries no Northside address or phone, and no validity date (Milestone 4).
    - The finale's refused `Give it to the customer` is still a full darker-amber block, the loudest thing in the finale (text 4.87 : 1).

**Checked and closed from the earlier critic (`m2-last-critique.md`):**

- **The Haines hull.** The hull is priced on the build; 71,500 puts "01 The hull $71,500" on the paper, with no "Included $0".
- **The finder.** Ctrl K finds "sport 560", "roll up 230", "patrol 600 st", "signature fisher 525f", "merry fisher 605", "adv7 black grey black" and "kelleher". Home's field answers "sport 560" with "15 lines answer to that."
- **The motor press.** Pressing the motor opens Who it is for.
- **The given quote.** It shows no Undo and no "See what Trade does".

---

## Verdict

**Are the blockers gone?** Yes, all three, each by measurement:

- the refused reason reads 9.92 : 1 by day and 7.89 : 1 by night
- on a tablet the plate stands beside the pressed card with its act in the window, at 834 × 1112 and at 844 × 390
- the cascade and the paper agree that the rigging kit is not priced

No new blocker was found. The whole sale runs cold at 1440, 834 and 390 with no error, and the printed quote is two clean A4 pages with nothing of the app on them.

**Does every boat read the way a person says it?** The ADV7 does, on every surface the critic named, and so do Highfield's 588 rows, Stacer, Stabicraft, Formosa, Jeanneau and Haines. The file was said whole and read here. Not every boat does:

- **The Surtees 770 Game Fisher XL** prints "Surtees Surtess" as the headline of its customer's paper, and a test pins it as correct.
- **Jeanneau's Draft** still reaches the customer with no unit.
- **On a phone** the colour chips are unnamed until tapped.
- **The sheet** prints colour codes.

**Fix before the owner looks:** the Surtees name, and the paper's cropped picture, since the paper is the object he named as the finish line.
