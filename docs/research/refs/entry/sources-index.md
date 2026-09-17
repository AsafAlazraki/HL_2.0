# Entry — sources index

Every frame captured or read for the entry sweep, merged from `live/sources.json` (46 entries), `gallery/sources.json` (50), the old repo's 14 stock frames re-read in `notes-stock.md`, and — added 2026-09-17 — `live2/sources.json` (48 driven, 42 frames landed), the follow-up round at the foot of this file. All 1440 × 900, headless Chromium, `en-AU`; consent banners answered with the most privacy-preserving control; nothing signed in, nothing typed. Frames are gitignored.

**The three figures, counted from the files 2026-09-17 — a row here is a source driven, not a picture taken.** This index holds **158 rows**; **17 of them produced no frame** (9 live, 6 live2, 2 gallery — each named with its reason where it sits); so **141 frames** are on disk, and **137 are distinct images**. Four are a byte-for-byte copy of another frame: `astonmartin-account` = `astonmartin-my` and `bentley-my` = `bentley-mybentley` (two URLs, one 404 page each), `stackblitz-booting` = `stackblitz-ready` (already noted below), and **`excalidraw-blank-full` = `excalidraw-blank`, which means `fullPage: true` returned the viewport and there is no full-page Excalidraw frame**. The first three sweeps are therefore **99 frames**, not the 101 the first synthesis reported. Full census across both screens, with the recount command: `docs/research/refs/both/sources-index.md`.

