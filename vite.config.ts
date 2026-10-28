import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
// `URL` is imported rather than taken from the global: tsconfig.node.json has no DOM lib,
// so the ambient `URL` is not the one `node:url` expects (TS2769 under typescript 7).
import { URL, fileURLToPath } from 'node:url'
import { DEV_PORT, PREVIEW_PORT } from './tools/ports.ts'
import { servePack } from './tools/seed/servePack.ts'
import { pagesFallback } from './tools/pages.ts'

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
    // The seed pack, served from data/northside in dev and emitted into dist at build.
    servePack(),
    // dist/404.html, the app again, so a deep address on GitHub Pages opens in the app.
    pagesFallback(),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: DEV_PORT, strictPort: true },
  preview: { port: PREVIEW_PORT, strictPort: true },
})
