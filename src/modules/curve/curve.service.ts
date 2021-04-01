import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCurveDto, curveKind } from './dto/create-curve.dto';
import { UpdateCurveDto } from './dto/update-curve.dto';
import { Curve } from './entities/curve.entity';
import { PointService } from '../point/point.service';
import { InsertPointDto } from './dto/insert-point.dto';
import { monospline } from './interpolation';
import { CreatePointDto } from '../point/dto/create-point.dto';

@Injectable()
export class CurveService {
  private readonly logger = new Logger(CurveService.name);

  constructor(
    @InjectRepository(Curve)
    private curveRepository: Repository<Curve>,
    private pointService: PointService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initialize curves.');
    this.findDefault('bri').catch(async (reason) => {
      if (reason.name === 'EntityNotFound') {
        this.logger.log('Initializing default brightness curve.');
        const curve = this.curveRepository.create({
          name: 'Default',
          kind: 'bri',
          default: true,
          points: await this.pointService.createMany([
            { x: 0, y: 254, first: true },
            { x: 360, y: 216 },
            { x: 660, y: 182 },
            { x: 900, y: 221 },
            { x: 1080, y: 27 },
            { x: 1440, y: 12, last: true },
          ]),
        });
        this.curveRepository.save(curve);
      }
    });
    this.findDefault('ct').catch(async (reason) => {
      if (reason.name === 'EntityNotFound') {
        this.logger.log('Initializing default color temperature curve.');
        const curve = this.curveRepository.create({
          name: 'Default',
          kind: 'ct',
          default: true,
          points: await this.pointService.createMany([
            { x: 0, y: 153, first: true },
            { x: 420, y: 324 },
            { x: 900, y: 347 },
            { x: 1080, y: 475 },
            { x: 1440, y: 500, last: true },
          ]),
        });
        this.curveRepository.save(curve);
      }
    });
  }

  async create(createCurveDto: CreateCurveDto) {
    const curve = this.curveRepository.create(createCurveDto);
    const createPointsDto: CreatePointDto[] = [
      { x: 0, y: 200, first: true },
      { x: 1440, y: 200, last: true },
    ];
    for (let index = 1; index < createCurveDto.count - 1; index++) {
      createPointsDto.push({
        x: (1440 / (createCurveDto.count - 1)) * index,
        y: 200,
      });
    }
    curve.points = await this.pointService.createMany(createPointsDto);
    return this.curveRepository.save(curve);
  }

  findAll() {
    return this.curveRepository
      .createQueryBuilder('curve')
      .leftJoinAndSelect('curve.points', 'point')
      .orderBy({'curve.id': 'ASC', 'point.x': 'ASC'})
      .getMany();
  }

  findOne(id: number) {
    return this.curveRepository
      .createQueryBuilder('curve')
      .where('curve.id = :id', {id:id})
      .leftJoinAndSelect('curve.points', 'point')
      .orderBy('point.x')
      .getOne()
      .then((curve) => {
        if (curve === undefined) {
          throw new NotFoundException(`Curve with id ${id} not found.`);
        } else {
          return curve;
        }
      });
  }

  findByKind(kind: curveKind) {
    return this.curveRepository
      .createQueryBuilder('curve')
      .where('curve.kind = :kind', {kind: kind})
      .leftJoinAndSelect('curve.points', 'point')
      .orderBy({'curve.id': 'ASC', 'point.x': 'ASC'})
      .getMany();
  }

  findDefault(kind: curveKind) {
    return this.curveRepository
      .createQueryBuilder('curve')
      .where('curve.default = true')
      .andWhere('curve.kind = :kind', {kind: kind})
      .leftJoinAndSelect('curve.points', 'point')
      .orderBy({'point.x': 'ASC'})
      .getOneOrFail();
  }

  async update(id: number, updateCurveDto: UpdateCurveDto) {
    const curve = await this.findOne(id);
    this.curveRepository.merge(curve, updateCurveDto);
    return this.curveRepository.save(curve);
  }

  async remove(id: number) {
    return this.curveRepository.delete(id);
  }

  async insertPoint(id: number, insertPointDto: InsertPointDto) {
    const curve = await this.findOne(id);
    const points = await this.pointService.findByCurve(id);
    const point = points[insertPointDto.index];
    let xLocation: number;

    if (insertPointDto.position === 'after') {
      if (point.last) {
        throw new BadRequestException('Can not create Point after last Point');
      } else {
        xLocation = this.pointService.newPointLocation(
          points[insertPointDto.index],
          points[insertPointDto.index + 1],
        );
      }
    } else {
      if (point.first) {
        throw new BadRequestException(
          'Can not create Point before first Point',
        );
      } else {
        xLocation = this.pointService.newPointLocation(
          points[insertPointDto.index - 1],
          points[insertPointDto.index],
        );
      }
    }
    const newPoint = await this.pointService.create({
      x: xLocation,
      y: await this.calcValue(id, xLocation),
    });
    curve.points.push(newPoint);

    await this.curveRepository.save(curve);
    return this.findOne(id);
  }

  /**
   * Calculate the value from the points or the curve.
   * @param id Curve id
   * @param x Time in Seconds, defaults to now
   * @returns new y value
   */
  async calcValue(id: number, x?: number): Promise<number> {
    const points = await this.pointService.findByCurve(id);
    const spline = monospline(
      points.map((point) => point.x),
      points.map((point) => point.y),
    );

    if (x === undefined) {
      const now = new Date();
      const startOfDay = new Date();
      startOfDay.setHours(4);
      startOfDay.setMinutes(0);
      startOfDay.setSeconds(0);
      startOfDay.setMilliseconds(0);
      const delta = now.valueOf() - startOfDay.valueOf();
      x = Math.floor(delta / 60_000);
    }

    return Math.round(spline(x));
  }
}
