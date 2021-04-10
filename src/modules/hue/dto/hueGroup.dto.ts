export class hueGroup {
  name: string;
  lights: string[];
  type: string;
  action: {
    on: boolean;
    bri: number;
    hue: number;
    sat: number;
    effect: string;
    xy: number[];
    ct: number;
    alert: string;
    colormode: string;
  };
}
