# Fit flow, round 2, walk 1: a first-week salesperson walks it cold — 2026-11-05

I walked this read-only against `vite preview` of the tree at `196c8765`, on port 6411, built into `e2e/out/dist-6411`. The real Master Price File was loaded through the door (`/sign-in`, a name, then *Load the Master Price File*), the same way `e2e/door.ts` does it. Each run used a fresh browser. I did the six tasks at 1440×900 and again at 390×844. Then I took screenshots of every screen of the journey at 844×390, 834×1112, 1280×800 and 1920×1080, and read each one.

The screenshots are in `walk-2-1/`. Their prefixes are `d` (the desk walk at 1440), `p` (the phone walk at 390), and `land`, `tab`, `lap` and `wide` for the other four sizes. The two `t-trailer-chip-*` files are measurement shots.

**Counting presses.** A click, a tap or a key counts as one press. Typing a query counts as one press, however long it is. Scrolling is not a press.

## The boat

The price file carries no **Stabicraft PA 600**. Home's search now says so and points the right way: "No Stabicraft is called "PA 600". The "PA 600" on the price list is Highfield's" (`d-02`, `p-02`). The plain **Patrol 600** is listed first, with its own *What fits* and *Quote it*. The picker does the same: "Highfield Inflatables has 3 that are", with *Show the 3 from Highfield Inflatables*, and what I typed is kept (`d-36`, `land-24`).

## The tasks, counted

| # | Task | 1440 | 390 | What it took |
|---|---|---|---|---|
| 1 | What motors and trailers go on the PA 600, and why some do not | **3** | **3** | Search box (1), type (1), *What fits* on Patrol 600 (1). The reasons are on the page under each list. Pressing the *Trailer* chip does nothing (see F1), so I scrolled. |
| 2 | Stop offering the Yamaha F150 on it, then put it back | **3 off + 3 back** | same | *Change what Northside offers* (1), *Take it off* on the F150XC (1), *Done* (1). Back: *Change what Northside offers* (1), *Put it back* (1), *Done* (1). Or *Undo it* (1) before *Done*. |
| 3 | Add a dealer-fit part that goes on it | **1** to tick one, or **4** to offer a named one | same | *Fit-out* lists 4 dealer-fit packages and 3 parts with *Add* ticks (1). Offering a "named for it" package takes *Change what Northside offers* (1), *Offer it on the Patrol 600* (1), *Done* (1) and the tick (1). |
| 4 | Quote that boat for a customer with what fits | **5** | **5** | *Start the quote* (1), *Name the customer* (1), tap the name field (1, because focus opens on Close), type (1), *Put their name on it* (1). The ticked package and the offered package both arrived on the quote. |
| 5 | From the build, "why can't I pick this motor?" and get to where it is decided | **not possible** | **not possible** | *Show all 209* (1), click the search (1), type F115LB (1), press it (1). The 20″-shaft motor went on with no stop. The build has no link to What fits or to where it is decided. |
| 6 | From Data, find what fits a Highfield Sport 560 | **5** | **5** | *Data* (1), *Fitment* (1), search (1), type (1), the result (1). |

## Checked again from the last walks

**Fixed**, seen with my own eyes:
- Home's boat cards have *What fits* and *Quote it* (`d-00`, `p-00`, `tab-02`, `land-02`).
- Search ranks the plain Patrol 600 first, with its own what-fits button (`d-02`, `tab-03`).
- The picker no longer wipes what I typed, and it names Highfield's PA 600 (`d-36`).
- The nav lights *Home* when I come from Home and *Data* when I come from Data (`d-03`, `d-32`).
- A motor taken off is filed as "Northside took it off this boat", and the footer counts it (`d-09`, `d-10`).
- "On the quote" before a quote exists is now "Chosen for the quote", with "The quote this starts" in the bar (`d-03`).
- *Take it off* now lives only in a change mode and is no longer next to the motor choice (`d-03`, `d-06`).
- The trailer named for the boat is now explained under "Named for it, not listed for it", with a way to offer it (`d-04`).
- A part put on in What fits arrives on the quote (`d-19`, `p-23`).
- The phone shows *Start the quote* at once (`p-03`). The tablet tables are gone (`tab-08`).

