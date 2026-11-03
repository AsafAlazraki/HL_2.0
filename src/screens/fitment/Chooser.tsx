import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'
import { ArrowLeftIcon, BoatIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Button, Input, KindMark, Picture, Popover, Row, Tile } from '@/ui'
import {
  boatMakers,
  boatsOnTheList,
  imageAddressOf,
  type BoatFound,
  type BoatMaker,
  type BoatModel,
} from '@/domain/fitment/boat'
import { bySeries, findModels } from '@/domain/fitment/versions'
import { seriesSaid } from '@/domain/fitment/say'
import type { EntityDef, RowData } from '@/domain/model'
import { itemOf, pictureOf, srcSetOf } from '@/data/pictures'
import { markFor } from '@/screens/home/ledgers'

/* ============================================================
   WHICH BOAT — a field that finds one by its words or its code, and,
   before a word is typed, every boat on the price list by maker and
   then by model.

   Two shapes, one finder (`useFinder`): on a screen with no boat chosen
   the question stands ON THE PLATE (`ChooseABoat`), and on a boat it
   stands behind "Another boat" in the head, in the kit's popover.

   A MODEL IS THE ANSWER, NEVER A COLOURWAY (the fitment judge,
   2026-11-03, blocker 1 and major 12). What goes on a boat is the same
   on every version of 66 of Highfield's 67 models, so the chooser asks
   two questions, not three: the maker, then the model, under the series
   the price list files it in, each with its own picture where the image
   ledger holds one — never a stand-in. A model opens on its first
   version, and the plate offers the others. A search answers in models
   too, every one drawn, each with how many of its versions carry the
   words ("660" was 36 colourways, the first 12 drawn).

   THE COLD PAGE KEEPS THE SCREEN'S IDEA. The plate itself stands with
   "Which boat?" where a boat's name goes: the field on it and every
   maker as its own mark. What a boat's lines answer is said in words
   until a maker is pressed; then the plate steps aside for its models.

   ONE PRICE LIST, ONE SIZE. A maker counts its MODELS as Home's door,
   Data and the picker count them — Highfield 67, every maker 289.
   ============================================================ */

const AU = new Intl.NumberFormat('en-AU')
const plural = (n: number, one: string, many: string): string =>
  `${AU.format(n)} ${n === 1 ? one : many}`

type World = { entities: Record<string, EntityDef>; rowsByEntity: Record<string, RowData[]> }

export interface ChooserProps {
  world: World
  onChoose: (rowId: string) => void
  /** boats already on quotes here, most recent first — offered before anything is typed */
  recent: BoatFound[]
  /** THE MAKER OPEN, as the address holds it (`?maker=`), so a Back or a reload keeps the place.
   *  Absent: the finder keeps its own, for a popover. */
  at?: ChooserAt
  onAt?: (next: ChooserAt) => void
}

export interface ChooserAt {
  maker: string
  model: string
}

const hrefOf = (b: BoatFound): string => `/fitment?boat=${encodeURIComponent(b.place.rowId)}`
const noteOf = (b: BoatFound): string =>
  [b.detail, b.code].filter((said) => said !== '').join(' · ')

/** A model as its line says it: the name, and what a one-line model adds ("GRT 455 · Side Console"). */
const modelSaid = (m: BoatModel): string => (m.trim === '' ? m.name : `${m.name} · ${m.trim}`)

/** A model the maker gives no name is drawn by the price list's code, and its note says so, so
 *  "SP300" beside "Sport 330" reads as the file's word, not a slip (the fitment verifier,
 *  2026-11-03; the names ledger: Highfield's site has no Sport 300). */
const withCode = (m: BoatModel, note: string): string =>
  m.coded ? [note, 'the price list’s code'].join(' · ') : note

/** The maker said once, above its models, not again on each of them. */
const bare = (maker: string, name: string): string =>
  name.toLowerCase().startsWith(`${maker.toLowerCase()} `) ? name.slice(maker.length + 1) : name

/** A model's own picture: the first of its versions the image ledger holds one for. Never a
 *  stand-in: a model with none is drawn with the kit's boat mark. */
