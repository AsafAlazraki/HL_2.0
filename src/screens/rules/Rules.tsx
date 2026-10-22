import { Fragment, useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { motion } from 'motion/react'
import {
  ArrowCounterClockwiseIcon,
  CheckIcon,
  EyeIcon,
  FileTextIcon,
  NotePencilIcon,
  PlusIcon,
  ScalesIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import {
  Button,
  Figure,
  Icon,
  Input,
  Segmented,
  Select,
  Toggle,
  Row,
  move,
  say,
  undo,
  unsay,
  type SelectOption,
} from '@/ui'
import { useCatalogue } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { isDone, type CatalogueCommand } from '@/domain/catalogue/commands'
import {
  addRule,
  changeRule,
  deleteRule,
  doRule,
  ruleDoesNow,
  switchRule,
} from '@/domain/catalogue/ruleCommands'
import {
  CONDITION_WORD,
  KIND_NOUN,
  OBLIGATION_WORD,
  OPS_FOR,
  PARTNER_KINDS,
  pairReach,
  pairWords,
  type PairColumn,
  type PairOp,
  type PairWord,
  type PartnerKind,
} from '@/domain/rules/constraints/pairRules'
import type { WorkbookRuleRef } from '@/domain/rules/constraints/workbookRules'
import type { ConstraintDef } from '@/domain/model'
import {
  VERBS,
  alreadySaid,
  blankDraft,
  columnAt,
  costLine,
  costSaid,
  doesSaid,
  draftChanged,
  draftFromPriceList,
  draftMissing,
  draftOf,
  readColumns,
  ruleOfDraft,
  shapeOfDraft,
  sideMovedTo,
  statedRules,
  takenSaid,
  wordsKey,
  yourRules,
  type Columns,
  type Draft,
  type StatedRule,
  type Verb,
  type YourRule,
} from './read'
import './rules.css'

/* ============================================================
   RULES — direction A, "The sentence", with board B's three owners
   grafted under it (docs/directions/rules-boards/, judged
   2026-10-22). Where a dealer says what may be sold with what, in
   English, and sees what it would do before it is on.

   ONE PLATE, ONE SENTENCE. The rule is written in the very words the
   build will say: every underlined word is a choice that opens in
   place as a list with its counts (`Select look="word"`), and a figure
   is typed where the sentence says it (`Input look="figure"`). Each
   spec is the dealer's word — maker, steering, shaft, length,
   horsepower — never a column header (`pairSpecs.ts`). Under it,
   before anything is added, the census: the boats it is about, what
   the price list makes for them that it takes away, everything it
   refuses on them, and the sale it costs today, on a real model. Then
   the rules that exist, in three edges — Northside's solid, the price
   list's hairline with its own measure, the noticed ones dashed and
   warning only.

   ONE STATE, ONE BEHAVIOUR. What a written rule DOES — refuses, warns,
   off — acts at once from the plate exactly as its switch in the list
   does (`doRule`), and comes back from the toast's Undo. Only a change
   of WORDS waits for "Keep the change", and it is never thrown away:
   leave the screen and come back, and the unkept words are still on
   the plate (`UNKEPT`).

   NOTHING ON THE PLATE IS A RULE UNTIL THE ACT IS PRESSED. Every
   write is a command through the catalogue store (`ruleCommands.ts`),
   so every one comes back from the toast's Undo.
   ============================================================ */

export interface RulesProps {
  /** which sentence the plate holds: a rule's id, a price-list rule's ref, `new`, or '' for the
   *  plate's own choice */
  open: string
  onOpen: (open: string) => void
  /** where a browser with no copy of the price list goes to load one */
  openTheFile: () => void
}

const STEP_TOAST = 'rules-step'

/** A press that found nothing to do still says so — a silent press reads as a broken one. */
const NOTHING_TO_DO = 'Nothing to change: it is already so.'

/**
 * WORDS WRITTEN AND NOT YET KEPT, by the plate they were written on. Held for this visit to the
 * app, not saved: a sentence half-written is the person's, and leaving for the build and coming
 * back must not throw it away (built-critique-m3.md, blocker 3). Kept or put back, it goes.
 */
const UNKEPT = new Map<string, Draft>()

const DATE = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long' })
const dayOf = (iso: string): string => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : DATE.format(d)
}

/** Which sentence the plate opens on, and the key that resets it when that changes. A written
 *  rule's key is its WORDS, never what it does, so a switch never resets what is being typed. */
function resolve(
  open: string,
  yours: readonly YourRule[],
  cols: Columns,
  world: Parameters<typeof draftOf>[1],
): { key: string; draft: Draft; rule: ConstraintDef | null } {
  if (open === 'new') return { key: 'new', draft: blankDraft(), rule: null }
  const mine = yours.find((y) => y.rule.id === open)
  if (mine) {
    const draft = draftOf(mine.rule, world)
    if (draft) return { key: `${mine.rule.id}@${wordsKey(mine.rule)}`, draft, rule: mine.rule }
  }
  const fromList = draftFromPriceList(open as WorkbookRuleRef, cols)
  if (fromList) return { key: `list:${open}`, draft: fromList, rule: null }
  /* THE PLATE'S OWN CHOICE: the rule last changed, or, before Northside has written one, the
     one rule its price list keeps that a sentence here can say */
  const latest = yours.toSorted((a, b) => b.rule.updatedAt.localeCompare(a.rule.updatedAt))[0]
  if (latest) {
    const draft = draftOf(latest.rule, world)
    if (draft)
      return { key: `${latest.rule.id}@${wordsKey(latest.rule)}`, draft, rule: latest.rule }
  }
  const first = draftFromPriceList('F7', cols)
  if (first) return { key: 'list:F7', draft: first, rule: null }
  return { key: 'new', draft: blankDraft(), rule: null }
}

export function Rules({ open, onOpen, openTheFile }: RulesProps) {
  const status = useCatalogue((s) => s.status)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const rules = useCatalogue((s) => s.constraintDefs)
  const orgId = useCatalogue((s) => s.orgId)

  const world = useMemo(() => ({ entities: tables, rowsByEntity: rows }), [tables, rows])
  const ready = status === 'ready' && Object.keys(tables).length > 0
  const cols = useMemo(() => readColumns(world), [world])
  const yours = useMemo(() => yourRules(rules, world), [rules, world])
  const stated = useMemo(() => statedRules(cols), [cols])

  /* AN UNDO BELONGS TO THIS SCREEN: leaving it takes the rule's toast with it, so an Undo for a
     rule never stands over the quotes (built-m3.md, "a toast follows you between screens") */
  useEffect(() => () => unsay(STEP_TOAST), [])

  if (!ready) {
    return (
      <main className="rl" data-testid="rules">
        <header className="rl-head">
          <h1 className="rl-title">Say what may be sold with what.</h1>
        </header>
        <div className="rl-plate rl-plate--empty">
          {status === 'loading' || status === 'empty' ? (
            <p className="rl-from">Reading the price list…</p>
          ) : (
            <>
              <p className="rl-from">
                The price list is not on this computer yet, and every rule is written on its own
                words.
              </p>
              <div className="rl-act">
                <Button intent="act" icon={FileTextIcon} onClick={openTheFile}>
                  Load the Master Price File
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    )
  }

  return (
    <Writing
      key="writing"
      open={open}
      onOpen={onOpen}
      world={world}
      cols={cols}
      yours={yours}
      stated={stated}
      orgId={orgId ?? ''}
    />
  )
}

function Writing({
  open,
  onOpen,
  world,
  cols,
  yours,
  stated,
  orgId,
}: {
  open: string
  onOpen: (open: string) => void
  world: Parameters<typeof draftOf>[1]
  cols: Columns
  yours: YourRule[]
  stated: StatedRule[]
  orgId: string
}) {
  const at = useMemo(() => resolve(open, yours, cols, world), [open, yours, cols, world])

  /* THE PLATE FOLLOWS THE ADDRESS: a new `?open=`, or the words of the rule it is on changed,
     starts the sentence again from what is filed — or from the words written here and not yet
     kept. React's own pattern for state that follows a prop, adjusted during the render */
  const [draft, setDraft] = useState<Draft>(() => UNKEPT.get(at.key) ?? at.draft)
  const [seen, setSeen] = useState(at.key)
  if (seen !== at.key) {
    setSeen(at.key)
    setDraft(UNKEPT.get(at.key) ?? at.draft)
  }

  /* WHAT IT DOES is the filed rule's own on a written rule — the switch and the plate are one */
  const verb: Verb = at.rule ? ruleDoesNow(at.rule) : draft.verb
  const shape = useMemo(() => shapeOfDraft(draft, cols), [draft, cols])
  /* THE CENSUS IS COUNTED ON THE SENTENCE, NOT ON ITS BECAUSE: typing a reason never recounts
     the boats */
  const shapeKey = `${shape.boat.key}|${shape.boat.op}|${shape.boat.value}|${shape.partnerKind}|${shape.partner.key}|${shape.partner.op}|${shape.partner.value}`
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- counted on the sentence, by its key
  const reach = useMemo(() => pairReach(shape, world), [shapeKey, world])
  const missing = draftMissing(draft, cols)
  const changed = at.rule ? draftChanged(draft, at.rule, world) : true

  /* ---- the writes, and the way back ---------------------------- */

  const apply = useCallback((command: CatalogueCommand, after?: (said: string) => void) => {
    const outcome = catalogue.getState().apply(command)
    if (!isDone(outcome)) {
      say(outcome.refused === '' ? NOTHING_TO_DO : outcome.refused, { id: STEP_TOAST })
      return
    }
    const eventId = outcome.event.id
    undo(
      outcome.said,
      () => {
        const back = catalogue.getState().undo(eventId)
        if (isDone(back)) say(back.said, { id: STEP_TOAST })
        else say(back.refused === '' ? NOTHING_TO_DO : back.refused, { id: STEP_TOAST })
      },
      { id: STEP_TOAST },
    )
    after?.(outcome.said)
  }, [])

  const forget = useCallback(() => {
    UNKEPT.delete(at.key)
  }, [at.key])

  const add = useCallback(() => {
    if (missing) return
    const now = new Date().toISOString()
    if (at.rule) {
      forget()
      apply(changeRule(ruleOfDraft({ ...draft, verb }, cols, orgId, now, at.rule)))
      return
    }
    const rule = ruleOfDraft(draft, cols, orgId, now)
    forget()
    apply(addRule(rule), () => onOpen(rule.id))
  }, [missing, at.rule, draft, verb, cols, orgId, apply, onOpen, forget])

  const remove = useCallback(() => {
    if (!at.rule) return
    forget()
    apply(deleteRule(at.rule.id), () => onOpen(''))
  }, [at.rule, apply, onOpen, forget])

  const flip = useCallback(
    (rule: ConstraintDef, on: boolean) => apply(switchRule(rule.id, on)),
    [apply],
  )

  /* ---- the sentence's choices ---------------------------------- */

  const plateKey = at.key
  const set = (next: Partial<Draft>): void =>
    setDraft((d) => {
      const n = { ...d, ...next }
      UNKEPT.set(plateKey, n)
      return n
    })
  const setVerb = (next: Verb): void => {
    if (at.rule) apply(doRule(at.rule.id, next))
    else set({ verb: next })
  }
  const putBack = (): void => {
    forget()
    setDraft(at.draft)
  }
  const partnerCols = cols[draft.partnerKind]
  const boatCol = columnAt(cols.boat, draft.boatKey)
  const partnerCol = columnAt(partnerCols, draft.partnerKey)
  const noun = KIND_NOUN[draft.partnerKind]

  const valueControl = (
    i: number,
    col: PairColumn,
    whose: string,
    value: string,
    onValue: (v: string) => void,
  ) =>
    col.measure === 'figure' ? (
      <Fragment key={i}>
        <Input
          look="figure"
          aria-label={`The ${whose}’s ${col.name}, ${col.unitAsked}`}
          placeholder="…"
          value={value}
          onValueChange={onValue}
        />
        {col.unit === '' ? null : ` ${col.unit}`}
      </Fragment>
    ) : (
      <Select
        key={i}
        look="word"
        aria-label={`The ${whose}’s ${col.name}`}
        placeholder="…"
        value={value === '' ? null : value}
        options={valueOptions(col)}
        onValueChange={(v) => onValue(v ?? '')}
      />
    )

  const controlFor = (word: PairWord, i: number) => {
    switch (word.role) {
      case 'boat-column':
        return (
          <Select
            key={i}
            look="word"
            aria-label="Which of the boat’s specs"
            placeholder="spec"
            value={draft.boatKey === '' ? null : draft.boatKey}
            options={columnOptions(cols.boat)}
            onValueChange={(key) => {
              const next = columnAt(cols.boat, key ?? '')
              const moved = sideMovedTo(next, 'boat', draft.boatOp, draft.boatValue)
              set({ boatKey: key ?? '', boatOp: moved.op, boatValue: moved.value })
            }}
          />
        )
      case 'boat-op':
        return (
          <Select
            key={i}
            look="word"
            aria-label={boatCol?.measure === 'figure' ? 'Over or under' : 'Is, or is not'}
            value={draft.boatOp}
            options={opOptions(CONDITION_WORD, boatCol)}
            onValueChange={(op) => op && set({ boatOp: op })}
          />
        )
      case 'boat-value':
        return boatCol ? (
          valueControl(i, boatCol, 'boat', draft.boatValue, (v) => set({ boatValue: v }))
        ) : (
          <span key={i} className="rl-gap">
            …
          </span>
        )
      case 'partner-kind':
        return (
          <Select
            key={i}
            look="word"
            aria-label="A motor or a trailer"
            value={draft.partnerKind}
            options={PARTNER_KINDS.map((k) => ({ value: k, label: `${KIND_NOUN[k].one}’s` }))}
            onValueChange={(k) =>
              k &&
              k !== draft.partnerKind &&
              set({ partnerKind: k, partnerKey: '', partnerOp: 'eq', partnerValue: '' })
            }
          />
        )
      case 'partner-column':
        return (
          <Select
            key={i}
            look="word"
            aria-label={`Which of the ${noun.one}’s specs`}
            placeholder="spec"
            value={draft.partnerKey === '' ? null : draft.partnerKey}
            options={columnOptions(partnerCols)}
            onValueChange={(key) => {
              const next = columnAt(partnerCols, key ?? '')
              const moved = sideMovedTo(next, 'partner', draft.partnerOp, draft.partnerValue)
              set({ partnerKey: key ?? '', partnerOp: moved.op, partnerValue: moved.value })
            }}
          />
        )
      case 'partner-op':
        return (
          <Select
            key={i}
            look="word"
            aria-label={
              partnerCol?.measure === 'figure' ? 'Must be over or under' : 'Must be, or must not be'
            }
            value={draft.partnerOp}
            options={opOptions(OBLIGATION_WORD, partnerCol)}
            onValueChange={(op) => op && set({ partnerOp: op })}
          />
        )
      case 'partner-value':
        return partnerCol ? (
          valueControl(i, partnerCol, noun.one, draft.partnerValue, (v) => set({ partnerValue: v }))
        ) : (
          <span key={i} className="rl-gap">
            …
          </span>
        )
      default:
        return null
    }
  }

  const words = pairWords(shape)
  const fromRef = draft.from
  const fromSaid = fromRef ? stated.find((s) => s.ref === fromRef)?.said : undefined

  const actLabel = at.rule
    ? 'Keep the change'
    : verb === 'off'
      ? 'Add it switched off'
      : verb === 'warns'
        ? 'Add it, warning'
        : 'Add it, refusing'

  return (
    <main className="rl" data-testid="rules" data-read="">
      <header className="rl-head">
        <h1 className="rl-title">Say what may be sold with what.</h1>
      </header>

      <section className="rl-plate" aria-label="The rule" data-ground="plate">
        <div className="rl-plate__top">
          <p className="rl-from" data-testid="rule-from">
            {at.rule ? (
              <>
                <span className="rl-from__glyph">
                  <Icon glyph={NotePencilIcon} />
                </span>
                <span>
                  {`Your rule, written ${dayOf(at.rule.createdAt)}${
                    at.rule.edited ? `, changed ${dayOf(at.rule.updatedAt)}` : ''
                  }.`}
                </span>
              </>
            ) : fromSaid ? (
              <>
                <span className="rl-from__glyph">
                  <Icon glyph={FileTextIcon} />
                </span>
                <span>
                  {`From your price list: “${fromSaid}” It becomes yours only when you add it.`}
                </span>
              </>
            ) : (
              <>
                <span className="rl-from__glyph">
                  <Icon glyph={PlusIcon} />
                </span>
                <span>A new rule. Choose each underlined word.</span>
              </>
            )}
          </p>
          {at.key === 'new' ? null : (
            <Button intent="quiet" size="sm" icon={PlusIcon} onClick={() => onOpen('new')}>
              Write a new rule
            </Button>
          )}
        </div>

        <p className="rl-sentence" data-testid="rule-sentence">
          {words.map((word, i) => (
            <Fragment key={word.key}>
              {i > 0 && !word.tight ? ' ' : null}
              {word.role === 'word' ? (
                <span className={word.unchosen ? 'rl-gap' : undefined}>{word.text}</span>
              ) : (
                controlFor(word, i)
              )}
            </Fragment>
          ))}
        </p>

        <div className="rl-because">
          <span className="rl-because__lead">
            {`Otherwise the build ${
              verb === 'warns' ? 'warns about' : verb === 'off' ? 'would refuse' : 'refuses'
            } the ${noun.one}, because`}
          </span>
          <span className="rl-because__words">
            <Input
              look="word"
              aria-label="Because"
              placeholder="say why, in the words the build will say it"
              value={draft.because}
              onValueChange={(because) => set({ because })}
            />
          </span>
        </div>

        <div className="rl-verb">
          <Segmented<Verb>
            label="What the build does"
            value={verb}
            options={VERBS.map((v) => ({ value: v, label: v }))}
            onValueChange={setVerb}
          />
          <p className="rl-verb__say">{VERB_SAY[verb]}</p>
        </div>

        <div className="rl-act">
          {at.rule && !changed ? null : (
            <Button
              intent="act"
              icon={at.rule ? CheckIcon : PlusIcon}
              onClick={add}
              {...(missing ? { refusedBecause: missing } : {})}
            >
              {actLabel}
            </Button>
          )}
          {at.rule && changed ? (
            <Button intent="quiet" size="sm" icon={ArrowCounterClockwiseIcon} onClick={putBack}>
              Put it back as it was
            </Button>
          ) : null}
          {at.rule ? (
            <Button intent="quiet" size="sm" icon={TrashIcon} onClick={remove}>
              Delete it
            </Button>
          ) : null}
        </div>
      </section>

      <Census reach={reach} verb={verb} />

      <Owned
        yours={yours}
        stated={stated}
        cols={cols}
        openId={at.rule?.id ?? ''}
        onOpen={onOpen}
        onFlip={flip}
      />
    </main>
  )
}

/** What each verb means, said once, under the control. */
const VERB_SAY: Record<Verb, string> = {
  refuses: 'Refuses: it leaves the list in the build, and this because is said where it was.',
  warns: 'Warns: it stays on the list, with this because beside it.',
  off: 'Off: it refuses nothing. The sentence and its because are kept for when it is on.',
}

const columnOptions = (cols: readonly PairColumn[]): SelectOption<string>[] =>
  cols.map((c) => ({ value: c.key, label: c.name }))

const opOptions = (words: Record<PairOp, string>, col: PairColumn | null): SelectOption<PairOp>[] =>
  OPS_FOR[col?.measure ?? 'word'].map((op) => ({ value: op, label: words[op] }))

const valueOptions = (col: PairColumn): SelectOption<string>[] =>
  col.values.map((v) => ({
    value: v.value,
    label: v.said,
    trail: v.count.toLocaleString('en-AU'),
  }))

/* ---------------------------------------------------------- */
/* The census                                                  */
/* ---------------------------------------------------------- */

function Census({ reach, verb }: { reach: ReturnType<typeof pairReach>; verb: Verb }) {
  const noun = KIND_NOUN[reach.kind]
  const cost = costSaid(reach, verb)
  return (
    <section className="rl-census" aria-label="What it would do" data-testid="census">
      <dl className="rl-figures">
        <Count
          known={reach.conditionReady}
          value={reach.about}
          label={`of ${reach.boats.toLocaleString('en-AU')} boats it is about`}
        />
        {/* THE SALE LEADS: what the price list makes for these boats that it takes, before the
            count of everything a search could reach */}
        <Count
          known={reach.ready}
          value={reach.taken}
          label={`${reach.ready ? `of ${reach.made.toLocaleString('en-AU')} ` : ''}${noun.many} the price list makes for them, ${takenSaid(verb)}`}
          strong
        />
        <Count
          known={reach.ready}
          value={reach.refused}
          label={`of ${reach.partners.toLocaleString('en-AU')} ${noun.many} ${doesSaid(verb)}`}
        />
      </dl>
      <div className="rl-cost" data-testid="rule-cost">
        <h2 className="rl-cost__title">What it costs a sale today</h2>
        <p className="rl-cost__say">{cost === '' ? 'Known once every word is chosen.' : cost}</p>
      </div>
    </section>
  )
}

function Count({
  known,
  value,
  label,
  strong,
}: {
  known: boolean
  value: number
  label: string
  strong?: boolean
}) {
  return (
    <div className="rl-count" data-strong={strong && known && value > 0 ? '' : undefined}>
      <dt className="rl-count__label">{label}</dt>
      <dd className="rl-count__value">
        {known ? <Figure value={value} /> : <span aria-label="not known yet">—</span>}
      </dd>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* The rules that exist, by whose they are                     */
/* ---------------------------------------------------------- */

function Owned({
  yours,
  stated,
  cols,
  openId,
  onOpen,
  onFlip,
}: {
  yours: YourRule[]
  stated: StatedRule[]
  cols: Columns
  openId: string
  onOpen: (open: string) => void
  onFlip: (rule: ConstraintDef, on: boolean) => void
}) {
  const written = stated.filter((s) => !s.noticed)
  const noticed = stated.filter((s) => s.noticed)
  return (
    <section className="rl-owned" aria-label="The rules">
      <div className="rl-group" data-owner="yours">
        <h2 className="rl-group__head">
          <span className="rl-group__glyph">
            <Icon glyph={NotePencilIcon} />
          </span>
          <span>Yours</span>
          <span className="rl-group__count">{yours.length}</span>
        </h2>
        {yours.length === 0 ? (
          <p className="rl-group__empty" data-ground="plate">
            None yet. The sentence above becomes the first: from the next pick, the build refuses
            what it refuses on the boat it is about, and says your because where it does.
          </p>
        ) : (
          <ul className="rl-list" data-testid="your-rules">
            {yours.map((y) => (
              <motion.li
                key={y.rule.id}
                className="rl-item"
                data-owner="yours"
                data-ground="plate"
                data-off={y.verb === 'off' ? '' : undefined}
                data-open={y.rule.id === openId ? '' : undefined}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={move.settle}
              >
                {/* THE KIT'S ROW opens the rule on the plate: its kind's glyph, the sentence, the
                    sale it costs, and what it does while it is on — the switch says on or off,
                    so off is said once, by the switch */}
                <Row
                  title={y.said}
                  note={costLine(y)}
                  kind={y.reach.kind}
                  current={y.rule.id === openId}
                  onPress={() => onOpen(y.rule.id)}
                  trail={
                    y.verb === 'off' ? undefined : <span className="rl-item__verb">{y.verb}</span>
                  }
                />
                <Toggle
                  label={y.verb === 'off' ? 'Off' : 'On'}
                  checked={y.verb !== 'off'}
                  onCheckedChange={(on) => onFlip(y.rule, on)}
                />
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <div className="rl-group" data-owner="stated">
        <h2 className="rl-group__head">
          <span className="rl-group__glyph">
            <Icon glyph={ScalesIcon} />
          </span>
          <span>Stated in your price list</span>
          <span className="rl-group__count">{written.length}</span>
        </h2>
        <ul className="rl-list">
          {written.map((s) => (
            <li key={s.ref} className="rl-item" data-owner="stated" data-ground="plate">
              <span className="rl-item__body">
                <span className="rl-item__said">{s.said}</span>
                {s.measure ? (
                  <span className="rl-item__note">{`Measured on the workbook, across ${s.measure.tested.toLocaleString('en-AU')} ${s.counted}.`}</span>
                ) : null}
              </span>
              <Measure s={s} />
            </li>
          ))}
        </ul>
      </div>

      <div className="rl-group" data-owner="noticed">
        <h2 className="rl-group__head">
          <span className="rl-group__glyph">
            <Icon glyph={EyeIcon} />
          </span>
          <span>Noticed in your price list</span>
          <span className="rl-group__count">{noticed.length}</span>
        </h2>
        <p className="rl-group__say">
          Nobody wrote these down. As they stand, each would only ever warn.
        </p>
        <ul className="rl-list">
          {noticed.map((s) => (
            <li key={s.ref} className="rl-item" data-owner="noticed">
              <span className="rl-item__body">
                <span className="rl-item__said">{s.said}</span>
                {s.measure ? (
                  <span className="rl-item__note">{`Measured on the workbook, across ${s.measure.tested.toLocaleString('en-AU')} ${s.counted}.`}</span>
                ) : null}
              </span>
              <Measure s={s} />
              {s.sayable ? (
                alreadySaid(s.ref, yours, cols) ? (
                  <span className="rl-item__yours">
                    <Icon glyph={CheckIcon} />
                    Yours now
                  </span>
                ) : (
                  <Button
                    intent="secondary"
                    size="sm"
                    icon={NotePencilIcon}
                    onClick={() => onOpen(s.ref)}
                  >
                    Say it as yours
                  </Button>
                )
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Measure({ s }: { s: StatedRule }) {
  if (!s.measure) return <span className="rl-item__measure" />
  return (
    <span
      className="rl-item__measure"
      aria-label={`Holds on ${s.measure.held} of ${s.measure.tested}`}
    >
      <span className="rl-item__held">{s.measure.held.toLocaleString('en-AU')}</span>
      <span className="rl-item__of">{`of ${s.measure.tested.toLocaleString('en-AU')}`}</span>
      <span className="rl-item__bar" aria-hidden="true">
        <span
          className="rl-item__fill"
          style={{ '--held': s.measure.held / Math.max(1, s.measure.tested) } as CSSProperties}
        />
      </span>
    </span>
  )
}

export type { PartnerKind }
