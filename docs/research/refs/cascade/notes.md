# Cascade — the sweep

Driven 2026-09-17. **128 sources driven · 108 frames captured · 2 copied in as bytes = 110 files**, counted on disk; 20 returned no frame and 41 served a 404, a WAF refusal, a bot challenge or a consent wall. Every frame named below was opened and looked at. Per-frame URLs and every failure: `sources-index.md`. Paths are relative to this folder; stock paths sit under `C:\Users\Asaf\dev\hl-refs\ref\`.

**The job.** When a pick changes or removes something already chosen, show what comes on, what goes, what stays and why, priced as a decision the dealer accepts or declines — as a route, `/quote/$id/cascade?fix=&from=`, so Back, refresh and a shared link behave.

**Three corrections first.**

1. **`ref/porsche-modal.png` is not the cascade.** The brief names it as this screen's stock frame; opened, it is Porsche's **"Select PDF content"** dialog — five checkboxes and a black `Create PDF` over a blurred page. It belongs to the document screen; all it teaches here is the blur.
2. **The teardown's evidence never came across, and now has.** `cascade-teardown-porsche-live.md` rests on an image that lives only in the old repo, which is why the configurator sweep told its boards not to draw the sheet from a frame. Both images are now in this folder as bytes, and **every claim in the teardown checks out against `porsche-cascade.png`.**
3. **`ours-cascade.png` is the old repo's cascade.** Cited only for the sentences the engine wrote — *"no Trade column — stays at Sell inc Rego"* — which are data. Its layout, palette and type do not cross.

And one fact about our contract: `src/domain/model/offer.ts` gives `Cascade` an `asked`, `added`, `removed`, `unchecked`, `alternatives`, `from`/`to`/`delta` and a named `accept`. **There is no `stays` list and no named decline.** Anything shown as staying is derived from the frozen lines already on screen — never a new figure.

---

## 1. What is genuinely best for this screen

**`porsche-cascade.png` — the one to beat, now visible.** A sheet over the right ~70 % of a **blurred** stage: `Your configuration is being adjusted.` over one sentence of why; `Your selected option` — thumbnail, name, ⓘ, `$24,340.00`; a `Newly added` card chipped `+$2,120.00`; a `Removed` card chipped `$0.00`; a footer of black `Accept changes`, grey `Cancel selection`, and right-aligned `Total price change` **`+$26,460.00`**. Inside one card it keeps two kinds of nothing apart — five rows read `Standard Equipment`, one `$0.00`. What it never does: say why a row went, or picture anything but the option asked for.

**`software2/terraform-plan-output.png` — the best answer anywhere to "a list, or a story?"** A four-symbol legend (`+ create`, `~ update in-place`, `- destroy`, `-/+ destroy and then create replacement`); then per resource a plain sentence — `# aws_instance.web must be replaced`, `# aws_s3_bucket.old_bucket will be destroyed` — and under the second **`# (because aws_s3_bucket.old_bucket is not in configuration)`**, the reason on its own line. Attribute changes print `"ami-02c9…" -> "ami-0d7d6…"`. It closes on **`Plan: 2 to add, 1 to change, 2 to destroy.`** Verb sentence, reason line, old → new, census. `software2/hcp-terraform-confirm.png` is the same thing as a screen: the census in the run head, a bar sized to the change, a filter over the rows, and an amber band restating the census above **Confirm & apply · Discard run · Add comment**.

**`software2/wikipedia-diff-real.png` — what stays, shown by not moving.** Two columns, each headed by who, when, and the edit summary in italics — the reason attached to the side that caused it. `Line 82:` anchors both sides, unchanged lines print on both, the changed words are pilled inside an otherwise identical paragraph, and `← Previous edit / Next edit →` step through.

**`narrow/pcpartpicker-incompatible.png` — the floor for never blocking.** A red banner naming severity in words, `details` an in-page link, `Estimated Wattage: 755W` chipped beside it — and **nothing disabled**: every Buy live, `Total: $5559.96` still summed, `Out of stock` printed as text in its own column.

---

## 2. The patterns worth taking, named

**The verb sentence, then the reason under it.** `software2/terraform-plan-output.png`. The row is titled by what will happen to it; the cause is its own indented line beginning `because`. `CascadeRow.because` is that line, and we hold the numbers to write it.

**The census as the headline.** `software2/hcp-terraform-confirm.png`: three counts on one line before any row.

**The footer prices the decision, not the click.** `porsche-cascade.png`: $24,340 clicked + $2,120 forced = `+$26,460.00`.

**Two kinds of nothing.** `porsche-cascade.png` and `ref/porsche-summary-b.png` put `Standard Equipment` where `$0.00` would go; `narrow/dell-poweredge.png` prints **`Selected`** where other rows print a delta. A price column that holds a state, not only a figure — `CascadeRow.standard` already carries it.

**The alternative priced as a difference, including downward.** `drive/whaler-engines.png`: `40 ELPT EFI … $0` selected, `25 ELPT … −$853` beneath. Our six Yamahas on a hull are that list, and `Alternative[]` with the cheapest pre-selected is the half of Porsche's design they never ship.

