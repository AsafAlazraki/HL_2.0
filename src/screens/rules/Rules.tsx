import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import {
  ArrowCounterClockwiseIcon,
  ArrowSquareOutIcon,
  CheckIcon,
  EyeIcon,
  FileTextIcon,
  ListChecksIcon,
  NotePencilIcon,
  PauseCircleIcon,
  PlusIcon,
  PrinterIcon,
  ProhibitIcon,
  TrashIcon,
  WarningCircleIcon,
  XIcon,
  type Icon as PhosphorIcon,
} from '@phosphor-icons/react'
import {
  Button,
  Figure,
  Icon,
  Input,
  KindMark,
  Select,
  move,
  reducedMotion,
  say,
  undo,
  unsay,
  type SelectOption,
} from '@/ui'
import { useCatalogue, useQuotes } from '@/app/useStores'
import { catalogue } from '@/state/catalogue'
import { isDone, type CatalogueCommand } from '@/domain/catalogue/commands'
import {
  addRule,
  changeRule,
  deleteRule,
  doRule,
  ruleDoesNow,
} from '@/domain/catalogue/ruleCommands'
import {
  CONDITION_WORD,
  KIND_NOUN,
  LONG_LIST,
  MAX_ALSO,
  OBLIGATION_WORD,
  OPS_FOR,
  pairField,
  pairReach,
  pairSaid,
  pairWords,
  type PairColumn,
  type PairField,
  type PairOp,
  type PairReach,
  type PairShape,
  type PairWord,
  type PairWorld,
  type PartnerKind,
} from '@/domain/rules/constraints/pairRules'
import {
  pairBoats,
  pairClashes,
  pairEmpties,
  pairOnBoat,
  pairOnQuotes,
  pairTaken,
} from '@/domain/rules/constraints/pairTaken'
import { groupExceptions, type BuildDoes } from '@/domain/rules/constraints/houseMeasures'
import {
  WORKBOOK_RULES_REFUTED,
  type WorkbookRuleRef,
} from '@/domain/rules/constraints/workbookRules'
import { draftsARuleWouldHold } from '@/domain/quote/ruled'
import { PAIRING_RULES } from '@/domain/rules/constraints/ruleLedger'
import type { ConstraintDef, QuoteDef } from '@/domain/model'
import {
  VERBS,
  VERB_DOES,
  VERB_WORD,
  alreadySaid,
  blankAnd,
  blankDraft,
  blankExcept,
  columnAt,
  costSaid,
  doesSaid,
  draftChanged,
  draftFromPriceList,
  draftMissing,
  draftOf,
  exceptionsSaid,
  figureOf,
  houseOf,
  houseSaid,
  modelsSaid,
  namesSaid,
  newKindOf,
  onSale,
  partsOf,
  readColumns,
  ruleOfDraft,
  shapeOfDraft,
  sideMovedTo,
  standingSaid,
  statedRules,
  takenSaid,
  verbLine,
  wordsKey,
  yourRules,
  type AlsoDraft,
  type Columns,
  type Draft,
  type Part,
  type StatedRule,
  type Verb,
  type YourRule,
} from './read'
import { WordFinder } from './WordFinder'
import './rules.css'

/* ============================================================
   RULES — direction A, "The house rules", with board B's reach
   grafted into its margin (docs/directions/rules-boards/, judged
   2026-10-28), deepened in the data round (2026-11-03,
   docs/directions/data-round/rules/judge.md: "keep the composition;
   what it lacks is function and finish").

   ONE PAGE NORTHSIDE COULD SIGN — and since the data round, print.
   The rules are grouped by what the customer is buying — Trailers,
   Motors, Rigging and pre-delivery — so a dealer knows where a new
   rule goes before writing it. Each part's clauses are numbered: the
   price list's own first, each MEASURED ON THE SHEET LOADED HERE and
   opening on the offers that break it, each saying what the build
   does with it; then Northside's. Who said a clause is its EDGE: the
   price list's a blue hairline, Northside's solid ink, a pattern being
   said as Northside's ochre until it is added. What a Northside clause
   does is its VERB, set in the ink of its state and pressed open in
   place — refuses, warns about, is off — each with its consequence.

   THE SENTENCE says one thing about a boat and one about its motor or
   trailer, and since the data round "and its …" and "except the …" on
   the boat, and a motor's or trailer's own model. Long lists of models
   are found by typing, maker by maker (`WordFinder`).

   THE MARGIN holds what the price list was noticed doing, beside its
   part; and beside the clause being written, what it would do, counted
   before it is added: the figures, the boats as marks, the offers it
   takes by name, one boat tried with it on, the boats it would leave
   with nothing and the rules it fights, and the quotes it speaks of.

   ONE ACT: "Add it as 2.4". Every write is a command through the
   catalogue store (`ruleCommands.ts`), so every one comes back from
   the toast's Undo.
   ============================================================ */

/** The page's three positions, each a search param (src/routes/rules.tsx). */
export interface RulesAt {
  /** which clause is open: a rule's id, a price-list rule's ref (`F7`), `new:motor`,
   *  `new:trailer`, or '' for none */
  open: string
  /** which of the price list's clauses is opened on its exceptions (`F6`), or '' */
  look: string
  /** the boat model the clause being written is tried on, or '' */
  on: string
}

export interface RulesProps {
  at: RulesAt
  go: (next: Partial<RulesAt>) => void
  /** the sheet at one line: `/data/$table?at=` */
  listHref: (table: string, line: string) => string
  /** go to an address inside the app */
  follow: (href: string) => void
  /** where a browser with no copy of the price list goes to load one */
  openTheFile: () => void
}

const STEP_TOAST = 'rules-step'

/** A press that found nothing to do still says so — a silent press reads as a broken one. */
const NOTHING_TO_DO = 'Nothing to change: it is already so.'

/**
 * WORDS WRITTEN AND NOT YET KEPT, by the clause they were written in. Held for this visit to the
 * app, not saved: a sentence half-written is the person's, and leaving for the build and coming
 * back must not throw it away (built-critique-m3.md, blocker 3). Kept, added or put back, it goes.
 */
const UNKEPT = new Map<string, Draft>()

const DATE = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long' })
const dayOf = (iso: string): string => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : DATE.format(d)
}

const count = (n: number): string => n.toLocaleString('en-AU')

/**
 * A CLAUSE BRINGS ITSELF INTO SIGHT, and only when it is not already there (built-critique-m3.md,
 * majors 8 and 9). `?open=` from the build lands on the clause it names, not at the page's top;
 * the rule just added is where the reader's eye is after the press. AFTER THE ADDRESS HAS
 * SETTLED, two frames on, because the router commits `?open=` after the render and a scroll made
 * before that commit is undone (the reason `src/screens/data/Data.tsx` measured). The pill's
 * clearance is the clause's own `scroll-margin`, a token, so nothing here knows the shell's size.
 */
function intoSight(
  el: HTMLElement | null,
  block: 'start' | 'nearest',
  instant: boolean,
): () => void {
  let dropped = false
  const bring = (): void => {
    if (dropped || !el?.isConnected || typeof el.scrollIntoView !== 'function') return
    const r = el.getBoundingClientRect()
    const seen =
      block === 'start'
        ? r.top >= 0 && r.top < window.innerHeight * 0.5
        : r.top >= 0 && r.bottom <= window.innerHeight
    if (seen) return
    el.scrollIntoView({ block, behavior: instant || reducedMotion() ? 'instant' : 'smooth' })
  }
  const frame = requestAnimationFrame(() => requestAnimationFrame(bring))
  return () => {
    dropped = true
    cancelAnimationFrame(frame)
  }
}

/** The glyph beside a verb, because an ink is never a colour alone. */
const VERB_GLYPH: Record<Verb, PhosphorIcon> = {
  refuses: ProhibitIcon,
  warns: WarningCircleIcon,
  off: PauseCircleIcon,
}

