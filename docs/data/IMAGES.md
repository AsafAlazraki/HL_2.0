# The pictures

Generated from `data/northside/images.json` by the packer and by `tools/seed/fetch-images.ts`; do not edit. Last measured 2026-09-16; held copies are WebP at long edge 1100, quality 74.

**453 addresses: 329 held · 118 unheld · 6 refused.** A picture belongs only to the exact model it depicts: nothing is matched by resemblance and nothing is substituted. An unheld or refused address behaves the same way — the row keeps showing the address.

## By host

| host | held | of which off the mirror | unheld | refused |
|---|---:|---:|---:|---:|
| adventure.highfieldboats.com | 12 | 0 | 0 | 0 |
| app.jeanneau.com | 4 | 0 | 0 | 0 |
| dunbier.com | 2 | 0 | 0 | 0 |
| mayfairmarine.com.au | 17 | 0 | 0 | 0 |
| northsidemarine1.sharepoint.com | 0 | 0 | 0 | 4 |
| stabicraft.com | 1 | 0 | 0 | 0 |
| www.formosamarineboats.com.au | 17 | 0 | 0 | 0 |
| www.gfabtrailers.com.au | 7 | 0 | 0 | 0 |
| www.highfieldboats.com | 103 | 0 | 97 | 0 |
| www.northsidemarine.com.au | 103 | 103 | 2 | 1 |
| www.stacer.com.au | 17 | 0 | 19 | 1 |
| www.surteesboats.com | 1 | 0 | 0 | 0 |
| www.yamaha-motor.com.au | 45 | 9 | 0 | 0 |

## Verdicts, measured off the pixels

Of the 329 held pictures, **122 are scenes** (a photograph with sky or water round its edge; may fill a chapter) and **207 are studio shots** (a render on paper or a neutral ground; sits large on a quiet ground). The edge ring of a 32×32 drawing is read once by the packer; an unheld picture is `unknown` and is treated like a studio shot, which can only make a screen quieter.

## Refused, with the measured reason

- https://northsidemarine1.sharepoint.com/sites/NSMMasterPriceFile/Shared%20Documents/General/Master%20Price%20File/Originals/Images/Dunbier/Dunbier-Logo.jpg — northsidemarine1.sharepoint.com needs a sign-in to read
- https://northsidemarine1.sharepoint.com/sites/NSMMasterPriceFile/Shared%20Documents/General/Master%20Price%20File/Originals/Images/GFAB%20Trailers/GFAB-Trailer-Logo.jpg — northsidemarine1.sharepoint.com needs a sign-in to read
- https://northsidemarine1.sharepoint.com/sites/NSMMasterPriceFile/Shared%20Documents/General/Master%20Price%20File/Originals/Images/Mackay/Mackay-Trailers-Logo.png — northsidemarine1.sharepoint.com needs a sign-in to read
- https://northsidemarine1.sharepoint.com/sites/NSMMasterPriceFile/Shared%20Documents/General/Master%20Price%20File/Quote%20Sheets/Archive%20Folder/Quote%20Sheet%20Logos/Centered/Stacer%20C.png — northsidemarine1.sharepoint.com needs a sign-in to read
- https://www.northsidemarine.com.au/highfield-boats/wp-content/uploads/sites/10/2025/03/Highfield-Ultralite-240-19.jpg — northsidemarine.com.au serves its pictures to its own site only
- https://www.stacer.com.au/site/stacer.com.au/filesystem/images/Boat%20Images/2024/609%20Ocean%20Ranger/609OceanRanger_PKG_2024.jpg — stacer.com.au no longer has that picture

## The mirror

112 held copies came off the dealership's own mirror of the same address rather than off the host, because the host answers a plain request with a Cloudflare challenge. The mirror object is named `mpf-mirror/{folder}/{sha1(address)[:16]}.{ext}` — a function of the address the workbook typed — so a copy is asked for by name, never searched for, and a WordPress address that states its own pixel size (`…-1024x683.jpg`) must be served at exactly that size or it does not land. Each mirrored entry records the object and the key so the chain can be re-checked.

## What is not here

Trailer rows on northsidemarine1.sharepoint.com point at brand logos behind a Microsoft sign-in; those rows stay honestly picture-less, and brand marks belong in `public/brand-marks` with their own provenance. Nothing in this ledger is a stand-in.

## The pictures of models — `data/northside/pictures.json`

