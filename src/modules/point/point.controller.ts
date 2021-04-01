import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { PointService } from './point.service';
import { UpdatePointDto } from './dto/update-point.dto';
import { HueService } from '../hue/hue.service';

@Controller('points')
export class PointController {
  constructor(
    private readonly pointService: PointService,
    private readonly hueService: HueService,
  ) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pointService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePointDto: UpdatePointDto,
  ) {
    const point = await this.pointService.update(+id, updatePointDto);
    this.hueService.update();
    return point;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const res = await this.pointService.remove(+id);
    this.hueService.update();
    return res;
  }
}
