# The build, closed? A fresh critic sells one boat (2026-10-19)

The question is whether a salesperson can do a full quote with a customer beside him, and whether it is beautiful. That was the owner's finish line. The second components critique (`components-critique-2.md`) said the build was still bland past the motor chapter and at the moment the quote is given. This critic had not seen HL_2.0 before.

## How this was read

- `npm run build`, then `npx vite preview --port 6791`, driven in Chromium through Playwright on an origin with nothing stored.
- **One sale at 1440 × 900, step by step, photographed:**
  - "Test Desk" at the door
  - New quote, then Stacer, "519", and the 519 Sea Ranger SDF · Centre Console
  - Start the quote, sampled every frame
  - Motor, where the customer changed his mind from the F90LB to the F115LB
  - Trailer, then Dealer fit with a Battery MFM50 added
  - Who it is for, "Jordan Test" and a phone line
  - the finale, and Give it to the customer, photographed at 120, 300, 600 and 1,100 ms and at rest
  - Open the document, photographed at 78 and 253 ms with the pill sampled every frame
  - Make a new version, then Customers, Quotes with its peek, History, and See what Trade does
- **The same sale at 834 × 1112 and 390 × 844:** the change of mind, the name, the give at 150, 350 and 700 ms, and the paper. The phone was a narrow viewport, not an emulated touch device.
- **Animations were sampled every frame** with `document.getAnimations()` while a caret was in the build's search field and in the name fields.
- **The price was sampled every frame** through each pick and through the give.
- **Focus:** a Tab walk of 68 stops on the build.

No console error was raised except `/favicon.ico` 404, twice on every load. Nothing was written to the repository except this page.

## The verdict

**Mostly no, and for the first time the build is not where he would say it first.** The chapters say what is on the boat in a person's words. The motor chapter is photographed tiles, two across, under hp chips. The workshop prose is one press away. Giving the quote is a moment at 834 and 390, where the card carries the boat's own photograph and turns leaf green under a seal.

**Where he would still say it is the change of mind.** It is the most human moment of the sale, the customer saying "actually, the 115", and the screen gets it wrong three ways:

- **It doubles the motor.** Pressing the F115LB puts a second outboard on a boat rated to 115 hp, and the total jumps from $55,223 to $71,890.
- **It explains itself in the engine's words**, in a grey box: "A pick here goes on BESIDE what is already there and never in its place".
- **It leaves the F90LB's rigging kit on the quote** after the swap, and the paper's workshop note then prints "Motor Yamaha - F90LB" beside an F115LB.

At 834, the size a salesperson holds on his knee, the boat leaves the screen as soon as he opens a chapter.

## The second critique's findings

