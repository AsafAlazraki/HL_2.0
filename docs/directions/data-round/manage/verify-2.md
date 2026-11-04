# Settings, verify 2: data round, 2026-11-04

A fresh verifier checked this on commit `b903eb84`, on its own build (`e2e/out/dist-6304`, port 6304, output `test-results-6304`). Every walk went through the real door with the real Master Price File. The server was stopped afterwards.

The screenshots are in `verify-2/`:
- **`NN-*`** frames come from the builder's `manage-shots.spec.ts`, re-run here with `HL2_MANAGE_SHOTS=verify-2`.
- **`v-*`** frames come from this verifier's own probes, at all six sizes.

## Gates re-run
- **`manage-shots.spec.ts`: 24 passed.** Across every state at every size:
  - no sideways scroll;
  - 0 page errors;
  - 0 overlaps;
  - the toast was over the dock at no size.
- **`manage.spec.ts` with the rulers `-g "manage|Settings"`: 99 passed, 27 skipped.** The overlap ruler found 0 in `manage` and `manage-line` at rest, at 540 px, one window down, at 1,620 px and at the end.
- **`vitest` on `src/screens/manage` and `src/domain/northside`: 11 files, 96 tests passed.** `boatNamed.test.ts` and `stamped.test.ts` now exist.

## Jobs

| Job | State | Evidence |
|---|---|---|
| J1: ABN, address, phone | DONE | "An ABN is eleven digits, and this is 5." stands under the field at all six sizes, and so does the checksum refusal. An 82-character address leaves 0 elements outside the sheet at all six sizes, with no sideways scroll (`v-address-*`). |
| J2: the mark | DONE | "…the mark from Northside's own site, in dark ink, up to 20 mm tall…", with one "Choose a file" at all six sizes (`v-mark-editor-*`). |
| J3: GST, validity, deposit, terms | DONE | A GST rate of 150 is refused: "A GST rate is a share from 0 to 100, as in 10 for 10%." The terms keep their blank line on the page itself (`v-terms-kept-lit-*`). The deposit is a share or a figure (`06/07/08-*`). |
| J4: people | DONE | Name and Title stand level at 1440 (`09-person-open-1440x900`). Asaf is kept, and a second person is added (`11-*`). |
| J5: set apart | DONE | The refusal now stands under the switch it refuses, at 390: switch 392–422, sentence 466–505. It is gone after a second person is added (`11-*`). At 1440 the sentence ends at y 903 in a window 900 tall (see the gaps). |
| J6: change who is at the desk | DONE | The press lands on `/sign-in` at all six sizes. |
| J7: colour | DONE | #FFEA28 is refused with 1.23 : 1 and the two nearest colours (`12-*`). "From the mark" writes #0066CC into the field. At 844 × 390 the staged dock is 326–378 with Keep in view (`13-*`). |
| J8: photograph | DONE (held heroes only) | It is staged and kept. At 390 the toast stands at 579–627, above the dock at 643–776 (`14-*`). Northside's own photographs: NOT, see L5. |
| J9: Home's sections and first boat | DONE | "First: Haines Signature Fisher 525F" (`17-*`), with no "Signature Signature". |
| J10: shape | DONE | The specimen stands above the steps (`18-*`). At a desk, at the page's foot, it stands hidden under the stage (see the gaps). |
| J11: the letterhead on a draft | DONE | "Drawn on 20261104-01, a draft for nobody yet" (`21-*`, `23-*-834x1112`). |
| J12: the whole quote | DONE at a desk, a door in a hand | The lit part is inside the sticky window for every line at 1280, 1440 and 1920 (see the table below). In a hand, "Open 20261104-01 as it prints" lands on `/quote/<id>/document` at 390, 844 and 834 (`v-proof-door-*`). |
| J13: everything decided | DONE | "Left alone on Review: 4 findings… Last by Asaf, today at 7:44 pm", with Open Review (`26-elsewhere-counted-*`). |
| J14: from Home's Arrange | DONE | `16-at-home-*`. |

J12, with a draft (Highfield Sport 660, $61,700). Each cell gives the editor, the window and the lit part, in y:

| Line | 1280 × 800 | 1440 × 900 | 1920 × 1080 |
|---|---|---|---|
| ABN (mast) | 321–480 / 489–784 / 532–707 | 391–550 / 559–884 / 602–777 | 521–680 / 689–1064 / 732–907 |
| GST (sum) | 301–480 / 489–784 / 626–679 | 372–550 / 559–884 / 711–764 | 521–680 / 689–1064 / 866–919 |
| Deposit (sum, spec) | 102–480 / 489–784 / 626–679 | 191–550 / 559–884 / 711–764 | 321–680 / 689–1064 / 866–919 |
| Terms kept | 489–784 / 664–751 | 559–884 / 734–821 | 689–1064 / 864–951 |
| Prepared by | 222–480 / 489–784 / 633–671 | 292–550 / 559–884 / 718–756 | 387–645 / 689–1064 / 873–911 |

