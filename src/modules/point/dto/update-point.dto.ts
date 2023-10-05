import { PartialType } from '@nestjs/swagger';
import { CreatePointDto } from './create-point.dto';

export class UpdatePointDto extends PartialType(CreatePointDto) {}
