# The chandlery, round 2: every frame

Driven 2026-11-03 for the catalogue redraw (`docs/directions/data-round/catalogue/judge.md`) with `tools/research/capture.ts`, headless Chromium, `en-AU`. `live/` and `gallery/` are at 1440 × 900, except twelve `live/` rows that repeat DigiKey, Apple and Mazda at 844 × 390, 834 × 1112, 1280 × 800 and 1920 × 1080 (the size is in the file name). `hand/` is at 390 × 844. Frames are gitignored. Durable copies are mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\choosing\round-2\{live,hand,gallery}\`, and each folder's `sources.json` records the date, final URL and title.

**Counted from the ledgers:** 92 rows (79 `live`, 7 `hand`, 6 `gallery`) and 89 frames. Three rows produced no frame: `svb-home`, `bluebottle-bla-list` and `repco-my-vehicle`. **Nothing was signed in, no form was typed into, no bot check was fought, and no non-essential cookie was accepted.** The capture tool pressed only reject or close controls. On Jamestown and Awwwards, whose banners offered only *Accept* or *GOT IT*, nothing was pressed. One field was typed: a search term (`garmin`) went into DigiKey's address, not into a form. Frames were opened with the Read tool, singly or in tiles of 2–4 built with `sharp`, and each row says whether it was opened.

**Before driving,** the final URLs in every `docs/research/refs/**/sources.json` were listed, and every source already used was left out. The exceptions are a new page on a host used before (Apple's *Cases & Protection*, OpenRefine's dialog) and the McMaster category, retried because the judge named it.

**Refused, gated or dead, with the reason:** McMaster-Carr now asks for a log-in before browsing (`live/mcmaster-cleats*.png`). The stock frames `sheet/redesign/mcmaster-shackles*.png` show the same gate, so **no McMaster frame anywhere on disk shows a catalogue**. Defender, Automotive Superstore and MarineEngine served a Cloudflare challenge (*Just a moment…*). Fastenal and Ford Australia returned *Access Denied*. SVB's certificate failed. Sparesbox has closed. PartStream's domain is for sale. Polaris IndexTable now redirects to the shopify.dev overview, and the archive address is a 404. Refero shows six results and then *Log In or Sign Up to See All*. Grainger, DockMaster, Halfords and Marine Depot's list and brand pages were guessed addresses that 404'd.

**Stock frames opened for the notes:** `../../fitment/live/rockauto-parts.png` (a dense parts ledger with a small picture, maker, code link and price), `../../quotes/live/linear-display-options.png` (List/Board, Grouping, Sub-grouping, Ordering), `../../sheet/redesign/mcmaster-shackles.png` and `-scrolled.png` (gated, as above), and `../../levels/live/octopart-lm358.png` (a *PRESS & HOLD* bot check, so Octopart is not evidenced either).

**Read at the URL, not only seen in a frame:** the fitted-price footnotes of https://www.isuzuute.com.au/d-max/accessories ("Fitted RRP … Based on RRP for accessory, standard labour time and recommended hourly labour rate") and https://www.mazda.com.au/accessories/bt-50/ ("Recommended Fitted Price (RFP) … recommended fitting time and labour costs"), both read 2026-11-03.

## `live/`, 79 rows

| frame | URL (final) | what is there |
|---|---|---|
| `mcmaster-cleats.png` | https://www.mcmaster.com/products/cleats/ | FAILED (gate): *To continue browsing, please log in*. McMaster now requires sign-in to browse; not signed in. Opened. |
| `mcmaster-cleats-scrolled.png` | https://www.mcmaster.com/products/cleats/ | FAILED (gate), as above. Opened. |
| `digikey-toggle-filter.png` | https://www.digikey.com.au/en/products/filter/toggle-switches/196 | *Keylock Switches · Results: 17,491*, *Search Within*, then filter boxes (Manufacturer, Series, Packaging, Product Status …) before the table; *Sort By: Featured*, *Download Table*. Opened; cited. |
| `bluebottle-bla-brand.png` | https://bluebottlemarine.com/brands/BLA.html | A maker as a page: BLA's mark, *Showing 1894 results for "BLA"*, grid/list icons, *Best Sellers*; *Quotes* in the head beside Account and Cart. Opened; cited. |
| `bluebottle-anchors.png` | https://bluebottlemarine.com/categories/marine-products/anchor-winches/anchors.html/ | Blue Bottle's Anchors category. Not opened. |
| `boatwarehouse-anchors.png` | https://www.theboatwarehouse.com.au/categories/anchors-chain-fenders-buoys-mooring/anchors.html | *Anchors* with *Price: Descending* and grid/list icons; the Lewmar card's picture is *LEWMAR · Image coming soon…*. Opened; cited (avoid). |
| `marinedepot-sand-anchor.png` | https://www.marinedepot.com.au/anchor-sand-22lb-10kg | A BLA anchor: *Shop all BLA · Part No: BLA-146060* in small grey under the name, then the price. Opened; cited. |
| `defender-search-anchor.png` | https://www.defender.com/en_us/catalogsearch/result/?q=anchor | FAILED (bot check): title *Just a moment…* (Cloudflare challenge). Not fought, not opened. |
| `jamestown-home.png` | https://www.jamestowndistributors.com/ | Home hero *TOOLS & INSPIRATION FOR CRAFTSMEN*; a tracking-cookie card offering only *Accept* (not pressed). Opened; context only. |
| `svb-home (no frame)` | https://www.svb-marine.com/en/ | FAILED, no frame: `ERR_CERT_AUTHORITY_INVALID`. |
| `burnsco-home.png` | https://www.burnsco.co.nz/ | Burnsco NZ home: promo hero and photographed doors (Fishing, Motorhome). Opened; context only. |
| `repco-home.png` | https://www.repco.com.au/ | Repco home under a Qualtrics feedback modal; *My Vehicle* in the head. Opened; not cited. |
| `autosuperstore-home.png` | https://automotivesuperstore.com.au/ | FAILED (bot check): *Just a moment…*. Not opened. |
| `sparesbox-home.png` | https://www.sparesbox.com.au/ | FAILED: title *This E-Store Has Now Closed · Now Powering Repco*. Not opened. |
| `marineengine-yamaha.png` | https://www.marineengine.com/parts/yamaha-outboard-parts.php | FAILED (bot check): *Just a moment…*. Not opened. |
| `crowley-yamaha.png` | https://www.crowleymarine.com/yamaha/oem-parts/outboard | *Search Over 1 Million OEM Parts* with *Model, serial or part number*; *MY GARAGE* in the head; *Select your engine to find guaranteed-fit parts* as five dropdowns. Opened; cited. |
| `partstream-home.png` | https://www.partstream.com/ | FAILED: the domain is for sale. Opened. |
| `grainger-anchors.png` | https://www.grainger.com/category/fasteners/anchors | FAILED: *Whoops, we couldn't find that.* (address was a guess). Not opened. |
| `fastenal-fasteners.png` | https://www.fastenal.com/product/fasteners?categoryId=600000 | FAILED: *Access Denied*. Not opened. |
| `akeneo-product-grid.png` | https://help.akeneo.com/en_US/v2-take-the-power-over-your-products/83-v2-get-familiar-with-the-product-grid | *Get familiar with the product grid*: *1049 products*, columns ID · Image · Label · Family · Status · Complete % · dates, filter rail. Opened. |
| `akeneo-completeness.png` | https://help.akeneo.com/en_US/serenity-your-first-steps-with-akeneo/serenity-understand-product-completeness | *Understand product completeness*: the red/orange/green bar and the percentage on the grid. Opened. |
| `polaris-index-table.png` | https://shopify.dev/docs/api/polaris | FAILED: redirected to *Polaris references* (shopify.dev); no IndexTable. Opened. |
| `polaris-index-table-scrolled.png` | https://shopify.dev/docs/api/polaris | FAILED, same redirect. Not opened. |
| `polaris-index-filters.png` | https://shopify.dev/docs/api/polaris | FAILED, same redirect. Opened. |
| `shopify-bulk-editor.png` | https://help.shopify.com/en/manual/products | FAILED: redirected to the *Products* overview (text only). Opened. |
| `shopify-products.png` | https://help.shopify.com/en/manual/products | Same page as above. Not opened. |
| `shopify-product-media.png` | https://help.shopify.com/en/manual/products/product-media | *Product media*, text with a caution box; no screen shown. Opened; not cited. |
| `stripe-product-catalog.png` | https://docs.stripe.com/products-prices/overview | *Overview: Model your business on Stripe with products and prices*, cards only. Opened; not cited. |
| `dockmaster-parts.png` | https://www.dockmaster.com/parts-inventory-management | FAILED: *404 – You've Drifted Off Course* (address was a guess). Opened. |
| `goodui-list-or-grid.png` | https://goodui.org/patterns/37 | *Pattern #37: List Or Grid View*, *Tested 9 times*; the result is for members only. Opened; not cited. |
| `lightspeed-dms-parts.png` | https://www.lightspeeddms.com/solutions/parts/ | Lightspeed DMS parts marketing: copy and a photo of parts bins; no screen. Opened; not cited. |
| `apple-accessories-compat.png` | https://www.apple.com/au/shop/accessories/all | *Accessories* with a row of device pictures (iPhone, iPad, Mac …) as doors. Opened. |
| `apple-accessories-compat-scrolled.png` | https://www.apple.com/au/shop/accessories/all | A docked *Accessories · Explore* bar over a carousel. Opened. |
| `polaris-archive-index-table.png` | https://storybook.polaris.shopify.dev/components/tables/index-table | FAILED: *Page not found · GitHub Pages*. Not opened. |
| `polaris-archive-index-table-scrolled.png` | https://storybook.polaris.shopify.dev/components/tables/index-table | FAILED, as above. Not opened. |
| `polaris-archive-index-filters.png` | https://storybook.polaris.shopify.dev/components/selection-and-input/index-filters | FAILED, as above. Not opened. |
| `akeneo-grid-display.png` | https://help.akeneo.com/en_US/v2-take-the-power-over-your-products/83-v2-get-familiar-with-the-product-grid | Scrolled 1,500: locale and channel context over the grid. Opened. |
| `akeneo-grid-filters.png` | https://help.akeneo.com/en_US/v2-take-the-power-over-your-products/83-v2-get-familiar-with-the-product-grid | Scrolled 3,200: *To use the Gallery display … Click on List*, the *DISPLAY · List · Gallery* menu, *Search on Label or identifier*, rail filter *PICTURE is not empty*. Opened; cited, primary for (c). |
| `akeneo-grid-search.png` | https://help.akeneo.com/en_US/v2-take-the-power-over-your-products/83-v2-get-familiar-with-the-product-grid | Scrolled 4,800: *Category panel*, the tree counted (*Master catalog (1239) · TVs and projectors (219) · Cameras (300)*). Opened; cited, primary for (b). |
| `akeneo-grid-columns.png` | https://help.akeneo.com/en_US/v2-take-the-power-over-your-products/83-v2-get-familiar-with-the-product-grid | Scrolled 6,400: *View unclassified products*, added automatically, cannot be removed; *unclassified products are not exported*. Opened; cited. |
| `akeneo-completeness-grid.png` | https://help.akeneo.com/en_US/serenity-your-first-steps-with-akeneo/serenity-understand-product-completeness | Scrolled 1,300: completeness as a percentage in the product grid. Opened. |
| `digikey-toggle-table.png` | https://www.digikey.com.au/en/products/filter/toggle-switches/196 | Scrolled 720: the ledger. Thumbnail, code link, description, maker italic link, *1 : $5.82000 Bulk*, ▲▼ on every column; 9 rows in 900 px. Opened; cited, primary for (b). |
| `bluebottle-bla-list (no frame)` | https://www.bluebottlemarine.com/brands/BLA.html | FAILED, no frame: the list icon did not answer the click. |
| `bluebottle-bla-grid-scrolled.png` | https://bluebottlemarine.com/brands/BLA.html | Scrolled: counted rail (*Deck Hardware (316) …*), cards with *SKU: 136030-1-BLA*. Opened; cited. |
| `boatwarehouse-anchors-list.png` | https://www.theboatwarehouse.com.au/categories/anchors-chain-fenders-buoys-mooring/anchors.html | List view: maker, name, *RRP ~~$5,452.50~~ Our Price $5,023.00*, *CHOOSE OPTIONS*; the Lewmar *Image coming soon…*. Opened; cited (avoid). |
| `crowley-yamaha-scrolled.png` | https://www.crowleymarine.com/yamaha/oem-parts/outboard | *Search Yamaha Outboard Parts by Year / Cylinders / Horsepower* as rows of plain pressable figures. Opened; cited. |
| `lightspeed-dms-parts-scrolled.png` | https://www.lightspeeddms.com/solutions/parts/ | Marketing copy and an FAQ. Opened; not cited. |
| `repco-my-vehicle (no frame)` | https://www.repco.com.au/ | FAILED, no frame: the feedback modal's close did not answer. |
| `digikey-product-index.png` | https://www.digikey.com.au/en/products | *Product Index*: category heads with sub-categories in two columns, each with a grey *N items*. Opened; cited. |
| `digikey-search-maker-word.png` | https://www.digikey.com.au/en/products/result?s=N4IgTCBcDaIOYEMBOBbAlgOxAXQL5A | Search `garmin`: *Showing 45 Results*, *Top Results* grouped by category with counts. Opened; cited. |
| `apple-iphone-cases-compat.png` | https://www.apple.com/au/shop/iphone/accessories/cases-protection | *iPhone Accessories / Cases & Protection*; chips *Accessory Type · Compatibility · Brand · Colour · Material · Only at Apple*, *Sort By*. Opened; cited. |
| `apple-iphone-cases-compat-scrolled.png` | https://www.apple.com/au/shop/iphone/accessories/cases-protection | Scrolled 900: the chip row docked at the top over the grid. Opened; cited, primary for (a). |
| `halfords-batteries.png` | https://www.halfords.com/motoring/car-batteries/ | FAILED: *Sorry, page not found* (address was a guess). Opened. |
| `tyroola-fitted.png` | https://www.tyroola.com.au/ | *Buy tyres online. Fit locally. Done.*; *Search for tyres by Tyre Size · Rego*. Opened; not cited. |
| `bluebottle-quotes.png` | https://bluebottlemarine.com/quote/ | The *Quote* page: empty without an account. Opened; cited (only the door is evidenced). |
| `marinedepot-sand-anchors-list.png` | https://www.marinedepot.com.au/boat-anchors-docking/boat-anchors/sand-anchors | FAILED: *Page Not Found* (address was a guess). Opened. |
| `marinedepot-brand-bla.png` | https://www.marinedepot.com.au/brands/bla | FAILED: *Page Not Found* (address was a guess). Opened. |
| `toyota-hilux-acc-list.png` | https://www.toyota.com.au/hilux/accessories | Scrolled 2,200: a lifestyle photograph and *All accessories sold separately*; no prices in view. Opened; not cited. |
| `isuzu-dmax-accessories.png` | https://www.isuzuute.com.au/d-max/accessories | Tabs *EXTERIOR FRONT & SIDE · EXTERIOR REAR · ROOF & INTERIOR*; cards *POLISHED ALLOY BULL BAR · FROM $4,313.35\**; footnote (read at the URL) *Fitted RRP … standard labour time and recommended hourly labour rate*. Opened; cited. |
| `mazda-bt50-accessories.png` | https://www.mazda.com.au/accessories/find-accessories/bt-50/?bodyStyle=Dual%20Cab&category=All%20Accessories | Scrolled 900: cab tabs, category chips, cards *Bonnet Protector $230‡*. Opened. |
| `ford-ranger-accessories.png` | https://www.ford.com.au/accessories/ranger/ | FAILED: *Access Denied*. Not opened. |
| `openrefine-cluster.png` | https://openrefine.org/docs/manual/cellediting | *Cluster and edit*: "Clustering always requires the user to approve each suggested edit". Opened. |
| `akeneo-product-link-rules.png` | https://help.akeneo.com/akeneo-dam-prepare/the-basics-of-transformations-and-product-link-rules | *Product Link Rules*: "the part of the filename before the dash is the SKU"; *Naming Convention*. Opened; cited, primary for (c). |
| `akeneo-product-link-rules-scrolled.png` | https://help.akeneo.com/akeneo-dam-prepare/the-basics-of-transformations-and-product-link-rules | The naming-convention form (Source · Pattern · abort on error) and *ADD A RULE*. Opened; cited. |
| `tyroola-size-list.png` | https://www.tyroola.com.au/tyre/size/265-65r17/nsw/ | *Size 265 65r17 Tyre Prices*: *Sorry, no results found.* Opened; not cited. |
| `openrefine-cluster-dialog.png` | https://openrefine.org/docs/manual/cellediting | The *Cluster & edit* dialog: cluster size, row count, values, *Merge?*, *New cell value*. Opened; support only (the review sweep used it first). |
| `mazda-bt50-accessories-top.png` | https://www.mazda.com.au/accessories/find-accessories/bt-50/?bodyStyle=Dual%20Cab&category=All%20Accessories | *‹ CHANGE MODEL*, *BT-50 ACCESSORIES*, *Dual Cab · Single Cab · Freestyle Cab*, chips *All Accessories … Trays ›*, cards *$230‡ · Learn more*; final URL carries `bodyStyle` and `category`. Opened; cited, primary for (a). |
| `digikey-toggle-844x390.png` | https://www.digikey.com.au/en/products/filter/toggle-switches/196 | 844 × 390: filters and a cookie banner fill the window; no part visible. Opened; cited (avoid). |
| `apple-iphone-cases-844x390.png` | https://www.apple.com/au/shop/iphone/accessories/cases-protection | 844 × 390, scrolled 700: the chip row docked. Opened; cited. |
| `mazda-bt50-844x390.png` | https://www.mazda.com.au/accessories/find-accessories/bt-50/?bodyStyle=Dual%20Cab&category=All%20Accessories | 844 × 390: the *FIND BT-50 ACCESSORIES* hero and a sheet. Opened; cited (avoid). |
| `digikey-toggle-834x1112.png` | https://www.digikey.com.au/en/products/filter/toggle-switches/196 | 834 × 1112: filters first; the table head near the foot. Opened; cited (avoid). |
| `apple-iphone-cases-834x1112.png` | https://www.apple.com/au/shop/iphone/accessories/cases-protection | 834 × 1112, scrolled: the chip row docked, three columns. Opened; cited. |
| `mazda-bt50-834x1112.png` | https://www.mazda.com.au/accessories/find-accessories/bt-50/?bodyStyle=Dual%20Cab&category=All%20Accessories | 834 × 1112: the hero fills the window. Opened; cited (avoid). |
| `digikey-toggle-1280x800.png` | https://www.digikey.com.au/en/products/filter/toggle-switches/196 | 1280 × 800: filters, then *Showing 1 - 25 of 17,491* at the foot; no row. Opened. |
| `apple-iphone-cases-1280x800.png` | https://www.apple.com/au/shop/iphone/accessories/cases-protection | 1280 × 800, scrolled: the chip row docked, three columns. Opened. |
| `mazda-bt50-1280x800.png` | https://www.mazda.com.au/accessories/find-accessories/bt-50/?bodyStyle=Dual%20Cab&category=All%20Accessories | 1280 × 800: the hero, then *CHANGE MODEL* and the aisle title low in the window. Opened. |
| `digikey-toggle-1920x1080.png` | https://www.digikey.com.au/en/products/filter/toggle-switches/196 | 1920 × 1080: filters, then only the table head. Opened; cited (avoid). |
| `apple-iphone-cases-1920x1080.png` | https://www.apple.com/au/shop/iphone/accessories/cases-protection | 1920 × 1080, scrolled: the chip row docked. Opened. |
| `mazda-bt50-1920x1080.png` | https://www.mazda.com.au/accessories/find-accessories/bt-50/?bodyStyle=Dual%20Cab&category=All%20Accessories | 1920 × 1080: the hero fills the window. Opened; cited (avoid). |

## `hand/`, 7 rows

| frame | URL (final) | what is there |
|---|---|---|
| `digikey-toggle-390.png` | https://www.digikey.com.au/en/products/filter/toggle-switches/196 | 390: the search, *Keylock Switches · Results: 17,491*, and two filter boxes cut at the right edge. Opened; cited (avoid). |
| `digikey-toggle-390-scrolled.png` | https://www.digikey.com.au/en/products/filter/toggle-switches/196 | 390, scrolled: the ledger as stacked cells (thumbnail, code, description, maker) in about 370 px; price columns scroll sideways. Opened; cited. |
| `bluebottle-bla-390.png` | https://bluebottlemarine.com/brands/BLA.html | 390: two cards a row, SKU, option selects and prices. Opened. |
| `boatwarehouse-anchors-390.png` | https://www.theboatwarehouse.com.au/categories/anchors-chain-fenders-buoys-mooring/anchors.html | 390: one card a row, maker, name, *RRP / Our Price*. Opened. |
| `apple-iphone-cases-390.png` | https://www.apple.com/au/shop/iphone/accessories/cases-protection | 390: the chips folded to one *Filter* button beside *Sort By: Featured*. Opened; cited. |
| `crowley-yamaha-390.png` | https://www.crowleymarine.com/yamaha/oem-parts/outboard | 390: *MY GARAGE* kept in the head; *Model, serial or part number*. Opened; cited. |
| `marinedepot-sand-anchor-390.png` | https://www.marinedepot.com.au/anchor-sand-22lb-10kg | 390: *Shop all BLA · Part No: BLA-146060* under the name. Opened; cited. |

## `gallery/`, 6 rows

| frame | URL (final) | what is there |
|---|---|---|
| `refero-product-catalog.png` | https://refero.design/search?q=product%20catalog | FAILED (gate): six unrelated results (Teal, Bloomberg), then *77,007 more pages hidden · Log In or Sign Up*. Opened. |
| `refero-inventory.png` | https://refero.design/search?q=inventory | FAILED (gate): the query was not applied, and the same gate appears. Opened. |
| `dribbble-inventory.png` | https://dribbble.com/tags/inventory_management | *Inventory Management*: concept shots with invented figures (*88 %*, *24 %*, *7842*). Opened; cited (avoid). |
| `dribbble-product-catalog.png` | https://dribbble.com/tags/product_catalog | *Product Catalog*: furniture and fashion concept shots. Opened; not cited. |
| `awwwards-ecommerce.png` | https://www.awwwards.com/websites/e-commerce/ | *E-Commerce (6400)*: landing-page heroes; a cookie card offering only *GOT IT* (not pressed). Opened; not cited. |
| `nicelydone-tables.png` | https://nicelydone.club/examples/tags/table | *Table screen examples*: Polar billing and a Dock AI table; nothing on catalogues. Opened; not cited. |
