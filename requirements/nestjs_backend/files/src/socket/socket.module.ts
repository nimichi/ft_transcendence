import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { HttpModule } from '@nestjs/axios';


@Module({
	imports: [HttpModule, PrismaModule],
	providers: [SocketGateway, SocketService],
})
export class SocketModule {}
