import { useMemo, useState, type KeyboardEvent } from 'react'
import { ArrowLeftIcon, BoatIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Button, Input, Popover, Row } from '@/ui'
import {
  boatMakers,
  boatsOnTheList,
  findBoats,
  type BoatFound,
  type BoatMaker,
  type BoatModel,
} from '@/domain/fitment/boat'
import type { EntityDef, RowData } from '@/domain/model'

/* ============================================================
   WHICH BOAT — a field that finds one by its words or its code, and,
   before a word is typed, every boat on the price list by maker and
   then by model.

   Two shapes, one list: on a screen with no boat chosen the field IS the
   screen (`inline`), and on a boat it stands behind "Another boat" in the
   head, in the kit's popover. Every boat still sold is reachable; the
   list draws the first twelve a few words find and says how many more
   they found (`findBoats`), so nothing is hidden without a count.

   THE COLD PAGE IS NOT ONE FIELD ON AN EMPTY PAGE (built-critique-m3.md).
   Untyped, it offers what is there: the boats already on quotes, then the
   makers, each with its models counted (`boatMakers`). A maker opens its
   models; a model with one version is that boat, and one with several
   opens its versions — three presses at most, each step said, and one way
   back. Nothing here is a suggestion the file does not make: the makers
   are the file's makers, A to Z, every one counted.

   ONE PRICE LIST, ONE SIZE (built-critique-m3-2.md, major 4). A maker
   counts its MODELS as Home's door, Data and the picker count them —
   Highfield 67, every maker 289 — and says nothing else beside it: no
   second unit ("69 models · 588 versions") on one maker and not the next.
   A model's versions are said where they are, once it is opened.
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

function Finder({ world, onChoose, recent, big }: ChooserProps & { big: boolean }) {
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
            <Button intent="quiet" size="sm" icon={ArrowLeftIcon} onClick={() => setMaker('')}>
              Every maker
            </Button>
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
    return (
      <>
        <p className="ft-choose__found">
          {`Every boat on the price list, by maker · ${plural(boatsOnTheList(makers), 'boat', 'boats')}`}
        </p>
        <ul className="ft-choose__list" data-ground={list} data-many="">
          {makers.map((m) => (
            <li key={m.maker}>
              <Row
                kind="boat"
                title={m.maker}
                note={plural(m.boats, 'model', 'models')}
                onPress={() => {
                  setModel('')
                  setMaker(m.maker)
                }}
              />
            </li>
          ))}
        </ul>
      </>
    )
  })()

  return (
    <div className="ft-choose" data-big={big ? '' : undefined}>
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
      {typed ? (
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
      )}
    </div>
  )
}

/** The field as the whole screen, for a visit with no boat chosen yet. */
export function ChooseABoat(props: ChooserProps) {
  return <Finder {...props} big />
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
      <Finder
        {...props}
        big={false}
        onChoose={(rowId) => {
          setOpen(false)
          props.onChoose(rowId)
        }}
      />
    </Popover>
  )
}
