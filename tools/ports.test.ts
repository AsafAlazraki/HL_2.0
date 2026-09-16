import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { DEV_PORT } from './ports'

test('.claude/launch.json serves the same port vite.config.ts does', () => {
  const launch = JSON.parse(readFileSync('.claude/launch.json', 'utf8')) as {
    configurations: { name: string; port: number }[]
  }
  const dev = launch.configurations.find((c) => c.name === 'hl2')
  expect(dev?.port).toBe(DEV_PORT)
})
