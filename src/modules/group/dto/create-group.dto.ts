import { Light } from '../../light/entities/light.entity';

export class CreateGroupDto {
  id?: number;
  hueId: string;
  legacyId?: string;
  accessoryId: string;
  name: string;
  type: 'room' | 'zone';
  lights: Light[];
  published?: boolean;
}
