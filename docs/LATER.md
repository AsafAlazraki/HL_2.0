# Later

Named so nobody builds it by accident. The owner promotes from here; each line carries the original HelmLogic's true status so promotion is a one-line decision.

- **Stock on the floor** with a quote↔unit allocation by reference (the original: a flat collection with five statuses, serial, material, photos; shipped and used).
- **Contracts, deposits and payment schedules** as a second frozen document (the original: schedule arithmetic correct and unit-tested, the only caller passed empty defaults; receipt numbers hardcoded to 1).
- **Promotions** as time-bounded column overrides, including per-hp (the original: shipped for seeded rows; two schemas collide).
- **Registration** as a priced line with rego-automatch's refusals (the original: shipped and reachable; its best-reasoned small file).
- **Landed cost, FX with a mandatory note, per-metre freight** (the original: a chain and an exchange-rate manager exist; Cockpit pricing surfaces).
- **Margin gate** with typed-reason override (the original: enforced, but gated on hardcoded cost guesses and audited to a window global).
- **Acceptance capture, quote validity/expiry, convert quote → contract, variations / change orders** (the original: never wired; engine complete but nothing writes the date; a one-line snapshot; three ways broken).
- **Public accept-and-sign page** with a one-time token (the original: well built, unreachable, and it signed the customer in anonymously).
- **Email sending** with the subject and body frozen at send (the original: fully plumbed, dark for 25 releases behind an unset flag).
- **SharePoint push** (the original: built, gated off; steal the folder path shape).
- **Public Build-A-Boat** with a real price lock (the original: a query parameter hiding a select is not access control).
- **Service quoting.**
- **Stock location map** (the original: over a hardcoded gazetteer).
- **A visual quote-flow designer** ("OutSystems-studio-style", the owner's words). Ships only when a runtime reads what it designs; the original's WYSIWYG designer never had a renderer.
- **Dark theme** — offered, not default, and only when every token is theme-scoped.
- **Tablet and phone parity** — a Milestone 2 pass; Milestone 1 only promises phone width does not break.
- **The tab write-lock** — single user now; returns with Milestone 6 if needed.
- **A rule canvas** (the old repo's 5.5k lines of xyflow nodes) — the engine ports; a canvas returns only if a picked direction wants one.

Not carried at all (reason in one line): the contract signing-pack PDF (a placeholder with literal strings), the tax-invoice model (invoicing lives in another system), org-level promotions (zero callers; two schemas), the variation order document model (zero callers), the compatibility-rules banner (the sentence rules cover it), the comms log (broken switch on the wrong field), feature tracking, roadmap, suggestion queue, the agent-team dashboard, route optimisation, "real-time vessel tracking" over an empty array, the Genkit chatbot, the Sam Allen one-supplier uploader, the parallel org-slug route tree.

## Customisation panels (Milestone 4, with the organisation record)

The owner asked for "full massive customisability" and then set its priority himself: "nice to have so get it done first, make sure functionality is great". So the *panels* — where a dealer picks a background, a brand colour, a mark, a density — are Milestone 4 work, beside the organisation record they belong to. The screens they reach are entry, home and its dashboard, every place page, the configurator's stage, the document cover and every register's density.

What Milestone 1 owes them is only discipline, and it costs nothing: every value is a token, no screen hard-codes a colour, a face or a picture path, and `OrgRepository` already has room for an `Appearance` record. `docs/CUSTOMISATION.md` has the architecture and the guard rails.