**The narrowing stated on the group, before it fires.** `drive/apple-mbp14-deep.png`, `narrow/apple-mbp14-memory.png`: *"Choose from options up to 128GB **with your current chip selection**"* — the group names the cause without naming the rule, and groups not yet reachable still say what they will offer. Most refusals never fire if the motor card carries its HP envelope this way.

**The change proposed inside the thing it changes, with its own pager.** `software3/vscode-merge-editor.png`: `Code Review Comment (1 of 1)` inline in the file, a sentence of consequence, `Suggested change:` as a three-line diff, then **Apply / Discard**. `software/gdocs-suggestions.png` says it in prose — *"Anything you delete will be crossed out"*, accepted one by one, previewable *"with or without the changes"*.

**The heading that is a sentence about one object.** `software/helm-diff.png`: `postgresql/templates/pvc.yaml has been removed:`, then the object. Grouping by verb is not the only grouping.

**Every row carries its own Change.** `ref/porsche-summary-b.png`: thumbnail · name · ⓘ · code in grey mono (`58X`, `3UG`) · price-or-`Standard Equipment` · **`Change ›`**, group heads counted. `software/govuk-check-answers.png` is the plain one.

**Consequences listed before the act.** `software/vercel-instant-rollback.png`: four bullets of what else a rollback does, then `Verify the information` → `Confirm the rollback`, then a section on undoing it. Undo exists *and* the consequences are printed.

**Show the things, never the count alone.** `software2/nng-confirmation-dialog.png`: Windows' single-file delete is called good for printing thumbnail, name, type, size and location; *"delete these 2 items?"* is called questionable design.

---

## 3. The hard question — how the best show causality

The plan proposes a beam from the option picked to the option removed, then a strike. **Across 110 frames, nothing shipping draws that beam.** The nearest is `software/excel-trace-precedents.png`, where Trace Precedents and Trace Dependents *"graphically display and trace the relationships between these cells and formulas with tracer arrows"* — and the only picture of those arrows is a ~115 px thumbnail. The beam is an invention; a direction may use it but must own that, against three proven answers:

1. **Causality as typography** — the `because` line indented under the verb sentence (`software2/terraform-plan-output.png`), which is what `explaining-a-refusal.md` already settled as PubGrub's *"Because … And because … So, because …"*, closing on the person's own last pick.
2. **Causality as position** — the change inside the unchanged context that survives it, word-level, the reason on the side that made it (`software2/wikipedia-diff-real.png`), or inline in the line it edits with Apply/Discard (`software3/vscode-merge-editor.png`).
3. **Causality as arithmetic** — `software/stripe-prorations.png`, where an `ITEM / AMOUNT / TOTAL` table prices a mid-term change in two lines whose *names* are the reason (*Unused time on original 10 USD plan (credit)* `-5`; *Remaining time on new 20 USD plan (debit)* `+10`), the right column running to the difference.

The strike likewise: the only shipping one found is Google Docs' (`software/gdocs-suggestions.png`), and it is **in the document, not in a list beside it**. A strike inside a card headed "Removed" says the same thing twice.

Done badly it is measurable. `narrow/dell-poweredge.png` prints *"Selections may result in additional updates to the overall configuration…"* **twice on one screen**, naming nothing, while the teardown's controlled diff proved two modules were silently rewritten. Causality asserted in general and withheld in particular is worse than silence.

---

## 4. Type and motion, what was actually seen

**No colour does the work.** Porsche's sheet is black, white and two greys; the price chips are grey pills, not red and green; the only saturated object is the black `Accept changes`. Where colour appears it is one hue once — Lotus on `NEXT` (`cars/lotus-emeya-config.png`), Whaler on `NEXT CATEGORY` (`narrow/whaler-configurator.png`). Where red and green carry a signal it is a terminal (`software/helm-diff.png`) or a banner that **also names the severity in words** (`narrow/pcpartpicker-incompatible.png`).

**Scale contrast is low, and the figure is the exception.** Porsche's headline is ~24 px over a ~15 px subhead, about 1.6×, and the largest object on the sheet is `+$26,460.00` in the footer, not the title. Whaler sets `$23,906*` at ~26 px against a ~20 px model name. The money is the biggest thing; everything else is quiet.

**Mono for the code, prose for the reason.** `ref/porsche-summary-b.png` sets option codes in grey mono beside the name; `ours-cascade.png` does the same over a grey reason subline. `TA1400S13SB` and `F90LB` want that.

**Motion: a still proves none.** No frame licenses an easing or a duration. What they license is the **blur** behind Porsche's sheet: it says the configurator is still there and frozen rather than replaced, and it lowers the resolution a background picture needs. The rest is argued from the plan, not from a frame.

---

## 5. What to avoid, each with its frame

