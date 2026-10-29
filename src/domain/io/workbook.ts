/* ============================================================
   io/workbook — AN EXCEL WORKBOOK, READ AS THE LINES IT CARRIES.

   WHY THIS EXISTS (Milestone 4, the shelf). Northside's Master Price
   File arrives the way its suppliers re-issue it: as `.xlsx`
   workbooks — `Parts Module (2).xlsx`, the Boat Module, the Motor
   Module. Until this file the app could read a `.csv` a person had
   saved one sheet at a time, which is the re-keying the shelf exists
   to retire. A workbook is a zip of XML, both of which are text and
   arithmetic, so it is read here, purely, with no library.

   WHAT IT READS, AND WHAT IT LEAVES ALONE. Only the cached value of
   each cell — the figure Excel last worked out, which is what the
   dealer saw when the file was saved. Formulas are not re-run,
   styles are not read, pictures and the external links a workbook
   carries (90 MB of them in Parts Module (2)) are never inflated:
   the caller names the sheets it wants and nothing else is opened.

   THE ONE THING IT CANNOT DO ITSELF is inflate a compressed entry.
   That is a stream the browser and Node both provide
   (`DecompressionStream('deflate-raw')`), so it is handed in, and a
   suite hands in Node's own. Everything else — the zip's directory,
   the workbook's list of sheets, the shared strings and every cell —
   is read here from bytes and text.

   Pure: no DOM, no store. `TextDecoder` is the language's own.
   ============================================================ */

/** One file inside the workbook's zip, as its directory lists it. */
export interface ZipEntry {
  name: string
  /** 0 stored, 8 deflated — the two a workbook uses */
  method: number
  compressedSize: number
  size: number
  /** where its local header starts */
  offset: number
}

/** Inflate one deflated entry. The browser's stream or Node's zlib. */
export type Inflate = (raw: Uint8Array) => Promise<Uint8Array>

/** One line of a sheet: its row number as Excel prints it, and its
 *  cells as text by column, `cells[0]` being column A. */
export interface SheetLine {
  at: number
  cells: string[]
}

export interface WorkbookSheet {
  name: string
  lines: SheetLine[]
}

export interface Workbook {
  /** every sheet the workbook names, in its own order */
  names: string[]
  /** the sheets that were asked for and found, read */
  sheets: WorkbookSheet[]
}

/** Why a file could not be read as a workbook, as the person is told. */
export class WorkbookRefusal extends Error {}

const NOT_A_WORKBOOK =
  'That file is not an Excel workbook (.xlsx). Save it from Excel as a workbook and bring it in again.'

/* ------------------------------------------------------------ */
/* the zip                                                       */
/* ------------------------------------------------------------ */

const u16 = (b: Uint8Array, at: number): number => b[at] | (b[at + 1] << 8)
const u32 = (b: Uint8Array, at: number): number =>
  (b[at] | (b[at + 1] << 8) | (b[at + 2] << 16) | (b[at + 3] << 24)) >>> 0

const utf8 = new TextDecoder('utf-8')

/** The zip's own directory, read from its end. */
export function zipDirectory(bytes: Uint8Array): ZipEntry[] {
  /* the end record is the last 22 bytes plus a comment of up to 64 KB */
  let end = -1
  const floor = Math.max(0, bytes.length - 22 - 0xffff)
  for (let i = bytes.length - 22; i >= floor; i -= 1) {
    if (u32(bytes, i) === 0x06054b50) {
      end = i
      break
    }
  }
  if (end < 0) throw new WorkbookRefusal(NOT_A_WORKBOOK)
  const count = u16(bytes, end + 10)
  let at = u32(bytes, end + 16)
  const entries: ZipEntry[] = []
  for (let k = 0; k < count; k += 1) {
    if (u32(bytes, at) !== 0x02014b50) throw new WorkbookRefusal(NOT_A_WORKBOOK)
    const nameLength = u16(bytes, at + 28)
    const extraLength = u16(bytes, at + 30)
    const commentLength = u16(bytes, at + 32)
    const compressedSize = u32(bytes, at + 20)
    const size = u32(bytes, at + 24)
    const offset = u32(bytes, at + 42)
    if (compressedSize === 0xffffffff || size === 0xffffffff || offset === 0xffffffff) {
      throw new WorkbookRefusal(
        'That workbook is larger than four gigabytes inside, which a price file never is. Check it is the right file.',
      )
    }
    entries.push({
      name: utf8.decode(bytes.subarray(at + 46, at + 46 + nameLength)),
      method: u16(bytes, at + 10),
      compressedSize,
      size,
      offset,
    })
    at += 46 + nameLength + extraLength + commentLength
  }
  return entries
}

