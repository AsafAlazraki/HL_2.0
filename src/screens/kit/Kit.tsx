import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowsLeftRightIcon,
  BarcodeIcon,
  EngineIcon,
  FileTextIcon,
  GasPumpIcon,
  HandshakeIcon,
  InfoIcon,
  MagnifyingGlassIcon,
  MoneyIcon,
  MoonIcon,
  PaperPlaneTiltIcon,
  PlusIcon,
  PrinterIcon,
  RulerIcon,
  ScalesIcon,
  SquaresFourIcon,
  StackIcon,
} from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { TableKind } from '@/domain/model'
import { ACCENT_PREVIEWS, accentRefusal, cssOf } from '@/domain/appearance/accent'
import {
  boatFacts,
  motorFacts,
  type KitSpecimen,
  type SpecimenBoat,
  type SpecimenMotor,
} from '@/domain/kit/specimen'
import { money } from '@/domain/money'
import { ADDRESSED_TO_NOBODY } from '@/domain/quote/totals'
import {
  Band,
  BandHead,
  Button,
  Chapter,
  Chip,
  Dashes,
  Dialog,
  DialogClose,
  Field,
  Figure,
  Icon,
  Input,
  Kbd,
  KindMark,
  Menu,
  MenuItem,
  Moving,
  OptionTile,
  Picture,
  Plate,
  Popover,
  PriceFigure,
  Row,
  Segmented,
  Select,
  Sheet,
  Stat,
  StatusDot,
  Tile,
  Toast,
  Toggle,
  Tooltip,
  morph,
  say,
  undo,
  type Glyph,
} from '@/ui'
import { useChapterProgress, useSmoothScroll } from '@/ui/scroll'
import './kit.css'

/* ============================================================
   THE KIT, WHOLE — board C "Signal", built (2026-09-28).

   Every primitive in src/ui, in its states, on the Stacer 529 Assault
   Pro (Tournament) as the Master Price File holds it: by day on the
   room, on white plates, over the 529's own photograph, and on the
   night's navy ground. Everything here is live — press it, hover it,
   move through it with the keyboard — and a state that only a pointer
   or a held press can reach is ALSO drawn frozen beside it
   (`data-specimen`), so the owner can see it at rest and the rulers
   can measure it.

   WHAT THIS SCREEN DOES THAT NO OTHER DOES: it is the language itself
   rather than a use of it. It saves nothing, starts no quote and writes
   nothing to this browser; every choice on it is the page's own and is
   gone when the page is left — the accent a person tries included.

   WHAT IT SAYS IS TRUE OF IT. The refused act says the finale's own
   sentence while the field is empty, and once a name is typed says why
   the kit still gives nothing: it holds no quote. A toast says what
   the page really did.
   ============================================================ */

type Read = KitSpecimen | { refused: string } | null

export function Kit({ read }: { read: Read }) {
  if (read === null)
    return (
      <main className="kit" data-testid="kit">
        <p className="kit-reading">Reading the 529 from the price file…</p>
      </main>
    )
  if ('refused' in read)
    return (
      <main className="kit" data-testid="kit" data-read="">
        <p className="kit-reading">{read.refused}</p>
      </main>
    )
  return <Specimen kit={read} />
}

const SEED = `${import.meta.env.BASE_URL}seed-images/`

const pictureOf = (
  p: SpecimenBoat['picture'] | SpecimenMotor['picture'],
  alt: string,
): { src: string; alt: string; width: number; height: number } | null =>
  p ? { src: `${SEED}${p.file}`, alt, width: p.width, height: p.height } : null

const FACT_GLYPHS: readonly Glyph[] = [
  RulerIcon,
  ArrowsLeftRightIcon,
  GasPumpIcon,
  ScalesIcon,
  EngineIcon,
]

