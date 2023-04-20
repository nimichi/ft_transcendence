import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SocketGateway } from './socket/socket.gateway';


@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, SocketGateway],
})
export class AppModule {}
