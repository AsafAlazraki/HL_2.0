# The chandlery (`/catalogue`), verified — data round, verify 1, 2026-11-03

A fresh verifier, read-only. Built from `c26193d` into `e2e/out/dist-6244`, served by `vite preview` on 6244, signed in and the real Master Price File loaded the way `shoot.cjs` and `door.ts` do. Every job done by hand in Chromium at 390×844, 844×390, 834×1112, 1280×800, 1440×900 and 1920×1080. Shots are in `verify-1/`, named `<state>-<size>.png` (245 files). Both servers were stopped before this report was written.

Rulers and flows on their own port (6245): `e2e/rulers` plus `catalogue.spec.ts` filtered to the catalogue, **135 passed, 0 failed** (65 at phone, phone-landscape and tablet; 70 at laptop, desktop and wide). My own measure over 34 states at six sizes found 0 px sideways, 0 text cut by its box, 0 ellipses, 0 controls under 24 px and 0 page errors. The rulers passed, but they did not catch the defects below: none of them is in a route state.

## The jobs

| # | Job | Verdict | Proof |
|---|---|---|---|
| J1 | Show the customer an aisle | **Partly** | The aisle's `h1` is at y 72 (390), 108 (844×390) and 116 (the rest), with scrollY 0 (`b02-press-anchoring-*`). At 844×390 no part is in the first window: the head, find and filters take it, and the first line starts at y 383 of 390 (`b02-…-844x390`, `b16-radios-cards-844x390`). |
| J2 | How much fitted? | **Done** | Supply and fitted are labelled on every line and card. The trailer adjustments say "Fitted only · $79–$636 fitted" (`b09-trailer-adjust-*`); labour says "Fitted only · $8/$18/$44" (`b10-labour-*`). |
| J3 | Find by maker word | **Done** | "lowrance" typed answers 144 (`b11-*`). "yamaha" answers 453, "the first 200 are shown" (`b12-*`). |
| J4 | Find by code | **Done** | "SG002" typed answers 1 part: Safety Gear · Smooth Waters (`b13-*`). |
| J5 | Show the part large | **Done** | The expand opens the dialog with its source credited, and Escape returns focus to "See the VHF Radio · Garmin VHF115i larger" (`b18-gallery-*`, `b19-*`). |
| J6 | What fits his boat | **Done, with a wrong figure** | *For a boat…* → 529 Assault Pro → `?boat=` → "Made for … 1 in Anchoring & mooring, of the 4" (`b04-*`, `b05-*`), and *See all 4* opens the front with the four. The opened D Shackle says "**91 boats**: Stacer 309 Skimma, Stacer 319 Skimma, Stacer 359 Skimma **and 70 more**". That is 73, not 91: the count counts boat rows and the list counts names (`b07-line-open-*`). |
| J7 | Quote a part on its own | **Partly: the way is broken** | The sentence is right. Its door *Let it be quoted on its own* goes to `/places/place%3Aparts-accessories?tab=settings`, which says "**No place is called "place:parts-accessories"**" at every size (`d01-quote-way-*`). `Wares.tsx` builds `/places/${place.id}` from the module id, but the route's `$id` is the list (`/places/parts`). Switched on by hand at `/places/parts?tab=settings`, *Start a quote with it* appears and opens the picker with Sand Anchor Kit 4lb chosen (`e03-start-quote-pressed-*`). |
| J8 | Northside's own picture | **Done** | A PNG on an opened line makes it a card, with a toast and Undo. The aisle's count goes 0 → 1 of 66 (`d07-own-picture-*`). A text file is refused in place with its sentence, in an `aria-live="polite"` region. The row grows 67–86 px, not 120 (`b08-refusal-*`). At 390 the refusal's last line lands under the bottom bar. |
| J9 | Work the parts with no picture | **Partly** | There is a *No picture* view per pictured aisle (`b20-without-*`) and the drop by code (`d08-bycode-*`: SG002.png placed, IMG_2041.png refused with its reason). There is no worklist across aisles and no "by use on quotes" order. |
| J10 | Open a part's line to change its price | **Done; Review is generic** | *Open its line in Parts & Accessories* → `/data/parts?at=parts:38` with the line open (`d04-open-line-*`). An unpriced Reef Anchor Kit says so with *Put it right on Review*, but that lands on `/review`'s first case and Review does not mention the Reef Anchor Kits (`d06-to-review-*`). |
| J11 | Place the 28 *Not sorted yet* | **Done** | *DFO kits* → Batteries & power: "DFO kits is now in Batteries & power.", unsorted 28 → 25, power 105 → 108 (`d09-*`, `e04-batteries-dfo-1280x800`). |
| J12 | Narrow by maker | **Partly (day one)** | On day one the chips still print codes: propellers *YAM 263 · Yam 175*, anchoring *LSM, BBB, SAW, BLA…*, trailer *VIK 5 · Viking 1* (`b21-*`, `b09-*`). *The suppliers* proposes Lowrance, Garmin, Simrad, Momentum, Raymarine and YAM·Yam (`b25-*`). Naming YAM·Yam "Yamaha" makes one chip, *Yamaha 438* (`d11-*`, `d12-*`). |
| J13 | Walk the 447 propellers | **Done** | One page of 10 sections, sort by price, *Its 10 headings* (`b21-*`, `b23-*`, `d14-*`). |
| J14 | The file is not in this browser | **Done** | `/catalogue` with no file goes to the door (`f01-no-file-*`). |
| J15 | A wrong aisle or supplier | **Done** | "There is no aisle called "nope". These are the 19." and "Nothing in Anchoring & mooring is sold by ZZZ…" (`b26-*`, `b27-*`). |

