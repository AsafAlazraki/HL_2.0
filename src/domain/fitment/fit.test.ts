/* ============================================================
   DOES THE SENTENCE SAY THE RULE THE CANVAS DRAWS?

   UX_PASS §11's whole argument is that the fit rule is a sentence
   and the canvas is 8,534 lines of scaffolding around it. That
   argument is only worth anything if the sentence and the graph
   are the SAME RULE — so this suite reads the real seeded flows
   back as sentences, compiles the sentences back into `RuleDef`s,
   and runs both through the engine the app actually ships.

   THE FIVE THINGS IT PROVES:

     1 · §11's shape is the real shape. Both seeded flows are
         `start → match → output`, three nodes, two edges, and
         both read back as sentences.
     2 · The compile is lossless. `compileFit(readFit(r), r)` puts
         back the same node ids, the same positions, the same edge
         ids and the same configs — so saying the sentence never
         quietly rearranges somebody's canvas.
     3 · THE ANSWER IS THE SAME ANSWER. `runRule` over the
         recompiled rule returns pair-for-pair what it returns over
         the seeded one. This is a new authoring surface over an
         unchanged model, and this is the assertion that makes that
         sentence true rather than a claim.
     4 · It refuses rather than lies. A rule with a `condition`
         node, a loop, an action or a reference hop returns null
         and stays the canvas's business.
     5 · It will not be confidently wrong. §11's third fix, both
         halves: the default columns come off `displayFieldId`, and
         two columns wearing one word are named as a fault with the
         repair attached.
   ============================================================ */

import { describe, expect, it } from 'vitest'
import { loadPack } from '@/test/fixtures/pack'
import { newId } from '@/domain/id'
import { runRule } from '@/domain/rules/engine'
import { OUT_HANDLE, displayFieldOf } from '@/domain/model'
import type { Clause, EntityDef, RuleDef, RuleEdge, RuleNode, ViewColumn } from '@/domain/model'
import { makeCtx } from '@/domain/rules/constraints/describe'
import {
  addClause,
  compileFit,
  defaultFitColumns,
  describeFit,
  fitMissing,
  fitOps,
  fitTables,
  fitTrouble,
  isFit,
  readFit,
  removeClause,
  setClauseOp,
  setMatchEntity,
  setSourceEntity,
} from './fit'

/* ---------------------------------------------------------- */
/* The seed, once                                              */
/* ---------------------------------------------------------- */

/* ============================================================
   THE TWO FLOW RULES ARE NOT IN THE PACK, AND THAT IS ON PURPOSE.

   The pack carries tables and rows. The plan is explicit that the
   modules and the two seeded flow rules are NOT data — they are minted
   by app code from table keys — so `loadPack()` hands back no `rules`
   and there is nothing yet in HL_2.0 that mints them. Until that code
   lands, this suite mints them here, and every line below is copied
   verbatim from the old repo's own seed
   (`HL_Playground/src/demos/northside.ts`, `mkRule` and the two calls
   to it): the same root and target tables, the same single clause, the
   same output columns and labels, the same node positions, the same
   descriptions.

   NOTHING IS INVENTED AND NOTHING IS PINNED. The field ids are the
   pack's own — `<seed key>.<column key>`, the deterministic scheme the
   packer writes — so the pairs `runRule` returns below are measured
   against the real 588 Highfield variants, the real Yamaha library and
   the real NSM Custom trailer band. That is what makes §3's "the engine
   cannot tell the difference" an assertion about this seed rather than
   an agreement between two fixtures.

   WHEN THE APP CODE THAT MINTS THESE LANDS, this block is deleted and
   `rules` comes from it. The assertions do not change.
   ============================================================ */

const pack = await loadPack()
const entities: Record<string, EntityDef> = Object.fromEntries(pack.entities.map((e) => [e.id, e]))

/** A candidate column against a column of the row being walked. */
const clauseVsSource = (candidate: string, op: Clause['op'], source: string): Clause => ({
  id: newId(),
  left: { fieldId: candidate },
  op,
  right: { kind: 'field', path: { fieldId: source } },
})

/** A candidate column against a fixed word. The banner selector needs
 *  one: the boat's brand is the NAME OF ITS TABLE rather than a column
 *  on it, so a rule rooted on one brand's table can only name that
 *  brand as a literal. */
