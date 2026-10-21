# Words

What every screen says, in the words a boat dealer uses at the desk with a customer beside him. Every fixer and every builder follows this page. If a word is not here, ask: would Northside's salesperson say it out loud to the customer? If not, it is the engine's word and does not reach a screen.

Written 2026-10-20 from a read of every route in `e2e/routes.ts`, at 1440 × 900 and 390 × 844, with a quote given to a customer, and from the screens' source.

## The rule

1. **Say the boat, not the app.** A sentence explains the boat, the price or the customer. It never explains how the app stores, reads or draws anything. "Saved as you go" is enough. "Kept in this browser exactly as it was given" is not needed.
2. **Say a fact once per screen, where it matters.** The total is in the masthead or on the finale card, not both in one view. A count is in the pill or in the head, not both.
3. **Honesty outranks brevity.** If something is not priced, refused or shown with a different motor, that fact stays. It is said once, in these words.
4. **The file's own text is data, not a name.** A part's description from the price list ("Mech Rigging Kit · 704 Binnacle Mount w 6Y8 2 Gauges, 5 m Harness, Cables & Filter") goes under "For the workshop". It is never the headline name in a chapter head, the finale or on the customer's paper. There, say what it is: "Rigging kit for the F115LB".

## Engine word → dealer's word

