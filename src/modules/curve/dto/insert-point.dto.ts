import { ApiProperty } from '@nestjs/swagger';

export class InsertPointDto {
  @ApiProperty()
  index: number;

  @ApiProperty({ enum: ['before', 'after'] })
  position: 'before' | 'after';
}
