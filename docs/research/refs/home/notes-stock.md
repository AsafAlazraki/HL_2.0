# Home — existing stock (the old repo's captures, read frame by frame)

Read 2026-09-17. **Nothing was captured for this file.** Every frame below already existed: the old repo's `out/ref/**` captures, copied to `C:\Users\Asaf\dev\hl-refs\ref\`. Paths are given as read. No ledger is written here (`sources.json` belongs to the two sweeps that actually drove sites: `live/` and `gallery/`).

**The screen's job.** Greet the dealer; show what they sell (kinds) and their brands, photographed; open drafts; one primary act, New quote; search (Ctrl K). The old home dashboard was hated and its bottom bar called disgusting — so the stock was read for *how a range is entered and how a working item is listed*, never as a dashboard.

**37 paths, 34 distinct images.** Three pairs are byte-identical, so the "-2" is not a second view:

| pair | md5 |
|---|---|
| `boats/jeanneau-1.png` = `boats/jeanneau-2.png` | `b0af0b7d34625317cd89c110582b3554` |
| `boats/williams-1.png` = `boats/williams-2.png` | `65f892a8e36b0a9671c1a9d9987465a4` |
| `tables/stripe-dashboard-docs.png` = `tables/stripe-dashboard-docs-2.png` | `55d66eeaab18056348114f8a6018156f` |

**The finding that has to come first: the stock is not a substitute for the live sweep.** Of the fourteen "brand homes" named in the brief, **eight show no brand home at all** — four are Cloudflare walls (Quicksilver, Sea Ray, Boston Whaler, Williams), three are the site's own error page (Beneteau, Jeanneau, Nimbus), one is an unpainted video hero (Stabicraft's first frame), and Saxdor's two frames landed on the news index rather than the home. Six brands carry usable evidence: **Axopar, De Antonio, Highfield, Riviera, Stabicraft (second frame), Zodiac** — plus Nimbus's footer, which survives its own 404. The driven brand homes are in `notes-live.md`; this file is the register, the configurator chrome and the six that survived.

**On motion.** A still cannot time an animation. Where a pager, a carousel chevron, a scroll hint or a filmstrip is visibly present it is reported as a control that exists — never as a duration or a curve.

---

## The ranked six

1. **Stabicraft — `boats/stabicraft-2.png`.** One aerial photograph, split by type alone into two doors: *EXPLORE MODELS BY **SIZE RANGE*** with a white "EXPLORE RANGE" button, and *EXPLORE MODELS BY **STYLE SERIES*** with "EXPLORE SERIES". The same range, cut two ways, on one image, with no grid and no cards. This is the cleanest answer in the whole stock to "kinds *and* brands" — a dealer's catalogue has exactly two honest axes and neither has to win.
2. **Porsche Finder — `porsche-finder-1.png`, `porsche-finder-2.png`.** The register row: photograph with a three-up thumbnail strip on the left; on the right a title pair, three dot-separated fact lines, **one price with its qualifier named beside it** (`$457,457  Drive Away Price¹`), two acts (black *Show details*, grey *Save*), and the selling branch underneath. The facets carry **true counts** — `Classic (7)`, `911 (25+)`. Our drafts strip and our from-price honesty are both already drawn here.
3. **Highfield — `boats/highfield-2.png`.** Four ranges as **renders on white**, each with a name in bold caps and a one-line promise (*Compact and economical* · *Because weight does matter* · *Extra level of comfort* · *The next generation of Highfield*) — no price, no card, no border. Above them a measured statement (*around 54,000 boats delivered globally since 2011*). Highfield in our seed is renders only; this frame proves a render-only brand can carry the page without pretending to be photography.
4. **Attio — `tables/attio.png`.** Inside the product shot: **"Good morning, Alex"**, one large field, two suggestion chips (*Prep for next meeting*, *Recap last call*), and **`⌘ Quick Actions  ⌘K` as a row inside the rail** with a separate `/` search button beside it. Greeting, one act and the shortcut, in one composition, with nothing that resembles a dashboard.
5. **Zodiac — `boats/zodiac-2.png`, `boats/zodiac-1.png`.** The range name set huge on white *behind* the render (`XCC`), with a circular puck of the next range peeking in at the right edge so the set is visibly larger than the frame; and the hero where the item's number (`02`) is stated twice — at the item and in the `| 01 | 02 | 03 | 04` pager.
6. **Porsche configurator chrome — `porsche-top.png`.** The action row: reversible acts as plain text+icon at the left (*← · Save · Create Porsche Code*), the money as a **small two-line labelled figure** (`$0.00 / Price for equipment`), then grey *Summary* and black *Select a dealer* at the far right. Nothing at the bottom of the window. Plus a search field scoped to the page's own content, sitting above the choices rather than in the site header.

**Runners-up worth putting on the board:** De Antonio's range as full-bleed bands with two acts each (`deantonio-2`); Nimbus's footer model index plus the *Part of Nimbus Group* marque row (`nimbus-2`); Linear's single-row logo wall and two-tone headline (`linear-homepage`, `linear-homepage-2`); Saxdor's pill filter row over dated cards (`saxdor-1`); Riviera's bento of photographic doors (`riviera-2`); Stripe's `/` keycap printed inside the search field (`stripe-dashboard-docs`); Axopar's **MORE MODELS COMING SOON** as an honest empty state (`axopar-2`).

---

## One entry per frame

