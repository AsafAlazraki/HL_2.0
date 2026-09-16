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
