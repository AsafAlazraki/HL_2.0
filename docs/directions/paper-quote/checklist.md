# The printed quote, checked (2026-10-31)

Three quotes were minted on the real price file with the app's own commands (`startQuote`, `addLine`, `setCustomer`, `issue` with `issueStampNow`) in a dev build on port 5811. Northside's GST was set to 10% on Settings **after** the three drafts were started. Each quote was then given. Each was printed with Chromium (`page.pdf`, A4, print media) and read page by page with `pdftotext -layout`.

| quote | what is on it | total | pages |
|---|---|---|---|
| A | Highfield Sport 560 (SP560, Hypalon, White / White / White/Blue) with a Yamaha F90XB, a REDCO Custom trailer and 2 × MFM50 batteries, for R. Kelleher | $73,992 | 3 |
| B | Stacer 499 Sea Ranger SDF (Centre Console) with three parts: Striker Vivid 4cv with GT20-TM transducer, Garmin GA38 antenna, Garmin NMEA cable 2 m | $30,243 | 3 |
| C | A Yamaha F115LB on its own (a repower) | $16,667 | 3 |

The evidence is in this folder:

- `paper-{highfield,stacer,motor}-given.pdf` are the PDFs.
- `…-given-print-p{1,2,3}.png` are each sheet under print media.
- `…-draft-1440.png` and `…-given-1440.png` are the screen at 1440 × 900, with the section picker.
- `…-draft-390-s1/s2.png`, `paper-highfield-given-390-s5.png` and `paper-stacer-given-390-s4.png` are the screen at 390 × 844.

## The checklist of quote-spec §13

| # | item | A | B | C | how it was read |
|---|---|---|---|---|---|
| 1 | Dealership's mark or name first on page 1; "not been named" nowhere | pass | pass | pass | p1 png; text search found no "not been named" |
| 2 | No navigation, control or finder text | pass | pass | pass | PDF text; e2e "prints the sheets and nothing of the app around them" |
| 3 | No app vocabulary (price file, level, register, rows, offered, frozen, reimport, slot, engine hole, prop part, source) | pass | pass | pass | case-insensitive search of each PDF's text: 0 hits |
| 4 | No product codes except inside a public name | pass | pass | pass | "Yamaha F90XB", "Yamaha F115LB" and "GT20-TM" are the products' names; HBS114 and TA600-MOB (SP560) are only on the note beside the sheet |
| 5 | No cost, margin or cost-derived level, on the paper or the note | pass | pass | pass | text search (cost, margin, landed, nett: 0); `tools/check.ts` no-cost-column; e2e "no cost column reaches this screen" |
| 6 | Cover picture is the exact model; caption says what differs; no logo stands in | pass | pass | **fail** | A: the row's own render of the exact finish. B: the row's own photograph on the water. C: Yamaha's studio shot shows two F115s, one white and one grey. The quote is the grey F115LB, and the image ledger records no difference for this picture, so no caption can say it. The fix is the ledger's `differs`, not the paper. |
| 7 | Name as a buyer says it, exact model kept | pass | pass | pass | "Highfield Sport 560" with "Hypalon · White / White / White/Blue"; "(Centre Console)" kept |
| 8 | Total says it includes GST, beside the customer's name, most prominent price | pass | pass | pass | "TOTAL, INCLUDING GST" at 40 px beside "Prepared for R. Kelleher" |
| 9 | One sentence of what the total includes **and does not** | **fail** | **fail** | **fail** | What it includes is said where the lines say it: A "Includes the motor's pre-delivery and the trailer's registration.", C "Includes the motor's pre-delivery." B has none to say. What it does not include (boat registration) is not said, because no frozen flag on the file says the hull excludes it, and the paper does not guess. |
| 10 | Lines sum to bands, bands sum to the total | pass | pass | pass | A: 48,350 + 14,531 + 10,713 + 398 = 73,992. B: 345 + 199 + 59 = 603, and 29,640 + 603 = 30,243. C: 16,667. Read off the PDF text. |
| 11 | Every adjustment its own row with its reason | n/a | n/a | n/a | none on these quotes |
| 12 | No $0; "Included" only for a line at no charge | pass | pass | pass | no $0 and no "Included" in the text |
| 13 | Fit-up and rigging as one line | n/a | n/a | n/a | no rigging kit on these quotes (OWNER 17) |
| 14 | Issue date present; valid-until only once validity is typed | pass | pass | pass | "Issued 31 October 2026"; no validity set, so none printed |
| 15 | Dealership phone, address, email; salesperson's details | n/a (M4) | n/a | n/a | none is set on Settings in this browser. The note beside the sheet says "No address, phone, email or ABN is set on Settings, so the printed quote carries none." The salesperson's name prints; no title or phone is set. |
| 16 | ABN present | n/a (M4) | n/a | n/a | not set |
| 17 | Terms only where Northside wrote them; no sentence about missing terms | pass | pass | pass | none set, so none printed; the note says "None set yet." |
| 18 | Both signature blocks, together on one page | pass | pass | pass | page 3 of each; one atom (`accept`), unit test "prints the acceptance with both signature blocks" |
| 19 | Reference and "Page n of m" on every page | pass | pass | pass | 3 of 3 pages each |
| 20 | Nothing cut, overlapping or split mid-row | pass | pass | pass | rulers (contrast, cut, overlap, focus, ramp) on the document at six sizes: 21 passed, 9 skipped. Measured atom heights fit the 934 px room (A p2 873, p3 909; B p2 864, p3 667; C p2 551, p3 542). |
| 21 | Text layer has "Quotation", the business name and the reference as whole words | pass | pass | pass | "QUOTATION", "NORTHSIDE MARINE" (running head) and the reference whole. "CAPACITY" and "DETAILS" read "C A PA C I T Y" until tracked capitals were set unkerned; they now read whole. |
| 22 | Saved file's name is the quote's | pass | pass | pass | e2e asserts the title "Northside Marine quote 2026…-0n – …" (document.spec.ts:309) |
| 23 | Page 1's model, total, customer and validity ≥ 22 px | pass | pass | pass | model 40 px, total 40 px, customer 22 px; no validity set |
| 24 | No software branding | pass | pass | pass | no "HelmLogic" in any text |
| 25 | No picture drawn wider than its held pixels | pass | pass | pass | cover: `min(100%, held px, --shot-max × ratio)`; thumbnails: `min(28 mm column, held px, 20 mm × ratio)` |
| 26 | GST amount absent, or worked as DECISIONS records | pass | pass | pass | Rate 10% set on Settings after each draft was started and reached each at the give. The amount is total ÷ 11, the workbook's own formula. A $6,726.55, B $2,749.36, C $1,515.18. |
| 27 | Optional sections printed are the ones chosen before issue | pass | pass | pass | All left on. The e2e "the sections chosen beside the paper are the sections the PDF prints" turns the specification off and on and reads both PDFs. The unit test proves that a given quote keeps its choice and refuses a change with a sentence. |
| 28 | Settings changed after issue leave the issued text unchanged | pass | pass | pass | e2e "a colour kept on Settings after the give never reaches the given paper" |
| 29 | A printed dealer's copy says so on every page | n/a | n/a | n/a | no printed dealer's copy (OWNER 8) |

