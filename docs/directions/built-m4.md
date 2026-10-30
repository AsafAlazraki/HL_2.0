# Milestone 4, built, walked as a sales manager would (2026-10-30)

Walked on the tree at `d328025` plus the uncommitted Settings close (`src/screens/manage/*`, `src/domain/northside/pixels.ts`, `colour.ts`), built with `npm run build` and served by `npx vite preview --port 5361 --host 127.0.0.1`. Driven with Playwright at 1440 × 900, 390 × 844 (mobile emulation, touch) and 1920 × 1080, every step screenshotted and read. Screenshots are under `docs/directions/<screen>/built/m4-*.png` (`walk-390-*` and `walk-1920-*` are the whole sale at those sizes, numbered in order). The printed quotes are `docs/directions/manage/built/529.pdf` (as given), `529-after-phone-change.pdf` and `529-after-restore.pdf`.

Every value typed is a walk value: ABN 51 824 753 556 (the register's published example the e2e uses), "Address typed for this walk, Brisbane QLD", 07 3265 1022, walk@example.com, GST 10, 30 days, Asaf as "Sales manager" on 0400 111 222, customer "R. Kelleher". The edited price file is `Boat Module (edited).xlsx`, written from the pack's own Stacer rows with Cash raised by $500 on the 509 Assault Pro (Tournament), 529 Assault Pro (Tournament) and 529 Outlaw (Side Console); a second copy raised them by $1,000.

## The gate

| step | result | time |
|---|---|---|
| `npm test` | green: typecheck, lint 0 warnings, prettier clean, **280 files / 4,423 tests passed**, check 17 rules no failures | **6 min 57 s** (vitest 349.8 s). CLAUDE.md says about 110 s idle, 145–155 s loaded. Measured here with the owner's Chrome and Edge open and nothing of the repo's running. |
| `npm run build` | built, one warning (chunks over 500 kB: `ui` 716 kB, `pictures` 586 kB) | 8.1 s |
| `npm run e2e` alone | **2,009 passed, 10 failed, 585 skipped** of 2,604 | **2 h 46 min** (165 min 52 s), not "about 25 minutes" |
| re-run of the 10 alone (`--last-failed --timeout 120000 --workers 1`) | **1 passed, 9 failed** | 1 min 36 s |

The 10 red, and whose they are:

1. **`e2e/flows/data.spec.ts:469` "every room behind Data is one press from its head", at all six sizes — the app's, not the machine's.** It expects 5 links and reads 6. Milestone 4 put Places and Shelf behind Data (`src/app/ways.ts` now lists Places, Rules, Fitment, Review, Prices, Shelf) and the spec still counts Milestone 3's five. Failed again alone. Not edited here.
2. **`e2e/rulers/fixture.spec.ts:364` and `:422`, and `e2e/rulers/refusal.spec.ts:180` "the board", at desktop — the app's.** "The primitives declare intent="slot" and the refusal board does not know which ground it is drawn for. Say so in DRAWN_FOR (e2e/rulers/measure/refusals.ts)". Settings added `Button intent="slot"` (DECISIONS 2026-10-29) and nobody told the refusal board, so **the refusal ruler has not read a single refusal on this tree.** Failed again alone.
3. **`e2e/rulers/cut.spec.ts:15` "cut — customers-book" at phone-landscape — the machine's.** A 120 s timeout inside `settle()` waiting on fonts and images; passed alone in the re-run.

## The milestone's exit, walked

| step | 1440 | 390 | 1920 |
|---|---|---|---|
| Land cold, name, load the file | works; the tab says **"HelmLogic"** until the app replaces it (`index.html`'s `<title>`) | works | works |
| /manage: Northside's details (ABN, address, phone, email, GST 10, 30 days) | each line opens where it prints and keeps; a mistyped ABN is refused with its reason ("These eleven digits do not add up the way every ABN's do…") | works, but **the page scrolls sideways (410 px wide) once the address is filled** | works |
| Set its mark | a white-ink file is refused with the reason and the measured 1.00 : 1; the dark file is kept and the letterhead says "Northside's own file, northside-marine.png" | not walked (file chooser) | not walked |
| Set a brand colour and see the whole app change | the stage wears it first ("Changed, not kept"), Keep writes it, and Home's water, the pill, Data, the picker head and Quotes all turn; Places keeps its own grounds by design | works | works |
| A colour that breaks contrast | **refused** with "White on #FFEA28 is 1.23 : 1, under the 4.5 : 1…" and the nearest that pass (#A36B0A, #837819 at 4.50 : 1); nothing is staged. **The refusal sentence itself measures 2.18 : 1 on the navy water** (pixels, 1440), 1.99 : 1 at 390. Pressing a nearest stages it in place of the *current* colour. | refused, same sentence, same grey | refused |
| Add a person | "Keep Asaf as a person" with title and phone; "May change prices and settings" on | works | works |
| /places: open a brand, see its mark and hero, choose its cover | Stacer opens on its own livery; Settings offers only Stacer's 11 photographs; choosing the 481 SeaMaster says "Stacer stands on its Stacer 481 SeaMaster on the water. Undo" and the card and the opened page wear it | works; **the chosen tile drew blank** in the screenshot (its picture had not painted) | works |
| Raise a quote, issue it as that person | Places → "Quote a Stacer" → the picker on Stacer → 529 Assault Pro · Tournament → Start the quote → name → Give. The 529 needed nothing priced by hand. | works | works |
| Read the letterhead and "Prepared by" | "ABN 51 824 753 556 · Address… · 07 3265 1022 · walk@example.com", "Issued 30 October 2026", "Valid until 29 November 2026"; Prepared by Asaf, Sales manager, 0400 111 222 | same | same |
| Change Northside's phone; the issued quote does not change | **holds**: the given quote's text is identical after a reload (checked at all three sizes) | holds | holds |
| /shelf: bring in the edited file, read the diff, Apply, Undo | "Boat Module (edited).xlsx is read. Nothing is written yet." · 3 change · 0 new · 0 can't place · "15,688 of 15,691 lines stay exactly as they are" · each line with its row, old and new Cash and +2%. Apply moves the picker's 529 to $29,030; Undo puts all three back in one step (checked with the second workbook: $29,530 applied, $29,030 after Undo). **No issued quote moved** (text identical). The Undo is gone once you leave the shelf. | works | works |
| Back up, forget everything, restore | the copy downloads ("Northside Marine copy 2026-10-30 0701.json", 10.5 MB), Forget returns to the door, the copy comes back: quotes, customer, settings, person, colour and the Stacer cover are all back | same | same |
| …and the issued quote is the same | **BROKEN.** After the restore the given 529 prints **no ABN, address, phone, email or valid-until date, and "Prepared by Asaf" alone, without title or phone.** The copy file carries `letterhead` and `preparer` on the quote; `normQuote` in `src/domain/io/envelope.ts:1440-1560` does not read them back. The restore page promised "A quote comes back exactly as it was given". | broken the same way | broken the same way |
| Walk the whole sale again | a new 509 Assault Pro quote prints today's details (07 3000 0000, $29,030 hull after the first apply) and its preparer; the 529 Outlaw cannot be given until its rigging kit is priced (a true refusal) | works | works |

One more thing moved on a given quote: **its colour.** Changing the brand colour after giving recolours the issued paper's rules and reference (amber to blue measured on the letterhead's rule). The text does not move; the look does.

## The 529 on paper: quote-spec §13, items 1, 14, 15, 16 and 28

Printed from the issued 529 Assault Pro (Tournament), 20261030-01, with Chromium's print (`page.pdf`, A4 from the page's own `@page`): `docs/directions/manage/built/529.pdf`, 2 pages, read with the Read tool.

| item | verdict | page and what it shows |
|---|---|---|
| 1. The mark or name is the first thing on page 1; "not been named" nowhere | **pass** | p.1: Northside's mark heads the page; the phrase is nowhere. (The mark is an image only, so p.1's text layer has no business name; p.2's running head extracts as "NORTHS IDE MARINE". That is item 21's business, not marked here.) |
| 14. Issue date present; valid-until present once validity is typed | **pass** | p.1: "Issued 30 October 2026", "Valid until 29 November 2026" (30 days typed on /manage) |
| 15. Dealership's phone, address and email, and the salesperson's name and contact details | **pass as given; fail after a restore** | p.1: "Address typed for this walk, Brisbane QLD · 07 3265 1022 · walk@example.com"; Summary: "Prepared by Asaf / Sales manager / 0400 111 222". `529-after-restore.pdf` p.1 carries none of them. |
| 16. The ABN | **pass as given; fail after a restore** | p.1: "ABN 51 824 753 556"; absent from `529-after-restore.pdf` |
| 28. Editing settings after issue leaves the issued PDF's text unchanged | **pass for an edit; fail across a backup** | `529-after-phone-change.pdf` reads word for word as `529.pdf` (still 07 3265 1022). A backup and restore of the same computer drops the letterhead and preparer. The colour of its rules does move with a later brand colour. |

