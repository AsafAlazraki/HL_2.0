import { useMemo, useState } from 'react'
import { Dialog, Input, Kbd } from '@/ui'
import { NO_SHORTCUT, findShortcuts } from './vocabulary'

/* ============================================================
   THE `?` SHEET — every shortcut in the app, searchable.

   IT IS THE `Dialog` PRIMITIVE AND NOT A SURFACE OF ITS OWN. A
   modal with a title, a description, a close control and a focus
   trap is exactly what `src/ui/Dialog.tsx` already is; drawing a
   second one here would be the shared-component mistake in
   miniature, and the rule against a shared PAGE component is not a
   rule against the primitives the pages are built from.

   IT IS DRAWN UNDER `pointer: fine` ONLY, in `shell.css`. A phone has
   none of these keys, and a list of things that cannot be pressed is
   worse than no list — the quotes register made the same call about
   its own legend on 2026-09-18 and this follows it.
   ============================================================ */

export interface ShortcutsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Shortcuts({ open, onOpenChange }: ShortcutsProps) {
  const [query, setQuery] = useState('')
  const groups = useMemo(() => findShortcuts(query), [query])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setQuery('')
        onOpenChange(next)
      }}
      size="lg"
      title="Every key this app answers to"
      description="Press ? anywhere to open this. A key works on the screen it is listed under, and only while that screen has the focus."
    >
      <div className="way-keys">
        <div className="way-keys__find">
          <Input
            type="search"
            aria-label="Find a shortcut"
            value={query}
            onValueChange={setQuery}
            placeholder="A key, what it does, or the screen it is on"
          />
        </div>

        {groups.length === 0 ? (
          <output className="way-keys__none">{NO_SHORTCUT(query)}</output>
        ) : (
          <div className="way-keys__groups">
            {groups.map((group) => (
              <section className="way-keys__group" key={group.where} aria-label={group.where}>
                <h3 className="way-keys__where">
                  {group.where}
                  {group.href ? <span className="way-keys__at">{group.href}</span> : null}
                </h3>
                <dl className="way-keys__list">
                  {group.keys.map((shortcut) => (
                    <div className="way-keys__row" key={`${group.where}:${shortcut.keys}`}>
                      <dt className="way-keys__key">
                        <Kbd>{shortcut.keys}</Kbd>
                      </dt>
                      <dd className="way-keys__act">{shortcut.act}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  )
}
