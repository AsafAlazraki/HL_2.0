# A maker's own page, verify 1 (2026-11-04)

A fresh verifier walked the built page (commit 93a64e08, tree clean) on its own port, 6284. The app was built into `e2e/out/dist-6284`, served by `vite preview`, and opened through the real door (Entry, "Load the Master Price File") on the real price list. Every job was done by hand at 1440x900. Then 33 states were swept at all six sizes, each one shot and measured:
- sideways scroll;
- text under 12px;
- text cut by its own box;
- a control under 24px;
- overlap of visible text runs;
- text past the screen's edge.

The frames are in `verify-1/` and each name ends in its size. Frames starting with `p-` are the targeted probes.

The page is a large step up. Every model is on it, with figures and a picture or an honest sentence, and the compare, the gallery, the prices, the quotes and Changed here all work and all land where they say. The verdict is still **not perfect**:
- one blocker: a figure the file does not carry is printed on every trailer list;
- two majors: on a phone, a refusal is not said where it is refused, and a wrapped line of facts still begins on a dot at every size.

## The jobs

| Job | State | Proof |
|---|---|---|
| Show what Highfield makes | DONE | 24 cards with picture or "No picture of the X is held", spoken name, from-price, code, versions; *Show all 67 models* to `?models=all` (67 drawn) — `01-hf-top-*`, `04-hf-showall-end-*` |
| Budget, family, tow car | DONE | from-price at Cash, length, people, hp on every card; Price and Length order; weight/load/fuel in the compare — `10-by-length-*`, `08-compare-*` |
| What goes on one model | DONE | Sport 660 card: 7 motors, 2 trailers, 4 packages, 3 parts, F175XC recommended. Fitment on that boat shows the same: 7 of 209 motors, 2 trailers, Dealer Fit 4 · Parts 3, and the starred motor is F175XC. *What fits* lands on `/fitment?boat=boat_highfield:513` — `j03-whatfits-lands-1440` |
| Boat on the water | DONE | *See the 18 photographs* opens "1 of 18" with caption and credit — `12-gallery-*` |
| Start the quote | DONE | *Quote it* opens the picker with Sport 660 chosen. *Start the quote* minted a draft at every size — `j05-quoteit-lands-1440` |
| Find an earlier quote | DONE | "Highfield Sport 660 · PVC · White / White / White/Blue", $61,700, "Nobody named yet", "Draft · 2026-11-04 · 20261104-01". The find appears only from six quotes, so it was not exercised — `14-after-onequote-*` |
| Its line | DONE | 95 characters refused: "A place’s line is one line under its name: 95 characters is 5 over 90." — `p-line-refused-1440x900` |
| Its mark | DONE | REDCO: "No mark for REDCO / Tinka Trailers yet." said once, with only *Name in type* offered — `27-redco-settings-*` |
| Its photograph | DONE | "Only Highfield Inflatables' own boats are offered" — `26b-hf-settings-full-*` |
| Its colour | DONE | eight grounds, "White words on cobalt read at 10.4 : 1" — `26b-hf-settings-full-*` |
| Sold on its own | DONE | names the 7 other trailer lists — `27-redco-settings-*` |
| Every model on the page | DONE | Jeanneau 27 = 27 drawn (4 under "Filed under no series", named); Stabicraft 37 = 37; Dealer Fit 74 unfiled drawn first |
| What it sells at, each price | DONE | Cash and Trade spans per series with n of n priced, and Warranty named as kept with no figure — `13-after-noquotes-*` |
| What was changed | DONE | one Cash edited in the sheet; Changed here listed "Highfield Roll Up 230 KAM · PVC · WH, 2026-11-04", and the door landed on `/data/boat_highfield?at=boat_highfield:1` — `p-changed-here-1440x900` |
| A series in the price list | DONE | *Open Sport in the price list* lands on `/data/boat_highfield?in=Sport` |
| To a partner | DONE | Goes with › Yamaha lands on `/places/mot_yamaha` |
| An hour of labour | PARTLY | A sentence says why no rate prints, and the door goes to `/data/labour_rates`. The figure itself is still a press away, and the sentence reads "Prices does not carry Labour Rates yet" — `23-labour-*` |
| OBSOLETE trailers | PARTLY | All 10 are drawn, each "No longer sold", but every one says "boats of 575 m", "boats of 700 m" (see the blocker) — `22-obsolete-*` |
| Unknown address | DONE | "No place is called “nothing_here”", with the way back — `28-unknown-*` |

## The missing items