Paths: live and gallery are `docs/research/refs/entry/{live,gallery}/<id>.png`, mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\entry\`. Stock is `C:\Users\Asaf\dev\hl-refs\ref\entry\<id>.png`. **Honesty note on the stock:** the old script clicked "Accept all" on cookie banners, so those 14 frames were taken with non-essential cookies accepted; `tools/research/capture.ts` does the opposite, so any re-capture will differ.

## Live sweep — `live/`

| id | URL | one line |
|---|---|---|
| `porsche-id-login` | login.porsche.com | Photograph across 65 %, white column asking one thing; a CAPTCHA in the first view |
| `porsche-my` | my.porsche.com | Redirects to the same Porsche ID page; identical but for a fresh CAPTCHA string |
| `bmw-oneid` | customer.bmwgroup.com/oneid/login/ | Mirrored split, identity block reading brand → what this is → the other door |
| `polestar-login` | polestar.com/au/login/ | 448 px card on pale grey; both fields at once; one orange arrow as the only colour |
| `rivian-login` | rivian.com/auth/login | 40/60 split; the picture is a product-detail crop; "Sign in" the largest word |
| `lucid-portal-login` | lucidmotors.com/portal/login | Dark card over a coastal aerial, a serif title, the full marketing nav retained |
| `linear-login` | linear.app/login | Four stacked pills, one indigo, all inside 288 × 400 px; nothing to type first |
| `notion-login` | notion.so/login | Two-tone title pair; a 3 × 2 grid of provider tiles, icon over label |
| `vercel-login` | vercel.com/login | Identifier-first with five outlined provider rows; sign-up also quiet top-right |
| `raycast-login` | raycast.com/users/sign_in | Dark; "Password (optional)" written into the field; one bright control |
| `stripe-login` | dashboard.stripe.com/login | 540 px card whose grey footer band carries the second door |
| `arc-home` | arc.net | Not an entry pattern; one act under a serif headline in an electric-blue frame |
| `framer-login` | framer.com/login | A 230 px stack at 1440 wide; title pair, one provider, email fallback |
| `nimbus-connect` | nimbusboats.com/connect/ | A blurred indigo/cyan/violet veil as the whole ground, one lockup, no door |
| `nimbus-connect-scrolled` | nimbusboats.com/connect/ | White band: headline and paragraph left, app icon right, then a device photo |
| `saxdor-app` | saxdoryachts.com/app/ | Eyebrow / stroked caps headline / one outlined button over a dock photograph |
| `saxdor-app-scrolled` | saxdoryachts.com/app/ | Store badges as the doors; the phone mock names the owner's own boat at the top |
| `riviera-home` | rivieraaustralia.com | Aerial of two hulls, light 48 px headline, an outlined button on the photograph |
| `riviera-ownership` | …/your-ultimate-boating-experience/ownership2/ | A couple at the helm under "OWNERSHIP" in tracked caps; brochure, not a door |
| `riviera-owner-registration` | …/owner-registration/ | The door is a long form: registering-as, ownership type, name triplets, two phones |
| `garmin-signin` | connect.garmin.com/signin/ | A 464 px card floated high over a lifestyle photo — and sitting over the faces |
| `mercury-mercnet` | mercnet.mercurymarine.com | Two audiences named on two side-by-side buttons; the only marine sign-in found |
| `mercury-site` | mercurymarine.com | Dark two-tier nav and a promo carousel; marketing, no entry pattern |
| `brabus-marine` | brabus.com/en-int/marine/powerboats.html | Full-bleed **video** hero; wordmark small and centred on white above the picture |
| `brabus-powerboats` | brabus.com/en-int/marine/powerboats.html | Second capture of the same hero, a different video frame (how motion was proved) |
| `brabus-marine-scrolled` | brabus.com/en-int/marine/powerboats.html | Condensed bold caps on white, then a two-up range grid with tracked caps captions |
| `whaler-build-and-price` | bostonwhaler.com/build-and-price.html | Translucent caption panel on a sunset aerial; series names as a tab strip beneath |
| `whaler-build-and-price-scrolled` | bostonwhaler.com/build-and-price.html | A newsletter modal opened on a timer over a build tool; no close selector matched |
| `axopar-community` | axopar.com/axopar-community/ | Brochure page; two acts pinned top-right as "word →" links over a rafting photo |
| `axopar-community-scrolled` | axopar.com/axopar-community/ | "Official Axopar Owners Club" beside a photograph; still no door |
| `axopar-connect` | axopar.com/axopar-community/connect/ | Product-in-hand hero; the app names "Axopar 29 XC Cross Cabin" at the top |
| `axopar-manuals-login` | manuals.axopar.com/login | Redirects to a third-party generic login with no Axopar branding; kept, not useful |
| `highfield-home` | highfieldboats.com | Video hero with a hashtag headline; accessibility toggles pinned right |
| `apple-signin` | account.apple.com/sign-in | Emblem above the title, one field, an explanation, two equal buttons in one row |
| `hermanmiller-login` | store.hermanmiller.com/loginshow | A ~100 px head pushes two side-by-side door cards under the fold |
| `hermanmiller-login-scrolled` | store.hermanmiller.com/loginshow | The two cards in full: account vs guest order lookup, each with its own sentence |
| `bo-login` | bang-olufsen.com/en/au/login | Two columns split by a hairline; the right column explains the door in three lines |
| **Failed (not fought)** | | |
| `tesla-account` | tesla.com/en_au/teslaaccount | Akamai "Access Denied" to the headless browser |
| `tesla-auth` | auth.tesla.com/oauth2/v3/authorize | Akamai "Access Denied" |
| `rimowa-login` | rimowa.com/au/en/login | Akamai "Access Denied" |
| `rimowa-login-us` | rimowa.com/us/en/login | Akamai "Access Denied" |
| `bmw-au-login` | bmw.com.au/au/s/login/ | Salesforce Experience page never painted below the header after 20 s |
| `whaler-configurator` | bostonwhaler.com/us/en/boat-configurator | SPA route stayed blank white after 12 s; legacy path captured instead |
| `whaler-configurator-scrolled` | bostonwhaler.com/us/en/boat-configurator | Same blank SPA route |
| `mercury-site-au` | mercurymarine.com/en-au/ | 404; the root domain captured as `mercury-site` |
| `highfield-menu` | highfieldboats.com | Burger control matched no selector in three passes; menu state not captured |

## Gallery sweep — `gallery/`

| id | URL | one line |
|---|---|---|
| `steep-login` | app.steep.app/login → web.steep.app | A line-drawn door ajar onto a starfield; four ways in as one row of pills |
| `steep-password` | login.steep.app | The same door's password state drops into a generic vendor card — the failure |
| `excalidraw-blank` | excalidraw.com | The blank sheet is the page; a hand-lettered line says the data lives in the browser |
| `excalidraw-blank-full` | excalidraw.com | The same, settled, with the hint arrows drawn onto the toolbar |
| `slack-signin` | slack.com/signin | The instruction is the headline at ~48 px; email, one button, two providers |
| `slack-workspace` | slack.com/workspace-signin | One field with `.slack.com` fixed and bold; three quiet lines for the lost |
| `headspace-login` | headspace.com/login → auth.headspace.com | A sky photograph fills the window; one rounded card floats on it |
| `betterstack-signin` | betterstack.com/users/sign-in | Dark room, one lit mark, magic link primary, password reduced to a text link |
| `folk-login` | app.folk.app/login | Two pills left; right half is the product itself, tilted on warm paper |
| `clay-login` | app.clay.com/login | Right half is a real table with `0 / 43,918 Rows Selected` in its header |
| `deel-login` | app.deel.com/login | The card is subtitled "Choose a method to log in"; a drawn desk beside it |
| `coda-login` | coda.io/login → coda.io/signin | Labelled provider tiles; a tinted sentence explains the password-free sign in |
| `reflect-login` | reflect.app/login → /auth | A glowing node-graph orb as the whole top third; two icon-only provider buttons |
| `oku-login` | oku.club/signin | Split with a pencil drawing; the greeting is a serif "Hey, welcome back" |
| `raycast-login` | raycast.com/users/sign_in | "(optional)" named in the field — the plainest way found to say a field is not needed |
| `notion-login` | notion.so/login | Captured for the mobbin cross-reference; six provider tiles, an org-email hint |
| `shopify-lookup` | accounts.shopify.com/lookup | Email first, the store picker only after; who then which, on two screens |
| `supabase-signin` | supabase.com/dashboard/sign-in | The right half spent on a customer tweet; one 28 px sentence holds half a window |
| `sana-login` | sana.ai/login | Two-tone headline; a laptop render — a picture of a picture |
| `contra-login` | contra.com/log-in | One panel, two halves; the mark photographed as glass wedges; a logo wall |
| `vanta-login` | app.vanta.com/login | Email-only, no provider row — the sparsest working entry; a region menu by the title |
| `tines-login` | login.tines.com | Three pills, no input at all on first paint; a mono legal footnote |
| `frame-login` | app.frame.io/login → accounts.frame.io | Picture at one third, one field, one verb ("Let's go") |
| `twist-login` | twist.com/login | "Sign up or log in" as one headline; a watercolour of keyed boxes |
| `elevenlabs-signin` | elevenlabs.io/app/sign-in | The median login of 2026, kept as a control for what generic looks like |
| `loom-login` | loom.com/login | Five stacked provider buttons: a list, not a choice |
| `air-login` | app.air.inc/login | Password rules spelled out on the door; an Intercom bubble beside them |
| `qonto-login` | app.qonto.com/signin | Split whose right half is a product announcement; the language menu well placed |
| `tally-login` | tally.so/login | Quiet to the point of anonymity — nothing says whose desk this is |
| `spline-signin` | app.spline.design/signin | One rainbow sphere carries a white page; a reCAPTCHA note at the foot |
| `unkey-login` | app.unkey.com/auth/sign-in | Dark, left-aligned within a centred column — reads as a document, not a card |
| `mercury-login` | app.mercury.com/login | A passkey annex explained in one sentence beneath the card |
| `sketch-signin` | sketch.com/signin/ | Centred stack with a terms toast on first paint |
| `workos-signin` | dashboard.workos.com/signin → signin.workos.com | Four parts in a 345 px column; the shortest working entry in the sweep |
| `loops-login` | app.loops.so | Title and alternative above the card, leaving the card one field and one button |
| `catcay-home` | catcayyachtclub.com | An aerial fills the window and the door is one navy pill; the door itself undesigned |
| `rsrv-home` | rsrv.fr | A gate: one question before entry, with "remember me"; executed as a system dialog |
| `tldraw-blank` | tldraw.com | No door at all; "Sign in to share" only when sharing needs it |
| `whereby-home` | whereby.com | The name prompt lives inside a room URL; only the marketing home captured |
| `savee-login` | savee.it/login → savee.com | Cloudflare human check; composition still visible — the collection as a wall |
| **Failed or changed** | | |
| `height-login` | height.app/login | `ERR_CONNECTION_CLOSED` — the product wound down |
| `amie-login` | app.amie.so/login | `ERR_CERT_AUTHORITY_INVALID` |
| `huly-login` | huly.app/login | Cloudflare 522; the frame is the error page |
| `pitch-login` | app.pitch.com/login | S3 "Access Denied" XML — refuses a headless browser |
| `remote-login` | employ.remote.com/login | S3 "Access Denied" XML |
| `glide-signin` | go.glideapps.com | Blank white frame; the app did not render headless |
| `fey-login` | fey.com/login | The login is gone; the page is a farewell note (Fey joined Wealthsimple) |
| `wise-login` | wise.com/login | Redirected to the marketing home; the gallery's split login not reached |
| `qatalog-login` | qatalog.com/login | Redirects to ClickUp pricing (acquired) |
| `rive-login` | rive.app/login | Reachable but plain; the praised full-screen animation is not at this URL |

Galleries that refused a plain fetch: refero.design (404), land-book.com and lapa.ninja (403). mobbin was read live through Playwright instead.

## Stock re-read — `C:\Users\Asaf\dev\hl-refs\ref\entry\`

| id | URL driven (2026-09-15) | one line |
|---|---|---|
| `porsche-login` | login.porsche.com | The stock's one real door: 936 px photograph, 504 px white column, one question |
| `porsche-myporsche` | my.porsche.com | Pixel-identical but for the CAPTCHA string — the door's only living element |
| `linear-login` | linear.app/login | Doors as a stack of equal pills with exactly one filled; an honest small line under |
| `notion-login` | notion.so/login | Two-tone title pair; doors as tiles, icon over label |
| `nimbus-account` | nimbusboats.com/configurator (404) | Two equal white boxes straight on a dark photograph; a 150 px "404" as a display object |
| `brabus-marine` | brabusmarine.com/configurator | The only stock frame where the boat is moving on water; account as a glyph |
| `bmw-login` | customer.bmwgroup.com/oneid/ | Mirrored split, roundel over the photograph; a grey silent submit behind five ✕ rules |
| `riviera-owners` | rivieraaustralia.com/owners | Not a login; kept for the pennant hanging off the top edge as a physical object |
| `saxdor-login` | saxdoryachts.com/my-saxdor (404) | Navy, gold and white holding a page without a photograph; a ghosted wordmark as ground |
| `polestar-signin` | polestar.com/au/login/ | Site shell only — header, footer, an empty middle with a loader dot. Re-drive live |
| `garmin-signin` | sso.garmin.com/portal/sso/en-AU/sign-in | Cloudflare "Performing security verification"; nothing of Garmin rendered |
| `mercury-account` | mercurymarine.com/en/au/account/login | Cloudflare "Sorry, you have been blocked" |
| `tesla-signin` | auth.tesla.com/oauth2/v3/authorize | Akamai plain-HTML "Access Denied" |
| `whaler-build` | bostonwhaler.com/build-your-whaler | The same Cloudflare block as Mercury (both Brunswick) |

`axopar-account` is named in the old script's list but no frame exists; the shot never landed.

## Read alongside, not captured

| path | one line |
|---|---|
| `C:\Users\Asaf\dev\hl-refs\ref\boats\nimbus-1.png`, `nimbus-2.png` | The same 404 as `nimbus-account` — there is no Nimbus night frame in any folder |
| `C:\Users\Asaf\dev\hl-refs\ref\boats\nimbus-cfg-1.png` | Daylight "Build Your Nimbus" photo-tile grid; each tile a photograph with a BUILD button |
| `docs/reference/configurator-teardowns-2026.md` L141–155 | BMW disclaims validity at the door — the model for our M6 sentence's position |
| `docs/reference/configurator-teardowns-2026.md` L62–70, 262 | PCPartPicker admits what it does not check — the model for both doors stating real figures |
| `docs/reference/configurator-teardowns-2026.md` L168–182, 184 | `aria-disabled` never `disabled`; no shadow-DOM document — the doors must be reachable elements |
| `data/northside/manifest.json`, `data/northside/images.json`, `docs/data/IMAGES.md` | The screen's real figures: 53 tables · 15,691 rows; 453 addresses · 329 held · 122 scenes |

---

## Follow-up round — `live2/` (driven 2026-09-17)

Forty-eight sources driven to close the five gaps a critic found in `notes.md`: no reference for the **second state** (what happens when the file door is pressed, and how a returning visitor is recognised); direction **B** cited by frames that do not show what B is; the premium car and members'-club doors on the plan's own seed list never swept; and the marine brands in the seed never driven. Same rules as the first round: 1440 × 900, headless Chromium, `en-AU`, consent answered with the most privacy-preserving control present, **nothing signed in, nothing typed, no account made**. Frames are `docs/research/refs/entry/live2/<id>.png`, gitignored, mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\entry\live2\`. Ledger: `live2/sources.json`.

### The second state — loading, first run, the returning visitor

| id | URL (final) | one line |
|---|---|---|
| `vscode-dev-welcome` | vscode.dev | **Start** beside **Recent**, and Recent written out empty in body text — the returning-visitor slot and its honest empty state |
| `sqlime` | sqlime.org | `// new.db` with a pencil in the title; two doors as one sentence under an empty box; the way back to blank stated in words |
| `datasette-rows` | datasette.io/global-power-plants/global-power-plants | **"10,000+ rows"** as the headline with a quiet "count all" beside it; facets carry per-value counts |
| `cloudconvert` | cloudconvert.com | "212 formats across 11 categories" over a chip row of superscript counts; a "Data Security" block beside the door |
| `photopea-start` | photopea.com | **"Fully Local — There are no uploads… never leave your device."** as a headed block, not a footnote |
| `squoosh` | squoosh.app | The whole page is a drop target; a dark toast at the foot reads **"Ready to work offline / DISMISS"** |
| `netlify-drop` | app.netlify.com/drop | The primary act is the window; the other two ways in are links inside one sentence |
| `whatsapp-web` | web.whatsapp.com | A designed wait: three numbered steps beside the QR; **"Stay logged in on this browser"** as a checked, explained option |
| `jsonhero` | jsonhero.io | Three named ways to bring data in — paste/URL, drop zone, and four real public APIs under "No JSON? Try it out:" |
| `svelte-playground` | svelte.dev/playground/hello-world | The document named in a full-width field across the top; the app already open behind it |
| `ts-playground` | typescriptlang.org/play | The welcome written *inside* the document, deleted by starting work |
| `diagrams-storage` | app.diagrams.net | Opened straight onto a blank untitled sheet; the storage picker was not in the frame (the tool's consent pass answers a dialog with a close control, which may have dismissed it) |
| `duckdb-shell` | shell.duckdb.org | A banner, a caret, and the word `memory` as the prompt prefix — where the data lives, in one word |
| `observable-notebook` | observablehq.com/@observablehq/hello-world | A near-empty notebook; nothing for this screen |
| `myaudi` | my.audi.com/cluster-2/ | A hand-off page: three paragraphs, and the only door a small underlined "Log in" beneath them |

### Photographic doors and grounds

| id | URL (final) | one line |
|---|---|---|
| `lotus-my` | lotuscars.com/en-GB/my-lotus/login | 50/50 split; **two explained doors down one column**; a full-width yellow primary as the page's only hue |
| `marriott-signin` | marriott.com/sign-in.mi | The hairline split with the second door explained by four icon-over-caption benefits; "Remember me" checked |
| `princess-home` | princessyachts.com | **Dark water at dusk with no boat in it**, one cream pill low; the ground chosen dark, never darkened |
| `zodiac-home` | zodiac-nautic.com/en/ | Caption set into the photograph's quiet lower-left quadrant behind a short blue rule; a four-step pager |
| `sohohouse-home` | sohohouse.com | Members' club threshold, **video** (pause pill centred low); serif head and one cream pill |
| `williams-home` | williamsjettenders.com | Picture fills the window; the primary act ("Build My Tender") lives in the nav bar as a black pill |
| `stabicraft-home` | stabicraft.com | Diver in the water beside a 2350 Supercab; one white box set into the sea; the pager reads 1 / 1 |
| `aman-home` | aman.com | **Consent wall, not answered** — only "Cookies Settings" and a filled "Accept All Cookies" were offered, so the page was never seen |
| `beneteau-my` | beneteau.com | **Consent wall, not answered** — the refusal is a small underlined "CONTINUE WITHOUT ACCEPTING" above six paragraphs; two filled buttons at the foot |

### The seed's own brands and suppliers, driven live

| id | URL (final) | one line |
|---|---|---|
| `northside-home` | northsidemarine.com.au | **The dealership itself**: navy band, white wave-chevron wordmark, "EST. 1965", a yellow script tagline, two phone numbers as headlines, a Formosa on flat blue water |
| `highfield-media` | media.highfieldboats.com | The media library the eight stage photographs came from; ranges named as the price file names them; its own hero is a RIB on deep blue water |
| `stacer-home` | stacer.com.au | A 519 Wildrider throwing spray off the Gold Coast; tracked white caps, a red primary — the brand's own register is loud |
| `quintrex-home` | quintrex.com.au | Stacer's sibling; a translucent white panel laid **over** the hull so the headline can sit there — the legibility patch to avoid |
| `yamaha-outboards` | yamahaoutboards.com | A supplier in Northside's own file; **video** hero (pause disc low-left) of twin XTO Offshore from the transom |

### Failed or unusable, not fought

| id | URL | reason |
|---|---|---|
| `fourseasons-signin` | fourseasons.com/mytrips/ | "Access Denied" to the headless browser |
| `mercedes-me` | mercedes-benz.com/en/mercedes-me/ | "Access Denied" |
| `volvocars-account` | volvocars.com/au/login/ | "Access Denied" |
| `mercedes-id`, `mercedes-signin` | id.mercedes-benz.com, mercedes-benz.com.au/…/sign-in.html | 404 on both addresses tried |
| `bentley-mybentley`, `bentley-my` | bentleymotors.com mybentley / my-bentley | 404 on both |
| `astonmartin-account`, `astonmartin-my` | astonmartin.com my-aston-martin (en, en-gb) | 404 on both |
| `ferrari-login` | ferrari.com/en-EN/auth/login | 404 |
| `raymarine-my` | raymarine.com/en-us/my-raymarine | "Page Not Found" |
| `stackblitz-booting`, `stackblitz-ready` | stackblitz.com/edit/vitejs-vite-react | Both frames are the same StackBlitz 404; the boot-progress state was never captured |
| `lotus-login` | my.lotuscars.com | DNS does not resolve (the working address is `lotus-my`) |
| `raymarine-login` | my.raymarine.com | DNS does not resolve |
| `yamaha-account` | my.yamaha-motor.com | DNS does not resolve |
| `beneteau-owners` | owners.beneteau.com | DNS does not resolve |
| `surtees-home` | surtees.co.nz, www.surtees.co.nz | `ERR_CERT_COMMON_NAME_INVALID` on both hosts; not worked around |
| `diagrams-doors` | app.diagrams.net | The storage-picker control matched no selector in two passes |

**Still open after this round:** no frame anywhere shows a **progress state mid-load**. Every candidate either finished before the shutter or needed a file or an account to start one. See `notes.md` §7.

## The repo's own assets, counted for this round

| path | what it holds |
|---|---|
| `public/hero-images/` + `data/northside/heroes-ledger.json` | **Eight** stage photographs, `kind: "photograph"`, with source page, licence note and sha256 — four Highfield at 2560 px, four Stacer from 2560 down to 1200 px |
| `public/brand-marks/` + `data/northside/marks-ledger.json` | 17 files, 18 rows; eight brands in dark and white; Highfield a 1672 × 288 SVG; **Stabicraft recorded as `"no public wordmark verified"`**; **no Northside Marine mark** |
| `data/northside/images.json` (`meta.longEdge: 1100`) | 453 addresses · 329 held · 122 scenes · 207 studio; Highfield 212 / 115 / 0 / 115; 39 held scenes reach 1100 |
