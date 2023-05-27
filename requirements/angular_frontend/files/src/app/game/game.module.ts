import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game.component';
import { SocketModule } from '../socket/socket.module';
import { ChatModule } from '../chat/chat.module';



@NgModule({
  declarations: [
    GameComponent
  ],
  imports: [
    CommonModule,
	ChatModule,
	SocketModule
  ]
})
export class GameModule {
}
