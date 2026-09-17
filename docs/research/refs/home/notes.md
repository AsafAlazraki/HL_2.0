# Home — the sweep, synthesised

Synthesis date 2026-09-17, from `notes-live.md` (87 sources driven, **86 frames**), `notes-gallery.md` (75 driven, **74 frames**, 70 distinct), `notes-stock.md` (37 paths, 34 distinct images) and `notes-live2.md` (62 driven, **62 frames**, 61 distinct — the follow-up round that drove the twelve plan-named boat brands the first sweep left out and went looking for a register with nothing in it). Paths below are relative to `docs/research/refs/home/`; stock paths sit under `C:\Users\Asaf\dev\hl-refs\ref\`. **Every frame cited in this file exists, and all but fourteen were opened and looked at**; the fourteen are relayed from the first three reports and are marked in `sources-index.md`. Ledger of all **261 index rows — 259 frames, 251 distinct images**, counted from the files on disk 2026-09-17: `sources-index.md`. A row is a source driven, not a picture taken; the full census across both screens, with the recount command, is `docs/research/refs/both/sources-index.md`.

**The screen's job.** Greet the dealer; what they sell (kinds) and their brands, photographed; open drafts; one primary act, New quote; search (Ctrl K).

**Corrections to the reports, made by looking.**
1. `live/porsche-models.png`: the disabled "Understand the differences" button *does* carry its reason — "first select a model series" sits above it, against `notes-live.md`. The real defect is that the sentence is not tied to the control, so a screen reader reaches a dead button with no name.
2. The plan and all three notes say "Highfield has renders only". True of the catalogue tier, **false of the stage tier**: `public/hero-images/` holds four Highfield **on-water photographs** at 2560 — SP560, SP600, PA600, ADV7, from `media.highfieldboats.com`, in `heroes-ledger.json`. I opened `highfield-sp560-84445423.webp`: a Sport 560 with a Mercury 115 against Scandinavian rock. A direction drawn on Highfield is not forced onto renders.
3. "Motion, only what a still can prove. **One** instance across 199 frames" (§3 below) was true of the first sweep and is no longer true: MasterCraft's rotated family label is caught mid-change between `live2/mastercraft-boats.png` and `live2/mastercraft-boats-scrolled.png`. Two proven instances, not one. (And "199 frames" was 199 *ledger rows*: 197 frames, 190 distinct. Counted 2026-09-17; see the header and `both/sources-index.md`.)
4. **Four `-scrolled` frames are byte-identical to their unscrolled twin, so the scroll never happened** — `gallery/grafana-play-scrolled.png`, `gallery/trek-scrolled.png`, `gallery/westmarine-home-scrolled.png` and `live2/fjord-configurator-scrolled.png`. None of them is a second view, and nothing in this file or in `notes-gallery.md` may be claimed from one as one. It also cuts the other way for §3: "two captures differ" is the motion test, and these four pairs return a clean *no*.
4. The three reports admired only large counted figures — "45 models", "All listings (1,132)", "Models 2,555,000", "563 results" — and carried no reference for a register at zero, although the dealer's first paint has no drafts in it. Section 5 is that reference, drawn from the follow-up round.

---

## 1. What is genuinely best for this screen

**`live/nimbus-home-models.png` — the best answer to "kinds and brands, photographed".** Kinds are a plain underlined filter row (All models · Commuter · Coupé Cruisers · Day Cruisers · Tender · Weekender); under it a 3-up grid of full-bleed on-water photographs with hairline gutters and **no card at all**. Each tile carries three things: the kind as an eyebrow, the model name at about 24px, one promise. Pressing a kind filters the photographs.

**`live/williams-tenders.png` — the closest whole-screen shape to our home.** A left index of ranges against a vertical hairline, a middle list of models, a right panel with the promise, the facts in plain words ("Yachts 11+m/36+ft and seats 3+1 people") and two acts, "Discover More" and "Build My Tender". Brands, models, facts and the primary act at once, the photograph as ground rather than content — which is what lets a *dealer's* home hold seven boat brands without any of them shouting.

**`live/nimbus-builder.png` — the honesty our price file demands.** Where a figure cannot be shown the card says so: photograph, "2027", the model name, then "A DEALER IN YOUR AREA WILL PROVIDE A QUOTE." beside one outlined BUILD. The shape for a table with no declared rung (`mot_pkg_haines`, `dealer_fit`, `rig_kits` are all "not priced" in `docs/data/SEED.md`).

**`live2/malibu-models-scrolled.png` — the same honesty carried through the whole card.** Every Malibu model card is render, name in heavy condensed caps, from-price in blue caps beneath (`AS LOW AS $165,927`), a three-column fact strip with hairline dividers and both unit systems in each figure (`25'/7.62 M` HULL LENGTH · `18` MAX CAPACITY · `4,685 LBS/2,125 KG` MAX FACTORY BALLAST), then outlined EXPLORE and filled BUILD. On the 26 LSV, **"Coming Soon" stands exactly where the price stands on every other card, the fact strip is absent entirely, and BUILD is not greyed — it is gone.** This is the strongest instance in the sweep of CLAUDE.md's rule that a refusal is a sentence where it is refused and never a silently disabled control, because it shows what happens to the rest of the card when the file has nothing to say.

