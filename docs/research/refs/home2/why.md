# Home, again: why it is not right, and what the first screen is for

Written 2026-10-20. The owner, 2026-09-24: "dashboard isn't right yet — not happy."

**How this was found.** The app was served from a fresh build (`npm run build && npx vite preview --port 6401`). It was walked cold: every IndexedDB database, localStorage, sessionStorage and cache was cleared, so it started at the door. Home was photographed at all six sizes in three states, each reached by walking the app. No data was planted.

1. **Day one.** A name was typed at the door and the file was loaded, which took 4.0 s from the press to Home.
2. **One draft.** "Quote the ADV7" on Home, then Black / Grey / Black, then Start the quote, then the Yamaha F250XCB.
3. **Given and filed.** The draft was addressed to R. Kelleher and given. Then J. Harrow was added in Customers, by name only.

The frames are in `now/`:

- `00-door-1440x900.png`
- `01-day-one-*`
- `02-one-draft-1440x900.png`
- `03-given-and-filed-*`

The measurements below come from the running page.

**What else was read:**

- The owner's words in `docs/PLAN.md` (standing rules)
- The old repository: `HL_Playground/docs/BACKLOG.md` row 89, `plan/REBUILD.md` Phase 6, `plan/PHASE_TWO.md` §2.1, `specs/ACTION_BAR.md`, `plan/TENANCY.md`
- The screen he hated: `HL_Playground/tools/teardown/out/hn4/01-home-now.png`, shot 2026-09-11 at 10:10, the morning of "HATE IT"
- The original HelmLogic's dashboard: `HelmLogic/src/app/(app)/[orgSlug]/dashboard/page.tsx` and `tasks/test-evidence/ui-audit/1366/02-dashboard.png`
- Every Home critique: `directions/home/critique.md`, `built-critique-m2.md` #10 and #23, `components-critique.md` #5, `components-critique-2.md` #6 and #7

---

## 1. What the owner has actually said, and what he has been shown

- **He hated a dashboard of counts.** The 2026-09-11 Home in the old repo had four kind tiles, each carrying a count: "Boats 810 boats", "Motors 241", "Trailers 434" and "Accessories 2,860". Under them were two empty cards that explained themselves in prose: "NO QUOTES YET … A quote is what a customer is handed" and "WHERE I HAVE BEEN · NOTHING OPENED YET". He also had a sidebar with a second New quote at its foot. His words were "HATE IT". The old repo then asked itself whether he meant the layout, the content or the finish (BACKLOG row 89), and never put the question to him.
- **The old plan had already said why.** `PHASE_TWO.md` §2.1: "The dashboard was honest and thin; the reason it was thin is that counting tables is not a salesperson's day." The same plan says "A resumable draft is the most valuable thing on the screen", and the old session promised "my quotes, my customers, my day".
- **The original HelmLogic is the one stakeholders loved.** Its dashboard is the blue and white he asked for:
  - a blue gradient banner reading "Welcome, Bill"
  - **Northside Marine's own logo** in a white tile at its right, the dealer's mark on the dealer's screen
  - under that, "MY MODULES": a grid of large white cards, each carrying a maker's own mark at full card width (Highfield, Stabicraft, Jeanneau, Haines Signature, Surtees, Stacer, **Yamaha Outboards**, Trailers), and each one a door
  - **This is the grouping the plan means.** The business is grouped by the brands it sells, boats and motors alike, and every brand's mark is the showpiece of its own card.
  - It counts nothing.
- **Every Home since has been built from board B, "Cinema day".** The owner has never picked it (`SCREENS.md`: "built, PROVISIONAL … the owner has not looked"). The critic who recommended B warned that "the logo is never the showpiece" on any of the four boards. The last critic said the owner "would … argue about Home".

## 2. Why Home is not right today

The facts first: at 1280, 1440 and 1920 Home fits its window. It reads 0 sideways scroll at every size, and the contrast and focus rulers are green. The fault is not mechanical. **Home is a portrait of the price file, and a salesperson does not come to work for the price file.** On the desktop page, everything except the greeting, the act and the drafts column describes the file. That means the band, both photographs, the line saying the file is open, the search field, the six counts, their two footnotes and the maker shelf. Item by item:

### Dull

1. **The showpiece is a word, not Northside's mark.**
   - The band reads NORTHSIDE / MARINE in tracked light type on WebGL water. The water is honest and well made, but at 1920 the band is a 440 × 512 panel holding mostly empty water.
   - The original drew Northside's own logo. HL_2.0 has nowhere to put one: `DECISIONS.md`, 2026-10-20, "Northside's mark still has nowhere to be added". The pill's crest is the letters "NM".
   - The browser tab is titled **"HelmLogic"** on every screen, so on the first screen of the day the app names itself and not Northside.
