import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { Light } from './entities/light.entity';


@WebSocketGateway({ transports: ['websocket'] })
export class LightGateway {
  private readonly logger = new Logger(LightGateway.name);

  @WebSocketServer()
  server: Server;

  async emitUpdate(light: Light) {
    this.logger.debug(`Emitting light update for light ${light.id}`);
    this.server.emit(`lightUpdate/${light.id}`, light);
  }

}