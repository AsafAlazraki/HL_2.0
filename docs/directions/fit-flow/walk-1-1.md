# Fit flow, cold walk, round 1, walker 1

Walked 2026-11-05 against a fresh build served on port 6411 (`e2e/out/dist-6411`), the real price file loaded through the door the way `e2e/door.ts` does (a name, then *Load the Master Price File*). The walker played a salesperson in their first week: knows boats, has never seen the app, presses only what is on screen. Tasks done in full at 1440x900 and 390x844; every screen of the journey then shot and read at 844x390, 834x1112, 1280x800 and 1920x1080. Screenshots: `walk-1-1/` (`d-` desk 1440, `p-` phone 390, `pl-` 844x390, `tab-` 834x1112, `lap-` 1280x800, `wide-` 1920x1080). No size scrolls sideways (scrollWidth equal to the viewport on every screen measured).

What the walk changed in its own browser profiles only: Yamaha F150XC taken off and put back on the Highfield Patrol 600; dealer-fit package *Patrol · PA600 OB PVC · LG-W-DG* put on the Patrol 600; two draft quotes for a typed name "Walk Test" (desk) and none named (phone). Nothing was written to the repository.

## Presses, measured

| Task | Desk 1440 | Phone 390 | How |
|---|---|---|---|
| 1. What goes on a "Stabicraft PA 600", and why not | 7 presses + 2 typings, after a dead end of 4 presses + 2 typings through the Stabicraft tile | 7 + 2 | Home search, *What fits the Highfield Patrol 600 EW* (wrong model, the only "what fits" row), *Another boat*, search, *Highfield Patrol 600*, *Trailer*, *Show all 434* |
| 2. Take the F150 off, put it back | 5 | 5 + 1 scroll hunt | *Back to the boat*, *Motor*, *Take it off* (scroll), *Show these 15*, *Put it on* |
| 3. Add a dealer-fit part | 4 + 1 typing | 4 + 1 | *Also made for it*, *Show all 1,576*, search, *Put it on* |
| 4. Quote that boat for a customer | 3 + 1 typing (*Back to the boat*, *Start the quote*, *Name the customer* + name + *Put their name on it*) | 2 + scroll to find *Start the quote* | — |
| 5. From the build page, why can't I pick this motor, and where is that decided | not reachable: nothing on the build page refuses a motor and nothing links to Fitment; via the nav 4 presses + 1 typing (*Data*, *Fitment*, search, boat) | same | — |
| 6. From Data, what fits a Highfield Sport 560 | 5 presses + 1 typing (*Data*, search, *Highfield* card, *Choose its model on Fitment*, *Sport 560*); the typed name is lost on the way | 5 + 1 | — |

## Blockers

1. **A trailer named for the boat is listed as not made for it.** Fitment, Trailers for the Highfield Patrol 600: the first row under "Built for Highfield, but not made for the Patrol 600." is *GFAB Tandem Axel Trailer t/s Highfield Patrol 600*. The boat page says "No trailer on the price list is made for the Highfield Patrol 600 Open"; the build page says "Nothing from GFAB Trailers or NSM Custom Trailers is made for this boat." The person reads it as the app being wrong. The same thing happens with dealer-fit: 40 packages titled *Patrol · PA600 …* are "Not made for this boat." Every size. `d-14`, `d-13`, `d-22`, `p-07`, `tab-05`, `lap-05`, `pl-05`.
2. **The build page and Fitment give opposite reasons for the same motor.** Fitment: Yamaha F115LB "its shaft is not the extra-long (25″) this boat's transom takes"; F115XB · Tiller "a tiller motor, and this boat is steered from its helm"; twin rigs "not placed on it". The build page's *Show all 209* files the same motors under "The price list does not list it for this boat. Nothing is wrong with it." `d-33`, `d-12-…-full`, `p-21`, `tab-15`, `wide-15`.
3. **Nothing stops a motor the boat cannot take, so "why can't I pick it" has no answer.** On the build page a 90 hp F90XB went onto a quote for a boat rated 115–150 hp with one press, no sentence and no warning; a twin F115XB + LF115XB went on the same way. There is no refusal to ask about and no link from the quote to where fit is decided. `d-30`, `d-32`.
4. **Home's boats do not lead to what fits.** Every *Start from the boat* card says "quote it" and opens the picker with the model chosen (`d-41`); the picker's panel offers only *Start the quote*. The only way from Home to Fitment is to type a name in the search and take the "What fits …" row. `d-01`, `d-40`, `d-41`, `p-01`.

