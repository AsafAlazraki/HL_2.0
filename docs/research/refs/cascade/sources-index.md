# Cascade — every frame, its URL and what it is

Driven 2026-09-17 with `npx tsx tools/research/capture.ts cascade/<modality> <list.json>` at 1440 × 900,
`locale: en-AU`, consent answered with the most privacy-preserving button present. Nothing was signed
into, no personal data was typed, and no bot protection was fought — a site that refused is written
here with its reason.

**Counted from the files on disk 2026-09-17: 108 frames captured across six modalities, plus 2 frames
copied in as bytes** (`porsche-cascade.png`, `ours-cascade.png`) = **110 files**. 128 sources were
driven; 20 returned no frame at all (a click that timed out, or a DNS failure during a network drop
mid-run) and a further 41 served a 404, a WAF refusal, a bot challenge or a consent wall instead of
the thing asked for. Both kinds are listed below and neither is cited in `notes.md` as evidence of
anything except its own failure.

Frames live in `docs/research/refs/cascade/<modality>/` (gitignored; mirrored to
`C:\Users\Asaf\dev\hl-refs\hl2\cascade\<modality>\`). Stock frames cited in `notes.md` are under
`C:\Users\Asaf\dev\hl-refs\ref\`.

## Copied in, not captured

| frame | source on disk | one line |
|---|---|---|
| `porsche-cascade.png` | `C:\Users\Asaf\dev\HL_Playground\docs\research\img\porsche-cascade.png` | Porsche's feasibility sheet, captured live 2026-09-10 for `docs/reference/cascade-teardown-porsche-live.md`; the evidence the teardown rests on, which had never been copied into HL_2.0 |
| `ours-cascade.png` | `C:\Users\Asaf\dev\HL_Playground\docs\research\img\ours-cascade.png` | the OLD repo's cascade on the Northside file. Cited in `notes.md` **only for the sentences the engine produced**; its layout, palette and type are the old design system and do not cross |

## cars

| frame | url | one line |
|---|---|---|
| `cars/porsche-911-config.png` | https://configurator.porsche.com/en-AU/mode/model/9921B2 | the configurator the teardown drove |
| _cars/porsche-911-equipment_ | https://configurator.porsche.com/en-AU/mode/model/9921B2 | **no frame** — locator.click: Timeout 8000ms exceeded. |
| `cars/porsche-911-conflict.png` | https://configurator.porsche.com/en-AU/mode/model/9921B2 | attempt: pick a package that excludes another |
| `cars/porsche-feasibility-direct.png` | https://models.porsche.com/en-AU/model-start | **did not serve it** — redirected to Select a Model Series — the cascade route refuses to render without its full state |
| _cars/porsche-911-wheels_ | https://configurator.porsche.com/en-AU/mode/model/9921B2 | **no frame** — locator.click: Timeout 8000ms exceeded. |
| `cars/polestar-4-order.png` | https://www.polestar.com/au/polestar-4/order/ | **did not serve it** — 404 under a consent card with three categories pre-enabled |
| _cars/polestar-4-packs_ | https://www.polestar.com/au/polestar-4/order/ | **no frame** — locator.click: Timeout 8000ms exceeded. |
| `cars/polestar-3-order.png` | https://www.polestar.com/au/polestar-3/order/ | **did not serve it** — 404 under the same consent card |
| `cars/bmw-configurator.png` | https://www.bmw.com.au/en_AU/configurator.html | **did not serve it** — consent card only; Analytics and Marketing pre-Allowed, refusal behind a disclosure |
| `cars/bmw-x3-build.png` | https://www.bmw.com.au/en/all-models/x-series/X3/2024/bmw-x3-overview.html | **did not serve it** — consent card only |
| _cars/audi-configurator_ | https://configurator.audi.com.au/ | **no frame** — page.goto: net::ERR_NAME_NOT_RESOLVED at https://configurator.audi.com.au/ |
| `cars/audi-q5-config.png` | https://www.audi.com.au/au/web/en/models/q5/q5/carconfigurator.html | **did not serve it** — Access Denied (WAF) |
| `cars/rivian-config.png` | https://rivian.com/configurations/list?SORT=Featured&PROMOTION=ALL_MATCHES&MODEL=R1S&INVENTORY_TYPE=NEW_VEHICLE_CONFIG&TRANSFER_FEE=ALL_MATCHES | Rivian configurator |
| `cars/rivian-r1s-options.png` | https://rivian.com/configurations/list?SORT=Featured&MODEL=R1S&INVENTORY_TYPE=NEW_VEHICLE_CONFIG&TRANSFER_FEE=ALL_MATCHES&PROMOTION=ALL_MATCHES | attempt: an option that narrows another |
| `cars/mercedes-configurator.png` | https://www.mercedes-benz.com.au/passengercars/buy/new-car/car-configurator.html | **did not serve it** — 404 |
| `cars/tesla-model3-design.png` | https://www.tesla.com/en_AU/model3/design | **did not serve it** — Access Denied (WAF) |
| `cars/lucid-air-design.png` | https://lucidmotors.com/air/design | **did not serve it** — 404 |
| `cars/volvo-ex30-build.png` | https://www.volvocars.com/au/cars/ex30-electric/build/ | **did not serve it** — Access Denied (WAF) |
| `cars/mini-configurator.png` | https://www.mini.com.au/en_AU/home/range/configurator.html | **did not serve it** — error page |
| `cars/landrover-defender-build.png` | https://www.landrover.com.au/vehicles/defender/build-yours.html | **did not serve it** — 404 |
| `cars/lotus-emeya-config.png` | https://www.lotuscars.com/en-AU/configurator/emeya | Lotus |
| `cars/ford-build-and-price.png` | https://www.ford.com.au/build-and-price/ | **did not serve it** — Access Denied (WAF) |
| `cars/toyota-hilux-build.png` | https://www.toyota.com.au/hilux/build | **did not serve it** — 404 |
| `cars/isuzu-dmax-build.png` | https://www.isuzuute.com.au/build-and-price | **did not serve it** — 404 |

## narrow

| frame | url | one line |
|---|---|---|
| `narrow/apple-mbp14.png` | https://www.apple.com/au/shop/buy-mac/macbook-pro/14-inch | a chip choice that narrows memory and storage |
| `narrow/apple-mbp14-memory.png` | https://www.apple.com/au/shop/buy-mac/macbook-pro/14-inch | scrolled to the narrowed options |
| _narrow/apple-mbp14-chip-switch_ | https://www.apple.com/au/shop/buy-mac/macbook-pro/14-inch | **no frame** — locator.click: Timeout 8000ms exceeded. |
| `narrow/apple-mac-studio.png` | https://www.apple.com/au/shop/buy-mac/mac-studio | a chip choice that rewrites the memory ladder |
| `narrow/apple-watch-studio.png` | https://www.apple.com/au/watch/?collectionName=apple-watch | **did not serve it** — redirected to the Apple Watch landing page, not the studio |
| `narrow/apple-imac.png` | https://www.apple.com/au/shop/buy-mac/imac | a third narrowing ladder |
| `narrow/framework-13-config.png` | https://frame.work/au/en/laptop13/configuration/new | **did not serve it** — 404 — the configuration route has moved |
| `narrow/framework-13-scrolled.png` | https://frame.work/au/en/laptop13/configuration/new | **did not serve it** — 404 |
| `narrow/framework-marketplace-memory.png` | https://frame.work/au/en/marketplace | a part that fits some machines and not others |
| `narrow/pcpartpicker-incompatible.png` | https://pcpartpicker.com/list/mDF9tC | the deliberately incompatible list from the old teardown |
| `narrow/pcpartpicker-incompatible-scrolled.png` | https://pcpartpicker.com/list/mDF9tC | **did not serve it** — Cloudflare challenge on the second request |
| `narrow/pcpartpicker-guide.png` | https://pcpartpicker.com/guide/mwv6Mp/ | **did not serve it** — Cloudflare challenge |
| `narrow/whaler-configurator.png` | https://www.bostonwhaler.com/us/en/boat-configurator.13SPT | a boat configurator that prices every swatch |
| _narrow/whaler-configurator-options_ | https://www.bostonwhaler.com/us/en/boat-configurator.13SPT | **no frame** — locator.click: Timeout 8000ms exceeded. |
| `narrow/searay-build.png` | https://www.searay.com/global/en/build | the builder whose constraints are silent hides |
| `narrow/malibu-build.png` | https://build.malibuboats.com/ | a thin builder |
| `narrow/dell-poweredge.png` | https://www.dell.com/en-us/shop/servers-storage-and-networking/poweredge-t360/spd/poweredge-t360/pe_t360_tm_vi_vp_sb?view=configurations | the silent cascade: 60 groups, two rewritten with no message |
| `narrow/hermanmiller-aeron.png` | https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/2195348.html?sku=100073872 | **did not serve it** — bot challenge (Just a moment...) |
| `narrow/peloton-bike.png` | https://www.onepeloton.com/en-AU/shop/bike | bundle tiers and a cost excluded from the total |
| `narrow/sonos-set.png` | https://www.sonos.com/en-au/shop/arc-ultra-surround-set-with-era-100 | **did not serve it** — Access Denied (WAF) |
| `narrow/tagheuer-config.png` | https://www.tagheuer.com/au/en/watch-configurator.html | **did not serve it** — 404 |
| `narrow/nike-by-you.png` | https://www.nike.com/au/u/custom-nike-dunk-low-by-you-10001427 | **did not serve it** — redirected to the Nike store home |
| `narrow/yamaha-rigging-au.png` | https://www.yamaha-motor.com.au/marine/outboards | **did not serve it** — 404 |
| `narrow/mercury-rigging.png` | https://www.mercurymarine.com/au/en/parts-and-accessories/rigging | **did not serve it** — 404 |
| `narrow/qantas-change-booking.png` | https://www.qantas.com/en-au/manage-booking/change-flights | **did not serve it** — the help page, not the change flow (a booking reference is needed and none was entered) |
| `narrow/amtrak-change.png` | https://www.amtrak.com/change-cancel-tickets | **did not serve it** — 404 |

## software

| frame | url | one line |
|---|---|---|
| `software/terraform-plan-cli.png` | https://developer.hashicorp.com/terraform/cli/commands/plan | the canonical add/change/destroy symbols and the plan summary line |
| `software/terraform-change-infra.png` | https://developer.hashicorp.com/terraform/tutorials/aws-get-started/aws-manage | forces replacement annotated on the attribute that caused it |
| `software/terraform-plan-tutorial.png` | https://developer.hashicorp.com/terraform/tutorials/cli/plan | reading a plan |
| `software/hcp-terraform-run-ui.png` | https://developer.hashicorp.com/terraform/cloud-docs/workspaces/run/ui | the run as a routed page with a plan, an apply and a confirm |
| `software/pulumi-preview.png` | https://www.pulumi.com/docs/iac/cli/commands/pulumi_preview/ | preview before apply |
| `software/pulumi-up.png` | https://www.pulumi.com/docs/iac/cli/commands/pulumi_up/ | the confirm step over a diff |
| `software/kubectl-diff.png` | https://kubernetes.io/docs/reference/kubectl/generated/kubectl_diff/ | diff before apply |
| `software/helm-diff.png` | https://github.com/databus23/helm-diff | coloured upgrade diff, README |
| `software/github-compare.png` | https://github.com/react/react/compare/v18.2.0...v18.3.1 | these files will change, counted, as a route |
| `software/github-compare-files.png` | https://github.com/tailwindlabs/tailwindcss/compare/v3.4.0...v3.4.1 | second instance of the compare route |
| `software/wikipedia-history.png` | https://en.wikipedia.org/w/index.php?title=Boat&action=history | the change list before the diff |
| `software/wikipedia-diff.png` | https://en.wikipedia.org/w/index.php?title=Boat&action=history | **did not serve it** — the prev click landed on the legend text; still the history page |
| `software/stripe-prorations.png` | https://docs.stripe.com/billing/subscriptions/prorations | pricing a mid-term change |
| `software/stripe-subscription-change.png` | https://docs.stripe.com/billing/subscriptions/change | preview the invoice before committing the change |
| `software/linear-docs-issues.png` | https://linear.app/docs/deleting-issues | **did not serve it** — 404 |
| `software/linear-docs-teams.png` | https://linear.app/docs/teams | what a team delete takes with it |
| `software/vercel-instant-rollback.png` | https://vercel.com/docs/instant-rollback | swapping one committed state for another |
| `software/vercel-deployments.png` | https://vercel.com/docs/deployments | the deployment as an addressable immutable state |
| `software/gdocs-suggestions.png` | https://support.google.com/docs/answer/6033474#zippy=%2Caccept-or-reject-all-suggestions | a proposed change struck in place with accept/reject in the margin |
| `software/word-track-changes.png` | https://support.microsoft.com/en-au/word/training/track-changes-in-word | insertion and deletion drawn in the document, reviewed one at a time |
| `software/excel-trace-precedents.png` | https://support.microsoft.com/en-au/excel/display-the-relationships-between-formulas-and-cells | the beam: tracer arrows drawn from a cell to what depends on it |
| `software/uv-resolution.png` | https://docs.astral.sh/uv/concepts/resolution/#platform-specific-resolution | the causal chain in prose |
| `software/govuk-check-answers.png` | https://design-system.service.gov.uk/patterns/check-answers/ | a decision summarised row by row with a Change link per row |
| `software/govuk-error-summary.png` | https://design-system.service.gov.uk/components/error-summary/ | problems listed as links that jump to the control that caused them |
| `software/polaris-banner.png` | https://shopify.dev/docs/api/polaris | **did not serve it** — redirected to shopify.dev API index |
| `software/atlassian-modal.png` | https://atlassian.design/components/modal-dialog/examples | the confirm dialog that names what it will do |
| `software/m3-dialogs.png` | https://m3.material.io/components/dialogs/guidelines | dialog guidance |
| `software/primer-dialog.png` | https://primer.style/product/components/dialog/ | GitHub's own dialog, including the destructive variant |
| `software/spectrum-alert-dialog.png` | https://spectrum.adobe.com/page/alert-dialog/ | Adobe's rules for a destructive confirmation |
| `software/base-ui-alert-dialog.png` | https://base-ui.com/react/components/alert-dialog | the primitive this repo already uses |

## software2

| frame | url | one line |
|---|---|---|
| `software2/terraform-plan-output.png` | https://developer.hashicorp.com/terraform/cli/commands/plan#understand-plan-output | the plan's own symbols and the summary line |
| `software2/terraform-resource-behavior.png` | https://developer.hashicorp.com/terraform/language/resources#how-terraform-applies-a-configuration | create, destroy, update in place, destroy and re-create — the four verbs |
| `software2/terraform-forces-replacement.png` | https://developer.hashicorp.com/terraform/tutorials/aws-get-started/aws-manage#apply-changes | attempt at the forces-replacement annotation |
| `software2/hcp-terraform-confirm.png` | https://developer.hashicorp.com/terraform/cloud-docs/workspaces/run/ui#confirming-or-discarding-plans | Confirm & Apply versus Discard, as named acts on a routed run |
| `software2/wikipedia-diff-real.png` | https://en.wikipedia.org/w/index.php?title=Boat&diff=prev&oldid=1344275500 | the two-column diff with the edit summary carrying the reason |
| `software2/wikipedia-diff-visual.png` | https://en.wikipedia.org/w/index.php?title=Boat&diff=prev&oldid=1289254000 | **did not serve it** — oldid wins over title — this is a diff of Summit station (NJ Transit), not Boat |
| `software2/github-compare-files.png` | https://github.com/react/react/compare/v18.2.0...v18.3.1#files_bucket | **did not serve it** — the files anchor did not scroll; the commit list again |
| `software2/github-pr-files.png` | https://github.com/tailwindlabs/tailwindcss/discussions/12000 | **did not serve it** — that number is a discussion, not a pull request |
| `software2/linear-docs-teams-2.png` | https://linear.app/docs/teams | what deleting a team takes with it |
| `software2/linear-changelog.png` | https://linear.app/changelog | how Linear narrates a consequential change |
| `software2/linear-method-decisions.png` | https://linear.app/method | Linear's own writing about decisions |
| `software2/nng-confirmation-dialog.png` | https://www.nngroup.com/articles/confirmation-dialog/ | the published rules for a confirmation that explains |
| `software2/nng-undo.png` | https://www.nngroup.com/articles/undo/ | **did not serve it** — 404 |
| `software2/dbt-lineage.png` | https://docs.getdbt.com/docs/build/documentation?version=2 | a lineage graph where selecting a node shows what depends on it |
| _software2/dagster-asset-graph_ | https://docs.dagster.io/guides/build/assets/ | **no frame** — page.goto: net::ERR_NETWORK_CHANGED at https://docs.dagster.io/guides/build/asse |
| _software2/exceljet-trace-precedents_ | https://exceljet.net/glossary/trace-precedents | **no frame** — page.goto: net::ERR_NAME_NOT_RESOLVED at https://exceljet.net/glossary/trace-pre |
| _software2/excel-detect-errors_ | https://support.microsoft.com/en-au/office/detect-errors-in-formulas-3a8acca5-1d61-4702-80e0-99a36a2822c1 | **no frame** — page.goto: net::ERR_NAME_NOT_RESOLVED at https://support.microsoft.com/en-au/off |
| _software2/word-accept-changes_ | https://support.microsoft.com/en-au/office/accept-tracked-changes-firstsignin-2d5c3bff-3cd8-4b3b-a0c5-ac0e7a00c06b | **no frame** — page.goto: net::ERR_NAME_NOT_RESOLVED at https://support.microsoft.com/en-au/off |
| _software2/sheets-version-history_ | https://support.google.com/docs/answer/190843 | **no frame** — page.goto: net::ERR_NAME_NOT_RESOLVED at https://support.google.com/docs/answer/ |
| _software2/stripe-preview-invoice_ | https://docs.stripe.com/billing/subscriptions/prorations#preview-proration | **no frame** — page.goto: net::ERR_NAME_NOT_RESOLVED at https://docs.stripe.com/billing/subscri |
| _software2/shopify-polaris-destructive_ | https://polaris.shopify.com/patterns/destructive-action | **no frame** — page.goto: net::ERR_NAME_NOT_RESOLVED at https://polaris.shopify.com/patterns/de |
| _software2/carbon-danger_ | https://carbondesignsystem.com/patterns/dialog-pattern/ | **no frame** — page.goto: net::ERR_NAME_NOT_RESOLVED at https://carbondesignsystem.com/patterns |
| _software2/base-ui-alert-dialog-2_ | https://base-ui.com/react/components/alert-dialog | **no frame** — page.goto: net::ERR_NAME_NOT_RESOLVED at https://base-ui.com/react/components/al |
| _software2/sonner-toast_ | https://sonner.emilkowal.ski/ | **no frame** — page.goto: net::ERR_NAME_NOT_RESOLVED at https://sonner.emilkowal.ski/ |

## software3

| frame | url | one line |
|---|---|---|
| `software3/dagster-asset-graph.png` | https://docs.dagster.io/guides/build/assets | upstream and downstream drawn from the selected node |
| `software3/exceljet-trace-precedents.png` | https://exceljet.net/glossary/trace-precedents | **did not serve it** — 404 |
| `software3/excel-detect-errors.png` | https://support.microsoft.com/en-au/excel/detect-formula-errors-in-excel | error tracing, arrows from the error to its cause |
| `software3/word-accept-changes.png` | https://support.microsoft.com/en-au/topic/2d5c3bff-3cd8-4b3b-a0c5-ac0e7a00c06b | **did not serve it** — Office.com error page |
| `software3/sheets-version-history.png` | https://support.google.com/docs/answer/190843 | the named version you can return to |
| `software3/shopify-polaris-destructive.png` | https://shopify.dev/docs/api/polaris | **did not serve it** — redirected to shopify.dev API index |
| `software3/carbon-dialog-pattern.png` | https://carbondesignsystem.com/patterns/dialog-pattern/ | IBM's dialog pattern, including the danger variant |
| `software3/base-ui-alert-dialog-2.png` | https://base-ui.com/react/components/alert-dialog | the primitive this repo already uses |
| `software3/sonner-toast.png` | https://sonner.emilkowal.ski/ | the undo toast this repo already uses |
| `software3/nng-undo-2.png` | https://www.nngroup.com/articles/undo-redo/ | **did not serve it** — 404 |
| `software3/vscode-merge-editor.png` | https://code.visualstudio.com/docs/sourcecontrol/overview | the three-way merge editor: incoming, current, result |
| `software3/figma-version-history.png` | https://help.figma.com/hc/en-us/articles/360038006754-View-a-file-s-version-history | a named restore point |

## drive

| frame | url | one line |
|---|---|---|
| `drive/whaler-engines.png` | https://www.bostonwhaler.com/us/en/boat-configurator.13SPT# | attempt: the engine chapter, where a choice can exclude a top |
| _drive/whaler-options_ | https://www.bostonwhaler.com/us/en/boat-configurator.13SPT | **no frame** — locator.click: Timeout 8000ms exceeded. |
| _drive/whaler-summary_ | https://www.bostonwhaler.com/us/en/boat-configurator.13SPT | **no frame** — locator.click: Timeout 8000ms exceeded. |
| `drive/apple-mbp14-deep.png` | https://www.apple.com/au/shop/buy-mac/macbook-pro/14-inch | the chip group and the groups it narrows in one view |
| `drive/apple-mbp14-deeper.png` | https://www.apple.com/au/shop/buy-mac/macbook-pro/14-inch | further down the same ladder |
| `drive/apple-mac-studio-deep.png` | https://www.apple.com/au/shop/buy-mac/mac-studio | the memory ladder rewritten by the chip |
| `drive/pcpartpicker-builder.png` | https://pcpartpicker.com/list/ | the empty builder, every row named before anything is chosen |
| `drive/searay-build-scrolled.png` | https://www.searay.com/global/en/build | the builder's own entry |
| `drive/hermanmiller-aeron-retry.png` | https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/2195348.html?sku=100073872 | **did not serve it** — bot challenge again |
| `drive/sonos-immersive-set.png` | https://www.sonos.com/en-au/shop/speaker-sets | **did not serve it** — Access Denied (WAF) |
| _drive/porsche-911-summary_ | https://configurator.porsche.com/en-AU/mode/model/9921B2 | **no frame** — locator.click: Timeout 8000ms exceeded. |
| _drive/porsche-911-search_ | https://configurator.porsche.com/en-AU/mode/model/9921B2 | **no frame** — locator.click: Timeout 8000ms exceeded. |
