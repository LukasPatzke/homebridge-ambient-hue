import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '../config/config.service';
import { HueService } from '../hue/hue.service';
import { LightService } from '../light/light.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private hueService: HueService,
    private lightService: LightService,
    private configService: ConfigService,
  ) {}

  @Cron('45 * * * * *')
  async update() {
    if (this.configService.enableSchedule) {
      this.logger.log('Running scheduled update');
      this.hueService.update();
    }
  }

  @Cron('0 4 * * *')
  async cleanup() {
    const lights = await this.lightService.findAll();

    lights.forEach((light) => {
      this.lightService.update(light.id, { on: false });
    });
  }
}
