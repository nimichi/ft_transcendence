import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { HttpModule } from '@nestjs/axios';
import { TfaModule } from 'src/tfa/tfa.module';


@Module({
	imports: [HttpModule, PrismaModule, TfaModule],
	providers: [SocketGateway, SocketService],
})
export class SocketModule {}
