import { Injectable } from '@nestjs/common';
import { MessageTypeDTO, channelDTO, chatEmitDTO } from './dtos/MessageTypeDTO';
// import { CommandDTO } from './dtos/CommandDTO';
// import { ChannelArrayProvider } from '../commonProvider/ChannelArrayProvider';
import { ChatMode } from './enums/chatMode';
import { PrismaService } from 'src/prisma/prisma.service';
import { DirectFrindsDTO } from './dtos/DirectFriendsDTO';
import { SocketGateway } from 'src/socket/socket.gateway';


@Injectable()
export class ChatService {
	private channelDto: channelDTO[];

	constructor(private prismaService: PrismaService, private socketGateway: SocketGateway){
		this.channelDto = [];
	};

	private setChannelDTO(owner: string, admin: string, channelName: string): channelDTO {
		return new channelDTO(owner, channelName, [admin], false,"ssss",[]);
	}

	async reciveMsg(intra: string, client: any, MessageTo: string, message: string) : Promise<chatEmitDTO>{
		const fullCommand: string[] = message.split(" ")
		if(MessageTo == "!cmd") {
			console.log("fullComand: " + fullCommand);
			if(fullCommand[0].includes("/new")) {
				if (!fullCommand[1].includes("#")) {
					const channelNameToUser: string = fullCommand[1];
					return new chatEmitDTO('newchat', channelNameToUser,['new channel',  'left'] );
				}
				else if (fullCommand[1].includes("#")) { //newChannel
					const roomChannel: string = fullCommand[1];
					client.join(roomChannel);
					if(this.channelDto.findIndex((channel) => (channel.channelName === roomChannel))) {
						this.channelDto.push(this.setChannelDTO(intra, intra, roomChannel));
					}
					return new chatEmitDTO('newchat', roomChannel, ["new Conversation", 'left']);
				}
			}
			else if (fullCommand[0].includes("/delete")) { // /delete username | message comes from intra
				//check die userlist ab
				const userRoomNameToDelete = fullCommand[1];
				console.log("Deleted user: " + userRoomNameToDelete);

				if(!userRoomNameToDelete.includes("!cmd")){
					new chatEmitDTO('deleteChatRoom', intra, userRoomNameToDelete);
					// this.deleteUser(userRoomNameToDelete, intra);
				}
			}
			else if(fullCommand[0].includes("/friend")) {
				const intra2: string = fullCommand[1];
				this.prismaService.addFriend(client, intra2);
				console.log("friends: " + intra + " " + intra2);
				return new chatEmitDTO('newchat', intra2, intra+" invited you as\n");
			}
			else if(fullCommand[0].includes("/game")) { // /game dmontema
				const intra2: string = fullCommand[1];
				//TODO: Type youre code here
				console.log("play game: " + intra + " vs " + intra2);
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
				
				this.channelDto.find((c) => c.channelName === MessageTo).banned.push(fullCommand[1]);
				return new chatEmitDTO('chatrecv',MessageTo, "user was banned");
			} 
			else {
				if(this.channelDto.find((c) => c.channelName === MessageTo).banned.findIndex((b) => b === intra) === -1) {
					return new chatEmitDTO('chatrecv', MessageTo, "");
				}
				console.log("WE WANT WE WANT TO ...");
				return new chatEmitDTO('chatrecv', MessageTo, "Not Authorized");
			}
		}
		
		return this.sendPrivateMessage(intra, MessageTo, message);
			
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