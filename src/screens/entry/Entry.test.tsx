import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { EntityDef, PackManifest } from '@/domain/model'
import { catalogue } from '@/state/catalogue'
import { session } from '@/state/session'
import { Entry } from './Entry'
import { auDate, factsOf, hostOf, rowFactsOf, wordmarkFor, wordmarkLines } from './facts'

/* ============================================================
   THE ENTRY SCREEN, ASKED WHAT A PERSON AT THE DESK WOULD ASK IT.

   Everything is found by role and by the words on the screen, never by
   a class: a sentence a screen reader cannot reach is not a sentence
   the app said.

   THE FILES ARE SERVED, NOT MOCKED AWAY. `fetch` is answered with a
   small pack of two tables, so every figure these tests assert — 2
   tables, 94 rows, 1 join, 91 rows of Stacer — is one the screen
   counted out of what it was served, exactly as it counts the real 53
   and 15,691. A screen that had those numbers written into it would
   pass an assertion that names them; this one cannot.

   ORDER MATTERS ONCE, and it is marked where it does: the memory
   repository is one database for the whole file, so the test that
   proves a failed load says why has to run before the one that files a
   sheet in it.
   ============================================================ */

const HERO = {
  id: 'stacer-481-seamaster',
  subject: 'Stacer 481 SeaMaster on the water',
  table: 'boat_stacer',
  model: '481 SeaMaster',
  url: 'https://www.stacer.com.au/pictures/481.jpg',
  pageUrl: 'https://www.stacer.com.au/aluminium-boat-range/sea-masters',
  kind: 'photograph' as const,
  licenceNote: 'Range page on the manufacturer’s site.',
  file: 'stacer-481-seamaster-02849fa7.webp',
  width: 1771,
  height: 1183,
  fetchedAt: '2026-09-16',
}

const MANIFEST: PackManifest = {
  version: '1',
  name: 'Northside Marine',
  sourceSha256: 'a22d3e',
  sourceFingerprint: '1qz08ne',
  packedAt: '2026-09-16T08:16:21.258Z',
  counts: { tables: 2, rows: 94, joins: 1 },
  images: { file: 'images.json', held: 1, unheld: 0, refused: 0 },
  tables: [
    {
      key: 'boat_stacer',
      id: 'boat_stacer',
      name: 'Stacer',
      role: 'base',
      rowCount: 91,
      file: 'tables/boat_stacer.json',
      costColumns: [],
    },
    {
      key: 'fit_stacer_motor',
      id: 'fit_stacer_motor',
      name: 'Stacer and the motors that fit',
      role: 'join',
      rowCount: 3,
      file: 'tables/fit_stacer_motor.json',
      costColumns: [],
    },
  ],
}

const table = (id: string, name: string): EntityDef => ({
  id,
  orgId: 'northside',
  name,
  accent: 'blue',
  fields: [],
  position: { x: 0, y: 0 },
  createdAt: '2026-09-16T00:00:00.000Z',
  updatedAt: '2026-09-16T00:00:00.000Z',
})

const ENTITIES: EntityDef[] = [
  table('boat_stacer', 'Stacer'),
  table('fit_stacer_motor', 'Stacer and the motors that fit'),
]

const row = (id: string) => ({
  id,
  orgId: 'northside',
  entityId: id.split(':')[0]!,
  values: {},
  createdAt: '2026-09-16T00:00:00.000Z',
  updatedAt: '2026-09-16T00:00:00.000Z',
})

/** The three ledgers the screen reads, and — where a test wants it —
 *  the pack behind the blue door. Anything not listed answers 404, so
 *  a screen asking for something nobody served fails loudly. */
function serve(files: Record<string, unknown>): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: unknown) => {
      const url = String(input)
      for (const [name, body] of Object.entries(files)) {
        if (url.endsWith(name)) {
          return new Response(JSON.stringify(body), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        }
      }
      return new Response('nothing here', { status: 404 })
    }),
  )
}

const LEDGERS = {
  'manifest.json': MANIFEST,
  'heroes-ledger.json': [HERO],
  'marks-ledger.json': [],
}

const WHOLE_PACK = {
  ...LEDGERS,
  'entities.json': ENTITIES,
  'tables/boat_stacer.json': [row('boat_stacer:1'), row('boat_stacer:2')],
  'tables/fit_stacer_motor.json': [row('fit_stacer_motor:1')],
}

