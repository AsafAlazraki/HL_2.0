/* ============================================================
   ONE LINT RULE TURNED OFF FOR THIS FILE, WITH ITS REASON — never as
   a convenience, and never anywhere else in this folder.

   `jsx-a11y/no-noninteractive-element-interactions` asks that the
   `onMouseDown` below sit on something interactive. The element it is
   on is the `<dialog>` itself, and what the handler answers is a
   press on the ROOM AROUND the sheet — light dismiss, which every
   command palette in the sweep has. The remedy the rule asks for is a
   `<button>` the size of the window, and inside `showModal()`'s focus
   trap that button is a tab stop between the field and its first
   result, on the one surface where the keyboard is the whole
   interface. Nothing on this screen is reachable ONLY by that press:
   Escape closes the finder, and so does the named Close control
   beside the field.
   ============================================================ */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useEffect, useRef, type ReactNode } from 'react'
import { Command } from 'cmdk'
import {
  ArrowUUpLeftIcon,
  CrosshairSimpleIcon,
  LightningIcon,
  MagnifyingGlassIcon,
  SignpostIcon,
  TableIcon,
  WarningCircleIcon,
  XIcon,
} from '@phosphor-icons/react'
import { START_A_QUOTE } from '@/app/ways'
import { TABLE_KINDS, type AccentKey, type TableKind } from '@/domain/model'
import { Button, Icon, Kbd, KindMark, type Glyph } from '@/ui'
import type { FinderGroup, FinderReading, FinderRow } from '@/domain/shell/finder'
import { glyphOfWay } from './glyphs'

/* ============================================================
   THE FINDER — one field over the whole app, opened with Ctrl K from
   any of the twelve screens, or by the pill's own magnifier where there is no
   keyboard to press it with.

   cmdk IS ADOPTED, AND ITS FILTER IS TURNED OFF. The library is on
   the owner's list and it is the right one: it owns the part of a
   command palette that is genuinely hard and genuinely invisible —
   the combobox and listbox roles, `aria-activedescendant`, the
   cursor that walks groups without walking into them, keeping the
   selected row in view. What it must NOT own is what matches, and
   `shouldFilter={false}` is the switch for exactly that. Every hit
   drawn below came out of a module that already existed and is
   already tested: `domain/catalogue/search.ts`, `domain/quote/find.ts`
   and `domain/people/customers.ts`, arranged by
   `domain/shell/finder.ts`. A palette with its own fuzzy matcher
   would be a second opinion about what "sp560" hits, and the day the
   two disagreed the palette would be quietly wrong about the app.

   THE FIELD IS cmdk'S AND NOT `src/ui/Input`, and this is the one
   place in the app where that is true. The field here is not a
   control that happens to sit above a list — it IS the list's
   controller: it carries `aria-controls`, `aria-activedescendant` and
   `aria-expanded` for the rows underneath, and those attributes have
   to be on the element the library owns. Wrapping the primitive would
   mean either two inputs or reaching into `.ui-field`, which
   `tools/check.ts` refuses and which would be a worse answer than
   this sentence.

   THE GRAMMAR IS `readFinder`'s AND NOT DRAWN HERE. What group a row
   is in, what stands beside it and what pressing it does are decided
   in `src/domain/shell/finder.ts` with its own suite over the real
   file; this file paints them. That is the same division the cascade
   made when it refused to write a single sentence of its own.
   ============================================================ */

export interface FinderProps {
  open: boolean
  close: () => void
  query: string
  onQuery: (next: string) => void
  reading: FinderReading
  /** the chip: what this screen is, when it published one */
  scope: string | null
  /** what a press does — the shell resolves the target to an address */
  choose: (row: FinderRow) => void
  /** the dealership, so the sheet is named even at a dead end */
  business: string | null
  /** the sentence under the field before anything is typed */
  say: string
  /** SAY IT WHILE TYPING TOO — where the sentence is a fact about this
   *  desk (no price file read) rather than a lesson in what to type,
   *  which stops being needed at the first key */
  sayAlways?: boolean
  /** WHY THE LAST PRESS WROTE NOTHING — a quote the finder was asked to
   *  start and could not — said above the rows where it was pressed */
  refused?: string | null
  /** HOW IT WAS OPENED. A chord opens it with no entrance — a palette
   *  pressed a hundred times a day must be there when the keys come up —
   *  and a finger or a pointer on the pill's bubble sees it hang down from
   *  what opened it (`shell.css`, the header's MOTION). */
  by?: 'key' | 'pointer'
}

/* ============================================================
   THE HEAD OF A GROUP SAYS WHAT IT HOLDS BEFORE ITS WORD IS READ.

   A group of things of one KIND carries the kind's own drawing — the
   kit's `KindMark`, the same hull, engine and trailer the build and the
   registers draw — found from the ink the finder's grammar already
   gives it (`TABLE_KINDS` holds one ink per kind, so the ink names the
   kind). Every other group leads with the glyph of what it is: the
   doors a signpost, the acts a bolt, the places lately left a turn
   back, the quotes the paper the pill's Quotes door carries, the people
   the pill's Customers, the lists a table. None of them is decoration:
   each is the one mark a dealer's eye can find a group by in a list of
   eight groups without reading their caps.
   ============================================================ */

