/* ============================================================
   EVERY WAY A QUOTE CHANGES, AS A COMMAND WITH ITS OWN WAY BACK.

   This is `features/quote/quotes.ts` with its registry, its
   localStorage and its React hooks taken away. What is left is the
   part that was always pure: twenty-five mutators, each of which
   already knew how to undo itself.

   WHAT THE OLD FILE WAS AND WHY IT COULD NOT STAY. It held the
   documents in module state and wrote them to localStorage, and its
   own header said why: "The project store has no `quotes` slice and
   `src/db/` has no quotes table, and neither file is this workflow's
   to edit." Both are now this build's to edit — `QuoteRepository`
   (`src/data/repository.ts`) is the quotes table and `src/state/
   quotes.ts` is the slice — so the storage half of that file is
   gone and the sentence that argued for it has expired. Quotes never
   touch localStorage here.

   WHAT DID NOT CHANGE, AND IS THE WHOLE VALUE OF THE PORT. Every
   body below is the body that shipped, with its reasoning kept
   verbatim. In particular the inverses: three of them were argued at
   length in the file they came from — the level change that restores
   five fields from a frozen copy rather than recomputing them, the
   line that comes back BY VALUE at the index it held, and the
   refinish that re-roots rather than restoring a snapshot so a line
   added in between survives. Those arguments are the reason the plan
   says port rather than rewrite.

   THE THREE THINGS THE SHAPE ADDS
   ─────────────────────────────────────────────────────────────
   1. THE INVERSE IS RETURNED RATHER THAN CLOSED OVER A TOAST. The
      old acts each built their own `say({act:{label:'Undo', onPick}})`
      and the file explained, at length, why they could not use the
      app's usual undo helper: "A TOAST WHOSE UNDO DOES NOT UNDO IS
      WORSE THAN NO TOAST", because the project store's history knows
      nothing about a quote. That reasoning is kept and the mechanism
      it describes is now the type: a command HANDS BACK its inverse,
      the store pushes it, and the toast is raised by whoever wants
      one. `src/domain` says no words about toasts.

   2. THE PER-DOCUMENT AUDIT. Every command mints a `QuoteEvent`
      naming what it did and what changed, by value. The original app
      had this audit and the first draft of this one owed it; it
      travels ON the document, so an export carries the history of
      the document it is the history of.

   3. THE DRAFT/ISSUED LINE IS ONE FUNCTION. It was `mutate` — "The
      DRAFT / ISSUED LINE IS ENFORCED HERE, ONCE, rather than in
      every screen. `mutate` refuses an edit to an issued quote
      instead of writing it and reverting it — which is what
      production did, while toasting 'Saved'." It is `apply` now, and
      the refusal is A SENTENCE RETURNED, never a throw and never a
      silently disabled control.
   ============================================================ */

import {
  type AdjustmentKind,
  type CatalogueCtx,
  type FrozenCustomer,
  type QuoteAdjustment,
  type QuoteChange,
  type QuoteChangeValue,
  type QuoteDef,
  type QuoteEvent,
  type QuoteEventKind,
  type QuoteLine,
} from '@/domain/model'
import { newId } from '@/domain/id'
import { mintFreeLine, mintQuoteFromView, refinishSubject, type PriceChange } from './freeze'
import { money, priceAtLevel, quoteLevelChoices, repricedAt } from './pricing'
import { issueBlockers, lineAmount } from './totals'

/* ---------------------------------------------------------- */
/* What a command is                                          */
/* ---------------------------------------------------------- */

/** What a command DID: the document it produces, the way back, the
 *  sentence a surface says, and the event the audit keeps. */
export interface Done {
  next: QuoteDef
  /** the exact way back, closed over the values it needs */
  inverse: QuoteCommand
  /** the sentence, in the words the old toasts used, kept verbatim so
   *  the audit and the screen never disagree about what happened */
  said: string
  event: QuoteEvent
}

/** Why a command did nothing.
 *
 *  `refused` IS A SENTENCE WHERE THERE IS ONE TO SAY AND '' WHERE
 *  NOTHING HAPPENED. The two are different states and a surface draws
 *  them differently: a refusal is printed where the act was attempted
 *  (DESIGN_PRINCIPLES rule 10), and "nothing happened" is silence —
 *  "NOTHING HAPPENED, SO NOTHING IS SAID. A note reporting a rung
 *  that was already the rung is a full stop with no act behind it." */
export interface Refused {
  refused: string
}

export type Outcome = Done | Refused

export const isDone = (o: Outcome): o is Done => 'next' in o

/** One change to one document. Given the document as it stands and
 *  the clock, it returns what it did or why it did nothing. It never
 *  throws and it never writes: `apply` below is the only place a
 *  document is replaced. */
export type QuoteCommand = (quote: QuoteDef, now: string) => Outcome

/** The line an issued quote holds, in one wording, said once.
 *
 *  It is the sentence the old `draftForUndo` said, verbatim. Reached
 *  by every command and every inverse, because the way back has to be
 *  refused on the same terms as the way forward — otherwise a person
 *  could undo their way into a document that had already been handed
 *  over. */
export const ISSUED_REFUSAL =
  'This quote has been given to the customer, so nothing can go back on it. Make a new version to change it.'

/**
 * THE ONE DOOR. Every edit that touches a number, a line or an
 * adjustment comes through here, and AN ISSUED QUOTE REFUSES ALL OF
 * THEM. The screens hide the controls as well; this is the line that
 * makes the hiding true.
 *
 * `by` is who, as the document prints it, when the session had a
 * name. It is stamped onto the event here rather than inside every
 * command, for the reason the old `createQuoteFromView` records about
 * `preparedBy`: three call sites agreeing about it by hand is three
 * chances to forget, which is exactly what happened there.
 */
export function apply(quote: QuoteDef, command: QuoteCommand, now: string, by?: string): Outcome {
  if (quote.state !== 'draft') return { refused: ISSUED_REFUSAL }
  const done = command(quote, now)
  if (!isDone(done)) return done

  const event: QuoteEvent = by ? { ...done.event, by } : done.event
  return {
    ...done,
    event,
    /* the id and the date it was made are the document's identity and
       cannot be moved by a command; `updatedAt` is stamped from the
       one clock this event was given */
    next: {
      ...done.next,
      id: quote.id,
      createdAt: quote.createdAt,
      updatedAt: now,
      /* NEVER EDITED AND NEVER TRIMMED: an issued quote's history is
         part of what was handed over */
      events: [...quote.events, event],
    },
  }
}

