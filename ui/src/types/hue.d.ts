
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
  id: number;
  uniqueId: string;
  name: string;
  type: 'On/off light'|'On/Off plug-in unit'|'Dimmable light'|'Color temperature light'|'Color light'|'Extended color light';
  modelid: string;
  manufacturername: string;
  productname: string;
  on: boolean
  smartOffActive: boolean
}
export interface ILight extends ILightBase {
  onControlled: boolean
  onThreshold: number
  ctControlled: boolean
  briControlled: boolean
  briMax: number
  briCurve?: ICurve
  ctCurve?: ICurve
}
export interface ILightInfo extends ILightBase {}

export interface ILightUpdate {
  on?: boolean
  onControlled?: boolean
  onThreshold?: number
  ctControlled?: boolean
  briControlled?: boolean
  briMax?: number
  briCurveId?: number
  ctCurveId?: number
}

interface IGroupBase {
  id: number;
  uniqueId: string;
  name: string;
  type: 'LightGroup' | 'Luminaire' | 'LightSource' | 'Room' | 'Entertainment' | 'Zone';
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
  visible: boolean
  light?: ILightInfo
  group?: IGroupInfo
}
export interface IPositionUpdate {
  visible: boolean
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
