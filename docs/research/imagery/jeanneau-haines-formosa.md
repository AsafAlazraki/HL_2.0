# Jeanneau, Haines Signature and Formosa imagery sweep (2026-09-17)

Companion to `jeanneau-haines-formosa.json` (**1,573 records, 1,554 distinct addresses**). Every address in the JSON was requested over HTTP on 2026-09-17; `status`, `contentType`, `bytes`, `width` and `height` are what the request returned, not what a page claimed. The 167 records on the dealer's own site answer a script with 403, so their pixel sizes were measured inside a real browser tab with `naturalWidth`/`naturalHeight` and they carry `refused: true` and no byte size. Nothing was downloaded into `public/`.

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
| `www.formosamarineboats.com.au/wp-json/wp/v2/media` | Formosa's WordPress media library, open to the public | Crawled politely in month windows with back-off on HTTP 429: **1,989 of the 3,341 items** the API reports. Many files are named `<year>-<build no>-SRT[-PRO]-<length>-<configuration>-<owner>-<dealer>-<colours>_<frame>.jpg`, which names the exact model. |
| `www.formosamarineboats.com.au/wp-json/wp/v2/posts` + the 31 model-named post pages | Formosa's own reviews and walkthroughs | Each post's `og:image` was taken where the post title names one length **and** one configuration. |
| `www.northsidemarine.com.au/{jeanneau-boats,haines-signature-boats}/listings/<model>/` | The selling dealer's own model listings (25 Jeanneau, 12 Haines) | **Refused to scripts: HTTP 403, Cloudflare.** Read inside a real browser tab: page HTML fetched from within the tab, every candidate measured with `naturalWidth`/`naturalHeight`. Recorded with `refused: true`, `status: 403`. |
| `www.northsidemarine.com.au/formosa-boats/` | — | **Does not exist** (404). The dealer has no Formosa subsite. |
| `press.jeanneau.com` | — | Redirects to the main site; **there is no Jeanneau press or media kit page.** `www.jeanneau.com/press` is 404. |
| `hainessignature.com.au/wp-json/wp/v2/media` | — | Open but returns only 74 of 560 items, all theme furniture (icons, stock banners). No use. |
| `www.formosamarineboats.com.au/build-your-boat/` | Formosa's configurator | Looked at: it is a range picker, not a per-length render engine. It offers nothing per model. |
| `C:\Users\Asaf\dev\HelmLogic\scripts\*.py`, `tasks/test-evidence/IMAGE_AUDIT.md` | The original app's curated maps and 718-URL inventory | Read. The `COLOR_IMAGES` map and the cover maps are **Highfield-only**; the audit's Jeanneau/Haines rows are the same MPF addresses the seed already carries (all 403-blocked). Nothing new for these three brands. |

## Rules applied (honesty first)

- **A picture is attached only to the model its own source names.** For Jeanneau that is the `title` attribute the builder puts on every gallery item and feature block. For Haines it is the file name plus the model page it sits on. For Formosa it is the file name, or the title of the post whose lead picture it is.
- **Formosa's range galleries are filed to the configuration, not to a model.** Formosa's site has one page per hull shape and the length is chosen afterwards, so a picture on `/range/side-consoles/` could be the 495, 525, 565, 595 or 635. Those 75 records carry `model: ""` and a `note` that names every seed model the page covers. Filing them to one length would have been inventing a fact.
- **Where a file name and a page disagreed, the pictures decided.** The Haines 620BRX page's gallery is entirely named `550BR_website-*.jpg`. Two of those frames show a deck mat stamped **620BRX**, and the 550BR page's own set (same base names, `-1` suffixes, a visibly different dark-hulled boat with no tower) is a different shoot. The 620BRX set is therefore the 620BRX under a wrong upload name; the note on each record says so.
- **19 Jeanneau addresses are attached to two models each.** They are the files the builder puts in both the 1095 Coupé and 1095 Fly galleries, and both 1295 galleries. Every one was looked at: all 19 are interiors or lower-deck plans, which the Coupé and the Fly genuinely share. No exterior is shared.
- **`kind` was judged by eye, not guessed.** 23 contact sheets were built from the fetched bytes and looked at: all nine Haines model pages, all 85 Jeanneau header and feature-block frames, all 215 Formosa frames, the 19 shared Jeanneau frames, and the Formosa "Vision Cab" / "Half Cabin" sets. `hero` means an exterior or on-water photograph with no title graphic burnt into it. The 167 dealer records are the exception: the host refuses a script, so their frames were never put on a sheet and each says so in its note.
- **Two Formosa naming puzzles were settled with evidence, not a guess.**
  - *Vision Cab.* Formosa's 2019–2021 files call a configuration "Vision Cab"; the current site has no such name. Formosa still serves both side-view renders: `Vision-Cab-Side-View-coloured.webp` and `Centre-Cabin-Side-View-Coloured.webp` draw the same boat (open cabin, targa), while `Enclosed-Centre-Cabin-Side-View.webp` is plainly a different, fully enclosed shape. So "Vision Cab" is read as the Centre Cabin, and every such record says so.
  - *Half Cabin.* Files named only "Half Cabin" (a 2021 SRT PRO 635 and a 715) show an enclosed hardtop cabin, and the current range offers the half cabin only as the Enclosed Half Cabin Hardtop, so they are filed there with a note.
  - Five frames in Formosa's GRT Tiller range gallery (`formosa-grt-tiller-2..6.jpg`) are re-compressions of the named `GCBC-GRT-425-Tiller-*` frames — the same pixel size to the pixel at a smaller byte size — so their model is known and they carry it.
