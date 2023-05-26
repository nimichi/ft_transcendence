import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '../chat/chat.service';
import { SocketService } from '../socket/socket.service';
@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent {

  // playing 1, offline 2, online 3
  listValues: {name: string, intra: string, status: number, pic: string}[] = [];



	constructor(private socket: SocketService, private router: Router, public chat: ChatService){}

	ngOnInit() {
		if (!this.socket.socketState()){
			this.router.navigate(['']);
			return;
		}
		this.socket.requestEvent('getfriends', null, (data: {name: string, intra: string, status: number, pic: string}[]) => this.getListCallback(data))
		this.socket.socketSubscribe('newfriend', (friend: {name: string, intra: string, status: number, pic: string}) => this.newFriend(friend));
	}

	newFriend(friend: {name: string, intra: string, status: number, pic: string}){
		this.socket.requestEvent('state', friend.intra, (data: {intra: string, state: 0 | 1 | 2 }) => this.setState(data));
		this.listValues.push(friend)
	}

	getListCallback(data: {name: string, intra: string, status: number, pic: string}[]){
		data.forEach(friend => {
			this.socket.requestEvent('state', friend.intra, (data: {intra: string, state: 0 | 1 | 2 }) => this.setState(data));
			this.socket.socketSubscribe(friend.intra + 'state', (data: {intra: string, state: 0 | 1 | 2 }) => this.setState(data));
			this.listValues.push(friend);
		});
	}

	setState(user: {intra: string, state: 0 | 1 | 2 }){
		for (let item of this.listValues){
			if(item.intra == user.intra){
				item.status = user.state
				return;
			}
		}
	}

	openChat($event: Event){
		this.chat.toggleChat()
	}

	ngOnDestroy(){
		this.socket.socketUnsubscribe('newfriend');
		for (let item of this.listValues){
			this.socket.socketUnsubscribe(item.intra + 'state');
		}
	}

}
