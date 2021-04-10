import { Group } from '../../group/entities/group.entity';
import { Light } from '../../light/entities/light.entity';

export class CreatePositionDto {
  light?: Light;
  group?: Group;
}
