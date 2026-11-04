# Fit flow, round 1, walk 2: the owner walks it cold — 2026-11-05

I walked this as Asaf, read-only, against `vite preview` of the tree at `5acbf6f8` on port 6413, with the real Master Price File loaded through the door (`/sign-in`, a name, *Load the Master Price File*). I did the six tasks at 1440×900 and again at 390×844, then took screenshots of every screen of the journey at 844×390, 834×1112, 1280×800 and 1920×1080 and read them. The screenshots are in `walk-1-2/`. Their prefixes: `d` is the desk walk at 1440, `p` is the phone walk at 390, and `land`, `tab`, `lap` and `wide` are the other four sizes.

**Counting presses.** Each click, tap or key such as Enter, Escape or an arrow counts as one press. Typing a query counts as one press, however long the query is.

## First, the boat

The price file carries no **Stabicraft PA 600**. Typing "Stabicraft PA 600" into Home's Find returns "Nothing matches" (`d02`). The PA600 on the file is a **Highfield** Patrol 600, model `PA600`, 10 versions. The walk went on with that boat. Find does not say "the PA600 is Highfield's", so an owner who misremembers the maker ends up at a dead end.

## The tasks, counted

| # | Task | Presses at 1440 | What it took |
|---|---|---|---|
| 1 | What motors and trailers go on the "PA 600", and why some do not | **8** | Find (1), type "what fits PA 600" (1), *What fits the Highfield Patrol **600 EW*** (1). That opened the wrong model. Then *Another boat* (1), type (1), *Highfield Patrol 600* (1), *Trailer* (1), *Show all 434* (1). The motor reasons are on the page under the tiles. |
| 2 | Take the Yamaha F150 off, then put it back | **2 off + 2 back** (or 1 with Undo) | *Take it off* on the F150XC tile (1). The F150 lands in "15 Inside … and not made for it". *Show these 15* (1), *Put it on* (1). There are two F150s (F150XC, F150XCB), and I had to choose which one was meant. |
| 3 | Add a dealer-fit part from the price file | **6** | *Also made for it* (1), *Show all 1,576* (1), click search (1), type "EPIRB" (1), *Put it on* (1), *Back to the boat* (1). |
| 4 | Quote that boat for a customer with what fits | **5–6** | *Start the quote* (1), *Name the customer* (1), click the name field (1, because the dialog opens with focus on Close), type (1), *Put their name on it* (1). The EPIRB is not on the quote: *Add* on the build's Dealer fit chapter (1). |
| 5 | From the build, "why can't I pick this motor?" and get to where it is decided | **not possible** | *Show all 209 in Yamaha Outboards* (1). Any motor can be pressed onto the quote: a 90 hp (`d31`) and a 20″-shaft motor (`d33`) both went on without a stop. Nothing in the build links to Fitment or to the boat's line. I left through the nav: *Data* (1). |
| 6 | From Data, find what fits a Highfield Sport 560 | **4** | *Fitment* room (1), click search (1), type "Sport 560" (1), Enter (1). |

At 390×844 the counts were the same. On the phone, the start line and the motor tiles sit two to three screens below the plate.

## Confusions

### The door: Home's boats, and how a boat leads to what fits and to a quote

