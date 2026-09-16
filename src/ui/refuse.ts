/**
 * The primitives refuse `className` and `style`. The refusal is the TypeScript type on each
 * primitive's props; this helper is the runtime half, for the one path that bypasses the
 * type: Base UI's `render` prop clones the element we hand it with the props it computed,
 * and among those may be a `className` or `style` key. They are dropped here so the
 * primitive's own stylesheet stays the only stylesheet that reaches it.
 *
 * The old app's ten feature stylesheets reached into primitive internals through parent
 * selectors; tools/check.ts refuses a `.ui-` selector outside src/ui for the same reason.
 */
export function withoutStyling<T extends object>(props: T): T {
  // Spread into a fresh record rather than annotating `{...props}` as one: a generic `T
  // extends object` has no string index signature, so the annotation is what TS refuses,
  // not the operation.
  const rest = { ...props } as Record<string, unknown>
  delete rest.className
  delete rest.style
  return rest as T
}

/** Join `aria-describedby` ids without losing one a caller already set. */
export function describedBy(
  existing: string | undefined,
  id: string | undefined,
): string | undefined {
  if (!id) return existing
  return existing ? `${existing} ${id}` : id
}
