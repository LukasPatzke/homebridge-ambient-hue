import { Injectable, Logger } from '@nestjs/common';
import { HueService } from '../hue/hue.service';


@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(
        private hueService: HueService,
    ) {}

}
