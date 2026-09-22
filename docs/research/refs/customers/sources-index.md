# Customers — sources index

Every frame on disk for the customers sweep. Captured 2026-09-22 by an earlier run of this same sweep, all 1440 × 900, headless Chromium, `en-AU`, via `tools/research/capture.ts`; that run reached its account limit after the captures and before a word was written, so this index and `notes.md` were written by the run of the same day that read them. Consent banners were answered with the most privacy-preserving control present; **nothing was signed in, nothing was typed into a form, no bot protection was fought**, and **nothing new was captured** — every hard question had a frame. Frames are gitignored; the durable copies are mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\customers\{contacts,crm,deep,empty,marine}\`.

**The figures, counted from the files on disk 2026-09-22.** **214 frames** in five folders; **197 distinct images** (14 byte-identical groups, each named on its rows); **44 opened and looked at by this run** (the budget), each marked **OPENED** with what was seen — a frame not so marked is not cited in `notes.md`. **13 are walls, 404s or load pages** by their own title, listed on their rows. One stock frame was also opened: `C:\Users\Asaf\dev\hl-refs\ref\tables\github-new-repo.png` is a GitHub sign-in page, not the create-a-repository form, and is not cited.

**Thirty-eight frames in `deep/` have no ledger row.** `capture.ts` writes `sources.json` once, after the last source, and the run that captured them died first. Their list files survive in the scratchpad (`lists/deep2.json` … `deep6.json`), so each row below carries the URL and note it was driven with, marked as recovered. Six ids in `deep6.json` were listed and never captured at all: `attio-timelines-2023-whole`, `attio-records-register-whole`, `apple-contacts-card-whole`, `monica-card-whole`, `monica-list`, `monica-list-2`.

**Byte-identical pairs, and what each one means.** `apple-iphone-contacts` = `-alt` (one guide root, twice). `slack-directory` = `-alt` (both the 404). `hubspot-manage-duplicates` = `-scrolled` = `deep/…-3600` (the scroll never happened twice). `shopify-customers` = `shopify-merge-customers` and `shopify-manage-customers` = `-scrolled` = `deep/…-2` (Shopify's help pages redirect to one article each). `stripe-billing-customer` = `-scrolled`. The four Twenty demo frames are two images of one login wall. `deep/boatyard-crm` = `marine/boatyard-home` and `deep/lightspeed-evo-marine-page` = `marine/lightspeed-evo-marine` (the deep pass re-drove two marine homes). `twenty-docs-layout` = `-scrolled`, `twenty-docs-people-object` = `-2`. `airtable-add-table` = `-alt` (both 404). The three Atlassian `empty-state*` frames are one image.

**Refused, dead or walled, not fought:** Twenty's public demo (`app.twenty.com`) is a sign-in wall — four frames; GitHub's new-repository form and Google Contacts (`contacts.google.com`) need a login; Xero's contacts page is a login; MYOB returned 502; Airtable's add-a-table article, HubSpot's create-records article, Blackpurl's CRM page, Cardhop's Mac page and Slack's directory article are 404s. Marine dealer management systems (Boatyard, DockMaster, Lightspeed, BiT, Blackpurl) publish **no customer screen at all**; their marketing pages carry checkmark lists, stock photographs and, in Boatyard's case, a Boats register of the same placeholder row seven times.

## `contacts/` — 25 frames

| id | URL | one line |
|---|---|---|
| `apple-contacts-welcome` | support.apple.com/guide/contacts/welcome/mac | **OPENED** — guide landing; a small list-beside-card shot under an account-provider dialog — weak |
| `apple-contacts-add-people` | support.apple.com/guide/contacts/add-people-and-companies-adrbk1080/mac | adding a person or a company |
| `apple-contacts-add-people-scrolled` | support.apple.com/guide/contacts/add-people-and-companies-adrbk1080/mac | the card being filled |
| `apple-contacts-merge` | support.apple.com/guide/contacts/merge-contact-cards-adrbk1456/mac | Look for Duplicates, Merge Selected Cards |
| `apple-contacts-resolve-duplicates` | support.apple.com/guide/contacts/resolve-duplicates-while-importing-contacts-adrbk1498/mac | **OPENED** — Keep Old / Keep New / Keep Both, in words |
| `apple-contacts-link` | support.apple.com/guide/contacts/link-contacts-from-different-accounts-adrb33f38d93/mac | linking without merging |
| `apple-contacts-card-template` | support.apple.com/guide/contacts/change-the-contact-card-template-adbk27083/mac | which fields a card carries |
| `apple-contacts-update` | support.apple.com/guide/contacts/update-contact-information-adrbk1515/mac | editing in place on the card |
| `apple-contacts-groups` | support.apple.com/guide/contacts/create-groups-of-contacts-adrb3280fe91/mac | groups in the sidebar |
| `apple-iphone-contacts` | support.apple.com/guide/iphone/add-and-use-contact-information-iph3d2d6d1c/ios | iOS Contacts card · byte-identical to `contacts/apple-iphone-contacts-alt.png` |
| `apple-iphone-contacts-alt` | support.apple.com/guide/iphone/welcome/ios | iPhone guide root, to find Contacts · byte-identical to `contacts/apple-iphone-contacts.png` |
| `google-contacts-merge` | support.google.com/contacts/answer/7078226?hl=en&co=GENIE.Platform%3DDesktop | **OPENED** — Merge / Merge all; "You can separate a contact that you merged" — a merge with an undo |
| `google-contacts-add` | support.google.com/contacts/answer/1069522?hl=en | adding a contact |
| `google-workspace-contacts` | support.google.com/a/users/answer/9310345?hl=en | Workspace contacts learning centre |
| `cardhop` | flexibits.com/cardhop | Cardhop: a contact card designed by a calendar company |
| `cardhop-scrolled` | flexibits.com/cardhop | the card shots |
| `cardhop-scrolled-2` | flexibits.com/cardhop | further |
| `monica-home` | www.monicahq.com | open-source personal CRM: notes-led record |
| `monica-home-scrolled` | www.monicahq.com | the record shots |
| `govuk-names` | design-system.service.gov.uk/patterns/names | **OPENED** — "Full name" as ONE field; "only ask for people's names if you need that information" |
| `govuk-addresses` | design-system.service.gov.uk/patterns/addresses | **OPENED** — three sanctioned shapes for an address: multiple inputs, a lookup, a textarea |
| `govuk-phone` | design-system.service.gov.uk/patterns/telephone-numbers | a phone number as typed |
| `govuk-email` | design-system.service.gov.uk/patterns/email-addresses | an email as typed |
| `slack-directory` | slack.com/help/articles/360000826263-Browse-people-in-your-workspace | **OPENED** — 404 "You've found a glitch!" — FAILED · byte-identical to `contacts/slack-directory-alt.png` |
| `slack-directory-alt` | slack.com/help/articles/360043431134-Browse-and-find-members-in-Slack | alternative address · byte-identical to `contacts/slack-directory.png` |

## `crm/` — 59 frames

| id | URL | one line |
|---|---|---|
| `attio-create-view-records` | attio.com/help/reference/managing-your-data/records/create-and-view-records | Attio help: creating and opening a record |
| `attio-create-view-records-scrolled` | attio.com/help/reference/managing-your-data/records/create-and-view-records | the screenshots further down |
| `attio-understanding-records` | attio.com/help/reference/attio-101/attios-data-model/understanding-records | what a record is, in Attio's words |
| `attio-record-activities` | attio.com/help/reference/managing-your-data/records/add-record-activities | notes, tasks and the activity tab on a record |
| `attio-record-activities-scrolled` | attio.com/help/reference/managing-your-data/records/add-record-activities | the activity screenshots |
| `attio-timeline-2026` | attio.com/changelog/2026/new-activity-timeline | the record timeline, redrawn |
| `attio-timeline-2026-scrolled` | attio.com/changelog/2026/new-activity-timeline | the timeline itself |
| `attio-configure-record-pages` | attio.com/help/reference/managing-your-data/records/configure-record-pages | highlight widgets, the six attributes at the top |
| `attio-configure-record-pages-scrolled` | attio.com/help/reference/managing-your-data/records/configure-record-pages | the record page anatomy screenshots |
| `attio-records-workspace` | attio.com/help/reference/workspace/records | the records register |
| `attio-timelines-2023` | attio.com/changelog/2023/new-activity-timelines | the first timeline |
| `attio-attributes` | attio.com/help/reference/attio-101/attios-data-model/Understanding-attributes | the vocabulary a dealer must never see |
| `folk-home` | www.folk.app | **OPENED** — a sign-up form above a pipeline (Demo booked $30K · Active Discussion $45K) with a person panel beside it: name, company, Enrich · Email · WhatsApp |
| `folk-home-scrolled` | www.folk.app | second fold |
| `folk-contact-profile` | help.folk.app/en/articles/5007276-contact-properties-fields | the contact profile: full width or a side panel |
| `folk-contact-profile-scrolled` | help.folk.app/en/articles/5007276-contact-properties-fields | visible fields |
| `folk-mobile` | www.folk.app/mobile | the phone form of a contact register |
| `twenty-home` | twenty.com | open-source CRM marketing shot |
| `twenty-demo` | demo.twenty.com | the public demo, no sign-in · **wall/404** (title: "Loading https://app.twenty.com/welcome") |
| `twenty-demo-people` | demo.twenty.com/objects/people | the people register · **wall/404** (title: "Loading https://app.twenty.com/welcome?returnToPath=%2Fobjects%2Fpeople") · byte-identical to `empty/twenty-demo-settings-people.png` |
| `twenty-demo-people-scrolled` | demo.twenty.com/objects/people | the people register, further down · **wall/404** (title: "Sign in or Create an account") · byte-identical to `crm/twenty-demo-companies.png` |
| `twenty-demo-companies` | demo.twenty.com/objects/companies | the companies register · **wall/404** (title: "Sign in or Create an account") · byte-identical to `crm/twenty-demo-people-scrolled.png` |
| `hubspot-contact-management` | www.hubspot.com/products/crm/contact-management | HubSpot's contact record, marketing |
| `hubspot-contact-management-scrolled` | www.hubspot.com/products/crm/contact-management | the record shots |
| `hubspot-manage-duplicates` | knowledge.hubspot.com/records/manage-duplicate-records | the duplicates manager · byte-identical to `crm/hubspot-manage-duplicates-scrolled.png`, `deep/hubspot-manage-duplicates-3600.png` |
| `hubspot-manage-duplicates-scrolled` | knowledge.hubspot.com/records/manage-duplicate-records | the pair review · byte-identical to `crm/hubspot-manage-duplicates.png`, `deep/hubspot-manage-duplicates-3600.png` |
| `hubspot-deduplication` | knowledge.hubspot.com/records/deduplication-of-records | how HubSpot dedupes on email |
| `hubspot-merge-records` | knowledge.hubspot.com/articles/KCS_Article/Contacts/How-do-I-merge-contacts | merging two records |
| `hubspot-merge-records-scrolled` | knowledge.hubspot.com/articles/KCS_Article/Contacts/How-do-I-merge-contacts | the merge dialog |
| `hubspot-create-records` | knowledge.hubspot.com/records/create-records | creating a contact by hand · **wall/404** (title: "Hubspot 404") |
| `pipedrive-contacts` | support.pipedrive.com/en/article/contacts-people-and-organizations | people and organisations |
| `pipedrive-contacts-scrolled` | support.pipedrive.com/en/article/contacts-people-and-organizations | the list and detail view |
| `pipedrive-merge-duplicates` | support.pipedrive.com/en/article/merge-duplicates | merge duplicates |
| `pipedrive-merge-duplicates-scrolled` | support.pipedrive.com/en/article/merge-duplicates | the preview before merging |
| `pipedrive-how-duplicates` | support.pipedrive.com/en/article/how-does-the-merge-duplicates-feature-identify-duplicates-in-pipedrive | **OPENED** — the article heading only — the rule is below the fold and is quoted in notes.md from the page text, not from this frame |
| `pipedrive-contacts-timeline` | www.pipedrive.com/en/features/contacts-timeline | the contacts timeline feature |
| `copper-manage-contacts` | www.copper.com/manage-contacts | Copper's contact record inside Gmail |
| `copper-manage-contacts-scrolled` | www.copper.com/manage-contacts | the record shots |
| `copper-adding-contacts` | support.copper.com/en/articles/10324551-chapter-3-adding-contacts | adding a contact |
| `copper-relating-records` | support.copper.com/hc/en-us/articles/360001448487-Relating-records | **OPENED** — text only: relate via a field or via the Related section |
| `dex-home` | getdex.com | personal CRM: one person, notes and reminders |
| `dex-home-scrolled` | getdex.com | the record shots |
| `dex-product` | getdex.com/product | the product overview |
| `clay-home` | clay.earth | Clay personal CRM (now Mesh) |
| `clay-home-scrolled` | clay.earth | the record shots |
| `notion-sales-crm` | www.notion.com/templates/sales-crm | Notion's own CRM template |
| `notion-sales-crm-scrolled` | www.notion.com/templates/sales-crm | the template's pages |
| `notion-contact-management` | www.notion.com/templates/contact-management-for-small-businesses | a small-business contact register in Notion |
| `stripe-billing-customer` | docs.stripe.com/billing/customer | the Customers page and the customer details page · byte-identical to `crm/stripe-billing-customer-scrolled.png` |
| `stripe-billing-customer-scrolled` | docs.stripe.com/billing/customer | the customer page screenshot · byte-identical to `crm/stripe-billing-customer.png` |
| `stripe-dashboard-basics` | docs.stripe.com/dashboard/basics | the dashboard's register grammar |
| `shopify-customers` | help.shopify.com/en/manual/customers | **OPENED** — text and a video still; "every time a new customer places an order… their name and other details are added to your customer list" · byte-identical to `crm/shopify-merge-customers.png` |
| `shopify-manage-customers` | help.shopify.com/en/manual/customers/manage-customers | the customer profile page · byte-identical to `crm/shopify-manage-customers-scrolled.png`, `deep/shopify-manage-customers-2.png` |
| `shopify-manage-customers-scrolled` | help.shopify.com/en/manual/customers/manage-customers | further down · byte-identical to `crm/shopify-manage-customers.png`, `deep/shopify-manage-customers-2.png` |
| `shopify-merge-customers` | help.shopify.com/en/manual/customers/merge-customers | merging two profiles; which one remains · byte-identical to `crm/shopify-customers.png` |
| `linear-members-roles` | linear.app/docs/members-roles | Linear's people register |
| `linear-profile` | linear.app/docs/profile | **OPENED** — a settings page; "the default avatar will be the first and last initials of your account" |
| `linear-user-views` | linear.app/docs/user-views | **OPENED** — a person's page is their issues grouped by state under their name (In Review 1 · In Progress 2 · Todo 3); O then U |
| `linear-manage-members` | linear.app/docs/adding-and-managing-members | **OPENED** — SIX rows under one search ("Search by name or email"), no column head, no pager — the smallest real register in 214 frames |

## `deep/` — 91 frames

| id | URL | one line |
|---|---|---|
| `attio-record-anatomy-2500` | attio.com/help/reference/managing-your-data/records/create-and-view-records | record page anatomy, deeper |
| `attio-record-anatomy-4000` | attio.com/help/reference/managing-your-data/records/create-and-view-records | record page tabs and details |
| `attio-record-anatomy-5500` | attio.com/help/reference/managing-your-data/records/create-and-view-records | record details and preview from a table |
| `attio-record-anatomy-7000` | attio.com/help/reference/managing-your-data/records/create-and-view-records | preview from a table or kanban |
| `attio-configure-2000` | attio.com/help/reference/managing-your-data/records/configure-record-pages | highlight widgets screenshot |
| `attio-configure-3200` | attio.com/help/reference/managing-your-data/records/configure-record-pages | tabs and sections |
| `attio-merge-delete` | attio.com/help/reference/managing-your-data/records/merge-and-delete-records | merging two records |
| `attio-merge-delete-scrolled` | attio.com/help/reference/managing-your-data/records/merge-and-delete-records | the merge screenshot |
| `attio-understanding-records-scrolled` | attio.com/help/reference/attio-101/attios-data-model/understanding-records | **OPENED** — the companies register: ~20 px pitch, a coloured-dot word and a wall of category chips on every row |
| `attio-understanding-records-2000` | attio.com/help/reference/attio-101/attios-data-model/understanding-records | record page anatomy |
| `attio-understanding-records-3200` | attio.com/help/reference/attio-101/attios-data-model/understanding-records | record page anatomy, further |
| `apple-contacts-groups-scrolled` | support.apple.com/guide/contacts/create-groups-of-contacts-adrb3280fe91/mac | the whole Tahoe card |
| `apple-contacts-update-scrolled` | support.apple.com/guide/contacts/update-contact-information-adrbk1515/mac | **OPENED** — the card in edit state beside a letter-sectioned list: label chooser per field, empty fields as grey placeholders, red minus on filled ones, Done |
| `hubspot-manage-duplicates-2400` | knowledge.hubspot.com/records/manage-duplicate-records | **OPENED** — a duplicates queue with filters including Similarity "30% and up"; "Manage Duplicates — 122 total duplicate issues" |
| `hubspot-manage-duplicates-3600` | knowledge.hubspot.com/records/manage-duplicate-records | merge preview · byte-identical to `crm/hubspot-manage-duplicates-scrolled.png`, `crm/hubspot-manage-duplicates.png` |
| `hubspot-contact-management-1800` | www.hubspot.com/products/crm/contact-management | the register and the create panel, whole |
| `monica-home-1800` | www.monicahq.com | the record card, whole |
| `monica-home-2700` | www.monicahq.com | further record shots |
| `cardhop-appstore` | apps.apple.com/us/app/cardhop-contacts/id1290358394 | Cardhop's App Store screenshots |
| `cardhop-mac` | flexibits.com/cardhop/mac | Cardhop for Mac page · **wall/404** (title: "Flexibits | Page not found") |
| `twenty-home-900` | twenty.com | **OPENED** — a companies table with a "Calculate ▾" footer cell under a column — an aggregate at the foot |
| `twenty-home-1800` | twenty.com | further |
| `twenty-home-2700` | twenty.com | further |
| `folk-home-1800` | www.folk.app | the contact panel beside the pipeline |
| `folk-home-2700` | www.folk.app | further |
| `folk-contact-profile-1800` | help.folk.app/en/articles/5007276-contact-properties-fields | **OPENED** — text: "Visible fields" chooses which fields the profile shows and in which order |
| `folk-contact-profile-2700` | help.folk.app/en/articles/5007276-contact-properties-fields | company profile and quick actions |
| `boatyard-sales` | boatyard.com/sales | Boatyard for Sales, if it exists |
| `boatyard-crm` | boatyard.com/crm | Boatyard CRM, if it exists · byte-identical to `marine/boatyard-home.png` |
| `govuk-summary-list` | design-system.service.gov.uk/components/summary-list | **OPENED** — Name / Date of birth / Address (three lines) / Contact details, each with Change — and Add beside the value that is missing (Document's primary) |
| `govuk-summary-list-scrolled` | design-system.service.gov.uk/components/summary-list | the example rows |
| `boatyard-sales-900` | boatyard.com/sales | **OPENED** — a Boats register (20/21 RESULTS) with the SAME placeholder row seven times; "Search Boats or Clients" as one field; an AI chat over the table |
| `boatyard-sales-1800` | boatyard.com/sales | further: leads and clients |
| `boatyard-sales-2700` | boatyard.com/sales | further |
| `boatyard-sales-3600` | boatyard.com/sales | further |
| `lightspeed-evo-marine-page` | www.lightspeeddms.com/dms/lightspeedevo-marine | Lightspeed EVO Marine, trailing slash · byte-identical to `marine/lightspeed-evo-marine.png` |
| `lightspeed-evo-marine-page-2` | www.lightspeeddms.com/dms/lightspeedevo-marine | further |
| `lightspeed-solutions-dms` | www.lightspeeddms.com/solutions/dms | the DMS product page |
| `lightspeed-solutions-dms-2` | www.lightspeeddms.com/solutions/dms | further |
| `dockmaster-dealership-2` | www.dockmaster.com/marine-dealership-software | prospecting and unit sales screens |
| `dockmaster-dealership-3` | www.dockmaster.com/marine-dealership-software | further |
| `bit-dms-marine-2` | www.bitdms.com/marine-dealer-management-software | the CRM section |
| `monica-card-1300` | www.monicahq.com | **OPENED** — one card: initials, name, "Sister · Lyon · Last spoke today", two labelled facts side by side, RECENTLY as two timeline entries, one reminder foot |
| `attio-record-page-whole` | attio.com/help/reference/attio-101/attios-data-model/understanding-records | **OPENED** — text: "a record… is the equivalent of a row in a spreadsheet"; visualised as rows, cards, previews and pages |
| `attio-record-page-whole-2` | attio.com/help/reference/attio-101/attios-data-model/understanding-records | the record page anatomy, second try |
| `attio-record-tabs` | attio.com/help/reference/managing-your-data/records/create-and-view-records | **OPENED** — the whole Mailchimp record: fourteen attribute rows with "No values" and "No contact" printed as values, seven highlight tiles, then Activity, Emails 12, Notes 4 |
| `attio-record-details` | attio.com/help/reference/managing-your-data/records/create-and-view-records | record details |
| `attio-record-preview` | attio.com/help/reference/managing-your-data/records/create-and-view-records | **OPENED** — the timeline grouped "This week"; each entry a sentence — "Karri Saarinen changed 18 attributes · 3 days ago" |
| `attio-timeline-2026-500` | attio.com/changelog/2026/new-activity-timeline | **OPENED** — tabs carrying counts (Emails 12 · Notes 4 · Tasks 8 · Deals 4), Upcoming first, a View-settings popover of event toggles |
| `attio-timeline-2026-1200` | attio.com/changelog/2026/new-activity-timeline | further |
| `attio-highlights` | attio.com/help/reference/managing-your-data/records/configure-record-pages | **OPENED** — "up to six attributes as highlight widgets" — the example shows three tiles reading No Connection / No interaction / No interaction |
| `attio-merge-compare` | attio.com/help/reference/managing-your-data/records/merge-and-delete-records | **OPENED** — the merge as A + B = C with the counts summed; "our system intelligently combines your data"; a modal with Cancel ESC / Merge records ↵ |
| `attio-merge-compare-2` | attio.com/help/reference/managing-your-data/records/merge-and-delete-records | further |
| `apple-hig-lists-live-2` | developer.apple.com/design/human-interface-guidelines/lists-and-tables | further · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `apple-hig-lists-live` | developer.apple.com/design/human-interface-guidelines/lists-and-tables | **OPENED** — the grouped table view drawn: a header, rows with chevrons, a FOOTER · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `atlassian-empty-examples-2` | atlassian.design/components/empty-state/examples | description and actions examples · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `atlassian-empty-examples-3` | atlassian.design/components/empty-state/examples | illustration examples · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `attio-understanding-records-4500` | attio.com/help/reference/attio-101/attios-data-model/understanding-records | anatomy of a record page · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `attio-understanding-records-5800` | attio.com/help/reference/attio-101/attios-data-model/understanding-records | anatomy of a record page, further · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `attio-understanding-records-7000` | attio.com/help/reference/attio-101/attios-data-model/understanding-records | adding attributes to sections · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `google-contacts-home` | contacts.google.com | Google Contacts (login expected) · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `hubspot-record-whole` | www.hubspot.com/products/crm/contact-management | **OPENED** — "Contacts 165,469 records", a pager, "--" in an empty phone cell; a Create-contact side panel where Email is required (*) · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `hubspot-register-create-whole` | www.hubspot.com/products/crm/contact-management | the contacts register with the create panel, whole · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `linear-creating-issues-scrolled` | linear.app/docs/creating-issues | further · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `linear-creating-issues` | linear.app/docs/creating-issues | the create form · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `linear-similar-issues-changelog-scrolled` | linear.app/changelog/2023-08-03-similar-issues | **OPENED** — text: "you can quickly turn your issue draft into a comment on the canonical issue instead"; in triage, similar issues appear above the title · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `linear-similar-issues-changelog` | linear.app/changelog/2023-08-03-similar-issues | possible duplicates shown under the create form, no modal · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `linear-similar-issues-now-scrolled` | linear.app/now/using-ai-to-detect-similar-issues | **OPENED** — the create form with "Possible duplicates" listed UNDER it (WEB-2603, WEB-2540) while Create issue stays live — no modal · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `linear-similar-issues-now` | linear.app/now/using-ai-to-detect-similar-issues | how similar issues are found · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `nngroup-empty-states` | www.nngroup.com/articles/empty-state-interface-design | **OPENED** — the summary: system status, learnability, direct pathways — confirms the citation quotes already made · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `pipedrive-contacts-list-whole` | support.pipedrive.com/en/article/contacts-people-and-organizations | **OPENED** — "63 people" beside the list, Name ↑, email as a (Work) chip, ~19 px pitch, a blank cell left blank · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `pipedrive-detail-view-2` | support.pipedrive.com/en/article/contacts-people-and-organizations | the person detail view, lower · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `pipedrive-detail-view` | support.pipedrive.com/en/article/contacts-people-and-organizations | the person detail view, whole · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `pipedrive-how-duplicates-2` | support.pipedrive.com/en/article/how-does-the-merge-duplicates-feature-identify-duplicates-in-pipedrive | **OPENED** — scrolled past the article body; only Related articles — nothing citable · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `pipedrive-merge-preview-2` | support.pipedrive.com/en/article/merge-duplicates | the merge preview, lower · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `pipedrive-merge-preview` | support.pipedrive.com/en/article/merge-duplicates | the merge preview · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `pipedrive-person-detail-whole-2` | support.pipedrive.com/en/article/contacts-people-and-organizations | the person detail view, lower half · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `pipedrive-person-detail-whole` | support.pipedrive.com/en/article/contacts-people-and-organizations | **OPENED** — facts left (DEALS won/lost bar, DETAILS, ORGANIZATION), time right (notes, PLANNED "You have no upcoming activities", DONE timeline with "Won deal … $7,900" as a green pill) · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `shopify-manage-customers-2` | help.shopify.com/en/manual/customers/manage-customers | **OPENED** — text: a profile is created when a customer signs up, places an order or abandons a checkout; "alternatively, you can add a customer… manually" · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ · byte-identical to `crm/shopify-manage-customers-scrolled.png`, `crm/shopify-manage-customers.png` |
| `shopify-merge-customers-2` | help.shopify.com/en/manual/customers/merge-customers | the merge steps and which profile remains · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `stripe-customer-page-2` | docs.stripe.com/billing/customer | **OPENED** — text: store your own id as a key-value pair; a billing and a shipping address · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `stripe-customer-page-3` | docs.stripe.com/billing/customer | **OPENED** — text: "you can continue to update the customer's details… until an invoice is finalized" — the frozen-document rule in a billing company's words · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `twenty-docs-creating-records-scrolled` | docs.twenty.com/user-guide/data-model/creating-records | further · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `twenty-docs-layout-scrolled` | docs.twenty.com/getting-started/core-concepts/layout | further · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ · byte-identical to `deep/twenty-docs-layout.png` |
| `twenty-docs-layout` | docs.twenty.com/getting-started/core-concepts/layout | Twenty's layout, from its docs · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ · byte-identical to `deep/twenty-docs-layout-scrolled.png` |
| `twenty-docs-navigate` | docs.twenty.com/user-guide/getting-started/how-tos/navigate-around-twenty | navigating Twenty · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `twenty-docs-people-object-2` | docs.twenty.com/user-guide/data-model/overview | further · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ · byte-identical to `deep/twenty-docs-people-object.png` |
| `twenty-docs-people-object` | docs.twenty.com/user-guide/data-model/overview | **OPENED** — text: Objects · Fields · Records — the vocabulary a dealer must never meet · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ · byte-identical to `deep/twenty-docs-people-object-2.png` |
| `twenty-releases-scrolled` | twenty.com/releases | further · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `twenty-releases` | twenty.com/releases | release notes with record page shots · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |
| `xero-merge-contacts-scrolled` | central.xero.com/s/article/Merge-contacts | the merge steps · _no ledger row: the run that captured it died before writing `sources.json`; URL recovered from its list file_ |

## `empty/` — 20 frames

| id | URL | one line |
|---|---|---|
| `atlassian-empty-state` | atlassian.design/components/empty-state | the published empty-state component · byte-identical to `empty/atlassian-empty-state-examples-scrolled.png`, `empty/atlassian-empty-state-examples.png` |
| `atlassian-empty-state-examples` | atlassian.design/components/empty-state/examples | the examples · byte-identical to `empty/atlassian-empty-state-examples-scrolled.png`, `empty/atlassian-empty-state.png` |
| `atlassian-empty-state-examples-scrolled` | atlassian.design/components/empty-state/examples | further examples · byte-identical to `empty/atlassian-empty-state-examples.png`, `empty/atlassian-empty-state.png` |
| `atlassian-empty-state-writing` | atlassian.design/content/designing-messages/empty-state | **OPENED** — "Include the reason for the empty state and where they can go next"; one to two sentences; never send people elsewhere |
| `material-lists` | m3.material.io/components/lists/guidelines | Material 3 list anatomy |
| `airtable-add-table` | support.airtable.com/docs/adding-a-new-table-to-a-base | the act that makes a table · **wall/404** (title: "Page Not Found | Airtable Help Center") · byte-identical to `empty/airtable-create-table-alt.png` |
| `airtable-create-table-alt` | support.airtable.com/docs/creating-a-new-table | alternative address · **wall/404** (title: "Page Not Found | Airtable Help Center") · byte-identical to `empty/airtable-add-table.png` |
| `notion-databases-category` | www.notion.com/help/category/databases | Notion database help index |
| `notion-create-database` | www.notion.com/help/guides/creating-a-database | **OPENED** — "click the + New Page button and select a database type"; a Projects table with "+ New item" as its last row |
| `baserow-home` | baserow.io | **OPENED** — marketing home; cookie banner unanswered; a grid at the fold — weak |
| `twenty-demo-settings-objects` | demo.twenty.com/settings/objects | the registers a workspace holds, and New · **wall/404** (title: "Loading https://app.twenty.com/welcome?returnToPath=%2Fsettings%2Fobjects") |
| `twenty-demo-settings-people` | demo.twenty.com/settings/objects/people | the people register's own columns · byte-identical to `crm/twenty-demo-people.png` |
| `github-new-repo-live` | github.com/new | creating a thing named before it exists (login expected) · **wall/404** (title: "Sign in to GitHub · GitHub") |
| `govuk-confirm-email` | design-system.service.gov.uk/patterns/confirm-an-email-address | confirming a typed contact detail |
| `salesforce-duplicate-rules` | help.salesforce.com/s/articleView?id=sf.duplicate_rules_map_of_reference_information.htm | duplicate rules (bot wall expected) |
| `xero-contacts` | central.xero.com/s/article/Add-a-contact | Xero contacts (login wall expected) · **wall/404** (title: "Login | Xero Accounting Software") |
| `xero-merge-contacts` | central.xero.com/s/article/Merge-contacts | Xero merge (login wall expected) |
| `myob-contacts` | help.myob.com/wiki/display/myob/Contacts | MYOB contacts help · **wall/404** (title: "502 Bad Gateway") |
| `square-customer-directory` | squareup.com/help/au/en/article/5194-manage-customer-profiles | Square's customer profile |
| `square-customer-directory-scrolled` | squareup.com/help/au/en/article/5194-manage-customer-profiles | the profile shots |

## `marine/` — 19 frames

| id | URL | one line |
|---|---|---|
| `dealersocket-crm` | dealersocket.com/products/crm | DealerSocket CRM product page |
| `dealersocket-crm-scrolled` | dealersocket.com/products/crm | the customer record shots |
| `dealersocket-crm-data` | dealersocket.com/crm-data-management | customer data management |
| `lightspeed-evo-marine` | www.lightspeeddms.com/dms/lightspeedevo-marine | Lightspeed EVO Marine · byte-identical to `deep/lightspeed-evo-marine-page.png` |
| `lightspeed-evo-marine-scrolled` | www.lightspeeddms.com/dms/lightspeedevo-marine | **OPENED** — text cards Sales · Service · Parts · Mobile ("on the lot or in the bays"); no screenshot |
| `lightspeed-marine` | www.lightspeeddms.com/industries/marine | Lightspeed marine industry page |
| `lightspeed-marine-scrolled` | www.lightspeeddms.com/industries/marine | the screens |
| `lightspeed-info-marine` | info.lightspeeddms.com/marine | Lightspeed marine landing |
| `boatyard-home` | boatyard.com | Boatyard: marine service, marina and dealer CRM · byte-identical to `deep/boatyard-crm.png` |
| `boatyard-home-scrolled` | boatyard.com | the screens |
| `boatyard-home-scrolled-2` | boatyard.com | further |
| `dockmaster-home` | www.dockmaster.com | DockMaster: marinas, boatyards, dealerships |
| `dockmaster-dealership` | www.dockmaster.com/marine-dealership-software | the dealership product |
| `dockmaster-dealership-scrolled` | www.dockmaster.com/marine-dealership-software | **OPENED** — checkmark lists ("Track customer preferences and purchase history") and a stock photograph; no customer screen |
| `bit-dms-marine` | www.bitdms.com/marine-dealer-management-software | BiT DMS marine |
| `bit-dms-marine-scrolled` | www.bitdms.com/marine-dealer-management-software | the screens |
| `blackpurl-home` | www.blackpurl.com | Blackpurl: dealership platform, Australian origin |
| `blackpurl-home-scrolled` | www.blackpurl.com | the screens |
| `blackpurl-crm` | www.blackpurl.com/features/crm | Blackpurl CRM feature page · **wall/404** (title: "Page not found — Blackpurl") |
