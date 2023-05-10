import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { chatEmitDTO } from './dtos/MessageTypeDTO';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(private chat: ChatService){}

	@SubscribeMessage('chatsend')
	async handleRecieveMsg (client: Socket, payload: {chat: string, msg: string}) : Promise<string> {
		let intra;
		[intra] = client.rooms;
		console.log("For Chat: \'" + payload.chat + "\', Recieved message: " + payload.msg);
		// if (payload.chat == "!cmd")
		// {
		// 	console.log("payload chat: " + payload.chat + "\npayload-msg: " + payload.msg);
		// 	// /msg intraNameTo
		// 	const fullCommand: string[] = payload.msg.split(" ");
		// 	console.log("COMMAND: " + fullCommand[0] + " || " + "COMMANDSPECIFIC: "+ fullCommand[1]);
		// 	const cmd = fullCommand[0];
		// 	if(cmd == "/msg") {
				
		// 		const messageTo = fullCommand[1];
		// 		// if(this.chat.)
		// 		client.emit('newchat', {name: messageTo, msgs: [{msg:"nwe convo with", alig: "left"}]});
		// 	}
		// 	client.emit('newchat', {name: 'mnies', msgs: [{msg: "new conversation with", align: "left"}]});
		// }
		const responseDTO: chatEmitDTO =  await this.chat.reciveMsg(client, payload.chat, payload.msg);
		if(payload.chat === "!cmd") {
			client.emit(responseDTO.modus, {name: responseDTO.messageTo, msgs: responseDTO.msg});
		}
		// const responseDTO = await this.chat.reciveMsg(payload.chat, payload.msg);

		// responseDTO.reciverList.forEach(function (reciever) {
		// 	console.log(reciever);
		// 	client.to(reciever).emit('chatrecv', responseDTO.message);
		// })
		if (payload.chat != "!cmd")
			client.to(payload.chat).emit('chatrecv', payload.msg);
		return payload.msg;
	}

	handleConnection(client: Socket) {
		let intra;
		[intra] = client.rooms;
		this.chat.disconnectUser(intra);
	}

	handleDisconnect(client: Socket) {
		let intra;
		[intra] = client.rooms;
		this.chat.connectUser(intra);
	}
}