const clauseVsWord = (candidate: string, op: Clause['op'], word: string): Clause => ({
  id: newId(),
  left: { fieldId: candidate },
  op,
  right: { kind: 'literal', value: word },
})

const stamp = pack.manifest.packedAt

const mkRule = (
  name: string,
  description: string,
  rootEntityId: string,
  targetEntityId: string,
  clauses: Clause[],
  columns: ViewColumn[],
  label: string,
  y: number,
): RuleDef => {
  const start = newId()
  const match = newId()
  const output = newId()
  const nodes: RuleNode[] = [
    { id: start, kind: 'start', position: { x: 80, y }, config: {} },
    {
      id: match,
      kind: 'match',
      position: { x: 400, y },
      config: { targetEntityId, group: { combinator: 'AND', clauses }, emptyBehavior: 'skip' },
    },
    { id: output, kind: 'output', position: { x: 720, y }, config: { label, columns } },
  ]
  const edges: RuleEdge[] = [
    { id: newId(), source: start, target: match, sourceHandle: OUT_HANDLE },
    { id: newId(), source: match, target: output, sourceHandle: OUT_HANDLE },
  ]
  return {
    id: newId(),
    orgId: pack.ctx.orgId,
    name,
    description,
    rootEntityId,
    enabled: true,
    nodes,
    edges,
    createdAt: stamp,
    updatedAt: stamp,
  }
}

const seed = {
  entities: pack.entities,
  rowsByEntity: pack.rowsByEntity,
  rules: [
    mkRule(
      'Motor fitment — Highfield',
      'Offers every Yamaha at or below the hull’s Max HP — the ceiling the spec plate states. On your price file it offers 2,434 of the 2,519 Highfield × Yamaha pairings. Min HP is shown and never tested, and a plate reading “2 x 300 HP” is not one number: 76 twin-rig pairings are reported as not matching rather than quietly passed.',
      'boat_highfield',
      'mot_yamaha',
      [clauseVsSource('mot_yamaha.e', 'lte', 'boat_highfield.kw')],
      [
        { scope: 'source', fieldId: 'boat_highfield.c', label: 'Boat' },
        { scope: 'source', fieldId: 'boat_highfield.kv', label: 'Min HP' },
        { scope: 'source', fieldId: 'boat_highfield.kw', label: 'Max HP' },
        { scope: 'match', fieldId: 'mot_yamaha.c', label: 'Motor' },
        { scope: 'match', fieldId: 'mot_yamaha.e', label: 'HP Rating' },
        { scope: 'match', fieldId: 'mot_yamaha.f', label: 'Shaft Length' },
        { scope: 'match', fieldId: 'mot_yamaha.bf', label: 'Sell Price' },
      ],
      'Motors that fit',
      -420,
    ),
    mkRule(
      'Trailer fitment — Highfield',
      'Offers the trailers whose series banner names Highfield. It holds on all 581 pairings your price file writes and still leaves a hull only 12 of 434 trailers. It reaches 8 of those 12 — this rule searches one table, and Highfield’s twelve are split across NSM Custom and GFAB. ATM is shown and never tested.',
      'boat_highfield',
      'trl_nsmcustom',
      [clauseVsWord('trl_nsmcustom.series', 'contains', 'Highfield')],
      [
        { scope: 'source', fieldId: 'boat_highfield.c', label: 'Boat' },
        { scope: 'source', fieldId: 'boat_highfield.s', label: 'Boat Weight kg' },
        { scope: 'match', fieldId: 'trl_nsmcustom.series', label: 'Series' },
        { scope: 'match', fieldId: 'trl_nsmcustom.c', label: 'Trailer' },
        { scope: 'match', fieldId: 'trl_nsmcustom.k', label: 'ATM kg' },
        { scope: 'match', fieldId: 'trl_nsmcustom.ca', label: 'Sell inc Rego' },
      ],
      'Trailers built for Highfield',
      -900,
    ),
  ],
}

const ctx = makeCtx(entities, seed.rowsByEntity)
const runCtx = { entities, rowsByEntity: seed.rowsByEntity }

const byName = (name: string): RuleDef => {
  const rule = seed.rules.find((r) => r.name === name)
  if (!rule) throw new Error(`no seeded rule named ${name}`)
  return rule
}

