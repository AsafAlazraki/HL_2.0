import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { motion } from 'motion/react'
import {
  ArrowCounterClockwiseIcon,
  CheckIcon,
  EyeIcon,
  FileTextIcon,
  NotePencilIcon,
  PauseCircleIcon,
  PlusIcon,
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
  type PairWord,
  type PairWorld,
  type PartnerKind,
} from '@/domain/rules/constraints/pairRules'
import { draftsARuleWouldHold } from '@/domain/quote/ruled'
import type { WorkbookRuleRef } from '@/domain/rules/constraints/workbookRules'
import type { ConstraintDef, QuoteDef } from '@/domain/model'
import {
  VERBS,
  VERB_DOES,
  VERB_WORD,
  alreadySaid,
  blankDraft,
  columnAt,
  costSaid,
  doesSaid,
  draftChanged,
  draftFromPriceList,
  draftMissing,
  draftOf,
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
  type Columns,
  type Draft,
  type Part,
  type StatedRule,
  type Verb,
  type YourRule,
} from './read'
import './rules.css'

/* ============================================================
   RULES — direction A, "The house rules", with board B's reach
   grafted into its margin (docs/directions/rules-boards/, judged
   2026-10-28). Where a dealer says what may be sold with what, in
   English, and sees it enforced.

   ONE PAGE NORTHSIDE COULD SIGN. The rules are grouped by what the
   customer is buying — Trailers, Motors, Rigging and pre-delivery —
   so a dealer knows where a new rule goes before writing it. Each
   part's clauses are numbered: the price list's own first, each with
   its measure off the file (581 of 581), then Northside's. Who said a
   clause is its EDGE: the price list's a blue hairline, Northside's
   solid ink, a pattern being said as Northside's ochre until it is
   added. What a Northside clause does is its VERB, set in the ink of
   its state and pressed open in place — refuses, warns about, is off —
   each with its consequence; an off clause reads "kept, not enforced"
   at full ink, never greyed.

   THE MARGIN holds two things only. Beside a part, what the price list
   was noticed doing that nobody wrote, boxed and never written into
   the text. Beside the clause being written, what it would do,
   counted before it is added: the figures, and the boats as marks,
   one line a maker, the models that lose a sale ringed and named.

   ONE ACT: "Add it as 2.4". It adds a refusing rule by default, so the
   milestone's sentence is one press: from the next pick, the build
   refuses what it refuses, with its because.

   Every write is a command through the catalogue store
   (`ruleCommands.ts`), so every one comes back from the toast's Undo.
   ============================================================ */

