import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  UseInterceptors,
} from '@nestjs/common';

import { UpdateInterceptor } from '../hue/update.interceptor';
import { UpdateLightDto } from '../light/dto/update-light.dto';
import { AccessoryService } from './accessory.service';

@Controller('accessories')
@UseInterceptors(ClassSerializerInterceptor)
export class AccessoryController {
  constructor(private readonly accessoryService: AccessoryService) {}

  @Get()
  findall() {
    return this.accessoryService.findAll();
  }

  @Get(':accessoryId')
  async findOne(@Param('accessoryId') accessoryId: string) {
    return this.accessoryService.findOne(accessoryId);
  }

  @Patch(':accessoryId')
  @UseInterceptors(UpdateInterceptor)
  async update(
    @Param('accessoryId') accessoryId: string,
    @Body() updateLightDto: UpdateLightDto,
  ) {
    return this.accessoryService.update(accessoryId, updateLightDto);
  }
}