## The missing items

| Item | Verdict | Evidence |
|---|---|---|
| Fitted beside supply, labelled, never $0 where fitted | **Done** | As J2. TTF hours are left off because the manifest lists `parts.o` as a cost column; that holds. Install Type shows on the opened part. |
| Aisle opens where the person looks; sticky head says aisle · maker · boat | **Partly** | The dock sticks and says "Propellers & motor care · YAM" and "Anchoring & mooring · Stacer 529 Assault Pro · Tournament" (`d13-*`, `b06-*`). At 844×390, bar plus dock end at y 149, so 38 % of the window is chrome (`b22-…-844x390`). Inside a 260-line section, nothing says which heading you are in. |
| A composition for a 91 % unpictured list | **Done, one remainder** | Cards for pictured parts, a ruled ledger for the rest, and Pictured · All · No picture. On an opened unpictured line the dashed "Add a picture of the …" box still repeats the whole name. On the 160-character MF Hardtop line that is 6 lines (`b15-longest-390x844`). |
| `/catalogue` in `e2e/routes.ts` | **Done** | 5 routes, 135 ruler and flow tests passed. |
| Find by code, maker word, heading | **Done** | J3, J4. |
| Makers in words, one maker once, command with inverse | **Done (mechanism)** | `d11`, `d12`; the spec walks Undo. The day-one chips are still codes (J12). |
| Sub-groups, sort, a page that keeps its place | **Partly** | Sections and sort are there, and Back from a line returns near its place (scrollY 5028 → 3657, opened line in view, `f02-back-from-line-1280x800`). The front's heading links do not go to their heading: *Flushers* opens `?aisle=propellers&heading=FLUSHERS` at scrollY 0 at every size, and only a reload lands it (`g03`/`g04`/`g05`). A heading reached by address stops 9 px under the dock at 5 of 6 sizes (`g02-heading-url-*`, `d15-heading-jump-*`). |
| A door to the sheet; unpriced to Review | **Partly** | The sheet door works. The Review door is not to the part's case (J10). |
| The boat chip; each part says its boats | **Done, with a wrong figure** | As J6, "91 boats … and 70 more". |
| Start a quote, or the sentence and the way to Settings | **Partly** | The way to Settings is a dead address (J7). |
| Place a *Not sorted yet* heading with Undo | **Done** | J11. |
| A picture worklist and a drop matched by code | **Partly** | The drop is done. There is no worklist (J9). |

