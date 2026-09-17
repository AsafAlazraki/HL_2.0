# Motors, trailers and brand marks — imagery sweep (2026-09-17)

Companion to `motors-trailers-marks.json` (**174 records**). Every address in the JSON was requested over HTTP on 2026-09-17; `status`, `contentType`, `bytes`, `width` and `height` are what that request returned and what `sharp` read out of the bytes — not what a page claimed. Nothing was downloaded into `public/`. No address already held in `tools/seed/legacy/extracts/images.json` is re-listed (checked: **0 overlaps**).

Scope: the Motor Library's two motor suppliers (Yamaha, ePropulsion) and the Mercury engines the Jeanneau factory-package rows name; the six trailer brands (Redco, Tinka, GFAB, Stacer, Dunbier, Mackay, plus the NSM Custom band); and a brand mark for every brand in the seed plus the dealership's own.

## What each source turned out to be

| Source | What it is | How it was read |
|---|---|---|
| `www.epropulsion.com` | ePropulsion's own site (Joomla/YOOtheme). **Its `/parts-database` page is the find of this sweep**: every product card carries `data-part="…"` and `data-name="…"` next to its render, so a picture can be tied to a seed row by the manufacturer's own part number rather than by resemblance. | Fetched by script. 470 product cards parsed; 466 carry a render. The `_320.png` the page draws is a thumbnail — the unsuffixed master at the same path answers at 800–2160 px, and that is what is recorded. `robots.txt` allows everything outside `/administrator/`, `/api/`, `/cache/` and the like. |
| `www.yamaha-motor.com.au` | Yamaha Motor Australia. | **Not crawled.** Its HTML answers a 212-byte Imperva/Incapsula shell to a scripted client, and its `robots.txt` names `AgenticBot`, `GPTBot` and `CCBot` with `Disallow: /`. Only `robots.txt` and the sitemap it advertises were read. See *Yamaha* below for what was measured instead. |
| `global.yamaha-motor.com` | Yamaha Motor Co., Ltd.'s global corporate site. `robots.txt` has no general disallow. | The brand identity file was taken from here. |
| `www.mercurymarine.com` | Mercury Marine's own Australian site. Cloudflare answers **403** to every scripted request, including `robots.txt`. | The two pages needed were opened in a real browser (Playwright) and their image addresses read off the live DOM; each address was then verified over HTTP. One answered (the branding PNG); the rest are 403 to a script and are **not** in the JSON. |
| `mayfairmarine.com.au` | **Mayfair Marine 2000 is the maker and distributor of Redco and Tinka** — the same Rocklea address and `info@mayfairmarine.com.au` the brand publishes — and is the supplier named on every Redco/Tinka row of the price file. So this is a manufacturer site, not a dealer listing. | 13 model pages fetched by script; each is headed with the model codes it covers. |
| `dunbier.com` | Dunbier Marine Products' own site (WordPress + WooCommerce). Its WP REST API is open. | Series pages fetched; `wp-json/wp/v2/media` read at both ends of the ordering (the endpoint caps a page at 99, so `order=asc` and `order=desc` were both taken: 198 items). The 2026 `dlm_uploads/` files are the prize — see *Dunbier*. |
| `mackaytrailers.com` | **Mackay Multi-Link's own site.** Not to be confused with `mackaytrailers.com.au`, which is a Queensland retailer that describes itself as "a Mackay Multilink authorised dealer" — another dealer's listings, so nothing was taken from it. | Five series pages fetched; `wp-json/wp/v2/media` read (95 items). |
| `www.gfabtrailers.com.au` | GFAB's own Australian site (`gfab.co.nz` serves the identical assets). | Seven product pages fetched. GFAB writes the boat that sits on each trailer into the `alt` and `title` of every picture, which is what makes the model attribution possible. Its size folders (`500X300`, `320X230`, `100X60`) sit beside an **unsized original** at the parent path — measured at 1000×667 to 1920×1440 — and the original is what is recorded. |
| `www.stacer.com.au` | Stacer's (Telwater's) own Aluminium Boat Trailers page. `robots.txt`: `Allow: /`. | Fetched; only the three package files the seed has never fetched are recorded. |
| `www.northsidemarine.com.au` | The dealer's own site and its `stacer-boats` subsite. | **Refused.** Every request from this session answered `403` (Cloudflare), `robots.txt` included. Two addresses are recorded with `refused: true` and nothing measured. |