const GROUP_GLYPH: Readonly<Record<string, Glyph>> = {
  scope: CrosshairSimpleIcon,
  recent: ArrowUUpLeftIcon,
  doors: SignpostIcon,
  acts: LightningIcon,
  tables: TableIcon,
}

/** The kind a group's ink is the ink of, or null for an ink no kind wears. */
function kindOfInk(ink: AccentKey): TableKind | null {
  for (const [kind, meta] of Object.entries(TABLE_KINDS))
    if (meta.accent === ink) return kind as TableKind
  return null
}

function headOf(group: FinderGroup): ReactNode {
  const kind = group.ink ? kindOfInk(group.ink) : null
  const glyph =
    GROUP_GLYPH[group.id] ??
    (group.id === 'quotes' ? glyphOfWay('/quotes') : null) ??
    (group.id === 'people' ? glyphOfWay('/customers') : null)
  return (
    <>
      {kind ? (
        <KindMark kind={kind} size="sm" />
      ) : glyph ? (
        <span className="way-group__glyph" aria-hidden="true">
          <Icon glyph={glyph} />
        </span>
      ) : null}
      <span>{group.title}</span>
    </>
  )
}

/** THE GLYPH A DOOR OR AN ACT LEADS WITH — the one the pill and the dead end draw for the
 *  same place (./glyphs.ts). A line of the file, a quote or a person has none of its own:
 *  their group's head already says what they are. */
function rowGlyph(row: FinderRow): Glyph | null {
  if (row.target.at === 'door') return glyphOfWay(row.target.href)
  if (row.target.at === 'act')
    return row.target.act === 'new-quote' ? glyphOfWay(START_A_QUOTE.href) : glyphOfWay('/data')
  return null
}

/** THE RUN THAT MATCHED, MARKED — and nothing marked when the run is
 *  not in the name. A quote found by its customer, a place found by
 *  its description: `search.ts` answers -1 for both, and drawing a
 *  mark anyway would point at the wrong letters. */
function Marked({ name, at, length }: { name: string; at?: number; length?: number }) {
  if (at === undefined || at < 0 || !length) return <>{name}</>
  return (
    <>
      {name.slice(0, at)}
      <b className="way-row__hit">{name.slice(at, at + length)}</b>
      {name.slice(at + length)}
    </>
  )
}

