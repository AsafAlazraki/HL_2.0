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
import { useEffect, useRef } from 'react'
import { Command } from 'cmdk'
import { Kbd } from '@/ui'
import type { FinderReading, FinderRow } from '@/domain/shell/finder'

/* ============================================================
   THE FINDER — one field over the whole app, opened with Ctrl K from
   any of the twelve screens.

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
            {scope ? <span className="way-chip">{scope}</span> : null}
            <Command.Input
              ref={field}
              className="way-finder__field"
              value={query}
              onValueChange={onQuery}
              placeholder="A quote, a customer, a boat, a table, a row — or where to go"
            />
            <button type="button" className="way-finder__close" onClick={close}>
              Close
              <Kbd>Esc</Kbd>
            </button>
          </div>

          <p className="way-finder__say" id="way-finder-say">
            {reading.asking ? `Enter does what the row says. ${say}` : say}
          </p>

          <Command.List className="way-list" aria-describedby="way-finder-say">
            {reading.nothing ? (
              <Command.Empty className="way-empty">{reading.nothing}</Command.Empty>
            ) : null}

            {reading.groups.map((group) => (
              <Command.Group key={group.id} className="way-group" heading={group.title}>
                {group.say ? <p className="way-group__say">{group.say}</p> : null}
                {group.rows.map((row) => (
                  <Command.Item
                    key={row.id}
                    value={row.id}
                    className="way-row"
                    onSelect={() => choose(row)}
                  >
                    <span className="way-row__name">
                      <Marked name={row.name} at={row.at} length={row.length} />
                    </span>
                    {row.fact === '' ? null : <span className="way-row__fact">{row.fact}</span>}
                    <span className="way-row__verb">{row.verb}</span>
                    {row.key ? (
                      <span className="way-row__key">
                        <Kbd>{row.key}</Kbd>
                      </span>
                    ) : null}
                  </Command.Item>
                ))}
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
