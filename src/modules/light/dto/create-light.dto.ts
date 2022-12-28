import { Curve } from '../../curve/entities/curve.entity';

export class CreateLightDto {
  id: string;
  legacyId?: string;
  accessoryId: string;
  deviceId: string;
  name: string;
  archetype: string;
  currentOn?: boolean;
  currentBrightness?: number;
  currentColorTemperature?: number;
  on?: boolean;
  onControlled?: boolean;
  onThreshold?: number;
  brightnessControlled?: boolean;
  brightnessFactor?: number;
  colorTemperatureControlled?: boolean;
  brightnessCurveId?: number;
  brightnessCurve?: Curve;
  colorTemperatureCurveId?: number;
  colorTemperatureCurve?: Curve;
  published?: boolean;
}
