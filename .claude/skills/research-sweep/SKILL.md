---
name: research-sweep
description: Run the reference research for one HL_2.0 screen before any pixel: drive the best sites live, mine the galleries, read the existing stock, and write notes.md with named patterns and candidate references.
---

# Research sweep for one screen

Every screen starts with a sweep, not a memory. "It isn't just Porsche, there is SOOOO much more we can research and find."

## Three modalities, run in parallel

1. **Live drive.** The seed list in `docs/PLAN.md` (Phase 0) for this screen's kind, plus what the job suggests. Capture with

   ```bash
   npx tsx tools/research/capture.ts <screen>/live <list.json>
   ```

   Frames land in `docs/research/refs/<screen>/live/` (gitignored) and are mirrored to `C:\Users\Asaf\dev\hl-refs\hl2\<screen>\live`. The ledger `sources.json` beside them records the date, final URL and title of every frame. Never sign in, never create an account, never accept non-essential cookies, never fight bot protection: a site that refuses is listed under failed with the reason.
2. **Gallery mining.** recent.design (Typography, Motion, Interface), refero.design, mobbin, siteinspire, land-book, lapa.ninja, awwwards. Find the best examples in the world of this kind of screen beyond the seed list; drive them live too (`<screen>/gallery`).
3. **Existing stock.** The 176 frames the old repo captured live at `C:\Users\Asaf\dev\hl-refs\ref` (boats, Porsche, entry pages, tables) and the three configurator direction renders at `…\hl-refs\directions`. Read them; do not re-capture what is there.

## What every note must say

Look at the frame (the Read tool renders PNGs) and write what is actually there: composition, hierarchy, type (faces if identifiable, size contrast), colour, motion observed, the interaction pattern **by name**, what makes it genuinely good for *this* screen's job, and what to avoid. Note which references let photography carry the page and which are typographic. Never describe a style to copy; describe what the screen does for the person using it.

## The synthesis: `docs/research/refs/<screen>/notes.md`

1. What is genuinely best for this section and why, citing frames by path.
2. The interaction patterns worth taking, each named, one paragraph, with the frame that shows it.
3. The type and motion choices seen, with what they do for the person.
4. What to avoid, with the frame that shows the failure.
5. For each of the plan's starting directions: the two or three references that best inform it, at least two references no other board could reuse, and whether the sweep suggests a direction the plan did not name.
6. The imagery question: what the seed can honestly put on this screen, and what the best sites do when they only have renders.

Plus `sources-index.md`: every frame with its URL and one line. Under 2,500 words, every claim tied to a frame or a URL.

## Then

Add the screen's row to `docs/SCREENS.md` with its primary references, and run `directions`.
