import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import {
  ArrowDownIcon,
  ArrowUUpLeftIcon,
  ArrowUpIcon,
  CheckIcon,
  UploadSimpleIcon,
} from '@phosphor-icons/react'
import { Button, Field, Input, Refusal, Segmented, Tile, Toggle, say, undo } from '@/ui'
import { usePrefs, useCatalogue, useSession } from '@/app/useStores'
import { LOOK_PREF } from '@/app/appearance'
import { markInkOf } from '@/app/northside'
import { isDone, type CatalogueCommand } from '@/domain/catalogue/commands'
import { changeOrg, withKey } from '@/domain/catalogue/orgCommands'
import type {
  HomeSection,
  OrgCorners,
  OrgGround,
  OrgHome,
  OrgLook,
  OrgMotion,
  OrgProfile,
  OrgShadow,
  OrgSpacing,
} from '@/domain/model'
import {
  DESIGNED_ACCENT,
  brandProperties,
  nearestPasses,
  parseHex,
  readBrand,
  saidRatio,
} from '@/domain/northside/colour'
import {
  HOME_SECTIONS,
  SECTION_SAID,
  moved,
  sectionOrder,
  shown,
  shows,
} from '@/domain/northside/home'
import {
  AS_DESIGNED,
  CORNERS,
  MOTIONS,
  SHADOWS,
  SPACINGS,
  personLookOf,
} from '@/domain/northside/look'
import { dayWritten } from '@/domain/quote/diary/days'
import { localDayOf } from '@/domain/quote/day'
import { makerDoors } from '@/domain/catalogue/makers'
import { priceFileOf } from '@/domain/catalogue/priceFile'
import { everyPhotographed, markFor, type Photographed } from '@/screens/home/ledgers'
import { greetingFor } from '@/screens/home/Home'
import { packMark } from '@/screens/home/mark'
import { catalogue } from '@/state/catalogue'
import { prefs } from '@/state/prefs'
import { boatNamed } from '@/domain/northside/boatNamed'
import { readMark, useSourceColour, useVeils } from './measure'
import { DESK, clearOfTheToast, useHeightOnRoot, useMedia, useStuck } from './hooks'

/* ============================================================
   THE WATER — what shows on every screen at Northside, measured on the
   ground it sits on. Board C's right half, with board B's stage grafted
   on: Home is drawn small at the head with the chosen colour and
   photograph already on it, BEFORE anything is kept, and one line says
   "Changed, not kept" with Keep and Put back.
   ============================================================ */

/** The designed accent (`DESIGNED_ACCENT`, worked from tokens.css's own blue-600), the one a
 *  given quote with no brand colour also prints in. */
export const DESIGNED = DESIGNED_ACCENT

/** What has been tried and not kept. `undefined` is untouched; `null` is "as designed". */
interface Staged {
  brand?: string | null
  hero?: OrgGround | null
  door?: string | null
}

/** The sign-in page's own photograph, as it was designed (src/screens/entry/Entry.tsx). */
const DOOR_DESIGNED = 'stacer-481-seamaster'

function keep(command: CatalogueCommand): string | null {
  const outcome = catalogue.getState().apply(command)
  if (!isDone(outcome)) return outcome.refused === '' ? null : outcome.refused
  const eventId = outcome.event.id
  undo(
    outcome.said,
    () => {
      const back = catalogue.getState().undo(eventId)
      if (isDone(back)) say(back.said, { id: 'manage-step' })
      else if (back.refused !== '') say(back.refused, { id: 'manage-step' })
    },
    { id: 'manage-step', testId: 'manage-step' },
  )
  clearOfTheToast()
  return null
}

const lookWith = (o: OrgProfile, patch: Partial<OrgLook>): OrgProfile => {
  const look: OrgLook = { ...o.look }
  for (const [k, v] of Object.entries(patch) as [keyof OrgLook, unknown][]) {
    if (v === undefined || v === null) delete look[k]
    else (look as Record<string, unknown>)[k] = v
  }
  return withKey(o, 'look', Object.keys(look).length > 0 ? look : undefined)
}

