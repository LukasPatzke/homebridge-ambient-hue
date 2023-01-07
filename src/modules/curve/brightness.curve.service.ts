import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePointDto } from '../point/dto/create-point.dto';
import { PointService } from '../point/point.service';
import { CreateCurveDto } from './dto/create-curve.dto';
import { UpdateCurveDto } from './dto/update-curve.dto';
import { BrightnessCurve, isBrightnessCurveWithPoints } from './entities/brightness.curve.entity';


@Injectable()
export class BrightnessCurveService {
  private readonly logger = new Logger(BrightnessCurveService.name);

  constructor(
    @InjectRepository(BrightnessCurve)
    private curveRepository: Repository<BrightnessCurve>,
    private pointService: PointService,
  ) { }

  async onModuleInit() {
    this.findDefault().catch(async (reason) => {
      if (reason.name === 'EntityNotFound') {
        this.logger.log('Initializing default brightness curve.');
        const curve = this.curveRepository.create({
          id: 0,
          name: 'Default Brightness Curve',
          points: await this.pointService.createMany([
            { x: 0, y: 100, first: true },
            { x: 360, y: 85 },
            { x: 660, y: 70 },
            { x: 900, y: 87 },
            { x: 1080, y: 10 },
            { x: 1440, y: 5, last: true },
          ]),
        });
        this.curveRepository.save(curve);
      }
    });
  }

  async create(createCurveDto: CreateCurveDto) {
    const curve = this.curveRepository.create(createCurveDto);
    const createPointsDto: CreatePointDto[] = [
      { x: 0, y: 100, first: true },
      { x: 1440, y: 0, last: true },
    ];
    for (let index = 1; index < createCurveDto.count - 1; index++) {
      createPointsDto.push({
        x: (1440 / (createCurveDto.count - 1)) * index,
        y: (100 / (createCurveDto.count - 1)) * index,
      });
    }
    curve.points = await this.pointService.createMany(createPointsDto);
    return this.curveRepository.save(curve);
  }

  findAll() {
    return this.curveRepository.find({
      order: {
        name: 'ASC',
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
    if (curve === null) {
      throw new NotFoundException(`Brightness curve with id ${id} not found.`);
    }
    if (isBrightnessCurveWithPoints(curve)) {
      return curve;
    }
    throw new InternalServerErrorException(`Brightness curve ${id} has no points!`);
  }

  async findDefault() {
    const curve = await this.curveRepository.findOneOrFail({
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
    if (isBrightnessCurveWithPoints(curve)) {
      return curve;
    }
    throw new InternalServerErrorException(`Brightness curve ${curve.id} has no points!`);
  }

  async update(id: number, updateCurveDto: UpdateCurveDto) {
    const curve = await this.findOne(id);
    this.curveRepository.merge(curve, updateCurveDto);
    return this.curveRepository.save(curve);
  }

  async remove(id: number) {
    if (id === 0) {
      throw new BadRequestException('Can not delete default curves.');
    }
    return this.curveRepository.delete(id);
  }
}
