import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { crestOf } from '@/domain/shell/crest'
import { markOfCrest, tabIconHref, tabIconSvg } from './tab'

/* THE TAB WEARS THE CREST (./tab.ts): the same drawing the pill's leading cap draws, in the
   inks the page's tokens resolve to, and nothing invented beside it. */
const inks = { ground: 'rgb(1, 2, 3)', ink: 'rgb(255, 255, 255)', face: "'Segoe UI', sans-serif" }

describe('the tab’s icon', () => {
  it('draws the business’s initials once the file names it, in the tokens’ inks', () => {
    const svg = tabIconSvg(crestOf('Northside Marine', 'HelmLogic'), inks)
    expect(svg).toContain('>NM</text>')
    expect(svg).toContain('fill="rgb(1, 2, 3)"')
    expect(svg).toContain('fill="rgb(255, 255, 255)"')
    expect(svg).toContain("font-family: 'Segoe UI', sans-serif")
  })

  it('draws the helm before a file has named anybody, and no letters', () => {
    const svg = tabIconSvg(crestOf(null, 'HelmLogic'), inks)
    expect(svg).not.toContain('<text')
    expect(svg).toContain('<path d="M12 2.5v19')
  })

  it('cannot be broken out of by what a business calls itself or a token resolves to', () => {
    const svg = tabIconSvg(crestOf('<A> & B', 'HelmLogic'), { ...inks, ground: 'red" onload="x' })
    expect(svg).not.toContain('" onload="')
    expect(svg).toContain('fill="red&quot; onload=&quot;x"')
  })

  it('carries the dealership’s own mark where `--shell-crest` names one, and nothing where not', () => {
    expect(markOfCrest('none')).toBeNull()
    expect(markOfCrest('')).toBeNull()
    expect(markOfCrest('url("https://example.test/northside.svg")')).toBe(
      'https://example.test/northside.svg',
    )
    expect(markOfCrest('url(/marks/northside.png)')).toBe('/marks/northside.png')
  })

  it('is an address a link can carry', () => {
    const href = tabIconHref(crestOf('Northside Marine', 'HelmLogic'), inks)
    expect(href.startsWith('data:image/svg+xml,')).toBe(true)
    expect(decodeURIComponent(href.slice('data:image/svg+xml,'.length))).toContain('>NM</text>')
  })

  it('leaves the browser nothing to ask /favicon.ico for before the shell draws it', () => {
    const html = readFileSync(new URL('../../../index.html', import.meta.url), 'utf8')
    expect(html).toMatch(/<link rel="icon" href="data:," \/>/)
  })
})