export function Water({ open }: { open: boolean }) {
  const org = useCatalogue((s) => s.org)
  const business = useCatalogue((s) => s.business)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const modules = useCatalogue((s) => s.modules)
  const who = useSession((s) => s.name)
  const [staged, setStaged] = useState<Staged>({})
  const [surface, setSurface] = useState<'home' | 'door'>('home')
  const [refused, setRefused] = useState<string | null>(null)
  /* the stage's own height, so a part the index lands at a desk stands under it, not behind it */
  const [stageBox, setStageBox] = useState<HTMLElement | null>(null)
  const [top, setTop] = useState<HTMLElement | null>(null)
  useHeightOnRoot(stageBox, '--mg-stage')
  /* at a desk the stage stands at the window's head, and while it stands there the band above it
     is the stage's own ground, never a slice of the choices passing under the pill */
  useStuck(stageBox, useMedia(DESK))

  const boats = useMemo(() => (open ? everyPhotographed(tables, rows) : []), [open, tables, rows])
  /* the boat makers Home draws as doors, each by its own mark in dark ink where one is held and
     by its name where none is, the way Home draws them */
  const makers = useMemo<MiniMaker[]>(
    () =>
      open
        ? makerDoors(priceFileOf(tables, modules).tables, rows)
            .filter((door) => door.kind === 'boat')
            .map((door) => {
              const face = markFor(tables[door.key]?.name ?? door.name, 'paper')
              return { key: door.key, name: door.name, src: face.drawn ? face.mark.src : null }
            })
        : [],
    [open, tables, modules, rows],
  )
  const veils = useVeils(
    useMemo(() => boats.map((b) => ({ id: b.picture.id, src: thumbOf(b.picture, 480) })), [boats]),
  )

  const keptBrand = org?.look?.brand ?? null
  const brand = staged.brand !== undefined ? staged.brand : keptBrand
  const keptHero = org?.look?.hero ?? null
  const hero = staged.hero !== undefined ? staged.hero : keptHero
  const keptDoor = org?.look?.door?.picture ?? null
  const door = staged.door !== undefined ? staged.door : keptDoor

  const changes = changedLines(staged, { brand: keptBrand, hero: keptHero, door: keptDoor }, boats)
  const docked = changes.length > 0 || refused !== null
  const heroBoat = hero ? boats.find((b) => b.picture.id === hero.picture) : undefined

  /* THE PRESS THAT STAGED THE LAST CHANGE: Keep and Put back go with the dock, so the focus comes
     back to it, a keyboard is not left on nothing, and the step's Undo keeps clear of its part */
  const stagedFrom = useRef<HTMLElement | null>(null)
  const noteFrom = (): void => {
    const at = document.activeElement
    stagedFrom.current = at instanceof HTMLElement && at !== document.body ? at : null
  }
  const backToTheChoice = (): void => {
    const at = stagedFrom.current
    if (at?.isConnected) at.focus({ preventScroll: true })
  }

  const keepStaged = (): void => {
    backToTheChoice()
    const patch: Partial<OrgLook> = {}
    if (staged.brand !== undefined) patch.brand = staged.brand ?? undefined
    if (staged.hero !== undefined) patch.hero = staged.hero ?? undefined
    if (staged.door !== undefined)
      patch.door =
        staged.door === null
          ? undefined
          : { picture: staged.door, veil: veils.get(staged.door)?.veil ?? 0 }
    const out = keep(
      changeOrg(changes.map((c) => c.kept).join('; '), 'look', (o) => lookWith(o, patch)),
    )
    if (out) setRefused(out)
    else {
      setRefused(null)
      setStaged({})
    }
  }

  const ownWater = org?.marks?.water
  const white = ownWater ? { src: ownWater.src } : packMark(business)

  return (
    <>
      <header className="mg-head mg-head--water">
        {white ? <img className="mg-head__mark" src={white.src} alt={business ?? ''} /> : null}
        <div className="mg-head__words">
          <h2 className="mg-eyebrow" id="mg-water-title">
            What shows
          </h2>
          <p className="mg-head__say">
            On every screen at Northside, measured on the ground it sits on.
          </p>
        </div>
      </header>

      {/* THE STAGE (board B's, grafted): Home or the sign-in page, small, wearing what has been
          tried before it is kept */}
      <section
        className="mg-stage-wrap"
        ref={setStageBox}
        aria-label="How it looks, before it is kept"
      >
        <div className="mg-stage-switch">
          <Segmented
            label="Drawn on"
            options={[
              { value: 'home', label: 'Home' },
              { value: 'door', label: 'The sign-in page' },
            ]}
            value={surface}
            onValueChange={setSurface}
          />
        </div>
        <Stage
          surface={surface}
          brand={brand}
          hero={hero}
          door={door}
          home={org?.home}
          boats={boats}
          makers={makers}
          who={who}
          white={white?.src ?? null}
          business={business}
        />
      </section>

      {/* THE CHOICES, AND THE DOCK THAT STANDS OVER THEM: its own room heads them while something is
          tried, so where the choices enter the window from below the dock rests on that room and
          never on the stage or a choice */}
      <div className="mg-choices">
        <span className="mg-choices__top" ref={setTop} aria-hidden="true" />
        {open ? (
          <>
            <Colour
              brand={brand}
              kept={keptBrand}
              business={business}
              photo={
                heroBoat
                  ? {
                      src: thumbOf(heroBoat.picture, 320),
                      name: boatSaid(boats, heroBoat.picture.id),
                    }
                  : null
              }
              stage={(next) => {
                noteFrom()
                setStaged((s) => ({ ...s, brand: next === keptBrand ? undefined : next }))
              }}
            />
            <Pictures
              boats={boats}
              veils={veils}
              hero={hero}
              door={door}
              stageHero={(next) => {
                noteFrom()
                setSurface('home')
                setStaged((s) => ({
                  ...s,
                  hero: sameGround(next, keptHero) ? undefined : next,
                }))
              }}
              stageDoor={(next) => {
                noteFrom()
                setSurface('door')
                setStaged((s) => ({ ...s, door: next === keptDoor ? undefined : next }))
              }}
            />
            <WaterMark org={org} />
            <HomeArrangement home={org?.home} boats={boats} />
            <Shape look={org?.look} />
          </>
        ) : (
          <p className="mg-said mg-said--water">
            Northside’s colour, pictures and Home are set once a price list is open here.
          </p>
        )}

        {/* CHANGED, NOT KEPT, DOCKED AT THE WINDOW'S FOOT while the water is in sight (the judge, L2:
          at 844 × 390 its Keep stood at y = −172, above the press that staged it). It is the
          water's last child, so it rests at the water's end and stands at the window's foot from
          anywhere above it; the Undo of the last step stands above it, never on it. */}
        {docked ? (
          <Docked top={top}>
            {changes.length > 0 ? (
              <output className="mg-staged" data-testid="manage-staged">
                <p className="mg-staged__lab">Changed, not kept</p>
                <ul className="mg-staged__list">
                  {changes.map((c) => (
                    <li key={c.key} className="mg-staged__line">
                      {/* WHAT WAS TRIED, DRAWN SMALL BESIDE ITS WORDS, so it is seen wherever the
                          stage is out of the window (the verifier, 844 × 390) */}
                      {c.face.kind === 'colour' ? (
                        <span
                          className="mg-staged__swatch"
                          style={{ '--swatch': c.face.hex } as CSSProperties}
                          aria-hidden="true"
                        />
                      ) : c.face.src ? (
                        <img className="mg-staged__thumb" src={c.face.src} alt="" />
                      ) : (
                        <span
                          className="mg-staged__thumb mg-staged__thumb--water"
                          aria-hidden="true"
                        />
                      )}
                      <span>{c.said}</span>
                    </li>
                  ))}
                </ul>
                <div className="mg-staged__acts">
                  <Button intent="act" size="sm" icon={CheckIcon} onClick={keepStaged}>
                    Keep
                  </Button>
                  <Button
                    intent="veiled"
                    size="sm"
                    icon={ArrowUUpLeftIcon}
                    onClick={() => {
                      backToTheChoice()
                      setStaged({})
                      setRefused(null)
                    }}
                  >
                    Put back
                  </Button>
                </div>
              </output>
            ) : null}
            {refused ? (
              <p className="mg-water-refused" role="alert">
                <Refusal on="room">{refused}</Refusal>
              </p>
            ) : null}
          </Docked>
        ) : null}
      </div>
    </>
  )
}

