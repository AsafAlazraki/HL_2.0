# The paper, handed to Milestone 5 (2026-10-30)

Each of the walk's three quotes was given and opened as the document, then printed to A4 by Chromium with print media (`walk/q1-stacer-paper.pdf`, `walk/q2-highfield-paper.pdf`, `walk/q3-skimma-paper.pdf`, plus `walk/q6-grt455-paper.pdf` for the tax check). Each paper is two pages: page 1 has the letterhead, one picture, the boat's facts and a summary. Page 2 has the lines by chapter and "Your price". Here is what Milestone 5 must still make perfect, in the owner's words: "PERFECT w a cover page and things using boats photo and full spec of the quote and the boat … and ability to add/remove sections".

## What the papers show today

| | Stacer 481 SeaMaster | Highfield Sport 560 | Stacer 309 Skimma |
|---|---|---|---|
| Picture on page 1 | A studio cut-out on a trailer (not the build's water photograph) | A top-down render in the chosen Black/White/Carbon, a picture of the colourway itself | A second water photograph of the model |
| Boat facts | 5 (Power, Hull Length, Beam, Hull Weight (Dry), BMT Weight (Dry)) | 5, in file abbreviations: "OA Length", "Tube Dia", "Int Length", "Int Width" | 5, including "Bottomsides 1.2 mm" |
| Motor | Name, "Includes pre-delivery", price. No picture, horsepower, weight or shaft | Same | Same |
| Trailer | Name with file code words ("T Alloy 1100 ATM S 13" Skid Braked · 4.5 - 4.9 m") | Name only | None. **The chapters number 01, 02, 04** |
| Parts | Name and price under "PARTS & ACCESSORIES" / "RIGGING KITS" headings | Name and price | Name and price, including an unasked "D Shackle · 10 mm Galv $3" |
| Tax | "Total, tax included". The not-printed rail says "No rate is set on this quote" | Same | Same |
| Page 2 | About 40% empty | About 40% empty | About 60% empty |

## What Milestone 5 must make perfect

1. **A real cover.** Page 1 is a letterhead with a framed picture, not a cover. It needs the boat's own photograph full-bleed: the exact model, in the chosen colourway where the ledger holds one. It needs the customer's name, the boat's name and the date, and nothing else. The photograph the customer saw in the build (the water photo) and the one on the paper are different pictures of the same model today. Choose one on purpose, and say so on the paper's own record.
2. **The full specification of the boat**, in the dealer's words. Every fact the price list carries for the model, grouped (dimensions, weights, power range, capacity, material, colourway with its swatches), never "OA Length", "Tube Dia", "Int Length" or "Bottomsides" as the file spells them. Units should be consistent (5.66 m beside 382 cm today).
3. **The full specification of the quote.** Each line has its picture where the ledger holds one: the motor (horsepower, weight, shaft, the colour), the trailer (what boat lengths it carries and its rated weight, in words, not "ATM S 13"") and each part with a sentence of what it is. Pre-delivery and registration stay said beside the price.
4. **Sections the salesperson adds or removes** before giving: cover, boat specification, the motor's specification, the trailer, the dealer fit, the price summary, deposit and terms, and the dealership's details. The choice is kept on the quote and frozen with it when given. This is the section picker, P0.
5. **Tax said properly.** GST as an amount and a rate once Northside has set one, and the quote must take Northside's rate. Today a rate set on Settings is "copied onto each quote when it is started", so a draft already open is given with "No rate is set on this quote" (measured on the GRT 455: set 10%, then given, the paper still says no rate). `setTaxRate` exists in `src/domain/quote/commands.ts` and nothing calls it.
6. **Northside's details on the paper.** On a cold desk the legal name, ABN, street address, phone, email and website are all "none given, so none prints". A quote that goes to a customer needs them. The paper should say what is missing where it would print, and Settings should ask for them before the first give.
7. **The person who prepared it**: name, title and phone. Today it reads "PREPARED BY Asaf".
8. **No empty half pages.** Page 2 is 40–60% blank on all three. A short quote should be one designed page plus the cover, and a long one should flow without orphaned headings.
9. **Chapter numbers that follow what is sold.** Number only the chapters present (01, 02, 03), or drop the numbers on paper. "04 Dealer fit" after "02 Motor" reads as a missing page.
10. **What is not the customer's business stays off.** It already does (the "Not printed" rail holds the codes, the workshop notes and "also offered, not taken"). Keep it so as the sections become choosable.
11. **Lines the customer did not ask for.** The Skimma's D Shackle and the SeaMaster's $2,000 rigging kit went on by themselves at Start and printed as if chosen. Paper must only print what was chosen. That is the build's fix, but the paper is where the customer reads it.
12. **A tow catch is not a trailer.** The GRT 455's "Formosa GRT Tow Catch · Gal Steel, Single Axle" ($166) prints under "03 Trailer".
13. **Figures in one face.** Page 2 sets line prices in a monospace face and the total in the text face. Pick one figure style for money.
14. **The contact line at 390** (Milestone 4's stray " ·" at line ends) was not re-measured on this walk. Carry it to the paper rulers.
