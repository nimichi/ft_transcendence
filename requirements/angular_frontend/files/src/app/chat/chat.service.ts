import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SocketService } from '../socket/socket.service';



@Injectable({
  providedIn: 'root'
})

export class ChatService {
  private visible = false

  public chatInput: string = "";
  public chatList: {name: string, msgs: {msg: string, align: string}[]}[] = [ { name: '!cmd', msgs: []}]
  public msgList: {msg: string, align: string}[] = this.chatList[0].msgs;
  public selectedChat: string = this.chatList[0].name;

  constructor(private socket: SocketService){
	  this.socket.socketSubscribe('chatrecv', (msg: string) => this.recvMessage(msg, 'left'));
	  this.socket.socketSubscribe('chatrecvR', (msg: string) => this.recvMessage(msg, 'right'));
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
	  this.chatList.push(chat);
  }

  recvMessage(msg: string, align: string){
	  console.log("++++++++++++++RECVMESSAGE+++++++++++++++++++++++++++");
	  console.log("msg: " + msg);
	  this.msgList.unshift( { msg: msg, align: align } );
	  console.log(this.msgList);
  }

  outputUserList(msg: string[]) {
	  msg.forEach(user => {
		  this.msgList.unshift({msg: user, align: 'left'})
		  console.log(this.msgList);
	  })
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

  isChatVisible(){
    return this.visible
  }

  toggleChat(){
    this.visible = !this.visible
    console.log('toggle chat')
  }

}