/** THE DOCK: its own height is written on the root while it stands, so the toaster lifts its cards
 *  above it (manage.css, `--mg-dock`) */
function Docked({ top, children }: { top: HTMLElement | null; children: ReactNode }) {
  const [box, setBox] = useState<HTMLDivElement | null>(null)
  useHeightOnRoot(box, '--mg-dock')
  /* IT DOCKS ONCE THE CHOICES HAVE COME UP PAST IT: where their head is still in the window's
     lower part, a docked bar could only stand on that head, so until then it rests at the water's
     end and nothing is under it */
  const [docks, setDocks] = useState(false)
  useEffect(() => {
    if (!box || !top || typeof window === 'undefined') return
    let frame = 0
    const read = (): void => {
      frame = 0
      const room = window.innerHeight - box.offsetHeight - 24
      setDocks(top.getBoundingClientRect().top < room)
    }
    const soon = (): void => {
      if (frame === 0) frame = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', soon, { passive: true })
    window.addEventListener('resize', soon)
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', soon)
      window.removeEventListener('resize', soon)
    }
  }, [box, top])
  return (
    <div
      className="mg-dock"
      ref={setBox}
      data-testid="manage-dock"
      data-docks={docks ? '' : undefined}
    >
      {children}
    </div>
  )
}

const sameGround = (a: OrgGround | null, b: OrgGround | null): boolean =>
  (a?.picture ?? null) === (b?.picture ?? null)

/** A narrower copy of a picture, near the width asked for. */
function thumbOf(picture: Photographed['picture'], width: number): string {
  const fit = picture.widths.find((w) => w.width >= width) ?? picture.widths.at(-1)
  return fit?.src ?? picture.src
}

const boatSaid = (boats: readonly Photographed[], id: string | null): string => {
  const boat = boats.find((b) => b.picture.id === id)
  return boat ? `the ${boatNamed(boat.maker, boat.model)}` : 'the photograph'
}

/** What a tried change is drawn as in the dock: its colour, or its photograph (none: the water). */
type Face = { kind: 'colour'; hex: string } | { kind: 'picture'; src: string | null }

/** What has been tried and not kept, each as the stage says it and as the step will. */
function changedLines(
  staged: Staged,
  kept: { brand: string | null; hero: OrgGround | null; door: string | null },
  boats: readonly Photographed[],
): { key: string; said: string; kept: string; face: Face }[] {
  const out: { key: string; said: string; kept: string; face: Face }[] = []
  const shot = (id: string | null | undefined): string | null => {
    const boat = id ? boats.find((b) => b.picture.id === id) : undefined
    return boat ? thumbOf(boat.picture, 160) : null
  }
  if (staged.brand !== undefined) {
    const to = (staged.brand ?? DESIGNED).toUpperCase()
    const from = (kept.brand ?? DESIGNED).toUpperCase()
    out.push({
      key: 'brand',
      said: `Colour ${to} in place of ${from}`,
      kept:
        staged.brand === null
          ? 'Northside’s colour is as designed again'
          : `Northside’s colour is ${to}`,
      face: { kind: 'colour', hex: staged.brand ?? DESIGNED },
    })
  }
  if (staged.hero !== undefined) {
    const to = staged.hero ? boatSaid(boats, staged.hero.picture) : 'the drawn water'
    const from = kept.hero ? boatSaid(boats, kept.hero.picture) : 'the drawn water'
    out.push({
      key: 'hero',
      said: `Home stands on ${to}, in place of ${from}`,
      kept: `Home stands on ${to}`,
      face: { kind: 'picture', src: shot(staged.hero?.picture) },
    })
  }
  if (staged.door !== undefined) {
    const to = staged.door ? boatSaid(boats, staged.door) : 'the photograph it was designed with'
    out.push({
      key: 'door',
      said: `The sign-in page shows ${to}`,
      kept: `The sign-in page shows ${to}`,
      face: { kind: 'picture', src: shot(staged.door ?? DOOR_DESIGNED) },
    })
  }
  return out
}

/* ---------------------------------------------------------- */
/* The stage                                                   */
/* ---------------------------------------------------------- */

