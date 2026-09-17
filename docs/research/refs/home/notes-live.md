# Home — live drive (boat brands, car brands, premium retail, the best registers)

Sweep date 2026-09-16/17. Frames: `docs/research/refs/home/live/*.png` (gitignored; mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\home\live\`). Ledger: `docs/research/refs/home/live/sources.json` — every capture with its final URL and page title. Driven headless at 1440×900 with `tools/research/capture.ts`. Consent banners were answered with the most privacy-preserving button present; where a site offered only "Accept" (Saxdor, Grady-White, Lucid) nothing was pressed and the banner stays in the frame. Nothing was signed into, no account was created, nothing was typed.

**The screen's job.** Greet the dealer; show what they sell (kinds) and their brands, photographed; open drafts; one primary act, New quote; search (Ctrl K). The old home dashboard was hated and its bottom bar called disgusting — so this sweep was read for *how a range is shown and entered*, not for how a dashboard is arranged.

**On motion.** A still cannot time an animation. Where a pause control, a carousel pager, a progress bar or a scroll hint is visibly present in the frame, that is reported as a control that exists — not as a duration or a curve. Nothing below claims motion that was not visible in the capture.

**One finding worth stating before the entries.** Across all 37 sites driven, **not one has a bottom action bar**, and not one opens on a grid of numbers. The primary act is either a single button in the header (Whaler's BUILD corner, Williams' "Build My Tender", Bentley's CONFIGURATOR, Aston's "Configure"), a small arrowed link (Axopar's "Configurate →"), or a pair of acts attached to each model card (Explore / Build). The dealer's home can take the same shape with a clear conscience.

---

## The ranked six for this screen

1. **Nimbus — the Models flyout** (`nimbus-home-models`) — kinds as a plain filter row (All models · Commuter · Coupé Cruisers · Day Cruisers · Tender · Weekender), then a 3-up grid of full-bleed on-water photographs where each tile carries its kind as an eyebrow, the model name large, and a one-line promise. It answers "what they sell, photographed" completely, on one screen, with no card chrome at all.
2. **Williams Jet Tenders — the range page** (`williams-tenders`) — a left index of ranges, a middle column of models each led by a tiny plan-view silhouette, and a right panel with the range's promise, its facts in plain words, and two acts ("Discover More", "Build My Tender"). Brands, models and the primary act on one screen without scrolling, with the photograph as the ground rather than the content.
3. **Apple Store** (`apple-store`) — the greeting is one display word ("Store") at the left against a right-aligned sentence, and the kinds are a *rail of nine small photographed pucks*, not nine big tiles; the cards below carry a real from-price with its footnote marker.
4. **Mercedes-Benz model overview** (`mercedes-models`) — the brand is a checkbox carrying its own mark (Mercedes-Benz / AMG / MAYBACH), the sub-brand is the card's eyebrow, the rail's title is the true count ("45 models"), and a model with nothing to sell says "Coming soon" instead of a price.
5. **Nimbus "Build Your Nimbus"** (`nimbus-builder`) — the model card that refuses to invent a figure: a photograph, the year, the name, the sentence "A DEALER IN YOUR AREA WILL PROVIDE A QUOTE." and one act, BUILD. This is the exact honesty the price file demands of us.
6. **Craft** (`craft-home`) — open documents drawn as cards with their own coloured border and a preview of their actual contents, and a kinds row drawn as a line icon over a plain word for the families that have no photograph.

Runners-up for the board: **Polestar's model quadrant** (four models, four promises, eight arrowed acts, no chrome), **Saxdor's models page** (a fixed index of series ▸ model on the left, one large render on the right — fifteen models with no scroll), **Herman Miller's category row** (photograph of the object in its place, the word under it in sentence case), **Sea Ray's fact strip** (three measured figures under each hull), **Attio** (`Quick Actions ⌘K` shown as a row *inside* the rail), **Raycast** (the command window drawn honestly, with typed rows and a preview pane), **Polar / Linear** (the two-tone headline at one size: claim bright, elaboration grey).

---

## Boat brands

### Nimbus — `nimbus-home`, `nimbus-home-scrolled`, `nimbus-home-models`, `nimbus-builder`, `nimbus-builder-scrolled`
- Driven: https://www.nimbus.se/ and https://builder.nimbus.se/ (redirects to builder.nimbusboats.com).
- **Home, first view.** A full-bleed aerial film of a boat running past a park and a marina. Nav: a 3×3 dot glyph with the word "Models" pinned to the top-left corner, an EU region picker beside it, the burgee and the NIMBUS wordmark centred, "Search" and "Menu" (icon + word, both) at the right. The caption is at the *bottom centre*: "SINCE 1968" in small tracked caps, "Your Waters are waiting" in a light wide grotesk at about 52px, a hairline rule, then a **named chapter pager** — "1. Sport Tender 35 · 2. Your waters · 3. Sport Tender 42 · 4. Nimbus Sport Cruisers · 5. Nimbus 495 Coupé" — with the current stop in bold white and the rest dimmed.
- **Scrolled.** White ground, centred: "Sport Tender 35 Scandinavian. Crafted for Living." in the same light grotesk at about 44px, a grey three-line paragraph under it at about 20px, and one small outlined "Read more ▸". Then a pale-blue band beginning "Discover What's New".
- **The Models flyout.** Pressing "Models" opens the corner into a panel: a filter row of kinds with the active one underlined (All models · Commuter · Coupé Cruisers · Day Cruisers · Tender · Weekender), a welcome paragraph on grey at the right, and beneath, a 3-up grid of edge-to-edge photographs with hairline gutters. Each tile: kind as a small eyebrow, "Nimbus Boats | Sport Weekender 42" at about 24px, one promise ("Extend your weekends", "The all-year cabin boat", "Crafted for living"). The photograph darkens toward the top so the white type holds.
- **The builder.** A blue notice strip ("In Stock & Ready To Sail … VIEW INVENTORY"), then "Build Your Nimbus" at about 32px at the left with an outlined "YOUR BOATS" button at the right. A 4-up card grid: model year "2027" small at the top-left, the model name at about 20px beneath it, a country flag chip at the top-right, and along the bottom "A DEALER IN YOUR AREA WILL PROVIDE A QUOTE." in tiny caps beside an outlined "BUILD". Scrolled shows the full range including inboard/outboard pairs (Sport Coupé 42 Inboard / Outboard, Sport Tender 42 Inboard / Outboard).
- Pattern: **the corner drawer of models**; **the photographic tile with kind, name and promise**; **the card that names its own refusal to quote**.
- For this screen: the flyout is our "kinds and brands" in one gesture — the kinds are words, the models are photographs, and pressing a kind filters the photographs. The builder card is the answer to "no invented figure": where a price cannot be shown, a sentence says who will price it. "YOUR BOATS" is the drafts door, sitting beside the page title rather than in the nav.
- Avoid: the flag chips; four across at 1440 makes each photograph only ~150px tall and the boat becomes a smear; the "In stock" promo strip above the title; a hero pager of five when the file has one photographed hero.
- Imagery: entirely photographic, and the photographs are the page. Typographic only in the scrolled statement.

### Porsche Finder — `porsche-finder`, `porsche-finder-scrolled`
- Driven: https://finder.porsche.com/au/en-AU.
- Light-grey page. Minimal nav: "☰ Menu", the PORSCHE wordmark centred, favourites/saved/account icons. Centred title pair: "Find your Pre-Owned Porsche at your Porsche Centre near you." at about 30px over a quiet "Choose a model series." Then a **2-up grid of white rounded cards**: each card holds the model series' own *wordmark as artwork* (the 718 numeral, the 911 numeral, the Taycan and Panamera scripts), the plain name beneath it in small type, and a side-profile render on white. Scrolled: Macan and Cayenne, then a black pill "Browse all model series", then an app promotion.
- Pattern: **the series chooser where the mark is the content**.
- For this screen: a place (brand) chooser does not need a photograph if the brand has a mark — and our dealer's brands do. The plain name under the mark is what makes it a door rather than a logo wall.
- Avoid: two across at 1440 (six series need two scrolls); a card with no count and no from-price — ours can carry both honestly.
- Imagery: renders on white; the identity is typographic.

### Porsche.com home — `porsche-home`, `porsche-home-scrolled`
- Driven: https://www.porsche.com/australia/.
- Full-bleed film of a Cayenne on a circuit, a pause control at the bottom-right and a down-arrow hint centred. "Cayenne / Turbo Electric." in the Porsche face at about 64px at the left, one grey "Discover more" pill. Scrolled: three rounded photographic cards, each with a caption at the bottom-left and a **circular arrow button** at the bottom-right as the entire affordance (Macan Electric / PESC World Championship / Adventure Accessories); then "Your Porsche journey starts now." at about 44px, then 2-up model cards with the model wordmark laid over the photograph.
- Pattern: **the section head addressed to the person**; **the circle-arrow card**.
- For this screen: "Your Porsche journey starts now." is a greeting that does work — it names what the section is for. Our greeting can be the dealer's name and the same kind of sentence.
- Avoid: the marketing mix (racing, accessories) — our home has one job; a hero that is a film of something we do not own.
- Imagery: photographic throughout; type is quiet and large.

### Porsche model overview — `porsche-models`, `porsche-models-scrolled`
- Driven: https://www.porsche.com/australia/modelsoverview/.
- Title pair top-left: "Model overview" at about 34px over "Configure your dream Porsche". Top-right, a quiet line — "Do you already have a configuration?" — with a black **"Load saved configuration"** button under it. Left rail: "Model series" as radio rows each carrying a count — All (72), 718 (2), 911 (20), Taycan (14), Panamera (6), Macan (5), Cayenne (25) — a grey explanatory sentence, a disabled "Understand the differences" button, then collapsed groups (Body Design, Seats, Drive, Fuel type) and "Reset Filter". Centre column: "718 Cayman Model variants" as a heading, the render bleeding *above* a white rounded card that holds the name, a chip row (2024 · Petrol · Rear-Wheel Drive · Automatic/Manual), then three figures with their labels beneath (5.1 s Acceleration 0–100 km/h; 220 kW / 300 PS Power; 275 km/h Top speed), an underlined "Technical data and standard equipment" and a black "Explore in Detail".
- Pattern: **counts beside every filter word**; **the card that overlaps its own photograph**; **figure over label**.
- For this screen: "Do you already have a configuration? → Load saved configuration" is the drafts door written as a question, placed opposite the title. The counts are what our kinds and brands can carry truthfully from the manifest. The variant card is how a model shows three facts without a table.
- Avoid: the empty right third at 1440; the greyed "Understand the differences" with no sentence explaining why it is off — a silently disabled control is exactly what our rules forbid.
- Imagery: renders on grey; the page is a register, not a gallery.

### Riviera — `riviera-home`, `riviera-home-scrolled`
- Driven: https://www.rivieraaustralia.com/.
- A Google "Select Language" widget sits above everything. The hero is a photograph of two Belize 55s running; the nav is laid straight over the water in white tracked caps (MODELS · THE RIVIERA EXPERIENCE · REPRESENTATIVES · CONTACT) with the blue "R" banner hanging from the top-right corner like a burgee. Centred over the hulls: "A proud tradition" at about 40px, "The Belize 55 Sedan and Daybridge" beneath, an outlined "DISCOVER MORE NOW". Below on white: "Riviera - one of the world's finest fleets" at about 34px.
- Scrolled: a centred paragraph carrying real figures ("a proud 45-year history. From 39 to 78 feet, over 6,300 Riviera motor yachts…"), a solid blue "REQUEST A RANGE BROCHURE", then a **bento of five photographic doors** — Models and Latest News large on the top row, World Premiere / About Us / Representatives smaller beneath — each with a dark caption bar across the bottom of the photograph.
- Pattern: **the door bento with weighted tiles and a caption bar**.
- For this screen: the caption bar is the cheap, always-legible way to label a photograph (no gradient, no guessing). Weighting the tiles says which door matters. The paragraph of real figures is what a dealer's home can do with the manifest ("53 tables · 15,691 rows") instead of a stat tile.
- Avoid: the translate widget; white nav directly on moving water (contrast is marginal); grey caption bars on grey photographs.
- Imagery: photographic; the type is a plain humanist sans doing no work.

### Saxdor — `saxdor-home`, `saxdor-home-scrolled`, `saxdor-models`, `saxdor-models-mid`, `saxdor-models-scrolled`
- Driven: https://saxdoryachts.com/ and /models/.
- **Home.** A full-bleed aerial of the 460 GTS. Eyebrow "THE ALL-NEW SAXDOR 460 GTS" in a gold caps, then "MORE FREEDOM. / MORE SAXDOR." in a wide grotesk at about 46px, one outlined "DISCOVER THE 460 GTS". A cookie card at the bottom-right offers only "Accept" — left unanswered, so it is in every Saxdor frame. Scrolled: a two-column section head — "SAXDOR MODELS" as a gold eyebrow over "THE FLEET" at about 34px at the left, a paragraph at the right, and an outlined "EXPLORE ALL MODELS".
- **Models.** The one to keep: a **fixed left index beside a right stage**. The index lists model lines as headings ("460 MODEL LINE", "400 MODEL LINE", "340", "320", "270", "200") with their models beneath ("SAXDOR 460 GTS", "SAXDOR 460 GTC", "SAXDOR 400 GTO"…), the active model in gold; the stage holds one large white-ground render with a soft cast shadow and a navy "DISCOVER". Fifteen models and six series sit on one screen with no scrolling.
- Pattern: **index and stage** for a two-level hierarchy.
- For this screen: this is how series ▸ model reads at a glance. Our picker and our home's "brands" section can both use it; the stage is where the photograph lives, so the list stays plain text and fast to scan.
- Avoid: the stage's render is lazy-loaded — the first capture caught an empty stage, which is exactly the failure our hero must avoid (use a low-quality placeholder first); a consent card with no reject; gold on white at small sizes.
- Imagery: renders on white in the index/stage; photography only on the home.

### Axopar — `axopar-home`, `axopar-home-scrolled`, `axopar-models`, `axopar-models-scrolled`
- Driven: https://www.axopar.com/ and /boat-models.
- **Home.** A full-bleed film (a woman at the helm, motion-blurred) with "THE ADVENTURE / BOATING COMPANY" in a condensed uppercase at about 40px at the left, a four-line paragraph, an outlined "Discover Axopar →". The nav puts the two real acts at the very top as small arrowed links — "Configurate →" and "Find a Dealer →" — above the seven section words. Scrolled: an editorial carousel with prev/next arrows (Cannes Yachting Festival 2026 Highlights / Find Your Perfect Axopar Boat / Adventure Stories), each caption an arrowed link under its photograph.
- **Models.** Hero photograph, breadcrumb "Home — Axopar Boat Models", "EXPLORE ALL THE ADVENTURE BOAT RANGES" at about 44px. Scrolled: the range as a **chapter** — "AXOPAR 45" as a heading, a one-line promise ("delivers big-boat capability with easy, intuitive control…"), a hairline rule, then a 3-up row of white-ground renders with the variant name under each (AXOPAR 45 XC CROSS CABIN / 45 CROSS TOP / 45 SUN TOP) and an "Explore →" link.
- Pattern: **the range chapter** — heading, one sentence, rule, variants in a row.
- For this screen: a 27-model range becomes six short chapters you can scroll past, and each chapter names the difference. Our boat tables have exactly this shape (series ▸ model ▸ variant).
- Avoid: the renders float with no card and no ground, so the row feels unanchored; the primary act as a small link in the corner; an editorial carousel above the models.
- Imagery: photographic home, render-only range — the same honest split our seed has (Stacer photographed, Highfield rendered).

### Zodiac Nautic — `zodiac-range`, `zodiac-range-scrolled`
- Driven: https://www.zodiac-nautic.com/en/boats/motorboats/.
- Left: "INFLATABLE AND RIGID INFLATABLE MOTORBOATS" in a heavy condensed uppercase at about 46px with a short paragraph. Right: a **three-photograph collage** at deliberately unequal sizes with overlaps. Below, each range takes a full-width band: the range name as a huge display word (XCC, MEDLINE) set half over its own photograph, a two-column paragraph ("THE PREMIUM RANGE…"), and "DISCOVER THIS RANGE ⟶" with a long arrow ending in a circle. Nav is a logo, a breadcrumb and a hamburger only.
- Pattern: **the range name as display type overlapping the photograph**.
- For this screen: the strongest "a brand, photographed" device in the sweep — the word and the picture occupy the same space, so the name is unmistakably *of* that boat. The two-column body keeps the line length honest at 1440.
- Avoid: the collage (three sizes and no hierarchy reads as an accident); a hamburger-only nav on a 1440 desktop; a display word that clips the hull.
- Imagery: heavily photographic, with people in the boats.

### Boston Whaler — `whaler-models`, `whaler-models-scrolled`
- Driven: https://www.bostonwhaler.com/en_US/boats.html.
- Two header rows — utility (APPAREL · DEALER LOCATOR · OFFERS · search) and sections (SHOPPING TOOLS · OWNERS · LIFESTYLE · WHY WHALER) with "MODELS ⌄" alone at the left — plus a **red "BUILD" tile with a spanner icon anchored into the top-right corner** of the page. The hero is a golden-hour photograph with a translucent white plaque at the bottom-left: "BOSTON WHALER" in small caps over "Our Boat Models" in a red serif at about 46px. Then "Our Model Families" in a navy serif.
- Scrolled: a **series carousel** on a warm grey band — four white-ground side-profile renders in a row, a red "VIEW SERIES" pill under each, square chevrons pinned to the band's edges. Then "Built for Every Activity" and three photographs with the kinds named by use: FISHING BOATS / CRUISING BOATS / TENDER BOATS, each with a paragraph.
- Pattern: **kinds named by activity**; **the persistent build corner**.
- For this screen: a dealer's customer says "a fishing boat", not "a centre console" — naming kinds by what they are for is more honest to how the sale actually runs. The corner BUILD tile is a primary act that never leaves the screen without being a bottom bar.
- Avoid: three navigation systems at once (two rows plus a corner tile); a serif for titles and a sans for everything else; carousel chevrons that sit on top of the first and last render.
- Imagery: photography for the kinds, renders for the series — both, deliberately.

### Sea Ray — `searay-models`, `searay-models-scrolled`
- Driven: https://www.searay.com/boats.html.
- A dark aerial of four boats in formation on green water, with a pale mint plaque at the bottom-left holding "SEA RAY MODEL LINEUP" in an italic serif. The nav carries the **series as first-class items** (SUNDANCER · SLX · SDX · SPX, each with a caret) and a circular "BUILD" mark at the top-right; a Google "Select Language" widget sits at the bottom-left.
- Scrolled: a **sticky series tab bar** (SUNDANCER SERIES · SLX · SDX · SPX, the active one underlined and black), then a row of four models where each render sits above a **three-cell fact strip** with hairline dividers — LENGTH OVERALL 10.01 m | PERSONS CAPACITY "Yacht Certified" | BEAM 3.23 m. Below, a split band: photograph at the left, "SUNDANCER SERIES" with a paragraph and a black "VIEW MODELS" pill at the right.
- Pattern: **the fact strip under the hull**.
- For this screen: three measured figures, label above, value below, dividers between — the most compact honest comparison found, and every value comes from a column in the file. The series in the nav means a returning dealer skips the page entirely.
- Avoid: a word ("Yacht Certified") sitting in a column where the other two rows hold numbers; the translate widget; a carousel where a grid would fit.
- Imagery: aerial photography for the hero, renders for comparison — the right division of labour.

### Grady-White — `gradywhite-models`, `gradywhite-models-scrolled`
- Driven: https://www.gradywhite.com/models/.
- A beige band with the words "EXPLORE MODELS" ghosted at enormous size behind a centred serif title pair — "Crafted for every journey. / Discover all our models." — and a three-line paragraph. Then a **kind tab bar**: CENTER CONSOLES · DUAL CONSOLES · WALKAROUND CABINS · EXPRESS CABINS · COASTAL EXPLORERS, active underlined. Then a 3-up card grid. Scrolled: each card is a photograph, the model name at about 22px, a four-to-five-line paragraph, a three-cell fact strip (LENGTH 25' | BEAM 8'6" | MAX HP 400) and a pill that **names the model in the act**: "Explore Fisherman 257". A cookie bar with only "Preferences" and "Accept" covers the bottom of every frame (not accepted).
- Pattern: **the act that names its object**; **MAX HP on the card**.
- For this screen: "Explore Fisherman 257" beats "Explore" — the button is readable out of context, which matters for keyboard and screen-reader reach. MAX HP is precisely the fitment fact our boat×motor join holds, and putting it on the card means the dealer can rule a motor in or out before opening anything.
- Avoid: a five-line paragraph on every card (twelve cards is a wall of prose); the ghosted word behind the title (it reads as a rendering fault); a consent bar with no reject.
- Imagery: on-water photography per model, with people fishing — earns the page.

### Highfield — `highfield-home`, `highfield-home-scrolled`, `highfield-range`, `highfield-range-scrolled`
- Driven: https://www.highfieldboats.com/ and /our-boats/. (Our dealer's own brand.)
- **Home.** A full-bleed aerial film of a dozen RIBs fanning out across dark water; "#DARETOEXPLORE" in a heavy condensed uppercase at about 56px at the bottom-left with "Welcome to Highfield Boats" beneath and a chevron scroll hint. Nav: wordmark, BOATS · DEALER LOCATOR · REQUEST A QUOTE · SPARE PARTS, a flag language picker, a hamburger. An accessibility pair (contrast, text size) is pinned mid-right and a chat bubble at the bottom-right.
- **Scrolled.** A grey band: "INTRODUCING" in teal caps over a real figure in a light face — "With around 54,000 boats delivered globally since the brand's beginning in 2011, Highfield Boats is now the world's number one in the RIB tender sector…". Then **the ranges as four renders in a row on white**, each with the range name in caps and a one-line promise beneath: THE ROLL UP RANGE / Compact and economical · THE ULTRALITE RANGE / Because weight does matter · THE CLASSIC RANGE / Extra level of comfort · THE SPORT RANGE / The next generation of Highfield.
- **Range page.** Hero photograph of a fleet exercise, "OUR BOATS" at about 54px with "Explore all of our ranges, find your own." Scrolled: a dark band with a sentence naming who the boats are for, then **three tall photographic doors** — "> EXPLORE TENDER RANGES", "> EXPLORE LEISURE RANGES", "> EXPLORE COMMERCIAL & UTILITY" — the label in white caps across the top of each photograph.
- Pattern: **the range row with a one-line promise**; **three tall doors for the top-level kinds**.
- For this screen: the promise beneath each range name is what a salesperson actually says out loud; it is the line our brand shelf should carry. And Highfield's own site is render-only for the ranges, which matches the seed exactly — a direction drawn on Highfield must be honest about that.
- Avoid: the ">" prefix as ornament; bolt-on accessibility widgets (ours are built in); the chat bubble; a hashtag as a headline.
- Imagery: photography for the hero and the kinds, renders for the ranges.

### Stabicraft — `stabicraft-range`, `stabicraft-range-scrolled`
- Driven: https://www.stabicraft.com/au/the-boats.
- Hero photograph of a red 2250 launching off a wave; "THE / BOATS" in two lines, "THE" in white and "BOATS" in the brand red, a heavy condensed face at about 54px. A red angular wedge cuts into the white band below (their brand shape). One sentence: "From family fishing adventures to chasing gamefish in big water there's a Stabicraft to suit." An "Ask me anything…" AI pill floats at the bottom-right.
- Scrolled: one photographic panel split into **two doors** — "EXPLORE MODELS BY / SIZE RANGE" with an "EXPLORE RANGE" button and "EXPLORE MODELS BY / STYLE SERIES" with "EXPLORE SERIES" — two named ways into the same range, side by side. Then "ALL MODELS" as a section head with a right-aligned "Search 🔍" field on the same line, and a 3-up grid of white-ground renders.
- Pattern: **two named doors into one range**; **search in the section head**.
- For this screen: by size / by style maps directly onto our by kind / by brand — and saying both out loud removes the dealer's guess. Putting the search in the section head rather than the page header keeps it attached to the thing it searches.
- Avoid: two doors sharing a single photograph (the split is not obvious until you read); the red wedge (a brand shape we do not have); an AI pill over the content.
- Imagery: photography for the hero, renders for the grid.

### Williams Jet Tenders — `williams-home`, `williams-home-scrolled`, `williams-tenders`
- Driven: https://www.williamsjettenders.com/ and /tenders/.
- **Home.** A full-bleed film of a tender at anchor with a swimmer; a small left-aligned line ("F1 Driver **Esteban Ocon** collects his custom SportJet 520.") and a black "Watch now →". The entire nav is two buttons at the top-right: a black **"Build My Tender"** and an outlined "Menu". "SCROLL DOWN" centred at the foot over a hairline.
- **Scrolled.** "Discover Our Range" at about 30px at the left with the ranges as a **text tab row** at the right (EvoJet · SOLAS · DieselJet · SportJet · TurboJet · TurboJet MX, active underlined). Below, a horizontal carousel of wide photographic cards: the range name and its promise at the top-left over the photograph ("EvoJet / Luxury, evolved.", "SOLAS / Uninterrupted luxury, superior safety.") and **two buttons at the bottom-left — "Discover More →" and "Build My Tender →"**; a numeric pager 01–06 at the left and round prev/next at the right.
- **The range page.** A dimmed photograph as ground carries three columns: a **left index of ranges** (TurboJet MX in bold white, then TurboJet, SportJet, DieselJet, SOLAS, EvoJet, Evene Tenders) against a vertical hairline; a **middle list of models, each led by a tiny plan-view silhouette** (280MX, 320MX); and a **right panel** with the range name in italic, a two-line promise ("Flat out fun"), the facts in plain words ("Yachts 11+m/36+ft and seats 3+1 people") and the same two acts.
- Pattern: **index · models · facts, three columns over one photograph**; **two acts per card (learn / build)**.
- For this screen: the closest whole-screen shape to our home's job found anywhere in the sweep. Brands (ranges), models, what they are, and the primary act, all visible at once, with the photograph as atmosphere rather than as the content — which is what lets a *dealer's* home hold several brands without any of them shouting. "Discover More / Build My Tender" is exactly "Open / New quote".
- Avoid: the veil over the photograph is heavy enough that the boats are hard to read; a nav of two buttons hides everything else; the model silhouettes are so small they are almost decoration.
- Imagery: photographic ground, silhouettes for the models — a good hybrid when a model has no photograph.

### De Antonio Yachts — `deantonio-home`, `deantonio-home-scrolled`
- Driven: https://deantonioyachts.com/.
- A cinematic slide (a helicopter over a misty lake, a D-series boat running) with prev/next chevrons, a centred "SEEKING ADVENTURE / THE WORLD IS OUT THERE" in a distressed display face, "WATCH THE FULL MOVIE" outlined, and a **dot pager of eight**. Nav: hamburger + "Menu" at the left, the wordmark centred, language and account at the right. A yellow chat square at the bottom-left, a social rail at the right.
- Scrolled: "THE RANGE" centred at about 30px, then **one model per full-width band** — the model name as an enormous italic display word (D60, D50) centred over its own running photograph, with two buttons beneath: a black "DISCOVER" and an outlined "CONFIGURE".
- Pattern: **one model per band, with two acts, one of them Configure**.
- For this screen: the clearest "learn or build" pair in the sweep, and the model name set at display size over its own water is the most confident way to present a hull. If our home shows a featured boat, this is the shape.
- Avoid: eight slides of cinema before any model appears; the distressed face (unreadable below about 24px); chat and social rails.
- Imagery: photographic, cinematic, and it is doing the whole job.

### Bénéteau — `beneteau-models`, `beneteau-models-scrolled`
- Driven: https://www.beneteau.com/en/motor-boats.
- A wide photograph of a boat's windscreen against a rocky cove; nav is "☰ Menu" at the left, the logo centred, "Dealers" and "EN" at the right; the breadcrumb sits in white over the photograph. On white, centred: "Daybaots" at about 48px in a light humanist face and a three-line paragraph at about 20px in the same weight.
- Scrolled: a row of **three acts** near the top — "CONFIGURE A BOAT" (outlined), "GET AN OFFER" (teal solid), "MY NEAREST DEALER" (navy solid) — then per-range bands: a photograph filling the band with a **white card overlapping its right side**, holding the range name in tracked caps ("FLYER"), a hairline, a paragraph, a ruler icon with "From 7 to 10 meters", and a teal "DISCOVER THE RANGE".
- Pattern: **the white card overlapping the photograph**; **the range's size span as a single fact with an icon**.
- For this screen: the overlapping card means the text never fights the water — a reliable way to put real figures on a photographic band. "From 7 to 10 meters" is one honest fact that positions a whole range; our equivalent is a length span or a from-price at the cash rung.
- Avoid: three acts of equal weight and no primary among them; very light type at 20px on white (the contrast is thin); the page title's typo is theirs, not ours, but it is a reminder that a title is content.
- Imagery: photographic; the type is quiet and light.

---

## Car brands

### Polestar — `polestar-home`, `polestar-home-scrolled`
- Driven: https://www.polestar.com/au/.
- Black hero: an almost invisible car with a red tail-line and one bright diagonal beam across the frame (a film — a pause control at the bottom-right). At the left: "Polestar 4 coupé" then "Save over $15,000 on previous model year¹" in grey at the same size (so the offer reads quieter than the name), a bold line about the award, and two square outlined buttons, "Available cars →" and "Test drive →". The nav is the wordmark and the models as plain words (Polestar 2 · 3 · 4 · 5), then Charging, Shop, More.
- Scrolled: a **2×2 quadrant of models on white** divided by hairlines. Each quadrant: the model name at about 24px, a one-line promise ("The electric fastback with $5,000 saving²", "The space of a wagon. The versatility of an SUV.", "The SUV that drives like a sports car.", "The pure performance Grand Tourer."), **two arrowed text links** (Book a test drive → / Available cars →; Discover → / Configure →), and a side-profile render bleeding to the quadrant's edges.
- Pattern: **the model quadrant** — four models, four promises, eight acts, zero chrome.
- For this screen: if the dealer sells four kinds, this is the whole section: name, promise, two acts, picture. Acts as arrowed words rather than buttons keeps eight of them from becoming noise. Every claim carries a footnote marker — honesty made visible.
- Avoid: a hero where the product is invisible; grey on black for a subhead.
- Imagery: renders on white, photography only in the hero film.

### Rivian — `rivian-home`, `rivian-home-scrolled`
- Driven: https://rivian.com/.
- A rounded floating white nav bar over the photograph (wordmark; Vehicles · Charging · Technology · Discover · Gear Shop; a yellow "Demo drive" pill; chat and account circles). The hero is an R1S on a forest track: "Explore our latest offers" at about 36px, the APR terms in small bold, two pills ("Explore offers", "Shop now"), round prev/next at the frame's edges and a four-dot pager at the foot.
- Scrolled: the model name "R1S" as an enormous black display word on light grey with the **vehicle overlapping it**; then centred, "All-electric, 7-seat SUV built for making memories.", a single factual line — "From $83,990² · Est. lease $1,239/mo² | EPA est. range 410 mi³" — and two pills, black "Explore" and white "Design yours".
- Pattern: **the model word with the object overlapping it**; **one line of middot-separated facts**.
- For this screen: the fact line is the shape of our from-price at the cash rung — one line, three figures, each with its footnote, no stat tiles. The overlap gives depth with no shadow, no glass, no blur.
- Avoid: an offers carousel as the first screen; the floating chat bubble.
- Imagery: photography for the hero, a studio render for the model band.

### Lucid — `lucid-home`, `lucid-home-scrolled`
- Driven: https://lucidmotors.com/.
- A beige promotional strip above everything with APR and credit terms. A dark translucent nav over the photograph (wordmark and bear mark; Lucid Air · Lucid Gravity · Lucid Sapphire · Pre-Owned · Discover; a tan "DEMO DRIVE"; help, globe, account). The hero is a family loading a Gravity outside a clifftop house: "Lucid Gravity" in a light serif at about 44px at the bottom-left with a two-line promise. Scrolled: the same grammar for Lucid Air — a person standing beside the car on a bluff, "Lucid Air" in the serif at the lower-left, "Supercar speed. Relentless range. Next-level luxury at every turn." A cream consent bar with only "ACCEPT ALL" and "COOKIE SETTINGS" covers the bottom of both frames (not accepted).
- Pattern: **the model name in a light serif at the lower-left of its own photograph, with people in it**.
- For this screen: a restful alternative to display caps — the picture carries the energy and the name stays calm. Photography with people using the boat is what our on-water Stacer frames can do.
- Avoid: an offer strip above the nav; a consent bar with no reject (it costs the lower third of every frame).
- Imagery: entirely photographic, lifestyle-led.

### BMW model overview — **failed**
- Attempted: https://www.bmw.com.au/en/all-models.html and https://www.bmw.com/en/all-models.html.
- Both land on a modal consent wall ("Verwendung von Cookies." with *Anpassen* / *Cookies verbieten* / *Alle akzeptieren*) that covers the lower half of the viewport. It survived Escape, a close-button click, a click on the analytics switch and a click on "Cookies verbieten" (all timed out), and the `.com` URL redirected to the German home rather than the model overview. Nothing of the model grid is readable behind it. Recorded and left; bot/consent walls are not fought. The frames `bmw-models.png` / `bmw-models-scrolled.png` show the wall, not the page.

### Mercedes-Benz model overview — `mercedes-models`, `mercedes-models-scrolled`
- Driven: https://www.mercedes-benz.com/en/vehicles/ (models overview).
- Black nav (Models · Buy · Services · Brand at the left; the star centred; Privacy, search, favourites, dealer pin and "Private customer / Login" at the right). Centred title pair in a serif: "Our Models" at about 40px over "Discover our diverse range of brands and models: Here you'll find your personal dream vehicle."
- Body is a **left filter rail beside a right grouped grid**. Rail: "45 models" in bold as its title, "Filters :", a toggle "New models only", then "Brand" opened to three checkboxes each carrying the actual mark — Mercedes-Benz, the AMG wordmark, MAYBACH — then "Bodytype" and "Fuel Type" as collapsed groups with small icons. Grid: a serif group heading ("Sedans"), then cards on very light grey with generous padding — the **sub-brand as an eyebrow**, the model name in the serif at about 22px, a chip row ("New" in blue; "Electric" / "Petrol" / "Plug-in Hybrid" in grey), a small side render, and where there is nothing to sell yet, the words **"Coming soon"** where a figure would be. An "Ask |" AI bar is pinned at the bottom-right.
- Pattern: **the brand as a checkbox carrying its own mark**; **the sub-brand as the card's eyebrow**; **the count as the rail's title**.
- For this screen: this is our Stacer / Highfield / Mercury relationship exactly — one house, several marques, and the marque named on every card. "45 models" is a measured figure in the place a page title usually sits. "Coming soon" is an honest empty state *on a card*, which is the pattern for a model our file has no price for.
- Avoid: a tiny render marooned in a large empty card; the AI bar covering the third column; a serif for headings and a grotesk for chips (two voices).
- Imagery: small renders on grey — this page is a register, and it is fine that it is.

### Lotus — `lotus-home`, `lotus-home-scrolled`
- Driven: https://www.lotuscars.com/.
- A studio photograph of an orange Emira against a split navy/orange wall. "LOTUS EMIRA / 420 SPORT" in a widely tracked yellow uppercase at about 46px at the bottom-left, "Tuned to the extreme. Unleashed summer 2026." beneath, and a solid yellow "DISCOVER" rectangle. The nav is only the wordmark centred, "My Lotus" and a hamburger.
- Scrolled: a black band with "OUR MODELS" centred in tracked caps and "Setting new standards in automotive excellence on and off the track." beneath, then a full-bleed photograph of the Eletre.
- Pattern: **the black band as a chapter rule between photographs**.
- For this screen: when a page is a run of photographs, a plain band with a title and one sentence is the cheapest possible chapter marker — no card, no border, no shadow. Yellow appears exactly once, on the act.
- Avoid: a nav that hides everything behind a hamburger at 1440; tracked caps at body size.
- Imagery: studio photography with colour as the set — worth remembering when a boat has no on-water shot.

### Bentley — `bentley-home`, `bentley-home-scrolled`
- Driven: https://www.bentleymotors.com/en.html.
- Black page; the nav in tracked caps around the winged badge (MODELS · CULTURE · COLLABORATIONS · YOUR BENTLEY · ABOUT BENTLEY) with "REQUEST TEST DRIVE" boxed, then "CONFIGURATOR" and "LOCATE DEALER". The hero is a teaser: "Coming Soon" small, "The Bentley Torcal" in a light serif at about 46px, a car under a green-lit sheet, a **live countdown as four figure-over-label pairs** (07 days : 09 hours : 58 minutes : 49 seconds) and two buttons ("LEARN MORE", "KEEP ME INFORMED"). The second frame catches the PRIVACY SETTINGS modal (MANAGE COOKIE SETTINGS / ONLY ESSENTIAL COOKIES / AGREE TO ALL) — not accepted.
- Pattern: **figure over label, four across**.
- For this screen: four numbers with no chrome at all — the shape a manifest line could take if it ever needs to be more than a sentence. "Coming soon" is again a legitimate state rather than a blank.
- Avoid: **a counting number** — our price figure never counts, and a home that animates digits is the dashboard we are not building; a teaser as the first screen; tracked caps everywhere.
- Imagery: the product deliberately hidden — the opposite of what our home needs.

### Aston Martin — `astonmartin-home`, `astonmartin-home-scrolled`
- Driven: https://www.astonmartin.com/en-gb.
- A full-bleed macro of a DBX S headlamp in green; "DBX S" small over "Explore Our Curated Choices" in a light serif at about 40px at the bottom-left, a white "Configure" rectangle; chevrons at the frame's edges and a **four-dash pager** at the foot. Nav: hamburger, the wings centred, "Configure" (white) and "Enquire" (grey) at the top-right — the two acts always present. The second frame is the next slide: a green Vantage in a gallery-like interior, and the caption has **moved to the centre** ("THRILL. DRIVEN." over "Vantage" at about 44px) with long-arrow prev/next flanking it and two buttons, "Explore" (white) and "Build" (grey).
- Pattern: **the Explore / Build pair** (the third brand in this sweep to use it, after De Antonio and Williams); **the pager drawn as dashes**.
- For this screen: Explore/Build is now clearly the industry's settled pair, and it maps onto Open / New quote. Dashes beat dots — you can read how many and where you are.
- Avoid: the caption jumping from left to centre between slides (position is information, and moving it costs the reader); macro photography that never shows the whole car — our dealer needs the whole hull.
- Imagery: photographic and very dark; the serif is doing the brand's work.

---

## Premium build-and-buy

### Apple Store — `apple-store`, `apple-store-scrolled`
- Driven: https://www.apple.com/au/store.
- A thin grey global nav where the product families are words (Store · Mac · iPad · iPhone · Watch · Vision · AirPods · TV & Home · Entertainment · Accessories · Support) with search and bag. A notice line. Then, on light grey: **"Store" as an enormous black word at the left** (about 64px) with, on the same band at the right, "The best way to buy the products you love." (about 28px, right-aligned) and two blue arrowed links — "Connect with a Specialist ↗", "Find an Apple Store ↗".
- Under it, the **product-family rail**: nine small photographed cut-outs floating over their labels (Mac, iPhone, iPad, Apple Watch, Apple Vision Pro, AirPods, AirTag, Apple TV 4K, HomePod) with a circular "›" at the right edge showing there is more. Then a two-tone heading — "**The latest.** Take a look at what's new." (first sentence black, second grey) — over a carousel of tall cards alternating black and white grounds: an eyebrow ("PRE-ORDER NOW"), the product name at about 26px, a one-line promise, **"From A$2,099.00 or A$87.46/mo for 24 mo. at 0% p.a.°"**, and the photograph filling the rest. Scrolled: "**Accessories.** Essentials that pair perfectly with your favourite products." over a row of square cards.
- Pattern: **the one-word page title beside a right-aligned sentence**; **kinds as a rail of small photographs**; **the two-tone section heading**; **from-price with a footnote marker**.
- For this screen: this is the top of our home. Nine kinds fit across 1440 as small photographs and every one stays recognisable — far better than four big tiles. The two-tone heading gives hierarchy with no size change and no colour beyond grey. And "From A$…" with its marker is exactly how a from-price behaves when the figure has conditions.
- Avoid: a horizontal carousel for the primary content (the fourth card clips at the right edge); the chat avatar.
- Imagery: photographic cut-outs on flat grounds — the technique for a motor or a trailer that has no scene.

### Framework marketplace — `framework-marketplace`, `framework-marketplace-scrolled`
- Driven: https://frame.work/au/en/marketplace.
- A **left rail beside a right grid**. Rail: a search field with a magnifier, "563 results", then "Categories" as a list where **every row carries its true count** — View all (563), Framework Laptop (16), Framework Desktop (1), Mainboards (29), Expansion Cards (37), Memory & Storage (8), Keyboards (249), Parts (166), Customization (43), Tools (8), Software (2), Merch (4) — with an orange bar marking the active row; then "Sort by" as radio buttons (Featured / Price: low to high). Right: a row of filter pills (Best Sellers · Bundles · What's New · AMD · Intel® · Pre-order now), a section head "Framework Laptop  / 16 items" where the count is a small note beside the title, then a 3-up card grid — a product photograph on a **flat colour that identifies the family** (sage, orange, near-black), a "Pre-order" chip at the top-left, the full product name in bold, and "Starting at $1,159".
- Pattern: **every category row carries its count**; **"Starting at" as the from-price phrasing**; **the coloured photographic ground as family**.
- For this screen: our kinds and brands can carry counts read from the manifest, and this proves counts make a rail scannable rather than noisy. "Starting at" is the plainest honest wording for a from-price. Colour behind the photograph separates families without a single border.
- Avoid: a rail of twelve categories when we have four kinds — the rail earns its place only at that density; three filtering systems at once (rail, pills, sort).
- Imagery: product photography on colour; entirely non-typographic.

### Herman Miller — `hermanmiller-home`, `hermanmiller-home-scrolled`
- Driven: https://www.hermanmiller.com/en_au/.
- A white utility strip (country, Where to Buy, Customer Service, Contact Us), then a white header: the red mark with "HermanMiller", six nav words, and a **search field with its placeholder visible** at the right. Hero on pale grey: a studio photograph of six people with Aeron chairs; at the left, "Aeron never stops supporting you." in a heavy grotesk at about 36px, a four-line paragraph, a black "Learn more"; round prev/next arrows at the frame's edges, a four-dot pager beneath. Then "Product Categories" as a heading.
- Scrolled: the categories as **four photographs of the object in its actual place** with a plain bold word beneath each — Seating · Desks and Workspaces · Tables · Storage — then a full-width statement in the same grotesk ("At Herman Miller, we believe in the power of design to make things better for people.") and an editorial band.
- Pattern: **the kinds row: photograph above, plain word beneath, sentence case**.
- For this screen: the quietest and most legible kinds row in the whole sweep. No caption over the photograph, no gradient, no card — the word sits under the picture where it always reads. And the search is a *field*, not an icon, which is the right default for a dealer who types.
- Avoid: a carousel hero of people rather than product; the utility strip above the header.
- Imagery: photography of the object in use; type is plain and does not compete.

### Bang & Olufsen — `bo-home`, `bo-home-scrolled`
- Driven: https://www.bang-olufsen.com/en/au/.
- A cinematic film (a dinner party, a Beosound 2 on marble) with the nav laid over it: "Menu" and "Search" as icon + word at the left, the wordmark and "Est. 1925" centred, account / store / bag at the right, a pause control at the right edge. Caption at the bottom-left: "Form. Function. Feeling." at about 24px, a two-line promise, and a rounded outlined button **named after the product** ("Beosound 2").
- Scrolled: "Explore our bestsellers" centred, then a **product rail on white** — each cell a product photographed on a pale ground, hairlines between cells, a small italic "New" tag where it applies, and the product name with **"AUD 7,700"** in the same small size beneath it; a thin progress bar and a pause control under the rail. Then a dark editorial band.
- Pattern: **price in the same size as the name**; **hairline-separated cells with no card chrome**; **the act named after the thing**.
- For this screen: the price does not shout and there is no struck-through "was" — the figure is simply a fact of the product, which is precisely how a dealer's from-price should sit. Hairlines instead of cards keeps a row of six readable.
- Avoid: an auto-advancing product rail (a price that slides away while you read it); small dark type over a busy film.
- Imagery: studio product photography plus one cinematic film; the type is small throughout.

### Peloton — `peloton-home`, `peloton-home-scrolled` — **partially blocked**
- Driven: https://www.onepeloton.com/.
- A dark header where **the kinds are the entire primary nav**: Bikes · Treads · Row · Apps · Accessories · Deals · Apparel, each a dropdown, with account and cart. Below, a light page: "Training that moves with you" centred at about 40px with a grey two-line subhead, and the start of a dark card stack naming goals ("Support weight goals", "…ity", "…ness", "Just having fun!").
- A "Peloton Cookie Notice" modal (Accept All Cookies / Reject All Cookies) sits over the middle of every frame, plus a chat bubble and a promotional tooltip. "Reject All Cookies" could not be clicked from the headless driver — an overlay intercepts the click and it timed out on three attempts — so the notice was left unanswered rather than accepted. Judge composition elsewhere; these frames are mostly a consent modal.
- Pattern: **the kinds as the whole nav**.
- For this screen: seven product families as seven words in the header is a legitimate alternative to a kinds row on the page — worth one direction if the dealer's kinds are few.
- Avoid: three overlays at once.

### Rimowa — **failed**
- Attempted: https://www.rimowa.com/ and https://www.rimowa.com/au/en/home. Both return an Akamai "Access Denied" page to the headless browser (the frames `rimowa-home.png` / `rimowa-home-scrolled.png` are that error page). Not fought.

---

## Registers and working screens

### Linear — `linear-home`, `linear-home-scrolled`
- Driven: https://linear.app/.
- Near-black page; a thin nav (wordmark; Product · Resources · Customers · Pricing · Now · Contact; "Log in"; a white "Sign up" pill). The headline "The product development system for teams and agents" in a tight grotesk at about 48px at the left with generous space above it, a grey one-line subhead, and — on the same baseline, at the far right — a small "New  Loops →". Below, a **large screenshot of the real product** in a rounded frame with a soft top-light: the app's own rail (Pulse, Inbox, My issues, Reviews; Workspace: Initiatives, Projects, More; Favorites), an issue view with a code-formatted phrase inline, an Activity list with "2min ago" timestamps, and a floating agent panel.
- Scrolled: the screenshot continues, then a **customer wall** (OpenAI, Vercel, Salesforce, Figma, Cursor, coinbase, ramp) with a tracked monospace caption beneath ("POWERING THE COMPANIES BUILDING THE FUTURE"), then a two-tone paragraph at about 40px — the claim white, the elaboration grey.
- Pattern: **the two-tone sentence as a section head**; **the announcement on the subhead's baseline, not above the nav**.
- For this screen: the two-tone sentence is the cheapest hierarchy device in the whole sweep and it recurs at Apple, Attio and Polar. And putting the announcement inline means the page never grows a strip above its own nav.
- Avoid: dark as the default (ours is offered, not default, and only when every token is theme-scoped); a hero that is a screenshot — our home *is* the app.
- Imagery: none; the product's own interface is the picture.

### Stripe dashboard docs — `stripe-dashboard-docs`, `stripe-dashboard-docs-scrolled`
- Driven: https://docs.stripe.com/dashboard.
- White. Header: "stripe DOCS", a centred **search field with "/" printed inside it as the shortcut**, an "Ask AI ✨" button; a second nav row of sections with the active one underlined in indigo. Three columns: at the left a deep tree (VERSIONING / ESSENTIALS / TOOLS, with "Stripe Dashboard" expanded to Stripe Console, Web Dashboard, Mobile Dashboard, Search in the Dashboard) and a collapse chevron at its head; in the centre the article ("Web Dashboard", a one-line summary, then a row of utility links — Ask about this page · Copy for LLM · View as Markdown · Install tools); at the right an "ON THIS PAGE" outline where the current section is indigo and the unreached entries fade to grey. At the rail's foot, country and language as two small rows with a flag.
- Pattern: **the shortcut printed inside the search field**; **the outline that dims what you have not reached**; **locale at the foot of the rail**.
- For this screen: "/" printed in the field is the most honest way to advertise a keyboard path — our Ctrl K should be printed in the finder, not taught in a tooltip. Locale at the rail's foot is a good home for the org/price-level switch: present, never prominent.
- Avoid: a three-column shell on a home (it is a reading layout); four utility links before the first sentence of content.
- Imagery: none; purely typographic.

### Attio — `attio-home`, `attio-home-scrolled`
- Driven: https://attio.com/.
- White. A black announcement strip with an ×; a thin nav (wordmark; Platform ⌄ · Resources ⌄ · Customers · Pricing; "Sign in"; a black "Start for free"). Centred: a small outlined pill link, then "Welcome to agentic revenue." at about 52px in a tight grotesk, a two-line grey subhead, and two buttons (outlined "Talk to sales", solid "Start for free"). Below, a **product screenshot inside macOS window chrome** on a faint blue-lined ground: the real rail with **"Quick Actions ⌘K"** as its first row and a search row with "/" beside it, then Home · Notifications · Tasks · Notes · Calls · Reports · Automations, beside a record view.
- Scrolled: a **logo wall drawn as a grid of bordered cells** (granola, turbopuffer, parallel, Modal, Wispr Flow / Railway, Listen, taskrabbit, AIUC, WORDSMITH), each with a small ↗ in the corner; then a two-tone section head with a small "Platform" tag above it.
- Pattern: **the command menu advertised as a row in the rail with its shortcut**; **the tag above the heading**; **the bordered logo grid**.
- For this screen: "Quick Actions ⌘K" as a visible rail row is the pattern for our finder — the shortcut is discoverable without a tour, and the row is clickable for the dealer who never learns it.
- Avoid: the announcement strip; window chrome with traffic-light dots in a marketing shot.
- Imagery: none; screenshot and logos.

### Vercel docs — `vercel-docs-home`, `vercel-projects-docs`
- Driven: https://vercel.com/docs and /docs/projects.
- **Docs home.** White; "Docs" beside the triangle, Build ⌄ · Learn ⌄ · Getting Started, then "Ask AI", "Log In", "Sign Up". A left rail whose head is a **"Search Docs  ⌘K"** field, then grouped sections (Start; Build AI apps; Run agents and backends) with beta chips on some rows. Centre: "Ship anything with Vercel" at about 44px in two lines, a two-line subhead, three buttons (solid "Get started", outlined "Set up your agent", outlined "Get AI Gateway key"); at the right of the same band, a small tab set (Deploy an app / Set up your agent / Call a model) over a terminal card with a copy affordance. Below: "Set up your coding agent", a collapsed prompt block with "Show more", and a row of **three bordered cards each with an icon, a title and two lines**.
- **Projects overview** is the register shell: the same rail scoped to one section with "‹ Projects" at its head, the article with a "Copy page ⌄" split button beside the H1, and a right "On this page" list.
- Pattern: **⌘K printed inside the rail's search field**; **a row of three icon-title-lines doors**; **the section-scoped rail with a back arrow**.
- For this screen: the three-card row is the shape our kinds can take where a kind has no photograph yet — an icon, a word, two honest lines. The scoped rail with "‹" is how our home's sections can drill without losing the way back.
- Avoid: three buttons of near-equal weight under the headline; beta chips.
- Honest note: `vercel-dashboard-docs.png` and `-scrolled.png` are Vercel's own **404** page — `/docs/concepts/dashboard-features` now redirects to `/docs/dashboard`, which does not exist. Use `vercel-docs-home` and `vercel-projects-docs`.
- Imagery: none.

### Raycast — `raycast-home-scrolled`
- Driven: https://www.raycast.com/.
- Near-black; a **floating rounded nav bar** (the mark and "Raycast"; Store · Pro · AI · iOS · Windows · Teams · Enterprise · Blog · Pricing; "Log in"; a "Download" button carrying a platform glyph). The captured section reads "Take shortcuts, not detours." centred in a modest bold at about 22px with "One interface, everything you need." in grey beneath; then a large device frame showing the **real command window** — a filter field ("Type to filter entries…"), an "All Types" select at its right, and a results list grouped by day ("Today") with typed rows (an image with its dimensions; a colour with its hex "#FF6363" and a swatch) beside a preview pane.
- Pattern: **the command window with typed, grouped rows and a preview**.
- For this screen: this is the Ctrl K our home needs, and the important lesson is that results have *types* — a quote, a boat, a customer — each with a leading glyph and, where it applies, a monospace value. The type selector at the right of the field is how a dealer narrows without learning syntax.
- Avoid: a near-black ground; a heading smaller than the screenshot it introduces.
- Honest note: the top of raycast.com never stops animating, so `page.screenshot` timed out three times (30 s each) and no first-view frame exists. Only the scrolled frame was captured.
- Imagery: none.

### Craft — `craft-home`, `craft-home-scrolled`
- Driven: https://www.craft.do/.
- A warm cream page over an **illustrated paper-collage sky** — torn-paper clouds, a mountain ridge, a lined-paper field. A floating pill nav (the CRAFT wordmark in a chunky display face; Product · Imagine · Community · Pricing · Learn · Download; "Log in"; a black "Try Craft Free"). Centred: "Your space for notes, / tasks, and big ideas" in a high-contrast serif at about 46px and one soft-shadowed "Try Craft Free". Below, the real app window: a rail (New Doc; Joe's Space; All Docs, Tasks, Calendar; Starred: Journal, Ideas; Folders) beside a **grid of document cards, each with its own coloured border and a preview of its actual contents** — Reading list, Workout routine, Weekend Trip, Lecture Notes, Museums, and a card whose title is a date ("16 November, 2025").
- Scrolled: "Craft isn't just for one thing, it's for *your* things." (the emphasis in an italic serif), then **five capability doors as a line icon over a plain word** — Docs · Tasks · Calendar · Whiteboards · Daily Notes — with nothing else on the band; then "How people use Craft" over a row of portrait cards on flat colours.
- Pattern: **the document card with a coloured border and a real preview**; **the icon-over-word doors row**.
- For this screen: the document card is precisely how our open drafts should look — the quote's own content visible, not a table row; the colour is the only chrome. The doors row is the fallback for a kind with no photograph.
- Avoid: illustration as the ground (we have photographs, and they are the point); a hero with one act and no content above the fold.
- Imagery: illustration plus product screenshot; no photography of a product.

### Polar — `polar-home`, `polar-home-scrolled`
- Driven: https://polar.sh/.
- Black; a thin nav (mark and "Polar"; Features · Docs · Blog · Company; "Sign in"; a white "Get Started ›") beneath a centred announcement line. Left-aligned: "Meet Polar" in white at about 54px with "The billing stack for / the intelligence era" in grey immediately beneath **at the same size** — the purest two-tone headline in the sweep. One white "Get Started ›". Below, four near-black cells separated by hairlines, each holding a **single line drawing** (a circle within a circle; a serpentine arrow; three tangent circles; a plus/cross/circle/asterisk cluster) with its caption further down ("Meter tokens, API calls, compute and storage down to the event."; "Recurring plans with trials, upgrades & proration built in."; "Add, remove and prorate seats automatically."; "Prepaid balances that drain as usage flows.").
- Scrolled: a section label "Platform" at the left with "The brains of a finance team / in the body of an API" at the right in the same two-tone treatment, and a paragraph beneath.
- Pattern: **the two-tone headline at one size**; **label-left / heading-right section head**.
- For this screen: hierarchy from tone alone means a heading can be large without being loud — useful for a greeting that must not become a banner. The label-left/heading-right band is a good shape for "Your brands" / "Northside Marine sells…".
- Avoid: black; line ornament where a real photograph exists.
- Imagery: none; line drawings only.

---

## Cross-cutting: what to take and what not to

**Take.**
- A photographic tile that carries three things and no more: the kind as an eyebrow, the name, one promise (Nimbus, Highfield, Williams).
- A count beside every filter word, read from the manifest (Porsche, Framework, Mercedes).
- A from-price phrased honestly — "Starting at", "From A$…", or a sentence saying who will quote (Framework, Apple, **Nimbus builder**).
- The pair of acts per object: learn and build (De Antonio, Williams, Aston Martin) — our Open and New quote.
- Facts as figure-over-label, three across, hairline-divided (Sea Ray, Porsche, Bentley).
- The two-tone heading — claim bright, elaboration grey, same size (Polar, Linear, Apple, Attio).
- The shortcut printed inside the field it belongs to (Stripe "/", Vercel and Attio "⌘K").
- Open work drawn as cards showing their own content, not as rows (Craft).
- Index-and-stage when a hierarchy must be seen whole (Saxdor, Williams).
- An honest empty state written on the card: "Coming soon" (Mercedes), "A dealer in your area will provide a quote" (Nimbus).

**Avoid.**
- Any bottom action bar — no site in this sweep has one, and the owner has already rejected it twice.
- A carousel for primary content: the fourth card always clips (Apple, Whaler, Herman Miller, Rivian, Aston Martin, De Antonio, B&O).
- A silently disabled control (Porsche's greyed "Understand the differences") — a refusal must be a sentence with a reason.
- A number that counts (Bentley) — our price figure never animates.
- Promotional strips above the nav (Lucid, Attio, Polar) and chat bubbles (Highfield, Peloton, Rivian, De Antonio).
- Renders floating with no ground or card (Axopar's variant row), and a lazy hero that shows an empty stage before it loads (Saxdor).
- Text laid directly over busy water without a plaque or a bar (Riviera) — the plaque (Whaler, Sea Ray, Beneteau) or the bar (Riviera's own tiles) is what makes it legible.
- Dark as a default ground (Linear, Polar, Raycast, Bentley) — ours is offered, not default.

---

## Failed or blocked (recorded, not fought)

| id | url | why |
|---|---|---|
| `bmw-models`, `bmw-models-scrolled` | bmw.com.au/en/all-models.html, bmw.com/en/all-models.html | Modal consent wall over the lower half; survived Escape, close, the analytics switch and "Cookies verbieten"; the `.com` URL also redirects to the German home. |
| `rimowa-home`, `rimowa-home-scrolled` | rimowa.com, rimowa.com/au/en/home | Akamai "Access Denied" to the headless browser. |
| `raycast-home` | raycast.com | `page.screenshot` timed out three times (30 s) — the top of the page animates continuously. Only `raycast-home-scrolled` exists. |
| `peloton-home`, `peloton-home-scrolled` | onepeloton.com | Captured, but a cookie modal covers the middle of both frames; "Reject All Cookies" could not be clicked (an overlay intercepts it) and nothing was accepted. |
| `vercel-dashboard-docs`, `vercel-dashboard-docs-scrolled` | vercel.com/docs/concepts/dashboard-features | The page has been retired; it redirects to `/docs/dashboard`, which 404s. The frames are Vercel's 404. Replaced by `vercel-docs-home`. |
| `saxdor-*`, `gradywhite-*`, `lucid-*` | — | Captured fine, but these sites offer no reject button on their consent banner, so it was left unanswered and appears in the frames. |