/* ---------------------------------------------------------- */
/* Writing an event                                           */
/* ---------------------------------------------------------- */

interface EventArgs {
  kind: QuoteEventKind
  at: string
  said: string
  changed?: QuoteChange[]
  lineId?: string
  adjustmentId?: string
}

const event = (args: EventArgs): QuoteEvent => ({
  id: newId(),
  kind: args.kind,
  at: args.at,
  said: args.said,
  ...(args.lineId ? { lineId: args.lineId } : {}),
  ...(args.adjustmentId ? { adjustmentId: args.adjustmentId } : {}),
  changed: args.changed ?? [],
})

const change = (path: string, from: QuoteChangeValue, to: QuoteChangeValue): QuoteChange => ({
  path,
  from,
  to,
})

/** A figure or a word on a line, for an event's `changed`. A line's
 *  own fields are all values already; this only narrows `undefined`
 *  to `null`, because an event records what the document HELD and
 *  "nothing" is a state a document can be in. */
const held = (v: string | number | boolean | undefined | null): QuoteChangeValue => v ?? null

/* ---------------------------------------------------------- */
/* The two sentences every line-shaped act shares             */
/* ---------------------------------------------------------- */

/** A note about a line NAMES THE AMOUNT — `CONFIGURATOR_PLAYBOOK.md`
 *  §"Applying a fix": *"Toast with UNDO, naming the item and the
 *  amount."* A line with no price says so in the screen's own words
 *  rather than printing $0, which is the one thing `totals.ts`
 *  exists to refuse.
 *
 *  IT IS STATIC TEXT. Rule: money never animates — this is a figure
 *  in a sentence about something that has already happened, never a
 *  total counting up, and the committed total on the price bar is
 *  not touched by it. */
function naming(line: QuoteLine, said: string): string {
  const { amount } = lineAmount(line)
  return amount === null ? `${said} · no price on it` : `${said} · ${money(amount)}`
}

/** Put one thing back where it was. The index is where it SAT, so a
 *  line removed from the middle of a step returns to the middle of it
 *  rather than to the end — the order of a quote is the order the
 *  salesperson put it in, and it is printed. */
function put_at<T>(items: readonly T[], item: T, index: number): T[] {
  const next = [...items]
  next.splice(index < 0 || index > next.length ? next.length : index, 0, item)
  return next
}

/** Nothing happened and nothing is owed. */
const NOTHING: Refused = { refused: '' }

/* ============================================================
   MINTING — a document coming into being is not a command.

   `mintQuoteFromView` and `newVersionOf` produce a NEW document
   rather than changing one, so neither has an inverse and neither
   goes through `apply`: there is nothing to refuse and nothing to
   put back. What they do carry is the first event, because a
   document with no history of how it began is a document whose
   audit starts in the middle.
   ============================================================ */

export interface Minted {
  quote: QuoteDef
  event: QuoteEvent
}

export interface MintArgs {
  viewId: string
  rowId: string
  reference: string
  levelKey?: string
  preparedBy?: string
}

/**
 * "Quote this one" — the whole of screen 2 → screen 3.
 *
 * THE PICK IS THE WRITE: the caller files the document before the
 * stage has drawn it. Returns null when the view or the row has
 * gone, so the caller can say so rather than open an empty document.
 */
export function mintQuote(ctx: CatalogueCtx, args: MintArgs): Minted | null {
  const quote = mintQuoteFromView(ctx, args)
  if (!quote) return null
  const said = `${quote.subjectLabel} — quote ${quote.reference}`
  return {
    quote,
    event: event({
      kind: 'minted',
      at: quote.createdAt,
      said,
      changed: [
        change('rootRowId', null, quote.rootRowId),
        change('levelKey', null, quote.levelKey),
      ],
    }),
  }
}

/**
 * "Make a new version" — the only action left on an issued quote.
 *
 * A copy in a fresh draft carrying `supersedesId`, so the
 * conversation has a history and neither document was edited behind
 * anyone's back. ONE link, deliberately, and not a chain model:
 * production's versioning module keys chains on a `rootQuoteId` that
 * nothing writes, and a chain model with no chain is not honest.
 *
 * THE HISTORY DOES NOT COME ACROSS. The new draft's audit starts
 * with its own 'versioned' event naming the document it supersedes;
 * copying the old events would make the new document claim things
 * that happened to another one.
 */
export function newVersionOf(from: QuoteDef, reference: string, now: string): Minted {
  const idMap = new Map<string, string>()
  const lines: QuoteLine[] = from.lines.map((l) => {
    const fresh = newId()
    idMap.set(l.id, fresh)
    return { ...l, id: fresh }
  })
  const copy: QuoteDef = {
    ...from,
    id: newId(),
    reference,
    state: 'draft',
    lines,
    sections: from.sections.map((s) => ({
      ...s,
      lineIds: s.lineIds.map((x) => idMap.get(x)).filter((x): x is string => x !== undefined),
    })),
    adjustments: from.adjustments.map((a) => ({ ...a, id: newId() })),
    events: [],
    supersedesId: from.id,
    createdAt: now,
    updatedAt: now,
  }
  delete copy.issuedAt
  return {
    quote: copy,
    event: event({
      kind: 'versioned',
      at: now,
      said: `A new version of ${from.reference}`,
      changed: [change('supersedesId', null, from.reference)],
    }),
  }
}

/* ============================================================
   THE LEVEL
   ============================================================ */

/* RE-PRICING ONE LINE IS `repricedAt` IN `pricing.ts` and is not
   written here. `conflict.ts` shows a person what a level change
   WOULD do to every line before they accept it, and a preview
   computed by a second copy of that arithmetic is a preview that can
   disagree with the act it is previewing. One function, called by
   both. */

