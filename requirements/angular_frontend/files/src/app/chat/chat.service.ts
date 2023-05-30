import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../socket/socket.service';

@Injectable({
	providedIn: 'root'
})
export class ChatService {
	private visible = false
	private blocked: Set<string> = new Set<string>()

	public chatInput: string = "";
	public chatList: {name: string, msgs: {msg: string, align: string}[]}[] = [{ name: '!cmd', msgs: [
		{msg: "/new '#channel' -pwd 'password': create or join a protected server", align: "left"},
		{msg: "/new '#channel' -pvt': create a private server", align: "left"},
		{msg: "/new '#channel': create or join a public server", align: "left"},
		{msg: "/blocked 'intra': see blocked users", align: "left"},
		{msg: "/unblock 'intra': unblock user", align: "left"},
		{msg: "/block 'intra': block user", align: "left"},
		{msg: "/new 'intra': start a private conversastion", align: "left"},
		{msg: "commands:", align: "left"}
	]}]
	public msgList: {msg: string, align: string}[] = this.chatList[0].msgs;
	public selectedChat: string = this.chatList[0].name;

	//constructor

	constructor(private socket: SocketService, private router: Router){
		socket.socketSubscribe('chatrecv', (msg:  {window: string, msg: string}) => this.recvMessage(msg, 'left'));
		socket.socketSubscribe('chatrecvblockable', (msg:  {window: string, msg: string, sender: string}) => this.recvBlockableMessage(msg, 'left'));
		socket.socketSubscribe('chatrecvR', (msg:  {window: string, msg: string}) => this.recvMessage(msg, 'right'));
		socket.socketSubscribe('deleteChatRoom', (chatRoomName: string) => this.deleteChatRoom(chatRoomName, 'right'));
		socket.socketSubscribe('navtoprofile', (intra: string) => this.navToProfile(intra));
		socket.socketSubscribe('newchat', (chat: {name: string, msgs: {msg: string, align: string}[]}) => this.newChat(chat))
		socket.socketSubscribe('blockuser', (intra: string) => this.blocked.add(intra))
		socket.socketSubscribe('unblockuser', (intra: string) => this.blocked.delete(intra))
		this.socket.requestEvent('blockedusers', null, (blocked: string) => this.setBlocked(blocked));
	}

	//private

	private setBlocked(blockedlist: string){
		for (let blocked of blockedlist)
			this.blocked.add(blocked)
		console.log(blockedlist)
	}

	private navToProfile(intra: string){
		this.router.navigate(['/display/' + intra]);
	}

	private newChat(chat: {name: string, msgs: {msg: string, align: string}[]}){
		if (chat.name.startsWith("#")){

		}
		else{
			chat.msgs.push({msg: "/friend: add a friend", align: "left"});
			chat.msgs.push({msg: "/game: start a game", align: "left"});
			chat.msgs.push({msg: "/game -p: start a game with powerups", align: "left"});
			chat.msgs.push({msg: "/visit: show user profile", align: "left"});
			chat.msgs.push({msg: "commands:", align: "left"});
		}
		this.chatList.push(chat);
	}


	private recvMessage(msg: {window: string, msg: string}, align: string){
		console.log("msg: " + msg);
		for(let chat of this.chatList){
			if(chat.name == msg.window){
				chat.msgs.unshift( { msg: msg.msg, align: align } );
				return;
			}
		}
		let msgList: {msg: string, align: string}[] = [];
		msgList.push({msg: msg.msg, align: align});
		const chat = {name: msg.window, msgs: msgList};
		this.chatList.push(chat);
		console.log(this.msgList);
	}

	private recvBlockableMessage(msg: {window: string, msg: string, sender: string}, align: string){
		console.log("msg: " + msg);
		if (this.blocked && this.blocked.has(msg.sender))
			return
		for(let chat of this.chatList){
			if(chat.name == msg.window){
				chat.msgs.unshift( { msg: msg.msg, align: align } );
				return;
			}
		}
		let msgList: {msg: string, align: string}[] = [];
		msgList.push({msg: msg.msg, align: align});
		const chat = {name: msg.window, msgs: msgList};
		this.chatList.push(chat);
		console.log(this.msgList);
	}

	private deleteChatRoom(chatRoomName: string, align: string) {
		const index = this.chatList.findIndex((chat) => chat.name === chatRoomName);
		if(index !== -1) {
			this.selectedChat = this.chatList[0].name;
			this.chatList.splice(index, 1);
			return;
		}
	}

	private serverAnswer(){
		this.chatInput = "";
	}

	//public

	public selectChat(chat: {name: string, msgs: {msg: string, align: string}[]}, event: Event){
		this.msgList = chat.msgs;
		this.selectedChat = chat.name;
		(event.target as HTMLInputElement).parentElement?.childNodes.forEach(child => {
			if ((child as HTMLInputElement).classList)
			(child as HTMLInputElement).classList.remove("selected");
		});
		(event.target as HTMLInputElement).classList.add("selected");
	}

	public sendMessage(){
		this.socket.requestEvent('chatsend', { chat: this.selectedChat, msg: this.chatInput}, () => this.serverAnswer());
	}


	public isChatVisible(){
		return this.visible
	}

	public toggleChat(){
		this.visible = !this.visible
		console.log('toggle chat')
	}

}
