import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePointDto } from './dto/create-point.dto';
import { UpdatePointDto } from './dto/update-point.dto';
import { Point } from './entities/point.entity';

@Injectable()
export class PointService {
  constructor(
    @InjectRepository(Point)
    private pointRepository: Repository<Point>,
  ) {}

  create(createPointDto: CreatePointDto) {
    const point = this.pointRepository.create(createPointDto);
    return this.pointRepository.save(point);
  }

  createMany(createPointDto: CreatePointDto[]) {
    const points = this.pointRepository.create(createPointDto);
    return this.pointRepository.save(points);
  }

  findAll() {
    return this.pointRepository.find();
  }

  findOne(id: number) {
    return this.pointRepository.findOneBy({id: id}).then((point) => {
      if (point === null) {
        throw new NotFoundException(`Point with id ${id} not found.`);
      }
      return point;
    });
  }

  async update(id: number, updatePointDto: UpdatePointDto) {
    const point = await this.findOne(id);
    if (point.first || point.last) {
      updatePointDto.x = undefined;
    }
    this.pointRepository.merge(point, updatePointDto);
    return this.pointRepository.save(point);
  }

  async remove(id: number) {
    const point = await this.findOne(id);
    if (point.first) {
      throw new BadRequestException('The first point can not be deleted.');
    } else if (point.last) {
      throw new BadRequestException('The last point can not be deleted.');
    }
    return this.pointRepository.delete(id);
  }

  /**
   * Calculate the location of a new point between two existing points
   * @param before
   * @param after
   * @returns New x location
   */
  newPointLocation(before: Point, after: Point) {
    const delta = Math.abs(before.x - after.x);
    const basis = Math.min(before.x, after.x);
    return basis + delta / 2;
  }
}
