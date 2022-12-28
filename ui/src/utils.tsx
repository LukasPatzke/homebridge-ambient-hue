import { ILight, ILightInfo } from './types/hue';


export const range = (start: number, stop?: number, step?: number) => {
  if (typeof stop == 'undefined') {
    // one param defined
    stop = start;
    start = 0;
  }

  if (typeof step == 'undefined') {
    step = 1;
  }

  if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
    return [];
  }

  var result: number[] = [];
  for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
    result.push(i);
  }

  return result;
};


export const lightInfoReducer = (prev: ILightInfo, current: ILightInfo) => {
  prev.on = prev.on && current.on
  prev.smartOff = prev.smartOff || current.smartOff
  return prev
}

export const lightReducer = (prev: ILight, current: ILight) => {
  prev.on = prev.on && current.on
  prev.onControlled = prev.onControlled && current.onControlled
  prev.brightnessControlled = prev.brightnessControlled && current.brightnessControlled
  prev.colorTemperatureControlled = prev.colorTemperatureControlled && current.colorTemperatureControlled
  prev.smartOff = prev.smartOff || current.smartOff
  return prev
}