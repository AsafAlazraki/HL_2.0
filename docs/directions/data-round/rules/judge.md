# The house rules (`/rules`), judged — data round, 2026-11-03

I judged this screen fresh, without having seen it before. I served it from its own build (`e2e/out/dist-6250`, `vite preview --port 6250`) and reached it through the real door with the real Master Price File (the `throughTheDoor` walk: a name, then *Load the Master Price File*). Each of the six sizes ran in a fresh browser context.

Every screenshot named below is in `before/`, and its size is in the file name (`-390x844`, `-844x390`, `-834x1112`, `-1280x800`, `-1440x900`, `-1920x1080`). At every size and in every state I measured:
- sideways scroll
- text cut by its own box
- anything off the window's edge
- controls under 24 px
- text under 12 px
- page errors
- where the floating pill sits against what the screen brought into view

I stopped the server before I wrote this.

At all six sizes I measured no sideways scroll, nothing off the edge and no page errors.

**Verdict: DEEPEN.** The composition is right for the job. It is one page of numbered clauses grouped by what the customer is buying. Each clause names who said it, with the edge, and what it does, with the verb. The clause being written opens in place, with its count beside it. Keep it.

The page is not at the level it has to be, for three reasons:

- **It is a reading of rules rather than a tool for keeping them.**
  - A measure such as *555 of 571* never shows the 16.
  - A count such as *45 of 540 taken away* never shows the 45.
  - The 289 boat marks cannot be read as boats.
- **It can only say one thing.** That one thing is "when the boat's X is Y, the motor's (or trailer's) Z must be W". It cannot say:
  - anything about a rigging kit, a propeller, a pre-delivery kit or a part
  - "goes with" or "needs"
  - an exception
  - two conditions
  - one motor by name
- **The writing moment breaks the perfect bar.** After the fourth word is chosen, the page scrolls itself. Measured:
  - At 834×1112, *Add it as 2.4* ends up under the pill.
  - At 1280×800, all three figures of the count end up above the window.

§3 lists the mammoth work.

---

## 1. The jobs, and each one done

**Sources.** I drew the jobs from:
- the screen's row in `docs/SCREENS.md` (Milestone 3: "says what may be sold with what as one page Northside could sign")
- `src/screens/rules/*`
- `docs/DECISIONS.md`: 2026-10-22 (rules built, a warn never refuses the give) and 2026-10-28 (rebuilt as board A; "Print the rules, and a 'Leave it noticed' answer … were left out: simple wins")
- `docs/LATER.md`: the rule canvas, and the citation classifier "owed by whichever … screen draws a rule's evidence"
- `docs/research/refs/rules/notes.md`
- what an admin keeping the file, and a salesperson with a customer at the desk, truly need

**The rule I wrote** is the one the spec walks: *When the boat's steering is tiller, the motor's controls must be Tiller handle*, because *a tiller boat has no helm to steer a remote motor from*.

