
export interface Error {
  description: string;
}

export interface JSONResponse<T = any> {
  errors: Error[];
  data: T[];
}

export interface StreamingResponse<T = any> {
  type: 'update' | 'add' | 'delete' | 'error';
  id: string;
  creationtime: string;
  data: T[];
}

export type ResourceType =
      'device'
    | 'bridge_home'
    | 'room'
    | 'zone'
    | 'light'
    | 'button'
    | 'temperature'
    | 'light_level'
    | 'motion'
    | 'entertainment'
    | 'grouped_light'
    | 'device_power'
    | 'zigbee_bridge_connectivity'
    | 'zigbee_connectivity'
    | 'zgp_connectivity'
    | 'bridge'
    | 'homekit'
    | 'scene'
    | 'entertainment_configuration'
    | 'public_image'
    | 'auth_v1'
    | 'behavior_script'
    | 'behavior_instance'
    | 'geofence'
    | 'geofence_client'
    | 'geolocation';

interface Resource {
  id: string;
  id_v1?: string;
  type: ResourceType;
}

export interface ResourceIdentifier {
  rid: string;
  rtype: ResourceType;
}

export interface xy {
  x: number;
  y: number;
}

export interface OnState {
  on: boolean;
}

interface LightDimming {
  brightness: number;
  min_dim_level?: number;
}

export interface LightGet extends Resource {
  type: 'light';
  alert: { action_values: string[] };
  color?: {
    gamut: { blue: xy; green: xy; red: xy };
    gamut_type: string;
    xy: xy;
  };
  color_temperature?: {
    mirek: number;
    mirek_schema?: { mirek_maximum: number; mirek_minimum: number };
    mirek_valid?: boolean;
  };
  dimming?: LightDimming;
  dynamics?: {
    speed: number;
    speed_valid: boolean;
    status: string;
    status_values: string[];
  };
  effects?: {
    effect_values: string[];
    status: string;
    status_values: string[];
  };
  gradient?: { points: Array<{ color: { xy: xy } }>; points_capable: number };
  metadata: { archetype: string; name: string };
  mode: string;
  on: OnState;
  owner: ResourceIdentifier;
}

export interface RoomGet extends Resource {
  type: 'room';
  children: ResourceIdentifier[];
  metadata: { archetype: string; name: string };
  services: ResourceIdentifier[];
}

export interface ZoneGet extends Resource {
  type: 'zone';
  children: ResourceIdentifier[];
  services: ResourceIdentifier[];
  metadata: {
    name: string;
    archetype: string;
  };
}

export interface DeviceGet extends Resource {
  services: ResourceIdentifier[];
  metadata: {
    name?: string;
    archetype?:
      | 'bridge_v2'
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
      | 'christmas_tree'
      | 'hue_centris'
      | 'hue_lightstrip_tv'
      | 'hue_tube'
      | 'hue_signe';
  };
  product_data: {
    certified: boolean;
    manufacturer_name: string;
    model_id: string;
    product_archetype: string;
    product_name: string;
    software_version: string;
  };
}

export interface BridgeConfig {
  name: string;
  datastoreversion: string;
  swversion: string;
  apiversion: string;
  mac: string;
  bridgeid: string;
  factorynew: boolean;
  replacesbridgeid?: string;
  modelid: string;
  starterkitid?: string;
}

export interface LightEvent extends Partial<LightGet> {
  id: string;
  type: 'light';
}


export function isLightGet(resource: any): resource is LightGet {
  return (resource as LightGet).type === 'light';
}

export function isRoomGet(resource: any): resource is RoomGet {
  return (resource as RoomGet).type === 'room';
}

export function isZoneGet(resource: any): resource is ZoneGet {
  return (resource as ZoneGet).type === 'zone';
}

export function isLightEvent(resource: any): resource is LightEvent {
  return (resource as LightEvent).type === 'light';
}