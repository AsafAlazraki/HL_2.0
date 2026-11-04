# Settings, verify 1: data round, 2026-11-04

This was checked by a fresh verifier on commit `abb3b9da`, on its own build (`e2e/out/dist-6304`, port 6304, output `test-results-6304`). Every walk went through the real door with the real Master Price File. The screenshots are in `verify-1/`:

- **`NN-*`** frames come from the builder's `manage-shots.spec.ts`, re-run here with `HL2_MANAGE_SHOTS=verify-1`;
- **`v-*`** frames come from this verifier's own probe, which drove the real app at all six sizes.

The server was stopped afterwards.

## Gates re-run
- `e2e/flows/manage.spec.ts`: **30 passed** across the six sizes, including the deposit printed to the cent at 10%, and still 10% after Settings changed it to 25% and the page reloaded.
- `manage-shots.spec.ts`: **18 passed**:
  - `sideways` was false at every size;
  - 0 page errors;
  - the overlap ruler found 0 overlaps;
  - the toast was over the dock in none of the six sizes.
- `vitest` on `src/screens/manage` and `src/domain/northside`: **86 passed**. `tools/check.ts` reports nothing in this round's files.

## Jobs

| Job | State | Evidence |
|---|---|---|
| J1: ABN, address and phone | DONE | Three things measured:<br>• The refusal reads "An ABN is eleven digits, and this is 5."<br>• A wrong checksum is refused with its reason.<br>• An 81-character address wraps inside the sheet at 390: nothing outside it, no sideways scroll (`v-letterhead-set-390x844`). |
| J2: mark on paper | DONE | "the mark from Northside's own site, in dark ink, up to 20 mm tall", with one "Choose a file" (`v-mark-editor-*`). |
| J3: GST, validity, deposit, terms | DONE | Four things measured:<br>• GST 150 and "ten" are refused with "A GST rate is a share from 0 to 100…".<br>• Terms keep their breaks (`white-space: pre-line`, blank line kept).<br>• A fixed deposit of abc, 0 or -50 is refused with a sentence (`v-deposit-fixed-refused-844x390`).<br>• A share of 101 is refused. |
| J4: people | DONE | Name and Title stand level at every size, for example 1440: both top 524, h 36. Asaf is kept with a title, and a second person is added (`09/11-*`). |
| J5: set apart | DONE | The refusal stands (`10-*`) and is gone after a second person who may is added. The spec asserts a count of 0. |
| J6: someone else at the desk | DONE | The press lands on `/sign-in` at all six sizes (`v-change-desk-*`). |
| J7: colour | DONE | Three things measured:<br>• #FFEA28 is refused with 1.23 : 1 and two nearer colours.<br>• "From the mark" writes #0066CC into the field.<br>• The staged Keep is in view at every size: 844x390 Keep at y 330–366, 390 at 728–764. |
| J8: photograph | DONE | It is staged on the stage, and the toast lifts above the dock (390: toast 579–627, dock 643–776). Only held maker heroes can be chosen; see L5. |
| J9: Home's sections and first boat | DONE | "First: Haines Signature Fisher 525F". There are 0 doubled maker names at every size (`17-*`). |
| J10: shape | DONE | A specimen above the steps shows corners, shadow and spacing (`18-shape-deep-*`). |
| J11: letterhead on a draft | DONE | "Drawn on 20261104-01, a draft for nobody yet…" (`21/22-*`). |
| J12: the whole quote | PARTLY | At a desk the first and last pages are drawn at two thirds of A4, and the deposit prints under the total (`24-terms-lit-*`). But the pages are `position: static`, at the paper's foot. With a line open, the lit part is never in the window. In a hand it is a door only. |
| J13: everything decided | PARTLY | "Decided elsewhere" shows six counts, each with a door (/levels, /review, /catalogue ×3, /data). Only the empty state was walked here: every count was "None". |
| J14: from Home's Arrange | DONE | The spec asserts Home's heading in view (`16-at-home-*`). |

What J12 measured with a line open, at a desk:

