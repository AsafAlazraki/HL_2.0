# Stabicraft and Surtees imagery sweep (2026-09-17)

Companion to `stabicraft-surtees.json` (**414 records**). Every address in the JSON was requested over HTTP on 2026-09-17; `status`, `contentType`, `bytes`, `width` and `height` are what that request returned and what `sharp` read out of the bytes — not what a page claimed. Nothing was downloaded into `public/`. No address already held in `tools/seed/legacy/extracts/images.json` is re-listed (checked: **0 overlaps**).

Both brands photograph their boats properly on the water, so this sweep is unusually rich: 53 heroes, 116 gallery frames, 221 renders, 22 plans, 2 brand marks.

## Sources and how each was read

| Source | What it is | How it was read |
|---|---|---|
| `stabicraft.com/the-boats/<model>/` (14 model pages) | Stabicraft's own model pages. Assets live in SilverStripe under `/assets/Uploads/<Model>/{Gallery-Images,Other-Images,Feature-Images,Thumbnail-Images,Package-Images}/` plus a shared `/Boat-Renders/` folder | Fetched by script; every `/assets/Uploads/...` path pulled out of the HTML and grouped by its base file. The 14 pages come from `stabicraft.com/sitemap.xml` (robots.txt: `Allow: /`). |
| `stabicraft.com` SilverStripe derivatives | Each file is published at several `__FillW<base64 [w,h]>` sizes **and** at its unsuffixed original | The original is what is recorded. Measured: for gallery files the original and the largest `Fill` are byte-identical; for the 1550 Frontier hero the `Fill` at 2560×1440 is an upscale of a 1700×700 original, so the original is recorded. |
| `www.surteesboats.com/our-range/boat/<slug>` (23 model pages, 18 of them in the seed) | Surtees' own model pages (Next.js). Each page carries a `__NEXT_DATA__` payload with the model's `headerSection.image`, `overviewSection.gallery[]`, `specificationsSection.image`, `boatPreviewImage` and `boatColourCombinationPreview[]` with the colour name | Fetched by script and the payload parsed, so each picture is taken from the structure Surtees itself files it under, not from guessing at the HTML. Pages come from `surteesboats.com/sitemap-boats.xml`. |
| `www.cms.surteesboats.com` (Surtees' WordPress media library) | Where all Surtees media actually lives | Recorded as the address, **not** the `surteesboats.com/_next/image?url=…` optimiser address, because Surtees' own `robots.txt` says `Disallow: /_next`. WordPress `-scaled` copies were swapped for the unscaled master where one answered and was larger — **36 of 36 upgraded**, several from 2000 px to 6000–8192 px. |
| `www.cms.surteesboats.com/wp-json/wp/v2/...` | The CMS's own REST API | Used to confirm the `boat-models` post type and to search the media library for brand marks and for correctly named 620/670 renders. |
| `www.northsidemarine.com.au/stabicraft-boats/` and `/surtees-boats/` | The dealer's own brand subsites | **Refused.** Every request from this session answered `403` (Cloudflare). Recorded as one address per brand with `refused: true` and `status: 403`; nothing was listed or measured from them. |
| `tools/seed/legacy/extracts/{b2_data.json, images.json}` | The price file's own `Image Link` column for rows 143–224 and 1006–1007, and the ledger | Cross-checked: 54 of the 56 seed rows' addresses are already held. The two that are not are named under *Gaps*. |
| `C:\Users\Asaf\dev\HelmLogic\tasks\test-evidence\image-audit.json` | The original app's 718-URL inventory | Grepped. It holds 17 Stabicraft and 16 Surtees addresses, all `northsidemarine.com.au`, all already in the ledger. Nothing new. |

Neither manufacturer publishes a press or media page, a press kit, or any statement about image reuse. Every `licenceNote` says exactly that and claims no permission. Stabicraft's terms page and Surtees' site carry no copyright or image clause.

## Rules applied (honesty first)

- **A picture is attached to a model only when the manufacturer's own folder/payload *and* the file's own evidence agree.** Where they disagreed, the picture was left out and the reason recorded below.
- **Dimensions in the drawings were measured against the seed.** Stabicraft publishes a plan-view + side-profile drawing per model with the length marked. **Thirteen of the fourteen carry a figure** (the 2350 Ultra Centrecab's does not), and **twelve of those thirteen agree with the seed's own hull length**: 1450 Explorer 4.42 m, 1450 Frontier 4.42 m, 1550 Frontier 4.8 m, 1850 Fisher 5.69 m, 1850 Supercab 5.70 m, 2050 Frontier FT 6.32 m, 2050 Supercab 6.30 m, 2050 Treker 6.3 m, 2350 Supercab 7.17 m (seed 7.16), 2350 Ultracab WT 7.17 m, 2500 Ultracab XL 7.62 m, 2750 Ultra Centrecab 8.4 m. The thirteenth disagrees: the **1550 Fisher** drawing marks 4.64 m where the seed records 4.72 m. The two are measured differently; the record says so and claims nothing. Surtees does the same with `LOA <n>mm` on its spec renders: 5750, 6100, 6500, 7000 mm for the Pro Fishers and 6100, 6500, 7000 mm for the Workmates, plus 4950 mm × 2010 mm beam for the 495 Workmate — every one matching its seed row.
- **One file was re-homed on measured evidence.** `/assets/Uploads/1550-Frontier/Other-Images/1450FR-website.png` is named for the 1450 Frontier but marks 4.8 m × 2.01 m, which is the seed's **1550 Frontier** (the 1450 Frontier is 4.42 m × 1.9 m), and it sits in the 1550-Frontier folder on the 1550 Frontier page. Recorded as the 1550 Frontier's plan, with the reason in the record.
- **`kind` was set by eye, not by filename.** 46 contact sheets and crops were built and looked at before anything was labelled: one per Stabicraft model folder (14), one per Surtees model page (23), one of all 43 Stabicraft renders and package images, one stacking the bottom strip of all 14 Stabicraft drawings so the length figures could be read, one of all 18 Surtees headers, one of all 18 Surtees spec images, and four zoom crops on hull decals. That is how the Stabicraft "package" files were separated: the 2050 Frontier FT, 2050 Supercab, 2350 Supercab, 2350 Ultra Centrecab and 2350 Ultracab WT publish clean three-quarter studio renders per deck package (`kind: render`), while the 1450 Frontier, 1550 Fisher, 1850 Fisher and 1850 Supercab publish photographic banners under the same package names (`kind: gallery`). Both carry the package in `variant`; the note says which it is.
- **Variants match the seed exactly.** Stabicraft's Adventure / Sportfish / Profish / Offshore package names are the seed's own variant rows (`Stabicraft - 1550 Fisher (Adventure)` and so on). 26 package pictures are recorded with the package in `variant`.
- **Surtees colourways carry the colour in `variant`.** 189 colourway renders across 12 models, named from Surtees' own colour picker (`hullColour.boatColour.colourName`). The seed's Paint & Graphics columns (RN..SQ) are **empty on every Surtees row** — measured — so the colour names come from the manufacturer, not the seed, and each record says so.
- **A brand mark is only what is published as a file.** Both sites draw their wordmark as inline SVG, so neither publishes an SVG logo. Surtees' own media library holds the black SURTEES wordmark as a 695×111 PNG (the library titles it "Logo") — that is recorded. Stabicraft publishes only the red **S** device, at 180×180, in its site-icon set — that is recorded, with a note that no wordmark file exists at any address.

## What was deliberately left out, and why

These are pictures the manufacturer's own page serves but that could not be proved to show the seed's model. None is in the JSON.

| Left out | Why |
|---|---|
| The 620 Game Fisher's 32-swatch colour strip (`610-GF-*`, `610-GFF-*`) | The files are named for the predecessor 610 Game Fisher, and the cabin and windscreen in them differ from the 620's own render — compared side by side at 1000 px. Only one correctly named 620 colourway exists in the library (Tasman Blue); it is in the JSON. |
| The 670 Game Fisher's 32-swatch colour strip (`650-GF-*`, `650-GFF-*`) | Same: named for the predecessor 650 Game Fisher, and the cabin differs from the 670's own render. The one correctly named 670 render (Caribbean Blue) is in the JSON. |
| Everything render-like on the 720 Game Fisher page, including the file it uses as its specification image (`700-GFO*`, `700-GFE*`) | Zoomed on the hull decal at 1000 px: it reads **700 GAME FISHER**. These depict the predecessor 700 Game Fisher. The seed has no 700 Game Fisher row, so none of them belongs to anything in the catalogue. |
| The 770 colourway set (`770-GFBF-*`, `770-GFBFF-*`) | Served identically on the 770 Game Fisher **and** 770 Game Fisher XL pages, so no file distinguishes the two. The one file whose decal reads **770 GAME FISHER** is recorded once, against row 222 (770 Game Fisher) only — not against the XL. |
| `2350-Ultra-Centrecab/Gallery-Images/2250UCC-gallery-1..7.jpg` | Named for the 2250 Ultra Centrecab, a separate live Stabicraft model that is **not** in the seed. The 2250's own page uses a different set (`2250ULTRA-CENTRECAB-*`), so these are a naming leftover — but "leftover" is a guess, and the rule is not to guess. The three unnamed drone frames in the same folder (`DJI_0150/0174/0177`) **are** recorded, each with a note saying the attribution rests on the folder and the page. |
| `2050-Treker/Package-Images/treker-adventure.jpg`, `treker-sportfish.jpg` | Not package pictures: one is a helm photograph, the other a marketing composite with overlaid graphics. Nothing in either shows the package. |
| Every `MyStabi/` file on stabicraft.com | Owner-submitted social photographs. They do sit in per-model folders, but they are not the manufacturer's own photography and their provenance is a Facebook file name. |

## Counts measured

| | |
|---|---|
| Records | **414** |
| Answered 200 with a pixel size read from the bytes | **412** |
| Refused, recorded anyway (`refused: true`, 403) | **2** (the dealer's two brand subsites) |
| Dead at origin | **0** |
| By kind | hero 53 · render 221 · plan 22 · gallery 116 · mark 2 |
| By brand | Stabicraft 138 · Surtees 276 |
| Seed rows covered | **56 of 56** — all 37 Stabicraft rows and all 19 Surtees rows |
| Distinct models covered | **32 of 32** (14 Stabicraft, 18 Surtees; the seed's 720 Game Fisher Open and Enc share one manufacturer page) |
| Hosts | `stabicraft.com` · `www.cms.surteesboats.com` · `www.northsidemarine.com.au` (refused) |
| Total bytes if every record were fetched | 189.1 MB |
| 2000 px or wider on the long edge | **48** |
| Largest | 620 Game Fisher hero 8064×6048 · 575 Pro Fisher gallery 8192×5464 · 2050 Supercab package renders 7680×4320 |

Stabicraft's ceiling is 1120×750 for gallery photography and 1700×700 for the page banners, with the plan drawings at 2863×2567 and the package renders at 1700×700 (2050 Supercab: 7680×4320). Surtees' masters are far larger once the `-scaled` copies are bypassed — six heroes are between 3000 and 8064 px.

## Coverage, seed row by seed row

`hero / render / plan / gallery` counts are records in the JSON. "Biggest hero" is the measured long edge. "Ledger" is whether the seed row's own `Image Link` is already held in `images.json`.

| Series | Model | Seed rows | hero / render / plan / gallery | Biggest hero | Ledger |
|---|---|---|---|---|---|
| — | 1450 Explorer | 144 | 3 / 1 / 1 / 3 | 1120 px | held |
| Frontier | 1450 Frontier | 147, 148 | 3 / 1 / 1 / 5 | 1275 px | held |
| Frontier | 1550 Frontier | 150, 151, 152 | 3 / 1 / 1 / 3 | 1700 px | held |
| Frontier | 2050 Frontier FT | 154, 155, 156 | 3 / 4 / 1 / 3 | 1440 px | held |
| Fisher | 1550 Fisher | 159–162 | 3 / 1 / 1 / 7 | 1120 px | held |
| Fisher | 1850 Fisher | 164–167 | 3 / 1 / 1 / 6 | 1120 px | held |
| Supercab | 1850 Supercab | 170, 171, 172 | 3 / 1 / 1 / 5 | 1700 px | held |
| Supercab | 2050 Supercab | 174, 175, 176 | 3 / 4 / 1 / 3 | 1417 px | held |
| Supercab | 2350 Supercab | 178, 179, 180 | 3 / 4 / 1 / 3 | 1120 px | held |
| Treker | 2050 Treker | 183, 184, 185 | 3 / 1 / 1 / 3 | 1120 px | held |
| Ultra | 2350 Ultra Centrecab | 188, 189, 190 | 1 / 4 / 1 / 4 | 1120 px | held |
| Ultra | 2350 Ultracab WT | 192, 193, 194 | **0** / 4 / 1 / 4 | — | held |
| Ultra | 2500 Ultracab XL | 196 | 3 / 1 / 1 / 4 | 1417 px | **not held** |
| Ultra | 2750 Ultra Centrecab | 198 | 3 / 1 / 1 / 3 | 1417 px | held |
| Pro Fisher | 495 Pro Fisher | 202 | 1 / 16 / 0 / 3 | 1170 px | held |
| Pro Fisher | 540 Pro Fisher | 203 | 1 / 16 / 0 / 4 | 1170 px | held |
| Pro Fisher | 575 Pro Fisher | 204 | 1 / 15 / 1 / 3 | 8026 px | held |
| Pro Fisher | 610 Pro Fisher | 205 | 1 / 16 / 1 / 3 | 1170 px | held |
| Pro Fisher | 650 Pro Fisher | 206 | 1 / 15 / 1 / 3 | 4000 px | held |
| Pro Fisher | 700 Pro Fisher | 207 | **0** / 17 / 1 / 1 | — | **none in the seed** |
| Workmate | 495 Workmate | 210 | 1 / 16 / 1 / 3 | 1366 px | held |
| Workmate | 540 Workmate | 211 | **0** / 16 / 0 / 5 | — | held |
| Workmate | 575 Workmate | 212 | 1 / 16 / 0 / 2 | 7151 px | held |
| Workmate | 610 Workmate | 213 | 1 / 15 / 1 / 3 | 1170 px | held |
| Workmate | 650 Workmate | 214 | 1 / 15 / 1 / 3 | 1170 px | held |
| Workmate | 700 Workmate | 215 | 1 / **0** / 1 / 3 | 1170 px | held |
| Game Fisher | 620 Game Fisher | 218 | 1 / 2 / 0 / 4 | 8064 px | held |
| Game Fisher | 670 Game Fisher | 219 | 1 / 1 / 0 / 3 | 3000 px | held |
| Game Fisher | 720 Game Fisher | 220, 221 | 1 / **0** / 0 / 3 | 6000 px | held |
| Game Fisher | 770 Game Fisher | 222 | 1 / 1 / 0 / 3 | 7114 px | held |
| Game Fisher | 770 Game Fisher XL | 223 | 1 / **0** / 0 / 4 | 3000 px | held |
| Game Fisher | 800 Game Fisher | 224 | 1 / 15 / 0 / 5 | 2888 px | held |

## Gaps, walls and things to fix

1. **The seed's 2500 Ultracab XL address is broken and this sweep fixes it.** Row 196 points at `…/2500ULTRACAB-XL-1-v2__FillWzExMjAsNzUwXQ.jpg.webp`, which is why it is the one Stabicraft row the ledger never obtained. That `.jpg.webp` form only exists when the request carries `Accept: image/webp`; without it the host answers 404. The same picture answers 200 at `…/Gallery-Images/2500ULTRACAB-XL-1-v2.jpg`, 1120×750, 790 KB. That address is the model's first hero in the JSON.
2. **The 700 Pro Fisher (row 207) has no picture in the seed at all** — its `Image Link` cell is empty. Surtees publishes no on-water photograph of it either; the page's own header is a studio side render. This sweep gives it 17 renders (the base render, 16 colourways) and the dimensioned `LOA 7000mm` plan. It is the one model in either brand that will have to be drawn as a studio product rather than a scene.
3. **The 2350 Ultracab WT has no exterior photograph from the manufacturer.** Its model page is entirely cockpit, cabin and detail frames plus the three package renders — measured, 22 files, not one exterior. Its hero must come from the dealer's own picture (already held, `Stabicraft-2350-Ultracab-WT-1024x575.png`, 1024×575) or from Northside Marine's photography. This is the weakest cover in the two brands.
4. **The 540 Workmate's page header is a photograph on its trailer on grass, not under way** — recorded as `gallery`, not `hero`, so no one mistakes it for a cover. Same reasoning demoted nothing else.
5. **The 650 and 700 Workmate heroes carry "Hardtop model shown" baked into the image.** The seed's rows are plain Workmate. The note on each record says so; the 575 Workmate's spec render is likewise drawn with the hardtop and carries `variant: "Hardtop"`.
6. **Northside Marine is walled.** `www.northsidemarine.com.au/stabicraft-boats/` and `/surtees-boats/` both answered `403` to every request (Cloudflare). They are in the JSON as two records with `refused: true`, address only. The dealer's own photography of these two brands is worth a browser pass or a SharePoint export: the price file points at **35 distinct `northsidemarine.com.au` addresses** for these two brands (18 Stabicraft, 17 Surtees), 34 of them already held, and those are the only pictures the app has for either brand today.
7. **No press kit and no logo file for Stabicraft.** The wordmark is inline SVG on every page. Only the 180×180 red **S** device is published as a file. If the owner wants the full STABICRAFT wordmark, it has to be asked for.
8. **Surtees' Workmate Hardtop colourway sets exist but are not recorded** (`540WMHT`, `575-WMHT`, `610-WMHT`, `650-WMHT`, `700-WMHT`, 16 colours each, plus a `-F` pair per colour). The seed has no Hardtop rows, so nothing in the catalogue can carry them today. Worth knowing they are there if the dealer adds a hardtop option line.
9. **Surtees publishes each colourway twice** — `<model>-<colour>.png` and `<model>F-<colour>.png` — and the page labels neither. Only the first set is recorded. The second is presumably the other paint extent (cabin as well as hull), but the site does not say, and this file does not invent it.

## The three best hero candidates per series

### Stabicraft — 1450 Explorer (no series row in the seed)

1. `1450-Explorer/Gallery-Images/001_7233-Enhanced-NR.jpg` — 1120×750, 732 KB. Three-quarter, running, open sea, orange hull on blue. The cleanest read of the Explorer's shape of any frame on the page.
2. `1450-Explorer/Gallery-Images/001_7401-Enhanced-NR.jpg` — 1120×750, 1.2 MB. Side profile planing against a cliff, with the bow wave. Best if a cover needs a wide crop with somewhere to put type.
3. `1450-Explorer/Gallery-Images/001_7206-Enhanced-NR.jpg` — 1120×750, 509 KB. Running towards the camera with three aboard; the only frame that shows the boat working with a full crew.

### Stabicraft — Frontier

1. `1550-Frontier/Gallery-Images/1550frontier-hero.jpg` — **1700×700**, 922 KB. Stabicraft's own page banner for the model, already cut to a cover ratio. The one Frontier frame that is wider than it is tall.
2. `2050-Frontier/Gallery-Images/DJI_0040.jpg` — **1440×960**, 1.4 MB. The largest Frontier photograph on the site, red hull running, shot from above the water; carries the 2050 FT's size.
3. `1450-Frontier/Gallery-Images/1450FRONTIER-22.jpg` — 1120×750, 701 KB. Blue hull planing three-quarter on open water — the frame that reads best at card size, because the hull fills the frame.

### Stabicraft — Fisher

1. `1550-Fisher/Gallery-Images/1550FISHER-14.jpg` — 1120×750, 1.1 MB. Hardtop boat beside a cliff on flat water: the series' signature configuration, calmly lit.
2. `1850-Fisher/Gallery-Images/1850f3website.jpg` — 1120×750, 745 KB. Three-quarter running, blue hull. The best-composed Fisher frame; nothing crops off.
3. `1850-Fisher/Gallery-Images/1850f1website.jpg` — 1120×750, 685 KB. Running across a lake under mountains. Choose this one when the cover wants scale around the boat rather than the boat itself.

### Stabicraft — Supercab

1. `1850-Supercab/Feature-Images/1850sc-x1.jpg` — **1700×700**, 971 KB. Bow-up through spray, already at cover ratio. The most dramatic frame in either brand.
2. `2050-Supercab/Gallery-Images/IMG_0485.jpg` — **1417×945**, 1.6 MB. Side profile beneath a cliff face — the largest Supercab photograph, and the one with the most room for type.
3. `2350-Supercab/Gallery-Images/2350SC-hero-4-copy.jpg` — 1120×750, 958 KB. Blue hull running three-quarter in a seaway; the Supercab doing the job the series is sold for.

### Stabicraft — Treker

1. `2050-Treker/Gallery-Images/DJI_0905-Enhanced-NR.jpg` — 1120×750, 1.0 MB. Drone frame of the orange hull running. The Treker's deck layout is its point and this is the only hero that shows it.
2. `2050-Treker/Feature-Images/IMG_3067-Enhanced-NR.jpg` — 1120×750, 1.1 MB. Running hard with spray, three-quarter.
3. `2050-Treker/Gallery-Images/IMG_3105-Enhanced-NR.jpg` — 1120×750, 1.2 MB. Side profile past hills — the widest-feeling of the three.

### Stabicraft — Ultra

1. `2750-Ultra-Centrecab/Gallery-Images/IMG_8037.jpg` — **1417×945**, 1.9 MB. Green hull running three-quarter. The largest and sharpest Ultra frame on the site.
2. `2500-Ultracab-XL/Gallery-Images/IMG_9367.jpg` — **1417×945**, 1.4 MB. Running past a forested island; reads as a big boat, which is the point of the XL.
3. `2500-Ultracab-XL/Gallery-Images/2500ULTRACAB-XL-1-v2.jpg` — 1120×750, 790 KB. The frame the seed was already trying to point at, now at a working address. Use it for the 2500 specifically so the app and the price file agree.

*(The 2350 Ultracab WT has no exterior photograph at all from Stabicraft — see Gaps, item 3.)*

### Surtees — Pro Fisher

1. `2024/01/575-PF-12.jpg` — **8026×5353**, 2.2 MB. Red centre console at a beach, three-quarter. The largest Pro Fisher frame Surtees publishes, and the only one that can carry a full-bleed cover at any size.
2. `2024/01/DJI_0252.jpg` — **4000×2250**, 720 KB. The 650 Pro Fisher from a drone, 16:9 as shot. Best when the cover wants the cockpit layout visible.
3. `2024/01/Surtees-Boats-495-Pro-Fisher-…-1.jpg` — 1170×540, 115 KB. Small, but the only Pro Fisher hero where the hull decal (`495 PRO FISHER`) is legible, so it is the one that proves its own model.

### Surtees — Workmate

1. `2024/01/575WMGT_PRO_drone-2.jpg` — **7151×4954**, 3.4 MB. Aerial of the hardtop boat running. The strongest Workmate frame by a distance and the largest file in the sweep bar one.
2. `2024/02/495-Workmate.jpg` — 1366×688, 164 KB. Running on open water with rods up; the only Workmate hero that is not a hardtop, so the only one that matches an open Workmate row without a caveat.
3. `2024/02/48989e8d93c7b590f45862bede0116fe.png` — 1170×540, 281 KB. The 610 Workmate hardtop running. Worth knowing the file name is a content hash with no model token — the attribution rests on the model page, and the record says so.

### Surtees — Game Fisher

1. `2025/02/620_Gamefisher_highres-5-1.jpg` — **8064×6048**, 2.9 MB. Red hull at rest on turquoise, three-quarter. The biggest picture in this sweep and the best-lit Surtees frame anywhere.
2. `2024/12/Surtees_770_a-6.jpg` — **7114×4958**, 1.5 MB. Running in a seaway at first light. This is the frame for a brand cover, not just a model cover.
3. `2025/04/Surtees_720_HighRes-3.jpg` — **6000×5568**, 2.4 MB. Running three-quarter over green water; serves both the seed's 720 Open and 720 Enc rows, which share this page.
