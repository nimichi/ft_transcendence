import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Injectable } from '@nestjs/common';
// import { ChannelArrayProvider } from './../commonProvider/ChannelArrayProvider';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  providers: [ChatService, ChatGateway],
  imports: [PrismaModule, SocketModule],
  exports: [ChatService]
})
export class ChatModule {
}

