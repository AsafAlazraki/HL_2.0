import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { repositories } from '@/data'
import { PACK_ORG_ID, openCatalogue } from '@/data/pack/boot'
import { catalogue } from '@/state/catalogue'
import { useCatalogue } from '@/app/useStores'
import './foundation.css'

export const Route = createFileRoute('/')({ component: Foundation })

/**
 * MILESTONE 0's PROOF, NOT A SCREEN.
 *
 * No entry or home direction has been picked yet (docs/directions/ holds four boards each and
 * the owner has not chosen), so nothing here is a design. What it is for is the one thing no
 * test can show: that the whole stack works in a real browser — the pack is served, fetched,
 * parsed, loaded into the catalogue store, and counted back out at the size the manifest
 * promised. It is replaced wholesale by the picked direction.
 *
 * Every figure below is read from what actually loaded, never from the manifest's own header,
 * so a table that failed to arrive shows as a smaller number rather than the number we hoped
 * for.
 */
function Foundation() {
  const status = useCatalogue((s) => s.status)
  const problem = useCatalogue((s) => s.problem)
  const version = useCatalogue((s) => s.version)
  const tables = useCatalogue((s) => s.tables)
  const rows = useCatalogue((s) => s.rows)
  const [ms, setMs] = useState<number | null>(null)
  const [from, setFrom] = useState<'pack' | 'repository' | null>(null)
  const [unkept, setUnkept] = useState<string | null>(null)

  useEffect(() => {
    if (catalogue.getState().status !== 'empty') return
    const began = performance.now()
    /* THE WHOLE SEAM, IN THE ORDER IT HAPPENS. `openCatalogue` asks
       the database first: on a second visit the sheet is already down
       there and no JSON is fetched at all, which is the half of
       Milestone 0's exit criterion ("the pack loads into IndexedDB and
       reloads") that a reload is the only way to see. */
    void openCatalogue(repositories(PACK_ORG_ID).catalogue)
      .then((opened) => {
        setFrom(opened.from)
        setUnkept(opened.unkept ?? null)
        return catalogue.getState().load(opened.source)
      })
      .finally(() => setMs(Math.round(performance.now() - began)))
  }, [])

  const tableList = Object.values(tables)
  const rowCount = Object.values(rows).reduce((n, list) => n + list.length, 0)
  const joins = tableList.filter((t) => t.role === 'join').length

  return (
    <main data-testid="home" className="foundation">
      <h1>HelmLogic</h1>
      <p className="lede">
        Milestone 0. The engine and the price file are here; no screen has been designed yet.
      </p>

      {status === 'loading' && <p data-testid="pack-status">Reading the Master Price File…</p>}

      {status === 'failed' && (
        <p data-testid="pack-status" className="problem" role="alert">
          The file could not be read. {problem}
        </p>
      )}

      {status === 'ready' && (
        <>
          <dl data-testid="pack-counts">
            <div>
              <dt>Tables</dt>
              <dd>{tableList.length}</dd>
            </div>
            <div>
              <dt>Rows</dt>
              <dd>{rowCount.toLocaleString('en-AU')}</dd>
            </div>
            <div>
              <dt>Fitment joins</dt>
              <dd>{joins}</dd>
            </div>
          </dl>
          <p className="foot">
            Pack {version}
            {from === null
              ? ''
              : from === 'pack'
                ? ' · read from the file'
                : ' · read from this browser'}
            {ms === null ? '' : ` · in ${ms} ms`}
          </p>
          {unkept !== null && (
            /* `output`, not a paragraph with a role — it announces
               itself, and the lint prefers the element over the role */
            <output className="problem">
              The file was read but could not be kept in this browser, so the next visit reads it
              again. {unkept}
            </output>
          )}
        </>
      )}
    </main>
  )
}
