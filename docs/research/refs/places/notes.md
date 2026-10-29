# Places — the sweep

Driven 2026-10-29 with `tools/research/capture.ts` into `live/`, `live2/` and `hand/` (390 × 844). **45 sources attempted, 41 frames on disk.** Three of those frames are walls: two Brandfetch Cloudflare challenges and Stabicraft's "We couldn't verify the security of your connection". Four sources failed (`sources-index.md`). **32 Read calls of a budget of 40** opened 34 sweep frames (eight through two native-size 390 tiles), three stock frames and one built shot. **Only an opened frame is cited.** Paths are relative to `docs/research/refs/places/`, and stock to `docs/research/refs/`.

**The job.** `/places` is the register of the **business**: what Northside calls each part of what it sells and does, each with its own mark, hero and line. `/places/$id` is one place, opened. `/data` is the register of the **file**: 53 lists, seven white maker plates with their pairings, then a ledger (`directions/data/built/m3-4-1440-rest.png`). Home already draws the boat makers as full-width doors. Places is the one screen where a place is *a record Northside edits*, not a reading of the file.

## 0. Corrections, by counting

1. **Marks:** `data/northside/marks-ledger.json` holds 20 rows under 14 names.
   - Northside Marine's own mark (`role: "organisation"`, dark and white).
   - **Stabicraft in white ink only.** Mercury is also white only.
   - **Dark ink only:** Formosa, GFAB, Haines Signature, Mackay, Surtees and **Yamaha**.
   - **Both inks:** Dunbier, ePropulsion, Highfield, Jeanneau and Stacer.
2. **Heroes:** `data/northside/pictures.json` holds **35 `hero`** pictures, all boats on the water.
   - Highfield 18, Stacer 11, Formosa 2, Stabicraft 2 (hull scope), Haines 1, Surtees 1.
   - Jeanneau has none, and neither do the 18 places that are not boat brands.
3. **25 places.** `places.ts` splits a multi-table module into one place per table:
   - Boats 7 · Motors 2 · Packages 3 (two factory files and Dealer Fit) · Trailers 8 (one OBSOLETE)
   - Accessories 2 (Parts, Rigging Kits) · custom 3 (Labour, Oils, Registration).
   - Kinds verified against `entities.json`.
