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
- **The recently-searched list** (`features/search/recent.ts` + its 5 tests) — per-viewer UI state, so it belongs to whichever screen draws a search box, with `prefs` as the only store allowed to persist it. Nothing in the engine reads it.

## Old suites that did not come across, and what each one waits on

Added 2026-09-17 after the round-2 audit, which found five old suites that are legitimately out of Milestone 0's scope but were named nowhere — and "deliberately not ported" that is written down nowhere is indistinguishable from "forgotten". Each line says what the suite measured and what has to exist before it can. The pattern is `src/domain/catalogue/curation/applied.test.ts`, which lists the seven `.tsx` surfaces it can no longer read and says that putting one back is one line.

- **The citation classifier** (`features/constraints/provenance.test.ts`, 4 tests over `readSource`) — asserts that drawing a workbook citation loses no word, against all sixteen real source strings. The sixteen rules themselves DID come across, as data, in `src/domain/rules/constraints/workbookRules.ts`. `readSource` did not: it lives in `Provenance.tsx`, and its output is a set of face assignments (`file` / `cell` / `said` / `working`), which is presentation reasoning and does not belong in a pure domain. It is owed by whichever Milestone 1 screen draws a rule's evidence, and the suite comes with it — it is the last link in "a rule shown is measured from the file with its numerator and denominator".
- **A structural change is never a side effect** (`features/views/structureAsk.test.ts`, 7 tests) — UX_PASS §5 and audit finding 14: one click on an accessory authored a whole new join table behind the person's back. The rule is that a new table, column or join is OFFERED in a sentence that names it, and is undoable. The suite reads `.tsx` sources to prove no browse or pick authors structure, so it cannot run before those screens exist. **Milestone 1 owes this guard the day the picker or a view page can add anything.**
- **The row-reveal request** (`features/table/rowRevealState.test.ts`, 7 tests) — carrying a chosen row from the search into the sheet: it waits for a stage that has not mounted, and it is per table so two places cannot overwrite each other's answer. Per-viewer UI state, excluded by the no-UI-state port rule; it belongs with the register screen that draws the search.
- **The two history screens, rendered** (`features/history/render.test.ts`, 20 tests) — mounts the real components and reads the markup, catching the shape of fault where the logic is right and the screen never says it. The arithmetic it sits beside is ported (`src/domain/quote/diary/*`); the screens are Milestone 1.
- **Remove the example data** (`features/io/exampleData.test.ts`, 11 tests) — the remover that takes all of a demo set and none of the dealer's own work, identified by one creation instant across every table the demo minted. HL_2.0 has no demo seed to remove: the pack IS the dealer's data, and a sheet wipe is the explicit act instead. Not carried, and not expected back.

### The rest of the register, counted folder by folder (2026-09-17, round 3)