### Axopar — `boats\axopar-1.png`
- **Site / page.** axopar.com, "Configure Your Axopar" (breadcrumb reads `Home — Configure Your Axopar`).
- **What it shows.** White ground, no hero image. Two arrowed text links float above the nav at the top right — *Configurate →* and *Find a Dealer →*. The italic bold AXOPAR wordmark sits far left; the nav (Boat Models · Discover Axopar · Join the Adventure · Axopar Community · Media · Company) is a single centred row. H1 **CONFIGURE YOUR NEXT AXOPAR** in a heavy condensed grotesk, caps, ~46px, black on white; a six-line paragraph at ~17px on a ~690px measure; a full-width hairline; then the section *AXOPAR 38* at ~28px caps with a one-line promise, and three side-profile studio renders of variants in a 3-up row, each ~340px wide, floating on white with a soft ground shadow — no card, no frame, no gutter rule.
- **Pattern.** *Typographic range index with floating renders.*
- **Type and imagery.** Wholly typographic above the fold: the scale contrast is roughly 46 / 17, about 2.7×, and it reads as confident rather than shouted. The renders are the content, not decoration, and they need no container.
- **Genuinely good for this screen.** The primary act is a small arrowed link in the corner and the page still works — proof that "New quote" does not have to be a slab. And a range can open with words: if the dealer's own photography is thin for a brand, a heading, a sentence and three renders on white is not a compromise.
- **Avoid.** Three variants at 340px on a 1440 window leaves each boat ~90px tall; at that size a hull is a smear. Our tiles need height, not count.

### Axopar — `boats\axopar-2.png`
- **What it shows.** Scrolled. A dark sticky header band now overlaps the page and **cuts the heading behind it** — *AXOPAR 37 SUN TOP* and *AXOPAR 28 CROSS TOP* are half-eaten by the bar while *CROSS CABIN* survives below it. Each variant carries a *Configure →* link. Then **MORE MODELS COMING SOON** as a real section with a sentence: *"More Axopar models will be available in the configurator soon."* Then *DISCOVER OUR RANGES* with ← → at the right and a carousel of rounded photographic cards — in this frame two cards are visible and **the second sits ~50px lower than the first**, unaligned.
- **Pattern.** *The honest "not yet" section*; *arrowed carousel of range cards*.
- **Genuinely good.** The empty state is a named section with a sentence, not a hidden gap — which is our rule written by someone else. A brand with no configurator is *said*, not omitted.
- **Avoid.** Both defects: an opaque sticky bar that eats headings, and a carousel whose cards do not share a baseline. Our rulers exist to catch exactly this.