| Item | State | Proof |
|---|---|---|
| The models on the page | DONE | `01-hf-top-*`, `15b-jeanneau-full-*`, `17-stacer-*` |
| What each model carries, one press to Fitment, standard inclusions said once | DONE | counts match Fitment for the Sport 660; the "not held yet" sentence is said once under the range |
| Compare two or three | DONE at a desk | `08-compare-*`, `09-compare-end-*`. On a phone, the tray and its refusal are out of sight (major gap 2) |
| Prices with figures; a sentence and a door where none is declared | DONE | `13-after-*`; Labour Rates and Dealer Fit each say why, with a door (`23-labour-*`, `25-dealer-fit-*`) |
| Motors and trailers by their own facts | PARTLY | Yamaha's horsepower ladder carries 27 ratings and 47 rigs (sums to 209), each with kg, shaft, control and Sell Price (`20-yamaha-150-*`). No motor says which boats it fits. Trailers show ATM and Sell inc Rego but no trailer length, and they print boat sizes the file does not hold (blocker) |
| Quotes as a usable list | DONE | `14-after-onequote-*`; find not exercised |
| Accessory places hand off to the chandlery | DONE | *Open the chandlery* lands on `/catalogue`. The head's figures disagree with its own sentence (minor gap) — `24-parts-*` |
| One gallery of all photographs | DONE | `12-gallery-*` |
| Changed here opens its lines | DONE | `p-changed-here-1440x900` |

## Gaps

1. **BLOCKER — a figure the file does not carry, on every trailer list.**
   - `src/domain/lineup/shelf.ts:124` appends " m" to the file's "Boat Size (Mtr)" text, which holds model numbers and names: "495", "MF 605", "Highfield ADV7", "Jet Ski".
   - The page prints "boats of 575 m", "boats of 2750 m", "boats of Highfield 460 m" and "boats of Jet Ski m".
   - Measured: 45 distinct such strings on NSM Custom, 23 on GFAB, and all 10 OBSOLETE trailers. REDCO's sizes are real metres and read right.
   - Proof: `p-trailer-boats-of-1440x900`, `21-trailers-nsm-*`, `22-obsolete-*`.
2. **MAJOR — on a phone, a refusal is not said where it is refused.**
   - At 390x844 the dock does not dock, and the same holds at 844x390. With three boats set, *Compare the Sport 900* refuses.
   - The refusal sentence stands at y = −3432 in an 844px window. No live region announces it, and the button stays `aria-pressed=false`, so the press looks dead.
   - The *Compare 3* tray is equally out of sight once a person is among the cards.
   - Proof: `p-fourth-refused-where-pressed-390x844`, `06-tray-3-390x844`.
3. **MAJOR — a wrapped line of facts still begins on a dot, at every size.** The builder reported this fixed. It is not:
   - SP300: "3 m · people not in the price list" / "· 25–30 hp";
   - Sport 800: "· 250 hp to 350 / 2 × 200 hp", with Sport 900 and ADV9 the same.

   Proof: `10-by-length-1440x900`, `04-hf-showall-end-1440x900`, `04-hf-showall-end-1920x1080`, `07-compare-refused-390x844`, `p-fourth-refused-where-pressed-390x844`.
4. **MINOR — the largest boats' horsepower reads as the raw file string.** The file has Min "2 x 300HP" and Max "425 / 2 x 300 HP", and the card says "2 × 300 hp to 425 / 2 × 300 hp". ADV9 says "450 hp to 450 / 2 × 300 hp".
5. **MINOR — on a phone, the kit labels run together as "packages parts".** The measured gap between them is 4px at 390, so the labels read as one phrase. Proof: `02-hf-scrolled-390x844`, `17b-stacer-longest-390x844`.
6. **MINOR — the Parts head disagrees with its own sentence.** The head says "2,937 products in 187 categories". The sentence says "the same 2,238 products … rather than drawing 180 headings". *Open the chandlery* also stands twice. Proof: `24-parts-*`.
7. **MINOR — the opened compare leaves the series tiles under the floating bar.** "History" overlaps the Sport tile's "16 models", measured at 1280 and 1440. Proof: `08-compare-1280x800`, `08-compare-1440x900`.
8. **MINOR — two phone wraps.** The quote row's boat name wraps to four lines, with one beginning "/ White / White/Blue". The price spans break at the dash ("$105,930–" / "$198,610"). Proof: `14-after-onequote-390x844`.
9. **MINOR — Yamaha's default rating leaves an empty half.** The 2.5 hp rating is one row in half of a full-width box, with the right half empty. Proof: `19-yamaha-1440x900`.

## The perfect bar, size by size

The measure found 0px of sideways scroll, no text under 12px, no cut text, no control under 24px and no page error in any of the 33 states at any of the six sizes. The only overlap it found is gap 7.

| Size | Verdict | Why |
|---|---|---|
| 390x844 | NOT | Gaps 1, 2, 3, 5 and 8 |
| 844x390 | NOT | Gaps 1, 2 and 3. The head's act stands above the fold (`01-hf-top-844x390`) |
| 834x1112 | NOT | Gaps 1 and 3. The dock is 230px tall over 1112, which is acceptable |
| 1280x800 | NOT | Gaps 1, 3 and 7 |
| 1440x900 | NOT | Gaps 1, 3, 4, 6, 7 and 9 |
| 1920x1080 | NOT | Gaps 1, 3 and 4 |

Kept and confirmed:
- reduced motion: the compare's scroll reads `prefers-reduced-motion`;
- keyboard: the Tab order runs find → price list → each card's Compare, What fits, Quote it, with a 3px focus ring;
- tokens: no literal colour in `places.css`;
- night theme: not exercised, because it is the app's own pref and not the media query.
