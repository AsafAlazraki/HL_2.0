import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { URL, fileURLToPath } from 'node:url'

const alias = { '@': fileURLToPath(new URL('./src', import.meta.url)) }

/**
 * Two projects, as the plan says: `.test.ts` runs in node (the ported engine suites against
 * the real pack fixture), `.test.tsx` runs in happy-dom (components, by role and text).
 */
export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          /*
           * TWENTY SECONDS, NOT VITEST'S FIVE. These suites are not unit tests over
           * fabricated objects: they run the real engine over the real pack — 53 tables,
           * 15,691 rows, and in one case every motor pairing for Highfield, which is about
           * 32,000 rows through a round trip. Measured 2026-09-17: that file takes 5.9 s on
           * its own and passes, and hit the 5,000 ms default only on a full run with 137
           * workers contending. A timeout that fires on load rather than on a hang teaches
           * people to re-run a red gate, which is worse than no gate.
           */
          testTimeout: 20_000,
          include: ['src/**/*.test.ts', 'tools/**/*.test.ts'],
          exclude: ['**/node_modules/**', 'tools/seed/legacy/**'],
        },
      },
      {
        extends: true,
        plugins: [react()],
        test: {
          name: 'dom',
          environment: 'happy-dom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['src/test/setup.ts'],
        },
      },
    ],
  },
})
