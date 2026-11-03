import { useMemo, useRef, useState, type DragEvent } from 'react'
import { ImagesIcon } from '@phosphor-icons/react'
import { batch, type CatalogueCommand } from '@/domain/catalogue/commands'
import { addOwnPictures } from '@/domain/catalogue/pictureCommands'
import { codeBookOf, matchByCode } from '@/domain/chandlery/byCode'
import { readOptionPicture } from '@/ui/pictureFile'
import { session } from '@/state/session'
import { Button, Icon } from '@/ui'
import { PARTS_TABLE, type ShelfPart } from './shelf'
import { StepSaid, useStep } from './Step'

/* ============================================================
   MANY PICTURES AT ONCE, EACH PUT ON THE PART ITS FILE NAME NAMES BY
   CODE (the judge of the chandlery, major 12; grafted from board C).
   Northside photographs parts in the shop and names each file by the
   code on the box: SG002.jpg lands on Safety Gear · Smooth Waters, and
   only there. The match is the domain's (`matchByCode`): a name that
   carries no code, or a code more than one part carries, is refused
   with its sentence, and nothing is put anywhere the name did not say.

   Every file that lands is one step with the others — one Undo takes
   the whole drop back — and every file refused is listed with why.
   ============================================================ */

type Landed = { n: number; file: string; on: string } | { n: number; file: string; why: string }

export function ByCode({
  parts,
  nameOf,
}: {
  parts: readonly ShelfPart[]
  nameOf: (p: ShelfPart) => string
}) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [landed, setLanded] = useState<Landed[]>([])
  const step = useStep()
  const book = useMemo(
    () => codeBookOf(parts.map((p) => ({ id: p.id, code: p.code, name: p.product, part: p }))),
    [parts],
  )
  /* THE EXAMPLE IS THE LIST'S OWN: its first part whose code one part alone carries */
  const example = ((): { file: string; name: string } | null => {
    for (const [code, lines] of book.byCode) {
      const one = lines[0]
      if (lines.length === 1 && one && code.length > 0)
        return {
          file: `${one.part.code.replace(/[^A-Za-z0-9-]/g, '')}.jpg`,
          name: nameOf(one.part),
        }
    }
    return null
  })()

  async function take(files: File[]): Promise<void> {
    if (files.length === 0) return
    step.clear()
    const out: Landed[] = []
    const commands: CatalogueCommand[] = []
    const by = session.getState().name
    for (const [i, file] of files.entries()) {
      setBusy(`Reading ${i + 1} of ${files.length}…`)
      const match = matchByCode(file.name, book)
      if (!match.ok) {
        out.push({ n: i, file: file.name, why: match.why })
        continue
      }
      const name = nameOf(match.line.part)
      const read = await readOptionPicture(file, name)
      if (!read.ok) {
        out.push({ n: i, file: file.name, why: read.why })
        continue
      }
      commands.push(
        addOwnPictures({
          table: PARTS_TABLE,
          row: match.line.id,
          name,
          pictures: [read.picture],
          by,
        }),
      )
      out.push({ n: i, file: file.name, on: `${name} (${match.code})` })
    }
    setBusy(null)
    setLanded(out)
    const placed = out.filter((l) => 'on' in l).length
    if (commands.length > 0)
      step.apply(
        batch(commands, {
          said: `${placed.toLocaleString('en-AU')} picture${placed === 1 ? '' : 's'} put on ${placed === 1 ? 'its part' : 'their parts'} by code`,
        }),
        'Those pictures are already on their parts.',
      )
  }

  const onDragOver = (e: DragEvent<HTMLDivElement>): void => {
    if (!Array.from(e.dataTransfer.types).includes('Files')) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    if (!over) setOver(true)
  }

  return (
    <div
      className="chd-bycode"
      data-over={over ? '' : undefined}
      onDragEnter={onDragOver}
      onDragOver={onDragOver}
      onDragLeave={(e) => {
        const to = e.relatedTarget
        if (to instanceof Node && e.currentTarget.contains(to)) return
        setOver(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        void take(Array.from(e.dataTransfer.files))
      }}
    >
      <span className="chd-bycode__glyph" aria-hidden="true">
        <Icon glyph={ImagesIcon} />
      </span>
      <div className="chd-bycode__words">
        <h2 className="chd-bycode__title">Pictures by their code</h2>
        <p className="chd-said">
          {example
            ? `Drop Northside’s photographs here, each file named by its part’s code: ${example.file} goes on the ${example.name} and nowhere else. `
            : 'Drop Northside’s photographs here, each file named by its part’s code. '}
          A file whose name carries no code, or a code more than one part carries, is refused with
          the reason.
        </p>
      </div>
      <div className="chd-bycode__act">
        <Button
          intent="secondary"
          size="sm"
          icon={ImagesIcon}
          onClick={() => input.current?.click()}
        >
          Choose pictures
        </Button>
        <input
          ref={input}
          className="chd-bycode__input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            e.target.value = ''
            void take(files)
          }}
        />
      </div>
      <div className="chd-bycode__out" aria-live="polite">
        {busy ? <p className="chd-said">{busy}</p> : null}
        {landed.length > 0 ? (
          <ul className="chd-bycode__list">
            {landed.map((l) => (
              <li key={`${l.n}:${l.file}`} data-refused={'why' in l ? '' : undefined}>
                {'why' in l ? l.why : `“${l.file}” is on the ${l.on}.`}
              </li>
            ))}
          </ul>
        ) : null}
        <StepSaid said={step.said} back={step.back} />
      </div>
    </div>
  )
}
