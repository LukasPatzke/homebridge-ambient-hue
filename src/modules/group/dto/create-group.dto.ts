import { Light } from '../../light/entities/light.entity';

export class CreateGroupDto {
  id: number;
  uniqueId: string;
  name: string;
  type: string;
  lights: Light[];
}