/**
 * MOVE THE WHOLE QUOTE TO A RUNG — and DECISIONS.md §1's third
 * bullet: *"raise the toast after Accept too, so accepting a sheet
 * is as reversible as any other act."*
 *
 * WHAT THE UNDO PUTS BACK, and what it deliberately does not. A
 * level change touches exactly the five `PricedAt` fields on each
 * line, so the way back restores exactly those five FROM THE FROZEN
 * COPY taken before the write — the same by-value discipline
 * `removeLine` keeps, and the reason a rung with no column on some
 * table lands back on the column it really used rather than on a
 * recomputed guess.
 *
 * A line the person added while the note stood is NOT reverted and
 * is not left at the wrong rung either: it was never in the frozen
 * copy, so it is priced at the old rung through the same
 * `repricedAt` the forward pass used. An undo that threw away work
 * done after the act it undoes is a lie; this one only ever moves
 * the thing it moved.
 *
 * THE SENTENCE NAMES THE RUNG AND NOT A FIGURE. The item here is the
 * rung, in the business's own word — the one printed on the control
 * that was pressed. The amount is the whole total, it is already on
 * the price bar, and a note restating it is a second running total
 * that can disagree with the first.
 */
export const setLevel =
  (levelKey: string): QuoteCommand =>
  (quote, now) => {
    /* NOTHING HAPPENED, SO NOTHING IS SAID. `levelConflict` already
       returns null on this case; a note reporting a rung that was
       already the rung is a full stop with no act behind it. */
    if (quote.levelKey === levelKey) return NOTHING

    const wasKey = quote.levelKey
    const was = new Map(quote.lines.map((l) => [l.id, l]))
    /* THE WORD ON THE CONTROL THAT WAS PRESSED. `quoteLevelChoices`
       reads the quote's own frozen rungs — the same list the price bar
       draws its buttons from — so the note says "Trade" where the
       button said Trade. Read once, for both directions; a key the
       model has no title for falls back to the key rather than to a
       blank, because the business's vocabulary outranks ours. */
    const rungs = quoteLevelChoices(quote.lines)
    const named = (key: string): string => rungs.find((c) => c.key === key)?.label ?? key

    const next: QuoteDef = {
      ...quote,
      levelKey,
      lines: quote.lines.map((l) => repricedAt(l, levelKey)),
    }

    return {
      next,
      said: `Priced at ${named(levelKey)}`,
      event: event({
        kind: 'level-set',
        at: now,
        said: `Priced at ${named(levelKey)}`,
        changed: [change('levelKey', wasKey, levelKey)],
      }),
      inverse: (current, at) => {
        /* the rung may have moved again since — putting back a rung
           this act did not set would be undoing somebody else's step */
        if (current.levelKey !== levelKey) return NOTHING
        return {
          next: {
            ...current,
            levelKey: wasKey,
            lines: current.lines.map((l) => {
              const then = was.get(l.id)
              if (!then) return repricedAt(l, wasKey)
              return {
                ...l,
                unitPrice: then.unitPrice,
                priceFieldId: then.priceFieldId,
                priceColumnName: then.priceColumnName,
                levelKey: then.levelKey,
                levelResolved: then.levelResolved,
              }
            }),
          },
          said: `Priced at ${named(wasKey)} again`,
          event: event({
            kind: 'level-set',
            at,
            said: `Priced at ${named(wasKey)} again`,
            changed: [change('levelKey', levelKey, wasKey)],
          }),
          inverse: setLevel(levelKey),
        }
      },
    }
  }

/**
 * PRICE ONE LINE AT A DIFFERENT RUNG — and the way back.
 *
 * One line's own rung — `Sell inc Install (if appl.)` on a part,
 * `Warranty` on a hull. It SWITCHES which frozen number the line
 * charges and never adds a second one: `Sell` + `Labour ($)` is the
 * double-charge the whole price ladder exists to avoid.
 *
 * THE ASYMMETRY THIS CLOSES is the one `addLine` closed a wave
 * earlier, one level down. `setLevel` re-prices the WHOLE quote and
 * has toasted with an UNDO since it was written; this re-prices one
 * line and said nothing at all — so moving a motor from Sell to Trade
 * changed a figure a customer is about to be handed, silently, with
 * no way back but remembering which rung it had been on.
 *
 * THE NOTE NAMES THE RUNG IN THE BUSINESS'S OWN WORD, not the key:
 * the labels are read off the line's own levels, so a dealer who
 * calls it "Sub Dealer" reads "Sub Dealer".
 *
 * TYPING IS NOT A PICK, and `setQty` and the override field stay
 * silent for the store's own reason about `updateCell`: nothing about
 * a number you just typed is invisible a second later, and a toast per
 * keystroke is noise where a person is reading a total.
 */
export const setLineLevel =
  (lineId: string, levelKey: string): QuoteCommand =>
  (quote, now) => {
    const line = quote.lines.find((l) => l.id === lineId)
    if (!line) return NOTHING
    /* THE RUNG IT WAS ON, captured before the write. `levelResolved` is
       what the line is actually priced at — the quote's rung where the
       line has not been moved, its own where it has — so undoing puts
       back the price a person was looking at rather than the quote's. */
    const wasKey = line.levelResolved
    if (wasKey === levelKey) return NOTHING

    const label = (key: string): string => line.levels.find((l) => l.key === key)?.label ?? key

    const priced = (q: QuoteDef, key: string): QuoteDef => ({
      ...q,
      lines: q.lines.map((l) => (l.id === lineId ? { ...l, ...priceAtLevel(l.levels, key) } : l)),
    })

    const said = `${line.label} priced at ${label(levelKey)}`
    return {
      next: priced(quote, levelKey),
      said,
      event: event({
        kind: 'line-level-set',
        at: now,
        said,
        lineId,
        changed: [change(`lines.${lineId}.levelResolved`, wasKey, levelKey)],
      }),
      inverse: (current, at) => {
        /* the line may have gone since — putting a price back on a
           line that is off the quote would be writing to nothing */
        if (!current.lines.some((l) => l.id === lineId)) return NOTHING
        const back = `${line.label} is priced at ${label(wasKey)} again`
        return {
          next: priced(current, wasKey),
          said: back,
          event: event({
            kind: 'line-level-set',
            at,
            said: back,
            lineId,
            changed: [change(`lines.${lineId}.levelResolved`, levelKey, wasKey)],
          }),
          inverse: setLineLevel(lineId, levelKey),
        }
      },
    }
  }

/* ============================================================
   LINES
   ============================================================ */

