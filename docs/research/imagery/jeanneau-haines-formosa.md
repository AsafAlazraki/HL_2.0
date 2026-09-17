# Jeanneau, Haines Signature and Formosa imagery sweep (2026-09-17)

Companion to `jeanneau-haines-formosa.json` (**1,608 records, 1,589 distinct addresses**; a second Formosa pass on the same day added 35 and removed 1 — see "Formosa, second pass" below; a Jeanneau follow-up the same day added 1 and re-classed 2 — see "Jeanneau follow-up" below). Every address in the JSON was requested over HTTP on 2026-09-17; `status`, `contentType`, `bytes`, `width` and `height` are what the request returned, not what a page claimed. The 167 records on the dealer's own site answer a script with 403, so their pixel sizes were measured inside a real browser tab with `naturalWidth`/`naturalHeight` and they carry `refused: true` and no byte size. Nothing was downloaded into `public/`.

The seed models these cover are the 27 Merry-Fisher-matrix rows (b2 rows 227–260), the 9 Haines Signature rows (264–276) and the 39 Formosa rows (956–1002) — **75 models**.

## Sources and how each was read

| Source | What it is | How it was read |
|---|---|---|
| `www.jeanneau.com/boats/powerboat/...` (26 model pages) | The builder's own model pages for every seed model except the used 895 | Fetched by script; the page's `<main class="model-show">` block was parsed, so nothing from the site-wide navigation could leak in. Each gallery `<a>` carries `title="<model name>"` and each feature block a `title="<model> - <caption>"`; those titles are the attribution. |
| `www.jeanneau.com/boats/powerboat/9-merry-fisher/94-merry-fisher-895` | The **archived** Merry Fisher 895, i.e. the Serie 1 hull the seed calls `895 S1 (Used)` | Found through `/previous?category=powerboat&search=merry+fisher+895`. Three images, all titled "Merry Fisher 895". |
| `app.jeanneau.com/uploads/media/image/{exterior,interior,layout}/hd/...` | Where jeanneau.com serves its photography; `hd` is the full-size file, `sd` the thumbnail | Only `hd` addresses were taken from galleries and layouts. Header and feature-block images have no hd/sd split and were taken as served. |
| `www.jeanneau.com/legal` | The Legal Notice | **Read.** Article 5.1 says the photography is the exclusive property of SPBI S.A. and that reproduction is prohibited without authorisation; 5.2 says the same about the JEANNEAU marks. This is recorded verbatim in every Jeanneau `licenceNote`. |
| `hainessignature.com.au/<model>/` (9 model pages) + 3 range pages | The builder's own model pages | Fetched by script. Elementor gallery lightbox `href`s are the full-size file; standalone images were taken at the largest `srcset` candidate. |
| `www.formosamarineboats.com.au/range/<configuration>/` (9 pages) | The builder's range pages — **one page per hull configuration, not per length** | Fetched by script. |
| `www.formosamarineboats.com.au/wp-json/wp/v2/media` | Formosa's WordPress media library, open to the public | Crawled politely in month windows with back-off on HTTP 429: **1,989 of the 3,341 items** the API reports; the second pass re-paged it five ways and searched 26 model terms, reaching **2,188**, past which the API answers an empty page however it is asked. Many files are named `<year>-<build no>-SRT[-PRO]-<length>-<configuration>-<owner>-<dealer>-<colours>_<frame>.jpg`, which names the exact model. |
| `www.formosamarineboats.com.au/wp-json/wp/v2/posts` + the 31 model-named post pages | Formosa's own reviews and walkthroughs | Each post's `og:image` was taken where the post title names one length **and** one configuration. |
| `www.northsidemarine.com.au/{jeanneau-boats,haines-signature-boats}/listings/<model>/` | The selling dealer's own model listings (25 Jeanneau, 12 Haines) | **Refused to scripts: HTTP 403, Cloudflare.** Read inside a real browser tab: page HTML fetched from within the tab, every candidate measured with `naturalWidth`/`naturalHeight`. Recorded with `refused: true`, `status: 403`. |
| `www.northsidemarine.com.au/formosa-boats/` | — | **Does not exist** (404). The dealer has no Formosa subsite. |
| `press.jeanneau.com` | — | Redirects to the main site; **there is no Jeanneau press or media kit page.** `www.jeanneau.com/press` is 404. |
| `hainessignature.com.au/wp-json/wp/v2/media` | — | Open but returns only 74 of 560 items, all theme furniture (icons, stock banners). No use. |
| `www.formosamarineboats.com.au/build-your-boat/` | Formosa's configurator | Looked at: it is a range picker, not a per-length render engine. It offers nothing per model. |
| `C:\Users\Asaf\dev\HelmLogic\scripts\*.py`, `tasks/test-evidence/IMAGE_AUDIT.md` | The original app's curated maps and 718-URL inventory | Read. The `COLOR_IMAGES` map and the cover maps are **Highfield-only**; the audit's Jeanneau/Haines rows are the same MPF addresses the seed already carries (all 403-blocked). Nothing new for these three brands. |

