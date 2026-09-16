# Highfield imagery sweep (2026-09-16)

Companion to `highfield.json` (1195 records). Every record is one address, verified live on 2026-09-16 with an HTTP request (status, content-type, byte size, and pixel size read by sharp from the file's own header). Nothing is attached to a model by resemblance: a picture is listed under a model only when its filename names that model, or when it sits on that model's own page on a Highfield site and on no other model's page. Where the second rule is the only basis, the record's `note` says so.

## What the seed holds (measured from `tools/seed/legacy/extracts/b2_data.json`)

588 Highfield rows, 73 distinct model tokens, seven series prefixes: **SP Sport (199 rows), CL Classic (144), PA Patrol (130), UL Ultralite (64), RU Roll-Up (32), ADV Adventure (12), Coaster (7)**. The task brief also named an "Ocean Master OM" series; the seed carries no OM row, so none is covered here. The 73 tokens collapse to 50 model keys for imagery (the price file itself assigns one render to e.g. `CL310`, `CL310FT` and `CL310LS`, and to `PA540 Open` and `PA540ST`; `UL290LT` is kept apart from `UL290` because it has photographs of its own); each record carries `seedModels`, the exact seed tokens it applies to.

## Sources read

| source | what it is | what it yields |
|---|---|---|
| `media.highfieldboats.com` (the "Visit our media site" link in Highfield's own footer) | Highfield's media library: one page per model with an **Images** section (photographs, each with a download link) and a **Renders** section (colourway renders). Footer "© 2026 Highfield Boats"; no usage terms stated anywhere on the site. | the on-water photography this workstream was missing, per model |
| `www.highfieldboats.com/boat/<series>/<model>/` | the product pages: a lead photograph, a gallery, the colourway renders, and a General Arrangement PDF. Footer "Copyright 2026 Highfield Boats Co., Ltd."; no usage terms. | the per-model cover (the lead image) the original app lost |
| `adventure.highfieldboats.com` | the ADV range site (ADV7, ADV9) | ADV photography and the five ADV9 colourway PNGs (those five are the price file's own addresses and are left to the packer) |
| `www.highfieldboats.com/new-sport-560-and-sport-800-models-enter-the-highfield-range/` and `/news/`, `/stories/` | press posts | one launch aerial (it shows the Sport 800, see below); the stories are ambassador and expedition pieces with no model named in the pictures, so nothing from them is listed |
| `www.highfieldboats.com/downloads/` | the 2025 brochure PDF (`2025-Highfield-Brochure_V4_Web.pdf`) | not listed as an image; a brochure's pictures are not individually addressable |
| Highfield Boats Australia | `highfieldboats.com.au` answers 301 to `highfieldboats.com`; the importer page (`/importers/australia/`) names Peter Pembroke and no separate site | nothing separate to read |
| `www.northsidemarine.com.au/highfield-boats/` | the dealer's own Highfield subsite | Cloudflare "Attention Required" 403 to the script; its three addresses from the price file are recorded with `refused: true` |
| the original app's `COLOR_IMAGES` map | 73 renders across 12 models | lifted verbatim (see below) |

Not used, by rule: boatsales/classified listings, other dealers' pages (Boat Specialists, Sundance, Lewis, Baily, Pier 37), forums, YouTube thumbnails, brandfetch/seeklogo logo mirrors.

## Counts measured

- Records: **1195**. Served (200/206 with an image or PDF content-type): **1188**. Refused by Cloudflare: **3**. Failed or not an image: **4**.
- By kind: hero 75 (72 served), gallery 580 (576 served), render 480 (480 served), plan 55 (55 served), mark 5 (5 served).
- The COLOR_IMAGES map: **73 entries lifted verbatim, 73 serve today**; 4 of them are addresses the seed already holds and 48 are the price file's own addresses (both flagged in `note` so the packer can skip the copy); 59 were also found live on their model page today and carry that page as `pageUrl`.
- Addresses seen on the pages but deliberately not listed: 91 — 12 shared across models; 1 Roll-Up AL/KAM undetermined; 78 price-file address. (The price file's own addresses are the packer's step 1 and are not repeated here; "shared across models" means the same file sits on more than one model's page, so the model cannot be told.)
- Models covered (at least one served record): **49 of 50**. Not covered: **Coaster 600** (the seed row `HB600` carries `#N/A`; Highfield's site has no Coaster 600 page, the model exists only in European classifieds, which are off-limits).

## Why 206 appears

The verifier asks for the first 128 KiB with a Range header so that sharp can read the pixel size from the header without downloading a 5 MB original; a server that honours the range answers **206 Partial Content**, which means the file is served. `bytes` is the full size from the Content-Range header.

## Per model

| model | series | seed tokens | hero | gallery | render | plan | served / refused / failed | largest width | note |
|---|---|---|---|---|---|---|---|---|---|
| SP300 | Sport | SP300 | 1 | 7 | 16 | 0 | 24 / 0 / 0 | 4000 |  |
| SP330 | Sport | SP330 | 2 | 7 | 16 | 1 | 26 / 0 / 0 | 4000 |  |
| SP360 | Sport | SP360 | 2 | 17 | 17 | 1 | 37 / 0 / 0 | 4000 |  |
| SP390 | Sport | SP390 | 2 | 19 | 17 | 1 | 39 / 0 / 0 | 5184 |  |
| SP420 | Sport | SP420 | 1 | 7 | 17 | 1 | 22 / 0 / 4 | 5760 |  |
| SP460 | Sport | SP460 | 2 | 24 | 17 | 1 | 44 / 0 / 0 | 5184 |  |
| SP520 | Sport | SP520 | 2 | 5 | 8 | 1 | 16 / 0 / 0 | 6000 |  |
| SP560 | Sport | SP560 | 2 | 7 | 18 | 1 | 28 / 0 / 0 | 8192 |  |
| SP600 | Sport | SP600 | 2 | 26 | 17 | 1 | 46 / 0 / 0 | 5280 |  |
| SP660 | Sport | SP660 | 3 | 21 | 10 | 1 | 34 / 1 / 0 | 5280 |  |
| SP700 | Sport | SP700ST, SP700WL(Windlass) | 2 | 30 | 6 | 1 | 39 / 0 / 0 | 5472 |  |
| SP760 | Sport | SP760ST, SP760WL(Windlass) | 2 | 21 | 12 | 1 | 36 / 0 / 0 | 8192 |  |
| SP800 | Sport | SP800 | 3 | 25 | 10 | 1 | 38 / 1 / 0 | 8192 |  |
| SP900 | Sport | SP900 | 2 | 28 | 17 | 1 | 48 / 0 / 0 | 8192 |  |
| CL260 | Classic | CL260 | 2 | 21 | 13 | 1 | 37 / 0 / 0 | 5184 |  |
| CL290 | Classic | CL290, CL290FT | 1 | 17 | 12 | 3 | 33 / 0 / 0 | 2560 |  |
| CL310 | Classic | CL310, CL310FT, CL310LS | 2 | 16 | 10 | 5 | 33 / 0 / 0 | 7939 |  |
| CL340 | Classic | CL340, CL340FT, CL340LS | 2 | 24 | 10 | 1 | 37 / 0 / 0 | 5663 |  |
| CL360 | Classic | CL360, CL360LS | 2 | 23 | 13 | 1 | 39 / 0 / 0 | 5312 |  |
| CL380 | Classic | CL380, CL380LS | 2 | 20 | 9 | 1 | 32 / 0 / 0 | 5687 |  |
| CL400 | Classic | CL400 | 2 | 9 | 13 | 1 | 25 / 0 / 0 | 5272 |  |
| CL420 | Classic | CL420 | 2 | 9 | 9 | 1 | 21 / 0 / 0 | 5272 |  |
| CL460 | Classic | CL460 | 1 | 0 | 6 | 1 | 8 / 0 / 0 | 2048 |  |
| PA420 | Patrol | PA420 | 2 | 17 | 14 | 1 | 34 / 0 / 0 | 3840 |  |
| PA460 | Patrol | PA460 | 2 | 12 | 15 | 2 | 31 / 0 / 0 | 5852 |  |
| PA500 | Patrol | PA500 | 2 | 9 | 10 | 2 | 23 / 0 / 0 | 6000 |  |
| PA540 | Patrol | PA540 Open, PA540ST | 2 | 8 | 8 | 2 | 20 / 0 / 0 | 5918 |  |
| PA600 | Patrol | PA600 Open, PA600EW, PA600ST | 2 | 12 | 8 | 2 | 24 / 0 / 0 | 5184 |  |
| PA660 | Patrol | PA660EW, PA660ST | 2 | 15 | 8 | 2 | 27 / 0 / 0 | 6000 |  |
| PA700 | Patrol | PA700EW, PA700ST | 2 | 13 | 10 | 2 | 27 / 0 / 0 | 8082 |  |
| PA760 | Patrol | PA760EW, PA760ST | 2 | 32 | 10 | 2 | 46 / 0 / 0 | 8192 |  |
| PA860 | Patrol | PA860EW, PA860ST | 2 | 12 | 10 | 1 | 25 / 0 / 0 | 6000 |  |
| UL240 | Ultralite | UL240, UL240LT | 3 | 15 | 13 | 1 | 31 / 1 / 0 | 2560 |  |
| UL260 | Ultralite | UL260, UL260LT | 1 | 21 | 2 | 1 | 25 / 0 / 0 | 1920 |  |
| UL290 | Ultralite | UL290, UL290LT | 1 | 0 | 10 | 1 | 12 / 0 / 0 | 2048 |  |
| UL290LT | Ultralite | UL290LT | 1 | 3 | 0 | 0 | 4 / 0 / 0 | 5238 |  |
| UL310 | Ultralite | UL310 | 1 | 3 | 10 | 1 | 15 / 0 / 0 | 6000 |  |
| UL340 | Ultralite | UL340 | 1 | 0 | 10 | 1 | 12 / 0 / 0 | 2048 |  |
| RU230AL | Roll-Up | RU230AL | 0 | 0 | 2 | 1 | 3 / 0 / 0 | 1920 | renders only |
| RU230KAM | Roll-Up | RU230KAM | 0 | 0 | 8 | 0 | 8 / 0 / 0 | 1920 | renders only |
| RU250AL | Roll-Up | RU250AL | 0 | 0 | 2 | 1 | 3 / 0 / 0 | 1920 | renders only |
| RU250KAM | Roll-Up | RU250KAM | 0 | 0 | 8 | 0 | 8 / 0 / 0 | 1920 | renders only |
| RU280AL | Roll-Up | RU280AL | 0 | 0 | 2 | 1 | 3 / 0 / 0 | 1920 | renders only |
| RU280KAM | Roll-Up | RU280KAM | 0 | 0 | 8 | 0 | 8 / 0 / 0 | 1920 | renders only |
| RU320AL | Roll-Up | RU320AL | 0 | 0 | 2 | 1 | 3 / 0 / 0 | 1920 | renders only |
| RU320KAM | Roll-Up | RU320KAM | 0 | 0 | 8 | 0 | 8 / 0 / 0 | 1920 | renders only |
| ADV7 | Adventure | ADV7 | 2 | 7 | 0 | 0 | 9 / 0 / 0 | 9504 |  |
| ADV9 | Adventure | ADV9 (Dune), ADV9 (Mangrove), ADV9 (Ocean), ADV9 (Polar), ADV9 (Sky) | 1 | 6 | 0 | 0 | 7 / 0 / 0 | 2560 |  |
| Coaster 540 | Coaster | Coaster 540, Coaster 540 open | 2 | 12 | 9 | 2 | 25 / 0 / 0 | 5776 |  |
| Coaster 600 | Coaster | Coaster 600 | 0 | 0 | 0 | 0 | 0 / 0 / 0 | - | no official picture exists |

## The covers the original lost (the lead image of each highfieldboats.com model page, re-found)

The original app's seven-range cover JSON (`/tmp/highfield_images.json`, consumed by `apply-cover-images.py`) was never committed. The lead image of each model page today, as scraped, is the record with `kind: hero` and a `pageUrl` on `www.highfieldboats.com`; the media-library lead is the second `hero` per model. Where the model page's lead shows a different model (the Sport 420 page leads with `SP460-2.jpg`; the Sport 330 page's gallery is `SP360-*.jpg`; the Ultralite 290 gallery is `UL260-*.jpg`), the filename wins and the picture is listed under the model it names, not the page.

| model | model-page lead (cover) | media-library lead |
|---|---|---|
| SP300 | — (no photograph leads the page; a render does) | media:2022/04/SP300-14.jpg (4000x3000) |
| SP330 | www:2020/08/Sport-330.jpg (1920x1440) | media:2022/04/Sport-330.jpg (4000x3000) |
| SP360 | www:2020/08/Sport-360-10.jpg (1920x1440) | media:2022/04/Sport-360.jpg (4000x3000) |
| SP390 | www:2015/10/dji_fly_20260130_164906_0398_1769841945900_photo-scaled.jpg (2560x1440) | media:2022/04/SP390.jpg (4896x3264) |
| SP420 | — (no photograph leads the page; a render does) | media:2022/05/DJI_0159.jpg (4407x2936) |
| SP460 | www:2020/10/SP460-e1603724272793.jpg (1280x1104) | media:2022/04/SP460-12.jpg (3456x5184) |
| SP520 | www:2015/10/Sport-520-Selects_01_04_35_15-scaled.jpg (2560x1440) | media:2022/08/Highfield-SP-520-BL-PVC-Mercury-F100-19.jpg (5073x3382) |
| SP560 | www:2023/12/060A0715.jpg (2048x1366) | media:2024/10/060A3524.jpg (8047x5367) |
| SP600 | www:2024/02/SP600-13.jpg (1600x1199) | media:2023/09/SP600-19.jpg (5280x3956) |
| SP660 | www:2024/02/060A1093.jpg (1600x1067) | media:2024/02/SP660-10.jpg (5280x3956) |
| SP700 | www:2022/09/0R6A0453.jpg (2560x1707) | media:2024/02/Sp700-17.jpg (1280x720) |
| SP760 | www:2022/08/060A2016.jpg (1600x1067) | media:2024/04/060A3153.jpg (8035x5359) |
| SP800 | www:2023/09/DJI_0727-1.jpg (2560x1917) | media:2024/08/DJI_0929_RIGINOS.jpg (3992x2992) |
| SP900 | www:2021/09/DJI_20230604143413_0006_D_MFUK.jpg (1920x1438) | media:2024/02/060A3243.jpg (8192x5464) |
| CL260 | www:2022/04/RAN-CL260-8-scaled.jpg (2048x1363) | media:2022/04/CL260-8.jpg (4896x3264) |
| CL290 | www:2015/05/image-6.jpeg (1515x1152) | — |
| CL310 | www:2017/12/5-1-2.jpg (1920x1440) | media:2024/06/9-6.jpg (2048x1152) |
| CL340 | www:2015/05/7C9A9069.jpg (1920x1280) | media:2022/04/DJI_0607.jpg (4048x2272) |
| CL360 | www:2015/05/image-14.jpeg (2048x1366) | media:2024/06/GPTempDownload-37.jpg (5312x2988) |
| CL380 | www:2015/05/DSCF6609.jpg (2560x1920) | media:2022/08/HF-CL380-FCT7-PVC-Navy6-8.jpg (5687x3791) |
| CL400 | www:2024/07/DJI_0812.jpg (2560x1917) | media:2024/11/DJI_0825.jpg (5272x3948) |
| CL420 | www:2020/08/2022-09-29_CL420-10.jpg (1920x1438) | media:2024/06/IMG_0158.jpg (4165x3333) |
| CL460 | www:2020/08/image-1.jpeg (2048x1536) | — |
| PA420 | www:2019/04/DJI_20240711112250_0027_D_MFUK.jpg (2048x1829) | media:2024/09/MFUK8082.jpg (2048x1366) |
| PA460 | www:2019/04/slika-90.jpg (1920x1280) | media:2024/05/slika-98.jpg (5852x3901) |
| PA500 | www:2015/06/Polarstern-3.jpg (2560x1706) | media:2024/06/Polarstern-9.jpg (4000x3000) |
| PA540 | www:2015/06/NY_Vendee-07.jpg (2560x1920) | media:2022/08/HF-PA540-BL-PVC-F115-61.jpg (5918x3945) |
| PA600 | www:2018/01/hfield24522-5758-2.jpg (1920x1280) | media:2022/09/hfield24522-5758-2.jpg (5184x3456) |
| PA660 | www:2016/09/20231011_UTPIV_DEEPLIFE_GOUF_GENERAL_EM-06.jpg (2560x1706) | media:2022/09/hfield24522-2707.jpg (6000x4000) |
| PA700 | www:2022/08/image-17.jpeg (2048x1366) | media:2023/09/060A4673.jpg (7831x5223) |
| PA760 | www:2016/09/DJI_0006-1.jpg (2048x1320) | media:2024/09/MFUK2934-Enhanced-NR.jpg (7379x4919) |
| PA860 | www:2016/09/SLIKA-28.jpg (2560x1706) | media:2024/07/IMG_3196.jpeg (6000x4000) |
| UL240 | www:2020/12/UL240-5-scaled.jpg (2048x1152) | media:2022/04/UL240-1-2-scaled.jpg (2560x1440) |
| UL260 | www:2020/06/UL260-6.jpg (1920x1280) | — |
| UL290 | www:2015/06/image-4.jpeg (2048x1152) | — |
| UL290LT | — (no photograph leads the page; a render does) | media:2022/08/UL290LT-6.jpg (5148x4170) |
| UL310 | — (no photograph leads the page; a render does) | media:2022/08/UL310-with-engine-20.JPG (6000x4000) |
| UL340 | www:2015/06/image-5.jpeg (2048x1536) | — |
| RU230AL | — (no photograph leads the page; a render does) | — |
| RU230KAM | — (no photograph leads the page; a render does) | — |
| RU250AL | — (no photograph leads the page; a render does) | — |
| RU250KAM | — (no photograph leads the page; a render does) | — |
| RU280AL | — (no photograph leads the page; a render does) | — |
| RU280KAM | — (no photograph leads the page; a render does) | — |
| RU320AL | — (no photograph leads the page; a render does) | — |
| RU320KAM | — (no photograph leads the page; a render does) | — |
| ADV7 | adventure:2025/01/084A7278-Enhanced-NR.jpg (2560x1707) | media:2025/01/Uros-Podlogar-Photography-4738.jpg (8640x5760) |
| ADV9 | adventure:2025/10/Slika-78.jpg (2560x1706) | — |
| Coaster 540 | www:2024/08/DJI_20250513103131_0016_D_ALEXMFUK-Enhanced-NR.jpg (2048x1534) | media:2024/11/image00027.jpg (5776x3248) |

## The three best hero candidates per series, and why

Judged by what I looked at (scratchpad copies of the files named, at preview size), preferring on-water photography of the exact model, then whole-boat three-quarter views, then studio.

**Sport.** The SP560 is the model the owner named and it now has real photography: (1) `media:2024/10/060A0622.jpg` — side-on running shot, two aboard, Mercury 115, spray, the whole boat readable; (2) `media:2024/10/060A3389.jpg` — three-quarter stern view of the whole boat at rest against pink granite, the cleanest full-boat still; (3) `www:2023/12/060A0715.jpg` — the model page's own lead, a stern-quarter running shot. For the series as a whole the Sport 800 aerial `media:2024/08/DJI_0929_RIGINOS.jpg` and the Sport 900 at anchor `www:2021/09/DJI_20230604143413_0006_D_MFUK.jpg` are the other two I would put forward; both are boats the dealer's file carries.

**Classic.** (1) `www:2024/07/DJI_0812.jpg` — CL400 console version under way from above, teak deck; (2) `media:2022/08/HF-CL380-FCT7-PVC-Navy6-8.jpg` — a CL380 photographed as built (navy PVC, FCT7 console), the filename itself names the boat; (3) `www:2022/04/RAN-CL260-8-scaled.jpg` — the CL260 in davits on a sailing yacht, which is what a Classic tender is for. The CL360 lead `www:2015/05/image-14.jpeg` (a dark tender running with a Honda) is the best pure action shot but its name is generic and its identification rests on the page alone.

**Patrol.** (1) `www:2018/01/hfield24522-5758-2.jpg` — black PA600 with a Honda 135 alongside a pontoon bar, the boat fills the frame; (2) `www:2019/04/DJI_20240711112250_0027_D_MFUK.jpg` — orange-and-black PA420 towing a foil rider, the series' working-boat character; (3) `media:2024/09/MFUK2934-Enhanced-NR.jpg` — the PA760 media lead from a 2024 shoot (not viewed; chosen on the manufacturer's own ordering). The Patrol 540 page leads with a Vendée Globe New York support boat off the Statue of Liberty — striking, but the model rests on the page only.

**Ultralite.** Photography is thin and small-boat: (1) `www:2020/12/UL240-5-scaled.jpg` — aerial of the tender running with two aboard; (2) `media:2022/08/UL310-with-engine-20.JPG` — named for the model, with an engine fitted (not viewed); (3) `media:2022/08/UL290LT-6.jpg` — a 5148 px studio front view of the LT, the sharpest file in the whole sweep. The Ultralite 260/290/310/340 pages lead with a Classic photograph (`Project-Atticus-Classic-*.jpg`) which is excluded by name.

**Roll-Up.** No photograph can be tied to one model: the four Roll-Up pages share the same `RU-KAM-*.JPG`/`RU-AL-*.JPG` and `nav-annexe-t450-*.jpg` files, so the series has renders only (KAM top views on the media site, AL side views on the model pages). Hero candidates are therefore renders: `media:2022/04/RU230KAM（WH.3.jpg`, `www:2024/07/RU230ALST02WH.jpg`, `www:2024/07/RU320ALSTWH.jpg`.

**Adventure.** (1) `adventure:2025/01/084A7278-Enhanced-NR.jpg` — the ADV7 (marked on the hull) at anchor with two diving off the bow, Honda 250; (2) `adventure:2025/10/HIGHFIELD_ADV9_BF250_2026-80.jpg` — top-down aerial of the ADV9 over clear water; (3) `media:2025/01/Uros-Podlogar-Photography-4738.jpg` — the ADV7 media-library lead (not viewed).

**Coaster.** (1) `www:2024/08/DJI_20250513103131_0016_D_ALEXMFUK-Enhanced-NR.jpg` — the boat is lettered COASTER on its tube, running along a wooded coast with a Honda; (2) `www:2024/08/084A5826-Enhanced-NR.jpg` and (3) `www:2024/08/084A6443-Enhanced-NR.jpg` — the same shoot from the model page (not viewed). Coaster 600: nothing official.

## What is walled or missing

- **Northside Marine's own Highfield photography** (`www.northsidemarine.com.au/highfield-boats/…`): Cloudflare 403 to scripts. Three price-file addresses recorded with `refused: true` (UL240, SP660 HYP, SP800); the dealer's subsite likely holds more N01xxxx-numbered photographs of the exact boats it sells, which only the dealer can export.
- **Coaster 600** (`HB600`): no page on any Highfield site; only third-party classifieds show it. Uncovered.
- **Roll-Up photography**: exists but is shared across the four sizes, so it cannot be attached to an exact model.
- **UL260**: the media-library page is empty; the model page's gallery (`UL260-*.jpg`, 2019–2020) covers it.
- **Sport 300**: the highfieldboats.com model page redirects to the home page (discontinued on the main site); the media library still carries its photographs and 2024 renders.
- The launch post's aerial (`www:2023/09/DJI_20230906171247_0041_D_MFUK.jpg`) shows the **Sport 800**, not the SP560, although the post announces both; it is listed under SP800 with that note.
- `DJI_0789.jpg` exists on both the CL400 and the SP800 media pages (different uploads, same camera counter); both are left out rather than guessed.

## Brand marks

`highfield-boats.svg` and `highfield-boats_white.svg` (the site header, 2024), `Highfield-Logo-2021.png` (footer), `Highfield-Logo-2021_Horizontal-White.svg` and the ADV range mark `hfadv.png` from the ADV site. Highfield publishes no press-kit or brand-guidelines page (the `/downloads/` page holds only the brochure), so the marks are the site's own files.

## Colourway codes

The price file writes TUBE-HULL-UPHOLSTERY (`W-W-WB`, `LG-W-DB`, …). The media library writes the same codes but sometimes `WH` for the white tube and a lowercase `l` for `I` (ivory); `variant` here is normalised to the price file's spelling and the note says when the filename differs. The older single-token renders (`CL380ST-WH.3`, `UL240ST-LG.1`, all Roll-Up renders) carry the tube colour only; for Roll-Up that matches the seed's `WH`/`LG` tokens, for the others it does not identify the hull/upholstery and the `variant` is left as the single token.

## Failures (addresses that did not serve)

| status | type | address |
|---|---|---|
| 404 | text/html | https://media.highfieldboats.com/wp-content/uploads/2022/04/DJI_0989.jpg |
| 404 | text/html | https://media.highfieldboats.com/wp-content/uploads/2022/04/DJI_0986.jpg |
| 404 | text/html | https://media.highfieldboats.com/wp-content/uploads/2022/04/DJI_0964.jpg |
| 404 | text/html | https://media.highfieldboats.com/wp-content/uploads/2022/04/DJI_0241.jpg |
