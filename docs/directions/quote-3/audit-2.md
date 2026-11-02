# Quote round 3: audit, round 2 (2026-11-02)

The tree was `main` at 154d4ac ("the audit's gaps of round 1 closed, mid-round; not gated"). It was built with `vite build --outDir e2e/out/dist-6151` and served by `vite preview --port 6151` through Playwright's webServer, one invocation at a time. Each server stopped when its walk ended, and nothing was left listening on 6151.

The walks ran at 390x844, 844x390, 834x1112, 1280x800, 1440x900 and 1920x1080. They are in `e2e/out/audit2-6151/`:

- `audit.walk.ts` is round 1's walk, adapted to the new tile markup and to the parts shelf, with arrival measures added.
- `probes.walk.ts` covers captions, disclosures, galleries, real pixels and Home's entrance.
- `probes2.walk.ts` covers the floating bars, keyboard reach and reduced motion.

The logs are `log.txt`, `log2.txt` and `log3.txt`. There are 800+ frames in `shots/`, named `<size>-<frame>.png`, plus contact sheets `M-*.png`. The PDFs printed at 1440 are rastered with PDF.js to `shots/pdf-*-p<n>.png`. Every verdict below comes from a frame I read with my own eyes, or from a measure in the logs. A fixer's word was not taken as proof.

The quote walked as "Stabicraft PA 600" is the Highfield Patrol 600 Open. The price file carries no Stabicraft PA 600, and "PA 600" is Highfield's own code.

---

## 1. The owner's asks: done, partly or not