## Rules applied (honesty first)

- **A picture is attached only to the model its own source names.** For Jeanneau that is the `title` attribute the builder puts on every gallery item and feature block. For Haines it is the file name plus the model page it sits on. For Formosa it is the file name, or the title of the post whose lead picture it is.
- **Formosa's range galleries are filed to the configuration, not to a model.** Formosa's site has one page per hull shape and the length is chosen afterwards, so a picture on `/range/side-consoles/` could be the 495, 525, 565, 595 or 635. Those **82** records carry `model: ""`, a `seedModels` array naming every seed row the page covers, and a `note` ending "A packer must render this only as a configuration picture, never as one model's cover." Filing them to one length would have been inventing a fact. The one exception is `/range/grt-console/`, which carries a single length ("Size: 4.55m") and is therefore a model page.
- **Where a file name and a page disagreed, the pictures decided.** The Haines 620BRX page's gallery is entirely named `550BR_website-*.jpg`. Two of those frames show a deck mat stamped **620BRX**, and the 550BR page's own set (same base names, `-1` suffixes, a visibly different dark-hulled boat with no tower) is a different shoot. The 620BRX set is therefore the 620BRX under a wrong upload name; the note on each record says so.
- **19 Jeanneau addresses are attached to two models each.** They are the files the builder puts in both the 1095 Coupé and 1095 Fly galleries, and both 1295 galleries. Every one was looked at: all 19 are interiors or lower-deck plans, which the Coupé and the Fly genuinely share. No exterior is shared.
- **`kind` was judged by eye, not guessed.** 23 contact sheets were built from the fetched bytes and looked at: all nine Haines model pages, all 85 Jeanneau header and feature-block frames, all 215 Formosa frames, the 19 shared Jeanneau frames, and the Formosa "Vision Cab" / "Half Cabin" sets. `hero` means an exterior or on-water photograph with no title graphic burnt into it. The 167 dealer records are the exception: the host refuses a script, so their frames were never put on a sheet and each says so in its note.
- **Two Formosa naming puzzles were settled with evidence, not a guess.**
  - *Vision Cab.* Formosa's 2019–2021 files call a configuration "Vision Cab"; the current site has no such name. Formosa still serves both side-view renders: `Vision-Cab-Side-View-coloured.webp` and `Centre-Cabin-Side-View-Coloured.webp` draw the same boat (open cabin, targa), while `Enclosed-Centre-Cabin-Side-View.webp` is plainly a different, fully enclosed shape. So "Vision Cab" is read as the Centre Cabin, and every such record says so.
  - *Half Cabin.* Files named only "Half Cabin" (a 2021 SRT PRO 635 and a 715) show an enclosed hardtop cabin, and the current range offers the half cabin only as the Enclosed Half Cabin Hardtop, so they are filed there with a note.
  - Five frames in Formosa's GRT Tiller range gallery (`formosa-grt-tiller-2..6.jpg`) are re-compressions of the named `GCBC-GRT-425-Tiller-*` frames — the same pixel size to the pixel at a smaller byte size — so their model is known and they carry it.
- **22 candidates were deliberately left out**, listed with the reason in the scratch `skipped.json`: 16 addresses the seed already holds, 3 that name a model the seed does not carry (a Formosa 525 X Bowrider and two 595 Enclosed Centre Cabs), and 3 on the dealer's single `543SF` listing, which covers the CC and the SC together and never says which boat is in the frame. The second pass left out about 20 further Formosa addresses; each is named with its reason under "Formosa, second pass".
- **Nothing came from a stock library, a forum, a classified or another dealer.** Every host is the builder's own or Northside Marine's own.

## Formosa, second pass (2026-09-17)

A follow-up asked for the 39 Formosa rows specifically: 24 had no verified hero or render, 19 had no record of any kind, and 75 records were filed on a configuration with no model. What this pass changed:

**The rule the packer must obey, now machine-readable.** Every Formosa record carries a `seedModels` array. Where a record is filed to a model, `seedModels` is that one model. Where it is filed to a configuration, `seedModels` lists every seed row that configuration covers and the `note` ends with "A packer must render this only as a configuration picture, never as one model's cover." **82 records** are in that second class. The test is one line: `seedModels.length > 1` means never a cover. Before this pass the same fact was only in prose.