1. **Blocker — Home's boats only quote (every size).** "I press the boat on Home and it goes straight to New quote. Where is what goes on it?" Each Home tile is labelled "— quote it" and opens the picker. The maker logos under *What Northside Marine sells* also open the picker. The picker's side panel offers only *Start the quote*, with no door to what fits. Shots: `d00-home`, `d38-home-boat-tile-press`, `d39-home-maker-press`, `p00-home-full`, `tab-14-picker`. This is the owner's own ask of 2026-11-04.
2. **Major — Find's what-fits row names the wrong model (1440, 390).** "I typed PA 600 and it offered me what fits the Patrol 600 **EW**. The Patrol 600 itself is third and has no what-fits row." The *What fits …* row only ever follows the top hit, and the exact model ranks below EW and ST. Shots: `d01-home-search-pa600`, `d04-search-arrow-patrol600`, `d06-search-whatfits-pa600`, `p01-find-whatfits`.
3. **Major — "motors for PA 600" answers for 30 boats (1440).** "I asked about one boat; why does every motor say 'fits all 30'?" The query merges EW, ST and plain into one list. Each row opens the price list, not what fits. Shot: `d05-search-motors-for-pa600`.
4. **Minor — a wrong maker is a dead end (1440).** "Nothing matches 'Stabicraft PA 600'." The message does not say the PA600 is Highfield's. Shot: `d02-search-stabicraft-pa600`.
5. **Minor — Find speaks keyboard on a phone (390).** The dialog shows "Enter opens it." and an "Esc" chip on a touch screen. The action is labelled "OPEN FITMENT" in capitals, an engine word. Shot: `p01-find-whatfits`.

### Fitment: the /fitment screen and its popups

6. **Blocker — a trailer named for the boat is "not made for" it (every size).** The Trailer line says "none made for it · 0 of 434". *Show all* then lists **"GFAB Tandem Axel Trailer t/s Highfield Patrol 600"** under "Built for Highfield, but not made for the Patrol 600." The trailer's own name says it is for this boat, and the screen says it is not. No sentence says the price list's pairing list is what leaves it out. Shots: `d11-fitment-pa600-trailer`, `d12-trailer-showall`, `p10-trailer-showall`, `land-06-trailer-showall`.
7. **Major — "On the quote" before any quote exists (every size).** "What quote? I haven't started one." The recommended motor tile reads *On the quote*, and *Compare* heads it "ON THE QUOTE". It means the quote that *Start the quote* would make. After a real quote exists with a different motor (the F90XB), Fitment still says the F115XB is "on the quote". The same words mean two different things on two screens. Shots: `d07-fitment-pa600ew-full`, `d40-compare`, `wide-03-fitment-pa600`, `d37-fitment-sp560`.
8. **Major — a motor I took off is "not made for it" (1440).** After *Take it off*, the F150XC sits in "Inside the 115–150 hp this boat takes, and **not made for it**". It was made for it; Northside took it off. Nothing says "taken off by Northside". Shots: `d14-after-take-off`, `d16-show-these-15`.
9. **Major — the list moves under the pointer after Put it on (1440).** In "Show these 15", *Put it on* makes the F150XC row vanish, and the pointer then rests on the F150XCC's *Put it on*. A second press would put the wrong motor on. Shot: `d17-put-back-on`.
10. **Major — no "Add" for a part (1440, 390).** "Where do I add one?" *Also made for it* shows only *Take it off* on each line. Adding is behind "Show all 1,576", whose label reads as browsing. Shots: `d19-also-made-for-it-full`, `p11-also`.
11. **Major — Dealer Fit's Show all: names crushed beside two empty columns (834, 1440, 1920, 390).** "Its own figures" and "Price" are empty on every row. The names wrap to 4–5 lines at 834 and break mid-measure ("1.8 / m Aerial") at 1920, beside about 600 px of nothing. Shots: `tab-08-dealerfit-showall`, `d20b-dealerfit-showall`, `wide-08-dealerfit-showall`, `p13-dealerfit-showall`.
12. **Major — Undo's toast reads as the opposite (390).** "Undone. No longer so: The Yamaha F150XC is taken off …" At a glance, a person reads "is taken off". Shot: `p08-undo`.
13. **Major — the Another boat popover covers the nav at 844×390.** The popover rises over the floating nav and hides Customers and Data. Shot: `land-04-another-boat`.
14. **Minor — the title changes from what I chose (every size).** I chose "Highfield Patrol 600" and the heading reads "Highfield Patrol 600 **Open**". Shots: `d09-another-boat-patrol600`, `d10-fitment-pa600-top`.
15. **Minor — the nav lights "Data" on Fitment (every size).** I came from Home's Find, and the nav says I am in Data. Shots: `d07-fitment-pa600ew-top`, `p02-fitment-ew-top`.
16. **Minor — struck-through motor names in the reasons (every size).** "Nearest ~~Yamaha VF90XA-FO~~" reads as discontinued or deleted. Shot: `d07-fitment-pa600ew-full`.
17. **Minor — "Show these 1" (every size).** The label is ungrammatical. Shot: `d07-fitment-pa600ew-full`.
18. **Minor — "Version, of 10" and an unlabelled "2" on the picture (every size).** Neither says what it means. Shots: `d37-fitment-sp560`, `p27-fitment-sp560`.
19. **Minor — the trailer line says "built for Highfield" and not the trailer's name (1440).** Shot: `d37-fitment-sp560`.
20. **Minor — "On quotes here" (1440).** A small, unexplained label over the boats already on quotes. Shot: `d35-fitment-cold`.

