/* Runs extract.facts.ts through vitest, so the app's own workbook reader and new-file planner
   read Northside's real Parts Module (2).xlsx against the real pack and produce every figure
   the shelf boards draw:
   FACTS_OUT=docs/directions/data-round/shelf/boards/facts.json npx vitest run --config docs/directions/data-round/shelf/boards/facts.config.mjs */
import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(HERE, '../../../../..')

export default defineConfig({
  root: REPO,
  resolve: { alias: { '@': path.join(REPO, 'src') } },
  test: {
    env: { TZ: 'Australia/Brisbane' },
    environment: 'node',
    dir: HERE,
    include: ['extract.facts.ts'],
    testTimeout: 300000,
  },
})
