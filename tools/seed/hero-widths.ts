/**
 * NARROWER COPIES OF THE HELD HEROES, so a screen can ask for the one it will actually draw.
 *
 *   npx tsx tools/seed/hero-widths.ts            # make what is missing
 *   npx tsx tools/seed/hero-widths.ts --force    # remake everything
 *
 * WHY. Measured on the built Home screen, 2026-09-17: `highfield-adv7-c66ad9ec.webp` is
 * 410,726 bytes and `stacer-519-sea-ranger-4ea6e75c.webp` is 218,766, both held 2,560 wide and
 * both fetched to be drawn 761 and 551 CSS pixels wide at 1440x900. On a cold cache the fold —
 * the first object on the app's main screen — was two dark rectangles for about two seconds.
 * The frames reserved their boxes so nothing shifted, which is right, and the screen still did
 * not feel alive, which is the sentence that killed five redesigns.
 *
 * WHAT THIS IS NOT. It is not a second picture and it is not a substitution: every copy below
 * is the HELD copy resampled down by the same library that made it (`tools/seed/heroes.ts`,
 * sharp, webp at the same quality), never enlarged, recorded in the same ledger row as the
 * picture it came from, with its own byte count and sha256. A screen names a hero by its
 * ledger id and the browser picks the width off `srcset`; nothing anywhere names a file.
 *
 * THE LADDER, AND WHY THESE THREE. The rulers run at 390, 834, 844, 1280, 1440 and 1920 CSS
 * pixels wide, and this screen's widest frame is 58% of the window inside its gutters:
 *
 *   390  in a hand, full width inside 16px gutters ..  358 css  ->  640 at 1x, 1280 at 2x
 *   834  on a tablet, full width inside 32px gutters   770 css  -> 1280 at 1x, 2560 at 2x
 *   1440 the wide frame of two ....................... 761 css  -> 1280 at 1x, 2560 at 2x
 *   1920 the wide frame of two ...................... 1040 css  -> 1280 at 1x, 2560 at 2x
 *
 * so 640 and 1280 under the held 2,560 answer every ruler at both pixel ratios with no copy
 * drawn past its own size. A fourth step between 1280 and 2560 would be a file nothing asks
 * for at any width the rulers run.
 */
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

/** the same quality the held copy was written at, so a narrower copy is the same picture */
const QUALITY = 78
const LADDER = [640, 1280] as const
const OUT_DIR = join('public', 'hero-images')
const LEDGER = join('data', 'northside', 'heroes-ledger.json')

/** One narrower copy of a held hero, recorded beside it. */
interface Width {
  width: number
  height: number
  file: string
  bytes: number
  sha256: string
}

interface Held {
  id: string
  file?: string
  width?: number
  height?: number
  error?: string
  widths?: Width[]
  [key: string]: unknown
}

const force = process.argv.includes('--force')
const ledger = JSON.parse(await readFile(LEDGER, 'utf8')) as Held[]

for (const hero of ledger) {
  if (hero.error || !hero.file || !hero.width || !hero.height) {
    console.log(`skip ${hero.id} — nothing is held for it`)
    continue
  }
  const source = join(OUT_DIR, hero.file)
  if (!existsSync(source)) {
    console.log(`skip ${hero.id} — ${hero.file} is not on disk`)
    continue
  }
  const buf = await readFile(source)
  const made: Width[] = []
  for (const width of LADDER) {
    /* NEVER ENLARGED, here as everywhere: a ladder step wider than the held copy is simply
       not written, and the held copy is then the only width there is. */
    if (width >= hero.width) continue
    const file = `${hero.file.replace(/\.webp$/, '')}-${width}.webp`
    const already = hero.widths?.find((w) => w.file === file)
    if (already && !force && existsSync(join(OUT_DIR, file))) {
      made.push(already)
      console.log(`have ${file}  ${already.width}x${already.height}`)
      continue
    }
    const out = await sharp(buf).resize({ width }).webp({ quality: QUALITY }).toBuffer()
    const meta = await sharp(out).metadata()
    await writeFile(join(OUT_DIR, file), out)
    made.push({
      width: meta.width ?? 0,
      height: meta.height ?? 0,
      file,
      bytes: out.length,
      sha256: createHash('sha256').update(out).digest('hex'),
    })
    console.log(`ok   ${file}  ${meta.width}x${meta.height}  ${(out.length / 1024) | 0} kB`)
  }
  if (made.length > 0) hero.widths = made
  else delete hero.widths
}

await writeFile(LEDGER, JSON.stringify(ledger, null, 2) + '\n')
const copies = ledger.flatMap((h) => h.widths ?? [])
console.log(
  `\n${copies.length} narrower copies, ${(copies.reduce((n, w) => n + w.bytes, 0) / 1024 / 1024).toFixed(1)} MB in ${OUT_DIR}`,
)
