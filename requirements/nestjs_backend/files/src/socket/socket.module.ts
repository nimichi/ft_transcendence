import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { HttpModule } from '@nestjs/axios';


@Module({
	imports: [HttpModule],
	providers: [SocketGateway, SocketService],
})
export class SocketModule {}