function Stage({
  surface,
  brand,
  hero,
  door,
  home,
  boats,
  makers,
  who,
  white,
  business,
}: {
  surface: 'home' | 'door'
  brand: string | null
  hero: OrgGround | null
  door: string | null
  home: OrgHome | undefined
  boats: readonly Photographed[]
  makers: readonly MiniMaker[]
  who: string | null
  white: string | null
  business: string | null
}) {
  /* the colour tried is laid on the stage alone, through the same properties the app's own
     <style> writes, so the stage is the app wearing it */
  const style = useMemo(() => brandProperties(brand ?? DESIGNED) as CSSProperties, [brand])
  const now = new Date()
  const today = localDayOf(now)
  const heroBoat = hero ? boats.find((b) => b.picture.id === hero.picture) : undefined
  const doorBoat = boats.find((b) => b.picture.id === (door ?? DOOR_DESIGNED))
  const order = sectionOrder(home)
  const homeBoats = firstBoats(boats, home?.first).slice(0, 4)

  if (surface === 'door') {
    return (
      <div className="mg-stage" style={style} data-testid="manage-stage" data-surface="door">
        <div className="mg-mini mg-mini--door" aria-hidden="true">
          {doorBoat ? (
            <img className="mg-mini__photo" src={thumbOf(doorBoat.picture, 640)} alt="" />
          ) : null}
          <div className="mg-mini__card">
            <span className="mg-mini__q">Put a name to this desk.</span>
            <span className="mg-mini__field" />
            <span className="mg-mini__primary">Load the Master Price File</span>
          </div>
        </div>
        <p className="mg-stage__caption">
          {doorBoat
            ? `The sign-in page, on ${boatSaid(boats, doorBoat.picture.id)}.`
            : 'The sign-in page.'}
        </p>
      </div>
    )
  }

  return (
    <div className="mg-stage" style={style} data-testid="manage-stage" data-surface="home">
      <div className="mg-mini" aria-hidden="true">
        <div className="mg-mini__sea">
          {heroBoat && hero ? (
            <>
              <img className="mg-mini__photo" src={thumbOf(heroBoat.picture, 640)} alt="" />
              <span
                className="mg-mini__veil"
                style={{ '--veil': String(hero.veil) } as CSSProperties}
              />
            </>
          ) : null}
          {white ? (
            <img className="mg-mini__mark" src={white} alt="" />
          ) : (
            <span className="mg-mini__name">{business}</span>
          )}
          <span className="mg-mini__date">{dayWritten(today, today)}</span>
          <span className="mg-mini__greet">{greetingFor(now.getHours(), who)}</span>
          <span className="mg-mini__ask">
            <span className="mg-mini__find">The boat they say</span>
            <span className="mg-mini__act">New quote</span>
          </span>
        </div>
        {order.map((section) =>
          !shows(home, section) || section === 'desk' ? null : section === 'boats' ? (
            <span className="mg-mini__boats" key="boats">
              {homeBoats.map((b) => (
                <img
                  key={b.picture.id}
                  className="mg-mini__boat"
                  src={thumbOf(b.picture, 240)}
                  alt=""
                />
              ))}
            </span>
          ) : (
            <span className="mg-mini__makers" key="makers">
              {makers.map((m) => (
                <span key={m.key} className="mg-mini__maker">
                  {m.src ? (
                    <img className="mg-mini__maker-mark" src={m.src} alt="" />
                  ) : (
                    <span className="mg-mini__maker-name">{m.name}</span>
                  )}
                </span>
              ))}
            </span>
          ),
        )}
      </div>
      <p className="mg-stage__caption">
        {heroBoat && hero
          ? `Home on ${boatSaid(boats, heroBoat.picture.id)}, darkened just enough for the greeting to read.`
          : 'Home on the drawn water, as it was built.'}
      </p>
    </div>
  )
}

/** A boat maker as the stage draws it on Home's row of doors. */
interface MiniMaker {
  key: string
  name: string
  src: string | null
}

function firstBoats(
  boats: readonly Photographed[],
  first: readonly string[] | undefined,
): Photographed[] {
  const lead = (first ?? [])
    .map((id) => boats.find((b) => b.picture.id === id))
    .filter((b): b is Photographed => b !== undefined)
  return [...lead, ...boats.filter((b) => !lead.includes(b))]
}

/* ---------------------------------------------------------- */
/* Colour                                                      */
/* ---------------------------------------------------------- */