export interface RulesProps {
  /** which clause is open: a rule's id, a price-list rule's ref (`F7`), `new:motor`,
   *  `new:trailer`, or '' for none */
  open: string
  onOpen: (open: string) => void
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

/** The verb's word ink in the kit's `Select`: refuses is the file's blue, the build's own
 *  refusal ink; warns the build's "worth knowing"; off full ink, kept and never greyed. */
const VERB_INK = { refuses: 'file', warns: 'warn', off: 'full' } as const

const VERB_OPTIONS: SelectOption<Verb>[] = VERBS.map((v) => ({
  value: v,
  label: VERB_WORD[v],
  say: VERB_DOES[v],
}))

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

export function Rules({ open, onOpen, openTheFile }: RulesProps) {
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
      open={open}
      onOpen={onOpen}
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

function House({
  open,
  onOpen,
  world,
  rules,
  quotes,
  orgId,
}: {
  open: string
  onOpen: (open: string) => void
  world: PairWorld
  rules: readonly ConstraintDef[]
  quotes: readonly QuoteDef[]
  orgId: string
}) {
  const cols = useMemo(() => readColumns(world), [world])
  const yours = useMemo(() => yourRules(rules, world), [rules, world])
  const stated = useMemo(() => statedRules(cols), [cols])
  const book = useMemo(() => partsOf(stated, yours), [stated, yours])
  const sale = useMemo(
    () => ({ motor: onSale(world, 'motor'), trailer: onSale(world, 'trailer') }),
    [world],
  )
  const at = useMemo(() => resolve(open, yours, cols, world), [open, yours, cols, world])

  /* THE RULE JUST ADDED takes the focus where it now stands, so a keyboard is never dropped on
     the page's top when the clause it was writing becomes a rule */
  const [landed, setLanded] = useState('')
  /* ARRIVING ON A CLAUSE (`?open=` from the build's "See the rule") lands on it at once; a
     clause opened by a press on this page glides */
  const arrival = useRef(open !== '')

  const apply = useCallback((command: CatalogueCommand, after?: () => void) => {
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
    after?.()
  }, [])

  const setVerbOf = useCallback(
    (rule: ConstraintDef, verb: Verb) => apply(doRule(rule.id, verb)),
    [apply],
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
      </header>

      <div className="hr-sheet" data-ground="plate">
        {book.map((part) => (
          <PartView
            key={part.id}
            part={part}
            onSale={part.writes ? sale[part.writes] : null}
            at={at}
            open={open}
            onOpen={onOpen}
            world={world}
            cols={cols}
            yours={yours}
            quotes={quotes}
            orgId={orgId}
            apply={apply}
            setVerbOf={setVerbOf}
            landed={landed}
            onLanded={setLanded}
            arrival={arrival}
          />
        ))}
      </div>
    </main>
  )
}

/* ---------------------------------------------------------- */
/* One part: Trailers, Motors, Rigging and pre-delivery        */
/* ---------------------------------------------------------- */

interface PartProps {
  part: Part
  onSale: number | null
  at: Opened | null
  open: string
  onOpen: (open: string) => void
  world: PairWorld
  cols: Columns
  yours: YourRule[]
  quotes: readonly QuoteDef[]
  orgId: string
  apply: (command: CatalogueCommand, after?: () => void) => void
  setVerbOf: (rule: ConstraintDef, verb: Verb) => void
  landed: string
  onLanded: (id: string) => void
  arrival: { current: boolean }
}

function PartView(props: PartProps) {
  const { part, onSale: forSale, at, onOpen, cols, yours } = props
  const headId = `hr-part-${part.id}`
  /* the clause being written belongs to the part that writes its kind */
  const here = at !== null && part.writes === at.draft.partnerKind
  const openRule = here ? at.rule : null
  const writingNew = here && at.rule === null
  const noun = part.writes ? KIND_NOUN[part.writes] : null
  const fromRef = here ? at.draft.from : null
  /* THE NOTICED BOX STANDS BESIDE EVERY CLAUSE ABOVE THE ONE BEING WRITTEN, which takes the margin
     for its own count: so many rows of the part, and never the open clause's */
  const openAt = openRule ? part.yours.findIndex((y) => y.item.rule.id === openRule.id) : -1
  const beside = Math.max(
    1,
    openAt >= 0
      ? part.stated.length + openAt
      : part.stated.length + part.yours.length + (writingNew ? 0 : 1),
  )

  return (
    <section className="hr-part" aria-labelledby={headId} data-part={part.id}>
      <div className="hr-part__name">
        <span className="hr-part__n" aria-hidden="true">
          {part.n}
        </span>
        <h2 className="hr-part__title" id={headId}>
          <KindMark kind={part.mark} size="sm" />
          {part.name}
        </h2>
        {forSale !== null && noun ? (
          <p className="hr-part__sale">{`${count(forSale)} on sale`}</p>
        ) : null}
      </div>

      <div className="hr-clauses" data-noticed={part.noticed.length > 0 ? '' : undefined}>
        {part.stated.map(({ at: n, item }) => (
          <StatedClause key={item.ref} n={n} s={item} />
        ))}

        {part.noticed.length > 0 ? (
          <div className="hr-noticed-stack" style={{ '--beside': beside } as CSSProperties}>
            {part.noticed.map((s) => (
              <Noticed
                key={s.ref}
                s={s}
                next={part.next}
                said={alreadySaid(s.ref, yours, cols)}
                saidAs={saidAsOf(s.ref, part, cols)}
                open={fromRef === s.ref}
                onSay={() => onOpen(s.ref)}
              />
            ))}
          </div>
        ) : null}

        {part.yours.map(({ at: n, item }) =>
          openRule && openRule.id === item.rule.id && at ? (
            <OpenClause key={`open-${item.rule.id}`} {...props} at={at} n={n} />
          ) : (
            <YourClause
              key={item.rule.id}
              n={n}
              y={item}
              onRewrite={() => onOpen(item.rule.id)}
              onVerb={(v) => props.setVerbOf(item.rule, v)}
              /* ONCE THE CLAUSE IT WAS WRITTEN IN HAS CLOSED: measured while it still stood, the rule was
                 in sight, and the close then took 1,000px out above the eye at 390 */
              focus={props.landed === item.rule.id && at === null}
              onFocused={() => props.onLanded('')}
            />
          ),
        )}

        {writingNew && at ? (
          <OpenClause key={`open-${at.key}`} {...props} at={at} n={part.next} />
        ) : null}

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
            A rule here is written about a motor or a trailer, so this part is your price list’s
            alone.
          </p>
        ) : null}
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

function StatedClause({ n, s }: { n: string; s: StatedRule }) {
  return (
    <div className="hr-clause" data-owner="list" data-testid="stated-rule">
      <span className="hr-clause__n">{n}</span>
      <p className="hr-clause__said">{s.said}</p>
      {s.measure ? (
        <p
          className="hr-clause__measure"
          aria-label={`${s.under ? '' : 'Holds on '}${count(s.shown)} of ${count(s.measure.tested)} ${s.counted}`}
        >
          <span className="hr-held">
            <span className="hr-held__n">{count(s.shown)}</span>
            <span className="hr-held__of">{` of ${count(s.measure.tested)}`}</span>
          </span>
          <span className="hr-held__what">{s.counted}</span>
        </p>
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
}: {
  s: StatedRule
  next: string
  said: boolean
  saidAs: string
  open: boolean
  onSay: () => void
}) {
  return (
    <aside className="hr-noticed" aria-label="Noticed, not written" data-testid="noticed">
      <p className="hr-noticed__eyebrow">
        <Icon glyph={EyeIcon} />
        Noticed, not written
      </p>
      <p className="hr-noticed__said">{s.said}</p>
      <p className="hr-noticed__note">
        {s.measure
          ? `${s.under ? '' : 'It holds on '}${count(s.shown)} of ${count(s.measure.tested)} ${s.counted}. Nobody wrote it down, so the build does nothing with it.`
          : 'Nobody wrote it down, so the build does nothing with it.'}
      </p>
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
      ) : null}
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

function OpenClause(props: PartProps & { at: Opened; n: string }) {
  const { at, n, onOpen, world, cols, quotes, orgId, apply, onLanded, arrival } = props

  /* IT COMES INTO SIGHT WHEN IT OPENS, once per clause: on arrival from the build, at once */
  const self = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const instant = arrival.current
    arrival.current = false
    return intoSight(self.current, 'start', instant)
  }, [at.key, arrival])

  /* THE CLAUSE FOLLOWS THE ADDRESS: a new `?open=`, or the words of the rule it is on changed,
     starts the sentence again from what is filed — or from the words written here and not yet
     kept. React's own pattern for state that follows a prop, adjusted during the render */
  const [draft, setDraft] = useState<Draft>(() => UNKEPT.get(at.key) ?? at.draft)
  const [seen, setSeen] = useState(at.key)
  if (seen !== at.key) {
    setSeen(at.key)
    setDraft(UNKEPT.get(at.key) ?? at.draft)
  }

  /* WHAT IT DOES is the filed rule's own on a written rule — the verb at rest and here are one */
  const verb: Verb = at.rule ? ruleDoesNow(at.rule) : draft.verb
  const shape = useMemo(() => shapeOfDraft(draft, cols), [draft, cols])
  /* THE COUNT IS TAKEN ON THE SENTENCE, NOT ON ITS BECAUSE: typing a reason never recounts */
  const shapeKey = `${shape.boat.key}|${shape.boat.op}|${shape.boat.value}|${shape.partnerKind}|${shape.partner.key}|${shape.partner.op}|${shape.partner.value}`
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- counted on the sentence, by its key
  const reach = useMemo(() => pairReach(shape, world), [shapeKey, world])
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- drawn on the sentence, by its key
  const field = useMemo(() => pairField(shape, world), [shapeKey, world])
  const missing = draftMissing(draft, cols)
  const changed = at.rule ? draftChanged(draft, at.rule, world) : true

  /* THE DRAFTS IT WOULD HOLD, counted in src/domain (`draftsARuleWouldHold`), the give's reading */
  const standing = useMemo(
    () => draftsARuleWouldHold(world, quotes, missing ? null : ruleOfDraft(draft, cols, orgId, '')),
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- counted on the sentence, by its key
    [shapeKey, missing, quotes, world, cols, orgId],
  )

  const forget = useCallback(() => UNKEPT.delete(at.key), [at.key])
  const plateKey = at.key
  const set = (next: Partial<Draft>): void =>
    setDraft((d) => {
      const n2 = { ...d, ...next }
      UNKEPT.set(plateKey, n2)
      return n2
    })

  const close = useCallback(() => onOpen(''), [onOpen])

  const add = (): void => {
    if (missing) return
    const now = new Date().toISOString()
    if (at.rule) {
      const was = at.rule
      forget()
      apply(changeRule(ruleOfDraft({ ...draft, verb }, cols, orgId, now, was)), () => {
        onLanded(was.id)
        close()
      })
      return
    }
    const rule = ruleOfDraft(draft, cols, orgId, now)
    forget()
    apply(addRule(rule), () => {
      onLanded(rule.id)
      close()
    })
  }

  const remove = (): void => {
    if (!at.rule) return
    forget()
    apply(deleteRule(at.rule.id), close)
  }

  const putBack = (): void => {
    forget()
    setDraft(at.draft)
  }

  const setVerb = (next: Verb): void => {
    if (at.rule) apply(doRule(at.rule.id, next))
    else set({ verb: next })
  }

  const kind = draft.partnerKind
  const noun = KIND_NOUN[kind]
  const partnerCols = cols[kind]
  const boatCol = columnAt(cols.boat, draft.boatKey)
  const partnerCol = columnAt(partnerCols, draft.partnerKey)

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
  const line = verbLine(verb, noun.one, at.rule?.severity === 'warn' ? 'warn' : 'block')
  const owner = at.rule ? 'yours' : draft.from ? 'noticed' : 'yours'
  /* A WRITTEN RULE OPENS TO BE READ: "being rewritten" only once a word of it has changed, so a
     dealer who came from the build's "See the rule" is told what the rule is, not that it is
     being taken apart (built-critique-m3-2.md, minor) */
  const eyebrow = at.rule
    ? `Northside’s, written ${dayOf(at.rule.createdAt)}${changed ? ' · being rewritten' : ''}`
    : draft.from
      ? 'Noticed in your price list · being said as Northside’s'
      : 'Northside’s · being written'

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

        <div className="hr-open__act">
          {at.rule && !changed ? null : (
            <Button
              intent="act"
              icon={at.rule ? CheckIcon : PlusIcon}
              onClick={add}
              {...(missing ? { refusedBecause: missing } : {})}
            >
              {at.rule ? 'Keep the change' : `Add it as ${n}`}
            </Button>
          )}
          {at.rule && changed ? (
            <Button intent="quiet" size="sm" icon={ArrowCounterClockwiseIcon} onClick={putBack}>
              Put it back as it was
            </Button>
          ) : null}
          <Button intent="quiet" size="sm" icon={XIcon} onClick={close}>
            Close
          </Button>
          {/* THE KNIFE LAST, set apart: a dealer who came from the build's "See the rule" to read
            it is handed Close first, never "Delete 2.4" (built-critique-m3-2.md, minor) */}
          {at.rule ? (
            <span className="hr-open__drop">
              <Button intent="quiet" size="sm" icon={TrashIcon} onClick={remove}>
                {`Delete ${n}`}
              </Button>
            </span>
          ) : null}
        </div>
      </div>

      <Counting
        reach={reach}
        field={field}
        verb={verb}
        partnerName={partnerCol?.name ?? ''}
        standing={standingSaid(verb, standing.drafts, standing.carrying, noun.one)}
        filed={at.rule !== null}
      />
    </motion.div>
  )
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
  reach,
  field,
  verb,
  partnerName,
  standing,
  filed,
}: {
  reach: PairReach
  field: PairField
  verb: Verb
  partnerName: string
  standing: string
  filed: boolean
}) {
  const noun = KIND_NOUN[reach.kind]
  const losing = field.makers.filter((m) => m.losing > 0)
  /* THE SALE IT COSTS IS SAID ONCE: under the rings where a model loses one, or in one sentence
     where none does */
  const cost = losing.length > 0 && reach.ready ? '' : costSaid(reach, verb)
  const blank = field.blank
  return (
    <section
      className="hr-count"
      aria-label={filed ? 'Counted now' : 'Counted now, before it is added'}
      data-testid="census"
      data-kind={reach.kind}
    >
      <h3 className="hr-count__head">
        {filed ? 'Counted now' : 'Counted now, before it is added'}
      </h3>
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
          what={`${noun.many} ${doesSaid(verb)}${
            blank.length > 0
              ? `; ${blank.map((b) => `the ${count(b.count)} ${b.maker}`).join(' and ')} carry no ${partnerName}, so it says nothing of them`
              : ''
          }`}
        />
      </dl>

      <div className="hr-field" aria-label="The models it is about, one mark each">
        {field.makers.map((m) => (
          <div key={m.id} className="hr-field__maker" data-testid="field-maker">
            <p className="hr-field__name">
              <span>{m.maker}</span>
              <span className="hr-field__of">
                {/* before the condition is chosen nothing is "0 of 39": the maker's models, counted */}
                {reach.conditionReady
                  ? `${count(m.about)} of ${count(m.models.length)}`
                  : count(m.models.length)}
              </span>
            </p>
            <span className="hr-field__marks" aria-hidden="true">
              {m.models.map((x) => (
                <span
                  key={x.key}
                  className="hr-mark"
                  data-about={x.about ? '' : undefined}
                  data-loses={x.loses && reach.ready ? '' : undefined}
                />
              ))}
            </span>
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
        ))}
      </div>

      {cost === '' ? null : (
        <p className="hr-count__cost" data-testid="rule-cost">
          {cost}
        </p>
      )}
      {reach.ready ? <p className="hr-count__when">{standing}</p> : null}
    </section>
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

export type { PartnerKind }
