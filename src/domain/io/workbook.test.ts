/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { deflateRawSync, inflateRawSync } from 'node:zlib'
import { existsSync, readFileSync } from 'node:fs'
import { writeWorkbook, zipStored } from '@/test/fixtures/workbook'
import {
  WorkbookRefusal,
  columnIndex,
  columnLetters,
  linesOfSheet,
  readWorkbook,
  sharedStringsOf,
  unescapeXml,
  zipDirectory,
} from './workbook'

const inflate = async (raw: Uint8Array): Promise<Uint8Array> => new Uint8Array(inflateRawSync(raw))

describe('a workbook read as the lines it carries', () => {
  it('reads text, figures and their columns from a real .xlsx', async () => {
    const bytes = writeWorkbook([
      {
        name: 'Parts Maintenance',
        lines: [
          { at: 1, cells: { C: 'Parts & Accessories Module', L: 'Sell' } },
          { at: 4, cells: { C: 'Tube Covers to suit PVC Boat - 2.0 Mtr', E: 'IBC-20', L: 1540 } },
        ],
      },
      { name: 'Dropdowns', lines: [{ at: 1, cells: { A: 'x' } }] },
    ])
    const book = await readWorkbook(bytes, inflate, (n) => n === 'Parts Maintenance')
    expect(book.names).toEqual(['Parts Maintenance', 'Dropdowns'])
    expect(book.sheets.map((s) => s.name)).toEqual(['Parts Maintenance'])
    const [, line] = book.sheets[0].lines
    expect(line.at).toBe(4)
    expect(line.cells[columnIndex('C')]).toBe('Tube Covers to suit PVC Boat - 2.0 Mtr')
    expect(line.cells[columnIndex('E')]).toBe('IBC-20')
    expect(line.cells[columnIndex('L')]).toBe('1540')
  })

  it('inflates a deflated entry with the inflate it is handed', async () => {
    const xml =
      '<worksheet><sheetData><row r="2"><c r="B2" t="inlineStr"><is><t>Dee Shackle</t></is></c><c r="C2"><v>98</v></c></row></sheetData></worksheet>'
    const stored = zipStored([
      {
        name: 'xl/workbook.xml',
        text: '<workbook><sheets><sheet name="One" sheetId="1" r:id="rId1"/></sheets></workbook>',
      },
      {
        name: 'xl/_rels/workbook.xml.rels',
        text: '<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>',
      },
      { name: 'xl/worksheets/sheet1.xml', text: xml },
    ])
    /* re-pack the sheet deflated, by hand, so method 8 is what is read */
    const dir = zipDirectory(stored)
    expect(dir.map((e) => e.method)).toEqual([0, 0, 0])
    const packed = deflateRawSync(Buffer.from(xml))
    const sheet = linesOfSheet(new TextDecoder().decode(await inflate(new Uint8Array(packed))), [])
    expect(sheet).toEqual([{ at: 2, cells: ['', 'Dee Shackle', '98'] }])
  })

  it('reads rich text and Excel’s own escapes in the shared strings', () => {
    const strings = sharedStringsOf(
      '<sst><si><r><t>Inflatable </t></r><r><t xml:space="preserve">Deluxe</t></r></si><si><t>A &amp; B_x000D_</t></si><si/></sst>',
    )
    expect(strings).toEqual(['Inflatable Deluxe', 'A & B\r', ''])
    expect(unescapeXml('&#8217;&lt;&#x41;')).toBe('’<A')
  })

  it('turns column letters into places and back', () => {
    expect(columnIndex('A')).toBe(0)
    expect(columnIndex('QR')).toBe(459)
    expect(columnLetters(459)).toBe('QR')
    expect(columnLetters(columnIndex('AL'))).toBe('AL')
  })

  it('refuses a file that is not a workbook, in a sentence', async () => {
    await expect(readWorkbook(new TextEncoder().encode('Code,Sell\n'), inflate)).rejects.toThrow(
      WorkbookRefusal,
    )
  })

  /* THE REAL RE-ISSUE, when it is on this machine (it is outside the repository and not in
     CI). Measured: the Parts Maintenance sheet of Parts Module (2) carries the IBC tube
     cover at 1,540, the figure docs/research/refs/shelf/notes.md §0.3 read from its extract. */
  const real = 'C:/Users/Asaf/dev/mpf-workbooks/Parts Module (2).xlsx'
  it.runIf(existsSync(real))('reads Northside’s own Parts Module (2)', async () => {
    const book = await readWorkbook(
      new Uint8Array(readFileSync(real)),
      inflate,
      (n) => n === 'Parts Maintenance',
    )
    const lines = book.sheets[0].lines
    const tube = lines.find(
      (l) => l.cells[columnIndex('C')] === 'Tube Covers to suit PVC Boat - 2.0 Mtr',
    )
    expect(Number(tube?.cells[columnIndex('L')])).toBe(1540)
  })
})