/**
 * Put a minted line on the quote, in its section — AND THE WAY BACK.
 * The line arrives already frozen from `mintLine`, so nothing is
 * read here.
 *
 * THE ASYMMETRY THIS CLOSES, AND WHY IT IS THE ORDINARY CASE.
 * `removeLine` has toasted since it was written and this said
 * nothing at all: taking a motor off announced itself and offered a
 * way back, putting one on was silent. `DECISIONS.md` §1 names that
 * a defect and settles the rule it was on the wrong side of —
 * `CONFIGURATOR_PLAYBOOK.md:344-346`:
 *
 *   · **A sheet** when priced alternatives survive. The person is
 *     choosing, and a toast cannot hold a priced radio group — a
 *     note is read at a glance and a glance holds one decision.
 *     That is not a limitation to work around, it is the reason the
 *     rule splits at all.
 *   · **A toast with UNDO** when no alternative survives. There is
 *     nothing to choose, only something to reverse.
 *
 * EVERY ORDINARY PICK IS THE SECOND CASE TODAY, and that is a
 * measurement rather than a hope: no pick on this screen can
 * invalidate another line, `optionConflict` has no callers and
 * nothing on the seeded file emits a runnable rule, so a pick
 * removes nothing, offers no alternative, and has exactly one thing
 * that can be done about it — take it back off. The day a dealer
 * writes a rule that runs, the sheet is what that pick gets and this
 * note is what the sheet's Accept raises.
 *
 * THE INVERSE IS EXACT AND IT IS NOT `removeLine`. Removing the line
 * this call added restores the document as it stood, so the way back
 * is the raw write and not the neighbouring command — `removeLine`
 * would raise its own toast offering to undo the undo, and a note
 * that answers a note is two events a person did not cause.
 */
export const addLine =
  (blockId: string, line: QuoteLine): QuoteCommand =>
  (quote, now) => {
    const said = naming(line, `${line.label} put on the quote`)
    return {
      next: {
        ...quote,
        lines: [...quote.lines, line],
        sections: quote.sections.map((s) =>
          s.blockId === blockId ? { ...s, lineIds: [...s.lineIds, line.id] } : s,
        ),
      },
      said,
      event: event({
        kind: 'line-added',
        at: now,
        said,
        lineId: line.id,
        changed: [change(`lines.${line.id}.label`, null, line.label)],
      }),
      inverse: (current, at) => {
        /* ALREADY OFF — the person took it back by hand while the
           note stood. Nothing to do and nothing to say: `removeLine`
           has already said it. */
        if (!current.lines.some((l) => l.id === line.id)) return NOTHING
        const back = `${line.label} is off the quote again`
        return {
          next: {
            ...current,
            lines: current.lines.filter((l) => l.id !== line.id),
            sections: current.sections.map((s) => ({
              ...s,
              lineIds: s.lineIds.filter((x) => x !== line.id),
            })),
          },
          said: back,
          event: event({
            kind: 'line-removed',
            at,
            said: back,
            lineId: line.id,
            changed: [change(`lines.${line.id}.label`, line.label, null)],
          }),
          inverse: addLine(blockId, line),
        }
      },
    }
  }

/** A typed line — the workbook's own `Additional Dealer Options`
 *  (R136:Y151, eight of them). A label and an amount, and nothing
 *  computed: the workbook turns typed HOURS into money at MV!$D$2
 *  ($159/hr) and we do not have that rate, so we do not offer hours.
 *
 *  IT BELONGS TO NO BLOCK, so it lands at the foot of the last
 *  section rather than in a heading a person never made.
 *
 *  IT HAS THE SAME WAY BACK `addLine` HAS NOW. The old file gave it
 *  none and said why — "NO TOAST, AND THE REASON IS THAT NOTHING
 *  CALLS IT" — which was a fact about the screens of that build, not
 *  about the act. A command carries its inverse whether or not a
 *  surface draws one, and the sentence is the one `addLine` says. */
export const addFreeLine =
  (label: string, amount: number | null): QuoteCommand =>
  (quote, now) => {
    const line = mintFreeLine(label, amount, quote.levelKey)
    const last = quote.sections.length - 1
    const said = naming(line, `${line.label} put on the quote`)
    return {
      next: {
        ...quote,
        lines: [...quote.lines, line],
        sections: quote.sections.map((s, i) =>
          i === last ? { ...s, lineIds: [...s.lineIds, line.id] } : s,
        ),
      },
      said,
      event: event({
        kind: 'line-added',
        at: now,
        said,
        lineId: line.id,
        changed: [
          change(`lines.${line.id}.label`, null, line.label),
          change(`lines.${line.id}.unitPrice`, null, amount),
        ],
      }),
      inverse: (current, at) => {
        if (!current.lines.some((l) => l.id === line.id)) return NOTHING
        const back = `${line.label} is off the quote again`
        return {
          next: {
            ...current,
            lines: current.lines.filter((l) => l.id !== line.id),
            sections: current.sections.map((s) => ({
              ...s,
              lineIds: s.lineIds.filter((x) => x !== line.id),
            })),
          },
          said: back,
          event: event({
            kind: 'line-removed',
            at,
            said: back,
            lineId: line.id,
            changed: [change(`lines.${line.id}.label`, line.label, null)],
          }),
          /* the way back from the way back puts THIS line on, by
             value — re-minting would give it a new id and the undo
             stack would be pointing at a line that no longer exists */
          inverse: replaceLine(line, current.lines.length, last),
        }
      },
    }
  }

/**
 * Taking a line off, AND THE WAY BACK — rule 9, which asks that an
 * undoable act get a toast with UNDO rather than a dialog.
 *
 * IT COULD NOT BE UNDONE AT ALL BEFORE, AND NOTHING SAID SO. The
 * control is a 24px × on a card in the middle of a shelf of them, on
 * the screen a salesperson uses with a customer standing there, and
 * the only route back was to find the same row in the same list and
 * pick it again — which on a narrowed step whose search has since
 * been typed into is not one click.
 *
 * SO THE ACT CARRIES ITS OWN WAY BACK, and it is not a re-pick: the
 * line is put back BY VALUE, in the section it was on and at the
 * position it held, so the frozen number, the column it came from,
 * the level, the join's own facts and the provenance are the ones
 * that were there — never today's reading of them. That is the whole
 * invariant this feature is built on, and an undo that re-minted the
 * line would break it at the one moment a person is least able to
 * notice.
 *
 * IT NAMES THE AMOUNT, because `addLine` does. The two notes are
 * one act read in two directions and a salesperson who hears the
 * figure going on should hear it coming off; the playbook asks for
 * the item AND the amount on both.
 */