**`live2/mercury-outboard-scrolled.png` — the register our 45 Yamaha cut-outs need, and the line that is simply not printed.** Cut-outs on white, four across, each titled by family plus horsepower band (`Verado 350-425hp`, `SeaPro 15-25hp`), and beneath it a small blue displacement line — `5.7L V10`, `4.6L V8` — which is **absent** on the cards where Mercury does not publish it. Nothing invented, no em dash, no "N/A". The honest caveat: the cards hold a fixed height, so the absence reads as a hole; ours should close up or label.

**`ref/porsche-finder-1.png` — where honest numbers live.** Facets carry their counts, `Classic (7)`, `911 (25+)`, and the price never floats free of its meaning: `$457,457` with `Drive Away Price¹` beside it.

**`ref/boats/stabicraft-2.png` — the two-axis question, settled.** One aerial, the boat running left to right, two doors split by type alone: "EXPLORE MODELS BY **SIZE RANGE**" and "EXPLORE MODELS BY **STYLE SERIES**". A dealer's catalogue has exactly two honest axes and neither has to win.

**`gallery/collectingcars-home.png` — the best grammar for open drafts.** Five icon-and-word tabs that are *states, not categories* (This Week · Saved · Live Auctions · Coming Soon · Results), then cards of photograph, title, an 11px label over a bold figure, a time pill, and a foot line with place left and count right. The same card is re-used two folds down for wristwatches, so it survives a change of kind — boats, motors and trailers can share it.

---

## 2. The patterns worth taking, named

**The kind row that filters the pictures.** `live/nimbus-home-models.png`. Kinds are words on one line with the active one underlined; the grid beneath is photographs. The dealer learns no control — they read six words and press one. A position, not a mode, which is the plan's rule that a position inside a screen is a URL search param.

**Two doors into one range.** `ref/boats/stabicraft-2.png`. Two named entrances over a single photograph, each a filled button under a two-line heading; ours is "by kind" and "by brand". The frame also shows why each door must be its own focusable region with its own name: at 50/50 with no divider, a keyboard cannot tell them apart.

**The card that names its own refusal.** `live/nimbus-builder.png`, and `live/mercedes-models.png` where "Coming soon" sits exactly where a price would be. An empty state written on the card, never a greyed control. `live2/malibu-models-scrolled.png` goes furthest: the act that cannot be honoured is removed rather than dimmed.

**The primary act as a filled block in the top row.** Measured in the follow-up round: **five of the fourteen boat sites driven put it there** — Malibu `BUILD & BUY`, MasterCraft `BUILD & PRICE`, Bayliner `BUILD`, Fjord `Configure now`, Jeanneau `Configurator` — and Princess uses the same position for `Make an Enquiry →`. **None of the fourteen puts it at the foot of the window.** With `ref/porsche-top.png` from the stock, that settles where New quote lives.

