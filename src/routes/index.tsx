import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { loadAll } from '@/data/pack/load'
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

  useEffect(() => {
    if (catalogue.getState().status !== 'empty') return
    const began = performance.now()
    void loadAll()
      .then((pack) =>
        catalogue.getState().load({
          entities: pack.entities,
          rowsByEntity: pack.rowsByEntity,
          manifest: pack.manifest,
        }),
      )
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
            {ms === null ? '' : ` · read in ${ms} ms`}
          </p>
        </>
      )}
    </main>
  )
}
