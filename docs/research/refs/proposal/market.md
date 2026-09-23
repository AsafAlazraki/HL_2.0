# The market: what PandaDoc and its peers do, and what a quote that looks the part is

Read 2026-09-23 for the owner's request: *"keen to use opus 5.5 now to do more analysis on what is going on with what i want re the pandadoc like functionality and all of that … also really keen on being able to get a quote out properly where it looks the part."*

**Method.** 54 web searches and 46 page fetches, counted from this session's log — 14 of the fetches were refused (403/404/429) or rendered empty and are listed at the end — across help centres, pricing pages and the regulator; two PDFs read whole (the MTA SA sample new-vehicle contract, the ACCC's *New caravan retailing* report), and **19 frames** captured with `npx tsx tools/research/capture.ts proposal/market …` at 1440 × 900 (frames in `docs/research/refs/proposal/market/`, gitignored, mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\proposal\market\`; ledger in `market/sources.json`). Nothing was signed into, no account was made, nothing was typed into any page. Consent cards were answered with the most privacy-preserving button; where a card offered no refusal (PandaDoc, Better Proposals) it was left open and is recorded below. 16 of the 19 frames were opened and looked at; only opened frames are cited.

**Labels.** *Vendor claim* = a figure a vendor publishes about its own product, not independently measured. *Snippet* = text seen in a search result whose page could not be fetched (403/429); the URL is given, the words were not read on the page itself. *Inference* = my reasoning, not a source.

---

## 1. The finding that frames the rest

**The market's leaders freeze a sent document exactly as HL_2.0 freezes an issued quote.**

- PandaDoc's own API reference: `document.sent` means the document *"has been 'sealed'"* and *"No further document edits can occur except for document recipient(s) filling out or signing"* (<https://developers.pandadoc.com/reference/document-status>).
- Editing a sent PandaDoc document *"will be pushed into the Draft status and you will have to resend it"*, and *"All signature and initials fields filled out by recipients will be erased"* (<https://support.pandadoc.com/en/articles/9714684-edit-sent-documents>). Editing also *"removes its old analytics"* (<https://support.pandadoc.com/en/articles/9714822-review-document-analytics>).
- Qwilr: *"Once a page is in Accepted status, it can't be edited … You can also clone it to create an editable copy"* (<https://help.qwilr.com/article/578-dashboard-page-statuses>).
- ServiceM8: *"Every time you produce a quote template on a job, it creates a snapshot of the price, materials, and 'Work Completed' description"*; old versions stay in a Version History and can be restored (<https://support.servicem8.com/hc/en-us/articles/360000470895-How-Quote-Versions-Quote-Options-Work>).

HL_2.0 already does this — an issued quote refuses edits and the way on is a new version that carries the figures across (`src/screens/document/Document.tsx`, the `Record` atom at line 1304). **"PandaDoc-like" does not require unfreezing anything.** Where the market differs is that it *allows the recipient* to change a sealed document in named, bounded ways (optional items, quantities, section choice) — §3.4 is how that can be shaped without breaking "an issued document renders from frozen lines only".

---

## 2. Capability by capability

Year-one verdicts are for **one dealership, two salespeople, selling boats to private buyers, local-first on a static site until Milestone 6** (the task's premise). A verdict is my judgement from the evidence and is labelled as such; the owner decides (§8).

| # | Capability | What it is, in the tool's own terms | Who has it (tier, list price as read 2026-09-23) | Needs a server? *(inference)* | Year one at Northside? *(judgement)* |
|---|---|---|---|---|---|
| 1 | **Templates** | A reusable document with fixed structure, branding and placeholders filled at creation | Everyone. PandaDoc Free/Starter: *"up to 5"* templates; Business: unlimited (`market/pandadoc-pricing`) | No | **Yes** — M5's composer is this |
| 2 | **Content library** | Stored blocks reused across documents — *"Testimonials or Terms and Conditions"* (PandaDoc search result, <https://www.pandadoc.com/features/create/content-library/>) | PandaDoc **Business** (`market/pandadoc-pricing`); Proposify all plans; Better Proposals all plans; Salesforce CPQ "Template Content" | No | **Yes, small** — terms, why-us, after-sales: the seven authored slots of the original (`docs/PLAN.md` line 239) |
| 3 | **Conditional content** | A block shown only when a rule holds. PandaDoc "Smart content"; Salesforce CPQ *Quote Terms* with a *Term Conditions* list checked per quote (snippet, Salesforce Help via <https://sfdcgym.com/blog/cpq/mastering-salesforce-cpq-quote-templates.html>); DocuSign Gen "document rules" | PandaDoc **Enterprise only** (`market/pandadoc-pricing`) | No | **Probably** — per-brand terms (a Highfield warranty paragraph only on Highfield quotes) is the brand layer of the plan's four-layer cascade |
| 4 | **Variables / tokens** | `[Client.Company]`, `[Quote.ExpDate]` in PandaDoc (`market/pandadoc-sales-quote-template`); `{{sender_first_name}}` in Better Proposals (`document/live/betterproposals-templates`); `{document}` merge field in ServiceM8 | Everyone | No | **Yes** — the plan's "customer-token substitution"; frozen at issue |
| 5 | **Pricing table** | Line items with qty, price, discount, tax, subtotals | PandaDoc **Business** only — Starter has no pricing tables (`market/pandadoc-pricing`, "Sell & Get paid" rows) | No | **Already built** — the frozen line tables |
| 6 | **Recipient-editable optional items / quantities** | Recipient ticks rows or changes quantities; totals recalculate. PandaDoc: *"Recipient options > Enable optional item"* (<https://support.pandadoc.com/en/articles/9714705-pricing-table-optional-items-and-editable-quantity>); Quote builder adds single-/multi-section choice, **Business and Enterprise** (<https://support.pandadoc.com/en/articles/9714719-quote-builder-block-enabling-recipient-options>); Proposify *"Optional row"* and *"Allow recipient to edit"*; Qwilr packages, *"Single Select"* (<https://help.qwilr.com/article/217-packages>); Tradify optional sections; ServiceM8 Multiple Choice + Optional Extras (`market/servicem8-proposals`) | Most | **Yes** — the customer's tick has to be recorded somewhere | **Maybe, reshaped** — §3.4 |
| 7 | **Approval workflows** | Internal sign-off before send, conditional on thresholds: *"any line item discount … total discount … grand total discount"* (<https://support.pandadoc.com/en/articles/9714721-conditional-approvals-with-quote-builder>) | PandaDoc **Business**; Better Proposals **Enterprise** ($42–49/user/mo by billing); Proposify **Business** (custom, from $3,900/yr) | Only across people/devices | **Unlikely** — two salespeople and an owner; the same need is LATER's *"Margin gate with typed-reason override"* (`docs/LATER.md` line 10) |
| 8 | **E-signature** | Legally binding signature with an audit trail | All tools; PandaDoc Free 5/month, Starter unlimited (`market/pandadoc-pricing`); HubSpot needs Sales Hub **Starter**+ with pooled monthly limits (*snippet*, <https://knowledge.hubspot.com/quotes/use-e-signatures-with-quotes>) | **Yes** for remote signing | **Later** — `docs/LATER.md` line 12 (public accept-and-sign page) |
| 9 | **In-person signing** | The customer signs on the seller's device, in the room. PandaDoc lists *"In-person signing"* (Business); Tradify *"Onsite signature capture via mobile app (dated and saved)"* (<https://www.tradifyhq.com/quote-template>) | PandaDoc Business; Tradify | **No** — the signature can live with the quote on the dealer's device *(inference)* | **Worth asking** — a boat buyer is often in the showroom (owner question) |
| 10 | **Print and sign** | HubSpot's second acceptance method: *"leave space on the quote for the buyer to print and sign"* (<https://knowledge.hubspot.com/quotes/create-quote-templates>) | HubSpot | **No** | **Yes, now** — a signature block on the printed A4 is buildable on static hosting today |
| 11 | **Send + track** | Hosted link; notifications on open; per-recipient *"Times Viewed," "Total Time Spent," "Last View," "PDF Download"*; per page *"Time spent on the page"* — **Business and Enterprise**; *"Analytics stop tracking 30 seconds after recipient is not on the document"* (<https://support.pandadoc.com/en/articles/9714822-review-document-analytics>). Qwilr: analytics history 60 / 120 days / unlimited by plan (<https://qwilr.com/pricing/>). GetAccept adds video and chat (`market/getaccept-proposal`) | PandaDoc Business; Qwilr all; Proposify all; Better Proposals all | **Yes** — the customer must open a hosted page | **Not before M6.** On a static, per-browser site the customer cannot open the dealer's data *(inference from the hosting premise)*. After M6: open notifications are useful, per-page timing on a private buyer is a privacy question (§8) |
| 12 | **Reminders** | *"choose how many days after sending the document the first reminder should be sent … how frequently"* until completed (<https://support.pandadoc.com/en/articles/9714663-auto-reminders>) | PandaDoc **Business**; Tradify *"Automatic follow-up reminders"* | Yes (sending mail) | **Later** — rides on email sending (`docs/LATER.md` line 13) |
| 13 | **Expiry / validity** | PandaDoc auto-expiration, **default 60 days**; Starter and Free *"cannot be changed"*, Business up to 3,650 days; the expired document *"becomes completely unavailable to signers"* (<https://support.pandadoc.com/en/articles/9714665-auto-expirations>). HubSpot's header module carries *"issue date, expiration date"*. PandaDoc's own sales quote has `Exp. Date: [Quote.ExpDate]` (`market/pandadoc-sales-quote-template`) | Everyone shows a date; enforcement needs a host | Showing: no. Enforcing: yes | **Yes, the date** — a *valid until* the dealership sets, frozen at issue. `docs/LATER.md` line 11 already names *"quote validity/expiry"* |
| 14 | **Payment collection** | Stripe (and others) inside the document; amount *"calculated automatically from pricing tables"* or fixed; one-time, recurring, instalments (<https://support.pandadoc.com/en/articles/9714942-stripe-checkout-payments>). Better Proposals: *"Once accepted, they're prompted to pay your deposit"* (search result, Better Proposals marketing) | PandaDoc **Business**; Better Proposals all ("Payment integrations"); Qwilr (QwilrPay); DocuSign **Business Pro** (third-party summary, <https://www.pandadoc.com/blog/docusign-pricing/>); HubSpot | **Yes** | **No in year one** *(judgement)* — deposits are `docs/LATER.md` line 6, and the ACL bars taking payment the dealer knows it cannot deliver against in the time stated (§5.3) |
| 15 | **CRM sync** | Push status and values to HubSpot / Salesforce / Pipedrive | PandaDoc **Business**; Qwilr Starter (HubSpot, Pipedrive, Zoho), Salesforce only on Scale; Proposify Team+ | Yes | **Unknown** — depends on what CRM Northside uses (§8) |
| 16 | **Approval-free "deal room"** | One link holding proposal, contract, video, chat, mutual plan (GetAccept, <https://www.getaccept.com/product/sales-engagement>; PandaDoc "Rooms", Business: *"up to 3 rooms"*) | GetAccept; PandaDoc | Yes | **No** — enterprise B2B buying-committee tooling |
| 17 | **Video in the document** | GetAccept personal video; Proposify *"videos can increase closing rates by 41%"* (*vendor claim*, 2021, 1,026,891 proposals, <https://www.proposify.com/blog/proposal-structure-tips>); CitNOW for Australian car dealers, *"43% of car buyers"* more likely to buy after a personal video (*vendor claim*, <https://www.citnow.com/products/sales/>) | GetAccept; PandaDoc (embedded video, all tiers) | Yes (hosting video) | **Maybe later** — a walkaround of *the actual boat* is honest; a stock clip is not |

**Price context, not a recommendation.** Published list prices, USD, annual billing, two seats: PandaDoc Business **$49 × 2 × 12 = $1,176/yr** (`market/pandadoc-pricing`); Qwilr Starter $35 × 2 × 12 = $840/yr (<https://qwilr.com/pricing/>); Proposify Team $41 × 2 × 12 = $984/yr, Basic has a 10-sends/month cap (<https://www.proposify.com/pricing>); Better Proposals Premium $29 × 2 × 12 = $696/yr with a 50-sends/month cap (<https://betterproposals.io/pricing> — the fetched page's monthly/annual labels looked swapped on Starter; read it before quoting it). None of these tools reads a boat price file, a fitment rule or a price ladder; each one's quote is typed or pulled from a CRM product list.

---

## 3. What the peers teach, tool by tool

### 3.1 PandaDoc — the quote is one page; the proposal is the long thing
`market/pandadoc-sales-quote-template` (the public *Sales Quote Template*, "Used 4,872 times") is **a single A4 page**: a dark header band with the sender's mark and address; `Sales Quote` and `[Document.CreatedDate]`; `Quote No.` / `Exp. Date` left, `Prepared for` + client block right; a four-column table `NAME · PRICE · QTY · SUBTOTAL`; numbered terms that include how acceptance works — *"This quotation may be accepted to form a binding contract"* by signature and payment before the expiry date, or by purchase order; then a signature block (company, Name, Title, Signature, date). Every variable is a yellow `[Token.Name]`.
`market/pandadoc-boat-purchase-template` ("Used 4,992 times") is the other object — a US-shaped **contract**: cover (*Prepared for / Created by*), Parties, Boat Information (Make, Model, Year, **HIN**, Registration, Engine make/model/**serial**), Boat's Condition, Purchase Price and Payment, Title and Ownership (liens), Inspection and Acceptance, Remedies, Closing and Delivery, Governing Law. Its price clause says the price *"does not include any taxes, registration fees, or additional costs"* — **the opposite of the Australian single-price rule (§5.1)**, so it cannot be copied.
`market/pandadoc-pricing`: the capabilities the owner is likely picturing — pricing tables, collect payments, product catalogue, content library, custom branding, approval workflows, recipient analytics, auto-reminders, auto-expirations, CRM integrations, in-person signing — **all sit on Business ($49/seat/month annual)**; Starter ($19) has e-signatures, 5 templates, notifications and an audit trail but **no pricing tables**; smart content and CPQ are Enterprise.
The status vocabulary (<https://developers.pandadoc.com/reference/document-status>): draft · sent · viewed · waiting_approval · approved · rejected · waiting_pay · paid · completed · voided (*"expired and is no longer available"*) · declined · external_review · scheduled.

### 3.2 Qwilr — the quote as a web page with a pinned Accept
`market/qwilr-quote-template`: a cover (title, *"Prepared by [Your Name]"*), an **Accept** button pinned top-right with a first-visit tip *"How to sign & accept"*. The template's order: **Package summary — "What's Included" — before the price** (*"helps buyers quickly understand what they're getting … before they ever reach the price"*), then the dynamic quote block (plan cards, then a dark section band `Discovery & Strategy` over `Description · Item · Quantity · Price`), FAQ, Terms and Conditions with e-sign. Its "What's included?" list: Introduction · Pricing quote · Client testimonial · Contact us · Terms and conditions.

### 3.3 HubSpot and Salesforce — the fixed-slot composer is the enterprise norm
HubSpot's quote template modules, in order (<https://knowledge.hubspot.com/quotes/create-quote-templates>): **Header** (logo, reference, issue date, expiration date, currency, PO) · **Parties** (seller, buyer, billing contact) · **Cover letter** · **Executive summary** · **Summary** (effective date, term, total discount, total value) · **Line items** · **Terms** · **Payments** · **Acceptance** (*"E-signature … Print and sign … Accept without signature"*) · optional rich-text content sections. Custom templates need Revenue Hub **Professional/Enterprise**.
Salesforce CPQ template content types (*snippet*, Salesforce Help as quoted at <https://sfdcgym.com/blog/cpq/mastering-salesforce-cpq-quote-templates.html>): **HTML** (merge fields + formatted text), **Line Items** (columns from the template's Line Columns), **Quote Terms** (body text with Term Conditions deciding whether it appears), **Custom** (a Visualforce page), **Template Top** (address, logo) and **Template Bottom** (dates, notes, *"a place to sign"*); line items can be grouped by a field.
Both validate the plan's shape — a small vocabulary of slot types in a fixed order, some locked, conditional terms — rather than a free canvas.

### 3.4 Trades — the closest tools to a physical thing sold with options
- **ServiceM8 Proposals** (`market/servicem8-proposals`, 2024-03-08): three section types only — **Text Section · Materials Section · Gallery Section**; *Multiple Choice* (radio: *"different qualities, colours, styles or scopes"*), *Optional Extras* (checkboxes), a **subtotal per Materials section**, totals *inc GST*, a *View Online* link, and — in the pictured proposal — a bar pinned over the document carrying the phone number, the running total and **Accept**. Accepting an option *"restore[s] the job's billable items, price and description … to the version which was accepted, and add[s] a note to the Job Diary stating which quote option the client accepted"* (versions article above). **That is the honest shape for recipient choice: every option is a frozen version; the customer's pick is an event that names which version, not an edit.**
- **Tradify** (`market/tradify-quote-template`, <https://help.tradifyhq.com/hc/en-us/articles/17451474143257-Create-a-Quote-With-Options>, snippet): *"All items in an optional section form a single 'option'"*; the customer sees *"a subtotal of included items and selectable optional sections"* and clicks **Accept Quote**; line visibility can hide unit prices or quantities.
- **simPRO** (*snippet*, <https://helpguide.simprogroup.com/Content/Service-and-Enterprise/Managing-Optional-Quotes.htm>): optional cost centres are all-or-none, and *"Quotes with online acceptance are not available for quotes with optional cost centres"* — a mature vendor refusing the combination rather than half-supporting it.

### 3.5 Better Proposals, Proposify, GetAccept, Oneflow, DocuSign — one line each
- Better Proposals' covers are a full-bleed photograph, `yourlogo`, a title, *"Written by {{sender_first_name}} at {{brand_company_name}}"* and a START READING button (`market/betterproposals-quote-templates`). Its consent card has no refusal.
- Proposify's research (*vendor claim*, 1,026,891 proposals sent in 2021, <https://www.proposify.com/blog/proposal-structure-tips>): accepted proposals average **11 pages and 7 sections**; *"Proposals containing images increase closing rates by 72%"*; order Cover · Executive summary · Approach · About · Deliverables · Pricing · Terms. Its 2026 report (*vendor claim*, 742,137 proposals, <https://www.proposify.com/blog/sales-closing-statistics>): winning proposals viewed **2.5** times vs **3.5** for losing ones; pricing section read **7.72 minutes** on average; e-signed *"15% higher close rate and close 60% faster"*.
- GetAccept is a sales-engagement suite (video, chat, per-section analytics, deal rooms) aimed at B2B buying committees (`market/getaccept-proposal`).
- Oneflow's pitch is the opposite of a frozen quote: a contract that stays *"live and editable"* during negotiation, version-tracked (*snippet*, <https://oneflow.com/blog/pandadoc-review/>). **Not a model for an issued quote** — at most for a *draft*.
- DocuSign: templates with roles; payment collection and bulk send on **Business Pro** ($40/user/month annual, third-party summary <https://www.pandadoc.com/blog/docusign-pricing/>); DocuSign Gen builds documents from Salesforce/CPQ data with conditional "document rules" (<https://www.docusign.com/products/gen>).

---

## 4. The closest industries: what their customer actually holds

### 4.1 Cars
- **Porsche**: the configuration PDF is already the target in this repo — A4, a cover with the model and a *Price for equipment* row, section tables with **Standard Equipment** in place of $0.00, the code and page number on every page, and a *Select PDF content* modal where length is a control (`docs/research/refs/document/notes.md` lines 16–18, 32).
- **Tesla Australia** splits the priced object in two (*snippets* from Tesla's AU order agreement, <https://www.tesla.com/en_AU/order/download-order-agreement?redirect=no&country=AU&model_code=m3>): a **Vehicle Configuration** *"including pricing (excluding taxes and official or government fees)"* and a **Final Price Sheet**, issued near delivery, that *"will include taxes, on-road costs and official or governmental fees"*; plus Terms. The Order Fee *"is not a deposit"*.
- **Polestar Australia** (`market/polestar-configure-rejected`, consent refused): the rail carries **"Drive away price\*" $66,960.00**, a struck former price, **"Estimated delivery Dec 2026 – Feb 2027"**, `Get a quote` and `Continue`; a modal asks *"Select your state to get accurate pricing"* — drive-away depends on the state. Its FAQ (*snippet*, <https://www.polestar.com/au/support/faq/orders/>): you can *"download a PDF of this configuration"*; the final invoice carries the VIN, the options *"and all fees excluding and including VAT"*.
- **An Australian dealer's contract**, read whole: the MTA SA sample *Contract for the Sale of a New Vehicle* (<https://mtasant.com.au/uploads/products/16/SAMPLE%20MTA%20Print%20-%20S17%20New%20Car%20Contract.pdf>). One A4 page: customer block; dealer name/address/ABN; vehicle identity (make, model, body, engine no., VIN, chassis, **stock no.**, rego, body and trim colour); **Purchase details** left — *Cash price including GST · Additional options, accessories · Registration fee (months) · 3rd party compulsory insurance · Stamp duty and/or transfer fee · Delivery and handling fee · Comprehensive insurance · Other fees (full details required) · **TOTAL PAYABLE including GST***; right — *Deposit (receipt no.) · Trade-in allowance · Less pay-out · Equity · Total deposit and trade-in · **Balance payable on delivery***; an options schedule; trade-in details; a privacy clause; an odometer declaration; both signatures dated; and in capitals *"THIS IS A CONTRACT. SIGN IT ONLY IF YOU WISH TO BE LEGALLY BOUND BY IT."*

### 4.2 Caravans and RVs — the nearest Australian regulated analogue
- **Jayco** build & price has five stages — *Model · Floor Plan · Decor · Options · Summary* — and opens behind *"ENTER YOUR LOCATION … so we can provide you with location specific pricing"* (`market/jayco-build-price`; nothing was typed). Its drive-away price *"includes all on-road costs including dealer delivery, stamp duty, CTP insurance, registration and weight tax if applicable"*; its disclaimers include *"Any optional extras you select may increase the applicable taxes and charges"* and *"Weights and dimensional data are a guide only"* (<https://www.jayco.com.au/build-price/jayco-starcraft-caravan>).
- **The ACCC's *New caravan retailing* report** (July 2022, <https://www.accc.gov.au/system/files/22-33RPT_New%20caravan%20retailing_FA.pdf>; page numbers below are the report's printed ones), from 2,270 buyers of new caravans: **29%** said a representation made during the sale turned out to be inaccurate (p. 5); of those, **47%** about warranties, **14%** tow weight, **11%** goods not matching the description — *"design plans or appliance upgrades which they had previously agreed to were ignored, or that items were simply left off"* (pp. 17, 20); **27%** said the order changed between sale and delivery (p. 14). The ACCC's asks of suppliers: *"be upfront at the point of sale about the timeframe for delivery"* (p. 1); advertise weight *"stating explicitly what is and is not included"* (p. 20); never suggest consumer guarantees *"are limited to any warranty period"* (p. 1); and ACL s36 — a business *"must not accept payment for goods"* it knows it cannot supply in the time indicated (p. 13). The report says its findings apply to *"other RVs"* too (p. 6).
- **US RV buyer's orders** (*context*, owner forums, e.g. <https://www.bishs.com/blog/avoid-rv-hidden-fees/>): the complaint is fees (doc, prep, PDI, freight) added on the sales order after an agreed figure; the advice is to negotiate *"an all in out the door price"*.

### 4.3 Boats
- **A Brisbane dealer's package page** (`market/brismarine-package`): *Quintrex 2024 520 Top Ender Boat Package*, **$53,900.00** over a struck **$56,990.00**, `-5%`, *MAKE AN OFFER!*, *"Includes full factory warranty on boat & motor!"*, Zip finance, `Add to cart`; the description is three label–value blocks — **Boat Details** (make, model, year, length 5.49 m, width 2.2 m, dry weight 513 kg, hull, passengers, steering, stock number), **Engine Details** (Mercury, 115 hp, fuel 95, outboard), **Trailer Details** (*"Quintrex T Alloy 1400 ATM S 13" Skid Braked"*). **The price carries no qualifier** — neither drive-away nor "plus on-road".
- **The trade's word is BMT** — boat, motor, trailer — as a package (`market/brismarine-package`; Stacer "BMT PKG" listings at <https://www.sunstatemarine.com.au/brand/stacer/>).
- **Builders hand the price to the dealer.** Quintrex's *Build My Boat* (`market/quintrex-build`, "Powered by Pegboard7") opens on a model grid; a third-party write-up says *"your design heads straight to a local dealer who gets in touch with a quote"* (*context*, <https://izzyshooked.wordpress.com/2025/11/11/quintrex-build-my-boat/>). Boston Whaler's summary lets a buyer *"email or print your summary … or submit your configuration to a dealer"* (*snippet*, <https://www.bostonwhaler.com/build-and-price.html>); the page opened behind a five-field newsletter modal (`market/whaler-build-and-price`).
- **The industry contract** — the BIA gives members *"legally-drafted, standard agreements"* for *"new boat sales, used boat sales, consignment sales"*, prepared for *"full compliance with Australian Consumer Law"* (<https://bia.org.au/programs-products-services/products/>). Member-only; not seen.
- **Dealer systems** (Lightspeed, DockMaster, Ideal) sell deal desking, F&I and e-signature inside a DMS (<https://www.lightspeeddms.com/industries/marine/>); no public example of a customer-facing boat quote from any of them was found.
- **Northside Marine's own public face** (search results only; its pages returned 403): it names Axis, Bayliner, Malibu, Stabicraft, Stacer, Surtees, Whittley and Yamaha (<https://www.northsidemarine.com.au/>), and Yamaha's dealer locator lists both *Northside Marine* and *Northside Marine Coomera* (<https://www.yamaha-motor.com.au/find-a-dealer/australia/northside-marine-coomera>) — which bears on the "single location" premise (§8).

---

## 5. Australian rules that shape the paper

### 5.1 One total, including GST and unavoidable charges — decisive
The ACCC: businesses must show *"the total price … as a single figure. This price must be the minimum total cost"*, including *"taxes, duties and unavoidable or pre-selected extra fees"*; where a part-price is shown, *"the total price must be at least as prominent"*; optional charges not pre-selected and unquantifiable charges may be left out (<https://www.accc.gov.au/consumers/pricing/price-displays>; ACL s48). **The cover's figure is the GST-inclusive total of everything the dealer has put on the quote, and it is the largest figure on the page** — Polestar's *Drive away price\** and the MTA contract's *TOTAL PAYABLE including GST* are this rule drawn. A US template's "price excludes taxes and registration" is not usable here (§3.1).

### 5.2 A quote is binding on acceptance; an estimate is not
*"acceptance of the quote by the buyer will constitute a legally binding agreement"*, where an estimate is *"an educated guess"* (NT Consumer Affairs fact sheet, *snippet*, <https://consumeraffairs.nt.gov.au/_resources/documents/for-consumers/contracts/quotes-and-estimates.pdf>). PandaDoc's own quote prints this in its terms (§3.1). So the document should say which it is, and — if it is a quote — until when.

### 5.3 Electronic signatures in Queensland
*Electronic Transactions (Queensland) Act 2001* s14(1): a method that identifies the person and their intention; reliable *"as appropriate for the purposes"*; and the recipient's consent to that method (Crown Law, <https://www.crownlaw.qld.gov.au/resources/publications/please-sign-electronically-2.0>); for contracts *"the answer is often 'yes'"*. Typed-name click-to-sign platforms are described as meeting it when those three hold. An in-person signature on the dealer's tablet would need the same three recorded (*inference*).

### 5.4 Warranty sentences and descriptions
Consumer guarantees *"apply regardless of any warranty"*, a contract term limiting them *"will be void"*, and goods must *"match the salesperson's description"* (ACL ss 54–64, ACCC report pp. 4, 9). **A frozen, itemised, issued quote is the dealer's evidence of the description** — the ACCC's 11% "items left off" complaint is exactly what it protects against. A dealer's warranty paragraph must not read as the limit of the customer's rights.

---

## 6. The anatomy of a quote that looks the part

Composed from the sources above; every element names where it comes from. Pages are A4. Brackets mark what HL_2.0's document has today (`src/screens/document/Document.tsx`; atoms in order at lines 703–795: cover → per-table sections → typed lines → adjustments → arithmetic → how to read → terms → record).

**Page 1 — Cover (the part that "looks the part").**
- Letterhead: the dealership's mark, or its name in type when no mark is held — Better Proposals' `yourlogo` slot; *[has: `NO_LETTERHEAD`, line 103]*.
- **The boat** — a picture of the exact model, as a band not a bleed (measured in `document/notes.md` §6); Porsche's side elevation; Better Proposals' full-bleed photo. *[has]*
- Model name, large (Porsche ~4× row text).
- `Quote` · reference · **date issued · valid until** — PandaDoc `Quote No.` / `Exp. Date`; HubSpot header; §5.2. *[has the reference and issue date; **lacks a validity date** — correctly refuses to invent one, `NO_TERMS` line 99]*
- Prepared **for** (customer) and **by** (salesperson) — PandaDoc *Prepared for*, Qwilr *Prepared by*. *[has `preparedBy` in the record]*
- **One total, GST-inclusive, with its qualifier** — the largest figure, *"at least as prominent"* as any part (§5.1); Polestar's *Drive away price\**; Porsche's *Price for equipment*. *[has the figure with its rung]*
- One line of **what's included** — Qwilr puts *"What's Included"* before the price.

**Page 2 — Summary: the package and the money.**
- Three identity blocks — **Boat · Engine · Trailer** — each with the facts the price file carries (length, beam, weight, max hp, trailer ATM, stock no. when a unit is allocated) — Brisbane Marine's three blocks; MTA's vehicle identity row; PandaDoc boat template's HIN and engine serial (only once a unit exists — LATER's stock allocation).
- The money ladder, top to bottom — package · options subtotal · each on-road or dealer charge by name · adjustments · **Total inc GST** — the MTA *Purchase details* column; Tesla's configuration vs final price sheet. Only lines the file or the salesperson put there; nothing estimated. *[has the arithmetic atom]*
- Where the file carries them, weights with what they include — ACCC p. 20.

**Pages 3 – n — The configuration, itemised.**
- Section tables with a band head carrying count and subtotal — Qwilr's band, ServiceM8's per-section subtotal, Porsche's category column. *[has]*
- **Included** rather than $0.00 — Porsche's *Standard Equipment*. *[has]*
- Per-line thumbnail only where the picture is of that exact item. *[has, by rule]*

**Authored pages (Milestone 5, in the dealership's words, frozen at issue).** A note from the salesperson; why this dealership; after-sales — the original's seven authored slots (`docs/PLAN.md` line 239); Qwilr's testimonial and FAQ; HubSpot's cover letter. Proposify's vendor data says winners stay near 11 pages — a length budget, not a target.

**Last page — Terms and acceptance.**
- Validity; what the price includes and excludes; the delivery estimate *if the dealer states one* (ACCC p. 1); the warranty paragraph written so it does not limit consumer guarantees (§5.4); how acceptance works (PandaDoc's term 4). *[has a terms block; prints the dealership's typed terms verbatim]*
- **A signature block** — name, signature, date for the customer; the same for the dealership — PandaDoc sales quote; HubSpot *Print and sign*; MTA contract. *[**lacks**]*
- Whether this is a quote or a contract, said plainly — MTA's capitals.

**Every page — the running foot.** Reference left, `page n of m` right — Porsche's `Porsche Code` on every page. *[has]*

**What is NOT on a customer's quote in this trade, by these sources:** deposit receipts, trade-in payout arithmetic and balance-on-delivery belong to the **contract** (MTA's right-hand column; `docs/LATER.md` line 6) — a second frozen document, not the quote.

---

## 7. What static hosting allows before Milestone 6 *(inference, from the task's premise)*

**Works now, local-first:** templates and authored slots; tokens resolved at issue; the A4 print and the browser's save-as-PDF (`PRINT_IS_THE_PAGE`, line 92); a validity date and terms copied from the dealership's settings at issue; a **print-and-sign block** (HubSpot's method 2); in-person acceptance recorded on the dealer's own device (PandaDoc and Tradify both sell it) — if the owner wants it and the s14 elements are recorded; offering options as frozen alternative versions (ServiceM8's shape).
**Needs a server (Milestone 6 or a third party):** a link the customer opens; open/view tracking and reminders; remote e-signature; payment collection; CRM sync; approvals across devices.

---

## 8. Questions only the owner can answer

1. **"PandaDoc-like" — which part?** Rank: (a) a beautiful multi-page document, (b) templates in the dealership's words, (c) knowing when the customer opened it, (d) the customer signing, (e) the customer ticking optional extras, (f) taking a deposit.
2. **Where does the customer sign today** — in the showroom, or at home? On paper or a screen? (Decides print-and-sign / in-person vs a sent link.)
3. **Is Northside using PandaDoc, DocuSign or a DMS now**, and which CRM and email, if any?
4. **The cover figure:** drive-away / on-water, GST-inclusive? Which on-road items does Northside put on a quote (boat rego, trailer rego, safety gear, delivery/prep), and are they in the price file? Nothing will be estimated.
5. **Validity:** how many days, and in what sentence? Does a quote become a contract on signature, or is there a separate contract (the BIA new-boat agreement)? Can we see a blank?
6. **Options on the quote:** should the customer choose between alternatives (two engines, two trailers) on the document, or does the salesperson issue a new version?
7. **Delivery estimates and weights:** does the salesperson write a delivery window or a tow weight on quotes today?
8. **Tracking a private buyer:** is per-page reading time wanted, or only "opened"?
9. **Discount sign-off:** does the owner approve discounts above a threshold?
10. **Locations:** is *Northside Marine Coomera* (Yamaha dealer locator) a second site of this business?

---

## 9. Frames

Captured 2026-09-23, 1440 × 900 (full-page where noted). `opened` = rendered and looked at; only those are cited.

| frame | status | opened | URL | what it shows |
|---|---|---|---|---|
| `market/pandadoc-quote-feature` | ok — consent card with no refusal left open | yes | https://www.pandadoc.com/features/quote/ | Quote feature index: Pricing Table, Product Catalog |
| `market/pandadoc-sales-quote-template` | ok, full page | yes | https://www.pandadoc.com/sales-quote-template/ | the one-page sales quote with tokens and a signature block |
| `market/pandadoc-boat-purchase-template` | ok, full page | yes (first 4 of 6 slices) | https://www.pandadoc.com/boat-purchase-agreement-template/ | a US boat purchase agreement's sections |
| `market/pandadoc-pricing` | ok, full page | yes (first 4 of 7 slices) | https://www.pandadoc.com/pricing/ | tiers and the full feature matrix |
| `market/qwilr-quote-template` | ok, full page | yes (first 2 of 5 slices) | https://qwilr.com/templates/quote-template/ | cover, pinned Accept, What's Included, quote block, FAQ, terms |
| `market/proposify-quote-templates` | ok | — | https://www.proposify.com/quote-templates | gallery |
| `market/betterproposals-quote-templates` | ok — consent card with no refusal | yes | https://betterproposals.io/quote-templates/ | photo covers with `yourlogo` and tokens |
| `market/hubspot-quote-template-kb` | ok, full page (28,146 px) | — | https://knowledge.hubspot.com/quotes/create-quote-templates | module list (cited from the fetched text, not the frame) |
| `market/tradify-quote-template` | ok, full page | yes (first slice) | https://www.tradifyhq.com/quote-template | trade quote themes, optional line items |
| `market/servicem8-proposals` | ok, full page | yes (first 3 of 6 slices) | https://blog.servicem8.com/2024/03/send-beautiful-quotes-with-proposals/ | pinned total + Accept, Multiple Choice, Optional Extras, subtotals |
| `market/servicem8-quoting` | ok | yes | https://www.servicem8.com/features-quoting-invoicing | invoice with Sub-Total, GST, Total, Amount Paid |
| `market/getaccept-proposal` | ok | yes | https://www.getaccept.com/product/proposal-software | Create · Collaborate · Send · Get insights |
| `market/quintrex-build` | ok | yes | https://build.quintrex.com.au/ | model grid, "Powered by Pegboard7" |
| `market/jayco-build-price` | ok — **location wall**, nothing typed | yes | https://www.jayco.com.au/build-price/jayco-starcraft-caravan | five stages; postcode required for pricing |
| `market/brismarine-package` | ok, full page | yes | https://www.brismarine.com.au/product/quintrex-2024-520-top-ender-boat-package/ | a Brisbane BMT package page |
| `market/whaler-build-and-price` | ok — **newsletter modal**, nothing typed | yes | https://www.bostonwhaler.com/build-and-price.html | personal data asked before the build |
| `market/polestar-configure` | ok — consent card over the page | yes | https://www.polestar.com/au/configure/polestar-2 | superseded by the next frame |
| `market/polestar-configure-rejected` | ok — **Reject All** pressed | yes | same | drive-away price, estimated delivery, state selector |
| `market/oneflow-contract` | ok | — | https://oneflow.com/ | home |

**Two PDFs read whole** (fetched as text, not photographed): the MTA SA sample new-vehicle contract and the ACCC's *New caravan retailing* report — URLs in §4.1 and §4.2.

**Failed or blocked fetches, recorded not filled in:** Tesla's AU order agreement (403 — cited from search text only); brismarine.com.au via fetch (403 — the frame is the source); northsidemarine.com.au (403); the WA and NT quote/estimate guidance pages (403 — snippet only); the Salesforce CPQ help pages (rendered empty — snippet only); simPRO's help page (rendered empty — snippet only); PandaDoc's site intermittently 429 to fetches (the frames are the source).
