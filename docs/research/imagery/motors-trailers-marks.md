# Motors, trailers and brand marks — imagery sweep (2026-09-17)

Companion to `motors-trailers-marks.json` (**514 records**). Every address in the JSON was requested on 2026-09-17; `status`, `contentType`, `bytes`, `width` and `height` are what that request returned and what `sharp` read out of the bytes — not what a page claimed. Nothing was downloaded into `public/`. No address already held in `tools/seed/legacy/extracts/images.json` is re-listed (checked: **0 overlaps**).

**Second pass, same day — Mercury.** The first pass left Mercury as one white wordmark and no product picture, because `shop.mercurymarine.com` answers a script 403. A real browser is not refused. Twenty-one records were added: twenty product renders — eight of them white colourway frames, and three of them on a CMS host that *does* answer a script — and the dark-ink wordmark for a light ground. Where a record says `refused: true` and still carries a pixel size, the file was opened in a browser tab on the host's own origin and measured there; `bytes` and `contentType` are deliberately left empty on those, because no body was ever served to a script, and the browser-measured byte size is written into the record's `note` instead of into a field that means "what the request returned".

**Third pass, same day — Yamaha.** The first pass left the largest brand in the file with one record: a logo. It had measured the 45 addresses the price file already carries, found nothing better on `yamaha-motor.com.au`, and stopped there. It stopped one site too early. **`yamahaoutboards.com` is Yamaha Motor Corporation, U.S.A.'s own outboard site, its `robots.txt` disallows only `/error` and `/page-not-found`, and it publishes the same engines under the same model codes the Australian price file uses.** 318 records were added from it: 233 on-water photographs at 1463×844, 82 colourway renders, and three vector brand marks. Every one of the 18 Yamaha rows that carries no Image Link at all now has a picture, including the four XTO Offshore 425s in white that the first pass called unobtainable.

Scope: the Motor Library's two motor suppliers (Yamaha, ePropulsion) and the Mercury engines the Jeanneau factory-package rows name; the six trailer brands (Redco, Tinka, GFAB, Stacer, Dunbier, Mackay, plus the NSM Custom band); and a brand mark for every brand in the seed plus the dealership's own.

## What each source turned out to be

| Source | What it is | How it was read |
|---|---|---|
| `www.epropulsion.com` | ePropulsion's own site (Joomla/YOOtheme). **Its `/parts-database` page is the find of this sweep**: every product card carries `data-part="…"` and `data-name="…"` next to its render, so a picture can be tied to a seed row by the manufacturer's own part number rather than by resemblance. | Fetched by script. 470 product cards parsed; 466 carry a render. The `_320.png` the page draws is a thumbnail — the unsuffixed master at the same path answers at 800–2160 px, and that is what is recorded. `robots.txt` allows everything outside `/administrator/`, `/api/`, `/cache/` and the like. |
| `www.yamaha-motor.com.au` | Yamaha Motor Australia. | **Not crawled, in either pass.** Its HTML answers a 212-byte Imperva/Incapsula shell to a scripted client, and its `robots.txt` names `AgenticBot`, `GPTBot` and `CCBot` with `Disallow: /`. Only `robots.txt`, the sitemap it advertises, and the **45 media-handler addresses the price file itself points at** were read; 22 of those 45 were re-fetched in the third pass to compare colourways by eye. **No path on this host was guessed and no browser was driven through it.** One of the 45 was also asked for `?w=2400`, `?mw=2400` and `?h=1800&w=2400`: the handler returns the identical 800×600 bytes every time, so 800×600 is the stored asset and there is no larger Australian version to ask for. |
| **`yamahaoutboards.com`** | **Yamaha Motor Corporation, U.S.A.'s own outboard site** — the manufacturer's own site, not a dealer's. `robots.txt`: `Disallow: /error`, `Disallow: /page-not-found`, nothing else. | Fourteen model-family pages fetched by script (every page under `/outboards/` in its sitemap). Each is a Kentico site that serves its whole media library from `/getmedia/<guid>/<filename>`, server-rendered, with the model number written into the file name by Yamaha. 638 distinct assets were pulled out, every one requested and measured. |
| `global.yamaha-motor.com` | Yamaha Motor Co., Ltd.'s global corporate site. `robots.txt` has no general disallow. | The brand identity PNG was taken from here in the first pass. |
| `www.yamaha-motor.eu` | Yamaha Motor Europe. `robots.txt` allows the marine pages. | **Read far enough to be ruled out.** It is an AEM React SPA: the marine-engine pages return 11 KB of shell, the `.model.json` export carries only segment headers, and the product list comes from an endpoint the page never names. Its DAM renditions top out at 1900 px. Nothing was taken; a browser pass could still be worth it if Europe-only models ever matter. |
| `www.mercurymarine.com` | Mercury Marine's own Australian and US sites. Cloudflare answers **403** to every scripted request for a page, including `robots.txt` — but **`/content/dam/…` is open**: the branding PNG and the 15.2 MB *Mercury Marine Outboard Brochure 2025* both answer 200 to a script. `/content/experience-fragments/…` (where the model galleries live) does not. | Six model pages opened in a real browser (Playwright): Verado 350-400hp and 250-300hp, FourStroke 175-225hp and 250-300hp, AU and US. Image addresses read off the live DOM, the per-rating colour lists read out of Mercury's own spec tables, and every file measured by fetching it from its own origin inside that browser. |
| `shop.mercurymarine.com` | Mercury's own commerce host. Every product render the model pages draw is served from here. | **403 to a script, every time, every path.** Seventeen renders are recorded with `refused: true` and a browser-measured pixel size. The host transcodes: an address ending `.png?format=jpeg` is served as `image/webp`. |
| `configurator.mercurymarine.com.au` | **Mercury Marine's own Australian engine configurator**, linked from each Australian model page as "Try our Engine Configurator"; footer: "© 2026 Mercury Marine. All Rights Reserved … Mercury Marine is a division of Brunswick Corporation." | 403 to a script for its own files (the two wordmarks), so both were read in the browser. Its per-range pages were read for the render Mercury shows against each range, and its Nuxt payload was resolved for the declared pixel sizes. |
| `www.datocms-assets.com` | The CMS host that configurator serves its pictures from. | **Open to a script — 200.** This is the only route by which a Mercury product render can be fetched today without a browser: three are recorded and were measured by the tool itself. |
| `mayfairmarine.com.au` | **Mayfair Marine 2000 is the maker and distributor of Redco and Tinka** — the same Rocklea address and `info@mayfairmarine.com.au` the brand publishes — and is the supplier named on every Redco/Tinka row of the price file. So this is a manufacturer site, not a dealer listing. | 13 model pages fetched by script; each is headed with the model codes it covers. |
| `dunbier.com` | Dunbier Marine Products' own site (WordPress + WooCommerce). Its WP REST API is open. | Series pages fetched; `wp-json/wp/v2/media` read at both ends of the ordering (the endpoint caps a page at 99, so `order=asc` and `order=desc` were both taken: 198 items). The 2026 `dlm_uploads/` files are the prize — see *Dunbier*. |
| `mackaytrailers.com` | **Mackay Multi-Link's own site.** Not to be confused with `mackaytrailers.com.au`, which is a Queensland retailer that describes itself as "a Mackay Multilink authorised dealer" — another dealer's listings, so nothing was taken from it. | Five series pages fetched; `wp-json/wp/v2/media` read (95 items). |
| `www.gfabtrailers.com.au` | GFAB's own Australian site (`gfab.co.nz` serves the identical assets). | Seven product pages fetched. GFAB writes the boat that sits on each trailer into the `alt` and `title` of every picture, which is what makes the model attribution possible. Its size folders (`500X300`, `320X230`, `100X60`) sit beside an **unsized original** at the parent path — measured at 1000×667 to 1920×1440 — and the original is what is recorded. |
| `www.stacer.com.au` | Stacer's (Telwater's) own Aluminium Boat Trailers page. `robots.txt`: `Allow: /`. | Fetched; only the three package files the seed has never fetched are recorded. |
| `www.northsidemarine.com.au` | The dealer's own site and its `stacer-boats` subsite. | **Refused.** Every request from this session answered `403` (Cloudflare), `robots.txt` included. Three of the dealership’s own mark files are recorded with `refused: true`; two of them carry a size an earlier browser pass measured (both 800×400), the third nothing. |

