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
  id: '5750ac15-d217-507d-92b9-b0567fb03ba9',
  accessoryId: '5750ac15-d217-507d-92b9-b0567fb03ba9',
  deviceId: '5750ac15-d217-507d-92b9-b0567fb03ba9',
  name: 'Dummy',
  type: 'classic_bulb',
  on: false,
  smartOff: false,
  smartOffOn: false,
  smartOffBrightness: false,
  smartOffColorTemperature: false,
  currentOn: true,
  currentBrightness: null,
  currentColorTemperature: null
}

export const light: ILight = {
  ...lightInfo,
  onControlled: false,
  onThreshold: 0,
  colorTemperatureControlled: false,
  brightnessControlled: false,
  brightnessFactor: 0,
  brightnessCurve: {...curve, kind:'bri'},
  colorTemperatureCurve: {...curve, kind:'ct'}
}

export const position: IPosition = {
  id: 0,
  position: 0,
  light: light
}