import { PartialType } from '@nestjs/mapped-types';
import { Curve } from '../../curve/entities/curve.entity';
import { CreateLightDto } from './create-light.dto';

export class UpdateLightDto extends PartialType(CreateLightDto) {
    on?: boolean;
    onControlled?: boolean;
    onThreshold?: number;
    briControlled?: boolean;
    briMax?: number;
    ctControlled?: boolean;
    briCurveId?: number;
    briCurve?: Curve;
    ctCurveId?: number;
    ctCurve?: Curve;
}
