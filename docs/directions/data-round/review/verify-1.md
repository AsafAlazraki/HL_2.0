# Review (`/review`), verify 1 — 2026-11-04

A fresh verifier, never having seen the screen. I served it on port 6264 (`vite build --outDir e2e/out/dist-6264`, `vite preview --port 6264 --strictPort`). The real Master Price File was loaded through the real door (`throughTheDoor`). I drove it with my own Playwright walk at all six sizes and opened every one of the 39 cases at each size. I followed every kind of door, pressed every kind of fix, left all 39 cases alone with L, and brought each back. I also minted one real quote (a Formosa SRT 715 · Territory through the picker) to see what a case touches.

Screenshots are in `verify-1/`, 477 files, each with its size in the name: `01-arrive` … `13-clean`, `c01`–`c39` (one per case), `20*` (the quote) and `30-no-file`. The server was stopped after each run. The builder's own `review.spec.ts` passed 24 of 24 on my port at 1280 and 390 (the two skipped tests are by design).

## Jobs

| Job | State | Evidence |
|---|---|---|
| J1 what is wrong, what it costs | done | 39 cases. "$819 not charged · $234 charged over · on one sale of each trailer" (`01-arrive-*`) |
| J2 trailer in the wrong size | done | Toast: "The ALP 5.3M-13B is registered Large at $283, and sells at $11,483." Undo brings it back (`03-*`) |
| J3 no price (Lone Star) | done, one gap | The empty refusal is said. "abc" sets `aria-invalid` and takes the focus, but its sentence stands under the press, out of view at every size (`04b-lone-abc-*`). $2,150 is written and the case drops to 7. The fitted price says it stays blank. The line most like it is shown. |
| J4 one name, two prices | done | Name them apart is offered when the codes differ. It refuses unchanged names: "Both are still called …" (`05-*`). See both opens the sheet with "2 match" (`06-*`) |
| J5 two headings | done | "LETTER L IN THE WORKBOOK, AFTER KIT SELL PRICE" and a door (`c37-*`) |
| J6 lines with no name | done | The three blank SPECIAL NOTES lines are told apart by their source (2,905, 2,906, 2,907). The nameless rigging kit says "From line 794" and has a door (`c32`, `c39`, `07b`) |
| J7 left alone, brought back | done | The list says "Left as meant, by Asaf, 4 Nov 2026, 3:28 am". Each case comes back on its own (`12-*`) |
| J8 every case at once | done | Index. Finding "lone star" gives 1, "Y10A-VW" 1, "yamaha" 6 and "zzzz" none, with a sentence. `?by=list` groups by list (`02*`) |
| J9 open the line | done | All 9 kinds have doors (`?at=`). The sheet opens on the row (`07-*`, `07b-*`) |
| J10 take off sale | done | "The 5 lines are off sale." Undo restores 39 (`08-*`) |
| J11 new since the last file | partly | Only lines written since packing are marked. What a new file settled is not said, because the old file is not kept |
| J12 the 6 lists no check reads | done | The foot reads "6 lists … 2,561 lines" and has Set their prices |
| J13 the clean day | done, two figures wrong | The head reads "0 to settle: the rest is left alone by your choice". The money is "left alone", never $0. Two figures are wrong; see the gaps (`13-clean-*`) |
| J14 keys | done | Enter, L and → (the spec at 1280). L walked all 39 at every size |
| J15 which drafts carry a wrong line | partly | Review shows "1 quote on this computer carries what this case names · 20261104-01 · Formosa SRT 715 · Territory · draft", and the index tags it (`20d`). The build warns only of the $0 boat ("The boat has no price yet", `20c`). It says nothing of a wrong rego or of two prices |
| J16 no copy of the file | done | "The price list is not on this computer yet, so there is nothing to check." with a load door (`30-no-file-*`) |

## Gaps

1. **major, honesty.** The clean day says "9 trailers are still registered as the wrong size, left alone by your choice: $819 on one sale of each, not charged." Only 7 of the 9 are not charged ($819 = 7 × $117). The other 2 are charged $234 over, and the sentence omits that (`Review.tsx:2319` uses `notCharged` with the count of all 9). `13-clean-*` at all six sizes.
2. **minor, honesty.** The clean day says "6 lines still sell below their cost". There are 4 distinct lines: Battery Lithium 50Amp and O Ring 13210-09350 appear in both case 11 (Sell) and case 12 (Sell inc Install).
3. **major, a refusal where it is refused.** "“abc” is not a price" is printed on the press. The press stands up to 7 lines below the refused field, so with the focus on the field the reason is out of view at 390, 834 and 1280 (`04b-lone-abc-*`). The field shows only a dark ring.
4. **minor, contradiction.** On the $0 "says what it comes with" cases (c17, c18, c21, c26, c30), the lede says "on sale at $0 at Sell and Sell inc Install". Each line then says "its Sell inc Install stays blank", but the file holds $0 there, not a blank (the sheet shows $0, `07b`).
5. **minor, repetition.** "Nothing like it in its heading has a price." is said once per line: 5 times on c17 and 4 on c18, which also have both "Leave them at $0" and "It’s meant" for the same act (`c17-full-1280x800`).
6. **minor, overlap.** The toast covers "Bring it back" in the left list at 390, 844×390, 834 and 1280 (`12-left-list-*`). It also covers the clean day's second line at 844×390 (`13-clean-844x390`).
7. **minor, overclaim.** "kept with Northside’s price list, so every desk sees the same queue": the record is `OrgProfile.leftAlone` in this browser's IndexedDB, and another computer sees it only if the work is carried over.
8. **minor, index.** At 1200 and wider the index does not scroll to the case on the stage. On case 37 it still shows Boats and Wrong size (`c37-1440x900`). Keyboard: reaching the press takes 53 Tabs through the 39 index links, with no skip.
9. **minor, phone.** On the boat case the press is about y 1509 of 844 at 390 (nine fields first), as the builder said. On a phone the empty clean day still offers "Every case, by check or list".
10. **major, not built.** The judge's rule exceptions 16 and 127 are not drawn; only F6 (3 of 3,292) is. The build warns of no wrong line except the $0 boat. What a new file settled is not said.

## The perfect bar, per size

No size scrolls sideways in any state measured. No text on Review is under 12px; the 11px heads are on the sheet only. No Review text is cut off: every clipped hit was a visually hidden figure.

- **390×844: NOT.** The refusal is out of view (gap 3). The toast covers Bring it back (6). The boat press is at y 1509 (9). The clean-day figure is wrong (1).
- **844×390: NOT.** Gaps 1, 3 and 6. The trailer press is in the first window at y 310–362.
- **834×1112: NOT.** Gaps 1, 3 and 6. The toast also covers the peeks after a press (`03-trailer-pressed-834x1112`).
- **1280×800: NOT.** Gaps 1, 3 and 5, and the index does not follow the stage (8).
- **1440×900: NOT.** Gaps 1, 5 and 8 (`c37-1440x900`).
- **1920×1080: NOT.** Gaps 1, 5 and 8. The layout is centred and holds.
