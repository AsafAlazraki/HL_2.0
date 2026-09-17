import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { DEFAULT_DEV_PORT, DEFAULT_PREVIEW_PORT, DEV_PORT, PREVIEW_PORT } from './ports'

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
  expect(portOf('hl2')).toBe(DEFAULT_DEV_PORT)
})

test('.claude/launch.json previews on the same port playwright.config.ts measures', () => {
  expect(portOf('hl2-preview')).toBe(DEFAULT_PREVIEW_PORT)
})

test('the two are not the same port, or one server answers for the other', () => {
  expect(DEV_PORT).not.toBe(PREVIEW_PORT)
})

test('an override moves the port a run measures, and a bad one is refused loudly', () => {
  /* The defaults are what launch.json repeats; the exported values are what a run uses, so
     two e2e runs can coexist by moving one of them instead of fighting over 5101. */
  expect(DEV_PORT).toBe(Number(process.env.HL2_DEV_PORT ?? DEFAULT_DEV_PORT))
  expect(PREVIEW_PORT).toBe(Number(process.env.HL2_PREVIEW_PORT ?? DEFAULT_PREVIEW_PORT))
})