| # | Who | Job | Done on the screen | Result |
|---|---|---|---|---|
| J1 | Admin | "What are our rules today?" | Arrive (`01-arrive-*`, `01-arrive-full-*`) | **Done.** Three parts: Trailers (434 on sale), Motors (241), and Rigging and pre-delivery. There are 7 price-list clauses with their measures, 3 *Noticed, not written* boxes, and "Northside has written none yet." It reads well at every size. |
| J2 | Admin | "The file breaks its own rule: which lines, and fix them" | 3.1 *555 of 571*, 2.3 *3,902 of 3,905*, 3.2 *3,890 of 4,017* | **Not possible.** No clause opens. The 16 rigging-kit offers, the 3 shafts and the 127 propeller choices that break the rule are never named, and nothing leads to their lines on the sheet or to Review. The data section's promise is "every list it carries, open to read and change". |
| J3 | Admin | Write a refusing rule with its because | *Write a rule about motors* (`03`), the four words (`04-spec-popup`, `05-chosen-no-because`), the because (`06-ready`), *Add it as 2.4* (`07-added`) | **Done.** With the because empty, the act is refused with a sentence: *Say why, so the build can say it where it refuses.* Once added, the toast reads *Your rule is on. The build refuses from the next pick.*, with Undo. **Fault:** choosing the words scrolls the page by itself (§2, B1). |
| J4 | Admin | "What will it take away, before I add it?" | The count (`05-*`) | **Half done.** The figures are honest and measured: *61 of 289* models, *45 of 540* offers taken away, *171 of 241* motors refused, and the 32 ePropulsion are said to carry no controls. The five Highfield Classics that lose the F25SWTC are ringed and named. The other **24 lit Highfield, 29 Stacer, 2 Formosa and 1 Stabicraft marks have no name**: they are `aria-hidden` 10 px squares with no hover, no press and no list. Which 45 offers are taken is never listed. |
| J5 | Admin | Turn a rule to warn, or off | The verb word in 2.4 (`08-verb-popup`, `09-warns`, `09b-off`) | **Done.** Each option says its consequence. Off reads "This rule is off — kept, not enforced." at full ink. Both changes are undoable. |
| J6 | Admin | Rewrite, delete, bring back | *Rewrite 2.4* (`10`), *Delete 2.4* (`11`), Undo (`12`) | **Done.** Close comes first and Delete is set apart, last. The toast after Undo reads *"Undone. No longer so: Your rule is deleted."* (`13-noticed-open-1280x800`), which is engine grammar. |
| J7 | Admin | Adopt what the file was noticed doing | *Say it as Northside's* (`13-noticed-open-*`) | **Done for 1 of 3.** The remote-helm pattern opens as 2.5 with its because. Its count says *"No sale. Nothing the price list makes for these boats breaks it; a search past the list finds 38 fewer motors."* "No sale." reads as "you cannot sell". The two Rigging boxes (*Helm Master kit*, *two-battery kit*, held 1,576 of 1,576 and 1,196 of 1,196) have **no act and no sentence where they stand** saying why. Only the part's foot says in general that a rule is "about a motor or a trailer". |
| J8 | Admin | A rule about one boat | `?open=new:trailer`, boat's model (`14-model-list-*`), the longest name (`15-longest-sentence-*`) | **Possible, badly.** The model list is **289 raw strings in one unsearched list**: "495 - Pro Fisher.", "ADV7", "Cap Camarat - 5.5 CC Series 2". No maker is shown, and every option is trailed by a useless "1". The longest, *Stabicraft - 2350 Ultra Centrecab (Adventure)*, prints in the sentence as the file writes it, while the count under it calls the same boat *the 2350 Ultra Centrecab*. The trailer series prints as *ALLOY CENTRE-LINE SERIES*, in the file's capitals. **The rule takes 3 of 3 offers**, so the boat would be offered no trailer at all, and the screen never says that. |
| J9 | Admin | "Helm Master motors need the Helm Master kit" / "a tiller boat never gets the two-battery kit" / a part that needs another | Part 3 | **Not possible.** "A rule here is written about a motor or a trailer, so this part is your price list's alone." There is no "needs" or "goes with", only "must be / must not be". |
| J10 | Admin | "Except the Classic 340" / "a Stacer over 6 m" | The sentence | **Not possible.** A rule is one condition and one obligation. |
| J11 | Admin | "The F25SWTC is never offered on a Classic" | Motor specs | **Not possible.** The motor's specs are maker, horsepower, shaft, controls, starting, tilt and trim, colour and weight. There is no model. |
| J12 | Salesperson, customer at the desk | "Why can't he have the F25?" | The build on a Classic 340, then *See the rule* (`17-build-refuses-*`, `18-see-the-rule-*`) | **Done.** The build says *Not offered on this boat: the Yamaha F25SWTC, because a tiller boat has no helm…*, with the rule beside it. *See the rule* lands on 2.4 opened to be read, Close first. |
| J13 | Admin | "Has this rule ever stopped a sale? Which quotes?" | — | **Not possible.** The count says only *"No draft is standing today, so none waits on it."* Nothing is kept about when a rule refused something. |
| J14 | Admin | "What do the price list's own seven do in the build?" | 1.1–3.2 | **Not said.** A Northside clause carries its verb ("Otherwise the build refuses…"). A price-list clause carries its measure and nothing about whether the build enforces it, warns, or ignores it. That is half of this screen's own job ("what each refuses in the build"). |
| J15 | Admin | Print the house rules to sign, or to give a new salesperson | — | **Not possible.** It was left out on 2026-10-28 ("simple wins"). The composition still promises "one page Northside could sign". |
| J16 | Either | The file is not in this browser | `19-no-file-*` | **Done.** The page says why and offers *Load the Master Price File*. |
| J17 | Either | A stale link (`?open=` a rule since deleted) | `16-bogus-open-*` (`?open=zzz-not-a-rule`) | **Silent.** The page draws at rest, says nothing, and keeps the address. |
| J18 | Either | Keyboard | Tab from the top | **Done.** The order runs: pill, *Write a rule about trailers*, *Say it as Northside's*, *What 2.4 does*, *Rewrite 2.4*, *Write a rule about motors*, then out. Escape closes an open clause. Reduced motion is honoured by `MotionRoot` (`reducedMotion: 'user'`). |

---

## 2. The perfect bar, at six sizes