## Motors

### Yamaha — 238 seed rows, 1 record before the third pass, 319 now

**What the first pass got right.** The plan says Yamaha's `.ashx` addresses are "walled to scripts". They are not. All **45** distinct `www.yamaha-motor.com.au/-/media/...ashx` addresses the price file carries answered `200` with a readable image, every one 800×600. The wall is on the HTML pages (Imperva/Incapsula), not on the media handler. Those 45 files cover 220 of the 238 rows whose supplier column says `Yamaha`, and because the seed already holds all 45, none of them is re-listed.

**What the first pass got wrong.** It concluded from that that Yamaha had nothing more to give — no on-water photography, nothing above 800×600, no address for the rows with none — and left the largest brand in the file with a single record, a logo. The conclusion was drawn from one Yamaha site. There are several, and one of them is open.

**`yamahaoutboards.com` is Yamaha Motor Corporation, U.S.A.'s own outboard site.** Its `robots.txt` disallows `/error` and `/page-not-found` and nothing else. Its fourteen model-family pages are server-rendered, and every picture on them is served from `/getmedia/<guid>/<filename>` with **the model number written into the file name by Yamaha** — `XTO-Gallery-425-Contender01.jpg`, `f200white360.png`, `T99Stern.png`. That is the manufacturer's own attribution, not a resemblance I judged. 638 distinct assets were pulled off those pages and every one was requested and measured: **638 of 638 answered 200.**

More to the point, the Australian codes are on those pages. The XTO Offshore page lists `XF425XSA2`, `LXF425XSA2`, `XF425USA2`, `LXF425USA2`, `XF425XSA`, `LXF425XSA`, `XF425USA`, `LXF425USA` — the seed's codes, letter for letter, for the rows that have never had a picture. 72 of the seed's 188 distinct Yamaha codes appear verbatim on this site.

#### The 18 rows with no Image Link — all 18 now have a picture

The first pass said six. The seed says **eighteen** rows whose supplier is `Yamaha` carry no Image Link at all:

| rows | what they are | what closes them |
|---|---|---|
| 193, 194, 195, 196 | `XF425XSA2`, `LXF425XSA2`, `XF425USA2`, `LXF425USA2` — the XTO Offshore 425 in **white** | `White8Rotating.png` (8-frame 360, 2886×405) and eight on-water frames including `XTO-Gallery-425-Contender01.jpg` (1463×844), a triple rig of white 425s under way |
| 262, 263 | the two white XTO 425 twin-rig rows | the same white 425 pictures |
| 559, 560, 561, 562 | `XF425XSA`, `LXF425XSA`, `XF425USA`, `LXF425USA` — the XTO Offshore 425 in **grey** | `Gray8Rotating.png`, `k29stern.png`, and `XTO-Gallery-425-GradyWhite01.jpg` — a quad rig of grey 425s at speed, cowls reading 425 |
| 563, 564 | the two grey XTO 425 twin-rig rows (no model code in column D) | the same grey 425 pictures |
| 554, 556, 557, 558 | `LF200XC`, `F200LCB-FO`, `F200XA`, `LF200XA` | the in-line-four F200 set: `f200gray360.png`, `F200_Gray_stern.png`, 18 on-water frames |
| 555 | `F150LCB-FO` | the in-line-four F150 set: `f150gray360.png`, `F150_Gray_stern.png` |
| 550 | `Yam - F200XC + LF200XC`, a twin row with no code in column D | the same F200 set |

The `L` prefix is rotation direction and the `-FO` suffix is a supply flag; neither changes what the engine looks like, and Yamaha publishes one render per model and colour. Each record says which rows it covers.

#### What is now on water

**233 photographs at 1463×844**, one carousel per model, every frame on a named boat and filed by Yamaha under the model number. That is the first Yamaha on-water photography in the system and the first Yamaha picture of any kind above 800×600. The frames the model pages *also* carry — `XTO-425-OverviewLifestyle01.jpg` and its 120 siblings — are stored at **245×200** and no larger version exists at any query string, so none of them is listed.

#### What is deliberately left out, and why