2. **The foot of the band is about the file.** "MASTER PRICE FILE · 53 LISTS · 15,691 LINES · 28 OF THE LISTS SAY WHAT FITS WHAT" is the band's only content besides the name. It is a sentence about the database, set in tracked capitals on the screen's best object.
3. **The six counts are the hated screen again, with icons.**
   - The six counts: 289 Boats · 241 Motors · 444 Trailers · 1,866 Packages · 3,587 Parts & Accessories · 64 "Labour Rates · Oils & Consumables · Registration Costs".
   - Two footnotes follow them: "8,679 pairings say which motor…" and "A boat listed in four colours is one boat; every other figure counts lines of the price file."
   - All of it is true, and the footnotes exist only to explain how the figures were counted. A salesperson cannot act on "3,587". This is the content he said HATE IT to on 2026-09-11, now drawn in the kit.
4. **The maker shelf shrinks the marks the original made the hero.** Seven marks sit about 20 px tall in a 3-column card a quarter of the window wide. The Haines Signature script cannot be read at that size. Stabicraft is a line of type reading "Stabicraft / No mark held". The shelf is not a door: `components-critique-2.md` #6 said "Home's seven maker marks, which are still not doors". Yamaha, the maker of the motor on almost every quote, is absent, because the shelf lists only boat makers.
5. **Colour does almost no work.** The page is pale blue with white cards. The amber act is the one loud thing, and the kind discs are pastel. The kit has a live blue band, yet the eye lands on photographs that are not Northside's work and on a grid of grey figures.

### Confusing

6. **Two search fields.** "SEARCH THE FILE BY NAME" (placeholder "Search 15,691 lines") sits under New quote, and the pill's "Find Ctrl K" sits above it. The field's own help line says the field only counts, and that the other one opens: "This field counts what the file carries. Ctrl K opens the finder, which opens what it finds." It is a search box that tells you to use a different search box.
7. **The column is named for what is empty.** With one quote given and nothing being written, the work column still heads "OPEN DRAFTS 0". Under it: "Nothing is being written right now. 1 filed in all — 1 issued." The one thing Northside has done is a sub-clause under a zero.
8. **One fact, three words.**
   - The card says **ISSUED**.
   - The build's finale says "given to the customer", and Customers says "GIVEN 1".
   - Home also says "filed" of a quote, and Customers says "filed" of a person.
   - With one draft open, "1" is said three times: in the pill (Quotes 1), in the column head (1) and in the sentence "1 draft is open."
9. **The photographs are a second New quote.** "Quote the 519 Sea Ranger SDF" and "Quote the ADV7" are two more ways to start a quote. They are chosen for the composition, not for anything this dealer is selling today. They are the same two boats every morning, and nothing tells the salesperson why these two.

### Empty in the wrong way

10. **Customers do not exist on Home.** After R. Kelleher was given a quote and J. Harrow was added with no quote at all, Home said nothing about either. The pill counts "Customers 2", and that is the only trace. J. Harrow is exactly the person a salesperson owes a call, and Home cannot show him.
11. **The day-one empty state is a lesson in a narrow column.**
    - It reads "No quote has been started in this browser yet", then three grey glyph steps (Choose the boat · Build it · Give it to the customer), then two footnotes.
    - It is a quarter of the window, and the right-hand quarter at that.
    - The first state every stakeholder sees should be the most beautiful one. Here the most beautiful things are two stock photographs and a navy panel, and the empty state is the smallest object on the page.
    - What day one honestly has is a name, a business, its brands with their marks, its boats with their pictures, and one act. It does not need to explain itself.
12. **The work is buried where the screen is small.**
    - **Phone (390 × 844).** New quote is at y 300, which is good. The given quote's card is at **y 2,307 of 2,689**, nearly three screens down, under both photographs, the six counts and the maker shelf.
    - **Landscape phone (844 × 390).** The card is at y 1,841 of 2,137.
    - **Tablet (834 × 1112).** Drafts start at y 1,753.
    - A salesperson checking the morning on a phone scrolls past the price file to reach their own work.

### Breaks a rule that does not bend

13. **A white plate is laid over each photograph at rest.**
    - It covers **44%** of the ADV7 frame and **32%** of the Stacer frame at 1280 × 800.
    - It covers 27% and 20% at 1440, and at 834 it lies across the dog on the ADV7's bow.
    - Text on the plate is legible, but "nothing drawn over anything else at rest" is broken by the screen's own design, and at 1280 the plate shows more than the boat does.
14. **On a phone the pill is a floating bar at the foot of the window.** It is fixed at y 794 of 844, and at rest it lies over the Stacer's caption. It is the navigation and not the primary act, but it is the shape the owner called "disgusting", and it covers content without being scrolled.
15. **Keycaps at tablet width.** At 834 × 1112 the help line still prints `Ctrl` `K` and `/`. This was read with a fine pointer. The rule in `home.css` hides them only under 640 px or a coarse pointer, so an iPad with no keyboard depends on the pointer query alone.

