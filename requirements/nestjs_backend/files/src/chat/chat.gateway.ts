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
		console.log(intra);
		const responseDTO: chatEmitDTO =  await this.chat.reciveMsg(intra ,client, payload.chat, payload.msg);
		if(payload.chat === "!cmd" && responseDTO.modus == 'newchat') {
			console.log("Response message in new: " + responseDTO.msg)
			client.emit(responseDTO.modus, {name: responseDTO.messageTo, msgs: responseDTO.msg});
			return "";
		}
		else if(payload.chat === "!cmd" && responseDTO.modus == 'styledList' && payload.msg.includes("/getchanellist")) {
			console.log(responseDTO.msg[0]);
			const json = JSON.stringify(responseDTO.msg[0]);
			client.emit(responseDTO.modus, json)
			return "";
		}
		else if(payload.chat.includes("#") && responseDTO.modus === 'chatrecv' && payload.msg[0] === "/") {
			// if(responseDTO.msg. == 2) {
				// JSON.stringify(stringArray)
				const json = JSON.stringify(responseDTO.msg[0]);
				console.log("payload chat is: " + payload.chat);
				console.log("ResponesDTO message json: "+ json);
				client.emit(responseDTO.modus, json);
				return "";
			// }
		}
		else if(payload.chat != "!cmd" && responseDTO.modus === 'styledList') { //channel general info
	
			console.log("Message: "+ JSON.stringify(responseDTO.msg));
			const finalMessage: {to: string, msg: string} = {
				to: responseDTO.messageTo,
				msg: JSON.stringify(responseDTO.msg)}
			client.emit(responseDTO.modus, finalMessage);
			return "";
		}
		else if  (payload.chat != "!cmd") {
			//here msg umbauen in msg from 
			const messageN: {to: string, msg: string} = {
				to: responseDTO.messageTo,
				msg: payload.msg
			};
			console.log("For Chat: \'" + payload.chat + "\', Recieved message: " + messageN);
			client.to(payload.chat).emit(responseDTO.modus, messageN);
			return messageN.msg;
		}
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