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

	async reciveMsg(intra: string, client: any, messageFrom: string, message: string) : Promise<chatEmitDTO>{
		const fullCommand: string[] = message.split(" ")
		this.printGroupChannelEntry();

		if(messageFrom == "!cmd") {
			if(fullCommand[0].includes("/new")) {
				//schau ob nuzer nuzer und ob der bereit vorhanden in der liste vorhanden ist
				if (!fullCommand[1].includes("#") && !this.checkUserInList(fullCommand[1])) {
					this.channelArrayProvider.addUserToList(fullCommand[1]);
					console.log(this.channelArrayProvider.getUserList());
					return new chatEmitDTO('newchat', fullCommand[1],['new channel',  'left'] );
				}
				else if (fullCommand[1].includes("#") && !this.checkChannelInList(fullCommand[1])) { //newChannel

					this.channelArrayProvider.addChannel(fullCommand[1]);
					this.channelArrayProvider.addUserToList(intra);
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

		}
		else if(this.checkChannelInList(messageFrom)) {
			if (fullCommand[0].includes("/setadmin")) { // /setadmin mnies #ch1
				if (fullCommand.length === 3) {
					const updatedChannelDto: channelDTO = this.setNewAdmin(intra, fullCommand[1], fullCommand[2], this.channelDto);
					const idx = this.channelDto.findIndex((dto) => dto.channelName === fullCommand[2])
					if (idx !== -1) {
						const deletedDto = this.channelDto.splice(idx, 1)[0];
						this.channelDto.push(updatedChannelDto);
						console.log("Admin Updated: " + deletedDto + " to: " + updatedChannelDto);
						return new chatEmitDTO('chatrecv', messageFrom, ["Admin rechte wurden erfolgreich verteilt", "left"]);
					}
					return new chatEmitDTO('chatrecv', messageFrom, ["Error:", "left"]);
				}
				return new chatEmitDTO('chatrecv', messageFrom, ["Error: Wrong format", "left"]);
			}
			else if (fullCommand[0].includes("/getuserlist")) {
				console.log("get userList is accessed messageFrom: "+ messageFrom);
				return new chatEmitDTO('chatrecv', messageFrom, [this.channelArrayProvider.getChannelEntrys().get(messageFrom), 'right']);
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
					return new chatEmitDTO('chatrecv', messageFrom, finalMessage);
				}
			}

		}
		return new chatEmitDTO('chatrecv', messageFrom, message); //TODO FEHELRE
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

	private setNewAdmin(commandFrom: string, intra: string, channelName: string, channels: channelDTO[]): channelDTO {
		//check if #ch1 is in channel
		if (this.checkChannelInList(channelName) && this.checkUserInList(intra)) {
			//const foundDto = dtoArray.find((dto) => dto.id === desiredId);
			const channelInfo: channelDTO = channels.find((dto) => dto.channelName == channelName);
			if (channelInfo.owner === commandFrom || channelInfo.admin === commandFrom) {
				return new channelDTO(commandFrom, channelName, intra, false, "ssss");
			}


		}
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
