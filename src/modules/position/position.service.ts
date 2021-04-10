import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePositionDto } from './dto/create-position.dto';
import { MovePositionDto } from './dto/move-position.dto';
import { Position } from './entities/position.entity';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
  ) { }

  create(createPositionDto: CreatePositionDto) {
    const position = this.positionRepository.create(createPositionDto);
    return this.positionRepository.save(position);
  }

  findAll() {
    return this.positionRepository
      .createQueryBuilder('position')
      .leftJoinAndSelect('position.light', 'light')
      .leftJoinAndSelect('position.group', 'group')
      .leftJoinAndSelect('group.lights', 'group_light')
      .orderBy('position.position', 'ASC')
      .getMany();
  }

  findOne(id: number) {
    return this.positionRepository.findOne(id).then((pos) => {
      if (pos === undefined) {
        throw new NotFoundException(`Position with id ${id} not found.`);
      } else {
        return pos;
      }
    });
  }

  async remove(id: number) {
    return this.positionRepository.delete(id);
  }

  async move(movePositionDto: MovePositionDto) {
    const positions = await this.findAll();

    const position = positions.splice(movePositionDto.from, 1);
    positions.splice(movePositionDto.to, 0, ...position);

    for (let index = 0; index < positions.length; index++) {
      positions[index].position = index;
    }
    await this.positionRepository.save(positions);
    return this.findAll();
  }
}