**PERFECT at every size:**
- the page at rest, top and foot (`01`, `02`)
- the verb list (`08`)
- the toasts (`07`, `11`, `12`)
- the no-file state (`19`)
- the build's refusal (`17`)

**The faults, measured:**

| # | Element, state | Where | Measured | Severity |
|---|---|---|---|---|
| B1 | **The page scrolls itself while the four words are chosen** | 390, 844×390, 834×1112, 1280, 1920 | `scrollY` moves on its own as the words are chosen, from the clause's landing to: 1,306 → 1,516 at 390; 894 → 1,091 at 844×390; 894 → 1,155 at 834×1112; 686 → 1,027 at 1280; 683 → 722 at 1920. It stays at 682 at 1440, where the sentence side is sticky. The results: at **834×1112** the act *Add it as 2.4* lands at y 13–65 **under the pill** (8–50), with the sentence above the window at y −148…−70 (`05-chosen-no-because-834x1112`). At **1280×800** all three count figures land above the window at y −240…−69, so the writer sees marks and not the figures (`05-…-1280x800`). At 844×390 and 390 the finished sentence lands above the window. | **blocker** |
| B2 | The count's head under the pill | 1280 (writing about a model), 1920 (after choosing) | At 1920 the head *Counted now, before it is added* sits at y 31–46 under the pill (8–50), overlapping it from x 1,264 to 1,327. At 1280 its first 50 px are hidden behind the pill (`14-model-list-1280x800`). | major |
| B3 | Rigging noticed boxes are dead ends | every size | Two boxes have no act and no sentence beside them. CLAUDE.md: "A refusal is a sentence with its reason, where it is refused." | major |
| B4 | The model list | every size (`14-model-list-*`) | 289 options with no search, no maker group, the file's raw strings with their trailing full stops, and a count of "1" on each. | major |
| B5 | The 289 marks | every size, writing | 10 px squares, `aria-hidden`, with no name on hover or press. 31 lit marks are unnamed in the tiller count, and only the losers are named. | major |
| B6 | Part 3's rhythm | ≥1200 (`01-arrive-1280x800`, `-1920x1080`) | The noticed stack sets the clause rows' height: 3.1's text ends near y 890 and 3.2 starts at y 971, and the foot line stands about 80 px under 3.2. Part 1's 288 px margin is white and empty. | minor |
| B7 | Words a person trips on | — | *"No sale."* (meaning "costs no sale"). *"a search past the list finds 38 fewer motors"*. *"Undone. No longer so: Your rule is deleted."*. The lede's *"keeps 7 of these"*, where "these" has no noun before it. | major (the first), minor (the rest) |
| B8 | Small targets | every size | The verb word is 22 px high: *refuses* 44×22, *is off* 30×22. The op word *is* is 18×39, and 13×31 at 390. They are inline words, so WCAG 2.5.8 excuses them, but on a phone they are fingertip targets. | minor |
| B9 | Text under 12 px | every size | The eyebrows *The house rules*, *Noticed, not written*, *Counted now…* and the clause's *2.4 · Northside's · being written* are 11 px. | minor |
| B10 | "Rigging and pre-/delivery" | 834×1112 | The 112 px name column breaks the part's name over three lines, at the hyphen (`01-arrive-834x1112`). | minor |
| B11 | The third figure at 390 | 390 (`05-…-390x844`) | *motors it refuses on them; the 32 ePropulsion carry no controls, so it says nothing of them* runs to four lines in a 147 px cell. | minor |
| B12 | Stale `?open=` | every size (`16-*`) | Silent: no sentence, and the address keeps the bad value. | minor |

---

## 3. The level it has to be

For each item: what the best tool for keeping a dealer's selling rules would give that this screen does not, why Northside needs it, and whether the file honestly carries it.

**Blockers**

1. **The writing moment holds still** (B1, B2). Choosing a word never moves the page. On every size, the sentence, its act and the three figures are seen together, or the figures follow the act, with the act never under the pill. The rulers miss this because the pill floats, the reason `rules.spec` already measures it at 1440 and 1920. The spec should measure it at all six sizes, after the fourth word.

**Majors: function**

2. **Every measure opens on its exceptions.**
   - *555 of 571* opens on the 16 rigging-kit offers by boat and kit.
   - *3,902 of 3,905* opens on the 3.
   - *3,890 of 4,017* opens on the 127.
   - Each exception has a door to its line on the sheet (`/data/$table?at=`) and, where Review has the case, to Review.
   - **Carried by the file**, with one honesty fault. The stated measures are constants lifted from the adjudication (`ruleLedger.ts`: "nothing here is a new measurement"), not counted off the loaded sheet. After Shelf brings in a new price list, *581 of 581* would still print, under "each measured on it".
   - So each clause must be measured live, as `pairReach` already counts Northside's, or say which file its figure was measured on. This is required by CLAUDE.md ("a rule shown is measured from the file") and by LATER's citation classifier, "owed by whichever … screen draws a rule's evidence".