function Specimen({ kit }: { kit: KitSpecimen }) {
  useSmoothScroll()
  const boats = useMemo(() => [kit.boat, ...kit.siblings], [kit])
  const [level, setLevel] = useState(kit.boat.levels[0]?.key ?? 'cash')
  const [night, setNight] = useState(false)
  const [codes, setCodes] = useState(false)
  /* the motor chosen on each hull, by the hull; a hull nobody has touched has the file's star */
  const [picks, setPicks] = useState<Record<string, string | null>>({})
  const [hp, setHp] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [find, setFind] = useState('')
  const [view, setView] = useState<'stage' | 'picker'>('stage')
  const [stageId, setStageId] = useState(kit.boat.rowId)
  const [accent, setAccent] = useState(ACCENT_PREVIEWS[0]!.key)
  const [open, setOpen] = useState<'hull' | 'motor' | 'trailer' | null>('motor')

  const stage = boats.find((b) => b.rowId === stageId) ?? kit.boat
  const motors = stage.motors
  const star = motors.find((m) => m.recommended) ?? motors[0] ?? null
  const chosen = stage.rowId in picks ? (picks[stage.rowId] ?? null) : (star?.rowId ?? null)
  const pick = (boatId: string, motorId: string | null): void =>
    setPicks((p) => ({ ...p, [boatId]: motorId }))
  const priceAt = (levels: { key: string; amount: number }[]): number | null =>
    levels.find((l) => l.key === level)?.amount ?? levels[0]?.amount ?? null
  const chosenMotor = motors.find((m) => m.rowId === chosen) ?? null

  /* THE ACCENT A PERSON TRIES is set on the root for as long as the page stands and taken off
     when it goes: a preview, never a setting. The accent the app has removes the override. */
  useEffect(() => {
    const choice = ACCENT_PREVIEWS.find((a) => a.key === accent)
    const root = document.documentElement
    if (!choice || choice === ACCENT_PREVIEWS[0]) root.style.removeProperty('--color-accent')
    else root.style.setProperty('--color-accent', cssOf(choice.colour))
    return () => {
      root.style.removeProperty('--color-accent')
    }
  }, [accent])

  const hullRef = useRef<HTMLDivElement>(null)
  const motorRef = useRef<HTMLDivElement>(null)
  const trailerRef = useRef<HTMLDivElement>(null)
  const chapterRefs = useMemo(() => [hullRef, motorRef, trailerRef], [])
  const place = useChapterProgress(chapterRefs)

  const choose = (motor: SpecimenMotor): void => {
    const before = chosen
    const hull = stage.rowId
    const was = motors.find((m) => m.rowId === before) ?? null
    if (before === motor.rowId) {
      pick(hull, null)
      undo(`${motor.said} taken off`, () => pick(hull, before), { kind: 'motor' })
      return
    }
    pick(hull, motor.rowId)
    if (was)
      undo(`${motor.said} chosen in place of ${was.said}`, () => pick(hull, before), {
        kind: 'motor',
      })
  }

  const hps = useMemo(() => {
    const counts = new Map<string, number>()
    for (const m of motors) if (m.hp) counts.set(m.hp, (counts.get(m.hp) ?? 0) + 1)
    return [...counts]
  }, [motors])
  /* a horsepower this hull's motors do not have narrows nothing */
  const narrowed = hps.some(([power]) => power === hp) ? hp : null
  const shown = narrowed === null ? motors : motors.filter((m) => m.hp === narrowed)

  const q = find.trim().toLowerCase()
  const found =
    q === ''
      ? []
      : [
          ...boats
            .filter((b) => `${b.title} ${b.code}`.toLowerCase().includes(q))
            .map((b) => ({
              id: b.rowId,
              kind: 'boat' as TableKind,
              title: b.title,
              levels: b.levels,
            })),
          ...motors
            .filter((m) => `${m.said} ${m.code}`.toLowerCase().includes(q))
            .map((m) => ({
              id: m.rowId,
              kind: 'motor' as TableKind,
              title: m.said,
              levels: m.levels,
            })),
        ]

  const same =
    stage.levels.length > 1 && stage.levels.every((l) => l.amount === stage.levels[0]!.amount)
  const levelOptions = kit.boat.levels.map((l) => ({
    value: l.key,
    label: l.label,
    icon: l.key === 'trade' ? HandshakeIcon : MoneyIcon,
  }))

  const openMotors = (): void => {
    setOpen('motor')
    requestAnimationFrame(() =>
      motorRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }),
    )
  }

  return (
    <main
      className="kit"
      data-testid="kit"
      data-read=""
      data-ground={night ? 'night' : undefined}
      aria-labelledby="kit-title"
    >
      <header className="kit-head">
        <h1 id="kit-title" className="kit-title">
          The kit
        </h1>
        <p className="kit-lede">
          Every control Northside’s screens are drawn with, in its states, on the {kit.boat.title}{' '}
          as the Master Price File holds it. Press them, hover them, move through them with the
          keyboard; a state only a pointer can reach is also drawn at rest beside it.
        </p>
      </header>

      <div className="kit-grid">
        <div className="kit-col">
          <Group title="The band" note="Northside’s name, where the mark will stand.">
            <Band
              key={accent}
              name={kit.business}
              say="The name in type, until Northside adds its mark."
            />
            <p className="kit-note">
              Its ground is live water drawn in the accent, never brighter than the accent itself,
              so the white on it holds 5.8 : 1. It stands still under reduced motion and while a
              caret is in a field.
            </p>
          </Group>

          <Group
            title="Over a photograph"
            note="The price on a white plate no picture can reach, and a picture that travels."
          >
            {view === 'stage' ? (
              <div className="kit-stage">
                <figure className="kit-photo">
                  {stage.picture ? (
                    <Picture
                      {...pictureOf(
                        stage.picture,
                        `${stage.title} on the water, its own photograph`,
                      )!}
                      shared={`boat-${stage.code}`}
                      priority
                    />
                  ) : null}
                  <figcaption className="kit-credit">Its own photograph, from the file</figcaption>
                </figure>
                <div className="kit-priceplate">
                  <Plate pad="md">
                    <p className="kit-boatname">
                      {stage.name}
                      {stage.trim ? <span className="kit-trim"> ({stage.trim})</span> : null}
                      {codes ? <span className="kit-code">{stage.code}</span> : null}
                    </p>
                    <div className="kit-pricerow">
                      {priceAt(stage.levels) === null ? (
                        <span className="kit-none">No price at this level</span>
                      ) : (
                        <PriceFigure amount={priceAt(stage.levels)!} size="display" />
                      )}
                      <Segmented
                        label="Price level"
                        options={levelOptions}
                        value={level}
                        onValueChange={setLevel}
                      />
                    </div>
                    {same ? (
                      <p className="kit-same">
                        <span className="kit-glyph">
                          <Icon glyph={InfoIcon} weight="fill" />
                        </span>
                        {stage.levels.map((l) => l.label).join(' and ')} are the same figure on this
                        boat.
                      </p>
                    ) : null}
                  </Plate>
                </div>
                <Plate pad="md">
                  <ul className="kit-facts" aria-label="What the file says of it">
                    {boatFacts(stage).map((fact, i) => (
                      <li key={fact} className="kit-fact">
                        <span className="kit-glyph">
                          <Icon glyph={FACT_GLYPHS[i] ?? RulerIcon} />
                        </span>
                        {fact}
                      </li>
                    ))}
                  </ul>
                  <div className="kit-foot">
                    <Button
                      intent="quiet"
                      size="sm"
                      icon={ArrowLeftIcon}
                      onClick={() => morph(() => setView('picker'))}
                    >
                      Back to the 529s
                    </Button>
                    <span className="kit-act">
                      <Button intent="act" icon={ArrowDownIcon} onClick={openMotors}>
                        Choose its motor
                      </Button>
                    </span>
                  </div>
                </Plate>
              </div>
            ) : (
              <div className="kit-shelf">
                <p className="kit-note">
                  {kit.boat.maker} · the {boats.length} {kit.boat.number}s in the file. Press one to
                  see it.
                </p>
                <div className="kit-tiles">
                  {boats.map((b) => (
                    <Tile
                      key={b.rowId}
                      selected={b.rowId === stageId}
                      label={`${b.title}, ${money(priceAt(b.levels) ?? 0)}`}
                      onSelect={() =>
                        morph(() => {
                          setStageId(b.rowId)
                          setView('stage')
                        })
                      }
                    >
                      <span className="kit-tile">
                        <span className="kit-tile-photo">
                          {b.picture ? (
                            <Picture
                              {...pictureOf(b.picture, b.title)!}
                              shared={`boat-${b.code}`}
                            />
                          ) : null}
                        </span>
                        <span className="kit-tile-name">{b.title}</span>
                        {priceAt(b.levels) === null ? null : (
                          <PriceFigure amount={priceAt(b.levels)!} size="lg" />
                        )}
                      </span>
                    </Tile>
                  ))}
                </div>
              </div>
            )}
          </Group>

          <Group title="Registers" note="A line that opens something, and what it counts.">
            <Plate pad="sm">
              {[kit.registers.boat, kit.registers.motor, kit.registers.trailer].map((r) =>
                r ? (
                  <Row
                    key={r.id}
                    title={r.name}
                    kind={r.kind}
                    count={r.rows}
                    current={r.id === kit.registers.boat.id}
                    href={`/data/${r.id}`}
                    note={r.id === kit.registers.boat.id ? 'the 529’s' : undefined}
                  />
                ) : null,
              )}
            </Plate>
            <div className="kit-stats">
              <Plate pad="md">
                <Stat
                  kind="boat"
                  value={kit.registers.boat.rows}
                  label={`lines in ${kit.registers.boat.name}`}
                />
              </Plate>
              <Plate pad="md">
                <Stat
                  kind="motor"
                  value={motors.length}
                  label={`motors paired with the ${kit.boat.number}`}
                />
              </Plate>
              <Plate pad="md">
                <Stat
                  kind="trailer"
                  value={stage.trailers.length}
                  label={`trailer${stage.trailers.length === 1 ? '' : 's'} paired with the ${kit.boat.number}`}
                />
              </Plate>
            </div>
            <Plate pad="md">
              <BandHead state="draft">Drafts</BandHead>
              <BandHead state="given">Given to the customer</BandHead>
              <BandHead state="superseded">Superseded by a newer version</BandHead>
            </Plate>
          </Group>

          <Group title="Find" note="A field with its glyph, and a count that moves as it narrows.">
            <Plate pad="md">
              <Field label={`Find a ${kit.boat.number} or its motor`}>
                <Input
                  icon={MagnifyingGlassIcon}
                  value={find}
                  onValueChange={setFind}
                  placeholder={`${kit.boat.number}, Outlaw, F115…`}
                  autoComplete="off"
                />
              </Field>
              <p className="kit-count">
                <Figure value={found.length} /> {found.length === 1 ? 'answer' : 'answers'}
                {q === '' ? ' — type to narrow' : ''}
              </p>
              <Moving items={found.slice(0, 5)} keyOf={(f) => f.id} label="What answers">
                {(f) => (
                  <Row
                    as="div"
                    title={f.title}
                    kind={f.kind}
                    trail={
                      priceAt(f.levels) === null ? (
                        <span />
                      ) : (
                        <PriceFigure amount={priceAt(f.levels)!} />
                      )
                    }
                  />
                )}
              </Moving>
            </Plate>
          </Group>
        </div>

        <div className="kit-col">
          <Group
            title="The build"
            note="Chapters that open, options that choose, and where you are."
          >
            <Plate pad="lg">
              <div className="kit-dashes">
                <Dashes
                  chapters={['Hull', 'Motor', 'Trailer']}
                  at={place.at}
                  through={place.through}
                />
              </div>
              <div ref={hullRef} className="kit-chapter">
                <Chapter
                  number="01"
                  title="Hull"
                  kind="boat"
                  count={`${boats.length} × ${kit.boat.number}`}
                  say="The hull, at the level chosen on the price plate."
                  total={priceAt(stage.levels)}
                  open={open === 'hull'}
                  onOpenChange={(next) => setOpen(next ? 'hull' : null)}
                >
                  <div className="kit-rows">
                    {boats.map((b) => (
                      <Tile
                        key={b.rowId}
                        shape="row"
                        selected={b.rowId === stageId}
                        onSelect={() => setStageId(b.rowId)}
                      >
                        <span className="kit-rowline">
                          <span>{b.title}</span>
                          {priceAt(b.levels) === null ? null : (
                            <PriceFigure amount={priceAt(b.levels)!} />
                          )}
                        </span>
                      </Tile>
                    ))}
                  </div>
                </Chapter>
              </div>
              <div ref={motorRef} className="kit-chapter">
                <Chapter
                  number="02"
                  title="Motor"
                  kind="motor"
                  count={`${motors.length} paired`}
                  say="One is chosen; the figure on each is its price at that level."
                  total={chosenMotor ? priceAt(chosenMotor.levels) : null}
                  open={open === 'motor'}
                  onOpenChange={(next) => setOpen(next ? 'motor' : null)}
                >
                  <div className="kit-chips">
                    {hps.map(([power, count]) => (
                      <Chip
                        key={power}
                        icon={EngineIcon}
                        count={count}
                        selected={narrowed === power}
                        onSelect={() => setHp(narrowed === power ? null : power)}
                      >
                        {`${power} hp`}
                      </Chip>
                    ))}
                  </div>
                  <div className="kit-options">
                    <Moving items={shown} keyOf={(m) => m.rowId} flow="tiles" label="The motors">
                      {(m) => (
                        <OptionTile
                          name={m.said}
                          facts={codes ? `${motorFacts(m)} · ${m.code}` : motorFacts(m)}
                          picture={pictureOf(m.picture, `${m.said}, the maker’s studio picture`)}
                          kind="motor"
                          figure={
                            priceAt(m.levels) === null ? undefined : (
                              <PriceFigure amount={priceAt(m.levels)!} />
                            )
                          }
                          figureSay={m.levels.find((l) => l.key === level)?.label}
                          selected={chosen === m.rowId}
                          onSelect={() => choose(m)}
                        />
                      )}
                    </Moving>
                  </div>
                </Chapter>
              </div>
              <div ref={trailerRef} className="kit-chapter">
                <Chapter
                  number="03"
                  title="Trailer"
                  kind="trailer"
                  count={`${stage.trailers.length} paired`}
                  say={`The trailer ${kit.registers.trailer?.name ?? 'the file'} pairs with this hull.`}
                  open={open === 'trailer'}
                  onOpenChange={(next) => setOpen(next ? 'trailer' : null)}
                >
                  <div className="kit-rows">
                    {stage.trailers.map((t) => (
                      <Row
                        key={t.rowId}
                        as="div"
                        title={t.said}
                        kind="trailer"
                        note={codes ? t.code : undefined}
                      />
                    ))}
                  </div>
                </Chapter>
              </div>
            </Plate>
          </Group>

          <Group title="Acts" note="Amber is the one loud thing you press; each act has its glyph.">
            <Plate pad="md">
              <div className="kit-acts">
                <span className="kit-act">
                  <Button intent="act" icon={ArrowDownIcon} onClick={openMotors}>
                    Choose its motor
                  </Button>
                </span>
                <Button
                  intent="primary"
                  icon={FileTextIcon}
                  onClick={() => say('The kit holds no quote, so there is no paper to open.')}
                >
                  Open the paper
                </Button>
                <Button
                  intent="secondary"
                  icon={PlusIcon}
                  onClick={() =>
                    say('The kit holds no quote, so there is nothing to make a version of.')
                  }
                >
                  New version
                </Button>
                <Button intent="quiet" icon={ArrowLeftIcon} href="/">
                  Home
                </Button>
              </div>
              <States />
            </Plate>
          </Group>

          <Group
            title="Settings and states"
            note="A toggle says its word; a state is a dot beside its word."
          >
            <Plate pad="md">
              <div className="kit-toggles">
                <Toggle
                  label="Night ground"
                  icon={MoonIcon}
                  checked={night}
                  onCheckedChange={setNight}
                />
                <Toggle
                  label="The file’s codes"
                  icon={BarcodeIcon}
                  checked={codes}
                  onCheckedChange={setCodes}
                />
              </div>
              <div className="kit-dots">
                <StatusDot state="draft">Draft</StatusDot>
                <StatusDot state="given">Given</StatusDot>
                <StatusDot state="superseded">Superseded</StatusDot>
              </div>
              <ul className="kit-kinds" aria-label="What a thing is">
                {(
                  ['boat', 'motor', 'trailer', 'accessory', 'package', 'dealer', 'custom'] as const
                ).map((k) => (
                  <li key={k} className="kit-kind">
                    <KindMark kind={k} />
                    {KIND_WORD[k]}
                  </li>
                ))}
              </ul>
            </Plate>
          </Group>

          <Group
            title="Northside’s accent"
            note="Try another; the kit stays designed. Two are refused, each with its reason. Nothing is saved."
          >
            <Plate pad="md">
              <div className="kit-accents">
                {ACCENT_PREVIEWS.map((a) => (
                  <Chip
                    key={a.key}
                    icon={SquaresFourIcon}
                    selected={accent === a.key}
                    onSelect={() => setAccent(a.key)}
                    refusedBecause={accentRefusal(a.colour) ?? undefined}
                  >
                    {a.name}
                  </Chip>
                ))}
              </div>
            </Plate>
          </Group>

          <Group
            title="Fields"
            note="A refusal is a sentence where it is refused, never a dead button."
          >
            <Plate pad="md">
              <div className="kit-field">
                <Field label="Who the quote is addressed to">
                  <Input
                    value={name}
                    onValueChange={setName}
                    placeholder="Nobody named yet"
                    autoComplete="off"
                  />
                </Field>
                <span className="kit-act">
                  <Button
                    intent="act"
                    icon={PaperPlaneTiltIcon}
                    refusedBecause={
                      name.trim() === ''
                        ? ADDRESSED_TO_NOBODY
                        : 'The kit holds no quote, so there is nothing here to give.'
                    }
                  >
                    Give it to the customer
                  </Button>
                </span>
              </div>
              <div className="kit-select">
                <span className="kit-label" id="kit-motor-label">
                  Motor
                </span>
                <Select
                  aria-label="Motor"
                  kind="motor"
                  value={chosen}
                  onValueChange={(v) => pick(stage.rowId, v)}
                  placeholder="No motor chosen"
                  options={motors.map((m) => ({
                    value: m.rowId,
                    label: m.said,
                    trail: priceAt(m.levels) === null ? undefined : money(priceAt(m.levels)!),
                  }))}
                />
              </div>
            </Plate>
          </Group>

          <Group
            title="Over the screen"
            note="Each opens from what opened it, and leaves faster than it came."
          >
            <Plate pad="md">
              <div className="kit-acts">
                <Menu
                  label="Show another 529"
                  trigger={
                    <Button intent="secondary" icon={StackIcon}>
                      Another {kit.boat.number}
                    </Button>
                  }
                >
                  {boats.map((b) => (
                    <MenuItem key={b.rowId} onSelect={() => morph(() => setStageId(b.rowId))}>
                      {b.title}
                    </MenuItem>
                  ))}
                </Menu>
                <Popover
                  title={`Why these ${motors.length}`}
                  trigger={
                    <Button intent="secondary" icon={InfoIcon}>
                      Why these motors
                    </Button>
                  }
                >
                  <p className="kit-pop">
                    The price file pairs {motors.length} Yamahas with the {stage.title}, in this
                    order, and stars {star ? star.said : 'none of them'}.
                  </p>
                </Popover>
                <Dialog
                  title="The kit"
                  description="Board C, Signal: colour and icon, blue and white, every ink one job."
                  trigger={
                    <Button intent="secondary" icon={InfoIcon}>
                      What this page is
                    </Button>
                  }
                  actions={
                    <DialogClose>
                      <Button intent="primary">Back to the kit</Button>
                    </DialogClose>
                  }
                >
                  <p className="kit-pop">
                    It draws every control the screens are made of, on one boat from the price file,
                    and keeps nothing.
                  </p>
                </Dialog>
                <Sheet
                  title={stage.title}
                  description="What the price file says of this hull."
                  trigger={
                    <Button intent="secondary" icon={RulerIcon}>
                      Its facts
                    </Button>
                  }
                >
                  <ul className="kit-facts kit-facts--sheet">
                    {boatFacts(stage).map((fact, i) => (
                      <li key={fact} className="kit-fact">
                        <span className="kit-glyph">
                          <Icon glyph={FACT_GLYPHS[i] ?? RulerIcon} />
                        </span>
                        {fact}
                      </li>
                    ))}
                  </ul>
                </Sheet>
                <Tooltip content="Prints nothing: the kit holds no paper.">
                  <Button
                    intent="quiet"
                    icon={PrinterIcon}
                    onClick={() => say('The kit holds no paper to print.')}
                  >
                    Print
                  </Button>
                </Tooltip>
              </div>
              <p className="kit-keys">
                The finder opens on <Kbd>Mod K</Kbd> anywhere in the app.
              </p>
              <div className="kit-toast">
                <Toast
                  kind="motor"
                  text={`${motors.length} motors read from ${kit.registers.motor?.name ?? 'the file'}`}
                />
              </div>
            </Plate>
          </Group>
        </div>
      </div>

      <section className="kit-night" data-ground="night" aria-labelledby="kit-night-title">
        <h2 id="kit-night-title" className="kit-h">
          On the dark ground
        </h2>
        <p className="kit-note">
          White plates on the navy room: the same controls, the night’s inks.
        </p>
        <div className="kit-night-grid">
          <div className="kit-night-cell">
            <span className="kit-act">
              <Button intent="act" icon={ArrowDownIcon} onClick={openMotors}>
                Choose its motor
              </Button>
            </span>
            <div className="kit-acts">
              <Button
                intent="primary"
                icon={FileTextIcon}
                onClick={() => say('The kit holds no quote, so there is no paper to open.')}
              >
                Open the paper
              </Button>
              <Button
                intent="veiled"
                icon={StackIcon}
                onClick={() => morph(() => setView('picker'))}
              >
                The {kit.boat.number}s
              </Button>
              <Button intent="quiet" icon={ArrowLeftIcon} href="/">
                Home
              </Button>
            </div>
            <Segmented
              label="Price level on the dark ground"
              options={levelOptions}
              value={level}
              onValueChange={setLevel}
            />
            <Toggle
              label="The file’s codes"
              icon={BarcodeIcon}
              checked={codes}
              onCheckedChange={setCodes}
            />
          </div>
          <div className="kit-night-cell">
            <div className="kit-dots">
              <StatusDot state="draft">Draft</StatusDot>
              <StatusDot state="given">Given</StatusDot>
              <StatusDot state="superseded">Superseded</StatusDot>
            </div>
            {[kit.registers.boat, kit.registers.motor].map((r) =>
              r ? (
                <Row
                  key={r.id}
                  title={r.name}
                  kind={r.kind}
                  count={r.rows}
                  href={`/data/${r.id}`}
                />
              ) : null,
            )}
            <Stat
              kind="motor"
              value={motors.length}
              label={`motors paired with the ${kit.boat.number}`}
            />
          </div>
          <div className="kit-night-cell">
            {star ? (
              <OptionTile
                name={star.said}
                facts={motorFacts(star)}
                picture={pictureOf(star.picture, `${star.said}, the maker’s studio picture`)}
                kind="motor"
                figure={
                  priceAt(star.levels) === null ? undefined : (
                    <PriceFigure amount={priceAt(star.levels)!} />
                  )
                }
                figureSay={star.levels.find((l) => l.key === level)?.label}
                selected={chosen === star.rowId}
                onSelect={() => choose(star)}
              />
            ) : null}
            <div className="kit-chips">
              {hps.slice(0, 2).map(([power, count]) => (
                <Chip
                  key={power}
                  icon={EngineIcon}
                  count={count}
                  selected={narrowed === power}
                  onSelect={() => setHp(narrowed === power ? null : power)}
                >
                  {`${power} hp`}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

const KIND_WORD: Record<TableKind, string> = {
  boat: 'Boat',
  motor: 'Motor',
  trailer: 'Trailer',
  accessory: 'Accessory',
  package: 'Package',
  dealer: 'Dealer',
  custom: 'A list of Northside’s own',
}

function Group({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  const id = `kit-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`
  return (
    <section className="kit-group" aria-labelledby={id}>
      <h2 id={id} className="kit-h">
        {title}
      </h2>
      <p className="kit-note">{note}</p>
      {children}
    </section>
  )
}

type State = 'rest' | 'hover' | 'press' | 'focus' | 'refused'
const STATES: readonly { state: State; said: string }[] = [
  { state: 'rest', said: 'at rest' },
  { state: 'hover', said: 'hover' },
  { state: 'press', said: 'pressed' },
  { state: 'focus', said: 'focus' },
  { state: 'refused', said: 'refused' },
]

/** THE CONTROLS WHOSE STATES ARE DRAWN FROZEN: the act, and the two acts beside it. */
const STATE_ROWS: readonly { name: string; refuses: boolean; draw: (state: State) => ReactNode }[] =
  [
    {
      name: 'the act',
      refuses: true,
      draw: (state) => (
        <span className="kit-act kit-act--small">
          <Button
            intent="act"
            size="sm"
            icon={ArrowDownIcon}
            tabIndex={-1}
            refusedBecause={
              state === 'refused'
                ? 'This act is drawn refused, so its reason can be read at rest.'
                : undefined
            }
          >
            Build
          </Button>
        </span>
      ),
    },
    {
      name: 'primary',
      refuses: false,
      draw: () => (
        <Button intent="primary" size="sm" icon={FileTextIcon} tabIndex={-1}>
          Open
        </Button>
      ),
    },
    {
      name: 'secondary',
      refuses: false,
      draw: () => (
        <Button intent="secondary" size="sm" icon={PlusIcon} tabIndex={-1}>
          Add
        </Button>
      ),
    },
    {
      name: 'a chip',
      refuses: false,
      draw: () => (
        <Chip icon={EngineIcon} count={2} selected={false}>
          90 hp
        </Chip>
      ),
    },
  ]

/** One control drawn in each of its states, frozen, with the state's name under it. They are
 *  pictures of states, so they are `inert`: the live controls are the ones above. */
function States() {
  const rows = STATE_ROWS
  return (
    <div className="kit-states">
      {rows.map((row) => (
        <div key={row.name} className="kit-staterow">
          <span className="kit-statename">{row.name}</span>
          {STATES.filter((s) => s.state !== 'refused' || row.refuses).map((s) => (
            <figure key={s.state} className="kit-state">
              <span
                data-specimen={s.state === 'rest' || s.state === 'refused' ? undefined : s.state}
                inert
              >
                {row.draw(s.state)}
              </span>
              <figcaption className="kit-cap">{s.said}</figcaption>
            </figure>
          ))}
        </div>
      ))}
    </div>
  )
}