**The GRT Console range page is a model page, and was being read as a configuration.** Its own text says "Size: 4.55m" and its spec table has one column, so every picture on it depicts the seed's `GRT 455 (Side Console)`. 19 addresses on that page were unrecorded and 3 were filed to the wrong series. The row went from **3 records to 22**, including four on-water heroes, two of them with FORMOSA GRT 455 readable on the hull — and its one previous "hero" turned out to be the wrong boat entirely (below).

**One record was wrong and is gone.** `2016/07/455-side-console-video.jpg` was filed as the hero of `455 (Side Console)`. Looked at: the decal reads "Tomahawk Classic — FORMOSA 455". The Tomahawk is a discontinued range that appears nowhere in the seed, and the GRT 455 is a 2025 model, so a 2016 file cannot show it. Removed.

**Two rows that had nothing now have a picture**, both from a post on Formosa's own site, both looked at before filing, both with the length readable on the hull:

- `565 (X Bowrider)` — `Formosa-SRT565-Blue-TM.jpg` (1,600 × 1,200). Identified by the open cushioned bow, the walk-through windscreen, the twin bolster seats and the Wake Tower, which is the layout Formosa's own X Bowrider page describes. The bow was cropped and enlarged before filing.
- `635 (Centre Console)` — `your-mates-brewing-formosa-srt-p.jpg` (1,280 × 720), the lead picture of Formosa's post "Your Mates Brewing Formosa SRT PRO 635 Boss Console"; the BOSS Console is a Centre Console option on 595 and above. Filed `gallery`, not `hero`: the hull carries a brewery's full wrap, so it shows the model without showing Formosa's livery.

**Four rows that had no hero and no render now have one.** `565 (X Bowrider)` from the new address above; `565 (Centre Cabin)`, `635 (Centre Cabin)` and `635 Enc (Half Cabin)` by re-classing a frame already in the file from `gallery` to `hero` after putting the builds on a contact sheet and looking at them — each of the three is a whole-boat exterior with the length on the hull and no title graphic burnt in, which is this file's own definition of a hero. Three rows still have a model-level record but no hero or render: `635 (Centre Console)`, `635 (Territory)` and `635 Enc (Centre Cabin)`, each of which has only a video thumbnail or a wrapped boat.

**Nine specification sheets added as `plan`.** Formosa's current per-configuration sheets (`2026/05/2026-*_Specification-Sheets.pdf`, linked from each range page as "Download Specs & Measurements") carry one table with a column per length, so each names its models' own measurements while the drawing on it is one boat: filed to the configuration with `seedModels`. Plus `GRT-425_SpecSheet-A4.pdf`, which is model-exact because the 425 is built one way only, and `GRT-455_SpecSheet-A4.pdf`, which is **not**: it is linked from both the GRT Tiller and the GRT Console page and never says which 4.55 m model it describes. Its 2.14 m beam matches the Console page and not the Tiller page's 2.13 m — one centimetre is not evidence, so it stays filed to both.

**About 20 further addresses were found and deliberately not listed**, each for a stated reason:

- `Steve-Atto-525.jpg` (2,000 × 1,500) and `Hope-McMahon-635.png` — fine on-water photographs whose file names give a length and an owner but no configuration; the console in the 525 cannot be read as Side Console rather than Territory with certainty. Both are in the media library only, on no page.
- `GRT-425-render-1.png` (1,920 × 1,440), a clean studio render of the 425 Tiller — it appears on no page of the site, and WordPress attachment pages on this host are unreliable (two of the three tried answered 404), so there is no page to record it against. Same reason for `Aquatic-Weaponry-AustM-White-FINAL.svg`, the reversed cut of the tagline mark.
- `TFG_595cc_DR.jpg` and `-01…-06` (7 files, 800 px) — bare unpainted 595 Centre Console hulls in a yard; the model is named but the boat is unfinished.
- `Formosa-Aluminium-755-top.jpg` (1,920 × 255, a banner crop) and `Formosa-flush-folding-systems4-525.jpg` (a transom detail) — a length but no configuration, and on no page.
- `gcbc-455.png` (966 × 454) and `blog-image-white455video.jpg` (300 × 300) — small, on no page, and "455" alone does not say Tiller or Console.
- `2026/08/495sc-tickle-5.jpg` — a second upload of the 2026/07 photograph already listed.
- `2019/12/Formosa-Specs-Features-755-Half-Cabin.pdf` — its own heading reads "755 LOCKABLE HALF CABIN", which the site's own taxonomy lists as a model distinct from the Enclosed Half Cabin Hardtop. Not the seed's `755 Enc (Half Cabin)`.
- The 2019–2021 "Encl Centre Cab" builds at 595, the 595 Boss Console yard shot, and the 525 X Bowrider walkthrough: real and model-named, but not rows the seed carries, or on no page.