| Size | Line open | Editor (y) | Lit part (y) | Window height |
|---|---|---|---|---|
| 1280 | deposit | 458–784 | 1926 | 800 |
| 1440 | deposit | 578–884 | 1983 | 900 |
| 1440 | ABN | — | 1458 | 900 |
| 1920 | deposit | — | 2163 | 1080 |

## Missing items

| Item | State | Why |
|---|---|---|
| L1: the whole printed quote, sticky, lit | PARTLY | It is drawn and lit, but neither sticky nor in view while a line is set (see J12). |
| L2: a stage that follows the choice, and a dock | DONE, with a fault | The dock and the toast are clear of each other at all six sizes. But at 1280 a slice of the page shows above the stage. At the foot of the page the stage stands at y −37 to 330 (`v-foot-1280x800`), so its top is cut under the pill. |
| L3: the deposit as a rule | DONE | It is a share or a fixed figure, worked on the draft: "whose total is $61,700, the deposit prints as $6,170". It is frozen on the given quote. |
| L4: one index of decisions | DONE | It has the h1, "Last changed: The phone, by Asaf today at 6:16 pm", and "Decided elsewhere". |
| L5: Northside's own photographs | NOT | Declared not built (DECISIONS). |
| L6: one picture grid | DONE | Each photograph is drawn once, with Home and Sign-in presses. |
| L7: a sticky index in a hand | PARTLY | It stands at the window's head. At 390 the strip is 794 px wide in 390, and on an ordinary scroll the lit part is not brought into view. Measured:<br>• reading Pictures, the lit "Colour" stood at x 367–431;<br>• reading Shape, the lit "Home" stood at x 568–627.<br>The last word in view is cut at the right edge, for example "Co" in `01-rest-390x844`. |
| L9: a preview of shape | DONE | The specimen. |
| L10: colour from the photograph, and a picker | DONE | "Pick" stands beside the hex field. A third card appears once a photograph stands on Home. |
| L11: people with reach | DONE | Email under Prepared by, "No quote prepared on this computer yet", and the switch's line. |

## The perfect bar, by size

### 390 × 844: NOT
- The index's lit part runs off the strip, and the strip cuts its last word ("Co").
- Two 11 px lines remain on the letterhead strip on screen: `.doc-cover__kind` "Quotation" and `.doc-cover__when`.
- The page is 5,958 px at rest and 8,319 px after the walk.

### 844 × 390: NOT
- The pill (8–50) and the index (68–120) take 120 of 390 px.
- With a change staged, the dock (265–378) leaves 145 px for the choices, and the stage is out of view (y −340 to 113).
- In the 50–68 band between the pill and the index, scrolled content shows cut, for example the maker logos (`13-colour-staged-844x390`).
- The toast covers "Any other colour" and Pick (x 540–828, y 326–374).

### 834 × 1112: NOT
- The toast stands over "Any other colour" and Pick (x 530–818, y 1048–1096).
- The same strip shows between the pill and the index (a Stacer 519 card name at y 52–64).

### 1280 × 800: NOT
- The 0–80 band above the sticky stage shows cut cards and chips (`v-scrolled-home-1280x800`, `18-shape-deep-1280x800`).
- At the page's foot the stage is cut at y −37.
- The Undo toast stands over Motion (`18-*`) and over the colour field (x 976–1264, y 736–784).
- The lit page is never in view.

### 1440 × 900: NOT
- The same 50–80 band shows cut colour cards (`09-person-open-1440x900`, `14-picture-staged-1440x900`).
- The index wraps to two rows, with Shape and Elsewhere alone on the second (`01-rest-1440x900`).
- The lit page is never in view.

### 1920 × 1080: NOT
- The same band above the stage.
- The lit page is never in view.

### At every size
- No sideways scroll.
- Each refusal is a sentence where it is refused.
- Keyboard: Tab reaches the bar and then the index. Enter on the staged Keep keeps it (staged count 0).
- The long name "Maximilian Featherstonehaugh-Montgomery" wraps with nothing clipped (`v-long-person-*`).