const motors = byName('Motor fitment — Highfield')
const trailers = byName('Trailer fitment — Highfield')

/** Every pair a run produced, as a flat comparable list. */
const pairsOf = (rule: RuleDef): string[] =>
  Object.entries(runRule(rule, runCtx).views)
    .flatMap(([label, view]) =>
      view.rows.map((r) => `${label}|${r.sourceRowId}|${r.matchRowId ?? '-'}`),
    )
    .sort()

/* ---------------------------------------------------------- */
/* 1 · §11's measurement, re-taken on today's seed             */
/* ---------------------------------------------------------- */

describe('the shape §11 measured', () => {
  it('is still two flows, both start → match → output', () => {
    expect(seed.rules).toHaveLength(2)
    for (const rule of seed.rules) {
      expect(rule.nodes).toHaveLength(3)
      expect(rule.edges).toHaveLength(2)
      expect(rule.nodes.map((n) => n.kind).sort()).toEqual(['match', 'output', 'start'])
    }
  })

  it('uses none of the five node kinds the canvas exists for', () => {
    const kinds = seed.rules.flatMap((r) => r.nodes.map((n) => n.kind))
    for (const kind of ['condition', 'loop', 'filter', 'find', 'action']) {
      expect(kinds).not.toContain(kind)
    }
  })

  /* §11 wrote "comparison clauses in each: 2". Both rules carry ONE
     today — the motor rule tests Max HP and shows Min HP without
     testing it, which is exactly what its own description says. The
     figure is re-measured here rather than repeated, because a
     measurement copied forward is a claim, not a measurement. */
  it('carries one comparison in each, not the two §11 recorded', () => {
    expect(readFit(motors)?.clauses).toHaveLength(1)
    expect(readFit(trailers)?.clauses).toHaveLength(1)
  })

  it('reads both of them back as sentences', () => {
    expect(isFit(motors)).toBe(true)
    expect(isFit(trailers)).toBe(true)
  })
})

/* ---------------------------------------------------------- */
/* 2 · The compile puts back what it was given                 */
/* ---------------------------------------------------------- */

describe('compiling the sentence back into the rule', () => {
  it.each([
    ['Motor fitment — Highfield', motors],
    ['Trailer fitment — Highfield', trailers],
  ])('%s survives the round trip intact', (_name, rule) => {
    const draft = readFit(rule)
    expect(draft).not.toBeNull()
    if (!draft) return
    const back = compileFit(draft, rule)

    expect(back.rootEntityId).toBe(rule.rootEntityId)
    expect(back.nodes.map((n) => n.id).sort()).toEqual(rule.nodes.map((n) => n.id).sort())
    expect(back.edges.map((e) => e.id).sort()).toEqual(rule.edges.map((e) => e.id).sort())

    const same = (kind: RuleNode['kind']) => {
      const a = back.nodes.find((n) => n.kind === kind)
      const b = rule.nodes.find((n) => n.kind === kind)
      expect(a?.position).toEqual(b?.position)
      expect(a?.config).toEqual(b?.config)
    }
    same('start')
    same('match')
    same('output')
  })

  it('keeps a fresh rule linear when there is no base to keep', () => {
    const draft = readFit(motors)
    if (!draft) throw new Error('unreadable')
    const back = compileFit(draft)
    expect(back.nodes).toHaveLength(3)
    expect(back.edges).toHaveLength(2)
    expect(back.edges.every((e) => e.sourceHandle === OUT_HANDLE)).toBe(true)
    /* fresh ids, so it can be added BESIDE the rule it came from
       rather than silently overwriting its plates */
    const taken = new Set(motors.nodes.map((n) => n.id))
    expect(back.nodes.some((n) => taken.has(n.id))).toBe(false)
  })
})

/* ---------------------------------------------------------- */
/* 3 · The answer is the same answer                           */
/* ---------------------------------------------------------- */

