import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { appRouter } from './app/router'
import { bindTheme } from './app/theme'
import { prefs } from './state/prefs'
import './styles/app.css'

/* Day unless a person chose night, on <html> before the first render (src/app/theme.ts). */
bindTheme(document.documentElement, prefs)

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