beforeEach(() => {
  session.getState().signOut()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

async function open(goHome = vi.fn<() => void>()) {
  render(<Entry goHome={goHome} />)
  /* the screen is drawn before the three files land, with dashes where the figures will be;
     every test below waits for the row the photograph shows, which is the last thing to
     arrive, so it is measuring the screen and not the gap */
  await screen.findByRole('heading', { name: 'Stacer 481 SeaMaster' })
  return goHome
}

describe('the entry screen', () => {
  test('asks for a name, is honest that nothing is checked, and has no password field', async () => {
    serve(LEDGERS)
    await open()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Put a name to this desk.' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Put a name to this desk.' })).toBeInTheDocument()
    /* one field on the whole screen, and it is the name */
    expect(screen.getAllByRole('textbox')).toHaveLength(1)

    expect(screen.getByText('There is no password.')).toBeInTheDocument()
    expect(screen.getByText(/Nothing typed here is checked against anything/)).toBeInTheDocument()
    expect(screen.getByText(/arrives with the backend at Milestone 6/)).toBeInTheDocument()
  })

  test('the two doors say what they do, with the file’s own counts', async () => {
    serve(LEDGERS)
    await open()

    const file = screen.getByRole('button', { name: /Load the Master Price File/ })
    expect(file).toHaveAccessibleName(/2 tables/)
    expect(file).toHaveAccessibleName(/94 rows/)
    expect(file).toHaveAccessibleName(/1 of the tables are fitment joins/)

    const blank = screen.getByRole('button', { name: /Start a blank sheet/ })
    expect(blank).toHaveAccessibleName(/Loads nothing: no tables, no rows, no fitment/)
  })

  test('names the photograph’s own row in the file, from the file', async () => {
    serve(LEDGERS)
    await open()

    expect(screen.getByText('boat_stacer')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Stacer 481 SeaMaster' })).toBeInTheDocument()
    expect(screen.getByText(/The boat in this photograph is one of those rows/)).toBeInTheDocument()
    /* the row count is the table's own, not the pack's total */
    expect(screen.getByText('91')).toBeInTheDocument()
    expect(screen.getByText(/Held photograph 1,771 × 1,183/)).toBeInTheDocument()
    expect(screen.getByText(/stacer\.com\.au/)).toBeInTheDocument()
  })

  test('says why no mark is drawn rather than drawing one that is not held', async () => {
    serve(LEDGERS)
    await open()
    expect(
      screen.getByText(
        /Northside Marine’s own mark is not in this repo with provenance, so none is drawn/,
      ),
    ).toBeInTheDocument()
    /* the business's own name, read off the pack's manifest and broken at the first word.
       It is in the DOM as it is written and set in caps by the stylesheet, which is why this
       looks for the word rather than for the shout. */
    expect(screen.getByText('Northside')).toBeInTheDocument()
    expect(screen.getByText('Marine')).toBeInTheDocument()
  })

  test('draws the true empty state', async () => {
    serve(LEDGERS)
    await open()
    expect(
      screen.getByText(/No customer, no quote and no draft exists here yet/),
    ).toBeInTheDocument()
    expect(screen.getByText(/the next visit opens on Home/)).toBeInTheDocument()
  })

  /* THE SECOND DEALERSHIP'S FIRST DAY. Their image ledger does not carry
     this repo's hero id, and until 2026-09-17 that took the business's
     name off its own front door: `readEntryFacts` threw, the screen
     caught it into one sentence, and the pennant hung empty with the
     stamp, the counts and the mark note gone with it. One absent
     photograph is one absent photograph. */
  test('a ledger with no picture for this screen loses the picture and nothing else', async () => {
    serve({ ...LEDGERS, 'heroes-ledger.json': [] })
    render(<Entry goHome={vi.fn<() => void>()} />)

    expect(await screen.findByRole('heading', { name: 'No photograph here' })).toBeInTheDocument()
    expect(
      screen.getByText(/the image ledger holds no picture keyed stacer-481-seamaster/),
    ).toBeInTheDocument()
    expect(screen.getByText(/nothing stands in for one/)).toBeInTheDocument()

    /* and everything that is not the picture is still on the screen */
    expect(screen.getByText('Northside')).toBeInTheDocument()
    expect(screen.getByText('Marine')).toBeInTheDocument()
    expect(screen.getByText(/packed 16 September 2026/)).toBeInTheDocument()
    expect(screen.getByText('1qz08ne')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Load the Master Price File/ })).toHaveAccessibleName(
      /94 rows/,
    )
    expect(
      screen.getByText(/It goes on every quote written here for Northside Marine/),
    ).toBeInTheDocument()
    /* no photograph is drawn, and none is claimed */
    expect(screen.queryByText(/Held photograph/)).toBeNull()
  })

  test('a ledger entry with no held copy says that, in its own words', async () => {
    serve({
      ...LEDGERS,
      'heroes-ledger.json': [
        {
          ...HERO,
          file: undefined,
          width: undefined,
          height: undefined,
          error: 'the fetch was refused',
        },
      ],
    })
    render(<Entry goHome={vi.fn<() => void>()} />)

    expect(
      await screen.findByText(
        /the image ledger records stacer-481-seamaster and holds no copy of it/,
      ),
    ).toBeInTheDocument()
    expect(screen.getByText(/the fetch was refused/)).toBeInTheDocument()
    /* the row it depicts is still named: the ledger knew which one it was */
    expect(screen.getByText('boat_stacer')).toBeInTheDocument()
  })

  test('a manifest that cannot be read hangs no flag and says why, where the flag was', async () => {
    serve({ 'heroes-ledger.json': [HERO], 'marks-ledger.json': [] })
    render(<Entry goHome={vi.fn<() => void>()} />)

    expect(
      await screen.findByText(/The business’s own name is in the price file’s manifest/),
    ).toBeInTheDocument()
    /* twice: once where the flag would have hung, once under the door, because a reader
       looking at either one is owed the reason where they are looking */
    expect(screen.getAllByText(/manifest\.json answered 404/)).toHaveLength(2)
    /* the name is not invented, and no empty flag is drawn in its place */
    expect(screen.queryByText('Northside')).toBeNull()
    /* the door still works and says so */
    expect(
      screen.getByText(/The door still works — pressing it reads the file itself/),
    ).toBeInTheDocument()
  })

  /* THE ONE WAY BACK HERE. A named visitor is sent to Home by the
     route, so the only way this screen is drawn with a name already
     in the session is `/sign-in?again` — somebody who took the blank
     door and has come back for the file. Asking them to type a name
     the app is already printing on Home would be a question with a
     known answer. */
  test('comes back with the name this browser remembers, and says why it is open again', async () => {
    serve(LEDGERS)
    session.getState().signIn('Asaf')
    await open()

    expect(screen.getByRole('textbox', { name: 'Put a name to this desk.' })).toHaveValue('Asaf')
    expect(screen.getByText(/this is the door back to the file/)).toBeInTheDocument()
    expect(screen.queryByText(/You see this screen once/)).toBeNull()
  })

  test('a door pressed with no name is refused with its reason, and nothing happens', async () => {
    serve(LEDGERS)
    const goHome = await open()

    await userEvent.click(screen.getByRole('button', { name: /Start a blank sheet/ }))

    expect(
      screen.getByText('A name is needed — it is what the quote prints as prepared by.'),
    ).toBeInTheDocument()
    expect(goHome).not.toHaveBeenCalled()
    expect(session.getState().name).toBeNull()
    /* the refusal is tied to the field, so it is read where it is fixed */
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription(
      /A name is needed — it is what the quote prints as prepared by/,
    )
  })

  /* BEFORE THE ONE THAT FILES A SHEET: see the header. */
  test('a load that fails says why, where it was pressed, and loads nothing', async () => {
    /* the ledgers answer, so the door can state what it would load; the pack itself does
       not, which is what a half-published build looks like */
    serve(LEDGERS)
    const goHome = await open()

    await userEvent.type(screen.getByRole('textbox'), 'Asaf')
    await userEvent.click(screen.getByRole('button', { name: /Load the Master Price File/ }))

    const said = await screen.findByRole('alert')
    expect(said).toHaveTextContent(/The Master Price File was not loaded/)
    expect(said).toHaveTextContent(/entities\.json/)
    expect(said).toHaveTextContent(/the door can be pressed again/)
    expect(goHome).not.toHaveBeenCalled()
    expect(catalogue.getState().status).not.toBe('ready')
    /* not a disabled button: it is still there, still pressable */
    expect(screen.getByRole('button', { name: /Load the Master Price File/ })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  test('the blank door gives the name to the session, loads nothing, and goes to Home', async () => {
    serve(LEDGERS)
    const goHome = await open()

    await userEvent.type(screen.getByRole('textbox'), '  Asaf Alazraki  ')
    await userEvent.click(screen.getByRole('button', { name: /Start a blank sheet/ }))

    expect(session.getState().name).toBe('Asaf Alazraki')
    expect(goHome).toHaveBeenCalledOnce()
    expect(Object.keys(catalogue.getState().tables)).toHaveLength(0)
  })

  test('Escape in the field clears the name, because a field owns its own Escape', async () => {
    serve(LEDGERS)
    await open()
    const field = screen.getByRole('textbox')
    await userEvent.type(field, 'Asa')
    expect(field).toHaveValue('Asa')
    await userEvent.type(field, '{Escape}')
    expect(field).toHaveValue('')
  })

  /* LAST: this one files a sheet in the memory database for the rest of the file. */
  test('the file door loads the pack into the catalogue and goes to Home', async () => {
    serve(WHOLE_PACK)
    const goHome = await open()

    await userEvent.type(screen.getByRole('textbox'), 'Asaf')
    await userEvent.click(screen.getByRole('button', { name: /Load the Master Price File/ }))

    await waitFor(() => {
      expect(goHome).toHaveBeenCalledOnce()
    })
    expect(catalogue.getState().status).toBe('ready')
    expect(Object.keys(catalogue.getState().tables)).toEqual(['boat_stacer', 'fit_stacer_motor'])
    expect(session.getState().name).toBe('Asaf')
  })
})

/* ============================================================
   THE READINGS UNDER THE SCREEN. Each is a pure function over what the
   files say, so each is asked directly rather than through the DOM.
   ============================================================ */

describe('what the file says about itself', () => {
  test('the counts are counted off the table list, not read off the header', () => {
    const lied: PackManifest = { ...MANIFEST, counts: { tables: 99, rows: 99, joins: 99 } }
    const facts = factsOf(lied)
    expect(facts).toMatchObject({ tables: 2, rows: 94, joins: 1, business: 'Northside Marine' })
  })

  test('the photograph’s row facts are the ledger’s table and the manifest’s count', () => {
    expect(rowFactsOf(MANIFEST, HERO)).toEqual({
      key: 'boat_stacer',
      table: 'Stacer',
      rowCount: 91,
      model: '481 SeaMaster',
    })
  })

  test('a picture whose table is not in the file claims nothing', () => {
    expect(rowFactsOf(MANIFEST, { ...HERO, table: 'boat_nobody' })).toBeNull()
  })

  test('a mark is drawn only when it is held in white ink for a navy pennant', () => {
    const held = wordmarkFor(
      [
        {
          id: 'northside-white',
          brand: 'Northside Marine',
          slug: 'northside',
          variant: 'white',
          file: 'northside-white.svg',
        },
      ],
      'northside',
      'Northside Marine',
    )
    expect(held.mark?.src).toMatch(/brand-marks\/northside-white\.svg$/)
    expect(held.why).toBeNull()
  })

  test('a mark held only in dark ink is refused with its reason, as Mercury’s is the other way round', () => {
    const dark = wordmarkFor(
      [
        {
          id: 'northside',
          brand: 'Northside Marine',
          slug: 'northside',
          variant: 'dark',
          file: 'northside.png',
        },
      ],
      'northside',
      'Northside Marine',
    )
    expect(dark.mark).toBeNull()
    expect(dark.why).toMatch(/held in dark ink only, which is a smudge on navy/)
  })

  test('no entry at all says that, which is where this dealership stands', () => {
    const none = wordmarkFor([], 'northside', 'Northside Marine')
    expect(none.mark).toBeNull()
    expect(none.why).toMatch(/is not in this repo with provenance, so none is drawn/)
    expect(none.lines).toEqual(['Northside', 'Marine'])
  })

  test('the wordmark breaks at the first word, whatever the business is called', () => {
    expect(wordmarkLines('Northside Marine')).toEqual(['Northside', 'Marine'])
    expect(wordmarkLines('Brisbane Yamaha')).toEqual(['Brisbane', 'Yamaha'])
    expect(wordmarkLines('Stabicraft')).toEqual(['Stabicraft'])
    expect(wordmarkLines('The Boat Shed Co')).toEqual(['The', 'Boat Shed Co'])
  })

  test('a date is read, never written by hand, and a missing one says nothing', () => {
    expect(auDate('2026-09-16')).toBe('16 September 2026')
    expect(auDate('2026-09-16T08:16:21.258Z')).toBe('16 September 2026')
    expect(auDate(undefined)).toBeNull()
    expect(auDate('not a date')).toBeNull()
  })

  test('the source is the picture’s own host', () => {
    expect(hostOf(HERO.pageUrl)).toBe('stacer.com.au')
    expect(hostOf('nonsense')).toBeNull()
  })
})
