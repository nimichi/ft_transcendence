import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SocketModule } from '../socket/socket.module';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
	public chatInput: string = "";
	public chatOutputList: any [] = [];

	constructor(private socket: SocketModule){
		this.socket.socketSubscribe('chatrecv', (msg: string) => this.recvMessage(msg));
	}

	recvMessage(msg: string){
		this.chatOutputList.unshift( { msg: msg, align: 'left' } );
		console.log(this.chatOutputList);
	}

	searchControl = new FormControl ('')

	sendMessage(){
		this.socket.requestEvent('chatsend', this.chatInput, (value: any) => this.sendMessageCallback(value));
	}

	sendMessageCallback(msg: any){
		this.chatInput = '';
		this.chatOutputList.unshift( { msg: msg, align: 'right' } );
		console.log(msg);
	}


}