**The brand row whose second line is the use.** `live2/mercury-outboard-range.png`: five families across at 1440 as plain hairline columns, no cards, no pictures — family name, then a grey line saying who it is for (Premium · Recreational · Performance · Commercial · Trolling Outboards), then a paragraph and one outlined act. Five abreast reads because the second line tells the dealer which one is theirs. Our seven brands can take it directly.

**The fleet as silhouettes, with a word for what is not real yet.** `live2/wally-fleet.png`: seventeen models on one screen as ~70 px grey side-profile line drawings under two kind labels (SAIL, MOTOR), the name in small lowercase beneath each, and the word *project* in italics where the model does not exist yet. The answer to a catalogue too large to photograph, and to the 118 unheld addresses. Two more instances of the same idea: Bayliner's plan-view hull schematic beside the kind's paragraph (`live2/bayliner-allboats.png`) and Jeanneau's outline icons on its door rows (`live2/jeanneau-home-scrolled.png`).

**The taxonomy as the navigation.** `live2/jeanneau-home.png` runs nine range names across the full header width (two of them partly behind the consent modal) with hairline separators; `live2/chaparral-home.png` does it with five series and demotes everything else to smaller caps. A dealer with seven brands and nine places need not hide them in a menu.

**Facts as ranges for a group.** `live2/princess-home-scrolled.png`: a class card carries `8 - 10 People` and `25 - 29 Metres`, because a class is a range, and a button that names its destination (`View the X Class →`) rather than saying "Learn more". How our series tier states a fact without inventing one.

**The count as the title.** `live/mercedes-models.png` puts "45 models" where a page title usually sits; `live/framework-marketplace.png` gives every category row its count (View all 563, Keyboards 249, Parts 166); `gallery/hagerty-marketplace.png` writes "All listings (1,132)" in grey beside its title. Home has no total — inventing one is the fake figure CLAUDE.md forbids — so manifest counts are the honest figures.

**The state tabs over fact-cards.** `gallery/collectingcars-home.png`: the page's second row says *where the work is*, not what the shop stocks.

**The split record card.** `gallery/hagerty-marketplace.png`: one 625px photograph, a column of three thumbnails, a short stack of facts, one black "View auction ›" the width of its panel — "carry on with this draft" as one object.

**The shortcut printed where the act is.** `ref/tables/stripe-dashboard-docs.png` prints `/` as a keycap inside the search field; `ref/tables/attio.png` shows `Quick Actions ⌘K` as a clickable row *inside* the rail with a separate `/` button beside it; `gallery/grafana-play-home.png` prints `ctrl+k` as a chip in the field's right edge. Ctrl K becomes discoverable without a tour and stays clickable for the dealer who never learns it.

**The search/create pair per group.** `gallery/cmdk-vercel.png`: each group offers "Search Projects…" and "Create New Project…" with keycaps on the row. Ours: "Search quotes… / New quote". `gallery/shadcn-cmdk.png` is the counter-proposal — one group, no keycaps, one footer hint (`↵ Go to Page`), the page behind neither dimmed nor blurred.

**The drafts door written as a question.** `live/porsche-models.png`: "Do you already have a configuration?" with a black "Load saved configuration" under it, opposite the title.

**Explore / Build.** Three unrelated brands landed on the same pair — De Antonio's DISCOVER|CONFIGURE (`ref/boats/deantonio-2.png`), Williams' Discover More|Build My Tender (`live/williams-tenders.png`), Aston Martin's Explore|Build (`live/astonmartin-home-scrolled.png`). It maps onto Open draft / New quote.

**The document card with its own contents.** `live/craft-home.png`: open documents as cards with a coloured border and a preview of what is actually inside them. A draft shows the quote, not a table row.

**The logo wall at one optical weight.** `ref/tables/linear-homepage-2.png` — one row, no boxes, no invented hierarchy, a small mono caption naming it; `gallery/hrowen-home.png` does it on glass over the showroom with the dealer's own services as peers of the marques. **Blocker:** `public/brand-marks/` does not exist and the trailer-brand logos are among the 6 refused addresses (SharePoint sign-in), so this cannot be drawn honestly today.

