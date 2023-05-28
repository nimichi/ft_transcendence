import { Injectable } from '@nestjs/common';
import { MessageTypeDTO, channelDTO, chatEmitDTO } from './dtos/MessageTypeDTO';
// import { CommandDTO } from './dtos/CommandDTO';
// import { ChannelArrayProvider } from '../commonProvider/ChannelArrayProvider';
import { ChatMode } from './enums/chatMode';
import { Socket, Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { DirectFrindsDTO } from './dtos/DirectFriendsDTO';
import { SocketGateway } from 'src/socket/socket.gateway';


@Injectable()
export class ChatService {
	private channelDto: channelDTO[];
	private queue: Set<string> = new Set<string>();

	constructor(private prismaService: PrismaService, private socketGateway: SocketGateway){
		this.channelDto = [];
	};

	private setChannelDTO(owner: string, admin: string, channelName: string, password: string, hidden: boolean): channelDTO {
		return new channelDTO(owner, channelName, [admin], hidden, password,[]);
	}

	async reciveMsg(intra: string, client: any, MessageTo: string, message: string) : Promise<chatEmitDTO>{
		const fullCommand: string[] = message.split(" ")
		if(MessageTo == "!cmd") {
			console.log("fullComand: " + fullCommand);
			if(fullCommand[0] === "/new") {
				if (!fullCommand[1].includes("#")) {
					const channelNameToUser: string = fullCommand[1];
					return new chatEmitDTO('newchat', channelNameToUser,['new channel',  'left'] );
				}
				else if (fullCommand[1].includes("#")) { //newChannel
					let password : string;
					let hide: boolean = false;
					const roomChannel: string = fullCommand[1];
					const dto = this.channelDto.find((channel) => (channel.channelName === roomChannel));
					if(fullCommand.length >= 4 && fullCommand[2] == "-pass"){
						console.log("password: " + fullCommand[3]);
						password = fullCommand[3];

					}else if(fullCommand.length >= 3 && fullCommand[2] === "-priv") {
						hide = true;
					}
					if(dto === undefined) {
						this.channelDto.push(this.setChannelDTO(intra, intra, roomChannel, password, hide));
					}else if(dto.hidden) {
						return new chatEmitDTO('chatrecv', roomChannel, "This Channel is Private");
					}else if (dto.password !== password) {
						return new chatEmitDTO('chatrecv', roomChannel, "Wrong Password");
					}
					console.log("WRONG");
					client.join(roomChannel);
					return new chatEmitDTO('newchat', roomChannel, ["new Conversation", 'left']);
				}
			}
		}
		else if(MessageTo.includes("#")) {
			if(fullCommand[0].includes("/getinfo")) {
				if(this.hasRights(intra, MessageTo)) {
					const channelInfo : string = JSON.stringify (this.channelDto.find((dto) => dto.channelName === MessageTo));
					console.log("channelInfo : " + channelInfo);
					return new chatEmitDTO('styledList', fullCommand[1], [channelInfo, 'left']);
				}
				return new chatEmitDTO('chatrecv', MessageTo, "not enough rights");
			}
			else if (fullCommand[0].includes("/setadmin")) { // /setadmin mnies #ch1
				if (fullCommand.length === 3) {
					const checkIdx = this.channelDto.findIndex((dto) =>
						((dto.owner === intra || dto.admin.findIndex((ad) => ad === intra) !== -1) &&
							(dto.channelName === fullCommand[2])
						));
						if (this.hasRights(intra, MessageTo) === true) {
							this.setNewAdmin(intra, fullCommand[1], fullCommand[2], this.channelDto);
						return new chatEmitDTO('chatrecv', fullCommand[1], ["New Admin " + fullCommand[1]]);
					}
					else if (checkIdx === -1)
						return new chatEmitDTO('chatrecv', MessageTo, ["Error: no Rights to set Admin", "left"]);
				}
				return new chatEmitDTO('chatrecv', MessageTo, ["Error: Wrong format\n</setadmin intraname channelName>", "left"]);
			}
			else if (fullCommand[0].includes("/getuserlist") && this.hasRights(intra, MessageTo)) {
				const list: string[] = ['mnies', 'dmontema', 'mjeyavat'];
				return new chatEmitDTO('chatrecv', MessageTo, list);
			}
			else if (fullCommand[0].includes("/ban") && this.hasRights(intra, MessageTo)) {
				const userToBan = fullCommand[1];
				const roomName = MessageTo;
				if(this.channelDto.find((c) => c.channelName === roomName).owner !== userToBan) {
					this.channelDto.find((c) => c.channelName === roomName).banned.push(userToBan);
					const clientToBan = (await this.socketGateway.server.fetchSockets()).find((s) => s.data.username === userToBan);
					clientToBan.leave(roomName);
					return new chatEmitDTO('chatrecv',roomName, "user was banned");
				}
				return new chatEmitDTO('chatrecv', roomName, "Error:" + userToBan + " is Owner!" );
			}
			else if (fullCommand[0].includes("/kick") && this.hasRights(intra, MessageTo)) {
				const userToKick = fullCommand[1];
				const roomName = MessageTo;
				
				if(this.channelDto.find((c) => c.channelName == roomName).owner !== userToKick) {
					const clientToKick = (await this.socketGateway.server.fetchSockets()).find((s) => s.data.username === userToKick);
					clientToKick.emit('chatrecv', {to: roomName, msg: "You have been kicked!"});
					clientToKick.leave(roomName);
					return new chatEmitDTO('chatrecv', roomName, "user " + userToKick + " has been kicked");
				}
			}
			else if (fullCommand[0].includes("/mute") && this.hasRights(intra, MessageTo)) {
				const userToMute = fullCommand[1];
				const roomName = MessageTo;
				const foundChannel = this.channelDto.find((c) => c.channelName === roomName);
				if(foundChannel.owner !== userToMute) {
					foundChannel.muted.set(userToMute, Math.floor(Date.now() + 2 * 60 * 1000 )); // in minuts
					client.to(roomName).emit('chatrecv', {to: MessageTo, msg: "User "+ userToMute + " has been muted for 2 min"});
					return new chatEmitDTO('chatrecv', roomName, "User " + userToMute + " is Muted");
				}
			}
			else if(fullCommand[0].includes("/mute")) {
				return new chatEmitDTO('chatrecv', MessageTo, "Not Authorized");
			}
			else if(fullCommand[0].includes("/resetPassword")) {
				let Newpassword: string;
				const roomName = MessageTo;
				const foundChannel = this.channelDto.find((c) => c.channelName === roomName);
				if(fullCommand.length === 2) {
					Newpassword = fullCommand[1];
				}
				if(foundChannel.owner === intra) {
					foundChannel.password = Newpassword;
					return new chatEmitDTO('chatrecv', roomName, "Password has been updated");
				}
				return new chatEmitDTO('chatrecv', MessageTo, "Not Authorized");
				
			}
			else {//endMsg
				const foundChannel = this.channelDto.find((c) => c.channelName === MessageTo);
				// if(foundChannel.hidden)
				// 	return new chatEmitDTO('chatrecv', MessageTo, "This Channel is Private");
				if(foundChannel.banned.findIndex((b) => b === intra) !== -1) //bann
					return new chatEmitDTO('chatrecv', MessageTo, "Not Authorized");
				if(!client.rooms.has(MessageTo)) { //kick
					//abfrage fuer passwort
					client.join(MessageTo);
					//nachricht an nutzert selbst
					client.emit('chatrecv', {to: MessageTo, msg: "You Joind the channel"});
					//nachricht an alle
					client.to(MessageTo).emit('chatrecv', {to: MessageTo, msg: "User " + intra + " joined back in"});
				}
				if(foundChannel.muted.has(intra) && foundChannel.muted.get(intra) >= Date.now()) //mute
				{
					return new chatEmitDTO('chatrecv', MessageTo, "you have been Muted, Try again Later");
				}
				client.to(MessageTo).emit('chatrecv', {to: MessageTo, msg: intra + ': ' + message});
				return new chatEmitDTO('chatrecvR', MessageTo, message);
			}
		}
		else{ // in private chat
			if(fullCommand[0].includes("/game")) { // start game
				if(intra === MessageTo){
					return new chatEmitDTO('chatrecv', MessageTo, "only possible with other user");
				}
				const id = intra + '!g' +MessageTo;
				if(this.queue.has(id)){
					this.queue.delete(id);
					client.to(MessageTo).emit('navtoprivgame',{gameid: intra + MessageTo, powup: true})
					client.emit('navtoprivgame',{gameid: intra + MessageTo, powup: true})
					return new chatEmitDTO('chatrecv', MessageTo, intra + " accepted yout invite");
				}
				else{
					const rid = MessageTo + '!g' + intra;
					this.queue.add(rid);
					return new chatEmitDTO('chatrecv', MessageTo, intra + " wants to play against you. type '/game' to confirm");
				}
			}
			else if(fullCommand[0].includes("/friend")) { // start game
				if(intra === MessageTo){
					return new chatEmitDTO('chatrecv', MessageTo, "only possible with other user");
				}
				const id = intra + '!f' +MessageTo;
				if(this.queue.has(id)){
					this.queue.delete(id);
					this.prismaService.addFriend(client, MessageTo);
					return new chatEmitDTO('chatrecv', MessageTo, intra + " accepted yout invite");
				}
				else{
					const rid = MessageTo + '!f' + intra;
					this.queue.add(rid);
					return new chatEmitDTO('chatrecv', MessageTo, intra + " wants to be your friend. type '/friend' to confirm");
				}
			}
			else if(fullCommand[0].includes("/visit")) { // visit profile page
				return new chatEmitDTO('navtoprofile', '', MessageTo);
			}
			else{
				return this.sendPrivateMessage(intra, MessageTo, message);
			}
		}
	}

	private hasRights(askingClient: string, channelName:string) :boolean {
		const idx = this.channelDto.findIndex((dto) => (
			(dto.owner === askingClient || dto.admin.findIndex((ad) => ad === askingClient) !== -1) && (dto.channelName === channelName)
			));
		return idx !== -1 ? true : false;
	}

	private setNewAdmin(commandFrom: string, intra: string, channelName: string, channels: channelDTO[]) {
		//check if #ch1 is in channel
		console.log("HERE in setNewAdmin\nchannelName: " + channelName + "\nintra: " + intra);
		channels.find((dto) => dto.channelName == channelName).admin.push(intra);

	}

	private async sendPrivateMessage(intra: string, userName: string, message: string) : Promise<chatEmitDTO>{
		//muss angepasst werden
		const sockets = await this.socketGateway.server.fetchSockets();
		//private schauen ob nutzer onine
		for(let socket of sockets) {
			if(socket.data.username === userName) {
				return new chatEmitDTO('chatrecv', userName, message);
			}
		}
		return new chatEmitDTO('chatrecv', intra, "user not available");
		// if(!this.checkUserInList(intra, userName)) {
		// 	this.channelArrayProvider.addUserToList(intra, userName);
		// }

	}
}