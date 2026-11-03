# The chandlery (`/catalogue`), built — data round, 2026-11-03

**Direction A, "the aisle as a page"** (`boards/a.html`, shots `boards/shots/a-*.png`), with the three grafts the judges named from board C: its photograph card for the pictured parts, Northside's mark at shop-sign size beside the word Chandlery, and the picture drop matched by the code in the file name. Built by the builder; **provisional** in `docs/SCREENS.md` until the owner picks by eye. The losing boards stay where they are (`boards/b.html`, `boards/c.html`), and the decision names them (`docs/DECISIONS.md`, 2026-11-03).

Every screenshot named here is in `after/`, its size in the file name. `after/shoot.cjs` takes them through the real door with the real Master Price File and measures each state as it shoots: **84 shots, 14 states at all six sizes, every one 0 px sideways and 0 runs of text cut by their own box** (the one "cut" the shooter prints on pictured aisles is the Show control's legend, which the kit keeps visually hidden for a screen reader).

## What it is

| Page | Address | What it draws |
|---|---|---|
| The front | `/catalogue` | Northside's mark on a white sign beside **Chandlery**; "2,238 parts on sale in 18 aisles and Not sorted yet · 180 headings of the price list · 197 pictured"; find over the whole list; the customer's boat; the 19 aisles as plates, each with its drawing or a photograph from the aisle where one is held, its counts, and its four largest headings as links straight to their section; at the foot, *Pictures by their code* and *The suppliers, in Northside's words*. |
| An aisle | `?aisle=anchoring` | Replaces the front and opens at its top. The way back, the aisle's tile and name large with its parts, headings and pictures counted, *Its 6 headings* folded open on a press, and the boat at the head's right. A dock that sticks under the bar (find in this aisle; Pictured · All · No picture where the aisle has pictures; once the name has scrolled under it, a line saying aisle · supplier · boat). The suppliers (filters at a desk, one menu below a tablet or on a turned phone) and the order. *Made for* the boat, first. Then the file's headings as sections, each counted, the pictured headings first, pictured parts as cards and the rest as ruled lines. |
| A part opened | `&open=parts:38` | In place, under its line (or across its card's row): the heading it is under, how it is fitted (Install Type), the boats it is made for; *Open its line in Parts & Accessories*; the quote's sentence and its way to switch it on, or *Start a quote with it*; Northside's own picture beside it; a line with no heading can be put in an aisle. Escape shuts it and gives the caret back. |
| The suppliers | `?view=suppliers` | What the headings propose (LOW → Lowrance, all 144 of its parts under LOWRANCE; GAR 72/72, SIM 34/34, MOM 11/11, RAY 2/2), the codes that differ only in capitals (YAM 459 · Yam 212), then every code on the list with its name or the field to give it. |

Every position is a search param: `aisle`, `supplier` (the old `maker` still read), `boat`, `show`, `find`, `sort`, `open`, `heading`, `view`. An aisle and the suppliers page are pushed and open at the top; everything else replaces where the window stands.

## The jobs, each done on the screen with the real price list

| # | Job | Now | Proof |
|---|---|---|---|
| J1 | Show the customer an aisle | **Done.** The press replaces the front; the aisle's name is in the first window at every size, `scrollY` 0 | `catalogue.spec` J1 at six sizes; `02-anchoring-boat-*` |
| J2 | How much fitted? | **Done.** Every line and card says supply and fitted, labelled. *Trailer Adjustment · 15 to 17ft* reads "Fitted only · $206 fitted"; the file's own $0 says "as the price list writes it"; no price at either says so, with *Put it right on Review* | `catalogue.spec` J2; `06-trailer-fitted-only-*`; `chandlery.northside.test` (101 fitted only, 1,882 differ) |
| J3 | Find by maker word | **Done.** *lowrance* answers 144 parts, by the heading | `catalogue.spec` J3; `07-find-lowrance-*` |
| J4 | Find by code | **Done.** *SG002* answers 1 part, Safety Gear · Smooth Waters | `catalogue.spec` J4; `08-find-code-*` |
| J5 | Show the part large | **Done.** The card's expand opens its gallery on the picture it draws, and counts its pictures once there are two | `gallery.spec` "the catalogue" |
| J6 | What fits his boat | **Done.** *For a boat…* finds and holds the boat (`?boat=`); *Made for the Stacer 529 Assault Pro · Tournament* first, "1 in Anchoring & mooring, of the 4 the price list makes for it", the rest said by aisle with *See all 4*; each opened part names the boats it is made for | `catalogue.spec` J6; `02-*`, `03-*` |
| J7 | Quote a part on its own | **Done as a sentence and a way.** Parts & Accessories carries no Quote today, so the opened part says "A quote cannot start with this part yet: Parts & Accessories is sold only with a boat today." with *Let it be quoted on its own* (the place's Settings); once switched on it offers *Start a quote with it* (the picker on that part) | `catalogue.spec` J7 |
| J8 | Northside's own picture | **Done.** The kit's picture control on the opened part, beside its facts; its refusal is read aloud where it lands | `03-line-open-*` |
| J9 | Work the parts with no picture | **Done per aisle and at once.** *No picture* in every pictured aisle; *Pictures by their code* on the front puts many at once, each only on the part its file name names | `catalogue.spec` J8/J9; `13-without-*` |
| J10 | Open a part's line to change its price | **Done.** *Open its line in Parts & Accessories* → `/data/parts?at=parts:N`; an unpriced part's way to Review | `catalogue.spec` J10 |
| J11 | Place the 28 *Not sorted yet* | **Done.** A heading (*DFO kits*) or a line with none is put in an aisle, one step with Undo, and moves there everywhere the shelf is read | `catalogue.spec` J11; `09-unsorted-*` |
| J12 | Narrow by maker | **Done.** Suppliers counted; named once by Northside, YAM and Yam given one name are one | `catalogue.spec` J12; `10-suppliers-*` |
| J13 | Walk the 447 propellers | **Done.** Ten sections from the file's headings, each counted, on one page that keeps its place; sort by price or most quoted; *Its 10 headings* | `05-propellers-*` |
| J14 | The file not on this computer | **Kept.** The sentence and *Open the price list* | — |
| J15 | A wrong aisle or supplier | **Done.** "There is no aisle called “nope”. These are the 19." over the aisles; a wrong supplier is said under the filters | `catalogue.spec` J15; `11-wrong-aisle-*` |

## The judge's missing items

| Item | Severity | Built |
|---|---|---|
| Fitted price beside supply, labelled, never $0 where fitted | blocker | Yes. `twoPrices` (`src/domain/chandlery/prices.ts`) reads which price is which off the declaration (`contains.includesInstall`) and never one Northside keeps from customers. **TTF hours are not drawn**: the manifest declares `parts.o` a cost column, so hours stay off every customer surface; Install Type is shown on the opened part. |
| The aisle opens where the person is looking; a sticky head | blocker | Yes. A page of its own; the dock sticks at `--shell-inset` and says aisle · supplier · boat once stuck. |
| A composition for a list 91% unpictured | blocker | Yes. Cards for the pictured parts, ruled lines for the rest, Pictured · All · No picture where there is a choice. No dashed box reaches a line; Northside's picture control is on the opened part only. |
| `/catalogue` in `e2e/routes.ts` | major | Yes: `catalogue`, `catalogue-radios`, `catalogue-line`, `catalogue-find`, `catalogue-suppliers`. Radios, not Sounders, and *sarca*, not *lowrance*: on Sounders and on 144 answers the contrast and focus rulers' walks outlast their 30 s; the same compositions are measured where they finish, and Sounders and *lowrance* are shot at six sizes here. |
| Find by code, maker word, heading; name first; code on the card | major | Yes. `findLines` (`find.ts`); the build's chandlery reads the same now. |
| Makers in words, one maker once, a command with its inverse | major | Yes. `OrgProfile.suppliers`, `nameSuppliers` (`suppliers.ts`), proposals measured and never applied without a press. |
| Sub-groups from the headings, a sort, a page that keeps its place | major | Yes. `sectionsOf`, `picturedFirst`, sort `file · price · quoted`. |
| A door from each part to its line; unpriced to Review | major | Yes. |
| The boat chip | major | Yes. `madeForOf` reads every list that joins a boat list to the parts list: 6 lists, 2,561 pairs, 42 parts (the boards' correction of the judge's 75 holds). |
| Quote a part, or the sentence and the way to Settings | major | Yes. |
| Place a *Not sorted yet* heading, with Undo | major | Yes. `OrgProfile.aisles`, `placeInAisle` (`placing.ts`); `shelfOf` reads it, so the build's chandlery and Data's counts agree. |
| A picture worklist and a drop matched by code | major | The drop: yes (`byCode.ts`: the whole name or the code then a separator, longest code first, codes of three characters or more, refused where two parts carry the code — 50 codes on the live list do). The worklist: per aisle, *No picture*, ordered by the file or by *Most quoted here*; there is no cross-aisle worklist page — the front counts every aisle's pictures, and Data's *Needs Northside* is Data's to draw. |
| NB notes and labour read as notes and labour | major | Yes. The 2 NB lines are notes with their line; labour lines carry their glyph and no picture control. |
| Minor 14–17 (lede, the expand glyph on a navigation, the wrong aisle, the refusal growing its row) | minor | Yes: the lede counts 18 and Not sorted yet; no navigation wears the expand glyph; the wrong aisle is said; the picture refusal is in the opened part, read in a live region. |
| Minor 18, the file's shorthand in names (`t/s`, `w`, `PROPELLER`, the typo `Ativation`) | minor | **Not done.** Saying names is the namer's (`lineSaid`), correcting the typo is Review's; neither is this screen's. |

## The gaps the judge measured, closed

- **Picture-box text cut at every size**: no line draws the box; on the opened part it is 256–320 px wide. Cut ruler on all five routes at six sizes: passed.
- **Pressing an aisle shows nothing at 390, 844×390 and 1280**: the aisle is the page; h1 top at 72 (390×844), 108 (844×390), 116 (834×1112, 1280, 1440, 1920) px.
- **$0 and "No price" on parts priced fitted**: as J2.

## Measured on the way

- **A grid card cost seconds.** On a production build, pressing Radios (12 cards) took 2.2–5.9 s to draw and Sounders (161) about 30 s, with the card laid out as a grid beside the ledger's container queries. As a column of flex the same presses take 0.19–0.30 s and 0.38–0.71 s (`after/press.cjs`); Sounders, Radios and *lowrance* reach ready in about 1 s at 390×844 (`after/time.cjs`). The stylesheet says so where the card is.
- **The night theme**: every white surface this screen draws wears `data-ground="plate"` and sets its own ink from it; the contrast ruler measures both themes and passed at six sizes.

## The reflow

Written into `src/screens/catalogue/catalogue.css`'s header: 390×844 one column, the dock (find) at the window's top, Show in it where offered, the suppliers and the order as two menus side by side, lines stacked (name, code · supplier, the two prices labelled), two cards a row; 844×390 the head one line with the boat beside it, the suppliers folded, lines with the prices at the right, four cards a row; 834×1112 two aisle plates a row, filters that wrap; 1280 and 1440 the ledger with its column heads; 1920 the measure stops at 100 rem.

## Tests rewritten to the new truth

- `e2e/flows/chandlery.spec.ts`: *the catalogue is the same aisles on their own, behind Data* — removed; /catalogue is no longer the `Chandlery` component, so its walk is `e2e/flows/catalogue.spec.ts` (five tests, J1–J15).
- `e2e/flows/gallery.spec.ts`: *the catalogue: a part's card opens its own gallery…* — now finds through the front's find, the card is `.chd-card`, its expand reads "See the … larger" and, with two pictures, "See the …’s 2 pictures larger".
- New: `src/domain/chandlery/{prices,units,chandlery.northside}.test.ts`.

## What this round changed outside its folder

- `src/domain/model/project.ts`: `OrgProfile.suppliers` and `OrgProfile.aisles`, optional; `src/domain/northside/read.ts` reads them back.
- `src/domain/catalogue/aisles.ts`: `aislesOf` takes where a part stands (default: its heading's aisle).
- `e2e/routes.ts`: the five routes.
- `src/app/ways.ts` was **not** changed: Data's room sentence for Catalogue still says "its picture, its price"; it is Data's line to bring up to "both prices".

## Honest constraints

- Supplier codes read as the file writes them until Northside names them; nothing is named on day one.
- Quoting a part on its own is off for Parts & Accessories on day one; the sentence says so where it is refused.
- The build's chandlery (the fit chapter's dialog) is the older component: it now finds by code, supplier and heading, but its cards still carry the dashed picture door and the grid card; it was not redrawn this round.