/** What the build does with one of the price list's clauses, as a glyph and its first words. */
const BUILD_GLYPH: Record<BuildDoes, PhosphorIcon> = {
  lists: ListChecksIcon,
  says: WarningCircleIcon,
  nothing: PauseCircleIcon,
}
const BUILD_WORD: Record<BuildDoes, string> = {
  lists: 'kept by the lists.',
  says: 'said where it is broken, never refused.',
  nothing: 'not enforced.',
}

/** The verb's word ink in the kit's `Select`: refuses is the file's blue, the build's own
 *  refusal ink; warns the build's "worth knowing"; off full ink, kept and never greyed. */
const VERB_INK = { refuses: 'file', warns: 'warn', off: 'full' } as const

const VERB_OPTIONS: SelectOption<Verb>[] = VERBS.map((v) => ({
  value: v,
  label: VERB_WORD[v],
  say: VERB_DOES[v],
}))

/** What the toast says when a step is taken back — the screen's own words, never the engine's
 *  ("Undone. No longer so: Your rule is deleted.", judge.md, data round, J6). */
const BACK: Record<'add' | 'change' | 'delete' | 'do', string> = {
  add: 'Taken back: the rule is not added.',
  change: 'Taken back: the rule reads as it did.',
  delete: 'Your rule is back where it stood.',
  do: 'Taken back: the rule does what it did.',
}

/** What is open, and the key that starts the clause again when that changes. A written rule's
 *  key is its WORDS, never what it does, so a switch never resets what is being typed. */
interface Opened {
  key: string
  draft: Draft
  rule: ConstraintDef | null
}

function resolve(
  open: string,
  yours: readonly YourRule[],
  cols: Columns,
  world: PairWorld,
): Opened | null {
  if (open === '') return null
  const kind = newKindOf(open)
  if (kind) return { key: `new:${kind}`, draft: { ...blankDraft(), partnerKind: kind }, rule: null }
  const mine = yours.find((y) => y.rule.id === open)
  if (mine) {
    const draft = draftOf(mine.rule, world)
    if (draft) return { key: `${mine.rule.id}@${wordsKey(mine.rule)}`, draft, rule: mine.rule }
  }
  const fromList = draftFromPriceList(open as WorkbookRuleRef, cols)
  if (fromList) return { key: `list:${open}`, draft: fromList, rule: null }
  return null
}

