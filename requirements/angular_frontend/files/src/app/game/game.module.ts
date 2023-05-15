import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game.component';
import { SocketModule } from '../socket/socket.module';



@NgModule({
  declarations: [
    GameComponent
  ],
  imports: [
    CommonModule, SocketModule
  ]
})
export class GameModule { }
