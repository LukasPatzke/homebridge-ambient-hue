import { Body, Controller, Get, Param, Patch, UseInterceptors } from '@nestjs/common';
import { UpdateInterceptor } from '../hue/update.interceptor';
import { UpdateLightDto } from '../light/dto/update-light.dto';
import { DeviceService } from './device.service';

@Controller('devices')
export class DeviceController {
  constructor(
    private readonly deviceService: DeviceService,
  ) { }

  @Get(':uniqueId')
  async findOne(@Param('uniqueId') uniqueId: string) {
    return this.deviceService.findOne(uniqueId);
  }

  @Patch(':uniqueId')
  @UseInterceptors(UpdateInterceptor)
  async update(
    @Param('uniqueId') uniqueId: string,
    @Body() updateLightDto: UpdateLightDto,
  ) {
    return this.deviceService.update(uniqueId, updateLightDto);
  }

}
