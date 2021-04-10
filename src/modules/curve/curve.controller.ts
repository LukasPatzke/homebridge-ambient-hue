import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { HueService } from '../hue/hue.service';
import { CurveService } from './curve.service';
import { CreateCurveDto, curveKind } from './dto/create-curve.dto';
import { InsertPointDto } from './dto/insert-point.dto';
import { UpdateCurveDto } from './dto/update-curve.dto';

@Controller('curves')
export class CurveController {
  constructor(
    private readonly curveService: CurveService,
    private readonly hueService: HueService,
  ) {}

  @Post()
  create(@Body() createCurveDto: CreateCurveDto) {
    return this.curveService.create(createCurveDto);
  }

  @Get()
  findAll(@Query('kind') kind: curveKind) {
    if (kind === undefined) {
      return this.curveService.findAll();
    } else {
      return this.curveService.findByKind(kind);
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.curveService.findOne(+id);
  }

  @Post(':id')
  async insertPoint(
    @Param('id') id: string,
    @Body() insertPointDto: InsertPointDto,
  ) {
    const curve = await this.curveService.insertPoint(+id, insertPointDto);
    this.hueService.update();
    return curve;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCurveDto: UpdateCurveDto,
  ) {
    return this.curveService.update(+id, updateCurveDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const res = await this.curveService.remove(+id);
    this.hueService.update();
    return res;
  }
}