### Not useful

16. **Nothing on Home changes from one morning to the next except one card.** The band, the photographs, the six counts and the shelf are identical on day one and day one hundred. The only object that answers "what happened, and what is mine to do" is a single card for the newest quote. The second newest is one press away, behind All quotes.

## 3. The jobs of the first screen, in the order they happen

These jobs are for a Northside salesperson at the desk. Each one says what this app can honestly carry: the quotes in this browser with their state, their frozen totals, customers and days (`domain/quote/register.ts`, `find.ts`, `diary/history.ts`, `diary/days.ts`); the customer book (`domain/people/book.ts`, `customers.ts`); and the price file, counted, with its brands, models, pictures and marks. No figure is invented, and **cost and margin never appear**, because the customer may be sitting beside the screen.

**1. Start a quote, now. (Every customer, several times a day.)**

- One act, the loudest thing on the screen, in the top row and never at the foot.
- It is reached first on the keyboard and first on a phone.
- Today this is right: New quote is the amber act. Keep it.

**2. Pick up where I left off. (Every morning, and after every interruption.)**

- The drafts being written, newest first.
- Each draft shows: the boat's own picture where the ledger holds that exact model, the boat as a person says it, who it is for or that nobody is named yet, the total at its rung, what is still missing ("no motor yet", "not priced at this level"), and how long since it was touched.
- One press opens the build at the chapter it was left on.
- Source: `readRegister` drafts band, `ageSay`, the frozen lines.

**3. Who is owed a call. (Every morning.)**

- Quotes given and not yet followed up, oldest first, with the customer's name and the day it was given.
- Customers filed with no quote yet, like J. Harrow.
- Customers whose draft is open.
- Every item is a fact this browser holds: `issuedAt`, `DESK_ORDER` (draft · given · replaced · none) and `book.lastTouched`.
- No "hot lead" score, no "likely to close": those would be invented.

**4. A customer walks in: find them, or find the boat they name. (Several times a day, with the customer at the desk.)**

- One field answers both: a person by name, with their quotes and what they were given; and a boat by the name they say ("the Sport 560", "an ADV7"), with its picture and a way straight to Quote it.
- **Quote it again.** For a returning customer, a given quote can become a new one: `diary/again.ts`, `quoteAgain` / `whyNotAgain`.
- **What they passed over.** `offeredNotTaken` says what was offered and not taken last time.
- This is the screen the customer sees too. It shows faces and boats, and no counts of lines or lists.

**5. Show the customer what Northside sells. (When someone is browsing, before they name a boat.)**

- The brands as the original drew them: each maker's own mark large, boats and motors alike (Highfield, Stacer, Stabicraft, Jeanneau, Surtees, Haines Signature, Formosa, and Yamaha for the motors).
- Each brand is a door into its boats in the picker, with the photographs the ledger holds.
- How many models each sells, as the picker counts them (67 for Highfield, not 588 lines), is the only figure it needs.

**6. See today in one line. (Glance, once or twice a day.)**

- What moved today, read from the diary: quotes started, given and replaced, by day (`rhythmOf`, `indexDays`).
- This is a count of events that happened in this browser. It is not a target, a rate or a trend.
- On day one it says nothing has happened yet, in one sentence.

**7. Know the app is Northside's and the file is current. (Once, at the door.)**

- **Northside's own mark**, as the showpiece.
- Which file is loaded and the day it was packed, said once, quietly ("Master Price File · packed 16 September 2026").
- Where the work is kept ("in this browser").
- The file's size in lists and lines belongs to Data, not here.

**Day one.** On day one, jobs 2, 3 and 6 have nothing in them. That is the true state, and it must be the most beautiful state, because every stakeholder sees it first. Day one carries jobs 1, 4, 5 and 7 at full size:

- the mark
- the act
- one field that finds a boat by the name a customer says
- the brands as doors

The empty jobs say so in one sentence each. They are not drawn as wells or lessons, and the space they would take goes to what is true.

## 4. What this means for the next round (not a design, a brief)

- **The subject changes from the file to the salesperson's day:** my drafts, who is owed a call, and a customer at the desk. The file's anatomy (lists, lines, pairings, the six kind counts, the marks' ledger note) leaves Home for Data, where it already lives whole.
- **The showpiece is Northside's mark,** which needs a place to be added (`OrgRepository`, docs/CUSTOMISATION.md layer 2), and **the brands' own marks large, as doors.** That is the original HelmLogic's grouping, which stakeholders already know.
- **Home has one find**, the finder, scoped first to people and to boats by the name a customer says. It does not have a field that only counts.
- **The phone order is the order of the jobs,** not the order of the desktop grid: the act, then my work, then the brands.
- **Nothing lies over a photograph at rest,** and nothing floats at the foot on a phone.
- **Words:** one word for a quote handed over ("given", as the build and Customers say it), and nothing said twice.