## Majors

- **The "What fits" row in Home's search belongs to the first hit, not the boat you mean.** Typing "PA 600", or the exact name "Patrol 600", ranks *Patrol 600 EW* first and offers only "What fits the Highfield Patrol 600 EW"; the plain *Patrol 600* sits third with no "what fits" row, and highlighting it does not move the row. The *Another boat* search ranks the same words correctly. `d-06`, `d-07`, `d-08`, `p-02`, `tab-02`, `pl-02`.
- **"Take it off" sits beside "Quote this one" at the same weight.** The first changes what Northside offers on all 10 versions of the boat, with no confirmation; the second is a quote choice. A salesperson takes it for "take it off my quote". `d-12-…-full`, `d-15`, `p-09`, `tab-06`.
- **A motor you took off is filed as "not made for it".** After *Take it off*, the F150XC moves into "Inside the 115–150 hp this boat takes, and not made for it" (14 becomes 15) among motors that never fitted, with nothing marking it as the one you removed. Finding it again takes guessing. `d-16`, `d-18`, `p-11`.
- **The footer says no rule is on just after you changed the boat.** "None of your rules is switched on, so the price list alone decides what goes on this boat." still shows after the take-off. `d-16`.
- **"On the quote" before any quote exists.** The recommended motor's card says *On the quote* (meaning the suggested quote in the panel above) while Quotes shows 0. `d-09`, `d-12`.
- **Adding a dealer-fit part has no "add" control.** The section shows only *Take it off* and "The other 1,572 are not made for this boat. Show all 1,576"; the way in is a list that says "Not made for this boat" on every row, coded like *PA600 OB PVC · LG-W-DG*, with no price and no figures. `d-20`, `d-22`, `p-15`, `tab-09`.
- **The dealer-fit part you just added is not in "A quote with" and not on the started quote.** It shows on the build page only as an option, "not on the quote". `d-24`, `d-25`.
- **Pressing a row on the boat card shows nothing on a phone.** *Trailer* and *Also made for it* open their section below the dark card, off screen at 390x844; only a chevron changes. `p-06`, `p-13`. At 844x390 the rows themselves are below the fold (`pl-03`).
- **On a phone *Start the quote* is far down the page.** At 390x844 it comes after the specs and three rows; the person scrolled to find it. `p-05`, `p-17`.
- **Data's search does not offer the boat.** "Sport 560" returns line counts in three lists, including "Stabicraft × NSM Custom — Trailer Fitment" and a *Stabicraft* card, but no "what fits the Highfield Sport 560". The way through is a small *Choose its model on Fitment* link under the Highfield card, and the typed name is dropped on arrival (the maker grid opens, not the boat). `d-35`, `d-36`, `d-37`, `p-23`, `p-24`, `tab-18`.
- **The nav says "Data" on Fitment.** Arriving from Home, the highlighted tab is Data, so the person does not know where they are. Every size.
- **"Stabicraft PA 600" fails without a hint.** The picker filtered to Stabicraft says "No model from Stabicraft is called that." and does not say that Highfield has a Patrol 600 (PA600); pressing *All makers* then clears what was typed. `d-03`, `d-04`.
- **The list tables crush the name at tablet and phone-landscape widths.** At 834x1112 trailer names wrap to 3–5 lines while the empty figures and price columns hold the space; at 844x390 about three rows show above the fold. `tab-05`, `tab-09`, `pl-05`, `pl-09`.

## Minors

- The model is called *Highfield Patrol 600* in search and lists and *Highfield Patrol 600 Open* as the title. `d-11`, `d-12`.
- In "The other 204, and why", the model names after "Nearest" and "Such as" are struck through, which reads as "discontinued". `d-12-…-full`, `tab-06`, `pl-06`.
- The motor range on the boat card is drawn like a slider, with handles that do not move. Every size.
- Phrases a salesperson cannot read: "Open the boat's line", "WEIGHED, OR ITS SERIES", "ITS OWN FIGURES", "Price not chosen", "which of the rigging kits' figures is their price", and "15 of 209" (shown) next to "5 of 209 offered".
- The phone search shows an *Esc* key and the hint "Enter opens it.". `p-02`.
- The *Take it off* toast covers the last rows of a list at 390x844. `p-10`, `p-11`.
- Data, *New since 16 September 2026*, counts the F150XC take-off and put-back as "10 lines changed", which looks as if something is still changed. `d-34`.
