# Exposure: everything HL_2.0 can do, and where a person can do it

Measured on 2026-10-30. This is the tree as it stood that afternoon: `npm run build`, served by `vite preview` on port 5521 with `HL2_PREVIEW_PORT=5521`, through the real door ("Asaf", Load the Master Price File). It was driven with Playwright at 1440 × 900, and the touch finder was checked at 390 × 844. One draft was made by real presses: Home → Classic 260 → PVC → Start the quote. Nothing under `src/` was changed.

The owner's two sentences this answers: "the user should have all functionality exposed" and "managing what fits on a boat should be really easy to get to".

**How presses are counted.** A press is a click, a tap or an Enter. Typing a name is said as "+ typing" and is not counted as a press. Every count starts from the screen named, with the app loaded.

**How reach was found.** For each command, in `src/domain/**/commands.ts`, the other command files and the four stores, I grepped `src/screens/**`, `src/routes/**` and `src/app/**` (tests excluded) for a caller. Every route in the fitment paths was also walked in the browser.

## 1. The capability map

### Quotes (`src/domain/quote/commands.ts`, `swap.ts`, `start.ts`; `src/state/quotes.ts`)

| capability | command | reachable | screen | presses from Home |
|---|---|---|---|---|
| Start a quote on a boat | `mintQuote` | yes | Picker (`picker/mint.ts`) | 5: New quote, maker, model, material or colour, Start the quote (4 from a Home boat tile) |
| Start a quote on a motor, trailer, factory package or part on its own | `quoteDoors`, `subjectsIn`, `flowPreview`, `createQuoteFromView` (start.ts) | **no** | none. The picker asks only "Which boat is it?" (`Picker.tsx:337`) | n/a |
| Quote this again | `mintQuote` | yes | History | 1 to History, then the entry's act |
| A new version of a given quote | `newVersionOf` | yes | Quotes, the build | 3: Quotes, the quote, the act |
| Discard a draft | `discard` | yes | Quotes, History | 3 |
| Choose a motor, trailer or part | `addLine`, `swapLines` | yes | the build, its chapters | 1 for a draft on the desk, then chapter and tile, so 3 |
| Take an item off | `removeLine` | yes | the build, the cascade | 3 |
| Change the colour or finish | `refinish` | yes | the build's hull chapter | 3 |
| Price a line by hand | `setOverride` | yes | the build | 3 to 4 |
| Re-price the whole quote at Trade | `setLevel` | yes | the build ("See what Trade does"), then the cascade | 2 to 3 |
| Take the price list's new prices | `applyPriceChanges` | yes | the build | 2 |
| Who it is for | `setCustomer`, `linkCustomer` | yes | the build ("Who it is for"), Customers, History | 2 |
| Give the quote | `issue` | yes | the build's last chapter | 3 or more |
| Undo and redo a step on a quote | store `undo`, `redo` | yes | the build, the cascade, Customers | 1 from the step line |
| Price one item at Trade, the rest at Cash | `setLineLevel` | **no** | none | n/a |
| A line that is not on the price list ("Antifouling, $450") | `addFreeLine` | **no** | none | n/a |
| How many (2 lifejackets) | `setQty` | **no** | none | n/a |
| A discount, trade-in or other adjustment | `addAdjustment`, `updateAdjustment`, `setAdjustmentMagnitude`, `removeAdjustment` | **no** | none. The paper prints an adjustments band (`Document.tsx:994`) that no screen can fill | n/a |
| Take the customer off a draft | `unlinkCustomer` | **no** | none | n/a |
| A note on the quote | `setNote` (quote) | **no** | none. `setNote` in `places/Settings.tsx` is a React state setter, not this command | n/a |
| GST on a draft already open | `setTaxRate` | **no** | none (carried from Milestone 4, finding 1) | n/a |
| Who prepared it (title and phone) | `setPreparedBy` | **no** | none (carried from Milestone 4, finding 2) | n/a |

### The price list (`src/domain/catalogue/*Commands.ts`, `pricing/apply.ts`, `rules/review/fixes.ts`, `io/newFile.ts`; `src/state/catalogue.ts`)