| # | Finding | Now | What was seen |
|---|---|---|---|
| 1 | Chapters move with a caret in the search | **CLOSED** | "F115" typed with the caret held, 143 frames: only opacity transitions (`cfg-shop__facts`, `ui-picture`, `cfg-body`) and the scroll edge's ScrollTimeline. No transform ran. Typing the name and contact line ran only `box-shadow` and opacity. |
| 2 | Past the motor, the build is the database | **CLOSED**, with residue | Shut heads say "Yamaha F90LB · 3 more offered", "T Alloy 1400 ATM S 13" Skid Braked" and "Battery MFM50 and 1 other". Motor tiles are compact, two across at 1440 and 834, under "90 hp 2 · 115 hp 2", with "For the workshop" one press away. Part rows lead with the name, with the code quiet in mono. The engine sentence is gone from the head. Residue in new minor 11. |
| 3 | Giving the quote does not land | **CLOSED at 834 and 390, still small at 1440** | At 834 and 390 the finale carries the 519's photograph over the card. The card turns leaf green, the seal stamps, "Jordan Test" rises out of a blur, and "Open the document" arrives last, all at rest by 941 ms. At 1440 the same card plays inside the rail, the stage photograph and the masthead do not answer, and for about 500 ms there is a 230 px blank under the card where the act was. The price never moved: `$57,759` was at 1278,109 and 1218,550 on every frame. |
| 4 | The act draws "Open the draft already standing" over the price | **CLOSED** | 73 frames after Start the quote at 1440 and every frame at 834 and 390: no stale act, and no "already started" sentence. |
| 5 | The pill's capsule drops out on the way to the paper | **CLOSED** (one scroll measured) | From a build scrolled 294 px, the lit capsule's top was 13 on every frame to 1.5 s. The pill is steady in the 78 ms and 253 ms photographs. |
| 6 | Bolder tech mostly out of sight | **OPEN** | `grep` finds no marquee, spotlight, shiny text, border beam or text reveal in `src/ui` or `src/screens`. "Tilt" is only the Phosphor `PaperPlaneTiltIcon`. |
| 7 | Nowhere to add Northside's mark | **OPEN** | `src/routes` still has no settings route. Entry still says "The name is set in type because Northside Marine's own mark has not been added yet." |
| 8 | On a phone a third of the build is chrome, and a pressed chapter opens out of sight | **CLOSED** | `cfg-mast` is 96 px at 390 (it was 193). After a press on 02 Motor its head was at y 77–206 and the first tile at y 328. |
| 9 | Customers says nothing was given | **CLOSED** | After -01 was given and -02 made: "WRITTEN 2 · GIVEN 1 · GIVEN, IN ALL $57,759". |
| 10 | Quotes says its counts twice, and its photograph is another quote's | **CLOSED**, new minor 9 | The three tinted tiles are gone. Pressing -01 changed the photograph's caption to "the hull on 20261019-01 · Jordan Test". |
| 11 | The toast lies over the rail | **OPEN below 1440** | At 1440 it stands top right in the empty band, over nothing. At 834 it covers the finale row's figure and chevron, and later the finale's last note. At 390 it covers a motor tile and the finale's notes. |
| 12 | "−$14,330 $14,330 at Cash" on the chosen motor | **CLOSED** | Now "$14,330 on the quote". |
| 13 | The picker's tick disc half on the photograph's corner | **OPEN** | An empty ring still sits on every tile's top-left corner, over the photograph. |
| 14 | The picker's results leave the list empty | **OPEN** | "519" at 1440: one tile per series row, about two-thirds of the list's width blank. |
| 15 | The trailer named code first | **CLOSED** | The build, finale notes and paper all lead with "T Alloy 1400 ATM S 13" Skid Braked". The code is quiet on the cascade only. |
| 16 | History draws the same photograph twice | **CLOSED** as walked | There is one card for the boat and person. The closing paragraph sits whole above the legend at 1440. |
| 17 | The peek's dates break at the hyphen | **OPEN** | "5 minutes ago · 2026-" / "10-19", and again under "Given to the customer". |
| 18 | Ochre refusal; crest identity; plain finder rows | **OPEN** (crest seen) | The pill's crest is "NM". The refused act and the finder were not raised on this walk. |
| 19 | No favicon | **OPEN** | `/favicon.ico` 404 on every load, and `index.html` declares no icon. The tab reads "HelmLogic" until the paper. |

## What is new

### Majors

**1. A change of mind doubles the motor, and the screen explains it in the engine's words.** (configurator, 1440 / 834 / 390)

- **What happened:** with the F90LB on the quote, the F115LB was pressed. Both tiles turned to "on the quote".
  - The total went from $55,223 to $71,890, and the motor chapter to $30,997.
  - The head read "Yamaha F90LB and 1 other".
  - A grey box said: "2 lines from Yamaha Outboards are on this quote — Yamaha F90LB and Yamaha F115LB. A pick here goes on BESIDE what is already there and never in its place, so every one of them is charged."
- **To make the swap the customer asked for** took three presses: Undo, F90LB off (the total fell to $40,893 with "Nothing on it yet"), then F115LB on ($57,560).
- **Undo lives only in the toast**, which is gone after about 5 seconds. The build has no Ctrl+Z, although the sheet does (`src/screens/sheet/Grid.tsx:656`).
- **This is decided, not a slip.** DECISIONS 2026-09-17 and 2026-09-18 keep `addLine` additive for good reasons: two batteries, and the ADV7's six rigging pairings.
- **But this is the moment the owner described**, with a customer beside him, and on a hull whose own spec says "60–115 HP" the first answer the screen gives is a 205 hp twin and a capitalised "BESIDE".
- **Fix, without changing the engine:** where a hull carries one motor and a motor is already on, the motor tile's press can offer "Put this on instead of the F90LB". That is one command, remove plus add, with one inverse and one toast. The box can say it as a person would: "Two motors are on this boat now. Was that meant?"

**2. After the swap, the F90LB's rigging kit stays on the quote, and nothing says so.** (configurator → document, 1440)

