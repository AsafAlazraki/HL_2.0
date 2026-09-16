/**
 * A refusal is a sentence with its reason, where it is refused. Button, Tile, MenuItem and
 * Select items render this beneath the control and point `aria-describedby` at it, so a
 * screen reader hears the reason on the control itself.
 */
export function Refusal({ id, children }: { id?: string; children: string }) {
  return (
    <span id={id} className="ui-refusal">
      {children}
    </span>
  )
}
