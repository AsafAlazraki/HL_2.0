# The printed quote's cover: three directions (2026-11-02)

**The ask.** The owner, 2026-10-31: "the quote pdf is BORING … pdf quote needs to be insane with cover page", and the printed quote "PERFECT w a cover page … using boats photo and full spec of the quote and the boat". The critic of that round (`docs/directions/paper-quote/critique.md`, gap 2) called today's cover "a letterhead with a framed picture": the picture was 414 of 1,123 px, 37% of the page. The cover built since then draws it at most 131 mm (495 px) tall, inside the margins.

**What was drawn.** Three A4 covers as static HTML at 794 × 1123 (210 × 297 mm), each on the two quotes given on 31 October 2026, using the figures their PDFs printed (`docs/directions/paper-quote/paper-highfield-given.pdf`, `paper-stacer-given.pdf`):

- **The Highfield Sport 560.** Hypalon · White / White / White/Blue, with the Yamaha F90XB, the REDCO trailer and 2 x MFM50 batteries. Total $73,992. Drawn on the maker's photograph, 2,560 × 1,708.
- **The Stacer 499 Sea Ranger SDF (Centre Console).** With three dealer-fit items. Total $30,243. Drawn on the row's own photograph, 1,100 × 733 from a 3,000 px source.

R. Kelleher is the name the walks type (`e2e/mint.ts`). The customer's name and the total sit where quote-spec §3.5 keeps them: who it is for on the left and the total on the right, in the summary at the foot. Nothing is built; `src/` is untouched.

| file | what |
|---|---|
| `index.html` | the three side by side, for the owner to pick by eye |
| `a-the-boat-is-the-page.html`, `b-the-configuration-book.html`, `c-northsides-water.html` | each board: both sheets at 1:1 on the paper view's floor, its reflow below 826 px, and its notes |
| `the-1024-photograph.html` | each direction's rule drawn on the Stacer 529's 1,024 × 676 photograph |
| `tokens.css`, `board.css` | the app's tokens copied byte for byte, the proposals marked; the board's floor |
| `png/` | each cover at 794 × 1123, 1:1 (`a-sp560.png` … `c-stacer.png`), and the three 1,024 studies |
| `print/` | each board printed to an A4 PDF (print media, margin 0) and read back through PDF.js, one PNG a sheet |
| `shots/` | every board and the canvas at 390 × 844, 844 × 390, 834 × 1112, 1280 × 800, 1440 × 900 and 1920 × 1080, plus each cover reflowed at 390 (`*-390.png`) |

## A · The boat is the page (recommended)

**Only A** makes the photograph the page. It runs off the top and both sides, at the tallest size that keeps the whole boat and never draws a held pixel wider than a CSS pixel. The water under the boat melts into the night's ink (`--color-cover-night`). The name stands under the boat's lowest point, never on the hull. The facts, who it is for and the total stand on the dark. No paper shows.

| picture | box on the sheet | share of the page | held px per CSS px | prints at |
|---|---|---|---|---|
| SP560, 2,560 × 1,708 | 794 × 760 | 68% | 2.25 | 216 dpi |
| Stacer 499, 1,100 × 733 | 794 × 597 | 53% | 1.23 | 118 dpi |
| Stacer 529, 1,024 × 676 | 794 × 676 | 60% | 1.00 | 96 dpi |

- **A 1,024 px photograph.** The bleed stops where the pixels stop: drawn at one to one, cut 230 px across, and the night takes the rest. It prints at 96 dpi, the softest of the three. A full-page bleed would need it 1,701 px wide, so it is refused.
- **Costs.**
  - A needs a scene. A studio render or a motor on white has nothing to melt into the night, so that cover stays the plate printed today.
  - The ground takes toner.
  - An office printer frames the three bled edges in white. Every word is 18 mm inside.
  - The crop and the boat's lowest point are two values a person sets once, looking, when the picture is made the cover in the gallery (2026-11-02).
  - A bleed reverses the ruling in `src/screens/document/art.ts` ("a band and never a bleed", argued at 300 dpi). By the spec's own rule 6 (CSS px), nothing here is enlarged, and the SP560 prints at 216 dpi against the 149 dpi the band already accepts. Picking A needs a dated decision naming what lost.
- **References no earlier board used.** `docs/research/refs/document/live/club-marine-cover.png` sets the headline on the boat's own water. `live/rmsothebys-auctions.png` puts one object on black, with the words on the dark.

## B · The configuration book

**Only B** names everything on the quote on its cover: the motor, the trailer and each dealer-fit item, by kind, under the boat. It is also the only one that keeps the band ruling: nothing bleeds and every word is on white. Above the photograph it ghosts the model's own digits (560, 499), heavy, at the accent's 13%. The device is from Porsche's "911" (`hl-refs/ref/porsche-pdf-1.png`). The photograph is a square-edged print at the full measure, cut 16 : 9 from its top and foot only.