### Beneteau — `boats\beneteau-1.png`, `boats\beneteau-2.png`
- **Dead frames.** Both are Beneteau's own **404**: *Page Not Found* in a light humanist sans at ~52px, *"Sorry, the page you're trying to access does not exist."* at ~26px, and one teal **BACK TO HOME** button. The header survives (hamburger + "Menu", the centred wordmark with its cabin-boy mark, *Dealers* with a pin glyph, `EN ⌄`).
- **The only content is the footer,** and it is worth one line: *Quick Access* lists the whole business as five words — **Sailboats · Motor Yachts · Motorboats · Configurator · Partners · Used BENETEAU boats for sale** — and *Pro Access* is a separate column (Dealers' access, Press Access). The dealer's door and the public's door are named separately on the same page.
- **Defect observed.** *Dealers' access* is listed **twice**, identically, in the same column.
- **For this screen.** Nothing visual. One idea: kinds can be three plain words, and a professional entrance can be a named column rather than a hidden login.
- **Avoid.** A 404 whose only exit is "Back to home"; and an error page that keeps a newsletter field.

### De Antonio — `boats\deantonio-1.png`
- **What it shows.** A cinematic full-bleed hero: a helicopter over a misted forest at sunrise, a white D-series running below it, the sun flaring at the right. Black top bar (hamburger + *Menu*, centred `de antonio YACHTS` script-and-caps lockup, a flag language chip, an account glyph). Over the photograph: the wordmark at the left, *WATCH NOW* at the right, chevrons at both edges, and centred low — **SEEKING ADVENTURE** in heavy condensed caps ~46px with *— THE WORLD IS OUT THERE —* in small tracked caps beneath it, then an outlined **WATCH THE FULL MOVIE** button. An eight-dot pager sits at the very bottom. A yellow chat blob and a social rail intrude at the edges.
- **Pattern.** *Cinematic full-bleed hero with a dot pager.*
- **Type and imagery.** The photograph carries everything; type is one statement and one button. Colour comes only from the light in the image.
- **Genuinely good.** Our home has one true hero candidate — the Stacer 529 Assault Pro's on-water photography — and this frame is the argument for letting one real photograph occupy the window instead of nine tiles.
- **Avoid.** Eight dots for eight heroes when the file holds one honest photographed hero; a hero whose only act is "watch a film"; the floating chat and social furniture.

### De Antonio — `boats\deantonio-2.png`
- **What it shows.** **THE RANGE** centred in heavy caps ~34px on white, then the range as **full-width bands**, one model per band: an aerial of the D60 running, the model name `D60` centred at the top of the band in a wide-spaced techno face ~44px white, and centred at the foot of the band two buttons — filled black **DISCOVER** beside outlined **CONFIGURE**. The next band (`D50`) begins immediately beneath with no gutter.
- **Pattern.** *The range as a stack of full-bleed bands, each band a model with two acts.*
- **Genuinely good for this screen.** Two acts per item, one to look and one to build, is exactly the dealer's pair: *Open* and *New quote from this*. And a band gives a boat its length — a 16:5 band flatters a hull in a way a 4:3 tile never does.
- **Avoid.** At one band per model, nine kinds is nine screens of scrolling; the dealer needs the whole range in one view. Bands are for the top two or three, not the set.

### Highfield — `boats\highfield-1.png`
- **What it shows.** A golden-hour photograph of two people doing acro-yoga on a RIB's foredeck. **#DARETOEXPLORE** in very heavy caps ~62px white at the left, *Welcome to Highfield Boats* ~17px bold beneath it. Header is a dark translucent band: **BOATS · DEALER LOCATOR · REQUEST A QUOTE · SPARE PARTS**, a flag + `EN ⌄`, a hamburger. A down-chevron scroll hint bottom-left. An accessibility widget (a contrast disc and a text-size control) is pinned at the right edge; a live-chat card reads *We're Online! How may I help you today?*
- **Pattern.** *Photograph-as-page with a hashtag statement.*
- **Genuinely good.** **REQUEST A QUOTE is a top-level nav item** on the manufacturer's own home — the quote is the act the brand expects, which is the act our home is built around.
- **Avoid.** A hashtag as the largest words on the page says nothing about what is sold. And the statement sits directly on a bright sky with no scrim; the white holds here only because the photograph happens to be dark at that point — luck, not contrast.

### Highfield — `boats\highfield-2.png` — **one of the six**
- **What it shows.** A grey band with a small teal tracked eyebrow **INTRODUCING** above a centred statement in a light face at ~30px carrying real figures: *"With around 54,000 boats delivered globally since the brand's beginning in 2011, Highfield Boats is now the world's number one in the RIB tender sector and a global player in the 5 metres + sector."* Then, on white, a **4-up row of 3/4 renders** at ~270px each with the range name in bold caps ~15px and a one-line promise in grey beneath: **THE ROLL UP RANGE** *Compact and economical* · **THE ULTRALITE RANGE** *Because weight does matter* · **THE CLASSIC RANGE** *Extra level of comfort* · **THE SPORT RANGE** *The next generation of Highfield*. No card, no border, no price, no chip. A second row begins below. A cookie banner sits at the foot (Customize / Reject All / Accept All — nothing pressed in the capture).
- **Pattern.** *Ranges as renders on white with a name and a promise.*
- **Type and imagery.** Renders, deliberately, and the white ground is what makes them look intentional rather than missing. Scale contrast is modest — 30 / 15 — and the row still reads because the objects differ.
- **Genuinely good for this screen.** This is **the honest treatment for a render-only brand**, which is precisely Highfield in our seed (183 of the 227 unfetched addresses are Highfield; the seed carries renders, not on-water photography). The one-line promise does the job a from-price cannot when the file has no figure at that rung. And the statement above the row shows a measured claim carrying weight — the shape of our *"53 tables · 15,691 rows"*.
- **Avoid.** Four renders across at 1440 makes each ~270px; the Roll Up and the Ultralite are near-indistinguishable at that size. Where two of our ranges look alike, they need size or a fact, not a caption. Also: the promises here are marketing sentences; ours must be file-measured facts (length, capacity, the count of models in the range), never invented copy.

### Jeanneau — `boats\jeanneau-1.png` (= `boats\jeanneau-2.png`)
- **Dead frame.** Jeanneau's own error page: **THIS PAGE NO LONGER EXISTS** in heavy caps ~48px white, over a photograph of a Leader 36 running hard; below the photograph the page is empty white. No nav, no footer, no exit link visible in the frame.
- **For this screen.** One negative lesson only: an error state that offers no door. Compare Nimbus's 404 below, which offers two.

### Nimbus — `boats\nimbus-1.png`
- **Dead frame, with usable chrome.** Nimbus's **404**: *"Oops, seems like we're both lost at sea"* in a light wide grotesk ~44px over a darkened video still of a designer at a desk, two flat white buttons — **Return home** and **Model range** — and a `404` set enormous (~140px) bottom-right. Header: a 3×3 dot glyph with the word **Models** pinned to the top-left corner, an EU chip, the burgee and NIMBUS wordmark centred, and **Search** and **Menu** at the right, each an icon *with its word*.
- **Genuinely good.** An empty state with **exactly two doors, one of which is the range** — the shape our empty drafts strip should take ("No open drafts. *New quote* · *Browse the range*"). And icon-plus-word in the header: the dealer never has to guess a glyph.

### Nimbus — `boats\nimbus-2.png`
- **What it shows.** The footer on near-black. Five columns: two headed **Explore** carrying the *entire* model list as plain text — 495 Coupé · 495 Flybridge · 405 Flybridge · 405 Coupé · 365 Coupé · 305 Coupé · 305 Drophead · Sport Tender 35 | Sport Weekender 42 · Sport Coupé 42 · Sport Tender 42 · Nimbus W9 · T9 · C9 · T8 · C8 — then *About us*, *Help* (Contact, Dealers), and a right column with the brand paragraph and three social glyphs. Beneath, a row reading **"Part of Nimbus Group:"** followed by six sibling marques as small grey words: *Alukin · Aquador · EdgeWater · Falcon · Nimbus Group · Paragon Yacht*. Then a hairline, the burgee + wordmark, terms links and `© 2026 Nimbus Group`.
- **Pattern.** *The model index as plain text in columns*; *the marque row that names a family of brands.*
- **Genuinely good for this screen.** Sixteen models, no pictures, entirely legible — the argument that a **complete text index** can sit under the photographed shelf and serve the dealer who already knows the model name. And the *Part of…* row is the honest shape for a dealership carrying several marques at once: small, level, no hierarchy invented between them.
- **Avoid.** Two columns both headed "Explore" is a split with no stated rule (it is in fact inboard vs outboard families, and the reader cannot tell). If we split a list, the split gets a name.

### Quicksilver — `boats\quicksilver-1.png`, `boats\quicksilver-2.png`
- **Blocked.** Cloudflare: *"Sorry, you have been blocked — You are unable to access quicksilver-boats.com"*, with the standard "Why have I been blocked? / What can I do to resolve this?" pair and `Cloudflare Ray ID: a3b5391f6c915e91`. Bot protection was not fought. No content.

### Riviera — `boats\riviera-1.png`
- **What it shows.** A Google *Select Language* translate widget sits above everything as a grey strip — third-party furniture on top of a luxury brand. The hero is an aerial of two Belize 55s running side by side on tropical blue. The nav sits **directly on the photograph** in white caps (MODELS · THE RIVIERA EXPERIENCE · REPRESENTATIVES · CONTACT) with a blue banner logo hanging from the top-right corner like a flag. Centred low: *A proud tradition* ~40px light, *The Belize 55 Sedan and Daybridge* ~22px, an outlined **DISCOVER MORE NOW**. Below the fold, on white: *Riviera - one of the world's finest fleets* ~38px, centred, light.
- **Pattern.** *Nav floated on the hero; centred caption with one act.*
- **Avoid, and this is the main lesson.** White caps on bright water with **no scrim**: over the sky the nav holds, over the wake it is at or below the contrast floor. If our home floats anything over the Stacer's on-water photograph, it needs a measured scrim, not a hope. Also: a hyphen used as a dash in a display line, and a translate bar allowed above the brand.

### Riviera — `boats\riviera-2.png`
- **What it shows.** A centred paragraph carrying **measured figures** — *"a proud 45-year history. From 39 to 78 feet, over 6,300 Riviera motor yachts are today cruising…"* — then a filled navy **REQUEST A RANGE BROCHURE**. Below, a **2 + 3 bento of photographic doors**: two wide tiles (Models, Latest News) over three narrower ones (World Premiere, About Us, Representatives). Each label sits in a translucent dark strip pinned to the tile's bottom edge, in a bold face at ~17px. A *Return to Top* pill floats bottom-right. Then *Step aboard Riviera* ~34px centred.
- **Pattern.** *Bento of photographic doors with a bottom label strip.*
- **Genuinely good.** The bento gives one door more weight than the others without a different treatment — the wide Models tile is simply bigger. That is how our "what they sell" shelf can make the dealer's main kind dominant without inventing a badge.
- **Avoid.** The translucent strip: a 50% black bar over a photograph is neither a scrim nor a ground, and at 17px the labels sit right at the edge of legible over busy water. Put the label *under* the photograph or on a real scrim. Also the floating *Return to Top* pill — a bottom-right chip that follows you is the bottom-bar habit in miniature.

### Saxdor — `boats\saxdor-1.png`
- **Not the home.** The capture landed on Saxdor's news index.
- **What it shows.** Near-white ground. A hamburger at the left, the **SAXDOR** wordmark centred (wide-tracked, a red dot inside the D). A **pill filter row**: *ALL POSTS* filled navy, *NEWS* and *PRESS RELEASES* white with a hairline. Then a featured entry as a two-up: a large photograph on the left, and on the right a white panel holding a three-line headline at ~26px with the date — *31 August 2026* — at the bottom of the panel. Beneath, a 2-up grid of cards: photograph on top, headline, date. A cookie dialog offering only **Accept** plus policy links sits bottom-right; nothing was pressed, so it stays in the frame.
- **Pattern.** *Pill filter row over a card grid; the card whose last line is a date.*
- **Genuinely good for this screen.** Two things. First, the filter row is our kinds row: one pill per kind, the active one filled, and it reads as a *position*, not a control panel. Second, **an item is a photograph, a sentence and a date** — which is the whole of an open draft. No status chips, no progress rings, no avatar stack.
- **Avoid.** A featured two-up whose right panel is two-thirds empty; the date marooned at the bottom of a tall white box.

### Saxdor — `boats\saxdor-2.png`
- **What it shows.** The grid continuing: uniform cards, photograph over a headline at ~20px over a date at ~15px grey. Aerials and marina shots. **One card's body is blank white** — the image had not painted when the frame was taken (an honest capture artefact, reported, not read as a design).
- **For this screen.** The rhythm is the lesson: identical cards, one variable (the photograph), two text lines. A drafts strip can be exactly this and be finished.

### Sea Ray — `boats\searay-1.png`, `boats\searay-2.png`
- **Blocked.** Cloudflare: *"You are unable to access searay.com"*, `Ray ID: a3b532db3a48d725`. No content.

### Stabicraft — `boats\stabicraft-1.png`
- **Dead frame.** The video hero never painted: a black field occupying the whole window. Readable: the header (the red Stabicraft mark and wordmark; **THE BOATS · DEALERSHIPS · OWNERS CENTRE · WHY STABI · DISCOVER STABI**; four social glyphs), a **⌄ SCROLL** hint bottom-left, a strip of sunlit water at the very bottom edge, an *"Ask me anything…"* assistant pill bottom-right and a `1 / 1` counter.
- **For this screen.** One durable lesson: **a video hero with no poster frame is a black screen**. Our hero is a still photograph from the pack; if we ever animate it, the still is the frame that must be there first.

### Stabicraft — `boats\stabicraft-2.png` — **one of the six**
- **What it shows.** A single wide aerial — an orange-and-black boat running left-to-right through dark green water, spray filling the right third — carrying **two doors side by side, split by type alone with no divider and no cards**: at the left, *EXPLORE MODELS BY* in small tracked caps over **SIZE RANGE** in heavy caps ~44px, with a filled white **EXPLORE RANGE** button; at the right, *EXPLORE MODELS BY* over **STYLE SERIES** with **EXPLORE SERIES**. The boat runs between the two headings, which is why the split needs no rule. Below: a half-width aerial (a boat with a diver in the water) beside a white panel reading **WHY** ~44px dark grey over **STABI** ~64px in the brand red.
- **Pattern.** *Two doors into one range, cut two ways, over a single photograph.*
- **Type, colour, imagery.** Photography carries the page; type is two eyebrows and two words. The only brand colour on the page is the red in STABI, held back until the second band — one colour, used once, at size.
- **Genuinely good for this screen.** The dealer's catalogue has two honest axes — **the kind of boat** and **the brand** — and this frame shows them as equals, entered from one photograph, without a grid of tiles and without making the dealer choose a mental model first. It also gives us the shape for the pack's own two cuts (by kind, by brand table) as a *position in the URL* rather than a mode.
- **Avoid.** The nav is unreadable here: grey caps and grey social glyphs over bright water and spray — several items effectively vanish. And a 50/50 split with no divider gives neither half a boundary: with a keyboard, the two groups are indistinguishable. Our version needs each door to be a real, focusable region with its own name.

### Boston Whaler — `boats\whaler-1.png`, `boats\whaler-2.png`
- **Blocked.** Cloudflare: *"You are unable to access bostonwhaler.com"*, `Ray ID: a3b53273e9fed735`. No content.

### Williams Jet Tenders — `boats\williams-1.png` (= `boats\williams-2.png`)
- **Blocked.** A Cloudflare interstitial: *"www.williamsjettenders.com — Performing security verification"* with a **Verify you are human** checkbox, `Ray ID: a3b534438af5d736`. The check was not completed (we never solve bot challenges). No content. The live sweep reached Williams' range page by another route and ranked it second — see `notes-live.md`.

### Zodiac — `boats\zodiac-1.png`
- **What it shows.** A full-bleed photograph of the X9CC underway with three people aboard, a Mercury on the transom, flat grey sea and sky. Bottom-left, a text block led by a **thin blue vertical rule**: `02` small and grey, **X9CC** in enormous heavy condensed caps (~72px) white, a four-line paragraph at ~17px, then a small **Discover** link. Bottom-right, the pager: `| 01 | 02 | 03 | 04`, each number preceded by a thin rule, the current number bright white with a **blue** rule, the rest dimmed. Wordmark top-left, hamburger in a grey square top-right, a privacy widget bottom-left.
- **Pattern.** *The numbered hero chapter with a rule-and-number pager.*
- **Genuinely good.** The position is stated **twice** — as `02` above the model name and as the lit `02` in the pager — so the dealer always knows where they are in the set without counting dots. The blue rule is the only colour on the frame and it marks the current thing; that is a colour budget we can copy honestly ("blue and white was the brief").
- **Avoid.** 72px display caps over a photograph with no scrim (it holds here only because the sea is flat grey); a four-line paragraph inside a hero.

### Zodiac — `boats\zodiac-2.png`
- **What it shows.** **OUR RANGES** top-left in heavy caps ~40px on white. A large 3/4 render of the XCC — olive upholstery, black tube, Mercury — centred on white, with the range name **XCC** set enormous (~96px) in near-black *behind* the boat, crossing its T-top and aerial. At the right edge, a **circular white puck** bleeding off the frame containing a small MEDLINE render with its label — the next range, peeking. Hexagon-outlined chevrons at both edges; a seven-dot pager at the foot.
- **Pattern.** *Name behind the object on white, with a peeking next puck.*
- **Genuinely good for this screen.** Two things we can use immediately. First, **a render on white with the range name behind it** is a composition that flatters exactly the images our seed actually holds (Highfield and Stacer renders) — no invented environment, no fake water. Second, the **peeking puck** is an honest affordance: it says "there are more, and here is the next one", which dots alone never do.
- **Avoid.** The name crossing the boat's rigging degrades both — it needs to sit behind the hull, not through the mast. And a carousel of seven with no count leaves the dealer unable to see the size of the set; ours states the number.

### Porsche Finder — `porsche-finder-1.png` — **one of the six**
- **Site / page.** finder.porsche.com/au/en-AU — Porsche's used-car register.
- **What it shows.** A very light grey ground. Title pair at the top left: **Porsche 911** ~32px over *Used cars for sale.* ~20px. **Left column**, a white rounded card of facets: *Condition* with three checkboxes each carrying **its own count** — `Pre-Owned & Demonstrator (25+)`, `Porsche Approved Pre-Owned (25+)`, `Classic (7)` — and an ⓘ per row; *Model Series* as a select reading `911 (25+)`; then collapsed rows *Model Variants · Model Generations · Model Year · Body Type · Engine and Transmission*. **Right column**, a toolbar card holding the applied filter as a removable chip (`Model Series / 911 ×`), a grey *🔔 E-Mail me new results* button, and `Sort By: Recommended`. Then the result rows, each a white card: photograph left with a black **Sound** chip and a three-up thumbnail strip beneath it; on the right the title **2026 Porsche 911 Carrera GTS (992 II)** ~22px, a grey qualifier line (*Porsche Approved Pre-Owned*), a hairline, then three dot-separated fact lines (`Jet Black Metallic · Beige` / `T-Hybrid · 28 km · 02/2026 · 1 previous owner` / `398 kW / 541 PS · Rear-wheel-drive · PDK (Automatic)`), the price **$457,457** ~26px with *Drive Away Price¹* small beside it, a finance row, then black **Show details** and grey **Save**, the selling branch (*Porsche Centre Adelaide*) in bold small, and a grey consumption/emissions footnote under a hairline.
- **Pattern.** *Faceted register with photograph-led rows; the price with its qualifier named.*
- **Type and imagery.** One grotesk throughout, near-black on near-white, the only saturated colour being the cars themselves. The price is the largest figure in the row but not the largest text on the page — the title still wins. Every number on screen is a real number.
- **Genuinely good for this screen.** Three things, all directly transferable. (1) **Counts on the facets** — our kinds and brands can each carry the true count from the pack, and a count is the one figure home can honestly show. (2) **The price never floats free of its meaning**: `$457,457 Drive Away Price¹`, with the footnote present on the same card. Our from-price must name its rung the same way. (3) **Two acts per row, one irreversible-ish and one not** — *Show details* black, *Save* grey with a bookmark — which is our *Open* / *New version*.
- **Avoid.** Rows ~290px tall mean barely three results per screen; our drafts strip needs a denser rhythm. The `(25+)` truncation hides the real number — we have the real number and should print it. And the ⓘ on every facet row is three affordances where one explanation would do.

### Porsche Finder — `porsche-finder-2.png`
- **What it shows.** Scrolled: the facet list continues to eleven more rows (*Equipment · Exterior Colour · Interior Colour · Price · Availability · Mileage · First Registration Date · Previous Owners · Campaigns & Finance · Porsche Centre · Location*), all collapsed, all identical. The second card (*2022 Porsche 911 Targa 4 GTS (992 I)*, **$395,280**, *Porsche Centre Hobart*) and the head of a third repeat the row grammar exactly.
- **Genuinely good.** The regularity is the point: the eye learns the row once and then reads only the variables. A register earns trust by never varying its shape.
- **Avoid.** Nineteen collapsed facets in one rail with no grouping and no count of how many are active — the dealer cannot see what is filtering their own list. Ours shows applied filters as chips (which Porsche does) *and* keeps the facet list short.

### Porsche configurator — `porsche-top.png` — **one of the six**
- **What it shows.** Header: *Menu*, the centred PORSCHE wordmark, bookmark / flag / account at the right. Beneath it the **action row**: at the left `←`, **🔖 Save**, **↗ Create Porsche Code** as plain text-with-icon; at the right the money as a **two-line labelled figure** — `$0.00` over *Price for equipment* in small grey — then a calculator icon button, a grey **Summary** button and a black **Select a dealer** button. The stage: the car in a rounded rectangle ~930×520 with a floating dark toolbar inside its bottom-left corner (*⌃ Adjust scene · ↔ Compare · ⛶ 360° View · ⤓ · ⤢*), and beneath it a **filmstrip of ten views** with the active one ringed and a `›` to page. Right column: **911 Carrera** ~28px with a small grey `2027` chip beside it; an underlined link *Technical data and standard equipment*; a **search field scoped to this page** (*🔍 Search equipment options*); then a white card *Exterior Colours ⌃* whose groups each carry a price and an ⓘ — `Contrasts $0.00 ⓘ` with `White ▷`, `Shades $0.00 ⓘ`, `Dreams $0.00 ⓘ` — each group a row of paint swatches drawn as the **actual finish**, the selected one ringed.
- **Pattern.** *Top action row with the money labelled*; *content-scoped search above the choices*; *swatch where the colour is the content.*
- **Genuinely good for this screen.** The action row is the answer to the owner's veto: **the acts live at the top, ranked left-to-right by weight, and there is nothing at the bottom of the window.** Reversible acts (Save, share) are quiet text; the primary is a single black button at the far right; the money is small, labelled and never the loudest thing. And the scoped search field argues that our Ctrl K is a **finder over the dealer's own catalogue and quotes**, not a site search bolted into a header.
- **Avoid.** `$0.00` shown three times before anything has been chosen — a figure with no meaning yet. On home there is no total at all; the honest figures are counts.

### Linear — `tables\linear-homepage.png`
- **What it shows.** Near-black page. Header: the mark + *Linear* wordmark left; *Product · Resources · Customers · Pricing · Now · Contact*; a hairline divider; *Log in* and a white **Sign up** pill. The hero is **two type sizes and nothing else**: *"The product development system for teams and agents"* at ~56px medium white over two lines, then a single grey line at ~17px (*Purpose-built for planning and building products. Designed for the AI era.*) — and on that same baseline, at the far right, a small **New · Loops →** pair. Below, a product shot inset in a rounded frame with a faint light along its top edge: the app's own rail (*Linear ⌄*, then two small icon buttons — search and compose — then **Pulse · Inbox · My issues · Reviews**, a *Workspace ⌄* group with Initiatives / Projects / More, and a *Favorites ⌄* group), and the issue view headed `DRV-8852  Faster app launch  ★  ⋯` with **`1 / 84  ↑ ↓`** at the right of that same row.
- **Pattern.** *Two-tone headline (claim bright, elaboration grey)*; *rail with named, collapsible groups*; *position-and-pager printed in the item header.*
- **Genuinely good for this screen.** `1 / 84 ↑ ↓` is the cheapest honest orientation device in the stock: where you are, how many there are, and the two keys that move you — printed in the header, not learned. Our drafts strip and our kinds row can both carry it. The two-tone headline is also the antidote to the rejected 6× display head: **the greeting can be at one size if the second line is grey.**
- **Avoid.** A hero that is a screenshot of another app; and the marketing header's Log in / Sign up pair, which has no equivalent here (entry is a name until M6).

### Linear — `tables\linear-homepage-2.png`
- **What it shows.** The product shot continues: an activity feed with small round avatars, actor names in white and verbs in grey, relative times (*2min ago*, *just now*), a struck/quiet system line (*Linear moved from Todo to In Progress*), and a right-hand agent panel showing *Thinking…* above a *Reply…* composer with a **Skills ⌄** control. Beneath the shot, a **customer logo wall as a single row** — OpenAI · Vercel · salesforce · Figma · CURSOR · coinbase · ramp — all at equal optical weight in white, with a small tracked **mono** caption beneath at ~11px: *POWERING THE COMPANIES BUILDING THE FUTURE*.
- **Pattern.** *Single-row logo wall at equal optical size, with a mono caption.*
- **Genuinely good for this screen.** This is the honest treatment for **"their brands"** when a marque has a wordmark but no photograph we own: one row, optically levelled, no boxes, no invented hierarchy — and a small label that names the row without competing. It pairs with Nimbus's *Part of Nimbus Group* row and with Attio's bordered grid as the three options for the brand shelf.
- **Avoid.** Relative times alone (*2min ago*) with no absolute date on hover — a quote draft needs a real date. And the activity feed's grey-on-near-black verbs sit low on contrast.

### Stripe Docs — `tables\stripe-dashboard-docs.png` (= `…-2.png`)
- **What it shows.** White. Header: the `stripe DOCS` lockup; a centred search field with a **`/` keycap printed inside it at the right**, and an **Ask AI ✨** button beside it; *Create account* and *Sign in* at the right. A second nav row (Get started · **Payments** · Revenue · Platforms and marketplaces · Money management · Developer resources) with the active item purple and underlined, and *APIs & SDKs ⌄ · Help ⌄* at the right. Left rail: a collapsible tree with a collapse glyph at its head, a caps section label **ONLINE PAYMENTS**, disclosure triangles, and the current page in purple; at the rail's foot, two settings drawn as plain rows — `🇦🇺 Australia` and `English (United States)`. Main column: breadcrumb *Home / Payments*, H1 **Build a payments page** ~30px, a grey deck line ~20px, then a row of four small utility acts with glyphs (*Ask about this page · Copy for LLM · View as Markdown · Install tools*), a hairline, then a two-column band — heading, two lines, an arrowed link — beside an isometric illustration with call-out labels.
- **Pattern.** *Shortcut keycap printed inside the search field*; *a row of small utility acts under the title.*
- **Genuinely good for this screen.** The `/` keycap is the literal answer to "search (Ctrl K)": **the shortcut is printed where the act is.** Our finder field should carry `Ctrl K` as a keycap in its own right edge, so the dealer learns it by looking. The utility row under the title is also where home's quiet acts belong (open the register, see the price file) when the one primary act is a button.
- **Avoid.** Two navigation rows plus a tree rail plus a breadcrumb — four simultaneous orientation devices. Home gets one.

### Attio — `tables\attio.png` — **one of the six**
- **What it shows.** White. A dismissible black announcement strip across the top. Header: the attio mark + wordmark, *Platform ⌄ · Resources ⌄ · Customers · Pricing*, an outlined **Sign in** and a black **Start for free**. The hero is centred: a small outlined pill link above **"Welcome to agentic revenue."** at ~56px, a two-line grey sub at ~19px, and two buttons — outlined *Talk to sales*, black *Start for free*. Below, the product shot in a macOS window on a pale blue gradient. Inside it: a rail headed *Basepoint ⌄*, then a row reading **`⌘ Quick Actions` with `⌘K` right-aligned in the same row**, beside a separate small search button carrying a **`/`** keycap; then **Home** highlighted. The app's home pane shows **"Good morning, Alex"** at ~20px, one large bordered field holding a real question, an *Auto* label and a send button in its bottom right, and beneath it two suggestion chips with coloured glyphs: **Prep for next meeting** and **Recap last call**. A cookie dialog sits bottom-left with *Continue* and *Reject* — nothing was pressed.
- **Pattern.** *Greeting + one field + two suggestion chips*; *Quick Actions ⌘K as a row inside the rail.*
- **Type and colour.** The app pane is almost colourless — near-black text, one blue send button, two small coloured glyphs on the chips. The greeting is ~20px: **small**, and it still reads as a greeting because it is the first thing and nothing competes with it.
- **Genuinely good for this screen.** This is the closest thing in the stock to what our home actually is: a working app's home that greets the person, offers **one place to start**, shows **two things worth doing next**, and prints the shortcut on a rail row where it can be clicked as well as typed. The greeting at 20px is direct evidence against a giant display head — the owner already called a 6× head awful.
- **Avoid.** The one field here is a prompt box, and a prompt box on our home would be a promise we cannot keep — our field is a finder over the pack and the quotes, with the shortcut printed on it. And the chips must be real ("3 open drafts", "Stacer 529 Assault Pro"), never invented suggestions.

### Attio — `tables\attio-2.png`
- **What it shows.** Scrolled. More of the product shot: an *Ask anything…* composer; a **Meetings** list headed `Today, Oct 14  ‹ ›` in which **past items are struck through and dimmed** and the live one carries a green dot, with an indented *Details* block holding a one-line description and a real meeting link; a small black terminal window with a typed instruction and a status line (*Churning… (25s · ↓ 8k tokens)*, `auto Opus 4.8 · 1M context`); a transcript panel with speaker times. Beneath, the customer wall drawn as a **bordered grid of ten cells**, one wordmark per cell (granola · turbopuffer · parallel · Modal · Wispr Flow · Listen · taskrabbit · AIUC · WORDSMITH), a faint ↗ in some corners.
- **Pattern.** *The day list where done is struck and dimmed and now is dotted*; *bordered logo grid.*
- **Genuinely good for this screen.** The day list is a better drafts strip than a table: the finished ones stay visible but quiet, the live one is marked with one dot, and the detail line is the item's actual content rather than a status word. The bordered grid is the second option for the brand shelf when the marque set runs to two rows — it holds them without inventing sizes.
- **Avoid.** The terminal panel's tiny mono figures; and a day header with `‹ ›` but no date range stated in words.

---

## What the teardown doc says about this screen

From `docs/reference/configurator-teardowns-2026.md` (studied 2026-09-08). It is a configurator study, but four of its findings land squarely on Home:

1. **"Say what we do not check" — adopt.** PCPartPicker ships its disclaimer on *every* list: *"Disclaimer: Some physical constraints are not checked…"* and *"Note: Fan compatibility checking is currently not supported."* The doc's verdict is blunt: *"`CLAUDE.md` already names the guards' blind spots to developers; the app names none to the person using it."* **Home is where that sentence goes.** The dealer's first screen is the only place that can honestly state the extent of what they are working from — the pack's true size read from the manifest ("53 tables · 15,691 rows"), and the gaps that matter to a picture-led home: Highfield is renders, not photography; some rows have no held image at all. An unpictured brand says so on the tile; it is never quietly dropped from the shelf.
2. **Dell's information architecture — reject.** The doc measures it: *"60 configuration groups under 7 accordions, **all expanded by default**… 237 option inputs rendered simultaneously"*, with procurement paperwork (`Web Tracking`, `GSA Purchase Order`) outranking hardware. That is the written precedent for the owner's verdict on the old home dashboard. **Neither shape returns**: no wall of simultaneous controls, no arrangement that ranks admin above what the dealer sells.
3. **The headline figure that never moves — reject.** Dell shows `Starting at $5,599.00` and *"by direct before/after read — **does not change**"*, with every price a delta against a moving baseline. The adopted rule is *"Running total always on screen"* — but **home has no total**, and inventing one (pipeline value, month-to-date) would be exactly the fake figure CLAUDE.md forbids. The honest figures on home are **counts**, and the doc's own cohort supports it: PCPartPicker's `Filters 534 Compatible Products`, Porsche Finder's `(25+)` and `(7)`, our own `53 tables · 15,691 rows`.
4. **`aria-disabled`, empty accessible names, and shadow DOM — the accessibility findings.** *"Across eight configurators, exactly one exposes unavailability programmatically"*, and *"BMW's 22 native `disabled` controls carry empty accessible names"* — a screen reader told something is unavailable and not what it is. Plus: *"`configure.bmw.co.uk` renders as an entirely shadow-DOM document — a real deep-link and assistive-technology risk."* On Home this means (a) a brand or kind that cannot be entered yet is **a tile with a sentence**, never a greyed control with no name, and (b) the kind filter and any drafts filter are **real URL positions**, linkable and reloadable, per the plan's rule that a position inside a screen is a search param.
5. **One gap the doc names that Home answers.** *"Mercedes' `Copy Link to Build` + PDF is the dealer leave-behind artefact we do not have."* Our equivalent is the issued document — and **Home is where a build is found again**: the drafts strip, and the finder that reaches an issued quote by reference, customer or boat.

Nothing in that file concerns greeting, kinds, brand shelves or search; those come from the frames above and from the two sweeps.

---

## What to avoid, gathered

- **Anything at the bottom of the window.** Nothing in this stock has a bottom action bar; Porsche's own configurator puts every act in a top row. Riviera's floating *Return to Top* pill is the habit in miniature and is not worth copying.
- **Type floated on bright photography with no measured scrim.** Riviera's nav over the wake and Stabicraft's nav over the spray both fail; Highfield's statement survives by luck. If our greeting sits on the Stacer photograph, the scrim is measured.
- **A sticky bar that eats headings** (Axopar) and **cards that do not share a baseline** (Axopar's range carousel).
- **Carousels that hide the size of the set.** Zodiac's seven dots and Riviera's arrows both refuse to state a number. We have real counts; we print them.
- **A display head for its own sake.** Attio greets at ~20px and it works. Highfield's 62px hashtag says nothing about what is sold.
- **Four ranges across a 1440 window.** Highfield's row makes two of its ranges indistinguishable; Axopar's three variants leave each hull ~90px tall.
- **Labels in translucent strips over photographs** (Riviera). Label under the picture, or on a real ground.
- **A video hero with no poster frame** (Stabicraft) — a black screen is what a slow network sees.
- **Flags, chat blobs, translate bars and social rails** accreted at the edges (De Antonio, Highfield, Riviera). Home has one primary act and one field.
- **An empty state with no door** (Jeanneau). Nimbus's 404 offers two; Axopar names what does not exist yet. Ours does both.

## What this stock cannot answer

- **Drafts.** No frame here shows a person's own in-progress work except Attio's meeting list and Linear's issue view. Neither is a quote. The drafts strip has to be designed from Porsche Finder's row grammar, Saxdor's dated card and Attio's struck-through day list — none of them a direct match.
- **Search.** Only two frames show a shortcut at all (Stripe's `/` keycap, Attio's `⌘K` rail row). The command-menu evidence is in `notes-gallery.md` (cmdk, kbar, Raycast).
- **A dealer carrying many marques.** The nearest evidence is Nimbus's *Part of Nimbus Group* row and Linear's/Attio's logo walls. The live sweep's H.R. Owen frame is the only real multi-marque dealer home in the whole research set.
- **Motion.** Nothing here was driven; no timing, easing or transition is claimed from a still.