The rows' own addresses above stay in `images.json` exactly as the price file typed them. A picture a person attached to a MODEL of the file — a hull, a motor, a trailer — is recorded once, in `pictures.json`, with its address, the page it was found on, its host, the date fetched, its source and held pixel sizes, sha256, the licence note, the exact item it depicts, what it shows that a quote may not say, and who verified it and how. One reader, `src/domain/model/pictures.ts`, answers every screen and the customer's paper from it. **113 pictures: 78 catalogue copies (WebP, long edge at most 1100, in `public/seed-images`) and 35 heroes on the water (WebP, at most 2560, in `public/hero-images`, with 69 narrower copies) — 21.98 MB in all.** Nothing is held larger than its source.

| register | catalogue | heroes | a person marked | bytes |
|---|---:|---:|---:|---:|
| `boat_formosa` | 1 | 2 | 3 | 0.79 MB |
| `boat_haines` | 1 | 1 | 2 | 0.32 MB |
| `boat_highfield` | 20 | 18 | 34 | 14.06 MB |
| `boat_stabicraft` | 0 | 2 | 2 | 0.56 MB |
| `boat_stacer` | 23 | 11 | 30 | 4.42 MB |
| `boat_surtees` | 1 | 1 | 2 | 0.66 MB |
| `mot_epropulsion` | 23 | 0 | 23 | 0.91 MB |
| `trl_dunbier` | 3 | 0 | 3 | 0.09 MB |
| `trl_mackay` | 4 | 0 | 4 | 0.11 MB |
| `trl_redco` | 2 | 0 | 2 | 0.06 MB |

### Added in the 2026-09-23 round, and how it was verified

105 pictures (78 catalogue, 27 heroes) were proposed by `tools/seed/propose-images.ts` from the measured candidates in `docs/research/imagery/candidates.json`, put on contact sheets under `docs/research/imagery/proposals/`, and held only where a verdict accepted them as that exact item. Every one carries the sheets' verification line, "verified by eye, contact sheet, 2026-09-23"; the verdict files record that the judging itself was done on 2026-10-20 (Claude (imagery judge)), and the bytes were fetched then. They came from the makers' own sites: `adventure.highfieldboats.com`, `dunbier.com`, `hainessignature.com.au`, `mackaytrailers.com`, `mayfairmarine.com.au`, `media.highfieldboats.com`, `stabicraft.com`, `www.cms.surteesboats.com`, `www.epropulsion.com`, `www.formosamarineboats.com.au`, `www.highfieldboats.com`, `www.stacer.com.au`. The catalogue copies went through `tools/seed/fetch-images.ts --accepted`, the heroes through `tools/seed/heroes.ts` and `tools/seed/hero-widths.ts`; a second run of each fetches nothing it holds.

8 heroes were held before the contact sheets existed — chosen by the pixel judge alone and once recorded in `heroes-ledger.json`, which was migrated here and retired with `heroes.json`, so one place records a hero. They keep their bytes and their provenance and say `person: false`: a screen may stand on them, and a line on the quote may not. `highfield-adv7`, `highfield-pa600`, `highfield-sp560`, `highfield-sp600`, `stacer-309-skimma`, `stacer-359-territory-striker`, `stacer-481-seamaster`, `stacer-519-sea-ranger`.

**Marks.** Northside Marine's own mark is held as the organisation's (`role: "organisation"` in `marks-ledger.json`, apart from the makers): `northside-marine.png` in dark ink, which prints on white paper and is the letterhead; `northside-marine-white.png` in white ink, which cannot print on white paper and is for dark grounds only. Stabicraft's mark, accepted on the northside sheet, is held as the boat brand it is (`stabicraft-white.svg`, white ink only, so never on the quote paper).

### What was refused or noted, and the rows it is about

The reader never draws these for the rows named — not on a screen, not on a line, not on a cover — and where a person attached the right picture to the model, that is drawn instead. A ruling that names no rows refuses the address for every row that carries it; a `note` is drawn, and captioned.

