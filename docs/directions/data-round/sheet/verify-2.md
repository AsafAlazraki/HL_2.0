# The sheet — verify 2 (2026-11-03)

A fresh verifier, read-only. Built and served on port 6224 (`e2e/out/dist-6224`), the real Master Price
File loaded through the door as `Asaf`. Frames: `verify-2/` (the round's shot harness re-run into this
folder at all six sizes, `SHEET_SHOTS_DIR=verify-2`) plus my own walks, prefixed `v`. The harness's
`cuts-<size>.json` measured no clipped text at any size. My own reading of the frames agrees, apart
from the layout faults listed below.

## Blocker found

**An Undo the screen shows is not kept.** On a phone, I wrote Cash 850 on Roll Up 230 KAM PVC WH and
the warning came up. About 350 ms later I pressed Undo. The screen said "Undone" and showed $2,770. I
then reloaded straight away, and the line read **$850**. The same thing with a 3 s wait before the
reload kept $2,770. The harness reproduces it on every run: `09-record-phone` and
`rerun-phone/09-record-phone` show Cash $850, "The Master Price File had $2,770". `13-ask-phone` then
counts "Cash under Landed Hull Cost 1" and "Changed here 1". Cause (read, not changed): the store
writes behind (`src/state/catalogue.ts`, `WRITE_BEHIND_MS` 300). The `pagehide` flush queues the Undo
behind a rows write that is still in flight, and the page goes before it lands. The result is a price
under cost that nobody chose, saved for good.

## Jobs

| Job | State | Proof |
|---|---|---|
| J1 find | done | 02-find-* |
| J2 search finds nothing | done: a sentence, the other lists that carry it, Clear | 03-find-nothing-*, 03b-find-elsewhere-* |
| J3 variants at Cash/Trade/Warranty | done | 01-rest-*, 02-find-* |
| J4 Enter with step line and Undo | done | 05-written-* |
| J5 typing onto a cell | done: 5321 wrote $5,321 and 28 then 50 wrote $2,850 | 04-typing-laptop, 05-written-laptop |
| J6 wrong value | done: the field stays open with its draft, and the pill pushes the next row down | 07-refused-* |
| J7 details facts first | partly: facts first at desk and tablet. At 844x390, Cash opens at y=387 of 390 and needs a scroll. On the phone the picture still comes first | 09-record-laptop, 09-record-phone-landscape, v14-record-scrolled-150-phone-landscape, 09-record-phone |
| J8 many at once | done: By %, By $, Round to $, PVC + $, before→after, one command, one Undo. +4% writes cents ($2,880.80) into a whole-dollar column | v02-plan-pct-laptop, v03-moved-pct-laptop, v04-plan-round-laptop |
| J9 series in the URL | done (`?in=Patrol`) | s10 walk |
| J10 only the models | done | 10-models-* |
| J11 pictures | done | 11-pictures-* |
| J12 every column | done: models open, Boat whole | 12-every-* |
| J13 one hidden column | done | v17-more-columns-laptop |
| J14 read at Trade | done: "Trade: PVC $2,631 · HYP …" on every head | 35-read-at-trade-* |
| J15 add a variant | done: Copy as a new variant (prices and facts, code left blank) plus a whole sentence for the picture | v07-copied-laptop, 32-added-* |
| J16 delete | done: names 13 pairings in 4 tables | v08-delete-ask-laptop |
| J17 hull to fitment | done (`/fitment?boat=boat_highfield:1`) | s8 walk |
| J18 Parts / Dealer Fit / Rigging Kits | partly: names wrap whole and Parts' range sits under SELL. Dealer Fit still shows no price, only a sentence and the Prices door | 20-parts-desktop, 21-dealerfit-wide, 28-rigkits-tablet |
| J19 Yamaha | partly: HP Rating is now a column. The code is still said twice ("Yamaha - F4SMHA" beside F4SMHA) | 23-yamaha-desktop |
| J20 fitment list | done: boats said by name, heads one size, RECOMMENDED whole | 22-join-* |
| J21 Labour / Registration | partly: Labour has cents throughout and Actual is explained. Registration shows no money at all on its price list | 26-labour-desktop, v16-actual-note-laptop, 27-registration-desktop |
| J22 unknown list | done | v15-unknown-list-laptop |
| J23 what Northside changed | partly: a corner mark, a "Changed here" filter and the file's value are all there. "Changed by Asaf on 3 Nov" lasts only for the session: after a reload the record says only "The Master Price File had $2,770" | v01-changed-only-laptop, 38-changed-record-laptop, v12-changed-after-reload-laptop |
| J24 warned under cost or Trade | done: after the write, with the measured rule (587 of 587), Undo and Keep it | 06-warned-*, 40-hand-warned-phone |

## Missing items

| Item | State |
|---|---|
| Typing keeps the first key | done |
| Filters by value in the URL | done (`?only=changed`, `under~…`, `at-least~…`). There is no discontinued filter on Highfield (the file has no such column) and no sort |
| Arithmetic on a selection | done |
| Warning under cost or under Trade | done |
| A mark on changed cells, with who and when | partly: who and when are lost on reload |
| Duplicate a variant | done |
| Empty search sentence and a way out | done |
| Colour legend the admin completes | done (44-colour-key-*) |

## The perfect bar, by size

- **390x844 — NOT.** The $850 Undo blocker (09-record-phone, 13-ask-phone). The record opens on the picture first, with Cash at y=520.
- **844x390 — NOT.** The chrome is fixed and takes 195 of 390 px. The selection plate goes past the viewport: its count sits under the series bar and its before→after under the step bar (08-selection-move-phone-landscape). The record opens with no fact in view. The fitment title wraps to three lines (22-join-phone-landscape). The band fragment "chambers" shows under the column head when scrolled (06-warned, 07-refused).
- **834x1112 — NOT.** A new variant's heading wraps to five lines in a column about 90 px wide (32-added-tablet). The record title wraps "Roll Up 230 / KAM · PVC · WH" while space is free (09-record-tablet). Model codes are dropped for KAM but shown for AL (01-rest-tablet).
- **1280x800 — NOT (minor).** After an edit, a stray 2 px blue rule stands right of "26 more" at x≈1246, y 185–215 (05-written, 06-warned). The twin plan says "2 in PVC, read from" and stops (39-twin-plan). The plate says "and 1 more values" (v04). +% writes $2,880.80 beside $4,680.
- **1440x900 — NOT (minor).** Same stray rule and plate wording. Otherwise clean: 12-every, 14-only, 20-parts, 23-yamaha, 35-read-at-trade.
- **1920x1080 — NOT (minor).** With a record open, the model spine is about 780 px of empty column (09-record-wide). Dealer Fit and Registration read as names and codes across a 1,400 px gap with no money (21-dealerfit-wide, 27-registration-desktop).