**The dealer was tried again and still refuses.** `www.northsidemarine.com.au/boats/formosa/` answers Cloudflare 403 to a script and to WebFetch alike; the only Formosa thing a search surfaces on that host is a used-boat PDF, which is a listing, not the dealer's model photography. No address is recorded from it here because none was ever seen.

## Jeanneau follow-up (2026-09-17)

A critique of this file said the **DB/43 OB** — `JEA-DB43OB-B2026`, the only DB/43 row the seed carries — held 59 records and not one hero or render, and asked for an exterior feature frame to be re-classed. Both halves were checked against the page itself and the frames were downloaded and looked at. What that found:

**The critique was right that the row had no hero, and wrong about why.** This file said "its page leads with a video rather than a header image". It does not. The DB/43 OB page builds its header as `<div class="box head model cover">` with a CSS `background-image`, where every other Jeanneau model page uses a `js-model-header` `<img>` slide — so the first sweep's parser, which read the slide, saw nothing and the prose recorded a guess. The frame is `app.jeanneau.com/uploads/boat/cover/631225f4d5884717378137.jpg`, **1,920 × 1,280, 668,671 bytes, measured 2026-09-17**: one boat, aerial three-quarter from astern, at rest on open blue water, three outboards and both side terraces in frame. It is now listed as this model's `hero`. The DB/43 IB page carries a different cover (`6312262b…`), so the frame belongs to the OB and not to the range. The TH33, TH38 and DB/37 OB pages were re-fetched to check for the same parser gap: none of them carries a `boat/cover` image at all, so this was one page, not a pattern.

**The frame the critique named is not a hero, and was not re-classed.** The exterior feature block on that page, `exterior/f234de2062e77e79aa5ade40f15eb5c2.jpg`, is titled "DB/43 OB — Living Large on the Exterior" and the page does run it full-bleed. Looked at full size, it is the cockpit — table, terrace, sea beyond — not the boat. Calling it a hero because of how the page lays it out would have been a classification made from markup rather than from the picture. The same file is also published on the DB/43 IB page, so it does not even tell the two hulls apart. Both of its records (the feature-block address and the `hd` gallery copy) now say so.

**Three gallery frames were re-classed `hero` after looking at all 32 exterior frames on a contact sheet**, which is what the critique was reaching for:

- `exterior/hd/7b8c4d4c9bf3c52baf17eeb09a6a3d38.jpg` (1,920 × 1,280) — one boat running side-on in light chop, whole hull, a Mercury cowling and the helm in frame and **DB/43 readable on the topside**, sky above the hardtop for a title.
- `exterior/hd/72278a5a95199350d3fd8c4afcd411c6.jpg` (1,920 × 1,280) — one boat at rest against the Miami skyline, three Mercury 350s, both terraces down, four people at the cockpit table. On-water lifestyle photography of the exact model, which is the first thing this sweep's own rules ask a hero to be.
- `exterior/hd/31c76d82b8e7911b50d6ffd9225e06da.jpg` (1,920 × 1,280) — one boat side-on at cruising speed past a waterfront, whole hull, a third of the frame empty sky.

**Four frames were flagged so nothing promotes them later.** `21ba93d6…`, `673ea04e…`, `254838ed…` and `703ee951…` are three-boat DB range shots off a rocky coast. Which hull in them is the DB/43 cannot be told from the page, so each note now says they stay gallery frames of the range and are never this model's hero.

The DB/43 OB now holds **60 records: 4 hero, 49 gallery, 7 plan**. Every Jeanneau, Merry Fisher and Cap Camarat model in this file now has at least one hero or render; the rows still without one are Formosa's, listed above.

## Counts measured

| | |
|---|---|
| Records | **1,608** (1,589 distinct addresses) |
| Answered 200 with pixel size | **1,432** |
| Refused to scripts (403, recorded anyway, browser-measured) | **167**, all on `northsidemarine.com.au` |
| Dead at origin (404 or worse) | **0** |
| By kind | hero **159** · gallery **1,294** · plan **115** · render **34** · mark **6** |
| By brand | Merry Fisher 586 · Cap Camarat 395 · Formosa 251 · Haines Signature 249 · Jeanneau (DB, TH) 127 |
| By host | app.jeanneau.com 972 · formosamarineboats.com.au 251 · hainessignature.com.au 216 · northsidemarine.com.au 167 · jeanneau.com 2 |
| Content types | jpeg 1,275 · png 83 · webp 71 · pdf 9 · svg 3 (167 dealer records have no content type: the host never served a body) |
| Seed models covered at model level | **58 of 75** |
| Records filed to a configuration rather than a model (all Formosa) | **82**, every one carrying a `seedModels` array |
| Heroes 1,600 px or wider | **144** of 159 |
| Total measured bytes | 584 MB |
| Widest single file | 4,500 × 3,000, Cap Camarat 9.0 WA S2, on the dealer's listing |