/** One entry's bytes, inflated when it was deflated. */
export async function entryBytes(
  bytes: Uint8Array,
  entry: ZipEntry,
  inflate: Inflate,
): Promise<Uint8Array> {
  const at = entry.offset
  if (u32(bytes, at) !== 0x04034b50) throw new WorkbookRefusal(NOT_A_WORKBOOK)
  const start = at + 30 + u16(bytes, at + 26) + u16(bytes, at + 28)
  const raw = bytes.subarray(start, start + entry.compressedSize)
  if (entry.method === 0) return raw
  if (entry.method === 8) return inflate(raw)
  throw new WorkbookRefusal(
    `Part of that workbook is packed a way Excel does not use (method ${entry.method}), so it cannot be read.`,
  )
}

/* ------------------------------------------------------------ */
/* the XML                                                       */
/* ------------------------------------------------------------ */

/** XML's five entities, its numbered ones, and Excel's own `_x000D_`. */
export function unescapeXml(text: string): string {
  return text
    .replace(/&(?:#(\d+)|#x([0-9a-f]+)|(amp|lt|gt|quot|apos));/gi, (_m, dec, hex, word) => {
      if (dec) return String.fromCodePoint(Number(dec))
      if (hex) return String.fromCodePoint(parseInt(hex as string, 16))
      return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[
        (word as string).toLowerCase() as 'amp'
      ]
    })
    .replace(/_x([0-9A-F]{4})_/g, (_m, hex) => String.fromCharCode(parseInt(hex as string, 16)))
}

/** A tag's attributes, by name — prefixes kept, `r:id` stays `r:id`. */
function attrsOf(tag: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of tag.matchAll(/([\w:.-]+)\s*=\s*"([^"]*)"/g)) out[m[1]] = unescapeXml(m[2])
  return out
}

/** The text of every `<t>` in a run of rich text, phonetic guides left out. */
function textOf(xml: string): string {
  const plain = xml.replace(/<rPh\b[\s\S]*?<\/rPh>/g, '')
  let out = ''
  for (const m of plain.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)) out += m[1]
  return unescapeXml(out)
}

/** The workbook's sheets, by name, with the relationship id each is filed under. */
export function sheetsOfWorkbook(xml: string): { name: string; rid: string }[] {
  const out: { name: string; rid: string }[] = []
  for (const m of xml.matchAll(/<sheet\b([^>]*)\/?>/g)) {
    const a = attrsOf(m[1])
    const rid = a['r:id'] ?? Object.entries(a).find(([k]) => k.endsWith(':id'))?.[1]
    if (a.name && rid) out.push({ name: a.name, rid })
  }
  return out
}