## The perfect bar, by size

| Size | Verdict | Why, measured |
|---|---|---|
| 390×844 | **NOT** | The boat popover's text has no inner padding: "The customer's boat" sits at x 18 in a box at x 16 (`b04-boat-popup-390x844`). A heading jump stops 9 px under the dock (`d15-heading-jump-390x844`). The picture refusal's last line lands under the bottom bar (`b08-refusal-390x844`). The boat pill wraps "4 made / for it" onto two lines (`b05-boat-chosen-390x844`). |
| 844×390 | **NOT** | No part is visible after pressing an aisle: the first line is at y 383 of 390. Bar plus dock take 149 of 390 px. The boat popover's field is 384 px in a 360 px box, so its clear button and right edge are clipped and "makes" is cut (`c01-boat-popup-844x390`). |
| 834×1112 | **NOT** | The boat field overflows its popover by 24 px. The heading jump is 9 px under the dock. The sort menu sits between two rows of supplier chips (`b02-press-anchoring-834x1112`). |
| 1280×800 | **NOT** | The boat popover overflows by 24 px and its text runs to both edges (`c01-boat-popup-1280x800`). The heading jump is 9 px under the dock (`d15-heading-jump-1280x800`). |
| 1440×900 | **NOT** | The boat popover overflows by 24 px. The heading jump is 9 px under the dock. YAM and Yam are two chips (`b21-propellers-1440x900`). |
| 1920×1080 | **NOT** | The boat popover overflows by 24 px. The heading jump is 9 px under the dock. The *Made for* row's columns sit 16–20 px left of the ledger's below it (code x 1028 against 1048, supply 1484 against 1500) (`b05-boat-chosen-1920x1080`). |

These hold at every size: the front (`b01`), finding nothing (`b14`, a sentence naming the four things searched), cards and the opened card (`b16`, `b17`), the gallery (`b18`), suppliers (`b25`) and a wrong aisle (`b26`). Keyboard: every control on the front and in the aisle is reachable, with a visible focus ring. Escape shuts an opened line and returns focus to its head. Motion is gated on `prefers-reduced-motion: no-preference`. Colours are tokens, with no literals in `catalogue.css`.

## Gaps, by severity

1. **Major, J7.** *Let it be quoted on its own* goes to a page that says "No place is called "place:parts-accessories"", at all six sizes. `src/screens/catalogue/Wares.tsx` builds `settingsHref` from `place.id`, which is the module id. The places route takes the list id (`/places/parts?tab=settings` works).
2. **Major, J6.** "91 boats: … and 70 more" names 73. `boatsSaid` dedupes names while the count counts boat rows, some of them no longer sold.
3. **Major.** The boat popover's search field is 384 px in a 360 px popover at 5 of 6 sizes. The clear button is clipped, the popover scrolls sideways, and its text has no inner padding at all six.
4. **Major.** The front's heading links (four per plate) open their aisle at the top, not at their heading. `?heading=` is honoured only on a fresh load.
5. **Major, 844×390.** Pressing an aisle shows no part in the first window, and bar plus dock take 38 % of the height once scrolled.
6. **Minor.** A heading reached by address stops 9 px under the dock at 5 of 6 sizes.
7. **Minor, J10.** *Put it right on Review* lands on Review's first case, not the part's.
8. **Minor, J9.** There is no worklist of unpictured parts across aisles.
9. **Minor, J12.** The day-one chips are supplier codes, and YAM and Yam are two until Northside presses once.
10. **Minor.** The opened unpictured line's dashed box repeats the whole name. On the longest line that is 6 lines at 390.
11. **Minor.** Polish: the *Made for* columns misalign with the ledger at 1920; the sort menu is wedged between chip rows at 834; the boat pill wraps at 390; nothing in the dock says which heading you are in.
