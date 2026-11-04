# Settings, judged — data round, 2026-11-04

A fresh judge who had never seen the screen. It was served from its own build (`e2e/out/dist-6300`, `vite preview` on port 6300) and reached through the real door with the real Master Price File: a name at Entry, then *Load the Master Price File*, the `throughTheDoor` walk. Each of the six sizes got a fresh browser context, and the walk was the same at every size. Every frame named below is in `before/`, with its size in the file name (`-390x844`, `-844x390`, `-834x1112`, `-1280x800`, `-1440x900`, `-1920x1080`). That is 163 frames: 27 states at each of the six sizes, plus one crop.

Measured at every size and in every state:
- sideways scroll;
- text cut by its own box;
- controls under 24 px;
- text under 12 px;
- photographs not loaded;
- page errors;
- the first ten keyboard stops and their focus ring;
- how long the Undo toast lives;
- where each half's content ends.

The only things typed were test values, in contexts that were thrown away afterwards:
- the Australian Business Register's published example ABN;
- a long address;
- "10" for GST;
- two lines of terms marked as the judge's;
- a title and phone for Asaf;
- one made-up second person on `example.test`;
- one refused colour.

The server was stopped before this was written.

**Verdict: DEEPEN.** The composition is right for the job, and it is the most original thing about the screen. The page is split down its centre by where a choice lands: the white paper on the left (what prints) and the night water on the right (what shows). The letterhead is drawn by the quote's own component on the newest real draft. Every empty line is a dashed box that prints nothing.

What stands is not at the level the owner asks for, in three ways:
1. **The two halves are not balanced.** At a desk the paper ends at 40% of the page and leaves the rest of its half bare.
2. **The stage does not follow the choice it is meant to prove.** It sits at the top of the water while the choices run 2,000 px below it.
3. **It is thin.** It sets the letterhead and four lines of words, but never shows the quote those lines print on. Most of what Northside has decided in other rooms is invisible here.

Each fault is listed below and measured. None of them asks for a new composition: each is function, depth or finish inside this one.

---

## 1. The jobs, and each one done

Sources:
- `docs/SCREENS.md`: Settings' row (line 147) and its fix row after the M4 critic (line 155);
- `src/screens/manage/{Manage,Water}.tsx`;
- `src/app/ways.ts`: "Northside's details on every quote, its people, its colour and pictures, and what its front page shows";
- `docs/DECISIONS.md`, entries of 2026-10-29, 10-30, 11-02, 11-03 and 11-04;
- `docs/LATER.md`;
- `docs/research/refs/manage/notes.md`;
- what an admin who keeps the price file and a salesperson at the desk need.

