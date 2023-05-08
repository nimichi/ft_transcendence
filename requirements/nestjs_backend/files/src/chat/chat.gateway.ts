import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(private chat: ChatService){}

	@SubscribeMessage('chatsend')
	async handleRecieveMsg (client: Socket, payload: string) : Promise<string> {
		let intra;
		[intra] = client.rooms;

		console.log(payload);


		// const responseDTO = await this.chat.reciveMsg(intra, payload);

		// responseDTO.reciverList.forEach(function (reciever) {
		// 	console.log(reciever);
		// 	client.to(reciever).emit('chatrecv', responseDTO.message);
		// })
		client.to(payload).emit('chatrecv', payload);
		return payload;
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