3. **What a rule takes, listed by name** (Stripe's matches beneath the test).
   - Under the count, list the 45 offers as boat → motor, grouped by maker.
   - Each mark carries its model's name on hover, focus and press.
   - Add a "try it on one boat" view that shows that boat's motor list with the rule on, which is what the salesperson will see.
   - **Carried:** `pairField` and `pairReach` already compute exactly these sets.
4. **Say what the price list's own clauses do in the build** (J14). Give each a verb line like Northside's: refuses, warns, says only, or not enforced. Where Northside may overrule one (2.3, the shaft), let it be turned to warn or off with a because. **Carried:** this is about enforcement, not figures.
5. **Rules beyond motor and trailer pairs.**
   - Rigging kits, propellers, pre-delivery kits and dealer-fit parts.
   - "Needs" or "goes with", for example *a Helm Master motor needs the Helm Master kit*, offered in the build as an addition rather than a refusal.
   - With this, the two Rigging noticed patterns can be said as Northside's.
   - The owner has said that quotes are "not just boats … dealer fit things as well" (DECISIONS 2026-10-30).
   - **Carried:** the noticed patterns are measured on the rigging-kit and pre-delivery lists, and the P/D pairing lists (`join_*_pd`) name their parts.
6. **One more clause of grammar: "and" and "except".**
   - *When the boat's maker is Stacer and its length is over 6 m…*
   - *…except the Classic 340.*
   - Add a motor's and a trailer's own model as a spec (J11).
   - **Carried:** every spec named is a `pairSpecs` column.
   - LATER's rule canvas stays deferred. This is still a sentence, not a canvas, so nothing in LATER is overruled.
7. **The rule that empties a list, or fights another, is said before it is added.**
   - Example: "The 2350 Ultra Centrecab would be offered no trailer" (measured: 3 of 3 taken).
   - Example: "This contradicts 1.1: ALLOY CENTRE-LINE is not a series built for Stabicraft."
   - Where a rule and a noticed pattern say the same thing, the screen says so.
   - **Carried:** these are counts over the same sets.
8. **Boats and series named the way a person says them** in the sentence and in its lists (DECISIONS 2026-09-24, one naming rule). The model list is grouped by maker, searchable by typing, and drops the meaningless "1". Series are not printed in the file's capitals.
9. **What a rule has done.**
   - "Refused the F25SWTC on 3 quotes this month; Q-0012 went to the F20SMHB."
   - **Not carried today:** `fired` is returned and dropped (notes §0). Nothing may be drawn until the quote store keeps each refusal as an event, which fits the existing rule that quotes change through commands with events.
   - The owner asked for "deep backend configuration", which makes this the admin's proof that a rule matters.
   - LATER does not defer it. The sweep named it unbuilt.

**Majors: finish**

10. The dead-end Rigging boxes say their reason where they stand, until item 5 makes them sayable (B3). The words in B7 are fixed.
11. A stale `?open=` says "That rule is not on the list any more", where the clause would have opened (B12).

**Minors**

12. **Print and share the house rules.** The page promises "one page Northside could sign". DECISIONS 2026-10-28 left print out for "simple wins". The owner's "not at the level it has to be" and his downloadable-quote goal argue for bringing it back, so I list it and say that it reopens that decision.
13. Part 3's dead air and Part 1's empty margin at ≥1200 (B6). The part name at 834 (B10). The 11 px eyebrows (B9). The fingertip-sized verb word on a phone (B8). The four-line figure at 390 (B11).
14. The six refuted workbook candidates, each with "the number that kills it" (notes §0). The admin can read them under a quiet "Looked for and not true" so nobody re-proposes them. **Carried** in `workbookRules.ts`.

---

## 4. The verdict

**DEEPEN.** The house-rules composition fits a page of a handful of clauses that a dealer reads, writes and signs:
- numbered clauses under what the customer buys
- the owner as the edge, the verb in place
- the noticed in the margin, the count beside the clause being written

A new sweep would redraw the same document.

What the page lacks is depth, and that work is mammoth:
- every measure opens on its exceptions, measured live off the loaded file
- every count lists what it takes, by name
- the price list's clauses say what they do
- the grammar reaches rigging, parts and "needs", with "and", "except" and models
- a rule that empties a list or fights another says so before it is added
- a rule's record of what it refused
- the writing moment holds still at all six sizes

The writing moment is the one blocker and comes first.