export const removeLine =
  (lineId: string): QuoteCommand =>
  (quote, now) => {
    const at = quote.lines.findIndex((l) => l.id === lineId)
    if (at < 0) return NOTHING
    const line = quote.lines[at]
    const section = quote.sections.find((s) => s.lineIds.includes(lineId))
    const where = section ? section.lineIds.indexOf(lineId) : -1

    const said = naming(line, `${line.label} taken off the quote`)
    return {
      next: {
        ...quote,
        lines: quote.lines.filter((l) => l.id !== lineId),
        sections: quote.sections.map((s) => ({
          ...s,
          lineIds: s.lineIds.filter((x) => x !== lineId),
        })),
      },
      said,
      event: event({
        kind: 'line-removed',
        at: now,
        said,
        lineId,
        changed: [change(`lines.${lineId}.label`, line.label, null)],
      }),
      inverse: replaceLine(line, at, where, section?.blockId),
    }
  }

/** The way back from taking a line off: the line itself, by value, at
 *  the index it held, in the section it was on. Named rather than
 *  written inline because two commands hand it back — `removeLine`
 *  and the inverse of `addFreeLine` — and one implementation is the
 *  only way the two can agree about where a line belongs. */
function replaceLine(line: QuoteLine, at: number, where: number, blockId?: string): QuoteCommand {
  return (current, stamp) => {
    /* ALREADY BACK — the person put it back by hand while the note
       stood, or a second undo is pointing at the same step */
    if (current.lines.some((l) => l.id === line.id)) return NOTHING
    const said = `${line.label} is back on the quote`
    return {
      next: {
        ...current,
        lines: put_at(current.lines, line, at),
        sections: current.sections.map((s) =>
          blockId !== undefined && s.blockId === blockId
            ? { ...s, lineIds: put_at(s.lineIds, line.id, where) }
            : s,
        ),
      },
      said,
      event: event({
        kind: 'line-added',
        at: stamp,
        said,
        lineId: line.id,
        changed: [change(`lines.${line.id}.label`, null, line.label)],
      }),
      inverse: removeLine(line.id),
    }
  }
}

/** Quantity has a workbook precedent — `MV!G23` multiplies trailer
 *  registration by `$M$54`. Zero and nonsense fall back to one: a
 *  line on a quote is at least one of something. */
export const setQty =
  (lineId: string, qty: number): QuoteCommand =>
  (quote, now) => {
    const line = quote.lines.find((l) => l.id === lineId)
    if (!line) return NOTHING
    const clean = Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 1
    if (clean === line.qty) return NOTHING
    const said = `${line.label} × ${clean}`
    return {
      next: {
        ...quote,
        lines: quote.lines.map((l) => (l.id === lineId ? { ...l, qty: clean } : l)),
      },
      said,
      event: event({
        kind: 'qty-set',
        at: now,
        said,
        lineId,
        changed: [change(`lines.${lineId}.qty`, line.qty, clean)],
      }),
      inverse: setQty(lineId, line.qty),
    }
  }

/**
 * An override NEVER overwrites `unitPrice`. It is written BESIDE the
 * frozen original with an optional reason, and the document prints
 * the original struck through next to it.
 *
 * This is production's one genuinely good pricing idea — a snapshot
 * carrying its pricing source plus the original figure, so an
 * auditor can compute the delta later without re-resolving anything
 * — and it is the same discipline as PairOrigin on a view and
 * BlockedValue on a constraint: THE REASON IS WRITTEN AT THE MOMENT
 * OF THE DECISION, never reconstructed afterwards.
 *
 * CLEARING IT IS ITS OWN EVENT KIND, because "somebody decided this
 * line is worth $2,000" and "somebody took that decision back" are
 * two different things to read in an audit a month later.
 */
export const setOverride =
  (lineId: string, price: number | undefined, reason: string | undefined): QuoteCommand =>
  (quote, now) => {
    const line = quote.lines.find((l) => l.id === lineId)
    if (!line) return NOTHING

    const wasPrice = line.overridePrice
    const wasReason = line.overrideReason
    const clearing = price === undefined || !Number.isFinite(price)
    const cleanReason = reason !== undefined && reason.trim() !== '' ? reason : undefined

    if (clearing && wasPrice === undefined) return NOTHING
    if (!clearing && wasPrice === price && wasReason === cleanReason) return NOTHING

    const lines = quote.lines.map((l) => {
      if (l.id !== lineId) return l
      const next = { ...l }
      if (clearing) {
        delete next.overridePrice
        delete next.overrideReason
        return next
      }
      next.overridePrice = price
      if (cleanReason !== undefined) next.overrideReason = cleanReason
      else delete next.overrideReason
      return next
    })

    const said = clearing
      ? `${line.label} is back at its own price`
      : `${line.label} priced at ${money(price)}`
    return {
      next: { ...quote, lines },
      said,
      event: event({
        kind: clearing ? 'override-cleared' : 'override-set',
        at: now,
        said,
        lineId,
        changed: [
          change(`lines.${lineId}.overridePrice`, held(wasPrice), held(clearing ? null : price)),
          change(
            `lines.${lineId}.overrideReason`,
            held(wasReason),
            held(clearing ? null : cleanReason),
          ),
        ],
      }),
      inverse: setOverride(lineId, wasPrice, wasReason),
    }
  }

/* ============================================================
   ADJUSTMENTS
   ============================================================ */

/** Which way each control signs what a person types. A discount, a
 *  rebate and a trade-in are CREDITS: asking a salesperson to
 *  remember a minus sign is asking to be silently wrong on the day
 *  they forget, and the workbook's own `Dealer Discount Given`
 *  (AB169) carries its instruction in the cell beside it for exactly
 *  that reason.
 *
 *  IT SIGNS WHAT A PERSON TYPES, and nothing else. An adjustment
 *  arriving from a FILE keeps the signed amount the file carries and
 *  is never re-signed here: re-deriving it would change a total on
 *  import, and a quote whose total moves because it crossed a file
 *  boundary is the one failure this whole feature exists to prevent.
 *  See `normAdjustments` in domain/io/envelope.ts. */
