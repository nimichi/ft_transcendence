import { Injectable } from '@nestjs/common';
import { MessageTypeDTO, channelDTO, chatEmitDTO } from './dtos/MessageTypeDTO';
// import { CommandDTO } from './dtos/CommandDTO';
import { ChannelArrayProvider } from '../commonProvider/ChannelArrayProvider';
import { ChatMode } from './enums/chatMode';


@Injectable()
export class ChatService {
	private channelDto: channelDTO[];
	constructor(private channelArrayProvider: ChannelArrayProvider){
		this.channelDto = [];
	};

	private setChannelDTO(owner: string, admin: string, channelName: string): channelDTO {
		return new channelDTO(owner, channelName, admin, false, "ssss");
	}

	async reciveMsg(intra: string, client: any, MessageTo: string, message: string) : Promise<chatEmitDTO>{
		const fullCommand: string[] = message.split(" ")
		this.printGroupChannelEntry();
		if(MessageTo == "!cmd") {
			console.log("fullComand: " + fullCommand);
			if(fullCommand[0].includes("/new")) {
				if (!fullCommand[1].includes("#")) {
					console.log("message from:" + MessageTo);
					// this.channelArrayProvider.addUserToList(fullCommand[1]);
					console.log(this.channelArrayProvider.getUserList());
					return new chatEmitDTO('newchat', fullCommand[1],['new channel',  'left'] );
				}
				else if (fullCommand[1].includes("#") && !this.checkChannelInList(fullCommand[1])) { //newChannel

					this.channelArrayProvider.addChannel(fullCommand[1]);
					this.channelArrayProvider.addChannelEntry([intra], fullCommand[1]);

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
					this.channelArrayProvider.addUserToChannel(fullCommand[1], intra);
					this.channelArrayProvider.addUserToList(intra);
					return new chatEmitDTO('newchat', fullCommand[1], [this.channelArrayProvider.getUserList(), 'left']);
				}
			}
			else if(fullCommand[0].includes("/getchanellist")) {
				return new chatEmitDTO('styledList', fullCommand[1], [this.channelArrayProvider.getChannels(), 'left']);
			}
		}
		else if(this.checkChannelInList(MessageTo)) {//TODO:
			if(fullCommand[0] === "/getinfo") {
				if(this.hasRights(intra, fullCommand[1])) {
					const channelInfo : string = JSON.stringify (this.channelDto.find((dto) => dto.channelName === MessageTo));
					return new chatEmitDTO('styledList', fullCommand[1], [channelInfo, 'left']);
				}
			}
			else if (fullCommand[0].includes("/setadmin")) { // /setadmin mnies #ch1
				if (fullCommand.length === 3) {
					// console.log("fullcomand 0: "+ fullCommand[0]);
					// console.log("fullcomand 1: "+ fullCommand[1]);
					// console.log("fullcomand 2: "+ fullCommand[2]);
					// console.log("message from sender: "+ intra);
					//schau ob es erlaubt ist command sollte von admin oder
					const checkIdx = this.channelDto.findIndex((dto) =>
						((dto.owner === intra || dto.admin === intra) &&
							(dto.channelName === fullCommand[2])
						));
					const updatedChannelDto: channelDTO = this.setNewAdmin(intra, fullCommand[1], fullCommand[2], this.channelDto);
					if (this.hasRights(intra, fullCommand[2]) === true) {
						this.channelDto.splice(checkIdx, 1)[0];
						this.channelDto.push(updatedChannelDto);
						return new chatEmitDTO('chatrecv', fullCommand[1], ["New Admin" + fullCommand[1], "left"]);
					}
					else if (checkIdx === -1)
						return new chatEmitDTO('chatrecv', MessageTo, ["Error: no Rights to set Admin", "left"]);
				}
				return new chatEmitDTO('chatrecv', MessageTo, ["Error: Wrong format", "left"]);
			}
			else if (fullCommand[0].includes("/getuserlist") && this.hasRights(intra, fullCommand[2])) {
				console.log("get userList is accessed MessageTo: "+ MessageTo);
				return new chatEmitDTO('chatrecv', MessageTo, [this.channelArrayProvider.getChannelEntrys().get(MessageTo), 'right']);
			}else {
				return new chatEmitDTO('chatrecv', MessageTo, ["Error: not Authorized", 'left']);
			}
		}
		else if(fullCommand[0].includes("/msg")) {
			if(fullCommand[1].includes("#")) {
				//ist ein Channel
			}
			else {
				//ist ein UserName
				const intraNameTo: string = fullCommand[1];
				if(this.checkUserInList(intraNameTo)) {
					const finalMessage: string = fullCommand[2].length !== 0 ? fullCommand[2] : "";
					return new chatEmitDTO('chatrecv', MessageTo, finalMessage);
				}
			}

		}
		// console.log("direct message to: "+ MessageTo);
		const finalMessage = {
			to: MessageTo,
			msg: message
		};

		return new chatEmitDTO('chatrecv', MessageTo, message);
	}

	async disconnectUser(intra: string) {
		if(this.channelArrayProvider.getUserList().length !== 0 && this.channelArrayProvider.userExists(intra)) {
			const currentChannelList = this.channelArrayProvider.getChannels();
			this.channelArrayProvider.deleteUserFromList(intra);
			this.channelArrayProvider.deleteUserFromChannels(intra);
		}
	}

	async connectUser(intra: string) {
		//is user in channle
		if(this.channelArrayProvider.getUserList.length !== 0 && !this.channelArrayProvider.userExists(intra)) {
			this.channelArrayProvider.addUserToList(intra);
		}
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
		if (this.checkChannelInList(channelName) && this.checkUserInList(intra)) {
			//const foundDto = dtoArray.find((dto) => dto.id === desiredId);
			const channelInfo: channelDTO = channels.find((dto) => dto.channelName == channelName);
			console.log("in Set new Admin: channelInfo: " + channelInfo);
			if (channelInfo.owner === commandFrom || channelInfo.admin === commandFrom) {
				return new channelDTO(commandFrom, channelName, intra, false, "ssss");
			}
		}
		return new channelDTO(commandFrom, channelName, commandFrom, false, "ssss");
	}

	private checkUserInList(userName: string) : boolean {
		return this.channelArrayProvider.getUserList().includes(userName)
	}

	private checkChannelInList(groupeChannelName: string) : boolean {
		return this.channelArrayProvider.channelExists(groupeChannelName);
	}

	private printGroupChannelEntry() {
		if (this.channelArrayProvider.getChannelEntrys()) {
			console.log(this.channelArrayProvider.getChannelEntrys());
		}
	}

}