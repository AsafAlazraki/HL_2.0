# The chandlery (`/catalogue`), judged — data round, 2026-11-03

A fresh judge who had never seen the screen. I served it from its own build (`e2e/out/dist-6240`, `vite preview --port 6240`) and reached it through the real door with the real Master Price File (the `throughTheDoor` walk: a name, then *Load the Master Price File*), using a fresh browser context at each of the six sizes. Every screenshot named below is in `before/`, with its size in the file name (`-390x844`, `-844x390`, `-834x1112`, `-1280x800`, `-1440x900`, `-1920x1080`). At every size and in every state I measured sideways scroll, text cut by its own box, controls under 24 px, text under 12 px and page errors. Each figure from the price file was counted off `data/northside/` (parts table, 2,937 rows, 2,238 on sale). I stopped the server before writing this.

**Verdict: REDRAW.** The idea is right. Aisles named by what a part is for, counted off the file, with nothing guessed into them. The gallery, the dealer's own picture door with its refusal sentence, and the aisle and maker as search params are also right, and all of them should be kept. The composition is wrong for the list it has to carry.

- **Only 197 of 2,238 parts (8.8 %) have a picture**, so on 17 of 19 aisles the "card of one size, picture first" shows a dashed *Add a picture of the …* box. The box names the part, then *Drop pictures here, paste one, or press to choose them.*, then the name again. Its text is cut by its own box at every size.
- **The aisle grid always sits above the open aisle**, so pressing an aisle changes nothing you can see at 390, 844×390 and 1280. Its parts open 881 px down a window 800 px tall, and 1,685 px down a phone.
- **Each part has one price, unlabelled, from the supply-only rung.** The file also prices the fitted part. It does so for 101 of the 143 parts the card calls unpriced or $0, and for every labour line.
- **An aisle of 447 parts** has no sub-groups, no sort and no denser view. It has only *Show the next 24 of 423*.

These faults are in the shape, not the finish. The screen gets a new sweep and three drawn directions. The mammoth work is listed in §3.

---

## 1. The jobs, and each one done

The jobs come from the screen's line in `docs/SCREENS.md` (Built screens: "eighteen aisles… part cards of one size… the dealer's own picture door"), `src/screens/catalogue/*`, `docs/DECISIONS.md` (2026-10-30 the chandlery; 2026-10-30 "quotes are not just boats… dealer fit things as well"; 2026-09-24 "the finder reads the code a dealer orders by"), `docs/LATER.md` (the boat-as-a-map, deferred) and `docs/research/refs/choosing/notes.md`.

