# Home, judged cold a second time (2026-10-20)

A fresh critic who had not seen HL_2.0 before judged Home as its owner would. The build judged was the working tree after the first cold critique's fixes (`docs/directions/home2-critique.md`, `DECISIONS.md` "Home after its cold critique"), uncommitted.

**How it was walked:**

- The build was served with `npm run build && npx vite preview --port 6435` and driven by a fresh headless Chromium, with a new profile, at a device scale of 1.
- The profile started empty, so the walk came in at the door. "Dana" was typed, then *Load the Master Price File* was pressed. Home was on screen 4.5 s after the press.
- Home was seen at five points, at 1440 × 900, 1280 × 800, 1920 × 1080, 834 × 1112, 390 × 844 and 844 × 390:
  1. **Day one.**
  2. **One draft:** the ADV7 photograph on Home, Black / Grey / Black, *Start the quote*, then the Yamaha F250XCB, then back to Home.
  3. **Given and filed:**
     - The draft was addressed to Rose Kelleher, with 0412 555 019 as her contact line.
     - *Give it to the customer* was pressed.
     - James Harrow was added in Customers with 0400 123 456.
  4. **Four jobs:** a Formosa GRT 425 draft and a Stacer 519 Sea Ranger SDF draft were started from the picker.
  5. **Five jobs:** Mia Tran was added in Customers by name only.
- Every card, every boat, all ten doors and New quote were pressed and followed to their addresses.
- A keyboard user Tabbed 40 stops. `/` was pressed, words were typed into the field, and Esc was pressed.
- Reduced motion was emulated on a load.
- The white words on the water were read against the brightest pixel behind them, with the words hidden, over four frames of the live water at five sizes.

**What it measured:**

- **Fit:**
  - On day one and with one or two jobs, the page fits: 900 of 900, 800 of 800, 1,080 of 1,080.
  - With four jobs at 1280 it is 825 of 800.
  - With five jobs at 1440 it is 925 of 900.
- No sideways scroll at any size, in any state.
- **White on the water:** 5.83 : 1 at worst, at every size, for the name, the date, the greeting, the stamp, the today line and "and N more".
- **Keyboard:** all 24 of Home's own stops are ringed. `/` puts the caret in the field. Typed words open the finder with them. Esc gives the caret back to the field.
- **While the caret is in the field** the placeholder holds still and `data-still` is set, so the water stops.
- **Under reduced motion,** on a load, no arrival animation runs and the placeholder holds.
- **Money:** no cost, no margin and no customer's total is on Home. No figure counts up.
- No page error in any walk.

## The verdict first

**Day one is good, and it is the best Home has been.**

- A blue sea of live water, Northside's name, the date, "Good morning, Dana." and one find beside one amber New quote.
- Eight real photographs as doors to quoting.
- Ten makers as doors.
- The tab says "Northside Marine".

At 1440 it is calm, blue and white, and honest. Stakeholders would not wince at it.

**A week in, the first critique's fix holds only while the week is small.**

- With one or two things on the desk, the cards on the water are the nicest object in the app. A photographed boat, a dot, "Given today at 10:17", "To Rose Kelleher", and a person with their initials and the number to ring. The sea keeps its size.
- Then a third draft is started, or a fifth customer is filed, and the row grows a second line or an "and 1 more". The sea grows by 30–40 px, and the bottom row of doors goes off the window at 1280 and at 1440.
- That is the window the owner will be at, on the day he does a full quote with a customer at the desk.

His logo is still his name set in light type. The doors are still small marks floating in large white cards.

## Findings

### Blockers

1. **A week in, Home does not fit the desk windows it claims.**
   - **1280 × 800, after the given ADV7, James Harrow and two drafts:**
     - "Stacer 519 Sea Ranger SDF" wraps to two lines on its card, and "and 1 more, in Quotes and Customers" is added under the row.
     - The sea grows from 357 to 389 px, and the page is **825 of 800**.
     - The second row of doors, Surtees through Trailers, is cut through its counts at the window's foot (`w3-1280x800`).
   - **1440 × 900, after Mia Tran is added** (five jobs, four drawn): the sea grows from 418 to 455 px, and the page is **925 of 900**. "19 models", "9 models", "209 motors · chosen in the build" and the rest are cut off at the foot.
   - **The cause:** the desk's height is not fixed. A card's title can wrap (`.home-job-title` with `overflow-wrap: anywhere`, card 77 → 97 px), and the "more" line adds about 24 px. The sea is `flex: 1 0 auto` and grows with them.
   - **Why the tests missed it:** `DECISIONS.md` says the sea is "418px at 1440 × 900 and 357px at 1280 × 800 in both states". That was measured with one draft. Three drafts and two customers is an ordinary Tuesday.

