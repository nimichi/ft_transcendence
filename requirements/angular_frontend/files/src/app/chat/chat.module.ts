import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './chat.component';
import { SocketModule } from '../socket/socket.module';



@NgModule({
  declarations: [
    ChatComponent
  ],
  imports: [
    CommonModule, SocketModule
  ]
})
export class ChatModule { }
