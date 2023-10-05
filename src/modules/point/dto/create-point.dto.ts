import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { BrightnessCurve } from '../../curve/entities/brightness.curve.entity';
import { ColorTemperatureCurve } from '../../curve/entities/colorTemperature.curve.entity';

export class CreatePointDto {
  @ApiProperty()
  @IsNumber()
  x: number;

  @ApiProperty()
  @IsNumber()
  y: number;

  first?: boolean = false;
  last?: boolean = false;
  brightnessCurve?: BrightnessCurve;
  colorTemperatureCurve?: ColorTemperatureCurve;
}
