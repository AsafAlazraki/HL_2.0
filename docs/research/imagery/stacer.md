# Stacer imagery sweep (2026-09-16)

Companion to `stacer.json` (1,012 records). Every address in the JSON was requested over HTTP on 2026-09-16; status, content-type, byte size and pixel size are what the request returned, not what a page claimed. Nothing was downloaded into `public/`.

## Sources and how they were read

| Source | What it is | How it was read |
|---|---|---|
| `www.stacer.com.au/aluminium-boat-range/<range>` (15 range pages) | The manufacturer's range pages; each carries a model tile (the current package composite) per model | Fetched by script (Cloudflare lets a browser user-agent through). Tiles carry a GUID per model. |
| `SiteServices.asmx/GetItemDetails` (the site's own JSON service, POST with the tile GUID) | Stacer's per-model image gallery, exactly as the model page loads it | Called for all 104 tiles (92 boats, 12 trailers): 886 gallery files. |
| `www.stacer.com.au/aluminium-boat-range/<model>` (110 model pages in the sitemap) | Model pages; `og:image` is the model's tile, the range pages' `og:image` is the series banner | Fetched by script. |
| The price file's own `Image Link` column (Boat sheet rows 5–141, trailer sheet rows 234–277) | 17 stacer.com.au boat addresses and 3 trailer addresses the ledger has never fetched | Re-requested here; the 220 held addresses are not re-listed. |
| `www.northsidemarine.com.au/stacer-boats/` (the dealer's Stacer subsite) | 95 model listing pages plus 19 current-stock listings, each with a hero and a small gallery | **Refused to scripts (Cloudflare 403, "Attention Required").** Read in a real browser tab: page HTML fetched from inside the tab, each listing's hero measured with `naturalWidth/Height`. Recorded with `refused: true`, status 403. |
| `www.telwater.com.au` (Telwater, the maker of Stacer) | Brand marks | Fetched by script. |
| Stacer news (`about-stacer/stacernews/*`) | Blog | Fetched; the article bodies expose no model photography beyond the shared sidebar thumbnails, so nothing was taken from them. |
| Brochures | `filesystem/documents/webbrochure/*.pdf` are 2013-era; the folder refuses listing (403). No current brochure or press kit exists on the site. | Not used. |

Stacer's terms page (`/siteinfo/termsandconditions`) says nothing about copyright, images or permitted use; every `licenceNote` says so and claims no permission.

## Rules applied (honesty first)

- A file is attached to a seed model only when Stacer's own folder **and** file name agree with the model whose gallery it sits in. Stacer's galleries reuse files freely (the 449 Crossfire gallery is full of `499Crossfire*` files; the 489 Outlaw CC gallery is the 529's; the 449 Outlaw TS gallery is the 469's; the 589 Rebel, 589 Wild Rider, 589 Crossfire RC and 609 Ocean Ranger CC tiles are a smaller sibling's picture). **150 such files were left out**, listed in the scratch `skipped-stacer.json` with the reason; 8 were re-homed to the model the file name does name (for example `OH_659-Ocean-Ranger-HT.jpg` found in the 759 Hard Top gallery).
- Where the price file separates rows a photograph cannot tell apart, the record carries the hull name and a `variant` saying so: the 359 Territory Striker S/S and L/S (transom shaft), and three Sea Ranger frames whose name gives no console (`variant: "console not identified (CC or SC)"`, `note` starts `UNRESOLVED:`). **5 records are UNRESOLVED**; attach them only after a look.
- `kind` comes from Stacer's file naming (`Lifestyle`/`DSC` = photograph, `PKG`/`Package`/`2026WEB`/`Edits` = package composite on white, `OH` = overhead, `Internal`/`INT` = detail shot), then corrected by eye from contact sheets of every hero and render on stacer.com.au (24 sheets, 200 tiles looked at). The corrections are in the record notes. Dealer pictures were looked at in the browser for 24 heroes; the dealer's `N0xxxxx` "stock" pictures are yard photographs of the boat on its trailer outside the dealership and are filed as `gallery`, not `hero`.
- `SE` is Stacer's equipment pack on the same hull (481 Sea Master SE, 499/539/589 Crossfire SE, 589 Sea Runner SE, 619 Wild Rider SE); such pictures carry `variant: "SE"`.

## Counts measured

| | |
|---|---|
| Records | **1,012** |
| Answered 200/206 with pixel size | **777** (all on stacer.com.au and telwater.com.au) |
| Answered 404 | **6** (below) |
| Refused to scripts, recorded anyway | **229** (all on northsidemarine.com.au; 90 of them carry a browser-measured size) |
| By kind | hero 113 · render 117 · plan 59 · gallery 720 · mark 3 |
| Price-file hull rows covered | **82 of 91** (9 uncovered, below); trailers: 8 of the price file's 11 Stacer trailer addresses were already held, the other 3 now measured, plus 5 dealer trailer pictures |
| Heroes 1200 px or wider that a script can fetch | 29 on stacer.com.au (3000 px: the 519/499 Sea Ranger and 709 Sea Ranger frames; 2000 px: 709 Ocean Ranger, 759 Ocean Ranger; 1920 px: 409 Assault Pro, 709 Ocean Ranger HT) |

Dead at origin (404): `609OceanRanger_PKG_2024.jpg` (price file, known since 2026-08-27), `659SeaRanger_PKG_2024_2.jpg` (price file; Stacer's real file is `659SeaRanger_PKG_2024 2.jpg` with a space, which answers), `379 Territory Striker (1).jpg` (price file), `399-Seasprite-Lifestyle-2020-(1)_Mercury WEB.jpg` (price file), `319 Seasprite (2) copy.jpg` and `319 Seasprite (5) copy.jpg` (in Stacer's own gallery JSON but gone from the server).

## Coverage per price-file row

Columns: pictures on stacer.com.au that answered (hero/render/plan/gallery), dealer-subsite pictures (refused to scripts), whether the row's own price-file address is already held in the ledger, and where that address points. Hull-level records (359 Territory Striker, 499/519 Sea Ranger SDF) count for each row they can depict.

| Series | Model | Code | stacer.com.au hero/render/plan/gallery (2xx) | dealer subsite (refused) | held in ledger | price-file address |
|---|---|---|---|---|---|---|
| SKIMMAS | 309 Skimma | SP309S2SP | 4/1/1/1 | 1 | yes | stacer.com.au |
| SKIMMAS | 319 Skimma | SP319S2SP | 0/1/0/0 | 2 | yes | stacer.com.au |
| SKIMMAS | 359 Skimma | SP359S2SP | 1/1/0/0 | 0 | no | stacer.com.au |
| SKIMMAS | 319 Skimma (HS) | SP319SHSSR | 0/0/0/0 | 0 | yes | stacer.com.au |
| SKIMMAS | 359 Skimma (HS) | SP359SHSSR | 0/0/0/0 | 0 | no | stacer.com.au |
| TERRITORY STRIKERS | 359 Territory Striker S/S | SP359TS2SP | 3/1/0/7 | 7 | yes | stacer.com.au |
| TERRITORY STRIKERS | 359 Territory Striker L/S | SP359TS2LP | 3/1/0/7 | 7 | yes | stacer.com.au |
| TERRITORY STRIKERS | 379 Territory Striker L/S | SP379TS2LQ | 0/1/1/8 | 4 | no | stacer.com.au |
| TERRITORY STRIKERS | 399 Territory Striker L/S | SP399TS2LQ | 1/1/1/8 | 5 | no | stacer.com.au |
| PROLINES | 359 Proline S/S | SP359PL2SP | 0/1/0/0 | 2 | yes | dealer mirror |
| PROLINES | 359 Proline L/S | SP359PL2LP | 0/0/0/0 | 4 | yes | dealer mirror |
| PROLINES | 379 Proline L/S | SP379PL2LP | 0/1/0/8 | 2 | yes | dealer mirror |
| PROLINES | 399S Proline L/S | SPS399PL2LP | 0/0/0/0 | 11 | yes | dealer mirror |
| PROLINES | 359 Proline SE L/S | SP359PSE2LP | 0/2/0/11 | 4 | yes | dealer mirror |
| PROLINES | 379 Proline SE L/S | SP379PSE2LP | 2/1/1/0 | 4 | yes | dealer mirror |
| PROLINE ANGLERS | 409S Proline Angler | SPS409PALR | 0/1/1/11 | 4 | yes | dealer mirror |
| PROLINE ANGLERS | 429S Proline Angler | SPS429PALR | 0/1/1/10 | 4 | yes | dealer mirror |
| PROLINE ANGLERS | 449S Proline Angler | SPS449PALR | 1/1/1/15 | 4 | yes | dealer mirror |
| SEASPRITE DINGHYS | 319 Seasprite Dinghy | SD319SS2SP | 4/1/1/1 | 0 | yes | stacer.com.au |
| SEASPRITE DINGHYS | 379 Seasprite Dinghy | SD379SS2LP | 3/1/1/0 | 6 | no | stacer.com.au |
| SEASPRITE DINGHYS | 399 Seasprite Dinghy | SD399SS2LP | 0/1/0/10 | 0 | no | stacer.com.au |
| ASSAULT PROS | 409 Assault Pro | SA409APR | 1/0/0/0 | 1 | yes | dealer mirror |
| ASSAULT PROS | 429 Assault Pro | SA429APR | 0/1/0/0 | 0 | yes | dealer mirror |
| ASSAULT PROS | 449 Assault Pro | SA449APR | 0/1/1/10 | 4 | yes | dealer mirror |
| ASSAULT PROS | 459 Assault Pro | SA459APR | 0/1/0/0 | 3 | yes | dealer mirror |
| ASSAULT PROS | 489 Assault Pro | SA489APR | 0/0/0/0 | 3 | yes | dealer mirror |
| ASSAULT PROS | 519 Assault Pro | SA519APR | 0/1/1/11 | 4 | yes | dealer mirror |
| ASSAULT PRO (TOURNAMENTS) | 469 Assault Pro (Tournament) | SA469APTR | 0/0/0/0 | 4 | yes | dealer mirror |
| ASSAULT PRO (TOURNAMENTS) | 509 Assault Pro (Tournament) | SA509APTR | 0/1/1/0 | 0 | yes | dealer mirror |
| ASSAULT PRO (TOURNAMENTS) | 529 Assault Pro (Tournament) | SA529APTR | 0/1/1/14 | 7 | yes | dealer mirror |
| OUTLAW (TILLER STEERS) | 429 Outlaw (Tiller Steer) | SN429OLTSR | 0/1/1/18 | 5 | yes | dealer mirror |
| OUTLAW (TILLER STEERS) | 449 Outlaw (Tiller Steer) | SN449OLTSR | 0/1/0/0 | 0 | none | none |
| OUTLAW (TILLER STEERS) | 469 Outlaw (Tiller Steer) | SN469OLTSR | 0/1/1/13 | 1 | no | stacer.com.au |
| OUTLAW (SIDE CONSOLES) | 429 Outlaw (Side Console) | SN429OLSCR | 0/1/0/6 | 5 | yes | dealer mirror |
| OUTLAW (SIDE CONSOLES) | 449 Outlaw (Side Console) | SN449OLSCR | 1/1/1/17 | 0 | yes | dealer mirror |
| OUTLAW (SIDE CONSOLES) | 469 Outlaw (Side Console) | SN469OLSCR | 5/0/0/14 | 11 | yes | dealer mirror |
| OUTLAW (SIDE CONSOLES) | 489 Outlaw (Side Console) | SN489OLSCR | 0/1/1/29 | 1 | yes | dealer mirror |
| OUTLAW (SIDE CONSOLES) | 529 Outlaw (Side Console) | SN529OLSCR | 0/0/0/0 | 1 | yes | dealer mirror |
| OUTLAW (CENTRE CONSOLES) | 449 Outlaw (Centre Console) | SN449OLCCR | 0/1/1/7 | 1 | yes | dealer mirror |
| OUTLAW (CENTRE CONSOLES) | 469 Outlaw (Centre Console) | SN469OLCCR | 0/1/1/12 | 1 | yes | dealer mirror |
| OUTLAW (CENTRE CONSOLES) | 489 Outlaw (Centre Console) | SN489OLCCR | 0/0/0/0 | 0 | none | none |
| OUTLAW (CENTRE CONSOLES) | 529 Outlaw (Centre Console) | SN529OLCCR | 0/1/1/24 | 1 | yes | dealer mirror |
| RAMPAGES | 429 Rampage (Tiller Steer) | SD429RTSQ | 1/1/0/8 | 6 | yes | stacer.com.au |
| RAMPAGES | 449 Rampage (Tiller Steer) | SD449RTSQ | 1/1/0/6 | 1 | no | stacer.com.au |
| REBELS | 539 Rebel | SN539RR | 6/1/0/8 | 0 | none | none |
| REBELS | 589 Rebel | SN589RR | 0/0/0/0 | 0 | none | none |
| SEA MASTERS | 429 SeaMaster | SRR429SMR | 0/1/0/9 | 6 | yes | dealer mirror |
| SEA MASTERS | 449 SeaMaster | SRR449SMR | 0/1/0/0 | 3 | yes | dealer mirror |
| SEA MASTERS | 481 SeaMaster | SRR481SMR | 2/1/0/7 | 2 | yes | dealer mirror |
| SEA MASTERS | 499 SeaMaster | SRR499SMR | 0/1/0/16 | 2 | yes | dealer mirror |
| SEA MASTERS | 519 SeaMaster | SRR519SMR | 0/1/1/21 | 2 | yes | dealer mirror |
| SEA MASTERS | 539 SeaMaster | SRR539SMR | 1/1/1/19 | 2 | yes | dealer mirror |
| SEA MASTERS | 589 SeaMaster | SRR589SMR | 0/1/1/17 | 0 | yes | dealer mirror |
| CROSSFIRE (SIDE CONSOLES) | 449 CrossFire (Side Console) | SX449CFSCR | 0/0/0/0 | 1 | yes | dealer mirror |
| CROSSFIRE (SIDE CONSOLES) | 481 CrossFire (Side Console) | SX481CFSCR | 1/1/0/0 | 9 | yes | dealer mirror |
| CROSSFIRE (SIDE CONSOLES) | 499 CrossFire (Side Console) | SX499CFSCR | 5/0/0/17 | 14 | none | none |
| CROSSFIRE (SIDE CONSOLES) | 519 CrossFire (Side Console) | SX519CFSCR | 0/1/0/9 | 9 | none | none |
| CROSSFIRE (SIDE CONSOLES) | 539 CrossFire (Side Console) | SX539CFSCR | 0/2/0/0 | 2 | none | none |
| CROSSFIRE (SIDE CONSOLES) | 589 CrossFire (Side Console) | SX589CFSCR | 0/2/1/19 | 1 | none | none |
| CROSSFIRE (REAR CONSOLES) | 539 CrossFire (Rear Console) | SX539CFRCR | 0/1/1/25 | 5 | yes | dealer mirror |
| CROSSFIRE (REAR CONSOLES) | 589 CrossFire (Rear Console) | SX589CFRCR | 0/0/0/0 | 5 | none | none |
| WILDRIDERS | 499 WildRider | SRB499WRR | 2/0/1/13 | 8 | yes | dealer mirror |
| WILDRIDERS | 519 WildRider | SRB519WRR | 4/1/1/9 | 9 | yes | dealer mirror |
| WILDRIDERS | 539 WildRider | SRB539WRR | 0/1/1/14 | 5 | yes | dealer mirror |
| WILDRIDERS | 589 WildRider | SRB589WRR | 0/0/0/0 | 0 | yes | dealer mirror |
| WILDRIDERS | 619 WildRider | SRB619WRR | 0/1/1/18 | 2 | yes | dealer mirror |
| SEARUNNERS | 519 SeaRunner | SCA519SRR | 0/0/0/11 | 1 | yes | dealer mirror |
| SEARUNNERS | 539 SeaRunner | SCA539SRR | 0/1/0/17 | 6 | yes | dealer mirror |
| SEARUNNERS | 589 SeaRunner | SCA589SRR | 0/1/1/22 | 1 | yes | dealer mirror |
| SEA RANGER (CENTRE CONSOLES) | 499 Sea Ranger SDF (Centre Console) | SS499SRCCL | 1/0/0/0 | 0 | yes | stacer.com.au |
| SEA RANGER (CENTRE CONSOLES) | 519 Sea Ranger SDF (Centre Console) | SS519SRCCL | 4/0/0/0 | 0 | no | stacer.com.au |
| SEA RANGER (CENTRE CONSOLES) | 539 Sea Ranger SDF (Centre Console) | SS539SRCCL | 0/0/0/0 | 0 | no | stacer.com.au |
| SEA RANGER (CENTRE CONSOLES) | 589 Sea Ranger SDF (Centre Console) | SCCP589SRXLN | 0/0/0/1 | 0 | no | stacer.com.au |
| SEA RANGER (CENTRE CONSOLES) | 659 Sea Ranger SDF (Centre Console) | SCCP659SRK | 0/2/0/20 | 0 | no | stacer.com.au |
| SEA RANGER (CENTRE CONSOLES) | 709 Sea Ranger SDF (Centre Console) | SCCP709SRK | 4/1/0/0 | 0 | no | stacer.com.au |
| SEA RANGER (SIDE CONSOLES) | 499 Sea Ranger SDF (Side Console) | SS499SRSCL | 1/1/1/0 | 0 | yes | stacer.com.au |
| SEA RANGER (SIDE CONSOLES) | 519 Sea Ranger SDF (Side Console) | SS519SRSCL | 4/0/0/0 | 0 | no | stacer.com.au |
| SEA RANGER (SIDE CONSOLES) | 539 Sea Ranger SDF (Side Console) | SS539SRSCL | 0/1/1/0 | 0 | no | stacer.com.au |
| OCEAN RANGER SDFS | 609 Ocean Ranger SDF | SCP609ORR | 0/1/0/19 | 0 | no | stacer.com.au |
| OCEAN RANGER SDFS | 659 Ocean Ranger SDF | SCP659ORR | 0/2/2/15 | 0 | no | stacer.com.au |
| OCEAN RANGER SDFS | 709 Ocean Ranger SDF | SCP709ORR | 1/0/0/0 | 0 | no | stacer.com.au |
| OCEAN RANGER SDFS | 759 Ocean Ranger SDF | SCP759ORR | 1/1/0/0 | 0 | no | stacer.com.au |
| OCEAN RANGER SDF (HARD TOPS) | 609 Ocean Ranger SDF (H/Top) | SCP609ORHTR | 0/1/0/0 | 0 | yes | stacer.com.au |
| OCEAN RANGER SDF (HARD TOPS) | 659 Ocean Ranger SDF (H/Top) | SCP659ORHTR | 1/0/1/0 | 0 | no | stacer.com.au |
| OCEAN RANGER SDF (HARD TOPS) | 709 Ocean Ranger SDF (H/Top) | SCP709ORHTR | 1/0/0/0 | 0 | no | stacer.com.au |
| OCEAN RANGER SDF (HARD TOPS) | 759 Ocean Ranger SDF (H/Top) | SCP759ORHTR | 1/1/0/0 | 0 | no | stacer.com.au |
| OCEAN RANGER CENTRE CAB (HARD TOPS) | 589 Ocean Ranger Cen Cab (H/Top) | SCP589ORCCHTR | 0/1/1/0 | 0 | yes | stacer.com.au |
| OCEAN RANGER CENTRE CAB (HARD TOPS) | 609 Ocean Ranger Cen Cab (H/Top) | SCP609ORCCHTR | 0/0/0/0 | 0 | yes | stacer.com.au |
| OCEAN RANGER CENTRE CAB (HARD TOPS) | 659 Ocean Ranger Cen Cab (H/Top) | SCP659ORCCHTR | 0/0/0/0 | 0 | yes | stacer.com.au |
| OCEAN RANGER CENTRE CAB (HARD TOPS) | 709 Ocean Ranger Cen Cab (H/Top) | SCP709ORCCHTR | 0/1/0/0 | 0 | yes | stacer.com.au |
| OCEAN RANGER CENTRE CAB (HARD TOPS) | 759 Ocean Ranger Cen Cab (H/Top) | SCP759ORCCHTR | 0/0/0/0 | 0 | yes | stacer.com.au |

"held in ledger: yes" means the row already has a picture in `images.json`; the rows above with nothing new and nothing held are the true gaps.

## Walled, missing, and dead

**Walled (recorded, refused to scripts).** Every `www.northsidemarine.com.au/stacer-boats/...` address: 229 pictures across 114 listing pages, plus the index pages `stacer-boats/`, `stacer-boats/new-stacer-boats/<range>/`, `stacer-boats/stacer-tinnies/`, `stacer-boats/stacer-current-stock/`. Cloudflare answers 403 to a script whatever the user-agent; a real browser is let through, and the price-file's 47 dealer addresses were previously obtained through the dealership's own `mpf-mirror`, which is the route for these too. 90 of the 229 carry a size measured in the browser (the listing heroes).

**Missing everywhere official (9 price-file rows, no picture anywhere):**

- 319 Skimma (HS), 359 Skimma (HS): Stacer's High Side tiles say "image coming soon"; the price file points both at the standard-side Skimma pictures, which show a different (lower) freeboard, so those must not stand in.
- 489 Outlaw (Centre Console): the manufacturer's gallery is the 529's, its tile is the 529's; the dealer listing's hero is a 489 Side Console.
- 589 Rebel: Stacer shows the 539 Rebel's pictures on the 589 page; the dealer has no Rebel listing.
- 589 WildRider: Stacer's gallery is the 519's; the dealer's 589 listing hero is `37.jpg`, already held (1024 px), and the SE listing's only picture names two models in its file name.
- 539 Sea Ranger SDF (Centre Console): nothing on either site; the price file points it at the 519 frame.
- 609, 659, 759 Ocean Ranger Cen Cab (H/Top): only the 589 CC (held) and 709 CC render exist; Stacer's 609 CC tile is the 589's.

**Weak (a package composite only, no photograph):** 429/449/459 Assault Pro, 509 Assault Pro Tournament, all three Outlaw Tiller Steers, all Outlaw Centre Consoles, 449 SeaMaster, 539 and 589 SeaRunner, 499/539 Sea Ranger Side Console, 609/659 Ocean Ranger SDF, 589 and 709 Ocean Ranger CC. The dealer's yard photographs (the `N0xxxxx` stock pictures) exist for several of these but show a boat on a trailer outside the shop.

**Dead:** the 6 addresses listed under "Counts measured"; four are the price file's own and should go on the NSM report.

**Brand marks:** stacer.com.au has no SVG and no press kit; its header logo is a 290x74 PNG. Telwater (the manufacturer) publishes `stacer-logo-color.png` at 1712x525 with alpha and `stacer-logo-white.png` at 500x134; both listed as `kind: "mark"`.

**Hull colours / wraps:** `/options/wraps-hull-colours` shows options photographs, not per-colour renders per model; Stacer publishes no colourway renders, so there is nothing equivalent to the Highfield colourway map.

**Deck plans:** Stacer's `_OH` (overhead) files are the nearest thing to a deck plan and are recorded as `kind: "plan"` (59 of them, 3000–4000 px wide where the source is recent).

## Three best hero candidates per series (looked at, with why)

Sizes are measured. "held" means the address is already in the ledger and is not in `stacer.json`. Where a series has fewer than three real photographs the shortfall is said.

- **Skimmas.** (1) `309 Skimma Jpeg (2).jpg` 1500x1000: the tinnie planing with one aboard, water and trees, the classic use. (2) `309 Skimma Jpeg (4).jpg` 1500x1010: same shoot, calmer, the whole hull side visible. (3) `319 Skimma PKG_2020.jpg` 2948x1957 render, because the only 319/359 photographs are 635-700 px (`359 Skimma Lifestyle 1.jpg` 635x335 is the only 359 shot; `319 Skimma Lifestyle.jpg` is held at 700 px).
- **Territory Strikers.** (1) `399 Territory Striker Jpeg (1).jpg` 1200x799 (stacer.com.au): the boat running with two aboard, mountain behind, the 399 identifiable. (2) `359 Territory Striker Lifestyle (2).jpg` 1200x796 (held; the price file's S/S address): planing shot off a city skyline. (3) dealer `379-Territory-Striker-1.jpg` 1200x822 (refused): two aboard on a river, the only 379 photograph anywhere. All are 1200 px; nothing larger exists for this range.
- **Prolines.** (1) `379 Proline SE_Lifestyle 1.jpg` 1200x797: tiller driver carving a turn, spray, strongest picture in the range. (2) `379 Proline SE_Lifestyle 2.jpg` 1200x797: angler casting from the bow at rest. (3) dealer `399-Proline-Lifestyle.jpg` 1200x793 (refused): the 399S running with people, the only 399 photograph. The 359 Proline has only composites; the dealer's `359-Proline-SE-1.jpg` (1200x797, one aboard under way) is the fourth pick.
- **Proline Anglers.** All three photographs are on the dealer subsite (refused) and were looked at: (1) `429-Proline-Angler.jpg` 2000x1333, red-wrapped hull running. (2) `449-Proline-Angler-lifestyle-2.jpg` 2000x1333, the family lifestyle frame Stacer itself uses as the range banner (Stacer's own copy is only 610x320, which is why the dealer's counts). (3) `409-Proline-Angler-lifestyle-3.jpg` 1920x1290, two aboard at rest on a river. Stacer.com.au has only the 2026 composites (1180x600).
- **Seasprite Dinghys.** Every photograph is 534x282 (a 2011 shoot): (1) `379 Seasprite (2) copy.jpg`, the cast-net frame, the most alive; (2) `319 Seasprite (4) copy.jpg`, angler on a sandbank; (3) `319 Seasprite copy.jpg`, planing. For anything sharp the composites `399 Seasprite PKG 2023.jpg` 3719x2471 and `319 Seasprite PKG2_2020.jpg` 2512x1669 are the only large sources. The 399's `Actual/DSC_*` and `DSC083*` files are deck details.
- **Assault Pros.** (1) `409 Assault Pro Tiff (3).jpg` 1920x1280 (stacer.com.au, Stacer's own range banner): white 409 running with two aboard, trees behind. (2) dealer `489-Assault-Pro-Tif-1.jpg` 1920x1280 (refused): green-wrapped hull running, the only 489 photograph. (3) `429-Assault-Pro-Banner.jpg` (held, 1140x550) is the only other photograph; otherwise the 2026 composites (`429/449/459/519-Assault-Pro-Edits-2026.jpg`, 1180x600, the dealer holds the 449 and 519 `_PKG_2024-scaled` versions at 2560x1700).
- **Assault Pro Tournaments.** All dealer (refused), all looked at: (1) `Assault-Pro-529-T.jpg` 1920x1283, blue 529 running before a mountain; (2) `469-Assault-Pro-Tiff-2.jpg` 1920x1280, two anglers aboard by mangroves (the only 469 photograph; the held one is 1024 px); (3) `529-Assault-Lifestyle-Tiffs-8.jpg`, the sibling frame of (1). The 509 has no photograph; its 2026 composite is the only picture.
- **Outlaw Tiller Steers.** No photograph exists on either site. Best composites: `469OutlawTS_PKG_2024.jpg` 3602x2392 (the price file's unfetched address, now measured), `429OutlawTS_PKG_2024-scaled.jpg` 2560x1700 (dealer, the held copy is 1024 px), `449-Outlaw-TS-2026WEB.jpg` 1180x600. The 449 TS row has no picture in the price file at all.
- **Outlaw Side Consoles.** (1) `469-Outlaw-lifestyle-web-1.jpg` 1180x600 (also Stacer's range banner): three anglers, blue-wrapped hull, calm water, the picture Stacer leads with. (2) `449-Outlaw-SC-Lifestyle-2026WEB.jpg` 1180x600: two standing anglers on green water, the only 449 SC photograph. (3) dealer `529-Outlaw-SC-1.jpg` 1500x1000 (refused): wrapped 529 at rest with anglers, the only 529 SC picture that is not a composite. `469-Outlaw-lifestyle-web-4.jpg` (running into sunset spray) is the fourth.
- **Outlaw Centre Consoles.** No photograph anywhere. Composites: `449OutlawCC_PKG_2024.jpg` 3894x2586 and `469OutlawCC_PKG_2024.jpg` 3841x2551 (stacer.com.au originals of the held 1024 px mirrors), `529-Outlaw-CC-2026web.jpg` 1180x600 (the dealer's `529OutlawCC_PKG_2024-scaled.jpg` is 2560x1701). The 489 CC has nothing.
- **Rampages.** (1) `449-Rampage-Lifestyle-(Web)-2020-(4).jpg` 1200x800: the price file's own address, now measured; two anglers, one casting, river. (2) `429 Rampage 2.jpg` 2048x969: the 429 on the water (its sibling `429 Rampage 3.jpg` is held). (3) `449 Ramage 2026 edit.jpg` 2048x1360 composite. The dealer's `Stacer_429_Rampage_-1.jpg` is a yard photograph.
- **Rebels.** (1) `539RebelLifestyleWEB5.jpg` 1180x600: aerial of the boat carving a wake through a mangrove creek, the best single frame in the whole sweep. (2) `539RebelLifestyleWEB4.jpg` (Stacer's range banner): angler standing at rest. (3) `539RebelLifestyleWEB2.jpg`: close pass through foliage. All 1180x600; the 589 Rebel has none of its own.
- **Sea Masters.** (1) `481 Sea Master Lifestyle 2026.jpg` 1771x1183 (also the range banner): bow-rider running at dusk, spray. (2) `539-Sea-Master-2026-LifestyleWEB.jpg` 1180x600: orange-wrapped 539 running. (3) nothing else is a photograph; the composites are the 2026 `*-Sea-Master-2026WEB.jpg` set (1180x600) and the dealer's `_PKG_` versions at 1776-2560 px. The dealer's `DSC03880Jun-01-2022.jpg` (2404x1744, 429 Sea Master listing hero) is listed UNRESOLVED: a bare camera frame the dealer attributes to the 429.
- **Crossfire Side Consoles.** (1) `499CrossfireLifestyle4.jpg` 1180x600: running into a sunset with bimini up. (2) `481-Crossfire-Lifestyle-2026WEB.jpg` 1180x600: black-wrapped 481 running on turquoise water, one aboard. (3) `499CrossfireLifestyle3.jpg`: two aboard, overhead-ish, spray. Larger dealer photographs exist but were not looked at: `519-crossfire-sc-1.jpg` 2512x1669, `481-CROSSFIRE-SC-SE-1.jpg` 2512x1669, `539-Crossfire-SC-Side-Console-1.jpg` 1773x1182. The 449 SC has only the dealer's SE composite; its price-file frame `DSC03291.jpg` is held.
- **Crossfire Rear Consoles.** Only dealer photographs (refused): `589-CROSSFIRE-RC-SE-1.jpg` 1200x801 (seen: driver at the rear console under way), then `539-crossfire-rcc-1.jpg`, `-5`, `-6` and `589-CROSSFIRE-RC-SE-2/8/19/20` (not seen). Stacer.com.au has the 539 RCC overhead (3138x1336) and 25 factory detail shots, and a tile `539-Crossfire-RC-(1).jpg` not looked at.
- **WildRiders.** (1) `519WildriderWEB1.jpg` 1180x600: sky-blue 519 running, family aboard. (2) `519WildriderWEB2.jpg`: towing a tube past moored yachts, the family-cruising use. (3) `499-Wild-Rider-2026-LifestyleWEB.jpg` 1180x600: blue 499 at a river bank. The dealer's `519-SeaRunnerSE`-style large frames do not exist for this range; its `N014380_519_Wildrider_1.jpg` etc. are yard photographs.
- **SeaRunners.** (1) dealer `519-SeaRunnerSE.jpg` 2370x1769 (refused, seen): elevated view of the 519 on the water with people aboard, the only real SeaRunner photograph not already held (`589-Sea-Runners.jpg` 1920x1280 and `DSC04142` 2505x1673 are held). (2) `589-Sea-Runner-SE-2026WEB.jpg` 1180x600 composite. (3) `539-Sea-Runner-2026WEB.jpg` composite. Stacer's 519 gallery is 11 interior details.
- **Sea Rangers (Centre and Side Consoles).** (1) `709 Sea Ranger Jpeg (2).jpg` 2000x1333: centre console with T-top, three anglers, rods up, running; the same shoot gives (4), (11), (13). (2) `519 Sea Ranger Lifestyle (2).jpg` 3000x2000: the sharpest Sea Ranger frame, but UNRESOLVED (the file does not say CC or SC; the price file uses `Tifs (4)` for five rows). (3) `499 Sea Ranger Lifestyle (6).jpg` 3000x1990: running off a skyline, also UNRESOLVED for console. Resolve (2) and (3) by eye and they become the two best heroes in the brand. Side Console rows have only the 2026 composites of their own.
- **Ocean Ranger SDFs and Hard Tops.** (1) `709 Ocean Ranger HT retouched Lifestyle Tiff.jpg` 1920x1280: hard top running, three aboard. (2) `709 Ocean Ranger Lifestyle(1).jpg` 2000x1333: open 709 running with a crew of three (the price file's address, now measured). (3) `759 Ocean Ranger (5).jpg` 2000x1333 (not looked at). `659-Ocean-Ranger-HT-Jpeg (1).jpg` and `759 Ocean Ranger Hard Top (1).jpg` are real photographs but 610x320. Best composites: `609 Ocean Ranger Package.jpg` 3829x2466 (a hard top with a factory wrap; Stacer's 609 HT tile) and `659OceanRanger_PKG_2024_2.jpg` 4288x2848.
- **Ocean Ranger Centre Cab (Hard Tops).** No photograph; two composites (`589-Ocean-Ranger-CC-2026WEB.jpg`, `Ocean-Ranger-Edits-2026.jpg` for the 709 CC, both 1180x600) plus the held 589 CC lifestyle frame.
- **Trailers.** All package composites at 635x335 (stacer.com.au and the dealer alike); Stacer publishes nothing larger.

## Notes for the packer

- Records whose `model` is a hull name (`359 Territory Striker`, `499 Sea Ranger SDF`, `519 Sea Ranger SDF`) apply to more than one price-file row; the `note` names the codes.
- Stacer's addresses contain spaces and parentheses; the JSON carries them once-encoded (`%20`, `%28`, `%29`), which the host accepts (206 with a Range request, 200 without). The price file's own spellings with double spaces are kept as written where they answer.
- `bytes` is the full file size from `Content-Range`/`Content-Length`; pixel size was read from the first 128 KiB with sharp.
- The dealer's `mpf-mirror` scheme is the way to obtain the 229 refused addresses; the browser session that read them is not a source the packer can repeat.
- The scratch scripts that produced this (range crawl, gallery service calls, model-page crawl, candidate rules, verification, contact sheets, dealer listing capture) live in the session scratchpad under `stacer/`, not in the repo; the rules are restated above so the list can be re-derived.
