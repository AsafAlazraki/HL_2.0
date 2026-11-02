# Polish round: independent critique, 2026-11-02

This critic had never seen HL_2.0 before this round. The build is `main` at 13e9781, built with
`vite build` into `e2e/out/dist-6041` and served by `vite preview --port 6041` through
Playwright's webServer, which stopped when the walk ended. The walk is
`e2e/out/critic-6041/critic.walk.ts` and runs three tests at each size. All 18 passed.

- **home and bar:** through the door to Home, the crest at 1x and at 4x, Quotes, and New quote.
- **build page:** Highfield Sport 560. Every chapter is checked. The walk picks a second model,
  Hypalon and a colour, adds a dealer-fit line, scrolls to the end, and opens the lightbox, the
  customer popover and a "Show all" sheet. It then opens the final package door, catches the
  preparing moment at 150, 450 and 800 ms, scrolls the package, uses "Back to editing", and
  ends on "Choose what prints", which opens the printed quote and its sections panel.
- **motor only:** New quote, then Yamaha Outboards, then the first motor, then the build and
  its final package.

There is a screenshot at every step at 390x844, 844x390, 834x1112, 1280x800, 1440x900 and
1920x1080, and I read frames at every size. The probes are in the walk's `log.txt`. Two of them
were false positives and are ignored: "CUT" on visually-hidden 1px spans (`.home-unseen`,
`.ui-figure__said`, `.cfg-stage__name`, `.cfg-tally__heard`), and "OVERLAP" between the pill's
doors and rows that sit clipped above `.cfg-scroll`'s top edge.

Note: the walk's revert click pressed the first model card (SP300), not the Sport 560, so every
frame after the hull step shows a Highfield SP300 in Hypalon, Light Grey / White / Dark Blue.
This helps the review: it is a second model with a priced colour axis.

---

## The owner's words: DONE or NOT

| # | The owner said | Verdict | Measured |
|---|---|---|---|
| 1 | "all cards on the right should be open by default" | **DONE** | 4 of 4 chapters `data-open`, every head `aria-expanded=true`, at all six sizes |
| 2 | "the hull stuff … really easy to use" | **PARTLY** | Models are two-across cards of one height (82 at desk, 68 at 834/844, 91 at 390), and their deltas sit in one column. The colour strip is ragged (see B3). Choosing a model takes 16 cards and about 720px of rail at 1440. |
| 3 | "another pass on the right hand side with the line items … perfect" | **PARTLY** | One `+ Add` / `− Take off` vocabulary, one 40x40 well, price column aligned. The act pills are left-aligned in their column, so right edges are ragged (B4). Motor tiles in one row have different heights, and their "See its picture larger" links sit 15px apart (B2). The price pill looks like a second button (B6). |
| 4 | "a line between highfield logo and the boat … separate them" | **DONE** | A vertical hairline sits between the mark and the name at 834, 844, 1280, 1440 and 1920. At 390 it runs across under the mark. |
| 5 | "ensuring all padding and things are nicely done" | **NOT** | The customer popover has about 8px inner padding, and its fields and act touch its edge (B1). The package's handover card has three different right edges (B5). |
| 6 | "the animation to go to summary is BAD" | **DONE** | The summary and its scroll-past trigger are gone. The door plays the preparing moment, and reduced motion skips it (`setPreparing(!reducedMotion())`). |
| 7 | "view final package … pretend loading screen … pdf quote preview … visual masterpiece … go back to editing" | **PARTLY** | The preparing moment is good at every size. The package has the photograph, the handover, "On this quote" and the A4 paper. But the first fold at every desk size is a data-entry form, and the paper starts below the fold (B5). "Back to editing" restores the column scroll exactly at desk sizes. At 390 it lands 46px off and at 834 41px off, because the Undo toast ended while away (B9). The address gains `?at=hull` that it did not have before. |
| 8 | "the nsm logo in floating bar has a weird glitch … white line on the right" | **DONE** | Pixel row through the crest centre at 1x: left side is pill border 191, band 33/26/26, ring 149,182,219. Right side is ring 139,169,203, band 26/26/32, then pill white. The two sides match and there is no seam. The 4x captures at 390, 1440 and 1920 show a clean roundel. |
| 9 | "make floating bar wider a bit on bigger screens" | **DONE** | Pill 614.5px at 834 and 844, 674.5 at 1280 and 1440, 734.5 at 1920. It is 42px tall at every size. |
| 10 | "remove the price list of 16 september on home page and the text below it and the text on the right and remove the answer them on prices" | **DONE** | Home's text has no "Price list of", "16 September" or "Answer them" at any size. There is no `pack-counts` and no `price-asks`. |
| 11 | "ensuring responsiveness on every single size" | **PARTLY** | No horizontal overflow at any size on any screen walked. Density faults at 844x390 (B7), 1280x800 (B8) and 1920 (B10). |

