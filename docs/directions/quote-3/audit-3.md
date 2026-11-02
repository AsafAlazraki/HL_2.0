# Quote round 3: audit, round 3 (2026-11-03)

The tree audited was `main` at ccba87a ("the audit's gaps of round 2 closed, mid-round; not gated"), with a clean working tree. It was built with `vite build --outDir e2e/out/dist-6151` and served by `vite preview --port 6151` through Playwright's webServer, one invocation at a time. After the last walk nothing was listening on 6151.

**The walks.** Every walk ran at 390x844, 844x390, 834x1112, 1280x800, 1440x900 and 1920x1080, and they are in `e2e/out/audit3-6151/`:

- `audit.walk.ts` is round 2's walk with four additions: a measure of the gallery count's lines, the workshop panel, printing the Patrol 600 as well, and the cover ask on the document.
- `probes.walk.ts` and `probes2.walk.ts` are unchanged. They cover captions, disclosures, galleries, real pixels, Home's entrance, the floating bars, keys and reduced motion.
- `probes3.walk.ts` tests the total's door fade at the desk sizes.
- `probes4.walk.ts` tests the cover ask on a draft document at all six sizes.

**The logs.** Each walk has its own log:

| Log | What is in it |
|---|---|
| `log.txt` | `audit.walk.ts` |
| `log2.txt` | `probes.walk.ts`: captions, disclosures, galleries, real pixels, Home's entrance |
| `log3.txt` | `probes2.walk.ts`: bars, keys, reduced motion |
| `log4.txt` | the door fade |
| `log5.txt` | the cover ask |

**The frames and PDFs.** About 870 frames are in `shots/`, named `<size>-<frame>.png`. The contact sheets are `M-*.png`. The four PDFs were printed at 1440 and rastered with PDF.js to `shots/pdf-*-p<n>.png`.

**How each verdict was reached.** Every verdict below comes from a frame I read myself, or from a measure in the logs. A fixer's word was not taken as proof.

**The Stabicraft PA 600.** The quote walked under that name is the Highfield Patrol 600 Open. The price file carries no Stabicraft PA 600, and "PA 600" is Highfield's own code.

**A probe of mine that hung.** `probes3.walk.ts` stepped the column after a full spec, and that run hung because my locator for the trailer tile timed out, not because of the app. I stopped it and freed the port. Its earlier passes are in `log4.txt`.

---

## 1. The owner's asks: done, partly or not

