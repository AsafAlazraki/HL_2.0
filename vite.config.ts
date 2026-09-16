import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
// `URL` is imported rather than taken from the global: tsconfig.node.json has no DOM lib,
// so the ambient `URL` is not the one `node:url` expects (TS2769 under typescript 7).
import { URL, fileURLToPath } from 'node:url'
import { DEV_PORT, PREVIEW_PORT } from './tools/ports.ts'

export default defineConfig({
  plugins: [
    // Must run before react(): it rewrites route files before JSX is compiled.
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
      quoteStyle: 'single',
      semicolons: false,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: DEV_PORT, strictPort: true },
  preview: { port: PREVIEW_PORT, strictPort: true },
})
