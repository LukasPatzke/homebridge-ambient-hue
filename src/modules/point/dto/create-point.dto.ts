import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { BrightnessCurve } from '../../curve/entities/brightness.curve.entity';
import { ColorTemperatureCurve } from '../../curve/entities/colorTemperature.curve.entity';

export class CreatePointDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(1440)
  x: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(500)
  y: number;

  @IsOptional()
  first?: boolean = false;

  @IsOptional()
  last?: boolean = false;

  @IsOptional()
  brightnessCurve?: BrightnessCurve;

  @IsOptional()
  colorTemperatureCurve?: ColorTemperatureCurve;
}
