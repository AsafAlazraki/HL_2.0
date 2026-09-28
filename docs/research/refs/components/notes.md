# Components — the sweep, synthesised

Synthesis 2026-09-28, from the four ledgers a cut-off run wrote (`craft/`, `gallery/`, `live/`, `systems/`, every row `capturedAt` 2026-09-24): **46 rows, 45 frames**. The one row with no frame is `live/raycast-home` (`page.screenshot` timed out; the Pro page stands in). **No frame was captured this round: the 45-frame budget was already spent.** **40 frames were opened and looked at**: 37 of the 45 and 3 from the stock at `C:\Users\Asaf\dev\hl-refs\ref\`. The 8 not opened are marked in `sources-index.md`, and nothing below is claimed from them. Paths are relative to this folder; `ref/` means the stock.

**The job.** The controls every screen draws with. The owner: "components are so bland and boring", "tech stack looks SO BORING". Measured in `src/` on 2026-09-28: `motion`, `@phosphor-icons/react` and `@number-flow/react` are imported in 1 file each; `gsap`, `lenis`, `lucide-react` and `startViewTransition` in 0. Rive, Lottie and shaders are not installed. The primary button is a flat `blue-600` fill (`src/ui/button.css`). Character has to come from material, light, icon, type and motion, not from more things.

**Corrections, made by looking.**
1. `live/linear-redesign-theme.png` is not the colour-system section its note names: the scroll landed on the "inverted L-shape" paragraph. Linear's LCH themes rest on the URL alone.
2. `systems/geist-switch.png` shows a text-only `Source | Output` switch, not the icons its note promises.
3. `ref/porsche-1440.png` is Porsche's "No Longer Available" page, not option tiles. Porsche's swatches are relayed from `../configurator/notes.md` §2, unseen this round.
4. `craft/vaul-demo.png` is the Vaul page at rest; the drawer was never opened.

---

## 1. What gives each control its character, and where it belongs

| source · frame | character comes from | showroom | desk |
|---|---|---|---|
| Raycast · `live/raycast-pro.png` | a **keycap** button (light fill, bright top edge, drop shadow); nav in a hairline glass bar; a mono eyebrow in red | yes: the act | yes |
| Arc · `live/arc-home-scrolled.png` | **saturated blue on white and cream**, grain on the band, scalloped edges, press quotes and marks in a marquee; sidebar pinned tiles over folder rows with blue outline icons | yes: the blue-and-white brief with more colour | the sidebar only |
| Stripe Checkout · `live/stripe-checkout-demo.png` | selection as a **coloured ring** plus a tinted picture, not a fill; joined tag `No code \| Low code`; tinted check-circles | yes: model and option tiles | yes |
| Stripe · `live/stripe-home.png` | a **WebGL ribbon** the headline crosses; a figure to eight decimals, `1.72117930%` | the ground, yes | no |
| Stripe Appearance · `live/stripe-appearance-api.png` | a kit that stays designed from **three knobs**: theme, variables, rules | the customisation model | same |
| Framer · `live/framer-home.png` | **a run of rows lit in blue**; status pills `Active ⌄`; one bright blue Publish | the act's colour | yes: registers at night |
| Family · `live/family-values-scrolled.png`, `live/family-home.png` | a **status pill that morphs** (`Analyzing Transaction` with a spinner); icon-led pills; 3D hearts | the pill yes; cartoons no | the pill |
| Geist · `systems/geist-{materials,status-dot,button}.png` | **named materials** (base, small, medium, large: radius and shadow); a status dot always beside its word; flat buttons | no | the naming, yes |
| HIG · `systems/hig-{materials-scrolled,buttons,toggles}.png` | **glass by job** (regular under text, clear over pictures); button = style + content + role; toggles never by colour alone | yes | yes |
| visionOS · `systems/apple-visionos-scrolled.png` | **pill tabs on dark glass**, the chosen one white; a special pill with a lit rim | yes | yes |
| Rauno · `craft/rauno-interaction*.png` | physical metaphors: a real iPad dock, a page mid-turn ("interruptible") | principle | principle |
| Emil · `craft/emil-great-animations.png` | a **visible spring** (stiffness 100, damping 10, mass 1, overshoot drawn); pill buttons `Idle · Ring · Timer` | principle | principle |
| Magic UI · `gallery/magicui-*.png` | light travelling an edge (border beam, shimmer), a faded marquee, a counting figure, a magnifying dock | selectively | counts only |
| React Bits · `gallery/reactbits-*.png` | shader grounds (Silk with noise), shiny text, tick-mark sliders in Customize | grounds yes | no |
| Aceternity · `gallery/aceternity-*.png` | a **light cone** on a dark grid; an **icon in a hairline chip** as card eyebrow | the cone behind the mark | the chip |
| Paper Shaders · `gallery/paper-shaders-water.png` | **water caustics** as a real-time filter, with eight sliders | yes: water light for a boat dealer | no |
| Rive · `gallery/rive-home.png` | authored state-machine motion (watch face, a `127` counter) | one authored moment | no |
| Saxdor · `ref/boats/saxdor-deep-10.png` | a **white foot pill whose dashes fill** (8 of 9, the current dash longer), `8 / 9`, navy `DETAILS`; `230V \| 120V` on a closed band head | yes | yes |
| Axopar · `ref/boats/axopar-cfg-1.png` | **ticked option rows** (outline, filled check-circle, ⓘ at the right); condensed caps `1/3 MAIN SELECTIONS`; price and pager as chips at the stage's foot | yes | yes |

## 2. The patterns worth taking, named

**The lit edge.** State shown as light on the rim, not a heavier fill. Stripe rings the chosen tile in its accent and tints its picture (`live/stripe-checkout-demo.png`). Framer lights a run of three table rows in blue (`live/framer-home.png`). visionOS gives its one special pill a lit rim (`systems/apple-visionos-scrolled.png`). Magic UI's beam is a short accent arc on a card's lower edge (`gallery/magicui-border-beam.png`). It is one idea, drawn from `--color-accent`, so it follows Northside's own colour.

**The keycap.** A button that reads as a physical key: a light fill, a one-pixel bright top edge, a soft drop shadow (`live/raycast-pro.png`, "Compare Plans"). It answers "flat fills" without adding an element. With Apple's press state ("Always include a press state for a custom button", `systems/hig-buttons.png`) it becomes a click you can see.

**The icon-led pill.** A glyph leads the word: Family's `Download on iOS` and `Watch the Video` (`live/family-home.png`), Framer's `Download app ↓`, Arc's `Try Dia →` with its app tile (`live/arc-home-scrolled.png`). HIG names the parts: "a symbol (or icon), text label, or both". Phosphor is installed and imported in one file.

**The icon in a hairline chip.** A 34px rounded square with a 1px rule and one outline glyph, heading a card (`gallery/aceternity-glowing-effect.png`). This is how a Home card, a register band or a settings row gets an icon without a picture it does not have.

**The dot with its word.** Geist never lets colour stand alone: `Queued`, `Building`, `Error` sit beside the dots (`systems/geist-status-dot.png`), and HIG says the same of toggles, "Avoid relying solely on different colors" (`systems/hig-toggles.png`). This is how draft, given and superseded can carry colour without a coloured pill standing in for the word.

**The segment that does not jump.** Geist: "Ensure the width of each item is wide enough to prevent jumping when active" (`systems/geist-switch.png`). HIG draws equal segments holding icons (alignment) or letters (B I U S) (`systems/hig-segmented.png`). Saxdor puts one on a closed band head (`ref/boats/saxdor-deep-10.png`). That is our price-level switch.

**The foot pill whose dash fills.** Saxdor's white pill floats over the page with a row of dashes, filled up to the chapter you are in, then `8 / 9` and one navy act (`ref/boats/saxdor-deep-10.png`). It is the plan's own "foot pill's dash fills on the chapter you are in", seen live on a boat builder.

**The ticked row.** Axopar's options are outlined rows with a filled check-circle leading and ⓘ trailing (`ref/boats/axopar-cfg-1.png`). The chosen state is carried by a glyph, not a colour, and the row still reads as a sentence.

**The morphing status pill.** One pill changes its words and glyph as work moves (`Analyzing Transaction` with a spinner, `live/family-values-scrolled.png`, captioned "Fluidity touches every interaction and component in Family"). For us: reading the price file → "289 boats read", or Issue → Issued.

**Glass by job.** HIG: regular glass under text ("alerts, sidebars, or popovers"), clear glass "over visually rich backgrounds" (`systems/hig-materials-scrolled.png`). The HIG frames show the hero's colour under the blurred header (`systems/hig-toggles.png`): the scroll-edge material, in a still. visionOS puts pill tabs on dark glass, the chosen one white (`systems/apple-visionos-scrolled.png`). That is a material for a chapter or kind row.

**Named materials.** Geist names four surfaces by radius and shadow, not by screen: `material-base` "Everyday use. Radius 6px", up to `material-large` (`systems/geist-materials.png`). Our tokens hold one glass (`--color-glass`, `--blur-glass`, worn only by the door and the shell) and a few shadows; no primitive in `src/ui` can ask for a named material.

**The ground that moves.** Paper's water filter (`gallery/paper-shaders-water.png`), React Bits' Silk with noise intensity 1.5 (`gallery/reactbits-silk.png`) and Stripe's ribbon (`live/stripe-home.png`) all sit behind type, never inside a control.

**The marks in a faded marquee.** Arc runs press marks under a scalloped band (`live/arc-home-scrolled.png`). Magic UI fades both edges so no item is cut hard (`gallery/magicui-marquee.png`). The brand marks Northside holds (`public/brand-marks/`) could be the row under the showpiece mark.

**The three-knob kit.** Stripe: a theme, then variables such as `colorPrimary`, then rules (`live/stripe-appearance-api.png`). This is `docs/CUSTOMISATION.md`'s shape: one accent in, the kit derived.

## 3. Type and motion, as seen

- **Type does the work with no ornament.** Stripe's two-tone headline, dark then slate (`live/stripe-home.png`). visionOS sets white over grey on dark (`systems/apple-visionos-scrolled.png`). Axopar uses condensed caps for the model and the step (`ref/boats/axopar-cfg-1.png`). Raycast sets a price in mono, `Starting at $8/month` (`live/raycast-pro.png`).
- **Springs are shown, not described.** Emil plots stiffness 100, damping 10, mass 1: one overshoot to about 320px, settled near 270px before the unlabelled axis ends at 1380 (`craft/emil-great-animations.png`). The house style in `.claude/skills/apple-design` is critically damped by default, with bounce only after a flick.
- **Only a still's evidence counts.** One motion is proven here: the border beam, caught mid-travel. The ticker's `100` (`gallery/magicui-number-ticker.png`) is an end state. Other motion claims rest on the skills and URLs.
- **Frequency decides.** "Raycast has no open/close animation" (`.claude/skills/emil-design-eng`): Ctrl K never animates; the issue moment and the file read can.

## 4. What to avoid, each with its frame

- **Character that lives only under a mouse.** At rest, Magic Card is a plain login card (`gallery/magicui-magic-card.png`), Spotlight Card a plain dark card (`gallery/reactbits-spotlight-card.png`), and Glowing Effect plain bento cards (`gallery/aceternity-glowing-effect.png`). In a hand, at rest and from the keyboard, the effect does not exist. If we take it, the light must also follow `:focus-visible`, and the resting control must already be designed.
- **Gradient text that fades to grey.** Magic UI's `Dock` heading runs black to grey (`gallery/magicui-dock.png`), and Aceternity's `Spotlight` heading does the same (`gallery/aceternity-spotlight.png`). Contrast is measured at the lightest end, not the average.
- **An accent on its own accent.** Silk's `Learn more` is violet on the violet ground and reads weakly by eye (`gallery/reactbits-silk.png`).
- **A picture bent by the effect.** Paper's water warps the photograph's edge into a torn frame (`gallery/paper-shaders-water.png`). The ground is decoration. A maker's boat picture is never put through it.
- **Five flat colours at one weight.** Geist's `Upload` comes in black, red, amber, outline and ghost at three sizes, all flat (`systems/geist-button.png`). That is the register we have now.
- **A documented disabled button.** Stripe Apps lists "Disabled buttons" (`live/stripe-apps-button.png`). Ours refuses in a sentence.
- **Cartoon delight.** Family's characters (`live/family-home.png`) and Rive's game UI (`gallery/rive-home.png`) are the wrong register for a boat dealer. Take the motion, leave the mascots.

## 5. Three kits, and a fourth

Each kit is drawn on real seed content. Each names two references no other kit uses (**bold**).

**A · Harbour glass: material and light.** Controls are surfaces. Keycap buttons, pill tabs on regular glass, clear glass only over the stage photograph, and a lit accent rim for the chosen tile. **`systems/hig-materials-scrolled.png`**, **`live/raycast-pro.png`**, with `systems/apple-visionos-scrolled.png` and `live/stripe-checkout-demo.png`. Only this kit makes depth the character. Its risk is glass under text over a busy picture, so the scrim is computed from the picture's pixels (`docs/CUSTOMISATION.md`).

**B · Signal blue: colour and icon.** Blue carries meaning: a status dot beside its word, ticked rows, icon-led pills, icon chips on every card, Arc's grain on one blue band. **`live/arc-home-scrolled.png`**, **`ref/boats/axopar-cfg-1.png`**, with `systems/geist-status-dot.png` and `gallery/aceternity-glowing-effect.png`. Only this kit answers "a bit more colour usage", and it survives Northside changing its accent, because every hue is a job, not a decoration.

**C · Tide: motion as character.** The morphing status pill, the foot pill's filling dash, springs on press, a border beam that runs only while real work runs, counts through NumberFlow and never the price. **`live/family-values-scrolled.png`**, **`ref/boats/saxdor-deep-10.png`**, with `craft/emil-great-animations.png` and `gallery/magicui-border-beam.png`. Only this kit makes the app "feel alive" without adding a thing. Under reduced motion it keeps colour and opacity.

**The sweep suggests a fourth, which no other board names: the lit mark.** "I want the logo to be the showpiece thing." Northside's mark sits under a light cone (`gallery/aceternity-spotlight.png`) on a water-caustic ground (`gallery/paper-shaders-water.png`), with the brand marks it holds in a faded row beneath (`gallery/magicui-marquee.png`). Every control stays quiet around it; any of A, B or C can wear it as its head on the door and Home.

## 6. The bold tech, placed

- **Shader ground.** `@paper-design/shaders-react` (0.0.81 on npm, 2026-09-28). Water or mesh gradient behind the door, the head of Home, and the mark. Its colours come from tokens. Reduced motion renders one frame and stops. It never goes behind a price figure, and it pauses while a caret is in a field.
- **View Transitions API.** The picker photograph becomes the stage, which becomes the document cover (PLAN § Motion choreography). No frame here shows it; it is owed.
- **GSAP with ScrollTrigger, and Lenis.** The configurator's chapters, with Saxdor's filling dash as the reader of position (`ref/boats/saxdor-deep-10.png`). No live frame of a chaptered scroll was captured.
- **Rive** (`@rive-app/react-canvas` 4.35.0). One authored moment: the mark's reveal, or the quote turning Issued. Its end frame is the reduced-motion state. `gallery/rive-home.png` shows the engine, not a control.
- **Magic UI and React Bits, ported natively.** Border beam on the act while the file reads. Shimmer once on arrival, never looping. Marquee of brand marks, paused on hover and focus, static under reduced motion. Animated beam for the real fitment chain (boat, motor, trailer). Ticker for counts only. Not the dock: Saxdor's foot pill answers it.

## 7. Pictures, grounds and Northside's own look

A control can honestly carry an icon (Phosphor, lucide), a maker's colour drawn as colour, Northside's own mark, and a ground that is openly decoration, never a picture from outside the image ledger. The best render-only site keeps the render as the stage, with its controls in chips at its foot (`ref/boats/axopar-cfg-1.png`). Every lit edge, glow and shader tint reads `--color-accent`, so the kit stays designed when Northside changes it; contrast is measured on the real ground.

## 8. Owed, and why

These were not captured, because the budget was spent. **Things 3** and **Craft** (sites); **Sonner** and the **cmdk** demo (the `.claude/skills/ask-sonner` and `pick-ui-library` files stand in); **Linear's own app** (command menu, status icons and their motion); **Raycast's launcher rows**; **apple.com/macos**; **Porsche's option tiles**, first-hand; and a live **View Transitions** and **ScrollTrigger** example.
