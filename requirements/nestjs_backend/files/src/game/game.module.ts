import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { SocketModule } from '../socket/socket.module';

@Module({
  providers: [GameService, GameGateway],
  imports: [PrismaModule, SocketModule],
})
export class GameModule {}
