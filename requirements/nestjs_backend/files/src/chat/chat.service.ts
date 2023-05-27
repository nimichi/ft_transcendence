import { Injectable } from '@nestjs/common';
import { MessageTypeDTO, channelDTO, chatEmitDTO } from './dtos/MessageTypeDTO';
// import { CommandDTO } from './dtos/CommandDTO';
import { ChannelArrayProvider } from '../commonProvider/ChannelArrayProvider';
import { ChatMode } from './enums/chatMode';
import { PrismaService } from 'src/prisma/prisma.service';
import { DirectFrindsDTO } from './dtos/DirectFriendsDTO';
import { SocketGateway } from 'src/socket/socket.gateway';


@Injectable()
export class ChatService {
	private channelDto: channelDTO[];
	private friendEntrys: DirectFrindsDTO[];
	constructor(private channelArrayProvider: ChannelArrayProvider, private prismaService: PrismaService, private socketGateway: SocketGateway){
		this.channelDto = [];
		this.friendEntrys = [];
	};

	private setChannelDTO(owner: string, admin: string, channelName: string): channelDTO {
		return new channelDTO(owner, channelName, admin, false, "ssss");
		this.socketGateway.server.in("asd").client
	}

	async reciveMsg(intra: string, client: any, MessageTo: string, message: string) : Promise<chatEmitDTO>{
		const fullCommand: string[] = message.split(" ")
		this.printGroupChannelEntry();
		if(MessageTo == "!cmd") {
			console.log("fullComand: " + fullCommand);
			if(fullCommand[0].includes("/new")) {
				if (!fullCommand[1].includes("#")) {
					console.log("message from:" + MessageTo);
					this.channelArrayProvider.createUserEntry(intra);
					this.channelArrayProvider.createUserEntry(fullCommand[1]);
					this.channelArrayProvider.addUserToList(intra,fullCommand[1]);
					this.channelArrayProvider.addUserToList(fullCommand[1], intra);
					console.log(this.channelArrayProvider.getUserListForThisUser(intra));
					return new chatEmitDTO('newchat', fullCommand[1],['new channel',  'left'] );
				}
				else if (fullCommand[1].includes("#") && !this.checkChannelInList(fullCommand[1])) { //newChannel

					this.channelArrayProvider.addChannel(fullCommand[1]);
					this.channelArrayProvider.addChannelEntry([client], fullCommand[1]);

					const tmpChannelEntrys = this.channelArrayProvider.getChannelEntrys();
					console.log(tmpChannelEntrys)
					//logic channel owner & channel admin
					this.channelDto.push(this.setChannelDTO(intra, intra, fullCommand[1]));

					//falls user joinenen tut wird er in eine map gespeichert
					client.join(fullCommand[1]);
					return new chatEmitDTO('newchat', fullCommand[1], ["new Conversation", 'left']);
				}
				else if(fullCommand[1].includes("#") && this.checkChannelInList(fullCommand[1])) {
					client.join(fullCommand[1]);
					this.channelArrayProvider.addUserToChannel(fullCommand[1], client);
					// this.channelArrayProvider.addUserToList(intra);
					return new chatEmitDTO('newchat', fullCommand[1], [this.channelArrayProvider.getChannelEntrys().get(fullCommand[1]), 'left']);
				}
			}
			else if (fullCommand[0].includes("/delete")) { // /delete username | message comes from intra
				//check die userlist ab
				const userRoomNameToDelete = fullCommand[1];
				console.log("Deleted user: " + userRoomNameToDelete);
				const idx = this.channelArrayProvider.getUserListForThisUser(intra).findIndex( (user) => userRoomNameToDelete === user);
				// const idx2 = this.channelArrayProvider.getUserListForThisUser(userRoomNameToDelete).findIndex( (user) => intra === user );
				//&& (idx !== -1 && idx2 !== -1)
				if(!userRoomNameToDelete.includes("#")){
					this.deleteUser(intra, userRoomNameToDelete);
					// this.deleteUser(userRoomNameToDelete, intra);
				}
				else{ //falls gruppen kannal gleoescht werden soll
					if(this.hasRights(intra, userRoomNameToDelete)) {
						this.channelArrayProvider.deletChannel(userRoomNameToDelete);
						this.channelArrayProvider.deleteChannelEntry(userRoomNameToDelete);

					}
				}
				//&& idx2 !== -1 
				return idx !== -1 ? new chatEmitDTO('deleteChatRoom', intra, userRoomNameToDelete) : new chatEmitDTO('chatrecv', MessageTo, "No such contact");
			}
			else if(fullCommand[0].includes("/getchanellist") || fullCommand[0].includes("/getUserList")) {
				return (
						fullCommand[0].includes("/getchanellist") 
						? new chatEmitDTO('styledList', fullCommand[1], [this.channelArrayProvider.getChannels(), 'left']) 
						: new chatEmitDTO('styledList', fullCommand[1], [this.channelArrayProvider.getUserListForThisUser(intra), 'left'])
				);
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
		else if(this.checkChannelInList(MessageTo)) {//TODO: 
			console.log("here in info length: "+ fullCommand.length);
			if(fullCommand[0].includes("/getinfo")) {
				if(this.hasRights(intra, MessageTo)) {
					const channelInfo : string = JSON.stringify (this.channelDto.find((dto) => dto.channelName === MessageTo));
					console.log("channelInfo : " + channelInfo);
					return new chatEmitDTO('styledList', fullCommand[1], [channelInfo, 'left']);
				}
				return new chatEmitDTO('chatrecv', MessageTo, ["Error: no Rights to set Admin", "left"]);
			}
			else if (fullCommand[0].includes("/setadmin")) { // /setadmin mnies #ch1
				if (fullCommand.length === 3) {
					const checkIdx = this.channelDto.findIndex((dto) => 
						((dto.owner === intra || dto.admin === intra) &&
							(dto.channelName === fullCommand[2])
						));
					const updatedChannelDto: channelDTO = this.setNewAdmin(intra, fullCommand[1], fullCommand[2], this.channelDto);
					if (this.hasRights(intra, MessageTo) === true) {
						this.channelDto.splice(checkIdx, 1)[0];
						this.channelDto.push(updatedChannelDto);
						return new chatEmitDTO('chatrecv', fullCommand[1], ["New Admin " + fullCommand[1]]);
					}
					else if (checkIdx === -1)
						return new chatEmitDTO('chatrecv', MessageTo, ["Error: no Rights to set Admin", "left"]);
				}
				return new chatEmitDTO('chatrecv', MessageTo, ["Error: Wrong format\n</setadmin intraname channelName>", "left"]);
			}
			else if (fullCommand[0].includes("/getuserlist") && this.hasRights(intra, MessageTo)) {
				console.log("get userList is accessed MessageTo: "+ MessageTo);
				return new chatEmitDTO('chatrecv', MessageTo, this.channelArrayProvider.getChannelEntrys().get(MessageTo));
			}else {
				return new chatEmitDTO('chatrecv', MessageTo, ["Error: not Authorized", 'left']);
			}
		}

		return this.sendPrivateMessage(intra, MessageTo, message);
			
	}

	private deleteUser(intra: string, userToDelete: string) {
		if(this.channelArrayProvider.getUserListForThisUser(intra).length !== 0) {
			this.channelArrayProvider.deleteUserFromList(intra,userToDelete);
		}
	}

	async disconnectUser(intra: string) {
		this.channelArrayProvider.deleteUserToDiconnect(intra);
	}

	async connectUser(intra: string) {
		this.channelArrayProvider.createUserEntry(intra);
	}

	private hasRights(askingClient: string, channelName:string) :boolean {
		const idx = this.channelDto.findIndex((dto) => (
			(dto.owner === askingClient || dto.admin === askingClient) && (dto.channelName === channelName)
			));
		return idx !== -1 ? true : false;
	}

	private setNewAdmin(commandFrom: string, intra: string, channelName: string, channels: channelDTO[]): channelDTO {
		//check if #ch1 is in channel
		console.log("HERE in setNewAdmin\nchannelName: " + channelName + "\nintra: " + intra);
		if (this.checkChannelInList(channelName)) {
			//const foundDto = dtoArray.find((dto) => dto.id === desiredId);
			const channelInfo: channelDTO = channels.find((dto) => dto.channelName == channelName);
			console.log("in Set new Admin: channelInfo: " + channelInfo);
			if (channelInfo.owner === commandFrom || channelInfo.admin === commandFrom) {
				return new channelDTO(commandFrom, channelName, intra, false, "ssss");
			}
		}
		return new channelDTO(commandFrom, channelName, commandFrom, false, "ssss");
	}

	private checkUserInList(intra: string, userName: string) : boolean {
		return this.channelArrayProvider.getUserListForThisUser(intra).includes(userName) && this.channelArrayProvider.getUserListForThisUser(userName).includes(userName);
	}

	private checkChannelInList(groupeChannelName: string) : boolean {
		return this.channelArrayProvider.channelExists(groupeChannelName);
	}

	private printGroupChannelEntry() {
		if (this.channelArrayProvider.getChannelEntrys()) {
			console.log(this.channelArrayProvider.getChannelEntrys());
		}
	}

	private sendPrivateMessage(intra: string, userName: string, message: string) : chatEmitDTO{
		if(!this.checkUserInList(intra, userName)) {
			this.channelArrayProvider.addUserToList(intra, userName);
		}
		return new chatEmitDTO('chatrecv', userName, message);

	}
}