## What the round closed, with its evidence

- **GST never reached a draft already open** (built-m4-2.md, the first finding). `issueStampNow` now carries Northside's rate and terms, and `issue` writes them at the give. A draft's proof lays them over it as it already did the letterhead. Measured: GST was set after the drafts were started, and all three PDFs say "GST at 10%, included".
- **A stray " ·" at line ends in the contact line** (built-m4-2.md). Each part carries its dot in its own leading margin, and the line is clipped at the column's edge. The e2e "the reference prints on one line beside a full contact line" now measures that no line starts on a visible dot at 390, 1440 and 1920. It passed.
- **Page 2 of a short quote mostly empty** (built-m4-2.md; paper-handoff item 8). Page 2 now carries the specification and the quote. "Your price" keeps the acceptance on the last page, and a band's head keeps only its first line. Measured fill:
  - A: 93% on page 2 and 97% on page 3.
  - B: 92% on page 2 and 71% on page 3.
  - C: 59% on page 2 and 58% on page 3. A one-line quote still needs a third page, because the specification (345 px), the quote (206), the price (220) and the acceptance (322) do not fit one room of 934 px.
- **Series names in the file's shouting capitals** (built-m4-2.md). `quietCaps` turns "SEA RANGER SDF (CENTRE CONSOLES)" into "Sea Ranger SDF (Centre Consoles)" and "FOUR STROKE MODELS" into "Four Stroke Models", which is C's eyebrow. `specLabel` now says "WEIGHT" as "Weight" and "Bottomsides" as "Bottom sides".
- **Paper-handoff items:**
  1. The cover is now the picture at the full measure, up to 118 mm tall, with four key facts and the customer beside the total.
  2. The full specification is grouped and in words: no "OA Length", "Tube Dia" or "Int Length", and 382 cm is said as 3.82 m.
  3. Each item has its own facts: motor power, weight, shaft, engine, starting, control, trim and colour; trailer ATM, tare and wheels. Each part has its picture where one is marked. B shows three.
  4. The sections are chosen beside the paper.
  5. GST is closed.
  6. Missing details are said on the note.
  7. Not closed: the salesperson's name, title and phone print once set on Settings.
  8. Pages are fuller, as measured above.
  9. Chapter numbers follow what is printed: 01, 02 on B.
  10. The workshop facts and codes stay on the note.
  11. A quote starts with the boat alone, which the picker now does.
  12. A tow catch filed as a trailer was not re-walked here.
  13. Figures are in one face: all money is in the text face with tabular figures.
  14. The 390 contact line is closed, as above.
