# Home — follow-up round, the sites the first sweep never drove

Driven 2026-09-17 into `docs/research/refs/home/live2/` (62 frames, mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\home\live2\`; ledger `live2/sources.json`). This round exists to close two holes the critic found in the first sweep:

1. **Twelve boat brands and two car brands named in `PLAN.md` "Phase 0" were neither driven nor named under failed**, and Jeanneau and Quicksilver survived only as stock frames that are, respectively, the site's own error page and a Cloudflare block.
2. **No reference anywhere showed a register with nothing in it** — although the home must carry open drafts and on day one there are none.

**Forty-four of the 62 frames were opened and looked at for this file.** The eighteen not opened are marked in `sources-index.md`; nothing below is claimed about them.

No account was created, nothing was signed into, no personal data was typed. Consent was answered with the most privacy-preserving control present; where the tool could not reach one, the banner stays in the frame and is named here.

---

## 1. The accounting

**Driven, and usable:** Malibu, MasterCraft, Bayliner, Fjord, Invictus, Wally, Sunseeker, Princess, Chaparral, Pardo, Brabus Marine, Mercury, Jeanneau, Quicksilver. That is all twelve the critic named, plus the two re-drives.

**Driven and refused by the site, not fought** (all landed on an Akamai "Access Denied" page whose text names the blocked URL): **Audi**, **Tesla** (home and design studio), **TAG Heuer**, **Rolex**. `live2/tesla-home.png` is the evidence — `Access Denied / You don't have permission to access "http://www.tesla.com/en_au" on this server. / Reference #18.46a82d17…`. These four are now named under failed with their reason; they were absent from every list before.

**Answered by the site with a 404**, first URL guessed, then re-driven at the URL the site's own navigation gives: Fjord (`/en/` → `fjordboats.com/gb/`), Invictus (`/en/` → the Italian 404), Bayliner (`/en-us/boats` → `/global/en`), Jeanneau (`/en/powerboats` → `/`), MasterCraft's builder (`/build/` → `designmy.mastercraft.com`), Sunseeker (`/en/` → `sunseeker.com`). Both frames are kept: the 404 is evidence of what happened, the re-drive is the reference.

**Consent left in the frame, nothing accepted:** Chaparral (the bar's only button is ACCEPT and the copy says continuing is accepting), Jeanneau (the modal offers CONTINUE WITHOUT ACCEPTING but the identical phrase appears inside the banner's own body copy, so a text match clicks the paragraph, and an anchor-role click times out), Carbon (IBM's banner arrives late, at the foot of the scrolled frame). Fjord, Brabus and Pardo were refused by an explicit step — "Save Settings" with Marketing/Analytics/Functional all off, "CONFIRM SELECTION" with only REQUIRED ticked, and "Continue without Accepting" — none of which accepts a non-essential cookie.

**Still not captured:** Shopify Polaris's empty-state page. Two URLs tried (`polaris.shopify.com/components/layout-and-structure/empty-state`, `polaris-react.shopify.com/components/empty-state`); both redirect to `shopify.dev/docs/api/polaris`, a references index with no empty state on it. Named failed. Atlassian, Carbon, shadcn and Ant cover the same ground.

---

## 2. What is genuinely best for this screen

**`live2/malibu-models-scrolled.png` — the card that removes the act it cannot honour.** Every model card is: render on warm off-white, the model name in heavy condensed caps, the from-price in blue caps directly beneath — `AS LOW AS $165,927` — then a three-column fact strip with hairline dividers, figure above label, each figure carrying both unit systems (`25'/7.62 M` HULL LENGTH · `18` MAX CAPACITY · `4,685 LBS/2,125 KG` MAX FACTORY BALLAST), then two acts: outlined EXPLORE and filled BUILD. And then the 26 LSV: **"Coming Soon" sits exactly where the price sits on every other card, the fact strip is absent entirely, and the BUILD button is not greyed — it is gone.** Only EXPLORE remains. This is the strongest instance in 261 frames of the rule CLAUDE.md states: a refusal is a sentence where it is refused, never a silently disabled control. It is better than `live/mercedes-models.png` because it shows what happens to the *rest* of the card when the figure is missing.

**`live2/mercury-outboard-scrolled.png` — the register our 45 Yamaha cut-outs need, and the blank line that is honest.** A 4-across grid of bordered cards, each a cut-out engine on white, the title being the family plus its horsepower band (`Verado 350-425hp`, `SeaPro 15-25hp`, `ProXS 175-300hp`), and under it a small blue line with the displacement — `5.7L V10`, `4.6L V8` — **which is simply absent on the cards where Mercury does not publish it** (Jet 105hp, SeaPro 75-150hp). Nothing is invented and nothing says "—". The honest caveat: the cards keep a fixed height, so the absence reads as a hole rather than a decision; ours should either close the gap or label it.

**`live2/mercury-outboard-range.png` — the brand row where the second line is the use, not the spec.** Five families across at 1440 as plain columns with hairlines, no cards and no pictures: family name, then a grey line saying *who it is for* — Premium / Recreational / Performance / Commercial / Trolling Outboards — then a paragraph and an outlined Learn More. Five abreast reads because the second line tells you which one is yours. A dealer's seven brands can take exactly this: the brand, then a plain line saying what it is for.

**`live2/wally-fleet.png` — the whole fleet at a glance, and a word for what is not real yet.** The fleet panel slides over the left 56 % of the window as a translucent sheet while the film keeps running in the right 44 %. Inside: two kind labels down the left in tracked caps (SAIL, MOTOR) and against each a grid of models, every one drawn as a **tiny grey side-profile line drawing** about 70 px wide with the name beneath in small lowercase — seventeen models on one screen, no photographs, no prices. Where a model does not exist yet the word ***project*** sits in italics under the name. This is the answer to a catalogue that is too big to photograph and to a model with no picture: a silhouette carries the kind, and a word carries the honesty.

**`live2/github-repos-register.png` with `live2/empty-github-search.png` — the same register, full and empty.** Full: `240 repositories` as the panel head's left figure, sort control right, two density toggles at the far right of the same bar; a left rail of saved views (All · Contributed by me · Admin access · Public · Sources · Forks · Archived · Templates) with a blue bar on the active one; each row a name plus a `Public` pill, one line of description, topic chips, a fact line (language dot · licence · forks · stars · issues · PRs · `Updated now`) and a sparkline at the row's right edge. Empty: `0 results (36 ms)` in the same head, **every facet in the rail still printed with a literal `0`**, and the body one card — illustration left, `Your search did not match any repositories`, `You could try one of the tips below.`, two collapsible tips, and `You could try an advanced search.` The register does not change shape when it empties; the counts stay and read zero.

**`live2/mastercraft-boat-finder.png` — a counter that starts at zero and says so.** Five chapter words in the head (Activities · Crew · Bow · Lifestyle · Length) with the active one underlined red, and at the right a black block reading **`0 RESULTS`** — before a single choice has been made. The count does not hide until it is flattering. Under it a question as the title ("THE WATER IS CALLING. WHAT ARE YOU DOING?") and six photographic kind tiles with the word laid bottom-left in heavy caps. The defect to avoid is in the same frame: CONTINUE below is greyed with no sentence saying why.

**`live2/mastercraft-boats.png` / `-scrolled.png` — kinds, families and models in one register.** A kind row (All Models · Surf · Recreation Ski · Recreation Wake · Competition Wake · Competition Ski · All The Rest) with the active underlined red and COMPARE MODELS as an outlined button at the row's right edge. Then one band per family: eyebrow, family name huge, EXPLORE; then each model as render, name, a two-clause promise, **a fact triple as label-over-figure with hairline dividers** (SEATING 16 | LENGTH 23'7" | BALLAST (LBS) 3,775) and two acts, LEARN MORE › and DESIGN BOAT ›. Our boat×motor joins hold precisely that kind of triple.

**`live2/princess-home-scrolled.png` — how to state a fact about a group without inventing a figure.** Classes as a 3-across card grid: photograph, class name at ~28 px navy, then two plain lines — `8 - 10 People`, `25 - 29 Metres` — then a full-width navy button that names its destination, `View the X Class →`. The facts are *ranges* because a class is a range. Our series tier can say the same thing honestly where a single model's figure would be a lie.

**`live2/empty-excalidraw.png` — the local-first first run, which is our exact situation.** Nothing made yet, and the page is: the marque centred, three lines about *where the work lives* — "Your drawings are saved in your browser's storage. Browser storage can be cleared unexpectedly. Save your work to a file regularly to avoid losing it." — then four acts as a plain list with their shortcuts printed at the right (Open `Ctrl+O`, Help `?`, Live collaboration…, Sign up), and hand-drawn arrows pointing at the real controls. HL_2.0 is IndexedDB behind one seam with no backend until M6; this is the only reference in the whole sweep that treats "your work is in this browser" as something to say out loud on the empty first paint.

---

## 3. The register with nothing in it

The first sweep carried the negative (`gallery/boattrader-home.png`'s four spinning cards) and two *card-level* refusals, but no positive. Here is the positive, measured across the frames named below.

**The anatomy, from the design systems that publish one.**
- `live2/empty-atlassian.png` — "An empty state appears when there is no data to display and describes what the user can do next." The default example is header-only: **"You don't have access to this work item"**, and the page states that the header is the only required part. Its contents list is the anatomy: Default · Custom heading level · Description · Actions (Primary / Secondary / Tertiary) · Loading state · Illustrations (image URL, render image, image dimensions, maximum image dimensions) · Width.
- `live2/empty-carbon-types.png` — the annotated diagram: a main title, body copy that "explains the empty state and directs the user to the UI element to click", and an icon that "relates to the situation". Then four questions to ask during design, and they are the right four for us: *What will the pages, tiles, data tables, and side panels look like without content? What are all of the steps a user can take to address the situation? Is there any useful content that might be available to show? How can I turn this situation into something that is engaging and helpful?*
- `live2/empty-shadcn.png` — the same thing built, in the kit this repo already uses (Base UI): an icon, **"No Projects Yet"**, two lines — "You haven't created any projects yet. Get started by creating your first project." — a filled primary **Create Project**, an outlined secondary **Import Project**, and a tertiary **Learn More ↗** beneath. Our drafts slot on day one is this object with our words: *no drafts yet · start a quote · open the file*.
- `live2/empty-antd.png` is the counter-proposal and the one to avoid: a grey illustration of a box and the words **"No data"**. No sentence, no act.

**The same thing in real registers, at zero rows.**
- `live2/empty-arena.png` — **the best of them for a strip inside a bigger screen.** The page title *becomes* the sentence: `Are.na / No results for "zqxwvnothinghere"` at the size the title always is; the four filter columns (Where · Types · Fields · Order) stay exactly where they are with the unavailable options greyed rather than removed; and a small bordered chip, **`ⓘ Nothing yet`**, sits in the position the first row would occupy. The register's frame does not collapse and the absence is one small labelled object, not a full-page apology.
- `live2/empty-huggingface.png` — `Models 0`. The count keeps its place in the title and reads zero; the facet rail keeps every chip. Its defect is that the results column is then simply blank — nothing tells you what to do — and the only thing occupying the space is a promotional popover.
- `live2/empty-npm-search.png` — `0 packages found`, then four hundred pixels of white. Honest, and mute.
- `live2/empty-northside-search.png` — **ground truth, and the worst of the set: the dealer's own site.** Search for something Northside Marine does not stock and you get the word **NO RESULTS** in heavy caps, alone, in the middle of white space, with no sentence, no reason and no way onward. This is the frame to put beside any direction that leaves a slot empty.

**Absence that is not a register: four 404s as a ladder.** `ref/boats/jeanneau-1.png` (the stock frame) — "THIS PAGE NO LONGER EXISTS", no exit at all. `live2/sunseeker-404.png` — `404 / PAGE NOT FOUND / BACK TO HOME`, one door, no navigation. `live2/quicksilver-range.png` — **the best**: a brand illustration of a hull in the marque's own acid green and cyan, `404: page not found` at ~44 px in the brand colour, two sentences that include a reason and a way to report it ("We could not find the page you requested. Contact us if you think you received this page in error."), one filled green **Return to Quicksilver**, and the whole navigation still standing above it. `live2/empty-northside-search.png` — the dealer's own, at the bottom of the ladder.

---

## 4. Patterns worth taking, named

**The build act as a filled block pinned in the header.** Measured: **of the fourteen boat sites driven this round, five put it there** — Malibu `BUILD & BUY` (white block, top right), MasterCraft `BUILD & PRICE` (red block), Bayliner `BUILD` (a navy square that is taller than the header itself, with an icon), Fjord `Configure now` (white block), Jeanneau `Configurator` (a red tab in the utility bar). Princess uses the same position for a different act, `Make an Enquiry →` in filled navy. Not one of the fourteen puts it at the foot of the window. This is the answer to "one primary act, New quote" and it agrees with `ref/porsche-top.png` from the stock.

**Two doors, each naming its own destination.** `live2/fjord-motorboats.png`: one line of heavy caps over an aerial, and beneath it two outlined buttons side by side — `Discover the new FJORD 39XL` and `Discover the new FJORD 490 open`. Compare `ref/boats/stabicraft-2.png`, where the two doors name a *rule* (by size range / by style series). Both are honest; the difference is whether the dealer is choosing an axis or a boat.

**The range rail as the header.** `live2/jeanneau-home.png` runs nine range names across the full width as the primary navigation (two partly behind the consent modal) — MERRY FISHER · EX · CAP · TH · DB · SEA · SUN · SUN ODYSSEY · JEANNEAU YACHTS — separated by hairlines, with Compare and Configurator in the bar above. `live2/chaparral-home.png` does the same with five series (SSi · SSi-OB · SSX · OSX · GTS-SURF) and demotes Owners / Shopping Tools / Find a Dealer to smaller caps. For a dealer holding seven boat brands and nine places, this says the taxonomy can *be* the navigation rather than sitting inside a menu.

**The line drawing where a photograph would lie.** Three independent instances this round: Wally's fleet silhouettes (`live2/wally-fleet.png`), Bayliner's plan-view hull schematic with red corner brackets beside the kind's paragraph (`live2/bayliner-allboats.png`), and Jeanneau's door rows where each door carries an outline icon of the thing — a motorboat outline for ONLINE TOOLS, a compass for DEALERS, a sailboat for USED BOATS (`live2/jeanneau-home-scrolled.png`). Highfield has renders only and 118 of our 453 image addresses are unheld; a drawn outline is a legitimate third option between a photograph and nothing.

**The door row: icon, title, sentence, a button that names the act.** `live2/jeanneau-home-scrolled.png` — ONLINE TOOLS → `CONFIGURE A BOAT`; DEALERS → `CONTACT A DEALER`; USED JEANNEAU BOATS → its own. The button never says "Learn more".

**Family → model in one screen, models as chips.** `live2/mastercraft-build.png` ("DESIGN A BOAT"): the first three families as large renders on white with the family name in heavy condensed caps beneath, and under each a row of small grey model chips (NXT20 · NXT22 · NXT23 · NXT24). Two levels of the hierarchy in one fold without a second page.

**The market notice that does not block.** `live2/brabus-marine-home.png` puts "ⓘ Find & buy products for International." in a full-width strip with a grey chip naming the market and an × to dismiss it — against Chaparral's modal (`live2/chaparral-country-modal.png`) and Bayliner's newsletter form (`live2/bayliner-newsletter-modal.png`), both of which take the whole first paint.

**The consent control parked as a tab.** `live2/princess-home.png` has no banner: a small black `COOKIES` tab sits in the bottom-left corner and stays there. The page is legible on first paint and the control is still reachable.

---

## 5. Type, colour and motion actually seen

**Motion, proven by two stills.** `live2/mastercraft-boats.png` and `-scrolled.png` catch MasterCraft's **rotated family label** mid-change: a vertical rail label pinned at the left edge reads `THE XSTAR FAMILY` in the first frame and `THE XT FAMILY` in the second, with the outgoing label still visible as a darker band above the incoming one. The section's own name travels with the scroll. That is a second proven motion instance to set beside Cosmos's cycling placeholder.

**A word that cycles.** `live2/quicksilver-home.png` sets one word — `SAFE` — at about 90 px in acid green over a sunset, with the caption beneath naming the whole set: "boating should feel free, safe and unforgettable". The set is written out, so the cycle cannot be mistaken for a claim.

**Scale and face.** Sunseeker `THE ORIGINAL / MAVERICKS` in a very wide light grotesk at ~90 px, letter-spaced, deliberately bleeding off both edges. MasterCraft and Malibu both in heavy condensed caps for the model name with a light grotesk for the promise. Princess at ~28 px navy for a class name with plain 15 px facts beneath — the quietest of the round and the easiest to read at a glance. Invictus sets `PREMIUM` in wide-tracked caps over `Collection` in an italic serif, on black.

**Renders on black.** `live2/invictus-yachts.png` floats the render in pure black where `ref/boats/highfield-2.png` floats it on white. Both make a render look deliberate rather than missing; black reads as cinema, white reads as catalogue. Highfield's 115 renders can go either way, and that is a direction question, not a rule.

**Colour.** Malibu prices its cards in a mid blue on off-white; Mercury sets its displacement line in the same family of blue on white; Bayliner writes the kind's name in yellow on navy. Against a dealer brief of "blue and white… a bit more colour usage please", three of this round's sites use one saturated blue for the *figure* specifically — the price and the spec — and leave the rest black on white.

---

## 6. What to avoid, each with its frame

- **A personal-data form as the first paint.** `live2/bayliner-newsletter-modal.png` — a newsletter modal asking first name, last name, email, country and postcode, with the consent sentence inside it, over the entire home. Nothing was typed.
- **A market chooser as a modal.** `live2/chaparral-country-modal.png` — seven flag rows over the boat, plus a cookie bar whose only button is ACCEPT, so the page cannot be seen without answering twice.
- **"NO RESULTS" with nothing else.** `live2/empty-northside-search.png`, the dealer's own site.
- **"No data" under a grey box.** `live2/empty-antd.png`.
- **A zero that is honest and then silent.** `live2/empty-huggingface.png` and `live2/empty-npm-search.png` both print the count correctly and then leave the space blank; the only thing that fills it on Hugging Face is a promotion.
- **A greyed act with no sentence.** `live2/mastercraft-boat-finder.png`'s CONTINUE.
- **A name laid on a bright photograph with no scrim.** `live2/fjord-configurator.png` — the model tiles carry the name in light grey directly on the image, and `Fjord 490 sport` and `Fjord 490 open` are washed out where the water is bright, while `Fjord 53 XL` on the darker tile holds. `live2/chaparral-home.png`'s white marque over pale water fails the same way. This is Riviera's failure repeating on two more sites.
- **Type clipped by the window on purpose.** `live2/sunseeker-home.png` — MAVERICKS runs off the right edge and cannot be read whole at 1440, and the outlined DISCOVER over mid-tone sky is the lowest-contrast control in the round.
- **A hero that had not painted.** `live2/airtable-home.png` — headline, two acts, then 400 px of empty where a film should be, with a pause button floating in it. Same failure as Saxdor's lazy stage in the first sweep; our hero is a still from the pack for this reason.

---

## 7. What this changes for the directions

- **A, B and D all place a drafts strip or card that is empty at first run.** They now have references: `live2/empty-shadcn.png` for the object (icon · title · two lines · primary · secondary · tertiary), `live2/empty-arena.png` for a strip that keeps its frame and puts `Nothing yet` in the first row's place, `live2/empty-github-search.png` for a counted register that reads `0` without changing shape, and `live2/empty-excalidraw.png` for saying out loud that the work lives in this browser.
- **D "The file, open"** had one exclusive reference. It now has a second and a third that belong to no other board: `live2/github-repos-register.png` (a counted register with saved views in a rail, a density toggle in the panel head and a sparkline per row) paired with `live2/empty-github-search.png` (the same register at zero). Only D is built from a live register, so only D needs the pair.
- **A "Nimbus shelf"** gains `live2/mercury-outboard-range.png` for a brand row whose second line is the use, and `live2/wally-fleet.png` for a kind grid drawn as silhouettes when the pictures are not there.
- **C "Porsche summary"** gains `live2/princess-home-scrolled.png` — facts as ranges for a group, and a button that names its destination.
- The **primary act** in every direction should sit in the top row as a filled block: five of fourteen boat sites this round, and every car and premium site in the first sweep, put it there; none put it at the foot.

---

## 8. What remains open

- **Audi, Tesla, TAG Heuer and Rolex** refuse a headless browser at the edge. Not fought. If the owner wants them, they need a hand-driven capture.
- **Shopify Polaris's empty state** no longer exists at a reachable URL.
- **The Mercury "outboard builder" the plan names was not found.** What was captured is Mercury's outboard *register* — families, horsepower bands, a displacement line where the file has one. No build-and-price tool appeared anywhere in the site's own navigation this round. The plan's entry is therefore only partly met, and the index says so.
- **The eighteen frames listed as *(not opened)* in `sources-index.md`** were captured but not read. Four of them are denial pages and four are the sites' own 404s; the remaining ten are homes and second views. Nothing in this file rests on them.
- **Boatsales at zero rows** is blocked ("You have been blocked", ID 789a82c2-…); the nearest analogue at zero is therefore Are.na and GitHub, not a boat marketplace. `gallery/boatsales-home.png` from the first sweep still stands for the full state.
- **Figma Community at zero rows** was not reached: the search query is dropped and the URL resolves to the Community home (`live2/empty-figma-community.png` is that home, not an empty register).
- **Jeanneau's consent modal** is in both Jeanneau frames. It offers a refusal; the tool cannot reach it. Nothing was accepted.
- **Brabus Marine** at `brabus-marine.com` (with or without `www`) serves a certificate whose common name does not match; the live pages are under `brabus.com/en-fi/marine/`, and what is there is a shop, not a range page.
- Nothing here is an image the app may use. Every frame is a reference; the app's pictures come from the pack's own 453 addresses.