| # | Who | Job | Done on the screen | Result |
|---|---|---|---|---|
| J1 | Salesperson, customer at the desk | "Show me what you've got for the anchor." | Press *Anchoring & mooring* (`02-aisle-pressed-*`, `03-aisle-open-*`, `23-…-1280x800`) | **Half done.** At 1440 and 1920 the aisle's head and maker chips show at the foot of the window. At 1280 (opens at y 881 in an 800 window), 844×390 (y 997 of 390) and 390 (y 1,685 of 844), **nothing visible changes** apart from the ring on the tile, and the person has to scroll to find the result. Once found, 66 parts show, every one a dashed *Add a picture* box. The customer sees a to-do list, not a chandlery. |
| J2 | Salesperson | "How much is it fitted?" | Read any card | **Not possible, and sometimes wrong.** Each card shows `Sell` (`parts.l`, the supply rung, level `cash`) with no label. The file's second declared level, `fitted` (`parts.y`, *Sell inc Install*), differs from Sell on **1,882 of 2,238** parts and is never shown. Of the 143 parts with no Sell, **101 carry a fitted price**, yet the card says **$0** or *No price on the price list*. Measured: *Trailer Adjustment · 15 to 17ft* reads **$0** where the file prices it **$206 fitted**, and all five sizes read $0 against $79–$636 (`20-fitted-only-says-zero-1280x800`). *Labour Estimated · (0.5)* reads **$0** against $44. 116 parts read a bare **$0**. |
| J3 | Salesperson | "Find the Lowrance units" / "the Yamaha service items" | Type `lowrance`, `yamaha` | **Mostly misses.** The search reads only the product words (`matchesName`). `lowrance` finds **5 of the 144** Lowrance lines (their heading is LOWRANCE but their names are "HDS PRO 9…"). `yamaha` finds **39 of 671** Yamaha lines. |
| J4 | Admin, or the salesperson reading a code off a box or invoice | "Find SG002" | Type `SG002` (`12-find-code-*`) | **Refused**, as *"No part on the price list is named "SG002". A code is not a name: try what the part is."* The refusal is a sentence, which is honest. But the file carries a `Code` on every line, the shell's finder already reads codes (DECISIONS 2026-09-24), and the person who orders by code is refused on the one screen built for parts. |
| J5 | Salesperson | "Show the customer the unit large" | The expand button on a pictured card (`09-picture-large-*`) | **Done** for the 197 parts that have a picture. The gallery is clean, credits its source ("Picture from res.garmin.com"), closes on Escape and returns the caret to *See its picture larger*. |
| J6 | Salesperson | "Which of these goes on his boat?" | *Fitting no boat · 2,238 on sale*, then *What fits a boat* | **Not possible here.** The chip looks like a control but is a sentence, and nothing on `/catalogue` lets you choose a boat. Board B promised "the catalogue opened alone can take a boat the same way" (`choosing/notes.md` §4 B). *What fits a boat* leaves for `/fitment` cold, with an expand glyph (`ArrowsOutSimple`) on what is really a navigation. The file carries what is needed: six P/D pairing lists (`join_*_pd`, 2,561 pairings naming 75 distinct parts). |
| J7 | Salesperson | "He just wants the VHF. Quote it." | Any card | **Not possible.** No card offers to start a quote or put the part on one, and the spec asserts this (`chandlery.spec`, "nothing offers to put a part on one"). The owner said on 2026-10-30 "you can sell those as well", and the place setting exists (`letQuote`), but the room built for parts has no door to it. |
| J8 | Admin | "Put Northside's own photo on this part" | Press the door (`10-own-picture-door-*`) | **Done.** Pressing opens the file chooser (measured). A text file is refused in place with a sentence, *"notes.txt" is not a picture, so it cannot be the Sand Anchor Kit · 4lb's. A photograph or a drawing can: JPEG, PNG, WebP or GIF.* (`23-refused-not-a-picture-*`). The refusal grows the card by about 120 px, and every card in its row with it, and it is not announced in a live region (`aria-live` count 0). |
| J9 | Admin | "Which parts still need a picture, and work through them?" | The aisle tile's count "· no pictures yet" | **Half done.** Each aisle counts its pictured parts (Sounders 161 of 246, 15 aisles none). There is no "without a picture" view, no order by what sells, and no progress once a picture lands. |
| J10 | Admin | "This price is wrong, change it" / "open its line" | Any card | **Not possible.** No card opens its line in the sheet (`/data/parts?at=parts:N`). The Data section's promise is "every list it carries, open to read and change". The 3 Reef Anchor Kits read *No price on the price list* with no door to Review or to the line. |
| J11 | Admin | "These 28 'Not sorted yet' belong in aisles" | `?aisle=unsorted` (`15-unsorted-*`) | **Not possible.** 28 parts show, among them batteries, trailer plugs, a fender and three ropes, which plainly belong in *Batteries & power*, *Trailer parts* and *Anchoring & mooring*. The aisle says why they are there, but nothing lets Northside place them (`aisleOf` is code). |
| J12 | Either | "Narrow the propellers to Yamaha" | Maker chips (`04-maker-*`, `05-propellers-*`) | **Done, in the file's codes.** The chips read `YAM 263`, `Yam 175`, `MSA 5`, `RWB 1`, `SAW 1`. One maker is split in two by letter case (YAM 459 + Yam 212 across the file). `LOW`, `GAR`, `SIM`, `RAY`, `BLA`, `LSM`, `BBB` and `ANC` are supplier codes printed where a maker's name is promised ("Radios & beacons by maker"). There are 79 supplier strings on the live list, with `Sublet`, `Serv`, `Factory` and `NSM Service Dept` among them. |
| J13 | Either | Walk 447 propellers | *Show the next 24 of 423* (`05`, `06`, `07-scrolled-end-*`) | **Slow.** It takes 18 presses to reach the end, with no sub-groups (the file's own headings: *PROPELLERS - Yamaha* 260, *YAMAHA SERVICE ITIEMS* 126 …), no sort and no denser view. At 1440 every one of the first 24 cards is a dashed box. |
| J14 | Either | The file not in this browser | `19-no-file-*` | **Done.** *"The price list is not open on this computer, so its parts cannot be shown. Open the Master Price File to see them."* with the door. |
| J15 | Either | A link with a wrong aisle or maker | `?aisle=nope&maker=YAM` (`16-bogus-aisle-*`); `?aisle=radios&maker=NOBODY` (`17-maker-nothing-*`) | **Wrong aisle: silent.** The page draws as if no aisle were named, with no sentence. **Wrong maker: said**, as *"Nothing in Radios & beacons is sold by NOBODY."* |

Not listed: the boat as a map of parts (`docs/LATER.md`, direction A). The owner's words of 2026-10-31 do not reach that far, and J6 can be met by the boat chip board B already promised, without the per-aisle setting A needs.

---

## 2. The perfect bar, at six sizes

The measured rulers: **0 px sideways** in every state at every size, **0 page errors**, no control under 24 px (the only hits are the 1×1 file inputs, which are visually hidden by design), and keyboard reach is whole (find → *What fits a boat* → each aisle tile in order → each card's door or expand). The only text under 12 px is the 11 px tracked capitals and the aisle counts (*246 parts · 161 pictured*), which are legible. **`/catalogue` is not in `e2e/routes.ts`**, so the contrast, cut, overlap and density rulers have never measured this screen. That is how the cut below shipped.

**The picture door's own text is cut by its dashed box, at every size** (measured: text whose box crosses the door's border):

| Aisle (first 24) | 390×844 | 844×390 | 834×1112 | 1280×800 | 1440×900 | 1920×1080 |
|---|---|---|---|---|---|---|
| Radios & beacons, 16 doors | 9 cut | 1 | 1 | 1 | 7 | 7 |
| Propellers & motor care, 24 | 7 | 0 | 0 | 0 | 7 | 7 |
| Covers & canopies, 24 | 3 | 3 | 3 | 3 | 3 | 3 |
| Not sorted yet, 24 | 3 | 1 | 2 | 2 | 3 | 3 |

For example, "…406MHz GNSS · Manual Ativation" is cut through its last line (`03-aisle-open-1440x900`), and "…Railwork for Portside Rear" and "…Launcher + Transom" lose half a line (`13-find-longest-390x844`).

| State | 390×844 | 844×390 | 834×1112 | 1280×800 | 1440×900 | 1920×1080 |
|---|---|---|---|---|---|---|
| Arrive (`01`) | NOT: 6 of 19 aisles above the fold; head, lede, chip, find field and *What fits a boat* fill 391 px before the first aisle | NOT: **0 of 19** aisles above the fold; the whole first window is head | PERFECT reading; all 19 aisles in view | NOT: 18 of 19 in view, *Not sorted yet* cut by the fold | PERFECT | PERFECT (centred at 90rem, wide margins the frame) |
| The lede (`01`) | NOT, at every size: "2,238 parts on sale in **18 aisles**" over a heading counting **19**; then "The same aisles and cards a quote's dealer fit opens, fitting its boat.", a sentence about the code, not for the dealer; then the chip repeats "2,238 on sale" | | | | | |
| Aisle pressed (`02`) | NOT: opens 1,685 px down, nothing seen | NOT: 997 px down a 390 window | NOT: the head at y 1,016 of 1,112, no parts in view | NOT: y 881 of 800, nothing seen | NOT: head and chips only, at the foot | NOT: same as 1440 |
| Aisle scrolled (`03`) | NOT: the aisle's name scrolls away under the floating bar; while reading the cards, nothing says which aisle or maker you are in | same | same | same | same | same |
| Cards (`03`, `05`, `11`) | NOT: the door repeats the name, then the hint, then the name again; 2 cards a row of 273–312 px for one name and a price | NOT: 4 a row, fine, but each row is one window tall | NOT: as 390 | NOT: rows 263/283/302 px; at 6 a row, 18 of 24 dashed | NOT: 7 a row, 16 of 24 dashed in Radios, 24 of 24 in Propellers | as 1440 |
| Price on the card | NOT, every size: unlabelled supply-only figure; **$0** on 116 parts, among them 5 trailer adjustments the file prices $79–$636 fitted and 33 labour lines; "No price on the price list" with no door | | | | | |
| Raw file strings | NOT, every size: "PROPELLER · Aluminium F Series", "Outboard Vented Cover · YAMAHA 4 CYL", "t/s", "w", "Ativation" (the file's typo), maker chips in supplier codes, "YAM" and "Yam" as two makers, "NB: Fuel Filter - Order w Rigging Kit" and "NB: No Rego Decals - NOT TO BE SUPPLIED" drawn as parts to buy, each with an *Add a picture* door | | | | | |
| Picture large (`09`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Sounders, the pictured aisle (`08`, `10-…-834x1112`) | PERFECT where pictured: one frame, contained, one scale. The three Navionics/Scanstrut doors lead the aisle in file order, before 21 photographs | same | same | same | same | same |
| Show the next (`06`, `07`) | NOT: the press grows the page by 24 cards with no position kept; the 447 aisle is 18 presses | same | same | same | same | same |
| Find a name (`11`, `13`) | NOT: results replace the aisles, but cards and doors as above; the longest name (156 chars) wraps whole to 156 px, PERFECT on the name, NOT on its door | same | same | same | same | same |
| Find a code (`12`) | NOT: refused, as J4; at 1280 the whole window empty under one 12 px sentence | same | same | same | same | same |
| Find nothing (`14`) | PERFECT sentence | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Unsorted (`15`) | NOT: parts that plainly belong elsewhere, with no act | same | same | same | same | same |
| Wrong aisle in the address (`16`) | NOT: silent | same | same | same | same | same |
| Picture refused (`23`) | NOT: the sentence grows its whole row by ~120 px; not announced | — | — | NOT: same | — | — |
| No file (`19`) | PERFECT | — | — | PERFECT | — | — |
| Keyboard focus (`18`) | PERFECT ring on the tiles and doors | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |

---

## 3. The level it has to be

This is what the best parts catalogue would give a Northside person that this screen does not. References are from the sweep already on disk (`docs/research/refs/choosing/`) plus the obvious bests: BCF and Whitworths (Australian chandleries), West Marine, RockAuto's parts tree, McMaster-Carr's dense pictured ledger, and Shopify's admin product list. Each item says whether the file honestly carries what it needs.

### Blockers

1. **The fitted price, and a figure that is never wrong.** The file declares two price levels for parts: `cash` (Sell, `parts.l`) and `fitted` (*Sell inc Install*, `parts.y`, with `parts.o` TTF hours and `parts.n` Install Type). A salesperson quotes fitted parts, and 1,882 of 2,238 differ. Every card should say both, labelled: "$83 supply · $91 fitted, 0.05 h". Where the file prices only fitted (101 parts: trailer adjustments, labour), the card says the fitted figure and that it is fitted only, never **$0**. The 282 parts marked *Supply Only – Installation Not…* say so. *File carries it: yes, all of it.* Cost columns (`P&A`, `CTD`, `MU`, `Total CTD`) stay off, as now.
2. **An aisle opens where the person is looking.** Pressing an aisle has to *show* the aisle. That could mean the grid giving way to the aisle as its own page, the aisle in a rail beside the parts, or the grid folding to one sticky row of aisles. A sticky head should always say which aisle and maker you are in. Today 3 of 6 sizes show nothing on the press. *No data needed.*
3. **A composition for a list that is 91 % unpictured.** McMaster-Carr and RockAuto show thousands of parts as dense, scannable rows with a small picture where one exists, grouped under the supplier's own headings. Polestar's three weights (`choosing/notes.md` §1) say a pictured choice gets a card and a small one gets a ruled line. Here 2,041 parts get a 4:3 dashed box that repeats their name twice. A *Pictured / All* switch and a ledger view (name, code, maker, supply, fitted, picture state) would let the salesperson show the 197 photographs and the admin work the 2,041 doors, without one making the other unreadable. *File carries it: yes.*
4. **The picture door's text must not be cut** (§2 table, at every size). Then the screen joins `e2e/routes.ts`, so the rulers measure it.

### Majors

5. **Find by code, maker and heading, not only by name.** Typing `SG002`, `lowrance` or `yamaha` should answer: 144 Lowrance lines, not 5. The file carries `Code` (`parts.e`), `Operation Code`, `Supplier` and the 180 headings, and the shell's finder already folds codes in (DECISIONS 2026-09-24). Keep "name first" as the ranking, not as a refusal. The code belongs on the card too, quietly, for the person who orders by it.
6. **Makers in words, one maker once.** `YAM` and `Yam` are one maker. `LOW` is Lowrance, `GAR` Garmin, `SIM` Simrad, `RAY` Raymarine. A Northside-kept table of supplier code → maker name (79 strings) would be a list in Data, set once, changed through a command with its inverse. Until a code is named it reads as the code, said to be one. *The file carries the codes, and the names are Northside's to give, so this is a setting, never a guess.*
7. **Sub-groups from the file's own headings inside an aisle**, each with its count: *Propellers – Yamaha 260*, *Yamaha service items 126* … Then a sort (file order, price, pictured first), and a page that keeps its place instead of 18 × *Show the next 24*. *File carries it: 180 headings.*
8. **A part opens its line.** Every card needs a door to its row in the sheet (`/data/parts?at=parts:N`), where its price is changed. A part with no price needs a door to Review or Prices, where it is fixed. This is the Data section's own promise: "open to read and change". *File carries it.*
9. **The boat chip that board B promised.** On `/catalogue` a boat can be chosen, and the chandlery then puts first the parts the price list pairs with it: the six P/D lists, 2,561 pairings over 75 parts, said as "Made for the Highfield Sport 560 · 7". A part's own card says which boats it is paired with ("On 412 Highfield boats as pre-delivery"). *File carries it.* Fitment's line stays the door for motors and trailers.
10. **Quote the part on its own** (the owner, 2026-10-30, overrules nothing in LATER). The card offers *Start a quote with it* where Parts & Accessories has Quote switched on. Where the place does not, it says so in a sentence, with the door to that place's Settings tab (`letQuote`). Today the screen is silent.
11. **Place the unsorted.** *Not sorted yet* (28) is the true state, but the admin has to be able to put a heading in an aisle, as a Northside setting with Undo. Today `aisleOf` is code, and only a developer can sort a fender into Anchoring. *Needs one setting per heading (tens), empty on day one, as LATER.md says of A's zones. This is smaller, and J11 needs it.*
12. **A picture worklist for the admin.** It would show "2,041 to picture" as a view, ordered by aisle and by how often a part is on a quote, with the count moving as pictures land, and a drop of many files at once matched by code in the file name. That last would be a measured match, never a guess: a picture lands only on the part whose code it names, and anything else is refused with a sentence. *File carries the codes. Quotes carry the frequency.*
13. **The file's notes are not parts.** "NB: Fuel Filter – Order w Rigging Kit" and "NB: No Rego Decals – NOT TO BE SUPPLIED" are workbook notes. They should read as notes beside their aisle, not as $0 products with a picture door. *File carries the "NB:" prefix (2 lines). Labour lines (33) are a second kind of thing and want their own heading.*

### Minors

14. The lede says 18 aisles over a heading of 19, and its second sentence talks about the code. The chip repeats 2,238.
15. *What fits a boat* uses the expand glyph for a navigation.
16. A wrong `?aisle=` is silent. It should say "There is no aisle called 'nope'." where the aisle would be.
17. The picture refusal grows the whole row, and it is not announced. It should stand in the door's frame and be read in a live region.
18. Product names keep the file's shorthand and capitals: `t/s`, `w`, `PROPELLER`, `YAMAHA 4 CYL`, and the typo `Ativation`. Saying them is the namer's job (`lineSaid`). Correcting the typo is Review's.

---

## 4. The verdict

**REDRAW.** It gets a new sweep and three drawn directions on real seed content. Keep: the eighteen aisles and *Not sorted yet* counted off the file (`aisles.ts`), the aisle and maker as search params, the one picture frame with contained pictures and the gallery, and the dealer's door with its refusal sentence. Redraw: how an aisle opens and stays named, what a part *is* on screen when 91 % have no picture, the two prices, and where finding by code, maker and boat lives. Directions worth drawing, each drawn at all six sizes with its reflow said:

- **(a) The aisle as a page.** The grid is the door; the aisle replaces it with the file's headings as sub-groups, a sticky head (aisle · maker · boat · *Pictured / All*), pictured parts as cards and the rest as ruled lines with both prices.
- **(b) The rail and the ledger.** The aisles are a rail at a desk and a sheet in a hand, beside a dense ledger in the McMaster-Carr or RockAuto manner: thumbnail where held, name, code, maker word, supply, fitted, picture state, one press to the line.
- **(c) Two rooms in one.** *Show* (the 197 photographs large, for the customer) and *Keep* (the worklist of 2,041 doors, for the admin) as a segmented control, with the same aisles in both.

The mammoth work beyond the redraw is §3: items 1–4 before the owner looks again, then 5–13.
