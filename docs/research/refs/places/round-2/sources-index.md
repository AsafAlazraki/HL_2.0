# A maker's own page, round 2 — sources index

Driven 2026-11-04 for the redraw of `/places/$id` (`docs/directions/data-round/places/judge.md`). Captured with headless Chromium (`en-AU`) through `tools/research/capture.ts`, at 1440 × 900 except the `-390` rows (390 × 844). The five `rhinorack-dealer-*` rows were driven by a one-off Playwright script that chose Make, Model and Year from the lookup's own selects; nothing was typed and nothing was submitted. Consent banners were answered with the most privacy-preserving control present, or left alone. **Nothing was signed in, no form was filled, and no bot protection was fought.** Frames are gitignored. The durable copies are in `C:\Users\Asaf\dev\hl-refs\hl2\places\round-2\{live,gallery}\`. Each folder's `sources.json` records the date, final URL and title of every row.

**Counted from the ledgers:**
- 125 rows: 110 in `live`, 15 in `gallery`.
- 7 rows produced no frame.
- 13 frames were deleted after they were opened, because each was a 404, an error page or a bot wall that carried nothing. Their rows stay in the ledger.
- 105 frames on disk: 90 in `live`, 15 in `gallery`.
- **101 opened** with the Read tool: 33 one at a time, and the rest in 2-up tiles at half scale or 390-wide strips at native size.
- **4 not opened:** `live/redbook-ranger-scrolled` and `live/quicksilver-selector-scrolled` (the ledger title is *Attention Required! | Cloudflare*), and `gallery/landbook-catalog` and `gallery/landbook-specs` (both titled *Just a moment...*).

Eight stock frames from `C:\Users\Asaf\dev\hl-refs\ref` were also opened (notes §6).

**Every source here is new.** Before driving, the 1,515 distinct URLs in every `docs/research/refs/**/sources.json` were listed, and anything already captured was left out.

## Refused, dead or not what was asked

**Bot walls:**
- `tracker-boats` and its scroll: *Access Denied* from the edge.
- `audi-au-models`: *Access Denied*.
- `ford-ranger`: *Access Denied*.
- `redbook-ranger`: *You have been blocked*.
- `boatsales-highfield`: *You have been blocked*.
- `quicksilver-selector-scrolled`: the second load hit Cloudflare.
- `gallery/landbook-catalog` and `gallery/landbook-specs`: a Cloudflare challenge.

None was fought.

**No frame:**
- `yellowfin-range`: DNS failure.
- `honda-marine-au`: connection timed out.
- `ids-astra`: DNS failure.
- `formosa-boats`: DNS failure.
- `surtees-boats`: `ERR_CERT_COMMON_NAME_INVALID`.
- `easytow-hulls` and `hyundai-runout`: the text to press was not found within 8 s.

**404 or error pages:**
- `axopar-range` (*ERROR 404*);
- `axopar-home` (*Application error: a client-side exception*);
- `barcrusher-range`;
- `carexpert-hilux-price`;
- `century-battery-finder`;
- `toyota-service-pricing`;
- `hubspot-quotes`;
- `kia-compare` and `kia-capped-servicing` (*Page not found*);
- `mazda-service-pricing` (*under maintenance*);
- `yakima-fit`;
- `airtable-product-catalog`;
- `gallery/nicelydone-comparison`;
- `gallery/recent-design-interface`.

Every one of these addresses was a guess.

**Not what was asked:**
- `polaris-resource-details` and `polaris-resource-index` both redirect to the *Polaris references* index.
- `mackay-trailers` is a holding page (*Our new website is on the way*) for one of Northside's own trailer places.
- `williams-tenders` shows a launch film, with no range.
- `tohatsu-outboards` lands on a video hero.
- `robalo-models` is behind a country chooser.
- `lund-scrolled` is behind a newsletter modal.
- `kia-range` and `kia-range-all` did not reach the range.
- `carexpert-variants` stayed at the head.
- `quicksilver-series-open` returned the unfiltered selector.
- `gallery/refero-*` (three rows) shows the same unrelated results and *Log In or Sign Up to See All Search Results*.
- `gallery/mobbin-web` shows categories, and its screens are behind *Join for free*.

None of these frames is cited for a pattern.

## `live/` — the frames cited