- **22 candidates were deliberately left out**, listed with the reason in the scratch `skipped.json`: 16 addresses the seed already holds, 3 that name a model the seed does not carry (a Formosa 525 X Bowrider and two 595 Enclosed Centre Cabs), and 3 on the dealer's single `543SF` listing, which covers the CC and the SC together and never says which boat is in the frame.
- **Nothing came from a stock library, a forum, a classified or another dealer.** Every host is the builder's own or Northside Marine's own.

## Counts measured

| | |
|---|---|
| Records | **1,573** (1,554 distinct addresses) |
| Answered 200 with pixel size | **1,406** |
| Refused to scripts (403, recorded anyway, browser-measured) | **167**, all on `northsidemarine.com.au` |
| Dead at origin (404 or worse) | **0** |
| By kind | hero **146** · gallery **1,283** · plan **106** · render **33** · mark **5** |
| By brand | Merry Fisher 586 · Cap Camarat 395 · Haines Signature 249 · Formosa 217 · Jeanneau (DB, TH) 126 |
| By host | app.jeanneau.com 971 · hainessignature.com.au 216 · formosamarineboats.com.au 217 · northsidemarine.com.au 167 · jeanneau.com 2 |
| Content types | jpeg 1,250 · png 83 · webp 71 · svg 2 |
| Seed models covered at model level | **56 of 75** |
| Records filed to a configuration rather than a model (all Formosa) | **75** |
| Heroes 1,600 px or wider | **131** of 146 |
| Total measured bytes | 552 MB |
| Widest single file | 4,500 × 3,000, Cap Camarat 9.0 WA S2, on the dealer's listing |

Per-model counts are in the scratch `coverage.json`; the short version is that every Jeanneau and Haines model has between 7 and 114 records, and the Formosa model-level count ranges from 1 to 23.

## What is walled or missing

- **Jeanneau's licence is the real constraint, not the pictures.** jeanneau.com serves 971 addresses, unwalled, up to 1,920 px, and titles every one with its model. But the Legal Notice states plainly that the photography belongs to SPBI S.A. and that reproduction is prohibited without authorisation, and there is no press page offering dealer assets. Northside Marine is Jeanneau's dealer and was its 2021 Australian dealer of the year, so the permission almost certainly exists through the importer — **but it has to be asked for, not assumed.** Every Jeanneau record says this in its `licenceNote`.
- **The dealer's site refuses scripts** (Cloudflare 403 on every path, including the image files themselves). 167 records carry `refused: true`. They are worth having: the dealer's own photography of the 620BRX (`N014291_BowRider_620BRX_*`, six frames at 1,620 × 1,080), the 680F and 640F stock shots, and the 2026 TH33 press frames at 2,560 × 1,440, which are the largest Jeanneau files found anywhere. A later packer step needs the browser path or the `mpf-mirror` scheme for these.
- **Formosa cannot be covered per model from public sources.** 19 of the 39 seed rows have no picture anywhere on formosamarineboats.com.au that names that length with that configuration: 455 (Tiller); 595 and 635 Side Console; 525, 675 and 715 Territory; 635, 675, 715 and 755 Centre Console; 565, 715 and 755 X Bowrider; 675 Centre Cabin; 675, 715 and 755 Enc (Centre Cabin); 675 and 755 Enc (Half Cabin). All 19 are covered at their configuration, and the configuration's own side-view render exists for every one. This is a question for the builder or for Northside Marine's own yard photography, not something a better sweep will fix.
- **Formosa's media API stops short.** It reports 3,341 items and served 1,989 before refusing further paging even with a 2.5 s delay and back-off. A second pass on another day would add ~1,350 more, some of which may name further models.
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

1. `app.jeanneau.com/.../exterior/ef708f99ea9fe463c52250c1039370d7.jpg` — 1920 × 1221, **DB/37 OB**, stern-quarter with the beach club open.
2. `app.jeanneau.com/.../exterior/7ac19fa2e3edbb90d6a73a068e241155.jpg` — 1920 × 1080, **DB/37 OB**, running in clear water — the page header slide.
3. The **DB/43 OB has no hero**: its page leads with a video rather than a header image, and all 52 of its frames are gallery or plan. The dealer's `Jeanneau-DB4325.jpg` (1920 × 1280, 403-blocked) is the best DB/43 exterior found.

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

