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
