import { Injectable, NotFoundException } from '@nestjs/common';
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
    const points = createPointDto.map(dto=>this.pointRepository.create(dto));
    return this.pointRepository.save(points);
  }

  findAll() {
    return this.pointRepository.find();
  }

  findOne(id: number) {
    return this.pointRepository.findOne(id).then(point=>{
      if (point === undefined) {
        throw new NotFoundException(`Point with id ${id} not found.`);
      } else {
        return point;
      }
    });
  }

  findByCurve(id: number) {
    return this.pointRepository
      .createQueryBuilder('point')
      .select()
      .where('point.curveId = :id', { id: id })
      .orderBy('point.x', 'ASC')
      .getMany();
  }

  async update(id: number, updatePointDto: UpdatePointDto) {
    const point = await this.findOne(id);
    this.pointRepository.merge(point, updatePointDto);
    return this.pointRepository.save(point);
  }

  async remove(id: number) {
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
