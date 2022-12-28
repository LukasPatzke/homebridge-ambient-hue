
export interface IStatus {
  status: boolean
}

export interface IPoint {
  id: number
  x: number
  y: number
  first?:boolean
  last?:boolean
}

export interface IPointCreate {
  id: number
  position: 'before'|'after'
}

export type Curvekind = 'ct'|'bri'|'hue'|'sat'

export interface ICurve {
  id: number
  name: string
  kind: Curvekind
  default: boolean
  offset: number
  points: IPoint[]
}

interface ILightBase {
  id: string;
  legacyId?: string;
  accessoryId: string;
  deviceId: string;
  name: string;
  type: 'unknown_archetype' | 'classic_bulb' | 'sultan_bulb' | 'flood_bulb' | 'spot_bulb' | 'candle_bulb' | 'luster_bulb' | 'pendant_round' | 'pendant_long' | 'ceiling_round' | 'ceiling_square' | 'floor_shade' | 'floor_lantern' | 'table_shade' | 'recessed_ceiling' | 'recessed_floor' | 'single_spot' | 'double_spot' | 'table_wash' | 'wall_lantern' | 'wall_shade' | 'flexible_lamp' | 'ground_spot' | 'wall_spot' | 'plug' | 'hue_go' | 'hue_lightstrip' | 'hue_iris' | 'hue_bloom' | 'bollard' | 'wall_washer' | 'hue_play' | 'vintage_bulb' | 'vintage_candle_bulb' | 'ellipse_bulb' | 'triangle_bulb' | 'small_globe_bulb' | 'large_globe_bulb' | 'edison_bulb' | 'christmas_tree' | 'string_light' | 'hue_centris' | 'hue_lightstrip_tv' | 'hue_lightstrip_pc' | 'hue_tube' | 'hue_signe' | 'pendant_spot' | 'ceiling_horizontal' | 'ceiling_tube';
  on: boolean
  smartOff: boolean
  smartOffOn: boolean
  smartOffBrightness: boolean
  smartOffColorTemperature: boolean
  currentOn: boolean
  currentBrightness: boolean | null
  currentColorTemperature: boolean | null
  published?: boolean
}
export interface ILight extends ILightBase {
  onControlled: boolean
  onThreshold: number
  colorTemperatureControlled: boolean
  brightnessControlled: boolean
  brightnessFactor: number
  brightnessCurve?: ICurve
  colorTemperatureCurve?: ICurve
}
export interface ILightInfo extends ILightBase {}

export interface ILightUpdate {
  on?: boolean
  onControlled?: boolean
  onThreshold?: number
  colorTemperatureControlled?: boolean
  brightnessControlled?: boolean
  brightnessFactor?: number
  brightnessCurveId?: number
  colorTemperatureCurveId?: number
  published?: boolean
}

interface IGroupBase {
  id: string;
  legacyId?: string;
  accessoryId: string;
  deviceId: string
  name: string;
  type: 'room' | 'zone';
  published?: boolean;
  on: boolean;
  allOnControlled: boolean;
  allBrightnessControlled: boolean;
  allColorTemperatureControlled: boolean;
  smartOff: boolean;
}

export interface IGroupInfo extends IGroupBase {
  lights: ILightInfo[];
}

export interface IGroup extends IGroupBase {
  lights: ILight[];
}

export interface IPosition {
  id: number
  position: number
  light?: ILightInfo
  group?: IGroupInfo
}

export interface IPositionMove {
  from: number,
  to: number
}

interface IBridgeBase {
  ipaddress: string
}

export interface IBridge extends IBridgeBase {
  id: string
  name: string
}
export interface IBridgeUpdate extends IBridgeBase {}

export interface IBridgeSync {
  lights: number
  groups: number
}

export interface IBridgeDiscovery {
  id: string
  internalipaddress: string
  macaddress?: string
  name?: string
}

interface IHeaderBase {
  name: string
  value: string
}

export interface IHeader extends IHeaderBase {
  id: int
}
export interface IHeaderUpdate extends IHeaderBase {}

export interface IHeaderCreate extends IHeaderBase {
  webhook_id: int
}

export type method = 'GET' | 'POST'

interface IWebhookBase {
  on: boolean
  name?: string
  url?: string
  body?: string
  method?: method
}

export interface IWebhookUpdate extends IWebhookBase {
  lights?: number[]
  groups?: number[]
}

export interface IWebHook extends IWebhookBase {
  id: int
  headers: IHeader[]
  lights: ILightInfo[]
  groups: IGroupInfo[]
}

export interface ISettings {
  smart_off: boolean
}