**Still there:**
- The build's motor sheet still says a 20″ motor has "Nothing wrong with it", and task 5 still has no link (E1, E2).
- The customer dialog still opens with focus on Close, and is now worse (E3).
- The Undo sentence still reads as its opposite (F5).
- Data still counts "10 lines changed" after a change that nets to nothing (E9).

## Confusions

### The door: Home's boats, and how a boat leads to what fits and to a quote

1. **Major. A second *Start the quote* opens the old draft (1440).** "The bar said Patrol 600 with the F115XB, $47,059, Start the quote. I pressed it and got the earlier quote, with the F130XA." The earlier draft for the same boat had no customer named, so it was reopened instead of a new quote being made. What I chose on What fits was ignored. Shots: `d-40-fitment-second-visit`, `d-41-second-start-quote`. With a customer named on the first draft, a new quote, -02, was made (`d-42`).
2. **Minor. The maker logos and *Quote it* only quote (every size).** "I pressed Stabicraft under What Northside Marine sells and landed on New quote. The side panel only has Start the quote." The picker never offers what fits. Shots: `d-34-home-card-quoteit`, `d-35-home-maker-stabicraft`.

### Fitment: the /fitment screen and its popups

3. **Major. The Motor / Trailer / Fit-out chips do nothing (every size).** "I pressed Trailer and nothing happened." The address gains `?at=trailer`, but the page stays at the top. I measured `scrollY` at 0 before and after, with the trailer section at 1,538 px, with and without reduced motion. Shots: `t-trailer-chip-1440`, `t-trailer-chip-390`, `p-05-trailer-chip`.
4. **Major. Every choice throws me back to the top (every size).** "I ticked the VHF radio and the page jumped up to the boat's photo. Same when I chose the F130XA." I measured a tick at scrollY 1,636 → 0, and a motor choice at 434 → 0. On the phone I lose the fit-out list after every tick. Shots: `d-14-fitout-vhf-ticked`, `d-16-after-choose-f130`, `p-17-after-tick`.
5. **Major. *Change what Northside offers* drops me at the photo (390, 844×390, and everywhere).** The button sits at the foot of the page. Pressing it jumps from 2,231 to 0. On the phone, the "Changing what Northside offers" banner is under the dark bar, so I see the boat and "No change made here yet", and the motors are two screens down. Shots: `p-08-change-mode`, `land-10-change-top`, `d-05-change-offers`.
6. **Major. The "named for it" packages are codes I can't read (every size).** "Which of these 40 'Patrol · PA600 OB PVC · LG-W-DG' do I want? No description, no price." LG-W-DG is the tube colour (the build calls it Light Grey / White / Dark Grey), but nothing on What fits says so. It let me offer and quote the light-grey package on a Black / Black / Black boat. Shots: `d-15-change-fitout`, `lap-12-change-fitout`, `d-19-after-start-quote`.
7. **Major. Undo still reads as its opposite (390).** "Undone. No longer so: The Yamaha F150XC is taken off…" At a glance, I read "is taken off". Shot: `p-11-after-undo`.
8. **Major. On a sideways phone, one card fits on the screen (844×390).** The nav and the quote bar leave about 240 px, which is one motor card at a time. In change mode the bar drops its sentence and shows only "1 change made here", so I can't see what changed without finding the card. Shots: `land-05-fitment-motor`, `land-07-fitment-trailer`, `land-11-change-takeoff`.
9. **Minor. "2 changes made here" after nothing changed (every size).** I took the F150XC off and put it back, and the bar counts 2 changes. Shot: `d-11-put-back`.
10. **Minor. Two F150s (every size).** "The customer said F150. The F150XC and F150XCB both go on it. I took one off and the other is still offered." Shot: `d-06-change-motors-f150`.
11. **Minor. *Another boat* opens the whole app's Find (every size).** I wanted a boat and got "Back to Home" and "Go: Home, Settings, Quotes, Rules…". Shots: `tab-13-another-boat`, `land-13-another-boat`.
12. **Minor. "version 9 of 10" with nothing saying why (every size).** The Patrol 600 opens on its 9th version, while the Sport 560 opens on its 1st. Shots: `d-03`, `d-32`.
13. **Minor. "Its series names no boat maker: not ruled out, and the price list does not list it" (every size).** It is unclear whether that is a yes or a no. Shot: `d-09-why-after-takeoff`.