## Missing items

| Item | State | Note |
|---|---|---|
| L1: the whole printed quote, sticky, lit | DONE at a desk | See the J12 table. The pages are drawn at 0.66, so the lit "PREPARED BY Asaf" and the terms read at about 7 px (`v-person-lit-1920x1080`, `v-terms-kept-lit-1280x800`). In a hand it is a door. |
| L2: a stage that follows, and a dock | PARTLY | The stage is sticky at 80–447 (1280), 80–457 (1440) and 80–469 (1920), with its navy carried to the window's top. The dock is one line at 844 × 390 (326–378). But the stage never comes to rest at the page's foot (see the gaps). |
| L3: the deposit as a rule | DONE | "On 20261104-01, whose total is $61,700, the deposit prints as $6,170". The page prints "Deposit, 10% of the total: $6,170" under the total (`23b-*`). |
| L4: one index of decisions | DONE | The h1, who changed what last, and "Decided elsewhere" with a non-zero count. |
| L5: Northside's own photographs | NOT | Declared in DECISIONS (2026-11-04). |
| L6/L7: a sticky index in a hand | DONE | At 390 the lit part is in the strip at every scroll position walked, with reduced motion too: Pictures at 160–230 of 390. At 834 the band between the pill and the index is white. At 844 × 390 the index is static. |
| L9: a preview of shape | DONE | The specimen. |
| L10: colour from the photograph, and a picker | DONE | With Highfield Sport 560 on Home, a third card reads "From the photograph #5E7896, the colour in the Highfield Sport 560" (`v-colour-from-photo-*`). Pick stands beside the field. |
| L11: people with reach | DONE | Email, "No quote prepared on this computer yet", and the switch's line (`11-*`). |

## Fixed since verify 1, measured
- **The band above the sticky parts.** At a desk the band is the stage's own navy. At 834 the white index sits at 68–120, with nothing cut in the band at y 52–78 in any walk.
- **The hand index.** The lit word stays in the strip, and each end fades.
- **The 11 px lines.** There are 0 lines under 12 px outside the pages and the mini stage, at all six sizes.
- **The new derivation.** `boatNamed` has a test.
- **Name and Title** at 1440 stand level.
- **The set-apart sentence** stands at its switch.

## The perfect bar, by size

### 390 × 844: NOT
The toast for Undo (12–378, 728–776) stands for 8 s:
- over the "What Northside has decided" line after a Shape step;
- over the third row of picture cards and their Home and Sign-in presses (`14-picture-staged-390x844`).

### 844 × 390: NOT
The toast (522–828, 326–374) stands over live controls:
- Pick and Try it (`v-colour-from-photo-844x390`);
- Motion's "As the computer says" and "Less" after a Shape step.

The set-apart sentence's second line ran under the window's foot in `10-person-refused-844x390`, a shot taken while the toast stood. In my own walk it was fully in view (334–373 of 390).

### 834 × 1112: NOT
The toast (522–818, 1048–1096) stands over the colour field and Pick (verify 1). Otherwise it is clean: the index is sticky and the band is white.

### 1280 × 800: NOT
- **At the page's foot**, the stage stays at 80–447 over Shape. Below it lie 353 px of empty navy, and the paper half is empty below "Decided elsewhere" (`v-foot-1280x800`).
- **The toast** (968–1264, 736–784) covers Motion's two steps and its note (`18-shape-deep-1280x800`, `v-shape-deep-1280x800`), and in `v-terms-kept-lit-1280x800` a card's Home press.

### 1440 × 900: NOT
- **At the foot**, and wherever "Elsewhere" lands, "Shape, spacing and motion" stands cut under the stage at y 452–460 (`26-elsewhere-counted-1440x900`).
- **"Start from the boat"** is cut at the stage's edge (`17-boats-choosing-1440x900`), and so are the colour cards (`v-set-apart-refused-1440x900`).
- **The set-apart sentence** ends at y 903 in a window 900 tall.
- **The index** still stands in two rows of five, and the gap after Mark (851 to 955) is wider than the others.

### 1920 × 1080: NOT
- **At the foot**, the stage at 80–469 covers Shape's heading and specimen. "Corners" and "Shadow" are sliced at y 466. Below them lie 460 px of empty navy, and 630 px of empty paper (`v-foot-1920x1080`).
- **The pages** are drawn 524 px wide in a 736 px plate. The lit text reads at about 7 px.

### At every size
- No sideways scroll and 0 page errors.
- Every refusal is a sentence where it is refused.
- Tab runs from the skip link, through the bar, to the ten index words in order.
