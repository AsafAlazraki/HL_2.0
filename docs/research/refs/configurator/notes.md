# Configurator — the sweep

Driven live 2026-09-17 with `tools/research/capture.ts` into four modalities (`boats/`, `cars/`, `premium/`, `deep/`). **115 sources driven · 100 frames on disk · 93 distinct images · 15 failed outright.** Of the 100 captured, **45 are 404s, bot walls or consent overlays** — counted, listed in `sources-index.md`, never cited. The old repo's stock was re-read as evidence: it is **172 PNGs, 144 distinct**, not 176 frames. Every frame named below was opened. Paths are relative to this folder; stock paths sit under `C:\Users\Asaf\dev\hl-refs\ref\`.

## 0. What the file actually asks of this screen — measured

The brief says a chapter may have to show 2,519 candidates. **It never does.** `join_hf_yam` is 2,519 rows across **588 Highfield hull rows**: the median hull offers **3** motors, the largest **12**, the smallest **1**. Across all eight motor joins: 1–13. The 2,519 is a property of the table, never of a screen.

| chapter | drawn from | shown at once | starred |
|---|---|---|---|
| hull / variant | `boat_highfield` 588 rows (next largest `boat_stacer`, 91) | **588** | — |
| motor | 8 joins, 3,957 pairings | 1–13, median 3–8 | **exactly one, always** |
| trailer | 8 joins, 489 pairings | 1–4, median 1–2 | most, not all |
| dealer fit | 3 joins, 1,495 pairings | 1–4 | **none** |
| P/D parts | 6 joins, 2,561 pairings over `parts` (2,937 rows) | 1–10 | **none** |

The star census, counted: **588 of 588** Highfield hulls star exactly one motor; 91/91 Stacer, 39/39 Formosa, 37/37 Stabicraft, 19/19 Surtees, 11/11 Jeanneau; both factory-package joins star one of thirteen. Trailers star 87 of 88 Stacer hulls, **11 of 15** Surtees, and the three GFAB joins star **none of their 109 pairings**. Dealer fit and parts star nothing. **A board that stars a part, or assumes every chapter has a star, is inventing.** So: the hull chapter needs a register; the motor and trailer chapters need a short pre-answered list; the parts chapters need counted narrowing with no recommendation to lean on.

## 1. What is genuinely best — the four hard questions, answered

**1 · Candidates, and how the eye gets to the right one.** Motors and trailers have no scale problem (§0); the 588-variant hull chapter and the 2,937-row parts chapter do. **`deep/porsche-search-open.png` is the best answer in the sweep:** a search field sits above every chapter card, and typing three letters turns the whole panel into grouped, priced, *tickable* results — the match bolded, the option code inline (`Seat ventilation (front) | 4D3 · $2,220.00`), no mode change and no results page. In that same rail Porsche runs four row shapes for four kinds of content — swatch grids, tile grids, checkbox-and-price rows, photo cards with a corner checkbox (`cars/porsche-911-configurator.png`, `deep/porsche-911-deep-scroll.png`) — and our chapters differ the same way: a colourway is a swatch, a motor is a fact row, a part is a counted list. Framework's is the counted version (`deep/framework-marketplace.png`): `563 results` over a rail where every category prints its own count (`Keyboards (249)`, `Parts (166)`). Apple's is cheapest (`premium/apple-macbook-pro-14-scrolled.png`): a *collapsed* band states its extent and what already narrows it — *"Choose from options up to 128GB with your current chip selection"*. Rejected: Dell's 237 controls in 60 expanded groups (`configurator-teardowns-2026.md`).

**2 · Where the running price lives; ADD versus TOTAL.** **`deep/whaler-engines-chapter.png` is the best frame in the sweep, and it is a boat.** Panel head `‹ 3. ENGINE(S) ›` with its own arrows and a ×; sub-group head `SINGLE ENGINE` with an `Expand` link; two radio rows, each a bold model line over a grey make line (`40 ELPT EFI Black FourStroke` / `Mercury engine`) — and **the price is a delta against what is fitted: `$0` for the chosen 40hp, `−$853` for the 25hp, minus sign printed**, while the stage above keeps `Starting at: $23,906*`. Both facts on one screen: where the total stands, and what this pick would move it by. That is our motor chapter, shipped, by a boat brand, against a boat's HP envelope. The others disagree: Porsche puts the **delta** in the header, labelled `$0.00 / Price for equipment`, and hides the total behind `Summary`, with an asterisk to a footnote naming GST and LCT (`ref/porsche-summary-a.png`); Axopar uses a foot pill beside the pager, `Configuration Price 206 300 €` (`ref/boats/axopar-cfg-1.png`); Apple a sticky strip with a From price and its monthly tied to a `±` footnote. **Saxdor puts it nowhere** — nine chapters with no money, then a name/email/phone form before `PRICE BREAKDOWN` (`ref/boats/saxdor-deep-12.png`). A dealer tool inverts Saxdor and takes Whaler's pairing. `price-framing-and-bundles.md` adds the rule — every saving computed at render time, never stored.