Also seen on the paper: once Northside's contact line is filled, **the reference breaks across two lines** ("QUOTATION · 20261030–" / "01") on p.1, in the PDF and on screen at 1440 and 1920. With no contact line it fits.

## Each screen, at each size

**Entry (`/sign-in`).** 1440: the flag, the 481 SeaMaster at dusk, one card and one door; cold it reads well and the door goes straight to Home in about a second. 390: the photograph sits above the card and the door is a full-width band; nothing cut. 1920: the same composition with more water. The only fault is the browser tab, which reads "HelmLogic" until the script runs, the one place the old product's name still shows.

**Home (`/`).** 1440: the mark large on the water, the greeting, the find and New quote, then the boats and the makers. With the ochre kept, the water turns ochre and still reads. With work, the two given quotes stand on the water as cards. 390: the same stack, with the cards full width; "4 price questions wait for you…" is a dense paragraph on the water. 1920: the composition holds and the makers' row fills the width. "Arrange Home" opens Settings at `?at=home`, but at 390 it lands at the top of the page, not on Home's section, which is 4,360 px down.

**Settings (`/manage`).** 1440: paper on the left, water on the right, the pill on the seam. The letterhead is the real component and each empty line is a dashed box that opens where it prints. That is the best idea in the milestone, and it works. Faults: the colour refusal is said in grey at about 2.2 : 1 on the navy (the one sentence the step exists to say, unreadable at a glance); pressing one of "the nearest that pass" stages it and the pressed chip's own text measures 1.7 : 1; the letterhead's note says "No quote has been started on this computer yet" when a quote had been given (the walk had given one: the note only counts drafts). 390: two tabs head the page, "What prints" white and "What shows" navy, and the navy one reads as the chosen tab when it is not. **The page scrolls sideways (410 of 390 px) once the address and the mark's file name are in** (`.mg-group__head` / `.mg-group__say` and `.mg-sheet`), and the letterhead's right column ("QUOTATION · Dated the day it is given") is cut at the edge. 1920: everything fits. The step names ("Corners", "Shadow"…) read; "Templates are not built yet" stands in the foot's row as a line of the app talking about itself.

