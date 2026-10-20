# Home, judged cold (2026-10-20)

A fresh critic who had not seen HL_2.0 before judged Home as its owner would.

**How it was walked:**

- The build was served from the working tree as it stands (Home uncommitted, from board D with board A's doors), with `npm run build && npx vite preview --port 6431`.
- Every IndexedDB database, localStorage and sessionStorage was cleared, so the walk came in at the door.
- At the door, "Dana" was typed, then *Load the Master Price File* was pressed. Home was on screen 7.3 s after the press.
- Home was seen at three points:
  1. **Day one**, at all six sizes.
  2. **After one draft:** the ADV7 from Home's photograph, Black / Grey / Black, the Yamaha F250XCB, then Home.
  3. **After giving and filing:** the draft was addressed to Rose Kelleher with a phone number, then *Give it to the customer* was pressed. James Harrow was then added in Customers by name only, and Home was seen again at all six sizes.
- Every door on Home was pressed. The field was typed into and the finder closed again with Esc. A keyboard user Tabbed through 30 stops. Reduced motion was checked live and on a reload.

**What it measured:**

- Fit, in the window:
  - 1280 × 800: 800 of 800
  - 1440 × 900: 900 of 900
  - 1920 × 1080: 1,080 of 1,080
  - This held both on day one and a week in.
- No sideways scroll at any size.
- White on the water read 5.83 : 1 at worst, against the brightest pixel behind the date, the greeting and MARINE. The stamp read 6.38 : 1 and the day-one line 6.76 : 1.
- Every Home stop had a ring.
- The placeholder holds still while the caret is in the field, and it holds still under reduced motion on a load.
- No price counts: `PriceFigure` is static.
- No cost or margin is printed on Home.

## The verdict first

**Day one is good, and better than anything Home has been.**

- It is blue and white with one amber act, and live water under the name.
- Eight real photographs are doors to quoting.
- Ten makers' own marks are doors.
- One find hands what is typed to the finder, with nothing lost.

Stakeholders would not wince at it.

**A week in, it is worse.** Once one quote exists, the showpiece shrinks to a 110 px strip. The boats shrink to tiles 80–92 px wide. The page opens into two half-empty panels:

- At 1920 × 1080, *Who to call* is a 600 × 640 white card holding two people over about 400 px of white.
- Beside it, about 400 px of bare ground lies under the boats.

The owner will do a quote at the desk and come back to this, and the dashboard will look broken at the moment it should look busy.

His logo is still his name set in light type, and the browser tab still says **HelmLogic**.

## Findings

### Blockers

1. **A week in, Home looks broken: two panels with large empty fields.**
   - 1440 × 900, after one draft and no people: *Who to call 0 · Nobody is waiting on a call.* sits alone in a 540 × 470 white card. *Being written 1* is one 400 px card in an 800 px panel.
   - 1440 × 900, after a quote is given and a person filed: *Who to call* stretches to y 752 with about 220 px of white under James Harrow. About 260 px of bare ground lies under the boat row, from y 488 to y 752.
   - 1920 × 1080: the card runs y 301–943 with about 400 px of white, and there are about 400 px of bare ground beside it.
   - The brief says an empty job is said in one sentence and not drawn as a well. The panel is sized to the grid, not to what it holds.
2. **On a phone the pill lies over Home's words at rest.**
   - At 390 × 844, scrolled to 0, the fixed pill (y 794–836) covers *Press one to quote it; say any other by name in the field.* (top at y 779) a week in.
   - On day one it lies over the Sport 560 and Sport 600 photographs.
   - Both break "nothing drawn over anything else at rest". It is also the floating bottom bar the owner called "disgusting". It is the shell's pill, but Home is drawn under it and does not leave it room.

### Majors

3. **The showpiece is still a word, and the tab names the wrong company.**
   - NORTHSIDE / MARINE is thin tracked type, and the pill's crest is the letters "NM".
   - `index.html` titles every screen **HelmLogic**.
   - The slot `--org-mark` exists, but nothing fills it. The owner's first ten seconds will be "where is my logo?".
4. **The showpiece collapses the moment Home is used.**
   - On day one the mark is 72 px (90 px at 1920) and centred on a 360–440 px sea.
   - With one draft it is a 110 px band with the name at about 32 px.
   - Home is at its most beautiful only while the business has done nothing, and gets plainer as the dealer works.
5. **The file's anatomy is still on the water, and the pill says it again.**
   - *Master Price File · packed 16 Sept 2026 · 53 lists · 15,691 lines · kept in this browser* stands on the showpiece in every state.
   - The pill says *Data 53* two inches above it.
   - `why.md` §3 job 7 and §4 say the lists and the lines belong to Data. This is the database sentence the owner said "HATE IT" to, made shorter.
6. **"Eight boats the file holds a photograph of."** A dealer would never say this. It is a sentence about the photograph ledger, the screen's own plumbing, used as the head of the most beautiful row. The boats are on it because the ledger has their pictures, and the head says so instead of saying what they are to a customer.
7. **The maker marks are drawn at wildly different optical sizes, and a week in they are a strip of thumbnails.**
   - On day one at 1440:
     - HIGHFIELD fills about 210 px.
     - Haines Signature is an 85 px grey hairline script that cannot be read.
     - Jeanneau's mark is about 30 px with a caption too small to read.
   - A week in at 1280: the trailers' three marks, ePropulsion and Haines are unreadable.
   - `why.md` §2.4 named exactly this: "the maker shelf shrinks the marks the original made the hero".
8. **The motor and trailer doors open the back office.**
   - Yamaha and ePropulsion open the Data sheet at `/data/mot_yamaha?door=pictures`. Its head reads *27 columns, 6 of them cost*, and *Every column* is one press from the cost columns.
   - Trailers opens Data's register. Its rows say *Trailer Module.xlsx · sheet "Trailer Module"*.
   - The seven boat doors open the picker.
   - With a customer beside the salesperson, three of ten doors on the customer's screen walk into the price file's engine room. The doors should be one kind: the motors in the build's motor chapter or a picker of motors, and the trailers the same.
9. **Who to call has no number, and it never empties.**
   - Rose Kelleher was addressed with a phone number. *Who to call* shows her initials, *Given the Highfield ADV7 today.*, *Open the paper* and *Their page*, but no number.
   - Nothing records a call. `owed.ts` lists every person whose newest quote was given, oldest first, so in a month the list is everyone ever quoted, led by the oldest.
   - A person given a quote one minute ago, still sitting at the desk, is at the top of *Who to call*.
   - That fails `why.md` job 3 ("given and not yet followed up"). This app cannot know "followed up", so the panel needs a way to say so, or a narrower honest promise ("Given this week").
10. **The boat photographs become 80–92 px tiles a week in.**
    - At 1280 the eight tiles share 715 px. They are 79–95 px wide and unequal, because the grid is sized to the names.
    - *519 Sea Ranger SDF* wraps to three lines and the photographs are thumbnails.
    - It is the hero row of day one drawn as a contact sheet.

### Minors

11. **Esc out of the finder that Home's field opened leaves focus on `<body>`, not on the field.** A keyboard user has to start the Tab walk again.
12. **Reduced motion is not heard until a reload.** Turned on mid-visit, the placeholder rolled once more, from "ADV7" to "Sport 560". On a reload it held.
13. **The *Today* line wears the draft glyph,** a dashed circle that reads as a loading spinner, before *Today: 1 quote started and 1 given*.
14. **"Open the paper" and "Filed, with no quote yet."**
    - A dealer opens *the quote*.
    - *Filed* is said of a quote by the pill's label (*Quotes — 1 filed*) and of a person here, which `why.md` §2.8 already named.
15. **A draft card prints another customer's total beside their name.** *Being written* shows the customer and the frozen total, while the code's own header and *Who to call* say no other customer's total is set on this screen. One of the two is wrong.
16. **At 1280 × 800 the makers' head is not drawn,** so ten logos sit under the boats with no word saying they are doors to what Northside sells.
17. **At 834 × 1112 the pill still prints the keycaps `Ctrl` `K`.** That is a tablet, and most likely a finger.
18. **The finder's scope chip says *The desk* on day one,** when nothing is on the desk and every result is a boat or a part.
19. **Patrol 600's photograph is a boat-show stand with people and bunting,** where the other seven are on the water. It is the one frame that reads as stock.

## Would he be happy?

No. Day one would make him "not unhappy", and that is a real step. Then the first quote he raises in front of a stakeholder turns the dashboard into a narrow band and two half-empty boxes, with his name in thin type and a tab that says HelmLogic.

**The one thing to change:** keep day one's composition in every state, and let the work join it rather than replace it.

- The mark, at showpiece size on the water, never shrinks to a strip. Northside's real logo file is needed from the owner, and that is one question to him.
- The salesperson's people and drafts are one row sized to what they hold, under the find.
- The photographs and the makers keep their day-one size beneath.
