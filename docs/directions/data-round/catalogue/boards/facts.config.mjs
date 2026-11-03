/* Runs extract.facts.ts through vitest, so the app's own shelf, aisles, namer and pricer
   produce every figure the boards draw:
   FACTS_OUT=docs/directions/data-round/catalogue/boards/facts.out npx vitest run --config docs/directions/data-round/catalogue/boards/facts.config.mjs */
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
    testTimeout: 120000,
  },
})
