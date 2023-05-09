import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Injectable } from '@nestjs/common';
import { ChannelArrayProvider } from './../commonProvider/ChannelArrayProvider';
import { ChatGateway } from './chat.gateway';

@Module({
  providers: [ChatService, ChannelArrayProvider, ChatGateway],
  exports: [ChatService]
})
export class ChatModule {
}