| capability | command | reachable | screen | presses from Home |
|---|---|---|---|---|
| Change a figure or a word on a line | `updateCell` | yes | the sheet, Customers | 4: Data, plate, Open the list, line |
| Add a line, variant or pairing | `addRow` | yes | the sheet's details ("Add a variant to …", "Add a pairing to …"), Customers | 5 |
| Delete a line | `deleteRow` (with `deleteRowRadius`) | yes | the sheet's details, "Delete this line…" | 5, and a confirm |
| A new list | `createTable` | yes | Data ("New list"), Customers | 2 |
| A new column on a list | `addField` | yes | the sheet's More | 4 |
| Rename a column | `renameField` (with `renameFieldRefs`) | **no** | none | n/a |
| Change what a column holds | `retypeField` (with `retypeRadius`, `retypePlan`) | **no** | none | n/a |
| Point a link at another list | `retargetField` (with `retargetRadius`) | **no** | none | n/a |
| Delete a column | `deleteField` (with `deleteFieldRadius`) | **no** | none | n/a |
| Delete a list | `deleteTable` (with `deleteTableRadius`) | **no** | none | n/a |
| Write, change, delete a rule; refuses, warns or off | `addRule`, `changeRule`, `deleteRule`, `doRule` | yes | Rules | 2: Data, Rules |
| Switch a rule on or off | `switchRule` | superseded | `doRule` does it on Rules, so this is no gap | 2 |
| Adopt a pattern the file was noticed doing | `adoptObserved` (rules/adopt.ts) | **no** | Rules shows the three noticed patterns in its margin, with no act | n/a |
| Name which figure prices a list | `namePrice`, `letReach` | yes | Prices | 2: Data, Prices |
| Trade as a share of Cash | `sharePlan`, then `batch` | yes | Prices | 2 |
| Write a level plan | `levelPlanCommand` | no caller | Prices builds its own `batch` | n/a |
| Fix a case: re-band, name, price | `rebandCommand`, `nameTwinCommand`, `priceLinesCommand`, `nameLinesCommand`, `onePriceCommand` | yes | Review | 2: Data, Review |
| Name one line | `nameLineCommand` | no caller | Review uses `nameLinesCommand` for one line or many | n/a |
| Bring in a new price list | `newFileCommand` | yes | Shelf | 2: Data, Shelf |
| Save and restore Northside's work | `forgetAll`, `setShelf`, the envelope | yes | Shelf, Data | 2 |
| Undo and redo on the price list | store `undo`, `redo` | yes | the sheet, Data, Prices, Review, Rules, Settings, a maker's page | 1 from the step line |
| Northside's details, quote words, people, mark, look, Home | `changeOrg` | yes | Settings (`/manage`, Manage.tsx and Water.tsx) | 1: Home's "Arrange Home"; 2 to a line's editor |
| A maker's line, mark, photograph and colour | `dressPlace` | yes | a maker's own page (`/places/$id`), Settings tab | 3: Data, maker plate, "… own page"; then its tab |
| Organisation and quote terms, the old setters | `setOrganisation`, `setQuoteTerms` (people/organisation.ts) | no screen caller | only the backup import uses them. `changeOrg` is the live path | n/a |
| Switch on Quote for a list (Parts & Accessories, Dealer Fit Packages) | **no command exists**. `ModuleDef.capabilities` is written only at mint (`modules/mint.ts:290`) | **no** | none | n/a |
| A dealer's own picture on a colour, part, flooring or option ("added by …, date") | **no command exists**. The ledger takes no dealer entry | **no** | none. The sheet's Pictures door only shows pictures | n/a |
| Define what fits a maker's boats by horsepower, as a sentence | `readFit`, `compileFit`, `setClauseField` and the rest (fitment/fit.ts) | **no** | none. Fitment's "Open its horsepower" opens the boat's Min HP and Max HP cells on the sheet instead | n/a |

### Who is at the desk (`src/state/session.ts`, `prefs.ts`)

| capability | command | reachable | screen | presses from Home |
|---|---|---|---|---|
| Give a name at the door | `signIn` | yes | Entry | 0. The door is first |
| Someone else at the desk | `signOut` | **no** | none. `/sign-in` sends a named browser straight back to Home (walked) | n/a |
| A role | `setRole` | **no** | none | n/a |
| This computer's own spacing and motion | `prefs.set(LOOK_PREF)` | **no** (read and reset only) | Settings can "Use Northside's" (Water.tsx:1092). Nothing writes the preference | n/a |

