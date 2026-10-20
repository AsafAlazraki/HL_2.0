/* ============================================================
   WHAT A DRAFT STILL WANTS — asserted on quotes minted from the real
   file, never typed: the first hull whose walk has a motor chapter,
   read with its motor on, with it taken off, and once given.
   ============================================================ */
import { describe, expect, it } from 'vitest'
import type { QuoteDef } from '@/domain/model'
import { loadPack } from '@/test/fixtures/pack'
import { createViewFor } from '@/domain/catalogue/views'
import { mintQuoteFromView } from './freeze'
import { NO_MOTOR_YET, stillWanted } from './steps'

const pack = await loadPack()
const ctx = pack.ctx
const boats = pack.entities.filter((e) => e.kind === 'boat' && e.role !== 'join')

/** The first minted quote whose walk has a motor chapter with candidates curated for it. */
function withAMotorChapter(): QuoteDef {
  for (const boat of boats) {
    const view = createViewFor(ctx, boat.id)
    for (const row of (pack.rowsByEntity[boat.id] ?? []).slice(0, 12)) {
      const quote = mintQuoteFromView(ctx, { viewId: view.id, rowId: row.id, reference: 'T-1' })
      if (!quote) continue
      const motor = quote.chapters.find((c) => c.kind === 'motor')
      const section = quote.sections.find((s) => s.blockId === motor?.id)
      if (section && (section.pickedCount ?? 0) > 0) return quote
    }
  }
  throw new Error('no hull in the file has a motor chapter with candidates')
}

/** The same document with every line on its motor stops taken off. */
function withoutItsMotor(quote: QuoteDef): QuoteDef {
  const motorIds = new Set(quote.chapters.filter((c) => c.kind === 'motor').map((c) => c.id))
  const gone = new Set(
    quote.sections.filter((s) => motorIds.has(s.blockId)).flatMap((s) => s.lineIds),
  )
  return {
    ...quote,
    lines: quote.lines.filter((line) => !gone.has(line.id)),
    sections: quote.sections.map((s) => (motorIds.has(s.blockId) ? { ...s, lineIds: [] } : s)),
  }
}

describe('stillWanted', () => {
  const minted = withAMotorChapter()
  const bare = withoutItsMotor(minted)

  it('says the motor is still to choose on a draft whose motor stop waits', () => {
    expect(stillWanted(bare)).toBe(NO_MOTOR_YET)
  })

  it('says nothing once a motor is on the quote', () => {
    const motorStop = minted.chapters.find((c) => c.kind === 'motor')!.id
    const section = minted.sections.find((s) => s.blockId === motorStop)!
    if (section.lineIds.length === 0) {
      /* the mint put no motor on: lend the stop one line of the subject's to stand for a pick */
      const withOne = {
        ...bare,
        sections: bare.sections.map((s) =>
          s.blockId === motorStop ? { ...s, lineIds: [bare.lines[0]!.id] } : s,
        ),
      }
      expect(stillWanted(withOne)).toBeNull()
    } else {
      expect(stillWanted(minted)).toBeNull()
    }
  })

  it('asks nothing of a given quote, which takes no motor now', () => {
    expect(stillWanted({ ...bare, state: 'issued' })).toBeNull()
  })

  it('asks nothing of a walk with no motor chapter', () => {
    const noMotor = {
      ...bare,
      chapters: bare.chapters.filter((c) => c.kind !== 'motor'),
    }
    expect(stillWanted(noMotor)).toBeNull()
  })
})