const SIGN: Record<AdjustmentKind, -1 | 1> = {
  discount: -1,
  rebate: -1,
  tradeIn: -1,
  line: 1,
}

/** What each control is called on the document, so an audit read a
 *  month later says "Discount added" and not "adjustment 3". */
const ADJUSTMENT_WORD: Record<AdjustmentKind, string> = {
  discount: 'Discount',
  rebate: 'Rebate',
  tradeIn: 'Trade-in',
  line: 'Line',
}

/**
 * A new adjustment row, with an EMPTY label and a zero amount.
 *
 * Nothing is pre-filled and nothing is suggested. The rebate names
 * and amounts live in `Boat Module` AB259/AB260 and `Motor Library`
 * BB23/BB54 and NEITHER is a column in our data; the workbook's own
 * campaign banner is a string in a cell, not a rule. So this is a
 * sentence a person may type, never a discount a program applies.
 *
 * THE ID IS MINTED BY THE CALLER, not inside the command, because
 * the caller needs it: the old `addAdjustment` returned the id so
 * the screen could put the caret in the new row's label. A command
 * returns an outcome, so the id goes in rather than coming out.
 */
export const addAdjustment =
  (kind: AdjustmentKind, adjustmentId: string = newId()): QuoteCommand =>
  (quote, now) => {
    const adj: QuoteAdjustment = { id: adjustmentId, kind, label: '', amount: 0 }
    const said = `${ADJUSTMENT_WORD[kind]} added`
    return {
      next: { ...quote, adjustments: [...quote.adjustments, adj] },
      said,
      event: event({
        kind: 'adjustment-added',
        at: now,
        said,
        adjustmentId: adj.id,
        changed: [change(`adjustments.${adj.id}.label`, null, '')],
      }),
      inverse: removeAdjustment(adj.id),
    }
  }

/** The label and the note. The AMOUNT is not patched here — it has
 *  its own entry point, because its sign is not the typist's
 *  business. */
export const updateAdjustment =
  (adjId: string, patch: Partial<Pick<QuoteAdjustment, 'label' | 'note'>>): QuoteCommand =>
  (quote, now) => {
    const adj = quote.adjustments.find((a) => a.id === adjId)
    if (!adj) return NOTHING
    const label = patch.label ?? adj.label
    const note = 'note' in patch ? patch.note : adj.note
    if (label === adj.label && note === adj.note) return NOTHING

    const said = `${ADJUSTMENT_WORD[adj.kind]} named`
    return {
      next: {
        ...quote,
        adjustments: quote.adjustments.map((a) => (a.id === adjId ? { ...a, ...patch } : a)),
      },
      said,
      event: event({
        kind: 'adjustment-changed',
        at: now,
        said,
        adjustmentId: adjId,
        changed: [
          change(`adjustments.${adjId}.label`, adj.label, label),
          change(`adjustments.${adjId}.note`, held(adj.note), held(note)),
        ],
      }),
      inverse: updateAdjustment(adjId, { label: adj.label, note: adj.note }),
    }
  }

/** What a person typed is a MAGNITUDE; the sign belongs to which
 *  control they pressed. "3000" on a discount is −$3,000 on the
 *  document and −$3,000 in the total, whichever way it was typed. */
export const setAdjustmentMagnitude =
  (adjId: string, magnitude: number): QuoteCommand =>
  (quote, now) => {
    const adj = quote.adjustments.find((a) => a.id === adjId)
    if (!adj) return NOTHING
    const amount = Number.isFinite(magnitude) ? Math.abs(magnitude) * SIGN[adj.kind] : 0
    if (amount === adj.amount) return NOTHING

    const said = `${ADJUSTMENT_WORD[adj.kind]} ${money(amount)}`
    return {
      next: {
        ...quote,
        adjustments: quote.adjustments.map((a) => (a.id === adjId ? { ...a, amount } : a)),
      },
      said,
      event: event({
        kind: 'adjustment-changed',
        at: now,
        said,
        adjustmentId: adjId,
        changed: [change(`adjustments.${adjId}.amount`, adj.amount, amount)],
      }),
      /* THE SIGN IS NOT RE-DERIVED ON THE WAY BACK. The amount it had
         is restored as the signed figure it was, because an
         adjustment that arrived from a file carries the file's own
         sign and re-signing it would move a total. */
      inverse: restoreAdjustmentAmount(adjId, adj.amount),
    }
  }

const restoreAdjustmentAmount =
  (adjId: string, amount: number): QuoteCommand =>
  (quote, now) => {
    const adj = quote.adjustments.find((a) => a.id === adjId)
    if (!adj || adj.amount === amount) return NOTHING
    const said = `${ADJUSTMENT_WORD[adj.kind]} ${money(amount)}`
    return {
      next: {
        ...quote,
        adjustments: quote.adjustments.map((a) => (a.id === adjId ? { ...a, amount } : a)),
      },
      said,
      event: event({
        kind: 'adjustment-changed',
        at: now,
        said,
        adjustmentId: adjId,
        changed: [change(`adjustments.${adjId}.amount`, adj.amount, amount)],
      }),
      inverse: restoreAdjustmentAmount(adjId, adj.amount),
    }
  }

export const removeAdjustment =
  (adjId: string): QuoteCommand =>
  (quote, now) => {
    const at = quote.adjustments.findIndex((a) => a.id === adjId)
    if (at < 0) return NOTHING
    const adj = quote.adjustments[at]
    const said = `${ADJUSTMENT_WORD[adj.kind]} taken off`
    return {
      next: { ...quote, adjustments: quote.adjustments.filter((a) => a.id !== adjId) },
      said,
      event: event({
        kind: 'adjustment-removed',
        at: now,
        said,
        adjustmentId: adjId,
        changed: [change(`adjustments.${adjId}.label`, adj.label, null)],
      }),
      /* BY VALUE AND AT ITS OWN INDEX, the same discipline a line
         keeps: an adjustment is a row on the printed document and its
         order is the order a person put it in */
      inverse: replaceAdjustment(adj, at),
    }
  }

