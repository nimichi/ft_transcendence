import { Injectable } from '@nestjs/common';
import { MessageTypeDTO, chatEmitDTO } from './dtos/MessageTypeDTO';
import { CommandDTO } from './dtos/CommandDTO';
import { ChannelArrayProvider } from 'src/commonProvider/ChannelArrayProvider';
import { ChannelDTO } from './dtos/ChannelDTO';


@Injectable()
export class ChatService {
	constructor(private channelArrayProvider: ChannelArrayProvider){};

	async reciveMsg(messageFrom: string, message: string) : Promise<chatEmitDTO>{
		const fullCommand: string[] = message.split(" ")
		if(messageFrom == "!cmd") {
			if(fullCommand[0].includes("/msg")) {
				//schau ob nuzer nuzer und ob der bereit vorhanden in der liste vorhanden ist
				if(!fullCommand[1].includes("#") && !this.checkUserInList(fullCommand[1])){
					//füge nutzer zur liste hinzu
					this.channelArrayProvider.addUserToList(fullCommand[1]);
					console.log(this.channelArrayProvider.getUserList());
					return new chatEmitDTO('newchat', fullCommand[1],["new Conversation", "left"] );
				}
				if(fullCommand[1].includes("#") && !this.checkChannelInList(fullCommand[1])) {
					this.channelArrayProvider.addChannel(fullCommand[1]);
					console.log(this.channelArrayProvider.getChannels());
					return new chatEmitDTO('newchat', fullCommand[1], ["new Conversation", "left"]);
				}
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

	private parseMessage(channel: string, messageString: string){
		

	}

	private parseComand(obj: MessageTypeDTO) : CommandDTO | undefined{
		if(obj.commandChanel !== undefined) {
			new CommandDTO(obj.commandChanel, obj.incomingMessage);
		}
		return;
	}

	private checkUserInList(userName: string) : boolean {
		return this.channelArrayProvider.getUserList().includes(userName)
	}

	private checkChannelInList(groupeChannelName: string) : boolean {
		return this.channelArrayProvider.channelExists(groupeChannelName);
	}
	// private addChannel(obj: MessageTypeDTO) : void {
	// 	const channe
	// 	if(!this.channelArrayProvider.channelExists(obj.channel)) {
	// 		this.channelArrayProvider.addChannel(obj.channel);
	// 	}
	// }

	//das ist case mjeyavat /MSG channel "hallpo"
	// private messageSendToChannel (obj: messageTypeDTO) : ChannelDTO  | string{
	// 	if(obj.messageCmd.length > 0 && this.channelArrayProvider.channelExists(obj.channel) ) {
	// 		return new ChannelDTO(obj.incomingMessage, this.channelArrayProvider.getChannelEntrys(), obj.message);
	// 	} else {
	// 		return obj.channel + "does not exsists";
	// 	}
	// }

	//mjeyavat JOIN #channel
	// private joinRequestToChannel (obj: messageDTO) : ChannelDTO | string {
	// 	if(obj.joinCmd.length > 0 && this.channelArrayProvider.channelExists(obj.channel)) {
	// 		//schau ob user schon da ist
	// 		this.channelArrayProvider.addUserToChannel(obj.channel, obj.messageFrom);
	// 		return new ChannelDTO(obj.messageFrom,this.channelArrayProvider.getChannelEntrys(), obj.message);
	// 	} else {
	// 		if(!this.channelArrayProvider.channelExists(obj.channel)) {
	// 			this.channelArrayProvider.addChannel(obj.channel);
	// 			//erstelle eine userListe
	// 			const userList: string[] = [obj.messageFrom];
	// 			this.channelArrayProvider.addChannelEntry(userList, obj.channel);
	// 			return new ChannelDTO(obj.messageFrom, this.channelArrayProvider.getChannelEntrys(), obj.message);
	// 		}
	// 	}
	// }

	//mjeyavat MSG messageTo : was geht

}
