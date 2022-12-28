import {
  Controller,
  Get,
  Body,
  Param,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { LightService } from './light.service';
import { UpdateLightDto } from './dto/update-light.dto';
import { UpdateInterceptor } from '../hue/update.interceptor';

@Controller('lights')
@UseInterceptors(ClassSerializerInterceptor)
export class LightController {
  constructor(private readonly lightService: LightService) {}

  @Get()
  findAll() {
    return this.lightService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lightService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(UpdateInterceptor)
  async update(
    @Param('id') id: string,
    @Body() updateLightDto: UpdateLightDto,
  ) {
    return this.lightService.update(id, updateLightDto);
  }
}