| # | Who | Job | Done on the screen | Result |
|---|---|---|---|---|
| J1 | Admin | Put Northside's ABN, address and phone on every quote | The dashed **ABN** box on the letterhead → `?line=abn` → typed "12 345" → Keep (`04-abn-refused-*`). Then the real example (`05-abn-kept-*`), a long address and a phone (`06-longest-address-*`) | **Done, and well.** The refusal is a sentence where it is refused: "An ABN is eleven digits, and this is 5." Each kept line prints on the sheet at once, with "ABN set · Undo". The longest address (82 characters) wraps inside the sheet at 390, and the page stays 390 wide. **Not perfect:** the editor opens as a card *under* the sheet rather than on the line pressed, so "the paper is the form" (notes §2) breaks at the moment of typing. |
| J2 | Admin | Northside's mark on paper | "Change the mark" → `?line=mark` (`22-mark-editor-*`) | **Done.** The held dark-ink mark from northsidemarine.com.au is said with its source. One "Choose a file" press is the whole act. A light-ink file is refused with its measured ratio (code read, not pressed: no file was offered). |
| J3 | Admin | What every quote says: GST, how long a quote stands, deposit words, terms | "Set gst rate" → "ten" (`07-gst-refused-*`), then 10. Terms written on two lines (`08-terms-open-*`, `09-says-set-*`) | **Done.** The GST refusal reads "A GST rate is a share from 0 to 100, as in 10 for 10%." The terms keep their line breaks. Each empty line says what it means ("No number of days, so no date prints"). **Thin:** the deposit is *wording* only. No share or figure can be set, so the quote cannot print "Deposit $X" from its own total (§3 L3). |
| J4 | Admin | Northside's people, who print as *Prepared by* | "Keep Asaf as a person" → `?person=new` (`10-person-open-*`), then title and phone kept (`11-person-kept-*`). A second person added with the longest name and title (`13-two-people-*`) | **Done, with two faults.** (a) At 1440 the editor's Name box (36 px, top at y 440) and Title box (47 px, top at y 453) stand side by side at different heights and tops (`10-person-open-1440x900`). (b) See J5. The longest name breaks over three lines in a 314 px card at 1440 and stays inside it. |
| J5 | Admin | Set someone apart from changing prices and settings | Asaf's "May change prices and settings" switch pressed while he is the only person (`12-person-switch-refused-*`) | **Refused correctly, then wrong.** "Somebody has to be able to change prices and settings, and this is the last person who may." is said where it is refused. But it **stays on the page after a second person who may is added** (`13-two-people-*` at all six sizes). The sentence is then false. |
| J6 | Salesperson | Someone else is at the desk | "Not Asaf? Change who is at the desk" (`26-change-desk-*`) | **Done.** The name is let go and `/sign-in` opens. |
| J7 | Admin | Northside's colour | "#FFEA28" → Try it (`14-colour-refused-*`), then "From the mark, #0066CC" (`15-colour-staged-*`, `15b-*`) | **Done, with three faults.** (a) The refusal is measured: "White on #FFEA28 is 1.23 : 1, under the 4.5 : 1 … The nearest that read: #A36B0A #837819". (b) After "From the mark" is chosen, the field still reads **#FFEA28**, a colour that is neither chosen nor kept. (c) "Changed, not kept" and its Keep appear *above* the press. At 844×390 they stood at **y = −172**, off screen, so the person sees nothing change. (d) The only two colours offered are #1A65BD (5.76 : 1) and #0066CC (5.56 : 1), two blues a customer could not tell apart. |
| J8 | Admin | Home's photograph and the sign-in page's | "Highfield Sport 560" under Home's name (`16-picture-staged-*`); the stage switched to "The sign-in page" (`17-signin-stage-*`) | **Done.** The stage wears the photograph before it is kept: "Home stands on the Highfield Sport 560, in place of the drawn water" with Keep and Put back. **Not perfect:** at 390 the Undo toast of the previous step covers Keep and Put back for its 8.3–8.7 s life (`16-picture-staged-390x844`). Only the eight held heroes are offered. Northside cannot use a photograph of its own yard, showroom or people (§3 L5). |
| J9 | Admin | What Home shows, and in what order | "What Northside sells" switched off (`19-home-hidden-*`); "Choose from all 35 boats", with one put first (`20-boats-choosing-*`) | **Done; one name is wrong.** Hidden is said in words, the section's name is struck through, and the stage's maker row disappears. Up and Down move a section. The boat chosen first is named **"Haines Signature Signature Fisher 525F"** in its tile, in the sentence ("First: Haines Signature Signature Fisher 525F") and in the toast (`20-*`, `21-*`, `24-*`). `Water.tsx` joins `b.maker` and `b.model`, and the model already starts with the maker's second word. |
| J10 | Admin | Corners, shadow, spacing and motion | `21-shape-*` | **Done as switches; nothing shows what they do.** The stage does not wear corners, shadow or spacing, so the manager chooses "Soft" or "Deep" blind. |
| J11 | Admin | See the letterhead on a real quote | A Sport 560 draft started on the picker, then `/manage` (`25-on-a-draft-*`) | **Done.** "Drawn on 20261104-01, a draft for nobody yet, the newest quote on this computer." The stamp reads "QUOTATION · DRAFT · 20261104-01 / Not issued yet". |
| J12 | Admin | See the **whole quote** these settings print on: cover, letterhead, Prepared by, deposit, terms on the last page | — | **Not possible here.** Only the letterhead strip is drawn. Terms "print on its last page" and the deposit "under the total on the first page" are said in words under their fields (`PRINTS` in `Manage.tsx`), never shown. The printed quote has had its cover since 2026-11-02, and Settings' row still says the cover "waits for the proposal's cover page". |
| J13 | Admin | Find everything Northside has decided anywhere in the app | — | **Not possible.** `OrgProfile` (`src/domain/model/project.ts`) also carries `colours` (names for the file's colour letters), `suppliers`, `aisles` and `leftAlone` (Review). The price levels are on Prices. Settings shows none of them and has no door to any of them; the "Everything else" row was removed on 2026-10-30. |
| J14 | Admin | Arrive from Home's "Arrange Home" | `?at=home` (`24-at-home-*`) | **Done.** It lands on Home's section. |

Deliberately not built, and not listed as gaps:
- **A second location** (Boondall and Coomera, notes §0.3): it waits on OWNER 4, which has no yes in `DECISIONS.md`, and the owner's words of 2026-10-31 do not give one.
- **A per-person appearance layer:** removed by decision on 2026-10-30.
- **Remote acceptance:** `LATER.md`.

---

## 2. The perfect bar, at six sizes

These held in all 27 states at all six sizes:
- the page never scrolls sideways (`scrollWidth` = the viewport every time);
- no text is cut by its box;
- no control is under 24 px (the only 1×1 inputs are the visually hidden file and segmented inputs behind their labels);
- every photograph loads;
- **0 page errors**.

The first ten keyboard stops each show a 3 px focus shadow. Ready after navigation: 1.5 s at 390, 1.8 s at 834, 2.1–2.7 s at a desk, and **3.6 s at 844×390**.

| # | Element, state, sizes | Measured | Verdict |
|---|---|---|---|
| P1 | **The paper half at a desk**, at rest and scrolled (`02-full`, `19-home-hidden`, `20-boats-choosing`, `24-at-home` at 1280/1440/1920) | The paper's content ends at **1,136 of 2,686 px** (1280), **1,072 of 2,517** (1440) and **1,027 of 2,560** (1920). **57–60% of the left half is bare cream** beside the water. Every frame below the first screen and a half is half empty. | **NOT** — the strongest single fault on a screenshot |
| P2 | **The stage while choosing** (`15-colour-staged`, `16-picture-staged`, `18-pictures`, `19-*`, `21-*`) | `.mg-stage-wrap` is `position: static`. At 1280 the stage spans y 252–611, while the colour, pictures, Home and shape choices run from y 680 to y 2,600. At 844×390 the "Changed, not kept" bar with Keep stood at **y = −172** after a colour was chosen. At 390 it is 1,661 px down the page. | **NOT** — the screen's own promise ("the change landing on the real thing before it is kept") is out of sight wherever the choice is made |
| P3 | **The Undo toast** (`10-person-open`, `11-*`, `13-*` to `18-*`) | It lives **8.2–8.7 s** at every size. At 390 it covers the Keep and Put back of "Changed, not kept" (`16-picture-staged-390x844`) and the person editor's Email field (`10-person-open-390x844`). At 1440 it covers the stage's maker row (`10-person-open-1440x900`). A long name wraps it to three lines at 1440 (`14-*`, `15-*`). | **NOT** |
| P4 | **The set-apart refusal after a second person** (`13-two-people`, all sizes) | "…this is the last person who may." stands over two cards that both say "May change prices and settings: on". | **NOT** — a sentence that is no longer true |
| P5 | **The colour field after a card is chosen** (`15-colour-staged`, all sizes) | The field reads #FFEA28 while #0066CC is ticked and staged. | **NOT** |
| P6 | **A boat's name** (`20-boats-choosing`, `21-shape`, `24-at-home`, all sizes) | "Haines Signature Signature Fisher 525F". The picture ledger's own `depicts` says "Haines Signature 525F". | **NOT** — the M2 rule that every boat is named the way a person says it |
| P7 | **The two jump plates at 834 and 844** (`27-jump-edge-834x1112`, `01-rest-844x390`) | The plates run to x 802 (834) and x 812 (844), while the content's right edge is 768: they overhang the page by 34 and 44 px. Each plate has a dot, hollow for paper and filled for water. It reads as a radio with "What shows" selected while the person is on "What prints". | **NOT** |
| P8 | **The phone's length** (`02-full-390x844`, `23-full-after-*`) | 5,235–5,759 px at 390 (6.2–6.8 screens) and 3,623–4,529 px at 844×390 (9.3–11.6 screens). Nine groups, and the only way through is two jump links that stop at the top of each half. | **NOT** — density |
| P9 | **Pictures, drawn twice** (`18-pictures`, all sizes) | The same eight photographs appear twice, as 9 tiles "Under Home's name" and 8 "On the sign-in page". That is **1,673 px of 5,235 at 390 (32%)** and 738–922 px at a desk. | **NOT** — density |
| P10 | **The letterhead's stamp** (`01-rest-1440x900`, `06-longest-address-1440x900`) | It wraps to two ragged lines at 1440: "Dated the day it is / given", and with an address "Dated the day / it is given". At 834, 1280, 1920 and 390 it is one line. | **NOT** |
| P11 | **The person editor at 1440** (`10-person-open-1440x900`) | The Name and Title boxes differ by 11 px in height and 13 px in top. | **NOT** |
| P12 | **The stage's maker row** (`01-rest-*`) | Two of seven marks, Jeanneau's faint red star and the Signature script, cannot be read at any size. Stabicraft is in type, as decided. | **NOT** (minor) |
| P13 | **Two tiles that look chosen** (`18-pictures-390x844`) | Highfield ADV7 wears a blue edge while Sport 560 carries the tick. The cause is most likely a touch hover, and it was not proven. | **NOT** (minor) |
| P14 | **Small type** (every state) | 8–11 elements at 11 px. Most are the stage's miniature (date, the find's placeholder, "New quote"), plus the document's own stamp words, "Prepared by" and the colour cards' notes. | Acceptable on the miniature. The colour cards' notes should not be 11 px. |
| P15 | **The page's name** | No `h1` in `src/screens/manage` or the shell. The word "Settings" is nowhere on the page, and the pill lights *Home*. A person who arrived from the finder reads "WHAT PRINTS". | **NOT** (minor) |
| P16 | The letterhead, empty and full (`01-rest`, `05-*`, `06-*`, `25-on-a-draft`) | Dashed boxes, printed lines and the draft's stamp, at all six sizes; the 82-character address wraps inside the sheet. | **PERFECT** |
| P17 | Every refusal (`04-*`, `07-*`, `12-*`, `14-*`) | Each is a sentence with its reason, at the field that was refused, with an icon and no dead control. | **PERFECT**, except P4 |
| P18 | Home's arrangement (`19-*`, `24-*`) | Hidden is struck through and said, the stage drops the row, Up and Down are named, and `?at=home` lands. | **PERFECT**, except the name in P6 |