| Engine says | Dealer says | On the screen, before → after |
|---|---|---|
| row (of the price list) | line, or the thing itself | Finder: "Enter does what the row says" → "Enter opens it" |
| row (on a quote) | item | Build: "Cash · 3 of 4 lines" → "Cash · 3 of 4 items priced" |
| register | list (Quotes, Customers) | Data: "New register" → "New list" · shortcuts: "The quotes register" → "Quotes" |
| rung, price level, level | price (Cash price, Trade price) | Build: "Another price level re-prices every line" → "See the quote at Trade before you change it" |
| re-priced | new price | Cascade: "RE-PRICED · now priced at Trade" → "New price at Trade" |
| held (a line that did not change) | stays at Cash | Cascade: "HELD · no Trade price on the price file" → "Stays at Cash: no Trade price on the price list" |
| no price level is declared for Rigging Kits | Rigging kits have no price on the price list | Cascade, finale, paper rail |
| table, list (as a data object) | the price list, or its section by name ("Yamaha Outboards") | Data: "53 LISTS · 15,691 LINES" → drop it, or "The price list, 16 September 2026" |
| column | price name (Cash, Trade, Warranty) on sale screens. Only the price list editor (the sheet) keeps "column", because its headers are columns. | Build: "No Trade price · on the quote" stays. "at ${column}" → said once in the chapter head |
| field | the thing's name (name, phone, address) | Customers: "Change name", "Add phone" are right |
| record | details | Sheet: "Peek at the record" → "See its details" |
| frozen, copied onto | fixed when it was given | Paper rail: "No business name was frozen onto this quote" → "This quote was given before a business name was set" |
| re-root, re-roots | change the boat | Cascade: "Everything else … was paired with the 519" → "Everything else was chosen for the 519" |
| paired, pairs with, pairing | goes with this boat, made for this boat, fits | Build: "5 OF 2,238 PAIRED WITH THIS HULL" → "5 made for this boat" · Data: "pairs with 6 boats" → "fits 6 boats" |
| pairing list | what fits which boat | Data: "28 OF THEM PAIRING LISTS" → "28 say what fits which boat", as Entry already does |
| pack, packed, pack version, fingerprint (1qz08ne) | the price list's date | Home: "packed 16 September 2026" → "Price list of 16 September 2026". The fingerprint goes from every screen except a hover on Data. |
| minted | started | never reader-facing |
| ledger (image ledger, marks ledger) | none, never said | Entry: "This photograph is held in the image ledger…" → "No photograph of this boat yet." |
| provenance | where it comes from | Data: "No provenance note on this list" → drop it |
| sheet (meaning the price list) | the price list | Picker: "No material on the sheet" → "Not on the price list" |
| sheet (meaning the customer's quote) | the printed quote | History: "given, as printed on their sheets" → "given to customers" |
| the paper, the document | the printed quote | Finale: "Open the document" → "Open the printed quote" · "the paper prints it as not priced" → "the printed quote shows it as not priced" |
| the price file, the file, on file | the price list | Picker: "No prices on file" → "Not on the price list" · Build: "The price file recommends …" → "Recommended" on the tile |
| held, held copy, no photograph held | yet ("no photograph yet") | Customers, History: "NO PHOTOGRAPH HELD" → "No photograph yet" |
| filed, filed in this browser | saved, or nothing | Quotes: "1 QUOTE IS FILED IN THIS BROWSER, AND IT IS ON THIS SCREEN" → drop it, since the pill says "Quotes 1" |
| this browser | this computer | Entry already says "the name stays on this computer". Use that one phrase everywhere, only where it matters (Entry, an empty Quotes). |
| issued | given | Quotes band "ISSUED" → "GIVEN" · History chip "issued" → "given". Only the printed quote keeps "Issued 20 October 2026", as quotations do. |
| superseded | replaced | Quotes band "SUPERSEDED" → "REPLACED" |
| read-only, cannot be changed | given, a new version changes it | Quotes legend: "read-only for good" → "Given. Make a new version to change it." |
| event, events | things done | History: "1 QUOTE · 1 DAY · 4 EVENTS" → "1 quote today" |
| pick, picks | choice | History: "1 pick" → "1 choice" |
| addressed, address this quote | named for, put the name on | Build: "Address this quote" → "Put their name on it" · History chip "addressed" → "named" |
| chapter | the section's own name (Motor, Trailer) | Build: "every chapter narrows to what matches" → "Type a name or a code to find it" |
| hull (in prose) | boat | Build: "paired with this hull" → "made for this boat". "Hull length" and "Hull weight" stay, as the maker's specs say them. |
| variant | finish, colour | Sheet: "588 variants" stays on the price list editor only. On the sale say "finish" or "colour". |
| band, chip, slot, leaf | never said | Paper rail: "Slot 3" is the file's column. Print the prop and engine hole for the rigger and drop "Slot". |
| desk (Home's own name for itself) | Home | Lost: "The desk: who to call, the boats being written, and every maker as a door" → "Home" |
| door, act, the act at the foot of this panel | the button's own words | Quotes: "The act at the foot of this panel opens the quote" → drop it |
| matrix | the file's own label | Sheet head "Matrix · Highfield Inflatables": drop it, since the heading already says Highfield Inflatables |

## Words that stay, because a dealer says them

- **Cash, Trade, Warranty.** These are the price names. They are the price list's own column names and the dealership's own words. "Cash price", "Trade price", "at Trade".
- **Master Price File.** This is the name of the file the owner loads, on Entry and the Data screen. In a sentence it is "the price list".
- **Dealer fit, Rigging kit, Parts & Accessories, Factory package.** These are the price list's own section names, and the workshop's words.
- **Draft, given, a new version, replaced.** These are the four states of a quote.
- **The build.** Dealers say "build" of a boat put together, and Yamaha and the makers say "build your boat". "Back to the build" stays.
- **For the workshop.** This is the right place for part codes and the file's long descriptions.
- **Pre-delivery, registration, ATM, shaft, hp.** These are the trade's own words.
- **Model code, code.** These appear on the build's search ("a name or a code") and in the workshop notes. Never as the headline.
- **Column, cell, fill down.** These are used only on the price list editor (`/data/…`), where a person edits the price list as a spreadsheet. They never appear on a sale screen.

## One fact, one place: the places it is said

| The fact | Said once, here | And nowhere else on that screen |
|---|---|---|
| The quote's total | The masthead total on the build. On the finale card once the finale is open, and the masthead then shows no figure. | The finale chapter head, the cascade's "4 lines on this quote" card |
| What is not priced | One line under the total: "The rigging kit has no price on the price list, so it is not in this total." | "Not priced on this quote" ×3, the Dealer fit paragraph, the finale note |
| No photograph of this boat | "No photograph of this boat yet." as one sentence, the same on every screen. Where the price list's picture is refused: "The price list's photograph shows the side console, so it is left off." | The six phrasings now used across the picker, build, cascade, Quotes, Customers and History |
| How many quotes or customers | The pill's count | "1 QUOTE IS FILED…", "1 CUSTOMER · 1 QUOTED TODAY", "Every customer 1" |
| The price list's size | Not said on a sale screen. Said once, on Data. | Quotes, History and the pill's "Data 53" |
| The business's name | The crest, once it is Northside's mark | The "NORTHSIDE MARINE" eyebrow on Quotes, Customers, History, Data, Lost and the masthead |
