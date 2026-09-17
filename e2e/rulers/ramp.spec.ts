/// <reference lib="dom" />
/* eslint-disable unicorn/consistent-function-scoping -- the measuring function below runs
   INSIDE the page: Playwright serialises it and evaluates it with no closure, so its helpers
   cannot be hoisted out of it without breaking at runtime. */
import { expect, test } from '@playwright/test'
import { routes } from '../routes'
import { open } from '../shots/recipe'

/* ============================================================
   ramp — what the scale actually gives you, reported and never failed.

   The other rulers answer yes or no. This one answers "how much",
   because the questions it asks have no threshold:

     - Every step of the neutral and accent scales, measured against
       the page it is painted on. Which steps clear 4.5:1 for body
       text, which clear 3:1 for large text, and which clear neither
       and are therefore rules, ticks and disabled marks only.
     - The contrast BETWEEN adjacent steps. Two steps a reader cannot
       tell apart are one step with two names, and a scale with eleven
       names and six visible steps is how a design ends up reaching for
       a colour it does not have.
     - The type steps in use on this route, against the eleven the
       tokens declare. A scale mostly unused is a scale that has not
       been designed yet; a route using ten of eleven steps is a route
       with no hierarchy.

   It fails only if it measured nothing, because a report that can
   silently stop reporting is not a report. The tokens are PROVISIONAL
   (see src/styles/tokens.css) and this is the instrument the first
   picked direction will be measured with.
   ============================================================ */

interface Step {
  name: string
  value: string
  resolved: string
  onGround: number
  /** The colour as named is outside the sRGB gamut; a screen shows a clamped stand-in. */
  outsideGamut: boolean
}

interface Ramp {
  ground: string
  colours: Step[]
  typeSteps: { name: string; px: number }[]
  typeInUse: { px: number; weight: number; nodes: number }[]
}

function readRamp(): Ramp {
  /* Signed components are expected here, not exceptional: an oklch step
     can sit outside the sRGB gamut, and a screen paints it clamped. The
     ratio reported is therefore the one a person sees, and the step is
     marked so the owner knows the colour is not reachable as named. */
  const clamp = (v: number): number => Math.max(0, Math.min(255, v))
  const N = String.raw`-?[\d.]+(?:e[-+]?\d+)?`
  const SRGB = new RegExp(
    `^color\\(srgb\\s+(${N})\\s+(${N})\\s+(${N})(?:\\s*/\\s*(${N}))?\\)$`,
    'i',
  )
  const outside = (s: string): boolean => {
    const m = SRGB.exec(s)
    if (!m) return false
    return [1, 2, 3].some((i) => +m[i]! < 0 || +m[i]! > 1)
  }
  const parse = (s: string): number[] | null => {
    let m = SRGB.exec(s)
    if (m)
      return [
        clamp(+m[1]! * 255),
        clamp(+m[2]! * 255),
        clamp(+m[3]! * 255),
        m[4] === undefined ? 1 : +m[4],
      ]
    m = /rgba?\(([^)]+)\)/.exec(s)
    if (m) {
      const p = m[1]!
        .split(/[\s,/]+/)
        .filter(Boolean)
        .map(Number)
      return [clamp(p[0]!), clamp(p[1]!), clamp(p[2]!), p[3] === undefined ? 1 : p[3]]
    }
    return null
  }
  function ch(v: number): number {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  const lum = (c: number[]): number => 0.2126 * ch(c[0]!) + 0.7152 * ch(c[1]!) + 0.0722 * ch(c[2]!)
  const ratio = (a: number[], b: number[]): number => {
    const l1 = lum(a)
    const l2 = lum(b)
    return +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2)
  }

  /* The declared tokens, read off the cascade rather than off the file,
     so what is measured is what the browser actually has.

     RECURSIVELY, which the first version of this was not: Tailwind 4
     emits the theme inside `@layer theme`, so a walk over a sheet's
     top-level rules sees one CSSLayerBlockRule and no declarations at
     all. It read zero tokens and said so. Any grouping rule — a layer,
     a media query, a container query — holds its own cssRules. */
  const tokens = new Map<string, string>()
  const collect = (rules: CSSRuleList): void => {
    for (const rule of rules) {
      if (rule instanceof CSSStyleRule && rule.selectorText.includes(':root')) {
        for (const name of rule.style) {
          if (name.startsWith('--')) tokens.set(name, rule.style.getPropertyValue(name).trim())
        }
      }
      if (rule instanceof CSSGroupingRule) collect(rule.cssRules)
    }
  }
  for (const sheet of document.styleSheets) {
    try {
      collect(sheet.cssRules)
    } catch {
      continue /* a cross-origin sheet has no rules to read */
    }
  }

  /* A token declared in oklch computes as oklch; mixing it with itself
     in srgb asks the browser for the same colour in the space this
     arithmetic works in, rather than reimplementing oklch here. */
  const probe = document.createElement('span')
  probe.style.position = 'absolute'
  probe.style.opacity = '0'
  probe.textContent = '.'
  document.body.append(probe)
  const resolve = (name: string): string => {
    probe.style.color = `color-mix(in srgb, var(${name}), var(${name}))`
    return getComputedStyle(probe).color
  }

  const groundRaw = getComputedStyle(document.body).backgroundColor
  const ground = parse(groundRaw) ?? [255, 255, 255, 1]

  const colours: Step[] = []
  for (const [name, value] of tokens) {
    if (!name.startsWith('--color-')) continue
    const resolved = resolve(name)
    const rgb = parse(resolved)
    if (!rgb) continue
    colours.push({
      name,
      value,
      resolved,
      onGround: ratio(rgb, ground),
      outsideGamut: outside(resolved),
    })
  }

  const typeSteps: { name: string; px: number }[] = []
  for (const [name, value] of tokens) {
    if (!name.startsWith('--text-') || name.includes('--line-height')) continue
    probe.style.fontSize = value
    typeSteps.push({ name, px: +Number.parseFloat(getComputedStyle(probe).fontSize).toFixed(1) })
  }
  typeSteps.sort((a, b) => a.px - b.px)

  const used = new Map<string, { px: number; weight: number; nodes: number }>()
  for (const el of document.querySelectorAll('*')) {
    let own = ''
    for (const n of el.childNodes) if (n.nodeType === 3) own += (n as Text).data
    if (!own.trim()) continue
    if (el === probe) continue
    const cs = getComputedStyle(el)
    const px = +Number.parseFloat(cs.fontSize).toFixed(1)
    const weight = Number(cs.fontWeight) || 400
    const key = `${px}/${weight}`
    const seen = used.get(key)
    if (seen) seen.nodes++
    else used.set(key, { px, weight, nodes: 1 })
  }

  probe.remove()
  return {
    ground: groundRaw,
    colours,
    typeSteps,
    typeInUse: [...used.values()].toSorted((a, b) => b.px - a.px),
  }
}