Per-model counts are in the scratch `coverage.json`; the short version is that every Jeanneau and Haines model has between 7 and 114 records, and the Formosa model-level count ranges from 1 to 23.

## What is walled or missing

- **Jeanneau's licence is the real constraint, not the pictures.** jeanneau.com serves 971 addresses, unwalled, up to 1,920 px, and titles every one with its model. But the Legal Notice states plainly that the photography belongs to SPBI S.A. and that reproduction is prohibited without authorisation, and there is no press page offering dealer assets. Northside Marine is Jeanneau's dealer and was its 2021 Australian dealer of the year, so the permission almost certainly exists through the importer — **but it has to be asked for, not assumed.** Every Jeanneau record says this in its `licenceNote`.
- **The dealer's site refuses scripts** (Cloudflare 403 on every path, including the image files themselves). 167 records carry `refused: true`. They are worth having: the dealer's own photography of the 620BRX (`N014291_BowRider_620BRX_*`, six frames at 1,620 × 1,080), the 680F and 640F stock shots, and the 2026 TH33 press frames at 2,560 × 1,440, which are the largest Jeanneau files found anywhere. A later packer step needs the browser path or the `mpf-mirror` scheme for these.
- **Formosa still cannot be covered per model from public sources — 17 of the 39 seed rows.** The second pass closed two of the nineteen (565 X Bowrider, 635 Centre Console) and turned the GRT Console page from a configuration into a model, but seventeen rows have no picture anywhere on formosamarineboats.com.au that names that length with that configuration: **455 (Tiller); 595 and 635 Side Console; 525, 675 and 715 Territory; 675, 715 and 755 Centre Console; 715 and 755 X Bowrider; 675 Centre Cabin; 675, 715 and 755 Enc (Centre Cabin); 675 and 755 Enc (Half Cabin).** Ten of those seventeen are the 715 and 755 rows, and **Formosa's current site does not sell them**: every range page and the "browse by size" rail stop at 6.75 m, so no current picture, spec sheet or drawing of a 715 or a 755 exists to be found. The rest are a question for the builder or for Northside Marine's own yard photography, not something a better sweep will fix.
- **Formosa's media API stops short.** It reports 3,341 items. The first pass paged 1,989; the second pass re-paged it five ways (`orderby` id/slug/date, both directions) plus 26 keyword searches and reached **2,188** — the API returns an empty page past that however it is asked, so ~1,150 items are simply not reachable through it. Of the 2,188, only 27 files whose name carries a seed length were not already in this file, and every one of them was judged and either listed or listed here as skipped.
- **Haines Signature has no press page and no SVG logo.** The only mark is `HS_LOGO_WEB_.png` at 1,024 × 396. Its media API is open but exposes only theme furniture.
- **The Merry Fisher 605's listing on the dealer's site carries a 695 file** (`Merry-Fisher-695-Serie2-11.jpeg`); it was dropped, not re-homed.
- **The seed's own 550BR address is a 535BR file** (`535BR_EILDON_15-6-of-9.jpg`, already held). The 535BR is a superseded model. The Haines site's own 550BR set is listed here and should replace it.
- **The Formosa "Tomahawk" gallery** (253 files) is a discontinued range that appears nowhere in the seed. Not listed.
- **`/barra/` on formosamarineboats.com.au returns HTTP 500.** Nothing was lost — the Barra is not in the seed.

## The three best hero candidates per series

Chosen by eye off the contact sheets, not by size alone. Every address below is in the JSON with `kind: "hero"` except the two dealer-site frames that say otherwise: a frame that was never put on a contact sheet is recorded as `gallery`, because the host refuses a script and the picture was never seen.

### Jeanneau — Merry Fisher (8 seed models)

1. `app.jeanneau.com/.../exterior/c08c5f755dde0f5b726fa2464d73cb51.jpg` — 1920 × 1280, **Merry Fisher 605**, anchored in clear water with a paddleboarder. The smallest boat in the range, shot as a day boat rather than a fisher; it is the frame that makes a 6 m hull look like a holiday.
2. `app.jeanneau.com/.../exterior/c255968412ef29e5ed369338fe562eab.jpg` — 1920 × 1280, **1295 Coupé**, three-quarter under way with a coastline behind. The range's flagship, at the range's largest usable size, with the hull line reading end to end.
3. `app.jeanneau.com/.../exterior/b457b8fc49306afa78c78482a18993e9.jpg` — 1920 × 1280, **895 S2**, running with a wake. The 895 is the volume seller in the seed and this is the only frame of it with real motion in it.