### Derivations a person would want to see

| derivation | reachable | screen |
|---|---|---|
| What fits one boat, and why the rest do not (`fitment/plate`, `whole`, `boat`) | yes | Fitment, 3 or more presses (section 2) |
| The road load of boat, motor and trailer (`fitment/envelope`, `say`) | yes | the build, Fitment |
| What a re-price or a change of boat carries across (`quote/cascade`, `conflict`, `trailerFitment`) | yes | the cascade |
| The rule's reach before it is added (`rules/constraints` `previewConstraint`) | yes | Rules |
| What is wrong in the price list (`rules/review`) | yes | Review, Data's door |
| Prices nobody has chosen (`pricing/unchosen`, `worked`) | yes | Prices, the build, Home's note |
| Who to call (`people/owed`), the desk (`quote/steps`) | yes | Home |
| The diary (`quote/diary`) | yes | History, Customers, Home |
| What a delete takes with it (`deleteRowRadius`) | yes | the sheet's details |
| What a column or list delete or retype would break (`dependents`, `deleteFieldRadius`, `deleteTableRadius`, `retypeRadius`, `retargetRadius`) | **no** | its acts are unreachable |
| A narrowed list that explains itself and can be switched off (`catalogue/curation`: `curationChip`, `reachNote`, `toggleWords`) | **no caller** | the build's "Show all 209 in Yamaha Outboards" does the switching-off with its own code in goods.ts |
| What comes across on one trailer (`fitment/oneTrailer` `whatComesAcross`), the fan-out (`fitment/reading`), the starters (`rigReading` `readStarters`) | **no caller** | none |

### Settings in `docs/CUSTOMISATION.md`

| setting | reachable | where |
|---|---|---|
| Identity: the mark on paper and on water | yes | Settings |
| Colour: the brand colour and its scale | yes | Settings ("look.brand") |
| Pictures: the door's background, Home's hero, each place's cover | yes | Settings (`look.door`, `look.hero`), a maker's page (`dressPlace` hero) |
| Pictures: a cover for the printed quote | **not built** | no field in `OrgLook` (Milestone 5) |
| Density | yes, as spacing ("close · default · roomy") | Settings |
| Shape: corners and shadow | yes | Settings |
| Type: a face from a bounded list | **not built** | no field in `OrgLook` |
| Motion | yes | Settings |
| Words: Northside's own stages, roles and printed-quote sections | **not built** | no field. The printed-quote sections belong to Milestone 5 |
| Details, GST, how long a quote stands, deposit, terms, people | yes | Settings, "What prints" |
| Home: the order, what is hidden, what comes first | yes | Settings (`home`) |

## 2. What fits a boat: the paths, measured

The target: **two presses from any boat** to see what goes on it, and two more to change it.

