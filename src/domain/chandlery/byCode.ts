/* ============================================================
   A PICTURE PLACED BY THE CODE ITS FILE NAME CARRIES — many at once,
   and never a guess (the judge of the chandlery, major 12, grafted
   from board C: "A file lands only on the part whose code its name
   carries, and anything else is refused with a sentence").

   2,041 of the 2,238 parts on sale have no picture. Northside's
   photographs are named the way the shop names the part — by its code
   ("SG002.jpg", "46070 front.png") — so a drop of many files can put
   each on its own part, measured:

     · A FILE NAME CARRIES A CODE when, letters and digits only and in
       capitals, its name before the extension IS the code, or begins
       with the code and then a space, a dash, a dot, an underscore or
       a bracket ("SG002-2.jpg", "SG002 (1).png"). The longest code
       that fits wins, so 46070 is not read as 4607.
     · A CODE SHORTER THAN THREE is never matched: "1.jpg" names
       nothing anybody could check.
     · A CODE MORE THAN ONE LINE CARRIES places nothing: the picture
       would be on a part nobody chose. 50 codes on the live list are
       carried twice or more.

   Anything else is refused with its sentence, and nothing is placed
   that the file's own name did not say.

   PURE: a file name and the lines in, a part or a sentence out.
   ============================================================ */

export interface Coded {
  id: string
  code: string
  /** the part as a person says it, for the sentence */
  name: string
}

export type CodeMatch<L extends Coded> =
  { ok: true; line: L; code: string } | { ok: false; why: string }

/** The shortest code a file name is matched by. */
export const CODE_MIN = 3

const bare = (s: string): string => s.toUpperCase().replace(/[^A-Z0-9]/g, '')

/** A file's name without its extension: "SG002.front.jpg" → "SG002.front". */
export const stemOf = (fileName: string): string =>
  fileName.trim().replace(/\.[A-Za-z0-9]{1,5}$/, '')

/** An index of the lines by their code, letters and digits only, built once for many files. */
export interface CodeBook<L extends Coded> {
  byCode: ReadonlyMap<string, L[]>
  /** the codes, longest first, for the begins-with reading */
  longestFirst: readonly string[]
}

export function codeBookOf<L extends Coded>(lines: readonly L[]): CodeBook<L> {
  const byCode = new Map<string, L[]>()
  for (const line of lines) {
    const code = bare(line.code)
    if (code.length < CODE_MIN) continue
    const run = byCode.get(code)
    if (run) run.push(line)
    else byCode.set(code, [line])
  }
  return {
    byCode,
    longestFirst: [...byCode.keys()].toSorted((a, b) => b.length - a.length || a.localeCompare(b)),
  }
}

/** THE PART A FILE NAME NAMES BY ITS CODE, or the sentence why there is none. */
export function matchByCode<L extends Coded>(fileName: string, book: CodeBook<L>): CodeMatch<L> {
  const name = fileName.trim()
  const stem = stemOf(name).toUpperCase()
  const whole = bare(stem)
  let code: string | null = book.byCode.has(whole) ? whole : null
  if (code === null) {
    for (const c of book.longestFirst) {
      /* the code, then a separator, read off the name as it was written */
      const at = beginsWith(stem, c)
      if (at) {
        code = c
        break
      }
    }
  }
  if (code === null)
    return {
      ok: false,
      why: `“${name}” names no part’s code, so it was not put on any part. Name the file by the part’s code, as SG002.jpg.`,
    }
  const lines = book.byCode.get(code) ?? []
  if (lines.length !== 1)
    return {
      ok: false,
      why: `“${name}” names the code ${code}, which ${lines.length} parts carry, so it was not put on any one of them. Add it on the part itself.`,
    }
  return { ok: true, line: lines[0]!, code }
}

/** Whether a name, read letter by letter with its separators, begins with the code and then stops
 *  at a separator. Separators inside the code itself ("GX1 6mm") are passed over. */
function beginsWith(stem: string, code: string): boolean {
  let i = 0
  let j = 0
  while (i < stem.length && j < code.length) {
    const ch = stem[i]!
    if (/[A-Z0-9]/.test(ch)) {
      if (ch !== code[j]) return false
      j += 1
    }
    i += 1
  }
  if (j < code.length) return false
  return i < stem.length && /[\s\-._()[\]]/.test(stem[i]!)
}
