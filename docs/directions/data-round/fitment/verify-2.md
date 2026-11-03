# Fitment, verify 2 — 2026-11-03

A fresh verifier, read-only. Built into `e2e/out/dist-6214`, served by `vite preview` on 6214, walked through the real door (name, Load the Master Price File) in Playwright Chromium at DPR 1 and all six sizes. Screenshots are in `verify-2/` (`<state>-<size>.png`; phone 390×844, land 844×390, tablet 834×1112, laptop 1280×800, desktop 1440×900, wide 1920×1080; `j*` files are the job walks at 1440). The server was stopped before this report. `vitest run src/domain/fitment src/screens/fitment`: 214 passed. `e2e/flows/fitment.spec.ts` at phone and laptop (own port 6214): 23 passed, 1 skipped.

## The jobs

| Job | State | Proof |
|---|---|---|
| What motors go on this boat, and what they cost | DONE | 7 tiles with hp, weight, shaft, rigging kit, prop and hole said once ("Alike on all 7"). With Rigging Kits chosen at Sell Price on Prices, the F175XC tile reads $4,040 kit and "On this boat $29,395", and the foot $103,738 (= $99,698 + $4,040). `j01-rig-priced-desktop.png`, `j01-levels-chosen-desktop.png` |
| Compare the motors side by side | DONE | `compare=side`: 11 rows, shaft now "Extra-long (25″)"; on a phone the table scrolls in its own box, page overflow 0. `j02-compare-desktop.png`, `05-compare-*` |
| Which trailer, and is it legal to tow | DONE | Weighing kept; GFAB tagged "Over its ATM, so not for a quote". `06f-trailer-full-*` |
| Start a quote with this boat, motor and trailer | DONE | Quote this one on F200XC put `motor=join_hf_yam:1806` in the address; Start the quote made quote 20261103-01 with Hull $61,700, Motor F200XC $27,565, REDCO $12,643 = $101,908, the foot's own figure. `j04-chosen-f200xc-desktop.png`, `j04-started-build-desktop.png` |
| What is this boat | DONE | Facts strip: 6.52 m, 2.59 m, 13, 1,287 kg, 140 L, 740 kg, Extra-long (25″), Remote. `03-sp660-full-*` |
| Why can't this motor go on | DONE | Reasons 74 / 51 / 10 shaft / 20 / 47 = 202. |
| Admin: take a motor off | DONE | F200XCC off: toast "…on all 16 of its versions."; version :520 then read "6 of 209"; Undo gave 7 back on :520. `j07-taken-off-desktop.png` |
| Admin: put a motor on | DONE | F2.5SMHB refused (under), F150LC refused (shaft), T9.9LPB on Stacer 359 refused (steering), each role=alert with its sentence; F150XC put on all 16 with Undo. Space on the grid line refuses the same way. `j08-put-*`, `16-keyboard-space-refused-laptop.png` |
| Admin: set the recommended motor | DONE | Recommend it on F200XC: toast with Undo, starred on :513 and :520, foot changed to the F200XC. `j09-recommended-desktop.png` |
| Admin: open the deciding line | DONE | Shaft reason → `/data/boat_highfield?at=…513&in=Sport`; one Back → `/fitment?boat=…513`. `j10-door-sheet-desktop.png` |
| Admin: fit-out packages and their prices | DONE | "4 of 1,576 offered", unchosen sentence with "Choose it on Prices", "The other 1,572…", Show all; parts priced. `j11-also-desktop.png` |
| Find a boat by name or code | DONE | "660" → 3 models in 36 versions; "HBS145" → Sport 660, 1 of its 16 versions; Enter opens the first. `j12-find-660-desktop.png` |
| A boat with nothing, a missing boat | DONE | Classic 340: "none made for it", "0 of 434 offered". Missing boat: "That boat is not on the price list. Choose another." `12-cl340-trailer-*`, `13-missing-*` |

## The missing items