The five above were the ones the round-2 audit found. The round-3 critic counted all 161 of `HL_Playground`'s node suites against this tree and found the register still incomplete: **29 more suites, 500 cases**, none of them named anywhere. Most have an obvious home on a later milestone, but "obvious" is what the round-2 ruling was written against, so each is here with the reason. Counted the same way: `grep -cE '^\s*(it|test)\('` over the old file.

| old suite | cases | why it is not here |
|---|---|---|
| `features/dashboard/{cards,arrangement,doors,links,proposals,census,reorder}.test.ts` | 151 | The home dashboard: its cards, their arrangement and the doors they open. Milestone 1 designs home from its own reference sweep, and nothing is ported into a screen before its direction is picked. The arithmetic (census, ordering) comes back with it. |
| `features/pipeline/{owners,dealNotes,pipeline,dealLinks,cardFields,stageTrigger,dealFiles}.test.ts` | 140 | The deal pipeline — a CRM board over quotes. Not in Milestones 0–2 at all; it needs the organisation's users (Milestone 4) to have an owner to assign. |
| `lib/imageSources.test.ts` | 24 | Its security half DID come across: the `http`/`https`/`data:image`/`blob` allow-list is `src/domain/io/envelope.ts`, measured in `envelope.images.test.ts` and `modules/logo.test.ts`. What is missing is only the host verdict — "this picture is from the manufacturer, this one is from a forum" — which is presentation, and belongs to whichever screen shows a picture's provenance. |
| `features/auth/role.test.ts` · `store/roles.test.ts` · `features/tenancy/roundTrip.test.ts` | 39 | Users, roles and an organisation round trip. **Milestone 4**, with the organisation record. `orgId` is already on every persisted record, which is the half of it Milestone 0 owed. |
| `app/url.test.ts` | 11 | A hand-rolled URL layer the plan drops: TanStack Router owns the address, and a position inside a screen is a search param. Retired, not deferred. |
| `store/notes.test.ts` | 10 | The say bus. Retired by a recorded decision — `onApplied` is the callback, so there is no global notice channel to test. |
| `store/forgetBusiness.test.ts` | 9 | Clearing the business out of `localStorage`. Retired by "only `prefs` touches `localStorage`": there is nothing there to forget. |
| `features/activity/activity.test.ts` | 8 | `byDay`, and its midnight boundary. Pure arithmetic and portable any day; it has no caller until a screen draws an activity log, and a module in `src/domain` that nothing reads is the kind of tidiness this rebuild is avoiding. |
| `lib/actions.test.ts` | 8 | The action bar's register: two publishers that cannot see each other produce one bar in one order. Module-level **session UI state**, which the port rules exclude, and it belongs with the shell that draws a bar. |
| `app/startingPoint.test.ts` | 7 | Which demo to open on. Dead with `demos/` — there is no demo seed here, the pack is the dealer's own file. |
| `store/writeHold.test.ts` | 7 | The teeth of the tab write-lock, which is already a line above ("single user now; returns with Milestone 6"). Named here so the suite is findable from the register too. |
| `app/moduleRecent.test.ts` | 5 | The rail's four most recent places. Per-viewer UI state, `prefs` as the only store allowed to persist it — the same reason `features/search/recent.ts` is above. |

Four more read as dropped and are not: `features/search/{rowSearch,capabilities,fiveKinds,rowSearch.northside}.test.ts` are `src/domain/catalogue/search*.test.ts` under the new names, `features/constraints/discovery.test.ts` is `discoverSay.test.ts` at the same 26 cases, `features/quote/{undoOnPick,survivesClose}.test.ts` are in `src/state/quotes.test.ts`, `app/stageKeys.test.ts` is `src/ui/keys.test.ts`, `lib/observed/observed.test.ts` is `src/domain/rules/adopt.test.ts`, `db/repository.test.ts` is the shared contract suite in `src/data/`, and `features/search/encoding.test.ts` came across as a GUARD rather than a suite — it is the `source-is-text` rule in `tools/check/rules.ts` with six fixture cases. `demos/*` is the pack by instruction.

Not carried at all (reason in one line): the contract signing-pack PDF (a placeholder with literal strings), the tax-invoice model (invoicing lives in another system), org-level promotions (zero callers; two schemas), the variation order document model (zero callers), the compatibility-rules banner (the sentence rules cover it), the comms log (broken switch on the wrong field), feature tracking, roadmap, suggestion queue, the agent-team dashboard, route optimisation, "real-time vessel tracking" over an empty array, the Genkit chatbot, the Sam Allen one-supplier uploader, the parallel org-slug route tree.

## Customisation panels (Milestone 4, with the organisation record)

The owner asked for "full massive customisability" and then set its priority himself: "nice to have so get it done first, make sure functionality is great". So the *panels* — where a dealer picks a background, a brand colour, a mark, a density — are Milestone 4 work, beside the organisation record they belong to. The screens they reach are entry, home and its dashboard, every place page, the configurator's stage, the document cover and every register's density.

What Milestone 1 owes them is only discipline, and it costs nothing: every value is a token, no screen hard-codes a colour, a face or a picture path, and `OrgRepository` already has room for an `Appearance` record. `docs/CUSTOMISATION.md` has the architecture and the guard rails.

## Ported (2026-09-22): the two suites that waited on the catalogue commands

Both paragraphs above named the same dependency — the catalogue write commands — and both came across the day the commands did. Recorded here rather than deleted, so the register stays countable.

- **Applying a price level to a whole table** (`features/levels/apply.ts` + its 12 tests) is `src/domain/pricing/apply.ts` with `src/state/catalogue.levels.test.ts`, twelve cases, assertions unchanged. The measurement it carried — *187 cell edits collapse into ONE undo entry* — is kept by construction rather than by noticing a microtask: the writes are one `batch` command whose inverse is the 187 inverses, and `src/domain/catalogue/commands.test.ts` runs exactly that on the real Highfield table.
- **The table designer's three suites** (`features/designer/{dependents,columnFacts,confirmSheetTruth}.test.ts`, 81 cases) are `src/domain/catalogue/dependents.test.ts` (47), `src/domain/catalogue/columnFacts.test.ts` (26) and `src/state/catalogue.designer.test.ts` (8). The two prose guards that read the old `.tsx` sheets read the commands' own source and their counted radii instead, because the sentence a confirm will print is now the sentence `deleteFieldRadius`, `retypeRadius`, `retargetRadius` and `deleteTableRadius` compute.
