# Data as one section: a fresh critic, 2026-11-04

I served the built app on port 6390 (`e2e/out/dist-6390`). The browser went through the real door at all six sizes: Data's head, each of its six rooms entered from Data's own head, the browser's Back from each room, a list's sheet, a maker's page and Settings. Then a dealer's week, walked at all six sizes:

- a newer Trailer Module was brought in on Shelf, its changes read and applied;
- Review: one case skipped and one fixed;
- Prices: Stacer Trade set to 95% of Cash and written;
- Rules: the tiller rule written, then seen refusing the F25SWTC in a build on the Classic 340, then opened again from the build;
- Fitment: Highfield chosen, then the Sport 660;
- a picture added to the Formosa GRT 425 record;
- a Cash edit on the Highfield sheet, then undone;
- Data read again.

Frames are in `section/` and named `<size>-<step>.png`. Each run was a throwaway browser, and nothing was kept.

## Verdict: NOT PERFECT

The rooms are each their own designed screen, and the figures agree from room to room. Review's 39 and 38 match Needs Northside. Prices' 4 and 10 match Data's tiles. Rules shows 7 kept and 1 written, and Fitment shows 289 models. The applied file shows on Data as "1 line changed" and "Last change on this computer". The section still fails as one place, for these reasons.

1. **The bar's Data opens Data mid-page (major).** Pressing Data on the bar from any scrolled screen opens Data at the scroll position of the screen just left, not at its head. From 700 px down on Rules, Catalogue, Review, Prices, a maker's page or Settings, Data opened at y 700, at both 1280 and 390 (frame `1280x800-32-bar-data-from-scrolled-rules`). Home resets to 0 in the same walk. The likely cause is in `src/routes/data.index.tsx:103-114`: Data writes its position on arrival with `replace` and `resetScroll: false`.
2. **The browser's Back from a room loses the place on Data (major).** I scrolled to the rooms, opened Review and pressed Back. Data came back at y 0 every time, from 1325 at 390, 1195 at 834 and 491 at 1280. On a phone or tablet, the person then has to scroll more than a full window again to reach the next room. Focus lands on the body.
3. **The rooms are not in Data's first window at four of six sizes (major).** The room list starts at y 1325 at 390, at 1195 at 834x1112 and 844x390, and at 491 at 1280x800. At 1280x800, Prices and Shelf end at 844 and 907, under an 800 px window. `ways.ts` promises each room is "one press from Data's head at every size". It is one press, but only after scrolling past six Needs cards and the New-since card.
4. **The page edge moves between screens (minor).** Each room sets its own column, so moving between screens shifts the content. At 1920 the heads start at Data 80, Sheet 120, Catalogue 216, Places 284, Rules and Review 320, Prices and Shelf 360, and Fitment's plate 400. At 1440 they are 40, 32, 56, 152, 80, 160, 120 and 160. Each screen can keep its own design and still share one edge under one bar.
5. **A change is announced five different ways (minor).**
   - Review: a line over the stage.
   - Prices: a row between tiles.
   - Sheet: a floating step bar.
   - Rules and adding a picture: a dark toast.
   - Shelf: a sticky bar.
   The sheet's Undo says "Undone — Cash on Roll Up 230 KAM · PVC · WH: $2,770 → $2,771". That reads as if the price is now standing. Prices was fixed for exactly this and now says "Undone. No longer so: …".
6. **Smaller faults (minor).**
   - Needs Northside says "1 boats at $0".
   - Catalogue calls itself "Chandlery" while its room is "Catalogue", and says "18 aisles and Not sorted yet · 180 headings". Data counts Parts as 187 categories and 2,937 products, and nothing says the 180 counts only what is on sale.
   - Dates are written "16 September 2026" on Data and "16 Sept 2026" on Review and Shelf.
   - At 834 the record's gallery leaves about 420x520 px empty to its right (`834x1112-w17-picture-added`).
   - Toasts sit over figures and acts: at 390 over "What goes on this boat", at 834 over the Cash column.
   - Shelf's sticky Apply bar cuts the "52 other lists…" sentence at 1280 and the tile captions at 390.

## Perfect

- Data stays lit in the bar on every room, the sheet and a maker's page. Settings lights Home.
- No screen scrolls sideways at any size, and no screen threw an error.
- The week's numbers agree across the section after every step.
- A written rule is refused in the build with its reason, and "See the rule" opens it with Data lit.
- Fitment's sentence about the rigging kit not yet being chosen points to Prices.
