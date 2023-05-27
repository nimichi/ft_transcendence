import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Injectable } from '@nestjs/common';
import { ChannelArrayProvider } from './../commonProvider/ChannelArrayProvider';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [ChatService, ChannelArrayProvider, ChatGateway],
  imports: [PrismaModule],
  exports: [ChatService]
})
export class ChatModule {
}

