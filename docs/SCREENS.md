# Screens

A living inventory. One row per screen: its register, the one thing it does that no other screen does, the references its board cited, the direction doc, and where it stands. A screen is "done" only after the owner has looked at it in the browser against the picked direction.

| screen | register | what only this screen does | primary references | direction doc | status |
|---|---|---|---|---|---|
| Entry (sign-in) | Showroom | says who is at the desk and opens the file, honestly not authentication until M6 | Porsche ID · BMW OneID · Polestar · Tesla · Linear · Nimbus Connect · Saxdor · Riviera ownership · Boston Whaler build · plus 40 gallery logins | `directions/entry.md` | swept (live, gallery, stock); synthesis pending |
| Home | Showroom | greets the dealer with what they sell, photographed, and one act: New quote | Nimbus builder · Porsche Finder · Saxdor · Axopar · Highfield range · Stabicraft · Zodiac · Sea Ray · Grady-White · Whaler · Riviera | `directions/home.md` | live frames captured; gallery, stock and synthesis pending |
| Quote picker → Place | Showroom | chooses the brand, then the model, with the from-price at the cash rung | — | `directions/picker.md` | not started |
| Configurator | Showroom | one chapter per decision with a live price and every refusal explained | — | `directions/configurator.md` | not started |
| Cascade | Showroom | shows what comes on, what goes, what stays and why, priced as a decision | — | `directions/cascade.md` | not started |
| Document | Showroom / paper | the issued quote on screen and on A4, pixel-faithful | — | `directions/document.md` | not started |
| Quotes register | Cockpit | every draft and issued quote, found by reference, customer or boat | — | `directions/quotes.md` | not started |

Milestone 2 onward (customers, data, sheet, history, rules, fitment, review, levels, places, organisation, people, import/export, templates, whiteboard, pipeline, admin) are added here when their sweeps begin.

Rules for this table: no two rows share a primary reference set; "same treatment as X" never appears in a direction doc; the frames a board cites live under `research/refs/<screen>/` with their source URLs in `sources.json`.
