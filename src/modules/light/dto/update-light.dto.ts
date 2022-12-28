import { PartialType } from '@nestjs/mapped-types';
import { CreateLightDto } from './create-light.dto';

export class UpdateLightDto extends PartialType(CreateLightDto) {}