| # | Ask | State | Proof |
|---|---|---|---|
| 1 | "all dropdowns on the quote expanded by default" | **done** | All 4 chapters have `aria-expanded=true` on every quote at every size. The only closed triggers left are Find, Name the customer and Change model, and each of those opens a dialog (`log2.txt` [disclosures]; `log.txt` heads=…=true). "For the workshop" is an open panel (`1440x900-h06w-workshop.png`). |
| 2 | "between the image and specs … more padding" | **done** | The specs sit 24px under the photograph at 1280, 1440 and 1920, and 28px under it at 390. At 834 and 844x390 they sit 24px beside it (`log2.txt` [caption …]). |
| 3 | "per boat and product … more than one image and cover image" | **done** | The Sport 560's gallery shows "Cover · 1 of 2 · Sport 560", a strip of pictures and Add pictures. "Make it the cover" moved the stage to `sp560-w-w-wb-4…` at all six sizes (`log2.txt` [gallery]). A motor took its own picture: "Added by Asaf … 2 of 2 … Make it the cover, Take it off" (`1440x900-g05-motor-added.png`). New: a draft's document now offers "Add a photograph for the cover", which opens "Pictures of the Highfield Patrol 600 Open" with Add pictures (`1440x900-y01-cover-ask.png`, `1440x900-y02-cover-dialog.png`, and all six sizes in `log5.txt`). |
| 4 | "some of the things i asked about i am not seeing" | **partly** | Of the 26 asks, 19 are done and 7 are partly done. Rows 6, 12, 18, 20, 24, 25 and 9's trade-off are the ones still short. The one the owner will see first is the Highfield's cover (D1). |
| 5 | "for hull … why can i still see other models like pa 460" | **done** | The hull shows "MODEL Patrol 600 Open · Change model", and no other model stands in the chapter (`1440x900-p01-top.png`). The dialog holds the 16 Patrols, each with what it does to the total (`1440x900-p03-b-dialog.png`). After a choice, focus returns to Change model and the change can be undone (`log.txt` [p03]). |
| 6 | "keen to see the final pdf result of something nice fully specced" | **partly** | The fully specced Sport 560 prints 3 clean sheets: <br>• the cover <br>• the Specifications in three groups, then Your quote with the motor's facts <br>• the trailer, Dealer fit, Your price with the boat beside the figures and GST at 10%, then Acceptance <br>(`pdf-highfield-sp560-p1..3.png`). Its cover is still the top-down render on a pale panel, not the boat's photograph (D1). No address, phone or email for Northside prints (D3). |
| 7 | only the chapters scroll at a desk | **done** | The document height equals the window: 800, 900 and 1080 (`log.txt` docH). |
| 8 | masthead and customer in the top bar, hairline between mark and boat | **done** | `1440x900-p01-top.png`, `834x1112-p01-top.png`, `390x844-p01-top.png`. |
| 9 | a bigger photograph without captions | **done (one trade-off)** | No text stands on the photograph at any size (`log2.txt`: "text over it: none"). It measures: <br>• 976x556 at 1920 <br>• 568x361 at 1440 <br>• 399x355 at 834 <br>• 520x261 at 1280 <br>On the specced Sport 560 at 1280 it shrinks to 520x212 (P9). The stage still does not say what the picture shows that the quote does not (P5, the owner's call). |
| 10 | specs that open, designed | **done** | The four measures sit on a plate. "Specification · 11 more measures" is open in the hull (`1920x1080-h03-specced-top.png`). |
| 11 | products in a popup | **done** | "Show all 209 in Yamaha Outboards" opens a sheet with "Made for this boat" first (`390x844-p06-showall.png`, `1440x900-p06-showall.png`). |
| 12 | nothing blurry | **partly** | Every stage photograph is drawn under its real pixels: ×0.42 to ×0.85, measured with a fresh decode (`log2.txt` [stage]). The picker's chosen-part card draws the GA38's 300x300 file at ×1.19 (390) up to ×1.95 (1920), and it is visibly soft (`zoom-1920-s14.png`; S2). |
| 13 | better clicks and animations | **done** | The preparing moment plays. Under reduced motion every animation is 0.01ms (`log3.txt` [reduced]). A full load of Home at 1920 now paints 16 of 16 pictures by 1,360ms (it was 3,873ms), and pressed from Quotes by 532ms (`log2.txt` [home goto/press]). |
| 14 | Find at the top left of the bar | **done** | At every size the bar reads Crest, then Find, then Home (`log.txt` pill contents). |
| 15 | the boat chosen in the hull in real time | **done** | The Patrol 460 takes the 600's place in the same chapter, with "Now the Highfield Patrol 460 … Undo" in the total (`1440x900-p03-d-changed.png`). Undo brings back "Highfield Patrol 600 Open". |
| 16 | every chapter open | **done** | See row 1. |
| 17 | the hull easy | **done** | Material, colour and the measures are one chapter. A coded colour draws a palette glyph and "A code its maker does not name" (`1440x900-p01-top.png`). |
| 18 | the line items perfect | **partly** | Fixed since round 2: <br>• The Dealer fit head no longer leaves a separator at a line end. <br>• The Stacer's three parts are said once. <br>• The workshop now spells out "Mount with 6Y5" (`1440x900-t03-walk-02.png`, `1440x900-h06w-workshop.png`). <br>Still short: a motor's measures on the build speak the file's shorthand, "L4 / 1832cc", "Remote mech" and "Power Trim & Tilt", while the paper prints "In-line 4, 1,832 cc", "Mechanical remote" and "Power" (P10). |
| 19 | padding | **done** | At 390 the floating total stands 8px above the tab bar (bar bottom 782, pill top 790), on the room's own ground (`log3.txt` [bars], `390x844-k01-bars-over.png`). At 834 the total is flush with the window's foot (1,056–1,112). The customer dialog has 24px inside. |
| 20 | "View final package": a preparing moment, the boat, the lines, the PDF preview, Back to editing | **partly** | One `<main>` at every size. Back to editing returns to the exact scroll on all 18 walks (`log.txt` "back to editing"). The package says nothing about why the Highfield's cover is a render or a logo, and it does not offer the cover act. That sentence and its button live only on the document page (P11). |
| 21 | the floating bar wider, its mark clean | **done** | The pill is 675 wide at 1280 and 1440, 735 at 1920 and 615 at 834 and 844. At 390 it is a 358 tab bar. |
| 22 | Home without the price-list stamp | **done** | `log.txt` home stamp: false at every size. |
| 23 | New quote for a motor, a trailer or parts on their own | **done** | No shelf refuses (`log.txt` "parts refusal on shelf: 0"). The motor, the trailer and the part each start their own quote (`s09`–`s15`). |
| 24 | the printed quote "PERFECT w a cover page … boats photo … full spec … add/remove sections" | **partly** | The full spec prints. "Choose what prints" sets the sections. The Stacer's cover is its photograph. The two Highfields are not: <br>• The Sport 560 prints its render. <br>• The Patrol 600 prints Highfield's logo with no boat (D1). <br>A price page with little on it leaves a 52–74mm hole above Acceptance (D2). |
| 25 | "if i take a screenshot, does it look PERFECT" | **partly** | 1 major and 17 minor gaps remain, listed in section 3. |
| 26 | "responsiveness on every single size" | **done** | No horizontal overflow in any frame, and no text clipped or under 11px (`log*.txt`: 0 H-OVERFLOW, 0 CUT, 0 TINY). |

---

## 2. Frames: PERFECT or NOT, and why

The columns are 390 (390x844), 844 (844x390), 834 (834x1112), 1280 (1280x800), 1440 (1440x900) and 1920 (1920x1080).

### page

| Frame | 390 | 844 | 834 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|
| Build top, Patrol 600 (`p01-top`) | PERFECT | PERFECT | PERFECT: the total is flush at the foot | PERFECT | NOT, minor (P12): "LENGTH OVERALL" wraps to 2 lines in the 4-up plate | PERFECT |
| Build top, Sport 560 specced (`h03-specced-top`) | PERFECT | PERFECT | PERFECT | NOT, minor (P9, P12): the photograph shrinks to 520x212 under a 266-tall total; 3 of the 4 plate labels wrap | NOT, minor (P12) | PERFECT |
| Hull and coded colours (`p02-hull`) | PERFECT | PERFECT | NOT, minor (P13): the 11th measure, "4.51 m to 6.0 m Boat registration", stands alone in a 5-wide row | PERFECT | PERFECT | PERFECT |
| Change model dialog (`p03-b-dialog`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| After a change (`p03-d-changed`) | NOT, minor (P5) | NOT, minor (P5) | NOT, minor (P5) | NOT, minor (P5) | NOT, minor (P5): the Patrol 460's stage is the Dark Grey/Grey/Dark Grey render on a Light Grey/White/Dark Grey quote | NOT, minor (P5) |
| Stage gallery (`h05-a-gallery`) | PERFECT: the count is on one line, 158x20 | NOT, minor (P8): "Cover 1 of 2 · / Sport 560" wraps over 2 lines (154x39) | PERFECT | PERFECT | PERFECT | PERFECT |
| Chapters, window by window (`h06/p05/t03/m04-walk-*`) | PERFECT | PERFECT | PERFECT | PERFECT | NOT, minor (P3'): `h06-walk-06` shows the total's "View final package" and the door's in one window | PERFECT |
| For the workshop (`h06w-workshop`) | PERFECT: "Mount with 6Y5 2 Gauges" | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Show all sheet (`p06-showall`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Customer dialog (`h07-customer`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Preparing moment (`h08-b-preparing`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Package, first fold (`h08/p09-d-package`) | NOT, minor (P11) | NOT, minor (P11) | NOT, minor (P11) | NOT, minor (P11) | NOT, minor (P11): the cover shows the render or the logo, and nothing beside it says why | NOT, minor (P11) |
| Package scrolled, and Back to editing (`h08-e/f`) | PERFECT (4,498→4,498) | PERFECT | PERFECT (3,009→3,009) | PERFECT | PERFECT | PERFECT |
| Motor alone, top (`m01-top`) | NOT, minor (P10): "L4 / 1832cc" | NOT, minor (P10) | NOT, minor (P10): "Remote mech", "Power Trim & Tilt" | NOT, minor (P10) | NOT, minor (P10) | NOT, minor (P10) |
| Part alone, top (`s15-part-build`) | PERFECT | NOT, minor (P14): "Garmin GA38 GPS/Glonass Antenna" wraps over 3 lines in a 160px masthead cell, and the bar cuts the picture's foot | PERFECT | PERFECT: one "View final package", at 1001,722 | PERFECT (1145,719) | PERFECT: the stage is 976x396 and the picture is whole |
| Stacer top and Dealer fit (`t01-top`, `t03-walk-*`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT: the head reads "… and 2 others / 4 more offered" and the parts are said once | PERFECT |
| Keyboard reach (`k02-focus`) | PERFECT: Change model at Tab 6, with a ring on every stop | NOT, minor (P15): "See the boat's 2 pictures larger" and "The boat's 2 pictures, larger" are two stops for one act | NOT, minor (P15): same | PERFECT (Tab 7) | PERFECT | PERFECT |

### paper

| Frame | Verdict |
|---|---|
| PDF, Highfield Sport 560 fully specced, 3 sheets | **NOT, major (D1):** the cover is the top-down render on a pale panel (`pdf-highfield-sp560-p1.png`). Sheets 2 and 3 are PERFECT. Sheet 3 sets the render beside Your price, with GST at 10%, and has no hole. |
| PDF, Highfield Patrol 600 hull only, 3 sheets | **NOT, major (D1):** the cover is Highfield's logo on a pale panel, with no boat (`pdf-highfield-pa600-p1.png`). **NOT, minor (D2):** <br>• Sheet 2 is the Specifications alone, over 55% white. <br>• Sheet 3 is "Total, including GST $30,190" in the right column over an empty left column, then about 280px (74mm) of white, then Acceptance (`pdf-highfield-pa600-p3.png`). |
| PDF, Stacer 499 with three parts, 3 sheets | The cover is PERFECT: the photograph is off three edges. Sheet 2 is PERFECT, with the parts' pictures. **NOT, minor (D2):** sheet 3 now carries the photograph beside the price, but about 200px (53mm) of white still stands between the price and Acceptance (`pdf-stacer-499-p3.png`). |
| PDF, Yamaha F115LB alone, 2 sheets | The cover is PERFECT: the studio picture, "Pictured: two outboards…" and 8 facts. **NOT, minor (D2):** on sheet 2 about 195px (52mm) of white stands between the motor's picture and Acceptance (`pdf-motor-f115-p2.png`). |
| Document, draft: the cover ask (`y01`, `y02`) | PERFECT at all six sizes. "THE COVER" says why in one sentence, and "Add a photograph for the cover" opens the boat's pictures with Add pictures. At 844x390 the dialog scrolls within the 358px window. |
| Document desk note (staff only) | NOT, minor (D4): the workshop line still prints the file's shorthand, "Mount w 6Y5 2 Gauges, 5m Harness", where the build now says "Mount with". |
| Every sheet | NOT, minor (D3): no Northside address, phone, email or ABN is set on Settings. The panel says so and links to Open Settings. |

### start

| Frame | 390 | 844 | 834 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|
| New quote (`s05-new`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| A boat chosen (`s08`) | NOT, minor (P12): "Inside length" wraps over 2 lines beside two one-line labels | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| A motor chosen (`s10`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Parts shelf (`s12`) | PERFECT: no refusal | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| A part chosen (`s14`) | PERFECT (×1.19) | NOT, minor (S2): ×1.60 | NOT, minor (S2): ×1.28 | NOT, minor (S2): ×1.39 | NOT, minor (S2): ×1.54 | NOT, minor (S2): the 300px GA38 is drawn at ×1.95, and its letters are soft (`zoom-1920-s14.png`) |
| Quotes with one quote (`h10-quotes`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Home at rest (`h11-home`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Home entering (`home-*-early`) | PERFECT (6/6 at 541ms pressed) | – | – | – | PERFECT (16/16 at 532ms pressed; 1,269ms on a full load) | PERFECT (16/16 at 1,360ms on a full load) |

### shell

| Frame | 390 | 844 | 834 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|
| Pill width and order | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Bars over a scrolled build (`k01-bars-over`) | PERFECT: an 8px gap on the room's ground | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| The kit's toast over a lightbox (`g05-motor-added`) | – | – | – | – | NOT, minor (H1): the toast "Your picture is on the Yamaha F90XB now · Undo" (x ≈1,073–1,383, y ≈820–868) laps about 50px over the lightbox's lower-right corner (panel right edge ≈1,123, foot ≈876) | – |

---

## 3. The gaps, grouped

### page

- **P3', minor, 1440.** On the specced Sport 560, `1440x900-h06-walk-06.png` shows the total's "View final package" and the door's in one window. That is one act offered twice.
  - The probe found the fade working: scrolled to the end, `data-door` was true and the opacity 0 at 1280, 1440 and 1920, on a fresh quote and after a motor (`log4.txt`). The other 11 desk walk-ends were right too.
  - So the fade can miss in a state the probe did not reach. The IntersectionObserver in `Configurator.tsx` (around line 888) watches the `.cfg-door` node it found when it mounted. Its dependencies are only `[oneColumn, railDrawn]`, so a door that re-renders as a new node is no longer watched. This is my reading of the code, not proven.
- **P5, minor, every size: the owner's call.** The stage says nothing about what the picture shows that the quote does not. The Patrol 460's render is Dark Grey/Grey/Dark Grey on a Light Grey/White/Dark Grey quote. The Sport 560's photograph shows a Mercury 115 on an F90XB quote. Both are said only inside the gallery (`1440x900-p03-d-changed.png`, `1440x900-h05-a-gallery.png`).
- **P8, minor, 844x390.** The gallery count still wraps, as "Cover 1 of 2 · / Sport 560" (154x39, 2 lines; `844x390-h05-a-gallery.png`). It is closed at 390, where it is 158x20 on one line.
- **P9, minor, 1280.** On a specced quote the total's key wraps to four rows, so the total grows to 266px tall and the photograph drops from 520x261 to 520x212 (`log.txt` [h03] at 1280, `1280x800-h06-walk-07.png`). The owner asked for a bigger photograph.
- **P10, minor, every size.** A motor's measures on the build use the file's shorthand: "L4 / 1832cc", "Remote mech" and "Power Trim & Tilt". The printed quote spells out the same facts as "In-line 4, 1,832 cc", "Mechanical remote" and "Power" (`834x1112-m01-top.png`, `390x844-m01-top.png` against `pdf-highfield-sp560-p2.png`).
- **P11, minor, every size.** The final package shows the Highfield's cover as the render or as the logo. Nothing beside it says why, and it does not offer the act that changes it. The sentence and "Add a photograph for the cover" live only on the document page (`1440x900-p09-d-package.png`, `1440x900-y01-cover-ask.png`).
- **P12, minor, 1280, 1440 and the 390 picker.** Plate labels wrap where their neighbours do not:
  - "LENGTH OVERALL" at 1440.
  - "LENGTH OVERALL", "TUBE DIAMETER" and "INSIDE LENGTH" at 1280.
  - "Inside length" in the 390 picker.
  - "HULL WEIGHT (DRY)" on the Stacer.

  The plate stays square, but the type is uneven.
- **P13, minor, 834.** In the hull's Specification plate, the 11th measure ("4.51 m to 6.0 m Boat registration") stands alone in a 5-wide row (`834x1112-k01-bars-over.png`).
- **P14, minor, 844x390.** With a part alone, the masthead's title "Garmin GA38 GPS/Glonass Antenna" wraps over 3 lines in a 160px cell, though the bar has room. The floating total also cuts the foot of the part's picture on arrival (`844x390-s15-part-build.png`).
- **P15, minor, 844x390 and 834.** The keyboard meets two stops for one act, "See the boat's 2 pictures larger" and then "The boat's 2 pictures, larger" (96x72), before Trade (`log3.txt` [keys]).

### paper

- **D1, major.** The two Highfields still print no photograph of the boat on the cover.
  - **What prints:** the fully specced Sport 560 prints its top-down render, and the Patrol 600 prints Highfield's logo (`pdf-highfield-sp560-p1.png`, `pdf-highfield-pa600-p1.png`).
  - **Why, and it is honest:** nobody has checked that the maker's on-water photograph shows the model.
  - **What is new:** a draft's document now says this under "THE COVER" and offers "Add a photograph for the cover", which takes Northside's own photograph and makes it the cover (`y01`/`y02` at all six sizes).
  - **What is still missing:** no in-app act lets a person confirm the maker's photograph. The owner's "using boats photo" therefore needs Northside to add its own photograph for each Highfield it quotes.
  - **What he will see:** until then, the fully specced Highfield he asked to see has a render on its cover. The Stacer is the only boat walked whose PDF has a photograph cover (`pdf-stacer-499-p1.png`).
- **D2, minor.** Round 2 asked for something beside the price, and the price now carries the cover's picture. But on a last sheet that holds only Your price and Acceptance, a band of white still stands between them:
  - about 200px (53mm) on the Stacer
  - about 195px (52mm) on the F115LB
  - about 280px (74mm) on the Patrol 600, whose left column is also empty because its cover has no photograph

  The Patrol 600 hull-only quote spends 3 sheets where its content would fit on 2. The Sport 560's sheet 3 has no such hole.
- **D3, minor.** No Northside address, phone, email or ABN is set on Settings, so none prints. This closes when they are set on Settings, not by a fix in the build.
- **D4, minor (staff only).** The document's desk note still reads "Mount w 6Y5 2 Gauges, 5m Harness", where the build now spells it out.

### start

- **S2, minor, five sizes.** The picker's chosen-part card enlarges the GA38's 300x300 file: ×1.60 at 844, ×1.28 at 834, ×1.39 at 1280, ×1.54 at 1440 and ×1.95 at 1920. At 1920 the letters are soft (`zoom-1920-s14.png`). At 390 the scale is ×1.19.
- **Not walked this round:** Quotes holding a boat, a motor and a part at once. Each walk runs in its own context.

### shell

- **H1, minor, 1440. Not closed.** The kit's toast still laps about 50px over the open lightbox's lower-right corner (`1440x900-g05-motor-added.png`). The probe's toast selector found nothing (`toast -1..0`), so this verdict comes from the frame alone.

---

## Closed since round 2 (checked by eye and measure)

- **P1 is closed.** At 390 the total stands 8px above the tab bar (782 against 790), with the room's ground in the gap (`390x844-k01-bars-over.png`).
- **P2 is closed.** At 834 the total is flush with the window's foot (1,056–1,112), with no sliver under it (`834x1112-p01-top.png`).
- **P3 is closed for a part alone.** It shows one "View final package" at every desk size. One frame of a specced boat missed the fade (P3' above).
- **P4 is closed.** The part-alone stage at 1920 is 976x396 with the picture whole (`1920x1080-s15-part-build.png`).
- **P6 is closed.** The Dealer fit head no longer leaves a separator at a line end, and the parts are said once.
- **P7 is closed** on the build. The desk note still has the shorthand (D4).
- **P8 is closed at 390.** It is still open at 844x390.
- **S1 is closed.** A full load of Home at 1920 paints 16 of 16 pictures by 1,360ms.

## Checks that found nothing wrong

- Nothing found fakes a figure or puts cost on a customer surface. The cover ask refuses in a sentence, with its reason.
- Reduced motion holds: every animation measured 0.01ms.
- No frame has horizontal overflow, clipped text or text under 11px.
- Back to editing restores the exact scroll on all 18 package walks.

## Probe results ignored as false positives

- ENLARGED on the 1920 stage (`-1280.webp` reported at 921x614). The `naturalWidth` of an image chosen from a `srcset` is density-corrected. A fresh decode gives 1280x854 drawn at ×0.76.
- Home's 640px card pictures, for the same reason.
- At 834, OVERLAP between a colour card and the total's "View final package". The card is scrolled under the floating total, which is opaque.
