import { useEffect, useRef, useState, type RefObject } from 'react'

/* ============================================================
   A FILE DROPPED ON A PLACE ON THE SHELF. The drop is a convenience
   beside a real button ("Choose a workbook", "Choose a copy"), never
   the only way in, so a keyboard reaches everything without it. It is
   listened for on the window and answered only over the element it
   names, which keeps the handlers off an element that is not a control.
   ============================================================ */
export function useDrop<T extends HTMLElement>(
  take: (file: File) => void,
): { ref: RefObject<T | null>; over: boolean } {
  const ref = useRef<T | null>(null)
  const [over, setOver] = useState(false)
  const takeRef = useRef(take)
  useEffect(() => {
    takeRef.current = take
  }, [take])
  useEffect(() => {
    const inside = (e: DragEvent): boolean =>
      ref.current !== null && e.target instanceof Node && ref.current.contains(e.target)
    const onOver = (e: DragEvent): void => {
      if (!inside(e)) {
        setOver(false)
        return
      }
      e.preventDefault()
      setOver(true)
    }
    const onDrop = (e: DragEvent): void => {
      if (!inside(e)) return
      e.preventDefault()
      setOver(false)
      const file = e.dataTransfer?.files[0]
      if (file) takeRef.current(file)
    }
    const onLeave = (e: DragEvent): void => {
      if (e.relatedTarget === null) setOver(false)
    }
    window.addEventListener('dragover', onOver)
    window.addEventListener('drop', onDrop)
    window.addEventListener('dragleave', onLeave)
    return () => {
      window.removeEventListener('dragover', onOver)
      window.removeEventListener('drop', onDrop)
      window.removeEventListener('dragleave', onLeave)
    }
  }, [])
  return { ref, over }
}
