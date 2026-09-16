# Entry (sign-in) — live drive, 2026-09-16

Screen job: say who is at the desk and which business; two doors (load the Master Price File, stating "53 tables · 15,691 rows", or start a blank sheet); honest that it is not authentication until M6; no password field; a returning visitor lands on Home.

Frames: `docs/research/refs/entry/live/*.png` (gitignored; mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\entry\live\`). Ledger: `docs/research/refs/entry/live/sources.json` (37 frames kept, 9 entries marked with an error). All at 1440×900, headless Chromium, `en-AU`. Motion is only reported where two captures of the same page differed (a video hero) or where the state was seen; a static frame cannot show a transition, and nothing below claims one it did not see.

Failed (listed with the reason, not fought): **Tesla** (auth.tesla.com and www.tesla.com/teslaaccount — Akamai "Access Denied" to a headless browser); **Rimowa** (rimowa.com/au and /us login — Akamai "Access Denied"); **BMW Australia login** (bmw.com.au/au/s/login — a Salesforce Experience page that never painted below the header after 20 s; BMW OneID captured instead); **Boston Whaler `/us/en/boat-configurator`** (blank white after 12 s; the legacy `/build-and-price.html` path captured instead); **Mercury `/en-au/`** (404; the root domain, geo-served as GB English, captured instead); **Highfield burger menu** (no selector matched in three passes). Porsche's `my.porsche.com` redirects to the same Porsche ID page as `login.porsche.com` (two identical frames kept).

---

## One entry per site

### Porsche ID — `porsche-id-login.png`, `porsche-my.png`
- **For the person:** asks one thing. "Log in with your Porsche ID", the email field, Continue. Password is on the next step (identifier-first, progressive disclosure). A passkey door sits under an "OR" rule; "Register now" is the last line.
- **Pattern:** split stage — photograph across ~65 % of the window (desert at dusk, a Cayenne throwing dust, one red light streak), one white column on the right (~505 px) with the wordmark centred in a pale grey header band and a "?" help pinned right.
- **Type:** Porsche Next, light weight for the ~32 px title (wraps to an orphan "ID"), 14 px labels, bold 16 px on the black Continue pill. Field: pale grey fill, 1 px hairline, 8 px radius.
- **Imagery:** photography carries the page; the still is identical across two captures (not video).
- **Motion observed:** none (static).
- **Keep for us:** one column asking one thing; the picture runs edge to edge with no caption; the "OR" rule is a real divider with the word in it; help pinned top-right of the column.
- **Avoid:** a CAPTCHA in the first view (shown to a headless visitor — an honest reminder that our screen must never show a challenge that protects nothing); the header band that cuts the column into two greys; the title orphan.

### BMW ID (OneID) — `bmw-oneid.png`
- **For the person:** the identity block reads top-left: brand, then "BMW ID LOGIN", then "Don't have a BMW ID? Register here." — the alternate offered before the field. One field, Continue. Password on the next step.
- **Pattern:** mirrored split — form column left (~40 %), lifestyle photograph right (a woman smiling at a phone, sunlit, soft-focus; the "My BMW" roundel over the photo top-right).
- **Type:** BMW Type Next, all-caps light ~32 px title; 14 px label; the Continue is a mid-grey bar with dark bold text that reads disabled at all times. Field is a hairline black rectangle, no radius.
- **Imagery:** lifestyle, not product — could be any brand's photo.
- **Motion observed:** none.
- **Keep:** the three-line identity block hierarchy (brand → what this is → the other door); the left column with the picture on the right is direction C's shape.
- **Avoid:** a grey primary that never looks pressable; ~450 px of empty column under the form with a stray hairline; a person's face as the picture.

### Polestar ID — `polestar-login.png`
- **For the person:** both fields at once (Email*, Password*), a small black "Sign in →" button with an orange arrow, then three underlined links: sign in by phone, forgot password, create account. Footer says the cookie is session-only — an honest sentence.
- **Pattern:** card on ground — white 448 px card on a pale grey page under a white header carrying only the wordmark.
- **Type:** Polestar's light geometric grotesk; ~32 px "Sign in"; grey filled fields with a single bottom rule; the orange arrow is the only colour on the page.
- **Imagery:** typographic, no photo.
- **Motion observed:** none.
- **Keep:** one accent colour used once as the "go"; links that look like links; a card that is not oversized; a sentence in the footer that tells the truth about storage.
- **Avoid:** two fields when the screen needs one; asterisks on every field (then they mean nothing); grey field on grey ground (weak edge contrast).

### Rivian — `rivian-login.png`
- **For the person:** "Sign in" is the biggest word on the page (~44 px). Two floating-label fields, "Remember my device for 30 days", "Trouble logging in?", a legal sentence, then a full-width black pill.
- **Pattern:** split stage 40/60 — photograph left (a truck bed with lumber and foliage in warm light, the RIVIAN wordmark white over it, the tailgate lettering cropped at the foot), form right, vertically centred.
- **Type:** Rivian's geometric grotesk; 16 px floating labels inside rounded grey fields (12 px radius); the primary is a 56 px black pill.
- **Imagery:** product as texture — a detail crop of the vehicle, not a hero shot. This is the honest way to use a boat photograph when the picture is of the product, not a lifestyle.
- **Motion observed:** none. A yellow chat bubble with a red notification dot sits bottom-right.
- **Keep:** the largest word is the act; the wordmark placed on the picture; product-detail crop.
- **Avoid:** a notification dot on an entry screen; legal copy above the button; the 30-day remember-me for a local app.

### Lucid — `lucid-portal-login.png`
- **For the person:** a sentence says what the account is for ("View your orders, update your information and save configurations…") before asking anything. Two fields, a "Keep me logged-in" circle, a sand-gold bar, two links.
- **Pattern:** modal over the site — the full marketing nav stays (Lucid Air / Gravity / Sapphire, a gold DEMO DRIVE button, help, region, account icon), the login is a black 480 px card centred over a full-bleed aerial of a coastal road and teal water; a cookie banner (Accept All / Settings) sits under it.
- **Type:** a serif display for "Log in" (~36 px) as the brand voice, tracked small-caps labels (EMAIL, PASSWORD) in 11 px, a grotesk for the body; placeholders repeat the labels.
- **Imagery:** photography carries; the dark card on a bright picture holds contrast well.
- **Motion observed:** none.
- **Keep:** the one sentence of purpose under the title; the dark card on a bright photo; a serif title as voice (a possible answer to "a bit more colour usage" without colour).
- **Avoid:** placeholder = label; the marketing nav on a door; a radio that looks like a checkbox; the cookie banner competing with the card.

### Linear — `linear-login.png`
- **For the person:** pick your door: four stacked pills, the first (Google) filled indigo, the rest white with a hairline; a mark above, "Log in to Linear" between, one line under. The field appears only after a door is chosen.
- **Pattern:** method picker (doors first, field second). Everything sits within a 288 × 400 px stack, centred on a near-white ground.
- **Type:** Inter-like at 15 px on the pills, 18 px medium title — too small for a showroom app, right for a tool.
- **Imagery:** typographic.
- **Motion observed:** none.
- **Keep:** this is "two doors" already — stacked pills, one coloured primary, nothing else on the page; the mark above the title.
- **Avoid:** four doors; an 18 px title on a screen the owner judges by eye.

### Notion — `notion-login.png`
- **For the person:** a title pair — "Your AI workspace." bold, "Log in to your Notion account" grey — then an Email label, an outlined field with a hint under it, a blue Continue, an "or continue with" rule, a 3 × 2 grid of provider tiles, "New user? Sign up", legal, a language picker at the foot.
- **Pattern:** identifier-first with a provider grid.
- **Type:** Inter; 22 px bold + 22 px grey title pair; 12 px hint; 40 px blue bar.
- **Imagery:** typographic.
- **Motion observed:** none.
- **Keep:** the title pair (statement + grey purpose) and the hint sentence under the field ("Use an organization email…" — ours could say what the name is used for).
- **Avoid:** six tiles; a tagline that sells on a working tool's door.

### Vercel — `vercel-login.png`
- **For the person:** "Log in to Vercel" (~32 px Geist semibold), an email field, a black "Continue with Email" bar, a hairline, five outlined provider rows with icons, "Show other options", "Don't have an account? Sign Up". The alternate ("Sign Up") is also a quiet outlined button top-right.
- **Pattern:** identifier-first with a stacked provider list.
- **Type:** Geist; 15 px rows; 40 px controls, 6 px radius; footer Terms / Privacy at 12 px.
- **Imagery:** typographic.
- **Motion observed:** none.
- **Keep:** the primary directly under its field; the top-right quiet button as the second door's second home.
- **Avoid:** five equal rows (nothing is primary after the first); monotony.

### Raycast — `raycast-login.png` (first attempt at `/login` returned a 404 page, overwritten)
- **For the person:** "Log in to Raycast" bold ~28 px, three square icon buttons (Apple / GitHub / Google), "or", Email and "Password (optional)", a light-grey "Send Magic Link" bar, then "Don't have an account? Sign up →" in an outlined box.
- **Pattern:** magic-link-first with password optional, in a dark room. The site nav floats in a rounded container at the top.
- **Type:** Inter-like; dark fields with 13 px placeholders; the primary is the only light element.
- **Imagery:** typographic, dark.
- **Motion observed:** none.
- **Keep:** "(optional)" written in the label — honesty in words; one bright control in a dark room; icon squares instead of five text rows.
- **Avoid:** a magic link for a local app; the outlined sign-up box that reads like a third field.

### Stripe — `stripe-login.png`
- **For the person:** "Sign in to your account" (22 px), Email (focused, purple ring), Password with "Forgot your password?" on the label row, "Remember me" ticked, a lilac (disabled until valid) Sign in, "Or sign in with" rule, three outlined rows (Google / Passkey / SSO), and a grey card-footer strip "New to Stripe? Create account".
- **Pattern:** card with a footer — a 540 px white card with a soft shadow; the alternate door lives in the card's own footer band.
- **Type:** Stripe's grotesk at 14 px; 44 px controls.
- **Imagery:** an abstract colour ribbon (blue → orange → pink) sweeps diagonally behind the card; no photo.
- **Motion observed:** none.
- **Keep:** the card footer band as the second door; forgot-link on the label row; a primary that only fills when the field is valid (an honest state).
- **Avoid:** the abstract ribbon — decoration that says nothing about the business; three third-party rows.

### Arc / The Browser Company — `arc-home.png` (site entry; Arc signs in inside the app)
- **For the person:** one act — "Try Dia →" black pill with the app icon — under a serif headline and a grey grotesk subline, over a browser mock; an electric-blue frame with scalloped edges above and below.
- **Pattern:** brand frame with a single act.
- **Type:** display serif ~40 px + grotesk 20 px; the frame colour owns the page.
- **Imagery:** illustrative (a product mock), no photo.
- **Motion observed:** none.
- **Keep:** the confidence of one act; the serif / grotesk pairing.
- **Avoid:** nothing here is an entry pattern; the scalloped edge is a gimmick.

### Framer — `framer-login.png`
- **For the person:** a tiny centred stack — mark, "Welcome to Framer" bold + "The web design agent" grey, a black "Continue with Google" bar (230 px), "OR", a grey field "Enter your work email…", a grey Continue.
- **Pattern:** title pair + primary provider + email fallback.
- **Type:** Inter-like; 22 px title pair; 32 px controls — everything inside 230 px on a 1440 px window.
- **Imagery:** typographic.
- **Motion observed:** none.
- **Keep:** calm from smallness; the title pair.
- **Avoid:** 230 px controls at 1440 wide read timid; grey secondary on white.

### Nimbus Connect — `nimbus-connect.png`, `nimbus-connect-scrolled.png`
- **For the person:** first hit was an "outdated browser" interstitial (Chrome 140 UA, headless) with five browser icons and Remind-me-later / No — dismissed. Then: a full-bleed blurred aurora (indigo → cyan → violet) under a dark navy bar (Models grid, EU flag, the NIMBUS burgee centred, Search, Menu); the "N / connect™" lockup, "App", "Nimbus Connect" ~48 px light, "Effortless boating" italic beneath. Scrolled: a white two-column band — headline + paragraph left, the app icon (blue-gradient square) right — then a photo of a laptop and phone on a table. No login on the page; the doors are the store badges further down.
- **Pattern:** product-page hero; the veil is the ground and one lockup sits on it.
- **Type:** a light grotesk with an italic pair for the second line — roman/italic as two voices.
- **Imagery:** gradient veil, then product photo. This is the ground for direction B ("Nimbus at night"): the veil, one lockup, then the doors.
- **Motion observed:** none confirmed (the gradient is identical across the two captures).
- **Keep:** the veil as a ground; roman/italic pair; the lockup centred with a small eyebrow ("App") above the name.
- **Avoid:** a browser-nag modal; a hero with no door on it.

### Saxdor — MySaxdor — `saxdor-app.png`, `saxdor-app-scrolled.png`
- **For the person:** a full-bleed photo (a Saxdor 320 stern at a dock, two people walking away) under a white bar with the SAXDOR wordmark centred and a burger left; eyebrow "MYSAXDOR APP" tracked, "STAY CONNECTED. STAY AT EASE." in a large stroked extended caps (~72 px), one white-outlined button "DISCOVER MYSAXDOR APP", a "SCROLL" cue. A consent card bottom-right with only "Accept" (left untouched). Scrolled: white, "SIMPLIFY YOUR BOATING EXPERIENCE WITH MYSAXDOR" in the wide caps in navy, a paragraph, App Store / Google Play badges, three phone mocks with the owner's boat named at the top of the first ("SAXDOR 400 GTS · My Saxdor").
- **Pattern:** product-page hero; the doors are store badges.
- **Type:** an extended geometric caps face (outline in the hero, solid navy below) — a nautical voice; 16 px body in a humanist grotesk.
- **Imagery:** photography carries, then phone mocks.
- **Motion observed:** none confirmed.
- **Keep:** eyebrow / headline / one outlined button as the hero hierarchy; "your boat, by name" at the top of the mock is exactly how our screen should name the business.
- **Avoid:** stroked display type over a busy photo (the "AT EASE." loses its counters against the dock); a consent card with no reject.

### Riviera — `riviera-home.png`, `riviera-ownership.png`, `riviera-owner-registration.png`
- **For the person:** no owners portal exists publicly; "Owner Registration" is a long form (registering-as, ownership type, name triplets, two phone numbers…). The home is an aerial of two Belize 55 hulls with "A proud tradition" (light ~48 px), a subline, and a white-outlined "DISCOVER MORE NOW"; the ownership page is a couple at the helm under "OWNERSHIP" in tracked caps. The blue pennant logo hangs over the nav top-right like an object; a Google Translate widget sits top-left.
- **Pattern:** brochure site; the door is a form.
- **Type:** a wide tracked grotesk in caps for headings, 18 px body; buttons outlined white on photo.
- **Imagery:** photography carries.
- **Motion observed:** none.
- **Keep:** the pennant logo as a hanging object — the one live example of "the logo as the showpiece"; an outlined button on a photograph as a calm door.
- **Avoid:** a form as a door; the same heading twice; a translation bar.

### Garmin — `garmin-signin.png`
- **For the person:** "Sign In" (~28 px), a hairline, Email Address* and Password* outlined fields with "Show" inside the password, Remember Me + Forgot Password?, a light-blue Sign In bar, "Don't have an account? Create One". Black bars top ("connect" wordmark) and bottom (copyright, Terms / Privacy / Security).
- **Pattern:** card over photo — a 464 px white card floated high on a full-bleed photo of two runners stretching on grass in golden light.
- **Type:** a default-looking sans (Arial-class) at 16 px; 48 px fields.
- **Imagery:** lifestyle photograph; the card sits over the people's faces.
- **Motion observed:** none.
- **Keep:** the card floated high so the eye lands on it first; black bars framing top and foot.
- **Avoid:** a card over faces; a blue-tinted disabled primary that reads active; default type.

### Mercury Marine — MercNET dealer login — `mercury-mercnet.png`; site — `mercury-site.png`
- **For the person (MercNET):** the dealer's own supplier door. A deep-teal band with the Mercury logo, a sky photo, "Sign in" in bold teal (~32 px), 750 px-wide outlined fields, "Forgot your password?" right, then **two buttons side by side naming two audiences: teal "Sign in" and outlined "I'm an Internal User"**; links "Become a Dealer", "Contact Us"; a legal line; the top of a bimini peeks at the foot.
- **Pattern:** one form, two audiences named on two buttons — the closest live analogue to our two doors.
- **Type:** a bold humanist grotesk; 18 px labels; 40 px buttons, 4 px radius.
- **Imagery:** a sky as background; the product is cropped away.
- **Motion observed:** none.
- **Keep:** naming the two audiences on the buttons themselves; the brand band on top as the "which business" line.
- **Avoid:** 750 px inputs; generic sky; the boat cropped to a bimini.
- **Site:** dark two-tier nav (Mercury / Racing / Flite marks), a promo carousel ("SAVE $1,500", "LAST DAYS" ribbon), three news tiles. Marketing, not an entry pattern.

### Brabus Marine — `brabus-marine.png`, `brabus-powerboats.png`, `brabus-marine-scrolled.png`
- **For the person:** a consent modal first ("Confirm selection" keeps only required cookies — confirmed). Then a full-bleed **video** hero (two captures differ: a "500R" outboard cowl; the "BRABUS" carbon hull graphic), a translucent bar with a burger, the BRABUS MARINE wordmark small and centred, globe / account / bag icons. Scrolled: white; "REDEFINING MODERN DAY BOATING" in condensed bold caps (~28 px), two centred paragraphs in a light grotesk, a grey band "BRABUS SHADOW 38 RANGE", then a two-up grid of model photos with tracked caps captions (SHADOW 1000 XC wraps).
- **Pattern:** product-macro video hero, then a range grid.
- **Type:** condensed bold caps for headings, light grotesk body (18 px, generous leading), tracked caps captions.
- **Imagery:** product macro — the badge fills the frame. For a dealer the equivalent is a hull chine or an outboard cowl, honest because it is the product.
- **Motion observed:** the hero is a video loop (frames differ between captures).
- **Keep:** product macro as the picture; a small centred wordmark on the video; the light body on white after a dark hero.
- **Avoid:** a consent modal with no reject (needs a "confirm" click); captions that wrap onto a second line in a grid.

### Boston Whaler — Build — `whaler-build-and-price.png`, `whaler-build-and-price-scrolled.png`
- **For the person:** a two-tier white nav (MODELS; SHOPPING TOOLS, OWNERS, LIFESTYLE, WHY WHALER; a red "BUILD" wrench tile top-right), a full-bleed sunset aerial with one boat, a translucent white panel bottom-left carrying "BUILD YOUR PERFECT" (small caps) and "Boston Whaler" in a red serif (~64 px), and under the photo a strip of series names as tracked caps tabs (SUPER SPORT … OUTRAGE) — the series are the doors. The scrolled capture caught a newsletter modal (name, email, country, ZIP) over everything.
- **Pattern:** hero with a caption block, then a series tab strip.
- **Type:** a red serif display against a tracked grotesk eyebrow; tabs in 14 px tracked caps.
- **Imagery:** photography carries.
- **Motion observed:** the modal appeared on a timer after load.
- **Keep:** eyebrow + serif title inside a translucent panel as a caption block on the photo; series as a tab strip beneath.
- **Avoid:** a marketing modal over a build tool; the act you are already on rendered as a red nav tile.

### Axopar — `axopar-community.png`, `axopar-community-scrolled.png`, `axopar-connect.png`, `axopar-manuals-login.png`
- **For the person:** the owners' door is a brochure page: a full-bleed photo (six Axopars rafted under a waterfall), "Configurate →" and "Find a Dealer →" pinned top-right as arrow links, "WELCOME TO THE AXOPAR OWNERS COMMUNITY" in a heavy condensed caps (~56 px), a paragraph, then "OFFICIAL AXOPAR OWNERS CLUB" beside a photo. Axopar Connect: a hand holding the phone (the app shows "Axopar 29 XC Cross Cabin" at the top, weather, checklists) in front of a lake cabin and boat; "SMARTER, MORE PERSONAL BOATING". The manuals login redirects to a third-party "cyientshare" page — a generic blue-button email/password form with no Axopar in it.
- **Pattern:** brochure; product-in-hand hero; two acts pinned as arrows.
- **Type:** heavy condensed caps for headlines; 18 px humanist body.
- **Imagery:** photography carries.
- **Motion observed:** none.
- **Keep:** the app naming the person's own boat at the top; two acts pinned top-right as "word →" links.
- **Avoid:** handing the door to a third-party page that drops the brand; ultra-condensed caps on a two-line headline.

### Highfield — `highfield-home.png`
- **For the person:** a full-bleed **video** hero (two captures differ: a snorkeler over reef; a RIB carving under grey hills) under a translucent dark bar with the Highfield logo ("dare to explore"), an "ADV" corner ribbon, BOATS / DEALER LOCATOR / REQUEST A QUOTE / SPARE PARTS, a flag + EN, burger. "#DARETOEXPLORE" in ~90 px extra-bold caps, "Welcome to Highfield Boats" bold small, a down chevron. Accessibility toggles (contrast, text size) pinned right; a chat bubble; a cookie bar with "Reject All" (rejected). The burger did not open under any selector tried.
- **Pattern:** video hero with a hashtag headline.
- **Type:** an extra-bold geometric caps; the headline's legibility changes with what the video shows behind it.
- **Imagery:** video carries.
- **Motion observed:** video loop (frames differ).
- **Keep:** "Request a quote" in the top bar (the dealer's act named in the nav); accessibility toggles as an honest affordance.
- **Avoid:** a hashtag as a headline; a corner ribbon; text over a video whose luminance changes under it.

### Apple Account — `apple-signin.png`
- **For the person:** an emblem (a ring of coloured dots around the Apple mark) above "Apple Account" (~40 px SF Pro semibold) and "Manage your Apple Account"; one field "Email or Phone Number" with a blue focus ring; a paragraph with a two-person glyph explaining what the account information is used for; **two equal-width buttons side by side** — a light-blue (disabled until valid) "Continue" and a black "Sign in with iPhone" — with "Requires a device with iOS 17 or later." under the second. The full Apple nav and an "Apple Account" sub-nav sit above; an AU footer ("Or call 133-622") below.
- **Pattern:** identifier-first with a two-button row.
- **Type:** SF Pro; 40 px title, 17 px subline, 12 px explanation; 44 px buttons, 8 px radius; 460 px column.
- **Imagery:** typographic with an emblem as the showpiece.
- **Motion observed:** none confirmed (the dot ring may animate; a static frame cannot say).
- **Keep:** the emblem above the title (the "logo as showpiece" wish, done small); one field; two buttons in one row at equal width — a live "two doors" row; the explanation under the field that says what the data is for.
- **Avoid:** a disabled primary tinted so lightly it reads as active; the marketing nav on a door.

### Herman Miller — `hermanmiller-login.png`, `hermanmiller-login-scrolled.png`
- **For the person:** full store chrome (utility bar, nav, search), a breadcrumb, then "Sign in or Create an Account" at ~100 px in a black grotesk, then **two cards side by side**: left with tabs Sign In / Create Account, "Visit Account Page", a purpose sentence, Email / Password, Remember me, Forgot Password, a black "Sign In" bar; right "Check Your Order Status" for guests (order number, email, ZIP, "Check status"). A cookie bar (Accept All / Settings, no reject) stays at the foot.
- **Pattern:** two-column doors — account holder vs guest — each card with its own headline, sentence and button.
- **Type:** a heavy grotesk display; 18 px body; 48 px fields; 56 px black buttons.
- **Imagery:** typographic; the headline is the only decoration.
- **Motion observed:** none.
- **Keep:** two cards each with its own headline, sentence and button — a literal two-doors layout that explains both.
- **Avoid:** a headline so large it pushes the doors under the fold; tabs inside a card that already sits beside another card (three levels of choice); the store chrome.

### Bang & Olufsen — `bo-login.png`
- **For the person:** the wordmark centred ("BANG & OLUFSEN · Est. 1925"), then a two-column page split by a hairline. Left: "Log in", "Sign in to access your account", bottom-rule-only fields with "(required)" written in grey after the label, Remember me + Forgot password?, a black pill "Log in", "or log in with other services", four outlined pills. Right: "New to Bang & Olufsen?", "With your account, you can:", three check-marked benefit lines, an outlined "Create Account" pill. A validation error ("The email address is a mandatory field") is already showing under the empty email field before anyone typed.
- **Pattern:** two-column existing / new, with a benefits list on the new side.
- **Type:** B&O's humanist grotesk; 26 px column titles; 16 px labels; 15 px benefits; 48 px pills.
- **Imagery:** typographic.
- **Motion observed:** none.
- **Keep:** the right column that says in three checked lines what the door gives you — the way to state "53 tables · 15,691 rows" against what a blank sheet is; the hairline divider; "(required)" as a word, not an asterisk.
- **Avoid:** an error before the person has typed; four provider pills.

### Tesla, Rimowa — not captured
Both sit behind Akamai bot protection and answered "Access Denied" to the headless browser (Tesla on both `www.tesla.com/teslaaccount` and `auth.tesla.com`; Rimowa on `/au/en/login` and `/us/en/login`). Not fought.

---

## Imagery vs. type, at a glance

- **Photography carries the page:** Porsche, BMW, Rivian (product detail), Lucid, Garmin, Saxdor, Riviera, Axopar, Highfield (video), Brabus (video, product macro), Boston Whaler.
- **Typographic:** Polestar, Linear, Notion, Vercel, Raycast (dark), Framer, Herman Miller, Bang & Olufsen, Apple (emblem), Stripe (abstract ribbon), Arc (illustrative), Nimbus Connect (gradient veil).
- Of the boat brands, only Mercury's dealer portal has a real sign-in; Nimbus, Saxdor, Axopar and Riviera route owners to an app, a form or a brochure page. The best marine references for this screen are therefore about the ground (Nimbus's veil, Brabus's product macro, Saxdor's hierarchy) and about naming the person's boat (Saxdor's and Axopar's app mocks), not about the form.

## The six best for THIS screen, ranked

1. **Bang & Olufsen** — the two-column "log in | new here, and here is what you get" is the two-doors shape with each door explained in words; swap its benefits list for "53 tables · 15,691 rows" and what a blank sheet is.
2. **Apple Account** — one field, an emblem as the showpiece above the title, an explanation of what the name is used for, and two equal buttons in one row: the tightest honest single-column answer.
3. **Porsche ID** — the photograph across most of the window and one white column asking one thing is direction A's frame, proven at 1440 wide with the picture edge to edge and no caption.
4. **Linear** — the doors as stacked pills with one coloured primary and nothing else on the page: the model for how little the screen needs once it says who and which business.
5. **Mercury MercNET** — the only marine login that names two audiences on two buttons side by side, and it is the dealer's own supplier's door.
6. **Nimbus Connect** — the veil gradient with one lockup and a roman/italic pair is direction B's ground; it shows a marine brand's entry can be a colour field rather than a photo and still feel like water.

Runners-up worth a line: **Herman Miller** (two cards, each with its own headline and button); **Stripe** (the card-footer band as the second door); **Rivian** (the product-detail crop as the picture when the picture is of the product); **Saxdor** (eyebrow / headline / one outlined button, and the boat named at the top of the app).
