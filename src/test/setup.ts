import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { MotionGlobalConfig } from 'motion/react'

/* MOTION IS SKIPPED UNDER TEST (2026-09-28, with the component kit). Every `motion` component
   lands on its end state at once: a component test asks what a person can reach and read, never
   a frame of a spring, and happy-dom's Web Animations reject an animation's `finished` promise
   when it is cancelled — which `motion` leaves unhandled when a test unmounts a chapter mid-open,
   and which vitest then reports as an error against whichever test ran next. */
MotionGlobalConfig.skipAnimations = true

afterEach(() => {
  cleanup()
})
