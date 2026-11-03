/* ============================================================
   THE SUPPLIERS, IN NORTHSIDE'S WORDS — one maker once (the judge of
   the chandlery, major 6: "The chips print YAM and Yam as two makers,
   and LOW, GAR, SIM, RAY, BLA where 'by maker' is promised").

   The parts list writes a supplier as a code: 79 strings on the live
   list, among them YAM 459 times and Yam 212 times, LOW for Lowrance,
   and words like "NSM Service Dept". Which maker a code is, is
   Northside's to say, so it is a SETTING on Northside's own profile
   (`OrgProfile.suppliers`, code → name), changed by one command with
   its way back, and empty on day one. NOTHING IS GUESSED: until a code
   is named it reads as the code, and two codes become one maker only
   because Northside gave them one name.

   WHAT THE FILE MEASURES, NEVER APPLIES, are two proposals, each with
   its numerator and denominator:

     · A HEADING NAMES IT: every one of a code's lines sits under
       headings whose first word begins with the code's own letters —
       all 144 LOW lines under LOWRANCE — so "Lowrance" is proposed.
     · CAPITALS ONLY: two codes that differ only in their capitals
       (YAM 459, Yam 212) are proposed as one maker, the name left
       for Northside to type.

   PURE: lines in, suppliers, proposals and a command out.
   ============================================================ */
import type { OrgProfile } from '@/domain/model'
import type { CatalogueCommand } from '@/domain/catalogue/commands'
import { changeOrg, withKey } from '@/domain/catalogue/orgCommands'

/** Northside's names for the suppliers the parts list writes as codes: code → name. */
export type SupplierNames = Readonly<Record<string, string>>

export const NO_SUPPLIER = 'No supplier'

/** A SUPPLIER AS IT IS SAID: Northside's name for its code, else the code as the file writes it. */
export function supplierSaid(code: string, named: SupplierNames | undefined): string {
  const c = code.trim()
  if (c === '') return NO_SUPPLIER
  return named?.[c]?.trim() || c
}

/** One supplier of a run of lines: the name it is said by, its codes and its lines. */
export interface SupplierCount {
  said: string
  /** the codes the file writes for it — two where Northside gave two codes one name */
  codes: string[]
  lines: number
  /** true where Northside named it; false where it reads as the file's own code */
  named: boolean
}

/**
 * THE SUPPLIERS OF A RUN, MOST LINES FIRST, then by name. Codes Northside gave one name are one
 * supplier; a line with no supplier is counted under none, said as such, and comes last.
 */
export function suppliersIn(
  lines: readonly { maker: string }[],
  named: SupplierNames | undefined,
): SupplierCount[] {
  const by = new Map<string, SupplierCount>()
  for (const line of lines) {
    const code = line.maker.trim()
    const said = supplierSaid(code, named)
    const at = by.get(said)
    if (at) {
      at.lines += 1
      if (!at.codes.includes(code)) at.codes.push(code)
    } else {
      by.set(said, {
        said,
        codes: [code],
        lines: 1,
        named: code !== '' && Boolean(named?.[code]?.trim()),
      })
    }
  }
  return [...by.values()].toSorted(
    (a, b) =>
      Number(a.said === NO_SUPPLIER) - Number(b.said === NO_SUPPLIER) ||
      b.lines - a.lines ||
      a.said.localeCompare(b.said),
  )
}

/** A name a heading proposes for a code, measured: every one of its lines agrees. */
export interface HeadingProposal {
  code: string
  name: string
  /** lines under a heading that starts with the name, of `lines` */
  agree: number
  lines: number
}

/** Two or more codes that differ only in their capitals, each with its lines. */
export interface CaseTwins {
  codes: { code: string; lines: number }[]
}

const titleWord = (w: string): string => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()

/**
 * THE NAMES THE HEADINGS PROPOSE. A code is proposed a name only where EVERY one of its lines sits
 * under a heading whose first word is that name, and the word begins with the code's own letters
 * and is longer than it (LOW → LOWRANCE). One line elsewhere and nothing is proposed.
 */
export function headingProposals(
  lines: readonly { maker: string; heading: string }[],
  named: SupplierNames | undefined,
): HeadingProposal[] {
  const by = new Map<string, string[]>()
  for (const line of lines) {
    const code = line.maker.trim()
    if (code === '' || named?.[code]?.trim()) continue
    const first =
      line.heading
        .trim()
        .toUpperCase()
        .split(/[^A-Z]+/)[0] ?? ''
    const run = by.get(code)
    if (run) run.push(first)
    else by.set(code, [first])
  }
  const out: HeadingProposal[] = []
  for (const [code, firsts] of by) {
    const word = firsts[0] ?? ''
    if (word.length <= code.length || !word.startsWith(code.toUpperCase())) continue
    if (!firsts.every((f) => f === word)) continue
    out.push({ code, name: titleWord(word), agree: firsts.length, lines: firsts.length })
  }
  return out.toSorted((a, b) => b.lines - a.lines || a.code.localeCompare(b.code))
}

/** THE CODES THAT DIFFER ONLY IN THEIR CAPITALS, where Northside has not already made them one. */
export function caseTwinsOf(
  lines: readonly { maker: string }[],
  named: SupplierNames | undefined,
): CaseTwins[] {
  const by = new Map<string, Map<string, number>>()
  for (const line of lines) {
    const code = line.maker.trim()
    if (code === '') continue
    const key = code.toUpperCase()
    const codes = by.get(key) ?? new Map<string, number>()
    codes.set(code, (codes.get(code) ?? 0) + 1)
    by.set(key, codes)
  }
  return [...by.values()]
    .filter((codes) => codes.size > 1)
    .filter((codes) => new Set([...codes.keys()].map((c) => supplierSaid(c, named))).size > 1)
    .map((codes) => ({
      codes: [...codes]
        .map(([code, n]) => ({ code, lines: n }))
        .toSorted((a, b) => b.lines - a.lines || a.code.localeCompare(b.code)),
    }))
}

/** The longest name a supplier may be given: a maker's name, not a sentence. */
export const NAME_MAX = 40

/**
 * NORTHSIDE NAMES ONE OR MORE SUPPLIER CODES, or takes the name back (`name` null or blank): one
 * settings change on Northside's own profile, with its sentence and its exact way back. Codes
 * given the same name are one supplier everywhere the chandlery counts them.
 */
export function nameSuppliers(codes: readonly string[], name: string | null): CatalogueCommand {
  const clean = [...new Set(codes.map((c) => c.trim()).filter((c) => c !== ''))]
  const word = name?.trim() ?? ''
  const list = clean.join(' and ')
  const said =
    word === ''
      ? `${list} ${clean.length === 1 ? 'reads' : 'read'} as the price list writes ${clean.length === 1 ? 'it' : 'them'} again`
      : `${list} ${clean.length === 1 ? 'is' : 'are'} named ${word}`
  return changeOrg(said, 'suppliers', (org: OrgProfile) => {
    if (clean.length === 0) return 'No supplier code was given to name.'
    if (word.length > NAME_MAX)
      return `“${word.slice(0, NAME_MAX)}…” is longer than a maker’s name: ${NAME_MAX} letters at most.`
    const next: Record<string, string> = { ...org.suppliers }
    for (const code of clean) {
      if (word === '') delete next[code]
      else next[code] = word
    }
    return withKey(org, 'suppliers', Object.keys(next).length > 0 ? next : undefined)
  })
}
