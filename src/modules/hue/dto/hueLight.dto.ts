export class hueLightState {
  on: boolean;
  bri: number;
  hue: number;
  sat: number;
  effect: string;
  xy: number[];
  ct: number;
  alert: string;
  colormode: string;
  mode: string;
  reachable: boolean;
}

export class hueSetState {
  on?: boolean;
  bri?: number;
  hue?: number;
  sat?: number;
  effect?: string;
  xy?: number[];
  ct?: number;
  alert?: string;
  transitiontime?: number;
  bri_inc?: number;
  sat_inc?: number;
  hue_inc?: number;
  ct_inc?: number;
  zy_inc?: number[];
}

export class hueStateResponseItem {
  success?: Record<string, number | string | boolean>;
  error?: hueError;
}

export class hueError {
  type: number;
  address: string;
  description: string;
}

export type hueStateResponse = hueStateResponseItem[];

export class hueLight {
  state: hueLightState;
  swupdate: {
    state: string;
    lastinstall: string;
  };

  type: string;
  name: string;
  modelid: string;
  manufacturername: string;
  productname: string;
  capabilities: {
    certified: boolean;
    control: {
      mindimlevel: number;
      maxlumen: number;
      colorgamuttype: string;
      colorgamut: number[][];
      ct: {
        min: number;
        max: number;
      };
    };
    streaming: {
      renderer: boolean;
      proxy: boolean;
    };
  };

  config: {
    archetype: string;
    function: string;
    direction: string;
  };

  uniqueid: string;
  swversion: string;
}