| from | to SEE what fits this boat | to CHANGE what fits it | over target |
|---|---|---|---|
| **The boat in the build** (`/quote/$id`, motor chapter open) | 3 + typing. No link from any chapter. Data, then Fitment, then type the name and pick its version. The boat is not carried. | Motor: 7 or more (see the next row). Trailer and parts: 8 or more | yes, by 1 and 5 |
| **Fitment's plate** (`/fitment?boat=…`) | 0 | Motor: "Open what fits it" opens the motor list filtered to the boat (1), then open the boat's line (2), "Add a pairing to …" (3), type the motor into its cell (4+). The door is drawn only under the "inside the horsepower, and not made for it" group, so a boat without that group has no door. The offered tiles (F9.9SMHB on the Classic 260) are not pressable, so nothing can be taken off from here. Trailer and "Also made for it": **no door at all** | yes, by 2 or more |
| **The boat's line in the sheet** (`/data/boat_highfield?at=…`) | 3 + typing. The details show Min HP, Max HP and the rest, but have no link to Fitment and none to the boat's motor, trailer or parts lists. The Fitment room is not drawn on a list's own page | as from the build | yes, by 1 |
| **The maker's spread on Data** (`/data?at=boat_highfield`) | 1, but only for the maker's first boat ("What fits the Highfield Roll Up 230 KAM"). Any other boat: 3 + typing | Trailer: the maker's "NSM Custom Trailers" (1), "Open the list" (2), find the boat (+ typing), open its line (3), "Add a pairing" (4), type the trailer (5+) | yes, for every boat but one |
| **The picker** (`/quote/new?model=…`, the boat page) | 3 + typing, or 5 by maker, model and version. The boat page has no link; it shows length and colours only | as from Fitment | yes, by 1 to 3 |
| **Home** | 3 + typing (Data, Fitment, type, pick), or 5 by maker, model and version. Home's boat tiles open the picker, not Fitment | 7 or more | yes, by 1 to 3 |
| **The finder** (Ctrl K at a desk; the pill's Find at 390, the same list) | 3 + two typings. Type "fitment", press Enter, then type the boat in Fitment's own finder and pick. A boat's name sends you to the picker. "ADV9 motors" lists the 5 motors that fit, each opening the price list. "fits ADV9" and "what fits" find nothing | 7 or more | yes, by 1 |

**What the plate itself showed.**

- On the Highfield ADV9 (Dune) the plate reads "5 of 209 offered", "0 of 434 offered" and "7 of 3,814 offered".
- On the Classic 260 PVC it reads "1 of 209", "0 of 434" and "2 of 3,814".
- The build's motor chapter on the same Classic 260 draft offers the same one motor, the Yamaha F9.9SMHB at $3,448.

**What the walk saw on the way, outside its own question.**

- **Fitment's position is not in its address.** Choosing a maker, then a model, leaves the address at `/fitment`. This breaks "A position inside a screen is a search param". A Back or a reload loses the model.
- **Engine and file words reach the dealer:**
  - Fitment's chooser lists each version by its code ("Dune · HBADV9008").
  - Its model buttons read "ADV77 versions" as text, and a screen reader hears the same.
  - The motor list's head says "2,519 pairings · 11 columns" and its act says "Add a pairing to …". WORDS.md says "goes with this boat", not "pairing".
  - The sheet prints "Boat Module!R943 KZ..LD" (carried finding 4, still open).
  - Data's spread prints "Boat Module (5).xlsx, on its Boat Module tab".
- **The draft's head reads "QUOTE 20261030-01 · ".** The separator dangles because nobody is named yet.
- **Starting the Classic 260 put things on nobody chose:**
  - a motor, the Yamaha F9.9SMHB
  - two dealer-fit lines: Tube Covers, with no price, and a Fuel Tank at $99
  - the hull is $5,010 and the total is $8,557

  This is the owner's own finding 3 from the morning walk, still true on this tree.
- **"The finale" is still the last chapter's name.**

## 3. Where each unreachable capability belongs

Each goes to the most obvious existing screen. None of them needs a new settings page.

1. **Start a quote on a motor, trailer, factory package or part.** It belongs on New quote's first question, "What are you selling?", with the boat as the first and largest door. Use `quoteDoors`, which already exists. Switching Quote on for Parts & Accessories and Dealer Fit Packages needs a **new command** with an inverse (there is none). Its home is that list's own page, beside the line, mark and photograph it already sets. Record it in `docs/DECISIONS.md` with the owner's words.
2. **What fits a boat, seen and changed, in two presses.**
   - Add "What goes on this boat" to the build's hull chapter, the picker's boat page and the boat's details on the sheet. Each opens `/fitment?boat=<row>`. Data's spread already has the helper (`fitmentOf`).
   - The finder answers a boat's name with a second line, "What fits the …".
   - On Fitment's plate, every offered tile takes a press that takes it off, and every "not made for it" motor, trailer and part takes a press that puts it on. Each is one catalogue step with its Undo (`addRow` and `deleteRow` on the right list), and each has a keyboard and press alternative to any drag.
   - The trailer and "Also made for it" lines get the same doors as the motor line.
3. **A dealer's own picture on an option.** It belongs on the option's tile in the build and on the line's details on the sheet (the sheet's Pictures door already counts "46 of 67 models"). It needs a command that writes one ledger entry ("added by <name>, <date>") read by `src/data/pictures.ts` and carried in the backup.
4. **Quantity, a line not on the price list, a discount or trade-in, the quote's note, and one item at another price.** These belong in the build:
   - quantity on the item's tile
   - "Something not on the price list" in the Dealer fit chapter
   - the adjustment beside the total, where the printed quote already prints its band
   - the note in the chapter that names the customer
   - "Price this one at Trade" on the item
