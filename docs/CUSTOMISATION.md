# Customisation: the dealer controls the look

The owner, 2026-09-17: "things should be so dynamic so users can control everything and set their own backgrounds and blah blah like full massive customisability".

Clarified by the owner the same day: **the functionality comes first.** "nice to have so get it done first. make sure functionality is great." So nothing here is built in Milestone 1. What Milestone 1 owes this document is only that it does not make it expensive later: every value is a token, no screen hard-codes a colour, a face or a picture path, and the appearance record has a place to live in the repository seam. Building the panels that set these things is Milestone 4, beside the organisation record they belong to.

It is written down now, before the first screen is built, because it decides how tokens, appearance records and pictures are shaped, and those are the things that are hard to retrofit. The discipline is free; the panels are not.

**Where it applies, when it is built:** the entry screen's background, home and its dashboard, every place (module) page, the configurator's stage and chapter grounds, the document's cover, and every register's density. In other words the screens a customer or a dealer actually looks at, not the plumbing.

## The tension, stated honestly

Two of the owner's standards pull against each other. One: every screen must be genuinely beautiful, judged by eye against the best configurators in the world. Two: the dealer can change everything. A free-for-all reliably produces a screen nobody designed, and the usual result is grey text on a busy photograph.

The resolution is not to limit the ambition. It is that **every choice is bounded and every consequence is measured**:

- The defaults are designed, picked from a direction board, and excellent on their own.
- A choice sets a value the app then *measures*. A photograph gets a scrim computed from its own pixels so the words on it keep their contrast. A brand colour is checked against the ground it will actually sit on.
- When a choice cannot be honoured, the app says so in a sentence with the reason, where the choice was made, and offers the nearest thing that works. It never silently substitutes, and it never silently ships an unreadable screen.

That is the same rule the rest of the app already follows: a refusal is a sentence, and nothing is invented.

## Three layers, one mechanism

`src/styles/tokens.css` declares every colour, face, size, radius, shadow, easing and duration under `@theme static`, so all of them are emitted as CSS custom properties on `:root` whether or not a utility uses one. That is the whole mechanism: a later layer overrides an earlier one by setting the same custom property on a narrower scope. No rebuild, no recompiled stylesheet, no second design system.

| layer | scope | stored in | who it belongs to |
|---|---|---|---|
| Defaults | `:root` from `tokens.css` | the build | the designed product |
| Organisation | one `<style>` element written at boot | `OrgRepository`, an `Appearance` record with `orgId` | the dealership, shared by everyone in it |
| Person | the same element, written after the organisation's | `src/state/prefs.ts` (the only `localStorage` user) | this browser only |

A screen never reads an appearance record. It reads `var(--color-accent)` like everything else, and the cascade does the work. That is what keeps customisation from leaking into every component.

## What is settable

- **Identity.** The mark and the wordmark, uploaded or pasted by address. The owner's standing note: "I want the logo to be the showpiece thing", so a place and the organisation each carry their own, at a size the screen can actually use.
- **Colour.** A brand colour, from which the app derives the scale rather than asking for eleven values. "Blue and white was the brief" is the default, not a cage; "a bit more colour usage please" is the direction.
- **Pictures.** A background for the entry screen, a hero for home, a cover for every place, a cover for a document. Each is the dealer's own picture or one chosen from the image ledger.
- **Density.** Row height on every register: dense, default, comfortable. The measured numbers are in the plan.
- **Shape.** Corner radius and shadow depth, as a small set of named steps rather than free numbers.
- **Type.** A face from a bounded list that ships with the app, so a choice cannot produce a missing font.
- **Motion.** Full or reduced, on top of the operating system's own setting, which always wins when it says reduce.
- **Words.** The dealership names its own stages, roles and document sections. It already does; this is the same principle applied to appearance.

## What is not settable, and why

- Anything that would put a cost or a margin on a customer-facing surface. The price levels and the cost columns are facts of the price file, not preferences.
- The refusal sentences and the reasons attached to them. A dealer may reword their own terms; they may not turn an explanation off.
- The price figure's behaviour. It never counts up and it never animates on an issued document.
- The contrast floor. A choice that would put text under 4.5:1 on its own ground is refused with the reason, not rendered.

## How a picture the dealer uploads is treated

It is theirs, so it is not fake data, and it is not held to the "only the exact model it depicts" rule that governs manufacturer photography. But it is recorded in the image ledger with its origin marked as the dealership's own upload, so it is never confused with a picture sourced from a maker, and an export carries the distinction.

## What this means for work already planned

- **Milestone 1** screens are built reading tokens only. No screen hard-codes a colour, a face or a picture path. The guard in `tools/check.ts` already refuses a literal colour and an undeclared token, which is exactly the discipline this needs.
- **Every direction board from home onward** must say which parts of its composition Northside can change from its own settings — the photograph, the mark, the accent, the density — and what the screen looks like when it has. A direction that only works with the photograph it was drawn on breaks the first time Northside changes its pictures. (Narrowed 2026-09-23: this is Northside Marine's app, and customisation is Northside setting its own look — never a second dealership re-skinning it.)
- **Milestone 4** already carries the organisation record, its logos and its brand colours from the original HelmLogic. The `Appearance` record is that record, widened, and the seam for it exists.
- **The scrim is a real piece of engineering, not a CSS opacity.** It is computed from the picture's own pixels in the region the text sits over. The packer already judges every picture scene or studio from its pixels, so the machinery and the precedent are both here.

## The open question for the owner

How far does "everything" go? There is a real difference between a dealership choosing its colour, its mark and its photographs, and a dealership being handed the layout. The first is a product. The second is a page builder, and a page builder is a different product with a different amount of work behind it. The plan assumes the first, generously drawn. Say if you want the second and it becomes its own milestone.
