import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PositionService } from '../position/position.service';
import { Repository } from 'typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';
import { LightService } from '../light/light.service';
import { UpdateLightDto } from '../light/dto/update-light.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    private positionService: PositionService,
    @Inject(forwardRef(() => LightService))
    private lightService: LightService,
  ) { }

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const group = this.groupsRepository.create(createGroupDto);
    group.position = await this.positionService.create({});
    return this.groupsRepository.save(group);
  }

  findAll(): Promise<Group[]> {
    return this.groupsRepository.find().then((groups) =>
      groups.map((group) => {
        group.updateLightState();
        return group;
      }),
    );
  }

  findOne(id: number): Promise<Group> {
    return this.groupsRepository.findOne(id).then((group) => {
      if (group === undefined) {
        throw new NotFoundException(`Group with id ${id} not found.`);
      } else {
        group.updateLightState();
        return group;
      }
    });
  }

  findByUniqueId(uniqueId: string) {
    return this.groupsRepository
      .findOne({ uniqueId: uniqueId })
      .then((group) => {
        group?.updateLightState();
        return group;
      });
  }

  findByLight(lightId: number) {
    return this.groupsRepository
      .createQueryBuilder('group')
      .innerJoin('group.lights', 'light_filter', 'light_filter.id = :id', { id: lightId })
      .leftJoinAndSelect('group.lights', 'light')
      .getMany()
      .then((groups) =>
        groups.map((group) => {
          group.updateLightState();
          return group;
        }),
      );
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    updateGroupDto.id = id;
    return this.groupsRepository.save(updateGroupDto);
  }

  async updateLights(id: number, updateLightDto: UpdateLightDto) {
    const group = await this.findOne(+id);
    const lightUpdates = group.lights.map((light) =>
      this.lightService.update(light.id, updateLightDto),
    );
    return Promise.all(lightUpdates).then(() => this.findOne(+id));
  }

  count() {
    return this.groupsRepository.count();
  }

  async remove(id: number) {
    await this.groupsRepository.delete(id);
  }
}
