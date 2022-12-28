import { Light } from '../../light/entities/light.v2.entity';

export class CreateGroupDto {
  id: string;
  legacyId?: string;
  accessoryId: string;
  name: string;
  type: 'room' | 'zone';
  lights: Light[];
  published?: boolean;
}