### Jeanneau — Merry Fisher Sport (3 seed models)

1. `app.jeanneau.com/.../exterior/858c70381c04ab5fbcb38b0a566cfe76.jpg` — 1920 × 1280, **895 Sport**, running. The newest boat of the three (2026) and the one whose sport profile is clearest side-on.
2. `app.jeanneau.com/.../exterior/c451753b9221a472f849164efab496e2.jpg` — 1920 × 1280, **695 Sport S2**, at anchor by a headland. Reads as a weekend boat, which is what separates Sport from the cabin Merry Fishers.
3. `app.jeanneau.com/.../exterior/e5313a44567455776e37a75b228cc25c.jpg` — 1920 × 1280, **795 Sport S2**, running three-quarter. Fills the middle of the range; the same water and light as the other two, so the three sit together.

### Jeanneau — Cap Camarat Center Console (5 seed models)

1. `app.jeanneau.com/.../exterior/6e08c396da8fae59bca735a44b8d9623.jpg` — 1920 × 1440, **9.0 CC S2**, the tallest frame in the whole sweep and the only 4:3 hero; good for a portrait tile.
2. `app.jeanneau.com/.../exterior/07f29241aff50fcb70f93def92c08959.jpg` — 1920 × 1281, **5.5 CC Series 2**, the entry boat. The 5.5's model page has no gallery at all, so this feature-block frame is the only decent picture of it that exists on jeanneau.com.
3. `app.jeanneau.com/.../exterior/def25fe4321faff2cb26b94fe6195210.jpg` — 1920 × 1280, **6.5 CC Series 3**, anchored in turquoise water. The 6.5 has five heroes, more than any other Cap Camarat, and this is the calmest of them.

### Jeanneau — Cap Camarat Walk Around (6 seed models)

1. `northsidemarine.com.au/.../Cap-Camarat-9.0-WA-Serie2-3.png` — **4,500 × 3,000**, **9.0 WA S2**. The largest file found anywhere in this sweep, on the dealer's own listing. Recorded as `gallery`, not `hero`: the host refuses a script, so the frame was measured in a browser but never looked at. Worth the browser or mirror path on its own.
2. `app.jeanneau.com/.../exterior/9b15efbe44500eb709dd08a0e9f17ee7.jpg` — 1920 × 1280, **12.5 WA**, the range flagship, aerial at anchor.
3. `app.jeanneau.com/.../interior/52d8b08a47f855af2c19567984e32c50.jpg` — 1920 × 1485, **5.5 WA Series 2**. Filed under Jeanneau's `interior` folder but it is an exterior; like the 5.5 CC, the 5.5 WA page has no gallery and this is the only usable frame of the boat.

### Jeanneau — DB Yachts (2 seed models)

1. `app.jeanneau.com/uploads/boat/cover/631225f4d5884717378137.jpg` — 1920 × 1280, **DB/43 OB**, aerial three-quarter from astern, at rest on open blue water with both side terraces out. The frame the model page itself leads with, found by the follow-up above; the flagship of the two seed rows, and the only frame here that shows what a beach club is.
2. `app.jeanneau.com/.../exterior/hd/7b8c4d4c9bf3c52baf17eeb09a6a3d38.jpg` — 1920 × 1280, **DB/43 OB**, running side-on in light chop with DB/43 readable on the topside, sky above the hardtop to set a title in.
3. `app.jeanneau.com/.../exterior/ef708f99ea9fe463c52250c1039370d7.jpg` — 1920 × 1221, **DB/37 OB**, stern-quarter with the beach club open. The DB/37's own page header slide (`7ac19fa2…`, 1920 × 1080, running in clear water) is the next one after it.

Also `hero` on the DB/43 after the follow-up: `72278a5a…` (at rest against the Miami skyline, terraces down, four people at the table — the lifestyle frame) and `31c76d82…` (the calm waterfront cruise, a third of the frame empty sky). Avoid `21ba93d6…`, `673ea04e…`, `254838ed…` and `703ee951…`: three DB hulls run together in each and which one is the 43 cannot be told. The dealer's `Jeanneau-DB4325.jpg` (1920 × 1280, 403-blocked, never seen by eye) stays `gallery` for that reason.

### Jeanneau — TH (2 seed models)

