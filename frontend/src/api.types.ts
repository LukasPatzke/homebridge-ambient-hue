export interface Point {
  id: number;
  x: number;
  y: number;
  first?: boolean;
  last?: boolean;
  resource: string;
}

export interface PointCreate {
  id: number;
  position: 'before' | 'after';
}

export type curvekind = 'ct' | 'bri';

export interface Curve {
  id: number;
  name: string;
  kind: curvekind;
  default: boolean;
  offset: number;
  points: Point[];
  resource: string;
}

export interface Light {
  id: number;
  hueId: string;
  legacyId?: string;
  accessoryId: string;
  deviceId: string;
  name: string;
  archetype:
    | 'unknown_archetype'
    | 'classic_bulb'
    | 'sultan_bulb'
    | 'flood_bulb'
    | 'spot_bulb'
    | 'candle_bulb'
    | 'luster_bulb'
    | 'pendant_round'
    | 'pendant_long'
    | 'ceiling_round'
    | 'ceiling_square'
    | 'floor_shade'
    | 'floor_lantern'
    | 'table_shade'
    | 'recessed_ceiling'
    | 'recessed_floor'
    | 'single_spot'
    | 'double_spot'
    | 'table_wash'
    | 'wall_lantern'
    | 'wall_shade'
    | 'flexible_lamp'
    | 'ground_spot'
    | 'wall_spot'
    | 'plug'
    | 'hue_go'
    | 'hue_lightstrip'
    | 'hue_iris'
    | 'hue_bloom'
    | 'bollard'
    | 'wall_washer'
    | 'hue_play'
    | 'vintage_bulb'
    | 'vintage_candle_bulb'
    | 'ellipse_bulb'
    | 'triangle_bulb'
    | 'small_globe_bulb'
    | 'large_globe_bulb'
    | 'edison_bulb'
    | 'christmas_tree'
    | 'string_light'
    | 'hue_centris'
    | 'hue_lightstrip_tv'
    | 'hue_lightstrip_pc'
    | 'hue_tube'
    | 'hue_signe'
    | 'pendant_spot'
    | 'ceiling_horizontal'
    | 'ceiling_tube';
  on: boolean;
  onControlled: boolean;
  onThreshold: number;
  brightnessControlled: boolean;
  brightnessFactor: number;
  colorTempertureControlled: boolean;
  lastOn?: boolean;
  lastBrightness?: number;
  lastColorTemperature?: number;
  smartOff: boolean;
  smartOffOn: boolean;
  smartOffBrightness: boolean;
  smartOffColorTemperature: boolean;
  currentOn: boolean;
  currentBrightness: boolean | null;
  currentColorTemperature: boolean | null;
  published: boolean;
  isBrightnessCapable: boolean;
  isColorTemperatureCapable: boolean;
  brightnessCurve: Curve;
  brightnessCurveId: number;
  colorTemperatureCurve: Curve;
  colorTemperatureCurveId: number;
  resource: string;
}

export interface Group {
  id: number;
  hueId: string;
  legacyId?: string;
  accessoryId: string;
  name: string;
  type: 'room' | 'zone';
  published: boolean;
  lights: Light[];
  on: boolean;
  onControlled: boolean;
  onThreshold: number;
  brightnessControlled: boolean;
  brightnessFactor: number;
  colorTempertureControlled: boolean;
  isBrightnessCapable: boolean;
  isColorTemperatureCapable: boolean;
  brightnessCurve: Curve;
  brightnessCurveId: number;
  colorTemperatureCurve: Curve;
  colorTemperatureCurveId: number;
  resource: string;
}

export type Accessory = Group | Light;

export function isGroup(accessory: Accessory): accessory is Group {
  return (accessory as Group).type !== undefined;
}
