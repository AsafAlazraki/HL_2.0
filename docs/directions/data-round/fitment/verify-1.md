# Fitment, verify 1 — 2026-11-03

A fresh verifier, read-only. Built into `e2e/out/dist-6214` and served with `vite preview` on port 6214. I signed in through the door with the real Master Price File, then drove every job in Chromium at 390×844, 844×390, 834×1112, 1280×800, 1440×900 and 1920×1080. Screenshots are in `verify-1/`, named `<state>-<size>`, where phone, land, tablet, laptop, desktop and wide are the six sizes. Files named `v-*` and `x-*` are desktop interaction proofs. Every figure below was checked against the rows in `data/northside/tables`. `vitest run src/domain/fitment src/screens/fitment`: 197 passed. The server is stopped.

## Jobs

| Job | State | Evidence |
|---|---|---|
| Motors that go on and their cost | DONE | `x-sp660-desktop-full`: 7 rigged tiles. Each shows the motor's price, its rigging kit by name, "Price not chosen" and the shared prop and hole. No kit price is shown, because rig_kits carries 3 sell figures and Northside has chosen none (`v-prices-door-laptop`). |
| Compare side by side | DONE | `06-compare-*`, `x-compare-desktop`. On phone the table scrolls inside its own box (1088 of 358 px) and the page does not scroll sideways. |
| Which trailer and is it legal | PARTLY | `x-trailer-desktop`. The weighing is right: 740 + 220 + 380 = 1,340 kg against a 1,990 kg ATM, and the GFAB's 1,990 kg tare is the file's own (trl_gfab:21). But the GFAB, which is "750 kg over it", still offers Quote this one and Recommend it. I quoted it with no word at the press, at Start or on the build (`v-chosen-gfab-desktop`, `v-started-build-desktop`). |
| Start a quote | DONE | `v-started-build-desktop`. Starting with the F200XC and the GFAB opened quote 20261103-01: Hull $61,700, Motor $27,565, Trailer $24,723 = $113,988, the same as the plate's foot. The build says the kit is not in the total. |
| What is this boat | DONE | Facts strip: 6.52 m, 2.59 m, 13, 1,287 kg, 140 L, 740 kg, XL, Remote, $61,700. All match boat_highfield:513. |
| Why can't this motor go on | DONE | Reasons 74 / 51 / 10 shaft / 20 / 47, and 7 + 202 = 209. |
| Take a motor off | DONE | `v-takeoff-toast-desktop`. The toast reads "on all 16 of its versions". Version HBS147 then showed "6 of 209" and 6 tiles. Undo brought back 7. |
| Put a motor on | PARTLY | Under the range is refused where it was pressed (`v-under-refused-desktop`). But the F150LC, with a 20″ shaft, was accepted onto the XL SP660 with no word (`v-shaft-puton-desktop`). The screen names that very shaft as a reason it cannot go on. |
| Set the recommended | DONE | `v-recommend-desktop`. The F200XC was starred on all 16 versions and the foot moved to $101,908. Undo restored the F175XC. |
| Open the price-list line | DONE | The doors are kept. The Prices door goes to `/levels?list=rig_kits` and one Back returns. |
| Fit-out packages and prices | DONE | `08-also-*`. The "not chosen" sentence and Choose it on Prices (`/levels?list=dealer_fit`) are there, with "The other 1,572 are not made for this boat" and Show all. |
| Find by name or code | DONE | `03-search-660-*`: 3 models in 36 versions. `03b-search-nothing-*` covers no match. |
| Nothing and missing | DONE | `12-cl340-trailer-*` reads "none made for it, 0 of 434". `14-missing-*` reads "That boat is not on the price list." |

All 8 missing items are DONE except the trailer refusal and the shaft refusal above.

## The perfect bar, by size

At all six sizes I measured: sideways scroll 0, no cut or ellipsis text, no text under 11 px and no page error, in every state. The states were cold, maker open, maker scrolled, search, no match, plate, version popup, compare, trailer, also, Show all, scrolled, folded, a refusal, a toast, CL340, the longest name (Stabicraft 2350 Ultra Centrecab), missing, the picture lightbox and Another boat. The version popup scrolls inside itself (520 of 436 px on phone, 223 px tall on 844×390), and the arrow keys plus Enter reach version 16.

**NOT PERFECT, because:**

- **Phone, Show all:** the Fold buttons are 16×24 px, under the 24 px target (`09-all-motor-phone`).
- **Every size from 834 wide:** seven tiles leave the F200XSA2 alone on its last row (`04f-sp660-full-tablet`, `x-sp660-desktop-full`).
- **834 wide:** five reasons sit 3 + 2, leaving a blank third cell.
- **834 wide:** the "Alike on all 7" line wraps, so ENGINE HOLE starts under the head word instead of beside PROP.
- **834 wide:** the tile presses sit unevenly. The starred tile stacks two presses, while the others put Quote this one on a row of its own.
- **Phone, Stabicraft 2350:** the facts strip leaves STEERING alone on a row of three (`13-stabi2350-longest-phone`).
- **Version list:** "Hypalon · I-B-C" is left in raw code (HYP I-B-C, HBS160) while 15 siblings are spoken. HBS15## is the file's own code.
- **Chooser:** "SP300" is named by its code beside "Sport 330". Sport 900's picture well was empty when captured (`02b-maker-highfield-scrolled-laptop`).
- **Compare:** the shaft reads "extra-long (25″)" in lower case, while the plate reads "Extra-long".

## Gaps

| What | Severity | Evidence |
|---|---|---|
| An over-ATM trailer can be quoted and recommended with no refusal and no warning at the press, at Start, or on the build | major | GFAB SP660: 2,950 kg on the road against 2,200 ATM, quoted into 20261103-01 |
| A wrong-shaft motor is put on with no refusal, while under-range is refused | major | F150LC (20″) put on the XL SP660, toast "now goes on … all 16" |
| The Fold control on phone is under 24 px | minor | 16×24 px |
| A tile alone on its last row; a blank reason cell at 834 | minor | screenshots above |
| Raw variant "I-B-C"; "SP300" against "Sport 330" | minor | version popup, chooser |
| The Fitment code was committed under the sheet's checkpoint (8781a48), not Fitment's own (da7727e) | minor | `git log -- src/screens/fitment/useStart.ts` |
