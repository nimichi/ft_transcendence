import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';

@Module({
  providers: [ChatService]
})
export class ChatModule {
  private chatSerive : ChatService;


  constructor (private chatService: ChatService) {
    this.chatSerive = chatService;
  
  }

  public recieveMsg (intra: string, payload: string) : any {
    this.chatSerive.recieveMsg(intra, payload);

  }

  public disconnectUser (intra: string)  {
    this.chatSerive.disconnectUser(intra);
  }

  public connectUser (intra: string) {
    this.chatSerive.connectUser(intra);
  }

}