---

## 3. The level it has to be

What the best tool for this job would give that this screen does not. The source of every figure is named, and nothing here needs a figure the price file does not carry.

| # | Severity | What | Why Northside needs it | Reference | Honest data? |
|---|---|---|---|---|---|
| L1 | **major** | **The whole quote as it prints, beside the paper half.** The cover, every page head, *Prepared by*, the deposit under the total and the terms on the last page, drawn on the newest real draft with its own lines, each set line lit where it lands. | The owner's end goal is "a beautiful downloadable quote". The manager types terms and deposit words here and cannot see them land. Today the screen describes where they print instead of showing it. | Xero's branding themes and Square's receipt preview (`refs/manage/live/square-receipt-customise.png`), and Stripe's invoice editor with its live document | Yes. The document screen already draws the draft from its frozen and current lines. With no draft, a sentence says so, as the letterhead already does. |
| L2 | **major** | **A stage that follows the choice.** At a desk both halves stick: the letterhead (or the quote of L1) on the paper and the Home or sign-in stage on the water, each standing while its own choices scroll. In a hand, "Changed, not kept" with Keep docks at the window's foot over the pill, the way a decision's act already docks at the window's foot elsewhere in the data round (DECISIONS 2026-11-04, "A decision's act is a bar of its own"). | It fixes P1, P2 and P3 at once. It is the screen's own promise, and today it is kept only at the top of the page. | Ghost's design settings (`live/ghost-design-settings.png`, preview fixed while the panel scrolls) and Shopify's theme editor | No data needed |
| L3 | **major** | **The deposit as Northside's rule, not only its words:** a share or a fixed figure Northside chooses, which the quote works out from its own total and prints ("Deposit 10%, $X, due on acceptance"), refused in a sentence above the total. | A customer at the desk asks "what do I pay today?" The quote can only print words. | HubSpot quotes and Stripe's payment terms | Yes. Northside's own decision, applied to the quote's own total. The price file is not asked for a figure it lacks. |
| L4 | **major** | **One index of everything Northside has decided**, each with its count measured, its door and its last change: the letterhead, quote words and people here; names for the file's colour letters (`OrgProfile.colours`), suppliers and aisles (`suppliers`, `aisles`, the chandlery), what Review leaves alone (`leftAlone`, with its reason, person and instant), the levels chosen on Prices, and pictures and covers Northside added. A dated line says who changed what last, from the `settings-changed` events. | The end goal's "deep backend configuration" is spread over five rooms, and none of them says what Northside has decided as a whole. On a shared computer the admin needs to see who changed the GST rate, and when. | Linear's workspace settings index and Shopify's settings home: every area with its state in one look | Yes. Counts of records Northside made, never figures from the file. |
| L5 | **major** | **Northside's own photographs for Home and the sign-in page.** The kit's `AddPicture` is already used on every pictured row (DECISIONS 2026-10-30 and 11-02). Each picture is kept as Northside's own, with provenance, and gets the same veil worked from its pixels. | Northside's yard, showroom and people are its strongest picture. Today Home can only stand on a maker's boat. | Shopify's brand assets (`live/shopify-brand-assets.png`, named slots: Cover image) | Yes. An upload is Northside's own picture, recorded as such (notes §6). It is never a stand-in for a model. |
| L6 | **major** | **One picture grid, not two.** Each photograph is one tile with two marks, "Home" and "Sign-in" (or one row with a two-place switch), so the eight are drawn once. | P9: a third of the phone page is the same eight pictures twice. | Apple's wallpaper picker: one photograph, "Set as Lock Screen / Home Screen / Both" | No data needed |
| L7 | **major** | **An index in a hand.** At 390, 834 and 844 a sticky row of the nine groups (Letterhead · Quote words · People · Colour · Pictures · Mark · Home · Boats · Shape) with the current one lit, replacing the two jump plates (P7, P8). | 6–11 screens of scroll with no way across them. | iOS Settings and Stripe's settings: a list of areas, then each area | No data needed |
| L8 | **major** | **The finish faults of §2, fixed and guarded:** P4 (the refusal cleared when it stops being true), P5 (the field follows the chosen card), P6 (a boat named as a person says it, through the names ledger the picker already reads), P10, P11 and P15 (the page's name). | "Zero UI/UX errors" | — | — |
| L9 | minor | **Shape choices shown before they are kept:** the stage wears corners, shadow and spacing the way it already wears colour and photograph. | J10: choosing "Deep" blind | Radix Themes' live playground | No data needed |
| L10 | minor | **A colour worth choosing:** the two offers are near twins (5.76 and 5.56 : 1). Offer one colour taken from the chosen photograph (Material's source colour, `live/material-theme-builder.png`), measured the same way, and a colour picker beside the hex field. | Every colour choice is between two blues a person cannot tell apart, or a typed hex | Material Theme Builder and Leonardo | Yes. Measured from held pixels. |
| L11 | minor | **People with reach:** each person's email prints with *Prepared by* (it is kept but only said), a count of the quotes each one prepared, and one line saying what the switch lets that person do. | The salesperson's card is what the customer phones | HubSpot's signature (`live/hubspot-signature.png`) | Yes. Counts from the quotes on this computer. |
| L12 | minor | **The editor on the line:** the field opens in the letterhead where the line prints, not as a card under the sheet. | Notes §2: "the paper is the form" | The invoice generator (`live/invoice-generator.png`) | No data needed |
| L13 | minor | **Ready at 844×390 in under 2 s** (measured 3.6 s) | The phone held sideways at the desk | — | — |

---

## 4. The verdict

**DEEPEN.**

The composition is right. One page divided by where a choice lands, paper and water, teaches why the mark comes twice without a word. The letterhead drawn by the quote's own component on a real draft is the strongest proof a settings screen can give. Every refusal is a sentence where it is refused, and every change is one step with its Undo. A redraw would throw that away to fix things that are not compositional.

What is missing is function, depth and finish, and it is mammoth:

1. **The paper half becomes the quote (L1).** The whole printed quote of the newest draft, sticky at a desk, with every Settings line lit where it lands. This is what fills the bare 57–60% of the left half (P1).
2. **The water's stage follows the choice (L2).** It is sticky at a desk, and in a hand "Changed, not kept" docks at the foot, clear of the toast (P2, P3).
3. **The deposit is a rule (L3)** that the quote works out and prints.
4. **Northside's decisions get one index (L4)** across Settings, Prices, Review, the chandlery and the colour key, with who changed what and when.
5. **Northside's own photographs (L5),** and **one picture grid instead of two (L6).**
6. **A section index in a hand (L7).**
7. **Every finish fault of §2 fixed and guarded (L8):** the stale refusal, the stale colour field, the doubled maker name, the jump plates' overhang, the stamp's wrap, the editor's misalignment and the missing page name.
8. Then **L9–L13.**

Frames are in `docs/directions/data-round/manage/before/`. The source read is `src/screens/manage/Manage.tsx`, `src/screens/manage/Water.tsx` and `src/domain/model/project.ts` (`OrgProfile`).
