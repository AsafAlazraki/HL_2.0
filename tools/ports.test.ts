import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { DEV_PORT, PREVIEW_PORT } from './ports'

/**
 * BOTH COPIES, not one. `.claude/launch.json` repeats two ports and until round 3 this file
 * checked the first of them, so the 5090/5411 split the comment in `ports.ts` is written
 * against could have recurred on the preview port with the whole gate green — and the preview
 * port is the one every ruler and every screenshot measures against.
 */
const launch = JSON.parse(readFileSync('.claude/launch.json', 'utf8')) as {
  configurations: { name: string; port: number }[]
}
const portOf = (name: string): number | undefined =>
  launch.configurations.find((c) => c.name === name)?.port

test('.claude/launch.json serves the same dev port vite.config.ts does', () => {
  expect(portOf('hl2')).toBe(DEV_PORT)
})

test('.claude/launch.json previews on the same port playwright.config.ts measures', () => {
  expect(portOf('hl2-preview')).toBe(PREVIEW_PORT)
})

test('the two are not the same port, or one server answers for the other', () => {
  expect(DEV_PORT).not.toBe(PREVIEW_PORT)
})
