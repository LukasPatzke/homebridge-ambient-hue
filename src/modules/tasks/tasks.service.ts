import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HueService } from '../hue/hue.service';
import { LightService } from '../light/light.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private hueService: HueService,
    private lightService: LightService,
  ) { }

  @Cron('45 * * * * *')
  async update() {
    const updated = await this.hueService.update();
    this.logger.log(`Scheduled update affected ${updated} lights`);
  }

  @Cron('0 4 * * *')
  async cleanup() {
    const lights = await this.lightService.findAll();

    lights.forEach(light => {
      this.lightService.update(light.id, { on: false });
    });
  }
}
