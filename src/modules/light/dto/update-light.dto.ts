import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { CreateLightDto } from './create-light.dto';

export class UpdateLightDto extends PartialType(CreateLightDto) {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  brightnessCurveId?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  colorTemperatureCurveId?: number;
}
