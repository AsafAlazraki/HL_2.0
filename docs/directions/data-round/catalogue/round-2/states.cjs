/* The states round 2 looks at, each with what it measures. */
const rect = (sel) => {
  const el = document.querySelector(sel)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]
}

module.exports = [
  {
    id: 'b01-front',
    url: '/catalogue',
  },
  {
    id: 'b02-press-anchoring',
    url: '/catalogue',
    act: async (page) => {
      await page.getByRole('link', { name: /^Anchoring & mooring/ }).click()
      await page.waitForSelector('[data-testid="catalogue-aisle"]')
    },
    probe: () => {
      const first = document.querySelector('.chd-line, .chd-card')
      const r = first?.getBoundingClientRect()
      const dock = document.querySelector('.chd-dock')?.getBoundingClientRect()
      return {
        firstPartTop: r ? Math.round(r.top) : null,
        firstPartBottom: r ? Math.round(r.bottom) : null,
        dockBottom: dock ? Math.round(dock.bottom) : null,
        h: innerHeight,
      }
    },
  },
  {
    id: 'b03-propellers-scrolled',
    url: '/catalogue?aisle=propellers',
    act: async (page) => {
      await page.mouse.wheel(0, 3000)
      await page.waitForTimeout(600)
    },
    probe: () => {
      const dock = document.querySelector('.chd-dock')?.getBoundingClientRect()
      return {
        dockBottom: dock ? Math.round(dock.bottom) : null,
        where: document.querySelector('.chd-dock__where')?.textContent,
        h: innerHeight,
      }
    },
  },
  {
    id: 'c01-boat-popup',
    url: '/catalogue?aisle=anchoring',
    act: async (page) => {
      await page.getByRole('button', { name: 'For a boat…' }).click()
      await page.getByRole('searchbox', { name: 'Find the boat' }).fill('makes')
    },
    probe: () => {
      const pop = document.querySelector('.ui-popover')?.getBoundingClientRect()
      const input = document.querySelector('.ui-popover input')?.getBoundingClientRect()
      const title = document.querySelector('.ui-popover-title')?.getBoundingClientRect()
      return {
        pop: pop && [Math.round(pop.left), Math.round(pop.right)],
        input: input && [Math.round(input.left), Math.round(input.right)],
        titleX: title && Math.round(title.left),
      }
    },
  },
  {
    id: 'c02-boat-chosen',
    url: '/catalogue?aisle=anchoring&boat=boat_stacer%3A30',
    probe: () => {
      const pill = document.querySelector('.chd-boat[data-on]')?.getBoundingClientRect()
      const madeCode = document.querySelector('.chd-made .chd-code')?.getBoundingClientRect()
      const ledgerCode = document.querySelector('.chd-ledger .chd-code')?.getBoundingClientRect()
      const madeFig = document.querySelector('.chd-made .chd-fig')?.getBoundingClientRect()
      const ledgerFig = document.querySelector('.chd-ledger .chd-fig')?.getBoundingClientRect()
      return {
        pillH: pill && Math.round(pill.height),
        code: [madeCode && Math.round(madeCode.left), ledgerCode && Math.round(ledgerCode.left)],
        fig: [madeFig && Math.round(madeFig.right), ledgerFig && Math.round(ledgerFig.right)],
      }
    },
  },
  {
    id: 'c03-line-open',
    url: '/catalogue?aisle=anchoring&boat=boat_stacer%3A30&open=parts%3A38',
    probe: () => ({
      made: [...document.querySelectorAll('.chd-line[data-open] .chd-facts dd')].map(
        (d) => d.textContent,
      ),
      settings: document
        .querySelector('.chd-line[data-open] a.chd-way[href*="places"]')
        ?.getAttribute('href'),
    }),
  },
  {
    id: 'g04-front-heading',
    url: '/catalogue',
    act: async (page) => {
      await page.getByRole('link', { name: 'Flushers', exact: true }).click()
      await page.waitForTimeout(1200)
    },
    probe: () => {
      const h = document.querySelector('[data-heading="FLUSHERS"] h2')?.getBoundingClientRect()
      const dock = document.querySelector('.chd-dock')?.getBoundingClientRect()
      return {
        scrollY: Math.round(scrollY),
        headTop: h && Math.round(h.top),
        dockBottom: dock && Math.round(dock.bottom),
      }
    },
  },
  {
    id: 'g02-heading-url',
    url: '/catalogue?aisle=anchoring&heading=SARCA%20ANCHORS',
    act: async (page) => page.waitForTimeout(800),
    probe: () => {
      const h = document.querySelector('[data-heading="SARCA ANCHORS"] h2')?.getBoundingClientRect()
      const dock = document.querySelector('.chd-dock')?.getBoundingClientRect()
      return {
        headTop: h && Math.round(h.top),
        dockBottom: dock && Math.round(dock.bottom),
        where: document.querySelector('.chd-dock__where')?.textContent,
      }
    },
  },
  {
    id: 'b21-propellers',
    url: '/catalogue?aisle=propellers',
    probe: () => {
      const r = (q) => {
        const e = document.querySelector(q)
        if (!e) return null
        const b = e.getBoundingClientRect()
        return [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)]
      }
      return { sort: r('.chd-sort'), chips: r('.chd-suppliers'), dock: r('.chd-dock') }
    },
  },
  {
    id: 'b16-radios',
    url: '/catalogue',
    act: async (page) => {
      await page
        .getByRole('link', { name: /^Radios/ })
        .first()
        .click()
      await page.waitForSelector('[data-testid="catalogue-aisle"]')
    },
    probe: () => {
      const first = document.querySelector('.chd-card, .chd-line')?.getBoundingClientRect()
      return { firstTop: first && Math.round(first.top), h: innerHeight }
    },
  },
  {
    id: 'c04-shackle-open',
    url: '/catalogue?aisle=anchoring&boat=boat_stacer%3A30',
    act: async (page) => {
      await page.locator('.chd-made .chd-line__head').first().click()
      await page.waitForTimeout(300)
      const more = page.locator('.chd-boatsmore > summary')
      if (await more.count()) await more.first().click()
    },
    probe: () => ({
      made: document.querySelector('.chd-line[data-open] .chd-facts div:nth-child(3) dd')
        ?.textContent,
    }),
  },
  {
    id: 'd06-reef',
    url: '/catalogue?aisle=anchoring&find=Reef%20Anchor',
    act: async (page) => {
      await page.locator('.chd-line__head').first().click()
      await page.waitForTimeout(300)
    },
    probe: () => ({
      review: document
        .querySelector('.chd-line[data-open] a.chd-way[href^="/review"]')
        ?.getAttribute('href'),
      said: document.querySelector('.chd-line[data-open] .chd-said')?.textContent,
    }),
  },
  {
    id: 'h01-pictures',
    url: '/catalogue?view=pictures',
  },
  {
    id: 'b08-refusal',
    url: '/catalogue?aisle=anchoring',
    act: async (page) => {
      const lines = page.locator('.chd-ledger .chd-line__head')
      await lines.nth(5).click()
      await page
        .locator('.chd-line[data-open] input[type=file]')
        .setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') })
      await page.waitForTimeout(600)
    },
    probe: () => {
      const own = document.querySelector('.chd-line[data-open] .chd-own')?.getBoundingClientRect()
      return {
        ownBottom: own && Math.round(own.bottom),
        h: innerHeight,
        said: document.querySelector('.chd-line[data-open] .chd-own')?.textContent?.slice(0, 200),
      }
    },
  },
  {
    id: 'b15-longest',
    url: '/catalogue?find=hardtop',
    act: async (page) => {
      const heads = page.locator('.chd-line__head')
      const n = await heads.count()
      let at = 0,
        len = 0
      for (let i = 0; i < n; i++) {
        const t = (await heads.nth(i).locator('.chd-line__name').innerText()).length
        if (t > len) {
          len = t
          at = i
        }
      }
      await heads.nth(at).click()
      await page.waitForTimeout(300)
      await page.locator('.chd-line[data-open]').scrollIntoViewIfNeeded()
    },
  },
  {
    id: 'd01-quote-way',
    url: '/catalogue?aisle=anchoring&open=parts%3A38',
    act: async (page) => {
      await page.getByRole('link', { name: /Let it be quoted on its own/ }).click()
      await page.waitForTimeout(1500)
    },
    probe: () => ({
      url: location.pathname + location.search,
      h1: document.querySelector('main h1')?.textContent,
      none: /No place is called/.test(document.body.innerText),
    }),
  },
  {
    id: 'd06b-to-review',
    url: '/catalogue?aisle=anchoring&find=Reef%20Anchor',
    act: async (page) => {
      await page.locator('.chd-line__head').first().click()
      await page.getByRole('link', { name: /Put it right on Review/ }).click()
      await page.waitForTimeout(2000)
    },
    probe: () => ({
      url: location.pathname + location.search,
      reef: /Reef Anchor Kit/i.test(document.querySelector('main')?.innerText ?? ''),
    }),
  },
  {
    id: 'b30-front-keep',
    url: '/catalogue',
    act: async (page) => {
      await page.locator('.chd-door__keep').scrollIntoViewIfNeeded()
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
      await page.waitForTimeout(400)
    },
  },
]