---

## 3. Type and motion, what was actually seen

**Two-tone at one size** recurs at `live/polar-home.png`, `live/linear-home.png`, `live/apple-store.png` and `ref/tables/attio.png`: claim bright, elaboration grey, same size. The cheapest hierarchy in the sweep, and the antidote to the 6× head the owner called awful.

**The greeting need not be big.** `ref/tables/attio.png` greets at about 20px — "Good morning, Alex" — and it reads because it is first and nothing competes. Against it, `ref/boats/highfield-1.png` sets a hashtag at about 62px that says nothing about what is sold.

**Scale contrast measured in the frames:** Apple 64/28, the title one word at the left against a right-aligned sentence (`live/apple-store.png`); Axopar 46/17, about 2.7× and still confident (`ref/boats/axopar-1.png`); Highfield's range row 30/15 (`ref/boats/highfield-2.png`). Faces: a wide light grotesk on the Scandinavian yards (Nimbus, Saxdor), heavy condensed caps on the Australasian ones (Stabicraft, Highfield, Zodiac), a serif only where the brand is old (Mercedes, Sotheby's).

**Figure over label, no chrome:** Porsche's `5.1 s / Acceleration 0–100 km/h` (`live/porsche-models.png`), Sea Ray's `LENGTH OVERALL 10.01 m | PERSONS CAPACITY | BEAM 3.23 m`, Grady-White's `LENGTH | BEAM | MAX HP 400` — and MAX HP is exactly the fact our boat×motor joins hold (2,519 rows in `join_hf_yam` alone).

**Motion, only what a still can prove.** Two instances across 259 frames (251 distinct). Cosmos's search placeholder differs between two captures, so it cycles (`gallery/cosmos-home.png` vs `-scrolled`). And MasterCraft's **rotated family label**, pinned vertically at the left edge, reads `THE XSTAR FAMILY` in `live2/mastercraft-boats.png` and `THE XT FAMILY` in `live2/mastercraft-boats-scrolled.png`, with the outgoing label still visible as a darker band above the incoming one — the section's own name travels with the scroll, caught mid-change. A third is inferable rather than proven: `live2/quicksilver-home.png` sets one word (`SAFE`) at ~90px over the water while the caption beneath names the whole set, "boating should feel free, safe and unforgettable", so the set is written out and the cycle cannot be mistaken for a claim. Everything else is a *control that exists* — pause buttons, dash pagers, and Zodiac's pager stating position twice, `02` at the item and `02` lit in the rule (`ref/boats/zodiac-1.png`). Two failures are the real lesson: Saxdor's lazy stage was captured empty, and Stabicraft's video hero has no poster frame (`ref/boats/stabicraft-1.png` is a black window). Our hero is a still from the pack, and it is the frame that must be there first.

---

## 4. What to avoid, each with its frame

