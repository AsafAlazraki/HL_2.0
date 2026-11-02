# Quote round 3: audit, round 1 (2026-11-02)

The tree was `main` at 9b6fed6, which is a mid-round checkpoint and is not gated. It was built with `vite build --outDir e2e/out/dist-6151` and served by `vite preview --port 6151` through Playwright's webServer. The server stopped when each walk ended, and nothing was left listening on 6151.

Four walks ran at 390x844, 844x390, 834x1112, 1280x800, 1440x900 and 1920x1080. They are in `e2e/out/audit-6151/` (`audit.walk.ts`, `audit2..5.walk.ts`), with logs in `log*.txt` and 782 frames in `e2e/out/audit-6151/shots/` named `<size>-<frame>.png`. PDF pages were rastered with PDF.js into `shots/pdf-*-p<n>.png`.

- **start:** Home, Quotes empty and Quotes with one quote and with three kinds, New quote, a boat on the picker, a motor, a trailer, and a part on its own.
- **pa600:** the Highfield Patrol 600 Open (the "PA 600" is Highfield's; no Stabicraft PA 600 exists on the file). The walk covers the top, the hull, Change model and a change to the Patrol 460 and back by Undo, the gallery, every chapter window by window, Show all, the customer dialog, View final package (the preparing moment at 250 and 650 ms, the package scrolled) and Back to editing.
- **sp560:** the Highfield Sport 560 in Hypalon, White / White / White/Blue, with the Yamaha F90XB, the REDCO trailer and 2 x MFM50. GST was set to 10 on Settings. The walk then repeats the pa600 walk, gives the quote, opens the printed quote and prints it to PDF.
- **motor:** the Yamaha F115LB on its own, with Change motor, the gallery, the chapters and the package, given and printed.
- **stacer:** the Stacer 499 Sea Ranger SDF with three parts (the Striker Vivid 4cv, GA38 and NMEA cable), given and printed.
- **probes:** the probes cover the following.
  - Every folded disclosure on the build.
  - Real pixels against drawn size for every photograph.
  - The gallery's acts: the second picture made the cover, and a motor's own picture added.
  - Air under the photograph, and the finish plate's share of the photograph.
  - Back to editing's scroll and address.
  - Main landmarks.
  - How long Home takes to paint.

---

## 1. The owner's asks: done, partly or not

| # | Ask | State | Proof |
|---|---|---|---|
| 1 | "all dropdowns on the quote expanded by default" | **partly** | The chapters are 4 of 4 `aria-expanded=true` at every size. Every specification stands open: 4 under the photograph, and "Specification · 11 more measures" in the hull (`1440x900-p02-hull.png`). Still folded: three "For the workshop" disclosures (Motor, Trailer, Dealer fit) at every size, and the floating total ("What the total is made of") below a desk (`log2.txt` [disclosures]). Both were kept folded by the decision of 2026-11-02. |
| 2 | "between the image and specs … more padding" | **done** | The air is 24px under the photograph at 1280, 1440 and 1920, 24px beside it at 834 and 844x390, and 28px at 390 (`log.txt` "air"). |
| 3 | "per boat and product … more than one image and cover image" | **done** | The stage shows a count ("2") and opens the row's gallery, with the cover first and marked, a strip, arrows, and Add pictures (`1440x900-h05-a-gallery.png`). "Make it the cover" on the Sport 560's second picture changed the stage to it at once (`1440x900-g03-stage-new-cover.png`). A motor's own picture added reads "Added by Asaf, 2 November 2026", 2 of 2, with Make it the cover and Take it off (`1440x900-g05-motor-added.png`). |
| 4 | "some of the things i asked about i am not seeing" | **partly** | This audit: 14 of 26 asks are partly or not done (13 partly, 1 not), and 12 are done. |
| 5 | "for hull, i pick my model - why can i still see other models like pa 460" | **done** | The hull shows "MODEL Patrol 600 Open · Change model", with 0 model cards in the chapter and 16 Patrols in the dialog (`1440x900-p02-hull.png`, `1440x900-p03-b-dialog.png`). Choosing the Patrol 460 re-roots at once, and focus returns to Change model (`1440x900-p03-d-changed.png`). The Stacer's dialog holds 6. A motor alone is "Change motor": the 9 nearest of 138. |
| 6 | "keen to see the final pdf result of something nice fully specced" | **partly** | The Sport 560 printed 3 sheets (`pdf-highfield-sp560-p1..3.png`). Its cover is the top-down studio render on a pale panel, not the boat's photograph. No item on it carries a picture ("Pictures beside the items: none to print"). Northside's address, phone, email and ABN print nowhere because none is set on Settings, and the desk note says so. |
| 7 | only the chapters scroll at a desk | **done** | The document height equals the window (800, 900 and 1080), and the chapters' column scrolls (2,710 to 3,327px). |
| 8 | the masthead and the customer in the top bar, a hairline between the maker's mark and the boat | **done** | `1440x900-p01-top.png` and `834x1112-p01-top.png` show a vertical hairline. `390x844-p01-top.png` shows a horizontal one. |
| 9 | a bigger photograph without captions | **partly** | The photograph is 568x383 at 1440, 976x577 at 1920, 520x283 at 1280 and 399x266 at 834. But a "Your finish" plate stands on its lower-left corner at every size. On the Sport 560 it covers 29.8% of the photograph at 844x390, 16.8% at 834 and 12.2% at 1280. On the Patrol 600 it covers 14.5% at 390 (`log5.txt`; `834x1112-h03-specced-top.png`). |
| 10 | specs that open, designed | **done** | Every measure is open: a 4-measure plate under the photograph and an "N more measures" grid in the subject's chapter (`1920x1080-h03-specced-top.png`). |
| 11 | products in a popup | **done** | "Show all 209 in Yamaha Outboards" opens a sheet at every size. Tile figures share one line (tops 295/115 ×4 at 1440) (`1440x900-p06-showall.png`). |
| 12 | nothing blurry | **partly** | Every build photograph is drawn under its pixels (the stage at 0.45 to 0.86 of its file). The picker's chosen boat at 1920 is the 640px file drawn in a 544x529 cover box, 1.24x its pixels (`log2.txt` [picker boat], `1920x1080-s08-new-highfield-chosen.png`). |
| 13 | better clicks and animations | **partly** | The preparing moment plays and settles (`844x390-h08-b-preparing.png`). Pressing Home from Quotes at 1440 paints 0 of 16 pictures at 561ms and 16 of 16 at 1,983ms, and the main thread does not answer for about 1.4s. In between, the wordmark is blurred and both rails are empty (`1440x900-home-press-early.png`, `log4.txt`). |
| 14 | Find at the top left of the bar | **done** | The crest is at x 384 and Find at x 430 at 1440. The order is the same at every size (`log.txt` "pill contents"). |
| 15 | the boat chosen inside the hull chapter in real time | **done** | Material and colour are presses in the chapter. Change model's dialog closes onto the re-rooted build with Undo in the total (`1440x900-p03-d-changed.png`). |
| 16 | every chapter open | **done** | 4 of 4 `aria-expanded=true` at all six sizes on all three boat quotes. |
| 17 | the hull easy | **partly** | The model line, chips and colour cards are good. Coded colours (O-G-DG, R-B-B, I-B-C) draw an empty dashed well (`1440x900-p01-top.png`). At 844x390 the floating total covers the model line and Change model on arrival (`844x390-p01-top.png`). |
| 18 | the line items perfect | **partly** | The acts end at one edge (x 1352 at 1440). Every row or tile with a picture carries its own full-width "See its picture larger" line under it, outside the row (`1440x900-t03-walk-03.png`, `1440x900-m04-walk-01.png`, `390x844-p06-showall.png`). |
| 19 | padding | **partly** | The customer dialog has 24px inside at every size (`1440x900-h07-customer.png`). The package's "For" cell breaks "R. / Kelleher" at 1280 (`1280x800-h08-d-package.png`). The handover card keeps two measures at 834 and 1920. |
| 20 | "View final package": a preparing moment, the boat, the lines, the real PDF preview, Back to editing | **partly** | All five are there. But the page has two `<main>` landmarks at every size. Back to editing lands 37px short at 390 and 834 on the Sport 560 and the motor (4194→4157, 2713→2676, 3100→3063). The left column is empty beside paper pages 2 and 3 at a desk (`1440x900-h08-e-package-3.png`). |
| 21 | the floating bar wider, its mark clean | **done** | The pill is 614.5px at 834 and 844, 674.5 at 1280 and 1440, 734.5 at 1920, and 358 at 390 (tab bar). The crest at 4x has no seam (`1440x900-s03-crest-x4.png`). |
| 22 | Home without the price-list stamp | **done** | No "Price list of", "16 September" or "Answer them" appears at any size (`log.txt` "home stamp"). |
| 23 | New quote for a motor, a trailer or parts on their own | **partly** | A motor (`s09`/`s10`) and a trailer (`s11-new-trailer`) open from New quote. Parts & Accessories and Dealer Fit Packages refuse ("is sold only with a boat today, so it cannot start a quote on its own"), although the page says "A boat, or a motor, a trailer or a part on its own" (`1440x900-s12-new-parts-shut.png`). After "Sell it on its own too", a part starts a quote (`1440x900-s15-part-build.png`), but that build's stage is a hole (gap P6). |
| 24 | the printed quote "PERFECT w a cover page … boats photo … full spec … add/remove sections" | **partly** | The Stacer's cover is the photograph off three edges (`pdf-stacer-499-p1.png`). The spec page and each line's facts print. "Choose what prints" offers the sections. The Highfield's cover is the render, not the boat's photograph (`pdf-highfield-sp560-p1.png`). |
| 25 | "if i take a screenshot, does it look PERFECT … scroll … expand and collapse" | **not** | 19 page gaps, 3 paper, 6 start and 2 shell, below. |
| 26 | "responsiveness on every single size" | **partly** | No horizontal overflow at any size on any screen walked (0 `H-OVERFLOW` in 782 frames). At 844x390 the boat's photograph stands after every chapter, and the floating total covers the hull's first line. |

---

## 2. Frames: PERFECT or NOT, and why

The sizes are 390 (390x844), 844 (844x390), 834 (834x1112), 1280 (1280x800), 1440 (1440x900) and 1920 (1920x1080). Each verdict is from the frame named, with the element and its measure.

### page (src/screens/configurator)

| Frame | 390 | 844 | 834 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|
| Build top, Patrol 600 (`p01-top`) | NOT, minor: finish plate 194x62, 14.5% of the photograph | **NOT, major:** the total (y 322–378) covers "MODEL Patrol 600 Open · Change model"; no photograph in the window (stage at y 3,029 of 3,365) | NOT: plate 12.2%; the total covers the colour card on the quote (396,1061) | NOT, minor: plate 8.8% | NOT, minor: plate 6.0% | NOT, minor: plate 2.3% |
| Build top, Sport 560 specced (`h03-specced-top`) | NOT, minor: plate 9.7% | **NOT, major:** as above, plate 29.8% of a 288x208 photograph | NOT: plate 248x72, 16.8%, over the motor and stern | NOT: plate 12.2% over the outboard | NOT, minor: plate 8.2% | PERFECT apart from the plate (3.2%) |
| Hull (`p02-hull`) | NOT, minor: O-G-DG and R-B-B empty dashed wells | **NOT, major:** the model line is under the total | NOT, minor: the empty wells | NOT, minor: the empty wells | NOT, minor: the empty wells | NOT, minor: I-B-C empty well |
| Change model dialog (`p03-b-dialog`) | PERFECT: one card across, scrolls | NOT, minor: the 3-line description takes 100 of 358px, so 2 rows of cards show | PERFECT | PERFECT | PERFECT: 16 fit in 640x864 | PERFECT |
| After a change (`p03-d-changed`) | PERFECT | PERFECT | PERFECT | NOT, minor: the photograph goes 283→264 with the step; the plate lies on the Patrol 460 render's stern | NOT, minor: the plate on the render's stern quarter (68–266, 461–525) | PERFECT |
| Stage gallery (`h05-a-gallery`) | NOT, minor: "1 of 2 · Highfield Sport / 560" wraps the number alone | PERFECT: the strip yields to height; arrows and count reach all | PERFECT | PERFECT | PERFECT | PERFECT |
| Chapters, window by window (`h06-walk-*`, `t03-walk-*`) | **NOT, major:** "See its picture larger" as its own line under every pictured row and tile; 3 "For the workshop" folded | same | same | same | same (`1440x900-t03-walk-03.png`) | same |
| Show all sheet (`p06-showall`) | NOT, minor: a "See its picture larger" line under each of 209 tiles | same | same | same | Tiles PERFECT (one height per row, figures on one line); lines as above | same |
| Customer dialog (`p08-customer`) | PERFECT (358 wide) | PERFECT (384x320 at 230,35) | PERFECT | PERFECT | PERFECT (384x320, 24px inside) | PERFECT |
| Preparing moment (`h08-b-preparing`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Package, first fold (`h08-d-package`) | NOT, minor: the fold is the handover form; the boat is a 64px thumbnail, and the paper starts at y 1,137 | NOT, minor: same; the paper at y 1,121 | NOT, minor: notes at about 345px in a 786px card; the paper at y 1,143 | **NOT, major:** "R. / Kelleher" breaks over two lines in the "For" cell | PERFECT | NOT, minor: notes end at x 622 while the fields reach 774 (two measures) |
| Package, scrolled (`h08-e-package-*`) | PERFECT | PERFECT | PERFECT | NOT, minor: the left column is empty beside pages 2–3 | NOT, minor: same, about 1,800px of an empty 462px column | NOT, minor: same |
| Package landmarks (all frames) | **NOT, major:** 2 `<main>` | same | same | same | same | same |
| Back to editing (`h08-f-back`) | NOT, minor: 37px short (4194→4157) | PERFECT (exact; the address is unchanged) | NOT, minor: 37px short (2713→2676) | PERFECT | PERFECT | PERFECT |
| Motor alone, top (`m01-top`) | NOT, minor: Dealer fit says it twice | **NOT, major:** the total covers "Change motor" | NOT, minor: Dealer fit says it twice | NOT, minor: same | NOT, minor: same | NOT, minor: the 800px photograph frame in a 976px column (right edges 880 vs 1,056) |
| Part alone, top (`s15-part-build`) | NOT: a 300px card in a 358px column; the total covers "01 The product" | **NOT, major:** the total covers "Change product" | **NOT, major:** two "View final package" side by side (total at y 1,066, door at 1,078); the sentence floats top-right | **NOT, major:** a 300x300 card in a 520px column and a lone 12px sentence | **NOT, major:** same, a 200px hole | **NOT, major:** same, a 380px hole (`1920x1080-s15-part-build.png`) |
| Stacer top (`t01-top`) | PERFECT | **NOT, major:** the total covers "Change model" | PERFECT | PERFECT | PERFECT | PERFECT |

### paper (src/screens/document and the PDF)

| Frame | Verdict |
|---|---|
| PDF, Highfield Sport 560, 3 sheets | **NOT, major:** the cover prints the top-down render on a pale panel, not the boat's photograph (`pdf-highfield-sp560-p1.png`). Sheets 2 and 3 are clean: the Specifications in two columns, Your quote with the motor's and trailer's facts, and Your price with GST (`-p2`, `-p3`). |
| PDF, Stacer 499, 3 sheets | PERFECT cover: the photograph off three edges, 794x529 from 1,100px. Sheet 2: the parts carry their pictures. NOT, minor: sheet 3 holds only Your price and Acceptance, and ends at about 625 of 1,020 (`pdf-stacer-499-p3.png`). |
| PDF, Yamaha F115LB alone, 2 sheets | PERFECT. The cover is the studio panel with its "Pictured: two outboards…" line and 8 facts. Sheet 2 is the price once, then acceptance (`pdf-motor-f115-p1..2.png`). |
| Printed-quote screen, 390, 844 and 834 | PERFECT: the panel comes first and the paper follows (`844x390-h09-b-doc-top.png`). |
| Printed-quote screen, 1280, 1440 and 1920 | NOT, minor: the "PAGE 1" chip stands alone in the left margin (x 67 at 1440, x 307 at 1920) (`1440x900-h09-b-doc-top.png`). |

### start (picker, quotes, Home)

| Frame | 390 | 844 | 834 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|
| New quote (`s05-new`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| A boat chosen on the picker (`s08`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT (0.78) | **NOT, major:** the photograph is 1.24x its 640px file |
| A motor (`s09`, `s10`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Parts shelf (`s12-new-parts-shut`) | **NOT, major:** refuses until "Sell it on its own too" | same | same | same | same | same |
| Quotes, empty, one, and three kinds (`s04`, `h10`, `q-*-quotes`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT (`q-1440x900-quotes.png`) | PERFECT |
| Home, at rest (`h11-home`) | PERFECT | PERFECT | PERFECT | PERFECT | NOT, minor: "…motors, and trailers… are chosen in the build, on the boat" contradicts New quote | same as 1440 |
| Home, entering (`home-press-early`) | NOT: 0 of 6 painted at 607ms, 6 of 6 at 1,583ms | not measured | not measured | not measured | **NOT, major:** 0 of 16 at 561ms, 16 at 1,983ms, the wordmark blurred | not measured |

### shell (the floating bar)

| Frame | 390 | 844 | 834 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|
| Pill width and order | PERFECT (358, tab bar) | PERFECT (614.5) | PERFECT (614.5) | PERFECT (674.5) | PERFECT (674.5) | PERFECT (734.5) |
| Crest at 4x | | | | | PERFECT | |
| Bar over a scrolled build (`p05-walk-01`) | PERFECT | NOT, minor: the build's text passes under the pill with no edge ("MODEL P…", "…ge model" either side) | PERFECT | PERFECT | PERFECT | PERFECT |
| The kit's toast (`g03`, `g05`) | | | | | NOT, minor: the toast stands at x 1,100–1,424, past the page's 1,384 gutter, and abuts the lightbox's Close at x 1,105 | |

---

## 3. The gaps, grouped

### page

- **P1, major, 844x390.** On arrival the floating total (y 322–378) covers the subject's first line and its change press on every quote. This is "MODEL Patrol 600 Open · Change model", "Change motor" on the F115 and "Change product" on the GA38. Only the next row peeks below (`844x390-p01-top.png`, `844x390-m01-top.png`, `844x390-t01-top.png`).
- **P2, major, 844x390.** The boat's photograph and its four measures stand after all four chapters: the stage is at y 3,029 of 3,365 on the Patrol 600 and 3,226 of 3,562 on the Sport 560. The first window has no picture of the boat, and the photograph, when reached, is 288x208 (`844x390-p05-walk-10.png`).
- **P3, major, all sizes (worst 844x390, 834, 390 and 1280).** The "Your finish" plate stands on the photograph. On the Sport 560 it covers 29.8% at 844x390, 16.8% at 834, 12.2% at 1280, 8.2% at 1440 and 3.2% at 1920. On the Patrol 600 it covers 21.7%, 14.5% at 390, 12.2% at 834 and 8.8% at 1280. It says "Photographed in the maker's finish" on the Patrol (`log5.txt`). The owner asked for the photograph without captions.
- **P4, major, all sizes.** The final package has two `<main>` landmarks at every size, on every quote. `Configurator.tsx:5790` renders `<Document quoteId={quoteId} />` without the `embedded` prop that `Document.tsx:307` now takes.
- **P5, major, all sizes.** Every row and tile with a picture carries a full-width "See its picture larger" line under it, outside the row. The Stacer's three chosen parts read row, link, row, link, row, link (`1440x900-t03-walk-03.png`). Add a boat on a motor alone reads the same (`1440x900-m04-walk-01.png`), and the Show all sheet has 209 of them (`390x844-p06-showall.png`).
- **P6, major, every size.** A part sold on its own (Garmin GA38) has a broken stage.
  - **Desk sizes:** the stage draws its 300x300 picture in a 300px card, left-aligned in a 520 to 976px column. It leaves an empty hole (about 200px at 1440 and 380px at 1920) and sets "The price list gives no specifications for this product." alone at 12px above the total (`1920x1080-s15-part-build.png`).
  - **834:** the sentence floats at the top right beside the card (`834x1112-s15-part-build.png`).
  - **390:** the card is 300 of a 358px column.
- **P7, major, 834.** On a short build (the part alone) the floating total's "View final package" and the rail's "View final package" door stand side by side, at y 1,066 and 1,078. The total covers the door's own words (`834x1112-s15-part-build.png`).
- **P8, major, 1280.** The package's "For" cell breaks "R. Kelleher" over two lines, "R." and "Kelleher" (`1280x800-h08-d-package.png`).
- **P9, major, all sizes (owner's words).** Three "For the workshop" disclosures (Motor, Trailer, Dealer fit) are folded by default, and so is the floating total below a desk (`log2.txt` [disclosures]). The owner said "all dropdowns on the quote expanded by default". The decision of 2026-11-02 keeps them folded because opening one takes a motor tile from 147 to 305px. The fix is a form that is open and does not clutter, or the owner's word on the exception.
- **P10, minor, all sizes.** Coded colours (O-G-DG and R-B-B on the Patrol 600, I-B-C on the Sport 560) draw an empty dashed 64x48 well where every other card has swatches. It reads as a missing picture (`1440x900-p01-top.png`).
- **P11, minor, 834.** On arrival the floating total covers the colour card that is on the quote (overlap at 396,1061) (`834x1112-p01-top.png`).
- **P12, minor, 1280 and 1440.** After a change the photograph shrinks with the step in the total (283 to 264 at 1280). On a studio render the finish plate lies on the boat's stern (`1280x800-p03-d-changed.png`).
- **P13, minor, 390 and 834.** Back to editing lands 37px above where the person left on the Sport 560 and the motor (4194→4157 at 390, 2713→2676 and 3100→3063 at 834). The customer's step "For R. Kelleher · Undo" stays in the floating total until the package opens, and leaves while the person is away (`390x844-h08-a-door.png` against `390x844-h08-f-back.png`).
- **P14, minor, 1280, 1440 and 1920.** While the paper scrolls through pages 2 and 3, the package's left column is empty (about 1,800px at 1440), because "On this quote" scrolls away (`1440x900-h08-e-package-3.png`).
- **P15, minor, 834 and 1920.** The handover card has two measures: the notes are about 345px in a 786px card at 834, and end at x 622 against fields to x 774 at 1920 (`834x1112-h08-d-package.png`).
- **P16, minor, 390, 834 and 844.** The package's first fold has no picture of the boat beyond a 64px line thumbnail. The paper's cover starts at y 1,121 to 1,143.
- **P17, minor, all sizes.** A motor alone's Dealer fit says one thing twice, in two grey rows: "Nothing from Rigging Kits goes with this motor." and "The price list has no rigging kit for the F115LB." (`1440x900-m01-top.png`).
- **P18, minor, 1920.** The motor-alone photograph frame is 800px, its file's width, in a 976px column. Its right edge is at 880 while the measures and the total end at 1,056 (`1920x1080-m01-top.png`).
- **P19, minor.** The build prints the file's shorthand where the paper spells it out: "Striker Vivid 4cv w GT20-TM Transducer" and "Backbone/Drop Cable · 2mtr" on the build, "with" and "2 m" on the paper (`1440x900-t03-walk-03.png` against `pdf-stacer-499-p2.png`). Also minor: at 844x390 the Change model dialog's three-line description takes 100 of 358px, and at 390 the gallery count wraps "560" alone.

### paper

- **D1, major.** The Sport 560, the fully specced quote the owner asked to see, prints a top-down studio render on a pale panel as its cover, not the boat's photograph (`pdf-highfield-sp560-p1.png`). The Stacer's cover is the photograph off three edges. Cover-pick.md gives the cause: the SP560's on-water photograph is `person: false` in `data/northside/pictures.json`. The owner asked for "using boats photo".
- **D2, minor.** The Highfield's lines print no pictures ("Pictures beside the items: none to print"), while the Stacer's parts do. The Stacer's third sheet holds only Your price and Acceptance and ends at about 625 of 1,020.
- **D3, minor, desk sizes.** On the printed-quote screen the "PAGE 1" chip stands alone in the left margin (x 67 at 1440, x 307 at 1920) (`1440x900-h09-b-doc-top.png`).

### start

- **S1, major, every size.** On New quote, Parts & Accessories and Dealer Fit Packages refuse to start a quote until "Sell it on its own too" is pressed. The page's own line promises "A boat, or a motor, a trailer or a part on its own", and the owner asked for parts on their own (`1440x900-s12-new-parts-shut.png`).
- **S2, major, 1920.** The picker's chosen-boat panel draws `highfield-pa600-…-640.webp` (640x427) in a 544x529 cover box, 1.24x its pixels. The 1,280px file exists, and the build uses it (`log2.txt`, `1920x1080-s08-new-highfield-chosen.png`).
- **S3, major, 1440 (390 also slow).** Home's entrance is slow.
  - **Pressed from Quotes at 1440:** 0 of 16 pictures are painted at 561ms and 16 of 16 at 1,983ms. The main thread did not answer for about 1.4s, and at about 600ms the wordmark is blurred and both rails are empty (`1440x900-home-press-early.png`, `log4.txt`).
  - **Full load:** 16 are painted at 4.7s.
  - **390:** 6 of 6 are painted at 1,583ms.
- **S4, minor.** Home says "Yamaha and ePropulsion motors, and trailers from 7 makers, are chosen in the build, on the boat." while New quote sells both on their own (`1440x900-h11-home.png`).
- **S5, minor.** The parts picker's left rail sets a nine-line paragraph about 699 parts no longer sold, at 12px in a 190px column. The picker names the same measures "OA length" and "Int length" where the build says "Length overall" and "Inside length" (`1440x900-s14-new-parts-chosen.png`, `1920x1080-s08-new-highfield-chosen.png`).
- **S6, minor, 834, 844 and 1280.** The "Sell it on its own too" Undo toast stands over the parts list's cards (the probe's overlap with the PFD100 card).

### shell

- **H1, minor, 844x390.** Over a scrolled build the build's text passes under the floating pill with no edge: "MODEL P…" and "…ge model" show either side of it (`844x390-p05-walk-01.png`).
- **H2, minor, 1440.** The kit's toast stands at x 1,100–1,424, past the page's 1,384 gutter, and abuts the lightbox's Close at x 1,105 (`1440x900-g05-motor-added.png`).

---

Nothing was found that fakes a figure or puts cost on a customer surface. Reduced motion and keyboard reach were not measured this round, beyond focus returning to Change model after its dialog closes. Three kinds of probe hit were false positives and are ignored:

- "ENLARGED" on images with a `srcset`, where real pixels were measured instead.
- "OVERLAP" between the pill and content scrolled under it, or rows clipped above `.cfg-scroll`.
- The PDF raster's last row, which is anti-aliasing at 1,122.5px.
