# A maker's own page, verify 2 (2026-11-04)

A fresh verifier walked commit 38964ab2 (the fixer's round-1 checkpoint) on port 6284.
- The app was built into `e2e/out/dist-6284` and opened through the real door on the real price list.
- `places-shots.spec.ts` ran at all six sizes into `verify-2/`, 29 states each. All 174 measures came back clean: no sideways scroll, no text under 12px, no cut text, no control under 24px and no page errors. The spec's two out-of-sight faults also stayed silent.
- Probe scripts then pressed and measured the rest. Their frames start with `p-`.
- The server was stopped afterwards.

## The last verify's findings

| Finding | Now | Proof |
|---|---|---|
| BLOCKER trailers print a metre size the file lacks | FIXED. Every series of REDCO, NSM Custom, GFAB, OBSOLETE, Dunbier and Mackay was pressed: 41 "boats of" strings, every one a metre form under 30. 52 "for the 495 / MF 605 / Jet Ski" use the file's own words. Lengths read from millimetres (RE1213: n=4430 is "4.43 m long") | `16b-nsm-custom-*`, `17-obsolete-*`, `p-nsm-highfield-trailers-1440x900` |
| MAJOR phone refusal out of sight | FIXED. At 390 the refusal is at y 406–473 and at 844x390 it is at y 261–316, on the card pressed. A polite live region carries the sentence, and the button is `aria-describedby` to it. The tray is sticky at the foot | `06-compare-refused-390x844`, `06-compare-refused-844x390`, `04b-tray-among-cards-*` |
| MAJOR wrapped line begins on a dot | FIXED. Every `.pl-run` was measured on 67 Highfield cards and on Yamaha, the six trailer lists, Labour, Dealer Fit, Registration, Jeanneau, Stacer and Formosa, at all six sizes: 0 begin on a painted dot | `p-sp300-card-*`, `p-sport900-card-*` |
| minor raw hp string | FIXED. "up to 425 hp or 2 × 300 hp", "250–350 hp or up to 2 × 200 hp", read from the file's slash | `p-sport900-card-*` |
| minor kit labels run together at 390 | FIXED. The smallest gap between the labels is now 19.9px (it was 4px) | `02-highfield-full-390x844` |
| minor Parts head vs sentence | FIXED. The head reads 2,937, with 699 no longer sold and 2,095 of 2,238 priced. The sentence names no figure, and *Open the chandlery* stands once | `19-parts-*` |
| minor tiles under the floating bar | PARTLY. Pressed from the tray among the cards or at the top, the compare lands clean. Pressed from the range's foot at the page end, at 1280 and 1440, it lands at compare top 244 with the dock unstuck. The series tiles' names Ultralite, Classic, Coaster and Patrol then sit under Find, Quotes, Customers and Data, and the Sport tile reads "ort" beside History | `p-compare-from-end-1280x800`, `p-compare-from-end-1440x900` |
| minor phone quote row wraps | FIXED. The name wraps to 2 lines, and each price span sets "to $129,830" on its own line | `26-quotes-one-390x844`, `p-quotes-six-390x844` |
| minor labour needs a press | FIXED. "$159.00 an hour of Retail Labour · Rate (inc GST)" and 18 rates to the cent | `18-labour-*` |
| minor Yamaha 2.5 hp half-empty box | FIXED. The box is half width with one row | `14-yamaha-*` |
| minor motors/trailers say no boats; no trailer length | FIXED. F150XC "fits 45 models: 7 Formosa, 5 Highfield…", trailers "fits 2 Surtees models", REDCO 49 of 52 and NSM 24 of 73 lengths | `15-yamaha-150-*`, `16-redco-*` |

## Jobs and missing items

Every job and every missing item is done, except two. "Changed here" was carried from verify 1 and not re-walked. The missing item "Motors by their own facts" is partly done: a motor names its makers and counts, not a size ("fits boats up to 5.3 m").

The quotes were walked again. Six drafts were minted, each from its own card's *Quote it*. The list then shows:
- the spoken boat name, the total, "Nobody named yet" and "Draft";
- a find, where "900" leaves one quote and "zzz" says "No quote here holds “zzz”.";
- `p-quotes-six-*` and `p-quotes-find-900-*` are the proof.

## Gaps left

1. MINOR at 1280x800 and 1440x900: the compare opened from the range's foot leaves the series tiles under the floating bar (above).
2. MINOR at all sizes: REDCO's "How it is sold" lists "OBSOLETE Trailers — No Longer Available" among the lists "sold the same way". The OBSOLETE page says none of them is sold or offered on a new quote (`24-redco-settings-*`, `17-obsolete-*`).
3. MINOR at all sizes: the Labour note reads awkwardly: "Its Actual and Rate (Exc GST), which the price list's other sheets cost an hour at, stay in the price list." (`18-labour-*`).
4. MINOR at all sizes: a motor says which makers it fits, not the size of boat (asked for by the missing item).

A note on the frames: full-page frames show some picture wells empty, for example Roll Up 280 AL and Cap Camarat 7.5 CC S3. Those pictures load lazily and had not loaded when the frame was taken. After scrolling all 67 Highfield cards, 0 pictures were broken and 0 wells were blank.

## The perfect bar

| Size | Verdict | Why |
|---|---|---|
| 390x844 | NOT | Gaps 2 and 3 |
| 844x390 | NOT | Gaps 2 and 3. The refusal stands over the card's picture, but in sight |
| 834x1112 | NOT | Gaps 2 and 3. The compare from the foot lands clean here |
| 1280x800 | NOT | Gaps 1, 2 and 3 |
| 1440x900 | NOT | Gaps 1, 2 and 3 |
| 1920x1080 | NOT | Gaps 2 and 3. The compare from the foot lands with the dock stuck |