test.describe('ramp', () => {
  // The scale does not change with the viewport, so it is read once, in the wider project.
  test.skip(({ viewport }) => viewport?.width !== 1440, 'the scale is read once, not per viewport')

  for (const route of routes) {
    test(`ramp — ${route.name}`, async ({ page }) => {
      await open(page, route)
      const r = await page.evaluate(readRamp)

      console.log(`\n  the scale, measured on ${route.name} (ground ${r.ground})`)
      const families = new Map<string, Step[]>()
      for (const step of r.colours) {
        const family = step.name.replace(/-\d+$/, '')
        const list = families.get(family) ?? []
        list.push(step)
        families.set(family, list)
      }
      for (const [family, steps] of families) {
        console.log(`    ${family}`)
        steps.forEach((step, i) => {
          const previous = steps[i - 1]
          const clears =
            step.onGround >= 4.5
              ? 'body text'
              : step.onGround >= 3
                ? 'large text only'
                : 'marks only'
          const gap = previous ? `  step ${(step.onGround / previous.onGround).toFixed(2)}×` : ''
          const gamut = step.outsideGamut ? '  OUTSIDE sRGB, shown clamped' : ''
          console.log(
            `      ${step.name.padEnd(22)} ${String(step.onGround).padStart(6)}:1  ${clears.padEnd(16)}${gap}  ${step.value}${gamut}`,
          )
        })
      }

      console.log(`\n  the type scale: ${r.typeSteps.map((s) => `${s.px}px`).join(' · ')}`)
      console.log(
        `  in use on this route: ${r.typeInUse.map((s) => `${s.px}px/${s.weight} ×${s.nodes}`).join(' · ')}`,
      )
      const unused = r.typeSteps.filter((s) => !r.typeInUse.some((u) => u.px === s.px))
      console.log(
        `  ${r.typeInUse.length} of ${r.typeSteps.length} steps in use; unused: ${unused.map((s) => s.name).join(', ') || 'none'}\n`,
      )

      /* The only assertion: the instrument still reads. Every number
         above is a report for the owner and for the first picked
         direction, not a threshold anyone has agreed to yet. */
      expect(r.colours.length, 'the scale was read off the cascade').toBeGreaterThan(0)
      expect(r.typeSteps.length, 'the type scale was read off the cascade').toBeGreaterThan(0)
      expect(r.typeInUse.length, 'the route set some type').toBeGreaterThan(0)
    })
  }
})
