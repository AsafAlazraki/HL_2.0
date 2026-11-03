import type { ComponentType } from 'react'
import {
  AnchorIcon,
  BatteryChargingIcon,
  BoatIcon,
  DropIcon,
  FanIcon,
  FishSimpleIcon,
  LifebuoyIcon,
  LightbulbIcon,
  LightningIcon,
  QuestionIcon,
  RadioIcon,
  SpeakerHifiIcon,
  SteeringWheelIcon,
  StickerIcon,
  ToolboxIcon,
  TruckTrailerIcon,
  UmbrellaIcon,
  WavesIcon,
  WrenchIcon,
  type IconProps as PhosphorProps,
} from '@phosphor-icons/react'
import { UNSORTED } from '@/domain/catalogue/aisles'

/** THE DRAWING EACH AISLE IS NAMED BY: a kind of thing, never a product (BCF's "shop by"). One
 *  map, read by the build's chandlery and by /catalogue alike. */
export const DRAWN: Record<string, ComponentType<PhosphorProps>> = {
  sounders: WavesIcon,
  radios: RadioIcon,
  stereo: SpeakerHifiIcon,
  safety: LifebuoyIcon,
  anchoring: AnchorIcon,
  power: BatteryChargingIcon,
  lights: LightbulbIcon,
  trailer: TruckTrailerIcon,
  covers: UmbrellaIcon,
  fishing: FishSimpleIcon,
  electric: LightningIcon,
  propellers: FanIcon,
  steering: SteeringWheelIcon,
  plumbing: DropIcon,
  deck: WrenchIcon,
  highfield: BoatIcon,
  decals: StickerIcon,
  workshop: ToolboxIcon,
  [UNSORTED]: QuestionIcon,
}

export const drawnOf = (aisle: string): ComponentType<PhosphorProps> => DRAWN[aisle] ?? QuestionIcon
