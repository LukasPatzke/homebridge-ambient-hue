import { PartialType } from '@nestjs/swagger';
import { CreateCurveDto } from './create-curve.dto';

export class UpdateCurveDto extends PartialType(CreateCurveDto) {}