- **A bar stuck to the foot of the window** — `gallery/carsandbids-scrolled.png`, where the promotional bar also clips the card foot lines ("Morganville, NJ" half eaten). The shape the owner called disgusting, in its natural habitat. Not one of the first sweep's 197 frames, and none of the 44 opened in the follow-up round, has a page-level bottom action bar — while five of the follow-up round's fourteen boat sites put the build act in the top row as a filled block; `ref/porsche-top.png` is the alternative — every act in a top row, reversible ones as quiet text left, the money small and labelled, one black primary far right.
- **Type on bright water with no measured scrim** — `ref/boats/riviera-1.png`: "MODELS" over the wake is at or below the floor while the same caps over dark water hold. The fixes are in the sweep: a solid panel *beside* the photograph (`gallery/sothebys-home.png`) or a crop chosen for the type (`gallery/rapha-home.png`).
- **A slot that can be empty and is not a sentence** — `gallery/boattrader-home.png`'s four spinning cards under "Boats Near You". Our home has empty slots on day one. The worst version is the dealer's own: `live2/empty-northside-search.png` answers with **NO RESULTS** in heavy caps, alone, no sentence, no reason, no way onward. The blandest is `live2/empty-antd.png`: a grey box and the words "No data". §5 has what to do instead.
- **A zero that is honest and then silent** — `live2/empty-huggingface.png` (`Models 0`) and `live2/empty-npm-search.png` (`0 packages found`) both print the count correctly and then leave four hundred pixels blank; on Hugging Face the only thing that fills the space is a promotion. The count being true is not the whole job.
- **A greyed act with no sentence** — `live2/mastercraft-boat-finder.png`'s CONTINUE, dimmed under six kind tiles with nothing saying what would enable it. The same defect as `live/porsche-models.png`'s "Understand the differences", which at least has its reason nearby.
- **A form for personal data as the first paint** — `live2/bayliner-home.png` (first capture): a newsletter modal asking first name, last name, email, country and postcode over the entire home. Nothing was typed. `live2/chaparral-home.png` (first capture) does it with a seven-flag market modal stacked over a cookie bar whose only button is ACCEPT.
- **Type clipped by the window on purpose** — `live2/sunseeker-home.png`: MAVERICKS runs off the right edge and cannot be read whole at 1440, and the outlined DISCOVER over mid-tone sky is the lowest-contrast control in the sweep.
- **A wall of panels as a welcome** — `gallery/grafana-play-home.png`: a gradient banner, six pills, three panels whose prose is clipped mid-sentence by a fixed height, a video and a news feed. The rejected home dashboard, shipping.
- **A circular crop for a long object** — `gallery/deere-home.png`: the row is right, the circles smear a machine; a 5.29 m hull fares worse.
- **Too many across** — `ref/boats/highfield-2.png` at four ranges on 1440 makes the Roll Up and the Ultralite indistinguishable; `ref/boats/axopar-1.png` leaves each hull about 90px tall.
- **A brand shelf with the pictures left out** — `gallery/marinemax-brands.png`: 27 marine marques as plain text in four alphabetical columns.
- **A paragraph laid on the photograph** — `gallery/northside-home.png`, the dealer's own site: a translucent white card of press copy over the water, under a header that is a phone book.

---

## 5. The register with nothing in it — the day-one home