function modelPicture(world: World, model: BoatModel) {
  for (const v of model.versions) {
    const entity = world.entities[v.place.tableId]
    const row = (world.rowsByEntity[v.place.tableId] ?? []).find((r) => r.id === v.place.rowId)
    if (!entity || !row) continue
    const held = pictureOf(itemOf(entity.id, row.id, imageAddressOf(entity, row)))
    if (held) return held
  }
  return null
}

/** ONE MODEL, AS A CARD WITH ITS OWN PICTURE: pressed, it opens on its first version. */
function ModelCard({
  world,
  model,
  maker,
  note,
  onChoose,
}: {
  world: World
  model: BoatModel
  maker: string
  note: string
  onChoose: (rowId: string) => void
}) {
  const first = model.versions[0]
  const held = useMemo(() => modelPicture(world, model), [world, model])
  if (!first) return null
  const name = bare(maker, modelSaid(model))
  return (
    <li className="ft-md">
      <a
        className="ft-md__card"
        href={hrefOf(first)}
        onClick={(event) => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
          event.preventDefault()
          onChoose(first.place.rowId)
        }}
      >
        <span className="ft-md__pic" data-held={held ? '' : undefined}>
          {held ? (
            <Picture
              src={held.src}
              srcSet={srcSetOf(held)}
              sizes="7rem"
              alt=""
              width={held.width}
              height={held.height}
              fit="contain"
              lazy
            />
          ) : (
            <KindMark kind="boat" size="sm" />
          )}
        </span>
        <span className="ft-md__say">
          <span className="ft-md__name">{name}</span>
          <span className="ft-md__note">{note}</span>
        </span>
      </a>
    </li>
  )
}

/* ---------------------------------------------------------- */
/* The finder: one state, drawn two ways                       */
/* ---------------------------------------------------------- */

interface Finder {
  field: ReactNode
  /** what stands under the field: the models found, or the boats on quotes and a maker's models;
   *  on the cold page the makers themselves are the plate's marks, so they are not here again */
  below: ReactNode
  makers: BoatMaker[]
  maker: BoatMaker | null
  typed: boolean
  /** a maker pressed, or pressed again to close it */
  pick: (maker: string) => void
}