| # | Ask | State | Proof |
|---|---|---|---|
| 1 | "all dropdowns on the quote expanded by default" | **done** | All 4 chapters are open at every size. "For the workshop" is now an open panel that lists only what is on the quote, so the tiles stay at their height (`1440x900-h06-walk-02.png`, `1440x900-t03-walk-04.png`). The floating total below a desk is a bar, not a disclosure (`log3.txt` [bars]). The only `aria-expanded=false` left are the triggers for Find, Name the customer and Change model, which are dialogs (`log2.txt` [disclosures], all six sizes). |
| 2 | "between the image and specs … more padding" | **done** | Specs sit 24px under the photograph at 1280, 1440 and 1920, 28px under it at 390, and 24px beside it at 834 and 844x390 (`log2.txt` [caption …]). |
| 3 | "per boat and product … more than one image and cover image" | **done** | The stage carries a count ("2") and opens a gallery that shows Cover, "1 of 2", a strip and Add pictures. "Make it the cover" made the second picture the stage's at every size (`log2.txt` [gallery] stage src → `sp560-w-w-wb-4…`). A motor took its own picture: "Added by Asaf, 2 November 2026 … 2 of 2 … Make it the cover, Take it off" (`1440x900-g05-motor-added.png`). |
| 4 | "some of the things i asked about i am not seeing" | **partly** | Of the 26 asks, 20 are done and 6 are partly done. Rows 6, 9, 13, 19, 24 and 25 below are the ones still short. |
| 5 | "for hull … why can i still see other models like pa 460" | **done** | The hull shows "MODEL Patrol 600 Open · Change model" with no other model in the chapter. The dialog holds 16 Patrols with what each one does to the total. After a choice, focus comes back to Change model and the step can be undone (`1440x900-p01-top.png`, `log.txt` [p03]). |
| 6 | "keen to see the final pdf result of something nice fully specced" | **partly** | The Sport 560 printed 3 clean sheets: the cover, the Specifications in two columns, Your quote with the motor's and trailer's facts, and Your price with GST and Acceptance (`pdf-highfield-sp560-p1..3.png`). But its cover is the top-down render, not the boat's photograph (gap D1). No Northside address, phone, email or ABN is set on Settings, so none prints, and the panel says so. |
| 7 | only the chapters scroll at a desk | **done** | The document height equals the window (800, 900 and 1080), and the chapters' column scrolls (`log.txt` docH). |
| 8 | masthead and customer in the top bar, hairline between mark and boat | **done** | `1440x900-p01-top.png`, `834x1112-p01-top.png`, `390x844-p01-top.png`. |
| 9 | a bigger photograph without captions | **partly** | No text stands on the photograph at any size (`log2.txt` "text over it: none" for the Patrol 600, Sport 560 and Patrol 460). It measures 976x556 at 1920, 568x361 at 1440, 399x343 at 834, and 520x261 at 1280. The cost is that nothing on the stage says what the picture shows that the quote does not (gap P5). |
| 10 | specs that open, designed | **done** | The four measures sit on a plate, and "Specification · 11 more measures" is open in the hull (`844x390-h06-walk-03` in `M-844-h06.png`). |
| 11 | products in a popup | **done** | "Show all 209 in Yamaha Outboards" opens a sheet with "Made for this boat" first (`1440x900-p06-showall.png`, `390x844-p06-showall.png`). |
| 12 | nothing blurry | **done** | Every stage photograph is drawn at or under its pixels: ×0.44 to ×0.85 (`log2.txt` [stage]). The picker's boat at 1920 now draws the 1,280px file at ×0.62 (it was ×1.24). |
| 13 | better clicks and animations | **partly** | The preparing moment plays, and under reduced motion every animation is 0.01ms (`log3.txt` [reduced]). Home pressed from Quotes paints 16 of 16 pictures at 538ms at 1440 and 547ms at 1920 (it was 1,983ms). A full load of Home at 1920 still paints 1 of 16 at 584ms and 16 at 3,873ms, and the sampler was blocked between those two readings (gap S1). |
| 14 | Find at the top left of the bar | **done** | Crest@384, then Find@430, at 1440. The order is the same at every size (`log.txt` pill contents). |
| 15 | the boat chosen in the hull in real time | **done** | `1280x800-p03-d-changed.png`: Patrol 460 re-rooted, "Now the Highfield Patrol 460 … Undo" in the total. |
| 16 | every chapter open | **done** | 4/4 `aria-expanded=true` on every quote at every size. |
| 17 | the hull easy | **done** | Coded colours now draw a palette glyph and "A code its maker does not name", not an empty well (`1440x900-p01-top.png`). At 844x390 the floating total covers nothing on arrival (`844x390-p01-top.png`). |
| 18 | the line items perfect | **done** | The picture press is an in-row 36px button. Rows read row, row, row (`1440x900-t03-walk-03.png`). Names are spelt out: "Striker Vivid 4cv with GT20-TM Transducer", "Backbone/Drop Cable · 2 m". The smaller faults left are in P6 and P7. |
| 19 | padding | **partly** | The customer dialog has 24px inside, and "R. Kelleher" stays on one line at 1280 (144x36). At 390 the floating total sits on the tab bar with 0px between them (gap P1). |
| 20 | "View final package": preparing, the boat, the lines, the PDF preview, Back to editing | **done** | One `<main>` at every size. Back to editing returns to the exact scroll on all 18 walks (`log.txt` "back to editing"). The boat's photograph leads the fold at 390, 844 and 834 (`cfg-pkg__shot-img` 358x201 at 390). "On this quote" stays beside paper pages 2–3 at a desk (`1920x1080-h08-e-package-3.png`). |
| 21 | the floating bar wider, its mark clean | **done** | Pill 675 at 1280 and 1440, 735 at 1920, 615 at 834 and 844, and a 358 tab bar at 390. |
| 22 | Home without the price-list stamp | **done** | `log.txt` home stamp: all false at every size. |
| 23 | New quote for a motor, a trailer or parts on their own | **done** | No shelf refuses (`log.txt` "parts refusal on shelf: 0"). The part's act reads "Parts & Accessories has been sold only with a boat. Starting this quote sells it on its own from now on." Its build fills the stage (`M-part.png`). |
| 24 | the printed quote "PERFECT w a cover page … boats photo … full spec … add/remove sections" | **partly** | The full spec prints, and "Choose what prints" offers the sections. The Stacer's cover is its photograph. The Highfields are not: the Sport 560 prints a render, and the Patrol 600 prints Highfield's logo with no boat at all (gap D1). |
| 25 | "if i take a screenshot, does it look PERFECT" | **partly** | 1 major (paper) and 13 minor remain, below. |
| 26 | "responsiveness on every single size" | **done** | No horizontal overflow in any frame. The 844x390 first window now holds the photograph and its measures (`844x390-p01-top.png`). |

