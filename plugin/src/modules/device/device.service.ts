import { Injectable, NotFoundException } from '@nestjs/common';
import { Group } from '../group/entities/group.entity';
import { GroupService } from '../group/group.service';
import { UpdateLightDto } from '../light/dto/update-light.dto';
import { Light } from '../light/entities/light.entity';
import { LightService } from '../light/light.service';

@Injectable()
export class DeviceService {
  constructor(
    private readonly lightService: LightService,
    private readonly groupService: GroupService,
  ) {}

  async findOne(uniqueId: string) {
    let device: Light | Group | undefined;

    device = await this.lightService.findByUniqueId(uniqueId);
    if (device === undefined) {
      device = await this.groupService.findByUniqueId(uniqueId);
    }
    if (device === undefined) {
      throw new NotFoundException(
        `Device with unique id ${uniqueId} not found`,
      );
    } else {
      return device;
    }
  }

  async update(uniqueId: string, updateLightDto: UpdateLightDto) {
    let device: Light | Group | undefined;

    device = await this.lightService.findByUniqueId(uniqueId);
    if (device === undefined) {
      device = await this.groupService.findByUniqueId(uniqueId);
      if (device !== undefined) {
        return this.groupService.updateLights(device.id, updateLightDto);
      } else {
        throw new NotFoundException(
          `Device with unique id ${uniqueId} not found`,
        );
      }
    } else {
      return this.lightService.update(device.id, updateLightDto);
    }
  }
}