**Places (`/places`, `/places/$id`).** 1440: twenty-five saturated cards, boats on navy with their own photograph and a caption that always names the model; one counted plate for the boats. Choosing a cover is one press with an Undo, and the opened page and the card both wear it. 390: the cards stack and the caption pill sits over the photograph's top right, readable. Opened, the livery comes first, then Goes with, then the tabs. The chosen photograph tile drew blank in the Settings tab at 390. 1920: four boat cards a row; the counted plate fills the eighth slot. Places and Data are the two registers of the same 25 lists, and both are behind the same Data door: one is cards on colours, the other plates and rows. They are different shapes, but a manager will ask why there are two.

**The picker (`/quote/new?brand=`).** Reached from "Quote a Stacer" with Stacer lit. 1440: finding "529 Assault" leaves one card with its photograph and $28,530 (or $29,030 while the edited file is applied); the panel says hull, weight and min HP and "Start the quote". 390 and 1920 hold. Nothing new in this milestone; it worked every time.

**The build (`/quote/$id`).** 1440: four chapters priced, Who it is for, the finale with "Give it to the customer" and the sentence under it. 390: chapters stack; the finale's total is large and the give is reachable without hunting. 1920: the photograph frame is wide and the chapters sit right; fine. Prepared by on the build says "Prepared by Asaf." with no title, while the paper says "Asaf, Sales manager, 0400 111 222". The 529 Outlaw refused the give until its rigging kit was priced, with a true sentence and both ways out ("Put a price on this line", "Choose on Prices").

**The printed quote (`/quote/$id/document`).** 1440: the letterhead carries Northside's line, the reference, issue and valid-until, the cover picture, the specs, then the summary with Prepared for, Prepared by and the total. The desk note beside it says "The letterhead: Northside Marine's own mark, from northsidemarine.com.au." even when the mark printed is the file Northside uploaded on Settings. 390: the sheet becomes a column and the reference fits. 1920: the reference breaks over two lines ("20261030–" / "01") as it does on paper. After a restore: the letterhead is the mark, the reference and "Issued…", nothing else.

**The shelf (`/shelf`).** 1440: Northside's mark, "Northside's work, kept safe.", one band for a new file, Save a copy as a counted inventory, Bring back a copy, then Starting again with two carmine cards. Reading a workbook, the change sheet, Apply and Undo all said exactly what they did. 390: the band and inventory stack and the change sheet's lines wrap to two rows each (name, then old → new, Cash, +2%), readable. 1920: centred at about 980 px wide, comfortable. Two wrong sentences: the restore page promises "A quote comes back exactly as it was given" and "The copy's 1 quote join them, each as it was given", and neither is true (letterhead and preparer dropped; "1 quote join" is also a grammar slip).

**Quotes, Customers, Data, History.** They were not changed by this milestone and were looked at at each size. All three sizes wear the kept colour and nothing cuts. Customers showed R. Kelleher back after the restore with the given quote. Data's head now carries six rooms (Places … Shelf, with "37 to settle"), which is what fails its own spec.

## Where it breaks, confuses, does nothing, or repeats a shape

- **Breaks:** a backup and restore changes what an issued quote prints (letterhead and preparer dropped, `normQuote` in `src/domain/io/envelope.ts`). This is a blocker for "a downloaded quote a dealer would proudly send": the same quote number re-printed after a computer change says something else.
- **Breaks:** Settings scrolls sideways at 390 once Northside's details are filled.
- **Breaks (gate):** the refusal ruler cannot run (`intent="slot"` undeclared), and the Data rooms spec counts five.
- **Confusing:** the colour refusal is said too faintly to read; "What shows" looks chosen at 390; Settings lives under Home's door while its own foot lists Data's six rooms; Arrange Home lands at the top at 390; the Shelf's Undo disappears once you leave the page; the desk note credits the website for a mark Northside uploaded; changing the colour after giving recolours a given quote.
- **Does nothing:** nothing pressed did nothing. "Templates are not built yet" in Settings' foot is a sentence where a control would be.
- **Same shape twice:** Data's head row of rooms and Settings' "Everything else" row are the same six links in the same order on two screens. Places and Data are two registers of the same lists behind the same door.
