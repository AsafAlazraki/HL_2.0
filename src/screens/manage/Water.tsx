import { useMemo, useRef, useState, type CSSProperties } from 'react'
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
  STEPS,
  brandProperties,
  hexOf,
  nearestPasses,
  parseHex,
  readBrand,
  rgbFromOklch,
  saidRatio,
  scaleOf,
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
import { MARK_FLOOR, saidVeil } from '@/domain/northside/pixels'
import { dayWritten } from '@/domain/quote/diary/days'
import { localDayOf } from '@/domain/quote/day'
import { everyPhotographed, type Photographed } from '@/screens/home/ledgers'
import { greetingFor } from '@/screens/home/Home'
import { packMark } from '@/screens/home/mark'
import { catalogue } from '@/state/catalogue'
import { prefs } from '@/state/prefs'
import { readMark, useVeils } from './measure'

/* ============================================================
   THE WATER — what shows on every screen at Northside, measured on the
   ground it sits on. Board C's right half, with board B's stage grafted
   on: Home is drawn small at the head with the chosen colour and
   photograph already on it, BEFORE anything is kept, and one line says
   "Changed, not kept" with Keep and Put back.
   ============================================================ */

/** The designed accent, worked from tokens.css's own blue-600 — oklch(51.2% 0.1554 255.7). */
export const DESIGNED = hexOf(rgbFromOklch({ l: 0.512, c: 0.1554, h: 255.7 }))

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
  const who = useSession((s) => s.name)
  const [staged, setStaged] = useState<Staged>({})
  const [surface, setSurface] = useState<'home' | 'door'>('home')
  const [refused, setRefused] = useState<string | null>(null)

  const boats = useMemo(() => (open ? everyPhotographed(tables, rows) : []), [open, tables, rows])
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

  const keepStaged = (): void => {
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
      <section className="mg-stage-wrap" aria-label="How it looks, before it is kept">
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
          who={who}
          white={white?.src ?? null}
          business={business}
        />
        {changes.length > 0 ? (
          <output className="mg-staged" data-testid="manage-staged">
            <p className="mg-staged__lab">Changed, not kept</p>
            <ul className="mg-staged__list">
              {changes.map((c) => (
                <li key={c.key}>{c.said}</li>
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
            <Refusal>{refused}</Refusal>
          </p>
        ) : null}
      </section>

      {open ? (
        <>
          <Colour
            brand={brand}
            kept={keptBrand}
            business={business}
            stage={(next) =>
              setStaged((s) => ({ ...s, brand: next === keptBrand ? undefined : next }))
            }
          />
          <Pictures
            boats={boats}
            veils={veils}
            hero={hero}
            door={door}
            stageHero={(next) =>
              setStaged((s) => ({
                ...s,
                hero: sameGround(next, keptHero) ? undefined : next,
              }))
            }
            stageDoor={(next) =>
              setStaged((s) => ({ ...s, door: next === keptDoor ? undefined : next }))
            }
          />
          <WaterMark org={org} />
          <HomeArrangement home={org?.home} boats={boats} />
          <Shape look={org?.look} who={who} />
        </>
      ) : (
        <p className="mg-said mg-said--water">
          Northside’s colour, pictures and Home are set once a price list is open here.
        </p>
      )}
    </>
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
  return boat ? `the ${boat.maker} ${boat.model}` : 'the photograph'
}

/** What has been tried and not kept, each as the stage says it and as the step will. */
function changedLines(
  staged: Staged,
  kept: { brand: string | null; hero: OrgGround | null; door: string | null },
  boats: readonly Photographed[],
): { key: string; said: string; kept: string }[] {
  const out: { key: string; said: string; kept: string }[] = []
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
    })
  }
  if (staged.hero !== undefined) {
    const to = staged.hero
      ? `${boatSaid(boats, staged.hero.picture)}, under ${saidVeil(staged.hero.veil)}`
      : 'the drawn water'
    const from = kept.hero ? boatSaid(boats, kept.hero.picture) : 'the drawn water'
    out.push({
      key: 'hero',
      said: `Home stands on ${to}, in place of ${from}`,
      kept: `Home stands on ${to}`,
    })
  }
  if (staged.door !== undefined) {
    const to = staged.door ? boatSaid(boats, staged.door) : 'the photograph it was designed with'
    out.push({
      key: 'door',
      said: `The sign-in page shows ${to}`,
      kept: `The sign-in page shows ${to}`,
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
            ? `The sign-in page, on ${boatSaid(boats, doorBoat.picture.id)}. Nothing is written on its photograph, so it needs no veil.`
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
            <span className="mg-mini__find" />
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
              {Array.from({ length: 7 }, (_, i) => (
                <span key={i} className="mg-mini__maker" />
              ))}
            </span>
          ),
        )}
      </div>
      <p className="mg-stage__caption">
        {heroBoat && hero
          ? `Home on ${boatSaid(boats, heroBoat.picture.id)}: ${saidVeil(hero.veil)} keeps the greeting at 4.5 : 1 or more.`
          : 'Home on the drawn water, as it was built.'}
      </p>
    </div>
  )
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
  stage,
}: {
  brand: string | null
  kept: string | null
  business: string | null
  stage: (next: string | null) => void
}) {
  const fromMark = useMemo(() => markInkOf(business), [business])
  const [typed, setTyped] = useState('')
  const [tried, setTried] = useState<string | null>(null)
  const [triedSay, setTriedSay] = useState<string | null>(null)
  const shownHex = brand ?? DESIGNED
  const reading = useMemo(() => (tried ? readBrand(tried) : null), [tried])
  const near = useMemo(() => (reading?.refused ? nearestPasses(reading.hex) : null), [reading])
  const scale = useMemo(() => scaleOf(shownHex), [shownHex])

  const card = (key: string, title: string, hex: string, value: string | null, note: string) => (
    <li key={key}>
      <Tile
        tone="room"
        selected={(brand ?? null) === value}
        onSelect={() => {
          setTried(null)
          stage(value)
        }}
        label={`${title}, ${hex.toUpperCase()}, white on it ${saidRatio(readBrand(hex).whiteOn)}`}
      >
        <span className="mg-colour">
          <span className="mg-colour__swatch" style={{ '--swatch': hex } as CSSProperties} />
          <span className="mg-colour__name">{title}</span>
          <span className="mg-colour__hex">
            {hex.toUpperCase()} · {saidRatio(readBrand(hex).whiteOn)}
          </span>
          <span className="mg-colour__note">{note}</span>
        </span>
      </Tile>
    </li>
  )

  const own = kept && kept !== DESIGNED && kept !== fromMark?.hex ? kept : null

  return (
    <section className="mg-group mg-group--water" aria-labelledby="mg-colour">
      <div className="mg-group__head">
        <h3 className="mg-group__title" id="mg-colour">
          Colour
        </h3>
        <p className="mg-group__say">White words on it need 4.5 : 1</p>
      </div>
      <ul className="mg-colours">
        {card('designed', 'As designed', DESIGNED, null, 'the blue the app was drawn in')}
        {fromMark
          ? card(
              'mark',
              'From the mark',
              fromMark.hex,
              fromMark.hex,
              `the ink of the mark on ${fromMark.from}${fromMark.confirm ? ' · Northside to confirm' : ''}`,
            )
          : null}
        {own ? card('own', 'Northside’s own', own, own, 'typed here') : null}
      </ul>
      <form
        className="mg-colour-try"
        onSubmit={(e) => {
          e.preventDefault()
          const hex = parseHex(typed)
          if (!hex) {
            setTried(null)
            setTriedSay('A colour is written as six figures after a hash, as the mark’s is.')
            return
          }
          setTriedSay(null)
          setTried(hex)
          if (readBrand(hex).refused === null) stage(hex)
        }}
      >
        <Field
          label="Any other colour"
          description="As six figures after a hash, the way a website writes it."
        >
          <Input
            aria-label="Any other colour"
            mono
            value={typed}
            onValueChange={setTyped}
            autoComplete="off"
          />
        </Field>
        <Button type="submit" intent="veiled" size="sm">
          Try it
        </Button>
      </form>
      {triedSay ? (
        <p className="mg-water-refused" role="alert">
          <Refusal>{triedSay}</Refusal>
        </p>
      ) : null}
      {reading?.refused ? (
        <div className="mg-refused" data-testid="manage-colour-refused">
          <p className="mg-water-refused" role="alert">
            <Refusal>{reading.refused}</Refusal>
          </p>
          {near && near.passes.length > 0 ? (
            <div className="mg-near">
              <p className="mg-near__lab">
                {`Nearest that pass, of ${near.tried.toLocaleString('en-AU')} colours tried:`}
              </p>
              <ul className="mg-near__list">
                {near.passes.map((p) => (
                  <li key={p.hex}>
                    <Tile
                      tone="room"
                      shape="chip"
                      selected={brand === p.hex}
                      onSelect={() => stage(p.hex)}
                      label={`${p.hex.toUpperCase()}, white on it ${saidRatio(p.whiteOn)}`}
                    >
                      <span className="mg-colour mg-colour--chip">
                        <span
                          className="mg-colour__swatch"
                          style={{ '--swatch': p.hex } as CSSProperties}
                        />
                        <span className="mg-colour__hex">
                          {p.hex.toUpperCase()} · {saidRatio(p.whiteOn)}
                        </span>
                      </span>
                    </Tile>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
      <div
        className="mg-scale"
        aria-label={`The scale ${shownHex.toUpperCase()} makes, each step read as words on white paper`}
      >
        {scale.map((step) => (
          <span
            key={step.step}
            className="mg-scale__step"
            style={{ '--swatch': step.hex } as CSSProperties}
            data-words={step.onPaper >= 4.5 ? '' : undefined}
            title={`${step.step}: ${step.hex.toUpperCase()}`}
          >
            <span className="mg-scale__n">{step.step}</span>
            <span className="mg-scale__r">{step.onPaper.toFixed(2)}</span>
          </span>
        ))}
      </div>
      <p className="mg-group__foot">
        {`Eleven steps from one colour, never typed one by one. A step under 4.5 : 1 on paper (${STEPS.length - scale.filter((s) => s.onPaper >= 4.5).length} of them) is never used for words.`}
      </p>
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
  /* the photographs on the water, the ones nobody chose as a boat's own picture by hand */
  const onWater = boats.filter((b) => !b.picture.person).slice(0, 8)
  const offered = onWater.length > 0 ? onWater : boats.slice(0, 8)
  return (
    <section className="mg-group mg-group--water" aria-labelledby="mg-pictures">
      <div className="mg-group__head">
        <h3 className="mg-group__title" id="mg-pictures">
          Pictures
        </h3>
        <p className="mg-group__say">
          The exact boats the app has photographs of; each veil is worked from its own pixels
        </p>
      </div>

      <h4 className="mg-sub">Under Home’s name</h4>
      <ul className="mg-shots">
        <li>
          <Tile
            tone="room"
            selected={hero === null}
            onSelect={() => stageHero(null)}
            label="The drawn water, as built"
          >
            <span className="mg-shot mg-shot--water">
              <span className="mg-shot__name">The drawn water</span>
              <span className="mg-shot__note">as built · no photograph</span>
            </span>
          </Tile>
        </li>
        {offered.map((b) => {
          const read = veils.get(b.picture.id)
          return (
            <li key={b.picture.id}>
              <Tile
                tone="room"
                selected={hero?.picture === b.picture.id}
                onSelect={
                  read ? () => stageHero({ picture: b.picture.id, veil: read.veil }) : undefined
                }
                refusedBecause={
                  read
                    ? undefined
                    : 'Its pixels are still being read, so its veil is not known yet.'
                }
                label={`${b.maker} ${b.model}${read ? `, ${saidVeil(read.veil)}` : ''}`}
              >
                <span className="mg-shot">
                  <img
                    className="mg-shot__img"
                    src={thumbOf(b.picture, 320)}
                    alt=""
                    loading="lazy"
                  />
                  <span className="mg-shot__name">{`${b.maker} ${b.model}`}</span>
                  <span className="mg-shot__note">
                    {read ? saidVeil(read.veil) : 'reading its pixels…'}
                  </span>
                </span>
              </Tile>
            </li>
          )
        })}
      </ul>

      <h4 className="mg-sub">On the sign-in page</h4>
      <ul className="mg-shots">
        {offered.map((b) => (
          <li key={b.picture.id}>
            <Tile
              tone="room"
              selected={(door ?? DOOR_DESIGNED) === b.picture.id}
              onSelect={() => stageDoor(b.picture.id === DOOR_DESIGNED ? null : b.picture.id)}
              label={`${b.maker} ${b.model} on the sign-in page`}
            >
              <span className="mg-shot">
                <img className="mg-shot__img" src={thumbOf(b.picture, 320)} alt="" loading="lazy" />
                <span className="mg-shot__name">{`${b.maker} ${b.model}`}</span>
                <span className="mg-shot__note">
                  {b.picture.id === DOOR_DESIGNED ? 'as designed' : 'nothing is written on it'}
                </span>
              </span>
            </Tile>
          </li>
        ))}
      </ul>
    </section>
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
    <section className="mg-group mg-group--water" aria-labelledby="mg-watermark">
      <div className="mg-group__head">
        <h3 className="mg-group__title" id="mg-watermark">
          The mark on the water
        </h3>
        <p className="mg-group__say">
          {own
            ? `Northside’s own file, ${own.name}`
            : 'Northside’s own mark in white ink, from its site · Northside to confirm'}
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
      <p className="mg-group__foot">
        {`A mark on the water needs light ink: ${MARK_FLOOR} : 1 against the navy, at least.`}
      </p>
      {refused ? (
        <p className="mg-water-refused" role="alert">
          <Refusal>{refused}</Refusal>
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
          <Refusal>{refused}</Refusal>
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
                      ? `The ${b.maker} ${b.model} is no longer first on Home`
                      : `The ${b.maker} ${b.model} is first on Home`,
                    {
                      ...home,
                      first:
                        at >= 0
                          ? first.filter((id) => id !== b.picture.id)
                          : [...first, b.picture.id],
                    },
                  )
                }
                label={`${b.maker} ${b.model}${at >= 0 ? `, number ${at + 1} on Home` : ''}`}
              >
                <span className="mg-first">
                  <img
                    className="mg-first__img"
                    src={thumbOf(b.picture, 240)}
                    alt=""
                    loading="lazy"
                  />
                  <span className="mg-first__name">{`${b.maker} ${b.model}`}</span>
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

function Shape({ look, who }: { look: OrgLook | undefined; who: string | null }) {
  const [whose, setWhose] = useState<'northside' | 'mine'>('northside')
  const [refused, setRefused] = useState<string | null>(null)
  const mineRaw = usePrefs((s) => s.values[LOOK_PREF])
  const mine = personLookOf(mineRaw)

  const setOrg = (said: string, patch: Partial<OrgLook>): void =>
    setRefused(keep(changeOrg(said, 'look', (o) => lookWith(o, patch))))

  const setMine = (patch: { spacing?: OrgSpacing; motion?: OrgMotion }): void => {
    const next = { ...mine, ...patch }
    const kept: Record<string, string> = {}
    if (next.spacing) kept.spacing = next.spacing
    if (next.motion) kept.motion = next.motion
    prefs.getState().set(LOOK_PREF, kept)
    say(`Yours alone on this computer: ${describeMine(next)}`, { id: 'manage-step' })
  }

  const spacing =
    whose === 'mine'
      ? (mine.spacing ?? look?.spacing ?? AS_DESIGNED.spacing)
      : (look?.spacing ?? AS_DESIGNED.spacing)
  const motion =
    whose === 'mine'
      ? (mine.motion ?? look?.motion ?? AS_DESIGNED.motion)
      : (look?.motion ?? AS_DESIGNED.motion)

  return (
    <section className="mg-group mg-group--water" aria-labelledby="mg-shape">
      <div className="mg-group__head">
        <h3 className="mg-group__title" id="mg-shape">
          Shape, spacing and motion
        </h3>
        <p className="mg-group__say">Each a named step, never a free number</p>
      </div>
      {refused ? (
        <p className="mg-water-refused" role="alert">
          <Refusal>{refused}</Refusal>
        </p>
      ) : null}
      <div className="mg-steps">
        <Segmented<OrgCorners>
          label="Corners"
          options={CORNERS.map((c) => ({ value: c.value, label: c.word }))}
          value={look?.corners ?? AS_DESIGNED.corners}
          onValueChange={(v) =>
            setOrg(`Corners are ${v} at Northside`, { corners: v === 'round' ? undefined : v })
          }
        />
        <Segmented<OrgShadow>
          label="Shadow"
          options={SHADOWS.map((c) => ({ value: c.value, label: c.word }))}
          value={look?.shadow ?? AS_DESIGNED.shadow}
          onValueChange={(v) =>
            setOrg(`Shadows are ${v} at Northside`, { shadow: v === 'lifted' ? undefined : v })
          }
        />
      </div>
      <div className="mg-whose">
        <Segmented<'northside' | 'mine'>
          label="Spacing and motion for"
          options={[
            { value: 'northside', label: 'Everyone at Northside' },
            { value: 'mine', label: who ? `${who} alone` : 'You alone' },
          ]}
          value={whose}
          onValueChange={setWhose}
        />
      </div>
      <div className="mg-steps">
        <Segmented<OrgSpacing>
          label="Spacing in lists"
          options={SPACINGS.map((c) => ({ value: c.value, label: c.word }))}
          value={spacing}
          onValueChange={(v) =>
            whose === 'mine'
              ? setMine({ spacing: v })
              : setOrg(`Lists are ${v === 'default' ? 'spaced as designed' : v} at Northside`, {
                  spacing: v === 'default' ? undefined : v,
                })
          }
        />
        <Segmented<OrgMotion>
          label="Motion"
          options={MOTIONS.map((c) => ({ value: c.value, label: c.word }))}
          value={motion}
          onValueChange={(v) =>
            whose === 'mine'
              ? setMine({ motion: v })
              : setOrg(v === 'less' ? 'Less motion at Northside' : 'Motion as each computer says', {
                  motion: v === 'system' ? undefined : v,
                })
          }
        />
      </div>
      {whose === 'mine' && (mine.spacing || mine.motion) ? (
        <div className="mg-row-acts">
          <Button
            intent="veiled"
            size="sm"
            icon={ArrowUUpLeftIcon}
            onClick={() => {
              prefs.getState().remove(LOOK_PREF)
              say('Back to Northside’s spacing and motion on this computer', { id: 'manage-step' })
            }}
          >
            Use Northside’s
          </Button>
        </div>
      ) : null}
      <p className="mg-group__foot">
        {whose === 'mine'
          ? 'Kept on this computer for you alone, over Northside’s. A computer set to reduce motion always moves less.'
          : 'A computer set to reduce motion always moves less, whatever is chosen here.'}
      </p>
      <p className="mg-face">
        <span className="mg-face__lab">Face</span>
        <span className="mg-face__name">The computer’s own</span>
        <span className="mg-face__note">the one face the app carries today</span>
      </p>
    </section>
  )
}

function describeMine(look: { spacing?: OrgSpacing; motion?: OrgMotion }): string {
  const said: string[] = []
  if (look.spacing)
    said.push(look.spacing === 'default' ? 'lists as designed' : `${look.spacing} lists`)
  if (look.motion) said.push(look.motion === 'less' ? 'less motion' : 'motion as the computer says')
  return said.join(', ')
}