/** Relationship id → the part it points at, resolved against `xl/`. */
export function targetsOf(relsXml: string): Map<string, string> {
  const out = new Map<string, string>()
  for (const m of relsXml.matchAll(/<Relationship\b([^>]*)\/?>/g)) {
    const a = attrsOf(m[1])
    if (!a.Id || !a.Target) continue
    const target = a.Target.startsWith('/') ? a.Target.slice(1) : `xl/${a.Target}`
    out.set(a.Id, target.replace(/\/\.\//g, '/'))
  }
  return out
}

/** The shared strings, in order: a cell typed `s` holds an index into this. */
export function sharedStringsOf(xml: string): string[] {
  const out: string[] = []
  for (const m of xml.matchAll(/<si>([\s\S]*?)<\/si>|<si\/>/g)) out.push(m[1] ? textOf(m[1]) : '')
  return out
}

/** `QR` → 463: the column's index, A being 0. */
export function columnIndex(letters: string): number {
  let n = 0
  for (const ch of letters.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n - 1
}

/** 463 → `QR`. */
export function columnLetters(index: number): string {
  let n = index + 1
  let out = ''
  while (n > 0) {
    const r = (n - 1) % 26
    out = String.fromCharCode(65 + r) + out
    n = Math.floor((n - 1) / 26)
  }
  return out
}

/** One sheet's cells, as text, line by line. Empty lines are not kept. */
export function linesOfSheet(xml: string, strings: readonly string[]): SheetLine[] {
  const lines: SheetLine[] = []
  let nextRow = 1
  for (const row of xml.matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
    const rowAttrs = attrsOf(row[1])
    const at = rowAttrs.r ? Number(rowAttrs.r) : nextRow
    nextRow = at + 1
    const body = row[2]
    if (!body) continue
    const cells: string[] = []
    let nextCol = 0
    for (const c of body.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const a = attrsOf(c[1])
      const col = a.r ? columnIndex(a.r.replace(/\d+$/, '')) : nextCol
      nextCol = col + 1
      const inner = c[2]
      if (!inner) continue
      let text = ''
      if (a.t === 'inlineStr') {
        text = textOf(inner)
      } else {
        const v = /<v>([\s\S]*?)<\/v>/.exec(inner)
        if (!v) continue
        const raw = unescapeXml(v[1])
        if (a.t === 's') text = strings[Number(raw)] ?? ''
        else if (a.t === 'b') text = raw === '1' ? 'TRUE' : 'FALSE'
        else if (a.t === 'e') text = ''
        else text = raw
      }
      if (text === '') continue
      while (cells.length < col) cells.push('')
      cells[col] = text
    }
    if (cells.length > 0) lines.push({ at, cells })
  }
  return lines
}

/* ------------------------------------------------------------ */
/* the whole read                                                */
/* ------------------------------------------------------------ */

/**
 * READ THE SHEETS A CALLER WANTS OUT OF A WORKBOOK'S BYTES.
 *
 * `wanted` is asked of every sheet name before anything of that sheet
 * is inflated, so a 40 MB workbook costs only the sheets that feed a
 * list here and its shared strings.
 */
export async function readWorkbook(
  bytes: Uint8Array,
  inflate: Inflate,
  wanted: (sheetName: string) => boolean = () => true,
): Promise<Workbook> {
  const entries = zipDirectory(bytes)
  const byName = new Map(entries.map((e) => [e.name, e]))
  const text = async (name: string): Promise<string | null> => {
    const entry = byName.get(name)
    return entry ? utf8.decode(await entryBytes(bytes, entry, inflate)) : null
  }

  const book = await text('xl/workbook.xml')
  const rels = await text('xl/_rels/workbook.xml.rels')
  if (book === null || rels === null) throw new WorkbookRefusal(NOT_A_WORKBOOK)
  const listed = sheetsOfWorkbook(book)
  const targets = targetsOf(rels)
  const names = listed.map((s) => s.name)

  const chosen = listed.filter((s) => wanted(s.name))
  if (chosen.length === 0) return { names, sheets: [] }

  const stringsXml = await text('xl/sharedStrings.xml')
  const strings = stringsXml === null ? [] : sharedStringsOf(stringsXml)

  const sheets: WorkbookSheet[] = []
  for (const s of chosen) {
    const target = targets.get(s.rid)
    const xml = target ? await text(target) : null
    if (xml === null) continue
    sheets.push({ name: s.name, lines: linesOfSheet(xml, strings) })
  }
  return { names, sheets }
}
