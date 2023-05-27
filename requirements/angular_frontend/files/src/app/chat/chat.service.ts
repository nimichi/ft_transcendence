import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
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

  constructor(private socket: SocketService, private router: Router){
	socket.socketSubscribe('chatrecv', (msg:  {to: string, msg: string}) => this.recvMessage(msg, 'left'));
	socket.socketSubscribe('chatrecvR', (msg:  {to: string, msg: string}) => this.recvMessage(msg, 'right'));
    socket.socketSubscribe('styledList', (msg:  {to: string, msg: string}) => this.recvMessage(msg, 'left'));
    socket.socketSubscribe('deleteChatRoom', (chatRoomName: string) => this.deleteChatRoom(chatRoomName, 'right'));
	socket.socketSubscribe('navtoprofile', (intra: string) => this.navToProfile(intra));
	socket.socketSubscribe('newchat', (chat: {name: string, msgs: {msg: string, align: string}[]}) => this.newChat(chat))
  }

  navToProfile(intra: string){
	this.router.navigate(['/display/' + intra]);
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


  recvMessage(msg: {to: string, msg: string}, align: string){
	  console.log("++++++++++++++RECVMESSAGE+++++++++++++++++++++++++++");
	  console.log("msg: " + msg);
    for(let chat of this.chatList){
      if(chat.name == msg.to){
        chat.msgs.unshift( { msg: msg.msg, align: align } );
        return;
      }
    }
    let msgList: {msg: string, align: string}[] = [];
    msgList.push({msg: msg.msg, align: align});
    const chat = {name: msg.to, msgs: msgList};
    this.chatList.push(chat);
	  console.log(this.msgList);
  }

  deleteChatRoom(chatRoomName: string, align: string) {
    const index = this.chatList.findIndex((chat) => chat.name === chatRoomName);
    if(index !== -1) {
      this.selectedChat = this.chatList[0].name;
      this.chatList.splice(index, 1);
      return;
    }
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