describe('the engine cannot tell the difference', () => {
  it.each([
    ['Motor fitment — Highfield', motors],
    ['Trailer fitment — Highfield', trailers],
  ])('%s returns the same pairs after a round trip', (_name, rule) => {
    const draft = readFit(rule)
    if (!draft) throw new Error('unreadable')
    const rebuilt: RuleDef = { ...rule, ...compileFit(draft, rule) }

    const before = pairsOf(rule)
    const after = pairsOf(rebuilt)
    expect(after).toEqual(before)
    /* and it is a real number, not an empty agreement */
    expect(before.length).toBeGreaterThan(0)
  })

  /* THE FIGURES, MEASURED ON THIS SEED ON THIS RUN. They are here so
     the agreement above is visibly an agreement about something: the
     motor rule pairs 588 Highfield variants with 32,000 Yamahas, the
     trailer rule with 4,704 NSM Custom trailers. Both run under
     MAX_PAIR_STEPS (500,000), so neither figure is a cap. */
  it('is pairing 32,000 and 4,704 rows off 588 Highfield variants', () => {
    expect(pairsOf(motors)).toHaveLength(32_000)
    expect(pairsOf(trailers)).toHaveLength(4_704)
    expect(seed.rowsByEntity[motors.rootEntityId]).toHaveLength(588)
  })
})

/* ---------------------------------------------------------- */
/* 4 · It refuses rather than lies                             */
/* ---------------------------------------------------------- */

describe('what the sentence will not claim to say', () => {
  const nodeIdOf = (rule: RuleDef, kind: RuleNode['kind']): string => {
    const n = rule.nodes.find((x) => x.kind === kind)
    if (!n) throw new Error(`no ${kind}`)
    return n.id
  }

  it('refuses a rule that branches', () => {
    const branchy: RuleDef = {
      ...motors,
      nodes: [
        ...motors.nodes,
        {
          id: 'cond',
          kind: 'condition',
          position: { x: 0, y: 0 },
          config: { branches: [] },
        },
      ],
    }
    expect(readFit(branchy)).toBeNull()
  })

  it('refuses a rule with an extra edge', () => {
    const extra: RuleDef = {
      ...motors,
      edges: [
        ...motors.edges,
        {
          id: 'x',
          source: nodeIdOf(motors, 'start'),
          target: nodeIdOf(motors, 'output'),
          sourceHandle: OUT_HANDLE,
        },
      ],
    }
    expect(readFit(extra)).toBeNull()
  })

  it('refuses a comparison that hops through a reference', () => {
    const hopped: RuleDef = {
      ...motors,
      nodes: motors.nodes.map((n) =>
        n.kind === 'match'
          ? {
              ...n,
              config: {
                ...n.config,
                group: {
                  combinator: 'AND' as const,
                  clauses: n.config.group.clauses.map((c) => ({
                    ...c,
                    left: { viaFieldId: 'via', fieldId: c.left.fieldId },
                  })),
                },
              },
            }
          : n,
      ),
    }
    expect(readFit(hopped)).toBeNull()
  })
})

/* ---------------------------------------------------------- */
/* 5 · It will not be confidently wrong                        */
/* ---------------------------------------------------------- */

describe('the answer names both sides', () => {
  const source = entities[motors.rootEntityId]
  const matchId = (() => {
    const n = motors.nodes.find((x) => x.kind === 'match')
    if (!n || n.kind !== 'match') throw new Error('no match node')
    return n.config.targetEntityId
  })()
  const match = entities[matchId]

  it('takes the display column, not whatever sorts first', () => {
    const cols = defaultFitColumns(source, match, [])
    expect(cols[0]?.fieldId).toBe(displayFieldOf(source)?.id)
    expect(cols[1]?.fieldId).toBe(displayFieldOf(match)?.id)
    /* and the display column is NOT the first column on either table,
       which is what makes the distinction worth drawing */
    expect(displayFieldOf(source)?.id).not.toBe(source.fields[0]?.id)
  })

  it('names two columns wearing one word, and offers the repair', () => {
    const draft = readFit(motors)
    if (!draft) throw new Error('unreadable')
    const clashing = {
      ...draft,
      columns: [
        { scope: 'source' as const, fieldId: source.fields[2].id, label: 'Series' },
        { scope: 'match' as const, fieldId: match.fields[2].id, label: 'Series' },
      ],
    }
    const trouble = fitTrouble(ctx, clashing)
    expect(trouble).not.toBeNull()
    expect(trouble?.word).toBe('Series')
    expect(trouble?.says).toContain('which side it is about')
    expect(trouble?.fix).not.toBeNull()
    /* the repair is the two display columns, and it clears the fault */
    const repaired = { ...clashing, columns: trouble?.fix?.columns ?? [] }
    expect(fitTrouble(ctx, repaired)).toBeNull()
  })

  it('says nothing when the two sides are already distinct', () => {
    const draft = readFit(motors)
    if (!draft) throw new Error('unreadable')
    expect(fitTrouble(ctx, draft)).toBeNull()
  })
})

