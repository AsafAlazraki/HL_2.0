# The printed quote and the build, read as the customer and the designer (2026-10-31)

I read the verifier's three PDFs (`verify/paper-{A,B,C}.pdf`, every sheet as `verify/paper-*-p*.png`). Then I made one more quote of each kind on a fresh build (`vite build` into a private folder, `vite preview --port 5851`, Chromium at 1440 × 900, GST 10 set on Settings first, each quote given, then printed under print media). In every run I switched sections off and on in the panel beside the paper:

| | what is on it | sections | sheets |
|---|---|---|---|
| D | Stacer 481 SeaMaster, Yamaha F70LB, T Alloy 1100 trailer, Garmin GA38 | Specifications off → on → off (4 → 3 → 4 → 3 sheets) | 3 |
| E | Stabicraft 1850 Fisher (Adventure), Striker Vivid 4cv, Garmin NMEA cable | Pictures off → on → off (3 sheets throughout) | 3 |
| F | Yamaha F70LB on its own | Specifications off (3 → 2 sheets) | 2 |
| G | Yamaha F150LC on its own, not given | the build and the summary at 1440 × 900 and 390 × 844 | – |

My shots are scratch, in `e2e/out/walk-5851/shots/` (gitignored): `paper-{D,E,F}.pdf`, `paper-*-p*.png`, `G-build-*`, `G-summary-*`, `H-open-*`, plus `log.txt` with the panel and desk-note text. Fill is measured as the lowest content box above the foot, in CSS px, out of a room of 933 px (from the running head's rule at 87 to the foot at 1020).

The switches work. Toggling re-paginates at once and the given quote keeps the choice. Nothing of the app prints. The arithmetic holds on all six papers, and no cost or code reaches a sheet. The faults below are faults of looks and words, plus one picture that is not the thing sold.

## Every sheet: perfect, or not and why

| sheet | verdict | why (the exact element, measured) |
|---|---|---|
| A p1 | NOT | The three White swatches before "Hypalon · White / White / White/Blue" are hollow 10 px squares on cream, so they read as unticked checkboxes. There is no eyebrow, while C, D and F have one. Nothing on the page tells the customer how to reach Northside (see gap 7). |
| A p2 | NOT | "Shaft length XL". The motor's facts read "Control Remote mech" and "Trim and tilt Power Trim & Tilt" (the label is said twice), and "Engine L4 / 1832cc". |
| A p3 | NOT | **63% empty.** The trailer and two dealer-fit lines end at y 429, so 342 of 933 px are used, and the price and acceptance go to a fourth sheet. "c/w", "w" and the file's table names "DEALER FIT PACKAGES" and "PARTS & ACCESSORIES" sit as subheads under "04 Dealer fit". |
| A p4 | PERFECT | Price and acceptance sit together, nothing is cut, and the figures add up. "Your salesperson: Asaf" has no phone, because Settings holds none. |
| B p1 | NOT | The photograph spans x 85–708 while the measure, rule and title span 68–726: a 17 px inset on each side that reads as a near-miss. The title breaks "Stacer 499 Sea Ranger / SDF (Centre Console)", which splits the model's own name. |
| B p2 | NOT | "Shaft length LS" is a code. "Striker Vivid 4cv **w** GT20-TM". |
| B p3 | NOT | **An orphaned line.** "Garmin NMEA Backbone/Drop Cable · 2mtr $59" opens the sheet under the running head with no "02 Dealer fit" head, so it belongs to nothing on its page. |
| C p1 | NOT | **The picture shows two outboards, one white and one grey**, for one grey F115LB, with no caption (checklist 6, a blocker by the spec's own rule). The picture box spans 120–673, narrower than the measure. The eyebrow reads "FOUR STROKE MODELS", the file's heading. |
| C p2 | NOT | Specifications repeats the cover's four facts and adds four. "Weight" and "Details" are groups of one row each. Content ends at y 637, so 41% is empty. "Control Remote mech". |
| C p3 | NOT | This page exists only because p2 could not hold the price. The quote has one line and three sheets, and $16,667 prints four times across them. |
| D p1 | NOT | The picture box spans 84–709 against the 68–726 measure. The eyebrow "SEA MASTERS" sits over the title "Stacer 481 SeaMaster", two spellings 40 px apart. |
| D p2 | NOT | **The trailer prints as the file codes it:** "T Alloy 1100 ATM S 13" Skid Braked · 4.5 - 4.9 m", with a spaced hyphen. The build says the same trailer as "for a 4.5–4.9 m boat · 1,100 kg ATM · 13″ wheels" (paper-handoff item 3, still open). |
| D p3 | PERFECT | Price and acceptance; 70% filled, which is right for a last sheet. |
| E p1 | NOT | The photograph spans 86–707 against the 68–726 measure. |
| E p2 | NOT | **"Fuel capacity Opt"**: the file's placeholder printed as a fact. "Shaft length XL". |
| E p3 | PERFECT | Price and acceptance; nothing is crowded or cut. |
| F p1 | NOT | The picture box spans 120–673. The eyebrow "FOUR STROKE MODELS" again. The picture itself is right: one grey F70. |
| F p2 | NOT | $10,460 prints three times on one sheet ("01 Motor" line, "Motor" row, "Total"). "01" numbers a band that has no second. |

**The build page, motor only (G).** At 1440 × 900 it is NOT perfect (gaps 13–17). At 390 × 844 it is NOT perfect (gaps 13–15, 20, 21).

## Gaps

### Blocker

1. **paper. The cover shows more motors than the quote sells.** C's cover (`verify/paper-C-p1.png`) is Yamaha's studio shot of a white F115 beside a grey one, for one grey F115LB, with no caption. G's F150LC stage, which is the same reader that feeds the cover, is a triple rig: three F150s for one motor (`G-build-1440-top.png`). The spec's checklist item 6 fails, and items 1–13 are blockers by its own rule. The fix is in the image ledger (`differs`, or a picture of one motor), not on the paper.

### Major

2. **paper. The cover is a letterhead with a picture, not the cover the owner asked for.** On all six papers the picture is 414 px tall on a 1,123 px sheet (37%). It sits in one of three frames: a bordered white box at full measure (A), an unframed photograph inset 17 px (B, D, E), or a bordered box inset 52 px (C, F). The layout under it is the letterhead page Milestone 4 printed. The owner asked twice for a cover that is "insane". Nothing here is a moment.
3. **paper. The picture's edge depends on the quote.** Measured on row 400 of each p1 PNG: A 68–725, B 85–708, D 84–709, E 86–707, C and F 120–673. The title, facts strip and rules all sit at 68–726. The 17 px insets read as misalignment.
4. **paper. The file's words still print as facts:**
   - "Shaft length XL" (A, E) and "LS" (B);
   - "Fuel capacity Opt" (E);
   - "Control Remote mech", "Trim and tilt Power Trim & Tilt" and "Engine L4 / 996cc" (A, C, D);
   - the trailer as "T Alloy 1100 ATM S 13" Skid Braked · 4.5 - 4.9 m" (D).

   A value that is not a fact ("Opt") should be left out, and the dealer told why on the note.
5. **paper. A band that spans two sheets loses its head.** B p3 opens on a dealer-fit line with no "Dealer fit, continued" head over it.
6. **paper. Short quotes waste sheets and repeat the price.**
   - A one-motor quote with the default sections (C) is 3 sheets: 59% and 56% filled, with the price printed four times. F, the same kind of quote with Specifications off, is 2 sheets, so the default is the wrong one for a one-item quote. On a motor-only quote the Specifications page repeats the cover's facts.
   - A (with two dealer-fit items) is 4 sheets, with a third sheet 37% filled. The previous round's checklist measured A at 93% and 97% on 3 sheets, so this is a regression with the quote's content.
7. **paper. A customer cannot reach Northside from this paper,** and the give does not say so. No address, phone, email or ABN prints on any sheet, because Settings holds none in a fresh browser. The note beside the paper says so after the give. The summary, where the give happens, says nothing (`D-summary-draft-1440.png`). Spec §0 rule 5 asks for the sentence "at the moment of issue", and paper-handoff item 6 asks Settings to ask for these before the first give.
8. **paper (panel). Two real choices against the owner's "add/remove sections".** Only Specifications and Pictures beside the items can be switched. Cover, Your quote, Your price and Acceptance are fixed, and two rows are refused with reasons. Paper-handoff item 4 named the motor's specification, the trailer, the dealer fit, terms and the dealership's details as choosable. For example, a boat quote cannot keep the boat's specification and drop the motor's.
9. **page. The summary names a hull by its finish alone.** "ON THIS QUOTE" lists the hull as "Adventure" (E, `E-summary-draft-1440.png`) and as "Hypalon · White / White / White/Blue" (A, `verify/A-summary-given-1440.png`). The model's name is missing from the row that prices it. D, a hull with no variant, says "Stacer 481 SeaMaster" correctly.
10. **page. A motor quote's motor chapter is in codes.** The nine tiles read "F130LA", "LF130XA", "F150XC", "LF150XC" and "F150LD", each with only a price change ("+$17", "no change"). A person cannot tell what differs: shaft, rotation or colour. The same motors offered on a boat's quote carry "70 hp · 119 kg · 20″ shaft" (D's walk log). The subject is said worse than the partner.
11. **page. The build and the paper name the same facts differently.** The build's strip says "150 HP RATING", "20" SHAFT LENGTH" and "L4 / 2670cc CYLINDERS / DISPLACEMENT", which wraps to two lines at 1440 and at 390. The paper says "Power 150 hp", "Shaft 20 in" and "Engine".
12. **page. The motor quote's dealer fit contradicts itself.** The chapter says "nothing goes with this motor · Nothing on it yet", while the tally under the total says "Not chosen yet: dealer fit."

### Minor

13. **page.** "Yamaha F150LC" is said four times in the first screen at 1440: the bar, the chapter subtitle, the "MOTOR F150LC" row and the chosen tile.
14. **page.** The F150 tiles show a triple rig and the F130 tiles a single motor, so the grid mixes two kinds of picture.
15. **page.** On the summary with no name, "Give it to the customer" is lit gold at full strength over its refusal sentence. The sentence is there, but the control looks pressable.
16. **page.** At 1440 the summary's right card ends at y 431 (E) to 532 (G), while the photograph runs to 745: a half-empty column on a full-screen page.
17. **page.** The line "Every price on it is final. A new version keeps these prices, never today's." renders visibly fainter than its sibling line, at 11 px. Its darkest pixel is rgb(144,159,169), against rgb(99,119,135) on "Print it or save it…" (`F-summary-given-1440.png`). Measured on pixels, not on the computed colour.
18. **paper.** The eyebrow comes and goes: "SEA MASTERS" and "FOUR STROKE MODELS" on D, C and F; nothing on A, B and E. Where it prints, it is the file's heading.
19. **paper.** Groups of one row: "Weight" and "Details" (C), "Capacity" (B). "01" on a sole band (C, F).
20. **paper.** Part names keep the file's abbreviations: "w", "c/w", "· 2mtr".
21. **paper.** The paper's ground prints as #FBFAF7 (measured on the print-media sheets). Spec §2 says white in print: an office printer frames a cream wash with its white edge.
22. **paper.** A's White swatches read as empty checkboxes on cream.
23. **paper (note).** On a motor-only quote the note says "Jeanneau: none is listed for this boat yet", but there is no boat. It also lists 49 Highfield hulls as "offered, none taken" under "Left off the printed quote".
24. **paper.** The reference is set in a monospace face in the head, foot and stamp: a third face on the paper.
25. **page.** At 390 the total $22,233 is said four times within one screen: the sticky tally, the item row, "Total at Cash" and the tally again (`G-build-390-s2.png`). The stage picture fills about 210 of 358 px.

Not counted: the "given-1440" shots in both runs (`verify/B-given-1440.png`, `D-given-1440.png`) show the summary with a square crop of the photograph over its list. That is the first frame of the move to the paper. Frames at 400 ms and 5 s (`H-open-400.png`, `H-open-5000.png`) show the paper whole, so nothing is stuck. Those screenshots were simply taken too early to be evidence of the paper on screen. The seal's blurred "Kelleher" is the same: the word reveal caught mid-animation, and it is sharp at 3 s (`H-seal-3000.png`).