---

## Frames: PERFECT or NOT, and why

### Shell: the floating bar and Home

| Frame | 390 | 844x390 | 834 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|
| Home, top | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Home, full scroll | NOT, minor: the 7th maker tile (Haines Signature) is alone and full-width under three pairs, about 351px against 175px | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Crest, zoomed | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Pill width | PERFECT (358, bottom tab bar) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |

### Build (src/screens/configurator)

| Frame | Verdict and why |
|---|---|
| Top, 1440 / 1920 / 1280 | 1440 and 1920 **PERFECT**. **1280: NOT, minor.** The mast's boat block wraps to three lines (name, swatches, finish), so the bar is 96px tall against 80 at 1440. |
| Top, 834 | **PERFECT** |
| Top, 844x390 | **NOT.** The floating tally (y 315 to 378) covers the hull chapter head on first paint, and only "15 finishes" shows under it. |
| Top, 390 | **PERFECT** |
| Hull models, all sizes | **PERFECT** for card height and delta column. At 390 the delta sits under the name as designed. |
| Hull material | **PERFECT** |
| Hull colour, 1440 / 834 / 844 | **NOT (B3).** Pills wrap 1, 1, 2, 2, 2 at 1440: "White / White / White/Blue" and "Light Grey / White / White/Blue" each stand alone in a row with about 340px of empty rail beside them. "I-B-C" has no swatch and sits in a monospace face, so its baseline is 3px lower than its row. |
| Hull colour, 390 | **NOT (B3).** A ragged stack of pills between about 270 and 358px wide. "Light Grey / White / White/Blue" and "Light Grey / White / Dark Blue" wrap their names to two lines inside the pill. |
| Motor tiles, every size | **NOT (B2).** In one row, F25LWTC is 116px tall (it has the RECOMMENDED line) and F30LA is 101px. So the "See its picture larger" links sit at y 690 and y 675 at 1440, and at 384 and 369 at 1920. The "Show all 209" sheet does the same with F20LWPHB's two-line name: links at 680 and 665. |
| Dealer fit and Parts rows, desk | **NOT (B4).** Acts are left-aligned in the 96px column: "− Take off" ends at x 1336, "+ Add" at 1316, and the row at 1364 (1440). That leaves 28 to 48px of dead space after every act, and the right edge does not match the head caret (1364) or "For the workshop" (1356). |
| Rows, 390 | **NOT, minor (B6).** "+$199" and "+ Add" are two identical blue pills side by side. The figure reads as a press. |
| Rail end (door), every size | **PERFECT.** The amber "View final package" and "The final package / after their name" read well. Minor: the status "after their name" is not a sentence a salesperson can act on. "Gives after their name is on it" would be one. |
| Total card, desk | **NOT, minor.** With a dealer-fit line unpriced, "Not chosen yet … not in this total." is five lines of 12px in a 190px column at 1280 and 1440, next to the button. The total card's own "View final package" is near-black (navy), not the blue the builder reported. Two acts for one door in two treatments sit 300px apart on one screen. |
| Total card + step, 1280x800 | **NOT (B8).** When the Undo step lands in the total card, the photograph above it shrinks from 250px to a 520x160 band showing only the hull's seats. |
| Total card + step, 844x390 | **NOT (B7).** The tally with its Undo is 140px tall (y 238 to 378), 36% of a 390px window, under a 50px pill. The work keeps 200px. |
| Undo toast, 1920 | **NOT (B10).** The toast stands at x 1548 to 1903, y 8 to 78. That is outside the 80px page gutter, it overlaps the mast plate's top-right corner (mast top 68) over "PREPARED BY", and it is three lines tall. |
| Undo step lifetime, all | **NOT, minor (B9).** "Tube Covers … put on the quote · no price on it / Undo" stayed up through eight scroll frames, the lightbox, the customer popover and the Show-all sheet. It changes the page's height when it finally leaves. |
| Lightbox, every size | **PERFECT.** Title, provenance line, photograph, Close. |
| Customer popover, 1440 / 1280 / 1920 | **NOT (B1).** The popover's heading starts 8px in from its edge. Both fields and the amber "Put their name on it" run to the popover's right edge (x 1305 to 1306 at 1440) with no inner padding, and the act's shadow spills past it. It also covers the selected model card's "on the quote" pill. |
| Show-all sheet, 1440 | **NOT (B2):** uneven tile heights, so the picture links do not line up. The rest is **PERFECT**. |
| Preparing moment, every size | **PERFECT.** The photograph settles, the line names tick in, the rule draws. At 390 the first line wraps ("… / Dark / Blue") inside the 358px measure, which is acceptable. |
| Package, first fold, 1440 / 1920 / 1280 | **NOT (B5).** Inside the handover card the name fields end at x 1217, the line-price field at 1267, and the total at 1340 (1440). At 1920 the fields are 352px in a 620px card. "Give it to the customer" is a grey pill whose refusal is written under it (allowed), but the fold is fields, a price input and five refusal lines. The paper the owner named starts 337px into the first scroll at 1440 and is off the fold at 1920 (it starts at y 1050). The left column under the photograph is empty from y 714 to 900. |
| Package, scrolled, desk | **PERFECT** for the paper: crop marks, A4, pages 1 of 2 and 2 of 2. "On this quote" is sticky beside it. Minor: the left column is empty for two full screens under that card. |
| Package, 834 | **NOT (B5).** The refusal list is set at about a 320px measure inside a 786px card, while the notes under it run the full width. There are two measures in one card. |
| Package, 390 / 844x390 | **PERFECT.** At 844x390 the sticky package bar sits over scrolled content, as designed. |
| Back to editing, desk | **PERFECT.** Column scroll is exact: 1973 to 1973 at 1440, 2330 to 2330 at 1280, 1793 to 1793 at 1920. |
| Back to editing, 390 / 834 | **NOT, minor (B9).** It lands 46px (390) and 41px (834) above where the person left, because the page is shorter once the step has gone. |
| Motor-only build, 1440 | **NOT, minor.** The chosen card F2.5SMHB wraps its facts to "2.5 hp · 17 kg ·" / "15″ shaft" because "on the quote" takes the room. Every other card is one line. |
| Motor-only package, all | **PERFECT** apart from B5. |

