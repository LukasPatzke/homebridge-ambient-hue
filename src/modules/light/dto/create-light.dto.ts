import { BrightnessCurve } from '../../curve/entities/brightness.curve.entity';
import { ColorTemperatureCurve } from '../../curve/entities/colorTemperature.curve.entity';


export class CreateLightDto {
  id?: number;
  hueId: string;
  legacyId?: string;
  accessoryId: string;
  deviceId?: string;
  name: string;
  archetype: string;
  currentOn?: boolean | null;
  currentBrightness?: number | null;
  currentColorTemperature?: number | null;
  lastOn?: boolean | null;
  lastBrightness?: number | null;
  lastColorTemperature?: number | null;
  on?: boolean;
  onControlled?: boolean;
  onThreshold?: number;
  brightnessControlled?: boolean;
  brightnessFactor?: number;
  colorTemperatureControlled?: boolean;
  brightnessCurve?: BrightnessCurve;
  colorTemperatureCurve?: ColorTemperatureCurve;
  published?: boolean;
  isBrightnessCapable?: boolean;
  isColorTemperatureCapable?: boolean;
}
