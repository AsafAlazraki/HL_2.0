# Imagery candidates — what was measured

`candidates.json` is the five group files merged into one array, de-duplicated by address and sorted by brand, series, model, then kind. **4339 addresses** across **18 brands** and **19 hosts**. Every number below is what an HTTP request returned, not what a page claimed. Nothing has been downloaded into `public/`; a later packer step does that from this list.

Last merge: **2026-09-17**, by `tools/research/measure-images.ts`; that run requested **0** addresses. **4339** of the 4339 carry `measuredAt`, meaning this tool requested them itself (4339 on 2026-09-17). Any record without one holds what the sweep that wrote its group file measured, on the date that file's `.md` states.

## Group files

| group | records | notes |
|---|---|---|
| `highfield.json` | 1195 | `highfield.md` |
| `stacer.json` | 1012 | `stacer.md` |
| `stabicraft-surtees.json` | 414 | `stabicraft-surtees.md` |
| `jeanneau-haines-formosa.json` | 1573 | `jeanneau-haines-formosa.md` |
| `motors-trailers-marks.json` | 174 | `motors-trailers-marks.md` |

## By brand

| brand | records | hero | gallery | render | plan | mark | served 2xx | refused | 404 | too small |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Highfield | 1195 | 75 | 580 | 480 | 55 | 5 | 1188 | 3 | 4 | 0 |
| Stacer | 1012 | 113 | 720 | 117 | 59 | 3 | 777 | 229 | 6 | 24 |
| Merry Fisher | 567 | 20 | 505 | 0 | 42 | 0 | 509 | 58 | 0 | 0 |
| Cap Camarat | 395 | 27 | 328 | 0 | 40 | 0 | 334 | 61 | 0 | 0 |
| Surtees | 276 | 16 | 59 | 192 | 8 | 1 | 275 | 1 | 0 | 5 |
| Haines Signature | 249 | 39 | 209 | 0 | 0 | 1 | 216 | 33 | 0 | 3 |
| Formosa | 217 | 52 | 130 | 33 | 0 | 2 | 217 | 0 | 0 | 3 |
| Stabicraft | 138 | 37 | 57 | 29 | 14 | 1 | 137 | 1 | 0 | 0 |
| Jeanneau | 126 | 8 | 98 | 0 | 18 | 2 | 111 | 15 | 0 | 0 |
| ePropulsion | 60 | 8 | 14 | 33 | 2 | 3 | 60 | 0 | 0 | 5 |
| Dunbier | 43 | 5 | 29 | 5 | 0 | 4 | 43 | 0 | 0 | 20 |
| Mackay | 26 | 4 | 2 | 13 | 0 | 7 | 26 | 0 | 0 | 0 |
| GFAB | 15 | 8 | 6 | 0 | 0 | 1 | 15 | 0 | 0 | 0 |
| REDCO | 10 | 6 | 4 | 0 | 0 | 0 | 10 | 0 | 0 | 0 |
| TINKA | 6 | 2 | 4 | 0 | 0 | 0 | 6 | 0 | 0 | 0 |
| Northside Marine | 2 | 0 | 0 | 0 | 0 | 2 | 0 | 2 | 0 | 0 |
| Mercury | 1 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 |
| Yamaha | 1 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 |
| **all** | 4339 | 420 | 2745 | 902 | 238 | 34 | 3926 | 403 | 10 | 60 |

## By kind

| kind | records | served 2xx | refused | 404 | too small | no pixel size |
|---|---:|---:|---:|---:|---:|---:|
| hero | 420 | 364 | 52 | 4 | 17 | 27 |
| gallery | 2745 | 2458 | 283 | 4 | 29 | 100 |
| render | 902 | 857 | 43 | 2 | 14 | 10 |
| plan | 238 | 215 | 23 | 0 | 0 | 72 |
| mark | 34 | 32 | 2 | 0 | 0 | 2 |

`tooSmall: true` marks a hero, gallery or render frame under 800 px on its long edge — 60 of them. A plan or a brand mark is never marked: a mark is as big as its file and a plan is read, not filled.

## Refused, by host

| host | refused | of records | what answered |
|---|---:|---:|---|
| `www.northsidemarine.com.au` | 403 | 403 | HTTP 403 from www.northsidemarine.com.au |

251 of the refused records carry a pixel size anyway: the sweeps that found them opened the page in a real browser and measured the frame with `naturalWidth`/`naturalHeight`. Those sizes are measured, not guessed, but no byte size exists for them because no body was ever served to a script.

