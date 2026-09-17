# Quotes register — sources index

Every source driven for the quotes-register sweep, 2026-09-17, all 1440 × 900, headless Chromium, `en-AU`, via `tools/research/capture.ts`. Consent banners were answered with the most privacy-preserving control present; **nothing was signed in, nothing was typed into a form, and no bot protection was fought**. Frames are gitignored; the durable copies are mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\quotes\{live,marine,live2,live3,live4}\`.

**The three figures, counted from the files on disk 2026-09-17.** This index holds **174 rows**; **5 produced no frame** (each named below with its reason); so **169 frames** are on disk and **152 are distinct images**. A row is a source driven, not a picture taken.

**Seventeen frames are a byte-for-byte copy of another frame, and every one is a finding rather than a nuisance** — each is named in the table below:

- **Xero refuses.** `xero-quotes-list`, `xero-invoices-list` and `xero-quote-status` are the *same Xero login page*. Xero's quote-status vocabulary is behind a sign-in and this sweep did not attempt one. Only `xero-quotes` (the Create-a-quote article) and `xero-quotes-marketing` are real Xero pages.
- **Three Linear doc URLs do not exist.** `linear-list-board`, `linear-keyboard` and `linear-command-menu` are the same Linear Docs *Not found* page. Nothing may be claimed from them. The Linear pages that did load are `linear-filters`, `linear-display-options`, `linear-select-issues`, `linear-peek`, `linear-search`, `linear-issue-status`, `linear-views`.
- **Attio has no public register page.** `attio-product`, `attio-lists` and `attio-deals` all resolve to the marketing home. The only Attio record rows in the sweep are in `live3/attio-home-scrolled.png`.
- **Polaris was never reached.** All four Polaris URLs resolve to two identical "Polaris references" index pages. Shopify's published register and empty-state components are **not** in this sweep; Primer's and Carbon's are.
- **Two `-scrolled` frames are identical to their unscrolled twin, so the scroll never happened** — `stripe-invoices-scrolled` = `stripe-invoices-dash`, and `observable-twelve-columns` = `observable-table-scrolled`. Neither is a second view. Observable's twelve-column rule is quoted in this repo from `docs/reference/dense-tables-and-selection.md`, not from a frame.
- Marine 404 pairs: `stacer-boats`/`stacer-range`, `quintrex-boats`/`quintrex-dealer-locator`, `stabicraft-models`/`stabicraft-range`, `yamaha-outboards`/`yamaha-outboards-range`, `northside-new-boats`/`northside-used` (both Cloudflare), `shopify-draft-orders`/`shopify-draft-orders-page`, `pipedrive-deals`/`pipedrive-crm`.

**Refused or dead, with the reason:** `height-app` — `ERR_CONNECTION_CLOSED`; height.app shut down 24 Sep 2025 and `docs/reference/dense-tables-and-selection.md` already records it, so this is a confirmation, not a discovery. `quickbooks-estimates` — `ERR_HTTP2_PROTOCOL_ERROR`. `stessl-boats` — `ERR_NAME_NOT_RESOLVED`. `dunbier-trailers` — `ERR_CONNECTION_REFUSED`. `boatshop24-au` — load timeout. **Bot walls, not fought:** `salesforce-cpq` and `tracker-inventory` (Access Denied), `carvana-search` and `northside-new-boats`/`northside-used` (Cloudflare "Attention Required"), `theyachtmarket-empty` ("Just a moment…"), `boatsales-search` (re-drove the old repo's bot wall and got another). **Occluded:** `carbon-table-heights` and `carbon-data-table-style` carry an IBM cookie banner the tool would not accept and could not reject.

**Stock re-read for this screen, and the correction it forces.** `C:\Users\Asaf\dev\hl-refs\ref\tables\` was opened before anything new was captured. Of the 21 frames the brief names, **`attio`, `attio-2`, `craft-docs-table`, `linear-changelog`, `linear-homepage`, `airtable-universe`, `airtable-shared`, `stripe-dashboard-docs`, `supabase-table` and `github-settings-doc` are marketing or documentation pages, not registers**; `boatsales-list`, `yachtworld` and `mercury-compare` are **bot walls** ("You have been blocked", "Access Denied · Web Application Firewall Block", "Sorry, you have been blocked"); `airtable-universe-2` was captured mid-load with every thumbnail still grey. **`github-issues.png` is the one stock frame in the folder that shows a real, dense, working register, and it is cited heavily below.** The top-level `porsche-saved-1/-2` are not a register of saved configurations — they are the model-series picker carrying a "Do you already have a configuration? / Load saved configuration" door. No board may cite the stock for "rows led by hull thumbnails"; that claim now rests on `marine/marinemax-inventory.png` and `marine/bringatrailer-results.png`.

## `live/` — 36 rows

| id | URL | one line |
|---|---|---|
| `linear-list-board` | linear.app/docs/list-and-board | Linear's own doc for the issue list · **byte-identical to live/linear-keyboard.png, live4/linear-command-menu.png** |
| `linear-select-issues` | linear.app/docs/select-issues | keyboard selection vocabulary |
| `linear-peek` | linear.app/docs/peek | tap vs hold space |
| `linear-filters` | linear.app/docs/filters | find-by-anything |
| `linear-display-options` | linear.app/docs/display-options | grouping and density |
| `linear-keyboard` | linear.app/docs/keyboard-shortcuts | the printed vocabulary · **byte-identical to live/linear-list-board.png, live4/linear-command-menu.png** |
| `linear-home` | linear.app/ | product shot of the register |
| `linear-home-scrolled` | linear.app/ | second fold |
| `attio-product` | attio.com/product | records register · **byte-identical to live/attio-deals.png, live/attio-lists.png** · returned `Page not found` |
| `attio-lists` | attio.com/product/lists | lists of records · **byte-identical to live/attio-deals.png, live/attio-product.png** · returned `Page not found` |
| `attio-deals` | attio.com/templates/deals | deal register · **byte-identical to live/attio-lists.png, live/attio-product.png** |
| `stripe-payments-dash` | docs.stripe.com/payments/dashboard | payments list · returned `Page not found | Stripe Documentation` |
| `stripe-invoices-dash` | docs.stripe.com/invoicing/dashboard | invoice register with states · **byte-identical to live3/stripe-invoices-scrolled.png** |
| `stripe-search` | docs.stripe.com/dashboard/search | query-language find |
| `stripe-datatable` | docs.stripe.com/stripe-apps/components/datatable | published table component |
| `shopify-orders-list` | help.shopify.com/en/manual/fulfillment/managing-orders/orders-list | orders register |
| `shopify-draft-orders` | help.shopify.com/en/manual/fulfillment/managing-orders/draft-orders | draft vs order - our draft vs issued · **byte-identical to live4/shopify-draft-orders-page.png** |
| `xero-quotes` | central.xero.com/s/article/Create-a-quote | quote statuses draft sent accepted declined invoiced expired |
| `xero-quotes-list` | central.xero.com/s/article/View-quotes | the quote register itself · **byte-identical to live/xero-invoices-list.png, live4/xero-quote-status.png** · returned `Login | Xero Accounting Software` |
| `xero-invoices-list` | central.xero.com/s/article/View-list-of-invoices | invoice register tabs · **byte-identical to live/xero-quotes-list.png, live4/xero-quote-status.png** · returned `Login | Xero Accounting Software` |
| `xero-quotes-marketing` | www.xero.com/au/accounting-software/quotes/ | how they sell the quote list |
| `quickbooks-estimates` | quickbooks.intuit.com/learn-support/en-au/help-article/estimates/create-estimate-quickbooks-online/L0kBLpJ9M_AU_en_AU | **no frame** — page.goto: net::ERR_HTTP2_PROTOCOL_ERROR at https://quickbooks.intuit.com/learn-support/en |
| `pipedrive-deals` | www.pipedrive.com/en/features/deals | deal list · **byte-identical to live2/pipedrive-crm.png** |
| `hubspot-quotes` | knowledge.hubspot.com/quotes/create-and-share-quotes | quote tool register · returned `Hubspot 404` |
| `vercel-deployments` | vercel.com/docs/deployments | register of versions of one thing |
| `vercel-deployments-manage` | vercel.com/docs/deployments/managing-deployments | promote / rollback a version |
| `github-releases-vscode` | github.com/microsoft/vscode/releases | versions with one Latest |
| `github-pulls-vscode` | github.com/microsoft/vscode/pulls | register with query syntax in the field |
| `sentry-issues` | docs.sentry.io/product/issues/ | issue stream with counts |
| `notion-databases` | www.notion.com/help/intro-to-databases | views over one set of records |
| `qwilr-home` | qwilr.com/ | proposal software |
| `pandadoc-docs` | www.pandadoc.com/features/document-management/ | document register with states · returned `Not Found` |
| `proposify-home` | www.proposify.com/ | proposal register |
| `superhuman-speed` | blog.superhuman.com/superhuman-is-built-for-speed/ | latency doctrine |
| `superhuman-palette` | blog.superhuman.com/how-to-build-a-remarkable-command-palette/ | find-by-anything |
| `raycast-shortcuts` | manual.raycast.com/keyboard-shortcuts | printed vocabulary |

## `marine/` — 40 rows

| id | URL | one line |
|---|---|---|
| `northside-boats-for-sale` | www.northsidemarine.com.au/boats-for-sale/ | the dealer's own stock register · returned `Page not found – Northside Marine` |
| `northside-new-boats` | www.northsidemarine.com.au/new-boats/ | the dealer's own new-boat list · **byte-identical to marine/northside-used.png** · returned `Attention Required! | Cloudflare` |
| `brisbaneyamaha-stock` | www.brisbaneyamaha.com.au/boats-for-sale | a Queensland dealer's stock list |
| `jvmarine-stock` | www.jvmarine.com.au/boats-for-sale | Victorian dealer stock list · returned `Page not found – Boats For Sale, New and Used ` |
| `stessl-boats` | www.stesslboats.com.au/boats/ | **no frame** — page.goto: net::ERR_NAME_NOT_RESOLVED at https://www.stesslboats.com.au/boats/ |
| `quintrex-boats` | www.quintrex.com.au/boats/ | builder register with facets · **byte-identical to marine/quintrex-dealer-locator.png** · returned `Page Not Found` |
| `stacer-boats` | www.stacer.com.au/boats/ | the brand our golden quote is drawn on · **byte-identical to marine/stacer-range.png** · returned `Page Not Found` |
| `stabicraft-models` | www.stabicraft.com/au/models | model register · **byte-identical to marine/stabicraft-range.png** · returned `Page not found | Stabicraft` |
| `highfield-models` | www.highfieldboats.com/en/boats | render-only catalogue register |
| `theyachtmarket-list` | www.theyachtmarket.com/boats-for-sale/ | marine listing register |
| `boatshop24-list` | www.boatshop24.com/boats/ | marine listing register |
| `marinemax-inventory` | www.marinemax.com/boats-for-sale | dealer group inventory |
| `boatsales-search` | www.boatsales.com.au/boats/ | re-drive the stock bot wall |
| `tracker-inventory` | www.trackerboats.com/find-a-dealer/ | US dealer locator with stock · returned `Access Denied` |
| `collectingcars-results` | collectingcars.com/results | a register of finished transactions |
| `bringatrailer-auctions` | bringatrailer.com/auctions/ | register led by photographs |
| `hagerty-marketplace-list` | www.hagerty.com/marketplace/listings | counted register of vehicles · returned `Page Not Found` |
| `dunbier-trailers` | www.dunbier.com.au/trailers/ | **no frame** — page.goto: net::ERR_CONNECTION_REFUSED at https://www.dunbier.com.au/trailers/ |
| `yamaha-outboards-range` | www.yamaha-motor.com.au/marine/outboards | motor register · **byte-identical to marine/yamaha-outboards.png** · returned `Not Found Error Page | Yamaha Motor Australia` |
| `quintrex-dealer-locator` | www.quintrex.com.au/find-a-dealer/ | list with a filter that must return nothing sometimes · **byte-identical to marine/quintrex-boats.png** · returned `Page Not Found` |
| `northside-home` | www.northsidemarine.com.au/ | the dealer's own front door, to find its stock register |
| `northside-used` | www.northsidemarine.com.au/used-boats/ | used stock list · **byte-identical to marine/northside-new-boats.png** · returned `Attention Required! | Cloudflare` |
| `brisbaneyamaha-instock` | www.brisbaneyamaha.com.au/in-stock | the IN STOCK door from their nav |
| `brisbaneyamaha-preowned` | www.brisbaneyamaha.com.au/pre-owned | pre-owned register |
| `jvmarine-new` | www.jvmarine.com.au/new-boats | new boat register |
| `quintrex-range` | www.quintrex.com.au/quintrex-range/ | model register · returned `Page Not Found` |
| `stacer-range` | www.stacer.com.au/stacer-range/ | the brand of the golden quote · **byte-identical to marine/stacer-boats.png** · returned `Page Not Found` |
| `stabicraft-range` | www.stabicraft.com/models/ | model register · **byte-identical to marine/stabicraft-models.png** · returned `Page not found | Stabicraft` |
| `highfield-range` | www.highfieldboats.com/en/models | render-only register |
| `yamaha-outboards` | www.yamaha-motor.com.au/marine/outboards/ | motor register · **byte-identical to marine/yamaha-outboards-range.png** · returned `Not Found Error Page | Yamaha Motor Australia` |
| `boatshop24-au` | www.boatshop24.com/boats-for-sale/ | **no frame** — page.screenshot: Protocol error (Page.captureScreenshot): Unable to capture screenshot |
| `theyachtmarket-scrolled` | www.theyachtmarket.com/boats-for-sale/ | the rows themselves |
| `marinemax-scrolled` | www.marinemax.com/boats-for-sale | the rows themselves |
| `bringatrailer-scrolled` | bringatrailer.com/auctions/ | photograph-led register rows |
| `collectingcars-results-scrolled` | collectingcars.com/results | a register of finished transactions |
| `boattrader-au` | www.boatsonline.com.au/boats-for-sale/ | Australian marine register |
| `sirocco-marine` | siroccomarine.com.au/boats-for-sale/ | a Brisbane BRIG dealer's stock register · returned `Page not found - Sirocco Marine RIBS` |
| `whitworths-search-empty` | www.whitworths.com.au/search?q=zzzznothing | a marine retailer's zero-result page |
| `marinemax-empty` | www.marinemax.com/boats-for-sale?make=zzzz | a dealer register filtered to nothing |
| `theyachtmarket-empty` | www.theyachtmarket.com/boats-for-sale/?keyword=zzzzzzzz | a listing register filtered to nothing · returned `Just a moment...` |

## `live2/` — 36 rows

| id | URL | one line |
|---|---|---|
| `quoter-home` | www.quoter.com/ | quoting software, the literal subject |
| `betterproposals` | betterproposals.io/ | proposal register |
| `zoho-invoice` | www.zoho.com/au/invoice/ | invoice register |
| `freshbooks-invoicing` | www.freshbooks.com/invoice-software | invoice register with states |
| `waveapps-invoicing` | www.waveapps.com/invoicing | free invoicing register |
| `invoiceninja` | www.invoiceninja.com/ | open-source invoice register |
| `ramp-bills` | ramp.com/bill-pay | finance register |
| `brex-expenses` | www.brex.com/product/expense-management | finance register |
| `harvest-invoices` | www.getharvest.com/invoicing | invoice list |
| `pipedrive-crm` | www.pipedrive.com/en/products/crm | deal register · **byte-identical to live/pipedrive-deals.png** |
| `hubspot-quotes-tool` | www.hubspot.com/products/sales/quotes | quote tool |
| `salesforce-cpq` | www.salesforce.com/sales/cpq/ | configure price quote · returned `Access Denied` |
| `monday-crm` | monday.com/crm | register as board |
| `figma-version-history` | help.figma.com/hc/en-us/articles/360038006754-View-a-file-s-version-history | versions of one document |
| `notion-page-history` | www.notion.com/help/page-history | version history · returned `Page not found` |
| `google-docs-versions` | support.google.com/docs/answer/190843 | named versions |
| `polaris-empty-state` | polaris.shopify.com/components/layout-and-structure/empty-state | published empty-state component · **byte-identical to live2/polaris-index-table.png** |
| `polaris-index-table` | polaris.shopify.com/components/tables/index-table | published register component with its empty state · **byte-identical to live2/polaris-empty-state.png** |
| `primer-blankslate` | primer.style/product/components/blankslate/ | GitHub's empty state |
| `primer-data-table` | primer.style/product/components/data-table/ | GitHub's published table density |
| `carbon-data-table` | carbondesignsystem.com/components/data-table/usage/ | published row heights |
| `retool-table` | docs.retool.com/apps/guides/data/table/customization | 20/32/48/60 row-height ladder |
| `grafana-table` | grafana.com/docs/grafana/latest/panels-visualizations/visualizations/table/ | density and frozen columns |
| `observable-table` | observablehq.com/framework/inputs/table | twelve-column rule, 22px unit |
| `mui-datagrid-density` | mui.com/x/react-data-grid/density/ | three named densities · returned `404: This page could not be found` |
| `airtable-grid-view` | support.airtable.com/docs/airtable-grid-view | row height presets |
| `basecamp-home` | basecamp.com/ | a register grouped by human time |
| `things-app` | culturedcode.com/things/ | grouping by day, Today/Upcoming |
| `fantastical` | flexibits.com/fantastical | the diary as a list |
| `readwise-reader` | readwise.io/read | dense reading register |
| `height-app` | height.app | **no frame** — page.goto: net::ERR_CONNECTION_CLOSED at https://height.app/ |
| `airbnb-trips` | www.airbnb.com.au/help/article/1318 | a register of bookings led by photographs |
| `rightmove-saved` | www.rightmove.co.uk/property-for-sale/find.html?searchLocation=Brighton | property register led by photographs with a price |
| `carvana-search` | www.carvana.com/cars | vehicle register with a big figure per row · returned `Attention Required! | Cloudflare` |
| `cmdk-raycast` | cmdk.paco.me/ | the palette as find-by-anything |
| `algolia-autocomplete` | www.algolia.com/doc/ui-libraries/autocomplete/introduction/what-is-autocomplete/ | federated search across kinds |

## `live3/` — 36 rows

| id | URL | one line |
|---|---|---|
| `primer-empty-states` | primer.style/product/ui-patterns/empty-states/ | GitHub's published empty-state pattern |
| `primer-empty-states-scrolled` | primer.style/product/ui-patterns/empty-states/ | the examples themselves |
| `primer-datatable-density` | primer.style/product/components/data-table/ | cell density section |
| `primer-datatable-actions` | primer.style/product/components/data-table/ | row actions and loading state |
| `carbon-data-table-style` | carbondesignsystem.com/components/data-table/style/ | published row heights |
| `carbon-empty-states` | carbondesignsystem.com/patterns/empty-states-pattern/ | published empty-state anatomy |
| `retool-table-scrolled` | docs.retool.com/apps/guides/data/table/customization | the 20/32/48/60 ladder |
| `observable-table-scrolled` | observablehq.com/framework/inputs/table | twelve-column rule in prose · **byte-identical to live4/observable-twelve-columns.png** |
| `airtable-grid-scrolled` | support.airtable.com/docs/airtable-grid-view | row-height presets |
| `grafana-table-scrolled` | grafana.com/docs/grafana/latest/panels-visualizations/visualizations/table/ | frozen columns and cell height |
| `polaris-index-table-react` | polaris-react.shopify.com/components/tables/index-table | the register component with selection · **byte-identical to live3/polaris-empty-search.png** |
| `polaris-empty-search` | polaris-react.shopify.com/patterns/empty-states | empty state pattern · **byte-identical to live3/polaris-index-table-react.png** |
| `shopify-orders-scrolled` | help.shopify.com/en/manual/fulfillment/managing-orders/orders-list | the orders register screenshot |
| `stripe-invoices-scrolled` | docs.stripe.com/invoicing/dashboard | invoice register with states · **byte-identical to live/stripe-invoices-dash.png** |
| `quoter-scrolled` | www.quoter.com/ | the quote register itself |
| `betterproposals-scrolled` | betterproposals.io/ | proposal register |
| `proposify-scrolled` | www.proposify.com/ | proposal register |
| `qwilr-scrolled` | qwilr.com/ | proposal register |
| `pipedrive-scrolled` | www.pipedrive.com/en/products/crm | deal register |
| `monday-crm-scrolled` | monday.com/crm | register as board |
| `hubspot-quotes-scrolled` | www.hubspot.com/products/sales/quotes | quote tool register |
| `zoho-invoice-scrolled` | www.zoho.com/au/invoice/ | invoice register with states |
| `waveapps-scrolled` | www.waveapps.com/invoicing | invoice register |
| `ramp-bills-scrolled` | ramp.com/bill-pay | finance register rows |
| `basecamp-scrolled` | basecamp.com/ | grouping by human time |
| `things-scrolled` | culturedcode.com/things/ | Today / Upcoming grouping |
| `fantastical-scrolled` | flexibits.com/fantastical | the diary as a list |
| `linear-customers-page` | linear.app/customers | a register of accounts |
| `linear-product-issues` | linear.app/product | the issue register in Linear's own marketing |
| `attio-home-scrolled` | attio.com/ | the records register |
| `notion-databases-scrolled` | www.notion.com/help/intro-to-databases | views over one set |
| `figma-version-scrolled` | help.figma.com/hc/en-us/articles/360038006754-View-a-file-s-version-history | named versions in a side panel |
| `google-docs-versions-scrolled` | support.google.com/docs/answer/190843 | version history wording |
| `nngroup-empty-states` | www.nngroup.com/articles/empty-state-interface-design/ | the published guidance |
| `github-issues-zero` | github.com/microsoft/vscode/issues?q=is%3Aissue+zzzzqqqnothinghere | the same register at zero |
| `github-releases-compare` | github.com/microsoft/vscode/compare/1.137.0...1.138.0 | what changed between two versions |

## `live4/` — 26 rows

| id | URL | one line |
|---|---|---|
| `shopify-order-statuses` | help.shopify.com/en/manual/fulfillment/managing-orders/order-status | a published state vocabulary |
| `shopify-order-statuses-scrolled` | help.shopify.com/en/manual/fulfillment/managing-orders/order-status | the state table itself |
| `shopify-draft-orders-page` | help.shopify.com/en/manual/fulfillment/managing-orders/draft-orders/create-draft-orders | draft becomes order - our draft becomes issued · **byte-identical to live/shopify-draft-orders.png** |
| `shopify-viewing-filtering` | help.shopify.com/en/manual/fulfillment/managing-orders/viewing-orders | the orders register and its saved tabs |
| `xero-quote-status` | central.xero.com/s/article/Quote-statuses | draft sent accepted declined invoiced expired · **byte-identical to live/xero-invoices-list.png, live/xero-quotes-list.png** · returned `Login | Xero Accounting Software` |
| `stripe-invoice-states` | docs.stripe.com/invoicing/overview | invoice lifecycle states |
| `linear-issue-status` | linear.app/docs/configuring-workflows | the status glyph set |
| `linear-views` | linear.app/docs/custom-views | saved views |
| `linear-search` | linear.app/docs/search | find by anything |
| `linear-command-menu` | linear.app/docs/command-menu | act on what is under the cursor · **byte-identical to live/linear-keyboard.png, live/linear-list-board.png** |
| `carbon-table-heights` | carbondesignsystem.com/components/data-table/style/ | published row heights |
| `retool-row-heights` | docs.retool.com/apps/guides/data/table/customization | the 20/32/48/60 ladder |
| `observable-twelve-columns` | observablehq.com/framework/inputs/table | the twelve-column rule · **byte-identical to live3/observable-table-scrolled.png** |
| `grafana-cell-height` | grafana.com/docs/grafana/latest/panels-visualizations/visualizations/table/ | cell height and column width |
| `bringatrailer-results` | bringatrailer.com/auctions/results/ | a register of finished sales, the figure leading |
| `hagerty-marketplace` | www.hagerty.com/marketplace | counted register of vehicles |
| `wise-transactions` | wise.com/gb/blog/wise-account-statement | money rows with tabular figures · returned `Page Not Found - Wise` |
| `monzo-home` | monzo.com/ | a transaction register where the figure leads |
| `mercury-banking` | mercury.com/ | a dense money register |
| `vercel-dashboard-docs` | vercel.com/docs/dashboard-features | the deployments register |
| `github-blankslate-guidelines` | primer.style/product/components/blankslate/guidelines/ | when to use a blankslate |
| `tanstack-table-pinning` | tanstack.com/table/latest/docs/guide/column-pinning | the library this repo uses |
| `tanstack-virtual` | tanstack.com/virtual/latest/docs/introduction | the library this repo uses |
| `base-ui-table` | base-ui.com/react/overview/quick-start | the primitive kit this repo uses |
| `apple-hig-lists` | developer.apple.com/design/human-interface-guidelines/lists-and-tables | published list guidance |
| `material-data-table` | m3.material.io/components/lists/guidelines | published list guidance |
