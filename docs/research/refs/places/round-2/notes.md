# A maker's own page, round 2: the sweep for the redraw

Driven 2026-11-04 for the judge's **redraw** of `/places/$id` (`docs/directions/data-round/places/judge.md`): one maker as Northside sells it, **model-led**. 125 rows · 105 frames on disk · 101 opened, plus 8 stock frames opened. The counts, refusals and URLs are in `sources-index.md`. Paths are relative to `docs/research/refs/places/round-2/`. A frame is cited only if it was opened.

**What round 1 did not use.** Round 1 (`../notes.md`) asked how a *place* wears its identity (F1 liveries, GitHub org heads, svgl's plates, Spotify). It never looked at a model line-up with prices, a compare, a spec sheet, a fitment lookup, a trailer range by hull length, a horsepower ladder or a service-price page, and this round looked only for those. Before driving, the 1,515 distinct URLs in every `docs/research/refs/**/sources.json` were listed and left out. Highfield, Stacer, Stabicraft, Jeanneau, Boston Whaler, Sea Ray, Porsche's configurator, Mercury and Yamaha were all taken, so the boat makers here are new: Quicksilver, Arc, Brig and Easytow.

**The file's facts this round may draw on**, all quoted from the judge (J2, J12, J17, J18 and blockers 1–3):
- Highfield: 67 models, 7 series, 588 variants, each with OA Length, Max People, Max Load, Min/Max HP and Cash. Cash spans run from Roll-Up $2,770–$6,940 (32 of 32 priced) to Adventure $105,930–$198,610 (12 of 12).
- Jeanneau: 27 models, 4 with no series (DB 37 OB, DB 43 OB, TH33, TH38), no photograph.
- Yamaha: 209 motors with HP Rating, Shaft Length, WEIGHT kg, Control and Sell Price. It has 2,519 fits with Highfield.
- Labour Rates: 18 rates. "Rate (inc GST)" is $159 Retail, but the list declares no price level.
- OBSOLETE Trailers: 10 trailers, none still sold.
- Pictures: Highfield 20 catalogue + 18 hero; Stacer 23 + 11; Jeanneau and Stabicraft 0 catalogue.

## 1. What is genuinely best, and why

**The models, each with its price and three facts.** `live/carexpert-specs.png` is the best frame for the judge's first blocker. Under *Showing 28 Configurations*, each card sets the grade in grey (*Workmate*), then the configuration as one bold sentence (*2.8L, 6-speed manual, 2-door Cab Chassis, Diesel, RWD*), then the price (*$38,966 driveaway*) and *+ Compare*. One card says **Price not available** in the price's own place: the unpriced variant said where its figure would be. The head above (`live/carexpert-hilux.png`) states the span once: *Driveaway $38,966 – $89,436*. For us that is *Sport · Sport 660 · from $X at Cash*, with "n of n priced" where any variant is not.

**A series opens in place, the range as pictures.** `live/quicksilver-selector.png` (*Personalise your selection*) sets the series as eight picture tiles (*Open · Sundeck · Cabin · Cruisers …*), then *Focus* (Fishing · Watersports · Overnight) and a row of numbered toggles. At 390 (`live/quicksilver-selector-390.png`) the tiles go two across and keep their pictures and names. `live/mazda-range.png` is the plainest model index in the sweep: 13 side-on cut-outs, each with the name in spaced caps, a second-tone line (*Medium SUV | 5 seats*) and a red state word over it (*ALL-HYBRID*, *NEW*).

**A model's head is three figures.** `live/quicksilver-605-open.png` sets *605 Open* over **7** Persons · **150** Max HP · **6.46 m** Length, with a section bar: *About · Gallery · Specifications · Features · Find a dealer*. `live/arc-sport.png` does the same: *Arc Sport* over 500 hp · 232 kWh · Zero, with *DEMO · BUILD YOURS*. Our file carries all three of people, horsepower and length for every Highfield variant.

**The spec sheet.** `live/quicksilver-605-open-specs.png` sets label and value in two columns of banded rows (*Overall Length 6.46 m · Overall beam 2.40 m · Maximum load (People, Gear) 587 kg · Shaft length XL · Maximum power 150 hp*), with the section bar stuck at the foot of the screen. Nearly every row is a field our file holds per variant.

**Compare, chosen from the range.** `live/porsche-compare-select.png` (*Choose two Porsche models · 77 available models*) puts the families down the left with counts (*911 (20) · 718 (7) · Taycan (14)*). Each card carries chips (*Petrol · 2027*), the name, three figures and an *Add to comparison* box. A tray at the foot holds *Choose a model · Choose a model* and *Compare Models*, disabled until two are chosen. `live/apple-iphone-compare-rows.png` gives the result: three columns, each headed by a model chooser with *From A$…*, and rows where a missing feature is a dash (*—*), never a blank. `live/carexpert-specs-scrolled.png` adds *Search for a feature or spec*, *Skip to*, and two switches, **Hide similarities** and **Highlight differences**.

**What goes on one model: a dealer's own lookup.** `live/rhinorack-dealer-model.png` is the dealer-only fitment lookup, reachable without signing in. The head carries its data's date (*FITMENT LOOKUP · PIM Plus 3 Nov 2026 15:00*). The left column offers *By vehicle · By canopy · By product*, then Make → Model → Year. The answer starts with the count as its title, **165 FITS**. Facets appear only for what the answer holds (*KIT TYPE · BAR TYPE · BAR COLOUR*), then *CURRENT RANGE (JC) 78*.

Each kit is one card:
- its kind in letter-spaced small caps (*CROSSBAR KIT*);
- the name in bold;
- its parts as mono code + words (*2 × RB1250B alloy bar 1250mm blk*);
- the vehicle it fits as one sentence (*TOYOTA Hilux · Gen8 · Pick Up · Double Cab · 4dr · … · 2015–2025*);
- code chips, *Available*, and a figure (*100 kg load*).

A year chosen (`live/rhinorack-dealer-model-year.png`) makes it **21 FITS**. The empty state teaches (`live/rhinorack-dealer-tool.png`: *PICK A MAKE TO START. Then narrow by model and year; more questions appear only where the vehicle needs them.*), and the foot is a census, **51,402** current fits · **0** historic · **2,459** vehicles · **93** makes, the zero printed. For us: the boat's motors, trailers and Dealer Fit as kit cards, the recommended motor marked, the file's `packedAt` in the head.

**Trailers read by the boat they carry.** `live/easytow-trailers.png` puts the whole trailer range in a rail by **hull length**: *4.5–5.0 m HULLS · 5.1–5.6 m · 5.7–6.4 m … · TINNIE TRAILER (4.4 m & under)*. One band (`live/easytow-hull-51-56.png`) lists each trailer under its code (*SF5.2-1400S*), with a ruled row of *TARE 360 kg · GTM 1400 kg · ATM 1425 kg · BRAKES Mechanical · WHEELS 13″ · SPRINGS Slipper*. This is the judge's "fits boats up to 5.3 m" as a range a person can walk.

**Motors read as a horsepower ladder.** `live/honda-marine-scrolled.png` names the families by their HP span under studio cut-outs: *BF2.3 · BF8–9.9 · BF15–20 · BF25–30*. `live/suzuki-tiles.png` sets a fact line over each motor's name (*DRIVE-BY-WIRE (S.P.C.) | SINGLE / DUAL* over **DF250AP OUTBOARD**), and `live/suzuki-marine-outboards.png` filters by *Engine Cylinders · Colours · Controls · Configuration*. For Yamaha's 209 motors that is a ladder by HP Rating, each step a count, and Shaft and Control as the facets.

**A price that cannot print, said with its door.** `live/kia-capped-price-service-scrolled.png` caps the price of every scheduled service, then says in one sentence what is outside it: *Although all-electric vehicles are not included in our Kia Capped Price Servicing program, we offer tailored EV service plans … Learn more about our Prepaid Service Plans.* That is the Labour Rates sentence the judge asked for (J17): why no figure prints, and the door to Prices.

## 2. The interaction patterns worth taking, named

Named in §1, each with its frame: **the configuration card** with *Price not available* in the price's place, **the span in the head**, **the series tiles as a filter** (ours in the address, `?series=Sport`), **the three-figure head**, **the banded spec sheet with a sticky section bar**, **the compare tray** with its two named empty slots, **the difference switches** (for two neighbouring models that share most rows), **the dash for absent**, **the fits lookup** with its census foot and as-at stamp, **the hull-length rail**, **the HP families** and **the exclusion sentence**. Four more:

- **Questions only where needed** (`live/rhinorack-dealer-make.png`). Choosing TOYOTA adds Body type, Generation, Cab type, Doors, Roof type and Wheelbase. A boat with one version should never be asked for one.
- **The segment cascade** (`live/ryco-vehicle-type.png`). *Passenger · Motorcycle · Heavy commercial · Industrial · Marine*, then Make → Model → Year → Series → Engine → Vehicle, with one *Search*.
- **The state word on the card** (`live/hyundai-au-cars.png`). *Runout* or *Offer* sits in a tinted corner tag over the model's name, on the card itself. For OBSOLETE, each of its 10 trailers shows with *No longer sold* on its card, rather than "0 still sold" over nothing (J18).

## 3. Type and motion, as observed

- **Figure over label.** Quicksilver sets **7** / **150** / **6.46 m** at about 28 px over 11 px labels (`live/quicksilver-605-open.png`). Apple sets *7.6″* at about 64 px over a body-size line, and gives the dash the same weight (`live/apple-iphone-compare-scrolled.png`). Rhino-Rack's **165 FITS** is a 24 px figure-word.
- **The sentence as the name.** CarExpert's configuration is a bold 18 px sentence under a 14 px grey grade (`live/carexpert-specs.png`). Rhino-Rack's vehicle line is a 12 px grey sentence with middots (`live/rhinorack-dealer-model.png`).
- **Codes in mono, words in sans.** Rhino-Rack sets *RB1250B* and *JC-03121* in mono beside sans words, as our codes (*SP660*) would sit beside the spoken name.
- **Letter-spaced small caps for kinds.** *CROSSBAR KIT*, *KIT TYPE*, *CURRENT RANGE* (Rhino-Rack), *MAZDA CX-5* (`live/mazda-range.png`). Suzuki's condensed caps (`live/suzuki-tiles.png`) shout at our scale.
- **Motion.** Stills prove none. One cue is legible: a count that changes with a filter (165 → 21). Ours swaps in place, with no ticking under reduced motion.

## 4. What to avoid, each with its frame

- **Filters before answers on a phone.** `live/rhinorack-dealer-390.png` stacks Make, Model, Year, Generation, Cab type, Doors and Available only to the foot of the screen. The 165 fits begin below it. This is the judge's "rail before the range" (390, 834).
- **Promotions before the range.** `live/kia-au-cars-scrolled.png` puts a cashback hero, promo tiles and *Disclaimers* first (two more frames never reached the range). `live/suzuki-marine-scrolled.png` repeats a *BONUS RIGGING* badge on every tile.
- **A price held hostage.** `live/mazda-au-cars.png` puts *ENTER YOUR POSTCODE FOR PRICING* over the range. Our price is known, so it is never gated.
- **An empty compare with nothing under it:** `live/porsche-compare.png`, a title and two *Select model* buttons over white.
- **The photograph as the only content.** `live/arc-sport-scrolled.png` and `live/brig-au.png` are full-bleed water with no model or figure. 18 of our 25 places have no photograph. Of these, Rhino-Rack's lookup (`live/rhinorack-dealer-model.png`) and CarExpert's cards are typographic and finished without one.
- **Ads and notices over the thing:** `live/gsmarena-compare.png`, `live/rtings-compare.png`.

## 5. Three directions

Every board draws Highfield (67 models, 7 series), Jeanneau (4 models with no series, no photograph), Yamaha (209 motors, no picture) and Labour Rates (no declared price), at 390 and 1440 with the reflow said for all six sizes. Each owes a compact head where no photograph is held, Jeanneau's four under a sentence naming them, a head figure equal to what is drawn, *Standard inclusions are not held* said once, boats first on a phone, and Parts and Dealer Fit handed to `/catalogue`. The livery, mark, lightbox, partner marks and Settings carry over (judge §4).

**A — "The line-up".** The range is the page.
- **Head:** compact, with the span (*from $2,770 to $198,610 at Cash · 588 of 588 priced*).
- **Series:** picture tiles that filter in place (`?series=`).
- **Models:** one configuration card per model, with picture where held, spoken name, *from* at Cash, and *length · people · HP* in the second tone. Each card has *+ Compare*, collecting into a two-slot tray that names what is missing.
- **A model, pressed:** opens `/fitment?boat=`.
- **References:** `live/quicksilver-selector.png`, `live/carexpert-specs.png`, `live/mazda-range.png`.
- **Exclusive (no other board here or earlier):** Quicksilver's selector and CarExpert's configurations.
- **Only A:** every model's price visible at once.
- **Reflow:** four cards at 1920 and 1440, three at 1280 and 834, two at 844 × 390, one at 390 with the tiles two across (`live/quicksilver-selector-390.png`, `live/carexpert-specs-390.png`).
- **Yamaha:** the series tiles become the HP families.

**B — "The lookup".** The maker's page is a dealer's fitment lookup, read-only.
- **Left:** series → model → version, asked only where the boat has more than one.
- **Right:** *N FITS* as the title, then the model's carried things as kit cards. Motors come first, with the recommended one marked. Each card has code chips and one figure (HP, ATM, Sell).
- **Foot:** the census (*2,519 fits with Yamaha · 0 changed · 67 models*), with the file's `packedAt` in the head.
- **Changing what fits:** stays on Fitment. The board must say how it differs from `/fitment?boat=`: a press here reads, a press there changes.
- **Yamaha:** the lookup turns round, motor → the boats it fits.
- **Trailers:** read by hull length.
- **References:** `live/rhinorack-dealer-model.png`, `live/ryco-vehicle-type.png`, `live/easytow-hull-51-56.png`.
- **Exclusive:** Rhino-Rack's dealer lookup, Ryco's cascade and Easytow's hull rail.
- **Only B:** "what each carries" is the page's spine.
- **Reflow:** the left column becomes one chooser line at 834 and below. **At 390 the answer comes first** and the questions fold under a *Change boat* press, which is the opposite of `live/rhinorack-dealer-390.png`.
- **The sweep suggests B; the judge did not name it.**

**C — "The spec sheet".** The models in a ladder, one open as a sheet, compare as columns.
- **Ladder:** the range as a horizontal ladder by length for boats, and by horsepower for Yamaha (each step its span read from HP Rating, and its count).
- **One model open:** in place (`?model=`), with the three-figure head (*people · max HP · length*) and a sticky section bar (*Specifications · What fits · Prices · Quotes*). The specs are banded label/value pairs.
- **Compare:** *Compare with…* adds up to two more columns, Apple's large figure per row with *—* for absent and CarExpert's *Highlight differences*.
- **References:** `live/quicksilver-605-open-specs.png`, `live/arc-sport.png`, `live/apple-iphone-compare-rows.png`, `live/porsche-compare-select.png`, `live/honda-marine-scrolled.png`.
- **Exclusive:** Arc's head, Honda's HP families and Porsche's compare picker.
- **Only C:** the 600-or-660 question answered on the page.
- **Reflow:** three compare columns at 1440 and 1920, two at 834 and 1280. At 390 one column with a *Compare with* chooser over it (`live/apple-iphone-compare-390.png` keeps two columns at 390 and cuts its words; ours does not). At 844 × 390 the head drops to one line so the act stays above the fold.

## 6. The imagery question

The seed can honestly put a picture on a model card only where the ledger holds that exact model:
- Highfield 20 catalogue + 18 hero;
- Stacer 23 + 11;
- Formosa, Haines and Surtees 1 + 1–2 each;
- Jeanneau and Stabicraft 0 catalogue.

Motors, trailers, Labour and Registration hold none.

The best sites with only product shots use side-on cut-outs at one scale (`live/mazda-range.png`, `live/honda-marine-scrolled.png`). We have those only in Highfield's and Stacer's catalogue pictures, so a card without one is **typographic by design** (name, configuration sentence, three figures), as on `live/carexpert-specs.png` and `live/rhinorack-dealer-model.png`: never a grey box or a sibling's picture, and one height with its pictured neighbours (judge §2). *18 photographs on the water* becomes the one press into the lightbox.

**Stock** (`C:\Users\Asaf\dev\hl-refs\ref`): of the eight frames opened for compare and range, `tables/mercury-compare.png` is a block page, `tables/stabicraft-specs.png`, `tables/axopar-specs.png`, `tables/porsche-compare-2.png` and `boats/nimbus-1.png` are 404s, `boats/williams-2.png` is a Cloudflare check, and `boats/saxdor-1.png` and `boats/riviera-1.png` are a news grid and a hero. The stock held no usable compare or spec sheet; this round's live frames fill that.
