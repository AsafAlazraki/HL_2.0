# A maker's own page, judged — data round, 2026-11-04

A fresh judge who had never seen the screen. It was served from its own build (`e2e/out/dist-6280`, `vite preview --port 6280`) and reached through the real door with the real Master Price File (the `throughTheDoor` walk: a name at Entry, then *Load the Master Price File*). Each of the six sizes got a fresh browser context. Every screenshot named below is in `before/`, with its size in the file name (`-390x844`, `-844x390`, `-834x1112`, `-1280x800`, `-1440x900`, `-1920x1080`). That is 186 frames, 44 states in all.

Measured at every size and in every state:
- sideways scroll
- text cut by its own box
- controls under 24 px
- text under 12 px
- photographs not loaded
- page errors

Fifteen places were opened: Highfield, Stacer, Jeanneau, Stabicraft, Yamaha, REDCO / Tinka, Dunbier / Haines BMT, OBSOLETE Trailers, Labour Rates, Registration, Parts & Accessories, Dealer Fit, Haines Factory Packages, an unknown address, and REDCO's Settings. The only things typed were a test line and a colour, in a fresh context that was thrown away afterwards. The server was stopped before this was written.

**Verdict: REDRAW.** The screen's job is *one maker as Northside sells it: its line, its mark, its photographs and colour, its models and what each carries.* The first four are here and finished well. The last two are not on the page at all.

The body under the livery is a grid of **series** tiles. Each tile carries one count ("16 models") and is a door to the sheet. The page shows:
- no model;
- no price;
- no length, people or horsepower;
- nothing about what any model carries.

The quote picker one press away already shows every Highfield model with its picture and "from $2,770" (`30-press-quote-1440x900`). So the maker's own page knows less about its range than the screen that sells it.

The rest of the composition:
- **Prices** names three level words and no figure.
- **Quotes** shows a row of file codes.
- **On a phone** the rail stands between the head and the range, so the range begins more than a screen down.
- **No photograph:** 18 of the 25 places have none, and their head is a 300 px band of plain colour.

Five models and 99 lines that the file carries are silently missing from the range (§2).

This is not finish missing from a right composition. The page is built around the wrong unit (the series, as a door to the sheet) for a person with a customer at the desk. It needs a new sweep (maker range pages, model-led) and three drawn directions. The livery, the mark, the photograph lightbox and Settings' four bounded choices are right and should carry into whichever direction wins.

---

## 1. The jobs, and each one done

