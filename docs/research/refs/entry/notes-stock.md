# Entry — the existing stock (the old repo's 14 entry frames, re-read)

Read 2026-09-16. Nothing was captured for this note. The frames are the old repo's, copied as bytes to `C:\Users\Asaf\dev\hl-refs\ref\entry\*.png` (14 frames, 1440×900, taken 2026-09-15 by `HL_Playground/out/scripts/ref-entry.mjs`, Chrome via Playwright, locale en-AU). Every frame below was opened and looked at; what is written is what is in the still. **No motion was observed** — a still cannot show it and nothing below claims it.

**The screen's job.** Say who is at the desk and which business; two doors (load the Master Price File, stating "53 tables · 15,691 rows" read from the manifest, or start a blank sheet); honest that it is not authentication until M6; no password field. A returning visitor lands on Home.

**Two honesty notes about this stock.**
1. The old script answered cookie banners by clicking the first of `Accept all / Accept / Agree / OK / Allow all` it found. These frames were therefore taken with non-essential cookies accepted. HL_2.0's `tools/research/capture.ts` does the opposite; any re-capture of these URLs will be a different, cleaner frame.
2. Only **four** of the fourteen frames show a sign-in at all (Porsche twice, BMW as a registration form, Linear, Notion). Four are bot walls (Garmin, Mercury, Tesla, Boston Whaler), one is an empty shell (Polestar), two are 404 pages (Nimbus, Saxdor), one is a newsletter article (Riviera), one is a configurator landing (Brabus). The stock is thin on its own subject; its value is in the four real doors and in three accidental compositions (Nimbus's two boxes on a photograph, Brabus's boat in motion, Riviera's hanging pennant). The `axopar-account` shot in the old list never landed; there is no frame for it.

---

## The ranked six (for this screen's job, not for beauty in general)

1. **Porsche ID** (`porsche-login`) — photograph across 65 %, one white column asking one thing, one black primary, the second way in demoted to grey, the mark held in a header strip so the column starts with the question. The one frame here that is already the shape of a door. Minus the captcha, which is the page's only moving part and the one thing a dealer must never meet.
2. **Linear** (`linear-login`) — the doors as a stack of equal pills with exactly one filled; nothing to type before you choose; one small honest line under them. The best control shape for "load the file / start blank" in the stock, and the only page here that loads with no picture to wait for.
3. **Nimbus, the 404** (`nimbus-account`) — a full-bleed dark photograph, a human sentence set left in a wide light face, two equal white boxes under it, a giant numeral as a display object bottom right. Not a login, but it is *two doors over a picture*, and it proves the two boxes stay legible on a dark photograph without a card behind them.
4. **Notion** (`notion-login`) — a two-tone title pair (bold line, grey line) that could carry "who is at the desk / which business" in one breath, and doors drawn as tiles with an icon over a label — the closest the stock comes to a door that *shows* what is behind it.
5. **Brabus Marine** (`brabus-marine`) — the only frame where the boat is moving. A white utility bar with the wordmark centred small, then water edge to edge; the account is a person glyph, not a page. The argument for letting the dealer's own on-water photography carry the entry.
6. **BMW ID** (`bmw-login`) — the mirrored split (form left 33 %, photograph right 58 %), the roundel placed over the photograph so the form column stays pure. Also the stock's clearest negative: a submit that sits grey and silent until you satisfy five rules printed as crosses before you have typed a letter.

Runners-up for the board: **Riviera** (`riviera-owners`) for the pennant hanging off the top edge — the mark as a physical thing, which is what "the logo as the showpiece" means; **Saxdor** (`saxdor-login`) for a two-colour identity (navy, gold) that stays legible and a ghosted wordmark used as the ground.

**Against the plan's three starting directions** (PLAN.md, Milestone 1, "Entry"): A "Porsche's frame, the dealer's water" is `porsche-login` exactly; C "BMW mirrored" is `bmw-login` exactly; B "Nimbus at night" is **not** in this stock — the only Nimbus frame here is a 404 showing a man at a desk under lamplight. Direction B has to be drawn from a Nimbus frame in the boats folder or from the seed's own photography (the Stacer 529 Assault Pro), and the board should say so.

---

## One entry per frame

Each entry: the URL it was driven from (per the old script), what is actually in the frame, the pattern by name, type and imagery as observed, what is genuinely good for this screen's job, what to avoid. Sizes are estimates read off the 1440×900 still.

### Porsche ID — `porsche-login`
- Driven: https://login.porsche.com/ — stock path `C:\Users\Asaf\dev\hl-refs\ref\entry\porsche-login.png`.
- Seen: the left 936 px is a photograph — a car at dusk on a dry plain, dust thrown up behind it, a red tail-light streak, the sky a gradient from orange at the horizon to teal-blue at the top; dark and warm. The right 504 px is white. A pale grey header strip (≈60 px) holds the PORSCHE wordmark centred and a small "?" at the right. Then, starting ≈145 px down: "Log in with your Porsche ID" in Porsche's corporate sans (Porsche Next, regular weight) at ≈34 px, wrapping to leave "ID" alone on the second line; "Porsche ID (email) *" as a 14 px label over a grey-filled rounded input; a captcha image in an outlined box; "Enter the code shown above *" over another input; a full-width black "Continue" (≈56 px tall, 8 px radius, white 16 px label); a hairline "OR" divider; a grey "Continue with Passkey" with a fingerprint glyph; two lines of 13 px grey explaining the passkey; "Don't have a Porsche ID? Register now". Black, white, three greys; the only colour on the page is the photograph.
- Pattern: **split hero, 65/35, one question per step** (email first; the password is on the next screen, not this one) with **a primary and a demoted alternative**.
- For this screen: the column does one thing and the picture does the rest. The header strip carries the mark so the column's first line is the question, not the brand. The primary is the only black object on the page. The dark photograph makes the white column read as the lit part of the room. Scale contrast headline-to-body is about 2.2× — enough to hold a 504 px column.
- Avoid: the captcha — a bot test at the door, and the only element that changes between loads (compare `porsche-myporsche`); the asterisks; "OR" treating the second door as a fallback rather than a peer (our two doors are peers); a column so narrow the headline orphans a word.

### My Porsche — `porsche-myporsche`
- Driven: https://my.porsche.com/ (redirected to the same login) — stock path `…\entry\porsche-myporsche.png`.
- Seen: pixel-identical to `porsche-login` except the captcha string ("ja2bbq" instead of "B44GBK"). The portal never shows itself without an ID.
- Pattern: same as above. The only lesson the pair adds: a door that regenerates a puzzle on every visit has made the puzzle its only living element. Ours should have none, and its living element should be the count read from the manifest.

### Linear — `linear-login`
- Driven: https://linear.app/login — stock path `…\entry\linear-login.png`.
- Seen: a near-white warm grey page (≈#f8f8f8). Centred, in the vertical middle: Linear's mark (a black disc with diagonal white strokes, ≈40 px) at y≈282; "Log in to Linear" at ≈18 px medium, dark grey; four pills stacked at 12 px gaps, each 288×44 with fully rounded ends — "Continue with Google" filled in Linear's indigo (≈#6e79d6) with white bold text, then "Continue with email", "Continue with SAML SSO", "Log in with passkey" as white outlined pills with dark 14 px labels; then "Don't have an account? Sign up or learn more" in 13 px grey with the two links in dark. The face is Inter throughout. No imagery. One accent colour, used once.
- Pattern: **centred provider stack, one primary by fill, nothing to type first**.
- For this screen: it is the two-doors pattern with the doors as equal objects and the primary said by fill alone — exactly the relation between "Load the Master Price File" and "Start a blank sheet". It loads instantly and asks nothing before you choose. The honest small line under the stack is where "This is not authentication until M6" would sit without shouting.
- Avoid: no sense of place — nothing says which business or what is behind the door; the headline at 1.3× body does not hold the page; four doors where we have two.

### Nimbus — `nimbus-account`
- Driven: https://nimbusboats.com/configurator (landed on the site's 404) — stock path `…\entry\nimbus-account.png`.
- Seen: a white 70 px header — a nine-dot grid icon with "Models", an EU flag, the Nimbus burgee-and-wordmark centred, "Search" and "Menu" at the right. Below it the whole window is a photograph: a man in a dark jacket at a desk, gesturing, an open brochure in front of him, a blurred office behind, warm lamplight — the frame reads as a still from a film. Over it, left-aligned at x=80: "Oops, seems like we're both lost at sea" in a wide, light geometric sans at ≈48 px, white, two lines; under it two white rectangles of equal weight, "Return home" and "Model range" (≈140×52 each, dark 15 px labels, no radius). Bottom right, "404" at ≈150 px in the same wide light face, white. No card, no veil — the text sits straight on the photograph.
- Pattern: **full-bleed photograph, sentence left, two peer doors, display numeral right**.
- For this screen: it demonstrates that two white boxes on a dark photograph are enough — no glass card needed — when the photograph has a dark region to hold them. The sentence is written the way a person would say it. The numeral shows a big figure can be a display element on the page; ours could be the manifest's count, which is real.
- Avoid: two doors of equal weight (ours has a primary); a person's face as the picture (the seed has boats on water; a 404 mood is wrong for a threshold); the plan's "Nimbus at night" direction must not cite this frame — it is not a night photo and not a boat.

### Notion — `notion-login`
- Driven: https://www.notion.so/login — stock path `…\entry\notion-login.png`.
- Seen: white page. Centred column 360 px wide: the N mark (≈32 px) at y≈105; a title pair — "Your AI workspace." in ≈22 px bold near-black, then "Log in to your Notion account" at the same size in mid grey; "Email" 12 px label; a 44 px input with a 2 px blue focus ring and the placeholder "Enter your email address…"; a 12 px grey helper line; a full-width blue "Continue" (≈#2383e2, white bold); an "or continue with" hairline divider; a 3×2 grid of white outlined tiles (112×74), each an icon above a 14 px label — Google, ChatGPT, Apple / Microsoft, Passkey, SSO; "New user? Sign up"; a two-line 12 px legal note; a language selector centred in the footer; a "?" disc bottom right. Inter-like face throughout. No imagery. One blue.
- Pattern: **email-first with a provider tile grid; two-tone title pair**.
- For this screen: the title pair is a ready shape for the two facts the entry must state — a bold line for who is at the desk, a grey line for which business (or the reverse). The tiles are doors drawn as objects with a picture over a name; two of them, one carrying the file's count and one the blank sheet, would say more than two text buttons.
- Avoid: an email field at all (we ask for a name, not an address); six doors; the legal line; the helper text under the field that nobody reads.

### Brabus Marine — `brabus-marine`
- Driven: https://www.brabusmarine.com/configurator (landed on the shop-style landing) — stock path `…\entry\brabus-marine.png`.
- Seen: a white 75 px utility bar — hamburger left, "BRABUS MARINE" wordmark (heavy caps over spaced small caps) centred, at the right a globe with a Finnish flag, a person glyph, a bag glyph. Under it a grey notice band ("Find & buy products for International." with a dark "BRABUS INTERNATIONAL" button and a close). Then, from y≈140 to 810, edge to edge: a Brabus Shadow with three outboards carving a turn to the right, wake thrown up white, a rocky red-brown headland with green scrub behind, deep blue water. White below the photograph. No copy on the picture.
- Pattern: **full-bleed hero under a white utility bar; the account as a glyph, not a page**.
- For this screen: the only stock frame where the water is the page and the boat is doing something. The mark is small and centred on white, above the picture, not over it — the picture is never asked to carry text. That is the argument for the seed's own on-water photograph (the Stacer 529 Assault Pro is the one that has it) being the entry's ground.
- Avoid: the grey region band that cuts between the mark and the water; a page that says nothing about who you are; a hero with no door on it at all.

### BMW ID — `bmw-login`
- Driven: https://customer.bmwgroup.com/oneid/ (landed on registration, not login) — stock path `…\entry\bmw-login.png`.
- Seen: the left 615 px is white with a 360 px form column starting at x=128; the right 825 px is a photograph — a smiling woman with curly hair looking down at a phone, sunlit, shot through glass so reflections lie across her, blue-white highlights; the "My BMW" roundel sits white in the photograph's top-right corner. In the column: "BMW ID REGISTRATION" in BMW's corporate sans (BMW Type Next, light) in caps at ≈34 px over two lines, dark blue-grey; "*Mandatory fields" at 12 px; four 48 px outlined inputs with 14 px labels — First Name, Last Name, Email address, Password (eye toggle); five password rules, each led by a ✕, in 12 px; a full-width "Register now" in flat grey (≈#bdbdbd) with dark text — the disabled state; a two-line hCaptcha notice; a hairline at the bottom. Greys only in the column; the photograph carries all colour.
- Pattern: **mirrored split (form left, photograph right); the mark over the photograph**.
- For this screen: the roundel placed on the picture instead of in the column is the right instinct — the column is a form and only a form. The direction C "BMW mirrored" in the plan is this frame.
- Avoid: the grey silent submit (CLAUDE.md: a refusal is a sentence with its reason; never a silently disabled control); rules printed as five crosses before a keystroke; four fields when the entry asks one; a lifestyle portrait as the picture — the person at our desk should see their product, not a model.

### Riviera — `riviera-owners`
- Driven: https://www.rivieraaustralia.com/owners (an owners' newsletter article, not a login) — stock path `…\entry\riviera-owners.png`.
- Seen: a Google Translate "Select Language" widget stuck top-left; a white nav with MODELS ▾ / THE RIVIERA EXPERIENCE ▾ / REPRESENTATIVES / CONTACT in spaced caps at ≈17 px; a blue Riviera pennant (≈110×165) hanging from the top edge at the right like a flag, overlapping the nav rule. Centred: "Edition 5 - 2024 / Special Celebration Edition" at 14 px; the headline "OWNERS CELEBRATE THE PREMIERE OF THE 6800 SPORT YACHT PLATINUM EDITION" in a wide squared caps display (Eurostile-like extended) at ≈56 px, three lines, dark grey; "Published June 4, 2024"; a two-line 20 px standfirst; then at y≈725 a photograph (a yacht's flank at sunset, blue underwater lights) cut by the fold.
- Pattern: **editorial masthead; the mark as a hanging object**.
- For this screen: the pennant is the stock's best answer to "I want the logo to be the showpiece" — it is a thing with an edge and a shadow, hung from the frame, not an icon in a corner. A dealer's mark treated that way would say "which business" before a word is read.
- Avoid: the translate widget; three lines of extended caps (the wall); the photograph below the fold.

### Saxdor — `saxdor-login`
- Driven: https://www.saxdoryachts.com/my-saxdor (a 404) — stock path `…\entry\saxdor-login.png`.
- Seen: white top bar with a hamburger and the SAXDOR wordmark (extended caps with a red dot in the D) centred. On white: "THIS PAGE DOESN'T SEEM TO EXIST." in a wide extended grotesque, caps, navy (≈#10214a), ≈44 px, one line; a navy "BACK TO HOMEPAGE" block button (≈246×58, white 15 px bold caps). From y=485 a navy footer: the wordmark white at left; three columns headed ABOUT / INFO / TERMS & POLICIES in gold (≈#c9a45c) spaced caps at 13 px with white 15 px links (including "Dealer Portal"); gold social glyphs at right; and, ghosted at ≈8 % white, a giant SAXDOR wordmark bleeding off the bottom.
- Pattern: **single sentence + one button; ghosted wordmark as ground**.
- For this screen: navy, gold and white is a two-colour identity that stays legible at every size shown — a reminder that "blue and white" with one warm accent can carry a page without a photograph. The ghosted wordmark makes the brand the room's floor rather than a badge. The footer's "Dealer Portal" shows where a boat brand actually keeps its dealer door: small, last.
- Avoid: everything in caps; a sentence with one button where ours has two doors.

### Polestar — `polestar-signin`
- Driven: https://www.polestar.com/au/login/ — stock path `…\entry\polestar-signin.png`.
- Seen: the site shell only. Header with the Polestar wordmark and the model links (Polestar 2–5, Charging, Shop, More, pin and person glyphs) in Polestar's tight grotesque at ≈17 px; then white nothing from y=72 to 640 with a single dot at (724,115) — a loader or a collapsed element; then the footer on pale grey: "Stay up to date on all the latest Polestar news" at ≈30 px, a "Subscribe →" outlined button, four columns of links. The sign-in itself never rendered (the auth redirect did not complete in the headless run).
- Pattern: none observed for the door. **Treat as failed** for this screen's purpose; re-drive it live in the browser if Polestar's ID page is wanted.
- The only thing to take: the footer headline's weight against the 15 px links (2×) in a single black-on-grey face is calm and legible.

### Garmin — `garmin-signin`
- Driven: https://sso.garmin.com/portal/sso/en-AU/sign-in?clientId=GarminConnect — stock path `…\entry\garmin-signin.png`.
- Seen: Cloudflare's "Performing security verification" interstitial — "sso.garmin.com" at ≈36 px, one paragraph, a "Verify you are human" checkbox, a Ray ID in the footer. Nothing of Garmin's design.
- **Failed** (bot wall). Not a reference. Do not fight it.

### Mercury Marine — `mercury-account`
- Driven: https://www.mercurymarine.com/en/au/account/login — stock path `…\entry\mercury-account.png`.
- Seen: Cloudflare's "Sorry, you have been blocked / You are unable to access mercurymarine.com" page — a red ✕ disc in a mock browser window, two explanatory columns.
- **Failed** (bot wall). Not a reference.

### Tesla — `tesla-signin`
- Driven: https://auth.tesla.com/oauth2/v3/authorize?… — stock path `…\entry\tesla-signin.png`.
- Seen: Akamai's plain-HTML "Access Denied" in the browser's default serif, with a reference number.
- **Failed** (bot wall). Not a reference.

### Boston Whaler — `whaler-build`
- Driven: https://www.bostonwhaler.com/build-your-whaler — stock path `…\entry\whaler-build.png`.
- Seen: the same Cloudflare block page as Mercury (both are Brunswick sites), naming bostonwhaler.com.
- **Failed** (bot wall). Not a reference.

---

## What the stock says about imagery

- **Photography carries the page:** Porsche (65 %, dark, the product in a place), BMW (58 %, a person, not the product), Nimbus (100 %, a person at a desk), Brabus (100 % of the hero, the boat moving on water). Of the four, only Brabus shows the thing the person came for.
- **Typographic, no picture:** Linear, Notion, Saxdor, Polestar's shell. Linear and Notion load in a blink and say nothing about place; Saxdor's navy/gold shows a two-colour identity can hold a page alone.
- **The mark as an object:** Riviera's hanging pennant and Saxdor's ghosted wordmark are the only two frames where the brand is more than a glyph in a corner.

For a dealer's desk the honest reading is: the seed has real on-water photography for the Stacer 529 Assault Pro and renders only for Highfield, so a photographic direction must be drawn on the Stacer and say so; a typographic direction must find its sense of place in the mark and the two colours instead.

## What to avoid, gathered

- A password field, a captcha, a rules list — anything that protects nothing (Porsche ×2, BMW).
- A silently disabled submit (BMW). A refusal is a sentence where it is refused.
- More than two doors (Linear's four, Notion's six).
- A second door written as "OR" — ours are peers with one primary by weight, not a fallback.
- A person's face as the picture when the product has water to show (BMW, Nimbus).
- A band or widget cutting between the mark and the picture (Brabus's region band, Riviera's translate widget).
- Extended caps in bulk (Riviera, Saxdor).

## From `docs/reference/configurator-teardowns-2026.md` — what concerns the door

- **Lines 141–155, "BMW disclaims validity at the door."** BMW's picker opens with the sentence "This is a configurator… not every configuration can be guaranteed." The teardown's point is that a limit stated at the threshold explains everything that follows. That is the entry's honesty line in the same position: "This is not sign-in yet — it says who is at the desk; real accounts arrive in M6," said once, at the door, in a sentence, not in a tooltip.
- **Lines 62–70, PCPartPicker "admits what it does not check, in the UI, on every list"** (adopted at line 262: "Say what we do not check"). The same discipline belongs on the entry: the file door states what it loads with real numbers read from the manifest ("53 tables · 15,691 rows"), and the blank door states plainly that it loads nothing.
- **Lines 168–182, the `aria-disabled` finding.** BMW's 22 native `disabled` controls carry empty accessible names; the playbook rule is `aria-disabled`, never `disabled`. On the entry this means: if the pack manifest is missing, the file door stays a named button that explains itself when pressed, never a grey box with no name — the exact failure `bmw-login` shows at its "Register now".
- **Line 184, `configure.bmw.co.uk` is an all-shadow-DOM document** — a deep-link and assistive-technology risk. The entry's two doors and the name field must be ordinary reachable elements; the returning-visitor route to Home must be a real URL.

Nothing else in that document concerns the entry; its subject is cascades, totals and refusal copy inside the configurator.
