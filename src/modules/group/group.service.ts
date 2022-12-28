import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { LightService } from '../light/light.service';
import { UpdateLightDto } from '../light/dto/update-light.dto';
import { Group } from './entities/group.v2.entity';
import { GroupV1 } from './entities/group.v1.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    @InjectRepository(GroupV1)
    private groupsRepositoryV1: Repository<GroupV1>,
    @Inject(forwardRef(() => LightService))
    private lightService: LightService,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const group = this.groupsRepository.create(createGroupDto);
    return this.groupsRepository.save(group);
  }

  findAll(): Promise<Group[]> {
    return this.groupsRepository.find();
  }

  findOne(id: string): Promise<Group> {
    return this.groupsRepository.findOneBy({id: id}).then((group) => {
      if (group === null) {
        throw new NotFoundException(`Group with id ${id} not found.`);
      }
      return group;
    });
  }

  findByIds(ids: string[]): Promise<Group[]> {
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

  async findByLightId(lightId: string): Promise<Group[]> {
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

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    updateGroupDto.id = id;
    return this.groupsRepository.save(updateGroupDto);
  }

  async updateLights(id: string, updateLightDto: UpdateLightDto) {
    const group = await this.findOne(id);
    const lightUpdates = group.lights.map((light) =>
      this.lightService.update(light.id, updateLightDto),
    );
    return Promise.all(lightUpdates).then(() => this.findOne(id));
  }

  count() {
    return this.groupsRepository.count();
  }

  async remove(id: string) {
    await this.groupsRepository.delete(id);
  }

  /**
   * Access lights in the depricated v1 schema that where not successfully migrated
   */
  findAllNotMigratedV1(): Promise<GroupV1[]> {
    return this.groupsRepositoryV1.find({where: {isMigrated: false}});
  }

  /**
   * Mark a v1 entity as successfully migrated to the v1 schema
   * @param id
   */
  async markAsMigratedV1(id: number) {
    const group = await this.groupsRepositoryV1.findOneBy({id: id});
    if (group === null) {
      return false;
    }
    group.isMigrated = true;
    await this.groupsRepositoryV1.save(group);
    return true;
  }

}