- **refuse** `redco-tinka-logos-01.png` on `trl_nsmcustom` (every row) — a logo, not the item. *No person's ruling: looked at by Claude (imagery audit), 2026-10-20.*
- **refuse** `ta500-mob-02.jpg` on `trl_redco` (trl_redco:40) — not that exact model (a sister model).
- **refuse** `Dunbier-Logo.jpg` on `trl_dunbier` (every row) — a logo, not the item. *No person's ruling: the file name says logo; not looked at.*
- **refuse** `GFAB-Trailer-Logo.jpg` on `trl_gfab` (every row) — a logo, not the item. *No person's ruling: the file name says logo; not looked at.*
- **refuse** `Mackay-Trailers-Logo.png` on `trl_mackay` (every row) — a logo, not the item.
- **refuse** `Stacer C.png` on `trl_stacertrailers` (every row) — a logo, not the item. *No person's ruling: the file name says logo; not looked at.*
- **refuse** `CL340ST-B-G-DG-top-view.jpg` on `boat_highfield` (boat_highfield:130, boat_highfield:131, boat_highfield:193, boat_highfield:194, boat_highfield:238, boat_highfield:239) — not that exact model (a different configuration: steering console, not tiller). *No person's ruling: the person’s CL310 ST ruling, applied to the CL340 ST render; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `CL340ST-DG-G-DG-1536x864.jpg` on `boat_highfield` (boat_highfield:128, boat_highfield:129, boat_highfield:191, boat_highfield:192, boat_highfield:236, boat_highfield:237) — not that exact model (a different configuration: steering console, not tiller). *No person's ruling: the person’s CL310 ST ruling, applied to the CL340 ST render; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `CL340ST-LG-W-WD-top-view.jpg` on `boat_highfield` (boat_highfield:126, boat_highfield:127, boat_highfield:189, boat_highfield:190, boat_highfield:234, boat_highfield:235) — not that exact model (a different configuration: steering console, not tiller). *No person's ruling: the person’s CL310 ST ruling, applied to the CL340 ST render; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `CL340STW-W-WD-top-view-1.jpg` on `boat_highfield` (boat_highfield:124, boat_highfield:125, boat_highfield:187, boat_highfield:188, boat_highfield:232, boat_highfield:233) — not that exact model (a different configuration: steering console, not tiller). *No person's ruling: the person’s CL310 ST ruling, applied to the CL340 ST render; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `PA660SBB-B-B-1536x864.jpg` on `boat_highfield` (boat_highfield:336, boat_highfield:337, boat_highfield:346, boat_highfield:347) — not that exact model. *No person's ruling: the person’s PA600SB ruling, applied to the same maker’s PA660SB, PA760SB and PA860SB renders; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `PA660SBDG-G-DG2.jpg` on `boat_highfield` (boat_highfield:330, boat_highfield:331, boat_highfield:340, boat_highfield:341) — not that exact model. *No person's ruling: the person’s PA600SB ruling, applied to the same maker’s PA660SB, PA760SB and PA860SB renders; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `PA660SBLG-W-DG2-1.jpg` on `boat_highfield` (boat_highfield:328, boat_highfield:329, boat_highfield:338, boat_highfield:339) — not that exact model. *No person's ruling: the person’s PA600SB ruling, applied to the same maker’s PA660SB, PA760SB and PA860SB renders; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `PA660SBO-G-DG2.jpg` on `boat_highfield` (boat_highfield:332, boat_highfield:333, boat_highfield:342, boat_highfield:343) — not that exact model. *No person's ruling: the person’s PA600SB ruling, applied to the same maker’s PA660SB, PA760SB and PA860SB renders; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `PA660SBR-B-B2.jpg` on `boat_highfield` (boat_highfield:334, boat_highfield:335, boat_highfield:344, boat_highfield:345) — not that exact model. *No person's ruling: the person’s PA600SB ruling, applied to the same maker’s PA660SB, PA760SB and PA860SB renders; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `PA760SB-B-B-B-1536x864.jpg` on `boat_highfield` (boat_highfield:362, boat_highfield:367) — not that exact model. *No person's ruling: the person’s PA600SB ruling, applied to the same maker’s PA660SB, PA760SB and PA860SB renders; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `PA760SB-D-G-DG.2.jpg` on `boat_highfield` (boat_highfield:359, boat_highfield:364) — not that exact model. *No person's ruling: the person’s PA600SB ruling, applied to the same maker’s PA660SB, PA760SB and PA860SB renders; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `PA760SB-LG-W-DG.2-1.jpg` on `boat_highfield` (boat_highfield:358, boat_highfield:363) — not that exact model. *No person's ruling: the person’s PA600SB ruling, applied to the same maker’s PA660SB, PA760SB and PA860SB renders; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `PA760SB-O-G-DG.2.jpg` on `boat_highfield` (boat_highfield:360, boat_highfield:365) — not that exact model. *No person's ruling: the person’s PA600SB ruling, applied to the same maker’s PA660SB, PA760SB and PA860SB renders; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `PA760SB-R-B-B.2.jpg` on `boat_highfield` (boat_highfield:361, boat_highfield:366) — not that exact model. *No person's ruling: the person’s PA600SB ruling, applied to the same maker’s PA660SB, PA760SB and PA860SB renders; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `PA860SB-B-B-B-1536x864.jpg` on `boat_highfield` (boat_highfield:371, boat_highfield:376) — not that exact model. *No person's ruling: the person’s PA600SB ruling, applied to the same maker’s PA660SB, PA760SB and PA860SB renders; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `PA860SB-DG-G-DG.2.jpg` on `boat_highfield` (boat_highfield:368, boat_highfield:373) — not that exact model. *No person's ruling: the person’s PA600SB ruling, applied to the same maker’s PA660SB, PA760SB and PA860SB renders; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `PA860SB-LG-W-DG.2-1.jpg` on `boat_highfield` (boat_highfield:372, boat_highfield:377) — not that exact model. *No person's ruling: the person’s PA600SB ruling, applied to the same maker’s PA660SB, PA760SB and PA860SB renders; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `PA860SB-O-G-DG.2.jpg` on `boat_highfield` (boat_highfield:369, boat_highfield:374) — not that exact model. *No person's ruling: the person’s PA600SB ruling, applied to the same maker’s PA660SB, PA760SB and PA860SB renders; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `PA860SB-R-B-B.2.jpg` on `boat_highfield` (boat_highfield:370, boat_highfield:375) — not that exact model. *No person's ruling: the person’s PA600SB ruling, applied to the same maker’s PA660SB, PA760SB and PA860SB renders; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `CL310STW-W-WD-top-view-1.jpg` on `boat_highfield` (boat_highfield:115, boat_highfield:116) — not that exact model (a different configuration: steering console, not tiller).
- **refuse** `CL310STW-W-WD-top-view-1.jpg` on `boat_highfield` (boat_highfield:223, boat_highfield:224) — not that exact model (a different configuration: steering console, not tiller).
- **refuse** `CL310STW-W-WD-top-view-1.jpg` on `boat_highfield` (boat_highfield:178, boat_highfield:179) — not that exact model (a different configuration: steering console, not tiller).
- **refuse** `PA600SBLG-W-DG2-1.jpg` on `boat_highfield` (boat_highfield:298, boat_highfield:299) — not that exact model.
- **refuse** `PA600SBLG-W-DG2-1.jpg` on `boat_highfield` (boat_highfield:308, boat_highfield:309) — not that exact model.
- **refuse** `PA600SBLG-W-DG2-1.jpg` on `boat_highfield` (boat_highfield:318, boat_highfield:319) — not that exact model.
- **refuse** `PA700SB-LG-W-DG.2-1.jpg` on `boat_highfield` (boat_highfield:348) — not that exact model.
- **refuse** `PA700SB-LG-W-DG.2-1.jpg` on `boat_highfield` (boat_highfield:353) — not that exact model.
- **refuse** `SP760-W-W-WB-top-view-1920x1440.jpg` on `boat_highfield` (boat_highfield:553) — not that exact model (a sister model).
- **refuse** `SP700STW-W-WB-1.jpg` on `boat_highfield` (boat_highfield:537) — not that exact model (a sister model).
- **refuse** `RU280ALST01WH-1536x864.jpg` on `boat_highfield` (boat_highfield:11, boat_highfield:12) — not that exact model (a sister floor: the AL render on a KAM row).
- **refuse** `RU320ALSTWH-1536x864.jpg` on `boat_highfield` (boat_highfield:15, boat_highfield:16) — not that exact model (a sister floor: the AL render on a KAM row).
- **refuse** `359-proline.jpg` on `boat_stacer` (boat_stacer:13) — not that exact model (a sister model). *No person's ruling: the file name names the 359; seen on the picker by Claude (gate round), 2026-10-20.*
- **refuse** `529-Assault-Lifestyle-Tiffs-7-1024x676.jpg` on `boat_stacer` (boat_stacer:29) — not that exact model (a sister model).
- **note** `529-Assault-Lifestyle-Tiffs-7-1024x676.jpg` on `boat_stacer` (boat_stacer:30) — shows an outboard the file does not sell. *No person's ruling: looked at by Claude (imagery audit), 2026-10-20, at 1024×676.*
- **refuse** `519 Sea Ranger Lifestyle Tifs (4).jpg` on `boat_stacer` (boat_stacer:71) — not that exact model (side console shown on a centre-console row).
- **refuse** `519 Sea Ranger Lifestyle Tifs (4).jpg` on `boat_stacer` (boat_stacer:72, boat_stacer:73, boat_stacer:78) — not that exact model (the price file gives this picture to a model it does not show).
- **refuse** `589 Ocean Ranger CC Lifestyle (2).jpg` on `boat_stacer` (boat_stacer:88, boat_stacer:89, boat_stacer:90, boat_stacer:91) — not that exact model (a sister model). *No person's ruling: the file name names the 589; seen on the picker by Claude (gate round), 2026-10-20.*

