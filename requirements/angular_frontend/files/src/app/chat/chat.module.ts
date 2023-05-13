import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './chat.component';
import { SocketModule } from '../socket/socket.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ChatComponent
  ],
  imports: [
    CommonModule,
    SocketModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    ChatComponent
  ]
})
export class ChatModule { }
