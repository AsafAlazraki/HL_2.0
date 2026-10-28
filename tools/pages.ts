import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

/* ============================================================
   DEEP LINKS ON GITHUB PAGES.

   Pages has no rewrite rule: an address it holds no file for is answered
   with the site's own 404.html. So a reviewer sent `/HL_2.0/quotes`, or
   pressing refresh on a quote's own address, would land on GitHub's 404
   rather than in the app. The answer is the app itself under that name: a
   byte-for-byte copy of the built index.html, which boots the router on
   whatever address the browser is at.
   ============================================================ */
export function pagesFallback(): Plugin {
  return {
    name: 'hl2-pages-fallback',
    apply: 'build',
    writeBundle(options, bundle) {
      const page = bundle['index.html']
      if (page?.type !== 'asset' || !options.dir) return
      writeFileSync(join(options.dir, '404.html'), page.source)
    },
  }
}
