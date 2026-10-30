# What the paper needs from the build (2026-10-31)

The printed-quote round did not change `src/screens/configurator/`, because another builder was working in it. These are the things the paper now does that the summary may want a door to. They also include what the round saw on the build.

1. **Choosing what is printed.** The section picker stands beside the paper on `/quote/$id/document`. It has switches for Specifications and Pictures beside the items. "What comes with your boat" and "Pages in Northside's words" are refused with their reasons. The summary's Print could say "Choose what is printed" and open the document page, because a quote given from the summary is given with whatever the paper has chosen (`paperOff`, kept on the quote).
2. **The summary's "Prepared by Asaf."** The summary still prints the name alone, while the paper prints the title, phone and email where Settings has them (built-m4-2.md, a minor finding).
3. **At phone, phone-landscape and tablet, the build shows no "See what Trade does".** `e2e/flows/document.spec.ts` "the photograph the picker shows is the stage, the cascade's card, the paper's cover and the customer's row" times out waiting for it. It passes at desk sizes. The test walks the cascade from the build, so the build's rung control needs a way in at those sizes, or the walk needs the new one.
4. **A tow catch filed as a trailer** prints under "Trailer" (paper-handoff item 12). This was not re-walked in this round.
