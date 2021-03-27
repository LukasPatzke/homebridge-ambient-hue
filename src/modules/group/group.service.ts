import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PositionService } from '../position/position.service';
import { Repository } from 'typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    private positionService: PositionService,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const group = this.groupsRepository.create(createGroupDto);
    group.position = await this.positionService.create({});
    return this.groupsRepository.save(group);
  }

  findAll(): Promise<Group[]> {
    return this.groupsRepository.find();
  }

  findOne(id: number): Promise<Group> {
    return this.groupsRepository.findOne(id).then(group=>{
      if (group === undefined) {
        throw new NotFoundException(`Group with id ${id} not found.`);
      } else {
        return group;
      }
    });
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    const group = await this.findOne(id);
    this.groupsRepository.merge(group, updateGroupDto);

    if (updateGroupDto.lights !== undefined) {
      group.lights = updateGroupDto.lights;
    }
    return this.groupsRepository.save(group);
  }

  count() {
    return this.groupsRepository.count();
  }

  async remove(id: number) {
    await this.groupsRepository.delete(id);
  }
}
