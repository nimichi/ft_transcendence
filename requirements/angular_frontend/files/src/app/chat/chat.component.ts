import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SocketModule } from '../socket/socket.module';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {

	constructor(public chatService: ChatService){
		
	}

}



