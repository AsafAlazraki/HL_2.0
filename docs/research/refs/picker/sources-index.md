# Picker — every frame, its address and what it shows

Driven 2026-09-17 with `npx tsx tools/research/capture.ts picker <list>` at 1440 × 900.
**76 sources driven · 72 frames on disk · 70 distinct images.** Two byte-identical pairs, both
proving a failure rather than a view: `searay-models.png` = `searay-boats.png` (the same 404 at two
addresses) and `porsche-911-models-scrolled.png` = `porsche-911-models.png` (a 404, so the scroll
never happened). Four sources produced no frame at all and are listed with their error.

Frames live in `docs/research/refs/picker/` (gitignored; the durable copy is mirrored to
`C:\Users\Asaf\dev\hl-refs\hl2\picker\`). The ledger the tool wrote is `sources.json` beside them;
it was merged by hand after two capture runs overlapped, so its row order is not chronological.

**Honesty about the run: 39 of the 76 are 404s, bot walls, consent modals, certificate errors or
redirects to somewhere else — 37 usable frames.** Every failure
is named below with its reason, and nothing in `notes.md` is claimed from any of them except as a
negative. A row marked *Listed, not opened* is a frame nothing in `notes.md` cites.

## Stock re-read for this screen (not re-driven)

| frame | what it actually is |
|---|---|
| `…\hl-refs\ref\boats\axopar-1.png` | Real. CONFIGURE YOUR NEXT AXOPAR, then per-model rows of three side-profile renders on white. Still live practice — `picker/axopar-configurator.png` is the same shape today. |
| `…\hl-refs\ref\boats\highfield-2.png` | Real. Four Highfield ranges across 1440 as renders on white, each with a one-line promise. |
| `…\hl-refs\ref\boats\highfield-sp560-2.png` | **Byte-identical to `highfield-2.png`** (sha1 `f0e7b94b…`). The stock's "SP560" set contains no model page: `-1` is the Highfield home, `-3` is the second range row plus a stories band. |
| `…\hl-refs\ref\boats\stabicraft-2.png` | Real. Two named doors over one aerial: EXPLORE MODELS BY **SIZE RANGE** / **STYLE SERIES**. |
| `…\hl-refs\ref\boats\zodiac-2.png` | Real. OUR RANGES as a one-at-a-time carousel: the range name huge behind the render, a puck of the next range peeking off the right edge, a seven-dot pager. |
| `…\hl-refs\ref\porsche-finder-1.png` | Real. Counted facets, an applied-filter chip with an ×, and a result card whose price reads `$457,457` with `Drive Away Price¹` beside it. |
| `…\hl-refs\ref\porsche-1440.png` | **Not the configurator.** It is Porsche's discontinued-model refusal: "This Model is No Longer Available in the Porsche Configurator", a sentence saying why, one black "→ Choose from the latest models", and an error id in small text. |
| `…\hl-refs\ref\tables\apple-compare.png` | Real. Three model selects, each over a picture, a swatch row with the chosen swatch ringed and its name spelled beneath, then "From A$1,049 or from A$87.42/mo". |
| `…\hl-refs\ref\tables\porsche-compare.png` | A Porsche 404. |
| `…\hl-refs\ref\tables\mercury-compare.png` | A Cloudflare block page ("Sorry, you have been blocked"). |
| `…\hl-refs\ref\tables\boatsales-list.png` | A bot wall ("You have been blocked"). |
| `…\hl-refs\ref\boats\saxdor-2.png` | A news feed, not a model list. |
| `…\hl-refs\ref\boats\nimbus-1.png`, `nimbus-2.png` | Nimbus's own 404 page. |
| `…\hl-refs\ref\boats\williams-2.png` | A Cloudflare "Verify you are human" challenge. |

## Prior sweeps re-read (frames already on disk, opened for this one)

| frame | what it shows |
|---|---|
| `docs/research/refs/home/live/saxdor-models.png` | Index and stage: the left column of six model lines and fifteen models, the hovered one gold, one large render filling the right two-thirds, a navy DISCOVER block. |
| `docs/research/refs/home/live/williams-tenders.png` | Three tiers in one window: a rail of seven ranges, a column of two sizes with tiny top-down silhouettes, and a panel of promise, facts and two acts. |
| `docs/research/refs/home/live2/mastercraft-boat-finder.png` | A named BOAT FINDER: five questions as a top rail (Activities · Crew · Bow · Lifestyle · Length) with a black **0 RESULTS** counter at its right end, six photographic choice tiles, and a greyed CONTINUE with no sentence. |
| `docs/research/refs/home/live2/quicksilver-range.png` | Quicksilver's 404 — the same page my own re-drive produced. Not usable by either sweep. |
| `docs/research/refs/home/live2/rolex-configure.png` | Akamai "Access Denied". |
| `docs/research/refs/home/live2/tesla-design-studio.png` | Akamai "Access Denied". |

## Driven for this sweep

| frame | address | what it shows |
|---|---|---|
| `nimbus-models.png` | <https://www.nimbus.se/en/boats> | 404. Nimbus has moved off nimbus.se; the frame is their own lost-at-sea page. |
| `nimbus-build.png` | <https://www.nimbus.se/en/build-your-nimbus> | 404, the same page. |
| `zodiac-range.png` | <https://www.zodiac-nautic.com/en/our-boats/> | 404 ("Page non trouvee"). |
| `zodiac-range-scrolled.png` | <https://www.zodiac-nautic.com/en/our-boats/> | 404, scrolled. Listed, not opened; nothing is claimed from it. |
| _(no frame)_ | <https://axoparboats.com/models/> | FAILED: ERR_NAME_NOT_RESOLVED — axoparboats.com no longer resolves. |
| _(no frame)_ | <https://axoparboats.com/models/> | FAILED: the same. |
| `saxdor-models.png` | <https://saxdoryachts.com/models/> | Real. Six MODEL LINE headings and fifteen models as plain text in one left column, no pictures, no scroll. The consent card offers only Accept. |
| `highfield-range.png` | <https://www.highfieldboats.com/event/boats-a-float-spring-show/> | Redirected to an event page. Not the range. |
| `highfield-sport.png` | <https://www.highfieldboats.com/wp-content/uploads/2020/11/sport.jpg> | Redirected to a raw JPEG (sport.jpg, 768x768). |
| `highfield-sp560.png` | <https://www.highfieldboats.com/> | Redirected to the Highfield home — there is no SP560 model page at that path. |
| `stacer-range.png` | <https://www.stacer.com.au/aluminium-boat-range/> | 404; the trailing slash breaks it. The floating BUILD MY BOAT pill survives even the 404. |
| `stacer-range-scrolled.png` | <https://www.stacer.com.au/aluminium-boat-range/> | 404, scrolled. Listed, not opened. |
| `whaler-models.png` | <https://www.bostonwhaler.com/en_US/boats.html> | 404 over a beach photograph, the red BUILD block still in the nav. |
| `searay-models.png` | <https://www.searay.com/models.html> | 404. Byte-identical to searay-boats.png. |
| `gradywhite-models.png` | <https://www.gradywhite.com/explore/> | Real (redirected to /explore/). A kind row — CENTER CONSOLES / DUAL CONSOLES / WALKAROUND CABINS / EXPRESS CABINS / COASTAL EXPLORERS, active underlined — over photographic cards. The consent card offers only Preferences and Accept. |
| _(no frame)_ | <https://www.brabus-marine.com/en/models> | FAILED: ERR_CERT_COMMON_NAME_INVALID. |
| `williams-range.png` | <https://www.williamsjettenders.com/ranges/> | 404. The live Williams evidence is the home sweep frame instead. |
| `deantonio-models.png` | <https://www.deantonioyachts.com/models> | 404. |
| `beneteau-power.png` | <https://www.beneteau.com/#redirect=beneteau> | Consent modal over the whole page; CONTINUE WITHOUT ACCEPTING is a small underlined link while two filled buttons sit below. The page was never seen. |
| `jeanneau-boats.png` | <https://www.jeanneau.com/boats> | 404. |
| `quicksilver-boats.png` | <https://www.quicksilver-boats.com/en/boats> | 404 — the same dead end the home sweep recorded as quicksilver-range. |
| `stabicraft-models.png` | <https://stabicraft.com/au/models/> | 404 ("PAGE NOT FOUND / OOPS!"). |
| `stabicraft-models-scrolled.png` | <https://stabicraft.com/au/models/> | 404, scrolled. Listed, not opened. |
| `surtees-boats.png` | <https://www.surteesboats.com/boats> | 404. |
| `formosa-boats.png` | <https://www.formosamarineboats.com.au/boats/> | 404. |
| `haines-boats.png` | <https://hainessignature.com.au/models/> | 404. |
| `nimbus-boats.png` | <https://nimbusboats.com/boats/> | A press archive under an outdated-browser modal. Not the model chooser. |
| `nimbus-builder.png` | <https://builder.nimbusboats.com/?lang=en> | Real, and the best builder entry found: title left, YOUR BOATS outlined top right, 4-up photographic cards, each ending "A DEALER IN YOUR AREA WILL PROVIDE A QUOTE." beside a live outlined BUILD. |
| `zodiac-boats.png` | <https://www.zodiac-nautic.com/en/boats/> | Real. Range-page head: title left, photograph band right, then the range name huge beside its render. |
| `zodiac-comparator.png` | <https://www.zodiac-nautic.com/en/comparator/> | Real, and empty: three identical blue "Your boat" selects and four hundred pixels of white. No sentence. |
| `zodiac-configure.png` | <https://configure.zodiac-nautic.com/> | Real. "CHOOSE THE RANGE YOU WANT TO CONFIGURE", only the two ranges that can actually be built, and a saved-configuration code field beneath. |
| `zodiac-pleasure.png` | <https://www.zodiac-nautic.com/en/boats/pleasure/> | Real. A use-led door (PLEASURE MOTORBOATS) with a paragraph and two photographs; FISHING BOATS is the next band. |
| `highfield-sport-range.png` | <https://www.highfieldboats.com/boat/the-sport-range/> | Real. Full-bleed photograph, THE SPORT RANGE in heavy white caps lower-left, the one-line promise beneath. No card, no veil. |
| `highfield-classic-range.png` | <https://www.highfieldboats.com/boat/the-classic-range/> | Real. The same shape, with "Extra level of comfort" as the promise. |
| `stacer-range2.png` | <https://www.stacer.com.au/aluminium-boat-range> | Real. BOAT RANGE hero, then FIND YOUR STACER whose prose claims "over 70 models" and "9 ranges" — the file carries 91 rows in 22 series. The BUILD MY BOAT pill clips the paragraph. |
| `stacer-seamasters.png` | <https://www.stacer.com.au/aluminium-boat-range/sea-masters> | Real, and the closest published shape to our series tier: five models as studio side profiles on white, the number large with the series name grey beneath, active underlined red, a three-dot pager. |
| `stabicraft-size-ranges.png` | <https://stabicraft.com/size-ranges/> | Real. A numeric ladder — 2750 2500 2350 2250 2100 2050 1850 1550 1450 — as the page navigation, active underlined red. |
| `stabicraft-style-series.png` | <https://stabicraft.com/style-series/> | Real. The same component on the other axis: ULTRA CENTRECAB, ULTRACAB, SUPERCAB, TREKER, FISHER, FRONTIER, EXPLORER. |
| `stabicraft-2100.png` | <https://stabicraft.com/the-boats/2100-supercab/> | Real. Model page: running photograph, number in red over the name in white, and a foot rail of sections with GET QUOTE at its right end. |
| `axopar-boat-models.png` | <https://www.axopar.com/boat-models/> | Blank: "Application error: a client-side exception has occurred while loading www.axopar.com." |
| `axopar-configurator.png` | <https://www.axopar.com/configurator/> | Real, and the same shape as the stock axopar-1.png: a per-model heading, a sentence, then that model’s variants as three side-profile renders in one row. |
| `surtees-range.png` | <https://www.surteesboats.com/our-range> | Real. OUR BOATS over a photograph, with a SEE OUR BOATS disclosure button rather than a list. |
| `surtees-770.png` | <https://www.surteesboats.com/our-range/boat/770-game-fisher> | Real, and the model page to beat: photograph, name, then OVERALL LENGTH 7700MM / HORSEPOWER 200-350 HP / BMT DRY WEIGHT 2510KG as a grey fact strip with CUSTOMISE YOUR BOAT at its right end. |
| `haines-range.png` | <https://hainessignature.com.au/our-range/> | Real but empty above the fold: an "Our Range" hero, then a contact band. The range list is lazy. |
| `formosa-range.png` | <https://www.formosamarineboats.com.au/boat-range/> | Real. A red BUILD YOUR BOAT in the top row, then a black ground carrying the series wordmark as artwork over white plan-view hull outlines. |
| `jeanneau-capcamarat.png` | <https://www.jeanneau.com/boats/powerboat/39-cap-camarat> | Consent modal over the series page; the nine range names run across the header behind it. |
| `deantonio-builder.png` | <https://www.deantonioyachts.com/builder> | Real, and the find of the sweep for imagery: a builder whose model chooser is nothing but black-on-white side-profile line drawings with the code beneath, under one sentence — "Do it your way. Select a model and customize it." |
| `gradywhite-models2.png` | <https://www.gradywhite.com/explore/> | Real, scrolled. The card anatomy: photograph, name, paragraph, then LENGTH / BEAM / MAX HP as a three-column strip with hairline dividers, then a full-width Explore pill. No price. |
| `porsche-models.png` | <https://www.porsche.com/australia/models/> | Real, and the one to beat. Title pair; "Load saved configuration" top right; a left rail of counted radios — All (72), 718 (2), 911 (20), Taycan (14), Panamera (6), Macan (5), Cayenne (25) — over collapsed facets; the car on the ground overlapping a white card of name, fact pills and three figure/label pairs. |
| `porsche-911-models.png` | <https://www.porsche.com/australia/models/911/911-models/> | 404. |
| `porsche-911-models-scrolled.png` | <https://www.porsche.com/australia/models/911/911-models/> | 404, byte-identical to the unscrolled frame, so the scroll never happened. |
| `porsche-finder.png` | <https://finder.porsche.com/au/en-AU> | Real. The Finder’s first step: one question, "Choose a model series.", and 2-up white cards each carrying the series wordmark as artwork over a silver side profile. |
| `polestar-cars.png` | <https://www.polestar.com/au/> | Real. The four models ARE the nav; there is no models page. A superscripted saving claim over a dark hero. |
| `rivian-r1s.png` | <https://rivian.com/r1s> | Real. The model name huge on a photograph, "Leasing from $1,239/mo*" with "* Disclosures" underlined beneath, two pills lower right. |
| `rivian-configurations.png` | <https://rivian.com/configurations/list?SORT=Featured&MODEL=R1S&INVENTORY_TYPE=NEW_VEHICLE_CONFIG&TRANSFER_FEE=ALL_MATCHES&PROMOTION=ALL_MATCHES> | Real, and a warning: a postal-code gate over skeleton cards, with a greyed Continue. |
| `lucid-air.png` | <https://lucidmotors.com/air> | Real. "Buy from $70,900" with a footnote mark, under a consent bar offering only ACCEPT ALL and COOKIE SETTINGS. |
| `bmw-all-models.png` | <https://www.bmw.com.au/en/all-models.html> | Consent modal with Analytics and Marketing pre-toggled to "Allowed". The page was never seen. |
| `lotus-models.png` | <https://www.lotuscars.com/en-GB> | Real. The model name in yellow tracked caps on a studio hero, one yellow DISCOVER, a two-dot pager. |
| `apple-buy-mac.png` | <https://www.apple.com/shop/buy-mac> | Real. A pill rail of model families over a quick-look panel: name, "Buy from $699 or $58.25/mo. for 12 mo." in one sentence beside a Buy pill, a six-dot pager, "Available in 4 colors" with the names written out, then six icon-and-sentence rows. |
| `apple-buy-mac-scrolled.png` | <https://www.apple.com/shop/buy-mac> | Scrolled. Listed, not opened. |
| `apple-mac-compare.png` | <https://www.apple.com/mac/compare/> | Real. Three model selects side by side, each over a picture, a swatch row with the chosen swatch ringed and its name spelled beneath, then "From A$1,049". Three doors above: Shop Mac, Chat with a Specialist, Help Me Choose. |
| `apple-watch-studio.png` | <https://www.apple.com/watch/?collectionName=apple-watch> | Redirected to the Watch overview: a horizontal rail of eleven pucks, each a tiny picture with a name and an orange New tag, then "Explore the lineup." with "Compare all models" at the right. |
| `framework-laptop13.png` | <https://frame.work/au/en/laptop13> | Real. One model, a two-line claim, one sentence of what changed, one orange Configure now. The families are the nav. |
| `framework-marketplace.png` | <https://frame.work/au/en/marketplace> | Real, and the counted register to beat: a search field, "563 results" beneath it, every category carrying its count, a chip row of saved views, and a section head reading "Framework Laptop / 16 items" over cards priced "Starting at $1,159". |
| `hermanmiller-aeron.png` | <https://www.hermanmiller.com/en_au/products/seating/office-chairs/aeron-chair/> | Real. Designer credit as eyebrow, the name, the product on grey, then a white strip of three doors (3D Models, Materials, Dimensions) under a section rail whose right end is Contact a Dealer. |
| `bo-speakers.png` | <https://www.bang-olufsen.com/en/au/speakers> | Real, and the answer to colourways: "All speakers (42)", a kind row, then five tiles that are five finishes of one model, each with its own price and the line "5 Colours" plus a small plus button. |
| `toyota-hilux-variants.png` | <https://www.toyota.com.au/hilux/variants> | 404. |
| `toyota-hilux-variants-scrolled.png` | <https://www.toyota.com.au/hilux/variants> | 404, scrolled. Listed, not opened. |
| `whaler-boats.png` | <https://www.bostonwhaler.com/us/en/boats/> | A real page made unusable: a newsletter modal asking first name, last name, email, country and postcode over "Our Boat Models". Nothing was typed. |
| `searay-boats.png` | <https://www.searay.com/boats.html> | 404 over an aerial. Byte-identical to searay-models.png. |
| _(no frame)_ | <https://www.brabus-marine.com/> | FAILED: ERR_CERT_COMMON_NAME_INVALID on the apex domain too. |
| `hilux-grades.png` | <https://www.toyota.com.au/hilux> | Real. Model name and a one-line claim centred over three trucks; a section rail beneath the nav (Range, Accessories, Personalise, Prices, Specifications, For Business) with Contact a Dealer at its right. |
| `dmax-models.png` | <https://www.isuzuute.com.au/d-max/overview> | Real. A model-scoped second nav (OVERVIEW, PERFORMANCE, DESIGN, TECH, SAFETY, TOWING, RANGE, ACCESSORIES, CUSTOMISE) with a red BUILD & QUOTE block at its right end, over a video hero. |
| `ranger-models.png` | <https://www.ford.com.au/commercial/ranger/> | Access Denied. |
| `highfield-au-range.png` | <https://www.highfieldboats.com/> | Redirected to the Highfield home; there is no separate Australian range site at that address. |
| `northside-new-boats.png` | <https://www.northsidemarine.com.au/new-boats/> | 404 on the dealership’s own site, showing its mark in white on navy with the yellow script tagline. |
