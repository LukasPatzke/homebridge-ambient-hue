import { PartialType } from '@nestjs/mapped-types';
import { CreateCurveDto } from './create-curve.dto';

export class UpdateCurveDto extends PartialType(CreateCurveDto) {}
