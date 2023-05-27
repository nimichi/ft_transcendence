import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { chatEmitDTO } from './dtos/MessageTypeDTO';

@WebSocketGateway()
export class ChatGateway {

	constructor(private chat: ChatService){}

	@SubscribeMessage('chatsend')
	async handleRecieveMsg (client: Socket, payload: {chat: string, msg: string}) : Promise<string> {
		let intra;
		[intra] = client.rooms;
		console.log(intra);
		const responseDTO: chatEmitDTO =  await this.chat.reciveMsg(intra ,client, payload.chat, payload.msg);
		if(payload.chat === "!cmd" && responseDTO.modus == 'newchat') {

			console.log("Response message in new: " + responseDTO.msg);
			client.emit(responseDTO.modus, {name: responseDTO.messageTo, msgs: responseDTO.msg});
			return this.responder(client, responseDTO.modus, responseDTO.messageTo, intra);
		}
		else if(payload.chat === "!cmd" && responseDTO.modus == 'styledList') {
			console.log("responseDTO.msg[0]: " + responseDTO.msg[0]);
			const json = JSON.stringify(responseDTO.msg[0]);
			client.emit(responseDTO.modus, {to: payload.chat, msg: json});
			return "";
		}
		else if(payload.chat.includes("#") && responseDTO.modus === 'chatrecv' && payload.msg[0] === "/") {
				const json = JSON.stringify(responseDTO.msg);
				console.log("payload chat is: " + payload.chat);
				console.log("ResponesDTO message json: "+ json);
				client.emit(responseDTO.modus, {to: payload.chat, msg: json});
				return "";
		}
		else if(payload.chat != "!cmd" && responseDTO.modus === 'styledList') { //channel general info
			console.log("Message: "+ JSON.stringify(responseDTO.msg));
			const finalMessage: {to: string, msg: string} = {
				to: responseDTO.messageTo,
				msg: JSON.stringify(responseDTO.msg)}
			client.emit(responseDTO.modus, {to: payload.chat, msg: responseDTO.msg});
			return "";
		}
		else if(responseDTO.modus === 'deleteChatRoom') {
			const emitedFrom: string = payload.chat;
			const userEmited: string = intra;
			console.log("Chat gateway:\n\tResponse:\n\t\ToDeleteChannel: " + responseDTO.messageTo + "\nmessage: "+responseDTO.messageTo + "\nUser emited: " + userEmited +"\nEmmited from: " + emitedFrom);
			client.emit(responseDTO.modus, responseDTO.msg);
		}
		else if  (payload.chat != "!cmd" && !payload.chat.includes("#")) { //direct message to user
			console.log("modus: " + responseDTO.modus);
			const constructedMessage = intra+ ": " + responseDTO.msg;
			client.to(payload.chat).emit(responseDTO.modus, {to:intra, msg:constructedMessage});
			return payload.msg;
		}
		else if( payload.chat !== "!cmd" && payload.chat.includes("#")) { //nachricheten in gruppe 
			const constructedMessage = intra+": " + payload.msg;
			client.to(payload.chat).emit(responseDTO.modus, {to: payload.chat, msg: constructedMessage})
		}
		return payload.msg;
	}

	// handleConnection(client: Socket) {
	// 	let intra;
	// 	[intra] = client.rooms;
	// 	this.chat.disconnectUser(intra);
	// }

	// handleDisconnect(client: Socket) {
	// 	let intra;
	// 	[intra] = client.rooms;
	// 	this.chat.connectUser(intra);
	// }

	private responder(client: Socket, modus: string, MessageToRoom: string, intra: string): string {
		console.log(MessageToRoom.includes("#"))
		if(MessageToRoom.includes("#")) {
			client.to(MessageToRoom).emit('chatrecv', {to: MessageToRoom, msg: intra + " joind"});
			return  ""; 
		}
		return intra + " new Conversation with:  " + MessageToRoom;
	}
}