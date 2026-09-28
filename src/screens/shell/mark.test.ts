import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { MARK_TRANSITION } from './Pill'

/* THE FLAG AND THE ROUNDEL ARE ONE NAME SPELLED TWICE — once in TypeScript, where Entry's flag
   reads it, and once in shell.css, where the crest wears it, because only a stylesheet can ask
   whether the flag is on the page (Pill.tsx says why). A rename on one side would leave the flag
   flying into nothing, silently; this reads the stylesheet off disk and fails first. */
const here = path.dirname(fileURLToPath(import.meta.url))
const css = readFileSync(path.join(here, 'shell.css'), 'utf8')

describe("the mark's flight", () => {
  it('names the crest with the name the flag wears, only while the pill is arriving', () => {
    expect(css).toMatch(
      new RegExp(
        `\\.way-pill\\[data-arriving\\] \\.way-crest\\s*\\{\\s*view-transition-name:\\s*${MARK_TRANSITION};`,
      ),
    )
    /* and nowhere else: a crest named on every change of screen stretches every crossfade to
       the morph's length and holds the pointer for it (Pill.tsx, `arriving`) */
    expect(css).not.toMatch(/(^|\n)\.way-crest\s*\{[^}]*view-transition-name/)
  })

  it('takes the name off the crest while a flag is on the page, so two never share it', () => {
    expect(css).toMatch(
      /:root:has\(\[data-mark='flag'\]\) \.way-crest\s*\{\s*view-transition-name:\s*none;/,
    )
  })
})
