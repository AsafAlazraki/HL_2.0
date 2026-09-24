import { Kbd } from '@/ui'
import type { Door, Surface } from '@/app/ways'
import type { Crest } from '@/domain/shell/crest'
import type { DoorCount } from '@/domain/shell/doors'

/* ============================================================
   THE PILL — direction A of docs/research/refs/shell/notes.md §5,
   assigned rather than picked (docs/DECISIONS.md, 2026-09-23).

   ONE OBJECT, FLOATING, ON EVERY SCREEN BUT ENTRY, AND THE SAME
   OBJECT ON EVERY ONE OF THEM. No rail and no bar: the crest is its
   leading cap, the five doors are its words, and the finder is its
   trailing bubble; only which door is lit changes between screens. It costs no layout height,
   which is why it is the only one of the four directions that leaves
   Home's two-photograph fold full-bleed AND leaves the register's
   eighteen rows whole — §9 of the critique prices what the other two
   compositions do to both.

   WHY IT IS NOT A BUTTON FROM src/ui. The primitives refuse
   `className` on purpose and each one draws its own frame. A door on
   this pill is a LINK inside one object, not a control beside other
   controls: five `Button`s in a row would draw five frames inside a
   sixth, and the shape the sweep measured — Apple's 2026 floating tab
   bar with search as a separate trailing bubble
   (`live2/apple-hig-tab-bars-ipad.png`), Craft's centred place pill
   between its arrows (`live/craft-home-rail.png`) — is one frame with
   words in it. The keycaps ARE primitives, because a keycap is the
   one thing here that already had a drawing — and the primitive is
   what takes itself away on a phone (`src/ui/kbd.css`).

   EVERY DOOR IS A REAL `<a href>`. 2026-09-18 found that not one `<a>`
   existed in this app and every move between screens was a button
   calling the router; `src/ui/Button.tsx` fixed it for controls and
   this keeps it true for navigation. A plain click is handled by the
   router; a middle click, a ctrl-click and the context menu are the
   browser's, which is what a person expects of a navigation bar.

   THE MARK IS THE SHOWPIECE AND THE SEED DOES NOT CARRY ONE.
   `marks-ledger.json` holds eighteen rows for boat brands and nothing
   for Northside Marine, so the crest is drawn by construction: with a
   dealership's own image when `--shell-crest` names one, with the
   business's initials set in type when it does not — the seeded case,
   and so the one this is judged on — and, before any file has named a
   business, with the helm this app is named for
   (`src/domain/shell/crest.ts` says why the helm and not a person's
   initials). It is never an empty disc (critique of Milestone 2, #21).
   ============================================================ */

export interface PillDoor {
  door: Door
  /** whether the address on screen is behind this door */
  here: boolean
  /**
   * THE COUNT ON THE DOOR, kept from direction B, which is the only
   * one of the four that put a figure where a person can see it
   * without opening anything (`live/linear-personalized-sidebar.png`,
   * "with a count or dot"; `live/github-repo-nav.png`'s `Issues 5k+`).
   *
   * It is the figure the screen behind the door prints, read by
   * `readDoorCounts`; `null` draws nothing, which is what an unread
   * store or an unmade book honestly is. Its `waiting` is whether any
   * of it is work waiting — open drafts, and nothing else — which the
   * phone draws as a dot, Material's own rule for a badge ("critical
   * information") read literally.
   */
  count: DoorCount | null
}

export interface PillProps {
  /** the dealership, read off what was opened; null is honest */
  business: string | null
  /** what the leading cap draws */
  crest: Crest
  doors: readonly PillDoor[]
  /** a photograph under it, or a register */
  surface: Surface
  /** a plain click, handled by the router rather than the browser */
  go: (href: string) => void
  /** open the finder */
  find: () => void
  /** whether the finder is open, so the bubble says so */
  finding: boolean
}

/**
 * THE HELM, DRAWN — the product's own sign, for the crest before a file has named a business.
 * A rim, a hub and eight spokes that run past the rim as handles: the object the app is named
 * for, in the crest's own ink (`currentColor`), so a dealership's colour reaches it with no
 * rebuild. It is a drawing and not the U+2388 glyph, because that code point is missing from
 * the system faces of half the phones this app is opened on and would arrive as a box.
 */
