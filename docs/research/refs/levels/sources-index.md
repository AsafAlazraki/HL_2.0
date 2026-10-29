# Prices (`/levels`) — sources index

There have been two passes:

- **2026-10-28**, the second pass: 34 frames at 1440 × 900 in `live2/` and 4 at 390 × 844 in `hand2/`, mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\levels\live2` and `…\hand2`. The ledgers are `live2/sources.json` and `hand2/sources.json`.
- **2026-10-22**, the first pass: it follows below, unchanged except for its heading.

In this pass's tables, **OPENED** means the frame was read with the Read tool in this pass. A frame marked NOT OPENED is cited nowhere. A **miss** was opened and is not cited.

## Second pass — live2/ (1440 × 900)

| frame | URL | what it shows | |
|---|---|---|---|
| `virgin-fares-2` | https://www.virginaustralia.com/au/en/travel-info/flying-with-us/fare-types/domestic-fares/ (scrolled) | Fare inclusions: Lite · Choice · Flex · Business as columns. "Complimentary water, tea and coffee…" is one cell spanning three fares. **C's exclusive.** | OPENED |
| `virgin-fares` | same, at the top | The page head | NOT OPENED |
| `wise-compare-2` | https://wise.com/au/compare/ (scrolled) | Providers as rows: a round mark and name, the rate in red where it is worse, the fee, and what the recipient gets set largest at the right. **C's exclusive**, and the ranking to avoid. | OPENED |
| `wise-compare` | same, top | The hero, plus the Wise row on green with its figure at 44,738.33 PHP | OPENED |
| `kayak-forecast` | https://www.kayak.com.au/flights/SYD-MEL/2026-11-20?sort=bestflight_a | Sort tabs carrying their figure (`Cheapest $118 · Best $118 · Quickest $118`), the verdict card "Prices are expected to rise $50 in the next 20 days", and facets each with a price (`Direct $118 · 1 stop $292`). **A's exclusive.** | OPENED |
| `kayak-forecast-2` | same, with a press on the verdict | The press did not open anything; the same as above. A miss. | OPENED |
| `chrome-inherited-img` | https://developer.chrome.com/static/docs/devtools/css/reference/image/view-inherited-secti-14a231c5d8876.png (from developer.chrome.com/docs/devtools/css/reference) | The Styles pane with `Inherited from body` heading the values that come from elsewhere. **A's exclusive.** | OPENED |
| `chrome-computed-img` | …/the-computed-tab-577802944e549.svg | The Computed tab | NOT OPENED |
| `chrome-devtools-css` | https://developer.chrome.com/docs/devtools/css/reference#cascade | The article page | NOT OPENED |
| `payscale-range` | https://www.payscale.com/research/AU/Job=Software_Engineer/Salary | One range bar with `10% $68k · MEDIAN $91k · 90% $127k` under its ticks. Beside it, five components on one shared scale, each with its range in words. **B's exclusive.** | OPENED |
| `yahoo-range` | https://au.finance.yahoo.com/quote/BHP.AX/ (scrolled) | A day chart with the previous close as a dashed line, its figure in a chip on the axis. The ranges below are text. **B's exclusive.** | OPENED |
| `gfinance-range` | https://www.google.com/finance/quote/BHP:ASX?hl=en | The Google Finance quote | NOT OPENED |
| `govuk-task-list` | https://design-system.service.gov.uk/components/task-list/ | The task list. `Completed` is plain text, and `Incomplete` is a tinted tag at the right. **D's exclusive.** | OPENED |
| `govuk-task-list-2` | same, scrolled | The task list, lower on the page | NOT OPENED |
| `adafruit-qty` | https://www.adafruit.com/product/3405 | Three version tiles, each carrying its price ($19.95 · $20.95 · $21.95), the chosen one ringed. There are no quantity tiers on it. **D's exclusive.** | OPENED |
| `zendesk-composer-img` | https://www.getmacha.com/images/grid/6a368b1d27adc82f35655855?w=900 (from getmacha.com/blog/zendesk-internal-notes-vs-public-replies) | Zendesk's Agent Workspace. The composer begins `Public reply ▾ · To Olive Oil`. It is not shown in its yellow note state. Cited for a pattern only. | OPENED |
| `levelsfyi-range` | https://www.levels.fyi/companies/atlassian/salaries/software-engineer?country=113 | A table of levels by Total · Base · Stock · Bonus, with no range bars. A miss. | OPENED |
| `levelsfyi-range-2` | same, scrolled | **Failed:** "Human Verification", not fought | NOT OPENED |
| `digikey-breaks` | https://www.digikey.com.au/en/products/detail/texas-instruments/LM358DR/280591 | "This product is no longer available". A miss. | OPENED |
| `totaltools-club` | https://www.totaltools.com.au/power-tools | One price per tool, with no club price in view. A miss. | OPENED |
| `danmurphys-member` | https://www.danmurphys.com.au/red-wine/all | A hero and offer tiles, with no prices in view. A miss. | OPENED |
| `apple-finder-rename` | https://support.apple.com/en-au/guide/mac-help/mchlp1144/mac | Text, with no rename dialog in view. A miss. | OPENED |
| `apple-photos-date` | redirected to https://support.apple.com/en-au/guide/photos/welcome/mac | The guide's welcome page. A miss. | OPENED |
| `sparkfun-qty` | https://www.sparkfun.com/sparkfun-redboard-qwiic.html | A product page | NOT OPENED |
| `slack-ephemeral` | https://docs.slack.dev/messaging/sending-and-scheduling-messages/#ephemeral | Docs text; WebFetch found no ephemeral screenshot | NOT OPENED |
| `yamaha-shop-pricing` | https://shop.yamaha-motor.com.au/information/pricing-information | ShopYamaha's pricing note | NOT OPENED |
| `mcmaster-tiers` | https://www.mcmaster.com/91251A540/ | 31 KB, likely an empty shell | NOT OPENED |

**Failed** (a frame is kept, and it is not opened or cited):
- `chemist-rrp`, `supercheap-club`, `toyota-prices`, `mazda-pricing`, `auspost-rates`: the address answered "Not Found" or 404.
- `rs-breaks` (au.rs-online.com) and `tesla-design` (tesla.com): "Access Denied".

**Not captured, because their pages hold no screenshots** (checked with WebFetch):
- Cin7's "Managing Price Tiers" (403);
- AccountEdge `items-20` (text only);
- Unleashed's pricing-hierarchy academy page (a video thumbnail).

## Second pass — hand2/ (390 × 844)

| frame | URL | what it shows | |
|---|---|---|---|
| `virgin-fares-390` | as `virgin-fares-2` | Five columns kept at 390, with words broken mid-letter ("Eco / nom / y"). **Avoid.** | OPENED |
| `kayak-390` | as `kayak-forecast` | The tabs fold to `Best ▾`, and the verdict card and its figure stay. A's reflow. | OPENED |
| `wise-compare-390` | https://wise.com/au/compare/ (scrolled) | Each row is mark, name and figure, with the rate under it in red. C's reflow. | OPENED |
| `govuk-task-list-390` | as `govuk-task-list` | Names wrap, and the tags hold at the right. D's reflow. | OPENED |

## Opened this pass, outside live2/ and hand2/

| frame | why |
|---|---|
| `live/uline-boxes.png` | `$1.05` under all five breaks. Avoid. |
| `live/woo-wholesale-1.png` | `Cost of goods` on the price's ground. Avoid. |
| `live/figma-swap-library-img.png` | The census on the act's footer |
| `docs/directions/levels/built/m3-2-1440-full.png` and `m3-2-390.png` | The built ladder at rest, at desk and phone |
| `docs/directions/review/built/m3-2-1440.png` | Review's folding plates, a risk for D |
| `docs/directions/levels-boards/shots/b-the-forks.png` | Board B's fork grid, a risk for D, and the rigging-kit figures it drew |

---

## First pass (2026-10-22)

All frames were captured on 2026-10-22, at 1440 × 900 into `docs/research/refs/levels/live/` and at 390 × 844 into `levels/hand/`, and mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\levels\`. The ledgers are `live/sources.json` and `hand/sources.json`. **OPENED** means the frame was read with the Read tool. A frame marked **NOT OPENED** is cited nowhere. Frames whose names end `-img` are a help article's own screenshot, captured directly from its attachment URL because the article page scrolled past it.

## live/

| frame | URL | what it shows | |
|---|---|---|---|
| `figma-variables-modal-img` | https://help.figma.com/hc/article_attachments/26964398862615 (from help.figma.com article 15145852043927) | The variables modal. Rows of variables run under section rows (`surface`), with `Light · Dark` mode columns. Each cell is an alias chip with a swatch. The group sidebar says `All variables 60`. **A's exclusive.** | OPENED |
| `figma-default-mode-img` | https://help.figma.com/hc/article_attachments/15463109119383 (article 15343816063383) | "Default mode" points to the left-most column (`Modern Theme`) and to the chooser's `Default (Modern Theme)`. **A's exclusive.** | OPENED |
| `figma-edit-variable-img` | https://help.figma.com/hc/article_attachments/26964398869143 | One variable's sheet: Name, Description, `Values: Mobile 4 / Desktop 8`, Code syntax, then `Hide from publishing`. A only. | OPENED |
| `figma-swap-library-img` | https://help.figma.com/hc/article_attachments/27999055994135 | Manage libraries. The footer reads `2 components, 3 styles used in this file`, beside `Open file · Swap library`. A only. | OPENED |
| `figma-variables-entry-img` | https://help.figma.com/hc/article_attachments/41460306183575 | Previous UI vs the new variables entry point. A miss. | OPENED |
| `figma-modes` | https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables | The Design panel's Appearance section, with `Semantic: Color · Light` chosen on a frame. | OPENED |
| `figma-modes-2` | same page, lower | Text: create a mode, and "the default mode … is the left-most column". | OPENED |
| `figma-variables-guide` | https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma | A video thumbnail. A miss. | OPENED |
| `google-flights-history` | https://www.google.com/travel/flights?q=Flights%20to%20MEL%20from%20SYD%20on%202026-11-20%20one%20way&hl=en-AU&curr=AUD | "Prices are currently typical for your search", over a ribbon from $90 to $160 marked `$130 is typical`, with price history beneath. **B's exclusive.** | OPENED |
| `google-flights-date-grid` | the same search, 20–27 Nov | A departure × return grid. Cheapest cells are green with a sparkle and dearest are red, under the legend "Compared with other prices shown". The chosen cell is solid, with its row and column tinted. The footer reads `20–27 Nov $252 · Round trip`, then `Cancel / OK`. **B's exclusive.** | OPENED |
| `google-flights-insights` | the one-way search, scrolled | The verdict collapsed to one line with a three-colour glyph, plus `Date grid · Price graph` doors. B only. | OPENED |
| `woo-wholesale-3` | https://ps.w.org/woocommerce-wholesale-prices/assets/screenshot-3.png | The storefront: retail struck through above `Wholesale Price: $4.20`. Items without one show one figure. **C's exclusive.** | OPENED |
| `woo-wholesale-1` | https://ps.w.org/woocommerce-wholesale-prices/assets/screenshot-1.png | The product form: Regular price, a Wholesale Prices block, then `Cost of goods ($)` on the same ground. **Avoid.** | OPENED |
| `woo-wholesale-4` | https://ps.w.org/woocommerce-wholesale-prices/assets/screenshot-4.png | Wholesale prices per variation | NOT OPENED |
| `uline-s4339` | https://www.uline.com/Product/Detail/S-4339/Corrugated-Boxes-200-Test/20-x-16-x-12-Corrugated-Boxes | `PRICE PER BOX` spans `25 · 100 · 250 · 500 · 1,000+`, with prices from $3.36 down to $2.65 on one row. Every price is red. **C's exclusive.** | OPENED |
| `uline-boxes` | https://www.uline.com/Product/Detail/S-4122/… (served as 12 x 12 x 6") | All five breaks print `$1.05`. **Avoid.** | OPENED |
| `helpscout-note-img` | https://screenshot.launchbrightly.com/help-scout/help-scout-docs/desktop-light-version-1-add-notes-to-conversation-1792098824116.png (from docs.helpscout.com/article/69, which says "Notes are never sent to the customer") | A tinted `Add Note` act beside a neutral composer. **D's exclusive.** | OPENED |
| `apple-edu-mac` | https://www.apple.com/au-edu/shop/buy-mac/macbook-air | `From A$1,939.00`, one figure. The Education rung appears only in the address. **D's exclusive** (the customer's side), and avoid on a dealer's screen. | OPENED |
| `lightspeed-pricebooks` | https://x-series-support.lightspeedhq.com/hc/en-us/articles/25534056400411-Running-sales-using-price-books | The table of contents and the uses. Text. | OPENED |
| `lightspeed-pricebooks-2` | same page, lower | Text: price books override defaults, and a percentage "won't automatically update". Cited for that sentence only. | OPENED |
| `salesforce-dummies-pricebook` | https://www.dummies.com/article/technology/software/marketing-software/salesforce/create-custom-price-book-salesforce-222387 | Text steps, including the "Use Standard Price column". No screenshot. | OPENED |
| `stripe-manage-prices` | https://docs.stripe.com/products-prices/manage-prices | Text, at the top of the page. | OPENED |
| `paddle-localized` | https://developer.paddle.com/build/products/offer-localized-pricing/ | Text: base price and overrides | OPENED |
| `chargebee-multicurrency` | https://www.chargebee.com/docs/billing/2.0/site-configuration/multi-currency-pricing | A video thumbnail. A miss. | OPENED |
| `airtable-pivot` | https://support.airtable.com/articles/9787133982-pivot-table-extension | Text: row and column grouping | OPENED |
| `shopify-b2b-catalogs` | https://help.shopify.com/en/manual/b2b/catalogs/creating-catalogs | Text: plan requirement and intro | OPENED |
| `shopify-cost-per-item` | redirected to https://help.shopify.com/en/manual/products/details | A section index. A miss. | OPENED |
| `octopart-lm358` | https://octopart.com/search?q=LM358DR | **Failed:** a bot wall ("Press & Hold"), not fought | OPENED |
| `shopify-b2b-catalogs-2` | same as above, meant to be scrolled | The scroll did not take (the same byte size as the first) | NOT OPENED |
| `shopify-compare-at` | https://help.shopify.com/en/manual/products/details/product-pricing/sale-pricing | Sale pricing help | NOT OPENED |
| `shopify-markets-prices` | https://help.shopify.com/en/manual/international/pricing | Local-currency pricing help | NOT OPENED |
| `stripe-pricing-table` | https://docs.stripe.com/payments/checkout/pricing-table | The embeddable pricing table docs | NOT OPENED |
| `nerdwallet-qb-levels` | https://www.nerdwallet.com/article/small-business/quickbooks-price-levels-instructions | **Failed:** Cloudflare "Attention Required" | NOT OPENED |

**Failed with no frame:**
- `qbo-price-rules` and `qb-advanced-pricing` (quickbooks.intuit.com): `ERR_HTTP2_PROTOCOL_ERROR`.
- `element14-lm358` (au.element14.com): `ERR_HTTP2_PROTOCOL_ERROR`.
- `helpscout-notes`: a click timed out. The note's screenshot was taken directly instead.
- `airtable-find-replace`: Page Not Found, and the frame was deleted.
- `tier-pricing-1` and `tier-pricing-2` (ps.w.org/tier-pricing-table): 404, and the frames were deleted.

## hand/ (390 × 844)

| frame | URL | what it shows | |
|---|---|---|---|
| `uline-s4339-390` | as `uline-s4339` | The tier columns are cut off at the right edge after `25 / $3.36`. **Avoid.** | OPENED |
| `google-flights-date-grid-390` | as `google-flights-date-grid` | At phone width the verdict "Prices are currently typical" is kept, and the grid stands behind a `Date grid` door. The scripted press did not open it. B only. | OPENED |

## Stock opened

| frame | what it shows | |
|---|---|---|
| `../sheet/tools/notion-boards-subgroups.png` | Text on adding sub-groups. Not cited as a shape. | OPENED |
