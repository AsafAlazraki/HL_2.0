import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'
import { ArrowLeftIcon, BoatIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Button, Input, Popover, Row, Tile } from '@/ui'
import {
  boatMakers,
  boatsOnTheList,
  findBoats,
  type BoatFound,
  type BoatMaker,
  type BoatModel,
} from '@/domain/fitment/boat'
import type { EntityDef, RowData } from '@/domain/model'
import { markFor } from '@/screens/home/ledgers'

/* ============================================================
   WHICH BOAT — a field that finds one by its words or its code, and,
   before a word is typed, every boat on the price list by maker and
   then by model.

   Two shapes, one finder (`useFinder`): on a screen with no boat chosen
   the question stands ON THE PLATE (`ChooseABoat`), and on a boat it
   stands behind "Another boat" in the head, in the kit's popover. Every
   boat still sold is reachable; the list draws the first twelve a few
   words find and says how many more they found (`findBoats`), so nothing
   is hidden without a count.

   THE COLD PAGE KEEPS THE SCREEN'S IDEA (built-critique-m3.md, major 7).
   It was one field and seven makers with one generic glyph each, and a
   stakeholder pressing Fitment saw nothing of the plate. Now the plate
   itself stands with "Which boat?" where a boat's name goes: the field on
   it, every maker as its OWN MARK on the kit's card (the ledger's mark,
   through Home's and Data's reader, `markFor`), and the three lines a
   chosen boat answers, said in words
   and counting nothing, because nothing is counted until there is a boat.
   A maker opens its models under the plate; a model with one version is
   that boat, and one with several opens its versions — three presses at
   most, each step said, and one way back. The makers are the file's
   makers, A to Z, every one counted.

   ONE PRICE LIST, ONE SIZE (built-critique-m3-2.md, major 4, and
   built-critique-m3.md, major 7). A maker counts its MODELS as Home's
   door, Data and the picker count them — Highfield 67, every maker 289 —
   and the total says the same unit: "289 models", never "289 boats"
   beside "67 models".
   ============================================================ */

const AU = new Intl.NumberFormat('en-AU')
const plural = (n: number, one: string, many: string): string =>
  `${AU.format(n)} ${n === 1 ? one : many}`

export interface ChooserProps {
  world: { entities: Record<string, EntityDef>; rowsByEntity: Record<string, RowData[]> }
  onChoose: (rowId: string) => void
  /** boats already on quotes here, most recent first — offered before anything is typed */
  recent: BoatFound[]
}

const hrefOf = (b: BoatFound): string => `/fitment?boat=${encodeURIComponent(b.place.rowId)}`
const noteOf = (b: BoatFound): string =>
  [b.detail, b.code].filter((said) => said !== '').join(' · ')

/** A model as its line says it: the name, and what a one-line model adds ("GRT 455 · Side Console"). */
const modelSaid = (m: BoatModel): string => (m.trim === '' ? m.name : `${m.name} · ${m.trim}`)

/** One version under its model, said by what the model's name does not already say — "540 ST ·
 *  Hypalon" under Highfield Coaster, "Hypalon · Black / Grey" under Highfield Classic 340. */
function versionSaid(model: BoatModel, b: BoatFound): string {
  const extra = b.name.toLowerCase().startsWith(`${model.name.toLowerCase()} `)
    ? b.name.slice(model.name.length + 1)
    : b.name === model.name
      ? ''
      : b.name
  return [extra, b.detail].filter((said) => said !== '').join(' · ') || b.name
}

/* ---------------------------------------------------------- */
/* The finder: one state, drawn two ways                       */
/* ---------------------------------------------------------- */

interface Finder {
  field: ReactNode
  /** what stands under the field: the boats found, or the boats on quotes and a maker's models;
   *  on the cold page the makers themselves are the plate's marks, so they are not here again */
  below: ReactNode
  makers: BoatMaker[]
  maker: BoatMaker | null
  /** a maker pressed, or pressed again to close it */
  pick: (maker: string) => void
}

