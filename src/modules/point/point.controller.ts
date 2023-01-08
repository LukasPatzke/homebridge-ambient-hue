import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateInterceptor } from '../hue/update.interceptor';
import { UpdatePointDto } from './dto/update-point.dto';
import { PointService } from './point.service';

@Controller('points')
@UseInterceptors(ClassSerializerInterceptor)
export class PointController {
  constructor(private readonly pointService: PointService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pointService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(UpdateInterceptor)
  async update(
    @Param('id') id: string,
    @Body() updatePointDto: UpdatePointDto,
  ) {
    const point = await this.pointService.update(+id, updatePointDto);
    return point;
  }

  @Delete(':id')
  @UseInterceptors(UpdateInterceptor)
  async remove(@Param('id') id: string) {
    const res = await this.pointService.remove(+id);
    return res;
  }
}
