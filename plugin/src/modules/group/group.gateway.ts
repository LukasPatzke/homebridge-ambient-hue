import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { Group } from './entities/group.entity';

@WebSocketGateway()
export class GroupGateway {
  private readonly logger = new Logger(GroupGateway.name);

  @WebSocketServer()
  server: Server;

  async emitUpdate(group: Group) {
    this.logger.debug(`Emitting light update for group ${group.id}`);
    this.server.emit(`update/${group.uniqueId}`, group);
  }
}
