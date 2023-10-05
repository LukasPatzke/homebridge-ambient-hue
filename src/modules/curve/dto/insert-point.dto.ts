import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber } from 'class-validator';

export class InsertPointDto {
  @ApiProperty()
  @IsNumber()
  index: number;

  @ApiProperty({ enum: ['before', 'after'] })
  @IsIn(['before', 'after'])
  position: 'before' | 'after';
}
