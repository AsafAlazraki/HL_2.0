---
name: directions
description: Publish two or three static design directions for one HL_2.0 screen on real seed content, after its research sweep, so the owner can pick before anything is built.
---

# Directions for one screen

Run this after `research-sweep` has produced `docs/research/refs/<screen>/notes.md`. Never before.

## What a direction is

A static, full-fidelity picture of the screen as it would ship, drawn on real seed content: real figures from `data/northside` (the Stacer 529 Assault Pro for photographed directions, the Highfield SP560 for render-only ones), real pictures from `public/seed-images`, real counts from the manifest. Nothing invented, no lorem ipsum, no stand-in photograph, no made-up customer. An empty state is drawn as empty.

Two or three per screen, each on a different axis (composition, imagery-versus-typography, density), each named in three words. The plan (`docs/PLAN.md`, Milestone 1) names the starting axes per screen; the sweep may replace one.

## What each board must carry

- The screen's one job in a sentence, from `docs/SCREENS.md`.
- **What this screen does that no other screen does.** If the answer is nothing, the direction is stamped from another screen and is rejected.
- Two references no earlier board has cited (check `docs/directions/*.md`), plus the frames from the sweep it draws on, cited by path.
- The type specimen: faces, sizes, leading and measure, drawn at 1:1.
- Motion described as choreography (what moves, from where, how long, what stays still), not as adjectives.
- The honest constraints: what the seed cannot show (Highfield has renders only), what is not authentication, where cost never appears.
- Keyboard reach and the reduced-motion variant in one line each.

## How to publish

1. Write `docs/directions/<screen>.md` with the three directions, the references, and a **recommended** one with the reason.
2. Render the boards as one HTML canvas (the Artifact tool) at 1440×900 per direction, side by side, with the direction names and the recommended one marked. Use real images by path.
3. Tell the owner which is recommended and why in two sentences. He picks by eye.
4. If the owner is away, build the recommended direction and mark the screen **provisional** in `docs/SCREENS.md`. His standing rule: finish a phase, then start the next.

## What is not allowed

- "Same treatment as X". Each screen is designed on its own merits.
- A reference set another screen already used as its primary.
- Anything from `C:\Users\Asaf\dev\HL_Playground`'s stylesheets, tokens or components.
- A ruler deciding a size. Scale contrast is measured and reported; the owner's eye decides.

## What the entry round taught (2026-09-17)

The first four boards were honest, technically clean and genuinely different to look at, and the critic still found two faults worth carrying into every future round.

**Vary the content structure, not only the ground.** Three of the four entry boards ran the identical stack in the identical order: headline, subline, field label, field, honesty block, two doors each explained, empty-state foot. The photographs and grounds differed, so the boards *looked* different, but the thing being asked was the same shape on all of them. That is convergence dressed as variety. A brief must therefore give each direction a different **order and grouping of the content**, not just a different picture behind it, and the critic must treat a shared stack as a major finding.

**The mark is a standing requirement, not a decoration.** The owner has said "I want the logo to be the showpiece thing". Every entry board put it in a corner at eyebrow size, and one left it off entirely. Each board must now say what it does with the mark and why that answers the ask. The sweep is expected to name two or three genuinely different treatments; a board that takes none of them is not finished.

**Two more things a board must now carry**, added the same day from the owner:

- **How it reflows.** Concretely, what the composition becomes at 390px in a hand, 834px on a tablet and 1920px in an office. The rulers run at six viewports and a layout that only holds where it was drawn fails the gate.
- **What a dealer can replace.** Which parts are theirs — the photograph, the mark, the accent, the density — and what the screen looks like once they have changed them. A layout that collapses without the photograph it was drawn on breaks on day one for the second business. See `docs/CUSTOMISATION.md`.
