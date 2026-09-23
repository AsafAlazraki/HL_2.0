# The proposal: what you asked for, what exists, and what to build

For Asaf. Written 2026-09-23 from five readers' evidence: your own words, the original HelmLogic's code, every research sweep in this repository, the document HL_2.0 prints today, and a sweep of PandaDoc and its peers. A challenger then checked the first draft against its sources, and this is the corrected version. About ten minutes to read.

**How the sources read.**
- A path with a line number is a file in this repository, unless it starts `HelmLogic/` (your original app, `C:\Users\Asaf\dev\HelmLogic`) or `Playground/` (`C:\Users\Asaf\dev\HL_Playground`).
- "Your message, date time" is something you typed. It is taken from the session record named (`854574d4`, `fa584a7e` or `a40aaf14` under `C:\Users\Asaf\.claude\projects\`) and quoted with your spelling.
- `market.md` is `docs/research/refs/proposal/market.md`, today's sweep of PandaDoc and its peers.
- **Checked** means it was re-verified by hand today. *Inference* means it is reasoned rather than read. *Judgement* means it is my call and yours to overrule.

---

## In one paragraph

Today you asked for "more analysis on what is going on with what i want re the pandadoc like functionality and all of that", and said you are "really keen on being able to get a quote out properly where it looks the part" (your message, 2026-09-23 05:15 UTC, checked). An hour later you added that "this is a northside marine app" and "simple wins" (06:51 UTC).

**What "PandaDoc-like" most likely means.** Your earlier words point to your original HelmLogic's document editor plus a beautiful PDF: sections in a fixed order, some of them in the dealership's own words. You coined the term for "the pandadoc editing style thing" in the original (2026-09-14). Today's sentence is wider ("and all of that"). Whether you also mean PandaDoc's send, track and sign loop is question 1, and nothing below assumes the answer.

**How a quote leaves the building, for now.** Your end goal says it: "the output can be sent to a customer after downloaded" (05:48 UTC). A static site can do that properly today, and HL_2.0's document engine is the right engine for it.

**The paper is not yet a quotation Northside would be proud of:**
- the app's navigation bar prints across every page;
- page one says "This business has not been named yet";
- the paper explains the app to the customer;
- there is no address, valid-until date, GST amount, terms or signature block;
- Mark McWilliams' own field-test boat comes to $73,594 in HL_2.0, against the $103,731 his Display Sheet matched to the dollar.

**What I recommend:**
1. **Phase 0.** Fix the paper, in a step of its own, in the next round to run.
2. **Phase 1.** A quote that looks the part. The letterhead comes from Milestone 4's settings. The paper itself becomes a new first track in Milestone 5, "the proposal".
3. **Phase 2.** Acceptance at the desk, only if you want it and Northside supplies the wording.
4. **After Milestone 6.** Everything that needs a link the customer opens on their own phone.

---

## 1. What you asked for, in your own words

| when (UTC) | what you said | where |
|---|---|---|
| 2026-03-09 | "I don't want these called blueprints they are document templates also I…" (a free-form page builder with page delete, drag and drop, text styles and a colour picker; the messages are cut off at the source) | GitHub `AsafAlazraki/HelmLogic` commits 9174a1b, 895140a, 847fb64, f603f84, 3825991 |
| 2026-09-14 | "…things like the pandadoc editing style thing and how that works" (about the original HelmLogic) | queued message, session `fa584a7e` (checked) |
| 2026-09-14 22:24 | "I don't like the walls of text and things" (said of the configurator) | session `a40aaf14` |
| 2026-09-14 23:38 | "Now do the same Porsche treatment on the quote document and go find a porsche document itself and make it perfect like theirs" | session `a40aaf14` |
| 2026-09-16 04:18 | "…the user management and organisation stuff and the quote templates and whatnot" | session `854574d4`; became `docs/PLAN.md:16` |
| 2026-09-17 05:11 | "go for what u think is awesome and built literallyu everything please before i review it" | session `854574d4` (checked) |
| 2026-09-17 05:32 | "where is the app open so i can see it in currenbt state" | session `854574d4` (checked) |
| 2026-09-23 05:15 | "PLEASE add final step to use github natuive hosting to host this so we can send for others to review. reminder it should work perfgectly. also keen to use opus 5.5 now to do more analysis on what is going on with what i want re the pandadoc like functionality and all of that. having another look at all the research that was done as well and brinignig learnings in. also really keen on being able to get a quote out properly where it looks the part. Also if images are missing go and get them and store them" | session `854574d4` (checked) |
| 2026-09-23 05:48 | "let me tell u the end goal. when yiou are done, i need to be abkle to give the app to stakeholders and have no ui and ux errors and do a full quote that is good enouigh experience to do so sitting with a customer and it is beautiful and so confugurable in the bakcend and the output can be sent to a customer after downloaded and things and be so beautiful etc" | session `854574d4` (checked) |
| 2026-09-23 05:49 | "but all of it has to be built before we get there!" | queued, session `854574d4` (checked) |
| 2026-09-23 06:51 | "also this is a northside marine app yueah so we can remove the unecessary stuff that is like for anyone that isn't northside marine. remember also simple wins. this app is complex topics made beauitful" | session `854574d4` (checked) |

**What those words tell us, and what they leave open.**
- **"PandaDoc-like" most likely means your original's editor.** You coined the word for "the pandadoc editing style thing" in HelmLogic. The research you asked for found that editor "is not a free-form block canvas like PandaDoc. It is a fixed-slot document composer" (`docs/reference/helmlogic-original.md:34-37`). Today's "and all of that" may reach further, so it stays question 1.
- **"Get a quote out" is a PDF the salesperson downloads and sends.** That is your 05:48 wording.
- **"Send for others to review" means the site's link, and "stakeholders" says who gets it.** Your 05:15 and 05:48 messages say both. Which people that means is question 13.
- **"So configurable in the backend" means Northside changes what the quote says without a developer.** That is the composer and Northside's settings. Whether it reaches the layout is question 14.
- **"Walls of text" and "simple wins" both weigh against a long quote with many switches.** This shapes Phase 1: written blocks are short and optional, and every extra switch waits for your yes.
- **It is Northside's app.** Nothing below is built for another dealership.
- **There is no record of your verdict on HL_2.0's document.** The builder chose its direction under your handover, and it is marked provisional (`docs/SCREENS.md:12`). You asked where to see the app on 2026-09-17, and no reaction to the document follows in the record.

**What your dealership asked for.**
- **Mark McWilliams, 8 June 2026:** "an accurate and audited quote, fully complete and beautiful from HelmLogic". His first check was "Proposal formed correctly — all sections present, customer's name in the right places" (`HelmLogic/tasks/RELEASE_NOTES_v1.11.0.md:11`; `HelmLogic/tasks/bm-email-checklist.md:3,7`).
- **Mark's field test, July 2026:** the original's PDF matched Northside's Display Sheet on every line of an SP560, at $103,731 (`HelmLogic/tasks/RELEASE_NOTES_v1.32.0.md:14-26`).
- **The boat-show spec behind the branded PDF (story 1.2.1):** a "professional customer-ready quote" presenting the boat "as a premium ownership experience". It asked for seven written blocks and a visual summary of the configured boat, and said "No system IDs or SKU codes are visible" (`HelmLogic/scripts/seed-mvp-plan.ts:136, 232-246`; the SKU line is 243).
- **Bill Hull's asks on the PDF:**
  - name Northside Marine, never "Dealer";
  - give Factory Options their own heading;
  - let him drag sections into a new order;
  - explain dealer accessories against fit-up and rigging.

  Sources: `HelmLogic/src/components/proposal-pdf.tsx:516, 546`; `pdf-section-list.tsx:169`; `tasks/RELEASE_NOTES_v1.33.0.md:67-70`.
- **Field asks in v1.16** (who submitted them is not recorded):
  - larger logos and larger pictures on the PDF;
  - a per-quote switch to hide option prices.

  Source: `HelmLogic/tasks/RELEASE_NOTES_v1.16.0.md:30-31, 55-60`.

**Your own settled calls.**
- **Fit-up and rigging on the customer's PDF is one summary line** (May 2026, with Mark). The itemised breakdown stays on "Internal salesman view (quote detail page) … for margin / diagnosis. Separate render, not a per-org toggle" (`HelmLogic/tasks/v1.7-planning-restructure-status.md:45, 63-66`). That staff view was a screen, not a printed copy.
- **Brand captains own "how the brand reads on a customer's quote"** (`HelmLogic/tasks/EMAIL_release_update.html:23`).
- **Photographs on a quote must be genuine, human-reviewed and held in our own storage** (the same email, its "Also planned" paragraph).
- **Email goes through SendGrid.** "We're going with SendGrid, not Office 365 … this isn't an open question" (`HelmLogic/tasks/EMAIL_where_to_from_here.md:25`).
- **Still undecided, by the same emails:** the e-signature approach, the cooling-off text for each state, and which states Northside operates in (`EMAIL_where_to_from_here.md:18, 62`; `EMAIL_pre-release_strategy.md:21`). Both emails were drafted in Claude sessions and signed "Asaf". HL_2.0 must not choose a signing provider or write terms for you.

---

## 2. The original HelmLogic: what Bill and Mark used, and what was broken

**What was used.**
- **The Template Studio.** Eleven sections in a fixed order. Four were computed by the app (cover, vessel configuration, pricing, signatures). Seven were written by the dealership: salesperson message, why choose us, brand and model story, after-sales, finance and insurance, value summary, and terms. It had an admin lock, copy per brand and per quote, a version on every save, and a side-by-side preview. Sources: `HelmLogic/src/lib/pdf-structure.ts:96-123`; `content-blocks.ts:37-116`; `content-block-detail.tsx:456-664`.
- **Written copy was printed.** The original's own proof PDF carries a salesperson letter over Bill Hull's name (`HelmLogic/tasks/test-evidence/ffr33-sp560-proof/SP560-display-sheet-proof.pdf`, page 2, checked). Staff field reports say a written Finance and Insurance block broke in the customer PDF: first as "weird control codes", then as literal `<p>` tags (`HelmLogic/src/lib/tiptap-pdf.tsx:292`; `tasks/test-evidence/fail-fix-retest.json:95-96`). The record does not say who wrote that block, or whether a customer received a broken copy.
- **The cover.** A full-page photograph, both logos, the model name at 56 pt and the total at 44 pt (`proposal-pdf.tsx:779-937`).
- **Quotes most likely went out as PDFs the salesperson downloaded and emailed.** This is *inference*: sending from the app was switched off (`Playground/docs/audit/PARITY.md:243-251`).

**What was broken.** This list comes from the original's own code (reader 3). Three items were re-checked by hand today.
- **Nothing after "generate" ever ran.** Email sending sat behind a switch that was never set. A quote locked only when it was sent, so no quote ever locked. Every re-download re-read the prose, the salesperson's letter, the dates and the totals live (`HelmLogic/src/lib/email-send.ts:399-412`, checked as the only lock call; `finalize-quote-dialog.tsx:619-676`).
- **Its own proof PDF does not add up.** The Investment Summary lines sum to $99,336 against a printed total of $103,731. The hull line is before GST, and every other line includes it (proof PDF pages 3 and 6-7).
- **The "four-layer cascade" in our plan is not what it did.**
  - Block text resolved per quote → brand → organisation, and the per-quote layer was skipped when a block was locked.
  - Sub-headers had no brand layer, and styles were set at organisation level only.
  - Only the terms had a fourth layer, and it was hard-coded: four terms nobody at Northside wrote, which the proof prints as its page 8 (`HelmLogic/src/lib/content-blocks.ts:59-65, 248-312, 326-390`; `proposal-pdf.tsx:374-427`).
  - The salesperson's letter sat outside the cascade entirely, read live from the salesperson's profile (`render-quote-pdf.ts:88-107`).

  `docs/PLAN.md:239` and `:252`, the templates brief in `.claude/workflows/hl2-m5.js` and `.claude/workflows/README.md` still say "four-layer". HL_2.0's own organisation type says "There is no brand layer: nothing in this app holds content at a brand" (`src/domain/model/project.ts`, the `quoteTerms` note). Your brand-captains email is the reason to build one.
- **The preview ran on an invented customer, "James Thompson", with invented prices** (`HelmLogic/src/lib/sample-quote-fixture.ts:213`, checked). It also took different inputs from the real PDF: no brand copy, no styles, and the current user's letter instead of the quote creator's (`content-blocks-pdf-preview.tsx`).
- **Bill's drag-to-reorder moved the preview only.** The customer's PDF kept the old order (`render-quote-pdf.ts:204-213`).
- **"Hide option prices" met a real need dishonestly.** Charged items printed as INCLUDED while the total still charged for them (`RELEASE_NOTES_v1.16.0.md:59`; `proposal-pdf.tsx:555-558`). Fit-up with no sell price fell back to cost (`quote-financials.ts:60-64`).
- **The public signing page was for change orders, not quotes, and nothing could reach it.** Its tokens came from `Math.random` (`quote-variation.ts:115`). Any anonymous visitor could read every dealer's change orders (`firestore.rules:223-232`). `docs/LATER.md:12` and `docs/PLAN.md:300` still call it "well built", and both should be corrected (`briefs.md` §9).
- **Validity had three unconnected sources.** The PDF hard-coded 30 days (`proposal-pdf.tsx:501-502`).
- **The salutation guessed a first name.** It took the first word of the customer field, so the proof reads "Dear SP560," (proof page 2, checked; `proposal-pdf.tsx:318-331`).
- **Your software's brand was on the dealer's paper.** The proof's last page reads "© 2026 HelmLogic" (page 9, checked; `proposal-pdf.tsx:1446-1448`).

**The lesson** *(judgement)*.
- **Take:** the composer's shape, the admin lock, per-brand copy, versions, restore-as-new-version, and Mark's bar.
- **Design fresh:** everything after "generate".
- **Never:** a preview on invented data, boilerplate at the bottom of the cascade, or a charged item printed as INCLUDED.

---

## 3. PandaDoc and its peers, and what Northside would use in year one

**The sweep.** It covered:
- **proposal tools:** PandaDoc, Qwilr, HubSpot, Salesforce, Proposify, Better Proposals, GetAccept, Oneflow and DocuSign;
- **trade quoting:** ServiceM8, Tradify and simPRO;
- **cars and caravans:** Porsche, Tesla, Polestar, an Australian new-vehicle contract and Jayco;
- **the regulator and the local market:** the ACCC and Brisbane boat dealers.

It ran 54 searches and 46 page fetches, and captured 19 frames (`market.md`, Method).

**The finding that frames the rest.** The market leaders seal a document once it is sent, just as HL_2.0 fixes an issued quote.
- Once PandaDoc sends a document, "No further document edits can occur except for document recipient(s) filling out or signing". Editing it sends it back to draft and erases the signatures.
- An accepted Qwilr page cannot be edited.
- ServiceM8 snapshots every quote version.

Sources are in `market.md` §1, with their URLs. So "PandaDoc-like" never requires loosening HL_2.0's rule that an issued quote does not change.

| capability | year one at Northside *(judgement)* | works on a static site? | source |
|---|---|---|---|
| Templates in the dealership's own words | **Yes.** This is Milestone 5. | Yes | `market.md` §2 rows 1-2 |
| Different copy per brand (a Highfield paragraph only on Highfield quotes) | **Yes.** The brand layer, written by whoever you name for each brand. | Yes | §2 row 3 |
| A beautiful multi-page document with pictures | **Yes.** This is what "looks the part" means. | Yes | §6 |
| Print and sign (signature lines on the paper) | **Yes, now** | Yes | §2 row 10 (HubSpot) |
| Signing on the dealer's tablet in the showroom | **Worth asking you** (question 3) | **Only in the browser that raised the quote**, until Milestone 6 | §2 row 9 (PandaDoc, Tradify) |
| A "valid until" date | **Yes**, once Northside types the number of days | Yes (shown, and checked in the dealer's own browser) | §2 row 13 |
| The customer ticks optional extras | Maybe. Better as fixed alternatives (Option A / Option B). | Only as separate versions | §2 row 6; §3.4 (ServiceM8) |
| Internal sign-off on discounts | Unlikely with two salespeople | Needs a server across people | §2 row 7 |
| Sending, and knowing when it was opened | Not before Milestone 6 | **No** | §2 row 11 |
| Automatic reminders | Later | **No** | §2 row 12 |
| Remote e-signature | Later, after Northside chooses a provider | **No** | §2 row 8 |
| Taking a deposit in the document | Not in year one | **No** | §2 row 14; §5.3 |
| CRM sync, deal rooms, video | Not in year one | **No** | §2 rows 15-17 |

**Price context, not a recommendation.** The PandaDoc features you are likely picturing all sit on its Business plan, at US$49 per seat per month billed annually. For two seats that is **US$1,176 a year**. The plan covers pricing tables, payments, a content library, tracking, reminders, expiry and in-person signing. None of these tools reads a boat price file, a fitment rule or a price ladder (`market.md` §2 price context; §3.1).

**Australian rules that shape the paper** (`market.md` §5):
- **One total, including GST and every charge the buyer cannot avoid.** The ACCC's rule is that the total "must be at least as prominent" as any part-price (ACL s48). Making it the largest figure on the page is a design choice on top of the rule *(judgement)*.
- **An accepted quote may be binding.** This comes from an NT Consumer Affairs fact sheet seen only as a search-result snippet; its page returned 403 (`market.md` §5.2 and "Failed or blocked fetches"). The paper should say it is a quote, and until when.
- **An electronic signature in Queensland** meets s14(1) of the Electronic Transactions (Queensland) Act 2001 under three conditions:
  - a method that identifies the signer and shows their intention;
  - a method reliable enough for the purpose;
  - the consent of the person the signature is given to, which is the dealership, not the customer.

  Source: Crown Law, via `market.md` §5.3. Asking the customer to tick "I agree to sign electronically" is good practice *(judgement)*, but it is not the s14 condition.
- **A warranty paragraph must not read as limiting the buyer's consumer guarantees.**
- **Items left off matter.** In the ACCC's survey of new-caravan buyers, 29% reported an inaccurate representation. Of those, 11% said the goods did not match the description, including agreed items that were left off (`market.md` §4.2). A fixed, itemised quote is the dealer's evidence against that.

---

## 4. HL_2.0's document today, page by page

**What was read.**
- **The latest real print:** `e2e/out/document-Lb7JK_gGkY.pdf`, three A4 pages for a Highfield SP660, printed by `e2e/flows/document.spec.ts` at 15:15 today. Its text was re-read with poppler's `pdftotext`.
- **Three quotes run through the app's own engine on the real file:** the golden Stacer 529 Assault Pro (Tournament), a Highfield SP560 (PVC), and the SP560 (HYP) LG-W-WB Mark field-tested. A scratch script did this; nothing in the repository changed.

**Page 1, the cover.**
- **The app's navigation bar prints across the top of every page:** `‹ Home Quotes 0 Customers Data History Find Ctrl K` (checked).
  - The bar is fixed in place and has no print rule (`src/screens/shell/shell.css:125-139`).
  - The document hides only its own controls (`src/screens/document/document.css:1183-1189`).
  - Its print test counts pages and nothing else (`e2e/flows/document.spec.ts:339-365`).
- **The letterhead reads "This business has not been named yet"** (`src/screens/document/Document.tsx:879`), although the price file names Northside Marine (`data/northside/manifest.json`, `name`). The close-out round running now has this in its brief.
- **This SP660 has no photograph.** A pale band carries the Highfield wordmark instead.
- **The title is the file's raw label, "Highfield - SP660 (PVC) W-W-WB".** The app can already read W-W-WB as White / White / White/Blue (`src/domain/quote/colourway.ts`).
- **Specs have no units:** "OA Length 6.52", "Beam 2.59".
- **Under the total it says "One line below carries no price at this level".** That is the dealer's vocabulary.

**Page 2, the configuration.**
- **01 Hull, 02 Motor and 03 Trailer each carry their subtotal.** That is good.
- **A Code column prints on every line** ("HBS145", "GFAB Highfield SP660 Series"). The code is in `Document.tsx:1066, 1111`. The dealership's own spec says no SKU codes (`HelmLogic/scripts/seed-mvp-plan.ts:243`).
- **Workshop facts print under the motor:** "Engine Hole TBA · Slot 1 · Prop Part No. 68F-459xx-xx".
- **Two trailers are on this quote**, at $24,723 and $12,643. The quote-starter brings the starred row of every trailer table (`src/domain/quote/freeze.ts:545-547`, checked).
- **It prints "Not taken. 4 rows were offered from Dealer Fit Packages…"** That is a count from the price file, shown to the customer.

**Page 3, the rest.**
- **The rigging kit reads "Not priced at this level" and "this register carries no price column at all".** The second part is untrue. The Rigging Kits table has Kit Sell Price, Sell Price and Install Retail Sell columns; it declares no price level. Dealer Fit Packages is the same: it has Act Sell and Sell columns and declares no level (`manifest.json` `priceLevels: []` for both `rig_kits` and `dealer_fit`; `entities.json`, checked). So any rigging kit, or any accessory the dealer fits (a fitted VHF radio, Act Sell $982, `Dealer Fit Module!R12`), prints "Not priced".
- **A "How to read a line" glossary** points at "the level below", which is no longer printed.
- **A paragraph on tax** ends "nobody has typed one".
- **"No terms are printed, because this business has not typed any."**
- **"…so the file can be reimported twice and nothing here moves."**

**Missing entirely:**
- the dealership's address, phone, ABN and mark, and the salesperson's contact details;
- a valid-until date;
- a GST amount;
- a signature block;
- "what happens next";
- what comes standard with the boat;
- any picture beside a line.

**No screen can add the money adjustments yet.** That covers a discount, a trade-in, a typed line, terms, a tax rate and a quantity. The engine has every one of those commands (`src/domain/quote/commands.ts`). A search today found none of `addAdjustment`, `setNote`, `setTaxRate`, `setPreparedBy`, `addFreeLine`, `setQty`, `setOverride` or `setLineLevel` in any screen, route or store (checked).

**Mark's own boat, run through HL_2.0 today.** His field test was an SP560 in Hypalon, Light Grey / White / White/Blue. Its lines on the Display Sheet, from `HelmLogic/tasks/RELEASE_NOTES_v1.32.0.md:26`:
- hull $48,350;
- pre-delivery tier $5,300;
- F90XB $17,643;
- rigging $3,110;
- prop $282;
- trailer $10,430;
- spare $760;
- registrations $250 and $283;
- eight option lines;
- total $103,731.

HL_2.0 starts that quote at $73,594 (checked, `Highfield - SP560 (HYP) LG-W-WB`):

| line | HL_2.0 | Mark's sheet | why it differs |
|---|---|---|---|
| Hull | **$48,350** | $48,350 | It matches (Cash, `Boat Module!R838`). |
| Trailer | **$10,713** | $10,430 + $283 | It matches (REDCO TA600-MOB, sell plus registration). |
| Motor | **$14,531** | $17,643 | Different columns of the same row. HL_2.0's Cash is the motor's "Sell Price". Mark's figure is "RRP + Freight Inc GST", which the pack carries but no price level declares (`mot_yamaha` columns `bf` and `bb`, `Motor Library!R82`). |
| Pre-delivery tier | — | $5,300 | PD tiers are on the Later list (`docs/PLAN.md:300`). |
| Rigging kit, prop | — | $3,110 + $282 | Rigging Kits declares no price level. The prop is a fact on the pairing, not a line. |
| Spare | — | $760 | Not traced in this analysis. |
| Boat registration | — | $250 | *Inference:* the $283 is the trailer's, which HL_2.0 carries, so the $250 is the boat's. Registration as a priced line is on `docs/LATER.md:8`. |
| Eight option lines | — | $17,323 (by subtraction) | Factory options are not packed. Their prices live in a Factory Options Module workbook that is not on this machine (`Playground/src/demos/northside.ts:136-142`; `C:\Users\Asaf\dev\mpf-workbooks` holds only the Motor, Parts, Rigging and Dealer Fit workbooks). |

So Mark's "accurate and audited" bar cannot be met today on his own boat. Question 16 asks how far HL_2.0 must go to meet it.

**What is right and must stay** (`docs/DECISIONS.md:124-130`; `src/screens/document/paginate.ts`):
- one set of nodes for screen and paper;
- figures fixed when picked;
- page breaks measured, not guessed;
- "Included" and "Not priced" as words, not colours;
- no cost anywhere;
- the document still renders with the price file gone.

The engine is the strongest thing here. The paper is the weakest.

**The picture facts that decide the cover** (checked by eye):
- **The 529's own picture** is a photograph on the water of the exact hull. It carries an **Evinrude** outboard, while the quote is for a Yamaha F90LB (`public/seed-images/529-assault-lifestyle-tiffs-7-1024x676-fbf66995.webp`, 1,024 × 676).
- **The Hypalon SP560's own picture** is a top-down studio render of that exact finish, with no outboard in it (`sp560-lg-w-wb-1-2560x1440-df501c48.webp`, held at 1,100 × 619).
- **The SP560 photograph on the water** (2,560 px, from Highfield's media library) shows a **Mercury 115**, and its ledger does not record the finish (`data/northside/heroes-ledger.json`, `highfield-sp560`).
- **The REDCO trailer's "picture" is the REDCO and TINKA logos**, which the automatic judge recorded as a "scene" (`data/northside/images.json`, `redco-tinka-logos-01.png`). An automatic verdict is not enough to put a picture on a customer's paper. It needs the human "this is that item" mark you promised the dealership.

**What the file holds for "what comes with your boat"** (measured today on the extracts the pack is built from):
- **Standard inclusions and factory options:** on **none** of the 862 boat rows in `Playground/tools/seed/extracts/b2_data.json`. The Boat Module workbook itself is not on this machine.
- **The deposit schedule:** on 823 rows. Mark's SP560, for example: 30% on a confirmed deal, 30% when it leaves the factory, 40% on handover.
- **Lead times:** on 821 rows (45 days for that SP560).
- **Trailer features:** on 230 trailer rows (`t1_data.json`).
- **HL_2.0's pack carries none of these today.**

**One latent risk.** The price file's "Warranty" level is built from landed cost: (landed less handling) × 1.01 × 1.1 (`docs/reference/MPF_GROUND_TRUTH.md:885`). On the Hypalon SP560 hull it is $32,166 against Cash $48,350. Milestone 3's guard refuses a level that lands on one of the file's cost columns (`.claude/workflows/hl2-m3.js`, the levels brief). But the Warranty column is not a cost column; it is computed from one, so that guard does not catch it. No screen can put it on a line yet. It must never reach a customer's paper.

---

## 5. The honest line: what works on a static site, and what needs Milestone 6

**Works properly on GitHub Pages today, local-first:**
- **A beautiful A4 quote,** printed or saved as a PDF from the browser, from the same page the dealer sees.
- **The PDF named for the quote,** not "HelmLogic.pdf".
- **The salesperson attaching that PDF to their own email.** The app can open their mail program with the subject filled in. Nothing is sent by the app.
- **Signature lines on the paper** for a wet-ink signature.
- **The customer accepting on the dealer's tablet at the desk,** recorded with the quote. **This works only when the quote was built in that tablet's browser.** A quote built on the desk laptop cannot be opened on the tablet before Milestone 6 (`Document.tsx:209-213`). The acceptance also lives only in that browser, so the saved PDF is the durable record.
- **Templates in Northside's words,** fixed onto each quote when it is issued.
- **A valid-until date,** and the dealer's own screen saying a quote has expired.
- **Alternatives** (two engines, two trailers) as separate fixed versions shown side by side.

**Needs the shared backend of Milestone 6, or a third party:**
- **A link the customer opens on their own phone.**
- **Knowing whether and when the customer opened it.**
- **Sending email from the app,** and automatic reminders (through SendGrid, as you decided).
- **Remote e-signature,** which also needs Northside's provider decision.
- **Taking a deposit or any payment.**
- **One quote opening on two computers,** including the desk laptop and the tablet.
- **Reviewers seeing your quotes,** which live in your browser.
- **The customer ticking extras on a hosted page.**

**For reviewers:** every visitor starts with an empty browser. A link to one of your quotes will say no quote is filed there (`Document.tsx:209-213`). Reviewers either walk a real SP560 themselves, typing their own name as the customer, or you send them a PDF you made.

---

## 6. The recommendation: four phases

### Phase 0: the paper stops embarrassing us

**Where it runs.** It is its own step, added at the end of `hl2-northside.js`, the next round to run. If that round has already launched, it goes at the start of `hl2-imagery.js` instead. The Milestone 2 close-out is already running. It loaded its own copy of its script at launch (`workflows/scripts/hl2-m2-close-wf_31b45040-71c.js` in this session's folder, 14:43), so text pasted into `.claude/workflows/hl2-m2-close.js` now reaches nothing. That round's document fixer already has the dealership's name and the "Milestone 6" wording in its brief (`hl2-m2-close.js:245-247`). Phase 0 checks what it and the Northside round left, then does the rest.

**What it does:**
- **Nothing of the app's navigation prints.** The print test reads the PDF's text with an extractor it names, as well as counting pages.
- **The app's words move off the paper and onto the dealer's note beside it:** the glossary, the tax paragraph, the reimport sentence, the offered-row counts and the workshop facts.
- **The false rigging-kit sentence is corrected.**
- **The customer's copy loses the Code column,** per the dealership's own spec. Question 8 can reverse it.
- **The title reads as a buyer would say it.** "529 Assault Pro (Tournament)" keeps its "(Tournament)", because that is the exact model. The SP560 reads "SP560 · Hypalon · Light Grey / White / White/Blue", decoding "HYP" as the original's field ask did (`HelmLogic/tasks/RELEASE_NOTES_v1.16.0.md`, ticket lXRbKtH8).
- **Save as PDF names the file:** "Northside Marine quote 20260923-01 – Stacer 529 Assault Pro (Tournament)".
- **The two-trailer quote-starter** goes to the fitment work in Milestone 3.

*Gives the salesperson* a PDF they can send without apologising. *Gives the customer* a clean document with Northside's name on it. Nothing moves off `docs/LATER.md`.

### Phase 1: a quote that looks the part

**Where it runs.**
- **Milestone 3** (levels) makes the prices honest:
  - the Warranty level never reaches a customer;
  - the dealer declares the price columns of Rigging Kits and Dealer Fit Packages;
  - you see both motor columns and choose (question 16).
- **Milestone 4** builds Northside's settings and the people, and teaches the packer the bands the extracts hold.
- **The paper itself** becomes a new track, "the proposal", at the start of Milestone 5. It is built alone and first, because templates write into it.

**What it builds:**
- **Letterhead and contact panel.**
  - Northside's mark in dark ink, at the size the v1.16 field ask chose.
  - The legal and trading name, ABN, address, phone, email and website.
  - The salesperson's name, phone and email.
  - All of these are typed once in `/manage`, or imported from the original HelmLogic's records with provenance on your yes (question 4), and fixed onto each quote when it is issued. Nothing prints until it is typed or accepted.
- **Cover.**
  - The row's own held picture, with an honest caption where the outboard differs.
  - The model, series and decoded finish.
  - Prepared for and prepared by; the issue date and the valid-until date.
  - The one total, including GST.
  - One line on what that total includes and does not, read from the file's own flags ("the trailer's registration is included; boat registration is not").
- **Configuration pages.**
  - Boat, Motor, Trailer and Dealer fit, each with its subtotal.
  - The motor's and trailer's own facts from the file.
  - Fit-up and rigging as **one line**, as you locked in May 2026 (question 17). The accessories the customer picked are listed as items.
  - A picture beside a line only where a person has marked it as that exact item.
- **"What comes with your boat,"** once Northside sends the Boat Module workbook that holds the standard inclusions (question 10). Qwilr puts "what's included" before the price, and Porsche prints standard equipment unpriced (`market.md` §3.2; `docs/research/refs/document/notes.md` §1). It is also Northside's defence against "items left off". Until then the section is left out.
- **The price page.**
  - Each band, and each discount or trade-in as its own line with its reason. These need a screen; the engine is ready.
  - The total including GST. The GST amount is shown only once you choose how it is worked (question 7).
- **The last page.**
  - Northside's terms, fixed at issue, and the validity date.
  - "What happens next", in Northside's words.
  - The contact panel.
  - Two blank signature blocks, "Client acceptance" and "Merchant authorisation", as the original labelled them.

  Where Northside has written no terms, the section is left out and the dealer is told at the moment of issue. The customer is never shown a sentence about missing terms.
- **Short, and length is a choice.** Written blocks are short and each is optional. Before issue the salesperson unticks what this customer does not need, as Porsche's "Select PDF content" lets a buyer choose (`docs/research/refs/document/notes.md:20, 24`), and the choice is fixed with the quote (question 19). This is the answer to "walls of text" and "simple wins".
- **Getting it out.** Print, then Save as PDF, then attach. A "Write the email" helper opens the dealer's own mail program. Page one reads at a phone's fit-width, because that is how a customer opens an emailed PDF *(inference)*.

*Gives the salesperson* a document they are proud to hand over at the desk or attach to an email. *Gives the customer* who they are dealing with, exactly what they are buying, the one price with GST, until when, and how to accept.

**Moves off `docs/LATER.md`:** quote validity (the date and the dealer's own expired notice). **Brings in from the plan's Later list, only on your yes (question 16):** PD tiers and registration as priced lines.

### Phase 2: accepted at the desk

**Where it runs.** Milestone 5's proposal track builds it only on your yes (question 3).
- The customer reviews the quote on the dealer's tablet, types their name and signs.
- The app records an "accepted" event against that exact issued version: who, when, and the salesperson who witnessed it. It never edits the version. This is ServiceM8's shape.
- Northside's choice to take signatures this way is recorded in its settings, because under s14 the consent is the dealership's.
- The saved PDF then prints the acceptance, in Northside's wording.
- It works on the device that raised the quote (§5).
- Optionally: Option A / Option B as sibling versions printed together.

**Moves off `docs/LATER.md`**, on your yes: "acceptance capture", in person only.

### Phase 3: stays on `docs/LATER.md` until Milestone 6

The public accept-and-sign page, email sending, view tracking, reminders, deposits and payments, contracts and variations, and CRM sync. **Add to LATER:** view tracking and reminders, customer-ticked options on a hosted page, and payment collection. **Correct in LATER** the status of the original's signing page (§2).

**Not recommended unless you say so: a free-form page builder.**
- Your March 2026 builder was abandoned the same day, and nothing ever read it (`Playground/docs/plan/hl-admin.md:324-336`).
- You have also said "i can't stress enough how easy this system has to be to use" (`docs/PLAN.md:42`), and today "simple wins".
- "So configurable in the backend" is met by the composer and Northside's settings, unless question 14 says otherwise.

The exact paper is specified in `docs/research/proposal/quote-spec.md`. The paste-ready changes to the queued rounds are in `docs/research/proposal/briefs.md`.

---

## 7. Questions only you can answer, and what gets built if you do not

| # | question | the default I would build |
|---|---|---|
| 1 | By "PandaDoc-like … and all of that", do you mean one or more of these? (a) your original's Template Studio and a beautiful PDF; (b) a free-form page builder; (c) PandaDoc's send, viewed, sign and pay loop. | (a) now, in Milestone 5. (c) stays on LATER until Milestone 6. No (b). |
| 2 | How does Northside send a quote and get it signed today? | The salesperson saves the PDF and emails it; the customer signs the printed lines. |
| 3 | Do you want the customer to accept on the dealer's tablet at the desk? It works only when the quote was built on that tablet. | Not built. Print-and-sign lines only. |
| 4 | Will you or Northside supply the legal and trading name, ABN, address, phone, email, website, a dark-ink logo, and each salesperson's contact details? Or may `/manage` offer the values the original HelmLogic already holds? Its proof PDF prints Northside's street address and phone on page 9. Is Northside Marine Coomera a second site (`market.md` §4.3)? | The file's "Northside Marine" as the letterhead. Nothing else prints until a person types it or accepts an offered value. One address. |
| 5 | Will Northside supply its terms, acceptance wording, cooling-off text and warranty paragraph? Has the e-signature approach been chosen? | No terms section on the paper. The dealer is told at issue. Nothing is written for you. |
| 6 | How many days is a quote valid? | An empty field in `/manage`. No date prints until it is typed. |
| 7 | GST: are the file's figures GST-inclusive (the July 2026 FFR-33 ruling)? If so, which GST amount should print? Northside's own workbook shows one figure over the whole total (`AB174 = X170/1.1`, noted at `src/domain/quote/totals.ts:86-90`): $4,687.55 on the 529. Leaving out the trailer's GST-free registration gives $4,661.82. Rego being GST-free is the original's own test note plus general knowledge, not checked against the ATO today. | "Total, including GST" beside the total. No GST amount until you choose. |
| 8 | May the customer's copy show codes like HBS116? The dealership's spec says no. Should staff get a printed dealer's copy? Your May 2026 call was an on-screen staff view, not paper. | Codes off the customer's copy. Codes and workshop facts on the note beside the sheet. No printed dealer's copy. |
| 9 | Cover: each row's own held picture (the default), or the model's on-water photograph with a caption? The SP560's shows a Mercury 115 and an unrecorded finish, not the Yamaha and finish quoted. | The row's own picture: the exact-finish render for Highfield, and the 529's own photograph with an outboard caption. The model photograph only on your yes. |
| 10 | Can Northside send its Boat Module and Factory Options Module workbooks? The standard inclusions and factory-option prices are in them, and in nothing on this machine. The extracts do hold the deposit schedule, lead times and trailer features. Which should print? The market evidence puts deposit receipts, trade-in payout and balance on delivery on the contract, not the quote (`market.md` §6, the MTA SA contract). | Pack what the extracts hold. Print trailer features. No deposit schedule or lead time on the quote. Inclusions and factory options wait for the workbooks. |
| 11 | Should the cost-derived Warranty level ever price a customer's line? | Never on customer paper. Refused with a sentence. |
| 12 | Quote number: keep 20260923-01, or add a short prefix such as NSM? | A prefix only once one is typed. |
| 13 | Which stakeholders get the link: Bill and Mark, other staff, others? Whose name goes on a sample quote? | The review guide asks reviewers to build a real SP560 in their own browser. Any sample PDF is one you make. |
| 14 | Does "so configurable in the backend" stop at Northside's words, colour, logo and pictures, or reach the layout too (`docs/CUSTOMISATION.md:66`)? | Bounded. Section order and optional sections are chosen from the fixed slots. |
| 15 | Rigging Kits and Dealer Fit Packages declare no price level. May a quote go out with an item "Not priced on this quote"? | Allowed, with a sentence at issue. Milestone 3's levels screen lets the dealer declare their price columns (Kit Sell Price; Act Sell). |
| 16 | Must HL_2.0 reproduce the Display Sheet to the dollar, as Mark checked? That means: which motor column the customer pays (Sell Price $14,531, or RRP + Freight Inc GST $17,643); whether pre-delivery tiers and boat registration come off the Later list; and whether factory options come in once their workbook does. | Keep Cash as built. Milestone 3's levels screen shows both motor columns so you choose. The quote says plainly what it does not include. PD tiers and registration stay on Later until you promote them. |
| 17 | Fit-up and rigging on the customer's copy: keep your May 2026 one-line lock-in? | Yes. Rigging kits, and fit-up labour once it is packed, print as one "Fit-up and rigging" line with its price. Fitted accessories the customer chose print as items. |
| 18 | "Hide option prices" (v1.16): what should the customer see instead of INCLUDED on items they are paying for? | Itemised prices. On your yes, a band can print its items without their own amounts, with the band's subtotal carrying the price. Never "Included" on a charged item. |
| 19 | By "the same Porsche treatment", did you mean the cover and tables, or also Porsche's "choose what goes in the PDF"? | Both. The salesperson unticks optional sections before issue (inclusions, specifications, pictures, written pages), and the choice is frozen. The price and acceptance pages are always in. |
| 20 | How should the letter greet the customer? HL_2.0 holds one name field, and splitting it is a guess. | "Dear" and the name as typed. A first name only if the handover gains a typed "how to greet them" field. |

---

## 8. Two things outside this task that you should know

- **The original HelmLogic's `storage.rules` let anyone read and write every stored file.** That includes the customer driver's licence uploads captured at the Administration step (`HelmLogic/storage.rules:1-10`; `HelmLogic/src/components/finalize-quote-dialog.tsx:118-120`). If that app is still deployed, those files are exposed. Worth checking today.
- **`HelmLogic/scripts/seed-v133-triage.py:76` holds a real test account's password in plain text** in a public repository. It is not reproduced here.