function useFinder(
  { world, onChoose, recent, at, onAt }: ChooserProps,
  { big, marks }: { big: boolean; marks: boolean },
): Finder {
  const [words, setWords] = useState('')
  const [ownMaker, setOwnMaker] = useState('')
  const makerName = at && onAt ? at.maker : ownMaker
  const setMaker = (value: string): void => {
    if (at && onAt) onAt({ maker: value, model: '' })
    else setOwnMaker(value)
  }
  const makers = useMemo(() => boatMakers(world), [world])
  const answer = useMemo(() => findModels(world, makers, words), [world, makers, words])
  const typed = words.trim() !== ''
  const maker: BoatMaker | null = makers.find((m) => m.maker === makerName) ?? null
  const series = useMemo(() => (maker ? bySeries(world, maker) : []), [world, maker])

  const onKey = (event: KeyboardEvent<HTMLElement>): void => {
    const first = typed ? answer.models[0]?.found[0] : undefined
    if (event.key === 'Enter' && first) {
      event.preventDefault()
      onChoose(first.place.rowId)
    }
  }
  const list = big ? 'plate' : undefined
  const pick = (name: string): void => setMaker(makerName === name ? '' : name)

  /* WHAT STANDS UNDER THE FIELD, untyped: a maker's models under their series, or the makers */
  const browse = (() => {
    if (maker) {
      return (
        <>
          <div className="ft-choose__step">
            <p className="ft-choose__found">
              {maker.maker} · {plural(maker.models.length, 'model', 'models')}
            </p>
            {/* on the cold page the maker's own mark, pressed again, is the way back */}
            {marks ? null : (
              <Button intent="quiet" size="sm" icon={ArrowLeftIcon} onClick={() => setMaker('')}>
                Every maker
              </Button>
            )}
          </div>
          {series.map((s) => (
            <section
              key={s.series || 'all'}
              className="ft-series"
              aria-label={s.series === '' ? `${maker.maker} models` : seriesSaid(s.series)}
            >
              {s.series === '' || series.length === 1 ? null : (
                <h3 className="ft-series__head">
                  {seriesSaid(s.series)}
                  <span className="ft-series__n">{AU.format(s.models.length)}</span>
                </h3>
              )}
              <ul className="ft-choose__list ft-models" data-ground={list} data-many="">
                {s.models.map((m) => (
                  <ModelCard
                    key={m.key}
                    world={world}
                    model={m}
                    maker={maker.maker}
                    note={withCode(
                      m,
                      m.versions.length === 1
                        ? m.trim === ''
                          ? noteOf(m.versions[0]!)
                          : m.versions[0]!.code
                        : plural(m.versions.length, 'version', 'versions'),
                    )}
                    onChoose={onChoose}
                  />
                ))}
              </ul>
            </section>
          ))}
        </>
      )
    }
    if (marks) return null
    return (
      <>
        <p className="ft-choose__found">
          {`Every boat on the price list, by maker · ${plural(boatsOnTheList(makers), 'model', 'models')}`}
        </p>
        <ul className="ft-choose__list" data-ground={list}>
          {makers.map((m) => (
            <li key={m.maker}>
              <Row
                kind="boat"
                title={m.maker}
                note={plural(m.boats, 'model', 'models')}
                onPress={() => pick(m.maker)}
              />
            </li>
          ))}
        </ul>
      </>
    )
  })()

  const field = (
    <div className="ft-choose__field">
      <Input
        type="search"
        size={big ? 'lg' : 'md'}
        icon={MagnifyingGlassIcon}
        aria-label="Find a boat"
        placeholder="A boat’s name or its code"
        value={words}
        onValueChange={setWords}
        onKeyDown={onKey}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={!big}
      />
    </div>
  )

  const found = answer.models
  const below = typed ? (
    <>
      <output className="ft-choose__found">
        {found.length === 0
          ? 'No boat on the price list is called that.'
          : `${plural(found.length, 'model carries', 'models carry')} those words, in ${plural(answer.versions, 'version', 'versions')}.`}
      </output>
      {found.length > 0 ? (
        <ul className="ft-choose__list" data-ground={list}>
          {found.map((f) => {
            const first = f.found[0]!
            const note =
              f.model.versions.length === 1
                ? first.code
                : f.found.length === f.model.versions.length
                  ? plural(f.model.versions.length, 'version', 'versions')
                  : `${AU.format(f.found.length)} of its ${plural(f.model.versions.length, 'version', 'versions')}`
            return (
              <li key={f.model.key}>
                <Row
                  kind="boat"
                  title={modelSaid(f.model)}
                  note={withCode(f.model, note)}
                  href={hrefOf(first)}
                  onPress={() => onChoose(first.place.rowId)}
                />
              </li>
            )
          })}
        </ul>
      ) : null}
    </>
  ) : (
    <>
      {recent.length > 0 && !maker ? (
        <>
          <p className="ft-choose__found">On quotes here</p>
          <ul className="ft-choose__list" data-ground={list}>
            {recent.map((b) => (
              <li key={b.place.rowId}>
                <Row
                  kind="boat"
                  title={b.name}
                  note={noteOf(b)}
                  href={hrefOf(b)}
                  onPress={() => onChoose(b.place.rowId)}
                />
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {browse}
    </>
  )

  return { field, below, makers, maker, typed, pick }
}

/* ---------------------------------------------------------- */
/* The cold page: the plate, asking                            */
/* ---------------------------------------------------------- */

/** What each of the plate's lines answers once a boat is chosen — said, never counted. */
const LINES: ReadonlyArray<{ word: string; says: string }> = [
  {
    word: 'Motor',
    says: 'The horsepower it takes, and every motor made for it, rigged and priced.',
  },
  { word: 'Trailer', says: 'The trailers built for it, each weighed against the boat.' },
  { word: 'Also made for it', says: 'The packages and parts made for it.' },
]

/** One maker, as its own mark on the kit's white card — the ledger's dark-ink mark, through
 *  Home's and Data's one reader (`markFor`) — and its name in type only where the ledger holds
 *  no mark in that ink (Stabicraft publishes white ink alone, which a white card cannot carry). */
function MakerMark({ maker, on, onPress }: { maker: BoatMaker; on: boolean; onPress: () => void }) {
  const choice = markFor(maker.maker, 'paper')
  const models = plural(maker.boats, 'model', 'models')
  return (
    <li className="ft-mk">
      <Tile
        shape="card"
        tick="none"
        selected={on}
        onSelect={onPress}
        label={`${maker.maker} ${models}`}
      >
        <span className="ft-mk__face">
          <span className="ft-mk__mark">
            {choice.drawn ? (
              <img
                className="ft-mk__img"
                src={choice.mark.src}
                alt=""
                width={choice.mark.width}
                height={choice.mark.height}
                decoding="async"
              />
            ) : (
              <span className="ft-mk__typed">{maker.maker}</span>
            )}
          </span>
          <span className="ft-mk__n">{models}</span>
        </span>
      </Tile>
    </li>
  )
}

/** The question on the plate, for a visit with no boat chosen yet. */
export function ChooseABoat({ missing, ...props }: ChooserProps & { missing: boolean }) {
  const finder = useFinder(props, { big: true, marks: true })
  /* once a maker is pressed or a word typed, the plate's explainer steps aside for the answer */
  const asking = !finder.maker && !finder.typed
  return (
    <>
      <section
        className="ft-plate"
        data-ground="night"
        data-cold=""
        data-asking={asking ? '' : undefined}
        aria-labelledby="ft-which"
      >
        <span className="ft-rivet" data-at="ts" aria-hidden="true" />
        <span className="ft-rivet" data-at="te" aria-hidden="true" />
        <span className="ft-rivet" data-at="bs" aria-hidden="true" />
        <span className="ft-rivet" data-at="be" aria-hidden="true" />
        <div className="ft-plate__id">
          <div className="ft-id">
            <h1 className="ft-id__name" id="ft-which">
              Which boat?
            </h1>
            {missing ? (
              <p className="ft-id__detail">That boat is not on the price list. Choose another.</p>
            ) : null}
          </div>
        </div>
        <div className="ft-cold">
          {finder.field}
          <p className="ft-cold__by">
            {`Or by maker · ${plural(boatsOnTheList(finder.makers), 'model', 'models')}`}
          </p>
          <ul className="ft-mks" aria-label="Every maker on the price list">
            {finder.makers.map((m) => (
              <MakerMark
                key={m.maker}
                maker={m}
                on={finder.maker?.maker === m.maker}
                onPress={() => finder.pick(m.maker)}
              />
            ))}
          </ul>
        </div>
        {asking ? (
          <>
            <dl className="ft-cold__lines" aria-label="What a boat’s plate answers">
              {LINES.map((l) => (
                <div key={l.word} className="ft-cold__line">
                  <dt className="ft-cold__word">{l.word}</dt>
                  <dd className="ft-cold__says">{l.says}</dd>
                </div>
              ))}
            </dl>
            <p className="ft-cold__foot">
              Choose a boat, and each line counts what is offered on it and says why every other one
              is not.
            </p>
          </>
        ) : null}
      </section>
      <div className="ft-choose ft-under" data-big="">
        {finder.below}
      </div>
    </>
  )
}

/** "Another boat", in the head of a boat's screen. */
export function AnotherBoat(props: ChooserProps) {
  const [open, setOpen] = useState(false)
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      side="bottom"
      align="end"
      title="Another boat"
      trigger={<Button icon={BoatIcon}>Another boat</Button>}
    >
      <PopoverFinder
        {...props}
        onChoose={(rowId) => {
          setOpen(false)
          props.onChoose(rowId)
        }}
      />
    </Popover>
  )
}

function PopoverFinder(props: ChooserProps) {
  const finder = useFinder(props, { big: false, marks: false })
  return (
    <div className="ft-choose">
      {finder.field}
      {finder.below}
    </div>
  )
}