/* ---------------------------------------------------------- */
/* The words, and the editing of them                          */
/* ---------------------------------------------------------- */

describe('the sentence', () => {
  it('reads as the rule, in the dealer’s own nouns', () => {
    const draft = readFit(motors)
    if (!draft) throw new Error('unreadable')
    const sentence = describeFit(ctx, draft)
    expect(sentence).toContain('For every Highfield Inflatables boat,')
    expect(sentence).toContain('find the Yamaha Outboards motors where')
    expect(sentence).toContain('is at most')
    expect(sentence).toContain("the boat's")
  })

  /* THE NOUN THE TABLE HAS ALREADY SAID. Gluing the kind's plural to
     the table's name gives "NSM Custom Trailers trailers", which is
     what happens when a sentence is assembled without looking at the
     words already in it. 'Yamaha Outboards' keeps "motors" because
     its name never says one. */
  it('does not say the noun the table name already says', () => {
    const trailerFit = readFit(trailers)
    if (!trailerFit) throw new Error('unreadable')
    const sentence = describeFit(ctx, trailerFit)
    expect(sentence).toContain('find the NSM Custom Trailers where')
    expect(sentence).not.toContain('Trailers trailers')
    expect(sentence).toContain('Series contains the value Highfield')

    const motorFit = readFit(motors)
    if (!motorFit) throw new Error('unreadable')
    expect(describeFit(ctx, motorFit)).toContain('find the Yamaha Outboards motors where')
  })

  it('is finished, because the seed wrote a finished rule', () => {
    const draft = readFit(motors)
    if (!draft) throw new Error('unreadable')
    expect(fitMissing(ctx, draft)).toBeNull()
  })

  it('says which word is unanswered when a comparison is added', () => {
    const draft = readFit(motors)
    if (!draft) throw new Error('unreadable')
    const missing = fitMissing(ctx, addClause(draft))
    expect(missing?.says).toBe('Pick the column this comparison is about.')
  })

  it('will not remove the only comparison left', () => {
    const draft = readFit(motors)
    if (!draft) throw new Error('unreadable')
    expect(removeClause(draft, draft.clauses[0].id).clauses).toHaveLength(1)
    const two = addClause(draft)
    expect(removeClause(two, two.clauses[1].id).clauses).toHaveLength(1)
  })

  it('strands what a retarget invalidates instead of substituting', () => {
    const draft = readFit(motors)
    if (!draft) throw new Error('unreadable')
    const other = fitTables(ctx).find((e) => e.id !== draft.sourceEntityId)
    if (!other) throw new Error('one table only')
    const moved = setSourceEntity(ctx, draft, other.id)
    /* the comparison used to name a column on the old table; it is
       now an open question rather than a column nobody chose */
    expect(moved.clauses.every((c) => c.right.k !== 'source')).toBe(true)
  })

  it('starts the search side over when the table it searches changes', () => {
    const draft = readFit(motors)
    if (!draft) throw new Error('unreadable')
    const other = fitTables(ctx).find((e) => e.id !== draft.matchEntityId)
    if (!other) throw new Error('one table only')
    const moved = setMatchEntity(ctx, draft, other.id)
    expect(moved.clauses).toHaveLength(1)
    expect(moved.clauses[0].matchFieldId).toBe('')
    expect(moved.label).toBe(`${other.name} that fit`)
  })

  it('drops the right-hand side when the verb stops needing one', () => {
    const draft = readFit(motors)
    if (!draft) throw new Error('unreadable')
    const unary = setClauseOp(draft, draft.clauses[0].id, 'notEmpty')
    expect(unary.clauses[0].right.k).toBe('none')
    const back = setClauseOp(unary, draft.clauses[0].id, 'lte')
    expect(back.clauses[0].right.k).toBe('word')
  })

  it('never offers “is one of”, which this model cannot hold', () => {
    for (const control of ['choice', 'boolean', 'number', 'date', 'text'] as const) {
      expect(fitOps({ control, options: ['a', 'b'] })).not.toContain('oneOf')
    }
  })
})
