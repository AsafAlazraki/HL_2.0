# Review (`/review`), verify 2 — 2026-11-04

I am a fresh verifier and had not seen this screen before. I built the tree at `ab0640d3` into `e2e/out/dist-6264` and served it with `vite preview --port 6264 --strictPort`. My own script started that server and stopped it at the end of every run. I loaded the real Master Price File through the real door: I typed a name at `/sign-in` and pressed "Load the Master Price File". I did every job by hand at all six sizes with my own Playwright walk. Nothing was planted.

All screenshots are in `verify-2/` (402 files), each with its size in the name:

| Files | What they show |
|---|---|
| `01*` | Arrival, the full page, and the skip link |
| `02*` | The index: finding a case, by list, and following the stage |
| `03*` | A trailer pressed and undone |
| `04a/b/c` | Lone Star: empty, "abc", and $2,150 |
| `05a/b` | The twin, unchanged and then named apart |
| `06*` | See both |
| `07*` | The doors to note and nameless lines |
| `08` | A line taken off sale |
| `12*` | What was left, and one case brought back |
| `13*` | The clean day |
| `14` | What was settled since the last file |
| `20/21` | The build warning, and Review's quote tag |
| `30` | No file on this computer |
| `c01`–`c39` | Every case, full page |

## Jobs

| Job | State | Evidence |
|---|---|---|
| J1 what is wrong, what it costs | done | 39 cases. The rail reads "$819 not charged · $234 charged over · on one sale of each trailer" (`01-arrive-*`) |
| J2 a trailer in the wrong size | done | "The ALP 5.3M-13B is registered Large at $283, and sells at $11,483." It is said over the stage, and no toast appears at any size. Undo brings back 39. Enter does the same. The settled list names it (`03-*`, `14-*`). |
| J3 a line with no price (Lone Star) | done | The empty press is refused under the press ("Type a price beside at least one of them first."). "abc" is refused under its own field, and the field gets `aria-invalid` and the focus. The sentence is at y 567 under the field at 508 (1280), and 360–380 of 390 at 844×390. The press becomes aria-disabled, with `aria-describedby` pointing at that sentence. $2,150 is written and the case drops to 7 lines. The foot says Sell inc Install "stays blank" (`04*`). |
| J4 one name at two prices | partly | Name them apart is offered because the codes differ. Unchanged names are refused ("Both are still called … Change at least one."), and naming works and undoes (`05*`). **See both on case 15 opens Parts with "0 match"** (`06-twin-see-both-*`, `06-see-both-parts-1280x800`). See both on the Mackay case opens "2 match". |
| J5 two columns under one name | done | It says "Letter L in the workbook, after Kit Sell Price" and "Letter AD …", with a rename for each (`c35`–`c38`). See both opens Every column at the Identity group, not at the two columns (`06c`). |
| J6 lines with no name | done | The three SPECIAL NOTES rows read "from line 2,905 / 2,906 / 2,907 of the Parts Maintenance tab". The door opens row 2906, and the sheet's source agrees (`c32`, `07-note-door-2906`). The nameless kit reads "From line 794" and has a door (`c39`, `07b`). |
| J7 leave a case alone, bring it back | done | The left list reads "Left: the check is wrong here, by Asaf, 4 Nov 2026, 6:02 am" and "Left as meant … · 4 lines". Each case comes back on its own. A reload keeps it (`12*`). |
| J8 every case at once | done | "lone star" finds 1, "Y10A-VW" 1, "yamaha" 6, "dunbier" 3. "zzzz" gives a sentence. `?find=` and `?by=list` are URL params (`02*`). |
| J9 open the line | partly | Every kind has a door. The one twin's See both finds nothing (J4). |
| J10 take a line off sale | done | "3 lines in Mackay Trailers are off sale." Undo brings back 39 (`08`) |
| J11 what a new file settled | partly | "1 case settled since the Master Price File of 16 Sept 2026", with a list (`14`). A second price file through Shelf was not walked. |
| J12 the 6 lists no check reads | done | The foot names all 6 and 2,561 lines, with Set their prices |
| J13 the clean day | done | "0 to settle: the rest is left alone by your choice". The money reads "$819 not charged, left alone". Each check is said as left. The trailer line reads "7 charged $819 too little and 2 charged $234 too much". "4 lines … 2 of them at both their prices". The foot reads "39 cases … 76 lines and 4 pairs of headings" (9+9+4+6+34+10+3+1 = 76). No index door (`13-*`). |
| J14 keys | done | L walked 39 to 0 at every size and Enter makes the change. The skip link is the 8th Tab, and from it the press is 1 Tab. Without it the press is 61 Tabs at the desk. |
| J15 which quotes carry a wrong line | partly | The build's finale warns: "registers the … Fibreglass Boat as Small, though it is rated 1,450 kg, so its rego is $117 short. Review has it." Review tags "1 quote" with a door (`20-build-trl_dunbier-*`, `21b`). The picker shows the line at $11,366 with no word. |
| J16 no copy of the file | done | "The price list is not on this computer yet, so there is nothing to check." It has a load door (`30-no-file-*`). |