- **The general warning that names nothing** — `narrow/dell-poweredge.png`, printed twice.
- **One sentence for every cause** — `porsche-cascade.png`: five removed rows all reading *"not compatible with your selection"*.
- **Two filled buttons side by side** — `porsche-cascade.png`'s black `Accept changes` beside a grey-filled `Cancel selection`, which reads as a second primary, not a way back.
- **A gate before the product** — `cars/rivian-config.png` demands a postal code over a skeleton page (nothing was typed); `cars/bmw-configurator.png` showed only a consent card with tracking pre-enabled and the refusal behind a disclosure.
- **A cascade route that cannot be addressed** — `cars/porsche-feasibility-direct.png`: `/feasibility-notification?optionAdded=04P` without the whole build redirects to `Select a Model Series`. Ours must open on `?fix=&from=` alone and say plainly if the quote has moved on.
- **A disclaimer nobody reads** — `narrow/whaler-configurator.png`'s *"Optional equipment may be shown or pre-selected…"* in grey under the fold. `Cascade.unchecked` puts it on the subject.
- **Dead space under a short change** — `porsche-cascade.png` and `ours-cascade.png` leave 150–400 px of blank sheet under the last card. One or two rows is the common case.

---

## 6. Four directions

Each a different composition **and** a different order and grouping of the same `Cascade`. None depends on a particular photograph, and each reflows to one column on a phone.

**A — "The plan."** No stage and no sheet: a full-width routed page whose first line is the census — *3 coming on · 5 going · 41 staying · the total moves +$2,120* — then the decision's price, then rows **grouped by verb**, staying collapsed behind its count.
**Exclusive to A:** `software2/terraform-plan-output.png` (the legend, the `# (because …)` line, the census) and `software2/hcp-terraform-confirm.png` (a bar sized to the change, a filter over the changed rows, a confirm band restating the census above `Confirm & apply` / `Discard run`). **Only A** leads with counts, so only A needs a filter when a cascade runs long.

**B — "Because."** Porsche's right-hand sheet over the blurred frozen stage, ordered **by rule, not by verb**: one paragraph per rule, each a sentence closing on the dealer's own last pick, owning the rows it removed and priced at its right.
**Exclusive to B:** `software/helm-diff.png` (a heading that is a sentence naming the object and its fate, before the object) and `software/gdocs-suggestions.png` (crossed out where it dies, accepted one by one, with a with/without preview). **Only B** is ordered by cause, so only B has a heading that is a sentence.

**C — "In the document."** No separate screen: the frozen quote lines in document order, incoming lines inserted where they will sit, outgoing lines struck through in place, unchanged lines at full strength; a margin rail carries one card per change with its reason and its own accept/decline; a foot band prices the decision. **Grouped by section of the quote** — hull, motor, trailer, dealer fit.
**Exclusive to C:** `software2/wikipedia-diff-real.png` (word-level change inside unchanged context, the reason on the side that caused it) and `software3/vscode-merge-editor.png` (`Code Review Comment (1 of N)` inline, a sentence, a mini-diff, `Apply` / `Discard`). **Only C** never leaves the document, so only C needs a pager over changes and a with/without toggle.

**D — "The two builds."** Two columns — *As it stands* and *If you accept* — each the whole rig as a short priced list, differing rows aligned, everything else quiet; one figure between them is the difference. **Grouped by build**, so the dealer compares two wholes rather than reading a change list, and "keep it as it is" is a build he can point at.
**Exclusive to D:** `ref/porsche-summary-b.png` (the whole build as thumbnail · name · code · price-or-`Standard Equipment` · `Change ›`, group heads counted) and `drive/whaler-engines.png` (the alternative priced as a difference from what is chosen, `−$853`). **Only D** shows both states whole, so only D can put the alternatives in the right column as swaps.

A and D show "what stays", derived from the frozen lines, never from a field the contract lacks. All four must name a decline: `Cascade` names `accept` and nothing else today.

---

## 7. Imagery: what the seed can honestly put here

This is the screen least dependent on photography in the milestone — type, figures and sentences — and that is a strength, because a second dealership replaces the pictures and the mark. On the ledgers:

- **`heroes-ledger.json`: eight on-water photographs** — four Highfield (SP560, SP600, PA600, ADV7, all 2560 on the long edge) and four Stacer (519 Sea Ranger 2560×1694 down to 359 Territory Striker 1200×800). Highfield is renders in the catalogue and real photography here; Stacer publishes at web size, so its two smallest cannot fill a 1440 window.
- **`public/seed-images`: 329 catalogue pictures capped at long edge 1100.** At a 48–64 px row thumbnail this tier is right, and the Yamaha cut-outs on white are the best-behaved things in it.
- **`marks-ledger.json`: 18 rows, 17 files, twelve of thirteen brands.** **Mercury is white-ink only**, so its mark cannot sit on a white cascade sheet; **Stabicraft has no verified public wordmark**. A direction that puts a mark on a motor row must say what happens to those two.

Porsche pictures only the option asked for and leaves every removed row picture-less. Our removed rows are motors, trailers, rigging kits and parts, and the trailer rows point at a SharePoint address the packer recorded as a workbook defect — so **a cascade row must read well with no picture at all**: name, code in mono, reason, price. Never a stand-in, never another model's photograph.

The one place a photograph earns its place is **B's blurred ground**. Blur lowers the resolution a background needs, which is the only honest argument for a 1100 px catalogue copy behind a sheet — but it must be the boat in this quote, named from the ledger, and B must also draw itself once on a flat ground.
