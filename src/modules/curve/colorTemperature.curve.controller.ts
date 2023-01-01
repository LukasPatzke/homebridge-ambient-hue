import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseInterceptors
} from '@nestjs/common';
import { UpdateInterceptor } from '../hue/update.interceptor';
import { ColorTemperatureCurveService } from './colorTemperature.curve.service';
import { CurveService } from './curve.service';
import { CreateCurveDto } from './dto/create-curve.dto';
import { InsertPointDto } from './dto/insert-point.dto';
import { UpdateCurveDto } from './dto/update-curve.dto';

@Controller('curves/colorTemperature')
export class ColorTemperatureCurveController {
  constructor(
    private readonly colorTemperaturecurveService: ColorTemperatureCurveService,
    private readonly curveService: CurveService,
  ) {}

  @Post()
  create(@Body() createCurveDto: CreateCurveDto) {
    return this.colorTemperaturecurveService.create(createCurveDto);
  }

  @Get()
  findAll() {
    return this.colorTemperaturecurveService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.colorTemperaturecurveService.findOne(+id);
  }

  @Post(':id')
  @UseInterceptors(UpdateInterceptor)
  async insertPoint(
    @Param('id') id: string,
    @Body() insertPointDto: InsertPointDto,
  ) {
    const curve = await this.findOne(id);
    await this.curveService.insertPoint(curve, insertPointDto);
    return await this.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCurveDto: UpdateCurveDto,
  ) {
    return this.colorTemperaturecurveService.update(+id, updateCurveDto);
  }

  @Delete(':id')
  @UseInterceptors(UpdateInterceptor)
  async remove(@Param('id') id: string) {
    const res = await this.colorTemperaturecurveService.remove(+id);
    return res;
  }
}