- **The 20 series files at 2560×1500 and 2560×1440** (`xto-LIFESTYLE.jpg`, `I4-overview.jpg`, `MIDRANGE-115-LIFESTYLE.jpg`, `portables-overview.jpg` …). They are the biggest files on the site and they are **video posters**: every one carries a burnt-in play button, an orange `LIFESTYLE` or `OVERVIEW` tag, and a text overlay reading the series name and horsepower — "4.3L V6 OFFSHORE / 350 hp". Put one behind a dealer's configurator and Yamaha's marketing furniture goes with it. This was caught on the contact sheet, not from the file names. `2025-PORTABLE-INSTALLATION.jpg` (2560×1440) goes with them: a titled owner-resources banner.
- **Classic White.** Yamaha US offers the F250, F300 and F350 in a third colourway, "Classic". Laid beside the seed's own white render from `yamaha-motor.com.au`, it is a warm cream and the seed's white is a cool pearlescent — two different colours. **No seed row carries Classic White**, so its three renders are not listed; listing them would invite a wrong colour onto a quote.
- **The "Brown" colourway** on the F25, F50, F60, F70, F90 and F115. Same reason: no seed row carries it.
- **White renders of models the seed only sells in grey** — `F25WhiteRotating.png`, `F9_9WhiteRotating.png`, `25-highthrust-white.png`, `9-9-highthrust-white.png`. Real files, real colourway, no row to attach them to.
- **`CS-F150P_570x640.png` and `CS-F200R_570x640.png`** — clean renders with an orange **NEW** badge burnt into the corner.
- **Everything jet-drive** (5 side renders, 4 gallery frames, the 1600×800 hero): the price file has no jet-drive row.
- **The 153 feature illustrations** (`*-PwrPerf-*`, `*-ConCtrl-*`, `*-ReliaDura-Cowling.png`): mostly 755×470 close-ups of a fuel system or a tilt lever, below the 800 px floor and not pictures of a model.

#### What the renders actually are, at what size

Yamaha's product viewer is a **360 filmstrip**: one PNG holding 5 frames (or 8 on the XTO), one strip per colourway. The strips run 1805–2886 px wide, but a single frame is 570×640 (360×405 on the XTO), so **a Yamaha render is still not bigger than the 800×600 the seed already holds** — it is a different and more useful thing: a turnable set, per colourway, including colourways the seed has no address for. Every record names its frame count and frame size. All 82 render addresses were re-fetched and hashed: **82 distinct sha1s**, so the stern still and the CS still really are separate files and not one image under two names.

#### Models the seed sells that Yamaha US does not

- **F5, F130, F175** — no render, no photograph, nothing. Australia-only ratings. The seed already holds an 800×600 for F130 and F175; F5 has one too (it shares the F4/F6 panel).
- **F50 and F70 in white** — the seed sells `F50LC2`, `F70LA2`, `F70LB2` in white and Yamaha US publishes no white render of either. The seed already holds the Australian white ones.
- **No gallery photography** for F5, F9.9, F30, F60, T60, VF90, VF200, VF225 — those models have renders here but no on-water frame, because Yamaha US's carousel skips them.

#### Every Yamaha model in the seed, and what it has now

| model | seed rows | colours | rows with no Image Link | new heroes/galleries | new renders |
|---|---|---|---|---|---|
| F2.5 | 1 | Grey | — | 10 | 2 (Grey) |
| F4 | 2 | Grey | — | 5 | 2 (Grey) |
| F5 | 2 | Grey | — | **0** | **0** |
| F6 | 2 | Grey | — | 2 | 2 (Grey) |
| F8 | 2 | Grey | — | 10 | 2 (Grey) |
| F9.9 | 2 | Grey | — | **0** | 2 (Grey) |
| F15 | 4 | Grey | — | 2 | 2 (Grey) |
| F20 | 3 | Grey | — | 2 | 2 (Grey) |
| F25 | 6 | Grey | — | 15 | 2 (Grey) |
| F30 | 2 | Grey | — | **0** | 2 (Grey) |
| F40 | 4 | Grey | — | 9 | 2 (Grey) |
| F50 | 6 | Grey+White | — | 6 | 2 (Grey) |
| F60 | 4 | Grey | — | **0** | 3 (Grey) |
| F70 | 14 | Grey+White | — | 14 | 3 (Grey) |
| F75 | 6 | Grey | — | 4 | 2 (Grey) |
| F90 | 10 | Grey+White | — | 6 | 3 (Grey+White) |
| F115 | 11 | Grey+White | — | 10 | 3 (Grey+White) |
| F130 | 5 | Grey | — | **0** | **0** |
| F150 | 18 | Grey+White | 555 | 2 | 3 (Grey+White) |
| F175 | 6 | Grey | — | **0** | **0** |
| F200 | 19 | Grey+White | 554, 556, 557, 558 | 18 | 3 (Grey+White) |
| F225 | 6 | Grey | — | 2 | 2 (Grey) |
| F250 | 20 | Grey+White | — | 4 | 3 (Grey+White) |
| F300 | 20 | Grey+White | — | 14 | 3 (Grey+White) |
| F350 | 13 | Grey+White | — | 20 | 3 (Grey+White) |
| XF425 | 10 | Grey+White | 193, 194, 195, 196, 262, 263, 559, 560, 561, 562 | 8 | 3 (Grey+White) |
| XF450 | 12 | Grey+White | — | 11 | 3 (Grey+White) |
| T9.9 | 2 | Grey | — | 12 | 2 (Grey) |
| T25 | 2 | Grey | — | 8 | 2 (Grey) |
| T60 | 8 | Grey | — | **0** | 2 (Grey) |
| VF90 | 2 | Grey | — | **0** | 3 (Grey) |
| VF115 | 2 | Grey | — | 9 | 3 (Grey) |
| VF150 | 2 | Grey | — | 5 | 3 (Grey) |
| VF175 | 2 | Grey | — | 5 | 2 (Grey) |
| VF200 | 1 | Grey | — | **0** | 2 (Grey) |
| VF225 | 1 | Grey | — | **0** | 2 (Grey) |
| VF250 | 2 | Grey | — | 20 | 2 (Grey) |

`rows` counts a seed row once per model family it names, so the twin- and triple-rig rows appear under each engine they pair; the column sums to 234 where the file has 238 Yamaha-supplier rows.

#### Still the right ask

The dealer route in the plan is still worth taking, for one thing only: **Australian** photography, and a mark from the Australian site. Everything else Yamaha has published publicly is now measured and in the ledger.

### ePropulsion — 32 seed rows, 0 pictures before today, 60 records now

Every one of the 32 ePropulsion rows in the Motor Library has an **empty Image Link**. This sweep closes that completely.

