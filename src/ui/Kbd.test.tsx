import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Kbd, platformKey } from './Kbd'

describe('Kbd', () => {
  test('one cap per key in the chord', () => {
    const { container } = render(<Kbd>Mod K</Kbd>)
    expect(container.querySelectorAll('.ui-kbd-key')).toHaveLength(2)
  })

  test('a chord of the same key twice is two caps, not one', () => {
    const { container } = render(<Kbd>G G</Kbd>)
    expect(container.querySelectorAll('.ui-kbd-key')).toHaveLength(2)
  })

  test('Mod reads as the platform key', () => {
    expect(platformKey('Mod', true)).toBe('⌘')
    expect(platformKey('Mod', false)).toBe('Ctrl')
    expect(platformKey('K', true)).toBe('K')
  })

  test('a quiet cap is the same cap, in the room’s own tone', () => {
    const { container } = render(<Kbd tone="quiet">Mod K</Kbd>)
    expect(container.querySelector('.ui-kbd')).toHaveClass('ui-kbd--quiet')
    expect(container.querySelectorAll('.ui-kbd-key')).toHaveLength(2)
  })

  test('the cap is text a reader can find', () => {
    render(<Kbd>Escape</Kbd>)
    expect(screen.getByText('Escape')).toBeInTheDocument()
  })

  /* NO KEYCAP ON A COARSE POINTER (rule (b), 2026-09-23). A media query cannot be matched in
     happy-dom, so this reads the rule off the primitive's own stylesheet; the walk in
     `e2e/flows/shell.spec.ts` counts the caps actually drawn on a phone at every address. */
  test('hides itself on a coarse pointer, in its own stylesheet', () => {
    /* the dom project's `import.meta.url` is the page's, not the file's, so the path is the
       repository's own */
    const css = readFileSync(join(process.cwd(), 'src', 'ui', 'kbd.css'), 'utf8')
    expect(css).toMatch(/@media \(pointer: coarse\)\s*\{\s*\.ui-kbd\s*\{\s*display:\s*none;/)
  })
})
