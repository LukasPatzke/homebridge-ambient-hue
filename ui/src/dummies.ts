import { ILight, IPoint, ILightInfo, ICurve, IPosition } from "./types/hue";

export const point: IPoint = {
  id: 0,
  x: 100,
  y: 200
}

export const curve: ICurve = {
  id: 0,
  name: 'Dummy',
  kind: 'ct',
  default: true,
  offset: 0,
  points: [
    {...point, first: true},
    point,
    {...point, last: true}
  ]
}

export const briCurve: ICurve = {
  ...curve,
  kind: 'bri',
  default: true
}

export const ctCurve: ICurve = {
  ...curve,
  kind: 'ct',
  default: true
}

export const lightInfo: ILightInfo = {
  id: 0,
  name: 'Dummy',
  type: 'On/off light',
  modelid: 'Dummy Model',
  manufacturername: 'Dummy Manufaturer',
  productname: 'Dummt Product',
  on: false,
  smart_off_active: false
}

export const light: ILight = {
  ...lightInfo,
  on_controlled: false,
  on_threshold: 0,
  ct_controlled: false,
  bri_controlled: false,
  bri_max: 0,
  bri_curve: {...curve, kind:'bri'},
  ct_curve: {...curve, kind:'ct'}
}

export const position: IPosition = {
  id: 0,
  position: 0,
  visible: true,
  light: light
}