function useFinder(
  { world, onChoose, recent }: ChooserProps,
  { big, marks }: { big: boolean; marks: boolean },
): Finder {
  const [words, setWords] = useState('')
  const [makerName, setMaker] = useState('')
  const [modelKey, setModel] = useState('')
  const answer = useMemo(() => findBoats(world, words), [world, words])
  const makers = useMemo(() => boatMakers(world), [world])
  const typed = words.trim() !== ''
  const maker: BoatMaker | null = makers.find((m) => m.maker === makerName) ?? null
  const model = maker?.models.find((m) => m.key === modelKey) ?? null

  const shown = typed ? answer.found : recent
  const onKey = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key === 'Enter' && typed && shown[0]) {
      event.preventDefault()
      onChoose(shown[0].place.rowId)
    }
  }
  const list = big ? 'plate' : undefined
  const pick = (name: string): void => {
    setModel('')
    setMaker((was) => (was === name ? '' : name))
  }

  /* WHAT STANDS UNDER THE FIELD, untyped: a model's versions, a maker's models, or the makers */
  const browse = (() => {
    if (maker && model) {
      return (
        <>
          <div className="ft-choose__step">
            <p className="ft-choose__found">
              {modelSaid(model)} · {plural(model.versions.length, 'version', 'versions')}
            </p>
            <Button intent="quiet" size="sm" icon={ArrowLeftIcon} onClick={() => setModel('')}>
              {`Every ${maker.maker} model`}
            </Button>
          </div>
          <ul className="ft-choose__list" data-ground={list} data-many="">
            {model.versions.map((b) => (
              <li key={b.place.rowId}>
                <Row
                  kind="boat"
                  title={versionSaid(model, b)}
                  note={b.code}
                  href={hrefOf(b)}
                  onPress={() => onChoose(b.place.rowId)}
                />
              </li>
            ))}
          </ul>
        </>
      )
    }
    if (maker) {
      /* the maker is said once, above its models, not again on each of them */
      const bare = (name: string): string =>
        name.toLowerCase().startsWith(`${maker.maker.toLowerCase()} `)
          ? name.slice(maker.maker.length + 1)
          : name
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
          <ul className="ft-choose__list" data-ground={list} data-many="">
            {maker.models.map((m) => {
              const only = m.versions.length === 1 ? m.versions[0]! : null
              return (
                <li key={m.key}>
                  {only ? (
                    <Row
                      kind="boat"
                      title={bare(modelSaid(m))}
                      note={m.trim === '' ? noteOf(only) : only.code}
                      href={hrefOf(only)}
                      onPress={() => onChoose(only.place.rowId)}
                    />
                  ) : (
                    <Row
                      kind="boat"
                      title={bare(modelSaid(m))}
                      note={plural(m.versions.length, 'version', 'versions')}
                      onPress={() => setModel(m.key)}
                    />
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )
    }
    if (marks) return null
    return (
      <>
        <p className="ft-choose__found">
          {`Every boat on the price list, by maker · ${plural(boatsOnTheList(makers), 'model', 'models')}`}
        </p>
        <ul className="ft-choose__list" data-ground={list} data-many="">
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

  const below = typed ? (
    <>
      <output className="ft-choose__found">
        {answer.matched === 0
          ? 'No boat on the price list is called that.'
          : answer.matched > answer.found.length
            ? `${AU.format(answer.matched)} boats carry those words; the first ${AU.format(answer.found.length)} are here.`
            : `${AU.format(answer.matched)} ${answer.matched === 1 ? 'boat carries' : 'boats carry'} those words.`}
      </output>
      {shown.length > 0 ? (
        <ul className="ft-choose__list" data-ground={list}>
          {shown.map((b) => (
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

  return { field, below, makers, maker, pick }
}

/* ---------------------------------------------------------- */
/* The cold page: the plate, asking                            */
/* ---------------------------------------------------------- */

/** What each of the plate's lines answers once a boat is chosen — said, never counted. */
const LINES: ReadonlyArray<{ word: string; says: string }> = [
  { word: 'Motor', says: 'The horsepower it takes, and every motor made for it pinned on it.' },
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
        tick="foot"
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
  return (
    <>
      <section className="ft-plate" data-ground="night" data-cold="" aria-labelledby="ft-which">
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
        <dl className="ft-cold__lines" aria-label="What a boat’s plate answers">
          {LINES.map((l) => (
            <div key={l.word} className="ft-cold__line">
              <dt className="ft-cold__word">{l.word}</dt>
              <dd className="ft-cold__says">{l.says}</dd>
            </div>
          ))}
        </dl>
        <p className="ft-cold__foot">
          Choose a boat, and each line counts what is offered on it and says why every other one is
          not.
        </p>
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
