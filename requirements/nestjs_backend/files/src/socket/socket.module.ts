import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { HttpModule } from '@nestjs/axios';
import { TfaModule } from '../tfa/tfa.module';
import { PrismaModule } from '../prisma/prisma.module';


@Module({
	imports: [HttpModule, PrismaModule, TfaModule],
	providers: [SocketGateway, SocketService],
})
export class SocketModule {}
