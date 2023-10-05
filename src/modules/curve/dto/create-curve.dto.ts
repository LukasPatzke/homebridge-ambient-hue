import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export type curveKind = 'ct' | 'bri';

export class CreateCurveDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ type: Number, default: 2 })
  @IsNumber()
  @IsOptional()
  count = 2;
}