export function Rules({ at, go, listHref, follow, openTheFile }: RulesProps) {
  const status = useCatalogue((s) => s.status)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const rules = useCatalogue((s) => s.constraintDefs)
  const orgId = useCatalogue((s) => s.orgId)
  const quotes = useQuotes((s) => s.quotes)

  const world = useMemo(() => ({ entities: tables, rowsByEntity: rows }), [tables, rows])
  const ready = status === 'ready' && Object.keys(tables).length > 0

  /* AN UNDO BELONGS TO THIS SCREEN: leaving it takes the rule's toast with it, so an Undo for a
     rule never stands over the quotes (built-m3.md, "a toast follows you between screens") */
  useEffect(() => () => unsay(STEP_TOAST), [])

  if (!ready) {
    return (
      <main className="hr" data-testid="rules">
        <header className="hr-head">
          <p className="hr-eyebrow">The house rules</p>
          <h1 className="hr-title">What may be sold with what</h1>
        </header>
        <div className="hr-sheet hr-sheet--empty" data-ground="plate">
          {status === 'loading' || status === 'empty' ? (
            <p className="hr-lede">Reading the price list…</p>
          ) : (
            <>
              <p className="hr-lede">
                The price list is not on this computer yet. Every rule here is about what it sells,
                so it is read first.
              </p>
              <div>
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
    <House
      at={at}
      go={go}
      listHref={listHref}
      follow={follow}
      world={world}
      rules={rules}
      quotes={quotes}
      orgId={orgId ?? ''}
    />
  )
}

/* ---------------------------------------------------------- */
/* The page                                                    */
/* ---------------------------------------------------------- */

interface Shared {
  at: RulesAt
  go: (next: Partial<RulesAt>) => void
  listHref: (table: string, line: string) => string
  follow: (href: string) => void
  world: PairWorld
  rules: readonly ConstraintDef[]
  quotes: readonly QuoteDef[]
  orgId: string
}

function House({ at, go, listHref, follow, world, rules, quotes, orgId }: Shared) {
  const cols = useMemo(() => readColumns(world), [world])
  const yours = useMemo(() => yourRules(rules, world), [rules, world])
  /* MEASURED HERE, once per sheet (`houseMeasures.ts` keeps the count by the sheet's rows) */
  const stated = useMemo(() => statedRules(cols, world), [cols, world])
  const book = useMemo(() => partsOf(stated, yours), [stated, yours])
  const sale = useMemo(
    () => ({ motor: onSale(world, 'motor'), trailer: onSale(world, 'trailer') }),
    [world],
  )
  const opened = useMemo(() => resolve(at.open, yours, cols, world), [at.open, yours, cols, world])

  /* A STALE ADDRESS SAYS SO, where the clause would have opened, and the address lets it go
     (judge.md, data round, J17: "?open=zzz-not-a-rule" drew the page at rest and said nothing) */
  const [stale, setStale] = useState('')
  const staleNow = at.open !== '' && opened === null
  if (staleNow && stale !== at.open) setStale(at.open)
  useEffect(() => {
    if (staleNow) go({ open: '' })
  }, [staleNow, go])
  useEffect(() => {
    if (at.look !== '' && !stated.some((s) => s.ref === at.look && s.live)) go({ look: '' })
  }, [at.look, stated, go])

  /* THE RULE JUST ADDED takes the focus where it now stands, so a keyboard is never dropped on
     the page's top when the clause it was writing becomes a rule */
  const [landed, setLanded] = useState('')
  /* ARRIVING ON A CLAUSE (`?open=` from the build's "See the rule") lands on it at once; a
     clause opened by a press on this page glides */
  const arrival = useRef(at.open !== '')

  const apply = useCallback(
    (command: CatalogueCommand, back: keyof typeof BACK, after?: () => void) => {
      const outcome = catalogue.getState().apply(command)
      if (!isDone(outcome)) {
        say(outcome.refused === '' ? NOTHING_TO_DO : outcome.refused, { id: STEP_TOAST })
        return
      }
      const eventId = outcome.event.id
      undo(
        outcome.said,
        () => {
          const undone = catalogue.getState().undo(eventId)
          if (isDone(undone)) say(BACK[back], { id: STEP_TOAST })
          else say(undone.refused === '' ? NOTHING_TO_DO : undone.refused, { id: STEP_TOAST })
        },
        { id: STEP_TOAST },
      )
      after?.()
    },
    [],
  )

  const setVerbOf = useCallback(
    (rule: ConstraintDef, verb: Verb) => apply(doRule(rule.id, verb), 'do'),
    [apply],
  )

  const onOpen = useCallback(
    (open: string) => {
      if (open !== '') setStale('')
      go({ open })
    },
    [go],
  )

  /* the page's count, read once off the parts it numbers (`houseOf`), never summed here */
  const house = useMemo(() => houseSaid(houseOf(book)), [book])

  return (
    <main className="hr" data-testid="rules" data-read="">
      <header className="hr-head">
        <p className="hr-eyebrow">The house rules</p>
        <h1 className="hr-title">What may be sold with what</h1>
        <p className="hr-lede">
          {`${house} `}
          What a rule written here refuses, the build refuses from the next pick, and says its
          because where it does.
        </p>
        <div className="hr-head__acts">
          <Button intent="quiet" size="sm" icon={PrinterIcon} onClick={() => window.print()}>
            Print the house rules
          </Button>
        </div>
      </header>

      <div className="hr-sheet" data-ground="plate">
        {stale === '' ? null : (
          <output className="hr-stale" data-testid="rules-stale">
            <Icon glyph={WarningCircleIcon} />
            That rule is not on the list any more, so nothing is open. It may have been deleted, or
            the link was copied from another computer.
          </output>
        )}
        {book.map((part) => (
          <PartView
            key={part.id}
            part={part}
            onSale={part.writes ? sale[part.writes] : null}
            opened={opened}
            onOpen={onOpen}
            at={at}
            go={go}
            listHref={listHref}
            follow={follow}
            world={world}
            cols={cols}
            yours={yours}
            rules={rules}
            quotes={quotes}
            orgId={orgId}
            apply={apply}
            setVerbOf={setVerbOf}
            landed={landed}
            onLanded={setLanded}
            arrival={arrival}
          />
        ))}
        <p className="hr-sign" aria-hidden="true">
          <span>Signed</span>
          <span>Date</span>
        </p>
      </div>

      <Refuted />
    </main>
  )
}

/* ---------------------------------------------------------- */
/* One part: Trailers, Motors, Rigging and pre-delivery        */
/* ---------------------------------------------------------- */

interface PartProps {
  part: Part
  onSale: number | null
  opened: Opened | null
  onOpen: (open: string) => void
  at: RulesAt
  go: (next: Partial<RulesAt>) => void
  listHref: (table: string, line: string) => string
  follow: (href: string) => void
  world: PairWorld
  cols: Columns
  yours: YourRule[]
  rules: readonly ConstraintDef[]
  quotes: readonly QuoteDef[]
  orgId: string
  apply: (command: CatalogueCommand, back: keyof typeof BACK, after?: () => void) => void
  setVerbOf: (rule: ConstraintDef, verb: Verb) => void
  landed: string
  onLanded: (id: string) => void
  arrival: { current: boolean }
}

/** A name that never breaks inside a hyphenated word: "pre-delivery" stays one word in the
 *  112px name column (judge.md, data round, B10). */
function unbroken(name: string): ReactNode {
  const out: ReactNode[] = []
  let at = 0
  for (const w of name.split(' ')) {
    out.push(
      <Fragment key={at}>
        {at > 0 ? ' ' : null}
        {w.includes('-') ? <span className="hr-nowrap">{w}</span> : w}
      </Fragment>,
    )
    at += w.length + 1
  }
  return out
}

function PartView(props: PartProps) {
  const { part, onSale: forSale, opened, onOpen, cols, yours, at, go, listHref, follow } = props
  const headId = `hr-part-${part.id}`
  /* the clause being written belongs to the part that writes its kind */
  const here = opened !== null && part.writes === opened.draft.partnerKind
  const openRule = here ? opened.rule : null
  const writingNew = here && opened.rule === null
  const noun = part.writes ? KIND_NOUN[part.writes] : null
  const fromRef = here ? opened.draft.from : null
  const openAt = openRule ? part.yours.findIndex((y) => y.item.rule.id === openRule.id) : -1
  /* THE CLAUSES ABOVE THE ONE BEING WRITTEN stand beside the noticed boxes as one column, and the
     margin's boxes as another, so a tall box never sets a clause's row height (judge.md, data
     round, B6: 3.1's text ended near y 890 and 3.2 began at 971). What follows the clause being
     written is a column of its own under it. */
  const before = openAt >= 0 ? part.yours.slice(0, openAt) : part.yours
  const after = openAt >= 0 ? part.yours.slice(openAt + 1) : []

  const look = (ref: WorkbookRuleRef): void => go({ look: at.look === ref ? '' : ref })

  const yourClause = ({ at: n, item }: Part['yours'][number]) => (
    <YourClause
      key={item.rule.id}
      n={n}
      y={item}
      onRewrite={() => onOpen(item.rule.id)}
      onVerb={(v) => props.setVerbOf(item.rule, v)}
      /* ONCE THE CLAUSE IT WAS WRITTEN IN HAS CLOSED: measured while it still stood, the rule was
         in sight, and the close then took 1,000px out above the eye at 390 */
      focus={props.landed === item.rule.id && opened === null}
      onFocused={() => props.onLanded('')}
    />
  )

  const writeAct = (
    <>
      {part.writes && noun && !writingNew ? (
        <div className="hr-write">
          <Button
            intent="quiet"
            size="sm"
            icon={PlusIcon}
            onClick={() => onOpen(`new:${part.writes}`)}
          >
            {`Write a rule about ${noun.many}`}
          </Button>
        </div>
      ) : null}
      {part.writes === null ? (
        <p className="hr-write hr-write--read">
          A rule here decides a motor or a trailer, so this part is your price list’s alone.
        </p>
      ) : null}
    </>
  )

  return (
    <section className="hr-part" aria-labelledby={headId} data-part={part.id}>
      <div className="hr-part__name">
        <span className="hr-part__n" aria-hidden="true">
          {part.n}
        </span>
        <h2 className="hr-part__title" id={headId}>
          <KindMark kind={part.mark} size="sm" />
          <span>{unbroken(part.name)}</span>
        </h2>
        {forSale !== null && noun ? (
          <p className="hr-part__sale">{`${count(forSale)} on sale`}</p>
        ) : null}
      </div>

      <div className="hr-clauses" data-writing={here ? '' : undefined}>
        <div className="hr-clauses__main">
          {part.stated.map(({ at: n, item }) => (
            <StatedClause
              key={item.ref}
              n={n}
              s={item}
              open={at.look === item.ref}
              onLook={() => look(item.ref)}
              listHref={listHref}
              follow={follow}
            />
          ))}
          {before.map(yourClause)}
          {openAt < 0 ? writeAct : null}
        </div>

        {part.noticed.length > 0 ? (
          <div className="hr-noticed-stack">
            {part.noticed.map((s) => (
              <Noticed
                key={s.ref}
                s={s}
                next={part.next}
                said={alreadySaid(s.ref, yours, cols)}
                saidAs={saidAsOf(s.ref, part, cols)}
                open={fromRef === s.ref}
                onSay={() => onOpen(s.ref)}
                looking={at.look === s.ref}
                onLook={() => look(s.ref)}
                listHref={listHref}
                follow={follow}
              />
            ))}
          </div>
        ) : null}

        {openRule && opened ? (
          <OpenClause
            key={`open-${openRule.id}`}
            {...props}
            opened={opened}
            n={part.yours[openAt]!.at}
          />
        ) : null}
        {writingNew && opened ? (
          <OpenClause key={`open-${opened.key}`} {...props} opened={opened} n={part.next} />
        ) : null}

        <div className="hr-clauses__main hr-clauses__after">
          {after.map(yourClause)}
          {openAt >= 0 ? writeAct : null}
        </div>
      </div>
    </section>
  )
}

/** Where the price list's noticed pattern now stands as Northside's own, its number: "2.4". */
function saidAsOf(ref: WorkbookRuleRef, part: Part, cols: Columns): string {
  const draft = draftFromPriceList(ref, cols)
  if (!draft) return ''
  const said = pairSaid(shapeOfDraft(draft, cols))
  return part.yours.find((y) => y.item.said === said)?.at ?? ''
}

/* ---------------------------------------------------------- */
/* The price list's own clause                                 */
/* ---------------------------------------------------------- */

function Measure({ s }: { s: StatedRule }) {
  const fig = figureOf(s)
  if (!fig) return null
  return (
    <p
      className="hr-clause__measure"
      aria-label={`${s.under ? '' : 'Holds on '}${count(fig.shown)} of ${count(fig.of)} ${s.counted}`}
    >
      <span className="hr-held">
        <span className="hr-held__n">{count(fig.shown)}</span>
        <span className="hr-held__of">{` of ${count(fig.of)}`}</span>
      </span>
      <span className="hr-held__what">{s.counted}</span>
    </p>
  )
}

function StatedClause({
  n,
  s,
  open,
  onLook,
  listHref,
  follow,
}: {
  n: string
  s: StatedRule
  open: boolean
  onLook: () => void
  listHref: (table: string, line: string) => string
  follow: (href: string) => void
}) {
  const breaks = exceptionsSaid(s)
  const listId = `hr-ex-${s.ref}`
  return (
    <div className="hr-clause" data-owner="list" data-testid="stated-rule" data-ref={s.ref}>
      <span className="hr-clause__n">{n}</span>
      <div className="hr-clause__body">
        <p className="hr-clause__said">{s.said}</p>
        {s.does ? (
          <p className="hr-build" data-does={s.does.does}>
            <Icon glyph={BUILD_GLYPH[s.does.does]} />
            <span>
              <strong>{`In the build: ${BUILD_WORD[s.does.does]}`}</strong>
              {s.does.said === '' ? null : ` ${s.does.said}`}
            </span>
          </p>
        ) : null}
        {s.live === null && s.measure ? (
          <p className="hr-clause__where">
            Counted on the workbook this rule was found in, not on the price list loaded here: the
            price list does not write which propellers each motor is offered with, so it cannot be
            counted on it.
          </p>
        ) : null}
        {breaks === '' ? null : (
          <div className="hr-clause__look">
            <Button
              intent="quiet"
              size="sm"
              icon={ListChecksIcon}
              onClick={onLook}
              aria-expanded={open}
              aria-controls={listId}
            >
              {open ? `Put the ${s.live!.exceptions.length.toLocaleString('en-AU')} away` : breaks}
            </Button>
          </div>
        )}
        {open && s.live ? (
          <Exceptions id={listId} s={s} listHref={listHref} follow={follow} />
        ) : null}
      </div>
      <Measure s={s} />
    </div>
  )
}

/** How many exception groups stand before "Show the other N". */
const FIRST_SHOWN = 12

function Exceptions({
  id,
  s,
  listHref,
  follow,
}: {
  id: string
  s: StatedRule
  listHref: (table: string, line: string) => string
  follow: (href: string) => void
}) {
  const groups = useMemo(() => groupExceptions(s.live?.exceptions ?? []), [s.live])
  const [all, setAll] = useState(false)
  const shown = all ? groups : groups.slice(0, FIRST_SHOWN)
  return (
    <div className="hr-ex" id={id} data-testid="exceptions">
      <p className="hr-ex__head">
        {s.under
          ? `What sits under it, offer by offer — each on its line of the price list, where it can be changed.`
          : `Where the price list breaks it, offer by offer — each on its line of the price list, where it can be changed.`}
      </p>
      <ul className="hr-ex__list">
        {shown.map((g) => {
          const first = g.lines[0]!
          const href = listHref(first.list, first.line)
          return (
            <li key={`${g.boat}|${g.what}|${g.why}`} className="hr-ex__item">
              <p className="hr-ex__what">
                <span className="hr-ex__boat">{g.boat}</span>
                <span aria-hidden="true">{' · '}</span>
                <span>{g.what}</span>
              </p>
              <p className="hr-ex__why">
                {g.why}
                {g.lines.length > 1 ? `, written on ${count(g.lines.length)} lines` : ''}
              </p>
              <Button
                intent="quiet"
                size="sm"
                icon={ArrowSquareOutIcon}
                href={href}
                onClick={() => follow(href)}
                aria-label={`${g.boat}, ${g.what}: its line in ${first.listName}`}
              >
                {g.lines.length > 1 ? 'Its first line' : 'Its line'}
              </Button>
            </li>
          )
        })}
      </ul>
      {groups.length > FIRST_SHOWN ? (
        <Button intent="quiet" size="sm" onClick={() => setAll((v) => !v)} aria-expanded={all}>
          {all
            ? `Show the first ${FIRST_SHOWN}`
            : `Show the other ${count(groups.length - FIRST_SHOWN)}`}
        </Button>
      ) : null}
    </div>
  )
}

/* ---------------------------------------------------------- */
/* What the price list was noticed doing                       */
/* ---------------------------------------------------------- */

function Noticed({
  s,
  next,
  said,
  saidAs,
  open,
  onSay,
  looking,
  onLook,
  listHref,
  follow,
}: {
  s: StatedRule
  next: string
  said: boolean
  saidAs: string
  open: boolean
  onSay: () => void
  looking: boolean
  onLook: () => void
  listHref: (table: string, line: string) => string
  follow: (href: string) => void
}) {
  const fig = figureOf(s)
  const breaks = exceptionsSaid(s)
  const listId = `hr-ex-${s.ref}`
  return (
    <aside
      className="hr-noticed"
      aria-label="Noticed, not written"
      data-testid="noticed"
      data-ref={s.ref}
    >
      <p className="hr-noticed__eyebrow">
        <Icon glyph={EyeIcon} />
        Noticed, not written
      </p>
      <p className="hr-noticed__said">{s.said}</p>
      <p className="hr-noticed__note">
        {fig
          ? `It holds on ${count(fig.shown)} of ${count(fig.of)} ${s.counted}. Nobody wrote it down, so the build does nothing with it.`
          : 'Nobody wrote it down, so the build does nothing with it.'}
      </p>
      {breaks === '' ? null : (
        <div className="hr-noticed__look">
          <Button
            intent="quiet"
            size="sm"
            icon={ListChecksIcon}
            onClick={onLook}
            aria-expanded={looking}
            aria-controls={listId}
          >
            {looking ? `Put the ${s.live!.exceptions.length.toLocaleString('en-AU')} away` : breaks}
          </Button>
        </div>
      )}
      {looking && s.live ? (
        <Exceptions id={listId} s={s} listHref={listHref} follow={follow} />
      ) : null}
      {s.sayable ? (
        said ? (
          <p className="hr-noticed__yours">
            <Icon glyph={CheckIcon} />
            {saidAs === '' ? 'Said as Northside’s.' : `Said as Northside’s, ${saidAs}.`}
          </p>
        ) : open ? (
          <p className="hr-noticed__yours">{`Being said as Northside’s, ${next}.`}</p>
        ) : (
          <div className="hr-noticed__act">
            <Button intent="secondary" size="sm" icon={NotePencilIcon} onClick={onSay}>
              Say it as Northside’s
            </Button>
            <span className="hr-noticed__then">{`It opens as ${next}, to read before it is added.`}</span>
          </div>
        )
      ) : (
        /* A DEAD END SAYS WHY WHERE IT STANDS (judge.md, data round, B3) */
        <p className="hr-noticed__then" data-testid="noticed-why">
          It cannot be said as Northside’s: it decides a kit, and a rule here decides a motor or a
          trailer.
        </p>
      )}
    </aside>
  )
}

/* ---------------------------------------------------------- */
/* One of Northside's own, at rest                             */
/* ---------------------------------------------------------- */

function YourClause({
  n,
  y,
  onRewrite,
  onVerb,
  focus,
  onFocused,
}: {
  n: string
  y: YourRule
  onRewrite: () => void
  onVerb: (v: Verb) => void
  focus: boolean
  onFocused: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!focus) return
    ref.current?.focus({ preventScroll: true })
    /* NOT CANCELLED WITH THE EFFECT: `onFocused` clears the landing at once, and a cleanup would
       take the scroll back before its frames came round (measured at 390: the rule 262px above
       the screen, focused and out of sight) */
    void intoSight(ref.current, 'nearest', false)
    onFocused()
  }, [focus, onFocused])
  const noun = KIND_NOUN[y.reach.kind]
  const line = verbLine(y.verb, noun.one, y.rule.severity === 'warn' ? 'warn' : 'block')
  return (
    <motion.div
      ref={ref}
      tabIndex={-1}
      className="hr-clause"
      data-owner="yours"
      data-does={y.verb}
      data-testid="your-rule"
      layout="position"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={move.settle}
    >
      <span className="hr-clause__n">{n}</span>
      <div className="hr-clause__body">
        <p className="hr-clause__said">{y.said}</p>
        <p className="hr-verbline">
          <VerbGlyph verb={y.verb} />
          {`${line.lead} `}
          <Select
            look="word"
            ink={VERB_INK[y.verb]}
            aria-label={`What ${n} does`}
            value={y.verb}
            options={VERB_OPTIONS}
            onValueChange={(v) => v && v !== y.verb && onVerb(v)}
          />
          {` ${line.tail} ${y.rule.because}.`}
        </p>
        <p className="hr-clause__by">
          <span>{`Northside’s, written ${dayOf(y.rule.createdAt)}${y.rule.edited ? `, changed ${dayOf(y.rule.updatedAt)}` : ''}.`}</span>
          <Button intent="quiet" size="sm" icon={NotePencilIcon} onClick={onRewrite}>
            {`Rewrite ${n}`}
          </Button>
        </p>
      </div>
      <p
        className="hr-clause__measure"
        aria-label={`${count(y.reach.taken)} of ${count(y.reach.made)} offers your price list makes for them, ${takenSaid(y.verb)}`}
      >
        <span className="hr-held">
          <span className="hr-held__n">{count(y.reach.taken)}</span>
          <span className="hr-held__of">{` of ${count(y.reach.made)}`}</span>
        </span>
        <span className="hr-held__what">{`offers your price list makes for them, ${takenSaid(y.verb)}`}</span>
      </p>
    </motion.div>
  )
}

function VerbGlyph({ verb }: { verb: Verb }) {
  return (
    <span className="hr-does" data-does={verb}>
      <Icon glyph={VERB_GLYPH[verb]} />
    </span>
  )
}

/* ---------------------------------------------------------- */
/* The clause being written, or rewritten                      */
/* ---------------------------------------------------------- */

function OpenClause(props: PartProps & { opened: Opened; n: string }) {
  const { opened, n, onOpen, world, cols, quotes, orgId, apply, onLanded, arrival, rules, at, go } =
    props

  /* IT COMES INTO SIGHT WHEN IT OPENS, once per clause: on arrival from the build, at once */
  const self = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const instant = arrival.current
    arrival.current = false
    return intoSight(self.current, 'start', instant)
  }, [opened.key, arrival])

  /* THE CLAUSE FOLLOWS THE ADDRESS: a new `?open=`, or the words of the rule it is on changed,
     starts the sentence again from what is filed — or from the words written here and not yet
     kept. React's own pattern for state that follows a prop, adjusted during the render */
  const [draft, setDraft] = useState<Draft>(() => UNKEPT.get(opened.key) ?? opened.draft)
  const [seen, setSeen] = useState(opened.key)
  if (seen !== opened.key) {
    setSeen(opened.key)
    setDraft(UNKEPT.get(opened.key) ?? opened.draft)
  }

  /* WHAT IT DOES is the filed rule's own on a written rule — the verb at rest and here are one */
  const verb: Verb = opened.rule ? ruleDoesNow(opened.rule) : draft.verb
  const shape = useMemo(() => shapeOfDraft(draft, cols), [draft, cols])
  /* THE COUNT IS TAKEN ON THE SENTENCE, NOT ON ITS BECAUSE: typing a reason never recounts */
  const shapeKey = JSON.stringify([shape.boat, shape.also ?? [], shape.partnerKind, shape.partner])
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- counted on the sentence, by its key
  const reach = useMemo(() => pairReach(shape, world), [shapeKey, world])
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- drawn on the sentence, by its key
  const field = useMemo(() => pairField(shape, world), [shapeKey, world])
  const missing = draftMissing(draft, cols)
  const changed = opened.rule ? draftChanged(draft, opened.rule, world) : true
  /* THE OTHER RULES IT STANDS BESIDE: every one of Northside's but the one being rewritten */
  const others = useMemo(() => rules.filter((r) => r.id !== opened.rule?.id), [rules, opened.rule])

  /* THE DRAFTS IT WOULD HOLD, counted in src/domain (`draftsARuleWouldHold`), the give's reading */
  const standing = useMemo(
    () => draftsARuleWouldHold(world, quotes, missing ? null : ruleOfDraft(draft, cols, orgId, '')),
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- counted on the sentence, by its key
    [shapeKey, missing, quotes, world, cols, orgId],
  )

  const forget = useCallback(() => UNKEPT.delete(opened.key), [opened.key])
  const plateKey = opened.key
  const set = (next: Partial<Draft>): void =>
    setDraft((d) => {
      const n2 = { ...d, ...next }
      UNKEPT.set(plateKey, n2)
      return n2
    })
  const setAlso = (i: number, next: Partial<AlsoDraft> | null): void =>
    setDraft((d) => {
      const also =
        next === null
          ? d.also.filter((_, k) => k !== i)
          : d.also.map((a, k) => (k === i ? { ...a, ...next } : a))
      const n2 = { ...d, also }
      UNKEPT.set(plateKey, n2)
      return n2
    })

  const close = useCallback(() => onOpen(''), [onOpen])

  const add = (): void => {
    if (missing) return
    const now = new Date().toISOString()
    if (opened.rule) {
      const was = opened.rule
      forget()
      apply(changeRule(ruleOfDraft({ ...draft, verb }, cols, orgId, now, was)), 'change', () => {
        onLanded(was.id)
        close()
      })
      return
    }
    const rule = ruleOfDraft(draft, cols, orgId, now)
    forget()
    apply(addRule(rule), 'add', () => {
      onLanded(rule.id)
      close()
    })
  }

  const remove = (): void => {
    if (!opened.rule) return
    forget()
    apply(deleteRule(opened.rule.id), 'delete', close)
  }

  const putBack = (): void => {
    forget()
    setDraft(opened.draft)
  }

  const setVerb = (next: Verb): void => {
    if (opened.rule) apply(doRule(opened.rule.id, next), 'do')
    else set({ verb: next })
  }

  const kind = draft.partnerKind
  const noun = KIND_NOUN[kind]
  const partnerCols = cols[kind]
  const boatCol = columnAt(cols.boat, draft.boatKey)
  const partnerCol = columnAt(partnerCols, draft.partnerKey)

  const valueControl = (
    i: number | string,
    col: PairColumn,
    whose: string,
    value: string,
    onValue: (v: string) => void,
    label = `The ${whose}’s ${col.name}`,
  ) =>
    col.measure === 'figure' ? (
      <Fragment key={i}>
        <Input
          look="figure"
          aria-label={`${label}, ${col.unitAsked}`}
          placeholder="…"
          value={value}
          onValueChange={onValue}
        />
        {col.unit === '' ? null : ` ${col.unit}`}
      </Fragment>
    ) : col.values.length > LONG_LIST ? (
      /* A LONG LIST IS FOUND BY TYPING, maker by maker (judge.md, data round, B4) */
      <WordFinder
        key={i}
        aria-label={label}
        placeholder={col.name === 'model' ? 'model' : '…'}
        noun={col.name === 'model' ? `a ${whose} model` : `a ${col.name}`}
        values={col.values}
        value={value}
        onValue={onValue}
      />
    ) : (
      <Select
        key={i}
        look="word"
        aria-label={label}
        placeholder="…"
        value={value === '' ? null : value}
        options={valueOptions(col)}
        onValueChange={(v) => onValue(v ?? '')}
      />
    )

  const controlFor = (word: PairWord, i: number): ReactNode => {
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
          <span key={i} className="hr-gap">
            …
          </span>
        )
      case 'also-column': {
        const k = word.at ?? 0
        const a = draft.also[k]!
        return (
          <Select
            key={i}
            look="word"
            aria-label="Which more of the boat’s specs"
            placeholder="spec"
            value={a.key === '' ? null : a.key}
            options={columnOptions(cols.boat)}
            onValueChange={(key) => {
              const next = columnAt(cols.boat, key ?? '')
              const moved = sideMovedTo(next, 'boat', a.op, a.value)
              setAlso(k, { key: key ?? '', op: moved.op, value: moved.value })
            }}
          />
        )
      }
      case 'also-op': {
        const k = word.at ?? 0
        const a = draft.also[k]!
        const col = columnAt(cols.boat, a.key)
        return (
          <Select
            key={i}
            look="word"
            aria-label={col?.measure === 'figure' ? 'And over or under' : 'And is, or is not'}
            value={a.op}
            options={opOptions(CONDITION_WORD, col)}
            onValueChange={(op) => op && setAlso(k, { op })}
          />
        )
      }
      case 'also-value': {
        const k = word.at ?? 0
        const a = draft.also[k]!
        const col = columnAt(cols.boat, a.key)
        if (!col)
          return (
            <span key={i} className="hr-gap">
              …
            </span>
          )
        return valueControl(
          i,
          col,
          'boat',
          a.value,
          (v) => setAlso(k, { value: v }),
          a.key === 'boat::model' && a.op === 'neq'
            ? 'The model it makes an exception of'
            : `And the boat’s ${col.name}`,
        )
      }
      case 'partner-kind':
        /* THE PART DECIDES THE KIND: a rule written under Motors is about a motor */
        return <span key={i}>{word.text}</span>
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
          <span key={i} className="hr-gap">
            …
          </span>
        )
      default:
        return null
    }
  }

  const words = pairWords(shape)
  const line = verbLine(verb, noun.one, opened.rule?.severity === 'warn' ? 'warn' : 'block')
  const owner = opened.rule ? 'yours' : draft.from ? 'noticed' : 'yours'
  /* A WRITTEN RULE OPENS TO BE READ: "being rewritten" only once a word of it has changed, so a
     dealer who came from the build's "See the rule" is told what the rule is, not that it is
     being taken apart (built-critique-m3-2.md, minor) */
  const eyebrow = opened.rule
    ? `Northside’s, written ${dayOf(opened.rule.createdAt)}${changed ? ' · being rewritten' : ''}`
    : draft.from
      ? 'Noticed in your price list · being said as Northside’s'
      : 'Northside’s · being written'
  const hasModel = columnAt(cols.boat, 'boat::model') !== null
  /* A SENTENCE THAT SAYS WHAT THE PRICE LIST WAS NOTICED DOING says so, so a dealer knows it will
     take nothing today (judge.md, data round, missing item 7) */
  const noticedSame = useMemo(() => {
    if (draft.from) return ''
    const said = pairSaid(shape)
    for (const entry of PAIRING_RULES) {
      const from = draftFromPriceList(entry.ref, cols)
      if (!from || pairSaid(shapeOfDraft(from, cols)) !== said) continue
      return 'It says what your price list was noticed doing: nothing it makes breaks it, so it takes nothing today.'
    }
    return ''
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- read on the sentence, by its key
  }, [shapeKey, cols, draft.from])

  /* SAID BEFORE IT IS ADDED (judge.md, data round, missing item 7) */
  const heads = useMemo(
    () => headsUp(shape, world, others, props.yours, noun.one, missing === null, noticedSame),
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- counted on the sentence, by its key
    [shapeKey, world, others, props.yours, noun.one, missing === null, noticedSame],
  )

  return (
    <motion.div
      ref={self}
      className="hr-open"
      data-owner={owner}
      data-does={verb}
      data-testid="open-rule"
      layout="position"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={move.settle}
      onKeyDown={(e) => {
        /* ESCAPE PUTS IT AWAY, once no list inside it is open: a list consumes its own Escape */
        if (
          e.key === 'Escape' &&
          !e.defaultPrevented &&
          e.currentTarget.contains(e.target as Node)
        ) {
          e.preventDefault()
          close()
        }
      }}
    >
      {/* THE SENTENCE AND ITS ACT ARE ONE SIDE, and on a wide sheet that side stays clear of the pill
          while the count beside it scrolls (built-critique-m3-2.md, major 6: the because field sat
          under the pill once the dealer read down the makers' marks) */}
      <div className="hr-open__side">
        <div className="hr-open__writing">
          <p className="hr-open__eyebrow">
            <span className="hr-open__n">{n}</span>
            <span>{eyebrow}</span>
          </p>
          <p className="hr-sentence" data-testid="rule-sentence">
            {words.map((word, i) => (
              <Fragment key={word.key}>
                {i > 0 && !word.tight ? ' ' : null}
                {word.role === 'word' ? (
                  <span className={word.unchosen ? 'hr-gap' : undefined}>{word.text}</span>
                ) : (
                  controlFor(word, i)
                )}
              </Fragment>
            ))}
          </p>
          <div className="hr-more">
            {draft.also.map((a, k) => (
              <Button
                key={`${a.key}|${a.op}|${a.value}`}
                intent="quiet"
                size="sm"
                icon={XIcon}
                onClick={() => setAlso(k, null)}
              >
                {a.key === 'boat::model' && a.op === 'neq'
                  ? 'Take the exception away'
                  : 'Take the “and” away'}
              </Button>
            ))}
            {draft.also.length < MAX_ALSO ? (
              <>
                <Button
                  intent="quiet"
                  size="sm"
                  icon={PlusIcon}
                  onClick={() => set({ also: [...draft.also, blankAnd()] })}
                >
                  And another of the boat’s specs
                </Button>
                {hasModel ? (
                  <Button
                    intent="quiet"
                    size="sm"
                    icon={PlusIcon}
                    onClick={() => set({ also: [...draft.also, blankExcept()] })}
                  >
                    Except one model
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>
          <div className="hr-verbline hr-verbline--open">
            <VerbGlyph verb={verb} />
            <span>{`${line.lead} `}</span>
            <Select
              look="word"
              ink={VERB_INK[verb]}
              aria-label="What the build does"
              value={verb}
              options={VERB_OPTIONS}
              onValueChange={(v) => v && setVerb(v)}
            />
            <span>{` ${line.tail} `}</span>
            <span className="hr-because">
              <Input
                look="word"
                aria-label="Because"
                placeholder="say why, in the words the build will say it"
                value={draft.because}
                onValueChange={(because) => set({ because })}
              />
            </span>
          </div>
        </div>

        {heads.length > 0 ? (
          <ul className="hr-heads" data-testid="heads-up" aria-label="Before it is added">
            {heads.map((h) => (
              <li key={h} className="hr-heads__item">
                <Icon glyph={WarningCircleIcon} />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <fieldset className="hr-open__act" aria-label="What to do with it">
          {opened.rule && !changed ? null : (
            <Button
              intent="act"
              icon={opened.rule ? CheckIcon : PlusIcon}
              onClick={add}
              {...(missing ? { refusedBecause: missing } : {})}
            >
              {opened.rule ? 'Keep the change' : `Add it as ${n}`}
            </Button>
          )}
          {opened.rule && changed ? (
            <Button intent="quiet" size="sm" icon={ArrowCounterClockwiseIcon} onClick={putBack}>
              Put it back as it was
            </Button>
          ) : null}
          <Button intent="quiet" size="sm" icon={XIcon} onClick={close}>
            Close
          </Button>
          {/* THE KNIFE LAST, set apart: a dealer who came from the build's "See the rule" to read
            it is handed Close first, never "Delete 2.4" (built-critique-m3-2.md, minor) */}
          {opened.rule ? (
            <span className="hr-open__drop">
              <Button intent="quiet" size="sm" icon={TrashIcon} onClick={remove}>
                {`Delete ${n}`}
              </Button>
            </span>
          ) : null}
        </fieldset>
      </div>

      <Counting
        shape={shape}
        shapeKey={shapeKey}
        world={world}
        reach={reach}
        field={field}
        verb={verb}
        partnerName={partnerCol?.name ?? ''}
        standing={standingSaid(verb, standing.drafts, standing.carrying, noun.one)}
        filed={opened.rule !== null}
        quotes={quotes}
        on={at.on}
        onOn={(on) => go({ on })}
      />
    </motion.div>
  )
}

/**
 * THE THINGS SAID BEFORE IT IS ADDED, in the order they matter: a boat it would leave with
 * nothing, a rule of Northside's it cannot stand beside, a rule that already says it, and a
 * pattern the price list was noticed keeping. Each one counted off the sheet (`pairTaken.ts`).
 */
function headsUp(
  shape: PairShape,
  world: PairWorld,
  others: readonly ConstraintDef[],
  yours: readonly YourRule[],
  noun: string,
  whole: boolean,
  noticed: string,
): string[] {
  if (!whole) return []
  const out: string[] = []
  const numberOf = (id: string): string => {
    const y = yours.find((r) => r.rule.id === id)
    return y ? `“${y.said}”` : 'another of your rules'
  }
  const empties = pairEmpties(shape, world, others)
  const alone = empties.filter((e) => e.with.length === 0)
  if (alone.length > 0) {
    const first = alone[0]!
    out.push(
      alone.length === 1
        ? `The ${first.said} would be offered no ${noun}: all ${count(first.made)} your price list makes for it are taken.`
        : `${count(alone.length)} boats would be offered no ${noun}, the ${first.said} among them: everything your price list makes for them is taken.`,
    )
  }
  for (const e of empties.filter((x) => x.with.length > 0).slice(0, 2))
    out.push(
      `Beside ${numberOf(e.with[0]!)}, the ${e.said} would be offered no ${noun} at all: the two together take all ${count(e.made)} made for it.`,
    )
  for (const c of pairClashes(shape, world, others).slice(0, 2))
    out.push(
      `It cannot stand beside ${numberOf(c.ruleId)}: on the ${c.boat} no ${noun} on sale keeps both.`,
    )
  const said = pairSaid(shape)
  const same = yours.find((y) => y.said === said && others.some((o) => o.id === y.rule.id))
  if (same) out.push(`It says what ${numberOf(same.rule.id)} already says.`)
  if (noticed !== '') out.push(noticed)
  return out
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
/* Counted now, before it is added                             */
/* ---------------------------------------------------------- */

function Counting({
  shape,
  shapeKey,
  world,
  reach,
  field,
  verb,
  partnerName,
  standing,
  filed,
  quotes,
  on,
  onOn,
}: {
  shape: PairShape
  shapeKey: string
  world: PairWorld
  reach: PairReach
  field: PairField
  verb: Verb
  partnerName: string
  standing: string
  filed: boolean
  quotes: readonly QuoteDef[]
  on: string
  onOn: (on: string) => void
}) {
  const noun = KIND_NOUN[reach.kind]
  const losing = field.makers.filter((m) => m.losing > 0)
  /* THE SALE IT COSTS IS SAID ONCE: under the rings where a model loses one, or in one sentence
     where none does */
  const cost = losing.length > 0 && reach.ready ? '' : costSaid(reach, verb)
  const blank = field.blank
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- counted on the sentence, by its key
  const taken = useMemo(() => pairTaken(shape, world), [shapeKey, world])
  const onQuotes = useMemo(
    () => pairOnQuotes(shape, world, quotes),
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- counted on the sentence, by its key
    [shapeKey, world, quotes],
  )
  const [named, setNamed] = useState<ReadonlySet<string>>(() => new Set())
  const nameMaker = (id: string): void =>
    setNamed((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const head = filed ? 'Counted now' : 'Counted now, before it is added'
  return (
    <section className="hr-count" aria-label={head} data-testid="census" data-kind={reach.kind}>
      <h3 className="hr-count__head">{head}</h3>
      <dl className="hr-figures">
        <Count
          known={reach.conditionReady}
          value={reach.about}
          of={reach.boats}
          what="models it is about"
        />
        <Count
          known={reach.ready}
          value={reach.taken}
          /* what the price list makes for them is not known until "them" is: never "– of 0" */
          of={reach.conditionReady ? reach.made : null}
          what={`offers your price list makes for them, ${takenSaid(verb)}`}
          strong
        />
        <Count
          known={reach.ready}
          value={reach.refused}
          of={reach.partners}
          what={`${noun.many} ${doesSaid(verb)}`}
        />
      </dl>
      {reach.ready && blank.length > 0 ? (
        <p className="hr-count__note">
          {`${blank.map((b) => `The ${count(b.count)} ${b.maker}`).join(' and ')} carry no ${partnerName}, so it says nothing of them.`}
        </p>
      ) : null}

      <div className="hr-field" aria-label="The models it is about, one mark each">
        {field.makers.map((m) => {
          const open = named.has(m.id)
          const about = m.models.filter((x) => x.about)
          return (
            <div key={m.id} className="hr-field__maker" data-testid="field-maker">
              <button
                type="button"
                className="hr-field__name"
                aria-expanded={open}
                onClick={() => nameMaker(m.id)}
                disabled={!reach.conditionReady || about.length === 0}
              >
                <span>{m.maker}</span>
                <span className="hr-field__of">
                  {/* before the condition is chosen nothing is "0 of 39": the maker's models, counted */}
                  {reach.conditionReady
                    ? `${count(m.about)} of ${count(m.models.length)}`
                    : count(m.models.length)}
                </span>
              </button>
              <span className="hr-field__marks" aria-hidden="true">
                {m.models.map((x) => (
                  <span
                    key={x.key}
                    className="hr-mark"
                    title={`${m.maker} ${x.said}${x.loses && reach.ready ? ', loses an offer' : x.about ? ', it is about it' : ''}`}
                    data-about={x.about ? '' : undefined}
                    data-loses={x.loses && reach.ready ? '' : undefined}
                  />
                ))}
              </span>
              {open && about.length > 0 ? (
                <p className="hr-field__named" data-testid="field-named">
                  {about.map((x, k) => (
                    <Fragment key={x.key}>
                      {k > 0 ? ', ' : null}
                      <span data-loses={x.loses && reach.ready ? '' : undefined}>{x.said}</span>
                    </Fragment>
                  ))}
                </p>
              ) : null}
              {m.losing > 0 && reach.ready ? (
                <p className="hr-field__loses" data-testid="rule-cost">
                  {losesSaid(
                    m.models.filter((x) => x.loses).map((x) => x.said),
                    m.lose,
                    verb,
                  )}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>

      {cost === '' ? null : (
        <p className="hr-count__cost" data-testid="rule-cost">
          {cost}
        </p>
      )}

      {reach.ready && taken.length > 0 ? (
        <Taken taken={taken} verb={verb} total={reach.taken} />
      ) : null}

      {reach.ready ? (
        <OneBoat
          shape={shape}
          shapeKey={shapeKey}
          world={world}
          on={on}
          onOn={onOn}
          taken={taken}
        />
      ) : null}

      {reach.ready ? <p className="hr-count__when">{standing}</p> : null}
      {reach.ready ? <OnQuotes list={onQuotes} quotes={quotes.length} noun={noun.one} /> : null}
    </section>
  )
}

/** How many models the taken list names before "Show the other N". */
const TAKEN_SHOWN = 8

function Taken({
  taken,
  verb,
  total,
}: {
  taken: ReturnType<typeof pairTaken>
  verb: Verb
  total: number
}) {
  const [all, setAll] = useState(false)
  const models = taken.flatMap((m) => m.models.map((x) => ({ ...x, maker: m.maker })))
  const shown = all ? models : models.slice(0, TAKEN_SHOWN)
  return (
    <div className="hr-taken" data-testid="taken">
      <h4 className="hr-taken__head">
        {`The ${count(total)} ${total === 1 ? 'offer' : 'offers'} ${takenSaid(verb)}, by name`}
      </h4>
      <ul className="hr-taken__list">
        {shown.map((x) => (
          <li key={x.key} className="hr-taken__item">
            <span className="hr-taken__boat">{x.said}</span>
            <span className="hr-taken__what">
              {`${x.what.join(', ')} · ${count(x.what.length)} of the ${count(x.made)} made for it`}
            </span>
          </li>
        ))}
      </ul>
      {models.length > TAKEN_SHOWN ? (
        <Button intent="quiet" size="sm" onClick={() => setAll((v) => !v)} aria-expanded={all}>
          {all
            ? `Show the first ${TAKEN_SHOWN}`
            : `Show the other ${count(models.length - TAKEN_SHOWN)}`}
        </Button>
      ) : null}
    </div>
  )
}

/**
 * ONE BOAT, TRIED WITH THE RULE ON — what the salesperson will see on its list (judge.md, data
 * round, missing item 2). It opens on the first boat that loses something, or waits for one to
 * be chosen; the boat chosen is the page's `?on=`.
 */
function OneBoat({
  shape,
  shapeKey,
  world,
  on,
  onOn,
  taken,
}: {
  shape: PairShape
  shapeKey: string
  world: PairWorld
  on: string
  onOn: (on: string) => void
  taken: ReturnType<typeof pairTaken>
}) {
  const kind = shape.partnerKind
  const boats = useMemo(() => pairBoats(world, kind), [world, kind])
  const key = on !== '' && boats.some((b) => b.key === on) ? on : (taken[0]?.models[0]?.key ?? '')
  const read = useMemo(
    () => (key === '' ? null : pairOnBoat(shape, world, key)),
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- counted on the sentence, by its key
    [shapeKey, world, key],
  )
  const values = useMemo(
    () => boats.map((b) => ({ value: b.key, said: b.said, count: 0, group: b.maker })),
    [boats],
  )
  const noun = KIND_NOUN[kind]
  return (
    <div className="hr-boat" data-testid="one-boat">
      <h4 className="hr-taken__head">
        {'Tried on the '}
        <WordFinder
          aria-label="The boat it is tried on"
          placeholder="boat"
          noun="a boat"
          values={values}
          value={key}
          onValue={(v) => onOn(v)}
        />
      </h4>
      {read ? (
        <>
          <p className="hr-boat__said">
            {read.about
              ? `It speaks of this boat. Its ${noun.one} list in the build, with the rule on:`
              : `It does not speak of this boat, so its ${noun.one} list is as your price list makes it:`}
          </p>
          <ul className="hr-boat__list">
            {read.items.map((item) => (
              <li key={item.what} className="hr-boat__item" data-verdict={item.verdict}>
                <Icon
                  glyph={
                    item.verdict === 'taken'
                      ? ProhibitIcon
                      : item.verdict === 'keeps'
                        ? CheckIcon
                        : PauseCircleIcon
                  }
                />
                <span>{item.what}</span>
                <span className="hr-boat__verdict">
                  {item.verdict === 'taken'
                    ? 'taken away'
                    : item.verdict === 'keeps'
                      ? 'kept'
                      : 'kept: it writes nothing the rule reads'}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="hr-boat__said">{`Choose a boat to see its ${noun.one} list with the rule on.`}</p>
      )}
    </div>
  )
}

/** The quotes on this computer whose boat the rule speaks of, and what on them it refuses. */
function OnQuotes({
  list,
  quotes,
  noun,
}: {
  list: ReturnType<typeof pairOnQuotes>
  quotes: number
  noun: string
}) {
  return (
    <div className="hr-quotes" data-testid="on-quotes">
      <h4 className="hr-taken__head">On your quotes</h4>
      {quotes === 0 ? null : list.length === 0 ? (
        <p className="hr-count__when">
          {`None of the ${count(quotes)} ${quotes === 1 ? 'quote' : 'quotes'} on this computer is on a boat it speaks of.`}
        </p>
      ) : (
        <ul className="hr-taken__list">
          {list.map((q) => (
            <li key={q.id} className="hr-taken__item">
              <span className="hr-taken__boat">{`${q.reference} · ${q.state === 'draft' ? 'draft' : 'given'}`}</span>
              <span className="hr-taken__what">
                {q.refuses.length === 0
                  ? `${q.boat}: carries no ${noun} it refuses`
                  : `${q.boat}: carries ${namesSaid(q.refuses.slice(0, 2), Math.max(0, q.refuses.length - 2))}, which it refuses`}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="hr-count__when">
        What a rule refused at the moment of a pick is not kept anywhere, so what it refused before
        today cannot be said.
      </p>
    </div>
  )
}

/** Under a maker's rings: which models lose, and what, in the verb's own tense. */
function losesSaid(models: readonly string[], lose: readonly string[], verb: Verb): string {
  const who = modelsSaid(models)
  const what = namesSaid(lose.slice(0, 3), Math.max(0, lose.length - 3))
  const Who = who.charAt(0).toUpperCase() + who.slice(1)
  const one = models.length === 1
  if (verb === 'off') return `Switched on, ${who} would lose ${what}.`
  if (verb === 'warns')
    return `${Who} ${one ? 'keeps' : 'keep'} ${what}, with your because beside it.`
  return `${Who} ${one ? 'loses' : 'lose'} ${what}.`
}

function Count({
  known,
  value,
  of,
  what,
  strong,
}: {
  known: boolean
  value: number
  /** what it is counted out of; null where that is not known yet either */
  of: number | null
  what: string
  strong?: boolean
}) {
  return (
    <div
      className="hr-fig"
      data-n={known && of !== null ? `${value} of ${of}` : undefined}
      data-strong={strong && known && value > 0 ? '' : undefined}
    >
      <dt className="hr-fig__what">{what}</dt>
      <dd className="hr-fig__n">
        {known && of !== null ? (
          <>
            <Figure value={value} />
            <span className="hr-fig__of">{` of ${count(of)}`}</span>
          </>
        ) : (
          <span className="hr-fig__unknown">{of === null ? '—' : `— of ${count(of)}`}</span>
        )}
      </dd>
    </div>
  )
}

/* ---------------------------------------------------------- */
/* Looked for and not true                                     */
/* ---------------------------------------------------------- */

/**
 * THE RULES SOMEBODY MIGHT WRITE ABOUT WHAT GOES ON A BOAT, AND THE NUMBER THAT KILLS EACH
 * (judge.md, data round, minor 14: "the six refuted workbook candidates"), set quietly at the foot
 * so nobody proposes them again. They are the fitment pass's six (`F10`, `F11`): the others in
 * `WORKBOOK_RULES_REFUTED` are about the workbook's own slots and keys, not about what may be
 * sold with what. The adjudication's words, but one: "rows" is said "lines", the app's word for a
 * line of the price list (DECISIONS 2026-09-24, one naming rule). Closed, it is one line.
 */
const REFUTED = WORKBOOK_RULES_REFUTED.filter((r) => r.ref === 'F10' || r.ref === 'F11')

const linesSaid = (text: string): string => text.replace(/\brows\b/g, 'lines')

function Refuted() {
  /* A PRESS, NOT A <details>: a closed details keeps its words laid out unpainted, and the rulers
     read them as words under the pill at 1:1 */
  const [open, setOpen] = useState(false)
  return (
    <section className="hr-refuted" data-ground="plate" data-testid="refuted">
      <p className="hr-refuted__head">
        {`Looked for in your price list and not true: ${REFUTED.length} rules somebody might write about a trailer or a motor, each with the number that rules it out.`}
      </p>
      <div className="hr-refuted__act">
        <Button
          intent="quiet"
          size="sm"
          icon={open ? XIcon : ListChecksIcon}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="hr-refuted-list"
        >
          {open ? `Put the ${REFUTED.length} away` : `Show the ${REFUTED.length}`}
        </Button>
      </div>
      {open ? (
        <ul className="hr-refuted__list" id="hr-refuted-list">
          {REFUTED.map((r) => (
            <li key={r.candidate} className="hr-refuted__item">
              <p className="hr-refuted__said">{linesSaid(r.candidate)}</p>
              <p className="hr-refuted__why">{`Measured: ${linesSaid(r.measured)}.`}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

export type { PartnerKind }
