import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { LightService } from './light.service';
import { UpdateLightWsDto } from './dto/update-light-ws.dto';
import { HueService } from '../hue/hue.service';
import { Logger } from '@nestjs/common';


@WebSocketGateway({ transports: ['websocket'] })
export class LightGateway {
  private readonly logger = new Logger(LightGateway.name);

  constructor(
    private lightService: LightService,
    private hueService: HueService,
  ) {}

  @SubscribeMessage('lights')
  findAll() {
    return this.lightService.findAll();
  }

  @SubscribeMessage('updateLight')
  async update(@MessageBody() payload: UpdateLightWsDto) {
    this.logger.log(payload);
    const light = await this.lightService.update(payload.id, payload);
    await this.hueService.update();
    return light;
  }
}