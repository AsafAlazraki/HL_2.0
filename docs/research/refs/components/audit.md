# Every control, and why it reads as bland

Audit, 2026-09-28. The owner, 2026-09-24, in the browser: "components are so bland and boring", and the same day "tech stack looks SO BORING". This file lists every kind of control and surface the app draws, photographs each one in its states, says what makes each one bland, and ranks the ten changes that would change the app's feel most. Nothing in `src/` was changed.

**How it was photographed.** `npm run build`, then `npx vite preview --port 6201`. One Chromium at 1440 × 900 walked the app the way `e2e/routes.ts` reaches each screen: through the door with a typed name and the real Master Price File, the Highfield Sport 660 picked on the picker (the walk's deepest model, the one `e2e/mint.ts` picks), the cascade raised from its price level, the quote addressed to R. Kelleher and given, the paper opened, then the registers, the sheet, its Pictures door and `/nope`. At the end, a press on *Make a new version* left a draft, so Home's draft card and the register's three bands exist. Nothing was planted in IndexedDB. The clock was fixed at 2026-09-16 09:00 Brisbane, the time `e2e/shots/recipe.ts` fixes.

- **Screen frames** (`audit/screen-*.png`, 34 of them) are 1440 × 900 at CSS scale.
- **State photographs** (275 of them) are crops at device scale 2, so an edge and a shadow can be read.
- **The states:**
  - *rest* is with the pointer parked in a corner and nothing focused.
  - *hover* is with the pointer on the control.
  - *pressed* is with the button held down; the pointer is dragged off before release, so nothing acts.
  - *focused* is keyboard focus (a key is pressed, then the control is focused, so `:focus-visible` applies).
  - *selected* and *refused* are real states the walk reached. The refused ones: the picker's act before a material is chosen, the finale's act before a name, *Discard* on a given quote, a given quote's options, and the file door while the file is read.
- **The percentage beside a state** is the share of that crop's pixels that differ from *rest* by more than 12 levels in any channel. It measures "does anything visibly change". The walk also read the computed style of every control in every state.
- **The PNGs are ignored by git** (`.gitignore`: `docs/research/refs/**/*.png`), so they live on this disk only, as every sweep's frames do. The links below work locally.

---

## The finding

The app is built from two primitives, Button and Tile, plus type. Everything else a screen draws is type in a box. That box usually has a hairline, a square corner and a flat fill. It does not move when it is pressed, it carries no icon, and colour is spent on it only when it is the one amber act or the lit door on the pill.

The libraries the owner named are installed and almost unused:

| library | measured on this tree |
|---|---|
| `motion` | Imported in 1 file, as `import type { Transition }` in `src/ui/motion.ts`. Its `spring` presets and `transition()` have 0 consumers, so motion's runtime is used nowhere. |
| `@phosphor-icons/react` | 1 file, `src/ui/Select.tsx`: a caret and a check. A Select is drawn only inside Data's *New register* dialog and the sheet's *26 more* popover. |
| `@number-flow/react` | 1 place: Home's search count ("513 lines answer to that"). |
| `gsap`, `lenis`, `lucide-react`, `embla-carousel-react` | 0 imports. |
| `sonner` | Installed and wrapped, and the `Toaster` is mounted nowhere (`Configurator.tsx` says so). |
| View Transitions (`startViewTransition`, `view-transition-name`) | 0 uses. |
| Rive, Lottie, any shader | Not installed. |

What the walk measured:

- **Icons.** 603 control instances were read across 18 states of the 13 screens (the pill counts once per frame). Not one carries an SVG icon. The arrows, the finder's ⌕, the chapters' + and −, the sheet's ▸ and ›, and the register's ○ ● ⊖ are all characters of the system font.
- **The face.** It is the system font. `--font-sans` starts at `system-ui`, so it is Segoe UI on this machine and San Francisco on a Mac. Both picked boards asked for Söhne (`tokens.css`, "THE FACES ARE STILL SYSTEM STACKS"). Type does all the work in a face the operating system chose.
- **Press.** Only `button.css` and `tile.css` have an `:active` rule; none of the 13 screen stylesheets does. 35 sets of photographs include a held press. In 16 of them the pressed photograph is exactly the hover photograph, so a press gets no answer:
  - the pill's crest, doors and Find bubble;
  - the build's chapter heads;
  - the register's row and its cover;
  - History's line;
  - the customers book's row;
  - Data's plates, pairing lines and rows;
  - the sheet's chapter tabs, reading toggle, door segments, picture cards and no-picture names.
- **Hover.** The everyday button (veiled) changes 3.2–3.9% of its pixels on hover, a chip 3.3–4%, a rail row 1.3% and a chapter head 0.4%. Every text field changes 0%.
- **Depth.** No Button, Tile, Input or Select has a shadow at rest.
- **One control, three shapes.** Nine of 13 screens redefine `--radius-sm` (and `--radius-xs`, `--radius-md` or `--radius-lg`) to `0px` in their own scope. So the same Button and Input are square on Home, the build, the cascade, the paper, Quotes, History, Customers, Data and the sheet. They are 10–12px round on Entry, the picker, Lost and every overlay.
- **Motion that exists.** 11 `@keyframes` in 6 stylesheets, every one an entrance: the picker's rise and plate, the crest arriving, the Data spread and its bars, History's spine, the Customers book, the sheet's record. There are also 21 `transition` declarations across the screen stylesheets, some of them `transition: none`. The shell says it outright: "Nothing here moves on a press: the pill does not slide, the current word does not animate between doors" (`shell.css`). `tokens.css` records that both picked boards "claim no motion".
- **Colour.** Seven kind inks are declared: blue, carmine, viridian, ochre, violet, teal and graphite. They are spent on Data, History, the sheet and the finder's group dots only. The build's chapters, the register's states, Home's counted kinds and the pill's counts are navy on pale blue.

The picker is the exception, and it shows what the rest could be. It is the one screen where things move: its maker cards rise in a 40ms stagger, a photograph grows to 1.04 under the pointer while the arrow nudges, and the plate slides in.

---

## Defects found while photographing (reported, not fixed)

1. **A popover and a select's list are drawn under other things.** `.ui-popover`, `.ui-select-popup` and `.ui-menu` carry `z-index: 60` on an element whose `position` is `static`, so the number does nothing. Their Base UI positioner stacks at `z-index: auto`.
   - The sheet's *26 more* popover is under the pill. At the popover's title, the topmost element is the pill's `Ctrl` keycap: [screen-21-sheet-more](audit/screen-21-sheet-more.png).
   - The Select's list in Data's *A new register* dialog is under the dialog and its backdrop. At the list's first item, the topmost element is the dialog's description: [screen-20-data-dialog-select](audit/screen-20-data-dialog-select.png), [select--open](audit/select--open.png).
   - The same frame of the sheet shows the price list's cell cursor ($1,524) drawn over the popover's *Show as a column*.
   - The comments above each rule say "ABOVE THE SHELL … the overlays in this folder are the top of the app". That is not what the browser does.
2. **Floating chrome over scrolled content has no edge.** Scrolled content passes under the pill and under the build's sticky search, where a word is cut clean: [screen-11-cascade-acts](audit/screen-11-cascade-acts.png) ("RE-PRICED" under the pill), [screen-13-configurator-given](audit/screen-13-configurator-given.png). The picker plate's spec strip is cut at its scroll edge with no fade, and "6.52 m" is half there: [screen-07-picker-plate](audit/screen-07-picker-plate.png).
3. **Screens fork the primitives' shape through the token cascade.** `src/ui` refuses `className` and `style` so that a screen cannot fork a primitive's look. Redefining `--radius-sm: 0px` on a screen's root does exactly that, on nine screens. `tools/check.ts` does not see it.

---

## The inventory

**87 kinds**: 22 from the primitives in `src/ui`, and 65 that a screen draws in its own stylesheet.

- 38 take a press or focus.
- 46 are surfaces that frame, count or label.
- 3 are primitives nothing draws: Menu, Tooltip and the Toaster.

The walk counted 603 control instances across 18 states of the 13 screens.

"Control" in the second column means it takes a press or focus; "surface" means it does not.

### A · The primitives (`src/ui`)

| # | kind | what it is | where | photographed | what makes it bland |
|---|---|---|---|---|---|
| 1 | Button · act | control | Home *New quote*, picker *Start the quote*, *Address this quote*, *Print*, *Price it at Trade*, History and Customers acts, Lost *Home* (as a link) | [rest](audit/button-act--rest.png) · [hover 59.6%](audit/button-act--hover.png) · [pressed 60.3%](audit/button-act--pressed.png) · [focused 19.1%](audit/button-act--focused.png) · [on the plate](audit/button-act--live-on-plate.png) · [in the cascade](audit/button-act--in-cascade.png) · [Print](audit/button-act--print.png) · [in a chapter](audit/button-act-build--rest.png) · [as a link](audit/link-act--rest.png) | Colour is spent here and only here: the one warm fill in the app. Beyond that it is a flat amber slab with no edge light, no gradient and no shadow. It is square on nine screens and 10px round on Lost. The trailing "→" is a character that does not move on hover. Hover is one step darker, and press adds `scale(.97)` on top: 0.7% more pixels than hover. |
| 2 | Button · act, refused | control | picker plate before a material (`refusedBy`); the finale's *Give it to the customer* before a name (`refusedBecause`) | [picker, rest](audit/button-act-refused--rest.png) · [hover 0%](audit/button-act-refused--hover.png) · [pressed 0%](audit/button-act-refused--pressed.png) · [focused 18.4%](audit/button-act-refused--focused.png) · [finale, with its sentence](audit/button-act-refused-sentence--refused.png) | It is honest: focusable, with a sentence. But one state has two looks, pale blue on the picker (a recorded decision in `picker.css`) and dark amber in the finale. When it comes live, nothing marks the moment: the fill swaps in 100ms and no glyph or light says it unlocked. |
| 3 | Button · veiled (the everyday button, `md` and `sm`) | control | *Quote the ADV7*, *See what Trade does*, *Make a new version*, *Back to the build*, *New register*, *Change name*, *Add phone*, History's ranges, the book's sort; 63 call sites | [rest](audit/button-veiled--rest.png) · [hover 3.5%](audit/button-veiled--hover.png) · [pressed 10.1%](audit/button-veiled--pressed.png) · [focused 19.8%](audit/button-veiled--focused.png) · [in the build](audit/button-veiled--in-build.png) · [on the desk](audit/button-veiled--on-desk.png) · [on a register](audit/button-veiled--on-register.png) · [*Make a new version*](audit/button-veiled-panel--rest.png) · [sm](audit/button-veiled-sm--rest.png) · [sm hover 3.9%](audit/button-veiled-sm--hover.png) | The most-drawn button in the app is a white rectangle with a 45% navy hairline and a square corner. It has no fill, no shadow and no icon. Hover darkens the hairline and takes the fill from 95% to 100% white: 3.2–3.9% of its pixels. It reads as a form field more than a button. |
| 4 | Button · veiled, refused | control | *Discard this quote* on a given quote | [refused](audit/button-veiled-refused--refused.png) · [hover](audit/button-veiled-refused--hover.png) · [focused](audit/button-veiled-refused--focused.png) | The ink drops a step and the sentence sits beneath. Nothing but the ink says "not now". |
| 5 | Button · primary | control | *Make it* in the *New register* dialog. Ten call sites; the others (the sheet's record and Pictures door, Customers, Entry's door) were not all reached by this walk | [in the dialog](audit/dialog--new-register.png) | The only rounded blue-filled button this walk saw on a light ground. Blue means the file on Entry and "a button" in a dialog. |
| 6 | Button · door | control | Entry *Load the Master Price File*; Lost *Start a quote* (as a link) | [rest](audit/button-door--rest.png) · [hover 71.5%](audit/button-door--hover.png) · [pressed 73.1%](audit/button-door--pressed.png) · [focused 8.1%](audit/button-door--focused.png) · [refused while the file is read](audit/button-door--refused.png) · [Lost](audit/link-door--rest.png) · [Lost hover 1.6%](audit/link-door--hover.png) | A flat blue slab with a title, a sub-line and a typed arrow. While 53 lists and 15,691 lines are read it goes two steps darker and says "The Master Price File is being read now.": no progress, no count, nothing that moves. Lost's door hovers at 1.6%. |
| 7 | Tile · card | control | picker makers and models; Home's open draft | [maker, rest](audit/tile-maker-door--rest.png) · [hover 19.8%](audit/tile-maker-door--hover.png) · [pressed 23.8%](audit/tile-maker-door--pressed.png) · [focused 7.4%](audit/tile-maker-door--focused.png) · [model](audit/tile-model-card--rest.png) · [hover 10.1%](audit/tile-model-card--hover.png) · [selected](audit/tile-model-card--selected.png) · [no picture held](audit/tile-model-card-nopic--rest.png) · [its hover 1.6%](audit/tile-model-card-nopic--hover.png) · [Home's draft](audit/tile-home-quote--rest.png) · [its hover 82.3%](audit/tile-home-quote--hover.png) | The best tile in the app on the picker: the photograph grows and the arrow nudges. Selection is still only a 2px blue border, with no lit rim, tinted picture or depth. A card with no picture held is a pale gradient with the name in 300 weight, which reads as an image that failed. Home's draft card fills entirely grey-blue on hover (82% of its pixels): flat and heavy. |
| 8 | Tile · row | control | picker's makers rail; a chapter's options (on the room); a customer's quotes | [rail](audit/tile-row--rest.png) · [hover 1.3%](audit/tile-row--hover.png) · [pressed 6.8%](audit/tile-row--pressed.png) · [focused 18.7%](audit/tile-row--focused.png) · [selected](audit/tile-row--selected.png) · [option](audit/tile-option-row--rest.png) · [hover 82.3%](audit/tile-option-row--hover.png) · [selected](audit/tile-option-row--selected.png) · [refused (issued)](audit/tile-option-row-refused--rest.png) · [their quote](audit/tile-room-row--rest.png) · [hover 21.2%](audit/tile-room-row--hover.png) | The chosen row is a 3px accent bar that scales in: the one well-made state change here. There is no check, no leading glyph, and the option rows have nothing that says *motor* or *rigging kit*. A rail row's hover is 1.3%, and an option row's is a whole-row wash. On a given quote a refused option looks exactly like a live one; the one sentence above the list is the only difference. |
| 9 | Tile · chip | control | the plate's material and colourway | [material](audit/tile-chip--rest.png) · [hover 4%](audit/tile-chip--hover.png) · [pressed 9.4%](audit/tile-chip--pressed.png) · [focused 29.5%](audit/tile-chip--focused.png) · [selected](audit/tile-chip--selected.png) · [colourway](audit/tile-chip-colour--rest.png) · [hover 3.3%](audit/tile-chip-colour--hover.png) · [selected](audit/tile-chip-colour--selected.png) | The place a buyer chooses a colour is a white box with a 1px border. The colour is three 12px squares inside it. Selection is a 2px ring. |
| 10 | Input (`md`, `lg`, on the blue masthead, in a chapter, beside a `/` cap) | control | Entry's name; Home's search; picker's find; the build's option search; *Who the quote is addressed to*; every register's find | [lg](audit/input-lg--rest.png) · [lg focused 16.2%](audit/input-lg--focused.png) · [lg filled](audit/input-lg--filled.png) · [md](audit/input-md--rest.png) · [md hover 0%](audit/input-md--hover.png) · [md focused 26.3%](audit/input-md--focused.png) · [on blue](audit/input-on-blue--rest.png) · [on blue focused](audit/input-on-blue--focused.png) · [with `/`](audit/input-with-slash--rest.png) · [in a chapter](audit/input-ask--rest.png) · [filled](audit/input-ask--filled.png) | A search field with no magnifier. Hover is 0% on every field. Focus is the three-ring shadow, strong and accessible, and the only emphatic state a field has. The corner is square on nine screens and 10px on the picker and Entry. |
| 11 | Field | surface | the *New register* dialog | [rest](audit/field--rest.png) | Label, control and description in a single ink colour. |
| 12 | Select | control | the *New register* dialog; the sheet's *26 more* | [rest](audit/select--rest.png) · [hover 3.7%](audit/select--hover.png) · [focused 19.1%](audit/select--focused.png) · [open, under the dialog](audit/select--open.png) | It holds the app's only two icons (Phosphor's caret and check). Its list opens under the dialog (defect 1). |
| 13 | Popover | surface | the sheet's *26 more* | [open](audit/popover--open.png) · [in its screen](audit/screen-21-sheet-more.png) | A white panel of text links ("Show as a column" 25 times), with no toggle, icon or preview. It opens under the pill (defect 1). |
| 14 | Dialog | surface | the `?` sheet; *A new register* | [the `?` sheet](audit/dialog--open.png) · [new register](audit/dialog--new-register.png) | A white panel over a 40% navy backdrop that scales in from 0.96. It is one of the few real entrances. Its close is the word *Close*. |
| 15 | Menu | not drawn | — | none: no screen draws one | A primitive nobody uses. |
| 16 | Tooltip | not drawn | — | none: no screen draws one | A primitive nobody uses. |
| 17 | Toaster | not drawn | — | none: mounted nowhere | Sonner is installed, and the app has never shown a toast. |
| 18 | Kbd | surface | the pill's *Find*, Home's search, the finder, the `?` sheet | [Home](audit/kbd--rest.png) · [the pill](audit/pill-find--rest.png) · [the `?` sheet](audit/screen-04-shortcuts.png) | A 1px grey box. The closest thing to a physical key in the app, and still flat. |
| 19 | Figure (NumberFlow) | surface | Home's search count | [typed "sport"](audit/figure--typed.png) | The only figure in the app that moves. The pill's counts, the band counts and Data's counts are static text. |
| 20 | PriceFigure | surface | every price | [on the plate](audit/price-figure--rest.png) | Correctly still: it never counts up. It is set in the system face at 300 weight, the same voice as every other number. |
| 21 | Refusal | surface | under every refused control | [the finale's](audit/button-act-refused-sentence--refused.png) · [*Discard*](audit/button-veiled-refused--refused.png) · [the door's](audit/button-door--refused.png) · [above a list](audit/cfg-shut--rest.png) | Honest and legible. It is tied to its control by adjacency alone, with no rule, glyph or shared edge. |
| 22 | Swatches | surface | a colourway on the plate, the build, the paper, the book, the sheet | [on the plate](audit/swatches--rest.png) | Colour drawn at its smallest: 12px squares, or a 14 × 12 flag on the sheet. |

### B · The shell (`src/screens/shell`)

| # | kind | what it is | photographed | what makes it bland |
|---|---|---|---|---|
| 23 | The pill | surface | [over a photograph screen (glass)](audit/pill--rest.png) · [over a register (panel)](audit/pill--over-a-register.png) | The best-made object in the app: glass with a 20px blur over a photograph, a panel over a register, a shadow. But no door carries an icon. Nothing moves between doors ("Nothing here moves on a press"). Scrolled content passes under it with no edge (defect 2). |
| 24 | Crest | control | [rest](audit/pill-crest--rest.png) · [hover 0%](audit/pill-crest--hover.png) · [pressed 0%](audit/pill-crest--pressed.png) · [focused 27.6%](audit/pill-crest--focused.png) | The logo's slot is the letters "NM" in a blue medallion. Hover and press change nothing. |
| 25 | Pill door | control | [rest](audit/pill-door--rest.png) · [hover 38.3%](audit/pill-door--hover.png) · [pressed 38.3%](audit/pill-door--pressed.png) · [focused 21.4%](audit/pill-door--focused.png) · [current](audit/pill-door--selected.png) | Words only. A press is the hover. The lit door does not travel; it jumps. Counts are 11px grey characters. |
| 26 | Find bubble | control | [rest](audit/pill-find--rest.png) · [hover 4.5%](audit/pill-find--hover.png) · [pressed 4.5%](audit/pill-find--pressed.png) · [focused 19.9%](audit/pill-find--focused.png) | ⌕ is a typed character. Hover is 4.5%, and a press is the hover. |
| 27 | Finder sheet | surface | [open](audit/finder-sheet--open.png) · [in its screen](audit/screen-03-finder-open.png) · [typed](audit/screen-03-finder-typed.png) | Rightly instant (a keyboard act done a hundred times a day). A white slab: a boat, a quote, a customer and a table all look alike. The verbs are caps words in amber or blue. |
| 28 | Finder row, and its group head | control | [rest](audit/finder-row--rest.png) · [hover 83.3%](audit/finder-row--hover.png) · [lit](audit/finder-row--lit.png) · [group head](audit/finder-group--typed.png) | No picture, mark or icon per kind. A group is told apart by a 6px dot and a caps word. |
| 29 | Finder close | control | [rest](audit/finder-close--rest.png) · [hover 5.5%](audit/finder-close--hover.png) · [focused 24.8%](audit/finder-close--focused.png) | The word *Close* and an Esc cap in a hairline box. |

### C · Entry

| # | kind | what it is | photographed | what makes it bland |
|---|---|---|---|---|
| 30 | Pennant, the mark's slot | surface | [rest](audit/entry-pennant--rest.png) · [hover 0%](audit/entry-pennant--hover.png) · [in its screen](audit/screen-01-entry.png) | "I want the logo to be the showpiece thing." The showpiece is the name set in tracked caps on a blue pennant, with a sentence saying the mark has not been added. It never moves. |
| 31 | Card on the photograph | surface | [rest](audit/entry-card--rest.png) | White glass at 92%, an 18px radius and a deep shadow: the richest material in the app. It is still. |
| 32 | Caption in the photograph | surface | [rest](audit/entry-goods--rest.png) | A blue rule and three lines of type. |

### D · Home

| # | kind | what it is | photographed | what makes it bland |
|---|---|---|---|---|
| 33 | Caption plate on a photograph | surface | [rest](audit/home-plate--rest.png) | A white rectangle laid over the picture, with no radius, no shadow and no glass. It is cut from the photograph rather than floated on it. |
| 34 | What Northside sells (counted kinds) | surface | [rest](audit/home-kinds--rest.png) | Six numbers at 30px over 11px caps. Boats, motors, trailers, packages, parts and labour look identical: no icon, no kind ink. |
| 35 | The makers' shelf | surface | [rest](audit/home-makers--rest.png) · [hover 0%](audit/home-makers--hover.png) | The makers' marks on a paper panel. They are not doors: hover 0%. |
| 36 | Open drafts, and the numbered steps | surface | [drafts, empty](audit/home-drafts--rest.png) · [steps](audit/home-steps--rest.png) · [with a draft](audit/screen-25-home-with-a-draft.png) | Thin 300-weight numerals and sentences. The draft's "No photograph held for this model" is a grey outlined box with caps words in it. |

### E · The picker

| # | kind | what it is | photographed | what makes it bland |
|---|---|---|---|---|
| 37 | Series head | surface | [rest](audit/series-head--rest.png) | A caps word in blue and a count. |
| 38 | The plate (a chosen boat) | surface | [rest](audit/picker-plate--rest.png) · [chosen](audit/screen-08-picker-chosen.png) | A white 18px panel that slides in 12px: one of the app's few entrances. The spec strip is words, and the body is cut at its scroll edge with no fade. The boat on it, when no picture is held, is the name set large on a pale gradient. |

### F · The build (`/quote/$id`)

| # | kind | what it is | photographed | what makes it bland |
|---|---|---|---|---|
| 39 | Masthead with the total | surface | [rest](audit/cfg-mast--rest.png) | The reference in caps, the boat's name and the total, all in the system face at 300 weight on pale blue. |
| 40 | The stage, with no picture held | surface | [rest](audit/cfg-stage--rest.png) | A flat navy block holding the maker's white mark. It never changes while the boat is built. |
| 41 | Spec grid | surface | [rest](audit/cfg-specs--rest.png) | Label and value pairs under hairlines, with no glyph for length, beam or weight. |
| 42 | Price-level chip and its switch | control | [rest](audit/cfg-rung--rest.png) | *Cash 4 of 5 lines* is a grey block with a blue left rule, and *See what Trade does* is a veiled button beside it. The two levels are not drawn as a pair: no segmented control. |
| 43 | Chapter head | control | [rest](audit/cfg-chapter-head--rest.png) · [hover 0.4%](audit/cfg-chapter-head--hover.png) · [pressed 0.4%](audit/cfg-chapter-head--pressed.png) · [focused 5.9%](audit/cfg-chapter-head--focused.png) · [open](audit/cfg-chapter-head--open.png) · [in its screen](audit/screen-10-configurator-motor.png) | The spine of the sale. Hover turns the name blue (0.4% of pixels), and a press is the hover. + and − are characters. The chapter opens by a cut, with no height or opacity change. The number 01–04 is grey type, and nothing says hull, motor, trailer or fit. |
| 44 | The finale's figures | surface | [rest](audit/cfg-sums--rest.png) · [unaddressed](audit/screen-12-configurator-finale-unaddressed.png) | *Lines 5 · Not priced 1 · Total*, which is type. |
| 45 | A flag (an amber rule) | surface | [rest](audit/cfg-flag--rest.png) | A 3px amber rule on a grey wash. |
| 46 | The last step's line | surface | [rest](audit/cfg-step--rest.png) · [given](audit/screen-13-configurator-given.png) | "20260916-01 is issued" in a white strip. The issuing of the quote, the moment of the sale, is this line. |
| 47 | The one refusal above a list | surface | [rest](audit/cfg-shut--rest.png) · [in its screen](audit/screen-14-configurator-issued-motor.png) | A grey wash strip with a sentence in it. |

### G · The cascade

| # | kind | what it is | photographed | what makes it bland |
|---|---|---|---|---|
| 48 | The build card on the blue ground | surface | [rest](audit/csc-build--rest.png) · [in its screen](audit/screen-11-cascade.png) | The ground is a still two-stop blue gradient, and the card is white with no radius. |
| 49 | What you chose | surface | [rest](audit/csc-asked--rest.png) | A caps eyebrow, the word, and a typed dash. |
| 50 | Cause card with its figure chip | surface | [rest](audit/csc-card--rest.png) · [hover 0%](audit/csc-card--hover.png) | A white box with a hairline and a soft shadow. The difference (−$3,437) sits in a grey chip. *Re-priced*, *Held* and *No change* look alike. |
| 51 | A change row (from → to) | surface | [rest](audit/csc-row--rest.png) · [hover 0%](audit/csc-row--hover.png) | Cash and Trade side by side with a typed →. The row that *is* the decision has no weight of its own. |
| 52 | The decision's acts | control | [rest](audit/csc-acts--rest.png) · [in its screen](audit/screen-11-cascade-acts.png) | An act beside a veiled button. See rows 1 and 3. |

### H · The paper (`/quote/$id/document`)

| # | kind | what it is | photographed | what makes it bland |
|---|---|---|---|---|
| 53 | The desk above the paper | surface | [rest](audit/doc-chrome--rest.png) · [in its screen](audit/screen-15-document.png) | *Back to the build* and *Print*, which are rows 3 and 1. |
| 54 | The A4 page | surface | [rest](audit/doc-page--rest.png) | Correctly still and paper-like: crop marks and a deep shadow. The cover with no picture held is a flat blue panel holding the mark. |
| 55 | Not on the paper (the side panel) | surface | [rest](audit/doc-desk--rest.png) | A white 12px panel of 13px text. |

### I · Quotes

| # | kind | what it is | photographed | what makes it bland |
|---|---|---|---|---|
| 56 | Band head with its glyph | surface | [issued](audit/qr-bandhead--rest.png) · [draft](audit/qr-bandhead--draft.png) · [three bands](audit/screen-24-quotes-three-bands.png) | ○ ● ⊖ are font characters in navy. Draft, given and superseded share one ink. |
| 57 | Register row | control | [the cursor row](audit/qr-row--rest.png) · [hover 0%](audit/qr-row--hover.png) · [pressed 0%](audit/qr-row--pressed.png) · [list focused](audit/qr-row--list-focused.png) · [a draft](audit/qr-row--draft.png) | The cursor is a 6% wash and a 2px edge. It does not travel, and a press changes nothing. Focus belongs to the list: the ring goes round the whole list. |
| 58 | The peek room (the lit quote's cover) | control | [rest](audit/qr-shown--rest.png) · [hover 0.4%](audit/qr-shown--hover.png) · [pressed 0.4%](audit/qr-shown--pressed.png) · [focused 2.4%](audit/qr-shown--focused.png) | A 900px white button with the maker's mark in it. Hover and press change 0.4%. |
| 59 | Tally tile | surface | [rest](audit/qr-tally--rest.png) · [hover 0%](audit/qr-tally--hover.png) | A grey slab per state with a 30px count, all three identical but for the glyph. |
| 60 | The panel (a quote read in place) | surface | [rest](audit/qr-peek--rest.png) · [in its screen](audit/screen-16-quotes-peek.png) | A definition list and three acts. |

### J · History

| # | kind | what it is | photographed | what makes it bland |
|---|---|---|---|---|
| 61 | Range toggle | control | [rest](audit/range-toggle--rest.png) · [hover 3.9%](audit/range-toggle--hover.png) · [pressed 12.7%](audit/range-toggle--pressed.png) · [focused 29.7%](audit/range-toggle--focused.png) · [selected](audit/range-toggle--selected.png) | Five veiled buttons standing apart. The chosen range gets a blue underline. It is not a segmented control, and the underline does not slide. |
| 62 | Day head with its node | surface | [rest](audit/hy-dayhead--rest.png) | An amber dot on the spine and *Today*. |
| 63 | Diary line, and its fold | control | [rest](audit/hy-line--rest.png) · [hover 0%](audit/hy-line--hover.png) · [pressed 0%](audit/hy-line--pressed.png) · [list focused](audit/hy-line--list-focused.png) · [open](audit/hy-line--open.png) · [open in its screen](audit/screen-17-history-open.png) | The kinds are 6px dots. A press is nothing, and the fold opens by a cut. |
| 64 | The fortnight | surface | [rest](audit/hy-rhythm--rest.png) · [in its screen](audit/screen-17-history.png) | One of the few surfaces that draws itself in (`hy-draw`, `hy-settle`). With one day kept it is a 1000px card with an amber border. |
| 65 | Since-figures and the legend of kinds | surface | [figures](audit/hy-end--rest.png) · [legend](audit/hy-inks--rest.png) | The one screen where the kind inks read: *given* in green. The legend is 11px text. |

### K · Customers

| # | kind | what it is | photographed | what makes it bland |
|---|---|---|---|---|
| 66 | The letter on paper | surface | [rest](audit/cu-paper--rest.png) · [in its screen](audit/screen-18-customers.png) | A good object (paper with a shadow), and the edits beside it are four small veiled buttons ([*Change name*](audit/button-veiled-sm--rest.png)). |
| 67 | The yard's note band | surface | [rest](audit/cu-note--rest.png) | A navy band with an *Add* button, and no glyph for "note". |
| 68 | Written · given · in all | surface | [rest](audit/cu-figures--rest.png) | Three numbers over caps. |
| 69 | Sort toggle | control | [rest](audit/sort-toggle--rest.png) · [hover 4.5%](audit/sort-toggle--hover.png) · [pressed 9.9%](audit/sort-toggle--pressed.png) · [focused 37.8%](audit/sort-toggle--focused.png) · [selected](audit/sort-toggle--selected.png) · [in its screen](audit/screen-19-customers-book.png) | Two veiled buttons: *A to Z* and *By what is next*. |
| 70 | Book row | control | [the cursor row](audit/cu-row--rest.png) · [hover 0%](audit/cu-row--hover.png) · [pressed 0%](audit/cu-row--pressed.png) · [list focused](audit/cu-row--list-focused.png) | The cursor is a wash and an edge; a press is nothing. |

### L · Data

| # | kind | what it is | photographed | what makes it bland |
|---|---|---|---|---|
| 71 | Maker plate and its door | control | [rest](audit/dt-plate--rest.png) · [hover 0%](audit/dt-plate--hover.png) · [pressed 0%](audit/dt-plate--pressed.png) · [focused 17.3%](audit/dt-plate--focused.png) · [selected](audit/dt-plate--selected.png) · [in its screen](audit/screen-20-data.png) | A paper plate with the maker's mark. Hover and press change nothing. Selected gets a blue border and a caret notch. |
| 72 | Pairing line with its kind tick | control | [rest](audit/dt-chip--rest.png) · [hover 6.9%](audit/dt-chip--hover.png) · [pressed 6.9%](audit/dt-chip--pressed.png) · [focused 48.1%](audit/dt-chip--focused.png) | 11px text with a kind-coloured square. Hover is an underline, and a press is the hover. |
| 73 | Ledger row with its kind word | control | [the cursor row](audit/dt-row--rest.png) · [hover 0%](audit/dt-row--hover.png) · [pressed 0%](audit/dt-row--pressed.png) · [list focused](audit/dt-row--list-focused.png) | The kind is a tick and an 11px caps word in its ink, with no icon for motors, trailers or parts. |
| 74 | The spread (a maker opened in place) | surface | [rest](audit/dt-spread--rest.png) · [in its screen](audit/screen-20-data-spread.png) | Its series bars grow in, one of the few things that moves. The pairing tiles are flat colour blocks. |

### M · The sheet (`/data/$table`)

| # | kind | what it is | photographed | what makes it bland |
|---|---|---|---|---|
| 75 | Masthead (mark, title, shared facts) | surface | [rest](audit/sh-mast--rest.png) · [in its screen](audit/screen-21-sheet.png) | The mark, a title, and `cost` chips in grey boxes. |
| 76 | Chapter tab on the blue bar | control | [rest](audit/sh-chapter--rest.png) · [hover 0%](audit/sh-chapter--hover.png) · [pressed 0%](audit/sh-chapter--pressed.png) · [focused 8.1%](audit/sh-chapter--focused.png) · [current](audit/sh-chapter--selected.png) | White on blue. Hover and press change nothing, and the current tab's white slab jumps from tab to tab. |
| 77 | Reading toggle (*Only the models*) | control | [rest](audit/sh-reading--rest.png) · [hover 0%](audit/sh-reading--hover.png) · [pressed 0%](audit/sh-reading--pressed.png) · [focused 36.7%](audit/sh-reading--focused.png) | A hairline box on the blue bar that answers nothing but focus. |
| 78 | Door segment (*Price list · Pictures · Every column*) | control | [rest](audit/sh-door--rest.png) · [hover 0%](audit/sh-door--hover.png) · [pressed 0%](audit/sh-door--pressed.png) · [focused 36.7%](audit/sh-door--focused.png) · [current](audit/sh-door--selected.png) · [Pictures](audit/screen-22-sheet-pictures.png) | Three words, the current one a white slab. It is the same drawing as a chapter tab, so two different kinds of choice look alike. |
| 79 | Column head with its price level | control | [rest](audit/sh-th--rest.png) · [hover 5.5%](audit/sh-th--hover.png) · [focused 10.2%](audit/sh-th--focused.png) · [selected](audit/sh-th--selected.png) | 11px caps. The level being read is marked by a rule. |
| 80 | *26 more ▸* (a popover door) | control | [rest](audit/sh-more--rest.png) · [hover 5.8%](audit/sh-more--hover.png) · [focused 10%](audit/sh-more--focused.png) | The ▸ is a character. What it opens is drawn under the pill (defect 1). |
| 81 | Series band | surface | [rest](audit/sh-sband--rest.png) | Caps and counts on pale blue. |
| 82 | Model spine and its toggle | control | [spine](audit/sh-spine--rest.png) · [hover 0%](audit/sh-spine--hover.png) · [toggle](audit/sh-spine-toggle--rest.png) · [toggle hover 0.5%](audit/sh-spine-toggle--hover.png) · [toggle focused 10.3%](audit/sh-spine-toggle--focused.png) | A white block of text with coloured square bullets. *Shut* is a word. |
| 83 | A cell of the price list | control | [rest](audit/sh-cell--rest.png) · [hover 0%](audit/sh-cell--hover.png) · [pressed 7%](audit/sh-cell--pressed.png) · [focused 12.8%](audit/sh-cell--focused.png) · [the cursor](audit/sh-cell--selected.png) · [in its screen](audit/screen-21-sheet-cursor.png) | A spreadsheet cell, which is right for this screen. Hover is 0%. |
| 84 | Picture card | control | [rest](audit/sh-card--rest.png) · [hover 18.7%](audit/sh-card--hover.png) · [pressed 18.7%](audit/sh-card--pressed.png) · [focused 1.9%](audit/sh-card--focused.png) | Hover turns the border and the name blue, and a press is the hover. The picture is still. |
| 85 | A name without a picture | control | [rest](audit/sh-bare-row--rest.png) · [hover 79.5%](audit/sh-bare-row--hover.png) · [pressed 79.5%](audit/sh-bare-row--pressed.png) · [focused 15%](audit/sh-bare-row--focused.png) | A whole-row wash on hover and a typed ›. A press is the hover. |

### N · Lost (`/nope`)

| # | kind | what it is | photographed | what makes it bland |
|---|---|---|---|---|
| 86 | The address plate | surface | [rest](audit/lost-at--rest.png) · [in its screen](audit/screen-23-lost.png) | A white 12px box with the address in the system mono. |
| 87 | Lost's two ways out, as links | control | [act](audit/link-act--rest.png) · [act hover 57.5%](audit/link-act--hover.png) · [act pressed](audit/link-act--pressed.png) · [door](audit/link-door--rest.png) · [door pressed 9.7%](audit/link-door--pressed.png) | Rows 1 and 6 as `<a href>`: here they are 10–12px round, and square on nine other screens. |

---

## The ten changes that would change the feel most

Ranked by how much of the app each one reaches, weighed against how simple the result stays: "simple wins", and character comes from materials, light, icons, type and motion, never from more things on the screen. Every one reads tokens, so Northside's own mark, accent and pictures flow through it. Every one also keeps the rules that do not bend:

- the price never counts up and never animates on an issued document;
- nothing moves while a caret is in a text field;
- reduced motion keeps colour and opacity and removes movement;
- every control stays reachable by keyboard with a visible focus;
- a refusal stays a sentence;
- nothing is drawn over anything else.

### 1. Give the two primitives a material: one edge of light, one depth, one shape

Every Button and Tile is a flat fill or a hairline box (rows 1–9), square on nine screens and round on four. Give them what Raycast's keycap and Stripe's lit ring have (`../components/notes.md` §2, *the keycap* and *the lit edge*):

- **A lit top edge and a contact shadow** in the control's own hue, from new tokens (`--edge-light`, `--shadow-key`) derived from `--color-accent` and `--color-act`, so Northside's accent re-lights them.
- **A press that sinks:** `translateY(1px)`, the shadow collapsing and the edge dimming, at `--duration-press`.
- **Selection as a lit rim:** an accent ring, a 6% accent wash, and on a card a tinted picture, instead of a 1–2px border swap.
- **One radius step for controls**, with the screens' `--radius-sm: 0px` overrides removed. Today they fork the primitive's look through the cascade (defect 3), and a guard in `tools/check.ts` should refuse a screen redefining a primitive's token.

Reduced motion keeps the colour and drops the sink. This alone changes the everyday button that 63 call sites draw.

### 2. Adopt Phosphor on every door, act, chapter, band and kind

Measured: 603 control instances and 0 icons. Phosphor is already the pick (PLAN.md, "Phosphor 2.1 (+ lucide where missing)"), in its duotone weight for the current or chosen state and regular elsewhere. **Always beside the word, never instead of it.**

| where | icon |
|---|---|
| the pill's five doors | House, Receipt, UsersThree, Database, ClockCounterClockwise |
| every act and door | a trailing ArrowRight that nudges on hover |
| the build's chapters | a CaretDown that turns 180° as it opens |
| the kinds everywhere | Boat, Engine, Trailer, Toolbox, Package, Wrench: Home's counted kinds, Data's rows, the finder's groups, the build's chapter numbers |
| the register's bands | Circle, CheckCircle, ArrowsClockwise, replacing the font's ○ ● ⊖ |
| every find field | MagnifyingGlass in the field |
| the finder bubble | MagnifyingGlass, replacing ⌕ |

Icons are drawn in `currentColor`, so contrast is the ink's own.

### 3. Adopt `motion`: presses, the lit door and the register cursor that travel

16 of 35 kinds answer a held press with nothing, and `motion`'s runtime is used nowhere. Use it for what a person did, not for what they typed:

- **The pill's lit door and the sheet's current chapter** become one element each that springs between positions (`layoutId`, `spring.layout`, critically damped). Today the white or blue slab jumps.
- **History's range and the price-level pair** become segmented controls whose thumb slides.
- **The build's chapters** open with a height and opacity spring. **History's fold and Data's spread** open the same way, instead of by a cut.
- **The register and book cursor** travels between rows on a pointer. It stays instant on the keyboard: "Never animate keyboard-initiated actions" (`emil-design-eng`). The finder stays instant for the same reason.

The spring presets already exist in `src/ui/motion.ts` with a reduced-motion form, and nothing consumes them.

### 4. Carry the boat's picture across the sale with the View Transitions API

The plan's own choreography (PLAN.md, "Motion choreography for the flow") was never built, and there are 0 view transitions. Give the model card's picture a `view-transition-name` keyed by the model. That picture then becomes the plate's picture, the build's stage (or the maker's mark where no picture is held: the same element either way, never a stand-in), the cascade's card and the paper's cover. TanStack Router can start the transition on the navigations it owns. Routes crossfade underneath.

The total is given its own name with `animation: none`, so a price never moves on the way. Under reduced motion the crossfade stays and the morph goes.

### 5. A living ground on the Showroom screens: water light in a shader

Showroom screens where there is room for decoration. It is decoration, and nothing in it is a figure:

- Entry's dusk water;
- the picker's masthead (a still two-stop gradient today);
- the cascade's blue ground;
- the build's stage when no picture is held (a flat navy block today).

Draw a WebGL water-caustics ground behind them (the Paper Shaders frame the gallery sweep captured, `gallery/paper-shaders-water.png`, or a small fragment shader), tinted from `--color-accent` and the room's navy so Northside's colour sets the water.

Rules:

- It pauses while a caret is in a field. Entry's name field is exactly that case.
- It is one still frame under reduced motion and when the tab is hidden.
- Its brightest pixel is capped so the white words over it keep their measured 4.5:1.
- It is never behind a register.

### 6. Make the mark the showpiece: an authored reveal, and an authored *given*

The logo's slot is initials in a medallion (row 24) and a caps name on a pennant (row 30), and neither moves. Build the mark slot as the app's one authored moment, in Rive (a state machine: idle, reveal, given) with Lottie as the plan's fallback:

- **The reveal** plays once on Entry when the file has been read, and once per session on Home.
- **Before a mark exists**, the reveal runs on Northside's name in type. It is never an invented logo.
- **When Northside adds its own mark** (`--shell-crest`, Milestone 4), the same reveal runs as a mask over the uploaded image, so the kit stays designed.
- **The second authored moment** is the finale's *Give it to the customer*. Today the sale's moment is the line "20260916-01 is issued" (row 46). It becomes a stamp settling on the plate. The price does not take part.

Under reduced motion both moments are a fade.

### 7. Spend colour on state and kind, the same colour everywhere

Seven kind inks exist and reach four screens. Draft, given and superseded are one navy. Chapters, counted kinds and pill counts are navy on pale blue. Colour should mean one thing app-wide:

| where | colour |
|---|---|
| a motor, anywhere | carmine |
| a trailer | ochre |
| dealer fit | violet |
| a part | viridian |
| draft | amber |
| given | viridian |
| superseded | graphite |

Always a dot or icon beside its word ("The dot with its word", Geist and HIG, `notes.md` §2). Apply it to the build's chapter numbers, the register's bands and tally, Home's counted kinds, the finder's rows and the pill's counts as small tinted badges. The contrast ruler reads every one, and each ink is a token a dealership's accent does not have to fight.

### 8. The build as chapters: GSAP ScrollTrigger, Lenis, and the foot pill whose dash fills

`gsap` and `lenis` are installed and imported in 0 files. The build is an accordion. Take Saxdor's foot pill (`notes.md` §2, *the foot pill whose dash fills*), which the plan already names:

- **The chapters' column scrolls as chapters** under Lenis on a desk.
- **ScrollTrigger holds the stage** and fills one dash per chapter in a pill at the foot: 01 hull, 02 motor, 03 trailer, 04 fit, then who and finale.
- **The stage crossfades** to the chosen motor's or trailer's picture only where one is held.
- **Lenis is off** under reduced motion, on a touch pointer and while a caret is in the option search.
- **Keyboard reach does not change:** every chapter head stays a button.

### 9. Honest liveness in counts and progress: NumberFlow, a border beam, a status that changes its words

- **NumberFlow on counts that are not prices:** the pill's *Quotes n*, the register's band counts, Data's counts as its find narrows, the book's count. When a quote is filed, the pill's number turns over, the one sign the app gives that something was kept. Home's search count is the only place it runs today.
- **Entry's door while the file is read.** Today it is a darker slab with "is being read now" (row 6). It becomes the door with a border beam travelling its edge (magicui's, ported natively), and the sentence counts what has really landed: "17 of 53 lists read", from the loader's own progress, never estimated.
- **The same morphing status** (Family's pill, `notes.md` §2) for *Address* becoming *Addressed* and *Give it* becoming *Given*.

The price never goes through any of this.

### 10. A face with a voice, and tabular figures in their own

`--font-sans` is `system-ui`, so the app wears whichever operating system opens it. This is the owner's call, because both boards name Söhne and a licence is owed (`tokens.css`). The open alternatives are Geist with Geist Mono, which are self-hostable through fontsource and pass the font guard.

The rules that come with a face are what make it read as designed:

- tracking by size: −0.02em from 30px up and slightly positive at 11px caps;
- a light display weight for names and totals, against a firm 600 for act labels;
- a tabular mono for codes and file figures (`HBR005`, `20260916-01`, `15,691`) so they stand in columns.

It changes every one of the 87 kinds at once without adding a thing to any screen.

---

## What is not counted and why

- **The sheet's inline cell editor and its record panel** were not opened. The editor takes a keystroke that writes to the price file, and the audit changes nothing.
- **The night theme** was not photographed. It is offered, not the default (`tokens.css`, THE NIGHT).
- **Phone and tablet widths** were not photographed. The brief asked for 1440 × 900.