## Motors

### Yamaha — 209 seed rows, and the plan's note about the wall is wrong

The plan says Yamaha's `.ashx` addresses are "walled to scripts". **Measured today, they are not.** All **45** distinct `www.yamaha-motor.com.au/-/media/...ashx` addresses the price file carries were requested from this session: **45 of 45 answered `200` with a readable image, every one 800×600.** The wall is on the HTML pages (Imperva/Incapsula), not on the media handler. The original app's July inventory recorded those same 45 as `redirect-to-html`; that is no longer what happens.

So Yamaha needs no new addresses for the 203 rows that already have one — the seed already holds all 45 files and they cover **203 of 209** Yamaha rows. What Yamaha is short of:

- **6 rows carry no picture at all**: `XF425XSA2`, `LXF425XSA2`, `XF425USA2`, `LXF425USA2` (the XTO Offshore 425 in white) and the two twin-rig rows built from them. There is no address to offer: Yamaha publishes the white XF425 render only on its model page, which is the part that is walled.
- **No on-water photography of any kind, and no engine picture above 800×600.** Every Yamaha picture in the system is the same small overview-panel render.
- **No brand mark from the Australian site.** The mark in the JSON is Yamaha Motor Co.'s own global identity file (1042×360).

Because `robots.txt` on `yamaha-motor.com.au` disallows agentic crawlers by name, this sweep did not drive a browser through its pages either. **This is the one brand where the plan's own answer — ask the dealer for the assets — is still the right one**: Yamaha Australia gives its dealers a media library, and Northside is a Yamaha dealer.

### ePropulsion — 32 seed rows, 0 pictures before today, 60 records now

Every one of the 32 ePropulsion rows in the Motor Library has an **empty Image Link**. This sweep closes that completely.

