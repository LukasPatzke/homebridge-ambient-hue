import { Injectable, NotFoundException } from '@nestjs/common';
import { Group } from '../group/entities/group.entity';
import { GroupService } from '../group/group.service';
import { UpdateLightDto } from '../light/dto/update-light.dto';
import { Light } from '../light/entities/light.entity';
import { LightService } from '../light/light.service';


/**
 * Typeguard to differenciate lights and groups
 */
function isGroup(device: Light | Group): device is Group {
  return (device as Group).lights !== undefined;
}

@Injectable()
export class DeviceService {
  constructor(
    private readonly lightService: LightService,
    private readonly groupService: GroupService,
  ) {}

  async findOne(uniqueId: string) {
    try {
      return await this.lightService.findByUniqueId(uniqueId);
    } catch (err) {
      if (err instanceof NotFoundException) {
        try {
          return await this.groupService.findByUniqueId(uniqueId);
        } catch (err) {
          if (err instanceof NotFoundException) {
            throw new NotFoundException(
              `Device with unique id ${uniqueId} not found`,
            );
          } else {
            throw err;
          }
        }
      } else {
        throw err;
      }
    }
  }

  async update(uniqueId: string, updateLightDto: UpdateLightDto) {
    const device = await this.findOne(uniqueId);

    if (isGroup(device)) {
      return this.groupService.updateLights(device.id, updateLightDto);
    } else {
      return this.lightService.update(device.id, updateLightDto);
    }
  }
}
