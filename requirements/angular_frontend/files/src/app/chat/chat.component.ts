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
	public chatList: {name: string, msgs: {msg: string, align: string}[]}[] = [ { name: '!cmd', msgs: [] }]
	public msgList: {msg: string, align: string}[] = this.chatList[0].msgs;
	selectedChat: string = this.chatList[0].name;

	constructor(private socket: SocketModule){
		this.socket.socketSubscribe('chatrecv', (msg: string) => this.recvMessage(msg));

		socket.socketSubscribe('newchat', (chat: {name: string, msgs: {msg: string, align: string}[]}) => this.newChat(chat))
	}

	selectChat(chat: {name: string, msgs: {msg: string, align: string}[]}, event: Event){
		this.msgList = chat.msgs;
		this.selectedChat = chat.name;
		(event.target as HTMLInputElement).parentElement?.childNodes.forEach(child => {
			if ((child as HTMLInputElement).classList)
			(child as HTMLInputElement).classList.remove("selected");
		});
		(event.target as HTMLInputElement).classList.add("selected");
	}

	newChat(chat: {name: string, msgs: {msg: string, align: string}[]}){
		console.log('testy');
		this.chatList.push(chat);
	}

	recvMessage(msg: string){
		this.msgList.unshift( { msg: msg, align: 'left' } );
		console.log(this.msgList);
	}

	searchControl = new FormControl ('')

	sendMessage(){
		this.socket.requestEvent('chatsend', { chat: this.selectedChat, msg: this.chatInput}, (value: any) => this.sendMessageCallback(value));
	}

	sendMessageCallback(msg: any){
		this.chatInput = '';
		this.msgList.unshift( { msg: msg, align: 'right' } );
		console.log(msg);
	}



}



