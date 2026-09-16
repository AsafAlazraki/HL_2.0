/**
 * The primitives. Each wraps its Base UI part exactly once, refuses `className` and `style`,
 * and carries its own rules in `src/ui/*.css` under `.ui-*` selectors that nothing outside
 * this folder may reach (tools/check.ts). A screen imports from here and draws its own
 * layout around them.
 */
export { Button, type ButtonProps } from './Button'
export { Dialog, DialogClose, type DialogProps } from './Dialog'
export { Popover, type PopoverAlign, type PopoverProps, type PopoverSide } from './Popover'
export {
  Menu,
  MenuGroup,
  MenuItem,
  MenuSeparator,
  type MenuItemProps,
  type MenuProps,
} from './Menu'
export { Select, type SelectOption, type SelectProps } from './Select'
export { Tooltip, TooltipProvider, type TooltipProps } from './Tooltip'
export { Field, type FieldProps } from './Field'
export { Input, type InputProps } from './Input'
export { Toaster, say, undo } from './Toaster'
export { PriceFigure, type PriceFigureProps } from './PriceFigure'
export { Figure, type FigureProps } from './Figure'
export { Tile, type TileProps } from './Tile'
export { Kbd, platformKey } from './Kbd'
export { Refusal } from './Refusal'
export { spring, transition, reducedMotion, type SpringName } from './motion'
export { closesStage, isField, stageKeyOf, type StageKey } from './keys'
