import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UpdateLightDto } from '../light/dto/update-light.dto';
import { LightService } from '../light/light.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    @Inject(forwardRef(() => LightService))
    private lightService: LightService,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const group = this.groupsRepository.create(createGroupDto);
    return this.groupsRepository.save(group);
  }

  findAll(): Promise<Group[]> {
    return this.groupsRepository.find({
      order: {
        name: 'ASC',
        lights: {
          'name': 'ASC',
        },
      },
    });
  }

  findOne(id: number): Promise<Group> {
    return this.groupsRepository.findOneBy({id: id}).then((group) => {
      if (group === null) {
        throw new NotFoundException(`Group with id ${id} not found.`);
      }
      return group;
    });
  }

  findByIds(ids: number[]): Promise<Group[]> {
    return this.groupsRepository.findBy({ id: In(ids) });
  }

  findByAccessoryId(accessoryId: string): Promise<Group> {
    return this.groupsRepository
      .findOneBy({ accessoryId: accessoryId })
      .then((group) => {
        if (group === null) {
          throw new NotFoundException(`Group with accessoryId ${accessoryId} not found.`);
        }
        return group;
      });
  }

  async findByLightId(lightId: number): Promise<Group[]> {
    const groups = await this.groupsRepository.find({
      relations: {
        lights: true,
      },
      where: {
        lights: {
          id: lightId,
        },
      },
    });
    // The second query return all lights for the group
    return this.findByIds(groups.map(i=>i.id));
  }

  async updateByHueId(hueId: string, updateGroupDto: UpdateGroupDto) {
    const group = await this.groupsRepository.findOneBy({
      hueId: hueId,
    });
    if (group === null) {
      throw new NotFoundException(`Group with hue id ${hueId} not found.`);
    }
    return this.update(group.id, updateGroupDto);
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    updateGroupDto.id = id;
    return this.groupsRepository.save(updateGroupDto);
  }

  async updateLights(id: number, updateLightDto: UpdateLightDto) {
    const group = await this.findOne(id);
    const lightUpdates = group.lights.map((light) =>
      this.lightService.update(light.id, updateLightDto),
    );
    return Promise.all(lightUpdates).then(() => this.findOne(id));
  }

  count() {
    return this.groupsRepository.count();
  }

  async remove(id: number) {
    await this.groupsRepository.delete(id);
  }
}
