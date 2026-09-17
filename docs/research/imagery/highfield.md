# Highfield imagery sweep (2026-09-16, followed up 2026-09-17)

Companion to `highfield.json` (1233 records). Every record is one address, verified live with an HTTP request (status, content-type, byte size, and pixel size read by sharp from the file's own header): 1195 on 2026-09-16, 38 more on 2026-09-17. Nothing is attached to a model by resemblance: a picture is listed under a model only when its filename names that model, or when it sits on that model's own page on a Highfield site and on no other model's page. Where the second rule is the only basis, the record's `note` says so.

**Read [The follow-up](#the-follow-up-2026-09-17-answering-the-critique) first if you are the packer.** It carries the join key (`seedModelCodes`), the measurement that settles how a hull-level picture attaches to an ST/EW/LS/FT/LT/WL SKU, and the one model that has no picture anywhere.

## What the seed holds (measured from `tools/seed/legacy/extracts/b2_data.json`)

588 Highfield rows, 73 distinct model tokens, seven series prefixes: **SP Sport (199 rows), CL Classic (144), PA Patrol (130), UL Ultralite (64), RU Roll-Up (32), ADV Adventure (12), Coaster (7)**. The task brief also named an "Ocean Master OM" series; the seed carries no OM row, so none is covered here. The 73 tokens collapse to 50 model keys for imagery (the price file itself assigns one render to e.g. `CL310`, `CL310FT` and `CL310LS`, and to `PA540 Open` and `PA540ST`; `UL290LT` is kept apart from `UL290` because it has photographs of its own); each record carries `seedModels`, the exact seed tokens it applies to.

## Sources read

| source | what it is | what it yields |
|---|---|---|
| `media.highfieldboats.com` (the "Visit our media site" link in Highfield's own footer) | Highfield's media library: one page per model with an **Images** section (photographs, each with a download link) and a **Renders** section (colourway renders). Footer "© 2026 Highfield Boats"; no usage terms stated anywhere on the site. | the on-water photography this workstream was missing, per model |
| `www.highfieldboats.com/boat/<series>/<model>/` | the product pages: a lead photograph, a gallery, the colourway renders, and a General Arrangement PDF. Footer "Copyright 2026 Highfield Boats Co., Ltd."; no usage terms. | the per-model cover (the lead image) the original app lost |
| `adventure.highfieldboats.com` | the ADV range site (ADV7, ADV9) | ADV photography and the five ADV9 colourway PNGs (the price file's own addresses; recorded as records on 2026-09-17 so the five ADV9 SKUs are not blank in the ledger) |
| `www.highfieldboats.com/new-sport-560-and-sport-800-models-enter-the-highfield-range/` and `/news/`, `/stories/` | press posts | one launch aerial (it shows the Sport 800, see below); the stories are ambassador and expedition pieces with no model named in the pictures, so nothing from them is listed |
| `www.highfieldboats.com/downloads/` | the 2025 brochure PDF (`2025-Highfield-Brochure_V4_Web.pdf`) | not listed as an image; a brochure's pictures are not individually addressable |
| Highfield Boats Australia | `highfieldboats.com.au` answers 301 to `highfieldboats.com`; the importer page (`/importers/australia/`) names Peter Pembroke and no separate site | nothing separate to read |
| `www.northsidemarine.com.au/highfield-boats/` | the dealer's own Highfield subsite | Cloudflare "Attention Required" 403 to the script; its three addresses from the price file are recorded with `refused: true` |
| the original app's `COLOR_IMAGES` map | 73 renders across 12 models | lifted verbatim (see below) |

Not used, by rule: boatsales/classified listings, other dealers' pages (Boat Specialists, Sundance, Lewis, Baily, Pier 37), forums, YouTube thumbnails, brandfetch/seeklogo logo mirrors.

## Counts measured

- Records: **1233**. Served (200/206 with an image or PDF content-type): **1226**. Refused by Cloudflare: **3**. Failed or not an image: **4**.
- By kind: hero 76 (73 served), gallery 588 (584 served), render 509 (509 served), plan 55 (55 served), mark 5 (5 served).
- Price-file SKUs a picture can be attached to by Model Code: **587 of the 588 Highfield rows**. The one that cannot is `HB600`, Coaster 600 ST, whose own Image Link in the price file is `#N/A`.
- The COLOR_IMAGES map: **73 entries lifted verbatim, 73 serve today**; 4 of them are addresses the seed already holds and 48 are the price file's own addresses (both flagged in `note` so the packer can skip the copy); 59 were also found live on their model page today and carry that page as `pageUrl`.
- Addresses seen on the pages but deliberately not listed: 91 — 12 shared across models; 1 Roll-Up AL/KAM undetermined; 78 price-file address. (The price file's own addresses are the packer's step 1 and are not repeated here; "shared across models" means the same file sits on more than one model's page, so the model cannot be told.)
- Models covered (at least one served record): **49 of 50**. Not covered: **Coaster 600 ST** (the seed row `HB600` carries `#N/A`; re-checked 2026-09-17, see the follow-up).
- Records carrying `seedModelCodes`, the price file's own Model Codes: **1228 of 1233**. The five without are the brand marks, which belong to no model. **450** of the 1228 name four codes or fewer, i.e. they are pinned to one colourway rather than to a hull.

## Why 206 appears

The verifier asks for the first 128 KiB with a Range header so that sharp can read the pixel size from the header without downloading a 5 MB original; a server that honours the range answers **206 Partial Content**, which means the file is served. `bytes` is the full size from the Content-Range header.

## Per model

| model | series | seed tokens | seed SKUs | hero | gallery | render | plan | served / refused / failed | largest width | note |
|---|---|---|---|---|---|---|---|---|---|---|
| SP300 | Sport | SP300 | 15 | 1 | 7 | 16 | 0 | 24 / 0 / 0 | 4000 |  |
| SP330 | Sport | SP330 | 15 | 2 | 7 | 16 | 1 | 26 / 0 / 0 | 4000 |  |
| SP360 | Sport | SP360 | 15 | 2 | 17 | 17 | 1 | 37 / 0 / 0 | 4000 |  |
| SP390 | Sport | SP390 | 15 | 2 | 19 | 17 | 1 | 39 / 0 / 0 | 5184 |  |
| SP420 | Sport | SP420 | 15 | 1 | 7 | 17 | 1 | 22 / 0 / 4 | 5760 |  |
| SP460 | Sport | SP460 | 15 | 2 | 24 | 17 | 1 | 44 / 0 / 0 | 5184 |  |
| SP520 | Sport | SP520 | 15 | 2 | 5 | 16 | 1 | 24 / 0 / 0 | 6000 |  |
| SP560 | Sport | SP560 | 15 | 2 | 7 | 18 | 1 | 28 / 0 / 0 | 8192 |  |
| SP600 | Sport | SP600 | 15 | 2 | 26 | 17 | 1 | 46 / 0 / 0 | 5280 |  |
| SP660 | Sport | SP660 | 16 | 3 | 21 | 10 | 1 | 34 / 1 / 0 | 5280 |  |
| SP700 | Sport | SP700ST, SP700WL(Windlass) | 16 | 2 | 29 | 14 | 1 | 46 / 0 / 0 | 5472 |  |
| SP760 | Sport | SP760ST, SP760WL(Windlass) | 16 | 2 | 21 | 13 | 1 | 37 / 0 / 0 | 8192 |  |
| SP800 | Sport | SP800 | 8 | 3 | 25 | 10 | 1 | 38 / 1 / 0 | 8192 |  |
| SP900 | Sport | SP900 | 8 | 2 | 28 | 17 | 1 | 48 / 0 / 0 | 8192 |  |
| CL260 | Classic | CL260 | 9 | 2 | 21 | 13 | 1 | 37 / 0 / 0 | 5184 |  |
| CL290 | Classic | CL290, CL290FT | 18 | 1 | 17 | 12 | 3 | 33 / 0 / 0 | 2560 |  |
| CL310 | Classic | CL310, CL310FT, CL310LS | 27 | 2 | 16 | 10 | 5 | 33 / 0 / 0 | 7939 |  |
| CL340 | Classic | CL340, CL340FT, CL340LS | 27 | 2 | 24 | 10 | 1 | 37 / 0 / 0 | 5663 |  |
| CL360 | Classic | CL360, CL360LS | 18 | 2 | 23 | 13 | 1 | 39 / 0 / 0 | 5312 |  |
| CL380 | Classic | CL380, CL380LS | 18 | 2 | 20 | 9 | 1 | 32 / 0 / 0 | 5687 |  |
| CL400 | Classic | CL400 | 9 | 2 | 9 | 13 | 1 | 25 / 0 / 0 | 5272 |  |
| CL420 | Classic | CL420 | 9 | 2 | 9 | 9 | 1 | 21 / 0 / 0 | 5272 |  |
| CL460 | Classic | CL460 | 9 | 1 | 0 | 6 | 1 | 8 / 0 / 0 | 2048 |  |
| PA420 | Patrol | PA420 | 10 | 2 | 17 | 14 | 1 | 34 / 0 / 0 | 3840 |  |
| PA460 | Patrol | PA460 | 10 | 2 | 12 | 15 | 2 | 31 / 0 / 0 | 5852 |  |
| PA500 | Patrol | PA500 | 10 | 2 | 9 | 10 | 2 | 23 / 0 / 0 | 6000 |  |
| PA540 | Patrol | PA540 Open, PA540ST | 20 | 2 | 8 | 9 | 2 | 21 / 0 / 0 | 5918 |  |
| PA600 | Patrol | PA600 Open, PA600EW, PA600ST | 30 | 2 | 12 | 8 | 2 | 24 / 0 / 0 | 5184 |  |
| PA660 | Patrol | PA660EW, PA660ST | 20 | 2 | 15 | 8 | 2 | 27 / 0 / 0 | 6000 |  |
| PA700 | Patrol | PA700EW, PA700ST | 10 | 2 | 13 | 10 | 2 | 27 / 0 / 0 | 8082 |  |
| PA760 | Patrol | PA760EW, PA760ST | 10 | 2 | 32 | 10 | 2 | 46 / 0 / 0 | 8192 |  |
| PA860 | Patrol | PA860EW, PA860ST | 10 | 2 | 12 | 10 | 1 | 25 / 0 / 0 | 6000 |  |
| UL240 | Ultralite | UL240, UL240LT | 16 | 3 | 20 | 13 | 1 | 36 / 1 / 0 | 2560 |  |
| UL260 | Ultralite | UL260, UL260LT | 16 | 1 | 23 | 5 | 1 | 30 / 0 / 0 | 1920 |  |
| UL290 | Ultralite | UL290, UL290LT | 16 | 1 | 0 | 10 | 1 | 12 / 0 / 0 | 2048 |  |
| UL290LT | Ultralite | UL290LT | 8 | 1 | 3 | 0 | 0 | 4 / 0 / 0 | 5238 | the only LT with photographs of its own |
| UL310 | Ultralite | UL310 | 8 | 1 | 3 | 10 | 1 | 15 / 0 / 0 | 6000 |  |
| UL340 | Ultralite | UL340 | 8 | 1 | 0 | 10 | 1 | 12 / 0 / 0 | 2048 |  |
| RU230AL | Roll-Up | RU230AL | 4 | 0 | 0 | 2 | 1 | 3 / 0 / 0 | 1920 | renders only |
| RU230KAM | Roll-Up | RU230KAM | 4 | 0 | 0 | 8 | 0 | 8 / 0 / 0 | 1920 | renders only |
| RU250AL | Roll-Up | RU250AL | 4 | 0 | 0 | 2 | 1 | 3 / 0 / 0 | 1920 | renders only |
| RU250KAM | Roll-Up | RU250KAM | 4 | 0 | 0 | 8 | 0 | 8 / 0 / 0 | 1920 | renders only |
| RU280AL | Roll-Up | RU280AL | 4 | 0 | 0 | 3 | 1 | 4 / 0 / 0 | 3502 | renders only |
| RU280KAM | Roll-Up | RU280KAM | 4 | 0 | 0 | 9 | 0 | 9 / 0 / 0 | 3350 | renders only |
| RU320AL | Roll-Up | RU320AL | 4 | 0 | 0 | 3 | 1 | 4 / 0 / 0 | 3398 | renders only |
| RU320KAM | Roll-Up | RU320KAM | 4 | 0 | 0 | 8 | 0 | 8 / 0 / 0 | 1920 | renders only |
| ADV7 | Adventure | ADV7 | 7 | 2 | 7 | 0 | 0 | 9 / 0 / 0 | 9504 |  |
| ADV9 | Adventure | ADV9 (Dune), ADV9 (Mangrove), ADV9 (Ocean), ADV9 (Polar), ADV9 (Sky) | 5 | 2 | 8 | 5 | 0 | 15 / 0 / 0 | 7008 | five colourway renders added 2026-09-17 |
| Coaster 540 | Coaster | Coaster 540 ST, Coaster 540 open | 6 | 2 | 12 | 9 | 2 | 25 / 0 / 0 | 5776 |  |
| Coaster 600 | Coaster | Coaster 600 ST | 0 | 0 | 0 | 0 | 0 | 0 / 0 / 0 | - | no official picture exists, see the follow-up |

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
| ADV9 | adventure:2025/10/Slika-78.jpg (2560x1706) | — (no media-library page; the press release's www:2026/09/Slika-31.jpg at 7008x4672 is the better cover) |
| Coaster 540 | www:2024/08/DJI_20250513103131_0016_D_ALEXMFUK-Enhanced-NR.jpg (2048x1534) | media:2024/11/image00027.jpg (5776x3248) |

## The three best hero candidates per series, and why

Judged by what I looked at (scratchpad copies of the files named, at preview size), preferring on-water photography of the exact model, then whole-boat three-quarter views, then studio.

**Sport.** The SP560 is the model the owner named and it now has real photography: (1) `media:2024/10/060A0622.jpg` — side-on running shot, two aboard, Mercury 115, spray, the whole boat readable; (2) `media:2024/10/060A3389.jpg` — three-quarter stern view of the whole boat at rest against pink granite, the cleanest full-boat still; (3) `www:2023/12/060A0715.jpg` — the model page's own lead, a stern-quarter running shot. For the series as a whole the Sport 800 aerial `media:2024/08/DJI_0929_RIGINOS.jpg` and the Sport 900 at anchor `www:2021/09/DJI_20230604143413_0006_D_MFUK.jpg` are the other two I would put forward; both are boats the dealer's file carries.

**Classic.** (1) `www:2024/07/DJI_0812.jpg` — CL400 console version under way from above, teak deck; (2) `media:2022/08/HF-CL380-FCT7-PVC-Navy6-8.jpg` — a CL380 photographed as built (navy PVC, FCT7 console), the filename itself names the boat; (3) `www:2022/04/RAN-CL260-8-scaled.jpg` — the CL260 in davits on a sailing yacht, which is what a Classic tender is for. The CL360 lead `www:2015/05/image-14.jpeg` (a dark tender running with a Honda) is the best pure action shot but its name is generic and its identification rests on the page alone.

**Patrol.** (1) `www:2018/01/hfield24522-5758-2.jpg` — black PA600 with a Honda 135 alongside a pontoon bar, the boat fills the frame; (2) `www:2019/04/DJI_20240711112250_0027_D_MFUK.jpg` — orange-and-black PA420 towing a foil rider, the series' working-boat character; (3) `media:2024/09/MFUK2934-Enhanced-NR.jpg` — the PA760 media lead from a 2024 shoot (not viewed; chosen on the manufacturer's own ordering). The Patrol 540 page leads with a Vendée Globe New York support boat off the Statue of Liberty — striking, but the model rests on the page only.

**Ultralite.** Photography is thin and small-boat: (1) `www:2020/12/UL240-5-scaled.jpg` — aerial of the tender running with two aboard; (2) `media:2022/08/UL310-with-engine-20.JPG` — named for the model, with an engine fitted (not viewed); (3) `media:2022/08/UL290LT-6.jpg` — a 5148 px studio front view of the LT, the sharpest file in the whole sweep. The Ultralite 260/290/310/340 pages lead with a Classic photograph (`Project-Atticus-Classic-*.jpg`) which is excluded by name.

**Roll-Up.** No photograph can be tied to one model: the four Roll-Up pages share the same `RU-KAM-*.JPG`/`RU-AL-*.JPG` and `nav-annexe-t450-*.jpg` files, so the series has renders only (KAM top views on the media site, AL side views on the model pages). Hero candidates are therefore renders: `media:2022/04/RU230KAM（WH.3.jpg`, `www:2024/07/RU230ALST02WH.jpg`, `www:2024/07/RU320ALSTWH.jpg`.

**Adventure.** Revised 2026-09-17, after the ADV9's own press photography was found: (1) `www:2026/09/Slika-31.jpg` — the ADV9 at **7008×4672**, the original behind Highfield's award-nomination release and the largest ADV file anywhere; (2) `adventure:2025/01/084A7278-Enhanced-NR.jpg` — the ADV7 (marked on the hull) at anchor with two diving off the bow, Honda 250; (3) `adventure:2025/10/HIGHFIELD_ADV9_BF250_2026-80.jpg` — top-down aerial of the ADV9 over clear water. `media:2025/01/Uros-Podlogar-Photography-4738.jpg` is the ADV7 media-library lead at 8640 px (not viewed) and is the fourth.

**Coaster.** (1) `www:2024/08/DJI_20250513103131_0016_D_ALEXMFUK-Enhanced-NR.jpg` — the boat is lettered COASTER on its tube, running along a wooded coast with a Honda; (2) `www:2024/08/084A5826-Enhanced-NR.jpg` and (3) `www:2024/08/084A6443-Enhanced-NR.jpg` — the same shoot from the model page (not viewed). Coaster 600: nothing official.

## The follow-up (2026-09-17): answering the critique

Nine findings were raised against the Highfield ledger. What follows is what was measured against them, what changed in `highfield.json`, and what is still open. Everything here was re-read live on 2026-09-17.

### 1. The join key: `seedModelCodes`

Every record now carries `seedModelCodes`, an array of the price file's own **Model Codes** (`HBS167`, `HBP255`, `HBADV9008`, …) read straight from `tools/seed/legacy/extracts/b2_data.json` column D. A packer joins on those and never on a name.

How each list is built, so a reader can check it:

- **Colourway level (450 records).** The record has a `variant` and the price file carries a row with that exact colour triple under one of the record's `seedModels`. The list is then only those rows' codes — usually two, the HYP and the PVC build of one colourway.
- **Hull level (778 records).** Everything else: a photograph, a plan, or a render whose colour label the price file does not use. The list is every code of the record's `seedModels`, which is the honest statement that this picture belongs to the hull and not to one SKU.
- **No list (5 records).** The brand marks. They belong to the brand, not a model.

Coverage: **587 of the 588 Highfield rows** in the price file are named by at least one record's `seedModelCodes`. The exception is `HB600`.

Two colour vocabularies had to be reconciled and the reconciliation is measured, not assumed. Highfield's media library names a Classic or Ultralite colourway by the tube colour alone — `WH`, `LG`, `DG`, `BL` — while the price file names it by the full triple. The Classic 400, 420 and 460 product pages label a swatch with the short code **and** link a file whose own name carries the triple: `BL → CL460ST04B-G-DG2.jpg`, `DG → …DG-G-DG2.jpg`, `LG → …LG-W-WD2.jpg`, `WH → …W-W-WD2-1.jpg` — four for four, on three pages. That mapping is applied to the Classic records, and read across to the Ultralite (whose four colours `W-W`, `LG-W`, `DG-G`, `B-G` begin with the same letters); every record where it was used says so in its `note`. 89 records were resolved this way.

### 2. Coaster 600 ST (`HB600`) — still open, and now exhaustively so

One SKU, not a family: `Coaster 600 ST (PVC) DG-G-DB`, code `HB600`. Its own Image Link in the price file is the string `#N/A`, so the dealer's file does not claim a picture either.

Checked on 2026-09-17, all four negative:

- `https://www.highfieldboats.com/boat-sitemap.xml` lists 59 boat pages. The only Coaster is `…/the-patrol-range/patrol-540-coaster/`.
- `https://www.highfieldboats.com/?s=coaster+600` returns no result.
- `https://media.highfieldboats.com/` links 50 two-level model pages in its own navigation (plus `adv7`); the only Coaster is `patrol/pa540-coaster/`. `…/coaster/` and `…/coaster/cs600/` both answer 404.
- `post-sitemap.xml` holds 54 press posts; none announces a Coaster 600.

So the model is not published by its manufacturer, its importer or its dealer. **No picture is listed, and none should be invented.** The screen must show the Coaster 600 ST with an empty frame and say why.

### 3. The five ADV9 colourways — closed

`adventure.highfieldboats.com/boat/adv/adv9/` carries a section headed **COLOUR SCHEMES** in which each render sits behind a `<div class="model_name">` that names it. Five records added, one per colourway, each pinned to its single SKU:

| colourway | code | address | measured |
|---|---|---|---|
| Dune | `HBADV9008` | `adventure:2025/10/Dune.png` | 206, image/png, 2560×1440 |
| Mangrove | `HBADV9009` | `adventure:2025/10/Mangrove.png` | 206, image/png, 2560×1440 |
| Ocean | `HBADV9010` | `adventure:2025/10/Ocean.png` | 206, image/png, 2560×1440 |
| Polar | `HBADV9011` | `adventure:2025/10/Polar.png` | 206, image/png, 2560×1440 |
| Sky | `HBADV9012` | `adventure:2025/10/Sky.png` | 206, image/png, 2560×1440 |

These five are also the price file's own addresses; the `note` on each says so, so the packer copies them once.

Three more ADV9 photographs came from Highfield's own news channel, which the first sweep had not mined for this model:

- `www:2026/09/Slika-31.jpg` — **7008×4672**, the full-resolution original behind the ADV9 award-nomination release. This is now the ADV9 hero; it is 2.7× the width of the 2560 px frame that held that job.
- `www:2026/09/ADV9-Nomination-Launch-Photo_Square.jpg` — 5239×5240, a square launch frame (a tile, not a cover).
- `www:2026/01/Fast-Speed-Lateral-Cam.jpg` — 2560×1438, the one photograph on the boot Düsseldorf launch release.

The ADV9 goes from 7 records and one usable hero to **15 records, 2 heroes, 5 renders**.

Not listed: `Slika-72`, `Slika-33` and `Slika-10` on the ADV range home page. That page runs one carousel over both ADV7 and ADV9 and names neither, so the model cannot be told from it.

### 4. Patrol Open / ST / EW, Sport ST / WL, Classic LS / FT, Coaster open / ST — measured, not assumed

The critique's worry is real and the answer is a measurement, made on the price file itself.

Take every pair of Highfield rows that differ only by a configuration suffix and that share a material and a colour triple — `PA760ST (HYP) B-B-B` against `PA760EW (HYP) B-B-B`, and so on across all seventeen families. There are **133 such comparison groups, 161 pairs**. Of the 133 groups, 4 have `#N/A` or `0` on one side. Of the remaining **129, the Image Link is identical in 129 and different in 0.**

Column by column, `PA760ST (HYP) B-B-B` (`HBP255`) and `PA760EW (HYP) B-B-B` (`HBP200`) differ in exactly two fields across the whole row: the name and the Model Code. Hull length, beam, weight, base cost, image — all identical.

And the manufacturer agrees. `https://media.highfieldboats.com/patrol/pa760/` and `https://www.highfieldboats.com/boat/the-patrol-range/patrol-760/` publish one photograph set and one render set for the hull. Every Patrol render is named for the console and the seats — `PA760SB+SUS970+JK250`, `PA700SB`, `PA540SB03` — and never for a top or a wheelhouse. The Sport 700 and Sport 760 pages list **Windlass under "Optional Equipment"**, which is what `SP700WL` buys; there is one set of eight colourway renders per hull, and Highfield names the SP700 files `SP700ST…` regardless. No Classic page distinguishes LS from FT in its photography or its renders.

So the ledger attaches these pictures at hull level because that is what the price file and the manufacturer both do — not because the sweep could not tell them apart. The `seedModelCodes` list on each such record names **every** SKU it covers, so nothing is silently dropped and nothing is silently widened, and the `note` on each model's cover frame says the sentence out loud.

One configuration artefact does exist, and it is now pinned:

| file | what it is | now attached to |
|---|---|---|
| `www:2015/05/CL290FT_layouts.jpg` | the deck-layout diagram for the CL290's FT floor | `variant: FT`, the nine `CL290FT` SKUs |
| `www:2015/05/CL310FT_layouts.jpg` | the same for the CL310 | `variant: FT`, the nine `CL310FT` SKUs |
| `www:…/CL290ST_layouts.jpg`, `CL310ST_layouts.jpg`, `CL310FCT_layouts.jpg` | ST and FCT floors | left at hull level; `ST` and `FCT` are Highfield floor codes the price file does not carry |

No `LS` layout diagram exists on any Highfield surface: the nine Classic product pages and the nine Classic media-library pages were read on 2026-09-17 and none carries one.

### 5. UL240LT and UL260LT — the ledger was right, and now says why

`UL290LT` is kept apart from `UL290` because Highfield publishes four files literally named `UL290LT-3/4/5/6.jpg` on `media.highfieldboats.com/ultralite/ul290/`, one of them a 5148 px studio front view.

**No file named `UL240LT` or `UL260LT` exists anywhere on Highfield's sites.** Checked on 2026-09-17: `media…/ultralite/ul240/`, `media…/ultralite/ul260/`, `www…/ultralite-240/` and `www…/ultralite-260/`. So the inconsistency the critique found inside the Ultralite series is a faithful reflection of what the manufacturer publishes, not a slip. The 16 `UL240LT` and `UL260LT` SKUs are carried in `seedModels` and in `seedModelCodes` on the UL240 and UL260 records, so they are attached, not dropped.

The UL260's thinness was real and is now fixed. It had 25 records, one hero and two renders against the UL240's thirteen. Six records added from `www…/ultralite-260/`: the three colourway renders the sweep had left to the packer (`UL260W-W-2-1.jpg`, `UL260DG-G-2.jpg`, `UL260B-G.2.jpg` — W-W, DG-G, B-G, so all four Ultralite colours now have one) and two gallery frames (`UL260-1-3.jpg`, `UL260-5-4.jpg`). The UL240 gained its page's current gallery: `DJI_20240518144545_0013_D`, `DJI_20240518144638_0015_D`, `DJI_20240619134249_0050_D`, `IMG_6427` and `R6_D2736`, five frames between 1707 and 2560 px.

### 6. Coaster 540 open and Coaster 540 ST — closed

The 25 Coaster records used to carry `seedModels: ["Coaster 540", "Coaster 540 open"]`, and `Coaster 540` is not a token the price file has. All 25 now carry the two real tokens, `Coaster 540 open` and `Coaster 540 ST`, and their six Model Codes (`HBP271`–`HBP276`). The price file gives the open and the ST the same three renders, colour for colour, which is the 129-for-129 measurement above.

### 7. Colourway holes found while re-reading, and closed

Re-reading all 50 product pages' colour sections against the ledger turned up 232 swatches, of which 129 were not held. **106 of those 129 are the price file's own addresses**, which the first sweep deliberately did not repeat — they are the packer's step 1. The remaining 23 were real, and 20 are in the seed:

| model | what was missing | added |
|---|---|---|
| SP700 | the page publishes eight colourway renders named `SP700ST…`; the ledger held six frames over four colourways | 7 renders, so all eight colourways are covered (renders 6 → 14) |
| SP760 | `I-B-C`, a seed colourway with no render at all | `SP760-I-B-C-top-view.jpg`, 1920×1545 |
| SP520 | the page's current renders, re-cut 2025-12-15 by their own filenames | 8 renders at 3840×2978 |
| PA540 | the page's current `B-B-B`, re-cut 2025-10-29 | 1 render at 3840×2625 |
| RU280KAM, RU280AL, RU320AL | each had white renders only; the seed carries an `LG` colourway for all three | 3 renders, 3350–3502 px |

One record was mis-filed rather than missing: `www:2022/09/SP700STI-B-B.jpg` sat as an untyped `gallery` frame. It is the eighth swatch on the SP700 page, which Highfield labels `I-B-B` while the price file calls the same scheme `I-B-C` — the other seven swatches carry the price file's names unchanged, so this is the eighth by elimination. It is now `kind: render`, `variant: I-B-C`, and its note states both names.

Not added, and why: the Escape 650/750 renders (no Escape row in the seed), the Roll-Up 200 renders (no RU200 row in the seed), and the `UL240-CK-2024.12.26.pdf` / `UL260-CK-2024.12.26.pdf` downloads — the page does not label what `CK` is and the PDF was not read, so naming its `kind` would be a claim rather than a reading.

### 8. Records filed on `series` alone

Highfield has five such records and all five are brand marks, which is correct — a mark belongs to the brand. The 127 model-less records the critique counted are in the Formosa, ePropulsion, Dunbier, Mackay and GFAB groups, not this one, so the `scope: 'series'` question is theirs to answer.

### 9. Sources

Unchanged and still clean. Every address added on 2026-09-17 is on `www.highfieldboats.com` or `adventure.highfieldboats.com`, both the manufacturer's own.

### What is still open after this pass

- **Coaster 600 ST (`HB600`)**: one SKU, no picture anywhere official. Nothing was invented.
- **Northside Marine's own Highfield photography**: still behind Cloudflare, three addresses still `refused: true`. Only the dealer can export it.
- **Roll-Up photography**: the four sizes still share the same `RU-KAM-*` and `RU-AL-*` files, so the series still has renders only. Eight models, no photograph that can be tied to one of them.
- **CL460, UL290, UL340**: renders and a plan but no gallery photography on any Highfield surface. CL460 has a single 2048 px hero.
- **The colourway short-code mapping** (`WH`/`LG`/`DG`/`BL`) is measured on three Classic pages and read across to the Ultralite. If the packer wants that read-across removed, the 89 records that used it name it in their `note` and can be dropped back to hull level.
- **`seedModelCodes` is Highfield-only.** The other four group files still join by name. The same column-D read would do the same job for them.

## What is walled or missing

- **Northside Marine's own Highfield photography** (`www.northsidemarine.com.au/highfield-boats/…`): Cloudflare 403 to scripts. Three price-file addresses recorded with `refused: true` (UL240, SP660 HYP, SP800); the dealer's subsite likely holds more N01xxxx-numbered photographs of the exact boats it sells, which only the dealer can export.
- **Coaster 600 ST** (`HB600`): no page on any Highfield site, and the price file's own Image Link for it is `#N/A`. Re-checked exhaustively on 2026-09-17 — see follow-up §2. Uncovered.
- **Roll-Up photography**: exists but is shared across the four sizes, so it cannot be attached to an exact model.
- **UL260**: the media-library page is empty; the model page's gallery (`UL260-*.jpg`, 2019–2020) covers it. Its four colourway renders and two more gallery frames were added on 2026-09-17 (follow-up §5); 30 records now, against 25.
- **UL240LT, UL260LT**: no file named `UL240LT` or `UL260LT` exists on any Highfield surface, so the two have no picture of their own and ride on the UL240 and UL260 records. `UL290LT` is the only LT Highfield photographs separately (follow-up §5).
- **Sport 300**: the highfieldboats.com model page redirects to the home page (discontinued on the main site); the media library still carries its photographs and 2024 renders.
- The launch post's aerial (`www:2023/09/DJI_20230906171247_0041_D_MFUK.jpg`) shows the **Sport 800**, not the SP560, although the post announces both; it is listed under SP800 with that note.
- `DJI_0789.jpg` exists on both the CL400 and the SP800 media pages (different uploads, same camera counter); both are left out rather than guessed.

## Brand marks

`highfield-boats.svg` and `highfield-boats_white.svg` (the site header, 2024), `Highfield-Logo-2021.png` (footer), `Highfield-Logo-2021_Horizontal-White.svg` and the ADV range mark `hfadv.png` from the ADV site. Highfield publishes no press-kit or brand-guidelines page (the `/downloads/` page holds only the brochure), so the marks are the site's own files.

## Colourway codes

The price file writes TUBE-HULL-UPHOLSTERY (`W-W-WB`, `LG-W-DB`, …). The media library writes the same codes but sometimes `WH` for the white tube and a lowercase `l` for `I` (ivory); `variant` here is normalised to the price file's spelling and the note says when the filename differs. The older single-token renders (`CL380ST-WH.3`, `UL240ST-LG.1`, all Roll-Up renders) carry the tube colour only; for Roll-Up that matches the seed's `WH`/`LG` tokens, for the others `variant` is left as the single token the file uses.

Updated 2026-09-17: `variant` is still whatever the source calls it, but `seedModelCodes` now carries the bridge. Where a single-token Classic or Ultralite `variant` could be tied to a price-file colourway, it was — by the four-for-four mapping the Classic 400/420/460 pages publish (`BL → B-G-DG`, `DG → DG-G-DG`, `LG → LG-W-WD`, `WH → W-W-WD`), read across to the Ultralite's `B-G`/`DG-G`/`LG-W`/`W-W`. 89 records were resolved that way and each says so in its `note`; see follow-up §1.

## Failures (addresses that did not serve)

| status | type | address |
|---|---|---|
| 404 | text/html | https://media.highfieldboats.com/wp-content/uploads/2022/04/DJI_0989.jpg |
| 404 | text/html | https://media.highfieldboats.com/wp-content/uploads/2022/04/DJI_0986.jpg |
| 404 | text/html | https://media.highfieldboats.com/wp-content/uploads/2022/04/DJI_0964.jpg |
| 404 | text/html | https://media.highfieldboats.com/wp-content/uploads/2022/04/DJI_0241.jpg |