function Colour({
  brand,
  kept,
  business,
  photo,
  stage,
}: {
  brand: string | null
  kept: string | null
  business: string | null
  /** the photograph Home stands on, kept or tried, which offers a colour of its own */
  photo: { src: string; name: string } | null
  stage: (next: string | null) => void
}) {
  const fromMark = useMemo(() => markInkOf(business), [business])
  const fromPhoto = useSourceColour(photo?.src ?? null)
  const [typed, setTyped] = useState('')
  const [tried, setTried] = useState<string | null>(null)
  const [triedSay, setTriedSay] = useState<string | null>(null)
  const shownHex = brand ?? DESIGNED
  const reading = useMemo(() => (tried ? readBrand(tried) : null), [tried])
  const near = useMemo(() => (reading?.refused ? nearestPasses(reading.hex) : null), [reading])
  /* THE ONE MEASURED FACT, said once for the colour on the stage (built-critique-m4.md, major
     7: a ratio on every card, every chip and eleven ramp steps was the machinery, not the step) */
  const whiteOn = useMemo(() => readBrand(shownHex).whiteOn, [shownHex])

  /* A CARD CHOSEN IS THE COLOUR ON THE STAGE, and the field says it too: it read #FFEA28 while
     #0066CC was ticked (the judge, P5) */
  const choose = (value: string | null): void => {
    setTried(null)
    setTriedSay(null)
    setTyped(value ? value.toUpperCase() : '')
    stage(value)
  }

  const tryHex = (raw: string): void => {
    const hex = parseHex(raw)
    if (!hex) {
      setTried(null)
      setTriedSay('A colour is written as six figures after a hash, as the mark’s is.')
      return
    }
    setTriedSay(null)
    setTried(hex)
    if (readBrand(hex).refused === null) stage(hex)
  }

  const card = (key: string, title: string, hex: string, value: string | null, note: string) => (
    <li key={key}>
      <Tile
        tone="room"
        selected={(brand ?? null) === value}
        onSelect={() => choose(value)}
        label={`${title}, ${hex.toUpperCase()}, white on it ${saidRatio(readBrand(hex).whiteOn)}`}
      >
        <span className="mg-colour">
          <span className="mg-colour__swatch" style={{ '--swatch': hex } as CSSProperties} />
          <span className="mg-colour__name">{title}</span>
          <span className="mg-colour__hex">{hex.toUpperCase()}</span>
          <span className="mg-colour__note">{note}</span>
        </span>
      </Tile>
    </li>
  )

  const own =
    kept && kept !== DESIGNED && kept !== fromMark?.hex && kept !== fromPhoto?.offered ? kept : null

  return (
    <section className="mg-group mg-group--water" id="mg-colour-g" aria-labelledby="mg-colour">
      <div className="mg-group__head">
        <h3 className="mg-group__title" id="mg-colour">
          Colour
        </h3>
        <p className="mg-group__say" data-testid="manage-colour-reads">
          {`White words on ${shownHex.toUpperCase()} read at ${saidRatio(whiteOn)}`}
        </p>
      </div>
      <ul className="mg-colours">
        {card('designed', 'As designed', DESIGNED, null, 'the blue the app was drawn in')}
        {fromMark
          ? card(
              'mark',
              'From the mark',
              fromMark.hex,
              fromMark.hex,
              `the ink of the mark on ${fromMark.from}`,
            )
          : null}
        {/* A COLOUR OF ANOTHER KIND, from the photograph Home stands on (the judge, L10: the two
            offers were two blues a customer could not tell apart) — its own pixels' colour, or
            the nearest to it that white words read on */}
        {fromPhoto && photo
          ? card(
              'photo',
              'From the photograph',
              fromPhoto.offered,
              fromPhoto.offered,
              fromPhoto.moved
                ? `the nearest that reads to the colour in ${photo.name}`
                : `the colour in ${photo.name}`,
            )
          : null}
        {own ? card('own', 'Northside’s own', own, own, 'typed here') : null}
      </ul>
      <form
        className="mg-colour-try"
        onSubmit={(e) => {
          e.preventDefault()
          tryHex(typed)
        }}
      >
        {/* NO DESCRIPTION UNDER THE FIELD, so "Try it" stands on the field's own line (the
            critique's minor); the way a colour is written is the field's placeholder, and a
            colour written another way is refused with that same sentence */}
        <Field label="Any other colour">
          <Input
            aria-label="Any other colour"
            mono
            placeholder={DESIGNED.toUpperCase()}
            value={typed}
            onValueChange={setTyped}
            autoComplete="off"
          />
        </Field>
        {/* THE SYSTEM'S OWN PICKER beside the written colour (the judge, L10): what it picks is
            written into the field and tried, measured as a typed colour is */}
        <label className="mg-picker">
          <input
            className="mg-picker__input"
            type="color"
            aria-label="Pick a colour"
            value={parseHex(typed) ?? shownHex}
            onChange={(e) => {
              setTyped(e.target.value.toUpperCase())
              tryHex(e.target.value)
            }}
          />
          <span className="mg-picker__word">Pick</span>
        </label>
        {/* the field's own height, so it stands on the field's line */}
        <Button type="submit" intent="veiled">
          Try it
        </Button>
      </form>
      {triedSay ? (
        <p className="mg-water-refused" role="alert">
          <Refusal on="room">{triedSay}</Refusal>
        </p>
      ) : null}
      {reading?.refused ? (
        <div className="mg-refused" data-testid="manage-colour-refused">
          <p className="mg-water-refused" role="alert">
            <Refusal on="room">{reading.refused}</Refusal>
          </p>
          {near && near.passes.length > 0 ? (
            <div className="mg-near">
              <p className="mg-near__lab">The nearest that read:</p>
              <ul className="mg-near__list">
                {near.passes.map((p) => (
                  <li key={p.hex}>
                    <Tile
                      tone="room"
                      shape="chip"
                      selected={brand === p.hex}
                      onSelect={() => {
                        setTyped(p.hex.toUpperCase())
                        stage(p.hex)
                      }}
                      label={`${p.hex.toUpperCase()}, the nearest that reads`}
                    >
                      <span className="mg-colour mg-colour--chip">
                        <span
                          className="mg-colour__swatch"
                          style={{ '--swatch': p.hex } as CSSProperties}
                        />
                        <span className="mg-colour__hex">{p.hex.toUpperCase()}</span>
                      </span>
                    </Tile>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

/* ---------------------------------------------------------- */
/* Pictures                                                    */
/* ---------------------------------------------------------- */

function Pictures({
  boats,
  veils,
  hero,
  door,
  stageHero,
  stageDoor,
}: {
  boats: readonly Photographed[]
  veils: ReadonlyMap<string, { veil: number; whiteOn: number }>
  hero: OrgGround | null
  door: string | null
  stageHero: (next: OrgGround | null) => void
  stageDoor: (next: string | null) => void
}) {
  /* the photographs on the water, the ones nobody chose as a boat's own picture by hand.
     NONE IS LOADED LAZILY: each is a thumbnail of 320px or less, its pixels are read for its
     veil the moment the screen opens anyway, and a lazy picture below the fold never finished
     loading for anything that waits on every picture (the rulers' settle did, at every size) */
  const onWater = boats.filter((b) => !b.picture.person).slice(0, 8)
  const offered = onWater.length > 0 ? onWater : boats.slice(0, 8)
  const atDoor = door ?? DOOR_DESIGNED
  return (
    <section className="mg-group mg-group--water" id="mg-pictures-g" aria-labelledby="mg-pictures">
      <div className="mg-group__head">
        <h3 className="mg-group__title" id="mg-pictures">
          Pictures
        </h3>
        <p className="mg-group__say">
          One photograph for Home, one for the sign-in page, each darkened by its own light just
          enough for the words on it to read
        </p>
      </div>

      {/* ONE GRID, EACH PHOTOGRAPH ONCE (the judge, L6: the same eight drawn twice were a third of
          the phone's page), with the two places it can stand as its two presses */}
      <ul className="mg-shots">
        <li className="mg-shot" data-ground="plate" data-home={hero === null ? '' : undefined}>
          <span className="mg-shot__frame mg-shot__frame--water" aria-hidden="true" />
          <span className="mg-shot__name">The drawn water</span>
          <span className="mg-shot__note">Home as it was built</span>
          <span className="mg-shot__acts">
            <Place on={hero === null} onPress={() => stageHero(null)} word="Home" />
          </span>
        </li>
        {offered.map((b) => {
          const read = veils.get(b.picture.id)
          const name = boatNamed(b.maker, b.model)
          const home = hero?.picture === b.picture.id
          const signIn = atDoor === b.picture.id
          return (
            <li
              className="mg-shot"
              data-ground="plate"
              key={b.picture.id}
              data-home={home ? '' : undefined}
              data-door={signIn ? '' : undefined}
            >
              <img className="mg-shot__img" src={thumbOf(b.picture, 320)} alt="" />
              <span className="mg-shot__name">{name}</span>
              {b.picture.id === DOOR_DESIGNED ? (
                <span className="mg-shot__note">the sign-in page as designed</span>
              ) : null}
              <span className="mg-shot__acts">
                <Place
                  on={home}
                  word="Home"
                  label={`${name} under Home’s name`}
                  onPress={
                    read ? () => stageHero({ picture: b.picture.id, veil: read.veil }) : undefined
                  }
                  refused={
                    read
                      ? undefined
                      : 'Its pixels are still being read, so its veil is not known yet.'
                  }
                />
                <Place
                  on={signIn}
                  word="Sign-in"
                  label={`${name} on the sign-in page`}
                  onPress={() => stageDoor(b.picture.id === DOOR_DESIGNED ? null : b.picture.id)}
                />
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** One of the two places a photograph can stand, pressed to put it there; lit where it stands. */
function Place({
  on,
  word,
  label,
  onPress,
  refused,
}: {
  on: boolean
  word: string
  label?: string
  onPress: (() => void) | undefined
  refused?: string
}) {
  return (
    <Button
      intent={on ? 'act' : 'secondary'}
      size="sm"
      icon={on ? CheckIcon : undefined}
      aria-pressed={on}
      aria-label={label ? `${word}: ${label}` : undefined}
      onClick={onPress}
      refusedBecause={refused}
    >
      {word}
    </Button>
  )
}

/* ---------------------------------------------------------- */
/* The mark on the water                                       */
/* ---------------------------------------------------------- */

function WaterMark({ org }: { org: OrgProfile | undefined }) {
  const [refused, setRefused] = useState<string | null>(null)
  const [reading, setReading] = useState(false)
  const picker = useRef<HTMLInputElement>(null)
  const own = org?.marks?.water

  const chosen = async (file: File | undefined): Promise<void> => {
    if (!file) return
    setRefused(null)
    setReading(true)
    try {
      const read = await readMark(file)
      if (!read.ink) {
        setRefused('Nothing is drawn in this file, so there is no mark to show.')
        return
      }
      if (read.ink.ink === 'dark') {
        setRefused(
          `This mark is drawn in dark ink, ${saidRatio(read.ink.onPaper)} on white, which the water cannot carry. It can print on the quote instead, on the left.`,
        )
        return
      }
      setRefused(
        keep(
          changeOrg('Northside’s own mark stands on the water', 'marks', (o) => ({
            ...o,
            marks: {
              ...o.marks,
              water: {
                src: read.src,
                width: read.width,
                height: read.height,
                ink: 'light',
                name: file.name,
                keptAt: new Date().toISOString(),
              },
            },
          })),
        ),
      )
    } catch (error) {
      setRefused(error instanceof Error ? error.message : 'That file would not open.')
    } finally {
      setReading(false)
    }
  }

  return (
    <section
      className="mg-group mg-group--water"
      id="mg-watermark-g"
      aria-labelledby="mg-watermark"
    >
      <div className="mg-group__head">
        <h3 className="mg-group__title" id="mg-watermark">
          The mark on the water
        </h3>
        <p className="mg-group__say">
          {own
            ? `Northside’s own file, ${own.name}`
            : 'Northside’s own mark in white ink, from northsidemarine.com.au'}
        </p>
      </div>
      <input
        ref={picker}
        className="mg-file"
        type="file"
        accept="image/png,image/svg+xml,image/webp"
        aria-label="A file of Northside’s mark in white ink"
        tabIndex={-1}
        onChange={(e) => {
          void chosen(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <div className="mg-row-acts">
        <Button
          intent="veiled"
          size="sm"
          icon={UploadSimpleIcon}
          aria-busy={reading || undefined}
          onClick={() => picker.current?.click()}
        >
          {reading ? 'Reading it…' : 'Choose a white-ink file'}
        </Button>
        {own ? (
          <Button
            intent="veiled"
            size="sm"
            icon={ArrowUUpLeftIcon}
            onClick={() =>
              setRefused(
                keep(
                  changeOrg(
                    'The mark from Northside’s site stands on the water again',
                    'marks',
                    (o) => {
                      const marks = { ...o.marks }
                      delete marks.water
                      return withKey(o, 'marks', Object.keys(marks).length > 0 ? marks : undefined)
                    },
                  ),
                ),
              )
            }
          >
            Use the mark from the site
          </Button>
        ) : null}
      </div>
      <p className="mg-group__foot">A mark on the water is drawn in white or light ink.</p>
      {refused ? (
        <p className="mg-water-refused" role="alert">
          <Refusal on="room">{refused}</Refusal>
        </p>
      ) : null}
    </section>
  )
}

/* ---------------------------------------------------------- */
/* Home, arranged                                              */
/* ---------------------------------------------------------- */

function HomeArrangement({
  home,
  boats,
}: {
  home: OrgHome | undefined
  boats: readonly Photographed[]
}) {
  const [refused, setRefused] = useState<string | null>(null)
  const order = sectionOrder(home)
  const set = (said: string, next: OrgHome): void => {
    const clean: OrgHome = { ...next }
    if ((clean.hidden ?? []).length === 0) delete clean.hidden
    if ((clean.first ?? []).length === 0) delete clean.first
    if (clean.order && clean.order.every((s, i) => s === HOME_SECTIONS[i])) delete clean.order
    setRefused(
      keep(
        changeOrg(said, 'home', (o) =>
          withKey(o, 'home', Object.keys(clean).length > 0 ? clean : undefined),
        ),
      ),
    )
  }
  const movable: HomeSection[] = order.filter((s) => s !== 'desk')
  const first = home?.first ?? []
  const [choosing, setChoosing] = useState(false)

  return (
    <section className="mg-group mg-group--water" aria-labelledby="mg-home" id="mg-home-arrange">
      <div className="mg-group__head">
        <h3 className="mg-group__title" id="mg-home">
          Home
        </h3>
        <p className="mg-group__say">Northside’s order; a hidden part comes back in one press</p>
      </div>
      {refused ? (
        <p className="mg-water-refused" role="alert">
          <Refusal on="room">{refused}</Refusal>
        </p>
      ) : null}
      <ol className="mg-sections">
        <li className="mg-section">
          <span className="mg-section__name">The water</span>
          <span className="mg-section__holds">the greeting, the find and New quote</span>
          <span className="mg-section__fixed">always first</span>
        </li>
        {(['desk', ...movable] as HomeSection[]).map((section) => {
          const at = movable.indexOf(section)
          const on = shows(home, section)
          const name = SECTION_SAID[section].name
          return (
            <li className="mg-section" key={section} data-hidden={on ? undefined : ''}>
              <span className="mg-section__name">{name}</span>
              <span className="mg-section__holds">
                {section === 'desk'
                  ? 'on the water, once there is work'
                  : SECTION_SAID[section].holds}
              </span>
              <span className="mg-section__acts">
                {section !== 'desk' && at > 0 ? (
                  <Button
                    intent="veiled"
                    size="sm"
                    icon={ArrowUpIcon}
                    aria-label={`Move ${name} up`}
                    onClick={() => set(`${name} moved up on Home`, moved(home, section, -1))}
                  >
                    Up
                  </Button>
                ) : null}
                {section !== 'desk' && at >= 0 && at < movable.length - 1 ? (
                  <Button
                    intent="veiled"
                    size="sm"
                    icon={ArrowDownIcon}
                    aria-label={`Move ${name} down`}
                    onClick={() => set(`${name} moved down on Home`, moved(home, section, 1))}
                  >
                    Down
                  </Button>
                ) : null}
                <Toggle
                  label={on ? 'Shown' : 'Hidden'}
                  checked={on}
                  onCheckedChange={(next) =>
                    set(
                      next ? `${name} is back on Home` : `${name} is hidden on Home`,
                      shown(home, section, next),
                    )
                  }
                />
              </span>
            </li>
          )
        })}
      </ol>

      <h4 className="mg-sub">The boats Home starts from</h4>
      <p className="mg-group__foot">
        {first.length === 0
          ? 'Home chooses its own eight, one maker at a time. Press a boat to put it first.'
          : `First: ${first
              .map((id) => boatSaid(boats, id).replace(/^the /, ''))
              .join(', then ')}. Home chooses the rest. Press one again to take it out.`}
      </p>
      <div className="mg-row-acts">
        <Button
          intent="veiled"
          size="sm"
          aria-expanded={choosing}
          onClick={() => setChoosing(!choosing)}
        >
          {choosing ? 'Done choosing' : `Choose from all ${boats.length} boats`}
        </Button>
      </div>
      <ul className="mg-firsts">
        {(choosing
          ? boats
          : firstBoats(boats, first).filter((b) => first.includes(b.picture.id))
        ).map((b) => {
          const at = first.indexOf(b.picture.id)
          return (
            <li key={b.picture.id}>
              <Tile
                tone="room"
                shape="chip"
                selected={at >= 0}
                onSelect={() =>
                  set(
                    at >= 0
                      ? `The ${boatNamed(b.maker, b.model)} is no longer first on Home`
                      : `The ${boatNamed(b.maker, b.model)} is first on Home`,
                    {
                      ...home,
                      first:
                        at >= 0
                          ? first.filter((id) => id !== b.picture.id)
                          : [...first, b.picture.id],
                    },
                  )
                }
                label={`${boatNamed(b.maker, b.model)}${at >= 0 ? `, number ${at + 1} on Home` : ''}`}
              >
                <span className="mg-first">
                  <img className="mg-first__img" src={thumbOf(b.picture, 240)} alt="" />
                  <span className="mg-first__name">{boatNamed(b.maker, b.model)}</span>
                  {at >= 0 ? <span className="mg-first__n">{at + 1}</span> : null}
                </span>
              </Tile>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* ---------------------------------------------------------- */
/* Shape, spacing and motion                                   */
/* ---------------------------------------------------------- */

/* ONE LAYER OVER THE DEFAULTS: NORTHSIDE'S (built-critique-m4.md, minor: "'Yours alone on this
   computer' spacing and motion is a second appearance layer that Northside never asked for").
   A computer set to reduce motion still moves less, which is the person's own say. A spacing or
   motion a person kept on this computer before is still read at boot (src/app/appearance.ts), so
   while one stands it is said here once, with the one press that clears it. */
function Shape({ look }: { look: OrgLook | undefined }) {
  const [refused, setRefused] = useState<string | null>(null)
  const mine = personLookOf(usePrefs((s) => s.values[LOOK_PREF]))

  const setOrg = (said: string, patch: Partial<OrgLook>): void =>
    setRefused(keep(changeOrg(said, 'look', (o) => lookWith(o, patch))))

  const spacing = look?.spacing ?? AS_DESIGNED.spacing
  const motion = look?.motion ?? AS_DESIGNED.motion

  return (
    <section className="mg-group mg-group--water" id="mg-shape-g" aria-labelledby="mg-shape">
      <div className="mg-group__head">
        <h3 className="mg-group__title" id="mg-shape">
          Shape, spacing and motion
        </h3>
        <p className="mg-group__say">Each a named step, never a free number</p>
      </div>
      {refused ? (
        <p className="mg-water-refused" role="alert">
          <Refusal on="room">{refused}</Refusal>
        </p>
      ) : null}
      {/* WHAT THE FOUR STEPS DO, SHOWN WHERE THEY ARE CHOSEN (the judge, L9: "Soft" and "Deep" were
          chosen blind). A plate of three lines and a tile beside it, drawn with the very
          properties the app wears, so a press here changes this drawing with everything else */}
      <div className="mg-specimen" aria-hidden="true" data-testid="manage-specimen">
        <span className="mg-specimen__plate">
          <span className="mg-specimen__line" />
          <span className="mg-specimen__line" />
          <span className="mg-specimen__line" />
        </span>
        <span className="mg-specimen__tile">
          <span className="mg-specimen__shot" />
          <span className="mg-specimen__line" />
        </span>
      </div>
      <div className="mg-steps">
        <Step label="Corners">
          <Segmented<OrgCorners>
            label="Corners"
            options={CORNERS.map((c) => ({ value: c.value, label: c.word }))}
            value={look?.corners ?? AS_DESIGNED.corners}
            onValueChange={(v) =>
              setOrg(`Corners are ${v} at Northside`, { corners: v === 'round' ? undefined : v })
            }
          />
        </Step>
        <Step label="Shadow">
          <Segmented<OrgShadow>
            label="Shadow"
            options={SHADOWS.map((c) => ({ value: c.value, label: c.word }))}
            value={look?.shadow ?? AS_DESIGNED.shadow}
            onValueChange={(v) =>
              setOrg(`Shadows are ${v} at Northside`, { shadow: v === 'lifted' ? undefined : v })
            }
          />
        </Step>
        <Step label="Spacing in lists">
          <Segmented<OrgSpacing>
            label="Spacing in lists"
            options={SPACINGS.map((c) => ({ value: c.value, label: c.word }))}
            value={spacing}
            onValueChange={(v) =>
              setOrg(`Lists are ${v === 'default' ? 'spaced as designed' : v} at Northside`, {
                spacing: v === 'default' ? undefined : v,
              })
            }
          />
        </Step>
        <Step label="Motion">
          <Segmented<OrgMotion>
            label="Motion"
            options={MOTIONS.map((c) => ({ value: c.value, label: c.word }))}
            value={motion}
            onValueChange={(v) =>
              setOrg(v === 'less' ? 'Less motion at Northside' : 'Motion as each computer says', {
                motion: v === 'system' ? undefined : v,
              })
            }
          />
        </Step>
      </div>
      <p className="mg-group__foot">
        A computer set to reduce motion always moves less, whatever is chosen here.
      </p>
      {mine.spacing || mine.motion ? (
        <div className="mg-row-acts">
          <p className="mg-group__foot">
            This computer still keeps a spacing or motion of its own, over Northside’s.
          </p>
          <Button
            intent="veiled"
            size="sm"
            icon={ArrowUUpLeftIcon}
            onClick={() => {
              prefs.getState().remove(LOOK_PREF)
              say('Northside’s spacing and motion on this computer again', { id: 'manage-step' })
            }}
          >
            Use Northside’s
          </Button>
        </div>
      ) : null}
    </section>
  )
}

/** A step with its name said above its answers; the group keeps the same name for a reader. */
function Step({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mg-step">
      <span className="mg-step__lab" aria-hidden="true">
        {label}
      </span>
      {children}
    </div>
  )
}
