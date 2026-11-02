# The printed quote's cover: the pick (2026-11-02)

**Picked: A, "The boat is the page".** Built as the printed quote's cover in `src/screens/document/`.

## Judged three ways, on the six PNGs in `cover-boards/png/`

**As the owner.** He rejects anything boring on sight. His words were "the quote pdf is BORING … pdf quote needs to be insane with cover page", and he asked for "using boats photo". B is today's cover done better: a white page, a framed print and a list. He would call it tidy, and he has already turned tidy down. C is the dealership's water and mark, a strong page, but the boat comes second on it and he asked for the boat. A is the only cover where the photograph is the page. It runs off three edges and the water melts into a night ground, with the name in large white type under the hull. It is the one he would show someone.

**As the customer.** A customer holds this paper. They look for their boat, its name, who it is for and what it costs. On A all four are where the spec keeps them: the boat first, then the name, the facts, and then who it is for beside the total at the foot. Nothing on A is decoration standing between the customer and the figure. On B the photograph is the smallest of the three (27% of the sheet). On C the photograph sits under the dealership's band.

**As a designer.** A is one idea, carried all the way through. Every word stands on one dark ground. There is no frame, no plate and no second treatment, and the picture's own water does the transition. Its costs are real, and each is answered in the build:

| cost, as `covers.md` named it | what the build does |
|---|---|
| A needs a scene; a studio shot has nothing to melt | Every cover is the night page. A scene photograph bleeds the top and both sides. A studio picture, a maker's mark or the name in type stands on a pale studio panel that bleeds the same three edges, so a motor or trailer quoted on its own gets the same cover, not a fallback. |
| the crop and the boat's lowest point are two values a person sets | None is held, so the build crops nothing. The photograph is drawn whole, at the sheet's full width where its pixels allow, and the name starts under the photograph's foot. It never stands on the water. The cost: a 3 : 2 photograph is 47% of the sheet, not the board's hand-cropped 68%. |
| the ground takes toner, and an office printer frames a bleed in white | Kept. Every word sits at least 18 mm inside the sheet's edge. |
| it reverses "a band and never a bleed" (`art.ts`) | Reversed by a dated decision in `docs/DECISIONS.md`. Nothing is enlarged: a picture is never drawn wider in CSS px than the pixels held, the same rule the band kept. |

**B's one lesson is kept on paper, not on the cover.** Naming everything on the quote is page 2's job ("Your quote"). The cover keeps the four places the spec gives it.

## Measured on the built cover (2026-11-02)

Three quotes were made through the app's front door on a fresh build. Each was given and printed to A4 under print media, and every page was read back through PDF.js (`paper/paper-*-p*.png`, text in `paper/paper-*.txt`). GST was set to 10 on Settings first. Nothing else was set there. The customer is R. Kelleher, the name the e2e walks type.

| quote | cover picture | top of the page | drawn | sheets | total |
|---|---|---|---|---|---|
| A · Highfield Sport 560, Hypalon · White / White / White/Blue, Yamaha F90XB, REDCO trailer, 2 x MFM50 Batteries | the row's own render, 1,100 × 619 | studio panel | 658 × 370 (161 dpi) | 3 | $73,992 |
| B · Stacer 499 Sea Ranger SDF (Centre Console), three dealer-fit items | the row's own photograph, 1,100 × 733 | photograph, off three edges | 794 × 529, 47% of the sheet (133 dpi) | 3 | $30,243 |
| C · Yamaha F115LB on its own | Yamaha's studio picture, 800 × 600 | studio panel | 494 × 370 (155 dpi) | 2 | $16,667 |

- **Short quotes.** C prints two sheets: the cover, then "Your price" (naming "Yamaha F115LB, for R. Kelleher") and Acceptance. After the cover, $16,667 prints once, as the total. A hull-only Stacer 499 (D, printed to prove where the details go) is also two sheets.
- **Fill.** A's sheets 2 and 3 end at 925 and 997 of the 1,020 px foot. B's end at 897 and 641; B's last sheet is the price and the signatures.
- **Every size.** No horizontal scroll at 390 × 844, 844 × 390, 834 × 1112, 1280 × 800, 1440 × 900 or 1920 × 1080 on any of the three (`paper/<A|B|C>-<size>-1..3.png`). The contrast and overlap rulers report nothing on the printed quote or the final package at all six sizes.
- **Northside's details.** None is set on Settings, so none prints. The note beside the paper says which (address, phone, email and ABN), and the salesperson's title, phone and email. D was printed with the test values `document.spec.ts` types, to show where the details go: the letterhead line under the mark on the photograph, and the contact panel on the last page (`paper/paper-D-p*.png`, `paper/D-details-*.png`).
- **Why the Highfield is on the panel.** The SP560's on-water photograph (2,560 × 1,708) is still the machine's choice (`person: false` in `data/northside/pictures.json`), so the paper's reader refuses it, and the cover prints the exact finish's render. Once a person marks that photograph, or Northside makes its own photograph the row's cover in the gallery, the Highfield's cover is the photograph off three edges, as B's is.