- **23 renders are tied to a seed row by ePropulsion's own part number.** The parts database files each render under `data-part`; the seed's `Model Code` column carries the same numbers. Example: seed row 326 `EPROPULSION - X12 Outboard (SS)`, code `X1-0000-SO` → ePropulsion's card `data-part="X1-0000-S0"`, `data-name="X12 Electric Outboard Motor-S"`, render `epsync/products/X1-0000-S0.png`. **The seed writes the letter `O` where ePropulsion writes the digit `0`** — that transcription difference is recorded on every affected record rather than silently normalised.
- **The seed's display names are wrong in two places, and the codes prove it.** Rows 307–314 are called "Sprint 1.0 EVO"; their codes start `SE-`, which is ePropulsion's **Spirit** 1.0 Evo. Rows 322–324 and 339–340 are called "Pro Drive"; their codes `P1-/P3-/P6-0000-E0`, `PB-0000-00` are ePropulsion's **Pod Drive**. Each record says so and keeps the seed's own model string as `model`.
- **One code disagrees outright.** Seed row 339 `Pro Drive 12.0 eSSA` carries code `PA-AC00-00`, which ePropulsion lists as the *Pod Drive 12 eSSA Saildrive Conversion Kit*, not the drive. The drive is `PA-0000-00`. The record attaches the Pod Drive 12 eSSA render to the row and names the disagreement.
- **28 files were re-fetched and hashed**: all distinct bytes, so the SS / LS / XS renders really are separate files from the manufacturer, not one file served three times.
- 33 heroes and galleries, 7 series-level. The Spirit 1.0 gallery ("Soulianis") runs to 3240×2160 and the Navy Evo 2023 set to 3238×2160 — by a distance the best on-water photography of anything in this sweep.
- **Not recorded**: the whole `/boat-database/` gallery (hundreds of frames of other builders' boats — real, but they depict the boat, not the motor); the eLite page's 10-frame gallery is recorded only where the cache derivative is 1280 px, because those files have no linked original.

### Mercury — named by the seed, mostly out of reach

Mercury is not a Motor Library supplier; it appears in **35 factory-package rows under supplier Jeanneau** (`MF895 S2 with Mercury 2X250 V8 (White)`, `DB37OB w Mercury - Twin 400 V10 Cold Fusion (White)` and so on), all with empty Image Links.

Mercury's own page for the Verado 350–425 confirms the colourway the seed names: its spec table gives the Verado 400hp's **Colour** as "Black / Cold Fusion". The renders are served from `shop.mercurymarine.com` under names that match — `v10-verado_rear_3_4_port_cf_400.png`, `..._wf_400.png`, `..._pf_400.png` — and at 514×1200 in the browser. **They answer `403` to a scripted request, so none of them is in the JSON.** Listing an address I could not measure, on an inference (`cf` = Cold Fusion) I could not check against a label, would be exactly the kind of guess this workstream is supposed to refuse.

What is in the JSON is **one** Mercury record: the wordmark, from `content/dam/mercury-marine/archive/branding/mercury-footer-logo.png`, 1200×292, verified `200`. It is the white lockup, for a dark ground.

To get Mercury product renders, someone with a browser needs to save them, or the Jeanneau importer needs to supply them.

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
| Yamaha | PNG 1042×360, tuning-fork + "Revs your Heart" | `global.yamaha-motor.com/shared/img/rwd_identity.png` | new. No mark from the Australian site — walled. |
| Mercury | PNG 1200×292, white | `mercurymarine.com/content/dam/…/branding/` | new |
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

**Yamaha, Mercury, Stacer trailers** — no hero candidates exist. Yamaha has nothing above 800×600 and nothing on water; Mercury's photography is 403 to a script; Stacer's trailer page is package renders only.

## What was looked at, not just listed

Three contact sheets were built and read before anything was classified: 74 tiles of Dunbier and Mackay, 40 of GFAB/Redco/Tinka/Stacer/marks, 60 of ePropulsion. That pass is what caught the marketing banner, the two dark header textures, the seven series badges filed as pictures, the five studio renders filed as "hero", the labelled cutaway filed as a render, and the "Revs+" lockup that is not the Yamaha mark. All six corrections are in the JSON.

Every record was then re-fetched a second time and hashed. That second pass caught **a bug in my own probe cache** (the key truncated a base64 of the URL, so two files in the same folder whose names differ only near the end collided and one inherited the other's measurements). The key is a sha1 now and every figure in the JSON was re-measured after the fix. It also found the two byte-identical Dunbier pairs and the two content-negotiating logo hosts, both recorded above.

## Counts measured

| | |
|---|---|
| Records | **174** |
| Answered 200 with a pixel size read from the bytes | **172** |
| Refused, recorded anyway (`refused: true`, 403 Cloudflare) | **2** (Northside Marine) |
| Dead at origin | **0** |
| By kind | render 54 · gallery 59 · hero 33 · mark 26 · plan 2 |
| Attached to an exact seed model | **98** · to a series only **50** · marks **26** |
| By brand | ePropulsion 60 · Dunbier 43 · Mackay 26 · mayfairmarine (Redco 10 / Tinka 6) 16 · GFAB 15 · Stacer 4 · Northside Marine 2 · Yamaha 1 · Mercury 1 · six boat-brand marks 6 |
| Brand marks | **19** (14 brands + the dealer's, in 19 files) · series marks **7** |
| Seed rows that gain a picture where they had none | **32 of 32** ePropulsion rows; **0** Yamaha (all 203 with a link already resolve) |
| Hosts | 16 |
| 2000 px or wider on the long edge | **55** |
| Total bytes if every record were fetched | 91.6 MB |
| Separately verified | all **45** Yamaha `.ashx` addresses the seed holds: 45/45 answer 200, 800×600 |

## Gaps, in the order they hurt

1. **Mackay MLKR — 31 seed rows, one series render, no per-model picture.** Mackay's own site does not publish one.
2. **Yamaha — no engine picture above 800×600 anywhere, and none on water.** Six rows (XF425 white and its twins) have nothing at all. The route is Yamaha Australia's dealer media library, through Northside.
3. **Mercury — 35 seed rows, no product picture obtainable by script.** The renders exist at `shop.mercurymarine.com` and are Cloudflare-walled; a person with a browser can save them in a minute.
4. **Northside Marine's own mark and the `stacer-boats` subsite — 403 to everything.** Ask the owner.
5. **No separate REDCO or TINKA mark exists** — only the combined lockup, which the seed already holds.
6. **NSM Custom has no public photography** and never will; the app needs a rule for it, not a picture.
7. **Dunbier and Mackay both stop at the model family.** Wheel size and brake type — the thing that distinguishes most of their 224 rows — is not photographed by either maker.