- **23 renders are tied to a seed row by ePropulsion's own part number.** The parts database files each render under `data-part`; the seed's `Model Code` column carries the same numbers. Example: seed row 326 `EPROPULSION - X12 Outboard (SS)`, code `X1-0000-SO` → ePropulsion's card `data-part="X1-0000-S0"`, `data-name="X12 Electric Outboard Motor-S"`, render `epsync/products/X1-0000-S0.png`. **The seed writes the letter `O` where ePropulsion writes the digit `0`** — that transcription difference is recorded on every affected record rather than silently normalised.
- **The seed's display names are wrong in two places, and the codes prove it.** Rows 307–314 are called "Sprint 1.0 EVO"; their codes start `SE-`, which is ePropulsion's **Spirit** 1.0 Evo. Rows 322–324 and 339–340 are called "Pro Drive"; their codes `P1-/P3-/P6-0000-E0`, `PB-0000-00` are ePropulsion's **Pod Drive**. Each record says so and keeps the seed's own model string as `model`.
- **One code disagrees outright.** Seed row 339 `Pro Drive 12.0 eSSA` carries code `PA-AC00-00`, which ePropulsion lists as the *Pod Drive 12 eSSA Saildrive Conversion Kit*, not the drive. The drive is `PA-0000-00`. The record attaches the Pod Drive 12 eSSA render to the row and names the disagreement.
- **28 files were re-fetched and hashed**: all distinct bytes, so the SS / LS / XS renders really are separate files from the manufacturer, not one file served three times.
- 33 heroes and galleries, 7 series-level. The Spirit 1.0 gallery ("Soulianis") runs to 3240×2160 and the Navy Evo 2023 set to 3238×2160 — by a distance the best on-water photography of anything in this sweep.
- **Not recorded**: the whole `/boat-database/` gallery (hundreds of frames of other builders' boats — real, but they depict the boat, not the motor); the eLite page's 10-frame gallery is recorded only where the cache derivative is 1280 px, because those files have no linked original.

### Mercury — 22 records now, and the wall is named instead of left as an absence

Mercury is not a Motor Library supplier. It appears only inside Jeanneau's factory packages: **44 cells across 15 boat rows, 34 distinct package strings**, every one of them with an empty Image Link. (The first pass said "35 rows"; measured again by counting cells that name Mercury, it is 44 cells / 34 distinct strings / 15 hulls. The figure below is what the file holds.)

| what the seed asks for | distinct package strings | hulls | what is in the ledger |
|---|---:|---|---|
| `200 V6 (White)` | 4 | CC 9.0 CC S2, CC 9.0 WA S2, MF895 S2, MF895 Sport | the family render (`175-200-225hp…`), **black only** |
| `250 V8 (White)` / `250XL V8` | 9 | + TH33 | the 250-300 family render, **black only** |
| `300 V8 (White)` / `300Hp` / `300XL V10` / `300XXL Verado` | 14 | CC 10.5 CC, CC 10.5 WA, CC 12.5 WA, MF1095C S2, MF1095 FLY S2, MF1295 C, MF1295 F, TH33, TH38 | **four colourways, Verado and FourStroke both** |
| `350 V10` / `350XXL Verado` / `Triple 350 V10 Cold Fusion` | 4 | CC 10.5 CC, CC 10.5 WA, DB43 OB, TH38 | the 350hp starboard render (black) and the range render |
| `400 V10 Cold Fusion (White)` | 1 | DB37 OB | **all four colourways at 514×1200** |
| `425 V10` | 2 | CC 10.5 CC, CC 10.5 WA | the range render only (`Verado 350-425hp`), black |

**Every one of the 34 says (White).** Of the six ratings the seed names, Mercury publishes a white render for exactly two: the 300hp V8 and the 400hp V10. There is no white 200 V6, no white 250 V8, no white 350 V10 and no white 425 V10 frame on any official Mercury page. Mercury does publish white frames for the **225hp** V6 (`225hp_fs_{wf,cf,pf}_v6_xl_rp3-4.png`, 541×1200, on the FourStroke 175-225hp page) — a different rating from the one the seed buys, so they are not in the ledger; they are named here in case the owner decides a 225 cowl is close enough to stand for a 200, which is his call to make and not a thing to file quietly as a 200.

That leaves a real question for the owner: Mercury Australia's own spec table says the **FourStroke 200hp comes in Black** — the 175hp and the 225hp beside it both read "Black / Cold Fusion" — while four seed packages sell a `200 V6 (White)`. Either the spec table's 200hp row is incomplete or those packages are describing something else. Worth one question to the Jeanneau importer.

**The colour tokens, and why the binding is evidence rather than a guess.** The first pass refused to record `…_cf_400.png` because `cf` had no label beside it. Three things measured this pass bind them:

1. Mercury's own spec table on the US Verado 350-400hp page lists the 400hp's colours as **"Phantom Black, Warm Fusion White, Cold Fusion White, Pearl Fusion White"**, and the gallery on that same page carries exactly four 400-suffixed frames whose tokens are `b`, `wf`, `cf`, `pf` — in that order. The FourStroke 250-300hp page repeats the list for its 300hp and spells its black frame **`pb`** — Phantom Black.
2. The Australian pages cut the same list down to what Mercury Australia sells: 400hp "Black / Cold Fusion"; Verado 250/300hp "Black / Cold Fusion / Warm Fusion / Pearl Fusion"; FourStroke 250hp "Black / Cold Fusion"; FourStroke 175hp and 225hp "Black / Cold Fusion"; **FourStroke 200hp "Black"** and nothing else.
3. The cowl of each frame was sampled in the browser. Of the V10 400 set: `b` RGB(23,23,23), `wf` (202,201,198), `cf` (196,202,207), `pf` (200,197,190). **`cf` is the only one whose blue is above its red** — a cold white — and the same holds in the V8 300 set (`cf` 211,215,219 against `wf` 214,214,213 and `pf` 216,214,211). A cold-looking white under a token `cf` on a page that names Cold Fusion White is as close to a label as Mercury gets.

Each record carries that reasoning in its `note`, and says plainly that Mercury prints no label beside the thumbnail.

**Two contradictions, recorded rather than smoothed over:**

- The FourStroke 250-300hp page serves a byte-for-byte twin of the **Verado** (`ams`) Cold Fusion frame as its own Cold Fusion thumbnail — 47,522 bytes against 47,532, identical cowl sample — while its other three frames are `cms` files. So the FourStroke 300hp has Phantom Black, Warm Fusion and Pearl Fusion renders and **no Cold Fusion render of its own**; the file is recorded once, under Verado V8 300hp, where its name puts it.
- The seed says `Twin 300XL V10` on the TH33 and the TH38. **Mercury's V10 is 350, 400 and 425hp; its 300 is a V8.** Either the price file's wording is loose or the package is a V8; nothing in the ledger guesses which, and the 300hp renders are filed as V8 because that is what Mercury's own filenames and spec tables say.

**The galleries are not model pictures.** All twelve gallery frames Mercury publishes across the four Australian range pages were measured (1280×854 or 1280×853, 158–272 KB) and put on a contact sheet. They are lifestyle photography: a couple walking a beach, a woman at a helm, boats at distance. The engine is out of frame or unreadable in every one, and Mercury's alt text on the Australian copies is a copy-paste — "MerCruiser T6200 tow sport inboard" — on all twelve. **Not one of them can be attached to an engine model, so none is listed.** The US page for the 350-400hp carries the same three pictures as 550×367 PNGs with alt text that does name the engine ("Verado 350hp V10", "dual verado 350hp v10") — under the 800 px floor, and still a boat seen from across the water.

**The mark now has a light-ground variant.** `configurator.mercurymarine.com.au/logo-dark.svg` is the same 204×39 viewBox and the same paths as the white footer lockup already held, drawn `fill="black"` (7,396 bytes of SVG, read in the browser). Ten likely filenames were tried under `mercurymarine.com/content/dam/mercury-marine/archive/branding/` — `mercury-logo.png`, `-black`, `-dark`, `.svg`, `mercury-wordmark.png` and the rest — and **all ten answered 404**, so the open DAM folder holds the white lockup and nothing else.

**What a packer can actually fetch today:** three renders, all on `www.datocms-assets.com` (the configurator's CMS): the V6 175-225 forward three-quarter (546×1159), the V8 250-300 FourStroke port profile (656×1231) and the V10 Verado port profile (611×1206), all Phantom Black. The other seventeen need a browser pass or the `mpf-mirror` scheme.

## Trailers

The price file's trailer pictures are far thinner than they look. Of **474** live trailer rows, the Image Link column points at:

| band | rows | a real picture the seed holds | a **logo** standing in for a picture | never fetched | no link |
|---|---|---|---|---|---|
| Redco / Tinka (r4–85) | 53 | 35 | 0 | 14 | 4 |
| NSM Custom band (r87–184) | 73 | 19 | 47 | 0 | 7 |
| GFAB | 32 | 4 | 23 | 5 | 0 |
| Stacer | 34 | 10 | 21 | 3 | 0 |
| **Dunbier** | 102 | **3** | **99** | 0 | 0 |
| **Mackay** | 122 | **0** | **122** | 0 | 0 |
| obsolete / other | 58 | 1 | 42 | 1 | 14 |

Every one of those 122 Mackay rows and 99 Dunbier rows points at a **logo on the dealership's SharePoint** (`…/Originals/Images/Mackay/Mackay-Trailers-Logo.png`, `…/Dunbier/Dunbier-Logo.jpg`) — and those two addresses are among the six the seed could not fetch at all. **So today the two largest trailer brands in the catalogue have no picture of any kind.** That is what this sweep was for.

### Dunbier — 43 records

Dunbier publishes per-model studio photography under its own product code, and the code is the seed's code.

- The current set lives in `wp-content/uploads/dlm_uploads/2026/06/` and `…/07/`, behind Dunbier's *Trailer Image Downloads* page for dealers. The files answer publicly with no login; the `licenceNote` says exactly that and claims nothing. Names like `Dunbier_LoaderPro_9239H_LPG57M14B.jpg` carry **both** the product code (9239H) and the model designator (LPG 5.7M-14B) — both of which are the seed row's.
- 17 records are pinned to an exact seed row this way; another 9 to a row by the older `2019/02` file names (`RW5.3M-13B.jpg`, `SRW5.7M-13TB.jpg`, `ACL5.3M-13B.jpg`).
- Series heroes come from the ten series pages: the Rollamatic at Dunbier's Adelaide branch, the Supa Rolla launching, the Loader Pro by the water, the PWC series.
- **Two byte-level findings, both recorded rather than tidied away.** `Dunbier_SupaRolla_Tandem_Steel_6.5_9178.jpg` is **byte-identical** (same sha1) to `…_5.7_9178.jpg`, so the "6.5" name is a mislabelling of one picture — only the 5.7 address is listed. And `Dunbier_Loader-Pro-X_Tandem_6.5_9336.jpg` exists at two addresses with identical bytes; only the one outside the dealer folder is listed.
- **Left out**: `Sports-Centreline-2024-Series-Banner-01.png` — a marketing banner with "MAXIMUM PERFORMANCE" set over it, not a picture of a trailer. The ROLLA MATIC and SUPA ROLLA wordmarks **are** listed, but as `kind: mark` with the series named, so nothing mistakes them for a trailer.
- Still missing: 5 of the 13 Dunbier series bands (Sports Water Toy 3.3, Centre Line CLW, Rollamatic Wide 5.7, Suparolla 6.1/6.6, Alloy Loader Pro below 7.0 m) have no model-exact picture — only a series one.

### Mackay — 26 records

Mackay Multi-Link publishes a side-on studio render per model family, named for the model code, and a real hero photograph per series.

- 12 renders tied to a model family: `MLJ4500-13-M`, `MLJ4750`, `MLJ5000`, `mlj5750`, `AL5750T`, `AL6000T`, `AL7000T`, `PU5500T`, `PU5750T`, `PU6500T3`, `krx4000`, `KRX4500`. The seed's 120 Mackay model designators are these families times wheel size and brake type (`-13-M`, `-14HD-HB`…), and the render does not show the difference; each record names the family and says which seed rows it covers.
- **The MLKR series — the seed's biggest Mackay band, 31 rows — has one render** (`New-Mackay-MLKR.png`, 5493×2709) and no per-model picture at all. That is the single biggest per-model gap in the trailer catalogue.
- Heroes: a Mackay MLJ under a Surtees 610 Workmate (a boat the seed also sells), the PU series, an Arvor on an AL, and the KRX off-road set including two drone frames at 2560 px.
- **Left out**: `MLKR-Header-Background.png` and `MLJ-Header-Background.png` — dark textures with nothing in them. The five series badges are listed as `kind: mark`.

### GFAB — 15 records

GFAB's own alt text names the boat on each trailer, and the seed's GFAB rows are themselves named by the boat they suit (`GFAB Single Axel Trailer t/s Stabicraft 1550 Series`), so the two line up exactly. Six records are pinned to an exact seed row; the rest are filed to the series because the boat GFAB names has no row (a Surtees 700, a Surtees 6.1, a Stabicraft 2250 that is only in the obsolete band).

Honest caveat on one of them: `GFAB-Alloy-Medium-Boat-Trailer-Stabicraft-1850.jpg` shows the boat **under a cover** in Milford Sound. GFAB says it is an 1850; nothing in the frame confirms it. The record says so.

GFAB's mark is 164×33 and there is nothing bigger — `gfabtrailers.com.au` and `gfab.co.nz` serve the byte-identical file.

### Redco and Tinka — 16 records

Mayfair's model pages are headed with the exact codes they cover (`RS480-MO / RS510-MO / RS510T-MO / …`), so the attribution is the manufacturer's own. The 2026 studio shots on white are large: `res12-white-compressed.jpg` and `re13-white-compressed.jpg` at 4032×3024, `ta600-white-compressed.jpg` at 3840×2160, `ta900tri-eh_no_bg_compressed1.jpg` at 4032×1904 cut out of its background. These are the cleanest trailer product pictures in the whole sweep.

Also recorded: `TA900.jpg`, which the **price file itself points at** for the TA900T-EH row and the seed has never fetched.

### Stacer trailers — 3 records

Only three addresses are new, and all three are ones the price file already points at and the seed never fetched: `TA1595S14SB-STA-Package.jpg`, `TAP1850T13RB---Package.jpg`, `TAP2750T14RB---STA---package.jpg`. The last two carry a **different code from the row that points at them** (`TAP…` where the seed says `TASC1850T13RB` and `TAB692750T14RB`); the records say so instead of smoothing it over. 21 of the 34 Stacer trailer rows still point at a quote-sheet logo on SharePoint.

### NSM Custom — no public pictures, and that is the true answer

The price file has no `NSM CUSTOM TRAILERS` banner row; the brand exists only in the hidden Dropdowns sheet and covers rows 87–184 — Redco and Tinka trailers **specified to a particular hull** (`REDCO Custom / Highfield SP560 Aluminium - TA600-MOB`, `REDCO Surtees Special - RE200T-EH-EXT`). They are not a product anyone photographs and publishes: 47 of the 73 rows point at the combined Redco-Tinka logo. **There is no public photograph of an NSM Custom trailer and this sweep did not invent one.** The base trailer each row is built from (`TA600-MOB`, `RE200T-EH`…) does have a picture, and those are in the JSON under Redco/Tinka — pairing a custom row with its base trailer's picture is a decision for the app, made visible, not something to fake in the ledger.

## Brand marks — every brand in the seed

| brand | mark | where | note |
|---|---|---|---|
| ePropulsion | **SVG** 1200×160, blue and white, plus a stacked PNG | `epropulsion.com/images/recreational/logos/` | new |
| Yamaha | **three SVGs** — emblem + wordmark lockup 374×79, the full red "Revs Your Heart" lockup 375×129, and the reversed white lockup 504×107 — plus the PNG 1042×360 | `yamahaoutboards.com/bundles/img/` (SVG) and `global.yamaha-motor.com/shared/img/rwd_identity.png` (PNG) | new in both passes. The three vectors are the masthead files of Yamaha's own US outboard site and answer a script 200. Still **no mark from the Australian site** — walled. |
| Mercury | PNG 1200×292, **white** (for a dark ground), plus **SVG** 204×39 `fill="black"` (for a light one) | `mercurymarine.com/content/dam/…/branding/` and `configurator.mercurymarine.com.au/logo-dark.svg` | new. The PNG answers a script 200; the SVG is 403 to a script and was read in a browser. Ten guessed filenames for a dark lockup in the open DAM folder all 404. |
| Dunbier | JPG 350×75, plus a white PNG 589×88 | `dunbier.com` | new. **No SVG and nothing larger is published anywhere on the site.** |
| Mackay | PNG 3951×504, plus a second lockup 2834×362 | `mackaytrailers.com` | new. No SVG. |
| GFAB | PNG 164×33 | `gfabtrailers.com.au/images/` | new. The only logo file on either GFAB site. |
| **REDCO / TINKA** | — | — | **Already held.** The only official mark is a *combined* Redco-Tinka lockup, `mayfairmarine.com.au/images/2025/02/20/redco-tinka-logos-01.png` (1000×635), and `images.json` already holds it. There is no separate Redco mark and no separate Tinka mark at any public address. Nothing new is listed rather than duplicate a held address. |
| Northside Marine | `NSM-Logo-blue.png` on the dealer's own site | `northsidemarine.com.au` | **`refused: true`, 403 Cloudflare.** The address comes from the price file's own dealer-fit rows, which point 902 of them at it. Nothing was measured. |
| Stacer | PNG 1712×525 | `telwater.com.au` | also in `stacer.json` |
| Stabicraft | PNG 180×180 (the red S device only) | `stabicraft.com` | also in `stabicraft-surtees.json`; Stabicraft draws its wordmark as inline SVG, so no wordmark file exists |
| Surtees | PNG 695×111 | `cms.surteesboats.com` | also in `stabicraft-surtees.json` |
| Jeanneau | **SVG** | `jeanneau.com` | also in `jeanneau-haines-formosa.json` |
| Haines Signature | PNG 581×225 | `hainessignature.com.au` | also in `jeanneau-haines-formosa.json` |
| Highfield | **SVG** | `highfieldboats.com` | also in `highfield.json` |
| Formosa | PNG 1000×179 | `formosamarineboats.com.au` | also in `jeanneau-haines-formosa.json` |

Seven **series** wordmarks (Dunbier Rollamatic and Supa Rolla; Mackay MLKR, MLJ, PU, AL, KRX) are also recorded as `kind: mark`, with the series named. They are badges, not pictures of trailers, and the note on each says so.

Two hosts do content negotiation: `telwater.com.au` and `formosamarineboats.com.au` answer `image/webp` to a client that accepts WebP and `image/png` to one that does not. The `bytes` and `contentType` recorded are the WebP response; the note says so.

## The three best hero candidates per series, and why

**ePropulsion · Spirit 1.0** — the strongest set in the sweep.
1. `Soulianis_9.jpg` (3840×2160) — the motor on a tender in turquoise water, whole scene, room to crop to any aspect.
2. `Soulianis_1.jpg` (3240×2160) — two people aboard, the motor in frame and legible; the human scale a configurator hero wants.
3. `Spirit 1.0_Portability_1.jpg` (2016×1512) — the motor carried up a beach. It sells the one thing this product is for.

**ePropulsion · Navy Evo**
1. `0P7A5478.jpg` (3238×2160) — a couple under way, the Navy on the transom, sharp.
2. `0P7A5669.jpg` (3238×2160) — same session, the boat quartering toward the camera.
3. `0P7A5782.jpg` — people walking a boat off a beach; softer, but it is the only frame with the whole boat and no engine clutter.

**ePropulsion · X-Series / POD Drive / I-Series** — thin. `x-series/ePropulsion X-series X20-56.jpg` (1620×1080) is the only real X-Series hero; `pod-header.jpg` (1840×700) and `p-series.jpg` (1921×601) are letterboxed page headers that will not crop tall. The I-Series has no photograph of the product at all — only a labelled cutaway (`kind: plan`) and a video still.

**Dunbier** — the series pages give one good hero each and they are all letterbox crops (2560×761–915), which suits a banner and not a tile.
1. `IMG_3744_edited-scaled…jpg` (Steel Loader Pro, 2560×761) — the widest and the cleanest.
2. `Dunbier-Rollamatic_Adealaide-Branch.jpeg` (1600×1200) — the only Dunbier hero with a normal aspect and a whole boat on the trailer.
3. `DSC_0166-copy-scaled…jpg` (Supa Rolla, 2560×915) — a launch in progress; it shows what the trailer does.

**Mackay** — the best trailer photography of the three Australian makers.
1. `Arvor-Alloy-1-scaled.jpg` (AL Series, 2560×1920) — boat, trailer and tow vehicle in one frame at full resolution.
2. `Surtees-610-Workmate_Mackay-MLJ_Chivers-Marine-2.jpg` (2016×1512) — an MLJ under a **Surtees 610 Workmate**, a boat the seed also carries; two products the dealer sells in one picture.
3. `001_7375-scaled.jpg` (KRX, 2560×1704) — a beach-launch scene that does what no studio render can.

**GFAB**
1. `GFAB-Alloy-Medium-Boat-Trailer-Stabicraft-2050SC.jpg` (1920×1440) — a Stabicraft 2050 on the trailer, at a ramp, and it maps to a real seed row.
2. `GFAB-Alloy-Small-Boat-Trailer-Stabicraft-1450.jpg` (1000×667) — blue Stabicraft 1450 at the water's edge; small but unambiguous.
3. `offroad-sportski-2024-2.jpg` (1200×800) — the rooftop sportski trailer in the field; the only GFAB hero that is about the trailer rather than the boat.

**Redco / Tinka** — there is no on-water photography at all; the heroes are studio cut-outs, and they are excellent at it.
1. `ta600-white-compressed.jpg` (3840×2160).
2. `res12-white-compressed.jpg` (4032×3024).
3. `ta900tri-eh_no_bg_compressed1.jpg` (4032×1904) — a tri-axle with the background already removed, which is what a configurator wants.

**Stacer trailers** — no hero candidates exist; Stacer's trailer page is package renders only.

**Yamaha** — 29 frames are marked `kind: hero`, one per model that has a gallery, chosen off the contact sheets out of that model's own set. Every one is 1463×844; there is nothing larger that is not a video poster. The best of them, by series:

**Yamaha · XTO Offshore** — the strongest Yamaha set and the one that closes the worst gap.
1. `XTO-Gallery-425-Contender01.jpg` — a triple rig of **white** 425s driving into a wave at low sun, three cowls reading 425, four people aboard. This is the hero for rows 193-196 and 262-263, which have never had a picture.
2. `XTO-Gallery-425-GradyWhite01.jpg` — a quad rig of **grey** 425s at speed, spray everywhere, cowls legible. The hero for rows 559-564.
3. `XTO-Gallery-450-Regal02.jpg` — two white XTO 450s filling the frame from astern; the closest thing to a studio shot that is still on water, and it crops square.

**Yamaha · V6 4.3L Offshore (F350)**
1. `F350-Gallery-GradyWhite01.jpg` — a triple of white 350s from astern, quartering, wake behind.
2. `F350-Gallery-Kingfisher01.jpg` — a hardtop boat with a snow mountain behind it; the only Yamaha frame with real landscape in it.
3. `F350-Gallery-Regal01.jpg` — sunlit, people aboard, the engine still legible.

**Yamaha · V6 4.2L Offshore (F225/F250/F300)**
1. `V6-Gallery-300-GradyWhite04.jpg` — twin white 300s on a Grady-White in a marina, boat and engines both whole.
2. `V6-Gallery-250-Cutwater01.jpg` — a Cutwater beside a lighthouse; wide, calm, and it will hold a headline.
3. `V6-Gallery-300-FourWinns01.jpg` — a bowrider at dusk with the engine in frame, one of the few Yamaha frames that is not about fishing.

**Yamaha · In-Line Four (F150/F200)**
1. `i4-Gallery-200-Edgewater04.jpg` — twin 200s on a planing Edgewater, cowls reading 200.
2. `i4-Gallery-200-HewesCraft02.jpg` — a plate-alloy boat hard over, which is what a Surtees or Stabicraft buyer recognises.
3. `i4-Gallery-150-StarCraft02.jpg` — the only F150 frame that shows the engine clearly.

**Yamaha · Midrange and Portable** — the useful ones are the tender frames, because the dealer sells tenders: `Por-Gallery-2-Zodiac02.jpg`, `Por-Gallery-6-Zodiac02.jpg`, `Por-Gallery-25-Novurania01.jpg` and `HT-Gallery-25-Zodiac02.jpg` put a small Yamaha on a RIB on flat water, which is exactly the Highfield picture the file cannot get from Highfield.

**Mercury** — no hero candidate exists either, and now for a reason that was looked at rather than assumed. Mercury's twelve gallery frames were measured and put on a contact sheet: they are lifestyle photography in which the engine cannot be identified (above). What is worth showing instead, per series:

- **Verado** — 1. `250-300hp_v8_pb_ams_fs_port_1.png` (1077×2048), the biggest Mercury render published anywhere public and the only one over 2000 px. 2. `v10-verado_port_b-2.png` on the configurator's CMS (611×1206) — smaller, but the only V10 a script can fetch. 3. `v10-verado_rear_3_4_port_cf_400.png` (514×1200), because it is the exact colourway the DB37 OB package names and a white engine reads on a light page where a black one does not.
- **FourStroke** — 1. `250-300hp_v8_pb_cms_fs_port-2.png` on the CMS host (656×1231), fetchable today. 2. `175-200-225hp_fs_pb_v6_xl_port.png` (652×1200), the only picture Mercury publishes that covers the 200 V6. 3. `300hp_v8_wf_cms_fs_port_rear_3-4.png` (520×1200) — a white FourStroke, since fourteen of the thirty-four packages are a white 300.

All six are studio renders on white or transparency. A Mercury surface in this app will be a studio surface unless the dealership photographs a rigged transom itself.

## What was looked at, not just listed

Four contact sheets were built and read before anything was classified: 74 tiles of Dunbier and Mackay, 40 of GFAB/Redco/Tinka/Stacer/marks, 60 of ePropulsion, and 18 of Mercury — the twelve model-page gallery frames beside the five configurator renders and the Verado “find a dealer” frame. The Mercury sheet is what turned "Mercury's photography is walled" into "Mercury's photography is walled *and* unusable": twelve frames in which no engine can be identified, and one file the configurator serves for the Verado 250-300hp range under the name `demo-verado-1.webp`, which is why no Verado 250-300 render is recorded from that host. That pass is what caught the marketing banner, the two dark header textures, the seven series badges filed as pictures, the five studio renders filed as "hero", the labelled cutaway filed as a render, and the "Revs+" lockup that is not the Yamaha mark. All six corrections are in the JSON.

**Yamaha's turn: twelve more sheets, 400 tiles.** Eight sheets of 30 covered all 233 gallery frames; four more put Yamaha's US renders beside the Australian renders the seed already holds, colour by colour; one covered the 95 sprites and stills; one covered the 22 series files. That pass is what produced most of the decisions above and could not have been made any other way:

- the 20 **2560-px "heroes" are video posters** with a play button, an orange tag and a horsepower caption burnt in — the biggest files on the site, and unusable;
- **"Classic White" is not the seed's white.** Laid side by side, Yamaha US's Classic is a warm cream and the Australian white is a cool pearlescent. Three renders dropped;
- `k29stern.png` sits in the **white** tab of the XTO 425 viewer and shows a **grey** engine (the page reuses one still under both tabs). The record says grey;
- `F250WhiteRotating.png` carries the alt text "360 view of Yamaha F250 Outboard **in gray**" and is a white engine. The file name and the tab agree with the picture; the alt text is stale;
- the **V MAX SHO cowl is blue-black, not grey**, in both Yamaha's US renders and the Australian renders the seed already holds — so the seed's "Grey" in column H is a label, not a description, and the two sources do agree. Said on every VF record rather than left to look like a mismatch;
- `CS-F150P` and `CS-F200R` carry a burnt-in orange **NEW** badge;
- `HT-Gallery-99-Ranger02` and `-Ranger03` are filed by Yamaha under the 9.9 but the engine filling the transom is a 300 — the T9.9 is the kicker. Both records say so.

All 82 Yamaha render addresses were then re-fetched and hashed: 82 files, 82 distinct sha1s, no file serving under two names.

Every record was then re-fetched a second time and hashed. That second pass caught **a bug in my own probe cache** (the key truncated a base64 of the URL, so two files in the same folder whose names differ only near the end collided and one inherited the other's measurements). The key is a sha1 now and every figure in the JSON was re-measured after the fix. It also found the two byte-identical Dunbier pairs and the two content-negotiating logo hosts, both recorded above.

## Counts measured

| | |
|---|---|
| Records | **514** |
| Answered 2xx to a script, with a pixel size read from the bytes | **493** |
| Refused, recorded anyway (`refused: true`, 403 Cloudflare) | **21** — 18 Mercury (17 `shop.mercurymarine.com`, 1 `configurator.mercurymarine.com.au`), 3 Northside Marine |
| Of those, carrying a pixel size measured in a browser | **20** |
| Dead at origin | **0** |
| By kind | gallery 263 · render 156 · hero 62 · mark 31 · plan 2 |
| Attached to an exact seed model | **433** · to a series only **50** · marks **31** |
| By brand | **Yamaha 319** · ePropulsion 60 · Dunbier 43 · Mackay 26 · Mercury 22 · mayfairmarine (Redco 10 / Tinka 6) 16 · GFAB 15 · Stacer 4 · Northside Marine 3 · six boat-brand marks 6 |
| Brand marks | **23 files** (14 brands + the dealer's) · series marks **7** |
| Yamaha, third pass | 14 pages read · **638 of 638** assets requested answered 200 · **315 of the 638 recorded**, 323 left out with the reason written down, plus 3 brand marks off the site chrome · 233 photographs at 1463×844 · 82 renders across 34 of the seed's 37 Yamaha model families · 82/82 distinct sha1 |
| Seed rows that gain a picture where they had none | **18 of 18** Yamaha rows; **32 of 32** ePropulsion rows; **34 of 34** Mercury package strings now have a render of their rating (twenty renders across six ratings) — but only **15 of 34** in the colour the package names (the fourteen 300s and the one 400) |
| Hosts | 20 |
| 2000 px or wider on the long edge | **89** |
| Total bytes if every record were fetched | 194.3 MB |
| Separately verified | all **45** Yamaha `.ashx` addresses the seed holds: 45/45 answer 200, 800×600, and the handler ignores `?w=`/`?mw=`, so 800×600 is the stored asset |

## Gaps, in the order they hurt

1. **Mackay MLKR — 31 seed rows, one series render, no per-model picture.** Mackay's own site does not publish one.
2. **Yamaha — closed, except for four things.** Every one of the 18 rows with no Image Link now has a picture; 233 on-water photographs at 1463×844 exist where there were none. What is left: **(a)** `F5`, `F130` and `F175` are Australia-only ratings and Yamaha US publishes nothing for them — the seed's own 800×600 is all there is; **(b)** the seed sells `F50LC2`, `F70LA2` and `F70LB2` in white and Yamaha US publishes no white render of either model; **(c)** F5, F9.9, F30, F60, T60, VF90, VF200 and VF225 have renders but no on-water photograph, because Yamaha US's carousel skips them; **(d)** **no Australian photography and no mark from the Australian site**, which remains the one thing to ask Northside's Yamaha rep for. A single-frame Yamaha render is still 570×640 — the 360 filmstrips are wide, but a frame out of one is not bigger than the 800×600 the seed holds.
3. **Mercury — seventeen of the twenty renders are Cloudflare-walled.** They are now *recorded* with `refused: true` and a browser-measured size, so the gap reads as a named wall and not as an absence, and three (V6, V8 FourStroke, V10) can be fetched today from the configurator's CMS host. What is still missing is not findable by any sweep: **no white 200 V6, 250 V8, 350 V10 or 425 V10 render exists on an official Mercury page**, and 19 of the 34 packages ask for one. A browser pass or the `mpf-mirror` scheme takes the seventeen; the four missing colourways need the Jeanneau importer or Mercury Australia.
   **Note for whoever runs the tool next:** the "What is walled" paragraph in `README.md` is hardcoded in `tools/research/measure-images.ts` and is now wrong twice over. It says Mercury's colourway renders "show as models with no record at all rather than as refused rows" — they are refused rows now. And it says the same of Yamaha, whose Australian pages are indeed still walled but whose models are no longer without records: 318 of them came off `yamahaoutboards.com`, which is not walled at all. Neither sweep was allowed to edit the tool. One paragraph.
4. **Northside Marine's own mark and the `stacer-boats` subsite — 403 to everything.** Ask the owner.
5. **No separate REDCO or TINKA mark exists** — only the combined lockup, which the seed already holds.
6. **NSM Custom has no public photography** and never will; the app needs a rule for it, not a picture.
7. **Dunbier and Mackay both stop at the model family.** Wheel size and brake type — the thing that distinguishes most of their 224 rows — is not photographed by either maker.
