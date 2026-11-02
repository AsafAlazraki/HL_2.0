# Galleries — what the build page and the paper need

Written 2026-11-02 by the galleries builder for the builders of `src/screens/configurator/`
(the build page and View final package) and `src/screens/document/` (the printed quote), which
this round did not touch. Everything named here exists on this tree and is covered by tests.

## What a gallery is

Every option (one row of the price list: a boat, a motor, a trailer, a part, a package, a
colour) has **one ordered gallery**: the pictures the app holds of that exact row (the model on
the water, the price list's own picture of the row, the model's studio picture — each once) and
every picture Northside added to it, oldest first. **One is the cover, and it is always first.**
By default the cover is the picture the row was always drawn with, so a row nobody arranged looks
exactly as before. A dealer may choose another (held or his own) and move the others.

Pure rules: `src/domain/model/gallery.ts` (`withGalleries`, `printableOnCover`,
`printableOnLine`, `sourceOf`, `standingOf`). Commands: `src/domain/catalogue/pictureCommands.ts`
(`addOwnPictures`, `removeOwnPicture`, `coverPicture`, `movePicture`), each with its inverse and a
`picture-set` event; the arrangement is its own record (`GalleryOrder`), kept in IndexedDB
(`galleries`, Dexie version 4) and carried in a full backup (`galleries` beside `ownPictures`).

## Showing the cover: mostly nothing to do

**Where the dealer chose a cover, every existing question already answers with it** — the build
page draws it without a change:

| Already called on this tree | Now answers |
| --- | --- |
| `heroOf(item)`, `heroOfQuote(quote)` (the stage, Home, Quotes, the cascade) | the chosen cover |
| `pictureOf(item)`, `pictureOfQuote(quote)` (Customers, History) | the chosen cover |
| `catalogueOf(item)` | the chosen cover |
| `copyOf(item)` (every tile) | the chosen cover **where it is exactly this row**; otherwise as before |
| `coverOfQuote(quote)` (the paper's cover) | the chosen cover **where the paper may print it** (`printableOnCover`), else the paper's own ladder |
| `lineOf(item)` (a line on the paper) | the chosen cover **where a line may carry it** (`printableOnLine`), else as before |

All from `@/data/pictures`. `item` is `itemOf(table, row, address)` — pass the row's own picture
address (`subjectImage?.src`, `line.image?.src`) as before: it is how the price list's own picture
joins the gallery.

To ask for the cover by name: **`coverOf(item)`** → `HeldPicture | null` (the gallery's first).
**`chosenCoverOf(item)`** → the cover only where the dealer chose one.

## Offering the gallery on the build page

1. **The whole gallery of one row:** `galleryOf(item)` → `readonly HeldPicture[]`, the cover
   first; `galleryOfQuote(quote)` for the boat on the quote. In a component, use
   **`useGallery(item)`** from `@/app/optionPicture` — it re-reads when the pictures, their
   arrangement or the price list move.
2. **Large, with the dealer's acts** (a dealer's screen): **`<RowGallery item name kind at onAt />`**
   from `@/app/RowGallery` — the kit's `Lightbox` with the row's gallery, arrows, swipe, the count,
   the cover marked, the strip of every picture, and `GalleryActs` under the picture (Add pictures,
   Make it the cover, Earlier, Later, Take it off). Keep it mounted and set `at` to null to close,
   so the plate's exit is seen. **In front of a customer, pass `manage={false}`**: the gallery
   only, no acts.
3. **Large, inside the build's own `Lightbox` state** (the `showLarge(set, at, title)` the
   configurator already keeps): build the set with
   `largeOf(name, shotsOf(galleryOf(item), name))` (`largeOf` from `@/ui`, `shotsOf` from
   `@/app/optionPicture`), open it at `placeIn(gallery, drawn)` (`@/data/pictures`) where `drawn`
   is the picture the tile shows, and pass **`strip`** to `<Lightbox>` so the gallery's pictures
   show under it. Each picture carries `cover: true` on the first and `note` where a held picture
   is not exactly this row (`standingOf`).
4. **Adding and arranging from the build** where it is natural (a tile with no picture, the boat's
   own panel): **`<AddPicture {...useOptionPicture(item, name, kind)} />`** — the same control the
   price list's details and the catalogue use. It shows the cover, the strip, the provenance of
   the picture picked, and the acts; its frame opens the gallery large.

### One contract that moved under the build

`Chandlery`'s `onLarge(set, at, title)` is unchanged in shape, but **`set` is now the pressed
part's own gallery** (cover first) and `title` is that part's name — no longer every pictured part
of the shelf. The build-page spec's motor walk (`1 of N · Motor`) is the configurator's own
lightbox and is untouched. A screen that wants the acts passes `onGallery(item, name, at)` to
`Chandlery` and renders `RowGallery` (as `/catalogue` does).

## The paper

Nothing is required for the cover and the lines to use each row's cover: `coverOfQuote(quote)`
and `lineOf(item)` answer with it where the paper may print it. If the paper wants a page of the
boat's pictures, take `galleryOfQuote(quote).filter(printableOnCover)` (`printableOnCover` from
`@/domain/model/gallery`) — a held photograph no person marked, or a studio picture of another
finish, never prints. The words under a printed picture: `creditOf(p)` ("Added by Asaf, 2
November 2026", or "Photograph from …") and, for a held one not exactly this row,
`galleryLineOf(p).standing`.

## Proved here

`e2e/flows/gallery.spec.ts` at 390×844, 844×390, 834×1112, 1280×800, 1440×900 and 1920×1080 (36
passed with `add-picture.spec.ts`), screenshots `docs/directions/quote-3/gallery-*.png`; the
rulers on `fitment`, `places-highfield`, `kit` and the new `sheet-record-pictures` route at all
six (84 passed, in three runs of two sizes each, all after the last fix).
