# The parts' pictures — what was found, and why the rest has none

Measured 2026-10-30. The owner, 2026-10-28: "if parts and things dont have images go get them". The original HelmLogic's users valued the parts catalogue; this round gives the parts the price file sells their own pictures, by the imagery round's method and rules, and says plainly what is still without one.

## The count

The fit registers are the ones the build's fit chapter offers (`accessory` and `package` kinds) and Oils & Consumables. A row "has a picture" when the one reader (`src/data/pictures.ts` → `pictureBook`) answers `forLine` with a picture a person marked as that exact item.

| register | live rows | with a picture before | with a picture now |
|---|---:|---:|---:|
| Parts & Accessories (`parts`) | 2,238 | 0 | **197** |
| Dealer Fit Packages (`dealer_fit`) | 1,576 | 0 | 0 |
| Rigging Kits (`rig_kits`) | 615 | 0 | 0 |
| Oils & Consumables (`oils_lubes`) | 27 | 0 | 0 |
| **the four registers** | **4,456** | **0** | **197** |
| the makers' motor packages (`mot_pkg_haines`, `mot_pkg_jeanneau`), also offered in the fit chapter | 89 | 0 | 0 |

"Before" is the ledger as committed at `591a543`: `pictures.json` held pictures for boat, motor and trailer registers only, and no fit register has an image column, so `images.json` carries no address for any of their rows. Live means not discontinued and not the rigging register's "Rigging Not Req." sentinel. 197 rows from 196 pictures: the WR10 remote is one item the file lists twice (parts:702, parts:761).

Bytes: the 196 part pictures add **4.34 MB** (WebP, long edge at most 1,100, never larger than the source). Every picture of a model or part in `pictures.json` together is **26.32 MB** of the imagery round's 90 MB budget (`src/data/imagery.test.ts`, "keeps the pictures of models inside 90 MB").

## How each picture was found, judged and held

1. **By part number, on the maker's own page.** Nothing was matched by name or resemblance.
   - **Garmin** (and its Fusion audio): `garmin.com/en-AU/p/pn/<part number>`. The page's own product data carries an entry keyed by that exact part number; its default image is the picture. 80 of the 86 Garmin-coded rows had an entry.
   - **Lowrance and Simrad**: every product page in each site's own en-AU sitemap was read (454 Lowrance, 722 Simrad). A page is matched to a row only where the row's code is the part number the page says most; the picture is the page's own product image. 142 of the 178 Navico-coded rows were matched.
   - **GME**: `gme.net.au/au/product/<model>/`, which GME redirects to the model's page, and only a picture whose own file name begins with the row's code (`GX700W-Front…`). 11 of the 64 GME rows had one.
2. **Proposed on contact sheets.** `tools/seed/propose-parts.ts` fetched each into the shared cache and drew seven sheets, `docs/research/imagery/proposals/parts-*.png`: the picture, the file's name for the part in large type, and the maker's own name for that part number under it.
3. **Judged by eye.** 232 proposals; **196 accepted, 36 rejected** (`parts-*.verdicts.json`). Then every pair of proposals for different part numbers whose pictures looked alike was compared pixel by pixel at 256 px.
4. **Held** by the same `tools/seed/fetch-images.ts --accepted` that holds every other catalogue picture, into `public/seed-images/`, with full provenance in `data/northside/pictures.json`: address, the page, host, date, source and held size, sha256, licence note, what it depicts, what it does not show (`differs`), and the verification line "verified by eye, contact sheet, 2026-10-30". A second run fetches nothing.

A part is its own model: one name in one fit register, and the rows that carry that name (`fitItemsOf`, `src/domain/catalogue/fitItems.ts`, with its test). The holding tool and the ledger's test both read it, so a picture can never be attached to a name the file does not carry, and two rows the file names differently never share one picture, even when their codes agree.

