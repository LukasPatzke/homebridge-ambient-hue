import { Controller, Get } from '@nestjs/common';
import { HueService } from './hue.service';

@Controller('hue')
export class HueController {
  constructor(private readonly hueService: HueService) {}

  @Get('sync')
  sync() {
    return this.hueService.sync();
  }

  @Get('update')
  update() {
    return this.hueService.update();
  }
}