| picture | box | share | held px per CSS px | prints at |
|---|---|---|---|---|
| SP560 | 658 × 370 | 27% | 3.89 | 374 dpi |
| Stacer 499 | 658 × 370 | 27% | 1.67 | 161 dpi |
| Stacer 529 | 658 × 370 | 27% | 1.56 | 149 dpi |

- **A 1,024 px photograph** is exactly the spec's band, at 149 dpi. Nothing in B changes with the picture's size.
- **Costs.** The picture is the smallest of the three, smaller than today's. The dealer-fit names print as page 2 prints them ("w", "· 2mtr", critique minor 20). The digits are drawn as type, so the PDF's text layer reads "560" before the name.
- **Works with** a studio render, multiplied into the white as today's plate does, and with no picture at all: the digits and the name alone.
- **References.** `docs/research/refs/document/live/saxdor-specs-crop.png` sets facts as label over value, in wide air. The Porsche frame is the genre: the document screen's own row already names Porsche's PDF, so B takes one device from it and counts it as no new reference.

## C · Northside's water

**Only C** makes the dealership the showpiece. The app's own band (`--band`, `--grain`) runs across the top 38% of the page, with its water. That is the fragment shader of `src/ui/water.ts`, character for character, stopped on its first frame and drawn at 2 px a CSS px. Northside's white mark spans 420 px (`marks-ledger.json`, 1,798 × 448, 411 dpi). The boat is handed over the band's foot on the kit's plate. Who it is for and the total sit on a card of the app's ground, with the total in the file's blue.

- **The plate** holds the photograph like B's print: 658 × 370, so a 1,024 px picture prints at 149 dpi.
- **The band** is drawn, not held, so it never runs out of pixels and follows Northside's accent. It works with any picture, and with none.
- **Costs.** The boat comes second. The band bleeds three edges, so an office printer frames it in white.
- **References.** `docs/research/refs/proposal/market/pandadoc-sales-quote-template.png` is the market's most-used quote: it opens on the sender's dark band with the mark in it. `docs/research/refs/document/live/highfield-sp560-model.png` sets the maker's white mark on its own water.

## Recommended: A

The owner asked for "insane" and for the boat's photograph. The critic measured a picture that was 37% of the page. A answers both with the picture itself (68% on the SP560), and its type stays on the spec's places.

If one composition must serve every quote unchanged, including a motor or a trailer quoted on its own on a studio picture, C is the one that holds.

## Measured

- **Contrast:** the 5th-percentile ratio of each line of text against the pixels behind it, read off the rendered sheet with the text hidden.
  - Desk: A 6.11 : 1 (SP560) and 5.28 : 1 (Stacer), the lowest on "YOUR BOAT" over the water. B 7.47 : 1. C 5.14 : 1.
  - At 390: A 7.18 and 6.89, B 7.47, C 5.12.
  - No line is under AA on any cover. The first pass caught A's reference on the SP560's pale sky at 2.48 : 1. The veil now holds 80% of the night's ink to the foot of the reference.
- **Every size:** no horizontal scroll at any of the six. At 844 px and up the sheet is A4 at 1:1, as the paper view draws it from 826 px. At 390 each cover reflows as a page as tall as what it holds (`shots/*-390.png`).
- **Pictures:** none is drawn past its held pixels on any sheet (`scale ≤ 1`, measured on every `img`).
- **Print:** each board prints to two A4 pages, one sheet each, with the bleeds, the dissolve and the still water intact (`print/`). Each two-page PDF is 9.8 to 10.1 MB, almost all of it the SP560's 2,560 px photograph. A build would embed the 1,280 px copy wherever it still clears the drawn width. The PDFs are not kept here, for their weight; printing any board under print media regenerates them.

## Honest constraints, all three

- **The SP560 photograph is the machine's choice** (`person: false` in `data/northside/pictures.json`). The paper's reader (`forCover` in `src/domain/model/pictures.ts`) refuses it today, so the given quote printed the row's studio render. A person marks it once on the contact sheet and it prints. It carries a Mercury 115, so each cover captions it as the ledger's own `differs` says: "your boat's finish and motor are as quoted".
- **No validity date and no address print.** Settings holds no number of days and no address, phone or ABN. The spec draws neither until they are typed, and the note beside the paper says so.
- **Proposed tokens, not in the app:** `--text-cover` (64), `--text-cover-long` (48), `--text-cover-figure` (48), `--text-numeral`, `--color-numeral`, `--color-cover-night` and its veil and rule (`tokens.css`).
