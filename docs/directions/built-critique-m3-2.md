# Milestone 3, the second independent critique (2026-10-29)

This judges the working tree on `80035f0` (Milestone 3 is still uncommitted on it) against `built-critique-m3.md` and the second verify, `built-m3-2.md`.

**How it was judged.** I read the top of STATUS, CLAUDE.md, PLAN § Milestone 3, both earlier reports and the `m3-4-*` shots. Then I built the app (`npm run build`, green, `ui` chunk 695,262 bytes) and served it on 5911. I drove it with Playwright in cold Chromium profiles at 1440 × 900 and at 390 × 844 with touch, through the real door each time, and read every shot by eye. I walked these:
- writing the tiller rule;
- the Classic 340 build and its finale;
- the finale's door to Prices, the choice and the way back;
- giving the quote and its paper;
- Review before and after the choice, and one Review fix followed by History;
- Fitment on the Classic 340 with the rule on;
- the four rooms with no price file.

My shots and texts are in the session scratchpad, not in the repo.

## The exit criterion: true

- I wrote "When the boat's steering is tiller, the motor's controls must be Tiller handle" on Rules, and it added as 2.4.
- On the next pick the Classic 340's 02 Motor read "Not offered on this boat: the Yamaha F25SWTC, because a tiller boat has no helm to steer a remote motor from. Your rule: … See the rule".
- Fitment, on the same boat, lists the F25SWTC under "Not offered on this boat, because one of your rules refuses it", with the same because.
- At 390, "See the rule" lands on 2.4 (`rules/built/m3-4-390-from-build.png`).
- No page error and no console error was raised in any walk.

## The first critique, item by item

