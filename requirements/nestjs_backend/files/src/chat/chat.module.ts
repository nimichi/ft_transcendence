import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Injectable } from '@nestjs/common';

@Module({
  providers: [ChatService],
  exports: [ChatService]
})
export class ChatModule {
  private chat : ChatService;

  public recieveMsg (intra: string, payload: string) : any {
    return this.chat.recieveMsg(intra, payload);

  }

  public disconnectUser (intra: string)  {
    this.chat.disconnectUser(intra);
  }

  public connectUser (intra: string) {
    this.chat.connectUser(intra);
  }

}

