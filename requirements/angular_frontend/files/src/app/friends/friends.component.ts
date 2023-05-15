import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SocketModule } from '../socket/socket.module';
import { ChatService } from '../services/chat.service';
@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent {

  // playing 1, offline 2, online 3
  listValues: {name: string, intra: string, status: number, pic: string}[] = [];

	constructor(private socket: SocketModule, private router: Router, public chat: ChatService){}

	ngOnInit() {
		if (!this.socket.socketState()){
			this.router.navigate(['']);
			return;
		}
		this.socket.requestEvent('friendlist', null, (data: {name: string, intra: string, status: number, pic: string}[]) => this.getListCallback(data))
		this.socket.socketSubscribe('newfriend', (friend: {name: string, intra: string, status: number, pic: string}) => this.newFriend(friend));
		this.socket.socketSubscribe('status', (status: any) => this.changeStatus(status));
	}

	changeStatus(newStatus: any){
		this.listValues.forEach(friend => {
			if(friend.intra == newStatus.intra)
			{
				friend.status == newStatus.status;
				return;
			}
		});
	}

	newFriend(friend: {name: string, intra: string, status: number, pic: string}){
		this.listValues.push(friend)
	}

	getListCallback(data: {name: string, intra: string, status: number, pic: string}[]){
		data.forEach(friend => this.listValues.push(friend));
	}

	openChat($event: Event){
		this.chat.toggleChat()
	}


}
