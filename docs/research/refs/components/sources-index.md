# Components: every frame, with its URL

This index was merged on 2026-09-28 from four capture ledgers. A cut-off run wrote them on 2026-09-24 (every row's `capturedAt`):

| ledger | rows |
|---|---|
| `craft/sources.json` | 6 |
| `gallery/sources.json` | 15 |
| `live/sources.json` | 13 |
| `systems/sources.json` | 12 |

There are **46 rows and 45 frames on disk**. `md5sum` finds no byte-identical pair. The frames are gitignored and mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\components\`.

**No frame was captured in this round**, because the 45-frame budget was already spent.

**40 frames were opened**: 37 of these 45, and 3 from the stock at `C:\Users\Asaf\dev\hl-refs\ref\`. The **8 marked "not opened"** below are listed from their ledger notes only, and `notes.md` claims nothing from them.

The URL is the **final** URL the browser landed on. Consent banners were answered with the most privacy-preserving button present. Framer offered only `Ok`, so nothing was pressed and its banner stays in the frame. Nothing was signed into, no account was created, and no personal data was typed.

## craft/

| frame | URL | one line |
|---|---|---|
| `rauno-home.png` | https://rauno.me/ | **not opened.** Rauno Freiberg's site. |
| `rauno-interaction.png` | https://rauno.me/craft/interaction-design | "Invisible Details of Interaction Design": a contents rail (Kinetic Physics, Spatial Consistency, Fluid Morphing, Fidgetability …) beside the essay. |
| `rauno-interaction-scrolled.png` | same | A photograph of a real iPad dock, then a notebook page mid-turn: "Great interactions are modeled after … interruptibility". |
| `emil-home.png` | https://emilkowal.ski/ | **not opened.** Emil Kowalski's site. |
| `emil-great-animations.png` | https://emilkowal.ski/ui/great-animations | A spring visualiser at stiffness 100, damping 10, mass 1, drawing one overshoot, with `Idle · Ring · Timer` pill buttons above it. |
| `vaul-demo.png` | https://vaul.emilkowal.ski/ | The Vaul page at rest: an `Open Drawer` pill and a faint grid. The drawer was never opened. |

## gallery/

| frame | URL | one line |
|---|---|---|
| `magicui-border-beam.png` | https://magicui.design/docs/components/border-beam | A login card with the beam caught mid-travel as a short accent arc on its lower edge. This is the one motion proven in a still. |
| `magicui-shimmer-button.png` | https://magicui.design/docs/components/shimmer-button | A black pill, `Shimmer Button`, with a faint light line at its lower edge and a soft shadow. |
| `magicui-animated-beam.png` | https://magicui.design/docs/components/animated-beam | Six service icons in white discs, joined by grey curves to a hub. No beam is visible in the still. |
| `magicui-marquee.png` | https://magicui.design/docs/components/marquee | Two offset rows of cards with both edges faded, so no card is cut hard. |
| `magicui-number-ticker.png` | https://magicui.design/docs/components/number-ticker | `100` at about 80px. This is the end state; no count is shown. |
| `magicui-dock.png` | https://magicui.design/docs/components/dock | Six outline icons in a hairline pill with a divider, under a `Dock` heading that fades from black to grey. |
| `magicui-magic-card.png` | https://magicui.design/docs/components/magic-card | A plain login card. With no pointer, there is no spotlight. |
| `reactbits-shiny-text.png` | https://reactbits.dev/text-animations/shiny-text | `Shiny Text Effect`, base `#b5b5b5` on near-black. Customize has tick-mark sliders (Speed 2s, Spread 120°). |
| `reactbits-spotlight-card.png` | https://reactbits.dev/components/spotlight-card | A dark card with a sparkle glyph, at rest. With no pointer, there is no spotlight. |
| `reactbits-silk.png` | https://reactbits.dev/backgrounds/silk | A violet satin WebGL ground with grain (noise 1.5). White type reads; `Learn more`, violet on violet, reads weakly. |
| `aceternity-spotlight.png` | https://ui.aceternity.com/components/spotlight | A diagonal light cone over a black grid. The heading fades from white to grey. |
| `aceternity-glowing-effect.png` | https://ui.aceternity.com/components/glowing-effect | Bento cards, each headed by an outline icon in a 1px rounded chip. No glow shows at rest. |
| `paper-shaders.png` | https://shaders.paper.design/ | **not opened.** The Paper Shaders gallery. |
| `paper-shaders-water.png` | https://shaders.paper.design/water | A water-caustic filter that warps a photograph's edge. Eight sliders, including caustic 0.10 and highlights 0.07. |
| `rive-home.png` | https://rive.app/ | Dark marketing tiles: a watch face, a game UI, a phone counting `127`. Mono underline tabs for the CLI. |

## live/

| frame | URL | one line |
|---|---|---|
| `linear-redesign.png` | https://linear.app/now/how-we-redesigned-the-linear-ui | **not opened.** The top of Linear's redesign essay. |
| `linear-redesign-theme.png` | same | Not the colour section its note names. The scroll landed on the "inverted L-shape" chrome paragraph and a screenshot of the app with small coloured status circles. |
| `raycast-home.png` | https://www.raycast.com/ | **no frame.** `page.screenshot` timed out at 30 s, and the ledger says this was the third run to fail. |
| `raycast-pro.png` | https://www.raycast.com/pro | A keycap `Compare Plans` button, a hairline glass nav bar, a price in mono and a red mono eyebrow over chrome slats. |
| `arc-home-scrolled.png` | https://arc.net/ | Grain on a scalloped blue band and a press marquee. The heading is set in saturated blue on white, and the sidebar has pinned tiles over folder rows. |
| `stripe-home.png` | https://stripe.com/au | A WebGL ribbon behind a two-tone headline, `Get started ›` filled beside an outlined Google button, and `1.72117930%`. |
| `stripe-checkout-demo.png` | https://checkout.stripe.dev/ | Two tiles; the chosen one is ringed in violet with a tinted picture. Joined `No code \| Low code` tags. |
| `stripe-appearance-api.png` | https://docs.stripe.com/elements/appearance-api | Three steps: a theme, then variables (`fontFamily`, `colorPrimary`), then rules. |
| `stripe-apps-button.png` | https://docs.stripe.com/stripe-apps/components/button?app-sdk-version=9 | Primary, Secondary and Destructive. The guidelines include "{verb} + {noun}" and "Disabled buttons". |
| `family-home.png` | https://family.co/ | Icon-led pills (`Download on iOS`, `Watch the Video`) among cartoon characters. |
| `family-values.png` | https://benji.org/family-values | **not opened.** The top of Benji Taylor's essay. |
| `family-values-scrolled.png` | same | An `Analyzing Transaction` pill with a spinner ("Fluidity touches every interaction …"), then 3D hearts under "Delight". |
| `framer-home.png` | https://www.framer.com/ | A dark CMS table with a run of rows lit in blue, `Active ⌄` pills and a bright blue `Publish`. The cookie banner offers only `Ok`. |

## systems/

| frame | URL | one line |
|---|---|---|
| `geist-materials.png` | https://vercel.com/geist/materials | Named surfaces, `material-base` to `material-large`, each with its radius and use. |
| `geist-button.png` | https://vercel.com/geist/button | `Upload` in three sizes and five flat types. |
| `geist-switch.png` | https://vercel.com/geist/switch | A text-only `Source \| Output` switch. "Ensure the width of each item is wide enough to prevent jumping". |
| `geist-status-dot.png` | https://vercel.com/geist/status-dot | Five dots, then the same dots with their words: Queued, Building, Error. |
| `geist-colors.png` | https://vercel.com/geist/colors | **not opened.** Geist's colour scales. |
| `hig-materials.png` | https://developer.apple.com/design/human-interface-guidelines/materials | **not opened.** The top of HIG Materials. |
| `hig-materials-scrolled.png` | same | Liquid Glass, regular and clear, shown as a disc on space and on a beach. "Only use clear Liquid Glass … over visually rich backgrounds". |
| `hig-buttons.png` | https://developer.apple.com/design/human-interface-guidelines/buttons | Style, content and role; a 44×44 pt hit region; "Always include a press state for a custom button". |
| `hig-toggles.png` | https://developer.apple.com/design/human-interface-guidelines/toggles | "Avoid relying solely on different colors". The hero's colour shows under the blurred header. |
| `hig-segmented.png` | https://developer.apple.com/design/human-interface-guidelines/segmented-controls | Single choice (alignment icons), multiple choice (B I U S), and an Activity `D W M 6M Y` control. |
| `apple-visionos.png` | https://www.apple.com/os/visionos/ | **not opened.** The top of the visionOS page. |
| `apple-visionos-scrolled.png` | same | Pill tabs on dark glass, with `visionOS` chosen in white and an `Apple Intelligence` pill with a lit rim. |

## Stock, opened this round (`C:\Users\Asaf\dev\hl-refs\ref\`)

| frame | one line |
|---|---|
| `boats/saxdor-deep-10.png` | A white foot pill with 8 of 9 dashes filled, `8 / 9` and a navy `DETAILS`, plus `230V \| 120V` on a closed band head. |
| `boats/axopar-cfg-1.png` | Outlined option rows with a filled check-circle and ⓘ, `1/3 MAIN SELECTIONS`, and a price chip and pager chip at the render's foot. |
| `porsche-1440.png` | Porsche's "This Model is No Longer Available" page with an Error ID. There are no option tiles in it. |

## The drive list, source by source

**Captured**:
- Linear (redesign essay only)
- Raycast (Pro page only)
- Arc
- Vercel Geist
- Stripe (home, Checkout, Appearance API, and the dashboard's button set via Stripe Apps)
- Apple HIG (materials, buttons, toggles, segmented controls)
- apple.com visionOS
- Family
- Framer
- Rauno Freiberg
- Emil Kowalski and Vaul
- magicui (border beam, shimmer, animated beam, marquee, number ticker, dock, magic card)
- reactbits (shiny text, spotlight card, Silk)
- Aceternity (spotlight, glowing effect)
- Paper Shaders
- Rive

**From the stock**: Saxdor and Axopar.

**Owed, because the budget was spent**, not because anything refused:
- Things 3
- Craft
- Sonner's site
- Paco Coursey's cmdk demo
- Linear's app (command menu, status icons)
- Raycast's launcher rows
- apple.com/macos
- Porsche's option tiles and chips, seen first-hand; they are relayed from `../configurator/notes.md`