### Rest (picker, quotes, document)

| Frame | Verdict and why |
|---|---|
| New quote, 1440 / 1920 / 1280 / 834 | **PERFECT** |
| New quote, 390 | **PERFECT.** The bottom tab bar over the shelves is chrome, as designed. |
| Motor picker, every size | **PERFECT** |
| Quotes (empty, a fresh browser) | **PERFECT.** The empty state is one sentence and one act. |
| Printed quote, 1440 / 1280 / 1920 | **NOT (R1).** The paper (x 179 to 973) and the sections panel (1005 to 1260) leave 180px empty right of the panel at 1440, while "PAGE 1" floats alone at x 88 in the left margin. Print ends at 1416 and the panel at 1260, so the screen has no right edge. The 255px panel wraps "What comes with your / boat" and sets every refusal four lines tall. |
| Printed quote, 390 / 834 / 844x390 | **PERFECT.** The panel comes first and the paper follows. |
| Sections panel | **NOT, minor (R1),** at desk sizes only (it is cramped). |

---

## The gaps, grouped

**build**

- **B1, major.** The customer popover has no inner padding: fields and act touch its edges at
  every desk size. This is the owner's "padding nicely done".
- **B2, major.** Motor and trailer tiles in one row are different heights, so "See its picture
  larger" sits 15px apart across a row on the rail and in the Show-all sheet. The builder said it
  was "in the same place on every tile", and it is not, across a row.
- **B3, major.** The colour strip wraps raggedly (1, 1, 2, 2, 2 at 1440). At 390 its pills are of
  mixed width and two wrap their names. "I-B-C" has no swatch and sits on another baseline.
- **B4, minor.** Act pills are left-aligned in their column, so right edges are ragged by 20px
  and every act stops 28 to 48px short of the row end.
- **B5, major.** The final package's first fold is a form, not a masterpiece. The handover card
  has three right edges (fields, price field, total) and two text measures. The paper starts
  below the fold. The left column is empty under the photograph.
- **B6, minor.** The price pill and the "+ Add" pill are the same shape and colour.
- **B7, major.** At 844x390 the floating tally covers the hull head on arrival and, with its
  step, 36% of the window.
- **B8, major.** At 1280x800 the step landing in the total card crushes the photograph to a
  160px band.
- **B9, minor.** The Undo step lingers across every scroll and popup. When it leaves, "Back to
  editing" is 41 to 46px off at 390 and 834, and the address gains `?at=hull`.
- **B10, major.** At 1920 the Undo toast overlaps the mast's top-right corner and stands outside
  the page gutter.

**shell**

- **S1, minor.** At 390 the last maker tile on Home is alone at full width.

**rest**

- **R1, minor.** The printed-quote screen at desk sizes is not centred as one composition: there
  is empty space right of the panel, "PAGE 1" floats in the left margin, and the 255px sections
  panel is cramped.

Nothing was found that fakes a figure, puts cost on a customer surface, ignores reduced motion
or breaks keyboard reach.
