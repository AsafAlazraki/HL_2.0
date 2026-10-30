# What a quote that is not a boat needs from the build

Written 2026-10-30 by the New quote builder, for the next builder of `src/screens/configurator/`. The configurator was being rebuilt in the same tree at the time, so nothing in it was changed.

## What now reaches the build

New quote asks "What are you selling?". The boat makers come first. Under them, each place that sells on its own has a shelf: Motors, Factory Packages, Trailers, Parts & Accessories and Dealer Fit Packages. Each list on a shelf opens the same list, plate and act as a boat maker does. `startQuote` mints the quote with the line alone on it, exactly as it does for a boat, and opens `/quote/$id`.

The mint is the same one. Only `rootTableId` differs: `mot_yamaha`, `trl_dunbier`, `parts` and so on. Each one was measured in `src/screens/picker/mint.test.ts` (one line, that line's own price, the quote's own address). It was also driven through to the build at all six sizes in `e2e/flows/picker.spec.ts`.

## What the build does with one today

These were measured on the built app at 1440 × 900 (`picker-1440x900-09-motor-build.png`, `picker-1440x900-10-parts-build.png` in this folder).

- **Every chapter is called "The hull".** For a Yamaha T60LC, chapter 01 reads "The hull, 2 offered". It then lists boats the motor fits ("Formosa GRT 455 · Tiller +$30,100"), grouped by maker, with "Nothing from Highfield Inflatables is made for this boat" under each maker that has none. The quote's chapters are its view's blocks (`steps.ts`). For a motor root, those blocks are the boat tables that point at it, so the build is offering a boat for a motor. For a repower that is not a question.
- **"No other finish of this boat is on the price list."** This appears on a motor, a trailer and a part. The subject is said as a boat wherever the build names it.
- **The total's foot reads "Not chosen yet: hull and dealer fit."** on a motor, and "Not chosen yet: hull." on a part. The tally calls the subject's line "Motor" or "Dealer fit" (a $83 safety kit is coloured as dealer fit), and still waits for a hull.
- **A part with no picture** gets the stage's set-type cover ("PARTS & ACCESSORIES" on navy). Under it is the sentence "The price list names no picture for this boat, and no mark for its maker either". A part is not a boat.
- **A part's spec strip** shows "No · Discontinued" and "NSM · Supplier" as its first two specifications. Those are record fields, not things a customer asks about.

## What the build needs (the owner's words are the spec)

1. **The subject's kind decides its words.** Say "motor", "trailer" or "product" where it says "boat" and "hull" today. `nounOf` in `src/domain/quote/start.ts` already gives the word from the census ("motor", "trailer", "product", "rigging kit", "package").
2. **No chapter offers a boat on a quote that is not for one.** A quote rooted on a motor, trailer or part either has no related chapters, or has only the ones that hang off that subject: a motor's rigging and props, a trailer's options. It never has the boats that point at it. `flowPreview` already reads the same blocks. "Nothing is related to … yet, so this quote is the motor and the customer" is the sentence it writes when there are none.
3. **The tally does not wait for a hull** on a quote that has none. "Not chosen yet: hull" should only appear when the subject is a boat.
4. **The cover sentence names the subject's kind**, or says nothing about a maker for a list that has none.
5. **The spec strip leaves out record fields** such as discontinued and supplier on a part, as the picker's plate already does (`tileFacts`).

## One thing the picker does that the build may want

A place sold only with a boat (Parts & Accessories and Dealer Fit Packages, until Northside says otherwise) says so on New quote. The switch that changes it stands beside the sentence: `letQuote`, one step with its Undo, the same command as the place's Settings tab. The catalogue store writes behind by a short delay. A reload in the instant after the press can read the old setting. The e2e walk presses on in the same page for that reason.
