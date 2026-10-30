import { createFileRoute, redirect } from '@tanstack/react-router'
import { session } from '@/state/session'

/* ============================================================
   /places — NOT A SCREEN ANY MORE: it sends a person to Data.

   Milestone 4 drew every maker and list as a card on its own colour
   here, beside Data's plates and rows of the same 25 lists, with the
   same figures and Data lit on the pill for both. The critique of the
   built milestone (built-critique-m4.md, major 1) called it one register
   drawn twice behind one door, and simple wins: Data is the one
   register, and a maker's own page (`/places/$id`, its line, mark,
   photograph and colour) opens from its spread there.

   The address stays so that a kept link still lands somewhere true. It
   is `places.index.tsx` and not `places.tsx` for /data's reason: a
   `places.tsx` would be a layout wrapping `places.$id.tsx`. Behind the
   same door as every screen: a browser with no name lands on Entry.
   ============================================================ */

export const Route = createFileRoute('/places/')({
  beforeLoad: () => {
    if (!session.getState().name) throw redirect({ to: '/sign-in' })
    throw redirect({ to: '/data', replace: true })
  },
})
