import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SocketModule } from './socket/socket.module';
import { ChatModule } from './chat/chat.module';
import { TfaModule } from './tfa/tfa.module';
import { GameModule } from './game/game.module';


@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, AuthModule, SocketModule, ChatModule, TfaModule, GameModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