**3 · The refusal.** `explaining-a-refusal.md` settles the grammar (*Because … And because … So, because …*, closing on the person's own last pick; fixes ranked and priced). The frames add four things. PCPartPicker live (`premium/pcpartpicker-list.png`): a full-width red banner naming severity **in words** — *"Warning! These parts have potential incompatibilities. See details below."*, `details` an in-page anchor — and **not one control disabled**: the clashing board and CPU sit as ordinary rows, every Buy live, the total still summed, "Out of stock" printed as text in an Availability column. GOV.UK gives the band-level shape (`premium/gov-uk-error-summary.png`): *"There is a problem"* in a red-ruled box, each problem an underlined link jumping to the control that caused it. Porsche keeps free-because-standard apart from `$0.00` by printing **`Standard Equipment`** in the price column (`ref/porsche-summary-b.png`) — the distinction `ConflictLine.to: number | null` already holds. And Apple shows the refusal *before* it fires, printed on the candidate: *"Available with M5 Pro or M5 Max chip."* (`premium/apple-macbook-pro-14.png`) — our motor card carries its HP envelope and our trailer card its ATM floor the same way, so most refusals never have to fire. **What no frame shows is the cascade**: its teardown's evidence image never came across into HL_2.0, and every Porsche sub-chapter returned a route-level refusal instead (`deep/porsche-911-packages.png`). No board may draw the cascade sheet from a frame — cite `cascade-teardown-porsche-live.md` and leave it to screen 5.

**4 · The recommended option.** Saxdor's is best, and it is not a badge — it is a **pre-answered chapter with an explicit door out** (`ref/boats/saxdor-deep-09.png`): *"Recommended technical options are already included in your configuration. You can continue with these selections or review and adjust any section below."* over a filled **KEEP PRESELECTED OPTIONS** beside an outlined **REVIEW AND CUSTOMIZE**. Apple says it in words: *"Stay with the standard model or make edits."* Whaler's is a plain radio at `$0` with alternatives priced against it; Porsche's is quietest, the answer named in text above the row. **None uses a star, a ribbon or a colour.** Given §0, the honest shape: the starred row is already chosen when the chapter opens, and the head says so in a sentence naming the file (every pairing row carries its source cell, e.g. `Boat Module!R282 KZ..LD`).

## 2. Patterns worth taking, named

**The band that states its own answer** — number, name, current value, chevron, so the build reads collapsed (`premium/hermanmiller-aeron-config.png`).

**Search is the navigation** — a field above the chapters returning grouped, priced, tickable rows with the match bolded (`deep/porsche-search-open.png`).

**The group carries the price** — `Legends $7,870.00 ⓘ` above the swatches, so a family's cost is known before its members are read (`cars/porsche-911-configurator.png`).

**Delta against what is fitted** — every candidate priced relative to the current pick, negatives with a minus (`deep/whaler-engines-chapter.png`).

**The count on the collapsed band** — `Wheel Accessories ⓵` (`cars/porsche-911-scrolled.png`), repeated on summary group heads as `Technology 11` (`ref/porsche-summary-c.png`).

**The dealer's own code beside the name** — `0Q`, `58X`, `1G8` in grey on every summary line and inline in search results (`ref/porsche-summary-a.png`).

**Standard is not $0.00** — a word in the price column where the figure would be, keeping "included" and "free" apart (`ref/porsche-summary-b.png`).

**The em-dash in every empty cell** — never a blank, never a zero, in a table still being built (`premium/pcpartpicker-list.png`).

**Chapter arrows inside the panel head** — `‹ 3. ENGINE(S) ›`; the pager lives with the chapter it pages, not at the foot of the window (`deep/whaler-engines-chapter.png`).

**The interstitial that names the progress** — a band between chapters carrying a line about the build, not a step count: *"TAKING SHAPE / Your build begins to show its character."* (`ref/boats/saxdor-deep-06.png`).

**A global switch on a closed band head** — a `230V | 120V` segmented control on the *collapsed* `Power & Batteries` row, re-filtering everything under it (`ref/boats/saxdor-deep-10.png`). Ours is the price rung.

Four more, one line each: **the no-op as a peer card** (`premium/apple-mac-studio-deep.png`); **the counted rail** (`deep/framework-marketplace.png`); **resume by code** (`ref/boats/zodiac-cfg-1.png`); **hull type as the browse axis** (`deep/grady-white-build-boat.png`).

## 3. Type and motion, as observed

Boat-cohort chapter titles are wide, light, extended grotesks in caps at ~30px over 15px body — Saxdor measures about 2× head-to-body (`ref/boats/saxdor-deep-05.png`), its finale ~90px over water (`-11.png`). Porsche's rail holds *everything* at 15/16px: option name and price the same size, price right-aligned, never larger. Whaler is the only frame where the price is the largest thing on the stage, ~28px under a ~24px model name. Apple's hierarchy is two-tone at one size — the antidote to a 6× head. Money never animates in 93 distinct images and nobody sets it in mono; all four right-align figures in the body face, which is what lets Porsche print the *sentence* `Standard Equipment` in the same column as `$0.00`.

A still cannot prove an easing, so this licenses one sentence, not a spec. **The finale hero moves** — `saxdor-deep-12`, `-13`, `-14` are the same scroll with three photographs and three distinct sha1s. Everything else is a control that *exists*: Porsche's ten-camera filmstrip and its `▷`; Whaler's three-dot stage pager; Axopar's `← 1/9 →`. Motion here is asked for, not inflicted. Two negatives are measured: the stock's **eight** Axopar configurator frames are **two distinct images of one view**, so no board may claim a step sequence from them; and De Antonio's stage came back an empty bordered box in both the stock and the live re-drive (`ref/boats/deantonio-cfg-1.png`, `boats/deantonio-configurator.png`).

## 4. What to avoid, each with its frame

- **The price behind a form** — nine chapters, no money, then Boating country / Full name / Email / Phone before `PRICE BREAKDOWN` (`ref/boats/saxdor-deep-12.png`).
- **The configurator behind an email and a CAPTCHA** — `ref/boats/beneteau-cfg-1.png`: an email field, two consent boxes, a Friendly Captcha, `CONTINUE`, and "Continue without saving" as a small underlined link beneath it.
- **An exit-intent form over a working build** — `boats/whaler-cfg-scrolled.png`: five personal fields over the live configurator, `NO THANKS` / `SUBMIT`.
- **A chapter with no prices at all** — `ref/boats/saxdor-deep-05.png`, `-07.png`: name, sentence, checkbox, money nowhere in nine chapters.
- **Two sub-groups with the same name** — `deep/porsche-911-deep-scroll.png` prints `More seat options` twice, sixty pixels apart, different rows under each.
- **A chapter URL that dies** — `deep/porsche-911-packages.png`: a moved chapter returns "This Model is No Longer Available…" with an Error ID. Our chapter position is a search param and must survive Back, refresh and a shared link.
- **A stage that never painted** (`boats/deantonio-configurator.png`, a bordered empty box) and **a gate before the tool** (`cars/astonmartin-vantage-configurator.png` asks region and language on a dark card before anything is configured).
- **Dell's whole shape** — 237 controls, 60 groups expanded, a headline price that never moves (`configurator-teardowns-2026.md`; unreachable here, `premium/dell-xps-config.png` landed on the shop home).

## 5. Four directions — different compositions, different orders, different groupings

**A — "Six heads, one open."** No stage. One column of six numbered accordion heads, each stating its own answer *and* its own subtotal on the head row, exactly one open at a time, the hull a 200px card above and `Total` a permanent seventh row at the foot. Flat, ordered by decision; the whole build readable in seven lines before anything is opened. **Exclusive to A:** `premium/hermanmiller-aeron-config.png` (the numbered head naming its own value while closed) and `premium/apple-mac-studio-deep.png` (the no-op as a peer card — "Add a trade-in" beside "No trade-in" — which only a register where every head must show an answer needs). **Only A** reads whole without opening a chapter.

**B — "Stage and rail."** The boat fills two thirds with a picture pager; the rail is one scroll whose *first* element is a search over all 8,679 pairings, then a card per chapter sub-grouped by the join's own facts — motors by HP band, trailers by ATM class, parts by family — each sub-group priced at group level. The header carries the labelled delta; the total lives behind a `Summary` door. **Exclusive to B:** `deep/porsche-search-open.png` and `deep/porsche-911-deep-scroll.png` — a search returning tickable priced rows, and one rail running four row shapes. **Only B** navigates by typing, the one direction that reaches the 588-variant hull chapter without a second screen.

**C — "One chapter, one window."** Strictly sequential: a numbered chapter rail down the stage edge with the current chapter hollow and the rest filled, chapter arrows in the panel head, an interstitial band between chapters naming what has been decided. Its first screen is not a chapter but the **recommended build, already assembled**, with two doors — keep it, or review it chapter by chapter. **Exclusive to C:** `ref/boats/saxdor-deep-09.png` and `deep/whaler-engines-chapter.png`. **Only C** lets a dealer finish a quote without making a single choice.

**D — "The document, being written."** Not ordered by chapter at all: the screen *is* the quote, line by line in document order, from the first paint. The hull line is written; every other line already exists, named, with an em-dash in its price column until answered. Picking happens in place, in the line; refusals are a banner that links to the line that caused them and disables nothing; the finale is the last em-dash filled. Grouped by what the customer will read, not by what the dealer decides. **Exclusive to D:** `premium/pcpartpicker-list.png` (a build as a priced table with an em-dash in every empty cell and a warning banner that disables no row) and `ref/porsche-summary-a.png` (every line thumbnail · name · code · price-or-`Standard Equipment` · `Change ›`, group heads carrying counts). **Only D** makes the document the configurator; A, B and C produce one afterwards.

## 6. Imagery — what the seed can honestly put here

**Eight stage photographs** (`heroes-ledger.json`, each `kind: "photograph"` with a source page, a licence note and a sha256): Highfield SP560 2560×1708, SP600 2560×1918, PA600 2560×1707, ADV7 2560×1706; Stacer 519 Sea Ranger SDF 2560×1694, 481 SeaMaster 1771×1183, 309 Skimma 1500×1010, 359 Territory Striker 1200×800. Five clear 1694px and fill a 1440×900 stage with room to crop; **the 309 Skimma and the 359 Territory Striker cannot and must not be asked to** — Stacer publishes its on-water work at web size, which is why a stage direction must name the hull it stands on. Against that, **329 catalogue copies capped at long edge 1100**, only 39 reaching it: a row, a tile or a thumbnail, never a stage. Highfield is renders in the catalogue tier and photography in the hero tier; a board must say which it draws.

**The stage cannot answer the rail.** Porsche's ten cameras swing to the option picked; the pack holds one picture per model, no interiors, no second angle, a colourway render for very few. **A direction promising a stage that responds to a pick is promising a render pipeline that does not exist.** The honest substitute is Whaler's: a small pager over the pictures a model has, which does not change when a motor is chosen.

**Seventeen mark files, eighteen ledger rows, twelve of thirteen brands.** The hull chapter can render Highfield, Stacer and Jeanneau (dark and white), Formosa, Haines Signature and Surtees (dark only); **Stabicraft is the honest hole** (`"error": "no public wordmark verified"`, dated). The motor chapter has Yamaha (dark only) and ePropulsion; **Mercury is white-ink only**, so a Mercury mark needs a dark ground or it is not drawn. The trailer chapter has Dunbier, GFAB, Mackay and Stacer — and **nothing for REDCO/Tinka or NSM Custom**, between them 125 of the 444 trailer rows.

**Dealer fit, parts and rigging have no pictures in the pack at all.** A parts row is a name, a code and a price; the counted register is its picture (`deep/framework-marketplace.png`). The drawn outline the home sweep found (`home/live2/wally-fleet.png` — grey side-profile line drawings under `SAIL` and `MOTOR`, the word *project* in italics where the model does not exist yet) is the honest option where a photograph does not exist — never a stand-in. **And because a second dealership replaces the photographs and the mark**, every direction must degrade photograph → mark → wordmark; a chapter head that *needs* a photograph has no Stabicraft chapter.
