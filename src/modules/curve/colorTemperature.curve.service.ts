import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePointDto } from '../point/dto/create-point.dto';
import { PointService } from '../point/point.service';
import { CreateCurveDto } from './dto/create-curve.dto';
import { UpdateCurveDto } from './dto/update-curve.dto';
import { ColorTemperatureCurve } from './entities/colorTemperature.curve.entity';

@Injectable()
export class ColorTemperatureCurveService {
  private readonly logger = new Logger(ColorTemperatureCurveService.name);

  constructor(
    @InjectRepository(ColorTemperatureCurve)
    private curveRepository: Repository<ColorTemperatureCurve>,
    private pointService: PointService,
  ) {}

  async onModuleInit() {
    this.findDefault().catch(async (reason) => {
      if (reason.name === 'EntityNotFound') {
        this.logger.log('Initializing default Color Temperature curve.');
        const curve = this.curveRepository.create({
          id: 0,
          name: 'Default Color Temperature Curve',
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
    return this.curveRepository.find({
      relations: {
        points: true,
      },
      order: {
        name: 'ASC',
        points: {
          x: 'ASC',
        },
      },
    });
  }

  async findOne(id: number) {
    const curve = await this.curveRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        points: true,
      },
      order: {
        points: {
          x: 'ASC',
        },
      },
    });
    if (curve === null ) {
      throw new NotFoundException(`Color Temperature curve with id ${id} not found.`);
    }
    return curve;
  }

  findDefault() {
    return this.curveRepository.findOneOrFail({
      where: {
        id: 0,
      },
      relations: {
        points: true,
      },
      order: {
        points: {
          x: 'ASC',
        },
      },
    });
  }

  async update(id: number, updateCurveDto: UpdateCurveDto) {
    const curve = await this.findOne(id);
    this.curveRepository.merge(curve, updateCurveDto);
    return this.curveRepository.save(curve);
  }

  async remove(id: number) {
    if (id===0) {
      throw new BadRequestException('Can not delete default curves.');
    }
    return this.curveRepository.delete(id);
  }
}