| Item | State | Proof |
|---|---|---|
| Fitment per model, applied to every version and counted | DONE | `j07`, `j09`, other-version reads above |
| The rig priced | PARTLY | Right on the SP660. But 146 pairings on 30 boats name a rigging kit the file marks discontinued (e.g. `join_stabicraft_yam:162` names `rig_kits:625`, OBSOLETE RIGGING KITS), and the tile says "Its pairing names no rigging kit.", which is untrue. Its `total` is then the motor alone (`rigged.ts` 118–125), so once kits are priced the tile's "On this boat" figure would stand for a whole rig while it is a named kit short. 10 of 11 tiles on the Stabicraft 2350 Ultra Centrecab say this. `11a/11b-stabi2350-*-phone.png` |
| Start a quote from the answer | DONE | `j04-started-build-desktop.png` |
| Compare side by side | DONE | `05-compare-*` |
| The boat's spec strip | DONE | `03-sp660-full-*` |
| Shaft and steering reasons | DONE | reasons + refusals |
| Set the recommended here, with Undo | DONE | `j09` |
| Also made for it at depth | DONE | `07-also-*` |

## The last verify's findings

- Trailer over its ATM. Fitment: DONE. The press, Recommend it and the address-forced `trailer=join_hf_gfab:36` are each refused with a sentence, and the quote is started with no trailer (`j03-gfab-refused-desktop.png`, `j04-forced-gfab-desktop.png`). The build: NOT. On the quote that Start made, one press on the GFAB's "Add" put it on ($111,778) with no alert and no ATM sentence (`17-build-gfab-added-desktop.png`).
- Wrong-shaft motor: DONE (`j08-put-shaft-desktop.png`).
- Fold controls: DONE. All 6 measure 24×24 at all six sizes.
- Lone tile and the blank reason cell: DONE. 7 tiles sit 4+3 from 1280 and 3+2+2 at 834 and 844; 5 reasons sit 3+2 across the full width at 834 and 844.
- Alike line and tile presses at 834: DONE.
- Stabicraft STEERING alone at 390: DONE. 4 facts sit 2+2.
- Version list: DONE ("Hypalon · colour code I-B-C"). The chooser's SP300: PARTLY. It is still named by its code, now with the words "the price list's code".
- Compare in lower case: DONE.
- Commit: PARTLY. Fitment's fixes are in 27a8f74, but that commit also carries the sheet's files (Grid.tsx, Sheet.tsx, ColourKey.tsx, read.ts, sheet.css).

## Perfect, size by size

No page overflow at any size in any state (scrollWidth − innerWidth = 0 in all 17 states × 6 sizes), and no control under 24 px except visually hidden inputs.

- **390×844: NOT PERFECT.** The Classic 340's 7 facts sit 3+2+2 and its rows 2 and 3 do not line up with row 1 (`12-cl340-trailer-phone.png`). "Dealer Fit Packages 1 ·" wraps with the dot left at the end of its line. The rules footer's pencil icon stands alone above its sentence. The Stabicraft kit sentence is untrue (see above).
- **844×390: NOT PERFECT.** Tiles sit 3+2+2, so the tiles in rows 2 and 3 are wider than those in row 1. The Classic 340's facts sit 4+3 on a different grid. Show all prints the ↑ ↓ Space Enter key hint on a touch phone (`08b-all-motor-folded-land.png`).
- **834×1112: NOT PERFECT.** The same 3+2+2 tile widths. The rigging-kit sentence leaves "here." alone on its second line (`03-sp660-full-tablet.png`). The Classic 340's facts sit 4+3.
- **1280×800, 1440×900, 1920×1080: NOT PERFECT.**
  - In Also made for it, the Parts card stretches to the Dealer Fit card's height, leaving about 170 px blank (`j11-also-desktop.png`).
  - The REDCO trailer tile leaves about 100 px blank above its presses (`06f-trailer-full-wide.png`).
  - On the GFAB tile, the refusal repeats the weighing's 2,200 / 2,950 / 750 figures directly under it.
  - Recommend it moves the pressed tile to the front, so another tile's Recommend it lands under the pointer (`j09-recommended-desktop.png`).
  - Dealer fit names read "6.6 Mtr" and "1.8mtr" here, while the build says "6.6 m" and "1.8 m".
  - "47 twin and triple rigs." repeats the big 47 just above it.