const replaceAdjustment =
  (adj: QuoteAdjustment, at: number): QuoteCommand =>
  (quote, now) => {
    if (quote.adjustments.some((a) => a.id === adj.id)) return NOTHING
    const said = `${ADJUSTMENT_WORD[adj.kind]} is back`
    return {
      next: { ...quote, adjustments: put_at(quote.adjustments, adj, at) },
      said,
      event: event({
        kind: 'adjustment-added',
        at: now,
        said,
        adjustmentId: adj.id,
        changed: [change(`adjustments.${adj.id}.label`, null, adj.label)],
      }),
      inverse: removeAdjustment(adj.id),
    }
  }

/* ============================================================
   TODAY'S PRICES
   ============================================================ */

/**
 * Apply a diff a person has ALREADY SEEN.
 *
 * Two decisions, never one: `priceChanges` (freeze.ts) says what
 * would move, and this moves it. A silent restatement is worse than
 * a stale number, because the salesperson believes the page.
 *
 * THE WAY BACK IS THE FROZEN COPY, not a second read of the sheet.
 * The lines as they stood are captured here and restored whole, so
 * undoing "re-read today's prices" puts back the figures that were
 * on the document — which is the only thing "undo" can honestly mean
 * for an act whose forward direction was a fresh reading.
 */
export const applyPriceChanges =
  (changes: readonly PriceChange[]): QuoteCommand =>
  (quote, now) => {
    const byLine = new Map(changes.filter((c) => !c.gone).map((c) => [c.lineId, c]))
    if (byLine.size === 0) return NOTHING
    const touched = quote.lines.filter((l) => byLine.has(l.id))
    if (touched.length === 0) return NOTHING

    const said =
      touched.length === 1
        ? `${touched[0].label} at today's price`
        : `${touched.length} lines at today's prices`
    return {
      next: {
        ...quote,
        lines: quote.lines.map((l) => {
          const changeFor = byLine.get(l.id)
          if (!changeFor) return l
          return {
            ...l,
            levels: changeFor.levels,
            ...priceAtLevel(changeFor.levels, quote.levelKey),
          }
        }),
      },
      said,
      event: event({
        kind: 'prices-reread',
        at: now,
        said,
        changed: touched.map((l) =>
          change(`lines.${l.id}.unitPrice`, held(l.unitPrice), held(byLine.get(l.id)?.to ?? null)),
        ),
      }),
      inverse: restoreLines(touched),
    }
  }

/** Put a set of lines back exactly as they were, by value. A line
 *  that has since left the quote is left out rather than resurrected:
 *  an undo only ever moves the thing it moved. */
const restoreLines =
  (was: readonly QuoteLine[]): QuoteCommand =>
  (quote, now) => {
    const byId = new Map(was.map((l) => [l.id, l]))
    const present = quote.lines.filter((l) => byId.has(l.id))
    if (present.length === 0) return NOTHING
    const said =
      present.length === 1
        ? `${present[0].label} is back at the price it was`
        : `${present.length} lines are back at the prices they were`
    return {
      next: { ...quote, lines: quote.lines.map((l) => byId.get(l.id) ?? l) },
      said,
      event: event({
        kind: 'prices-reread',
        at: now,
        said,
        changed: present.map((l) =>
          change(`lines.${l.id}.unitPrice`, held(l.unitPrice), held(byId.get(l.id)?.unitPrice)),
        ),
      }),
      inverse: restoreLines(present),
    }
  }

/* ============================================================
   THE SUBJECT
   ============================================================ */

/* THE FINISH CHANGES; NOTHING ELSE DOES. Undoable, like every act
   that moves a line (rule 9), and the undo RE-ROOTS BACK rather
   than restoring a snapshot, so a line added in between survives. */
export const refinish =
  (ctx: CatalogueCtx, rowId: string): QuoteCommand =>
  (quote, now) => {
    const next = refinishSubject(ctx, quote, rowId)
    if (!next || next === quote) return NOTHING
    const wasRow = quote.rootRowId
    const wasLabel = quote.subjectLabel
    const said = `Now ${next.subjectLabel}`
    return {
      next,
      said,
      event: event({
        kind: 'subject-refinished',
        at: now,
        said,
        changed: [change('subjectLabel', wasLabel, next.subjectLabel)],
      }),
      inverse: (current, at) => {
        if (current.rootRowId !== rowId) return NOTHING
        const back = refinishSubject(ctx, current, wasRow)
        if (!back || back === current) return NOTHING
        return {
          next: back,
          said: `Back to ${wasLabel}`,
          event: event({
            kind: 'subject-refinished',
            at,
            said: `Back to ${wasLabel}`,
            changed: [change('subjectLabel', current.subjectLabel, wasLabel)],
          }),
          inverse: refinish(ctx, rowId),
        }
      },
    }
  }

/* ============================================================
   THE CUSTOMER
   ============================================================ */

/**
 * Address this quote to somebody in the register.
 *
 * ONE WRITE, BOTH HALVES. The details arrive already frozen from
 * `freezeCustomer` and are copied onto the document; the row id is
 * written beside them. Doing it in two patches would leave a frame
 * where a document carried one person's name and another's link.
 *
 * IT OVERWRITES WHAT WAS TYPED, and that is the intent: choosing a
 * customer is saying "this one", and a name half-typed underneath a
 * chosen customer is the ambiguity this control exists to end. What
 * it writes is still ordinary frozen text — the contact lines can be
 * edited on the quote afterwards without touching the register,
 * because they are this document's copy.
 */
export const linkCustomer =
  (frozen: Pick<QuoteDef, 'customer' | 'customerRef'>): QuoteCommand =>
  (quote, now) => {
    const was = { customer: quote.customer, customerRef: quote.customerRef }
    const said = frozen.customer.name === '' ? 'Nobody named yet' : `For ${frozen.customer.name}`
    const next: QuoteDef = { ...quote, customer: frozen.customer }
    if (frozen.customerRef) next.customerRef = frozen.customerRef
    else delete next.customerRef
    return {
      next,
      said,
      event: event({
        kind: 'customer-set',
        at: now,
        said,
        changed: [change('customer.name', was.customer.name, frozen.customer.name)],
      }),
      inverse: linkCustomer(was),
    }
  }

/** A name somebody typed, with no row behind it — which stays a
 *  legitimate way to write a quote: a walk-in is not a filing error.
 *  It goes through the same command as a picked customer because it
 *  is the same write; what it does NOT do is leave a pointer at a row
 *  this name did not come from. */
export const setCustomer = (customer: FrozenCustomer): QuoteCommand => linkCustomer({ customer })

