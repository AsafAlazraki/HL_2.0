# Fitment, judged — data round, 2026-11-03

A fresh judge who had never seen the screen. Served from its own build (`e2e/out/dist-6210`, `vite preview --port 6210`), reached through the real door with the real Master Price File (the `throughTheDoor` walk), in a fresh browser context at each of the six sizes. Every screenshot named below is in `before/` with its size in the file name (`-390x844`, `-844x390`, `-834x1112`, `-1280x800`, `-1440x900`, `-1920x1080`). Measured at every size and state: sideways scroll, text cut by its own box, controls under 24 px, text under 12 px, page errors. The server was stopped before this was written.

**Verdict: DEEPEN.** The plate (one boat, three pressable lines, then the answer and one gauge per reason) is the right shape for "what goes on this boat", and it holds at six sizes with no sideways scroll, no cut text and no page error. What is missing is most of what a salesperson and the admin actually need from it. The owner called it "a decent start, not at the level it has to be", and the measurements agree: the screen answers *which codes are paired*, but not *what does that rig cost*, *what is this boat*, or *how do I start the sale*. Its main editing act also changes 1 of the 16 versions while its sentence names the whole model. The mammoth work is listed below.

---

## 1. The jobs, and each one done

| # | Who | Job | Done on the screen | Result |
|---|---|---|---|---|
| J1 | Salesperson, customer at the desk | "I want an SP660. What motors go on it, and what do they cost?" | `/fitment` → Highfield → Sport 660 → a version (`01-cold`, `10-cold-highfield`, `11-cold-model`), or type `660` (`12-cold-search`) | **Half done.** 7 motor tiles show each code, its horsepower and its Cash price (`02-sp660-motor-*`). The tile gives no motor name past the code (F175XC: no "4-stroke, 25″ shaft, remote"; those facts are only on Show all's rows). It gives no **rigging kit**: every SP660 pairing names one (`join_hf_yam.rig`, e.g. `rig_kits:186`, *Mech Rigging Kit – 703 Side Mount…*, Sell Price $4,040), along with the prop and engine hole, and the screen shows none of the three. The price a customer pays for "this motor on this boat" is not on the screen. |
| J2 | Salesperson | "Which of these seven should I recommend, side by side?" | Tiles only (`02-sp660-motor-1440x900`) | **Not possible.** No compare: weight, shaft, controls, the rigging kit and the price are not set against each other. Weight and shaft appear only on Show all's rows (`05-sp660-all-motor`). |
| J3 | Salesperson | "Which trailer, and will it tow legally?" | Trailer line (`03-sp660-trailer-full-*`) | **Done well.** Each ATM is weighed against boat + motor + the trailer's own tare from the file. The GFAB tandem is "750 kg over it" with a door to its line. This is the best part of the screen. |
| J4 | Salesperson | "Good, start the quote with this boat, this motor and this trailer." | — | **Not possible.** Fitment has no act that starts a quote, and no act that carries a chosen motor or trailer into the build. The person goes back to Home → the picker → the same boat → the same choice again. |
| J5 | Salesperson | "What is this boat? Length, people, load, fuel." | Plate (`02-*`) | **Not shown.** The SP660's row carries OA Length 6.52, Beam 2.59, Max People 13, Max Load 1,287 kg, Fuel 140 ltr, Shaft XL, Remote. The plate shows the horsepower range and nothing else. |
| J6 | Salesperson | "Why can't I put the F150LC on it?" | Reason "30 Inside the 150–200 hp this boat takes, and not made for it" (`02-sp660-motor-1440x900`) | **Answered with no reason.** Of those 30, 10 have a 20″ shaft and the boat's row says XL. The file carries that reason (boat `Shaft Lgth`, motor `Shaft Length`), and the screen folds it into "not made for it". |
| J7 | Admin | "Take the F200XCC off the Sport 660." | "Take it off" on its tile (`17-taken-off-*`) | **Wrong scope.** The toast reads *"The Yamaha F200XCC is taken off what goes on the Highfield Sport 660."* Measured after: HBS147, HBS149 and HBS146 (three other Sport 660 versions) still show the F200XCC tile. The change hit 1 of 16 versions. Measured across Highfield, **66 of 67 models have identical motor sets on every version**, so the version is the wrong unit both for this edit and for the chooser's third step. |
| J8 | Admin | "Add a motor to this boat." | Show these 74 → Put it on (`15-show-these-74`, `16-put-on-refused-*`) | **Done, but unguarded below the range.** The first Put it on (Yamaha F2.5SMHB, 2.5 hp, on a 150–200 hp boat) went through. Only *over* the range is refused (`change.ts`). The tile then says "Under the 150–200 hp this boat takes." and the band draws its dot **at the 150 end of the band**, inside the range, as though it fitted (`17-taken-off-1440x900`, the dot at the band's left edge). |
| J9 | Admin | "Make the F200XC the recommended motor." | — | **Not possible.** The star is read-only here, and nothing on the screen says where it is changed. |
| J10 | Admin | "Why is this one excluded? Open the price list line." | Reason doors "Open its horsepower / Open what fits it / Open its series" | **Done.** The doors open the deciding line, and one Back returns (spec-asserted). Wording is poor: "Open its horsepower" opens the boat's row. |
| J11 | Admin | "What fit-out packages go on this boat, at what price?" | Also made for it (`04-sp660-also-full-*`) | **Silent fault.** The four Dealer Fit Packages show **no price and no sentence**. The line holds sell figures (the Tube Covers row: `dealer_fit.r` 1,684), and the build says the price is *not chosen on Prices* (`unchosen.ts`). Fitment says nothing and offers no door to Prices. Nor does this line give reasons or "the other n, and why" as Motor and Trailer do. |
| J12 | Either | Find any boat fast, by code | `HBS145` in the search (s3 log: "1 boat carries those words") | **Done.** The plate is ready in 604 ms after navigation and Show all in 162 ms at 1280. Searching `660` returns 36 colourways with "the first 12 are here" and no way to see the rest. |
| J13 | Either | A boat with nothing, a boat not on the list | Classic 340 trailer (`19-cl340-trailer-*`), `?boat=nothing:1` (`25-missing-*`) | **Mostly honest.** "That boat is not on the price list. Choose another." The Classic 340's Trailer line still says **"built for Highfield"** above "0 of 434 offered" and "No trailer on the price list is made for the Highfield Classic 340." |

What `docs/LATER.md` defers: the boat as a map of parts (direction A of `choosing.md`). The owner's words do not reach that far, and the jobs above do not need it, so it is not listed.

---

## 2. The perfect bar, at six sizes

The measured rulers came back clean everywhere: **0 px sideways** in every state at every size, **0 text cut** by its box, **0 controls under 24 px**, **0 page errors**. The only text under 12 px is the 11 px tracked capitals (eyebrow, line words, "The other 202, and why", "On a new quote"), which follow the design and are legible. What is not perfect is by eye, measured:

| State | 390×844 | 844×390 | 834×1112 | 1280×800 | 1440×900 | 1920×1080 |
|---|---|---|---|---|---|---|
| Cold chooser (`01`) | NOT: Surtees sits alone on a third row of the 3-up marks (7 makers) | NOT: the plate's three explainer lines push the makers' models below the fold | PERFECT | PERFECT | PERFECT | PERFECT (wide margins are the frame) |
| Maker opened (`10`, `11`) | NOT: 67 models land under the plate and its three idle explainer lines. One identical generic glyph per model, flat A–Z, no series heads (Classic / Patrol / Sport / Roll Up / Ultralite) | same | same | same | NOT: the list starts at y 657 of 900, below an explainer nobody needs once a maker is pressed | same |
| Plate + Motor (`02`) | NOT: the plate is 650 px tall and the first motor tile sits under the bar at rest; "prices at / Cash" orphans a word; "Dealer Fit Packages 4 · Parts & / Accessories 3" breaks mid-name | NOT: "ALSO MADE FOR / IT" wraps; the 4th reason (47) sits alone on its row; tiles 5 + 2 | NOT: "ALSO MADE FOR / IT" wraps; the 200 hp dot stack ends 12 px from "7 of 209" | PERFECT apart from the band (below) | NOT: the band has no 150 / 200 marks, so its dots cannot be read as horsepower; "Open its horsepower" ×3 | as 1440 |
| Trailer (`03`) | PERFECT reading order | NOT: the two trailer tiles differ in height (the GFAB carries the rule box) | NOT: tiles 722 vs 802 px tall | NOT: same | NOT: tiles end at 680 and 775 | NOT: same |
| Also (`04`) | NOT: no price on 4 packages and no sentence why | same | same | same | same | same |
| Show all (`05`, `06`) | PERFECT per row (facts under the name) | page 8,489 px with no way to fold a group | 8,495 px | NOT: the list leaves the plate's 1,120 px frame for 1,360 px, no column heads, prices only on the 7 offered | same | same |
| Show these → Put it on (`15`, `16`) | NOT: the line leaves the group and the screen shows nowhere it went; only the toast says it | same | same | same | same | same |
| Take it off (`17`) | PERFECT layout; NOT the scope (J7) | same | same | same | NOT: the 2.5 hp dot drawn inside the 150–200 band | same |
| Another boat popover (`14`) | PERFECT fit | PERFECT | PERFECT | PERFECT | NOT: one identical generic glyph per maker where the cold plate shows their marks; no "other versions / neighbours of this boat" | same |
| Longest name (`20` Stabicraft 2350 Ultra Centrecab, `21` Haines, `22` Stacer 589) | PERFECT wrap of the name. NOT: the picture is letterboxed with white bands on both sides | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |
| Stabicraft 2350 content (`20`) | **NOT, any size:** the plate says "225–350 hp **one motor**", 2 of the 11 offered tiles are twin rigs (F150XSA + LF150XSA, F150XSA2 + LF150XSA2), and the reason below says "47 twin and triple rigs. This boat's own figures name one motor, so they are not placed on it." The screen contradicts itself |  |  |  |  |  |
| Classic 340 (`19`) | NOT: "built for Highfield" with 0 offered | same | NOT: the ring for 20 hp stands 12 px from "one motor" | same | same | same |
| Missing boat (`25`) | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT | PERFECT |

Raw-file strings still on the surface: "ALLOY CENTRE-LINE SERIES", "(OBSOLETE Trailers — No Longer Available)", "T-Alloy 1098 ATM S 13″ Skid Braked – 4.1 m – 4.5 m" struck through (`03-*`). These are the price list's capitals and codes, struck or quoted where a sentence should stand.

---

## 3. The level it has to be

What the best tool for this job gives this person and this screen does not. Each item says whether the price file carries what it needs.

**Blockers**

1. **Fitment is a model's, not a colourway's.** Edits and reading are scoped to one version, so taking a motor off "the Sport 660" changes 1 of 16 (measured), and the chooser asks a third question (15 colourways) whose answer changes the motor set on 1 of 67 Highfield models (measured). The best tool answers per model, says the one exception where versions differ, and applies an edit to every version with a count ("taken off all 16 Sport 660s"). *File carries it:* yes, the hierarchy `series · model · variant` and the pairings per row. Northside needs it because an admin who believes he removed a motor has not, and the build keeps offering it on 15 colourways.
2. **The rig, priced.** Each motor tile shows the motor alone. Every pairing names its rigging kit (with its Sell Price), its prop and its engine hole. The best tool shows "F175XC $25,355 + rigging kit $4,040 = $29,395 on this boat" and names the prop. *File carries it:* yes, `join_hf_yam.rig` → `rig_kits` Sell Price, `prop`, `propd` and `hole` ("TBA" said as not yet known, never a figure). Without it the salesperson at the desk quotes a figure $4,000 short.
3. **From the answer into the sale.** There is no act that starts a quote with this boat, or with this boat plus the chosen motor and trailer. The best tool ends the answer with "Start a quote with the F200XC and the REDCO", which goes into the build already holding those choices. *File carries it:* nothing new is needed; the mint already exists (`mintQuoteFromView`). This is the owner's end goal ("a full quote with a customer at the desk"), and Fitment is the screen the owner named first.

**Majors**

4. **Compare what fits.** The 7 offered motors set side by side as columns: hp, weight, shaft, controls, starting, tilt & trim, colour, rigging kit, rig price, with the recommended first. Direction D of the sweep proposed exactly this, and it was never built. *File carries it:* yes, every one of those is a `mot_yamaha` column or a pairing cell, and a dash stands where a cell is empty.
5. **The boat's own facts on its plate.** Length, beam, people, max load, fuel, shaft, steering, registration band: a spec strip like Boston Whaler's (`live2/bw-21mtk-scrolled.png`). *File carries it:* yes (OA Length 6.52, Max People 13, Max Load 1,287 kg, Fuel 140 ltr, Shaft XL, Remote on the SP660).
6. **Reasons the file can give, given.** "Inside the range, and not made for it" (30 on the SP660) splits by what the file says: a 20″ shaft against an XL boat (10 of 30), a tiller motor against a remote boat. The remainder stays "not made for it". *File carries it:* yes, boat `Shaft Lgth` and `Eng Configuration`, motor `Shaft Length` and `Control`.
7. **One plate that does not contradict itself.** "One motor" and "twin rigs are not placed" must not stand above two offered twin rigs (Stabicraft 2350). Either the twin rigs the pairing list makes are said as such ("2 twin rigs made for it"), or the line stops saying "one motor".
8. **A guard below the range.** "Put it on" a 2.5 hp on a 150–200 hp boat should be refused with its sentence, or asked once ("as an auxiliary?"). The band must draw an out-of-range motor outside the band, never on its edge.
9. **Also made for it, at the depth of Motor and Trailer.** Prices, or the sentence "Its price is not chosen; Prices" with its door, and "the other n, and why" for packages and parts. The four package lines are bare today. *File carries it:* yes (the sell figures, and the `unchosen` reading the build already uses).
10. **The recommended, set here.** "Make it the recommended" on a tile, with Undo, for every version of the model. *File carries it:* yes (`__recommended` on the pair).
11. **Show all at the plate's width and depth.** Column heads (motor · hp · weight · shaft · price · act), groups that fold with their counts, prices on every line that has one, and a moved line said where it lands. Today it is a 6,480 px page that leaves the frame.
12. **The chooser grouped as Northside sells.** A maker's models under their series heads (Classic, Patrol, Sport, Roll Up, Ultralite), each with its own picture where the image ledger holds one. After a model is pressed, the plate's three explainer lines go. Search results grouped by model ("Sport 660 · 16 versions"), not 36 colourways capped at 12.

**Minors**

13. The band carries its two figures (150, 200) at its ends; the 200 hp dot stack keeps clear of the count at 834 and 844.
14. Trailer tiles stand at one height, with the one-trailer box below both.
15. Door words: "Open its horsepower" → "Open the boat's line"; "Open what fits it" → "Open its pairings".
16. "built for Highfield" only where a trailer is; otherwise the line says "none made for it".
17. "ALSO MADE FOR IT" holds one line at 834 and 844; the 4th reason does not orphan at 844; Surtees does not orphan at 390.
18. The file's capitals ("ALLOY CENTRE-LINE SERIES", "OBSOLETE Trailers — No Longer Available") are said through the namer, as other rounds did.
19. Letterboxed renders (Stabicraft 2350, Formosa GRT 425) sit on the plate's own ground, not white bands.

---

## 4. Verdict

**Deepen.** Keep the composition. The riveted plate of one boat, whose lines are the controls, then the answer and a gauge per reason, is right for the job and holds at every size. The trailer answer is world-class already. What stands is not enough, and the work is large:

1. Fitment by **model**, with edits applied to every version and counted (blocker 1).
2. The **rig priced**: motor + rigging kit + prop, from the pairing (blocker 2).
3. **Start the quote** from the answer, holding the choices (blocker 3).
4. A **compare** of what fits (major 4), the **boat's facts** (major 5), **reasons by shaft and steering** (major 6).
5. The **twin-rig contradiction**, the **below-range guard** and the band (majors 7–8).
6. **Also made for it** priced and reasoned (major 9), **set the recommended** (major 10).
7. **Show all** and the **chooser** brought up to the plate's standard (majors 11–12), then the minors.

Nothing above needs a figure the price file does not carry. Fuel weight on the tow line stays honestly left out, because the file carries litres, not kilograms.
