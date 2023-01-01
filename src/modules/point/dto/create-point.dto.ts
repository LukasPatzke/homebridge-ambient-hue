import { BrightnessCurve } from 'src/modules/curve/entities/brightness.curve.entity';
import { ColorTemperatureCurve } from 'src/modules/curve/entities/colorTemperature.curve.entity';

export class CreatePointDto {
  x: number;
  y: number;
  first?: boolean = false;
  last?: boolean = false;
  brightnessCurve?: BrightnessCurve;
  colorTemperatureCurve?: ColorTemperatureCurve;
}
