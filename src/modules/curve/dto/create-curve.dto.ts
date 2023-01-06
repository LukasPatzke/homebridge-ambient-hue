import { ApiProperty } from '@nestjs/swagger';

export type curveKind = 'ct' | 'bri';

export class CreateCurveDto {
  @ApiProperty()
  name: string;

  @ApiProperty({enum: ['ct', 'bri']})
  kind: curveKind;

  @ApiProperty({type: Number, required: false, default: 2})
  count = 2;
}