4. **The engine still hangs the mark on the module.** `ModuleDef.logo` (`src/domain/model/modules.ts:111`) is one slot for all seven boat brands, which is the fault the plan names. No field holds a hero. `ModuleDef.description` is per module. **Missing, and owed in `src/domain/modules` with a test:** a per-place record keyed by `Place.key`, carrying `mark?`, `hero?` (a ledger picture id, or an upload marked as Northside's own) and `line?`.
5. **One mark reader guesses.** `brandLogos.ts` matches name *words* against a list that includes `nsm → Northside Marine`, so it would put Northside's mark on NSM Custom Trailers. Its marks directory is absent. Read the ledger's `markOf(register, ink)` in `src/data/pictures.ts` instead, which returns a mark or the reason there is none.
6. **Two stock frames are 404 pages:** `configurator/deep/stacer-range-au.png` and `configurator/deep/yamaha-outboard-range-au.png`.

## 1. What is genuinely best, by the hard questions

**(1) A brand with 588 hulls; Registration with 19 bands.** The head is the same for every place; the body is what the place holds. `live2/f1-teams.png` draws each team as a card on its own colour (name in display type, two drivers with small portraits, the car, the mark in a disc). `hand/f1-team-mclaren-390.png` opens one with that head kept, then **DRIVERS** begins as an ordinary section. `live/github-org-vercel.png` makes size honest: tabs carry counts (*Repositories 243 · People 71*).

For us, Highfield Inflatables opens on tiles: 67 boats, 7 series, 588 variants, 18 photographed. Registration Costs has `index: 'rows'`, so it opens on its 19 bands under the same head. No place gets an empty tile grid.

**(2) Where the mark goes to be the showpiece.** On `live/highfield-home.png` Highfield's own mark is about 30 px in a corner; the photograph is the showpiece. Northside's own Highfield page (`live2/northside-highfield.png`) has **no** Highfield mark, only "HIGHFIELD STOCK" in type over a tinted sea. `live/github-org-vercel.png` and `live/github-org-microsoft.png` lead with the mark in a 100 px tile, and `live2/svgl-logos.png` sets 15 marks at one optical size on equal plates. A mark held at its neighbours' size *is* the showpiece.

**Ink decides the ground.** Stabicraft can only stand on dark. Yamaha cannot stand on a photograph without a plate.

**REDCO / Tinka and NSM Custom have no mark.** Each gets its name set as a wordmark in the display face at the same optical size, with a sentence on its settings: "No mark held for REDCO / Tinka. Upload theirs, or paste its address." No initials and no stand-in.

**(3) A hero without a lie.** The failures are both in this sweep:
- `live/youtube-channel-yamaha.png`: a squatted `@yamahaoutboards` whose avatar is a man trimming a hedge.
- `live2/northside-highfield.png`: a tinted sea standing in for a Highfield.

The good form is `live/bo-speakers.png`. Its first tile is the *same* Beosound A5 photographed in a room, double width among studio shots of that model, and named.

For us:
- The picker offers only `tier: "hero"` pictures whose `table` is this place's own.
- Each is captioned with its subject ("Highfield Sport 560 on the water"), and the caption always prints.
- With no hero held, the place is told why where it chooses: "The ledger holds no photograph of a Yamaha Outboards line." Upload and paste stay offered. An upload is recorded as Northside's own (`docs/CUSTOMISATION.md`).

**(4) What a place is for, in the dealer's words.** `live/github-org-vercel.png` sets one grey line under the name; `live/figma-community-profile.png` a paragraph under the facts; `live2/northside-highfield.png` proves Northside already writes this sentence. `live/shopify-brand-assets.png` (text only) gives just the field list: logo, square logo, colours, cover image, slogan, short description.

On day one the line is **empty** and nothing prints. Settings asks: "What is Stacer to Northside, in a line?" The original string-matched its line and told trailer users they were configuring boat packages (`modules.ts:88-91`).

**(5) At 390.** `hand/f1-team-mclaren-390.png` stacks band, car, name, people and mark; `hand/github-org-vercel-390.png` keeps the mark tile beside the name; `hand/apple-iphone-family-390.png` shows three members and a ›. The failure: `hand/spotify-artist-390.png` keeps its desktop pane and cuts the name to "Ta".

## 2. Patterns worth taking, named

- **The team card** (`live2/f1-teams.png`) and **the livery page** (`hand/f1-team-mclaren-390.png`): each member on its own ground, and opened it keeps ground, picture and name at page scale.
- **The profile head** (`live/github-org-vercel.png`). A square mark tile, the name at about 24 px, a grey line, facts led by glyphs, **tabs with counts**.
- **The pinned six** (`live/github-org-vercel.png`). The owner chooses six to show first, two across.
- **The README banner** (`live/github-org-microsoft.png`). The organisation's picture is framed *inside* the overview as content, not as the page's ground, so the page never depends on it.
- **The rail cluster** (`live/github-org-vercel.png`). *People* are small avatars in the rail. For us, the places this one pairs with, as small marks that work as doors.
- **The family strip** (`live/apple-iphone-family.png`). Every member as picture and name in one row, a second-tone word under it ("New"), and a › at 390.
- **The equal plate** (`live2/svgl-logos.png`). One optical size and one plate. The head is counted ("676 logos") and carries one permission sentence. For us, the ledger's licence note, said once.
- **The name over the photograph** (`live2/spotify-artist-page.png`). The hero carries only the name, at about 96 px, and one fact. The act row sits *under* the hero.
- **The dealer's sentence** (`live2/northside-highfield.png`). Northside's words on the banner, with the range counted under it ("Showing 12 of 37").
- **The register as words** (`live2/marinemax-shop-by-make.png`). 31 makes as names in four columns: the plainest possible index.

## 3. Type and motion, as observed

F1 sets names in an extended heavy display face, drivers as Given **SURNAME**: the type is the livery. GitHub: a 24 px semibold name, a 14 px grey line, counts in pills. Spotify: about 96 px against 14 px. Apple: about 80 px over 14 px labels, "New" in a second colour. svgl: 16 px names over 12 px mono chips. Northside's own site (`live2/northside-home.png`): heavy all-caps sans and a hand-lettered yellow script, the house voice the owner already has.

Motion cannot be proven from stills; the frames show only what to refuse (Northside's full-width sale marquee, carousels on Stacer and Mercury, Yamaha's greyed photographs). The one earned motion is card to page: the mark and hero carry across (the View Transitions API the picker already uses), and nothing moves under reduced motion.

## 4. What to avoid, each with its frame

- **A picture on a name it does not depict:** `live/youtube-channel-yamaha.png`.
- **A brand page with no brand mark, a stand-in sea and a superlative** ("the world's #1 brand"): `live2/northside-highfield.png`.
- **A failed hero that says nothing:** `live/stacer-home.png`.
- **The mark as a corner badge on someone else's showpiece:** `live/highfield-home.png`, where a cookie banner also covers the lower fifth.
- **Pictures greyed so one pops:** `live/yamaha-au-marine.png`.
- **A promo panel and carousels before the range:** `live/mercury-au.png`.
- **A desktop pane squeezed into a phone:** `hand/spotify-artist-390.png`.
- **A text page as an exclusive reference** (the critics' standing fault): `live/stripe-connect-dashboard.png`, `live/vercel-project-dashboard-docs.png`, `live/shopify-brand-assets.png`, and `live/linear-docs-projects.png` and `live/notion-teamspaces.png` (product only as a docs screenshot). Vocabulary only.

## 5. Four directions

**What every board owes.** Every board draws all 25 places with the same head:
- the mark, or the name as a wordmark;
- the line, empty on day one;
- the hero and its caption, where one is held.

The page owes range, recent quotes, activity, catalogue, quotes, pricing (the declared rungs) and settings (mark, hero, line).

**Day one is empty and every board must say so.** Every place has **0 quotes**, and History keeps no price-list steps past the sitting (`docs/DECISIONS.md`, 2026-10-29). So "recent quotes" and "activity" are honest empty states ("No quote has a Stacer on it yet."), and a board must look finished with both empty.

None is narrow-list-left, detail-right, and each groups differently.

**A — "The paddock".** Colour cards, two across, each card on the place's own ground.
- **Card:** the name top-left in display type, with the line under it. **The mark large**, in white ink where held, otherwise on an inset white plate (Yamaha, Surtees). The hero fills the right half with its caption. With no hero, the colour field stays and nothing is put in its place.
- **Grouped by kind** (`TABLE_KINDS`): Boats 7 · Motors 2 · Packages 3 · Trailers 8 · Accessories 2 · the three custom registers.
- **Page:** the livery. The hero, mark and name at page scale on the card's ground, then the owed sections down one scroll.
- **Exclusive:** `live2/f1-teams.png` and `hand/f1-team-mclaren-390.png`.
- **Only A** gives each place its own colour. Northside sets it, and it is contrast-checked against the mark's ink.
- **Reflow:** three across at 1920, two at 834, one at 390 with the hero above the name.
- **Northside changes:** colour, mark, hero and line.

**B — "The profile".** A directory, then a profile.
- **Index:** one row per place: a 64 px mark tile, the name, the grey line, and two counted facts.
- **Page:** a 100 px mark tile, the name and line, and facts (*67 boats · 7 series · 588 variants · 3 price levels*).
- **Tabs with counts:** *Range 67 · Quotes 0 · Pricing 3 · Settings*. The tab is a search param.
- **Overview:** the **pinned six**, the hero framed as the README banner, and a rail of **"Fits with"** marks.
- **Grouped by the module minted from the table keys**, in the nine modules' own order.
- **Exclusive:** `live/github-org-vercel.png` and `live/github-org-microsoft.png`.
- **Only B** puts a place's partners on its page as marks, and lets Northside pin.
- **Reflow:** a 1,280 measure with a 300 rail at 1920; the rail drops under the pins at 834; at 390 the tile stays beside the name and the tabs scroll (`hand/github-org-vercel-390.png`).
- **Northside changes:** mark, hero, line and the six pins.

**C — "The family".** One page; there is no separate index layout.
- **Strip:** **all 25 marks across the head** at one optical size on equal plates. Each has its name and, in a second tone, a true state word where one applies ("no mark yet", "no longer sold").
- **Showcase:** below the strip, the chosen place opens as one large card: the name at about 72 px, the line, *New quote on a Stacer* at the right, the hero in the lower half with its caption, and the owed sections inside.
- **`/places/$id`** is this page with that plate chosen.
- **Grouped:** one strip in Northside's own order (`dashOrder.ts`), with the kind as each plate's mono chip.
- **Exclusive:** `live/apple-iphone-family.png` and `live2/svgl-logos.png`.
- **Only C** shows every mark at once, at one size. This is not Data's seven pairing plates: 25 small marks, no counts, each a selector.
- **Reflow:** two rows of plates at 1920; one scrolling row at 834; three plates and a › at 390 (`hand/apple-iphone-family-390.png`), with the card full width.
- **Northside changes:** order by drag, marks, heroes and lines. Stabicraft's white-only mark needs dark plates, or its own dark plate, and the board must draw which.

**D — "The shopfront".** An index of words, and a page that is Northside's own collection page, corrected.
- **Index:** Northside's mark over "25 places at Northside Marine", then the names in four columns as on `live2/marinemax-shop-by-make.png`, each with its kind in grey.
- **Page banner:** the held hero, never a tinted sea, with the **maker's mark in white ink** where held instead of the name set in type.
- **Under the banner:** Northside's sentence, then the counted range ("67 boats · 18 photographed"), as on `live2/northside-highfield.png`.
- **With no hero held:** the banner is Northside's blue, with the mark or the wordmark alone.
- **Grouped:** A to Z, ungrouped.
- **Exclusive:** `live2/northside-highfield.png` and `live2/marinemax-shop-by-make.png`.
- **Only D** looks like the site Northside's customers already know. It is the simplest board, drawn so the owner can choose it knowingly: it wins familiarity and loses the logo as showpiece on the index.
- **Reflow:** four columns, then two at 834. At 390, one column, and the hero at 16:9 with the mark under it, not over it (`hand/northside-highfield-390.png`).
- **Northside changes:** sentence, hero and mark, and its own appearance tokens on the banner.

## 6. What the seed can honestly put here

**Marks.** By exact maker name, 12 makers' marks reach **16 of 25 places**:
- the seven boat brands;
- Yamaha and ePropulsion;
- the Haines Signature and Jeanneau factory packages;
- Dunbier, Mackay, GFAB and Stacer Trailers;
- Dunbier / Haines BMT, which names two makers. Draw both, or let Northside pick; never let the first word decide.

**Nine places have no maker mark**, and each draws its name as a wordmark until Northside gives it one:
- REDCO / Tinka, NSM Custom and OBSOLETE;
- Parts, Rigging Kits, Dealer Fit, Labour, Oils and Registration.

Mercury's mark belongs to no place, because the file has no Mercury table. Northside's own mark heads the screen.

**Heroes.** 35 photographs reach 6 of 25 places, each depicting one named model. A place is offered only its own table's pictures.

**Counts and empty states.** Counts come from `moduleCensus`, which card and page share. Lines, quotes and activity are empty until they exist.

**Not on this machine:** standard inclusions and factory options; nothing here may imply they are held.