---

## 2. Frames: PERFECT or NOT, and why

The columns are 390 (390x844), 844 (844x390), 834 (834x1112), 1280 (1280x800), 1440 (1440x900) and 1920 (1920x1080).

### page

| Frame | 390 | 844 | 834 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|
| Build top, Patrol 600 (`p01-top`) | PERFECT | PERFECT: photo 288x157 with specs 24px beside, total below | NOT, minor: a 12px sliver of colour cards under the total (bar 1,044–1,100 in a 1,112 window) | PERFECT | PERFECT | PERFECT |
| Build top, Sport 560 specced (`h03-specced-top`) | PERFECT | PERFECT | NOT, minor: same sliver | PERFECT | PERFECT | PERFECT |
| Hull and coded colours (`p02-hull`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Change model dialog (`p03-b-dialog`) | PERFECT | PERFECT: 2-line description, 3 rows of cards | PERFECT | PERFECT | PERFECT | PERFECT |
| After a change (`p03-d-changed`) | NOT, minor (P5) | NOT, minor (P5) | NOT, minor (P5) | NOT, minor (P5): Patrol 460 stage is the DG-G-DG render on an LG-W-DG quote, said nowhere on the stage | NOT, minor (P5) | NOT, minor (P5) |
| Stage gallery (`h05-a-gallery`) | NOT, minor: "1 of 2 · Highfield / Sport 560" wraps | NOT, minor: same wrap | PERFECT | PERFECT | PERFECT | PERFECT |
| Chapters, window by window (`h06/p05/t03/m04-walk-*`) | NOT, minor: the total sits flush on the tab bar (P1) | PERFECT: the pill's edge fades the text under it | PERFECT | PERFECT | NOT, minor: "…and 2 others ·" wraps its separator; Stacer's Dealer fit names the 3 parts twice (P6) | PERFECT |
| For the workshop (open panel) | NOT, minor: "Mount w 6Y5" shorthand (P7) | same | same | same | same | same |
| Show all sheet (`p06-showall`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Customer dialog (`h07-customer`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT (384x320, 24px inside) | PERFECT |
| Preparing moment (`h08-b-preparing`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Package, first fold (`h08-d-package`) | PERFECT: photo 358x201 under the title | PERFECT | PERFECT | PERFECT: "R. Kelleher" on one line | PERFECT | PERFECT |
| Package, scrolled (`h08-e-package-*`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT: "On this quote" stays | PERFECT |
| Back to editing (`h08-f-back`) | PERFECT (4502→4502) | PERFECT | PERFECT (2997→2997) | PERFECT | PERFECT | PERFECT |
| Motor alone, top (`m01-top`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT: one Dealer fit sentence | PERFECT: photo 976 wide |
| Part alone, top (`s15-part-build`) | PERFECT | PERFECT | PERFECT: one "View final package" | NOT, minor: two "View final package" in one window (P3) | NOT, minor: same (435,772 and 1,145,719) | NOT, minor: same, and a 300x300 picture in a 976x647 white card (P4) |
| Stacer top (`t01-top`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Keyboard reach (`k02-focus`) | PERFECT: Change model at Tab 6, a ring on every stop | PERFECT (Tab 7) | PERFECT | PERFECT | PERFECT | PERFECT |

### paper

| Frame | Verdict |
|---|---|
| PDF, Highfield Sport 560, 3 sheets | **NOT, major (D1):** the cover is the top-down render on a pale panel (`pdf-highfield-sp560-p1.png`). The desk note says why: "Nobody has checked that it shows this model, so it is not printed." Sheets 2 and 3 are PERFECT. NOT, minor (D2): no line carries a picture ("Pictures beside the items: none to print"). |
| PDF, Highfield Patrol 600 (package preview) | **NOT, major (D1):** the cover's pale panel holds Northside's mark and Highfield's logo stacked, with no boat (`1440x900-p09-d-package.png`). |
| PDF, Stacer 499, 3 sheets | Cover PERFECT (the photograph off three edges). Sheet 2 PERFECT, with the parts' pictures. NOT, minor (D2): sheet 3 holds only Your price, then about 210px of empty page, then Acceptance (`pdf-stacer-499-p3.png`). |
| PDF, Yamaha F115LB alone, 2 sheets | PERFECT: studio cover with "Pictured: two outboards…" and 8 facts; sheet 2 price and acceptance. |
| Printed-quote screen (`h09-b-doc-top`) at a desk | PERFECT: no "PAGE 1" chip. The panel says which sections print, and the reason for the cover. |
| Every sheet | NOT, minor (D3): no address, phone, email or ABN is set on Settings, so the customer gets no way to reach Northside. The panel says so. This is a Settings entry, not a build fault. |

### start

| Frame | 390 | 844 | 834 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|
| New quote (`s05-new`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| A boat chosen (`s08`) | PERFECT | PERFECT (×0.75) | PERFECT (×0.60) | PERFECT (×0.65) | PERFECT (×0.78) | PERFECT (×0.62); "No photograph yet" wells are the true state |
| Parts shelf and part chosen (`s12`, `s14`) | PERFECT: no refusal, one press | PERFECT | PERFECT | PERFECT | PERFECT: the left rail note is 4 lines | PERFECT |
| Quotes with one quote (`h10-quotes`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Home at rest (`h11-home`) | PERFECT (bar at the head, by decision) | PERFECT | PERFECT | PERFECT | PERFECT: "sold on a boat, or on their own from New quote" | PERFECT |
| Home entering (`home-*-early`) | PERFECT (6/6 at 529ms pressed) | – | – | – | PERFECT (16/16 at 538ms pressed; 1,352ms on a full load) | NOT, minor (S1): full load 1/16 at 584ms, 16/16 at 3,873ms |

### shell

| Frame | 390 | 844 | 834 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|
| Pill width and order | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Bar over a scrolled build (`k01-bars-over`) | NOT, minor (P1): the total's foot meets the tab bar at y 790 | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| The kit's toast (`g05-motor-added`) | – | – | – | – | NOT, minor (H1): the toast (x ≈1,073–1,383) laps the lightbox's lower-right corner (panel right ≈1,123) | – |

---

## 3. The gaps, grouped

### page

- **P1, minor, 390.** The floating total (16,734, 358x56, bottom 790) stands flush on the tab bar (top 790), with 0px between them. The two floating layers read as one block, and the total's lower corners vanish into the pill (`390x844-k01-bars-over.png`, `log3.txt` [bars]).
- **P2, minor, 834.** On arrival a 12px strip of the colour cards shows under the floating total (1,044–1,100) at the window's foot (1,112). The cards' words are cut there (`834x1112-p01-top.png`).
- **P3, minor, 1280, 1440 and 1920.** On a short build (a part alone) the total's "View final package" (435,772 at 1440) and the rail's door "View final package" (1,145,719) stand in one window: one act offered twice (`1440x900-s15-part-build.png`).
- **P4, minor, 1920.** The part-alone stage is a 976x647 white card holding the GA38's 300x300 picture, which fills about 14% of it (`1920x1080-s15-part-build.png`). This is honest, because enlarging the picture would blur it, but it reads as empty.
- **P5, minor, every size.** With the captions gone, nothing on the stage says what the picture shows that the quote does not. The Patrol 460's stage is the Dark Grey / Grey / Dark Grey render on a Light Grey / White / Dark Grey quote (`1280x800-p03-d-changed.png`). The Sport 560's photograph shows a Mercury 115 on an F90XB quote. Both are said only inside the gallery. This is the owner's call: "without captions" against the stage's honesty.
- **P6, minor, all desk sizes.** Two smaller faults in the Dealer fit chapter (`1440x900-t03-walk-02.png`):
  - Its head wraps "Striker Vivid 4cv with GT20-TM Transducer and 2 others ·" so the separator ends a line above "4 more offered".
  - The Stacer's Dealer fit says the three parts twice. A grey box says "Striker Vivid …, Garmin GA38 … and Garmin NMEA … are all on this quote, and each is charged.", and then "Also on this quote from Parts & Accessories" lists the same three rows.
- **P7, minor, all sizes.** For the workshop prints the file's shorthand: "Mount w 6Y5 2 Gauges" (`1440x900-h06-walk-02.png`). The lines elsewhere are spelt out.
- **P8, minor, 390 and 844x390.** The gallery count wraps as "1 of 2 · Highfield / Sport 560" (`390x844-h05-a-gallery.png`).

### paper

- **D1, major.** The Highfields print no photograph of the boat on the cover.
  - **What prints:** the Sport 560, the fully specced quote the owner asked to see, prints its top-down render on a pale panel (`pdf-highfield-sp560-p1.png`). The Patrol 600 prints Highfield's logo stacked under Northside's mark, with no boat at all (`1440x900-p09-d-package.png`).
  - **Why, and it is honest:** the stage's on-water photographs have not been checked by a person. The Sport 560's shows a Mercury 115, and the desk note says "Nobody has checked that it shows this model, so it is not printed."
  - **How it can close:** the owner's "using boats photo" waits on one of two acts. Either a person confirms the photograph against the model in the ledger, or Northside adds its own photograph through the gallery and makes it the cover.
- **D2, minor.** The Highfield's lines print no pictures ("none to print"), while the Stacer's parts do. The Stacer's sheet 3 is Your price, then about 210px of empty page, then Acceptance (`pdf-stacer-499-p3.png`).
- **D3, minor.** No Northside address, phone, email or ABN is set on Settings, so the printed quote gives no way to reach Northside. The panel says so. Setting them closes this gap.

### start

- **S1, minor, 1920.** A full load of Home paints 1 of 16 pictures at 584ms and 16 of 16 at 3,873ms. The sampler was blocked between those two readings for about 3.3s. At 1440 the same load takes 1,352ms. Pressed from Quotes, Home is fast at every size measured (529 to 547ms) (`log2.txt` [home goto]).
- Not walked this round: Quotes holding a boat, a motor and a part at once. Each kind was walked in its own context, and Quotes was read with one quote at all six sizes.

### shell

- **H1, minor, 1440.** The kit's toast "Your picture is on the Yamaha F90XB now · Undo" stands at about x 1,073–1,383. That is inside the 1,384 gutter now, but it laps about 50px over the open lightbox's lower-right corner (`1440x900-g05-motor-added.png`).

---

## Closed since round 1 (checked by eye and measure)

The following gaps from round 1 are closed:

- **Page:** P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11 (now the sliver in P2 above), P12, P13, P14, P15, P16, P17, P18, and P19 (except the workshop's "w").
- **Paper:** D3.
- **Start:** S1, S2, S3 (on a press), S4, S5 and S6.
- **Shell:** H1.

## Checks that found nothing wrong

- Nothing found fakes a figure or puts cost on a customer surface.
- Reduced motion holds: every animation measured 0.01ms under `prefers-reduced-motion: reduce`.
- Keyboard reach holds: Change model is reached at Tab 6 or 7, with a visible ring on every stop. The one stop with no text in the walk is the search field, which is named by its label.

## Probe results ignored as false positives

- OVERLAP between "Name the customer" and colour cards scrolled up under the masthead, which are clipped by `.cfg-scroll`.
- The Stacer's `stageAbsY 1431` at a desk. The probe added the column's scroll to a stage that does not scroll.
