import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
export class AccessoryService {
  constructor(
    @Inject(forwardRef(() => LightService))
    private readonly lightService: LightService,
    @Inject(forwardRef(() => GroupService))
    private readonly groupService: GroupService,
  ) {}

  async findAll() {
    const lights = await this.lightService.findAll();
    const groups = await this.groupService.findAll();
    return [...lights, ...groups];
  }

  async findOne(accessoryId: string) {
    try {
      return await this.lightService.findByAccessoryId(accessoryId);
    } catch (err) {
      if (err instanceof NotFoundException) {
        try {
          return await this.groupService.findByAccessoryId(accessoryId);
        } catch (err) {
          if (err instanceof NotFoundException) {
            throw new NotFoundException(
              `Device with accessory id ${accessoryId} not found`,
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

  async update(accessoryId: string, updateLightDto: UpdateLightDto) {
    const device = await this.findOne(accessoryId);

    if (isGroup(device)) {
      return this.groupService.updateLights(device.id, updateLightDto);
    } else {
      return this.lightService.update(device.id, updateLightDto);
    }
  }
}