5. **GST on an open draft, and Prepared by.** Both belong in the build's naming chapter, on the line "Prepared by Asaf." (carried from Milestone 4, findings 1 and 2).
6. **Take the customer off a draft.** It belongs in "Who it is for" in the build.
7. **Someone else at the desk, and a role.** These belong on the pill's name, or on Settings' people, as "Not Asaf? Change who is at the desk", sending the browser to the door. Today `/sign-in` sends a named browser back to Home.
8. **Rename, retype, re-point or delete a column; delete a list.** These belong on the sheet's column head and in the More menu, which already offers adding a column. Each says its reach first; the radius functions already exist.
9. **Adopt a noticed pattern as a rule.** It belongs in Rules' margin, where the three patterns already stand.
10. **This computer's own spacing and motion.** It belongs in Settings' look, beside "Use Northside's", which can only reset today.
11. **A printed-quote cover picture, a type face, and Northside's own words for stages, roles and sections.** These are not built and have no field. The cover and the sections belong to Milestone 5's printed quote. The face and the words are for the owner to keep or retire from `docs/CUSTOMISATION.md`.
12. **Engine code with no screen and no need for one:** `switchRule`, `nameLineCommand`, `levelPlanCommand`, `setOrganisation`, `setQuoteTerms`, the curation helpers, `fit.ts`, `whatComesAcross` and `readFanOut`. Each is superseded or redundant. Retiring them is simpler than wiring them.

## 4. Where each is reached now (2026-10-30, after the reach builder)

Every row of section 1, with where a person reaches it on this tree. "The build's builder" marks a row whose home is the build, the picker or the paper, which the reach builder does not own: it is said here as it stands and passed on in the reach builder's report. Presses count as in section 1; typing is not a press. The counts here are counted off the controls drawn on this tree; Fitment, a boat's details in the price list, the finder, a place's Settings and Settings' people were driven at 390 × 844, 834 × 1112 and 1280 × 800, and no path was re-walked from Home with a stopwatch.

### Quotes

| capability | reached now |
|---|---|
| Start a quote on a boat (`mintQuote`) | New quote and the picker, as before. |
| Start a quote on a motor, trailer, package or part on its own | The engine can now be told a place sells on its own: a place's Settings, "How it is sold" (`letQuote`). The New quote door that offers it is the build's builder's. |
| Quote this again | History, as before. |
| A new version of a given quote (`newVersionOf`) | Quotes: "Make a new version" on the given quote's card, 2 presses from Home (Quotes, the act). The given quote stays With the customer until the new version is given. |
| Discard a draft (`discard`) | Quotes: "Discard", then "Discard it", on the draft's card, 3 presses; History, as before. |
| Choose a motor, trailer or part; take one off; finish; price by hand; re-price at Trade; new prices; who it is for; give; undo | The build, as before (the build's builder). |
| Price one item at Trade (`setLineLevel`), a line not on the price list (`addFreeLine`), how many (`setQty`), an adjustment, take the customer off (`unlinkCustomer`), a note (`setNote`), GST on an open draft (`setTaxRate`), Prepared by (`setPreparedBy`) | Not reached by the reach builder: each belongs in the build (section 3, items 4 to 6), the build's builder's. |

### The price list

| capability | reached now |
|---|---|
| Change a figure or a word (`updateCell`) | The sheet, as before. |
| Add a line, variant or pairing (`addRow`) | The sheet, as before; and Fitment now writes a pairing itself: "Put it on" in Show all, 3 presses from a boat's plate (Show these, the line's Put it on). |
| Delete a line (`deleteRow`) | The sheet, as before. Fitment's "Take it off" does not delete: it marks the pair taken off, with Undo. |
| A new list; a new column | Data and the sheet's More, as before. |
| Rename, retype, re-point or delete a column; delete a list | **Still not reached.** Their home is the sheet's column head and More (section 3, item 8); not built in this round. |
| Write, change, delete, switch a rule | Rules, as before. |
| Adopt a noticed pattern (`adoptObserved`) | Reached by another way already: Rules' margin offers "Say it as Northside's" on each noticed pattern, which opens it as the next rule to read before it is added. `adoptObserved` itself is superseded, like `switchRule`. |
| Name which figure prices a list; Trade as a share of Cash | Prices, as before. From a quote, Prices now keeps a standing "Back to quote <reference>" over its eyebrow, which survives a reload. |
| Fix a case on Review; bring in a new price list; save and restore | Review and Shelf, as before. |
| Northside's details, words, people, look, Home (`changeOrg`) | Settings, as before. |
| A maker's line, mark, photograph and colour (`dressPlace`) | A place's own page, as before. |
| Switch on Quote for a list | **Reached.** A place's Settings tab, "How it is sold": Only with a boat · On its own too, one step with its Undo (`letQuote`). Reached through Data, the place's spread, its own page, its Settings tab. |
| A dealer's own picture on an option (`addOwnPicture` and its two siblings) | **Reached outside the build.** A line's details in the price list (a colourway, a motor, a trailer, a part, a package, an oil) draw the kit's `AddPicture` where the picture stands. In the build and the catalogue, the build's builder's. |
| What fits a maker's boats by horsepower, as a sentence (`fit.ts`) | Not reached, and not needed: Fitment changes what fits one boat line by line, and the horsepower stays the boat's own figure on the sheet. |

