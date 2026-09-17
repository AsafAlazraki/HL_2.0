/* ============================================================
   LEVEL OF DETAIL — what a sheet is worth drawing at this zoom.

   THE MEASUREMENT, not a taste.

   A data row is `ROW_H` = 40 drawing units tall and its type is set
   at 14px. On the blueprint both are multiplied by the camera's
   zoom, so what the reader actually sees is:

       zoom   row on screen   type on screen
       1.00       40.0 px          14.0 px
       0.80       32.0 px          11.2 px
       0.70       28.0 px           9.8 px
       0.60       24.0 px           8.4 px     <- the floor
       0.53       21.2 px           7.4 px     (the reported zoom)
       0.50       20.0 px           7.0 px

   Below 8.4px neither Archivo nor IBM Plex Mono resolves — the cells
   are grey texture, and six complete registers' worth of that texture
   is what the browser was re-compositing on every pan frame. So at
   0.6 and below the card stops drawing a grid it cannot show and
   draws its PLATE instead: the kind's mark, the name set large enough
   to actually read at that distance, the two figures, the bands.
   Nothing legible is lost because nothing there was legible.

   HYSTERESIS. A wheel gesture crosses the threshold many times as it
   settles, and a card that swapped its whole body twice per frame
   would be worse than the problem. So there are two thresholds and a
   dead band between them: the plate is entered below 0.60 and left
   above 0.66, and inside the band the card keeps whatever it was.

   THE SUBSCRIPTION IS THE POINT. `useStore` is given a selector that
   answers a three-valued BAND, never the zoom itself: a pan or a zoom
   that does not cross a threshold returns the same value and React
   Flow's store bails the node out of re-rendering entirely. Reading
   `useViewport()` here instead would re-render every node — and
   therefore every cell — on every frame of every gesture.

   PORT NOTE (HL_2.0). What crossed over is the DECISION and the
   measurements it was taken from; what stayed behind is every line
   that talked to React Flow or the clock — `useSheetPlate`,
   `useCameraStill`, the one imperative `store.subscribe` they shared,
   and the `performance.now()` timestamp it wrote. xyflow is not in
   this repository at all (the flow-graph canvas was deliberately
   dropped) and `src/domain` may not hold a subscription across
   events, so the selector's store read becomes its argument: the
   caller passes the zoom it already has.

   The two timing constants are exported rather than dropped, because
   their measured argument below is the reason the sheet screen will
   write its settle the way it does, and a number with its reason
   removed is a number somebody re-guesses.
   ============================================================ */

/** At or below this the card draws its plate. See the table above. */
export const PLATE_ZOOM_IN = 0.6
/** And it takes the grid back only once clearly past it. */
export const PLATE_ZOOM_OUT = 0.66

/** Kept next to the thresholds so the tests and the notes above can
 *  be checked against the same numbers the grid is built from. Moved
 *  with `ROW_H` when the 34/40 disagreement between the maths and the
 *  paint was measured and closed — see `helpers.ts`. */
export const LOD_ROW_H = 40
export const LOD_TYPE_PX = 14

export type Band = 'plate' | 'grid' | 'hold'

/** The band this zoom falls in. `hold` is the dead band: the caller
 *  keeps whatever the card already was. */
export function lodBand(zoom: number): Band {
  const z = zoom
  if (z <= PLATE_ZOOM_IN) return 'plate'
  if (z >= PLATE_ZOOM_OUT) return 'grid'
  return 'hold'
}

/* ============================================================
   NO HEAVY WORK MID-GESTURE.

   Dropping the grid is relief and happens on the frame it is asked
   for. TAKING it back is the expensive direction — six cards mounting
   six complete registers inside one frame of a wheel gesture measured
   at 200ms, which is a visible stall exactly when the reader is
   moving. So a card takes its grid back only once the camera has been
   STILL for `SETTLE_MS`. Zoom through the threshold and nothing is
   built; stop, and the registers develop.

   The same gate covers the other way a grid gets built during a
   gesture: `onlyRenderVisibleElements` mounts a card the moment it
   enters the window, so a card arriving mid-pan opens as a plate too
   and fills in when the sheet comes to rest.

   HOW IT WATCHES. One imperative subscription per flow store — not
   per node, and never through `useStore` — so a moving camera writes
   a timestamp and re-arms a timer and re-renders NOTHING. The only
   two renders a card spends on a gesture are the two it needs: the
   one that gives the grid up and the one that takes it back.
   ============================================================ */

/** How long the camera must be still before a card rebuilds its
 *  register. Short enough to read as "immediately after I stopped",
 *  long enough that no frame of a gesture ever carries a mount. */
export const SETTLE_MS = 110

/** …and the beat between one card taking its register back and the
 *  next. Six cards rebuilding inside one frame is one long frame; six
 *  cards rebuilding one beat apart is a drawing developing, and no
 *  frame carries more than one register's worth of work. */
export const STAGGER_MS = 70

/** When the card in queue position `slot` may take its register back,
 *  in milliseconds from the moment the camera stopped. `slot` is the
 *  card's place in the waiting queue, and insertion order IS the
 *  queue: the card that has been waiting longest rebuilds first, and
 *  each one after it a beat later. */
export function rebuildDelay(slot: number): number {
  return SETTLE_MS + slot * STAGGER_MS
}

/* ============================================================
   IS THE CAMERA STILL?

   The same question `useSheetPlate` above answers for a card's
   register, asked for anything else that costs a frame to draw. It
   shares the ONE imperative subscription that file already keeps, so
   a second watcher is not added to the store.

   WHY IT EXISTS. Measured on the built app (row 43,
   `tools/teardown/zoomframes.mjs`, frames kept in order rather than
   sorted into percentiles): a wheel zoom that crosses 0.70 — where
   `sheetZoom` puts the link names on — spends 53.3ms on the single
   frame where 37 labels arrive, the worst frame in the gesture. And
   every frame above 0.70 carries those 26-37 SVG text chips, each of
   which the browser must re-rasterise at the new scale, because a
   scale transform cannot be composited the way a pan can. That is
   why pan sits at this machine's floor and zoom does not.

   So the names wait for the camera, exactly as the registers do.
   Nothing is lost: a label is there to be READ, and nobody reads one
   while the sheet is still moving under them.

   NO HYSTERESIS AND NO TIMER PER CALLER. One timestamp, one timer,
   one re-render each way.
   ============================================================ */