Formosa is the only brand here whose heroes belong to a configuration rather than a model, except where noted.

- **GRT Tiller** — `GCBC-GRT-425-Tiller-take-off.jpg` (1,919 × 1,080), `-planing.jpg` (1,917 × 845), `-planing-3.jpg` (1,885 × 932). All three are the **GRT 425 Tiller** by name, all on the water, all shot in the same session. The best-documented small boat in the whole Formosa range.
- **GRT Console** — the only hero is `455-side-console-video.jpg` (1,000 × 500), the **GRT 455 Side Console**. There is nothing else; the GRT Console range page carries four images in total.
- **SRT Side Console** — `SRT-Side-Console-5.webp` (1,698 × 1,274, configuration), then `525-side-console-good-times-mari.jpg` and `take-a-look-at-the-formosa-srt-5.jpg` (1,280 × 720 each, the **525** and the **565** by post title). The configuration frame is the only one above 1,300 px.
- **SRT Territory** — `formosa-territory-3.webp` and `-4.webp` (1,920 × 1,440 each, configuration; one is a man fishing off the bow at anchor, the other a bow-on at dusk with the lights on), then `2020-SRT-565-Territory-grey-NT-0649.jpg` (1,920 × 1,080), a **565 Territory** by name.
- **SRT Centre Console** — `565-CentreConsole-GCBC.png` (1,920 × 1,142, a **565** aerial on the water), `2020-SRT-PRO-595-Centre-Console-Aquatic-Weaponry-BOSS-Console-9368.jpg` (1,920 × 1,080, a **595** under way), `formosa-srt-centre-console-4.webp` (1,920 × 1,080, configuration).
- **SRT X Bowrider** — `bowrider-5.webp` (1,920 × 1,440) and `bowrider-4.webp` (1,920 × 1,280), both configuration; then `gcbc-demo-xbow-thumbnail.jpg` (1,513 × 755), the lead picture of Formosa's own "Formosa SRT 635 X Bowrider | Walkthrough", so a **635 X Bowrider**.
- **SRT Centre Cabin** — `formosa-centre-cabin-3.webp` (1,920 × 1,280, running past a cliff) and `-10.webp` (1,920 × 1,280); the only model-named hero is `formosa-srt-pro-595-centre-cab-f.jpg` (1,280 × 720), a **595**.
- **SRT Enclosed Centre Cabin** — `enclosed-centre-cabin-3.webp`, `-2-1.webp` and `-4.webp`, all 1,920 × 1,280, all configuration. No model-named exterior exists for any of the four seed rows.
- **SRT Enclosed Half Cabin** — `F715HC_14_of_25.jpg` and `F715HC_17_of_25.jpg` (1,920 × 1,280 each), a **715 Enclosed Half Cabin** by name and the best Formosa photography in the sweep; then `formosa-half-cabin-hardtop-2.webp` (1,920 × 1,080, configuration).

## Brand marks

| Brand | File | Size | Note |
|---|---|---|---|
| Jeanneau | `www.jeanneau.com/build/images/jeanneau.28385aff.svg` | SVG | Served from the site's own stylesheet. A reversed white cut (`jeanneau-white.0bcc2a63.svg`) is also listed. Legal Notice 5.2 reserves the mark to SPBI S.A. |
| Haines Signature | `hainessignature.com.au/wp-content/uploads/2026/03/HS_LOGO_WEB_.png` | 1,024 × 396 PNG | The only logo file on the site; no SVG is served. |
| Formosa | `www.formosamarineboats.com.au/wp-content/uploads/2024/10/formosa-logo.png` and `.../2024/09/FORMOSA_Aluminium-Plate-Boats-BLACK_LOGO_1000px.png` | PNG | Footer mark and the black lockup with the "Aluminium Plate Boats" line. No SVG. |

## What to do next, in order

1. **Ask the importer about Jeanneau.** 971 addresses are ready and titled; the only thing standing between them and the app is a sentence of permission. Everything else here is a smaller problem.
2. **Get the dealer site out from behind Cloudflare** for the packer — the `mpf-mirror` scheme or a browser fetch. 167 records, including the two largest Jeanneau files and the dealer's own 620BRX shoot, depend on it.
3. **Ask Northside Marine for Formosa photography.** 19 of the 39 Formosa rows cannot be covered per model from anything Formosa publishes, and Formosa shoots per configuration on purpose. The dealer's yard is the only place a 755 Centre Console or a 675 Enclosed Half Cabin is going to be photographed with its length known.
4. **Re-run the Formosa media crawl on another day** for the ~1,350 items its API would not page through; a few of them will name further models.
5. **Replace the seed's 550BR address** (`535BR_EILDON_15-6-of-9.jpg`) — it is a 535BR, a superseded model.
