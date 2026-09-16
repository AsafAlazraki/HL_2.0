import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Foundation,
})

/**
 * Milestone 0 placeholder. Home is designed from its own reference sweep and direction
 * board (docs/directions/home.md) before anything is drawn here.
 */
function Foundation() {
  return (
    <main data-testid="home" className="min-h-dvh grid place-items-center p-6">
      <p className="text-sm">HelmLogic — foundation. No screen has been designed yet.</p>
    </main>
  )
}