**What a picture says it does not show.** A display sold with a transducer, where the maker shows the display alone, says so: "The transducer this part includes is not in the picture." So do Garmin's chart cards (the picture is the chart's coverage), the Fantom 18 (the file says 18 xHD and Garmin says 18x for that part number), the HALO 20 (Simrad's page says HALO20+) and GME's LE028 lead (the plug and wires only).

## Every row still without a picture, and why

All 4,259 rows, each with its code and the file's own name, are in `docs/directions/flow/pictures-gaps.json`, grouped by these reasons.

| reason | rows | what it means |
|---|---:|---|
| `package` | 1,576 | **A dealer-fit package is an installation**, not an item: a part (sometimes two), the labour to fit it, sundries and sublet work, priced as one. No maker photographs a package, and a picture of its main accessory would stand in for the whole package. The honest picture is the part's own, on the part's row, or a picture the dealer takes of the fitted job and adds themselves. |
| `rigging-kit` | 615 | **Yamaha's rigging kits** are bundles of harnesses, control cables, gauges and fittings put together to a part list. Yamaha publishes no picture of a kit, and a picture of one of its parts would stand in for the kit. |
| `not-yet-sought` | 1,709 | Rows of makers this round did not reach. **Not a finding that no picture exists.** By supplier: Yamaha (YAM and Yam: 671, mostly propellers and service items), Highfield spare parts and consoles (233), MSA plumbing and hose (116), BLA (79), BBB life jackets (78), SAW anchors and lights (78), IBC tube covers (61), FRM (56), ePropulsion parts (47), Minn Kota (43), OCE (42), Supercharge batteries (28), Lone Star winches and anchors (21), Hella (11), Momentum (11), and smaller ones. Where to look next is below. |
| `not-a-thing` | 168 | **Nothing to picture**: labour estimates, sublet work, special notes, antifouling with hardstand and marina fees, trailer adjustments, factory installation charges and "Optional Fuel Tank Not Required". |
| `gme-no-own-picture` | 53 | GME has no page for the model (the EPIRBs and PLB under their AUS codes, the GS box speakers), or the model's page carries no picture whose file name is that model's code (most antenna whips, bases and leads; the GX750 black boxes; the GR300 and GR350 stereos). A picture named for another code is a sister model and was not taken. |
| `made-or-done-here` | 33 | Northside's own work or something made to order (NSM safety-gear sets, Cross Creative Designs decals, Marine Works and Springers jobs). No maker's picture exists; a dealer's own photograph is the honest one. |
| `navico-no-page` | 36 | No Lowrance or Simrad Australian product page names that part number as its product: older HOOK2 and Elite sun covers and gimbal brackets, the Bullet and SplitShot skimmers, two Reveal chart cards, the NSS 4-10 no-sonar, the NSX "ROW" (rest-of-world) units, the AP44 packs, the V3100 AIS, the RS40-B without GPS-500, the GS25 and others. |
| `rejected` | 35 | A picture was found and refused on the contact sheet, each with the verdict that refused it. 31 are **one picture published for several part numbers** (the HDS LIVE bezels for four screen sizes, the N2K cables for three lengths, the XSONIC SS175 and SS60 tilt angles, the TM260 and TM275LH-W, the Elite FS 10 and FS 12, the ActiveImaging HD HW and M/H, the 9-to-7-pin adapters, Garmin's GT52HW and GT54, its two network cables, the VHF 215i and 215i AIS, the Fusion XS RGB 6.5" and 7.7"), which cannot show which of them a part is. The rest: Lowrance's ActiveTarget 2 picture is a sonar screen, not the kit; Simrad's page for the 1.8 m Ethernet cable shows a placeholder; GME's whip (30 pixels wide) and case (150 × 115) pictures are too small to draw. |
| `garmin-no-page` | 6 | Garmin's part-number address has no entry for it: the TM275LHW (010-12571-20, on two rows), the B175M 20° bronze, the LiveScope Perspective mount, and the Fusion Classic 2- and 4-channel amplifiers (010-01499-00, 010-01500-00), which Garmin no longer lists. |
| `refused-by-host` | 1 | The 10 m HALO cable: Simrad's own image address carries an unescaped "+" that its host refuses. |
| `consumable-not-sought` | 27 | Oils & Consumables were not reached this round. |

The 89 rows of the makers' motor packages are not in the list above: each is a motor with its rigging, priced as one. The motor itself has its own picture on the motor register where one is held, and a package picture would stand in for the package.

## Where the next pictures come from

In order of what a dealer sells most, each by part number on the maker's own page, through the same proposal tool, sheets and verdicts:

1. **Yamaha propellers and service parts** (671 rows): Yamaha Motor Australia's parts pages, by Yamaha part number.
2. **Highfield spare parts, consoles and covers** (294 rows with IBC): Highfield's own accessory pages.
3. **Minn Kota, ePropulsion, Supercharge, Lone Star, Railblaza, Hella, Momentum, Salty Captain** (about 180 rows): each maker's own product page; ePropulsion's parts carry its own codes (`SP-B000-02`), Hella's its part numbers (`2LT980670301`), Salty Captain's shop lists SKUs.
4. **BLA, BBB, SAW, MSA, OCE** are distributors' own codes; their rows need the distributor's own catalogue page for that code, never a picture of a look-alike.

And for everything no maker photographs — a package, a rigging kit, Northside's own work — the dealer's own picture is the right one, and it belongs to that one option only, with "added by <name>, <date>" in the same ledger (the walk's floor item 2; not built in this round).

## What a screen does with them

The build already asks the one reader for every option it lists (`goods` in `src/screens/configurator/chapters.ts` → `copyOf`), so a part with a held picture now draws it on its option in the fit chapter, and a line on the paper may carry it (`forLine`). A part without one draws the build's honest no-picture state, never a stand-in.
