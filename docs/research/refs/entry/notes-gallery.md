# Entry — gallery mining (beyond the seed list)

Sweep date 2026-09-16. Frames: `docs/research/refs/entry/gallery/*.png` (gitignored; mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\entry\gallery\`). Ledger: `docs/research/refs/entry/gallery/sources.json` (50 entries, every capture with its final URL and page title). Driven headless at 1440×900 with `tools/research/capture.ts`; consent banners answered with the most privacy-preserving button; nothing signed in, nothing typed.

**The screen's job.** Say who is at the desk and which business; two doors (load the Master Price File, stating "53 tables · 15,691 rows", or start a blank sheet); honest that it is not authentication until M6; no password field. A returning visitor lands on Home.

**What was mined and how.** The seed list (Porsche, BMW, Polestar, Tesla, Linear, Notion, Vercel, Stripe, Apple, the boat brands) is another agent's. This sweep went to the galleries and the design-forward write-ups for what those miss: entries that are a *door* rather than a form, entries that ask *which workspace/business*, entries that are honest about being local, and entries where the picture or the product carries the page. Galleries reached: saasframe.io (login category), saasinterface.com (sign-in category), landingfolio.com (login), mobbin.com (web · screens · login; web · flows · onboarding, read live), awwwards (inspiration search "login" / "sign in"), eleken's 50-example write-up, appcues' onboarding write-up. Galleries that refused a plain fetch: refero.design (pattern page 404s; live page reads "Looks like you're lost"), land-book.com and lapa.ninja (403), recent.design (reachable, but its Interface feed is designers' shots with no live URLs — nothing entry-shaped there this week beyond "Recollect App Onboarding" and an "Eye of Sauron password toggle").

Every frame below was looked at. Composition, type and colour are what is in the still; **no motion was measured** — a static capture cannot show it, and nothing below claims it.

---

## The ranked six

1. **Steep** (`steep-login`) — the only entry in the sweep that is literally a door: one line drawing of a door ajar onto a starfield, a serif sentence, four ways in as a single row of pills, and no password field until you ask for one.
2. **Excalidraw** (`excalidraw-blank`, `excalidraw-blank-full`) — the blank sheet *is* the entry, with a hand-lettered welcome that says in one honest sentence that the work lives in the browser and offers "Open ⌘O" as the other door.
3. **Slack, the workspace door** (`slack-workspace`) — "Sign in to your workspace" as the headline, one input whose suffix `.slack.com` is fixed and bold, three quiet links for the lost: the best "which business" screen found.
4. **Headspace** (`headspace-login`) — a photograph of sky fills the window and one rounded card floats on it; email first, a single Continue, the provider row demoted to small coloured discs.
5. **Better Stack** (`betterstack-signin`) — a dark room with one lit mark, a magic link as the only primary act and "Sign in using password" reduced to a text link: the password is optional and the page says so by weight.
6. **folk** (`folk-login`) — left half asks one thing in two pills; right half is the product itself on warm paper, tilted, already open on a sales pipeline: what is behind the door is shown rather than described.

Runners-up worth a look on the board: **Deel** (the card is titled "Choose a method to log in" — the entry as a menu of doors, beside a drawing of a desk), **Coda / Superhuman Docs** (labelled provider tiles and the sentence "We'll email you a link for a password-free sign in. Or sign in with a password."), **Reflect** (a glowing emblem as the whole top half of a dark page), **Oku** (a pencil drawing carries half the page and the greeting is a serif), **Raycast** ("Password (optional)" written in the field itself).

---

## One entry per site

Each entry: where it was found (gallery page), what was driven, what is in the frame, the pattern by name, what it does for the person at the desk, what to avoid.

### Steep — `steep-login`, `steep-password`
- Found: saasinterface.com/pages/sign-in/ and eleken.co/blog-posts/login-page-examples ("central illustration with passwordless multi-provider options"). Driven: https://app.steep.app/login → `web.steep.app/login`.
- Seen: white page; a thin-line drawing of an open door, its gap showing a black starfield, centred in the top half; below it "Sign in or create a new account" set in a bracketed display serif at roughly 40px, two lines, centred; then one row of four equal outlined pills (Google, Apple, Microsoft, Company SSO), a small underlined "Login with password", a 12px legal line, the wordmark last. Black on white, the only colour the provider glyphs. Scale contrast between the serif headline and the pill labels is about 3×.
- Pattern: **illustrated threshold + provider row; password behind a link**.
- For this screen: the page has one figure and one sentence; the doors are peers in a row, not a stack; the thing you do not need (a password) is present but demoted to text. The second state (`steep-password`) drops into a generic Auth0 card — a lesson in what happens when the second door is not designed: the drawing, the serif and the row are all gone.
- Avoid: the second door falling into a template; a starfield that is decoration for a boat dealer (ours has water).

### Excalidraw — `excalidraw-blank`, `excalidraw-blank-full`
- Found: design-forward write-ups on no-login tools (hackdesign.org toolkit, sliplane/storyflow round-ups); not a gallery item. Driven: https://excalidraw.com/.
- Seen: an empty white canvas is the page. Over it, greyed and hand-lettered (Excalidraw's own Virgil face): the wordmark, a three-line note — "Your drawings are saved in your browser's storage. Browser storage can be cleared unexpectedly. Save your work to a file regularly to avoid losing it." — then a short menu: Open (Ctrl+O), Help (?), Live collaboration…, Sign up. Hand-drawn arrows point at the menu button ("Export, preferences, languages…"), the toolbar ("Pick a tool & Start drawing!") and the help button. Keyboard hints in a mono face (`Scroll wheel`, `Space`). Everything is 40% grey until you touch the sheet.
- Pattern: **welcome overlay on the blank sheet; honesty line; "Open a file" as the second door**.
- For this screen: this is the one reference that says out loud that the data is local and might vanish — exactly our "not authentication until M6" honesty, phrased as help rather than a warning. "Open ⌘O" beside "start drawing" is our two doors in miniature. The greyed overlay means the sheet is already there; you are not on a page *before* the app.
- Avoid: the whole app's chrome (toolbar, zoom, share) before the person has said who they are; the hint arrows as a permanent fixture.

### Slack — `slack-signin`, `slack-workspace`
- Found: eleken.co write-up ("email-only with magic link"). Driven: https://slack.com/signin, then one click on "Try entering a workspace URL" → `slack.com/workspace-signin`.
- Seen (first state): white; wordmark; a two-line display headline in Slack's Larsseit — "Enter your email address to sign in" — at about 48px, the instruction *is* the headline; one input, one aubergine button, "OR SIGN IN WITH" in small caps, Google and Apple as two outlined buttons, "Having trouble? Try entering a workspace URL". (Second state): "Sign in to your workspace" — one input with the placeholder `your-workspace` in grey and the suffix `.slack.com` in bold black, a Continue, then three helper lines: "Don't know your workspace URL? Find your workspaces", "GovSlack workspace?", "Create a new workspace".
- Pattern: **headline-as-instruction; tenant-first entry with a fixed suffix**.
- For this screen: the "which business" question answered with the fewest possible parts — the business name typed into a field that already shows the rest. The headline tells you what to do instead of saying "Welcome back". The lost have three sentences, not a help centre.
- Avoid: the aubergine as a house colour (ours is blue and white); "GovSlack"-style branching that a dealer never needs.

### Headspace — `headspace-login`
- Found: landingfolio.com/inspiration/login and eleken ("split-screen with rounded inputs and empathetic copy"). Driven: https://www.headspace.com/login → `auth.headspace.com/u/login/identifier`.
- Seen: a sky-blue gradient photograph of clouds fills the whole window; the orange-dot wordmark top-left; a white card (about 400×720, 32px radius) floats centred; inside, "Log in" in a humanist grotesk, "New to Headspace? Sign up for free", one email field, a full-width blue Continue, a terms checkbox, "or", four provider discs (Facebook, Spotify, Apple, Google) as coloured circles, an SSO pill, then "Support for all of life's moments" with three illustrated tiles.
- Pattern: **photograph as ground, card as door; email-first, providers as discs**.
- For this screen: the picture does the welcoming and the card asks one thing; the alternative ways in are visible but small. For a dealer, the sky would be water and the boat, and the card would ask a name. The "support for all of life's moments" strip is the seller's own "what you get" — ours would be the file's true figures ("53 tables · 15,691 rows"), not a slogan.
- Avoid: a terms checkbox on an entry that protects nothing; four brand-coloured discs competing with the house blue; the card so tall it nearly touches both edges at 900px.

### Better Stack — `betterstack-signin`
- Found: mobbin.com/explore/web/screens/login and saasinterface.com/pages/sign-in/ ("Better Uptime"). Driven: https://betterstack.com/users/sign-in → `#magic`.
- Seen: near-black navy ground with a faint starfield and two faint diagonal rules; a small white lit mark; "Welcome back" in a grotesk with a subtle brightness gradient across the word; "First time here? Sign up for free"; E-mail label, one input with a glowing indigo focus ring, a full-width indigo "Send me a magic link"; then "Sign in using password" as plain text; a rule; one outlined "Single Sign-On (SSO)"; legal line at the foot; "← Back to Better Stack" top-left.
- Pattern: **dark stage, magic link primary, password as text**.
- For this screen: the hierarchy makes the argument — the one lit control is the one act; what you do not need is a sentence, not a field. The back link top-left is the honest exit. The stars are quiet enough to be a texture rather than a picture.
- Avoid: dark as default (dark is offered, not default, and only when every token is theme-scoped); the indigo family.

### folk — `folk-login`
- Found: mobbin.com/explore/web/screens/login (first tile). Driven: https://app.folk.app/login.
- Seen: split 50/50. Left, white: a smile mark, "Get started with folk" in a grotesk at about 36px, one black pill "Continue with Google", one outlined pill "Continue with email", a legal line — nothing else. Right, warm speckled paper: a laptop-cornered screenshot of folk itself, tilted, open on "POW Agency › Sales pipeline" with kanban cards, then "Trusted by 3000+ companies" and three ratings.
- Pattern: **one-question column beside the product, in situ**.
- For this screen: the desk is shown, not sold. A dealer who has never seen HelmLogic would see the sheet or a quote before they type anything. Two pills, one of them black, is the least a door can be.
- Avoid: the ratings strip (we have no reviews to show and will not invent them); a screenshot that goes stale — ours would be the live sheet or a real frozen quote.

### Deel — `deel-login`
- Found: mobbin.com/explore/web/screens/login. Driven: https://app.deel.com/login.
- Seen: a lavender ground with a large diagonal in a second lavender; left, a flat illustration of a desk, chair and lamp with three perk logos floating over it, then "Sweet perks and even sweeter discounts" in a grotesk at about 56px with the second line on a white highlight, a subline and a "Learn more" button; right, a white card: "Log in", "Choose a method to log in", three stacked outlined options (Deel app, SSO, Google), "Or", email, password, black "Log in", "Need an account? Create account". "Need help?" and a language menu top-right.
- Pattern: **card as a menu of doors ("choose a method"); illustrated stage**.
- For this screen: the card's subtitle names what the card is — a choice between ways in — which is exactly our two doors; the drawing of a desk is literally "who is at the desk". The perks marketing is not.
- Avoid: a promotion on the entry; a second lavender diagonal for its own sake; password present as a full field.

### Coda / Superhuman Docs — `coda-login`
- Found: eleken write-up ("split layout with email magic link option"). Driven: https://coda.io/login → `coda.io/signin`.
- Seen: warm off-white ground with a collage (a pink card of rotated text, a gradient tile, the Coda mark → the Superhuman mark) on the left two-thirds; right, a card with a pink-to-white gradient top: "Welcome back", a one-line promise, "Sign in with" over four square icon tiles with labels beneath (Google, Microsoft, Apple, SSO), "or", a work-email field, a purple Continue, then a tinted note: "We'll email you a link for a password-free sign in. Or sign in with a password." A black rebrand banner across the top.
- Pattern: **labelled provider tiles; the password explained in a sentence**.
- For this screen: the tinted sentence is the honest register we want — it says what will happen and offers the other way in the same breath. Labelled tiles read faster than a stack of five buttons.
- Avoid: the rebrand collage (it is their news, not the person's); a banner above the door.

### Reflect — `reflect-login`
- Found: saasframe.io/categories/login. Driven: https://reflect.app/login → `/auth`.
- Seen: near-black indigo page; the whole top third is a glowing node-graph orb on a faint grid; "Sign in with" then two wide purple gradient buttons (Google glyph, Apple glyph, no labels); "or continue with"; one dark email field; a purple Continue; four footer links and a copyright.
- Pattern: **emblem stage; two big provider buttons; email third**.
- For this screen: an emblem can be the picture when there is no photograph — but ours has photographs, and the orb is theirs. The two-button row shows what two doors look like as the only large controls on the page.
- Avoid: icon-only buttons without labels (keyboard users hear "button"); purple.

### Oku — `oku-login`
- Found: saasframe.io/categories/login. Driven: https://oku.club/signin (the gallery's `/login` 404s).
- Seen: split 50/50. Left, white: serif wordmark, "Hey, welcome back" in a transitional serif at about 26px, "Good to see you again!", email, password with "Forgot password?" on the label line, a black "Sign in" and "Or sign up" on one row. Right, pale grey: a pencil drawing of a person floating horizontally to pull a book from a shelf, black and white, unframed.
- Pattern: **split with a drawn picture; greeting in a serif**.
- For this screen: shows how far one drawing carries an entry when there is no product to show and no photograph — and how the greeting can be a person's tone ("Hey") rather than a system's.
- Avoid: a full password field; a drawing when we have real on-water photography.

### Raycast — `raycast-login`
- Found: saasframe.io/categories/login. Driven: https://www.raycast.com/users/sign_in.
- Seen: black; the marketing nav retained in a rounded bar; centred: the red mark, "Log in to Raycast" in a grotesk at about 28px, three square icon-only provider buttons (Apple, GitHub, Google), "or", an email field, a field whose placeholder reads "Password (optional)", a light "Send Magic Link" button, and "Don't have an account? Sign up →" in an outlined pill.
- Pattern: **optional password named in the field**.
- For this screen: "(optional)" in the placeholder is the plainest way found to say a field is not required — but it still shows the field. Ours shows none.
- Avoid: keeping the whole site nav on the entry; icon-only providers.

### Notion — `notion-login` (seed-list site; captured only because mobbin lists it)
- Found: mobbin.com/explore/web/screens/login; eleken ("centred card with generous white space"). Driven: https://www.notion.so/login → `app.notion.com/login`.
- Seen: white; the mark; "Your AI workspace." in black over "Log in to your Notion account" in grey (a two-tone headline); Email with the hint "Use an organization email to easily collaborate with teammates"; a blue Continue; "or continue with"; six equal square tiles in a 3×2 grid, glyph over label (Google, ChatGPT, Apple, Microsoft, Passkey, SSO); "New user? Sign up"; legal; a language menu at the foot.
- Pattern: **provider grid; the "which organisation" hint under the field**.
- For this screen: the hint under the field is a quiet way to ask for the business without a second screen; the grid lets six doors sit in two rows without a scroll.
- Avoid: six doors (we have two); the AI tagline.

### Shopify — `shopify-lookup`
- Found: mobbin.com/explore/web/screens/login; eleken ("progressive modal using gradient backdrop"). Driven: https://accounts.shopify.com/lookup.
- Seen: a black-to-charcoal radial ground; a white card (about 475×470, 24px radius): "Log in" and "Continue to Shopify account", one email field with a dark focus ring, a black "Continue with email", "or", a grey "Sign in with passkey", then four equal icon-only tiles (Google, Apple, Facebook, WhatsApp), "New to Shopify? Get started →". "Need Help?" and legal at the foot. The store picker (which shop) comes only after an email, so it was not reached.
- Pattern: **email lookup first, tenant chosen after**.
- For this screen: the two-step order — who, then which shop — is the dealer's order too (who is at the desk, then which business), but Shopify hides the second step behind the first. Ours should show both on one page.
- Avoid: four brand glyphs in a row as the visual foot of the card.

### Supabase — `supabase-signin`
- Found: saasframe.io/categories/login. Driven: https://supabase.com/dashboard/sign-in.
- Seen: split 40/60 with a hairline. Left: wordmark, "Welcome back" / "Sign in to your account", three outlined buttons (GitHub, ChatGPT, SSO), "or", email, password with a pre-filled dot mask, a green "Sign in", legal at the foot. Right, off-white: a large grey quotation mark and a customer tweet at about 28px with an avatar.
- Pattern: **split with a testimonial**.
- For this screen: a reminder that the right half is wasted when it carries praise instead of the product. Its one good idea is the size of the right-hand text: a single 28px sentence holds half a window.
- Avoid: testimonials (we have none and will not write them); a pre-filled mask.

### Clay — `clay-login`
- Found: saasframe.io/categories/login and saasinterface.com/pages/sign-in/. Driven: https://app.clay.com/login.
- Seen: split 50/50. Left, white: rainbow mark, "Welcome back!" at about 36px, one line of purpose, an outlined "Sign in with Google", "OR", an email field with an envelope glyph, a full-width blue Continue, "Don't have an account? Sign up". Right: deep blue with 3D clouds, floating notification cards and a product table ("Prospect intent tracker", 0 / 43,918 rows selected) cropped at the frame edge.
- Pattern: **split with the product's own table as the picture**.
- For this screen: the table on the right is the closest analogue found to showing "53 tables · 15,691 rows" as a *picture* rather than a caption — a real grid, cropped, with a real count in its header.
- Avoid: rendered clouds; a grid whose rows are fictional names (ours must be the file's own rows or nothing).

### Sana — `sana-login`
- Found: mobbin.com/explore/web/screens/login. Driven: https://sana.ai/login.
- Seen: white; left column centred text: "Welcome to Sana" black over "Your AI agent for work" grey (the two-tone headline again, about 34px), "Sign in or sign up for free with your work email", an outlined Google pill, "or", an email field, a grey disabled pill, a long legal paragraph; right: a dark laptop render angled, showing the product with a yellow-green card lit inside it.
- Pattern: **two-tone headline; product in a device**.
- For this screen: the two-tone headline (who you are / what this is) is a neat way to say "Northside Marine / HelmLogic" in one block. The device render is not for us — a screen inside a screen is a picture of a picture.
- Avoid: the legal paragraph at body size; a disabled primary as the first thing the eye lands on.

### Contra — `contra-login`
- Found: mobbin.com/explore/web/screens/login. Driven: https://contra.com/log-in (the gallery's `/login` 404s).
- Seen: light grey ground; one white panel (about 1130×600, 24px radius) split by a hairline. Left: "Welcome back to Contra" in a grotesk at about 34px, a black "Continue with Google" pill, "OR", a work-email field, a disabled "Log in" pill, "New to Contra? Sign up". Right: a still-life photograph of eight glass prism wedges arranged as the Contra mark on white, then "TRUSTED BY 1M+ CREATIVES AND 50K+ TEAMS" and a logo wall.
- Pattern: **one panel, two halves; a photographed emblem**.
- For this screen: the panel-inside-the-page keeps the entry compact at 1440 and lets the picture and the question share one object. The photographed emblem is the "logo as showpiece" idea done with a camera instead of a vector.
- Avoid: logo walls; a disabled primary.

### Vanta — `vanta-login`
- Found: eleken write-up ("playful illustration with email-only flow"). Driven: https://app.vanta.com/login.
- Seen: lavender-grey ground; a white panel split with a pale right half; left: "Welcome back!" in a serif at about 40px, "Sign in to Vanta" with a region menu (US ▾), one email field, a disabled "Continue with email", "Don't have an account? Contact us."; right: a purple event poster ("VantaCon — Agents of Change", a serif italic) with "Register now →".
- Pattern: **email-only entry; the right half as a poster**.
- For this screen: email-only with no provider row is the sparsest working entry in the sweep — one field, one button. The region menu beside the title is a small "which business/region" control placed where it is needed.
- Avoid: an event poster; "Contact us" as the only way to start.

### Tines — `tines-login`
- Found: eleken write-up ("generous whitespace with stacked authentication"). Driven: https://login.tines.com/ → a SAML IdP page.
- Seen: a ground of large pale overlapping circles; the mark; "Welcome back" at about 26px; three white pills (Google, Microsoft, "Sign in with work email"); "Don't have an account? Sign up"; a monospace legal line at the foot.
- Pattern: **three pills, no field**.
- For this screen: an entry with no input at all on first paint — every door is a button; the field appears only after a choice. The mono footnote is a nice register for the "not authentication until M6" line.
- Avoid: the circle wallpaper.

### Frame.io — `frame-login`
- Found: mobbin.com/explore/web/screens/login ("Frame"). Driven: https://app.frame.io/login → `accounts.frame.io/welcome`.
- Seen: split 33/67. Left third: a dark photograph-like gradient with a glowing violet-to-amber arc (a planet's limb); right: white, the three-arc mark in violet, "Welcome", "Enter your email to get started.", one email field, a violet "Let's go" button. Nothing else on the page.
- Pattern: **narrow picture column, one field, one verb**.
- For this screen: the sparsest split found — the picture is a third, the question is a sentence, the button is a verb ("Let's go") rather than "Log in". The proportion (one-third picture) is worth trying against Porsche's ~60%.
- Avoid: a gradient standing in for a photograph when a photograph exists.

### Twist — `twist-login`
- Found: mobbin.com/explore/web/screens/login. Driven: https://twist.com/login.
- Seen: white; left column: "Sign up or log in" at about 34px bold, two outlined pills (Google, Apple), a rule, an email field with a floating label, a pale-blue disabled "Continue with email", legal; right: a watercolour of three keyed boxes on an ochre wash with an orange sun.
- Pattern: **one headline for both cases; illustration right**.
- For this screen: "Sign up or log in" as one headline refuses the returning/new split — useful for a desk where the same person is both. The keyed boxes are a drawn metaphor for the doors.
- Avoid: a disabled primary; an illustration that is the brand's, not the dealer's.

### ElevenLabs — `elevenlabs-signin`
- Found: mobbin.com/explore/web/screens/login. Driven: https://elevenlabs.io/app/sign-in.
- Seen: white; wordmark top; "Welcome back" at about 26px; three outlined pills (Google, Apple, SSO); a rule; Email and Password fields with "Forgot your password?"; a grey disabled "Sign in"; "Don't have an account? Sign up".
- Pattern: **centred stack, five parts**.
- For this screen: the median login of 2026, kept as a control for what "generic" looks like at 1440×900 — every element the same width, nothing larger than 26px, nothing pictorial.
- Avoid: this.

### Loom — `loom-login`
- Found: landingfolio.com/inspiration/login. Driven: https://www.loom.com/login.
- Seen: white; "Log in to Loom" at about 32px; five stacked outlined buttons (Google, Slack, Apple, Outlook, SSO); "OR"; work-email field; a disabled Continue; Atlassian legal; "Can't log in? Troubleshoot."
- Pattern: **provider stack**.
- For this screen: a stack of five equal buttons is a list, not a choice; the eye has to read every label. Two doors should not look like this.
- Avoid: the stack.

### Air — `air-login`
- Found: landingfolio.com/inspiration/login. Driven: https://app.air.inc/login.
- Seen: light grey; a white card with the script wordmark, "Welcome back!", two outlined provider buttons, "Continue with SAML SSO" as a link, "or", Email and Password (required asterisks, a rule line under the password), a blue "Log in", "Forgot password", "New to Air? Sign up"; an Intercom bubble.
- Pattern: **card form with password rules**.
- For this screen: shows the cost of a password on an entry — the rule line ("8+ characters, one number…") is a sentence the desk never needs.
- Avoid: password rules; a support bubble on the door.

### Qonto — `qonto-login`
- Found: saasinterface.com/pages/sign-in/. Driven: https://app.qonto.com/signin.
- Seen: split 50/50. Left: wordmark and language menu, "Welcome back!", two outlined providers, "or", email (focused, blue ring) and password, a black pill "Sign in", "Open an account". Right, pale grey: a tiny document illustration and one announcement ("E-invoicing made effortless… available on all plans").
- Pattern: **split with an announcement**.
- For this screen: the right half as a product notice is the same wasted half as Supabase's testimonial; the language menu at the top of the form column is well placed.
- Avoid: announcements on the door.

### Tally — `tally-login`
- Found: landingfolio.com/inspiration/login. Driven: https://tally.so/login.
- Seen: white; a grey asterisk mark; "Welcome back" at about 26px; two outlined providers; a rule; Email and Password; a black Continue; two small lines for sign-up and reset; a "?" bubble bottom-right.
- Pattern: **minimal centred form**.
- For this screen: quiet to the point of anonymity — nothing says whose desk this is. A reminder that "minimal" is not the same as "ours".
- Avoid: a page that could belong to anyone.

### Spline — `spline-signin`
- Found: mobbin.com/explore/web/screens/login. Driven: https://app.spline.design/signin.
- Seen: white; a rainbow-gradient sphere as the mark; "Welcome to Spline" at about 26px; "Log in or register with your email."; a blue "Continue with Google"; a hairline; a grey Email field and a grey Continue; a reCAPTCHA note.
- Pattern: **one coloured object, everything else grey**.
- For this screen: shows how a single colourful mark carries a white page — "the logo as the showpiece", at small size.
- Avoid: reCAPTCHA copy on a door.

### Unkey — `unkey-login`
- Found: saasframe.io/categories/login. Driven: https://app.unkey.com/auth/sign-in.
- Seen: black; wordmark top-left, "Documentation" top-right; a left-aligned column at the centre: "Sign In" at about 32px, "New to Unkey? Create new account", two dark provider buttons, "or continue using email", an Email field with a white ring, a grey "Sign In with Email", legal.
- Pattern: **dark, left-aligned column**.
- For this screen: a dark entry whose form is left-aligned within a centred column reads as a document rather than a card — worth remembering for a typographic direction.
- Avoid: dark as default.

### Mercury — `mercury-login`
- Found: saasframe.io/categories/login. Driven: https://app.mercury.com/login.
- Seen: pale grey; a white card: "Log in", Email (focused) and Password with an eye toggle, "Forgot password?", a lavender disabled "Log in"; below a rule, "Continue with passkey" and a sentence explaining it; "Open Account ›" top-right.
- Pattern: **card with a passkey annex**.
- For this screen: the passkey explanation ("Log in securely using one click, your face, or your fingerprint") is a model for explaining a door in one sentence.
- Avoid: the bank's caution as our tone.

### Sketch — `sketch-signin`
- Found: saasframe.io/categories/login. Driven: https://www.sketch.com/signin/.
- Seen: white; diamond mark top-left, "Help ▾" top-right; "Sign in to Sketch" at about 34px bold; three outlined providers; "or"; Email (black ring) and Password with "Forgot Password?" on the label line; a lavender disabled "Sign In"; "New to Sketch? Create an account"; a floating terms toast at the foot.
- Pattern: **centred stack with a terms toast**.
- For this screen: a control frame; the only thing to take is the label-line placement of the secondary link.
- Avoid: a toast on first paint.

### WorkOS — `workos-signin`
- Found: saasframe.io/categories/login. Driven: https://dashboard.workos.com/signin → `signin.workos.com`.
- Seen: white; the mark; "Sign in to WorkOS" at about 24px; Email with a violet ring; a violet "Continue with email"; "OR"; an outlined Google; "Don't have an account? Get started"; legal at the foot. Four elements in a 345px column.
- Pattern: **email first, one alternative**.
- For this screen: the shortest working entry in the sweep — four parts. Proof that a door can be this small; ours adds the name and the two doors and should still be this short.
- Avoid: nothing to avoid; nothing to see either.

### Loops — `loops-login`
- Found: saasframe.io/categories/login. Driven: https://app.loops.so/ (the gallery's `/login` 404s).
- Seen: pale grey; an orange ring mark; "Sign in to Loops" at about 30px bold; "Or create your account"; a white card with Work Email, a black "Sign in", a rule, an outlined Google. A "?" bubble.
- Pattern: **title outside, form inside**.
- For this screen: putting the title and the alternative *above* the card leaves the card with one field and one button — a clean split of "what this is" from "what to do".
- Avoid: nothing; it is quiet.

### Cat Cay Yacht Club — `catcay-home`
- Found: awwwards inspiration search "login" (members login by membersfirst). Driven: https://www.catcayyachtclub.com/.
- Seen: a full-bleed aerial photograph of palms and a fairway under a navy top bar; a script-serif wordmark with a monkey mark centred in the nav; small-caps nav links either side; "LOGIN" as a navy pill top-right; an italic serif caption "The Spirit of the island…" bottom-left. The login itself is a members' page, not designed as a screen.
- Pattern: **login as a nav pill over photography**.
- For this screen: the only nautical entry found in the galleries; it shows a members' club treating the photograph as the whole page and the door as one pill — and that the door itself was not designed.
- Avoid: the door as an afterthought.

### G.H. Mumm RSRV — `rsrv-home`
- Found: awwwards inspiration search "login" (private club by SensioGrey). Driven: https://www.rsrv.fr/.
- Seen: a dark champagne still life; a white modal with a hard black border: the RSRV mark, "You have to be over 18 to enter this site", "Please enter your date of birth", one field (YYYY), "Remember me" with a warning line, legal, a country select. Behind it, a serif headline and a "Collection" button. A cookie banner across the foot (the tool's Reject All is visible).
- Pattern: **gate: one question before entry, with "remember me"**.
- For this screen: the gate asks one thing and remembers the answer — structurally our entry (a name, remembered, so a returning visitor lands on Home). The execution is a system dialog.
- Avoid: a hard-bordered modal; a warning under the remember box.

### Savee — `savee-login`
- Found: saasinterface.com/pages/sign-in/. Driven: https://savee.it/login → `savee.com/login/` — met a Cloudflare human check; not fought. The composition is still visible in the frame.
- Seen: black; left half: "Savee" top-left, "Welcome to Savee" at about 26px, a subline, the check widget where the form would be; right half: a masonry wall of the community's own saved images (posters, phones, type specimens) bleeding off the top, right and bottom edges.
- Pattern: **the collection as the wall beside the door**.
- For this screen: the only reference whose picture is the site's own content, in quantity — for a dealer, that wall would be the file's photographed boats, and it would be honest (only the models with pictures, none invented).
- Avoid: a wall of pictures we do not have; anything that looks like the check widget.

### tldraw — `tldraw-blank`
- Found: write-ups on no-login canvases (sliplane, storyflow). Driven: https://www.tldraw.com/.
- Seen: a blank white canvas with the toolbar at the foot, a style panel top-right, "Sign in to share" as the only blue pill, top-right. No welcome, no question, no name.
- Pattern: **no door; sign-in only when sharing needs it**.
- For this screen: the extreme of "start a blank sheet" — the sheet with no threshold at all. Useful to say what our blank-sheet door leads to, and why we still ask a name first (a quote needs a seller's name on it).
- Avoid: skipping the name.

### Whereby — `whereby-home`
- Found: write-ups on guest join ("enter your name" with no account). Driven: https://whereby.com/ — the name prompt lives inside a room URL and was not reached without a room; the frame is the marketing home (a blush ground, a serif headline, a photograph of a call). Recorded for the pattern only: **join by typing a name**, which is our "sign-in is a name until M6".

---

## Patterns worth naming for the board

- **Threshold drawing** (Steep): one figure that is a door; the sentence beneath it; the ways in as a row of peers.
- **Honesty line** (Excalidraw, Coda): a plain sentence that says where the data lives and what will happen, at body size, where the password would have been.
- **Tenant-first with a fixed suffix** (Slack workspace): the business name typed into a field that already shows the rest; "Find your workspaces" for the lost.
- **Choose-a-method card** (Deel, Tines): the entry as a short menu of doors; no field until a door is chosen.
- **Photograph as ground, card as door** (Headspace; Cat Cay's nav): the picture fills the window and the card asks one thing.
- **The product behind the door** (folk, Clay): the right half is the sheet or a real table, cropped, with a real count in its header.
- **Password demoted to text** (Better Stack, Steep, Coda) or **named optional in the field** (Raycast): the sweep's consensus that the password is no longer the primary act — ours goes further and has none.
- **Two-tone headline** (Notion, Sana): who you are in black, what this is in grey, one block.
- **Verb button** (Frame.io "Let's go", Slack "Continue"): the button says what happens next, not "Log in".

## What to avoid (measured in the frames)

- Stacks of four or five equal provider buttons (Loom, ElevenLabs, Air): a list, not a choice.
- The right half spent on praise, promotion or news (Supabase, Qonto, Vanta, Deel, Coda's banner): the half that could show the desk.
- Disabled primaries on first paint (Sana, Contra, Twist, Sketch, Mercury): the first thing the eye lands on refuses.
- Password rules, terms checkboxes and reCAPTCHA notes on a door (Air, Headspace, Spline).
- The second door dropping into a vendor template (Steep's password state): every state of the entry is designed or it is not shipped.
- Marketing nav or a support bubble kept on the entry (Raycast, Air, Tally, Loops).
- Pictures that are not ours: rendered clouds, planets, starfields, watercolour boxes — we have water and boats; where a model has no photograph the direction says so.

## Imagery: which references let the picture carry the page

- **Photography carries it:** Headspace (sky), Cat Cay (aerial), Contra (a photographed emblem), Savee (a wall of real images), Frame.io (a photographic gradient, one third).
- **The product carries it:** folk (tilted screenshot on paper), Clay (a real table cropped), Sana (a laptop render — weaker, a picture of a picture).
- **A drawing carries it:** Steep (line door), Oku (pencil figure), Twist (watercolour), Deel (flat desk), Reflect (glowing emblem).
- **Typographic, no picture:** Slack (headline as instruction), Excalidraw (hand lettering on the sheet itself), WorkOS, Loops, Tines, Unkey, Notion, Raycast, Better Stack (a texture, not a picture).

## Failed or changed (from the ledger)

- `height-login` — `net::ERR_CONNECTION_CLOSED` at height.app (the product has wound down).
- `amie-login` — `ERR_CERT_AUTHORITY_INVALID` at app.amie.so.
- `huly-login` — Cloudflare 522 from huly.app.
- `pitch-login`, `remote-login` — S3 "Access Denied" XML: both hosts refuse a headless browser.
- `savee-login` — Cloudflare human check; not fought; composition noted above.
- `glide-signin` — a blank white frame; the app did not render headless.
- `fey-login` — the login is gone; the page is a note that Fey joined Wealthsimple and sign-ups are closed (a handsome typographic farewell, not an entry).
- `wise-login` — redirects to the marketing home in a headless session; the split login the galleries show was not reached.
- `qatalog-login` — redirects to ClickUp pricing (acquired).
- `rive-login` — reachable, but it is a plain left-aligned form; the full-screen animation the write-ups praise is not at this URL.
- `whereby-home` — the name prompt is inside a room URL; only the home was captured.
- `contra-login`, `oku-login`, `loops-login` — the galleries' paths 404; retried at `/log-in`, `/signin` and the app host and captured.
