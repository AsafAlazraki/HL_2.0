/* Draw the boards: node docs/directions/data-round/catalogue/boards/draw.mjs [a b c] */
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const which = process.argv.slice(2).length ? process.argv.slice(2) : ['a', 'b', 'c']
for (const id of which) {
  const { html } = await import(`./${id}.mjs`)
  writeFileSync(path.join(HERE, `${id}.html`), html)
  console.log('drew', id, html.length)
}