1. `northsidemarine.com.au/.../TH33_IMAGE_EXTERIOR-3@1920×1080-scaled.jpg` — **2,560 × 1,440**, **TH33**. The 2026 press frame, the largest Jeanneau file in the sweep. 403 to scripts.
2. `northsidemarine.com.au/.../TH33_IMAGE_LIFESTYLE-13@1920×1080-scaled.jpg` — 2,560 × 1,440, **TH33**, the lifestyle cut of the same shoot.
3. `app.jeanneau.com/.../exterior/0d10fd5ed02f0955e9d1b7dc02f8058f.jpg` — 1920 × 1080, **TH38**, at anchor. The TH38 has only two heroes; this is the wider of them.

### Haines Signature — Fisher Series (5 seed models)

1. `hainessignature.com.au/.../680F_Website-15.jpg` — 2,500 × 1,667, **680F**, running past a foreshore in late light. The best-lit frame Haines has of any boat.
2. `hainessignature.com.au/.../525F_Website-20-scaled.jpg` — **2,560 × 1,600**, **525F**, running with the driver visible in flat grey light against open water, so the whole hull line reads with nothing behind it.
3. `hainessignature.com.au/.../640F_Website-22-scaled.jpg` — 2,560 × 1,600, **640F**, straight down from above on dark green water. The only aerial in the Haines library, and it makes the beam of a 640 obvious in a way a side-on never does.

### Haines Signature — Sports Fisher Series (2 seed models)

1. `hainessignature.com.au/.../543SF_SC_WEBSITE-22-scaled.jpg` — 2,560 × 1,600, **543SF SC**, running hard, bow up, offshore. The only Haines frame with real spray in it.
2. `hainessignature.com.au/.../543SF_SC_WEBSITE-20-scaled.jpg` — 2,560 × 1,600, **543SF SC**, running toward camera.
3. `hainessignature.com.au/.../543SF_CC_WEBSITE-12-scaled.jpg` — 2,560 × 1,600, **543SF CC**. The CC shoot never went on the water: every one of its 22 frames is in the yard or on a trailer. This is the best three-quarter of them, and the gap is worth telling the owner about.

### Haines Signature — Bow Rider Series (2 seed models)

1. `hainessignature.com.au/.../550BR_website-22-scaled.jpg` — 2,560 × 1,600, **620BRX**, running with a rider on the tower. (File named `550BR_*`; see the rule above — it is the 620BRX.)
2. `hainessignature.com.au/.../550BR_website-26-scaled.jpg` — 2,560 × 1,600, **620BRX**, beached at the water's edge.
3. `hainessignature.com.au/.../550BR_website-27-scaled.jpg` — 2,560 × 1,600, **550BR**, on the trailer at a marina. The 550BR set is smaller and quieter than the BRX set; this is its strongest frame.

### Formosa — the nine configurations

Formosa is the only brand here whose heroes belong to a configuration rather than a model, except where noted. Revised by the second pass; the model-named picks below were all looked at before being filed.