## The judge's missing items

1. A true clean day: **done** (`13-clean-*`).
2. The whole queue in one look: **done** (`02*`). The desk index follows the stage: case 37 sits at y 657–708 of 800 (`02d`).
3. A door to every line: **partly**. See both on case 15 is broken. See both on headings does not land on the columns.
4. Off sale and name them apart: **done**. No price on a note row: **partly**. The amber press is gone from c17, c18, c21, c26 and c30, but each note line ("FF · Factory Fitted", "Supplied with Motor") still carries a "$ at Sell" field (`c17-1280x800`).
5. Risk order: **done**. The $0 boat leads ("a $0 quote") and its lede no longer says "$0 is meant".
6. A line priced whole: **done**. The foot says Sell inc Install "stays blank" or "stays $0", as the file holds it.
7. Below cost and rule exceptions: **done**. "4 lines of the 2,095", "2 lines of the 2,196", and the rule exceptions "16 that broke it (555 of 571); none of them is on this price list" and "127 … (3,890 of 4,017)" (`c11`, `c12`, `c34`).
8. What a case touches: **partly**. It shows on Review and on the finale, not where the line is picked.
9. New since the last file: **partly**. It covers what was settled since the packed file; a new file was not walked.
10. Left alone as a list: **done**. The foot now says the record is kept "on this computer, and a copy saved on Shelf carries it to another".

## The last verify's gaps

| Gap | State |
|---|---|
| 1. The clean day's trailer money | fixed |
| 2. Below-cost count | fixed |
| 3. Refusal in view | fixed at all six sizes |
| 4. $0 versus blank | fixed |
| 5. Repetition | fixed: said once, and no "It’s meant" beside "Leave them at $0" |
| 6. Toast cover | fixed: no Sonner toast measured in any state |
| 7. Overclaim | fixed |
| 8. Index follows, and a skip link | fixed |
| 9. Phone press and the empty index door | fixed: the boat press is at y 484–536 of 844 |
| 10. Not built | exceptions fixed; build warning partly; new file partly |

## Gaps

1. **major, a broken door.** "See both in the price list" on case 15 (Outboard Vented Cover · Yamaha 4 CYL 2.8L …) opens `/data/parts?find=Outboard+Vented+Cover+-+YAMAHA+…+%282023%3E%29`. The sheet says "0 match" and "Nothing on Parts & Accessories matches". Measured on a fresh file at 1280 and 390 (`06-see-both-parts-1280x800`, `06-twin-see-both-*`).
2. **minor, a name two lines carry.** Case 2 reads "Rego the ALP 5.3M-13B as a Large trailer.", and Undo reads "The ALP 5.3M-13B is registered Large". Dunbier has two such lines. Row 55 (Suits Alloy Boats) is already Large at $11,253. Row 67 (Fibreglass Boat) is the Small one. The title and the step do not say which. Only the $11,366 in the table and the door tell them apart (`c02`).
3. **minor, a price on a note.** The note lines in c17, c18, c21, c26 and c30 still offer a "$ at Sell" field each (`c17-1280x800`).
4. **minor.** See both on a pair of headings opens Every column at Identity, with the two columns off screen (`06c-see-both-headings-1280x800`).
5. **minor, a fragment.** At 1280, 1440 and 1920 the desk index scrolls so that a half item stands at its top edge: "two apart." and "apart." at y about 198 (`04b-lone-abc-1280x800`, `04b-lone-abc-1920x1080`, `c17-1280x800`).
6. **minor, a cut line.** At 844×390, after a press the page scrolls 77 px. The rail's "to settle …" line and the index door sit half under the pill (`03-trailer-pressed-844x390`).
7. **minor, inconsistent press.** The press stands above the lines on c11, c16 and c17, and below them on c12, c19, c20, c21 and c31. On a phone, c19's press is at y 861 of 844 (`c19-390x844`).
8. **minor.** The named-apart step speaks the file's raw string twice and does not say which code took which name (`05b`).
9. **minor, J15.** No word where the wrong trailer is picked. The warning stands only on the finale.

## The perfect bar, per size

No state scrolled sideways. No Review text was clipped, and none was under 12px, in any of the 39 cases or the states measured. No toast appeared. The "covered" hits I measured were content scrolling under the fixed pill, not overlaps at rest.

- **390×844: NOT.** Gap 1 (`06-twin-see-both-390x844`). The note fields (3). c19's press is below the first window (7).
- **844×390: NOT.** Gap 1. The rail is cut under the pill after a press (6).
- **834×1112: NOT.** Gaps 1 and 3. Otherwise clean: `12-left-list-834x1112` shows nothing over Bring it back.
- **1280×800: NOT.** Gaps 1, 3 and 5.
- **1440×900: NOT.** Gaps 1 and 5.
- **1920×1080: NOT.** Gaps 1 and 5 (`04b-lone-abc-1920x1080`).
