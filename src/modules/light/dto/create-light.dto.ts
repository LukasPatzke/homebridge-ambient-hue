import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
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

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  on?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  onControlled?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  onThreshold?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  brightnessControlled?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  brightnessFactor?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  colorTemperatureControlled?: boolean;

  brightnessCurve?: BrightnessCurve;
  colorTemperatureCurve?: ColorTemperatureCurve;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  isBrightnessCapable?: boolean;
  isColorTemperatureCapable?: boolean;
}