### Elsewhere: the picker, the build page and Data

21. **Blocker — the build says "Nothing is wrong with it" for a motor that does not fit (1440, 390).** The build's *Show all 209* groups the 10 short-shaft motors, the tiller and the 47 twin rigs under "The price list does not list it for this boat. Nothing is wrong with it." Fitment says of the same motors that the shaft is not the 25″ this transom takes. A 20″ F115LB went onto the quote with no warning. Shots: `d33-build-sheet-f115lb`, `p22-build-sheet-f115lb`, `p23-build-sheet-f115lb-on`.
22. **Blocker — task 5 cannot be done: nothing is refused, and nothing links to where it is decided (every size).** A 90 hp went onto a boat rated 115–150 hp. The only sign is a 12 px grey caption: "Under the 115–150 hp this boat takes." Neither the build nor its motor sheet has a link to Fitment, the boat's line or Rules. The page's only link is "Choose its price". Shots: `d31-build-pick-under-range`, `d32-build-motor-chapter-f90`, `lap-10-build-motor`.
23. **Major — the empty customer name closes silently (1440, 390).** *Name the customer* opens with focus on Close, so typing goes nowhere. *Put their name on it* with an empty field closes the dialog with no sentence, and the customer stays unnamed. Shots: `d25-name-customer`, `d26-customer-named`, `p18-customer-dialog`, `p19-customer-empty-submit`.
24. **Major — a part put on in Fitment is not on the quote started from Fitment (1440).** "I put the EPIRB on that boat, then started the quote with what fits, and it isn't there." The quote carries only the boat, the motor and its kit, and the EPIRB has to be added again. Shots: `d24-after-start-quote`, `d27-build-dealerfit-chapter`, `d28-epirb-added`.
25. **Major — the motor sheet leaves one row of motors at 844×390.** The header, the sentence, the search and the total take about 300 of 390 px. Shot: `land-11-build-motor-sheet`.
26. **Minor — "changed" after I put it back (1440).** "New since 16 September" counts "Highfield × Yamaha — Motor Fitment 10 lines changed" after the F150XC was taken off and put back, a net change of nothing. Shot: `d34-data`.
27. **Minor — "Fitment" is an engine word in Data (every size).** The room is called Fitment; the owner's word is "what fits". Shots: `d34-data`, `p24-data`.
28. **Minor — Home's tiles fade in slowly (1920).** At 1.2 s the last tiles and logos are still blank. Shot: `wide-01-home`.

## Every size

Each of the 15 journey screens was taken and read at 844×390, 834×1112, 1280×800 and 1920×1080, in addition to the 1440 and 390 walks. Several faults show at particular sizes: the popover over the nav (844×390), one row in the build's motor sheet (844×390), crushed names in Dealer Fit (834 and every other size), and toasts over list rows on the phone (`p10`). Nothing scrolled sideways at any size; the page width equalled the viewport width each time.