### Who is at the desk

| capability | reached now |
|---|---|
| Give a name at the door (`signIn`) | Entry, as before. |
| Someone else at the desk (`signOut`) | **Reached.** Settings, Who prepares it: "Not Asaf? Change who is at the desk", which lets the name go and opens the door. Reached from Settings, under the people's head. |
| A role (`setRole`) | Retired, not wired: the switch on Settings' people, "May change prices and settings", already says who may (docs/DECISIONS.md). |
| This computer's own spacing and motion (`LOOK_PREF`) | **Still read and reset only.** Its home is Settings' look (section 3, item 10); not built in this round. |

### Derivations and settings

| derivation or setting | reached now |
|---|---|
| What fits one boat, and why the rest do not | Fitment, now 1 or 2 presses from a boat (section 2 below). |
| What a column or list delete would break | Still unreached, with its acts. |
| The curation helpers, `whatComesAcross`, `readFanOut`, `readStarters` | As section 3 item 12: superseded or redundant. |
| A printed-quote cover picture, a type face, Northside's own words for stages and sections | Not built (Milestone 5's paper, and the owner's to keep or retire). |

### What fits a boat, measured again

| from | to SEE what fits this boat | to CHANGE what fits it |
|---|---|---|
| The boat's line in the sheet | **1**: "What goes on this boat" in its details, landing on `/fitment?boat=<row>`. | Motor, trailer, parts: 1 to the plate, then "Take it off" on the tile (2), or Show these and "Put it on" (3). |
| Fitment's plate | 0 | Take one off: **1**. Put one on: **2** (Show these or Show all, then Put it on). Trailers and "Also made for it" carry the same presses. A motor over the boat's horsepower is refused with that sentence. |
| The maker's spread on Data | 1 for its first boat (as before); any other boat 2 from its line in the sheet. | As from the sheet. |
| A boat maker's own page (`/places/$id`) | **2** for a model with one version: "What goes on its boats" opens Fitment on the maker's models (`?maker=`), then the model; 3 for a model with versions. | As from the plate. |
| The finder (Ctrl K, or Find on the pill; Home's find opens the same) | **1 after typing**: a boat's name answers "What fits the <boat>" as its second line; "what fits ADV9", "fits the SP560" or "what goes on the 519" puts it first, where Enter opens it. | As from the plate. |
| Home | **2 after typing**: Home's find, then the finder's line. A Home boat tile still opens the picker, whose boat page's way to Fitment is the build's builder's. | As from the plate. |
| The build, the picker | The build's builder's (section 3, item 2). | |

Fitment's position is now in its address: `?maker=` and `?model=` while a boat is being chosen, so a reload keeps the maker and the model open.