The home must carry open drafts, and on day one there are none: no drafts, no customers, nothing issued. The three first-sweep reports carried only the negative (§4's spinning cards) and two *card-level* refusals. This is the positive, from the frames driven in the follow-up round.

**The anatomy, from the systems that publish one.** `live2/empty-atlassian.png` states it in a sentence — "An empty state appears when there is no data to display and describes what the user can do next" — and lists the parts: header (the only required one), description, a primary, a secondary and a tertiary action, an optional illustration with its dimensions, a width. `live2/empty-carbon-types.png` annotates the same object — a main title, body copy that "explains the empty state and directs the user to the UI element to click", an icon that "relates to the situation" — and asks the four questions that are exactly ours: *what will the pages, tiles, data tables and side panels look like without content; what are all the steps a user can take; is there any useful content that might be available to show; how can this be turned into something helpful?*

**The object, built, in the kit this repo already uses.** `live2/empty-shadcn.png` (Base UI): an icon, **"No Projects Yet"**, two lines — "You haven't created any projects yet. Get started by creating your first project." — a filled **Create Project**, an outlined **Import Project**, and a quiet **Learn More ↗**. Our drafts slot on day one is this object with our words: no drafts yet · New quote · open the file.

**The strip that keeps its frame.** `live2/empty-arena.png` is the best reference for an empty section *inside* a bigger screen: the page title becomes the sentence at its normal size (`Are.na / No results for "…"`), all four filter columns stay exactly where they are with the unavailable options greyed rather than removed, and a small bordered chip — **`ⓘ Nothing yet`** — sits in the position the first row would occupy. Nothing collapses; the absence is one labelled object.

**The counted register at zero.** `live2/empty-github-search.png` beside `live2/github-repos-register.png` is the same component full and empty: `240 repositories` becomes `0 results (36 ms)`, and **every facet in the rail still prints a literal `0`**. `live2/mastercraft-boat-finder.png` shows a counter that starts at zero before any choice is made and says `0 RESULTS` in a black block rather than hiding until the number flatters. Our manifest counts are large and true; our drafts count is zero and equally true, and it is written the same way.

**Say where the work lives.** `live2/empty-excalidraw.png` is the only frame in the whole sweep that treats local-first storage as something to state on the empty first paint: the marque, then "Your drawings are saved in your browser's storage. Browser storage can be cleared unexpectedly. Save your work to a file regularly to avoid losing it.", then four acts as a plain list with their shortcuts printed at the right. HL_2.0 is IndexedDB behind one seam until M6; the dealer deserves that sentence.

**And the frame that settles it.** `live2/empty-northside-search.png` — the dealer's own site, searched for something it does not stock, answers with the words **NO RESULTS** in heavy caps, alone, no sentence, no reason, no way onward. Any direction that leaves a slot empty without a sentence ships that.

## 6. The three directions, and a fourth

**A — "Nimbus shelf"** (kinds as 4:3 tiles, brands as a shelf, drafts as a strip, one primary pill).
Best informed by `live/nimbus-home-models.png` (the kind row filtering full-bleed tiles of eyebrow · name · promise), `ref/tables/linear-homepage-2.png` (the shelf as one optically levelled row) and `gallery/collectingcars-home.png` (the drafts strip as fact-cards under state tabs).
**Exclusive to this board, reusable by no other:** `gallery/deere-home.png` — kinds in one line with Parts and Used Equipment as peers of Excavators, the honesty our nine places need; `gallery/friluftsland-home.png` — brands and kinds sharing *one* tile grammar, a small serif line saying what pressing it does ("Se alt fra") over one big condensed word; and `live2/mercury-outboard-range.png` — the brand shelf as five hairline columns whose second line is the *use* rather than a specification, which is how seven marques sit in one row without a picture each. Only A puts both axes in tiles.
**The empty drafts strip:** `live2/empty-arena.png` — the strip keeps its frame and its filters, and `ⓘ Nothing yet` sits in the first row's place.

**B — "Cinema day"** (the largest held on-water photograph full-bleed, the greeting in a wide light face, drafts as one floating card).
Best informed by `gallery/marinemax-home.png` (the whole fold given to one photograph cut half above and half below the waterline, the search laid across it), `ref/boats/stabicraft-2.png` (two named doors over one photograph, the boat running between them so the split needs no rule) and `gallery/hagerty-marketplace.png` (the split card as the single floating draft).
**Exclusive to this board:** `gallery/sothebys-home.png` — the caption as a navy panel laid on the photograph's right third with its own ground, never bare type on the image, the contrast answer Riviera fails; and `gallery/rapha-home.png` — two photographs as one fold, the heavy caps headline on the left, calmer half. Only B has a photographic ground to write on.
**The empty drafts card:** `live2/empty-shadcn.png` — icon, "No Projects Yet", two lines, a filled primary and an outlined secondary; the single floating card with nothing in it yet, built in the kit this repo uses.

**C — "Porsche summary"** (white ground, title pair, three rails).
Best informed by `live/porsche-models.png` (title pair top-left, the drafts door as a question top-right, a rail of counted radios — All 72, 911 20, Cayenne 25), `ref/porsche-finder-1.png` (facet counts, the price with its qualifier named, two acts per row) and `live/mercedes-models.png` ("45 models" as the rail's title, the brand as a checkbox carrying its own mark, "Coming soon" on the card).
**Exclusive to this board:** `live/framework-marketplace.png` — twelve category rows each carrying its true count with a bar marking the active one, and "Starting at $1,159" as the plainest from-price wording; and `gallery/figma-community.png` — the titled register section with one grey line of explanation, "Browse skills ›" far right, one act at each row's right edge. Only C is built from rails of counted rows.
**Also this board's alone:** `live2/princess-home-scrolled.png` — a group stated as ranges (`8 - 10 People`, `25 - 29 Metres`) with a button that names its destination, which is how a white-ground rail states a series' facts without inventing a model's.

**A fourth the plan did not name — D, "The file, open".** `gallery/huggingface-home.png` makes the hero the product's own register, with its true count in its own panel header ("Models 2,555,000") and a second act written as a number ("Browse 2M+ models"); with Collecting Cars' state tabs and Stabicraft's two doors, that is a home whose middle is the dealer's live work over the pack stated at its true size — and it is the shape the three named directions leave out.
**Exclusive to this board, and the pair that makes it buildable:** `live2/github-repos-register.png` — a counted register with saved views down a rail, the count as the panel head's left figure, a density toggle at that head's right edge and a sparkline per row; and `live2/empty-github-search.png` — **the same register at zero**, keeping its shape, printing `0` in every facet, and answering with a sentence plus two next acts. Only D is built from a live register, so only D needs the full-and-empty pair. Third, and unique to D: `live2/empty-excalidraw.png`, the local-first first run that says where the work is kept.

---

## 7. Imagery: what the seed can honestly put here

Measured from `docs/data/IMAGES.md` and `data/northside/images.json` (packed 2026-09-16): **453 addresses — 329 held, 118 unheld, 6 refused.** Of the 329 held, **122 are scenes and 207 are studio**, and the split by host is decisive:

`www.northsidemarine.com.au` (the dealer's own mirror, the real reservoir) 103 held / **83 scenes** · `www.formosamarineboats.com.au` 17 / **17** · `www.stacer.com.au` 17 / **9** · `www.gfabtrailers.com.au` 7 / **7** · `www.highfieldboats.com` + `adventure.` 115 / **0** · `www.yamaha-motor.com.au` 45 / **0** (cut-outs on white).

Two constraints follow. **Catalogue copies are capped at long edge 1100 and only 39 reach it**; the Stacer 529 Assault Pro's own on-water frame (`public/seed-images/529-assault-lifestyle-tiffs-7-1024x676-fbf66995.webp` — a real photograph: blue hull, Evinrude, a lake and a mountain) is 1024×676 and cannot fill a 1440 window. **The stage tier is eight pictures**: `public/hero-images/` holds four Stacer and four Highfield photographs, the largest `stacer-519-sea-ranger-4ea6e75c.webp` at 2560×1694 — not the 529. A full-bleed direction is drawn on those eight, named, or it is upscaling.

**What the best sites do when they have only renders** — where the 115 Highfield catalogue renders and the 45 Yamaha cut-outs go. `ref/boats/highfield-2.png`: renders on white with a name in caps and a one-line promise, no card, no border, no price; the white ground is what makes them look intentional rather than missing. `ref/boats/zodiac-2.png`: the range name huge in near-black *behind* the render, with a puck of the next range peeking off the frame — and its own warning, the word must sit behind the hull, not through the mast. `live/saxdor-models.png`: index and stage, fifteen models and six lines as plain text beside one large render, no scroll. `live/apple-store.png`: nine cut-outs at puck size with the word beneath — the register for 45 outboards. The counter-example is `gallery/marinemax-brands.png`: if our brand shelf cannot be pictured, it is not a shelf.

**And a third option between a photograph and nothing: the drawn outline.** `live2/wally-fleet.png` draws all seventeen models as ~70px grey side-profile line drawings under two kind labels, with the word *project* in italics under the ones that do not exist yet — a whole fleet legible at thumbnail size with no photography at all. `live2/bayliner-allboats.png` explains a kind with a plan-view hull schematic rather than a photograph, and `live2/jeanneau-home-scrolled.png` gives each door row an outline icon of the thing it leads to. For the 118 unheld addresses and the 6 refused, a drawn outline plus a word is honest where a stand-in photograph is not.

**What home must say out loud**, per the teardown's "say what we do not check": the pack's true extent, and that 118 addresses are unheld and 6 refused. A brand with no picture gets a tile with a sentence — never a quiet omission, never a stand-in.

