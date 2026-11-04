# A maker's own page, built: direction A, "The line-up" (2026-11-04)

The judge said **redraw** (`judge.md`). The three judges of the directions picked **A, "The line-up"** (`boards/a.html`), with grafts from B and C. This is what was built, and what was measured on the built page. The screen is **provisional** in `docs/SCREENS.md` until the owner looks at it by eye.

Every frame named below is in `after/`, and each name ends in its size: `-390x844`, `-844x390`, `-834x1112`, `-1280x800`, `-1440x900` or `-1920x1080`. The frames come from `e2e/flows/places-shots.spec.ts`, run with `HL2_PLACES_SHOTS=1` through the real door on the real Master Price File.

## What the page is now

**1. The head.**
- **With a photograph** (6 of 25 places): a 220px livery head on the maker's own photograph, captioned. Its mark carries the name, which is kept for a reader and not printed twice.
- **Without one** (the other 19): a compact head on the place's colour, with the figures set large (C's graft). No head is now an empty 300px band.
- **The figures**, each measured from the file: what the place holds, how long its boats are, the span at the register's own price with n of n versions priced, and the price list's date (B's stamp).
- **The acts**: *Quote a Highfield*, and *See the 18 photographs*, which opens every photograph in one lightbox. On Parts the act is *Open the chandlery*.

**2. The series.** At most seven series stand as pictured tiles (Every model plus each series), each with its count and from-price, and they filter in place (`?series=Sport`). More than seven series (Stacer's 22), and every phone, get one *Series* chooser instead. Models with an empty series cell stand under **Filed under no series**, with a sentence naming them, so the count in the head is the count drawn:
- Jeanneau: 27 in the head, 27 drawn;
- Stabicraft: 37 and 37.

**3. The range head.** It docks under the bar once the page scrolls and carries:
- the title, its count, and the span at the price with n of n priced;
- the order (*File order · Price · Length*, `?sort=`);
- a find over model and code (`?find=`);
- the door to that series in the price list;
- the compare tray.

It does not dock on a phone or in a window under 520px tall, where it would take more than half the screen.

**4. One card per model**. A maker of more than 40 models (Highfield 67, Stacer 91) draws its first 24 of *Every model*, then one press, *Show all 67 models* (`?models=all`). A series or a find always draws all of its models. With all 67 drawn, the focus ruler's Tab walk ran past its 30 s budget; drawn this way it reads 94 Tab stops at 1440. Each card carries:
- its own picture, or its length and horsepower set large over "No picture of the Sport 700 WL (Windlass) is held";
- its spoken name, then *from $X Cash* under it;
- its Model Code and versions in its materials;
- length · people · horsepower, with "people not in the price list" where the file files the column and leaves it empty (SP300);
- the recommended motor;
- motors, trailers, packages and parts as four counted figures;
- *Compare* on the picture's corner, *What fits* (`/fitment?boat=`) and *Quote it* (`/quote/new?brand=&model=`).

When the models are ordered by length, each card carries a quiet bar for its length (C's graft).

**5. The compare** (C's banded sheet), opened in place under the dock (`?compare=a,b,c&see=compare`):
- the bands are Price, Specifications and What fits;
- a dash stands where the file is empty, and *Light what differs* is on;
- it prints Cash only, never Trade or Warranty;
- a fourth boat is refused with a sentence in the tray: "Three boats are set side by side at most. Take one off to add the Sport 700 ST."

**6. Standard inclusions.** "What comes standard on each boat is not held yet" is said once, under the range.

**7. A list that is not a boat maker reads as its own range** (`Shelf.tsx`), with one heading open in the address (`?in=150`):
- **Yamaha**, by its own HP Rating: 27 single ratings from 2.5 hp, then 47 twin and triple rigs;
- **trailers**, by series, each with the boats it takes and its ATM, at Sell inc Rego;
- **Labour Rates**: its 18 rates, under a sentence saying why no rate prints;
- **OBSOLETE Trailers**: all 10, each "No longer sold";
- **Dealer Fit**: one chooser over 91 headings, its 74 unfiled packages first under their own heading;
- **Parts** hands off to the chandlery.

**8. After the range**, in two columns that fill by height:
- **Its prices**: Cash and Trade spanned series by series with n of n priced, and Warranty named as Northside's own with no figure;
- **Quotes on a Highfield**: each by its spoken boat name, customer and total, given or draft, with a find from six quotes;
- **Goes with**;
- **Changed here**, each changed line a door to it in the price list, and **How it is dressed**, the door to Settings (`?tab=settings`).

## The jobs (judge.md J1–J19), end to end on the real file

| # | Job | Now |
|---|---|---|
| J1 | Show what Highfield makes | Every model as a card with its picture, name, code and versions: the first 24 of 67, and the rest one press away (`01-highfield-*`, `02-highfield-full-*`) |
| J2 | Budget, family, tow car | From-price at Cash, length, people and horsepower on every card. Order by Price or Length. The compare sets out beam, load, weight, fuel, shaft, tube and chambers (`05-compare-*`, `07-highfield-by-length-*`) |
| J3 | What goes on one model | Four counted figures and the recommended motor on each card; *What fits* lands on `/fitment?boat=<that model>` (flow spec) |
| J4 | The boat on the water | *See the 18 photographs* opens all 18 in one lightbox (`09-gallery-*`) |
| J5 | Start the quote | *Quote a Highfield* on the head, and *Quote it* on each card, which opens the picker on that model. The flow spec presses it, and a draft is started from it (`26-quotes-one-*`) |
| J6 | Find an earlier quote | The row reads "Highfield Sport 660 · PVC · White / White / White/Blue", "Nobody named yet", $61,700, "Draft · 2026-11-04 · 20261104-01". A find appears from six quotes (`26-quotes-one-*`) |
| J7 | Its line | The refusal now reads "A place's line is one line under its name"; "on its card" is gone (`src/domain/catalogue/placeCommands.ts`) |
| J8 | Its mark | When neither ink is held, the sentence is printed once and neither ink is offered (`24-redco-settings-*`) |
| J9 | Its photograph | "Only Highfield Inflatables' own boats are offered" (`23-highfield-settings-full-*`) |
| J10 | Its colour | Carried over. The eight grounds stand four to a row, so none is widowed |
| J11 | Sold on its own | Carried over |
| J12 | Every model on the page | The head equals what is drawn: Jeanneau 27 = 27; Stabicraft 37 = 37. Parts' 25 unfiled and Dealer Fit's 74 are drawn or counted under their own heading |
| J13 | What it sells at | Spans per series at each price a customer may see, n of n priced; Warranty named as kept (`10-after-*`) |
| J14 | What changed | Each changed line is a door to `/data/<list>?at=<row>` |
| J15 | A series in the price list | *Open Sport in the price list* on the range head |
| J16 | To a partner | *Goes with*, after the range |
| J17 | An hour of labour | A sentence says why no rate prints and opens Labour Rates in the price list (`18-labour-*`) |
| J18 | OBSOLETE trailers | All ten drawn, each "No longer sold", with ATM and the boats each was for (`17-obsolete-*`) |
| J19 | An unknown address | Carried over (`25-unknown-*`) |

## The judge's gaps, closed

| Gap | Now |
|---|---|
| Lines with an empty first heading silently dropped (blocker) | Drawn under "Filed under no series" (or category), with a sentence, and the head equals the count drawn |
| The rail before the range on phone and tablet | The rail is gone. Goes with stands after the range. On a phone the order is the head, the Series chooser, then the cards |
| 18 of 25 heads an empty 300px band | Six places carry a photograph. The other 19 stand on the compact head with large figures |
| Labour Rates silent | A sentence says why, where the rates are |
| Quotes by file code, no total | The spoken boat name, customer, total, and given or draft |
| 844 × 390: the act cut at the fold | *Quote a Highfield* spans y 268–318 and *See the 18 photographs* stands beside it (`01-highfield-844x390`) |
| Ragged series grid | Tiles are one height. Seven or fewer stand in one row at a desk and four to a row on a tablet |
| OBSOLETE "0 still sold" over nothing | All 10 drawn |
| Wording | The fixes are listed in J7–J9 above, and the name is not printed again under a mark |
| Text under 12px | The kind word and the hero caption are now 12px. Nothing under 12px is measured in any state |

## Grafts not built, and why

- **B's model spotlight under What fits** was left out to keep the page simple. *What fits* opens Fitment on that boat, and Fitment is where the motors, trailers and kit are read whole and changed.

## Measured (`e2e/flows/places-shots.spec.ts`, 28 frames at each of the six sizes, 168 in all)

Every state was measured as it was shot, at all six sizes. The four checks:
- 0px of sideways scroll;
- no text under 12px (outside a name-in-type chip mark);
- no text cut by its own box;
- no visible control under 24px.

No page error at any size.

Two faults were found by eye, not by the measure, and fixed:
- the phone's "Open OBSOLETE Trailers — No Longer Available in the price list" ran past the screen's edge; it now reads "Open in the price list";
- a wrapped line of facts began on a dot; the facts now wrap after the dot.

What each model carries is counted by `carriesOf`, which reads Fitment's own blocks once per maker. The test holds all 289 models of the seven boat makers to `readBoatFit`'s counts and recommended motor, and every one matches. It read Stacer's 91 in 58ms in node, against 4,402ms boat by boat through `readBoatFit`.

## The rulers and the specs (`HL2_PREVIEW_PORT=6282`)

**The rulers** (contrast, cut, density, fixture, focus, overlap, ramp and refusal) were run at all six sizes on four routes: `places-highfield`, `places-compare`, `places-motors` and `places-settings`. All pass. Two faults were found and fixed along the way:

- **Night theme.** The cards, tiles, compare and plates are white surfaces. They now wear the plate ground (`data-ground="plate"`) and set their own ink. Before that fix, contrast read white text on white: 429 runs at 1440 on the compare.
- **The dock at the end of the range.** When pushed to its section's end it stood over the last cards and the sentence under them (overlap, 12 pairs at 1440). It now lets go where the cards end.

Contrast on `places-highfield` and `places-compare` timed out at 30 s in two runs where two workers shared the machine. Both measured 0 below threshold in both themes before the time ran out, and both passed on one worker at 1280 and 1440. `places-settings`, which this round did not change, timed out the same way in the same run.

**The specs.** Run on all six sizes, `e2e/flows/places.spec.ts` and the place test in `e2e/flows/gallery.spec.ts` passed: 60 of 60.

## The tests rewritten to the new truth

- `src/screens/places/Places.test.tsx`: the tests for the series-tile door to the sheet, the series photograph caption and the Quotes tab now assert the line-up, the compare, the shelf, the plates after the range, the once-said REDCO mark sentence and the possessive.
- `e2e/flows/gallery.spec.ts`: "a place's range: a heading opens its photographs" became "a maker's own page: its head opens every one of its photographs". Its shots in `docs/directions/quote-3/gallery-range-*` were rewritten by that run.
- `e2e/flows/places.spec.ts`: the partner press now names the *Goes with* region. Four new flows were added: the series filtering in place, What fits and Quote it, the compare in the address, and Yamaha by horsepower.
- `e2e/routes.ts`: two ruler routes were added, `places-compare` and `places-motors`.
