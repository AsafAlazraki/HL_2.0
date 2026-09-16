/**
 * The one place the ports live. `vite.config.ts`, `playwright.config.ts` and every
 * harness import these. `.claude/launch.json` is JSON and cannot import, so it repeats
 * the dev port and `tools/ports.test.ts` fails if the two ever disagree — the old repo's
 * 5090/5411 split once had a harness measuring an empty app.
 */
export const DEV_PORT = 5100
export const PREVIEW_PORT = 5101
