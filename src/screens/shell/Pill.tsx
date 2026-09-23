import { Kbd } from '@/ui'
import type { Door, StepBack, Surface } from '@/app/ways'

/* ============================================================
   THE PILL — direction A of docs/research/refs/shell/notes.md §5,
   assigned rather than picked (docs/DECISIONS.md, 2026-09-23).

   ONE OBJECT, FLOATING, ON EVERY SCREEN BUT ENTRY. No rail and no
   bar: the crest is its leading cap, the five doors are its words,
   and the finder is its trailing bubble. It costs no layout height,
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
   one thing here that already had a drawing.

   EVERY DOOR IS A REAL `<a href>`. 2026-09-18 found that not one `<a>`
   existed in this app and every move between screens was a button
   calling the router; `src/ui/Button.tsx` fixed it for controls and
   this keeps it true for navigation. A plain click is handled by the
   router; a middle click, a ctrl-click and the context menu are the
   browser's, which is what a person expects of a navigation bar.

   THE MARK IS THE SHOWPIECE AND THE SEED DOES NOT CARRY ONE.
   `marks-ledger.json` holds eighteen rows for boat brands and nothing
   for Northside Marine, so the crest is drawn TWICE by construction:
   with a dealership's own image when `--shell-crest` names one, and
   with the business's initials set in type when it does not — which
   is the seeded case and therefore the one this is judged on
   (docs/CUSTOMISATION.md, the identity slot).
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
   * `null` is "this store has not answered yet", and it draws nothing
   * — a zero printed before a read is a figure nobody measured. A
   * real zero is printed AS zero: three honest zeros on day one is
   * the same decision the quotes register's three bands already made.
   */
  count: number | null
  /** what the count is of, for the door's accessible name */
  counting?: string
  /**
   * IS THIS FIGURE WORK WAITING, or the size of the thing behind the door? Open drafts
   * are work; 51 tables and 12 people are facts about the file and the book. It matters
   * at one width only: on the phone the figure becomes a DOT, and a dot cannot say which
   * kind it is — so one is drawn for work waiting and for nothing else, which is
   * Material’s own rule for a badge ("critical information") read literally.
   */
  waiting?: boolean
}

export interface PillProps {
  /** the dealership, read off what was opened; null is honest */
  business: string | null
  doors: readonly PillDoor[]
  /** what this screen is inside, named for where it goes */
  back: StepBack | null
  /** a photograph under it, or a register */
  surface: Surface
  /** a plain click, handled by the router rather than the browser */
  go: (href: string) => void
  /** open the finder */
  find: () => void
  /** whether the finder is open, so the bubble says so */
  finding: boolean
}

/** THE INITIALS, WHEN THERE IS NO MARK. Two letters at most: the
 *  first letter of the first two words a business calls itself. A
 *  business nobody has named yet gets nothing rather than a guess —
 *  the crest is still the door Home, and its accessible name says so.
 */
export function initialsOf(business: string | null): string {
  if (!business) return ''
  const words = business
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter((w) => w !== '')
  return words
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

export function Pill({ business, doors, back, surface, go, find, finding }: PillProps) {
  const home = doors.find((d) => d.door.href === '/')
  const initials = initialsOf(business)

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
      <a
        className="way-crest"
        href="/"
        aria-label={business ? `${business} — Home` : 'Home'}
        aria-current={home?.here ? 'page' : undefined}
        onClick={(e) => press(e, '/')}
      >
        <span className="way-crest__mark" aria-hidden="true">
          {initials}
        </span>
      </a>

      {/* BACK, NAMED FOR ITS DESTINATION. The document already said
          "Back to the build" before this shell existed and the
          cascade carries `?from=`; `src/app/ways.ts` derives the same
          sentence from the address, so the three cannot disagree.
          Under 1280 the word folds away and the glyph keeps the name
          as its label, because the doors are what the pill is for. */}
      {back ? (
        <a
          className="way-back"
          href={back.href}
          /* NAMED FOR ITS DESTINATION, SAID ALOUD TOO. The chevron is
             aria-hidden, so without this the link is announced as the
             destination alone — indistinguishable from the door of the
             same name three elements along. */
          aria-label={`Back to ${back.word}`}
          onClick={(e) => press(e, back.href)}
        >
          <span className="way-back__glyph" aria-hidden="true">
            ‹
          </span>
          <span className="way-back__word">{back.word}</span>
        </a>
      ) : null}

      <ul className="way-doors">
        {doors.map(({ door, here, count, counting, waiting }) => (
          <li key={door.href} className="way-door">
            {/* THE COUNT'S NOUN IS SAID ALOUD AND NOT DRAWN. "3" beside Quotes means
                nothing read out; "Quotes — 3 open drafts" is the whole sentence, and it is
                the door's accessible name rather than a second run of text on a bar with no
                room for one. A door whose store has not answered is named by its word alone,
                because there is no figure yet to say. */}
            <a
              className="way-door__a"
              href={door.href}
              aria-label={
                count === null
                  ? door.word
                  : `${door.word} — ${count.toLocaleString('en-AU')} ${counting ?? ''}`.trim()
              }
              aria-current={here ? 'page' : undefined}
              onClick={(e) => press(e, door.href)}
            >
              <span className="way-door__word">{door.word}</span>
              {count === null ? null : (
                <span
                  className="way-door__count"
                  aria-hidden="true"
                  data-any={count > 0 ? '' : undefined}
                  data-waiting={waiting ? '' : undefined}
                >
                  {count.toLocaleString('en-AU')}
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
          reason — the finder is found by eye and not only by chord. */}
      <button
        type="button"
        className="way-find"
        onClick={find}
        aria-haspopup="dialog"
        aria-expanded={finding}
      >
        <span className="way-find__glyph" aria-hidden="true">
          ⌕
        </span>
        <span className="way-find__word">Find</span>
        <Kbd>Mod K</Kbd>
      </button>
    </nav>
  )
}