| id | URL | one line |
|---|---|---|
| `carexpert-hilux` | carexpert.com.au/toyota/hilux | a model head: name, *Compare*, a paragraph, *Driveaway $38,966 – $89,436*, facts in pairs, and a sub-nav (*Features & Specs · Variants · Reviews …*) |
| `carexpert-hilux-scrolled` | same | the sub-nav stuck under the bar while the page reads on |
| `carexpert-specs` | …/hilux/features-and-specs | **Showing 28 Configurations**: grade over a configuration sentence over price, *+ Compare* on each card, one card *Price not available* |
| `carexpert-specs-scrolled` | same | compare columns with *Search for a feature or spec*, *Skip to*, and *Hide similarities* · *Highlight differences* |
| `carexpert-variant-sr5` | …/hilux/sr5/features-and-specs | one grade: *Showing 8 Configurations* |
| `carexpert-hilux-390`, `carexpert-specs-390` | as above, at 390 | the head stacks; the configurations scroll two across, then the switches |
| `quicksilver-selector` | quicksilver-boats.com/product-selector/ | the series as eight picture tiles, then *Focus* and numbered toggles |
| `quicksilver-selector-390` | same, at 390 | the tiles two across, each with its picture and name |
| `quicksilver-605-open` | quicksilver-boats.com/activ_605-open | *605 Open* over **7** Persons · **150** Max HP · **6.46 m** Length; the section bar *About · Gallery · Specifications · Features · Find a dealer* |
| `quicksilver-605-open-specs` | …?productTab=specifications | banded label/value pairs in two columns, with the section bar stuck at the foot |
| `quicksilver-boats` | quicksilver-boats.com/int/en | a hero film with one act (*See the new 625 Open*) |
| `arc-sport` | arcboats.com/arc-sport | *Arc Sport* over 500 hp · 232 kWh · Zero, with *DEMO · BUILD YOURS* |
| `arc-boats`, `arc-boats-scrolled`, `arc-sport-scrolled`, `arc-boats-390` | arcboats.com | full-bleed water: a head with two doors, then photographs with no model or figure |
| `brig-au` | brig.com.au | a full-bleed photograph and *DISCOVER BRIG* |
| `mazda-au-cars` | mazda.com.au/cars/ | the range under an *ENTER YOUR POSTCODE FOR PRICING* modal |
| `mazda-range` | same, Escape pressed | 13 side-on cut-outs, each with a spaced-caps name, a second-tone line (*Medium SUV \| 5 seats*) and a red state word |
| `hyundai-au-cars` | hyundai.com/au/en/cars | the range with category tabs and checkbox facets (Fuel type · Transmission · Seats); cards with a corner tag (*Runout*, *Offer*, *New*), the name, and *Discover › · Build & Price ›* |
| `hyundai-au-cars-390` | same, at 390 | the facets fold into one *Filter* button over the cards |
| `toyota-hilux`, `toyota-hilux-scrolled` | toyota.com.au/hilux | a model's own sub-nav (*Range · Accessories · Personalise · Prices · Specifications*) over a hero, under a systems-upgrade notice |
| `kia-au-cars`, `kia-au-cars-scrolled` | kia.com/au/cars.html | a cashback hero, promo tiles and disclaimers before *Find Your Perfect Kia* |
| `kia-capped-price-service`, `…-scrolled` | kia.com/au/owners/capped-price-service.html | *How much will my next Kia service cost?*; the sentence on what is not included, with its door; tabs *Service cost for my Kia · for all Kia models* |
| `apple-iphone-compare` | apple.com/au/iphone/compare/ | three model choosers over pictures |
| `apple-iphone-compare-scrolled` | same | *From A$3,499* per column, *Buy*, then *Summary* with *7.6″ · 6.9″ · 6.3″* and a dash where absent |
| `apple-iphone-compare-rows` | same | the choosers stuck at the top; rows of icon, figure and line, *—* for absent |
| `apple-iphone-compare-390` | same, at 390 | two columns kept at 390, with the words wrapping hard |
| `apple-mac-compare`, `apple-mac-compare-rows` | apple.com/au/mac/compare/ | the same pattern: *13.0″ · 13.6″ · 14.2″*, *6-core · 10-core · 12-core* |
| `porsche-compare`, `porsche-compare-scrolled` | compare.porsche.com/en-AU | an empty compare: *Model comparison* and two *Select model* buttons, then the footer |
| `porsche-compare-select` | same, *Select model* pressed | *Choose two Porsche models · 77 available models*; families with counts; cards with chips, three figures and *Add to comparison*; a tray of two *Choose a model* slots |
| `rtings-compare` | rtings.com/tv/tools/compare | *LG C5 OLED vs C6 OLED 2026*: two coloured product choosers and a section rail, under two notices |
| `gsmarena-compare` | gsmarena.com/compare.php3?… | three *COMPARE WITH* searches, with a video ad and a banner over them |
| `suzuki-marine-outboards` | suzukimarine.com.au/outboards | *OUTBOARDS* hero and a *FEATURES FILTER* (Engine Cylinders · Colours · Controls · Configuration · CLEAR) |
| `suzuki-marine-scrolled`, `suzuki-tiles` | same, scrolled | a *BONUS RIGGING* panel and badges; each tile has a fact line (*DRIVE-BY-WIRE (S.P.C.) \| SINGLE / DUAL*) over the name (*DF250AP OUTBOARD*) |
| `suzuki-tiles-390` | same, at 390 | one tile across, the fact line kept |
| `honda-marine-outboards`, `honda-marine-scrolled` | marine.honda.com/outboards | studio cut-outs named by HP family: *BF2.3 · BF8-9.9 · BF15-20 · BF25-30* |
| `easytow-trailers` | easytow.com.au | the range in a rail by hull length (*4.5 – 5.0M HULLS … TINNIE TRAILER (4.4M & UNDER)*) |
| `easytow-hull-51-56` | easytow.com.au/fish-sports-boat-trailers/5-1-5-6m-hulls/ | each trailer under its code (*SF5.2-1400S*) with *TARE · GTM · ATM · BRAKES · WHEELS · SPRINGS* in a ruled row |
| `rhinorack-fit`, `rhinorack-dealer-fit` | rhinorack.com/en-au | *Simple Fitment Tool* and *Dealership Fitment Tool* offered side by side |
| `rhinorack-build-fitment` | rhinorack.com/en-au/pages/build-your-fitment | *FIT YOUR VEHICLE · NO VEHICLE SELECTED · Select a vehicle →* |
| `rhinorack-dealer-tool` | the-shed.clarusadventure.com/fitment-lookup/ | **the dealer lookup at rest**: *FITMENT LOOKUP · PIM Plus 3 Nov 2026 15:00*; *By vehicle · By canopy · By product*; *PICK A MAKE TO START* with its sentence; a census foot (*51,402 current fits · 0 historic · 2,459 vehicles · 93 makes*) |
| `rhinorack-dealer-make` | same, Make = TOYOTA | **1,270 FITS**; the questions grow (Body type, Generation, Cab type, Doors, Roof type, Wheelbase) |
| `rhinorack-dealer-model` | same, Model = Hilux | **165 FITS**, facets for what the answer holds, *CURRENT RANGE (JC) 78*, kit cards |
| `rhinorack-dealer-model-year` | same, Year = 2026 | **21 FITS**, *CURRENT RANGE (JC) 14* |
| `rhinorack-dealer-by-product` | same, *By product* | *SEARCH BY PRODUCT CODE OR VEHICLE NAME* with *Type at least two characters* |
| `rhinorack-dealer-390` | same, at 390, Hilux | the filters fill the screen and the fits start below it |
| `ryco-filter-finder` | rycofilters.com.au | *Find your Ryco products*, with tabs *REGO OR VIN · VEHICLE TYPE · CROSS REF · PART NUMBER · CUP* |
| `ryco-vehicle-type` | rycofilters.com.au/search/type/- | segments (*Passenger · Motorcycle · Heavy commercial · Industrial · Marine*), then a Make → Model → Year → Series → Engine → Vehicle cascade |
| `apple-obsolete` | support.apple.com/en-au/102772 | text: service after warranty, and vintage and obsolete products defined |
| `stripe-quotes` | docs.stripe.com/quotes | text, with a status diagram (*Open → Accepted*) |
| `stripe-pricing-table`, `stripe-manage-prices` | docs.stripe.com/… | text pages on pricing tables and on products with their prices |
| `hubspot-quotes-2` | knowledge.hubspot.com/quotes/create-and-send-quotes | text and a table of contents for the quote editor |
| `shopify-collections`, `shopify-b2b-catalogs` | help.shopify.com/… | text on collections, and on catalogues with price adjustments per company |
| `retool-inventory` | retool.com/templates/inventory-management | a phone mock of a product list (picture, name, brand · price) and *Find by barcode* |
| `linear-initiatives` | linear.app/docs/initiatives | a docs page with one dark screenshot of grouped projects |
| `plytix-pim` | plytix.com | a PIM grid with thumbnails and prices on a marketing hero |
| `tekion-dms` | tekion.com | a marketing hero for a car dealer platform, with no product shown |

The register sites (Stripe, HubSpot, Shopify, Linear, Retool, Plytix, Tekion) gave text or marketing only. **No quote register reachable without signing in was found**, so the judge's major 8 (quotes a salesperson can use) is not evidenced by this sweep.

## `gallery/`

| id | URL | one line |
|---|---|---|
| `land-book-automotive` | land-book.com/search/websites?q=boat | 8 results, including *Arc – 100% Electric Boats*, which was then driven live |
| `landbook-compare` | land-book.com/search/websites?q=compare | 169 results, mostly SaaS landing pages; *iPhone Air – Apple* first |
| `lapa-automotive`, `lapa-ecommerce` | lapa.ninja/category/… | an ad block over the grid; landing pages, not range or compare screens |
| `awwwards-cars` | awwwards.com/websites/cars-bikes/ | nominee tiles (agencies, a car wash) under a cookie notice |
| `siteinspire-boat` | siteinspire.com/websites?search=boat | the search was ignored, and *Explore Websites* appeared |
| `godly` | godly.website → recent.design | a feed of motion and illustration, with nothing on ranges |
| `refero-compare`, `refero-lineup`, `refero-specs`, `mobbin-web`, `nicelydone-comparison`, `recent-design-interface` | (above) | gated or 404; see Refused |
