# The refinement round, judged cold a second time (2026-10-22)

The owner, 2026-09-24: "seeing overlap of info and things on some screens. ensure refinement of things covers that". This critic had never seen HL_2.0. It looked for three things on every screen:

- anything drawn over anything else,
- any fact said twice,
- any word a boat dealer would not use.

It judged the working tree after `refine-2.md` (uncommitted), against `refine-critique.md`, `build-close-critique-2.md`, `home2-critique-2.md` and `docs/WORDS.md`.

## How this was read

- `npm run build` (green, with Vite's one chunk warning), then `npx vite preview --port 6095`.
- Driven in headless Chromium through Playwright, device scale 1 (2 and 3 for close-ups), on a new profile that kept its storage from walk to walk.
- **The sale, at 1440 × 900:**
  - "Sam" at the door, and the Master Price File loaded.
  - New quote, "519", the 519 Sea Ranger SDF · Centre Console, then Start the quote.
  - 02 Motor, and the F115LB pressed with the F90LB on. 04 Dealer fit.
  - See what Trade does, then back.
  - Who it is for: "Jordan Avery", "0412 555 018 · Brighton". The finale, Give it to the customer, a press on a motor tile of the given quote, then Open the printed quote.
- **A week in:**
  - Drafts of the Formosa GRT 425 · Tiller, the Haines Signature Fisher 525F and the Highfield ADV9 (Dune), each started from Home's boats.
  - James Harrow (0400 123 456) and Mia Tran added in Customers.
  - That made 4 quotes and 3 customers. The walk ran past midnight, so History also shows a second day.
- **Every route,** at 390 × 844, 834 × 1112, 1280 × 800 and 1920 × 1080, with 1440 × 900 and 844 × 390 for Home and the build. Each was read at rest and then every half window down to the end, up to sixteen stops.
  - The routes: Entry, Home on day one and a week in, the picker (at rest, a search, a boat chosen, a maker's list), four builds (the given 519, the GRT, the Haines and the ADV9), the cascade, the printed quote, Quotes, Customers, History, Data, the price list editor, `/kit` and `/nope`.
- **Panels open:** the finder (empty, "519 sea", "jordan"), the Quotes peek on a given quote and a draft, Add a customer, Every customer, For the workshop, Show all 209, Data's Yamaha and Customers drawers, a History line opened, and the change of mind with its step line at 390.
- **Its own overlap reading:**
  - Every run of text was sampled at six points with `pointer-events` forced on, so chrome that ignores the pointer still counts.
  - Text counts as covered when something above it in the hit stack paints at that point (a ground, an image, a blur, a graphic or its own text) and neither element holds the other.
  - Every hit was then looked at in a screenshot. Content passing under a solid head that ends on a hairline was set aside as a seam.
- **The crest,** sampled 80 ms after each focus and blur in the name, the contact line and the search, and while typing "F1".
- **A word scan** of every route's visible text, placeholders, `aria-label`s, titles and alt text, against WORDS.md's engine column.

Nothing was written to the repository except this page and one entry in docs/DECISIONS.md.

## The verdict

**Things drawn over things: on the sale's screens, no longer. The same information twice: yes, he would still see it, and two screens now contradict themselves.**

The round closed what the first cold read saw:

- **The sticky heads are solid.**
  - The build's search band ends on a hairline at 1440. A close-up at 2× shows no word through it.
  - The masthead is opaque at 390, 834 and 844 × 390.
  - The cascade's pill stands on one pale band at every scroll.
- **Nothing stands under the tab bar at rest.** The picker's "Start the quote" stands clear at 390, at y 689 of 844.
- **The given quote prices its swaps right.** The F90LB reads "−$2,337", given or not.
- **The crest never replays.** `way-crest-arrives` and `way-crest-shines` stayed `finished` through every focus and blur.
- **The picker has no "row" left.** The scan found none on any sale screen.

What the owner would still see is information said twice, mostly on the build, where the customer is watching:

- **"Who it is for" three times in one window.**
- **The trailer's absence twice on one line.**
- **"4" three times on Home,** meaning two different things.
- **The boat named twice in the Quotes peek and on the paper's rail,** once as the price list spells it.

He would also find two contradictions on the screens that keep the record:

- **History** prints the time a quote was last touched beside the word "started", under a foot that says when it really started.
- **Data** says the Customers list has 2 rows while the pill says 3.

The overlap ruler is now right to be green on the sale. It still cannot see the one floating pill left without a ground: on `/kit` at a desk, a scroll frees every word, so it passes.

## The five findings the build round left open

| # | Finding | Now | What was seen |
|---|---|---|---|
| 1 | Dealer fit reads as a settings list | **CLOSED, residue** | At 1440: "Battery MFM50 +$199", "Battery Box · Small +$18" and three more lines, each with a glyph, a name and one figure. No radio, no code, no "at Cash". Under Rigging Kits, the kit on the boat says "on the quote". Residue: every line, a battery and a D shackle alike, wears the same toolbox glyph (minor 31). |
| 2 | The swap's kit named by the file's description | **CLOSED** | "Rigging kit for the F115LB" in the head, the masthead's sentence, the cascade, the finale, page 2 and the step line ("with its rigging kit"). The description stands only under For the workshop on the paper's rail. |
| 3 | The crest re-rises and re-shines on every blur | **CLOSED** | `["way-crest-arrives:finished:400","way-crest-shines:finished:988"]` before, during and after focus on the name, the contact line and the search, and after typing in the search. |
| 4 | At 834 the boat is a thumbnail for the whole build | **CLOSED** | The ADV9 arrives 770 wide, from y 207 to 640. It becomes a 250 × 140 thumbnail only once the page is scrolled. |
| 5 | The given paper tells the customer an item is missing | **CLOSED** | Page 2 says "Rigging kit for the F115LB · Price to be confirmed". "Your price" lists the hull, the motor and the trailer, then "Total, tax included $57,560". The reason is on the rail "For you, not the customer". |

## Home, a week in

| Finding | Now | What was seen |
|---|---|---|
| Does not fit 1280 × 800 and 1440 × 900 | **CLOSED** | With 4 quotes and 3 customers: 800 of 800, 900 of 900 and 1,080 of 1,080. One row: two draft cards and the "+4" card. |
| Long names clamped; "and N more" last | **CLOSED, residue** | "Haines Signature Fisher …" and "No boat price yet · Nobody nam…" at 1280. The clamp cuts the second missing thing (minor 34). |
| Small marks in large white cards | **CLOSED** | Marks run about 130 px wide in 160 px doors. Stabicraft is set in its own type. |
| Yamaha, ePropulsion and Trailers doors that never name them | **CLOSED** | One sentence: "Yamaha and ePropulsion motors, and trailers from 7 makers, are chosen in the build, on the boat." |
| A draft card does not say what is missing | **CLOSED** | "Draft · 1 minute ago · No boat price yet · Nobody named yet". |
| The time given said twice | **CLOSED** | The given quote folds into "+4 · 1 draft · 1 given today · 2 to call". |
| On a phone, scrolled, the bar over the sea's words | **CLOSED** | The bar scrolls away with Home at 390 and 834. 0 hits in four stops. |
| Northside's mark at showpiece size; the crest stops reading NM | **CLOSED** | The waves wordmark with "EST. 1965" on the water on every route walked. The crest is the waves on Entry, the sale, the reloaded paper and `/kit`. |

## Findings

### Blockers

**1. History contradicts itself about when a quote was started.** (history, 1280 and 390)

- **Each line's time is the last thing done to the quote, printed beside the word "started".**
  - The given 519's line reads "23:48 · started · 3 choices · named".
  - Its open drawer reads "Yesterday · 23:43 Stacer 519 Sea Ranger SDF — quote 20261021-01", and "Yesterday · 23:48 20261021-01 is issued".
  - The foot of the same screen reads "THE FIRST QUOTE, AT 23:43".
- **The GRT 425 shows it moving.** It read "23:49 · started" when it was made. After one swap and its undo, the same line reads "23:58 · started · 1 choice · 1 put back".
- **The line also drops what matters most.** The 519's chips stop at "named". There is no "given" chip, though "given" is in the key and the drawer says it was given.
- **Fix:**
  - Print the time the quote was started beside "started", or print the last thing done first, with its own time.
  - Give the given quote its "given" chip.

**2. Data says Northside has 2 customers; the pill says 3.** (data, every size)

- Under YOUR OWN LISTS, Data reads "Customers · 2 rows · not tied to a boat". Its drawer repeats "Customers · 2 rows".
- At the same time the pill says "Customers 3", and Every customer lists Mia Tran, James Harrow and Jordan Avery.
- Jordan Avery, named on a quote, is not in Data's count.
- "rows" is also the engine's first word in WORDS.md, on the one list a salesperson made himself.
- **Fix:** count the same people the pill counts, and say "3 customers".

### Majors

**Said twice, or three times:**

3. **"Who it is for" three times, and the missing name three ways, in one window of the build.** (configurator: 1440, 1280, 834, 390, every draft)
   - The step pill beside the search: "Who it is for".
   - The chapter head: "Who it is for".
   - The field's label: "Who the quote is for".
   - Below them: "Put their name on it", "A quote needs a name before it can be given." and "The finale · after their name".
   - At 1440 on arrival, all of these stand in one window (the step pill at y 270, the chapter head at y 695).
4. **The trailer's absence twice on one chapter head.** (configurator, Highfield ADV9, every size)
   - "03 Trailer · nothing made for this boat yet" on the left, and "Nothing on it yet" where the price goes.
5. **"4" three times on Home, meaning two things.** (home, a week in, 390 to 1920)
   - The pill says "Quotes 4", and the water's foot says "4 quotes started today."
   - Between them, the fold card says "+4", which counts 1 draft, 1 given quote and 2 people to call.
   - WORDS.md: "How many quotes or customers: the pill's count."
   - And "2 to call" counts Mia Tran, who has no number to call.
6. **The boat named twice, the second time as the price list spells it.** (quotes peek; the printed quote's rail)
   - Peek: the title "Stacer 519 Sea Ranger SDF · Centre Console", then "On the price list · Stacer - 519 Sea Ranger SDF (Centre Console)". For the Haines draft: "Signature Fisher - 525F".
   - The paper's rail does the same under "On the price list", a few lines above "The codes", which names the boat a third time with its code.
   - WORDS.md, rule 4: the file's own text is data, not a name.
7. **The business named in type under its crest.** (customers, every size)
   - The customer's card is headed "NORTHSIDE MARINE · QUOTATION" beside the pill's crest.
   - WORDS.md names "the NORTHSIDE MARINE eyebrow on … Customers" as a place the name must not be.
   - Also "FROM QUOTE 20261021-01" and "20261021-01 · Given · today" stand in one window.
8. **The finder says its doors twice.** (shell, finder empty, every size)
   - BACK TO lists Data, Start a quote, Home and 20261021-01, then GO lists Home, Quotes, Customers, Data and History again.
   - One line reads "Home   Home".

**Words a dealer would not use:**

9. **"issued" on History.** The open line says "20261021-01 is issued". WORDS.md: issued → given. Only the printed quote keeps "Issued".
10. **"filed" in the pill's label on every screen.**
    - The Quotes tab's `aria-label` is "Quotes — 4 filed, 3 of them open drafts".
    - It is on the build, the cascade and the printed quote, so a screen reader says the engine's word through the whole sale.
    - WORDS.md: filed → saved, or nothing.
11. **"Nothing is wrong with it."** (configurator, Show all, every size)
    - Under Show all 209 the band says "The price list does not list it for this boat. Nothing is wrong with it."
    - A press on the Yamaha F2.5SMHB (2.5 hp) then puts it on the Formosa GRT 425 without another word. The same screen says "POWER 40–60 HP".
    - The domain sentence behind it still reads "the price file simply never recorded that pairing" (`src/domain/quote/freeze.ts:1254`).
    - Say the fact the dealer needs: "Not listed for this boat. The GRT 425 takes 40–60 hp."
12. **For the workshop prints labels with nothing under them.** (configurator, Show all, 1440)
    - From the F2.5SMHB down, every motor without a kit or a prop prints "RIGGING KIT OPTION", "PROP PART NO." and "PROP DESCRIPTION", each with nothing under it.
    - Open since `refine-critique.md` major 20.
13. **The paper's rail explains the app.** (document, every size)
    - "The letterhead · Northside Marine's own mark, from northsidemarine.com.au."
    - "The figures · Fixed when each item was chosen: a new price list changes the next quote, not this one."
    - "Left off the printed quote · Parts & Accessories: 5 offered, none taken." stands directly above "Also offered, not taken". That is two headings for one kind of fact.
14. **`/kit` speaks the engine.**
    - "The accent cannot be the act's amber: amber is the one thing a person presses, and a chosen motor would read as an act waiting."
    - "Drawn refused, so its reason can be read at rest."
    - "FIELDS", "a filter".
    - WORDS.md: act → the button's own words.

**Drawn over something:**

15. **On `/kit`, the pill floats over the page with no ground.** (kit, 1280 and 1920, scrolled)
    - Scrolled 400 px, the build specimen's "02 · Motor" head and its "6 for this boat" stand half under the pill. Its "$16,667 Cash" chips do the same at 800 px.
    - The water photograph shows on both sides of the pill.
    - Every other screen at a desk is either one window tall or has a solid cap under the pill.
    - The ruler passes it, because a scroll frees each word.

### Minors

16. **The build's "/" keycap.**
    - At a desk it straddles the search band's top right corner, half outside the band (1440 at y 207, and at y 184 once the finale opens).
    - At 834, scrolled, it peeks under the masthead's hairline at x 790.
17. **At 834, scrolled, the spec values are left without their labels.** "9.2 m 3.27 m 6" (ADV9) and "535 kg 4 mm" (519) stand loose under the masthead's edge. It is a solid seam, but the strip reads as numbers with no names.
18. **The spec strip is still ragged at 1440.** "HULL LENGTH" takes two lines and "HULL WEIGHT (DRY)" three, so the values stand at y 406, 421 and 435 (519 and GRT).
19. **The picker's plate says "MIN 60 HP"** where the build says "POWER 60–115 HP".
20. **The maker said four times in one view** of the picker with the 519 chosen (1440):
    - the rail's lit Stacer mark,
    - the list head's mark,
    - "7 models match from Stacer.",
    - the plate's mark.
21. **The ADV9 has "5 colours" on the picker and "5 finishes" on the build.**
22. **Refusals drawn as dead controls:**
    - The picker's "Start the quote" is `aria-disabled` and drawn pale until a colour is chosen (ADV9).
    - A given quote's motor tiles are `aria-disabled` but keep their empty radio circles.
    - The peek's "Discard this quote" is `aria-disabled` on a given quote. The sentence under each is right.
23. **The Haines build says "The boat's price" four times in the open hull:** the heading, "prints … as the boat's price", the label and "Put this price on the boat".
24. **The Haines build numbers its chapters 01, 03, 04,** and its motor arrives as a package under "Dealer fit". Open since minor 22.
25. **The Quotes and History lines show the Haines draft at "$8,473"** with nothing on the line to say the boat has no price. The peek and Home say it. On History it is said nowhere.
26. **Data's Customers drawer says "Customers" three times:** the picture's word, the heading and "Open Customers".
27. **On a phone the lit tab's word fills its capsule rim to rim** ("Quotes", "Home"), and the draft's dot sits on the capsule's top right rim (3× close-up).
28. **Customers:**
    - It says "No photograph yet" where every other screen says "No photograph of this boat yet."
    - "Latest first" stands after the two sort buttons and reads as a third one.
    - Add a customer opens with its head at y 870 of 900 at 1440 and its fields below the fold, and nothing moves to it.
29. **The cascade's reasons are lower-case fragments:** "at Cash: no Trade price on the price list", "out of the total: rigging kits have no Cash or Trade price on the price list". The kit's code reads "704-6Y82L-cable length-05".
30. **The file's typo reaches the sale:** "FUEL CAPCITY" on the Haines picker and build.
31. **Dealer fit's lines all wear the toolbox glyph:** a battery, a battery box, terminals, a harness and a D shackle.
32. **History's fourteen days:** the boat with no photograph gets a shorter card that shouts "NO PHOTOGRAPH OF THIS BOAT YET." in capitals beside three photographs.

## Why the gate missed blockers 1 and 2

Neither is overlap, so no ruler measures them.

- **Blocker 1.** The History walk checks the time beside each line, and the foot, but never that the two agree.
- **Blocker 2.** No walk reads Data's count of the salesperson's own lists against the pill.

A check that "the same fact, printed twice on one route, has one value" would have found both. It would also have found major 5, where Home's two 4s count different things.

On overlap, the strengthened ruler now matches what a person sees on every sale screen. Its one remaining blind spot is a floating chrome with no ground at all, over content a scroll can free (`/kit`, major 15).

## Where first

1. **History's times** (blocker 1): one time per fact, and the "given" chip.
2. **Data's customer count** (blocker 2): one count of customers, in the dealer's words.
3. **The build's open head** (major 3): say "Who it is for" once, and the missing name once, where it is acted on. Then the trailer's head (major 4).
4. **Home's three 4s** (major 5) and **the peek's second name** (major 6).
5. **The words:** "issued", "filed", "Nothing is wrong with it" and the empty workshop labels (majors 9 to 12).
