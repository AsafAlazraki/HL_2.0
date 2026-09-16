# Home — gallery mining (beyond the seed list)

Sweep date 2026-09-16. Frames: `docs/research/refs/home/gallery/*.png` (gitignored; mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\home\gallery\`). Ledger: `docs/research/refs/home/gallery/sources.json` (43 entries, every capture with its final URL and page title). Driven headless at 1440×900 with `tools/research/capture.ts`; consent banners answered with the most privacy-preserving button (Friluftsland's Danish "Afvis alt" by an explicit step); nothing signed in, nothing typed except Ctrl K on the kbar demo.

**The screen's job.** Greet the dealer; show what they sell (kinds) and their brands, photographed; open drafts; one primary act, New quote; search (Ctrl K). The old home dashboard was hated and its bottom bar called disgusting — neither shape returns, so nothing below is read as "a dashboard".

**What was mined and how.** The seed list (the car and boat brands, Linear, Notion, Vercel, Stripe, Apple; for Home specifically Nimbus, Porsche Finder, Riviera/Saxdor) is another agent's. This sweep went to the galleries and the write-ups for the three things a dealer's home does that a brand's home does not: sell *kinds and brands* side by side (retailers, marketplaces, dealer groups), open with *one act and a search* (the one-box homes and the command menus), and carry *drafts and empty states* honestly (app homes). Galleries reached: siteinspire.com (category pages read; Canyon from Cycling), awwwards.com (`/websites/retail/` and `/websites/e-commerce/` read; Friluftsland, Sigma, Brigade), lapa.ninja (category pages read live in the browser; Automotive, Outdoors, E-commerce, AI lists), recent.design (the `/websites` feed read; its item pages render empty, no live links), refero.design (page types listed, six Dashboard thumbnails, then a login wall), saasframe.io (Dashboard and Welcome Screen lists — names only; OpenAI is where ChatGPT was found), saasinterface.com (Dashboard names only). Galleries that refused: mobbin.com (403 from a Sydney edge, for the fetcher and for a real browser), land-book.com (Cloudflare check). Design-forward write-ups used: rightboat's "top 5 boat marketplaces" (Boat Trader, YachtWorld), xda's Spotify web-player redesign piece, the Mobbin glossary entry and techinterview's write-up on ⌘K menus (cmdk), the UX Collective piece on Airbnb's category redesign and refero's Airbnb style page. Muzli's "50 best dashboards 2026" was read and set aside: every item is a concept shot with invented figures, nothing to drive.

Every frame below was looked at. Composition, type and colour are what is in the still; **no motion was measured** — a still cannot show it. Where a carousel, a video or a sticky header was visibly present, that is said, not its timing.

---

## The ranked six

1. **boatsales.com.au** (`boatsales-home`) — the kinds as a row of seven small silhouettes with one word each, sitting under a four-field finder whose button says "Show 13,071 boats": the true count is the button, and Type / Make is exactly kind / brand.
2. **Canyon** (`canyon-home-scrolled`) — three cut-out bikes on white with one word each (Road, Gravel, Mountain) and a fourth door drawn as a forking arrow, "Help me decide": the purest "what we sell" row found, with an honest way in for someone who does not know the kinds.
3. **Friluftsland** (`friluftsland-home`) — brands and kinds share one tile grammar: a photograph, a small serif line saying what the tile does ("Se alt fra", "God komfort - se alt") and one big condensed word (ARC'TERYX, FODTØJ); the search placeholder states "20.000+ varer og guides".
4. **cmdk, Vercel theme** (`cmdk-vercel`) with **kbar** (`kbar-open`) — the Ctrl K menu with a "Search Projects… / Create New Project…" pair per group and the shortcut printed as keycaps on the row; kbar shows the same menu on a light page with subtitles under the rows.
5. **Perplexity** (`perplexity-home`) — the rail leads with "+ New" and carries the empty states as grey sentences ("No projects", "No recent sessions") where the drafts would be; the greeting is the question ("What do you want to know?") over one field.
6. **H.R. Owen** (`hrowen-home`) — the dealer's brands as a wall of white marques on glass over the showroom photograph, the dealer's own services as tiles in the same row: the most direct "their brands, photographed" in the sweep.

Runners-up worth a look on the board: **Airbnb** (rows titled with an arrow, equal square photographs with a three-line caption — the grammar for open drafts; kinds as icon tabs in the header; the search collapsing into a pill on scroll), **Garmin Marine** (a 3-across grid of photographs of the thing in use with one word centred — 480px each fills 1440 exactly), **Brigade Overland** (the brands as the first row of the page; a typographic index where only the current line is black), **YachtWorld** (search-first in three parts: a light caps headline, one field with a spoken placeholder, one link), **Spotify's library rail** (empty states as cards with one sentence and one button each), **BCF** (kinds photographed as people doing the thing, and "My store: BCF Underwood" in the header), **Sigma** (the object named in a large serif over its own photograph).

---

## One entry per site

Each entry: where it was found (gallery page), what was driven, what is in the frame, the pattern by name, what it does for the dealer at the desk, what to avoid.

### boatsales.com.au — `boatsales-home`, `boatsales-home-scrolled`
- Found: not in a design gallery; reached from the marine-marketplace search (the rightboat "top 5 marketplaces" write-up names its Boats Group siblings; boatsales is the Australian one, part of carsales). Driven: https://www.boatsales.com.au/.
- Seen: white page; a green ad ribbon at the very top; header with a blue boat-line mark and the lowercase wordmark, "Buy / Sell / Research", icons, "Sign up/Log in", an outlined "Sell my boat" pill and a "Part of carsales" tag. A hero photograph that is an advertisement (a Sea-Doo). Overlapping its foot, a white card with a soft shadow: "Find your next boat" at about 22px; four labelled fields in a row (Type "Any type", Make "All makes", Usage "Any usage", Keyword "Search by keyword") and a blue button whose label is the live count, **"Show 13,071 boats"**; a second line of small filters (Location, New and used, Price min, Price max, Clear all); then seven kinds as small grey side-profile renders with a one-word label under each (Leisure, Cruiser, PWC, Ski Boat, Fishing, Sailing, Parts & accessories). Scrolled: another ad, a card "Sign up to save searches" (one icon, one sentence, one outlined button), "Latest boat videos" as three photograph cards. Type: a rounded grotesk (carsales' own; DM Sans-like), the card title the largest text on the page after the ads. Colour: one blue, everything else grey and white.
- Pattern: **finder card with the count in the button; kinds as an icon row**.
- For this screen: Type and Make are our two axes (kind, brand) and they sit in one row above the pictures of the kinds. The button carries a real number, which is the register our doors want ("53 tables · 15,691 rows"). The kinds at icon size — a silhouette and a word — show that a kind does not need a 4:3 tile to be recognisable.
- Avoid: three advertisements before the first honest content; the sign-up card in the flow; silhouettes in grey when we have photographs.

### Canyon — `canyon-home`, `canyon-home-scrolled`
- Found: siteinspire.com/website/6474-canyon (Cycling category, siteinspire.com/websites?categories=112). Driven: https://www.canyon.com/en-au/.
- Seen: white header — hamburger, "Shop / Why Canyon / Ride with us / Support", the slashed italic wordmark centred, a grey "Search …" pill, account, cart, an "AU | EN" pill; a black newsletter strip. The hero is near-black: a bicycle drawn as a translucent ghost with columns of specification text streaming vertically (frame sizes, "GX Eagle", "CF SLX 9") like a data index; "Unmissable outlet offers" at about 36px bottom-left with a white pill; carousel controls (pause, prev, next) as round buttons bottom-right and a progress bar centre. Below, on white: a row of four kinds — three side-profile bike cut-outs at equal size with one word each ("Road", "Gravel", "Mountain", about 20px) and a fourth drawn as a hand-sketched forking arrow labelled "Help me decide". Then a two-column bento: a light-grey card with a cut-out bike ("Bike of the week — Endurace AllRoad", black pill) beside a photograph (a rider on a road, two pills). Type: a narrow grotesk throughout; black on white; the only colour the photographs.
- Pattern: **kinds row of cut-outs; a fourth door for the undecided**.
- For this screen: the kinds row is the whole answer to "what they sell" in one line — the object, the word, nothing else — and "Help me decide" is the honest fourth tile for the person who has a customer but not a kind yet (for us that door is the search, or the picker's first question). The bento below shows one featured object large beside one photograph: a grammar for "the last draft" beside "the boat of the week".
- Avoid: an outlet promotion as the first screen; an autoplaying carousel; the data-stream hero as decoration (ours has real rows to show, but not as wallpaper).

### Friluftsland — `friluftsland-home`, `friluftsland-home-scrolled`
- Found: awwwards.com/websites/retail/ ("Friluftsland - Danish retail"). Driven: https://www.friluftsland.dk/; the Danish consent modal was answered with "Afvis alt" (reject all) by a step — the tool's English patterns did not match it (see `friluftsland-home` in the first run for the modal itself: reject and accept as two equal-width buttons).
- Seen: a dark-green strip (delivery notes); white header with a bear-and-small-caps-serif wordmark, one long search field whose placeholder is "Søg blandt 20.000+ varer og guides" (search among 20,000+ products and guides), and three icon-over-label items (customer service, stores, cart). A nav row in a condensed uppercase (Dame, Herre, Fodtøj, Udstyr, Sovegrej, Klatregrej, Mad og drikke | Events, Gavekort, Mærker, Tilbud in orange). Then a 3×2 grid of edge-to-edge photographic tiles with hairline gaps; each carries a centred two-line caption — a small serif line ("Se alt fra", "- 20 % på udvalgt", "Til korte og lange ture") over one big condensed uppercase word (ARC'TERYX, FJÄLLRÄVEN, FODTØJ, SOVEGREJ, RYGSÆKKE). Brands and kinds are the same tile; the first tile is a promotion. Scrolled: product rows on white ("Vandtæt beklædning", "Rygsække og tasker") with orange prices and green "Vælg variant" buttons. Colour: forest green and one orange on white.
- Pattern: **one tile grammar for brands and kinds; the count in the search placeholder**.
- For this screen: the small line above the big word is what makes a tile a door rather than a picture — "See everything from" says what pressing it does. That a brand tile and a kind tile are the same object means the dealer's brands (Stacer, Highfield) and kinds (boats, motors, trailers) can sit in one grid without two visual systems. The search's placeholder carries a true number.
- Avoid: a promotion as the first tile; the deals carousel; six tiles when the file has fewer photographed brands (an empty tile is not a tile).

### cmdk (SolidJS port of pacocoursey's ⌘K) — `cmdk-linear`, `cmdk-raycast`, `cmdk-vercel`, `cmdk-framer`
- Found: mobbin.com/glossary/command-palette (surfaced by search; the page itself is behind Mobbin's 403) and techinterview.org's "Build a Command Palette: Cmd+K Like Linear and Vercel". Driven: https://cmdk.paco.me/ now redirects to the GitHub repository (the first-run frames were GitHub pages and were overwritten), so the faithful port's demo was driven instead — https://cmdk-solid.vercel.app/ — with its theme buttons clicked by selector.
- Seen: a dark page with the menu as one centred card (about 640px wide) and a theme row beneath (Raycast, Linear, Vercel, Framer, Shadcn). **Linear**: a context chip above the input ("Issue - FUN-343"), placeholder "Type a command or search…", rows of icon + label with a single-letter shortcut at the right (A, I, S, P, L, ⇧L), the active row marked by a 2px violet bar at the left edge and a lighter fill. **Raycast**: placeholder "Search for apps and commands…", group headings ("Suggestions", "Commands") in 12px grey, rows with app icons and a right-aligned kind ("Application", "Command"), a footer bar with "Open Application ↵" and "Actions ⌘K". **Vercel**: a "Home" chip, placeholder "What do you need?", groups Projects / Teams / Help, each with a "Search Projects…" and a "Create New Project…" row, two-key shortcuts as small keycaps (S P, ⇧ P, ⇧ D), the active row a soft grey slab. **Framer**: two panes — components listed left with orange icon tiles, a name and a one-line description, and a live preview right.
- Pattern: **command menu with groups, keycaps on rows, and a search/create pair per group**.
- For this screen: the Vercel theme is the Ctrl K our home needs, almost verbatim — "Search quotes…" beside "New quote", "Search customers…" beside "New customer", the shortcut printed on the row so the second time is faster. The context chip (Linear) is how the palette can say *where* it was opened from ("Home", or a quote's reference). Raycast's footer is the place for "Open ↵" and "Actions".
- Avoid: Framer's preview pane (a second screen inside a menu); dark as the default (dark is offered, not default); icons on every row when a row is a quote (the boat's thumbnail, or nothing).

### kbar — `kbar-open`
- Found: the same command-menu write-ups; kbar.vercel.app is the library's own demo. Driven: https://kbar.vercel.app/ with a Ctrl K keypress.
- Seen: a white documentation page; the palette drops from the top as a card with a soft shadow, the page behind it stays readable (no blur, no veil): placeholder "Type a command or search…", section labels "NAVIGATION" and "DOCUMENTATION" in 11px caps grey, rows with an icon, a title and a subtitle ("Home — Subtitles can help add more context."), keycaps at the right, some as sequences ("g d", "g t"), the active row marked by a 3px black bar at the left and a grey fill. A Carbon ad top-right.
- Pattern: **light command menu; sequence shortcuts; subtitles on rows**.
- For this screen: proof that the menu works on a white page without a veil; the subtitle is where a quote row says who it is for and its price; "g q" style sequences are an option for a keyboard-first sales manager.
- Avoid: the ad; two-letter sequences as the *only* way (a printed single key beats a chord for someone who reads nothing).

### Perplexity — `perplexity-home`
- Found: not in a gallery reached (saasframe's Welcome Screen list names OpenAI, not Perplexity); driven because it is the search-first one-act home in its current form. Driven: https://www.perplexity.ai/.
- Seen: a light-grey rail (240px) left: the mark, then "+ New" as the first item (a plus in a circle), "Computer", "Artefacts", "Customise"; then two collapsible groups whose bodies are one grey sentence each — "Projects · No projects", "Sessions · No recent sessions"; "Sign In" at the foot. The stage: an eyebrow "Search", the question "What do you want to know?" at about 24px, one rounded field "Ask anything…" with mode pills (Search ▾, Computer), "Model ▾", mic and submit; below it two grey explainer cards ("Search anything", "Get work done with Computer NEW"). Type: a humanist grotesk (Söhne-like) with an old-style serif in the eyebrow? — no, all grotesk; the question is the only large text.
- Pattern: **the act first on the rail; empty states as grey sentences; the greeting as a question**.
- For this screen: "No recent sessions" in grey where the drafts would be is the honest empty state the plan demands, done as one line rather than an illustration. "+ New" at the top of the rail is the primary act placed where it acts. The question as the greeting is a way to greet without "Welcome back".
- Avoid: the two explainer cards (a home should not explain itself); a "Sign In" at the foot when the desk is already named.

### H.R. Owen — `hrowen-home`, `hrowen-home-scrolled`
- Found: not in a gallery reached; driven as the multi-brand dealer group whose home is its brands (the dealer-website round-ups that came up — colorlib, webcitz — could not be fetched). Driven: https://www.hrowen.co.uk/.
- Seen: a black header — "Menu", the chequered-flag wordmark centred with "OFFICIAL DEALER" beneath, "Approved Used" with a search glyph right. A full-bleed video frame of the Ferrari showroom (cars lined up on the forecourt; a "[music]" caption badge betrays a YouTube embed). Over its lower third, two rows of brand tiles: translucent dark boxes with the marque in white — Aston Martin, Bentley, Bugatti, Ferrari, Lamborghini, Lotus, Rolls-Royce, BAC; Czinger, Hennessey, Rimac, Zenvo — and then the dealer's own services as tiles in the same row (H.R. Owen Specialist Cars, Aftersales, Insurance). The second frame caught the menu drawer open over the page (Contact Us, Our Brands ›, Used Cars ›, Our Dealerships & Service Centres ›, Servicing & Aftercare, Sell My Car, News, Insurance, Supercar Storage, Careers, About Us): a plain list with hairlines.
- Pattern: **brand wall on glass over the showroom**.
- For this screen: this is "their brands, photographed" with nothing else on the first screen — the marques equal, white, on glass, over the place where they are sold. For a dealer with a handful of brands the wall becomes one row; the dealer's own things (trailers, service) sit in it as peers, which is honest about what a dealer sells.
- Avoid: a video with a caption badge; a wall of twelve when we have five; the drawer as the way to everything; black as default.

### Airbnb — `airbnb-home`, `airbnb-home-scrolled`
- Found: styles.refero.design/style/c2325884-4391-4688-85cd-e143f5107517 (Refero's Airbnb style page) and the UX Collective piece on Airbnb's category-led redesign. Driven: https://www.airbnb.com.au/ (localised to Queensland by the headless session's location).
- Seen: white; the header has the kinds as tabs — "All" (a globe), "Homes" (a house), "Experiences" (a balloon), "Services" (a bell) — small 3D icons over 14px labels, the active one underlined; right, "Become a host", a globe, a menu. Under it a wide pill with three labelled segments (Where / When / Who) and a red round search button. Then rows: a title with an arrow ("Popular homes in Gold Coast →") and seven equal rounded squares per row, each a photograph with a heart and a "Guest favourite" chip, then three lines: name, dates, "$1,820 AUD total · ★ 5.0". Scrolled: rows by city ("Available in Brisbane City this weekend →"), "Explore experiences nearby →" as rounded-rect photographs with one-word labels (Water sports, Outdoors, Cultural tours…), the header collapsed to a compact pill ("Anywhere · Anytime · Add guests"). Type: Airbnb Cereal; row titles about 22px semibold; captions 14/12.
- Pattern: **kinds as icon tabs; rows titled with an arrow; the search collapsing on scroll**.
- For this screen: the row grammar is what "open drafts" could be — a title with an arrow, then squares each showing the draft's boat with the customer, the date and the price beneath — and the kinds in the header as three tabs is a compact alternative to a tile grid. The collapse of the search into a pill is a sticky pattern worth naming for a page that scrolls.
- Avoid: seven per row (needs a scroll arrow); hearts and badges; the red; a page that is nothing but rows.

### Garmin Marine — `garmin-marine`, `garmin-marine-scrolled`
- Found: not in a gallery reached; driven as a marine brand's own category home (Garmin is in the seed for Entry only). Driven: https://www.garmin.com/en-AU/c/marine/.
- Seen: white; a header of condensed caps nav (Smartwatches … Marine … Sale); a full-width photograph (a motor yacht on flat water at dawn); "MARINE" in condensed caps at about 44px centred beneath it; a black "FEATURED" band with a notch; product cards on white (cut-outs, a condensed name, one line). Scrolled: a 3×2 grid of edge-to-edge photographs, each with one caps word centred on it — CHARTPLOTTERS (a hand on a plotter), LIVE SONAR (a fish under water), STEREOS & SPEAKERS, TRANSDUCERS, TROLLING MOTORS, ICE FISHING BUNDLES & KITS. Type: Garmin's own condensed grotesk (Oswald-like). Colour: none but the photographs.
- Pattern: **kinds grid, one word centred on a photograph of the thing in use**.
- For this screen: three across at 480px each fills 1440 without a gutter; the photograph shows the kind *being used* (a hand, a fish) rather than the product on white — for a boat dealer that is the boat on the water, the motor on the transom, the trailer on the ramp. The single centred word is the least a label can be and still be read.
- Avoid: the black band with a notch; a product carousel between the hero and the kinds; darkened photographs (Garmin veils each tile to make the white word legible — measure contrast instead of dimming the boat).

### Brigade Overland — `brigade-home`, `brigade-home-scrolled`
- Found: awwwards.com/websites/e-commerce/ ("Brigade Overland"). Driven: https://brigadeoverland.com/.
- Seen: a cream ground; a black strip; then the brands as the first row of the page — Darche, Lightforce, Zarges, Equipment, Shipping, Returns — as condensed caps tabs; the red shield logo hangs down over the hero from the centre; the hero splits: left a dark-green panel with a topographic line pattern, an eyebrow, a condensed caps headline ("THE UNRIVALED DRIVING EXPERIENCE") and a paragraph with a "SHOP NOW" pill; right a photograph (4WDs at dusk with light bars) with a thumbnail strip and a pause button. Scrolled: six portrait category tiles (Tents, Swags, Awnings, Cases, Chairs, Furniture) — photographs with the word top-left in condensed caps and a round arrow bottom-right; then a section with a stacked-polaroid photograph left and, right, a typographic index — eyebrow over headline, three times ("Australia's favorite — SWAG & COT COMBOS →", "Light it up — LIGHTFORCE LIGHTS", "Throw shade — THE BEST AWNING COVERAGE"), only the first in black, the rest greyed. Type: a condensed grotesk in caps (Tungsten-like) with a plain grotesk for body. Colour: cream, green, red.
- Pattern: **brands as the top row; portrait kind tiles; a greyed index**.
- For this screen: putting the brands in the first line of the page, as words, is the cheapest brand register there is; the greyed index (one black line, the rest grey) is a way to list drafts as text and still say which is current. The portrait tile with the word in the corner leaves the photograph alone.
- Avoid: the palette; a marketing paragraph in the hero; "Shipping" and "Returns" as peers of brands (the row mixes what is sold with policy).

### YachtWorld — `yachtworld-home` (the scrolled frame was refused)
- Found: rightboat.com/blog/top-5-boats-marketplaces. Driven: https://www.yachtworld.com/; the second visit for the scrolled frame returned "Access Denied" (Boats Group's protection on repeat hits; not fought).
- Seen: a full-bleed photograph (a Princess Y72 at speed, an advertisement) under a translucent dark bar (wordmark, "Boats for sale / Yachts for sale / Become a member", region); a caption bar "EXPLORE PRINCESS Y72"; then on white: "FIND YOUR NEXT YACHT" in a light, wide grotesk caps at about 36px, one long field with `Try "sailboats in Florida under $300k"` and a navy SEARCH block, "BROWSE ALL INVENTORY →" beneath. Nothing else in the frame.
- Pattern: **search-first in three parts**.
- For this screen: the sparsest search home in the sweep — a headline, one field with a placeholder written as a person speaks, one link for the browser. For us the placeholder would be a real thing the file can answer ("Stacer 529 with a 115"), never a made-up query.
- Avoid: an advertisement as the hero (the first thing the dealer sees is someone else's boat); caps headline in a light weight over 1440 (it reads as a banner).

### Boat Trader — `boattrader-home`, `boattrader-home-scrolled` (the boat-types frame was refused)
- Found: rightboat.com/blog/top-5-boats-marketplaces; boattrader.com/about. Driven: https://www.boattrader.com/ twice (the third visit, aimed at the boat-type tiles, returned "Access Denied").
- Seen: a white header with a bold serif wordmark, "Find ▾ / Sell Your Boat / Finance ▾ / Services ▾ / Research ▾ / Open a Dealer Account", Sign up / Log in; a blue finance banner. A navy band: at its left a panel "Find your perfect boat" — a field with a sparkle glyph and the placeholder `Try "fishing boats under $80k"`, an "OR" rule, two selects ("All Boat Types", "All Manufacturers"), "Within 200 Miles of Your Location", a wide blue pill "Search"; hanging below it a white card "Sell Your Boat Fast!" (a serif) with a second blue button. The rest of the band held a brand advertisement in the second frame (Grand Banks) and nothing in the first (it had not loaded). Below: "Boats Near You · Based on your location" over four blank white cards that never filled. Scrolled: brand logos in outlined white boxes in a row (Passport Yachts, Ranger Tugs, Ocean Alexander, Cutwater, Maritimo), "Shop All Brands", then "Recent Articles and Reviews" as photograph cards. Type: a Roboto-like grotesk; the serif for the wordmark and the sell card.
- Pattern: **spoken search plus type/manufacturer facets; brand logos as a row of boxes**.
- For this screen: the search sentence and the two facets are our search and our two axes in one panel; the logo row is the plainest brand register (each marque in its own box, equal, on white). The blank "Boats Near You" cards are the lesson: a section with nothing in it must say so in a sentence, not draw four rectangles.
- Avoid: two blue primaries stacked; the advertisement in the hero; a finance banner; blank lazy cards.

### BCF — `bcf-home`, `bcf-home-scrolled`
- Found: not in a design gallery; from the marine-retail search (it is the Australian boating-camping-fishing chain the dealer's customers know). Driven: https://www.bcf.com.au/.
- Seen: a one-line cookie note; a navy header with the orange-rimmed BCF shield centred and large, "Find a store · My store: BCF Underwood" left, "Join now | Login · My cart" right; a mid-blue nav row (Products, Offers, Catalogue, Brands, Clearance as a red block, New, Blog) ending in a search field "Search for anything" with an orange SEARCH button. The hero is a cartoon promotion (Bluey × BCF); under it "CATALOGUE OUT NOW" with pill filters. Scrolled: deal cards with big red prices and star ratings; then "SHOP BY CATEGORY" in blue caps and five 4:5 photographs of people doing the thing — a man on a plate boat with rods (Boating), a family at a camp stove (Camping), a child fishing off a jetty (Fishing), a paddleboard (Watersports), a 4WD on a beach — each with a blue label and an arrow beneath, in a scroll rail. Colour: navy, blue, orange, red, yellow.
- Pattern: **kinds photographed as use, not product; the store named in the header**.
- For this screen: "My store: BCF Underwood" is the dealer's place stated where it belongs; the kinds are photographs of what a customer will *do* with the thing, which is what a boat dealer sells too (a day on the water, not a hull on white). Where the seed has on-water photography (the Stacer 529) this is the register; where it has only renders (Highfield) the direction must say so.
- Avoid: the retail palette and the price flashes; a cartoon promotion; ratings; the catalogue strip.

### Whitworths — `whitworths-home`, `whitworths-home-scrolled`
- Found: from the marine-retail search (Australian marine chandlery). Driven: https://www.whitworths.com.au/.
- Seen: a pale-blue strip "DISCOUNT MARINE SUPPLIES"; a blue header with a cartoon sailor mascot, a script wordmark, "Login or signup", a search field "Can we help you find something?"; a wavy blue-and-green rule; a nav row (Products, Gift Cards, Sale, Catalogue, Brands; Wishlist, Store Locator, Cart); a promotional carousel (youth sailing); then four category tiles — SAILING, FISHING, POWER, LEISURE — photographs with a diagonal blue corner and a heavy condensed caps word. Scrolled: "SHOP THE LATEST MONTHLY DEALS" with red SAVE flashes and yellow "Now Only" tags; "QUICK SHOP POPULAR CATEGORIES" as a row of blue pills (Ropes, Fish Finders, Wet Weather Gear, Flares, Anchors, Bilge Pumps…).
- Pattern: **four kinds under the hero; search as a question**.
- For this screen: the four-kind row directly under the hero, each word large, is the shape at its simplest; "Can we help you find something?" is a search that speaks. Kept as the control for what a marine home looks like when it is a catalogue flyer.
- Avoid: everything else in the frame — the mascot, the flashes, the tags, the diagonal corners.

### Spotify web player — `spotify-home`, `spotify-home-scrolled` (the home itself was not reached)
- Found: xda-developers.com/spotify-redesign-desktop-and-web-player. Driven: https://open.spotify.com/ — a headless, logged-out visit is redirected to a promoted album, twice, so the home's rows were not reached; the shell is what the frame shows.
- Seen: a black shell; a top bar with the mark, a round home button, a wide search pill "What do you want to play?" with a browse glyph at its end, then Premium / Support / Download, "Install App", "Sign up", a white "Log in" pill. A left column "Your Library" with a "+" and two dark cards, each a sentence and one button: "Create your first playlist — It's easy, we'll help you — [Create playlist]" and "Let's find some podcasts to follow — [Browse podcasts]". The stage: the album — a 232px cover, "Album" eyebrow, the title in a very heavy grotesk at about 72px (Spotify Mix / Circular-like), a meta line, a green play disc; a cookie strip across the foot. Scrolled: the track list with a sticky title bar.
- Pattern: **empty states as cards with one act; search as a sentence in a pill**.
- For this screen: the two library cards are the model for "no open drafts yet" — one plain sentence of encouragement and one button that does the thing (ours: "No quotes yet. Start one." → New quote). The 72/14 scale contrast on the album head is what a single large title does on a dark ground.
- Avoid: black as default; a promoted item where the home should be; the cookie strip on a working screen.

### ChatGPT — `chatgpt-home`
- Found: saasframe.io/categories/welcome-screen (listed as OpenAI). Driven: https://chatgpt.com/.
- Seen: an off-white page; a slim icon rail (new chat, search, library, …) left; "ChatGPT ▾" top-left; "Log in" as a black pill and "Sign up for free" outlined top-right. The whole page is one line, "What's on the agenda today?" at about 24px in a humanist grotesk, above a single rounded field "Ask anything" with a "+" and a mic; two lines of legal at the foot. Nothing else.
- Pattern: **one act as the whole home**.
- For this screen: the extreme our home can be measured against — the greeting is a question, there is one field, and the rail is icons. It shows what "one primary act" looks like when it is the only thing; ours must add the kinds and the brands without losing this quiet.
- Avoid: the emptiness hiding what the business sells; log-in pills where the desk should be named; a rail of icons without words.

### Sigma Imaging — `sigma-home`, `sigma-home-scrolled`
- Found: awwwards.com/websites/e-commerce/ ("Sigma Imaging"). Driven: https://www.sigma-imaging.se/.
- Seen: a black announcement strip; a white header with tiny caps nav and "SIGMA" as a serif wordmark centred, "Sweden / Personal · Login · Search · Cart (0)" right. The hero: one lens photographed in a dark studio, full width, with its name set over it in a large display serif — "Art" over "85mm F1.2 DG" at about 110px, white. Scrolled: two photographs side by side, each with a serif caption ("CONTEMPORARY 20-60mm F2.8-4 DG", "NEW LENS FOR AIZU PRIME LINE") and "EXPLORE MORE". Monochrome; no kinds on the first screen.
- Pattern: **the object named in large type over its own photograph**.
- For this screen: the "logo as showpiece" idea done with the product: the thing and its name, nothing else on the frame. For the dealer, a held on-water photograph with the model's name set this large is a direction's hero — and only for the models that have such a photograph.
- Avoid: an announcement strip; a first screen with no kinds at all; a serif that is Sigma's.

### Northside Marine (ground truth, not a gallery pick) — `northside-home`, `northside-home-scrolled`
- Found: the dealer's own public site, captured so the board can see what the dealer says today. Driven: https://www.northsidemarine.com.au/.
- Seen: a navy header — the wave-lines wordmark with "EST. 1965" and a yellow script strap "Life beyond the shore"; two addresses (Boondall, Coomera) with "View on map"; two phone numbers set large ("Brisbane (07) 3265 8000", "Gold Coast (07) 3265 8088"); Service and Parts numbers; three social discs. A light-grey nav: New Boats, Used Boats, Sell Your Boat, Aussie Boat Club, On Water Day, Yamaha, Trailers, About Us, Online Store. The hero: an on-water photograph (a centre-console plate boat, two crew in Yamaha kit) with a translucent white card at its left carrying a press paragraph ("Australian-built plate aluminium boats now available… Formosa") and a red "FORMOSA" button. Scrolled: the next band is a Jeanneau photograph with a white card (the Jeanneau logo, an italic strap, a paragraph, a navy button). Type: a geometric caps nav (Montserrat-like), Open Sans body.
- Pattern: **brands as bands, each a photograph with a paragraph**.
- For this screen: it names the two places and the kinds (New, Used, Trailers, Yamaha) in the nav, and it presents each brand as a full band with its own photograph — the public face our home replaces for the desk. It also shows what not to do with a photograph: put a paragraph on it.
- Avoid: the phone-book header; the paragraph on the picture; a red button that is the brand's, not the dealer's.

---

## Patterns worth naming for the board

- **Kinds row** (Canyon, boatsales, Whitworths, Garmin): a picture per kind and one word, at any size from a 90px silhouette (boatsales) to a 480px tile (Garmin); Canyon adds the fourth door, "Help me decide".
- **Brand wall** (H.R. Owen, Boat Trader's logo boxes, Brigade's top row, Friluftsland's tiles): the marques equal and on one line, on glass over the showroom or in white boxes; brands and kinds can share one tile grammar (Friluftsland).
- **Search that speaks** (Boat Trader, YachtWorld, Whitworths, Spotify, Perplexity): the placeholder written as a person talks, and the count where it is true — in the button (boatsales "Show 13,071 boats") or the placeholder (Friluftsland "20.000+").
- **Search/create pairs in the palette** (cmdk Vercel): each group offers "Search X…" and "Create new X…", with the shortcut printed as keycaps on the row; kbar shows it on a light page with subtitles.
- **Empty state as a sentence** (Perplexity "No recent sessions") **or a card with one act** (Spotify "Create your first playlist"): never blank rectangles (Boat Trader).
- **Rows titled with an arrow** (Airbnb): the grammar for open drafts — equal squares, the boat's photograph, three lines of fact beneath.
- **The act first on the rail** (Perplexity "+ New"): the primary act placed where it acts, above everything.
- **The object named large over its photograph** (Sigma; Spotify's album head): one title, one picture, for the models that have a real photograph.
- **The place named in the header** (BCF "My store: BCF Underwood"; Northside's two addresses): which business, where.

## What to avoid (measured in the frames)

- An advertisement or a promotion as the first screen (Canyon's outlet, boatsales' Sea-Doo, Boat Trader's Grand Banks, YachtWorld's Princess, BCF's Bluey, Whitworths' carousel): the dealer's home opens on someone else's message.
- Blank lazy cards standing in for content (Boat Trader's "Boats Near You").
- A paragraph on a photograph (Northside's brand bands; Brigade's hero).
- The catalogue-flyer register — red flashes, yellow tags, star ratings (Whitworths, BCF).
- Two primaries stacked (Boat Trader), sign-up prompts in the flow (boatsales, Spotify), explainer cards under the one field (Perplexity).
- Dark as the default ground (cmdk, Spotify, H.R. Owen, Canyon's hero) — offered, not default.
- Twelve marques when there are five (H.R. Owen); seven tiles per row that need a scroll arrow (Airbnb); six tiles when only four brands have pictures (Friluftsland's grid would show a gap — an empty tile is not a tile).
- Photographs veiled to make white words legible (Garmin): measure the contrast, do not dim the boat.
- A video embed with a caption badge (H.R. Owen); a cookie strip or an announcement strip on a working screen (Spotify, Sigma, BCF).
- A bottom bar of any kind — none of the references above has one, and the two that put actions at the foot (Spotify's player, cmdk Raycast's footer) do so for a player or a menu, not a page.

## Imagery: which references let the picture carry the page

- **Photography carries it:** Friluftsland (people in the landscape, one word each), Garmin (the thing in use), BCF (people doing the thing), Brigade (portrait tiles), YachtWorld and Boat Trader (a boat at speed as the hero — but as an advertisement), H.R. Owen (the showroom under a brand wall), Northside (on-water, with a paragraph on it), Airbnb (seven squares a row), Sigma (one object, monochrome).
- **Cut-outs and renders:** Canyon (side-profile bikes on white), boatsales (grey silhouettes at icon size), Garmin's product cards. Honest for a brand that has only renders (Highfield) — a direction that uses this register must say the pictures are renders.
- **Marques as the picture:** H.R. Owen (white on glass), Boat Trader (logos in boxes), Brigade (names as a row).
- **Typographic, no picture:** ChatGPT, Perplexity, cmdk, kbar, YachtWorld's search block, Boat Trader's finder panel. The menu and the one-field home are the two places where type alone is enough.

## Failed or changed (from the ledger)

- `sonos-home`, `sonos-home-scrolled` — "Access Denied" (Akamai) at sonos.com; not fought.
- `westmarine-home`, `westmarine-home-scrolled`, `westmarine-brands` — "Access to this page has been denied" (PerimeterX) at westmarine.com; not fought.
- `unsplash-home` — an Anubis bot check ("Making sure you're not a bot!"); not fought.
- `icebug-home` — the first frame is its cookie wall (a "Strictly necessary" button the tool's patterns do not match) behind a country modal; the retry's step timed out. Recorded, not described.
- `cmdk-linear/raycast/vercel/framer` — cmdk.paco.me now redirects to GitHub; the first-run frames were GitHub pages and were overwritten by the SolidJS port's demo (cmdk-solid.vercel.app), which reproduces the same four themes.
- `yachtworld-home-scrolled`, `boattrader-types` — "Access Denied" on a repeat visit within the run (Boats Group's protection); the first visits stand.
- `spotify-home`, `spotify-home-scrolled` — the logged-out web player redirects to a promoted album; only the shell (search pill, library rail with its empty-state cards) was reached.
- `friluftsland-home-scrolled` — failed once when the consent step found no modal (already answered in the context); recaptured without the step.
- `hrowen-home-scrolled` — the frame shows the menu drawer open over the page rather than a scrolled page; kept because the drawer is itself informative.
- Galleries: mobbin.com 403 (Sydney edge) for both fetcher and browser; land-book.com Cloudflare; refero.design shows six Dashboard thumbnails then a login wall; recent.design's item pages render empty, so Podium, Displace, Avara and Icebug from its Websites feed have no live URL from the gallery (Icebug's was known and driven).
