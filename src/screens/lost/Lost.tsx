import { Button } from '@/ui'
import { NO_WAYS, type Way } from '@/app/ways'
import './lost.css'

/* ============================================================
   THE DEAD END, DRAWN — the screen a mistyped address lands on, and
   the screen any other screen falls onto when it throws.

   WHAT WAS THERE BEFORE. Measured by the flow critique on the running
   app, 2026-09-17, at `/nope`: body background `rgb(255,255,255)`, the
   two words `Not Found`, ZERO buttons, no dealership and no way back.
   `src/routes/__root.tsx` set no `errorComponent` and `src/main.tsx`
   no `defaultErrorComponent`, so every screen that threw landed on that
   same white page — in an app that is otherwise entirely dark and
   named. It was the only surface in this repository that a person could
   reach and not leave.

   WHAT THIS SCREEN DOES THAT NO OTHER SCREEN DOES. It draws an address
   the app does not have, as the subject: set large, in the mono face,
   wrapped and never truncated, with a label saying it is what was
   asked for. Every other screen in this app is about a boat, a
   document or a register; this one is about the address bar, because
   that is the only thing a person who arrives here has.

   AND IT IS THE FIRST SCREEN IN THE APP MADE OF LINKS. The same
   critique grepped `src/screens`, `src/ui` and `src/routes` and found
   not one `<a>` anywhere: every move between screens was a button
   calling the router, on an app where every position is already a real
   address. `Button` grew an `href` for this (see its own comment), so
   each way out here is a real link — copyable, middle-clickable,
   openable in a new tab — that still navigates without a page load
   when it is plainly clicked. A person who lands here mistyping an
   address is exactly the person who wants to correct it and try again.

   THREE STATES, AND ONE OF THEM IS AN ERROR. An address with no screen
   behind it; a screen that threw while drawing, whose own words are
   printed verbatim and never paraphrased, with a way to try it again;
   and a render handed no ways at all, which says so rather than
   drawing an empty room. Nothing here invents a reason.
   ============================================================ */

/** What a screen said when it threw. Narrowed to the one field this
 *  screen prints, so a route can hand over an `Error`, a thrown string
 *  it has already made a message of, or anything else with a message —
 *  and this screen never reaches for a stack or a name it would then
 *  have to decide how to draw. */
export interface Thrown {
  message: string
}

export interface LostProps {
  /** The address that was asked for, exactly as the router has it. */
  address: string
  /** The dealership whose app this is, if this browser knows one. */
  business?: string | null
  /** The ways out, in the order a person needs them. THE FIRST ONE IS
   *  THE ACT — the one warm rectangle on the screen — and the rest are
   *  doors beneath it. `src/app/ways.ts` holds the list and the route
   *  hands it down, so a screen never writes an address of its own. */
  ways?: readonly Way[]
  /** Set when a screen threw rather than an address being absent. */
  thrown?: Thrown | null
  /** Draw this screen's route again, for the thrown case only. */
  retry?: () => void
  /** Follow a way without a page load. Without it the links are still
   *  links and the browser follows them itself, which is the honest
   *  fallback: a component test has no router, and a way out that
   *  silently did nothing would be the pretending this app exists not
   *  to do. */
  go?: (href: string) => void
}

/** Said when a render is handed nowhere to go. It cannot happen in the
 *  app — `src/routes/__root.tsx` always passes the front doors — and it
 *  is what this screen says instead of drawing an empty room. */
export const NO_WAY_OUT =
  'No way out was handed to this screen, so there is nothing here to press. The address bar is the way back.'

/** The longest address this screen sets as a specimen. Past it the
 *  address is still shown, cut, and the cut is said out loud with the
 *  true length — because a 4,000-character address is somebody probing,
 *  not somebody mistyping, and a screen that reflected the whole of it
 *  would be handing the probe a canvas. The same 120 the route files
 *  use when they read a search param. */
const SPECIMEN = 120

export function Lost({
  address,
  business = null,
  ways = NO_WAYS,
  thrown = null,
  retry,
  go,
}: LostProps) {
  const named = business !== null && business.trim() !== '' ? business.trim() : null
  const cut = address.length > SPECIMEN
  const shown = cut ? address.slice(0, SPECIMEN) : address
  const act = ways[0]
  const rest = ways.slice(1)

  return (
    <main className="lost" data-testid="lost">
      <div className="lost-band">
        <header className="lost-head">
          <p className="lost-eyebrow">{named ?? 'This business has not been named yet'}</p>
          <h1 className="lost-say">
            {thrown ? 'This screen stopped.' : 'There is nothing at this address.'}
          </h1>
        </header>

        {/* THE SPECIMEN. The address is the subject of this screen, so
            it is set as one: labelled, in the mono face, at display
            size, wrapping at any character so that neither a long path
            nor a 390px window can push it off the side. */}
        <figure className="lost-at">
          <figcaption className="lost-at__lab">The address asked for</figcaption>
          <p className="lost-at__is" data-testid="lost-address">
            {shown}
          </p>
          {cut ? (
            <p className="lost-at__cut">
              Cut here: the address is {String(address.length)} characters long and this shows the
              first {String(SPECIMEN)}.
            </p>
          ) : null}
        </figure>

        {thrown ? (
          <section className="lost-threw" aria-label="What the screen said">
            <p className="lost-threw__lab">What it said, word for word</p>
            <p className="lost-threw__is" role="alert">
              {thrown.message}
            </p>
            {retry ? (
              <span className="lost-threw__act">
                <Button intent="veiled" onClick={retry}>
                  Draw it again
                </Button>
              </span>
            ) : null}
          </section>
        ) : (
          <p className="lost-why">
            Every position in this app is a real address, so this one was read and no screen answers
            to it. <b>Nothing has been lost.</b> A quote lives in the browser it was written in, and
            every quote written here is still filed.
          </p>
        )}

        {act ? (
          <div className="lost-go">
            <span className="lost-act">
              <Button
                intent="act"
                href={act.href}
                onClick={
                  go
                    ? () => {
                        go(act.href)
                      }
                    : undefined
                }
              >
                {act.title}
                {/* the arrow is the screen's child: a primitive draws no ornament */}
                <span className="lost-act__arrow" aria-hidden="true">
                  &rarr;
                </span>
              </Button>
            </span>
            <p className="lost-act__say">{act.say}</p>
          </div>
        ) : (
          <p className="lost-why" role="alert">
            {NO_WAY_OUT}
          </p>
        )}

        {rest.length > 0 ? (
          <nav className="lost-ways" aria-label="Also in this app">
            <p className="lost-ways__lab">Also in this app</p>
            <ul className="lost-ways__list">
              {rest.map((way) => (
                <li key={way.href} className="lost-way">
                  <Button
                    intent="veiled"
                    size="door"
                    href={way.href}
                    onClick={
                      go
                        ? () => {
                            go(way.href)
                          }
                        : undefined
                    }
                  >
                    <span className="lost-way__says">
                      <span className="lost-way__title">{way.title}</span>
                      <span className="lost-way__sub">{way.say}</span>
                    </span>
                    {/* THE ADDRESS, where entry's doors carry an arrow: on
                        this one screen the address is the point. It is
                        aria-hidden because it is a VISUAL restatement of
                        the href — a reader already has the address from
                        the link itself, and hearing "/quote/new" spelled
                        after the sentence that explains it is noise. */}
                    <span className="lost-way__at" aria-hidden="true">
                      {way.href}
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </main>
  )
}