- **GRT Tiller** (425, 455) — `GCBC-GRT-425-Tiller-take-off.jpg` (1,919 × 1,080), `-planing.jpg` (1,917 × 845), `-planing-3.jpg` (1,885 × 932). All three are the **GRT 425 Tiller** by name, all on the water, all shot in the same session. The best-documented small boat in the whole Formosa range. **The 455 Tiller has nothing of its own.**
- **GRT Console** (455 only) — `GRT455_Tangalooma.jpg` (1,920 × 1,440), on the water at Tangalooma with the hull decal reading FORMOSA GRT 455; `GRT-Gold-Coast-Boating-Centre-2.jpg` (1,920 × 1,081), under way on the river, same decal; `-3.jpg` (1,920 × 1,079), from astern under way. **Every one is the 455 Side Console**, because this range page carries one length only.
- **SRT Side Console** (495, 525, 565, 595, 635) — `SRT-Side-Console-5.webp` (1,698 × 1,274, configuration), then the **495**'s three 2026 colourway renders (`FM_495-Side-Con_Formosa-{Basalt,Lightbox-Grey,White}-Interrior.jpg`, 1,600 × 900 each), then `take-a-look-at-the-formosa-srt-5.jpg` (1,280 × 720), a **565** by post title. The 595 and the 635 have nothing.
- **SRT Territory** (525–715) — `formosa-territory-3.webp` and `-4.webp` (1,920 × 1,440 each, configuration; one is a man fishing off the bow at anchor, the other a bow-on at dusk with the lights on), then `2020-SRT-565-Territory-grey-NT-0649.jpg` (1,920 × 1,080), a **565 Territory** by name — the only model-named Territory exterior at full size.
- **SRT Centre Console** (525–755) — `Formosa-SRT565_White-TM.jpg` (1,920 × 1,440, a **565** three-quarter in the dealer's shed, decal readable), `565-CentreConsole-GCBC.png` (1,920 × 1,142, a **565** aerial on the water), `2020-SRT-PRO-595-Centre-Console-Aquatic-Weaponry-BOSS-Console-9368.jpg` (1,920 × 1,080, a **595** under way).
- **SRT X Bowrider** (565–755) — `bowrider-5.webp` (1,920 × 1,440, configuration), `Formosa-SRT565-Blue-TM.jpg` (1,600 × 1,200, a **565 X Bowrider** — the only picture of that row anywhere public), `gcbc-demo-xbow-thumbnail.jpg` (1,513 × 755), a **635 X Bowrider** by post title.
- **SRT Centre Cabin** (565–675) — `2021-706-SRT-PRO-635-Vision-Cab-…_9054.jpeg` (1,920 × 1,440, a **635** three-quarter forward on its trailer), `FormosaMarine-SRT565-CentreCab-White-TM.jpg` (1,920 × 1,440, a **565** three-quarter, decal readable), `formosa-centre-cabin-3.webp` (1,920 × 1,280, configuration, running past a cliff). The 675 has nothing.
- **SRT Enclosed Centre Cabin** (635–755) — `enclosed-centre-cabin-3.webp`, `-2-1.webp` and `-4.webp`, all 1,920 × 1,280, all configuration. **No model-named exterior exists for any of the four seed rows**; the 635's only record is a video thumbnail.
- **SRT Enclosed Half Cabin** (635–755) — `F715HC_14_of_25.jpg` and `F715HC_17_of_25.jpg` (1,920 × 1,280 each), a **715 Enclosed Half Cabin** by name and the best Formosa photography in the sweep; then `2021-635-SRT-PRO-635-Half-Cabin-Fuller-…_8869.jpeg` (1,920 × 1,440), a **635** three-quarter aft on its trailer.

## Brand marks

| Brand | File | Size | Note |
|---|---|---|---|
| Jeanneau | `www.jeanneau.com/build/images/jeanneau.28385aff.svg` | SVG | Served from the site's own stylesheet. A reversed white cut (`jeanneau-white.0bcc2a63.svg`) is also listed. Legal Notice 5.2 reserves the mark to SPBI S.A. |
| Haines Signature | `hainessignature.com.au/wp-content/uploads/2026/03/HS_LOGO_WEB_.png` | 1,024 × 396 PNG | The only logo file on the site; no SVG is served. |
| Formosa | `www.formosamarineboats.com.au/wp-content/uploads/2024/10/formosa-logo.png` and `.../2024/09/FORMOSA_Aluminium-Plate-Boats-BLACK_LOGO_1000px.png` | PNG | Footer mark and the black lockup with the "Aluminium Plate Boats" line. The Formosa wordmark itself is published as PNG only. |
| Formosa | `.../2026/07/Aquatic-Weaponry-AustM-FINAL.svg` | 1,225 × 388 SVG | Found by the second pass on `/comparison-guide/`, correcting the first pass's "no SVG": it is the **"Aquatic Weaponry™ / Australian Made" tagline lockup**, not the Formosa wordmark. Rendered and looked at before filing. |

## What to do next, in order

1. **Ask the importer about Jeanneau.** 971 addresses are ready and titled; the only thing standing between them and the app is a sentence of permission. Everything else here is a smaller problem.
2. **Get the dealer site out from behind Cloudflare** for the packer — the `mpf-mirror` scheme or a browser fetch. 167 records, including the two largest Jeanneau files and the dealer's own 620BRX shoot, depend on it.
3. **Ask Northside Marine for Formosa photography.** 17 of the 39 Formosa rows cannot be covered per model from anything Formosa publishes, and Formosa shoots per configuration on purpose. The dealer's yard is the only place a 755 Centre Console or a 675 Enclosed Half Cabin is going to be photographed with its length known — and for the ten 715 and 755 rows it is the only place at all, because Formosa's current site stops at 6.75 m.
4. **Teach the packer the `seedModels` rule before it renders a Formosa cover.** 82 Formosa records are configuration pictures; rendering one as a model's cover would break the exact-model rule on every one of the 17 rows above. `seedModels.length > 1` is the test.
5. **Ask Formosa whether the 715 and 755 are still built.** Ten seed rows are lengths the builder no longer lists. If they are gone, the honest answer for those rows is an empty state, not a picture.
6. **Replace the seed's 550BR address** (`535BR_EILDON_15-6-of-9.jpg`) — it is a 535BR, a superseded model.