| item | verdict | evidence |
|---|---|---|
| B1 unchosen price, three stories | **CLOSED** | The build says "Northside has not chosen which figure prices Dealer Fit Packages…". The finale refuses the give with the same fact. After the choice, "Price it at $…" prices the line, and the paper prints the Tube Covers at $2,834 under "Total, tax included $14,520". Driven at 1440 and 390. |
| B2 two derivations in components | **CLOSED for the two named** | The same class remains (blocker 1 below). |
| M3 Undo's toast reads as the truth | **CLOSED on Prices and Review, OPEN on the sheet** | The sheet's undone line still reads "$2,770 → $2,771" (`sheet/built/m3-4-390-undone.png`). |
| M4 Rules' measures contradict | **CLOSED** | Every measure names its offers, for example "0 of 530 … are rated under the boat". |
| M5 / M6 Fitment's strikes | **CLOSED** | A strike now means "not offered here" everywhere I looked. |
| M7 Fitment's cold landing | **CLOSED** | The plate asks "Which boat?" with the marks. Stabicraft is still in type. |
| M8 Rules at 390, act and input | **CLOSED** | The act is under the because. After the press, 2.4 is in view under the toast. |
| M9 "See the rule" lands at the top | **CLOSED** | It lands on the clause, but opened as a rewrite with "Delete 2.4" as its first act (minor below). |
| M10 two rooms, one shape | **CLOSED** | |
| M11 one fact, two figures | **CLOSED for the figures, OPEN for the noun** | The 289 are "models" on Fitment, Data and Home, and "boats" on Rules. Prices says "91 boats" and "67 boats". |
| M12 the sheet's Undo at 390 | **CLOSED** | |
| M13 file words | **OPEN** | Review: "ATM (KG)", "Rego ($)", "Registration Costs!C16", "Dunbier Trailers · 9304 + 9083L", "DUNBIER Alloy Loader Pro Series - …". Fitment: "Yam - F115XB + LF115XB". Prices: "Highfield SP560 (HYP) W-W-WB", "Tiller Conversion Kit - F20G", "SIG 525F w Yamaha - F90XB". The paper's rail: "Highfield - CL340 (PVC) W-W-WD". |
| verify 2: Prices from a quote shows another line | **OPEN** | It lands on "VHF Radio - GME GX700W …, $982 Act Sell or $249 Sell" while the dealer came from the Tube Covers. The `quote` search param reaches `Levels.tsx` but is used only for "Back to the quote". |
| verify 3: the paper | **OPEN (Milestone 5's)** | The sections are numbered 01, 02, 04. The cover picture is the Highfield wordmark on a pale block, and page 1 is two-thirds empty. Northside's own letterhead is now on it. |
| verify 4: cut names | **OPEN** | On Home at 1440: "Signature Fisher 5…" and "GRT 455 · Side Con…". |
| verify 5: the pill over Rules' open clause | **OPEN** | `rules/built/m3-4-1440-counted.png` has the because field and the census top under the pill. `.hr-open` has a scroll margin, but the because field and the act do not. |
| verify 6: Quotes with one quote | **OPEN** | At 1440 it shows a 520 px Highfield wordmark, "No photograph of this boat yet", and an empty "Press a quote to see it" pane. |
| verify 8: the sheet's undone edit | **OPEN** | |
| verify 9: marks | **OPEN** | Stabicraft is in type on Prices, Fitment and Home. Jeanneau and Haines are faint on Prices and on Fitment's chooser. A plate on Data is still several doors. |
| verify 10: "None of your 1 draft" | **OPEN** | `rules/read.ts:572`. |
| verify 10: the Yamaha line | **OPEN** | Prices still asks "Which figure does a customer's quote show?" without saying what a quote shows today. |
| verify 10: "prices updated" for one press | **OPEN** | History's row reads "started · prices updated · named" while its legend reads "new price". |
| verify 10: 37 → 38 after the choice | **PROVEN, and honest** | Review read 37 (No price 18). After choosing Act Sell for Dealer Fit it read 38 (No price 19). Act Sell prices 1,733 of 1,777, so the 44 lines left are a real new case. |
| verify 11: housekeeping | **OPEN** | The `ui` chunk is 695,262 bytes. Vite is still listening on 5102, 5103 and 5212–5342. |
| minor: Rules with no file | **CLOSED** | It reads "The price list is not on this computer yet. Every rule here is about what it sells, so it is read first." |
| Milestone 3 uncommitted | **OPEN, and worse** | `80035f0` was committed on top of the uncommitted milestone, so the live link has none of Milestone 3. |

## Blocker

1. **Counts printed on screen are still summed in screen code.** This is the first critique's B2 class, and it stayed in the files that critique named.
   - `Fitment.tsx:453` and `:536` compute `others = held.reduce(…)`, and that figure prints as "The other 207, and why". The plate's "2 of 209" comes from `src/domain`, so the two can drift.
   - `Rules.tsx:358–360` computes `written`, `kept` and `off` for the lede ("keeps 7 of these … Northside has written none yet").
   - Each is small to move. `tools/check.ts` has no guard that would have caught them.

## Majors

2. **The way from the sale to Prices and back loses the dealer twice.**
   - **The landing.** It shows a VHF Radio at $982 or $249 instead of the Tube Covers on the quote (above).
   - **After the choice.** The page stays at the top, and the step line "Every Dealer Fit Packages line is priced at its Act Sell from the next quote · Undo · Back to the quote" is below the fold:
     - at 1440 × 900 its top is at y 1,006 with scrollY 0;
     - at 390 × 844 it is at y 2,022.
   - With a buyer at the desk, the one door back to the quote is out of sight, and so is the Undo.
   - At 390 the act itself ("Price 1,733 at Act Sell") is also at y 977 of 844 once a figure is picked.
3. **Review promises "kept in History", and History keeps nothing of it.**
   - Every Review act says "One step, said with its Undo, and kept in History" (`Review.tsx:790, 902, 1013, 1101, 1250`).
   - I pressed "Make it Large" on the ALP 5.3M-13B and opened History. It shows the day's one quote and nothing else: no rego change, no rule written, no price chosen.
   - History reads quotes only, so the sentence is false.
4. **File words still reach the dealer** (M13, above).
5. **The first quote on a fresh link cannot be given, and nothing says so before the sale.**
   - The Classic 340's draft puts the recommended Tube Covers on by itself, then refuses to give the quote because of that line.
   - The finale's refusal runs two refusals into one paragraph: "No customer's name … so it cannot be given. Northside has not chosen which figure … and this quote cannot be given. Choose it on Prices, or put a price on the line here."
   - Every stakeholder opening the link starts with an empty browser, so this is their first quote too.
   - Home and Data's door say nothing of the four price questions waiting on Prices. Simple wins: say it once, before the sale, where the owner sets up.
6. **The pill covers Rules' because field** at 1440 and 1920 (above).
7. **Quotes with one quote still reads as a placeholder** at desk sizes (above).
8. **Names cut short on Home at 1440 and 1280**, and on History at 1920 (the verify's shot; not re-driven).
9. **Milestone 3 is not on the live link.** The owner chose "push regularly", and a commit has now landed on top of an uncommitted milestone.

## Minors

- **Counts and nouns.**
  - The 289 are "models" on Fitment, Data and Home and "boats" on Rules. Prices says "91 boats".
  - Fitment's plate says "2 of 209 made for it" while listing the F25SWTC, which is made for it, as refused by your rule. Its noun is "offered".
  - Rules' count before any word is chosen reads "– of 0 offers … taken away".
- **Undo on the sheet.** The undone line reads "$2,770 → $2,771".
- **Rules.**
  - "None of your 1 draft".
  - "See the rule" opens 2.4 as a rewrite, with "Delete 2.4" its first act. A dealer who came to read is handed the knife.
  - At 1440, the added-rule toast sits over the noticed box's eyebrow.
- **Prices' Yamaha line** does not say what a quote shows today.
- **History** says "prices updated" for one press.
- **Review.**
  - Its 390 headline breaks the model code "ALP 5.3M-/13B".
  - The Formosa case repeats "Beside it: Formosa SRT 675 Enc · Half Cabin · Cash $79,760" nine times.
  - "Not checked: 7 lists declare no price" names Registration Costs, whose $166 and $283 the first case just showed.
- **The no-file sentence** is said four ways across the four rooms.
- **Marks.** Stabicraft is in type, Jeanneau and Haines are faint, and Data's plate is several doors.
- **The paper** (Milestone 5's): 01, 02, 04, the wordmark cover, and an empty page 1.
- **Housekeeping.** The `ui` chunk is 695,262 bytes, and the idle Vite servers are still running.

## Would he accept it

**Not yet. He is close, and the milestone itself is done.**

**What he would like:**
- A rule he writes is refused in the build on the next pick, in his own words.
- Fitment and Rules finally say one thing.
- The unchosen-price story is honest from the build to the paper.

**What he would name within a minute:** he tries his first quote with a customer, and the app adds a line it then refuses to give. Its door sends him to a VHF radio. After he answers, the way back to the quote is under the fold. Review tells him "kept in History", and History is empty.

**Change first:** make the round trip from the finale to Prices one honest loop.
- Land on the quote's own line ("Tube Covers to suit PVC Boat · 3.4 Mtr, $2,834 Act Sell or $2,790 Sell").
- After the choice, bring the step with "Back to the quote" and its Undo into view, at every size.
- Say the four price questions once, on Home or at the door, before anyone sits down with a buyer.
