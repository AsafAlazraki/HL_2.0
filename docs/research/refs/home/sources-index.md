# Home — every frame, with its URL

Merged 2026-09-17 from the three capture ledgers (`live/sources.json`, 87 entries; `gallery/sources.json`, 75; `live2/sources.json`, 62) and from the 37 pre-existing stock paths read in `notes-stock.md`. **261 index rows · 259 frames · 251 distinct images**, counted from the files on disk 2026-09-17 — a row here is a source driven, not a picture taken. **Two rows produced no frame** (`raycast-home`, screenshot timeout; `christies-home`, goto timeout at 45 s), and **ten frames are a byte-for-byte copy of another**: the three stock pairs named in `notes-stock.md`, plus `gallery/grafana-play-home` = `grafana-play-scrolled`, `gallery/trek-home` = `trek-scrolled`, `gallery/westmarine-home` = `westmarine-home-scrolled` = `westmarine-brands`, and `live2/fjord-configurator` = `fjord-configurator-scrolled` — **in each of those the scroll step did nothing, so the `-scrolled` frame is not a second view and nothing may be claimed from it as one**. Two further rows (`live/peloton-home`, `gallery/icebug-home`) record a click timeout but still have a frame beside them from an earlier attempt, so the row does not describe the picture; both sites were re-driven clean into `both/live2/`. Full census across all three screens, with the recount command: `docs/research/refs/both/sources-index.md`. Frames are gitignored; the `live/`, `gallery/` and `live2/` sets are mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\home\`, and the stock sits under `C:\Users\Asaf\dev\hl-refs\ref\`.

The URL column is the **final** URL the browser landed on, which is not always the URL asked for (redirects are recorded as they happened). Consent banners were answered with the most privacy-preserving button present; where a site offered no refusal, nothing was pressed and the banner stays in the frame. Nothing was signed into, no account was created, no personal data was typed. Frames that show a block page, a consent wall or a 404 are listed here with that stated — they are evidence of what happened, not references.

## The plan's seed list, site by site: captured, or failed with its reason

`PLAN.md` "Phase 0" names the sites to drive. The rule is that a seed site is captured **or** it is named here under failed with its reason. Nothing is left silent.

**Boat configurators / build-and-price (28 named).** Captured: Saxdor · Axopar · Nimbus · Zodiac · Boston Whaler · Sea Ray · Grady-White · Riviera · Beneteau · De Antonio · Williams · Highfield · Stabicraft (all in `live/`, first sweep) · **Malibu · MasterCraft · Brabus Marine · Jeanneau · Quicksilver · Pardo · Fjord · Invictus · Wally · Sunseeker · Princess · Chaparral · Bayliner** (all in `live2/`, this round) · Yamaha WaveRunner/boats (`gallery/yamaha-au-home.png` + `-scrolled`, the AU marine kinds page; the WaveRunner product pages themselves were not driven).

**Partly met — the Mercury outboard builder.** Mercury was driven (`live2/mercury-outboard-range.png`, `live2/mercury-outboard-scrolled.png`) and the frames are a register of engine families by horsepower band, which is what our motor tables need. But **no build-and-price tool was found on mercurymarine.com in this round**, so the plan's word "builder" is not satisfied. Open.

**Superseded stock.** The old `ref/boats/jeanneau-1.png` and `-2` are the site's own "THIS PAGE NO LONGER EXISTS" page, and `ref/boats/quicksilver-1.png` and `-2` are a Cloudflare block. Both brands were re-driven live this round; the stock frames stay as evidence of absence, not as references.

**Car configurators (11 named).** Captured: Porsche · Polestar · Mercedes · Rivian · Lucid · Lotus · Bentley · Aston Martin (`live/`). BMW was driven but **what landed is a modal consent wall, not the model grid** — Escape, close, the analytics switch and "Cookies verbieten" all timed out (`live/bmw-models.png`).
**Failed, not fought: Audi** — `live2/audi-models.png`, an Akamai "Access Denied" page at `audi.com.au/au/web/en/models.html`. **Failed, not fought: Tesla** — `live2/tesla-home.png` and `live2/tesla-design-studio.png`, the same denial naming the blocked URL and a reference id.

**Other premium build flows.** Captured: Apple · Framework · Herman Miller · Bang & Olufsen · Peloton (`live/`; Peloton's cookie modal could not be dismissed and stays in the frame). **Failed, not fought: Rimowa** (`live/rimowa-home.png`, Akamai "Access Denied"), **TAG Heuer** (`live2/tagheuer-watches.png`), **Rolex** (`live2/rolex-configure.png`).

**Entry / sign-in** (Porsche ID, BMW ID, Polestar, Tesla, Linear, Notion, Garmin, Mercury). Not this screen's sweep — they belong to `docs/research/refs/entry/`.

**Registers, dashboards, dense working screens (10 named).** Captured: Linear · Stripe · Attio · Vercel · Craft · Polar (`live/`), Raycast (`live/raycast-home-scrolled.png`; the top of the page animates continuously and `page.screenshot` timed out three times, so there is no top-of-page frame), and **Airtable · Supabase · GitHub** (`live2/`, this round). Airtable's frame caught the hero before its film painted.

**Galleries for typography and motion.** Accounted for in `notes-gallery.md`, and each mined frame's provenance is in its own row above: siteinspire, awwwards, lapa.ninja, recent.design, refero.design, saasframe.io and saasinterface.com. **Refused: mobbin.com** (403 from a Sydney edge, for the fetcher and for a real browser — and no account was created to get past it) and **land-book.com** (Cloudflare check). refero.design shows six dashboard thumbnails and then a login wall; recent.design's item pages render empty.

**One further named failure from this round.** Shopify Polaris's empty-state page: two URLs tried, both redirect to `shopify.dev/docs/api/polaris`, an index with no empty state on it (`live2/empty-polaris.png` is that redirect). Atlassian, Carbon, shadcn and Ant carry the same pattern and were captured.

## Live drive — frames in `docs/research/refs/home/live/` (87 frames)

| frame | URL captured | one line |
|---|---|---|
| `nimbus-home.png` | https://nimbusboats.com/ | Nimbus home, first view (browser-check interstitial dismissed) |
| `nimbus-home-scrolled.png` | https://nimbusboats.com/ | Nimbus home, scrolled to the model tiles (interstitial already dismissed in this context) |
| `nimbus-home-models.png` | https://nimbusboats.com/ | Nimbus home with the Models overlay opened |
| `nimbus-builder.png` | https://builder.nimbusboats.com/ | Build your Nimbus, the model grid |
| `nimbus-builder-scrolled.png` | https://builder.nimbusboats.com/ | Build your Nimbus, scrolled |
| `porsche-finder.png` | https://finder.porsche.com/au/en-AU | Porsche Finder, Australia landing |
| `porsche-finder-scrolled.png` | https://finder.porsche.com/au/en-AU | Porsche Finder, scrolled |
| `porsche-home.png` | https://www.porsche.com/australia/ | Porsche.com Australia home |
| `porsche-home-scrolled.png` | https://www.porsche.com/australia/ | Porsche.com Australia home, scrolled |
| `porsche-models.png` | https://www.porsche.com/australia/models/ | Porsche model overview |
| `porsche-models-scrolled.png` | https://www.porsche.com/australia/models/ | Porsche model overview, scrolled |
| `riviera-home.png` | https://www.rivieraaustralia.com/ | Riviera home |
| `riviera-home-scrolled.png` | https://www.rivieraaustralia.com/ | Riviera home, scrolled |
| `saxdor-home.png` | https://saxdoryachts.com/ | Saxdor home — **NOTE: the consent card offers only "Accept", so it was left unanswered and is in the frame.** |
| `saxdor-home-scrolled.png` | https://saxdoryachts.com/ | Saxdor home, scrolled — **NOTE: consent card unanswered (no refusal offered).** |
| `saxdor-models.png` | https://saxdoryachts.com/models/ | Saxdor models: left model-line index, right stage (scrolled to trigger the lazy renders) — **NOTE: consent card unanswered (no refusal offered).** |
| `saxdor-models-scrolled.png` | https://saxdoryachts.com/models/ | Saxdor models, scrolled — **NOTE: consent card unanswered (no refusal offered).** |
| `axopar-home.png` | https://www.axopar.com/ | Axopar home |
| `axopar-home-scrolled.png` | https://www.axopar.com/ | Axopar home, scrolled |
| `axopar-models.png` | https://www.axopar.com/boat-models/ | Axopar boat models |
| `axopar-models-scrolled.png` | https://www.axopar.com/boat-models/ | Axopar boat models, scrolled |
| `zodiac-range.png` | https://www.zodiac-nautic.com/en/boats/ | Zodiac Nautic range page (consent refused via Continue without consent) |
| `zodiac-range-scrolled.png` | https://www.zodiac-nautic.com/en/boats/ | Zodiac Nautic range page, scrolled (consent already refused in this context) |
| `whaler-models.png` | https://www.bostonwhaler.com/us/en/boats | Boston Whaler models (newsletter modal closed with Escape) |
| `whaler-models-scrolled.png` | https://www.bostonwhaler.com/us/en/boats | Boston Whaler models, scrolled (newsletter modal closed) |
| `searay-models.png` | https://www.searay.com/global/en/boats | Sea Ray models (global) |
| `searay-models-scrolled.png` | https://www.searay.com/global/en/boats | Sea Ray models, scrolled |
| `gradywhite-models.png` | https://www.gradywhite.com/explore/ | Grady-White explore models — **NOTE: the cookie bar offers only "Preferences" and "Accept", so it was left unanswered and covers the foot of the frame.** |
| `gradywhite-models-scrolled.png` | https://www.gradywhite.com/explore/ | Grady-White explore models, scrolled — **NOTE: cookie bar unanswered (no refusal offered).** |
| `highfield-home.png` | https://www.highfieldboats.com/ | Highfield Boats home (late banner: Reject All) |
| `highfield-home-scrolled.png` | https://www.highfieldboats.com/ | Highfield Boats home, scrolled (cookies already rejected in this context) |
| `highfield-range.png` | https://www.highfieldboats.com/our-boats/ | Highfield Our Boats range (cookies already rejected in this context) |
| `highfield-range-scrolled.png` | https://www.highfieldboats.com/our-boats/ | Highfield Our Boats range, scrolled |
| `stabicraft-range.png` | https://stabicraft.com/the-boats/ | Stabicraft the boats |
| `stabicraft-range-scrolled.png` | https://stabicraft.com/the-boats/ | Stabicraft the boats, scrolled |
| `williams-home.png` | https://www.williamsjettenders.com/ | Williams Jet Tenders home |
| `williams-home-scrolled.png` | https://www.williamsjettenders.com/ | Williams Jet Tenders home, scrolled |
| `williams-tenders.png` | https://www.williamsjettenders.com/all-tenders/ | Williams all tenders |
| `deantonio-home.png` | https://www.deantonioyachts.com/ | De Antonio Yachts home |
| `deantonio-home-scrolled.png` | https://www.deantonioyachts.com/ | De Antonio Yachts home, scrolled |
| `beneteau-models.png` | https://www.beneteau.com/motorboats | Beneteau motorboats overview (consent refused: link 'Continue without accepting' via selector, then Escape) |
| `beneteau-models-scrolled.png` | https://www.beneteau.com/motorboats | Beneteau motorboats overview, scrolled (consent already refused in this context) |
| `polestar-home.png` | https://www.polestar.com/au/ | Polestar Australia home |
| `polestar-home-scrolled.png` | https://www.polestar.com/au/ | Polestar Australia home, scrolled |
| `rivian-home.png` | https://rivian.com/ | Rivian home |
| `rivian-home-scrolled.png` | https://rivian.com/ | Rivian home, scrolled |
| `lucid-home.png` | https://lucidmotors.com/ | Lucid home — **NOTE: the consent bar offers only "ACCEPT ALL" and "COOKIE SETTINGS", so it was left unanswered and covers the lower third.** |
| `lucid-home-scrolled.png` | https://lucidmotors.com/ | Lucid home, scrolled — **NOTE: consent bar unanswered (no refusal offered).** |
| `bmw-models.png` | https://www.bmw.de/de/home.html | BMW model overview, first view (consent-required cookies refused) — **WHAT LANDED: a modal consent wall ("Verwendung von Cookies.") over the lower half; Escape, close, the analytics switch and "Cookies verbieten" all timed out, and the URL redirected to the German home. Not the model grid.** |
| `bmw-models-scrolled.png` | https://www.bmw.de/de/home.html | BMW model overview, scrolled to the model grid (consent-required cookies refused) — **WHAT LANDED: the same consent wall.** |
| `mercedes-models.png` | https://www.mercedes-benz.com.au/passengercars/models.html | Mercedes-Benz Australia model overview |
| `mercedes-models-scrolled.png` | https://www.mercedes-benz.com.au/passengercars/models.html | Mercedes-Benz Australia model overview, scrolled |
| `lotus-home.png` | https://www.lotuscars.com/en-AU | Lotus home |
| `lotus-home-scrolled.png` | https://www.lotuscars.com/en-AU | Lotus home, scrolled |
| `bentley-home.png` | https://www.bentleymotors.com/en.html | Bentley home (consent answered: ONLY ESSENTIAL COOKIES) |
| `bentley-home-scrolled.png` | https://www.bentleymotors.com/en.html | Bentley home, scrolled (essential cookies only) |
| `astonmartin-home.png` | https://www.astonmartin.com/en-gb | Aston Martin home (UK market, past the market chooser) |
| `astonmartin-home-scrolled.png` | https://www.astonmartin.com/en-gb | Aston Martin home (UK), scrolled |
| `apple-store.png` | https://www.apple.com/au/store | Apple Store (AU) |
| `apple-store-scrolled.png` | https://www.apple.com/au/store | Apple Store (AU), scrolled to the product shelf |
| `framework-marketplace.png` | https://frame.work/au/en/marketplace | Framework marketplace |
| `framework-marketplace-scrolled.png` | https://frame.work/au/en/marketplace | Framework marketplace, scrolled |
| `hermanmiller-home.png` | https://www.hermanmiller.com/ | Herman Miller shop home |
| `hermanmiller-home-scrolled.png` | https://www.hermanmiller.com/ | Herman Miller shop home, scrolled (retry after a Cloudflare interstitial) |
| `bo-home.png` | https://www.bang-olufsen.com/en/au | Bang & Olufsen home (AU) |
| `bo-home-scrolled.png` | https://www.bang-olufsen.com/en/au | Bang & Olufsen home (AU), scrolled |
| `peloton-home.png` | https://www.onepeloton.com/ | Peloton home, first view (country modal dismissed, cookies rejected) — **WHAT LANDED: the page, with a Peloton cookie modal over the middle; "Reject All Cookies" could not be clicked (an overlay intercepts it) and nothing was accepted.** |
| `peloton-home-scrolled.png` | https://www.onepeloton.com/ | Peloton home, scrolled (modal and cookies already handled in this context) — **WHAT LANDED: the same modal over the page.** |
| `rimowa-home.png` | https://www.rimowa.com/au/en/home | Rimowa home (AU), first view — **WHAT LANDED: an Akamai "Access Denied" page. Not fought.** |
| `rimowa-home-scrolled.png` | https://www.rimowa.com/ | Rimowa home, scrolled — **WHAT LANDED: the same "Access Denied" page.** |
| `linear-home.png` | https://linear.app/ | Linear homepage |
| `linear-home-scrolled.png` | https://linear.app/ | Linear homepage, scrolled |
| `stripe-dashboard-docs.png` | https://docs.stripe.com/dashboard/basics | Stripe Dashboard docs (basics) |
| `stripe-dashboard-docs-scrolled.png` | https://docs.stripe.com/dashboard/basics | Stripe Dashboard docs, paged down the inner pane (h1 focused, PageDown x3) |
| `attio-home.png` | https://attio.com/ | Attio home |
| `attio-home-scrolled.png` | https://attio.com/ | Attio home, scrolled |
| `vercel-dashboard-docs.png` | https://vercel.com/docs/dashboard | Vercel dashboard features docs, first view — **WHAT LANDED: Vercel's own 404 — the page has been retired. Use `vercel-docs-home.png`.** |
| `vercel-dashboard-docs-scrolled.png` | https://vercel.com/docs/dashboard | Vercel dashboard docs, scrolled — **WHAT LANDED: the same 404.** |
| `raycast-home.png` | https://www.raycast.com/ | Raycast home, top of page (1px scroll to settle the hero animation) — **NO FRAME — page.screenshot timed out three times (30 s each); the top of raycast.com animates continuously. Use `raycast-home-scrolled.png`.** |
| `raycast-home-scrolled.png` | https://www.raycast.com/ | Raycast home, scrolled |
| `craft-home.png` | https://www.craft.do/ | Craft home |
| `craft-home-scrolled.png` | https://www.craft.do/ | Craft home, scrolled |
| `polar-home.png` | https://polar.sh/ | Polar home |
| `polar-home-scrolled.png` | https://polar.sh/ | Polar home, scrolled |
| `vercel-projects-docs.png` | https://vercel.com/docs/projects | Vercel projects overview docs (fallback if dashboard-features redirects) |
| `saxdor-models-mid.png` | https://saxdoryachts.com/models/ | Saxdor models, short scroll so the lazy model imagery beside the list has time to paint (cookie card offers Accept only; left untouched) — **NOTE: consent card unanswered (no refusal offered).** |
| `vercel-docs-home.png` | https://vercel.com/docs | Vercel docs home: the doors grid |

## Gallery mining — frames in `docs/research/refs/home/gallery/` (75 frames)

| frame | URL captured | one line |
|---|---|---|
| `canyon-home.png` | https://www.canyon.com/en-au/ | siteinspire.com/website/6474-canyon (Cycling category) — kinds photographed on the home |
| `canyon-home-scrolled.png` | https://www.canyon.com/en-au/ | same, scrolled to the kinds grid |
| `friluftsland-home.png` | https://www.friluftsland.dk/ | awwwards.com/websites/retail/ — outdoor retail by category; Danish consent answered with 'Afvis alt' (reject all) — **NOTE: the Danish consent modal was refused with "Afvis alt" by an explicit step.** |
| `friluftsland-home-scrolled.png` | https://www.friluftsland.dk/ | same, scrolled (consent already answered in this context) — **NOTE: recaptured without the consent step, which had failed when the modal was already answered in the context.** |
| `sonos-home.png` | https://www.sonos.com/en-au/home | siteinspire.com/websites/8784-sonos — kinds photographed — **WHAT LANDED: an Akamai "Access Denied" page. Not fought.** |
| `sonos-home-scrolled.png` | https://www.sonos.com/en-au/home | same, scrolled — **WHAT LANDED: the same "Access Denied" page.** |
| `boattrader-home.png` | https://www.boattrader.com/ | boat types + brands, the nearest analogue |
| `boattrader-home-scrolled.png` | https://www.boattrader.com/ | same, scrolled |
| `westmarine-home.png` | https://www.westmarine.com/on/demandware.store/Sites-WestMarine-Site/en_US/PX-Show?url=aHR0cHM6Ly93d3cud2VzdG1hcmluZS5jb20vb24vZGVtYW5kd2FyZS5zdG9yZS9TaXRlcy1XZXN0TWFyaW5lLVNpdGU%3d&frame=1789545242940 | found via the marine-retail search (thehulltruth thread, westmarine.com/categories/) — shop by category photographed — **WHAT LANDED: PerimeterX "Access to this page has been denied". Not fought.** |
| `westmarine-home-scrolled.png` | https://www.westmarine.com/on/demandware.store/Sites-WestMarine-Site/en_US/PX-Show?url=aHR0cHM6Ly93d3cud2VzdG1hcmluZS5jb20vb24vZGVtYW5kd2FyZS5zdG9yZS9TaXRlcy1XZXN0TWFyaW5lLVNpdGU%3d&frame=1789545261430 | same, scrolled — **WHAT LANDED: the same denial page.** |
| `westmarine-brands.png` | https://www.westmarine.com/on/demandware.store/Sites-WestMarine-Site/en_US/PX-Show?url=aHR0cHM6Ly93d3cud2VzdG1hcmluZS5jb20vb24vZGVtYW5kd2FyZS5zdG9yZS9TaXRlcy1XZXN0TWFyaW5lLVNpdGUvZW5fVVMvU2VhcmNoLVNob3c%2fY2dpZD1CcmFuZHM%3d&frame=1789545281189 | the brands register — **WHAT LANDED: the same denial page.** |
| `bcf-home.png` | https://www.bcf.com.au/ | found via the marine-retail search — Australian boating/camping/fishing retailer, shop by category |
| `bcf-home-scrolled.png` | https://www.bcf.com.au/ | same, scrolled |
| `chatgpt-home.png` | https://chatgpt.com/ | saasframe.io/categories/welcome-screen (OpenAI) — one primary act as the whole home |
| `perplexity-home.png` | https://www.perplexity.ai/ | not in a gallery reached; the search-first one-act home |
| `cmdk-linear.png` | https://cmdk-solid.vercel.app/ | cmdk.paco.me now redirects to GitHub; this is the faithful port's demo (search result 'cmdk-solid.vercel.app'), Linear theme — **NOTE: cmdk.paco.me now redirects to GitHub; this is the faithful SolidJS port's demo (cmdk-solid.vercel.app) with the theme clicked by selector.** |
| `cmdk-raycast.png` | https://cmdk-solid.vercel.app/ | Raycast theme — **NOTE: as `cmdk-linear` — the SolidJS port's demo, theme clicked by selector.** |
| `cmdk-vercel.png` | https://cmdk-solid.vercel.app/ | Vercel theme — **NOTE: as `cmdk-linear` — the SolidJS port's demo, theme clicked by selector.** |
| `cmdk-framer.png` | https://cmdk-solid.vercel.app/ | Framer theme — **NOTE: as `cmdk-linear` — the SolidJS port's demo, theme clicked by selector.** |
| `spotify-home.png` | https://open.spotify.com/album/3w32SV56JvtJXsrYtThwzP | xda-developers.com/spotify-redesign-desktop-and-web-player — retry with a longer wait — **WHAT LANDED: the logged-out shell only; open.spotify.com redirects to a promoted album, so the home's rows were never reached.** |
| `spotify-home-scrolled.png` | https://open.spotify.com/album/3w32SV56JvtJXsrYtThwzP | same, scrolled — **WHAT LANDED: the promoted album's track list, not the home.** |
| `airbnb-home.png` | https://www.airbnb.com.au/ | styles.refero.design/style/c2325884-4391-4688-85cd-e143f5107517 (Airbnb design system) + uxdesign.cc redesign write-up — kinds as a pill rail, photographed cards, one search pill |
| `airbnb-home-scrolled.png` | https://www.airbnb.com.au/ | same, scrolled |
| `sigma-home.png` | https://www.sigma-imaging.se/ | awwwards.com/websites/e-commerce/ (Sigma Imaging) |
| `brigade-home.png` | https://brigadeoverland.com/ | awwwards.com/websites/e-commerce/ (Brigade Overland) |
| `icebug-home.png` | https://icebug.com/ | recent.design/websites (Icebug) — cookie wall answered with Strictly necessary — **WHAT LANDED: a cookie wall behind a country modal; the tool's privacy patterns matched no button, so nothing was pressed.** |
| `unsplash-home.png` | https://unsplash.com/.within.website?redir=%2F | not in a gallery reached; search over a photographed wall with a topics rail — **WHAT LANDED: an Anubis bot check, "Making sure you're not a bot!". Not fought.** |
| `hrowen-home.png` | https://www.hrowen.co.uk/ | not in a gallery reached; a multi-brand dealer group home — brands photographed |
| `hrowen-home-scrolled.png` | https://www.hrowen.co.uk/ | same, scrolled — **WHAT LANDED: the menu drawer open over the page rather than a scrolled page; kept because the drawer is informative.** |
| `northside-home.png` | https://www.northsidemarine.com.au/ | ground truth, not a gallery pick: the dealer's own public home today |
| `northside-home-scrolled.png` | https://www.northsidemarine.com.au/ | same, scrolled |
| `kbar-open.png` | https://kbar.vercel.app/ | kbar demo with the palette opened by Ctrl K |
| `yachtworld-home.png` | https://www.yachtworld.com/ | premium boat marketplace home |
| `yachtworld-home-scrolled.png` | https://www.yachtworld.com/ | same, scrolled — **WHAT LANDED: "Access Denied" on the repeat visit; the first visit stands as `yachtworld-home.png`.** |
| `boatsales-home.png` | https://www.boatsales.com.au/ | Australian boat marketplace (carsales network) — browse by type and brand |
| `boatsales-home-scrolled.png` | https://www.boatsales.com.au/ | same, scrolled |
| `whitworths-home.png` | https://www.whitworths.com.au/ | Australian marine chandlery — shop by category |
| `whitworths-home-scrolled.png` | https://www.whitworths.com.au/ | same, scrolled |
| `garmin-marine.png` | https://www.garmin.com/en-AU/c/marine/ | a marine brand's category home — kinds photographed |
| `garmin-marine-scrolled.png` | https://www.garmin.com/en-AU/c/marine/ | same, scrolled |
| `brigade-home-scrolled.png` | https://brigadeoverland.com/ | awwwards e-commerce (Brigade Overland), scrolled to the category tiles |
| `sigma-home-scrolled.png` | https://www.sigma-imaging.se/ | awwwards e-commerce (Sigma Imaging), scrolled |
| `boattrader-types.png` | https://www.boattrader.com/ | shop-by-type tiles — **WHAT LANDED: "Access Denied" (Boats Group protection) on the third visit of the run.** |
| `carsandbids-home.png` | https://carsandbids.com/ | auction marketplace home: live lots, search, one primary act |
| `carsandbids-scrolled.png` | https://carsandbids.com/ | second fold |
| `bringatrailer-home.png` | https://bringatrailer.com/auctions/ | dense listing home with submit primary |
| `collectingcars-home.png` | https://collectingcars.com/ | premium photography grid marketplace |
| `christies-home.png` | https://www.christies.com/en/ | departments photographed, upcoming strip, search — **NO FRAME — page.goto timed out at 45 s. Sotheby's was driven instead.** |
| `ducati-home.png` | https://www.ducati.com/ww/en/home | families as photographed kinds — **WHAT LANDED: an "Access Denied" page. Not fought.** |
| `trek-home.png` | https://www.trekbikes.com/au/en_AU/ | shop by category grid — **WHAT LANDED: the fold behind a Cookiebot wall — "Use necessary cookies only" matches none of the tool's privacy patterns, so nothing was clicked and the wall stayed up.** |
| `deere-home.png` | https://www.deere.com/en-us | equipment kinds, dealer shaped |
| `yamaha-au-home.png` | https://www.yamaha-motor.com.au/ | marine kinds: waverunner, outboard, boats |
| `cosmos-home.png` | https://www.cosmos.so/ | photographic grid home, awwwards SOTD |
| `tldraw-home.png` | https://www.tldraw.com/ | the sheet is the home |
| `shadcn-cmdk.png` | https://ui.shadcn.com/ | command palette |
| `grafana-play-home.png` | https://play.grafana.org/d/to6j8mh/grafana-play-home?from=now-6h&to=now&timezone=utc | a real dashboard home with recents and starred: the shape the owner rejected |
| `delorean-marketplace.png` | https://marketplace.delorean.com/ | awwwards marketplace inspiration |
| `hodinkee-shop.png` | https://shop.hodinkee.com/ | brand shelf, photographed — **WHAT LANDED: an announcement modal and a cookie banner stacked over the first paint; nothing was accepted.** |
| `chrono24-home.png` | https://www.chrono24.com/ | brands + saved searches — **WHAT LANDED: the page through a dimming consent dialog that offers no refusal; nothing was accepted.** |
| `mrporter-designers.png` | https://www.mrporter.com/en-au/mens/designers | brand index as a screen — **WHAT LANDED: an "Access Denied" page; the brand index was never reached.** |
| `marinemax-home.png` | https://www.marinemax.com/ | the largest US boat dealer group: kinds, brands, places |
| `marinemax-brands.png` | https://www.marinemax.com/pages/shop-by-make | a dealer's brand shelf as its own screen |
| `denison-home.png` | https://www.denisonyachtsales.com/ | brokerage home: search, listings, offices |
| `sothebys-home.png` | https://www.sothebys.com/en/ | departments photographed, upcoming strip, search |
| `huggingface-home.png` | https://huggingface.co/ | working home: search, new, live register of models |
| `arena-explore.png` | https://www.are.na/explore | channels as a register with recency |
| `rapha-home.png` | https://www.rapha.cc/au/en | premium retail kinds grid |
| `hagerty-marketplace.png` | https://www.hagerty.com/marketplace | auction marketplace with live lots |
| `figma-community.png` | https://www.figma.com/community | files as a grid with authors and counts |
| `cosmos-scrolled.png` | https://www.cosmos.so/ | second fold of the photographic grid |
| `collectingcars-scrolled.png` | https://collectingcars.com/ | the lot grid |
| `deere-scrolled.png` | https://www.deere.com/en-us | equipment kinds below the fold |
| `trek-scrolled.png` | https://www.trekbikes.com/au/en_AU/ | shop by category below the fold — **WHAT LANDED: the same fold; the scroll step did nothing behind the wall.** |
| `yamaha-au-scrolled.png` | https://www.yamaha-motor.com.au/ | kinds below the fold |
| `grafana-play-scrolled.png` | https://play.grafana.org/d/to6j8mh/grafana-play-home?from=now-6h&to=now&timezone=utc | dashboard list and search — **WHAT LANDED: identical to `grafana-play-home.png` — the Grafana page does not scroll, only its panels do.** |
## Follow-up round — frames in `docs/research/refs/home/live2/` (62 frames)

Driven 2026-09-17 to close two gaps: the plan-named boat brands the first sweep never drove, and the missing reference for a register with nothing in it. Read in `notes-live2.md`. **Forty-four of these 62 were opened and looked at; the eighteen marked *(not opened)* were captured but not read, and nothing is claimed about them.**

| frame | URL captured | one line |
|---|---|---|
| `malibu-home.png` | https://www.malibuboats.com/ | Malibu home *(not opened)* |
| `malibu-models.png` | https://www.malibuboats.com/boats | Malibu line-up: renders on warm off-white, three across, "AS LOW AS $98,403" in blue under each name; BUILD & BUY as a filled block top right |
| `malibu-models-scrolled.png` | https://www.malibuboats.com/boats | the card grammar in full — from-price, a three-column fact strip carrying both unit systems, EXPLORE + BUILD — and the 26 LSV where "Coming Soon" replaces the price, the fact strip is absent, and BUILD is **removed** rather than greyed |
| `mastercraft-home.png` | https://www.mastercraft.com/ | MasterCraft home *(not opened)* |
| `mastercraft-build.png` | https://designmy.mastercraft.com/ | "DESIGN A BOAT": the first three families as large renders on white, the family name in heavy condensed caps, a row of small grey model chips under each |
| `mastercraft-boats.png` | https://www.mastercraft.com/boats | the model register: a kind row with the active one underlined red, COMPARE MODELS at its right edge, then family bands of render · name · promise · SEATING / LENGTH / BALLAST · LEARN MORE + DESIGN BOAT; a rotated family label pinned at the left edge |
| `mastercraft-boats-scrolled.png` | https://www.mastercraft.com/boats | the band repeating, and the rotated label caught mid-change — `THE XSTAR FAMILY` becoming `THE XT FAMILY` with the outgoing one still visible above it |
| `mastercraft-boat-finder.png` | https://www.mastercraft.com/boat-finder/ | a five-chapter finder whose head shows **`0 RESULTS`** in a black block before any choice is made; six photographic kind tiles; CONTINUE greyed with no sentence |
| `pardo-home.png` | https://pardoyachts.com/ | Pardo home, consent refused by an explicit step ("Continue without Accepting") *(not opened; the first capture, with the banner, was read and is described in `notes-live2.md`)* |
| `fjord-home.png` | https://fjordboats.com/gb/en/ | **WHAT LANDED: Fjord's own "Page Not Found"** at the guessed `/en/` path; the site's own navigation gives `/gb/` *(not opened)* |
| `fjord-motorboats.png` | https://fjordboats.com/gb/motorboats/ | consent answered "Save Settings" with Marketing, Analytics and Functional all off — an aerial, one line of heavy caps, and **two outlined acts that each name a specific model** ("Discover the new FJORD 39XL"); "Configure now" as a white block in the header |
| `fjord-configurator.png` | https://fjordboats.com/gb/configurator/ | "CHOOSE THE MODEL TO CONFIGURE" over a mosaic of model tiles, the name laid on the photograph with a small outlined NEW chip — **NOTE: the Usercentrics modal reappears on this page and is in the frame; nothing was accepted.** The washed-out names on the bright tiles are the contrast lesson |
| `fjord-configurator-scrolled.png` | https://fjordboats.com/gb/configurator/ | scrolled *(not opened)* |
| `invictus-home.png` | https://www.invictusyacht.com/en/ | **WHAT LANDED: the site's Italian 404, "Pagina non trovata"** *(not opened)* |
| `invictus-yachts.png` | https://www.invictusyacht.com/yacht/ | "PREMIUM / Collection" in wide-tracked caps over an italic serif, a render floating in pure black; CUSTOMIZE sits in the nav |
| `invictus-configurator.png` | https://configurator.invictusyacht.com/ | Invictus configurator entry *(not opened)* |
| `bayliner-models.png` | https://www.bayliner.com/global/en/en-us/boats | **WHAT LANDED: Bayliner's own 404** at the guessed path *(not opened)* |
| `bayliner-newsletter-modal.png` | https://www.bayliner.com/global/en | **evidence frame:** the first paint is a newsletter form asking first name, last name, email, country and postcode with the consent sentence inside it, over the whole home. Nothing was typed |
| `bayliner-home.png` | https://www.bayliner.com/global/en | the same home with the modal dismissed by Escape *(not opened)* |
| `bayliner-deckboats.png` | https://www.bayliner.com/global/en/boats/cruising/deck-boats | kinds as the navigation (CRUISING · FISHING · WATERSPORTS · ALL BOATS) with **BUILD as a navy block taller than the header** at the top right; a solid title panel laid on the photograph's left third |
| `bayliner-allboats.png` | https://www.bayliner.com/global/en/boats | the kind bands: "DECK BOATS" in yellow caps on navy beside a **plan-view hull line drawing with red corner brackets** on white — a kind explained by a schematic rather than a photograph |
| `brabus-marine-home.png` | https://www.brabus.com/en-fi/marine/powerboats.html | consent refused by step (CONFIRM SELECTION, only REQUIRED ticked); a macro film of a 500 hp cowling, and the market notice as a **dismissible full-width strip** rather than a modal. `brabus-marine.com` serves an invalid certificate, with or without `www` |
| `brabus-marine-scrolled.png` | https://www.brabus.com/en-fi/marine/powerboats.html | scrolled *(not opened)* |
| `jeanneau-powerboats.png` | https://www.jeanneau.com/powerboats | **WHAT LANDED: "Page not found"** at the guessed path *(not opened)* |
| `jeanneau-home.png` | https://www.jeanneau.com/ | nine range names across the full header width as the primary navigation (two partly behind the consent modal), with Compare and a red Configurator tab above — **NOTE: the consent modal is in the frame. It offers CONTINUE WITHOUT ACCEPTING, but the same phrase sits inside the banner's own body copy so a text match clicks the paragraph, and an anchor-role click times out. Nothing was accepted** |
| `jeanneau-home-scrolled.png` | https://www.jeanneau.com/ | the door rows: an outline icon of the thing (motorboat, compass, sailboat), a heavy navy caps title, a sentence, and a filled button naming the act (CONFIGURE A BOAT, CONTACT A DEALER) — **consent modal still in the frame** |
| `jeanneau-merry-fisher.png` | https://www.jeanneau.com/boats/powerboat/49-merry-fisher | the Merry Fisher powerboat range *(not opened)* |
| `quicksilver-range.png` | https://www.quicksilver-boats.com/en/ | **WHAT LANDED: Quicksilver's own 404 — and the best 404 in the sweep**: a brand illustration of a hull in the marque's acid green and cyan, `404: page not found`, two sentences carrying a reason and a way to report it, one filled green "Return to Quicksilver", full navigation intact |
| `quicksilver-home.png` | https://www.quicksilver-boats.com/int/en | the live home the stock frames never reached: one word (`SAFE`) at ~90 px in acid green over a sunset, a "Find a Dealer" pill, "Scroll down", and a caption naming the whole word set |
| `mercury-outboards.png` | https://www.mercurymarine.com/us/en | Mercury home *(not opened)* |
| `mercury-outboard-range.png` | https://www.mercurymarine.com/us/en/engines/outboard | five engine families as plain hairline columns, each with a grey line naming **who it is for** (Premium · Recreational · Performance · Commercial · Trolling) rather than a specification; the sibling marques as a logo row above the header |
| `mercury-outboard-scrolled.png` | https://www.mercurymarine.com/us/en/engines/outboard | the outboard register: cut-outs on white four across, the title being family plus horsepower band, and a small blue displacement line that is **simply absent** where Mercury does not publish it |
| `wally-home.png` | https://www.wally.com/en-us/ | one aerial filling the window, a two-word nav (MENU · FLEET), the marque centred, one round DISCOVER MORE puck — the purest "photography carries the page" in the sweep |
| `wally-fleet.png` | https://www.wally.com/en-us/ | the fleet panel over the left 56 % while the film keeps running: seventeen models as ~70 px grey side-profile line drawings under SAIL and MOTOR, with the word *project* in italics on the ones that do not exist yet |
| `sunseeker-404.png` | https://www.sunseeker.com/en/ | **evidence frame:** the guessed path answers `404 / PAGE NOT FOUND / BACK TO HOME` — one door, no navigation |
| `sunseeker-home.png` | https://www.sunseeker.com/ | two lines of very wide light caps at ~90 px bleeding off both edges of a dusk photograph, with an outlined DISCOVER; MAVERICKS cannot be read whole at 1440 and the button is the lowest-contrast control of the round |
| `princess-home.png` | https://www.princessyachts.com/ | a cream header with one filled navy "Make an Enquiry →" at the far right, then a dusk photograph with **no type on it at all** except one white pill, "DISCOVER THE X90 →"; the consent control is a small black COOKIES tab parked bottom-left, not a banner |
| `princess-home-scrolled.png` | https://www.princessyachts.com/ | classes as a 3-across card grid: photograph, class name at ~28 px, two plain facts stated as **ranges** (`8 - 10 People`, `25 - 29 Metres`), and a full-width button that names its destination |
| `chaparral-country-modal.png` | https://chaparralboats.com/ | **evidence frame:** the first paint is a seven-flag market modal stacked over a cookie bar whose only button is ACCEPT, so the page cannot be seen without answering twice. Nothing was pressed |
| `chaparral-home.png` | https://www.chaparralboats.com/Chaparral-Boats.php?country=500 | the market answered AUSTRALIA/NZ (the dealer's own market): the **series are the navigation** (SSi · SSi-OB · SSX · OSX · GTS-SURF) with everything else in smaller caps; one boat on glassy water, no headline — **NOTE: the cookie bar offers only ACCEPT and was left untouched** |
| `audi-models.png` | https://www.audi.com.au/au/web/en/models.html | **FAILED: Akamai "Access Denied". Not fought** *(not opened)* |
| `tesla-home.png` | https://www.tesla.com/en_au | **FAILED: Akamai "Access Denied"**, the page naming the blocked URL and a reference id. Not fought |
| `tesla-design-studio.png` | https://www.tesla.com/en_au/modely/design | **FAILED: the same denial** *(not opened)* |
| `tagheuer-watches.png` | https://www.tagheuer.com/au/en/watches/ | **FAILED: "Access Denied". Not fought** *(not opened)* |
| `rolex-configure.png` | https://www.rolex.com/watches/configure | **FAILED: "Access Denied". Not fought** *(not opened)* |
| `airtable-home.png` | https://www.airtable.com/ | a two-line headline, a grey elaboration, a filled and an outlined act — then 400 px of empty where a film had not painted, with a pause button floating in it |
| `supabase-home.png` | https://supabase.com/ | Supabase home *(not opened)* |
| `github-repos-register.png` | https://github.com/orgs/vercel/repositories | the register grammar: `240 repositories` as the panel head's left figure, sort and two density toggles at its right, a rail of saved views with a blue bar on the active one, and every row carrying name · visibility pill · description · topic chips · a fact line · a sparkline |
| `empty-atlassian.png` | https://atlassian.design/components/empty-state/examples | the empty state defined and rendered — "describes what the user can do next" — with a header-only default and an anatomy of description, primary/secondary/tertiary actions, illustration and width |
| `empty-carbon.png` | https://carbondesignsystem.com/patterns/empty-states-pattern/ | the pattern's opening definition and its table of contents |
| `empty-carbon-types.png` | https://carbondesignsystem.com/patterns/empty-states-pattern/ | scrolled: the annotated anatomy (title · body copy that directs the user to the control · an icon that relates to the situation) and the four design questions — **NOTE: IBM's cookie banner arrives late and covers the foot of the frame; nothing was accepted** |
| `empty-shadcn.png` | https://ui.shadcn.com/docs/components/base/empty | the same object built on Base UI: icon, "No Projects Yet", two lines, a filled **Create Project**, an outlined **Import Project**, a quiet **Learn More ↗** |
| `empty-antd.png` | https://ant.design/components/empty | the version to avoid: a grey illustration and the words "No data", with no sentence and no act |
| `empty-polaris.png` | https://shopify.dev/docs/api/polaris | **FAILED: both Polaris empty-state URLs redirect here**, to a references index with no empty state on it |
| `empty-huggingface.png` | https://huggingface.co/models?search=zqxwvnothinghere | a real register at zero rows: `Models 0` — the count keeps its place and reads zero, the facet rail keeps every chip, and the results column is then blank but for a promotional popover |
| `empty-github-search.png` | https://github.com/search?q=zqxwvnothinghere&type=repositories | **the same register as `github-repos-register.png`, at zero**: `0 results (36 ms)`, a literal `0` against every facet, and one card — illustration, "Your search did not match any repositories", "You could try one of the tips below.", two collapsible tips, and an advanced-search link |
| `empty-npm-search.png` | https://www.npmjs.com/search?q=zqxwvnothinghere | `0 packages found`, then four hundred pixels of white |
| `empty-arena.png` | https://www.are.na/search (facet query) | the best empty *strip*: the title becomes the sentence at its normal size, all four filter columns stay in place with unavailable options greyed, and a small bordered `ⓘ Nothing yet` chip sits where the first row would be |
| `empty-figma-community.png` | https://www.figma.com/community | **WHAT LANDED: the Community home.** The search query is dropped by the URL, so this is not an empty register |
| `empty-boatsales.png` | https://www.boatsales.com.au/boats/?q=(And.Keywords.zqxwvnothinghere.) | **FAILED: "You have been blocked"**, with an explanation and an ID. Not fought — so there is no boat marketplace at zero rows in this sweep |
| `empty-northside-search.png` | https://www.northsidemarine.com.au/?s=zqxwvnothinghere | **ground truth:** the dealer's own site, searched for something it does not stock, answers with the words **NO RESULTS** in heavy caps, alone — no sentence, no reason, no way onward |
| `empty-excalidraw.png` | https://excalidraw.com/ | the local-first first run: the marque, three lines saying the work is kept in this browser and should be saved to a file, then four acts as a plain list with their shortcuts printed at the right, and hand-drawn arrows pointing at the real controls |

## Existing stock — frames under `C:\Users\Asaf\dev\hl-refs\ref\` (37 paths, 34 distinct images)

Nothing was captured for these: they are the old repo's `out/ref/**` captures, read frame by frame in `notes-stock.md`. **No `sources.json` exists for them**, so the URL column below is the site the frame's own chrome names, not a recorded final URL. Byte-identical pairs: `jeanneau-1` = `jeanneau-2`, `williams-1` = `williams-2`, `stripe-dashboard-docs` = `stripe-dashboard-docs-2`.

| frame | site the frame names | one line |
|---|---|---|
| `boats/axopar-1.png` | axopar.com | "Configure Your Axopar" — typographic range index, three variant renders floating on white |
| `boats/axopar-2.png` | axopar.com | scrolled: a sticky bar eating two headings, "MORE MODELS COMING SOON" as a real section, a carousel whose cards do not share a baseline |
| `boats/beneteau-1.png` | beneteau.com | the site's own 404; only the footer taxonomy is readable |
| `boats/beneteau-2.png` | beneteau.com | the same 404, second capture |
| `boats/deantonio-1.png` | deantonioyachts.com | cinematic full-bleed hero with an eight-dot pager |
| `boats/deantonio-2.png` | deantonioyachts.com | THE RANGE as full-width bands, one model per band, DISCOVER + CONFIGURE |
| `boats/highfield-1.png` | highfieldboats.com | #DARETOEXPLORE over a RIB foredeck; REQUEST A QUOTE in the nav |
| `boats/highfield-2.png` | highfieldboats.com | four ranges as renders on white with a name and a one-line promise; the 54,000-boats statement |
| `boats/jeanneau-1.png` | jeanneau.com | the site's own error page, "THIS PAGE NO LONGER EXISTS"; no exit link |
| `boats/jeanneau-2.png` | jeanneau.com | byte-identical to `jeanneau-1.png` |
| `boats/nimbus-1.png` | nimbus.se | the site's 404 — an empty state offering exactly two doors, one of them the range |
| `boats/nimbus-2.png` | nimbus.se | the footer: sixteen models as plain text columns, and the "Part of Nimbus Group" marque row |
| `boats/quicksilver-1.png` | quicksilver-boats.com | Cloudflare block page, Ray ID a3b5391f6c915e91 — no site content |
| `boats/quicksilver-2.png` | quicksilver-boats.com | the same block page |
| `boats/riviera-1.png` | rivieraaustralia.com | white caps nav laid on bright water with no scrim — the contrast failure |
| `boats/riviera-2.png` | rivieraaustralia.com | measured figures in a paragraph, then a 2+3 bento of photographic doors with bottom label strips |
| `boats/saxdor-1.png` | saxdoryachts.com | not the home: the news index — a pill filter row over dated cards |
| `boats/saxdor-2.png` | saxdoryachts.com | the card grid continuing; one card's image had not painted |
| `boats/searay-1.png` | searay.com | Cloudflare block page, Ray ID a3b532db3a48d725 — no site content |
| `boats/searay-2.png` | searay.com | the same block page |
| `boats/stabicraft-1.png` | stabicraft.com | the video hero never painted — a black window with only the header and a SCROLL hint |
| `boats/stabicraft-2.png` | stabicraft.com | two doors into one range, BY SIZE RANGE and BY STYLE SERIES, over one aerial |
| `boats/whaler-1.png` | bostonwhaler.com | Cloudflare block page, Ray ID a3b53273e9fed735 — no site content |
| `boats/whaler-2.png` | bostonwhaler.com | the same block page |
| `boats/williams-1.png` | williamsjettenders.com | Cloudflare "verify you are human" interstitial, Ray ID a3b534438af5d736 — not solved, no content |
| `boats/williams-2.png` | williamsjettenders.com | byte-identical to `williams-1.png` |
| `boats/zodiac-1.png` | zodiac-nautic.com | the numbered hero chapter: `02` at the item and `02` lit in the rule pager |
| `boats/zodiac-2.png` | zodiac-nautic.com | OUR RANGES — the range name huge behind the render on white, with the next range peeking as a puck |
| `porsche-finder-1.png` | finder.porsche.com | the register row: photograph + thumbnail strip, title pair, three fact lines, the price with its qualifier, two acts; facets with true counts |
| `porsche-finder-2.png` | finder.porsche.com | scrolled: nineteen collapsed facets, the row grammar repeating exactly |
| `porsche-top.png` | porsche.com configurator | the top action row — quiet reversible acts left, the money small and labelled, one black primary far right, nothing at the foot |
| `tables/linear-homepage.png` | linear.app | the two-tone headline, and `1 / 84 ↑ ↓` printed in the item header |
| `tables/linear-homepage-2.png` | linear.app | the single-row logo wall at equal optical weight with a mono caption |
| `tables/stripe-dashboard-docs.png` | docs.stripe.com | the `/` keycap printed inside the search field; locale at the rail's foot |
| `tables/stripe-dashboard-docs-2.png` | docs.stripe.com | byte-identical to `stripe-dashboard-docs.png` |
| `tables/attio.png` | attio.com | "Good morning, Alex" at ~20px, one field, two suggestion chips, `Quick Actions ⌘K` as a row inside the rail |
| `tables/attio-2.png` | attio.com | the day list where done is struck and dimmed and now carries a dot; the bordered logo grid |