- **The build:** Dealer fit still carried "Yamaha/Stacer · Binnacle Mount Rigging Kit" (9ST-704-6Y82L-22-07), with no word on the build.
- **The paper's own rail, "For the workshop", printed both:**
  - "Yamaha F115LB: Rigging Kit Option Mech Rigging Kit - 704 Binnacle Mount w 6Y8 2 Gauges … Prop Part No. 6FP-45943-00"
  - "Yamaha/Stacer · Binnacle Mount Rigging Kit: Motor Yamaha - F90LB; Prop Part No. 6FP-459xx-xx"
- **So the rigger is handed a kit the file ties to a motor that is not on the boat.** The F115LB's own kit sits under "Rigging Kits: 1 more offered".
- The customer's page prints the kit as "Not priced on this quote".
- **Fix:** when the motor a kit names leaves the quote, say so at the kit and in the finale, in a sentence and in the act's colour (the finale already does this for a double charge), and offer the kit the new motor names.

**3. On the tablet, the boat leaves the screen as soon as a chapter opens.** (configurator, 834)

- **On arrival** the stage is a 288 × 208 photograph beside the specification strip.
- **After a press on Motor** the page scrolls to the chapter, and for the rest of the sale the only boat on screen is the 40 px motor thumbnail. That covers Motor, Trailer, Dealer fit and Who it is for. The 519 comes back only in the finale.
- **At 1440, by contrast,** the stage stays beside the rail. Its top is cut under the masthead at rest when scrolled: the people's heads were lost in the "Who it is for" and finale shots, as build-close.md already notes.
- **834 is the size a salesperson holds** while sitting with the customer. "More like Porsche the right side" means the car stays in view while its options change.
- **Fix:** at 834 let the stage stay as a short sticky band under the masthead, about 160 px, the photograph cropped wide. Otherwise give each open chapter the boat's picture at its head, as the finale already does.

### Minors

4. **After "Address this quote", the amber act stays the loudest thing and points at a done thing.**
   - It re-labels itself "Save the name" and keeps the amber.
   - The finale, the next real step, is a quiet row under it.
   - The masthead never names the customer.
5. **A chapter head rests half under the sticky band.**
   - After a chapter press at 1440 and 834 the page settles with the previous head cut through its title: "Trailer" at 1440 under the search band, and "Trailer $8,703" at 834 under the masthead's veil.
   - This is at rest, not scrolling.
6. **The progress dashes follow the scroll, not the open chapter.**
   - They read "02 Motor" while Who it is for was open on arrival, and again with Trailer open at 1440.
7. **The stage jumps 25 px down when Give is pressed** at 1440: its top went from y 160 to 185 with `scrollY` unchanged at 294.
8. **The crossfade to the paper double-exposes two heads** for about 150 ms at 1440. The build's "Stacer 519 Sea Ranger SDF" and the paper's "Stacer 519 Sea Ranger SDF (Centre Console) for Jordan Test" are drawn over each other, with "TOTAL" under "Print".
9. **Quotes calls a given quote never given.**
   - After -01 was given and replaced, the register's empty band says "ISSUED 0 · Nothing has been given to a customer yet."
   - Customers and History both say one was given.
   - The peek's version list calls -01 "Issued", while its own head and the register call it "Superseded".
10. **The peek of a superseded quote offers "Make a new version" and "Discard this quote"** although -02 already replaces it.
11. **Dealer fit's residue.**
    - Every row carries the same green toolbox, five identical marks down a column.
    - The unpriced rigging kits still end on "—".
    - "1 not priced on this quote" sits under the customer-facing total on the finale card and on the paper, where a customer reads it as something free or something hidden.
12. **The paper says the boat in brackets**, "Stacer 519 Sea Ranger SDF (Centre Console)", on the cover, the page head, the line, the tab title and the peek. Its trailer reads "4.9 - 5.3 m", where the build says "for a 4.9–5.3 m boat".
13. **The cascade draws a lone "—"** at the right of "WHAT YOU CHOSE · Trade", with nothing beside it.

## Where first

1. **Major 1 and major 2 together: the change of mind.** One command that swaps a motor for a motor on a one-motor hull, with the kit it names checked in the same act. This is the moment the customer is watching.
2. **Major 3: keep the boat in view at 834.** The finale already proves the photograph belongs in the rail.
3. **Major 3 of the old list, at 1440:** let the stage answer the give, not only the rail's card.
4. **Minors 4 to 9.** Each is small, and each is on the sale's own path.