### What remains a gap

- **Accepted and not held, because the licence bars it** (9): Jeanneau - DB 43 OB; Merry Fisher  -  695 S2; Merry Fisher  -  795 S2; Merry Fisher  -  895 S2; Merry Fisher - 1095 Coupe S2; Merry Fisher - 1095 Flybridge S2; Merry Fisher 605 S2.; Jeanneau - TH33; Jeanneau - TH38. Licence not cleared: article 5.1 of jeanneau.com's Legal Notice says the photography belongs to SPBI S.A. It is accepted as the right picture of the right boat, but it cannot be held or printed until the importer or SPBI gives written permission.
- **Rejected, so the model has no picture of that tier from this round** (27): PA600 (catalogue: not that exact model); PA600EW (catalogue: not that exact model); PA600ST (catalogue: not that exact model); PA700EW (catalogue: not that exact model); PA700ST (catalogue: not that exact model); SP700WL(Windlass) (catalogue: not that exact model (a sister model)); SP760WL(Windlass) (catalogue: not that exact model (a sister model)); SP520 (hero: too small once cropped); CL310 (catalogue: not that exact model (a different configuration: steering console, not tiller)); CL310FT (catalogue: not that exact model (a different configuration: steering console, not tiller)); CL310LS (catalogue: not that exact model (a different configuration: steering console, not tiller)); CL400 (hero: too small once cropped (and the exact model cannot be seen)); Formosa - SRT 495 (Side Console) (catalogue: an interior, console or detail shot proposed as a whole boat; a render of a different colourway than the row); Formosa - SRT 565 (X Bowrider) (catalogue: people or text over the boat that makes it unusable; not shown to be that exact model); Formosa - SRT 715 Enc (Half Cabin) (hero: not that exact model); Jeanneau - DB 37 OB (hero: not that exact model (a sister variant)); GFAB Offroad Single Sportski Trailer - Black (catalogue: not that exact model (a sister model)); GFAB Single Axel Trailer t/s Stabicraft 1450 Series (catalogue: not usable as the item's picture (the boat, not the trailer, is the subject)); MACKAY Aluminium Custom Trailer - AL6000T-14-M (catalogue: text on the item that makes it unusable (another dealer's plate)); MACKAY MLJ Series Trailer - MLJ4500-13-M (catalogue: not that exact model (a different variant code)); MACKAY MLJ Series Trailer - MLJ5750T-13-M (catalogue: text on the item that makes it unusable (another dealer's plate)); MACKAY PU Series Trailer - PU5750T-13-M (catalogue: not that exact model (a dressed specification)); REDCO Off Road Series - RSX450-MO (1,550kg) (catalogue: not that exact model (a series shot)); TINKA Aluminium - TA600-MOB (catalogue: not that exact model (a sister model)); Stacer - 499 CrossFire (Side Console) (catalogue: not that exact model (a different edition)); Stacer - 519 Sea Ranger SDF (Centre Console) (catalogue: not that exact model (side console shown on a centre-console row)); Stacer - 539 Sea Ranger SDF (Side Console) (catalogue: not that exact model (cannot tell side console from the centre-console sister)).
- **Makers held in white ink only, so set in type on paper:** Mercury, Stabicraft.
- **Model by model**, every boat, motor and trailer the file carries with no picture held is counted in `docs/research/imagery/gaps.md` (`propose-images.ts --count`), which reads this ledger too.

