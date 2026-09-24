# The last round of Milestone 2, judged cold

Independent critique, 2026-09-24. Read-only apart from this file.

**What was read.** The whole of `docs/directions/built-critique-m2-close-2.md` (the specification), `docs/STATUS.md`'s top
section, `docs/directions/m2-last.md` (this round's verifier) and CLAUDE.md. For source, only where a screen could not prove
a thing: `src/ui/button.css`, `src/ui/refusal.css`, `src/domain/quote/{cascade.ts,spoken.ts,colourway.ts,find.ts}`,
`src/ui/{Swatches.tsx,swatches.css}`, `src/screens/configurator/{Configurator.tsx,step.ts}`, `src/screens/sheet/read.ts`,
`src/screens/shell/lines.ts`, `src/domain/shell/finder.ts`, `src/screens/picker/Picker.tsx`, `src/screens/home/Home.tsx`,
and `data/northside/names.json`.

**What was measured here, not inherited.**

- `npm run build` was green (3.6 s). `npx tsx tools/check.ts` reported **14 rules, no failures**.
  `npx vitest run` on spoken, boats, colourway, cascade and golden passed **71 of 71**.
  `golden.test.ts` does not differ from HEAD.
- `dist/` was served by `vite preview` on port 6591 and driven by Playwright scripts with a fresh profile at each size,
  through the real door. The whole sale was driven three times:
  - **1440 × 900** with a mouse.
  - **834 × 1112** with touch.
  - **390 × 844** with touch (mobile).

  Each walk was the ADV7 in B-G-B, the Yamaha F250XCB, See what Trade does, Leave it, R. Kelleher, the finale, Give,
  Open the document, then Quotes, History and Customers. The picker press was also driven at **844 × 390** with touch.
- The paper was printed to PDF at 1440 (two A4 pages) and read under print emulation at A4 width.
- A Stacer 519 Sea Ranger SDF and a Haines Signature Fisher 525F were also started, and the Haines was given and its paper read.
- Refusal contrast was read in the page by day and by night. The finder (Ctrl K), Home's field and the picker's field
  were each queried with the names the screens now print.
- Maker pages spot-checked live: the ADV7 page's title is "Highfield ADV 7…" and its heading says "ADV7". It never
  says "Adventure 7". Sport 560 and Patrol 600 are headed exactly as the ledger records. The ledger is honest.
- Sideways scroll was 0 on every route at every size. No page error and no console error on any walk.

Evidence shots are in this session's scratchpad (`…/scratchpad/crit/shots/`), named by step and size.

---

## The three blockers and the one thing, item by item

| # | finding | verdict | what I saw |
|---|---|---|---|
| B1 | A refused act's reason at 1.23 : 1 | **CLOSED** | The finale's "This quote is addressed to nobody…" reads 41,70,90 on white, **9.92 : 1** by day and **7.89 : 1** by night (159,182,196 on 6,32,51). The given peek's "…so it stays" has the same readings. |
| B2 | On a tablet a pressed boat does nothing | **CLOSED** | **834 × 1112, tapped:** the plate stands sticky beside a two-column list. The name is at y 110, the act at 714–766, and the pressed card is still in view. The window re-flowed from 3,107 to 6,025 to keep the card there. Tapping Black / Grey / Black did not move the window. **844 × 390:** the chips and act are at y 143–309 of 390. **390 × 844:** the act is at 683–735. |
| B3 | The cascade says "Standard" for an unpriced line | **CLOSED** | No "Standard" on the cascade at any size. The DEC kit reads "Not priced on this quote" on the cascade, the build's chapter, the finale ("Not priced 1") and both pages of the paper. |
| One thing | Every boat and colour the way a person says it; colour as colour; a unit on every measure | **CLOSED for how boats read, OPEN for how they are found** | See below. |

**The one thing, by screen.** "Highfield ADV7 · Hypalon · Black / Grey / Black" appears, with its swatches, on:

- the build: masthead, stage and the hull chapter
- the cascade card
- the register's row and peek
- History's line
- the customer's card
- page 1 of the paper at 34 px, and page 2's hull line
- the browser tab of the paper

The picker's chips carry swatches beside their names at 1440 and swatches alone on a tablet or phone. Units print as
6.98 m, 2.68 m, 32 cm, 519 cm, 200 cm and 1,300 kg. Home counts 289 boats. The given build has no Undo. No export is
promised. Every boat on the file said through `spokenBoat` (810 rows across seven registers, run here) reads cleanly. Its
only brackets are Highfield's own "(Windlass)", and undecoded colourways stay as codes (I-B-C, WH), as the rule asks.

**But a name the app now prints cannot be typed back into the app** (new blocker 2), and the finder was one of the
seven places the critic named.

---

## Blockers

### 1. A Haines Signature quote tells the customer the boat is "Included" at $0

This was found by driving a second maker. It is **not new this round**, and it is the same kind of fault as the closed
blocker 3.

1. **The picker** marks all nine Haines Signature models "No price on file". The plate says: "The price file holds no
   price for this boat. The quote still opens, and you put the price on it."
2. **The build** has no place to put a price. The hull chapter reads **$0**. The finale counts 3 lines, "Not priced 1",
   which is the dealer fit, not the hull.
3. **The customer's paper** for 20260924-04 prints:
   - page 2: "01 The hull **$0** · Haines Signature Fisher 525F · **Included**"
   - Your price: "The hull $0 · Total, tax included $8,473", which is the trailer alone.

   The side panel explains it as "Cash states a charge of nothing for it."

The file's Cash cell is `0` (`boat_haines.qr`). `readDocument` reads an amount of 0 as "included"
(`src/domain/quote/document.ts:192`), while the picker reads the same 0 as no price (`Picker.tsx:1170–1173`).

Two screens give two answers about one line, and the one that leaves the building calls a whole boat free. The picker
also promises an act ("you put the price on it") that no screen offers. The domain has `overridePrice`, but no screen
calls it.

### 2. The finder and Home's search refuse the names the app now prints (new this round)

The picker, the build and the paper now say "Sport 560". Here is what each search answers for the names on screen:

- **Ctrl K:** "Nothing matches" for:
  - "sport 560", "highfield sport 560", "sport 560 hypalon"
  - "patrol 700", "roll up 230"
  - "haines signature fisher 525f", "jeanneau merry fisher 605"
- **Ctrl K, "adv7 black":** finds only the open draft, and no boat.
- **Home's "Search the file by name", "sport 560":** answers **"Nothing on the price file is called that."**
  That sentence is false. "SP560" on the same field finds 35 lines.
- **The picker's own field:** finds "sport 560", "highfield sport 560" and "patrol 700".

The cause: `lines.ts` changed what a found boat is *called*. But what it *matches* is still `domain/catalogue/search`,
over the file's strings (`finder.ts:73`, `Home.tsx:4`). Only `domain/quote/find.ts` (quotes) learned the spoken name.

So the app teaches a dealer a name, then tells him the file has nothing called that. This round's renaming created the
fault. Before it, the cards said SP560 and the finder found SP560.

---

## Major

### 3. Pressing a motor opens the hull's seven finishes (not new)

On the build from the picker (no `?at=`), the motor chapter is open. Press the F250XCB and the motor list folds. The
hull chapter then opens under the hand with "ADV7 — 7 finishes" and seven rows. It happens at 1440, 834 and 390.

The default chapter is "the first band with nothing on it, else chapter one" (`Configurator.tsx` ~405–416). When the
last band fills, it falls back to the hull, not onward to "Who it is for". The dealer's next step is the name. The
screen instead shows him the decision he already made.

### 4. Motors and trailers are still the file's key strings on the customer's paper

Page 2 prints:

- "Yamaha - F250XCB"
- "REDCO Custom / Highfield ADV7 Aluminium - TA700T-EH"
- "6X6 Sng Key Switch"

The build prints the motor twice ("Yamaha - F250XCB F250XCB"). The critic's one thing named boats and colours, and
these are the other two lines of the same total. The verifier ranks it fourth.

### 5. Engine words and file headers on dealer screens are still open (major 3 of the specification)

- **Quotes head:** "53 tables · 15,691 rows". **History head:** "53 tables".
- **The register's panel:** "1 quote, in three bands" and "the sum of that document's own frozen lines".
- **The peek:** `RUNG cash`, "LINES 4, 1 of them carrying no price", and "the same frozen lines".
- **The paper's side panel:**
  - "this register carries no price column at all"
  - "Cash — 3 of the 4 lines carry that rung"
  - "Pair it on the subject's own page"
  - the rigging kit still in pipes
- **Price levels shown as the file's column names:**
  - the build: "$31,850 at Sell Price"
  - the cascade: `Sell Price → Trade Price` and "it stays at Sell inc Rego"
  - the finale: "priced at Sell inc Rego"

  These sit beside the declared levels "Cash" and "Trade", so one quote shows four level names.

### 6. The picker names other makers' boats differently from the build (the one thing, outside Highfield)

- **Stacer:** the card and plate say "519 Sea Ranger SDF (Centre Console)". The build says "Stacer 519 Sea Ranger SDF ·
  Centre Console".
- **Haines:** the maker's door, card and plate say "Fisher 525F", which is the file's *Model Code* column. The build
  and paper say "Haines Signature Fisher 525F".
- **Haines series header:** the plate prints "FISHER SERIES (AS AT 18.03.2026)".

`spokenBoat` is not asked on the picker's cards for these registers.

### 7. Still open from the specification, and not owned by this round

- Keycaps at the desk, and WCAG 2.1.4 on the single letters (major 11).
- The sheet is still a grid: RU230KAM is named by code on its spine while every other screen says "Roll Up 230 KAM"
  (majors 7 and 8).
- Empty floor on History at 834 and 1440 (major 10).
- Northside's mark (major 12).

---

## Minor

8. **A line that starts on its separator.**
   - The cascade card at 834: "Highfield ADV7 · Hypalon / · Black / Grey / Black". At 390 it breaks into four lines,
     two of which start on "·" and "/".
   - The register's peek at 1440: "…Black / Grey / / Black".
   - The picker's chips at 1440: "Black / Grey / / White/Blue".
9. **Black swatches on Customers' navy card nearly vanish.** The fill is oklch(0.17 0 0) on oklch(0.295 0.095 259),
   and the hairline `--swatch-edge` is drawn for a pale ground. The words beside them carry the colour.
10. **The sheet doubles a unit.** The ADV7's spine reads "Max 250 HP HP". `factText` appends the column's unit to a value
    that already carries it (`read.ts` ~204). The same code path was in HEAD, but it is on the surface this round owned.
11. **The picker's plate for a many-colour model still rests on a refused amber act** (minor 21 of the specification).
    The act is aria-disabled, in amber (oklch(0.615 0.11 73)), and is the loudest thing on the plate at rest. The name
    of the colour on a tablet or phone appears only after a tap.
12. **A Haines quote numbers its chapters 01, 03, 04** on the build and on the customer's paper (no motor chapter).
    The build prints the file's "FUEL CAPCITY" where the paper prints "Fuel Capacity".
13. **A change made less than 300 ms before a reload is lost.** Measured: the motor was put on and the page reloaded at
    69 ms, and the draft came back without it. This is under "Saved as you go — close this and come back to it any
    time." The store's `pagehide` flush does not survive a reload. It is not new, and it is an edge case.
14. **"See what Trade does" stays on a given quote as a refused control,** under the issued sentence. Not new.

---

## Verdict

**Are the blockers gone?** The three the specification named are closed, each by measurement:

- the reason reads 9.92 : 1 by day and 7.89 : 1 at night
- the plate stands beside the list on a tablet and a phone
- the cascade and the paper agree on the rigging kit

**Does every boat read the way a person says it?** On the build, the cascade, the register, History, Customers and the
paper, yes: "Highfield ADV7 · Hypalon · Black / Grey / Black". The ADV7's name is the maker's own, checked live. Colour
is drawn as colour, and each measure carries its unit.

It is not yet true everywhere:

- The finder and Home's search **cannot find** the names the screens print. Home says "Nothing on the price file is
  called that" for the Sport 560. This round's renaming broke it: new blocker 2.
- The picker still names Stacer and Haines boats in the file's own terms.
- Motors and trailers keep the file's key strings on the paper.

A second maker's boat also shows a blocker no round had driven. The Haines Signature's paper hands the customer a $0
"Included" hull, where the picker said the file held no price.
