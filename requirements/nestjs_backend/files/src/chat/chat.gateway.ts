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
		const responseDTO: chatEmitDTO =  await this.chat.reciveMsg(intra ,client, payload.chat, payload.msg);
		if(payload.chat === "!cmd") {
			if(responseDTO.modus == 'newchat') {
				client.emit(responseDTO.modus, {name: responseDTO.messageTo, msgs: responseDTO.msg});
			}else {
				client.to(payload.chat).emit(responseDTO.modus, {name: responseDTO.messageTo, msgs: responseDTO.msg});
			}
		}
	
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