/**
 * Stop this quote pointing at a row, and KEEP THE NAME.
 *
 * A walk-in who gave a name and no details is a real quote, and so
 * is a quote to somebody who has since been taken out of the
 * register. Both are "a name on a document with no row behind it",
 * which is what this app did for every quote before there was a
 * register at all. So unlinking is subtraction of a pointer and
 * nothing else: not one word of the document moves.
 */
export const unlinkCustomer = (): QuoteCommand => (quote, now) => {
  const was = quote.customerRef
  if (!was) return NOTHING
  const next = { ...quote }
  delete next.customerRef
  const said = `${quote.customer.name} is no longer linked to the register`
  return {
    next,
    said,
    event: event({
      kind: 'customer-unlinked',
      at: now,
      said,
      changed: [change('customerRef.rowId', was.rowId, null)],
    }),
    inverse: linkCustomer({ customer: quote.customer, customerRef: was }),
  }
}

/* ============================================================
   THE TYPED FIELDS

   The old `patchQuote` took a `Partial<QuoteDef>` and wrote whatever
   was in it, with one careful rule: "A key set to `undefined` REMOVES
   it, so clearing the tax rate leaves no rate rather than a zero:
   blank and 0% are different documents, and only one of them is
   honest about what we know." That rule is kept, one command per
   field, because `QuoteEventKind` is a CLOSED LIST and an audit
   entry reading "quote patched" is an audit entry nobody can search.

   TWO OF `patchQuote`'S KEYS HAVE NO COMMAND HERE, AND THAT IS
   DELIBERATE RATHER THAN AN OMISSION: `reference` and `organisation`
   have no event kind in the contract. `freeze.ts` says the reference
   is editable — "a business with its own scheme types it" — so one
   of the two is a real gap, and it is named here rather than closed
   by inventing a kind this port has no mandate to add.
   ============================================================ */

/** The validity sentence, typed. The workbook's own is a typed
 *  sentence on the sheet, not a computation. */
export const setNote =
  (note: string | undefined): QuoteCommand =>
  (quote, now) => {
    const clean = note !== undefined && note.trim() !== '' ? note : undefined
    if (clean === quote.note) return NOTHING
    const next = { ...quote }
    if (clean === undefined) delete next.note
    else next.note = clean
    const said = clean === undefined ? 'The terms are off this quote' : 'The terms are written'
    return {
      next,
      said,
      event: event({
        kind: 'note-set',
        at: now,
        said,
        changed: [change('note', held(quote.note), held(clean))],
      }),
      inverse: setNote(quote.note),
    }
  }

/** Typed by a person, as a percentage. Absent = the document prints
 *  the inclusive sentence and no ex-tax line. NEVER DEFAULTED: `1.1`
 *  hardcoded in seven production files while `organisation.
 *  gstPercentage` sat unread is the exact trap. */
export const setTaxRate =
  (rate: number | undefined): QuoteCommand =>
  (quote, now) => {
    const clean = rate !== undefined && Number.isFinite(rate) ? rate : undefined
    if (clean === quote.taxRate) return NOTHING
    const next = { ...quote }
    if (clean === undefined) delete next.taxRate
    else next.taxRate = clean
    const said = clean === undefined ? 'No tax rate on this quote' : `Tax at ${clean}%`
    return {
      next,
      said,
      event: event({
        kind: 'tax-rate-set',
        at: now,
        said,
        changed: [change('taxRate', held(quote.taxRate), held(clean))],
      }),
      inverse: setTaxRate(quote.taxRate),
    }
  }

/** A NAME AND NOT AN ID, because that is what a quote prints. The
 *  document freezes it, so a salesperson who leaves is still the
 *  person who wrote it. */
export const setPreparedBy =
  (name: string | undefined): QuoteCommand =>
  (quote, now) => {
    const clean = name !== undefined && name.trim() !== '' ? name.trim() : undefined
    if (clean === quote.preparedBy) return NOTHING
    const next = { ...quote }
    if (clean === undefined) delete next.preparedBy
    else next.preparedBy = clean
    const said = clean === undefined ? 'Nobody named as preparing it' : `Prepared by ${clean}`
    return {
      next,
      said,
      event: event({
        kind: 'prepared-by-set',
        at: now,
        said,
        changed: [change('preparedBy', held(quote.preparedBy), held(clean))],
      }),
      inverse: setPreparedBy(quote.preparedBy),
    }
  }

/* ============================================================
   ISSUING
   ============================================================ */

/** The way back from the one act that has none.
 *
 *  It is a COMMAND rather than an absent field, so every command has
 *  the same shape and a store never has to ask whether this one is
 *  special. It can only ever be reached by a caller that kept it; if
 *  one does, it answers with the same sentence `apply` would have —
 *  which is the whole point, because a control that silently does
 *  nothing is the failure rule 10 exists to prevent. */
const NO_WAY_BACK: QuoteCommand = () => ({ refused: ISSUED_REFUSAL })

/**
 * The moment it is given to a customer. Everything that makes a
 * number becomes read-only, and "re-read today's prices" is gone.
 * Nothing expires: the workbook's own validity is a typed sentence
 * on the sheet, and production's complete, correct expiry module
 * never fires because nothing writes the date it reads.
 *
 * IT REFUSES EVERYTHING THAT CANNOT BE REPAIRED AFTERWARDS, and the
 * list of those is `issueBlockers` in totals.ts — no customer name,
 * nothing on the document, a total of nought that nobody decided on,
 * and a line carrying a price somebody typed with no reason beside
 * it. Each is argued where it is written. The list is shared with the
 * screen so the button, the sentence under it and this command cannot
 * disagree about whether a given quote may go out.
 *
 * THE BLOCKERS COME BACK AS THE REFUSAL rather than as a false: the
 * old `issueQuote` returned a boolean and left the screen to print
 * the sentences separately, which is two places holding one answer.
 */
export const issue = (): QuoteCommand => (quote, now) => {
  const blockers = issueBlockers(quote)
  if (blockers.length > 0) return { refused: blockers.join(' ') }
  const said = `${quote.reference} is issued`
  return {
    next: { ...quote, state: 'issued', issuedAt: now },
    said,
    event: event({
      kind: 'issued',
      at: now,
      said,
      changed: [change('state', 'draft', 'issued')],
    }),
    inverse: NO_WAY_BACK,
  }
}
