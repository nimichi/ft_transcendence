import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserComponent } from './user.component';
import { SocketModule } from '../socket/socket.module';
import { ChatModule } from '../chat/chat.module';

@NgModule({
  declarations: [
    UserComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ChatModule,
	SocketModule,
    ReactiveFormsModule,
    FormsModule,
  ]
})
export class UserModule { }