export function Finder({
  open,
  close,
  query,
  onQuery,
  reading,
  scope,
  choose,
  business,
  say,
  sayAlways = false,
  refused = null,
  by = 'key',
}: FinderProps) {
  const field = useRef<HTMLInputElement>(null)
  const sheet = useRef<HTMLDialogElement>(null)

  /* IT IS A NATIVE `<dialog>`, SHOWN MODALLY, and that is a decision
     rather than a convenience. A div wearing `role="dialog"` and
     `aria-modal="true"` would be CLAIMING a focus trap it does not
     have — Tab would walk straight out of the finder into the
     register underneath, which is the failure the attribute exists to
     promise against. `showModal()` gives the real thing: the top
     layer, a real focus trap, and a `::backdrop` to dim the page with.

     THE FIELD TAKES THE CURSOR WHEN IT OPENS, and gives it back to
     whatever had it when it closes — a person who pressed Ctrl K on a
     register and changed their mind is put back on the row they were
     on, not at the top of the document. `showModal()` restores focus
     to the opener by itself, and this keeps hold of it anyway for the
     one browser-shaped environment that does not: the happy-dom the
     component tests run in. */
  const cameFrom = useRef<Element | null>(null)
  useEffect(() => {
    const element = sheet.current
    if (!element) return
    if (open) {
      cameFrom.current = document.activeElement
      if (!element.open) {
        if (typeof element.showModal === 'function') element.showModal()
        else element.setAttribute('open', '')
      }
      field.current?.focus()
      return
    }
    if (element.open) element.close()
    const back = cameFrom.current
    cameFrom.current = null
    if (back instanceof HTMLElement && back.isConnected) back.focus()
  }, [open])

  /* A PRESS THAT WAS REFUSED GIVES THE CURSOR BACK TO THE FIELD: the sentence says why
     nothing was written, and the next thing a person does is type — which takes it away. */
  useEffect(() => {
    if (refused) field.current?.focus()
  }, [refused])

  if (!open) return null

  return (
    /* THE PAGE BEHIND IS DIMMED AND NOT BLURRED. Vercel and Geist both
       dim it (`live2/geist-command-menu-typed.png`); a blur over a
       register is a photograph of a list nobody can read, and this app
       spends its one blur on glass over water. The dimming is the
       dialog's own `::backdrop`, in `shell.css`. */
    <dialog
      ref={sheet}
      className="way-finder"
      data-testid="shell-finder"
      data-by={by}
      aria-label={business ? `Find anything at ${business}` : 'Find anything'}
      onCancel={(event) => {
        /* the browser's own Escape on a modal dialog. It is answered
           here as well as inside the command menu because either can
           be the one that arrives first, and both do the same thing. */
        event.preventDefault()
        close()
      }}
      onMouseDown={(event) => {
        /* LIGHT DISMISS — see the head of this file for why the rule
           is off. A press on the dialog element itself is a press on
           the ROOM around the sheet; a press inside the sheet is a
           press on a child and never reaches here. */
        if (event.target === event.currentTarget) close()
      }}
    >
      <div className="way-finder__sheet">
        <Command
          shouldFilter={false}
          loop
          label="Find anything"
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return
            /* RUNG 1 OF THE ESCAPE LADDER (src/ui/keys.ts): a widget
               that owns the keyboard takes it and stops the event, so
               the screen underneath never sees this keystroke and does
               not also close its own peek. */
            event.preventDefault()
            event.stopPropagation()
            close()
          }}
        >
          <div className="way-finder__head">
            {/* THE SCOPE CHIP. Linear's 2019 command menu prints what
                it acts on above the field — `Issue · LIN-1615` — and
                that is what lets ONE Ctrl K serve a screen that
                already had a field: the screen's own rows are the
                first group, under its own name. */}
            <span className="way-finder__glyph" aria-hidden="true">
              <Icon glyph={MagnifyingGlassIcon} size="md" />
            </span>
            {scope ? <span className="way-chip">{scope}</span> : null}
            <Command.Input
              ref={field}
              className="way-finder__field"
              value={query}
              onValueChange={onQuery}
              placeholder="A boat, its code, a quote or a customer — or where to go"
            />
            {/* THE KIT'S QUIET CAPSULE, the dialog's own close (src/ui/Dialog.tsx): its glyph
                beside its word, and the chord after it where there is a keyboard to press */}
            <Button intent="quiet" size="sm" icon={XIcon} onClick={close}>
              Close
              <Kbd tone="quiet">Esc</Kbd>
            </Button>
          </div>

          {/* TOLD IN THE VOCABULARY THE DEVICE HAS (rule (b)). Both
              halves are written and `shell.css` draws one: the key where
              `pointer: fine` says there is a keyboard, "press a row" —
              the register's and Data's own touch words — where there is
              a finger. */}
          <p className="way-finder__say" id="way-finder-say">
            {reading.asking ? (
              <>
                <span className="way-say__keys">Enter does what the row says. </span>
                <span className="way-say__touch">
                  Press a row and it opens: a boat starts its quote, a line of the file opens on the
                  sheet.{' '}
                </span>
              </>
            ) : null}
            {reading.asking && !sayAlways ? null : say}
          </p>

          <Command.List className="way-list" aria-describedby="way-finder-say">
            {/* A REFUSAL IS A SENTENCE WHERE IT WAS REFUSED: the row that
                was pressed is still under it, and typing clears it */}
            {refused ? (
              <p className="way-note" role="alert" data-refused="">
                <span className="way-note__glyph" aria-hidden="true">
                  <Icon glyph={WarningCircleIcon} weight="fill" />
                </span>
                {refused}
              </p>
            ) : null}
            {reading.note ? <p className="way-note">{reading.note}</p> : null}
            {reading.nothing ? (
              <Command.Empty className="way-empty">{reading.nothing}</Command.Empty>
            ) : null}

            {reading.groups.map((group) => (
              <Command.Group
                key={group.id}
                className="way-group"
                heading={headOf(group)}
                {...(group.ink ? { 'data-ink': group.ink } : {})}
              >
                {group.say ? <p className="way-group__say">{group.say}</p> : null}
                {group.rows.map((row) => {
                  const glyph = rowGlyph(row)
                  return (
                    <Command.Item
                      key={row.id}
                      value={row.id}
                      className="way-row"
                      data-act={
                        row.target.at === 'start' || row.target.at === 'model' ? '' : undefined
                      }
                      onSelect={() => choose(row)}
                    >
                      <span className="way-row__name">
                        {glyph ? (
                          <span className="way-row__glyph" aria-hidden="true">
                            <Icon glyph={glyph} />
                          </span>
                        ) : null}
                        <span>
                          <Marked name={row.name} at={row.at} length={row.length} />
                        </span>
                      </span>
                      <span className="way-row__fact">
                        {row.code ? (
                          <span className="way-row__code">
                            <Marked
                              name={row.code.text}
                              at={row.code.at}
                              length={row.code.length}
                            />
                          </span>
                        ) : null}
                        {row.fact === '' ? null : <span>{row.fact}</span>}
                      </span>
                      <span className="way-row__figure">{row.figure ?? ''}</span>
                      <span className="way-row__verb">{row.verb}</span>
                    </Command.Item>
                  )
                })}
                {group.more ? (
                  <p className="way-group__more">
                    {group.more.toLocaleString('en-AU')} more here than this list shows. Typing more
                    narrows it.
                  </p>
                ) : null}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>
    </dialog>
  )
}
