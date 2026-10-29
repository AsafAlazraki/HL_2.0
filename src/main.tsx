import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { appRouter } from './app/router'
import { bindTheme } from './app/theme'
import { bindLook } from './app/appearance'
import { PACK_ORG_ID } from './data/pack/boot'
import { catalogue } from './state/catalogue'
import { prefs } from './state/prefs'
import './styles/app.css'

/* Day unless a person chose night, on <html> before the first render (src/app/theme.ts). */
bindTheme(document.documentElement, prefs)

/* Northside's look and this person's own, in one <style> element, before the first render; and
   Northside's settings read at once, so the door and the colour stand before the price list is
   opened (src/app/appearance.ts, Milestone 4). */
bindLook(document, catalogue, prefs)
void catalogue.getState().readOrg(PACK_ORG_ID)

/* The router itself, its options and the `Register` declaration that types every `to` in
   the app are in `src/app/router.ts`, so that a test drives the router this file mounts
   rather than a second one built beside it. Its header says what that cost when it was not
   true. */
const router = appRouter()

const root = document.getElementById('root')
if (!root) throw new Error('index.html has no #root')

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
