# Home — gallery mining (beyond the seed list)

Sweep date 2026-09-16, in two passes (the second is the last section of this file, and adds 35 frames the first did not reach). Frames: `docs/research/refs/home/gallery/*.png` (gitignored; mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\home\gallery\`). Ledger: `docs/research/refs/home/gallery/sources.json` (75 entries, every capture with its final URL and page title). Driven headless at 1440×900 with `tools/research/capture.ts`; consent banners answered with the most privacy-preserving button (Friluftsland's Danish "Afvis alt" by an explicit step); nothing signed in, nothing typed except Ctrl K on the kbar demo.

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

---

# Second pass — the registers, the auction homes and the dealer groups

Same day, same tool, same window (1440×900), a different question. The first pass answered "what does a home that sells *kinds and brands* look like". This pass went after the two halves it left thin: **a home whose middle is a live register of work in progress** (auction marketplaces, public app homes) and **a dealer group's own home**, where the brands on the wall are somebody else's and the business in the header is yours. 35 frames; 20 sites reached, 4 refused.

**Where each was found** is in its entry. In short: the galleries paid badly for this screen. `awwwards.com/websites/automotive/` and `/inspiration_search/Marketplace/` returned agency microsites (HB Body, NEXUS, SBD, Voy en Auto, Creative Apes, Spaace) — none of them a working home; `awwwards.com/websites/e-commerce/` gave thirty small shops of which two were worth driving; `land-book.com` (`/design/product-listing-page`, `/gallery?search=…`) and `lapa.ninja/category/dashboard/` both 403 the fetcher as they did in the first pass; `refero.design/screens/dashboard` renders to a title and nothing else; `mobbin.com/explore/web/screens/home` 403s. What did pay: **awwwards' own SOTD page** for Cosmos, **siteinspire's site page** for the same (`/website/11581-cosmos`), **`awwwards.com/inspiration_search/Marketplace/`** for DeLorean, and **saasframe.io/categories/dashboard + saasinterface.com/pages/dashboard/** for the names of dashboards worth driving (Grafana is the only one of them with a public sandbox). The rest were reached by naming the job — collector auctions, boat dealer groups, public registers — and driving them.

Three ids from the first pass were re-driven and their frames replaced, on purpose, because the first captures were half-loaded: `boattrader-home`, `boattrader-types` (refused again) and `yachtworld-home` (this time the advertisement slot never filled, which is its own finding).

**Motion actually observed: one instance.** Cosmos's search placeholder reads `Try 'luxury product packaging'` in `cosmos-home` and `Try 'archival animations'` in `cosmos-scrolled` — the placeholder cycles. Nothing else in these 35 frames differed between captures, so nothing else here claims motion.

## The ranked six of this pass

1. **Collecting Cars** (`collectingcars-home`) — a row of five icon-and-word tabs that are *states, not categories* (This Week · Saved · Live Auctions · Coming Soon · Results) over cards carrying a labelled figure, a countdown, a place and a bid count: the best grammar found anywhere for "open drafts".
2. **Hugging Face** (`huggingface-home`) — the door shows its own register: 2,555,000 stated in the panel's header, rows reading `openai/gpt-oss-120b · Text Generation · Updated Aug 26, 2025 · 2.88M`, and the second act written as "Browse 2M+ models" rather than "Learn more".
3. **John Deere** (`deere-home`) — eight circular photographs in one row, *Parts* and *Used Equipment* standing as peers of *Excavators*: the plainest statement of "everything this business sells" in the sweep, and the clearest warning that a circle crops a long object badly.
4. **Cars & Bids** (`carsandbids-home`) — one chip rail mixes state with marque (Live Auctions · Past Results · **Recently Viewed** · Corvette · 911 · Porsche · M3 …), so "where I was" and "what I sell" become the same control.
5. **Hagerty Marketplace** (`hagerty-marketplace`) — the featured lot as a split card: one big photograph, a column of three thumbnails, then the facts and a single black "View auction ›" — a "carry on with this one" object that needs no explaining.
6. **MarineMax** (`marinemax-home`) — the world's largest boat dealer gives the whole fold to one on-water photograph with the search laid across it and says what it is in two lines: a dealer home that is a photograph and a question.

Runners-up worth a look on the board: **Denison Yachting** (BUY / SELL / CHARTER as tabs *above* one search field — the verb chosen before the words), **Are.na** (sort exposed as text, "Recently updated", and cards reading "56 blocks · less than a minute ago"), **shadcn/ui's ⌘K** (a light palette with one footer hint, `↵ Go to Page`, and no keycaps at all), **Cosmos** (the search field is the centre of the header and the content is the wallpaper), **Sotheby's** (a solid panel *beside* the photograph instead of type *on* it), **Chrono24** ("Search through 674,502 watches worldwide" as the placeholder), **DeLorean Marketplace** (ITEMS / ACTIVITY as two tabs, and a figure carrying its own label: "UNIQUE OWNERS: 1272").

---

## One entry per site

### Collecting Cars — `collectingcars-home`, `collectingcars-scrolled`
- Found: not in a gallery — reached from the collector-auction search after awwwards' automotive and marketplace listings returned only agency work. Driven: https://collectingcars.com/ (localised to Australia by the session, which is why the figures are A$ and the places are QLD/NSW/VIC).
- Seen: white; a hairline header with the bird wordmark, one long search field ("Search for make, model, category, etc."), a blue "Sell" pill with a tag glyph, "Sign In", a hamburger. Under it a second row of five tabs, each a small icon over a word — This Week (a trend arrow, underlined blue), Saved (heart), Live Auctions (gavel), Coming Soon (bell), Results (trophy). Then a section headed by a grey eyebrow "LAST CHANCE" over "DON'T MISS →" in heavy caps at about 28px, with two round carousel buttons at the right. Four cards, about 305px wide: photograph on top, then a sand-coloured block carrying the title in caps over two lines ("1960 PORSCHE 356 B 1600 COUPE"), an 11px grey label "CURRENT BID" over "A$175,500" in bold, a red pill with a clock reading "06:55:48", a hairline, then a footer line with a flag, "TALLAI, QLD" and "35 BIDS" right-aligned. Scrolled: the same grammar re-used for a *different register entirely* — "FROM COLLECTING.COM / ENDING SOON →" over four wristwatches in the same card.
- Pattern: **state tabs over a titled row of fact-cards**.
- For this screen: every part of that card maps onto a draft — the boat's photograph, the model or the customer where the title is, "TOTAL" where "CURRENT BID" is, the figure in the same weight, the time as *when it was last touched* rather than a countdown, and the place ("Boondall") where the location sits. The tab row answers drafts-versus-issued without inventing a dashboard: five words, one underlined. The watches prove the card survives a change of kind — boats, motors and trailers can share it.
- Avoid: the heart on every card; a countdown (nothing in a quote expires); caps titles wrapping to two lines (a Highfield model name would break badly).

### Hugging Face — `huggingface-home`
- Found: not in a gallery reached; driven because it is the one public home whose hero *is* its own register. Driven: https://huggingface.co/.
- Seen: white page, black hero card (about 1246×640, 24px radius) inset with a margin. The header comes first: mark and wordmark, then immediately a search field ("Search models, datasets, users…"), then the nav as icon+word (Models, Datasets, Spaces, Buckets NEW, Docs, Pricing), "Log In" and a black "Sign Up". Inside the card, left: the emoji mark at about 70px, "The AI community building the future." in a grotesk at about 44px where the last word is set in a *serif italic* — one word carries the voice; a two-line grey subline; then an outlined pill "Explore AI Apps", the word "or" in grey, and a text link "Browse 2M+ models". Right, bleeding off the card's edge, a real screenshot of the models register: a filter column (Tasks, Libraries, Languages, Licenses as chips) and a list whose header reads "Models 2,555,000" beside a "Filter by name" box, rows in mono — `moonshotai/Kimi-K2.5`, `openai/gpt-oss-120b`, `Lightricks/LTX-2` — each with a kind chip, "Updated 2 days ago", a download count and a heart count. Below the card, centred: "Trending on 🤗 this week".
- Pattern: **the register as the hero, with its true count in its own header**; **two acts, one of which is a number**.
- For this screen: this is our home's honest boast. The file holds 53 tables and 15,691 rows; the second act can read "Browse 15,691 rows" and be measured, and the picture behind it can be the real register rather than a rendering of one. The row line — name in mono, a kind, when it was touched, two counts — is a quote row almost exactly.
- Avoid: a dark card as the default ground; a screenshot that bleeds off an edge (ours would be live, not an image); "Sign Up" as the loudest object on a desk that is already named.

### John Deere — `deere-home`, `deere-scrolled`
- Found: not in a gallery; driven as the dealer-shaped equipment home (its whole retail model is dealers, and the header carries "Find a Dealer" beside "Sign In"). Driven: https://www.deere.com/en/.
- Seen: white; a slim header with the leaping-deer mark, a grey search pill, "Find a Dealer" with a pin, "Sign In"; a second nav row led by a "Home" item with a house glyph and a green underline. A 1376×350 promotional photograph ("BIGGER. BETTER. SMARTER." in white caps over an air cart, one outlined "See Them Now"). Then the row that matters: **eight circular photographs**, about 140px each, evenly spaced across the full width, a green label centred under each — Used Equipment, Harvesting, Compact Tractors, Mowers, Gator Utility Vehicles, Precision Upgrades, Excavators, Parts. Each circle is a real photograph of the machine, two of them at work. Below, three large photographic cards. Scrolled: promotional cards with green buttons, a dark band ("Your Farm. Your Data. Your Call." with a paragraph and a "Meet JD" pill), then two dense blocks of legal footnotes and a footer disclaimer beginning "Images of equipment models may be digitally or AI generated…".
- Pattern: **kinds as a single row of circular photographs, with parts and used stock as peers**.
- For this screen: the row answers "what do you sell" in one line and includes the unglamorous kinds — Parts, Used — at the same size as the machines, which is the honesty our places need (boats, motors, trailers, dealer fit and parts are peers, not a hierarchy). The count matters: eight fits 1440 comfortably at 140px; our kinds are fewer, so they can be larger.
- Avoid: the circular crop — a 5.29 m plate boat inside a circle is a smear of hull; Garmin's 3-across rectangles (first pass) are the right frame for a long object. And the disclaimer: Deere reserves the right to show a generated picture of the machine. Our image ledger forbids exactly that, and the home is where the difference shows.

### Cars & Bids — `carsandbids-home`, `carsandbids-scrolled`
- Found: not in a gallery; reached from the collector-auction search. Driven: https://carsandbids.com/.
- Seen: white; wordmark, a nav with one green pill in it ("Sell a Car") sitting among plain links (Auctions, Watch List, Collections, Events, About Us), a wide grey search field ("Search for cars (ex. BMW, Audi, Ford)"), a green "Sign Up". Then a horizontally scrolling **chip rail**: Live Auctions, Past Results, Recently Viewed, Corvette, 911, Porsche, M3, Mercedes-Benz, S2000, Ferrari, Mustang, AMG, R34 Skyline, Lamborghini…, with a round chevron at the right edge. The featured lot is a mosaic — one 855px photograph beside four smaller ones — with "FEATURED" as a grey chip top-left, the model and a spec line in white top-right, and a black pill bottom-left reading a clock, "2 Days" and "Bid $160,000". Below: "Auctions" as a section title at about 26px beside three dropdowns (Years, Transmission, Body Style), with sort options as plain text right-aligned (Ending soon underlined, Newly listed, No reserve, Lowest mileage, Closest to me). Then 4-up cards: photograph with the same black clock+bid pill, a bold title, a two-line spec sentence, a grey town line. Scrolled: eight more of the same, some with a blue "NO RESERVE" chip inline with the spec text. A promotional bar is stuck across the foot of the window.
- Pattern: **one chip rail carrying state and marque together**; **sort as text, filters as dropdowns**.
- For this screen: "Recently Viewed" sitting between "Past Results" and "Corvette" is the cheapest possible history — the dealer's last boats and their brands in one scrollable line, above everything. And the lot card shows how little a card needs: picture, one dark pill with the two facts that change, a name, two lines of spec.
- Avoid: the stuck promotional bar at the foot (the shape the owner called disgusting, here in its natural habitat); green for both "Sell a Car" and "Sign Up" so that neither is the primary; a chip rail that runs off the edge with no keyboard way along it.

### Hagerty Marketplace — `hagerty-marketplace`
- Found: not in a gallery; reached from the collector-auction search. Driven: https://www.hagerty.com/marketplace.
- Seen: white; a black wordmark with a blue "H", a nav (Insurance, Marketplace, Media, Drivers Club, Valuation) and an outlined "Log in"; a second row of small bold links — Search (with a glyph), Auction Results, Sell, Watch List, **My Garage**. Then the first content object on the page is the search: a 1050px rounded field ("Search by make, model, or keyword") with two outlined buttons beside it, "No reserve" and "⇄ Filter". The featured lot is one bordered card, full width: a 625px photograph, a column of three thumbnails, then a text panel — a clock line "7 days  Bid $13,250", the title at about 24px bold over two lines, a three-line paragraph of provenance, a grey place ("Mullica Hill, New Jersey"), a stat line "2,680 views • 11 bids", and one black pill "View auction ›" the full width of the panel. Carousel arrows outside the card, five dots under it. Below: "All listings (1,132)" with the count in grey, beside one dropdown, "Recommended".
- Pattern: **search as the first object on the page; one featured record as a split card with a single act**.
- For this screen: the split card is what "carry on with your last draft" should look like — the boat large, three detail frames, the facts as a short stack, one black button that says what it does. "All listings (1,132)" is the register's true count set in grey beside its title, which is where "53 tables · 15,691 rows" belongs when it is not in a button.
- Avoid: two competing ways to search (the nav "Search" and the field); a paragraph of prose inside a card a dealer reads once; a carousel on the one record you most want to act on.

### MarineMax — `marinemax-home`, `marinemax-brands`
- Found: not in a gallery; driven as the largest boat dealer group in the world, the nearest commercial analogue to Northside Marine. Driven: https://www.marinemax.com/ and https://www.marinemax.com/brands.
- Seen (home): a white 90px header — the red-and-navy wave wordmark, three dropdown words (Boats for Sale, Services, Discover), a hairline, "Locations | Contact", a search field ending in a big red "Search" pill, "My Account". Everything below is one photograph: a Sea Ray's bow at the waterline, a man stepping aboard, the shot cut half above and half below the surface. Over it at the left, white: "The World's Largest Boat & Yacht Retailer" at about 56px on two lines, a 20px subline ("Thousands of premium boats in stock. Simple financing. Great prices."), and a 640px white pill holding "Search Make, Model or Keyword" with a red "Find Boats" button inside it. A chevron at the foot invites the scroll. Bottom right, an assistant card ("Hi, I'm Maxie with MarineMax. Looking at boats today? I can pull pricing, suggest models…") and a blue chat disc with a "1" badge.
- Seen (brands): a navy band with "Premium Boat and Yacht Brands at MarineMax" at about 44px and a **four-line paragraph of search-engine prose**; then, on pale grey, "Our Premium Brands" centred and 27 brand names as plain text links in four columns — Aquila Power Catamarans, Aviara, Azimut, Barletta, Bennington, Bertram, Boston Whaler, Cobalt, Cruisers, Galeon, Grady-White, Harris, Intrepid, Mastercraft, MJM, Moomba, Nautique, Ocean Alexander, Premier, Sailfish, Saxdor, Scout, Sea Ray, Supra, Sylvan, Yamaha and three more. No logo, no photograph, no order but the alphabet.
- Pattern: **one photograph, one sentence, one search** — and, on the second page, **the brand shelf with the pictures left out**.
- For this screen: the home frame is the argument for a photographic direction — at 1440 the picture is the page, the type sits in its darker half, and the only control is the search. The brands page is the counter-example the board needs: twenty-seven of the best-known marine names reduced to a phone book, on the site of a business whose whole value is that it carries them. If our brand shelf cannot be photographed, it is not a shelf.
- Avoid: an assistant on a working screen; a paragraph written for a crawler above the content; the logo's red doing the work of the primary button; the alphabet as the only order (the dealer's brands have a selling order and the file knows it).

### Denison Yachting — `denison-home`
- Found: not in a gallery; driven as the brokerage counterpart to MarineMax. Driven: https://www.denisonyachting.com/.
- Seen: a navy header (BUY, SELL, CHARTER, SERVICES, COMPANY, CONTACT in caps, an orange search square, a hamburger) with a thin top strip carrying "SAVED YACHTS" and a flag. A marina photograph at dusk fills about 480px; over it a centred eyebrow ("WELCOME TO YACHTING SIMPLIFIED"), a caps headline at about 44px, then **three tabs — BUY (underlined orange), SELL, CHARTER — directly above one white search field** reading "Search by length, manufacturer, price, and more", with an orange square button. Below, on white, a centred caps headline and a paragraph in which every second phrase is a blue link (brand names, boat types).
- Pattern: **tabbed search: the verb first, then the words**.
- For this screen: our Ctrl K wants exactly this shape — a scope chosen before the query (quotes / customers / models), stated as two or three words rather than hidden in a dropdown, with the placeholder naming what may be typed ("length, manufacturer, price"). It also shows the cheap version of "which business": "SAVED YACHTS" in the top strip is this visitor's own state, named in the chrome.
- Avoid: a paragraph of blue links (an SEO artefact, not a screen); a headline that repeats the nav.

### Sotheby's — `sothebys-home`
- Found: the gallery route failed here — searches for auction-house design on siteinspire and awwwards return museum and gallery listings only, and `christies.com` timed the capture out at 45 s. Driven: https://www.sothebys.com/en/.
- Seen: two header rows — a utility line (LOG IN, PREFERRED ACCESS, ABOUT, RESTAURANTS, STORIES, HOW TO BUY & SELL, LANGUAGE) and the main line with the serif wordmark, five caps items (AUCTIONS, SHOP, PRIVATE SALES, SELL, FINANCE), a "Search Sotheby's" field, a heart and a basket. The stage is one editorial photograph with a **solid navy panel sitting on its right third**: a serif headline at about 30px over four lines, three lines of serif body, and a gold caps link "DISCOVER". Carousel arrows at both edges, three dots. A cookie banner occupies the bottom 90px with "Cookies Settings" beside a filled "Accept All Cookies"; nothing was accepted.
- Pattern: **the caption as a solid panel beside the photograph, never on it**.
- For this screen: the first pass noted Northside's own site putting a paragraph *on* the water. Sotheby's is the fix — the photograph keeps its frame, the words get their own ground, and the contrast question disappears. For a home whose hero is the Stacer 529 on water, this is how the greeting and the primary act can sit over it honestly.
- Avoid: two header rows (nine words before any content); a serif at 30px carrying a 1440-wide photograph; consent as the loudest thing on the page.

### YachtWorld, re-driven — `yachtworld-home`
- Found: rightboat.com's marketplace round-up (first pass). Driven again: https://www.yachtworld.com/.
- Seen: this time the advertisement at the top **never filled** — 600px of flat pale grey between the dark header and the content, with nothing in it and no sign anything was meant to be there. Below it, centred: "FIND YOUR NEXT YACHT" in a light wide caps at about 34px, a 900px field whose placeholder reads `Try "Sea Ray under 40 feet"` with **Try** in bold, a navy SEARCH block, and "BROWSE ALL INVENTORY →".
- Pattern: **search-first in three parts** (as the first pass named it) — plus a new one: **the hole where a slot did not fill**.
- For this screen: the placeholder is still the best in the sweep, because it teaches the query language by example and the bold "Try" marks it as an example rather than a value. The grey hole is the lesson: a home built out of slots looks broken when a slot is empty, and ours will have empty slots on day one (no drafts, no customers). A section that can be empty is written as a sentence, not reserved as a box.
- Avoid: reserving 600px for anything that can fail to arrive.

### Boat Trader, re-driven — `boattrader-home`
- Found: rightboat.com round-up. Driven again: https://www.boattrader.com/ (the boat-type tiles at `boattrader-types` refused a third visit, "Access Denied", as in the first pass).
- Seen: the same navy finder panel as the first pass, this time with the advertisement loaded — a Grady-White "GRADY DAYS SALES EVENT" filling the hero beside the search — and below it "Boats Near You · Based on your location" over **four blank white cards with their spinners still turning**. A second copy of the same advertisement is stuck across the bottom of the window as a bar with a close cross.
- Pattern: (nothing new) — recorded for the two failures it demonstrates.
- For this screen: the two things the owner has already rejected, in one frame — a page whose middle is four empty rectangles that never fill, and a bar stuck to the bottom edge carrying a message. Kept as evidence, not as a reference.
- Avoid: all of it.

### Are.na — `arena-explore`
- Found: the gallery search for visual-library apps (which surfaced Cosmos on awwwards and siteinspire) named Are.na alongside it; its own home needs an account, `/explore` does not. Driven: https://www.are.na/explore.
- Seen: white, almost no chrome: a small asterisk mark, the words "Search Are.na" as plain grey text (not a box), "Log in" and a navy "Sign up". A title line "Are.na / Explore" where the first word is grey and the second black. Then two control groups set as small labelled lists with a dot marking the choice — **View**: All · Channels · Blocks; **Sort**: Recently updated · Random. The grid below is four columns of uneven heights: images with their file names under them in blue and, where a channel has no image, a plain bordered card carrying the channel's name, "by Tianyu zhang", "56 blocks" and "less than a minute ago" in blue.
- Pattern: **sort and view exposed as text radios; recency written in words**.
- For this screen: "56 blocks · less than a minute ago" is exactly what a draft row says — how much is in it and when it was touched — and it needs no icon. Exposing "Recently updated" as a two-word choice rather than a dropdown is one fewer click for a sales manager who reads nothing.
- Avoid: a search that is only a word (nothing to aim at); a grid of uneven heights when every one of our objects is a boat in the same proportion.

### Cosmos — `cosmos-home`, `cosmos-scrolled`
- Found: awwwards SOTD page https://www.awwwards.com/sites/cosmos (and `/sites/cosmos-studio`), siteinspire.com/website/11581-cosmos, lapa.ninja/post/cosmos-2/. Driven: https://www.cosmos.so/.
- Seen: a warm off-white page. The header's centre is a 455px search field with a search glyph, a rotating placeholder and two glyphs at its end (a lens-scan and a colour wheel); the nav words sit left (Explore, Sequence, Shop, Careers), "Log in" and a black "Sign up" right. The ground is the product itself: about thirty small rounded thumbnails scattered at varied sizes, tilts and focus — some sharp, some blurred, the nearer ones larger — with the centre left clear for "COSMOS" in caps at about 14px over "Your space for inspiration" at about 64px on two lines, a black "Sign up" pill and a white "Get the app" pill. At the foot, "▶ Watch our new film (ft. Odessa A'zion)" and the top of a video card. Scrolled: that card at about 1010×760 with "Watch" and "the film" set left and right of a loading bloom, "featuring Odessa A'zion" beneath.
- Pattern: **the search field as the centre of the header**; **the content as the wallpaper, with depth of field**.
- For this screen: two ideas. One, if search is a first-class act (Ctrl K), it can be the middle of the header rather than a glyph at its end, and its placeholder can name a real thing the file can answer. Two, a photographic ground need not be one hero: a scatter of the dealer's own held pictures, some soft, is a way to fill 1440 when no held picture is wider than 1100px. The blur there is doing honest work — it is depth, not a veil over text.
- Avoid: a scatter built from pictures that are not ours; two pills of equal weight where one act is primary; a film as the second screen of a working home.

### shadcn/ui, the ⌘K palette — `shadcn-cmdk`
- Found: the same command-menu write-ups the first pass used; the cmdk demo's own theme row names "Shadcn", so the live implementation was driven rather than the port. Driven: https://ui.shadcn.com/ with Ctrl K pressed.
- Seen: a white page (nav: Home, Docs, Components, Blocks, Charts, Directory, Typeset, Create; a "Search documentation…" field at the right; a GitHub star count "124k"; a theme toggle; a black "+ New"). The palette opens as a 512px card with a 12px radius and a soft shadow, about 130px from the top, over a page that is **not dimmed and not blurred** — the headline behind it stays fully legible. Inside: a search field repeating the placeholder, a 12px grey group label "Pages", then eight rows, each an arrow glyph and one word (Home, Docs, Components, Blocks, Charts, Directory, Typeset, Create), the first filled pale grey as the active one; a hairline; and a footer strip with a single hint — a return keycap and "Go to Page".
- Pattern: **light command palette, one group, one footer hint, no veil**.
- For this screen: the counter-proposal to the first pass's cmdk and kbar frames — no keycaps on rows, no icons, no subtitles, one action named at the foot. That is the version a dealer who has never used a palette can survive: eight words and "↵ Go to Page". The page staying undimmed is worth taking; it keeps the home visible while the menu is open.
- Avoid: the same placeholder in the field and in the header (two searches, one job); a palette that lists only navigation when ours must also *do* things ("New quote").

### Grafana Play — `grafana-play-home`, `grafana-play-scrolled`
- Found: saasframe.io/categories/dashboard and saasinterface.com/pages/dashboard/ both list Grafana; `play.grafana.org` is the public sandbox and the only one of the listed dashboards drivable without an account. Driven: https://play.grafana.org/.
- Seen: near-black. A top bar with a hamburger, breadcrumbs (Dashboards › Examples › Grafana Play Home), a 350px search field with **"ctrl+k" printed as a small chip inside its right edge**, a "+ ▾" menu, a help disc, a sparkle, "Sign in"; a second row with a share control, a chevron and a bordered "✎ Edit". The page: a full-width banner in a blue-to-magenta gradient, "Welcome to Grafana Play" at about 30px beside the mascot, and six orange pills (Grafana Cloud, Community Resources, Learning Journeys, Webinars and Videos, Support Forum, Upcoming Meetups). Under it three panels with emoji in their titles — "🧪 What is Grafana Play?", "🏆 Dashboard of the Month", "🌟 Featured Grafana Contributor" — whose body text is **clipped mid-sentence by the panel's fixed height** ("…and see what you can"). Then a YouTube thumbnail and a news feed with dates. The scrolled capture is identical: the page does not scroll, the panels do.
- Pattern: **the keyboard hint printed inside the search field** — the one thing here worth taking.
- For this screen: this is the shape the owner rejected, photographed in a shipping product — a welcome banner of links, panels of prose in fixed boxes, an embedded video, a news feed, and a page that cannot even scroll as a page. It is the control against which our home is judged. The `ctrl+k` chip is the exception: it teaches the shortcut without a tooltip and costs nothing.
- Avoid: everything else — a gradient as a greeting, emoji as panel icons, prose truncated by a panel's height, an edit affordance on a home nobody is editing.

### Figma Community — `figma-community`
- Found: not in a gallery; driven as a public register of files with authors and counts. Driven: https://www.figma.com/community.
- Seen: white; a nav of product words, "Log in" and an outlined "Sign up". Centred: small app icons floating either side of a two-line headline in which some words are grey and two are blue ("Discover community-made libraries, plugins, icon sets, and more"), then a 320px search field, "Search for resources like "portfolio"". Then a pale blue promotional band, then a section: "Skills" as a 16px bold title, a grey one-line description under it, "Browse skills ›" right-aligned, and **rows in two columns** — an icon tile, a name, a byline with a small avatar, a heart count and a people count, a one-line description, and an outlined "Try it out" at the right of each row.  A cookie banner across the foot offers "Opt out"; nothing was accepted.
- Pattern: **a titled register section with "browse all" at the right, and one act per row**.
- For this screen: the section header — title, one grey line of explanation, "Browse all ›" at the far right — is the least an "Open drafts" band needs, and per-row actions ("Open", "Duplicate") belong at the row's right edge where this puts them. Two columns of rows show eight drafts in one screen without a grid of pictures.
- Avoid: a headline that colours random words; counts of hearts and users (ours are figures the file carries, not popularity); a promotional band between the search and the content.

### Trek — `trek-home`, `trek-scrolled`
- Found: land-book's product-listing gallery refused the fetcher, so Trek was driven from the retail search as the bicycle counterpart to Canyon (first pass). Driven: https://www.trekbikes.com/au/en_AU/.
- Seen: a black brand strip (TREK, Electra, BONTRAGER, TREK TRAVEL), then a black nav whose words *are* the kinds — Electric, Mountain, Road, Gravel, City, Kids, Equipment, Clothing, Sale, Bike Shops, Events We Love — with a search field at the right. The fold is a flat yellow field with "Spring Clearance" in a heavy grotesk at about 64px, a date line, and two white buttons (SHOP BIKES, SHOP OAKLEY). A Cookiebot wall occupies the bottom 320px with four toggles (Necessary, Preferences, Statistics, Marketing — all on) and three buttons, "Allow all cookies" filled blue at the top. The capture tool's privacy patterns match none of "Use necessary cookies only", so nothing was clicked, the wall stayed up, the scroll step did nothing, and both frames are the same fold.
- Pattern: **kinds as words in the nav** (no pictures at all).
- For this screen: the useful half is the nav — eleven kinds as one line of words, which is what a dealer's rail can be if the pictures live elsewhere. The rest is a lesson: the first screen of the brand that makes the best-known bicycles in the world is a yellow poster for a sale, behind a consent wall.
- Avoid: a promotion as the whole fold; a consent wall with every toggle pre-set to on and "Allow all" as the primary.

### Rapha — `rapha-home`
- Found: not in a gallery reached; driven as the premium retailer whose home is photography and nothing else. Driven: https://www.rapha.cc/au/en/.
- Seen: a black ticker strip scrolling four offers; a white header, nav left (MEN, WOMEN, ACCESSORIES, GIFTS, CLUB), the script wordmark centred, three glyphs right. Under it, two photographs side by side fill the fold — a rider tiny against a rock face on the left, a portrait of a rider in a chartreuse jacket on the right. One headline in condensed caps at about 44px sits on the left photograph ("AGAINST BETTER JUDGEMENT") with two equal white buttons beneath it (SHOP NOW, BREVET GUIDE). A chat disc bottom right.
- Pattern: **two photographs as one fold, the headline on the quieter half**.
- For this screen: the pair is a way to show two kinds at once (a boat on water beside a motor on a transom) without a grid, and it works because the headline sits where the photograph is calm. Type on a photograph is survivable when the crop is chosen for it; Sotheby's panel is the alternative when it is not.
- Avoid: a ticker; a chat disc; two equal buttons where one act is primary.

### Yamaha Motor Australia — `yamaha-au-home`, `yamaha-au-scrolled`
- Found: not in a gallery; driven because it is the dealer's own motor brand in this market and its kinds include WaveRunners, outboards and boats. Driven: https://www.yamaha-motor.com.au/.
- Seen: a white header (the tuning-fork mark in red; PRODUCT RANGE, BUYING, OWNERSHIP, DISCOVER, ABOUT as caps dropdowns; then two bordered buttons, FIND A DEALER with a pin and SEARCH with a lens). The hero is a **carousel that never painted**: a 580px flat grey slab carrying "ROAD MOTORCYCLES" in black caps at about 30px, "Our Unique Advantage ›" under it, a sliver of a blue image at the far left edge, and eight dots at the bottom. Below, on black, four photographic cards with white caps titles (EP.9 ECOSYSTEMS, 2027 OFF-ROAD RANGE, 2026 WAVERUNNER RANGE, FINANCE & INSURANCE) — a magazine and a product range in the same row. Scrolled: five news cards with paragraphs and "Read More", "VIEW MORE NEWS", then a band titled "MOTOR | LIFE | PASSION" with five more.
- Pattern: (a warning) — **the hero carousel as a single point of failure**.
- For this screen: a boat dealer's home is not a newsroom. Everything below the fold here is editorial and the kinds are hidden inside a dropdown labelled PRODUCT RANGE. The fold shows what a carousel costs: when its image does not arrive, the page's first 580px are a grey box with a caption, and no direction survives that.
- Avoid: a hero carousel of any kind; news as the body of a home; "FIND A DEALER" as the loudest control on a page the dealer themselves is reading.

### Chrono24 — `chrono24-home`
- Found: not in a gallery; driven as the marketplace whose home is brands plus a search at very large scale. Driven: https://www.chrono24.com/.
- Seen, through a dimming consent dialog: a white header with the wordmark, a 660px search field reading **"Search through 674,502 watches worldwide"**, "Log in or register", and a nav row (Buy a watch ▾, Sell a watch ▾, Best Deals, Magazine, Watch Collection, ChronoPulse, FAQ, Security ▾); a dark hero with a caps headline; and the beginning of a "Popular brands" row of bordered boxes. The dialog ("Your Consent for the Best Chrono24 Experience") offers exactly two controls, a navy "OK" and a text "Settings" — **no reject** — so nothing was accepted and the page was read through the veil.
- Pattern: **the true count inside the search placeholder** (the first pass found the same at Friluftsland's "20.000+ varer" and boatsales' "Show 13,071 boats").
- For this screen: three references now independently put the file's size where the search is. Ours can read "Search 15,691 rows" — measured, not marketing.
- Avoid: a consent dialog with no refusal; a nav of eight items, two of them magazines.

### Hodinkee Shop — `hodinkee-shop`
- Found: not in a gallery; driven as the editorial retailer whose brand shelf is its own navigation ("BRANDS" is the first nav word). Driven: https://shop.hodinkee.com/.
- Seen: an announcement **modal** over the page on first paint — a white card with two lines of prose, two photographs with small-caps kickers ("FROM THE EDITOR", "BUY NOW") and a plain "Or, continue to shop" — with a cookie banner beneath it offering "Accept All" and "Accept Essential Cookies". Behind both: a serif wordmark over "SHOP", a four-word caps nav (BRANDS, MAGAZINE, LIMITED, INSURANCE), and a photographic hero with a serif headline at about 48px over three lines and an outlined "LEARN MORE".
- Pattern: (nothing to take) — the frame is two interruptions over a home.
- For this screen: a reminder that a home is where owners want to put announcements. Ours will be asked for one eventually; the honest place is a line in the page, not a card over it.
- Avoid: a modal and a consent banner stacked over the first paint; "Accept All" as the visually first choice.

### DeLorean Marketplace — `delorean-marketplace`
- Found: awwwards.com/inspiration_search/Marketplace/ (listed with its live URL and its studio, Otherlife). Driven: https://marketplace.delorean.com/.
- Seen: near-black, with a red-and-white light-streak photograph behind a floating header bar. "ALPHA" in a squared display face at about 110px in red, "05" beneath it in orange at about 90px; a small caps label "MARKETPLACE" over "UNIQUE OWNERS: 1272" where the label is red and the figure white; a solid red action block at the right reading "MAKE COLLECTION OFFER" over three lines with an arrow square. At the foot, two tabs — ITEMS (filled red) and ACTIVITY — and beside them a "FILTER BY" panel: two labelled checkbox rows (CLAIMED, LISTED), two sort rows with a sort glyph (SLOT NUMBER, PRICE [USDC]), and a bordered field "SEARCH SLOT NUMBER" with an arrow button.
- Pattern: **ITEMS / ACTIVITY as two tabs**; **a figure that carries its own label**.
- For this screen: "UNIQUE OWNERS: 1272" is the register line we want — a label in small caps, the figure beside it, nothing else; ours reads "TABLES 53" and "ROWS 15,691". The two tabs separate the things from what happened to them, which is the honest split between open drafts and history.
- Avoid: the whole visual register (a sci-fi face, red on black, hairline crop marks); filters spread across the stage rather than gathered where the register is.

### tldraw — `tldraw-home`
- Found: not in a gallery; driven as the counterpart to Excalidraw, which the entry sweep used. Driven: https://www.tldraw.com/.
- Seen: an empty white sheet. Top left, the wordmark and a kebab menu; top right, a share glyph and a blue "Sign in to share"; a style panel floats top right (four rows of colour discs, a width slider, fill and dash options, S M L XL); a tool bar floats at the bottom centre (select, hand, draw, eraser, arrow, text, note, image, rectangle, a chevron) with an undo/redo/delete/duplicate group above it; "100% ›" bottom left; a dismissible "Build with the tldraw SDK →" card bottom right. **No greeting of any kind.**
- Pattern: **the tool opens in the work, with no welcome**.
- For this screen: the extreme opposite of a home, and the useful comparison with Excalidraw's hand-lettered welcome (`entry/gallery/excalidraw-blank.png`): the same product shape, one with a sentence and one without. A dealer arriving at HL_2.0 needs the sentence — who they are, which business, what is open — and tldraw shows how it feels when there is none.
- Avoid: floating panels at three edges; a bar stuck to the bottom centre of the page (a tool palette here, and even here it is the shape the owner rejected).

---

## Patterns this pass adds to the board

- **State tabs, not category tabs** (Collecting Cars: This Week · Saved · Live · Coming Soon · Results; DeLorean: ITEMS / ACTIVITY): the home's second row says *where the work is*, not what the shop stocks.
- **The register as the picture** (Hugging Face): the hero is the real list with its real count in its own header, and the second act is a number.
- **The count where the search is** (Chrono24 "674,502"; first pass: Friluftsland "20.000+", boatsales "Show 13,071 boats"): three independent proofs that the file's size belongs in the placeholder or the button.
- **The shortcut printed inside the field** (Grafana's `ctrl+k` chip): teaches the key without a tooltip.
- **Tabbed search** (Denison: BUY / SELL / CHARTER above one field): the scope chosen before the query — our palette's scopes as two or three words.
- **Split record card** (Hagerty): photograph + thumbnail column + facts + one black act; the "carry on with this" object.
- **Fact card with a labelled figure** (Collecting Cars): an 11px label, the figure in bold, a time pill, place and count on a foot line, under a photograph.
- **Caption as a solid panel beside the photograph** (Sotheby's) versus **type on the calm half of the photograph** (Rapha): the two honest ways to write over an image.
- **Recency in words** (Are.na: "less than a minute ago", "56 blocks") and **sort exposed as text radios** rather than a dropdown.
- **Section header with "browse all" at the right** (Figma Community), with **one act per row at the row's right edge**.
- **Kinds including the unglamorous ones** (Deere: Parts and Used Equipment as peers of Excavators).
- **Content as wallpaper with depth of field** (Cosmos): a scatter of the product's own pictures, some soft, when no single picture can fill the window.

## What this pass adds to "avoid"

- **A bottom bar carrying a message** — Cars & Bids and Boat Trader both stick a promotion to the foot of the window; the shape the owner called disgusting, and in both cases it is not even doing work.
- **A hero carousel** — Yamaha's never painted (580px of grey with a caption); Sotheby's and Hagerty put one on the single record you most want to act on.
- **A slot that can be empty and is not a sentence** — YachtWorld's 600px grey hole, Boat Trader's four spinning cards.
- **Prose clipped by a fixed panel height** — Grafana's "…and see what you can".
- **A brand shelf with the pictures left out** — MarineMax's 27 names in four alphabetical columns.
- **A modal, a consent card or an assistant over the first paint** — Hodinkee (both at once), Chrono24 (no reject offered), Trek (a wall with every toggle on), MarineMax (an assistant), Rapha (a chat disc).
- **A home that is a newsroom** — Yamaha below the fold; Deere's legal wall.
- **A circular crop for a long object** — Deere's row would smear a 5.29 m hull.
- **A picture that may not be the thing** — Deere's own footer reserves the right to show digitally or AI-generated equipment. Our image ledger forbids stand-ins, and the home is where that difference is visible.

## Imagery, this pass

- **Photography carries the page:** MarineMax (one on-water photograph, half above and half below the surface, as the whole fold), Rapha (two photographs as one fold), Sotheby's (editorial, with the words beside it), Collecting Cars, Cars & Bids and Hagerty (owner photography, four to a row, every crop the same), Deere (eight machines in circles).
- **The product's own screen carries it:** Hugging Face (the real register with 2,555,000 in its header), Figma Community (rows with authors and counts).
- **The content becomes the ground:** Cosmos (about thirty thumbnails scattered with depth of field).
- **Typographic, no picture:** Are.na, shadcn's palette, YachtWorld's search block, MarineMax's brands page (the failure case).
- For us: every photographic reference above is showing pictures of *the exact object for sale*, owner-photographed, at one crop, four to a row. That is achievable for the seed's 122 measured scenes and dishonest for the 115 Highfield studio renders — so a photographic home is drawn on the boats that have water, and the render-only brands are shown as what they are.

## Failed or refused, this pass (from the ledger)

- `christies-home` — `page.goto: Timeout 45000ms exceeded` at christies.com; not retried (Sotheby's was driven instead).
- `ducati-home` — "Access Denied" at ducati.com (the page title itself); not fought.
- `mrporter-designers` — "Access Denied" at mrporter.com; the brand-index screen was not reached.
- `boattrader-types` — "Access Denied" again at boattrader.com on the third visit of the run, as in the first pass.
- `trek-home` / `trek-scrolled` — reached, but the Cookiebot wall's "Use necessary cookies only" matches none of the capture tool's privacy patterns, so the wall stayed up and the scroll step did nothing; both frames are the same fold. Nothing was accepted.
- `hodinkee-shop`, `chrono24-home` — reached with an announcement modal and a consent dialog respectively still on screen; Chrono24 offers no reject at all. Nothing was accepted; both are described through what is visible.
- `grafana-play-scrolled` — identical to `grafana-play-home`: the Grafana page does not scroll, its panels do.
- Galleries that refused the fetcher this pass: `land-book.com` (403 on `/gallery` and `/design/product-listing-page`), `lapa.ninja` (403 on category pages), `mobbin.com` (403 on `/explore/web/screens/home`), `refero.design` (renders to a title only), `siteinspire.com` (429 on the categories index; its per-site pages fetch fine, which is how the Cosmos entry was confirmed).