## What is walled

- **The dealer's own site, `www.northsidemarine.com.au`** (and its `stacer-boats` subsite): Cloudflare answers 403 to every scripted request whatever the user-agent, `robots.txt` included. 403 addresses are recorded anyway, with `refused: true`. They matter: the dealer's own photography of the boats it actually sells. The route is the `mpf-mirror` scheme or a browser pass, and the owner can simply say yes.
- **Mercury's colourway renders** at `shop.mercurymarine.com` answer 403 to every scripted request, and **Yamaha's Australian model pages** sit behind Imperva (its `-/media/….ashx` handler does not: all 45 of the seed's Yamaha addresses answered 200 when the motors sweep asked). Neither wall could be measured through, so those gaps show as models with no record at all rather than as refused rows — `motors-trailers-marks.md` names them one by one.
- **49 general-arrangement plans are PDFs.** A PDF has no raster size, so `width`/`height` stay absent by design; the byte size and the content type are measured. They are the manufacturers' own drawings and want a render step, not a resize.
- **10 addresses answered 404** and are kept with their status so the packer skips them rather than re-finding them:
  - Highfield SP420 (gallery) — `https://media.highfieldboats.com/wp-content/uploads/2022/04/DJI_0241.jpg`
  - Highfield SP420 (gallery) — `https://media.highfieldboats.com/wp-content/uploads/2022/04/DJI_0964.jpg`
  - Highfield SP420 (gallery) — `https://media.highfieldboats.com/wp-content/uploads/2022/04/DJI_0986.jpg`
  - Highfield SP420 (gallery) — `https://media.highfieldboats.com/wp-content/uploads/2022/04/DJI_0989.jpg`
  - Stacer 609 Ocean Ranger SDF (render) — `https://www.stacer.com.au/site/stacer.com.au/filesystem/images/Boat%20Images/2024/609%20Ocean%20Ranger/609OceanRanger_PKG_2024.jpg`
  - Stacer 659 Sea Ranger SDF (Centre Console) (render) — `https://www.stacer.com.au/site/stacer.com.au/filesystem/images/Boat%20Images/2024/659%20Sea%20Ranger/659SeaRanger_PKG_2024_2.jpg`
  - Stacer 319 Seasprite Dinghy (hero) — `https://www.stacer.com.au/site/stacer.com.au/filesystem/images/Boat%20Images/2011/Open%20Boats/319%20Seasprite/319%20Seasprite%20%282%29%20copy.jpg`
  - Stacer 319 Seasprite Dinghy (hero) — `https://www.stacer.com.au/site/stacer.com.au/filesystem/images/Boat%20Images/2011/Open%20Boats/319%20Seasprite/319%20Seasprite%20%285%29%20copy.jpg`
  - Stacer 399 Seasprite Dinghy (hero) — `https://www.stacer.com.au/site/stacer.com.au/filesystem/images/Boat%20Images/2024/RESIZED%20FACTORY/399-Seasprite-Lifestyle-2020-(1)_Mercury%20WEB.jpg`
  - Stacer 379 Territory Striker L/S (hero) — `https://www.stacer.com.au/site/stacer.com.au/filesystem/images/Boat%20Images/2023/Open%20Boats/Territory%20Striker/379/379%20Territory%20Striker%20(1).jpg`
- The per-model gaps — the models for which no official picture exists anywhere public — are listed in each group `.md` under "What is walled or missing". They are a question for the builder or for the dealership's own photography, not for a better sweep.

## How an address was measured, and where that is not the whole story

One GET per address, following redirects, with a browser user-agent, the page it was found on as `Referer`, `Accept: image/avif,image/webp,image/apng,image/svg+xml,application/pdf,image/*,*/*;q=0.8`, `Range: bytes=0-524287` and a 20 s timeout. `width`/`height` come from the file header through `sharp`, with EXIF rotation applied, so they are the picture as it hangs, not as it is stored. `bytes` is the whole-file size the server declares in `Content-Range`. Where the header falls outside the first 512 KB the whole file is requested once.

- **`status` 200 and 206 mean the same thing here**: the file is served. 206 is what a range request gets. 1799 records say 200 and 2127 say 206, depending on how the sweep that first found them asked.
- **7 addresses answer with a type their filename does not carry** — a `.png` served as `image/webp` — on `www.formosamarineboats.com.au`, `www.telwater.com.au`. Those hosts send `Vary: accept` and transcode for a browser: Formosa's own mark answers 4,918 bytes of WebP to the Accept above and 5,502 bytes of PNG to `Accept: image/*`. **A packer must name the file it saves from the content-type it got, not from the address.**
- **One host answers a range request with a different file from a plain GET**: `global.yamaha-motor.com/shared/img/rwd_identity.png` declares 40,094 bytes to a range request and serves 25,565 bytes to a plain GET, same content-type, no content-encoding. The pixel size is the same either way. Where a byte size has to be exact, fetch the whole file.
- **Five Stacer overhead frames are stored landscape and hang portrait.** `519SeaMaster_OH_2022`, `589SeaMaster_OH_2022`, `539SeaMaster_OH_2023`, `589CrossfireSCSE_OH_2022` and `539CrossfireRCC_OH_2022` carry EXIF orientation 6: the file header says 1776 × 1180 and this ledger records 1180 × 1776, which is what a browser shows. They were the only five pixel sizes in the ledger that moved when every address was re-measured.
- **A 429 is a fact about the sweep, not about the address.** Re-measuring all 4,368 records on 2026-09-17 asked `www.formosamarineboats.com.au` for its 218 addresses within a few minutes, and 166 came back 429 after answering 200 minutes earlier. Every one of them served again when asked one at a time with a 2 s gap (`--recheck=refused --per-host=1 --gap=2000`). The tool now refuses to write a 429 over a status already recorded, waits after one, and leaves a host alone once it has answered 429 three times.
- **Byte sizes move under you.** Of the 4,368 records re-measured on 2026-09-17, 102 came back a different size from what the sweeps had written down hours earlier: 90 on `www.formosamarineboats.com.au` and 9 on `www.stacer.com.au`, every one smaller, as those libraries are re-optimised in place; 2 on `www.telwater.com.au`, which are the WebP transcodes above; and one on `global.yamaha-motor.com`, which is the range-versus-plain case above. Two content types changed, both Telwater marks. Nothing else in the ledger moved: no address gained or lost a measurement, and no other pixel size or content type changed.

## How the merge works

- **De-duplicated by address.** 22 addresses are honestly attached to more than one model — a Merry Fisher interior the builder publishes on both the Coupe and the Flybridge page, a trailer package render two sweeps both found, a brand mark listed in two groups. The second attachment is kept in `alsoAttachedTo` rather than dropped, because dropping it would take a picture away from a model that has one.
- **Sorted** by brand, series, model, variant, then kind in the order a screen wants them: hero, gallery, render, plan, mark.
- **`group`** on each record says which sweep found it.
- Merging never invents: a field is written only from a response this tool or an earlier sweep actually received.

## Fields

| field | what it means |
|---|---|
| `brand`, `series`, `model`, `variant` | the exact thing the picture depicts, named as the seed names it |
| `kind` | `hero` (on-water or lifestyle), `gallery`, `render` (studio or colourway), `plan`, `mark` (brand logo) |
| `url`, `pageUrl`, `host` | the image address, the page it was found on, the host that served it |
| `status`, `contentType`, `bytes`, `width`, `height` | what the request returned |
| `refused`, `refusedReason` | the host answered 403/429/451 or never answered |
| `tooSmall` | hero/gallery/render under 800 px on the long edge |
| `licenceNote` | one honest sentence about what the page says about use; never a licence nobody read |
| `measuredAt` | the date this tool measured the address itself |

## How to re-run

```
npx tsx tools/research/measure-images.ts                    # measure only what is unmeasured, then merge
npx tsx tools/research/measure-images.ts --merge-only       # rebuild candidates.json and this file, no requests
npx tsx tools/research/measure-images.ts --sample=100       # re-measure 100 at random and report disagreements
npx tsx tools/research/measure-images.ts --recheck=refused  # try the walled hosts again
npx tsx tools/research/measure-images.ts --recheck=all      # re-measure everything (slow, polite)
npx tsx tools/research/measure-images.ts --only=stacer --recheck=missing
```

Five requests in flight at most, two per host, 250 ms between two requests in the same lane, 20 s timeout; `--concurrency`, `--per-host`, `--gap`, `--timeout` and `--limit` move those. A run rewrites every group file in place (values only, each file keeps its own key order) and rewrites `candidates.json` and this file from scratch. Adding a new group file means adding its name to `GROUPS` in the tool.