Sources: `docs/SCREENS.md` (Places' row and its two 2026-10-30 fixes), `src/screens/places/*`, `docs/DECISIONS.md` (2026-10-29, 10-30), `docs/LATER.md`, `docs/research/refs/places/notes.md`, and what a salesperson and the admin at Northside need from a maker's page.

| # | Who | Job | Done on the screen | Result |
|---|---|---|---|---|
| J1 | Salesperson, customer at the desk | "Show me what Highfield makes." | `/places/boat_highfield` (`01-highfield-*`, `02-highfield-full-*`) | **Not done.** Seven series tiles carry 7 names and 7 counts. Four tiles wear a photograph; three are blank colour (Roll-Up, Ultralite, Coaster). No model is named anywhere on the page. The head says "67 models in 7 series", and none of the 67 can be seen without leaving the page. |
| J2 | Salesperson | "Which one fits my budget, my family, my tow car?" | — | **Not possible.** The page prints no price and no fact. The file carries all of it per variant: OA Length, Beam, Max People, Max Load kg, Boat Weight kg, Fuel Capacity, Min HP / Max HP, Shaft Lgth, and Cash, Trade and Warranty at the declared levels. Measured from the file, Highfield Cash by series (each row priced, n of n): Roll-Up $2,770–$6,940 (32 of 32), Ultralite $3,890–$8,970 (64 of 64), Classic $5,010–$20,990 (144 of 144), Coaster $24,290–$41,660 (7 of 7), Patrol $14,060–$85,260 (130 of 130), Sport $15,040–$129,830 (199 of 199), Adventure $105,930–$198,610 (12 of 12). None of these ranges reaches the page. |
| J3 | Salesperson | "What goes on the Sport 660: which motors, which trailer, which packages?" | The rail (`Goes with`: Yamaha Outboards 2,519 fits …) and "What goes on its boats" → `/fitment?maker=Highfield` (`31-press-fits-*`) | **Half done, and not here.** The rail counts fits for the whole maker (2,519 is every Highfield × Yamaha pairing), which answers no question about one boat. The door lands on Fitment's chooser, where the person picks the series, model and version again. Nothing on this page says what any one model carries. |
| J4 | Salesperson | "Show the customer the boat on the water." | "See the 3 photographs" under a tile → the lightbox (`04-highfield-lightbox-*`) | **Done well.** Each photograph is named for the model it shows and credited ("Photograph from media.highfieldboats.com"), with a strip, 1 of 3, Escape to close and focus kept. The head's "18 photographs on the water" is not a press, though. There is no single gallery of the maker's 18; they are reached seven series at a time. |
| J5 | Salesperson | "Start the quote." | "Quote a Highfield" (`30-press-quote-*`) | **Done.** It lands on `/quote/new?brand=boat_highfield`, the picker opened on Highfield, in about 0.6 s. It starts at the maker, not at a model, because the page has no model to start from. |
| J6 | Salesperson | "Find the quote I did for this customer on a Highfield." | Quotes tab after minting one SP660 draft (`35-highfield-quotes-one-*`) | **Done, poorly.** The row reads `20261104-01 · Highfield - SP660 (PVC) W-W-WB · Nobody named yet · Draft · 2026-11-04`. The boat is the file's code string, not "Sport 660". DECISIONS 2026-09-24 says every boat is named the way a person says it, and the picker says "Sport 660". The row has no total. The list has no find and no filter. |
| J7 | Admin | "Give Highfield its line." | Settings → Its line (`09-settings-line-refused-*`, `11-highfield-dressed-*`) | **Done.** The line prints under the name in italic at once. The refusal is a sentence where the field is ("123 characters is 33 over 90"), but it says "A place's line is one line **on its card**", and the card wall was removed on 2026-10-30. |
| J8 | Admin | "Choose how its mark stands." | Settings → Its mark | **Done.** White, plate, Northside's own (upload or address) and name in type are offered, and an ink the maker does not ship is refused with a reason. On REDCO the two refusals print the same sentence twice, "No mark for REDCO / Tinka Trailers yet." (`24-redco-settings-full-1440x900`). |
| J9 | Admin | "Choose its photograph." | Settings → Its photograph (`08-highfield-settings-full-*`) | **Done.** Only Highfield's own 18 are offered, each captioned, along with "Its colour alone", upload and address. The sentence over them reads "Only Highfield Inflatables**'s** own boats are offered". |
| J10 | Admin | "Choose its colour." | Settings → Its colour (`10-settings-colour-step-*`) | **Done well.** One step with Undo ("Highfield Inflatables stands on violet." · Undo), and the contrast figure is said: "6.4 : 1, over the 4.5 : 1 they need". |
| J11 | Admin | "Can REDCO trailers be sold with no boat?" | Settings → How it is sold (`24-redco-settings-full-*`) | **Done.** The sentence names the seven other lists the choice reaches. |
| J12 | Admin | "Is every model this maker sells on its page?" | Head figure against the tiles | **Fails, silently.** Jeanneau's head says 27 models and the tiles add to 12 + 11 = 23. DB 37 OB, DB 43 OB, TH33 and TH38 have an empty Series cell, and `rangeOf` (`src/domain/modules/livery.ts:465`, `if (name === '') continue`) drops them with no sentence. The same fault drops Stabicraft's 1450 Explorer (37 in the head, 36 on the tiles), 25 live products from Parts and 74 from Dealer Fit (§2). |
| J13 | Admin | "What does Highfield sell at, at each price?" | Prices tab (`06-highfield-prices-*`) | **Not answered.** The tab shows three chips ("Cash · the price list's 'Cash'", Trade, Warranty) and "Decide its prices". It shows no figure, no span and no count of unpriced lines. The tab's count, "Prices 3", counts level names. |
| J14 | Admin | "What has been changed on Highfield since the file came in?" | Rail → Changed here | **Half.** There is a sentence and, once something changes, a count. There is no door to the changed lines. |
| J15 | Admin | "Open the Sport series in the price list." | A series tile → `/data/boat_highfield?in=Sport` (`32-press-series-*`) | **Done.** This is the only thing a series tile does. |
| J16 | Either | "Go to Yamaha from Highfield." | Rail partner → `/places/mot_yamaha` (`33-press-partner-*`) | **Done.** |
| J17 | Admin | "What does an hour of workshop cost a customer?" | `/places/labour_rates` (`19-labour_rates-*`) | **Not answered, and no reason given.** 18 rate names are listed with no figures. The file carries "Rate (inc GST)" ($159 Retail), but Labour Rates declares no price level (`priceLevels: []`, so "Prices 0"). Leaving the figure off is honest. Printing no sentence about why, and no door to Prices, is a silent refusal. |
| J18 | Admin | "What was on the OBSOLETE trailers list?" | `/places/trl_obsolete` (`18-trl_obsolete-*`) | **Empty with nothing after it.** The head says "10 trailers in 1 series · No longer sold". The body says "0 trailers still sold, in the price list's own order." and then shows nothing. The ten discontinued trailers are not shown. |
| J19 | Either | An address that is no place | `/places/nothing_here` (`25-unknown-*`) | **Done.** "No place is called 'nothing_here'", with the way back. |

---

## 2. The perfect bar, at each of the six sizes

**Measured clean at all six sizes and in all 44 states:**
- 0 px sideways scroll;
- no text cut by its own box;
- no visible control under 24 px (the 1 × 1 px radios inside the kit's Segmented are visually hidden by design);
- no photograph left unloaded at measure time;
- no page error and no console error;
- the place ready in about 0.7 s after navigation.

Full-page captures show some below-the-fold photographs blank (Patrol and Sport in `02-highfield-full-390x844`, Sea Masters in `12-boat_stacer-full-1440x900`). The scrolled viewport frames show them loaded (`03-highfield-scrolled-390x844`). That is lazy loading under a capture, not a fault a person sees.

**Text under 12 px, at every size:**
- the kind word ("BOATS");
- the rail heads ("GOES WITH", "CHANGED HERE");
- the head photograph's caption;
- every series caption.

All are 11 px, and the captions are the provenance of a picture.

### NOT PERFECT, and why

| Size | State | Element, measured | Why it is not perfect |
|---|---|---|---|
| all | Range, Highfield (`01-highfield-1440x900`, `-1920x1080`, `-834x1112`) | The series grid's rows | **Ragged rows.** A tile with a photograph is 205 px tall with a 40 px "See the N photographs" press under it. A tile without one is 165 px. At 1440 that leaves an 85 px hole under Roll-Up and Ultralite beside Classic. Stacer's 22 series repeat the hole seven times (`12-boat_stacer-full-1440x900`). |
| all | Head on any place with no photograph (`13-boat_jeanneau-1280x800`, `15-mot_yamaha-*`, `19-labour_rates-*`, `21-parts-*`) | `.pl-livery`, 300 px tall, 1,184 px wide at 1440 | **An empty band.** 18 of 25 places have no photograph. Their head is a 300 px gradient with the name top-left, one count at the foot and nothing in the right 60 %. Labour Rates' head is 300 px for "18 rates". |
| all | Head, Highfield | Mark "HIGHFIELD dare to explore", then "HIGHFIELD INFLATABLES" in caps under it | **The name twice.** The mark says it, and the type says it again. |
| 390 | Range (`02-highfield-full-390x844`) | The tabs at y ≈ 960, below the rail's five partners and "Changed here" | **The range is more than a screen down.** The phone opens on the head and then the rail, so a salesperson scrolls past the partners to reach the boats. At 834 × 1112 the tabs sit at y = 763 and the range starts at y = 840 (`01-highfield-834x1112`). |
| 844 × 390 | First screen (`01-highfield-844x390`) | "Quote a Highfield" at y 340–390 | **The page's one act is cut at the fold.** The landscape phone's first screen is the head alone. |
| 1440 | Stacer range (`12-boat_stacer-full-1440x900`) | Caption "709 Sea Ranger SDF (Centre Console) on the water" | **Wraps to two lines** over the photograph; the others are one line. |
| 1440 | Stacer range | Series names "SKIMMAS", "PROLINES", "OUTLAW (TILLER STEERS)" | **The file's capitals, set in display type.** They shout beside Highfield's "Classic" and "Sport". |
| 1440, 390 | Parts (`21-parts-1440x900`, `21-parts-full-*`) | 187 green category bands; page 11,338 px tall at 1440 and 17,231 px at 390 | **A wall.** There is no find and no aisle. This is a second, worse copy of what the Catalogue room (`/catalogue`) already does for the same list. Dealer Fit is 5,953 px of the same. |
| all | Parts / Dealer Fit / Jeanneau / Stabicraft | Head figure against the tiles | **Lines missing with no sentence:** Jeanneau 4 of 27 models, Stabicraft 1 of 37, Parts 25 of 2,238 live, Dealer Fit 74 of 1,576 live. Each has an empty first-level heading in the file, and `rangeOf` skips it. |
| all | Labour Rates (`19-labour_rates-*`) | 18 rows, label only | **A silent refusal.** There is no figure and no sentence saying why. |
| all | OBSOLETE (`18-trl_obsolete-*`) | "0 trailers still sold" and nothing under it | **An empty state that hides what is there.** Ten trailers exist. |
| all | Prices tab (`06-highfield-prices-*`) | Three chips, each repeating its own name ("Cash · the price list's 'Cash'") | **Says one word twice per chip and no figure.** |
| all | Quotes tab, one quote (`35-highfield-quotes-one-*`) | "Highfield - SP660 (PVC) W-W-WB" | **The file's code string**, against DECISIONS 2026-09-24 (the spoken name). There is no total. |
| all | Settings, line refused (`09-settings-line-refused-*`) | "…one line on its card…" | **The card no longer exists** (2026-10-30). |
| all | REDCO Settings (`24-redco-settings-full-*`) | "No mark for REDCO / Tinka Trailers yet." ×2 | **One sentence printed twice**, once per refused option. |
| all | Settings, photograph (`08-highfield-settings-full-*`) | "Highfield Inflatables's" | **Possessive error.** |
| 1440 | Settings, colour (`08-highfield-settings-full-1440x900`, `24-redco-settings-full-1440x900`) | "Graphite" alone on a second row of chips | **A widow.** Eight chips, seven on the first row. |
| all | Settings, photograph | 18 photograph tiles, about 900 px tall at 1440 | The tab scrolls 2,237 px. That is acceptable for an admin, but it is the longest state of the page, and it sits as a tab equal to Range. |
| desktop | Keyboard (tab order recorded at 1440) | Back → Quote a Highfield → **five rail partners** → the tabs → the range | **Focus goes right before it goes down.** The rail comes before the tabs in the DOM and stands to the right on screen. Every control is reachable and visibly focused. |
| all | Head's "18 photographs on the water" | Plain text | It reads like a door and is not one. |

**Perfect, at all six:**
- the lightbox (caption, credit, strip, 1 of n, close);
- the colour step with Undo and its contrast figure;
- the unknown-address page;
- the partner rail's marks at one optical size;
- the "Back to the price list" return to the spread it came from.

---

## 3. The level it has to be

What the best maker-range page in the world gives a person that this one does not: Porsche's model line-up, Apple's product family, Highfield's own range page, MarineMax's brand pages and a Jeanneau dealer's model list. Every item below is said with what the file carries for it. Nothing here needs a figure the file does not hold. **Cost and margin are excluded:** Base Cost, Landed Hull Cost, Nett CTD and MU % are all in the file and must never reach this page.

### Blockers

1. **The models, on the page.** The range should be model-led, one entry per model as a person says it ("Sport 660", from `names.json` and `spokenModel`). Each entry carries:
   - its picture where the ledger holds one for that exact model (Highfield 20 catalogue + 18 hero; Stacer 23 + 11; Formosa, Haines and Surtees 1 + 1 to 2 each; Jeanneau and Stabicraft catalogue 0);
   - **from-price at Cash**;
   - length, people and horsepower range.

   The file carries every one of these for every boat maker. Highfield has OA Length, Max People, Max Load, Min/Max HP and Cash on all 588 variants. Stacer and Jeanneau have Hull Length, Min/Max HP and Cash. The picker already prints the from-price per model, so the domain has it. **Why Northside needs it:** the screen's own job says "its models", and the salesperson's first question is "what do you have, and what does it cost". **Honest:** yes. The figure comes from the declared Cash level, with the n-of-n priced count where any variant is unpriced.

2. **Nothing silently dropped.** The models and lines with an empty first heading must appear, under a sentence that says why they stand apart ("4 Jeanneau models carry no series in the price list: DB 37 OB, DB 43 OB, TH33, TH38"), and the head figure must equal what is drawn. That is Jeanneau 4, Stabicraft 1, Parts 25 and Dealer Fit 74. **Honest:** this is the file's own state, said with numerator and denominator.

3. **What each model carries.** On each model, in a line:
   - motors that fit, and the recommended one where the join marks it;
   - trailers that fit;
   - dealer-fit packages and P/D parts;
   - one press to `/fitment?boat=<that model>`, not to a chooser.

   The joins (`join_hf_yam`, `join_hf_trl`, `join_hf_gfab`, `join_hf_df`, `join_hf_pd` …) key on the boat's code, and Fitment already derives this per boat. The rail's maker-wide "2,519 fits" should become per-model counts, or be dropped. **Why:** "what each carries" is half the screen's stated job, and J3 now costs four presses on another screen. **Standard inclusions are not held** (LATER.md: the Boat Module and Factory Options workbooks are not on this machine). The page must say that once, not imply them.

### Majors

4. **A series opens in place.** Pressing a series should show its models on the page, with the position in the address (`?series=Sport`) and the sheet one quieter press away. Today the series is a door off the page. Stacer's 22 series and Yamaha's 9 make this the main reading act.

5. **A head that is right for 18 of 25.** Only 7 places have a photograph. The direction must draw a compact head for the rest (mark, name, line, counts and the act in about 140 px). It must not leave 300 px of empty colour. Yamaha is the second most-paired place (2,519 fits) and has no picture held. Its page should still look finished.

6. **Non-boat makers read as their own range.**
   - **Yamaha:** 209 motors with HP Rating, Shaft Length, WEIGHT kg, Control and Sell Price, each in the file. Rows like "TWIN RIG OPTIONS - DEC w Dig Electro Hyd Steering" should be grouped by horsepower, not by the file's sheet headings.
   - **Trailers:** ATM, Trailer Length and Sell inc Rego. "Fits boats up to 5.3 m" is a fact the salesperson needs.

   **Honest:** yes for every column named here. Each is a declared or descriptive field.

7. **Prices with figures.** Prices should show the span per series at each declared level that is customer-facing (Cash, plus Trade where the person is allowed to see it) and how many variants are unpriced at each, with the door to `/levels`. Labour Rates should say in one sentence why no figure prints ("Labour Rates declares no price; choose its rate on Prices"), with the door. **Honest:** the spans are measured (J2). The level labels come from `priceLevels`.

8. **Quotes on a maker that a salesperson can use.** Each row should show the spoken boat name, the customer, the total at the quote's level, and given or draft, with a find. Its count should say "n quotes · n given". **Honest:** only quotes held in this browser. The empty state stays the true state.

9. **The phone reads boats first.** At 390 and 844 × 390 the range should come straight under the head, with the rail after it or folded. The act must stand inside the first screen at 844 × 390.

10. **Parts and Dealer Fit hand off to the chandlery.** A 187-band wall duplicates `/catalogue`, which has find, aisles and pictures. The place page for an accessory list should say what it is and open the chandlery at that list. It should not redraw it worse.

11. **Compare two or three models side by side** (Porsche and Apple both do this): length, beam, people, load, weight, fuel, horsepower range, shaft, from-price, and the number of motors and trailers that fit. **Honest:** every field named is in the file per variant. This is the second question at the desk ("the 600 or the 660?"), and today it needs the sheet.

### Minors

12. **One gallery of the maker:** "18 photographs on the water" in the head opens all 18 in the lightbox.
13. **"Changed here" opens the lines it counts**, from the steps History holds.
14. **OBSOLETE shows its ten trailers** under "No longer sold", rather than "0 still sold" over nothing.
15. **Words:**
    - "on its card" goes from the line refusal;
    - the duplicated REDCO sentence becomes one;
    - "Inflatables's" becomes "Inflatables'";
    - the name is not repeated under a mark that says it;
    - Stacer's capitals are set as a person says them, the way `spokenModel` does for models.
16. **Type and rhythm:**
    - captions and rail heads at 12 px or above;
    - equal-height series or model tiles, with "See the photographs" inside the tile's own foot rather than under it;
    - no single chip widowed on the colour row;
    - the Stacer caption kept to one line.
17. **Focus order follows reading order** (main before rail) at desk widths.

### What docs/LATER.md defers

Standard inclusions and factory options. The owner's words do not overrule this: the workbooks are not on this machine. So the page says what it cannot show, once, and never implies it. No other LATER item touches this screen.

---

## 4. The verdict

**Redraw.**

**Kept, and carried into whichever direction wins:**
- the livery (the ground, the mark at one optical size, the captioned photograph);
- the act;
- the lightbox;
- the partner marks;
- Settings' bounded choices with Undo and their measured contrast.

**The composition below the head is wrong for the job:**
- It is built on the series as a door to the sheet, so the page never shows a model, a price, a fact or what a model carries.
- Its tabs give Prices and Quotes equal weight with the range while each holds a sentence.
- On a phone it puts the rail before the boats.
- For 18 of 25 places it opens on an empty band.

Deepening this grid would mean pouring models and figures into a structure that was drawn for counts. The new sweep should be model-led maker pages (a boat builder's range page, a car maker's line-up with compare, a dealer's brand page, Apple's family strip at 390). It should be drawn in three directions on Highfield (67 models, 7 series), Jeanneau (4 models with no series, no photograph), Yamaha (209 motors, no picture) and Labour Rates (no declared price). Each direction should say how it reflows from 390 to 1920.

**The mammoth work, in order:**
1. the models on the page, with from-price and facts;
2. nothing dropped;
3. what each model carries, one press to Fitment for that boat;
4. a series opening in place, in the address;
5. a head that is finished without a photograph;
6. motors and trailers read as ranges by their own facts;
7. Prices with spans;
8. Quotes a salesperson can use;
9. boats first on a phone;
10. the chandlery hand-off;
11. compare;
12. then the minors.