### Majors

2. **The showpiece is still a word.**
   - NORTHSIDE / MARINE is set in tracked light type. The pill's crest is "NM".
   - The owner's first ten seconds are still "where is my logo?".
   - The slot is ready (`--org-mark`, the marks ledger), and the question has been asked. Until the file arrives, nothing else on Home can make up for it, so it stays the first thing to fix.
3. **The doors are the hated shelf, larger.**
   - Ten white 263 × 90 cards each hold a mark of about 170 × 30 px floating in white, with a count under it.
   - At 1440, Jeanneau's wordmark is about 7 px tall and cannot be read. Haines's "HAINES" over "Signature" is a hairline.
   - At 1280 the marks are 47–142 px wide and 19–26 px tall.
   - The original HelmLogic dashboard that stakeholders loved drew each maker's mark at full card width (`why.md` §1, job 5). Equal optical weight has made every mark equally small.
   - Under the sea, the page is 18 white tiles on pale blue. That is what the owner called "so bland and boring" and "it still feels like a database".
4. **Yamaha, ePropulsion and Trailers open a page that never names them.**
   - All three go to `/quote/new`, headed "Which boat is it?", with nothing about Yamaha on it.
   - "chosen in the build" is an honest disclaimer, but a door with Yamaha's mark on it that opens a boat list surprises the dealer and the customer beside them.
   - Job 5 is "show the customer what Northside sells … boats and motors alike". For a third of the brands, Home cannot do that.
5. **A draft card does not say what is still missing.**
   - `why.md` job 2 asks each draft to say what is still missing ("no motor yet", "not priced at this level"). The Formosa GRT 425 draft has no motor and no customer.
   - Its card says "Draft · 7 minutes ago · Nobody named yet · at Cash".
   - "Nobody named yet" is said. The missing motor, which is the next thing the salesperson does, is not.
6. **The given quote's time is said twice.**
   - The card says "Given today at 10:17". The today line under it says "1 given, the last at 10:17".
   - With three drafts open, the line says "3 quotes started and 1 given, the last at 10:19". "The last" is the last of what? A reader cannot tell whether that is the last start or the last given.
7. **Scrolled on a phone, the head bar lies over Home's words, and the edge does not show on the sea.**
   - At 390 × 844, scrolled 560 px, "Highfield ADV7" is cut through under the pill.
   - At 844 × 390, "Ma…" of the stamp and "…t 10:19." show at either side of the pill.
   - The kit's scroll edge is a pale fade, and it does not read over the dark sea.
   - The rule is "nothing drawn over anything else at rest or scrolled".

### Minors

8. **"packed 16 Sept 2026" on Home and "packed 16 September 2026" on Entry.** One fact is written two ways, a screen apart.
9. **At 1280 the boat cards hold a hole.** `min-block-size: 2lh` on every model name leaves "ADV7", a blank line, then "Highfield", so seven of eight cards look half-filled.
10. **The Formosa draft's face is a pale inset tile.** It does not run to the card's edges as the photographs do, and its "ALUMINIUM PLATE BOATS" line is about 4 px tall.
11. **The finder that Home's field opens wears the chip *The desk*,** but it answers "sport 560" with a boat from the whole file. The chip says the search is narrower than it is.
12. **"and 1 more, in Quotes and Customers"** does not say who or what, and it is not a door. It is the only sentence on the water that asks the reader to go and look.
13. **"Nothing is open, given or kept in this browser yet."** On day one this reads as plumbing. A dealer would say there are no quotes or customers yet.
14. **At 390 the stamp breaks as "kept in this / browser"**, leaving one word alone on a line.
15. **Home's field and the pill's Find are 270 px apart.** Both open the same finder, but they look like two searches.
16. **Left from the first critique:**
    - the Patrol 600's boat-show photograph
    - the pill's `Ctrl` `K` keycaps at 834, and at 844 × 390 on a phone held sideways
    - the same eight boats every morning

## Would he be happy?

Not yet. On day one at 1440, he would be "not unhappy", and close to pleased. Then he raises three quotes in front of a stakeholder, comes back to Home on his laptop, and the makers' row is cut off at the bottom of the window. Under the blue, it is still a grid of small logos in white boxes, with his own name in thin type.

**The one thing to change:** make the work on the desk a fixed height in every state, and give the room below it to the brands.

- The desk is exactly one row of single-line cards. A title is clamped to one line with the full name on hover, focus and in the label. "and N more" is a door folded into the row, as the last card.
- The sea's size is then fixed by construction, not by measurement on a light day.
- The makers' marks are then drawn large, the way the original drew them: fewer, bigger doors, each mark at full width, so the lower half of the page has the colour and character the brands' own marks carry.
- Northside's logo goes into the slot the day it arrives.
