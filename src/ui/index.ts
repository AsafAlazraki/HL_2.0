/**
 * The primitives. Each wraps its Base UI part exactly once (where Base UI has one), refuses
 * `className` and `style`, and carries its own rules in `src/ui/*.css` under `.ui-*` selectors
 * that nothing outside this folder may reach (tools/check.ts). A screen imports from here and
 * draws its own layout around them.
 *
 * THE KIT (2026-09-28) is board C, "Signal": colour and icon, blue and white, every ink one
 * job (src/styles/tokens.css, THE KIT). `/kit` draws every primitive here in every state.
 *
 * GSAP's ScrollTrigger and Lenis are NOT exported from here, so a screen that draws a button
 * does not download them: a screen that scrolls by chapters imports '@/ui/scroll'.
 */
export { Button, type ButtonProps } from './Button'
export { Chip, type ChipProps } from './Chip'
export { Segmented, type SegmentedOption, type SegmentedProps } from './Segmented'
export { Toggle, type ToggleProps } from './Toggle'
export { Dialog, DialogClose, Sheet, type DialogProps } from './Dialog'
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
export { Toaster, Toast, say, undo, unsay } from './Toaster'
export type { ToastOptions } from './Toaster'
export { PriceFigure, type PriceFigureProps } from './PriceFigure'
export { Figure, type FigureProps } from './Figure'
export { Tile, type TileProps } from './Tile'
export { OptionTile, type OptionTileProps } from './OptionTile'
export { Kbd, platformKey } from './Kbd'
export { Refusal } from './Refusal'
export { Swatches } from './Swatches'
export { Icon, type Glyph, type IconProps } from './Icon'
export { KindMark, type KindMarkProps } from './KindMark'
export { KIND_GLYPH, STATE_GLYPH, kindInk, type QuoteState } from './glyphs'
export { StatusDot, BandHead, type BandHeadProps } from './Status'
export { Stat, type StatProps } from './Stat'
export { Plate, type PlateProps } from './Plate'
export { Row, type RowProps } from './Row'
export { Chapter, type ChapterProps } from './Chapter'
export { Moving, type MovingProps } from './Moving'
export { Dashes, type DashesProps } from './Dashes'
export { Picture, sharedName, type PictureProps } from './Picture'
export { Band, Water, type BandProps } from './Band'
export { MotionRoot, useStill } from './MotionRoot'
export { morph, canMorph } from './transition'
export {
  move,
  critically,
  settlesIn,
  RESPONSE,
  transition,
  reducedMotion,
  holdsCaret,
  caretInField,
  type MoveName,
} from './motion'
export { closesStage, isField, stageKeyOf, type StageKey } from './keys'
