import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { Event } from './enums/events';
import { emitDTO, processDTO } from './dtos/chatDTO';

@WebSocketGateway()
export class ChatGateway {

	constructor(private chat: ChatService){}

	@SubscribeMessage('chatsend')
	async handleRecieveMsg (client: Socket, payload: {chat: string, msg: string}) : Promise<string> {
		let processDto: processDTO = new processDTO(payload.chat, client.data.username, client, payload.msg, payload.msg.split(" "))
		const responses: emitDTO[] = await this.chat.processInput(processDto);
		client.emit(Event.SENDRIGHTALIGNEDMSG, {window: payload.chat, msg: payload.msg});
		for(let response of responses){
			switch (response.to){
				case client.data.username:
					client.emit(response.event, response.payload);
					break;
				default:
					client.to(response.to).emit(response.event, response.payload);
					break;
			}
		}
		return payload.msg;
	}
}