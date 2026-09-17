/**
 * The one place the ports live. `vite.config.ts`, `playwright.config.ts` and every harness
 * import these. `.claude/launch.json` is JSON and cannot import, so it repeats BOTH of them
 * and `tools/ports.test.ts` fails if either pair ever disagrees — the old repo's 5090/5411
 * split once had a harness measuring an empty app.
 *
 * WHY THE PREVIEW PORT CAN BE OVERRIDDEN, AND WHY THE SERVER IS NEVER REUSED.
 * Measured 2026-09-17: two `npm run e2e` runs on this machine at once produced seventeen
 * failures, every one `net::ERR_CONNECTION_REFUSED` on 5101. Neither run was broken. Under
 * Playwright's `reuseExistingServer`, the second run adopted the first run's `vite preview`,
 * and when the first finished it killed the server out from under the second — which then
 * reported failures against the code rather than against the machine, and cost a session the
 * time to chase it.
 *
 * So: the preview server is never reused (a run owns the server it measures), and the port
 * may be moved by `HL2_PREVIEW_PORT` so two runs can coexist deliberately. With `strictPort`
 * on, a second run that does NOT move its port now fails immediately with "Port 5101 is
 * already in use" — one sentence naming the real problem, instead of seventeen refusals
 * naming the wrong one.
 */
const fromEnv = (name: string, fallback: number): number => {
  const raw = process.env[name]
  if (!raw) return fallback
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1024 || n > 65_535)
    throw new Error(`${name}="${raw}" is not a usable port. Give it an integer from 1024 to 65535.`)
  return n
}

export const DEV_PORT = fromEnv('HL2_DEV_PORT', 5100)
export const PREVIEW_PORT = fromEnv('HL2_PREVIEW_PORT', 5101)

/** What `.claude/launch.json` repeats, and what `tools/ports.test.ts` holds it to. */
export const DEFAULT_DEV_PORT = 5100
export const DEFAULT_PREVIEW_PORT = 5101