function Helm() {
  return (
    <svg
      className="way-crest__helm"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M12 2.5v19M2.5 12h19M5.28 5.28l13.44 13.44M18.72 5.28 5.28 18.72" />
      <circle cx="12" cy="12" r="6.2" />
      <circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function Pill({ business, crest, doors, surface, go, find, finding }: PillProps) {
  const home = doors.find((d) => d.door.href === '/')

  const press = (event: React.MouseEvent, href: string): void => {
    /* THE BROWSER KEEPS ITS OWN CLICKS. Only a plain left click is
       ours; everything else is how a person opens a second tab, and
       taking it would make this bar the one part of the app a link
       does not behave in. Identical to `src/ui/Button.tsx`'s rule. */
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return
    }
    event.preventDefault()
    go(href)
  }

  return (
    <nav
      className="way-pill"
      data-surface={surface}
      data-testid="shell-pill"
      aria-label={business ? `${business} — go to` : 'Go to'}
    >
      {/* THE CREST IS THE PILL'S OWN LEADING CAP — a medallion the full
          height of the capsule and concentric with its rounded end, not
          a disc set inside it. `data-crest` says which drawing it is,
          and the KEY makes a change of drawing a new element, so the
          business's initials arrive once, visibly, when the file names
          them (`shell.css`, "the one thing that moves"). */}
      <a
        className="way-crest"
        data-crest={crest.kind}
        href="/"
        aria-label={`${crest.name} — Home`}
        aria-current={home?.here ? 'page' : undefined}
        onClick={(e) => press(e, '/')}
      >
        {crest.kind === 'initials' ? (
          <span key={crest.initials} className="way-crest__mark" aria-hidden="true">
            {crest.initials}
          </span>
        ) : (
          <Helm key="helm" />
        )}
      </a>

      {/* NO `‹` HERE, and that is rule (a) (2026-09-23). The first cut
          drew one named for where it went, and every one of them said a
          destination the same window already said: `‹ Data` three words
          from a lit `Data 53`, `‹ Quotes` from a lit `Quotes 1`,
          `‹ The build` above the paper's own "Back to the build"
          (critique #13, "four ways back in one window"). The lit door is
          the way back to its register, and a screen inside a document
          carries its own way back, which knows the chapter it came from.
          So the pill is the same object on every screen — crest, five
          doors, finder — and only which door is lit changes. */}
      <ul className="way-doors">
        {doors.map(({ door, here, count }) => (
          <li key={door.href} className="way-door">
            {/* THE COUNT'S NOUN IS SAID ALOUD AND NOT DRAWN. "3" beside Quotes means
                nothing read out; "Quotes — 3 filed, 1 of them an open draft" is the whole
                sentence, and it is the door's accessible name rather than a second run of
                text on a bar with no room for one. A door whose store has not answered is
                named by its word alone, because there is no figure yet to say. */}
            <a
              className="way-door__a"
              href={door.href}
              aria-label={count === null ? door.word : `${door.word} — ${count.say}`}
              aria-current={here ? 'page' : undefined}
              onClick={(e) => press(e, door.href)}
            >
              <span className="way-door__word">{door.word}</span>
              {count === null ? null : (
                <span
                  className="way-door__count"
                  aria-hidden="true"
                  data-waiting={count.waiting ? '' : undefined}
                >
                  {count.count.toLocaleString('en-AU')}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>

      {/* THE FINDER IS A BUBBLE OF ITS OWN, at the trailing end, with
          a gap between it and the words: Apple's own 2026 form, "a
          dedicated search tab at the trailing end". Attio puts
          `Quick Actions ⌘K` at the head of its rail for the same
          reason — the finder is found by eye and not only by chord.
          Its accessible name is the word, never the chord: on a phone
          there is no chord to name. */}
      <button
        type="button"
        className="way-find"
        onClick={find}
        aria-label="Find"
        aria-haspopup="dialog"
        aria-expanded={finding}
      >
        <span className="way-find__glyph" aria-hidden="true">
          ⌕
        </span>
        <span className="way-find__word" aria-hidden="true">
          Find
        </span>
        <span className="way-find__keys" aria-hidden="true">
          <Kbd tone="quiet">Mod K</Kbd>
        </span>
      </button>
    </nav>
  )
}