### Elsewhere: the picker, the build page and Data

14. **Blocker. The build says "Nothing is wrong with it" for a motor that doesn't fit (every size).** The 20″-shaft F115LB is filed under "The price list does not list it for this boat. Nothing is wrong with it." What fits says the same motor's shaft is not the 25″ this transom takes. It went on the quote at −$202 with no warning, and the motor chapter shows it as "on the quote". Shots: `d-26-build-sheet-f115lb`, `d-27-build-sheet-f115lb-pressed`, `d-28-build-motor-f115lb-on`, `p-22-build-sheet-f115lb`.
15. **Blocker. Task 5 can't be done (every size).** "Why can't I pick this motor?" Nothing on the build refuses a motor, and nothing links to What fits, to the boat's line or to Rules. The page's only links are *Choose its price*, twice. Shot: `d-28-build-motor-f115lb-on`.
16. **Major. Typing my customer's name closes the dialog (1440, 390).** *Name the customer* opens with focus on Close. I typed "R. Kelleher", the space pressed Close, and the dialog vanished with nothing saved. Shots: `d-21-name-customer`, `d-22-customer-typed`, `p-19-customer-dialog`.
17. **Major. Search can't find the Patrol 600 trailer by its own name (every size).** In the build's *Show all 32 in GFAB Trailers*, "Patrol" and "Patrol 600" both say "Nothing in GFAB Trailers is called that." The list holds "GFAB Tandem Axel Trailer t/s Highfield Patrol 600", which only "PA600" finds. Shots: `d-37-build-gfab-Patrol`, `d-37-build-gfab-PA600`.
18. **Major. The trailer chapter contradicts its own list (every size).** The chapter says "Nothing from GFAB Trailers or NSM Custom Trailers is made for this boat." Inside, the Patrol 600 trailer is "Nothing is wrong with it" with *Add*, and What fits calls it "named for it". Shots: `land-17-build-trailer`, `d-37-build-gfab-PA600`, `d-04`.
19. **Major. A rigging-kit warning contradicts What fits (every size).** What fits offered the F130XA "with its rigging kit". The build's hull chapter then says "The Rigging kit for the F130XA stays on this quote, though the price list does not offer it with this boat. Dealer fit says why, with the way off." Shots: `d-19-after-start-quote`, `d-39-build-rigkit-note-f130`.
20. **Major. The Dealer fit header is clipped on the phone (390).** "…deaway with 1.8 m Aerial and / other / 8 more offered" is cut on the left edge. I measured `cfg-head__heard` with scrollWidth 3 against clientWidth 1. Shots: `p-23b-dealerfit-heading`, `p-23-build-dealerfit`.
21. **Major. Three motors pictured for one (every size).** The single Yamaha F150XC and F150XCB show a photo of a triple rig in the build's motor sheet. Shots: `tab-16-build-motor-sheet`, `wide-16-build-motor-sheet`.
22. **Minor. "10 lines changed" after putting it back (every size).** Data's *New since* counts "Highfield × Yamaha — Motor Fitment 10" after the F150XC was taken off and put back. Shot: `d-38-data-after-putback`.
23. **Minor. Data says no boat takes REDCO trailers (every size).** Data says "REDCO / Tinka Trailers 52. No boat on the price list is fitted with them." What fits recommends "REDCO Custom / Highfield Sport 560" and "REDCO Stabicraft" trailers. Shots: `d-29-data`, `d-32b-fitment-sp560-full`, `d-33-home-card-whatfits`.
24. **Minor. "Fitment" in Data, "What fits" everywhere else (every size).** The room's card says Fitment, and the page it opens has no way back to Data until a boat is chosen. Shots: `d-29-data`, `d-30-fitment-cold`.
25. **Minor. The search result is below the fold on a sideways phone (844×390).** "I typed Sport 560 and nothing happened." The answer sits under the seven maker tiles. Shot: `land-21-fitment-search`.
26. **Minor. "Patrol 600 Open" on the build (every size).** I chose "Highfield Patrol 600" and the build is titled "Highfield Patrol 600 Open". Shots: `d-19`, `land-14-build-top`.
