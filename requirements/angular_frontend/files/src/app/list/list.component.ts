import { Component } from '@angular/core';
import { SocketService } from '../socket/socket.service';
import { Router } from '@angular/router';
import { ChatService } from '../chat/chat.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent {
	public userList:  {name: string, intra: string, pic: string}[] = [];

	constructor(private socketService: SocketService, private router: Router, private chat: ChatService){
		if (!this.socketService.socketState()){
			this.router.navigate(['']);
			return;
		}
		this.socketService.requestEvent('getuserlist', null, (data: {name: string, intra: string, pic: string}[]) => (this.userList = data));
	}

	openChat($event: Event){
		this.chat.toggleChat()
	}
}
