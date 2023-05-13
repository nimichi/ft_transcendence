import { Injectable } from '@nestjs/common';
import { MessageTypeDTO, chatEmitDTO } from './dtos/MessageTypeDTO';
import { CommandDTO } from './dtos/CommandDTO';
import { ChannelArrayProvider } from 'src/commonProvider/ChannelArrayProvider';
import { ChannelDTO } from './dtos/ChannelDTO';


@Injectable()
export class ChatService {
	private userList: string[];
	constructor(private channelArrayProvider: ChannelArrayProvider){
		this.userList = [];
	};
	async reciveMsg(intra: string, client: any, messageFrom: string, message: string) : Promise<chatEmitDTO>{
		const fullCommand: string[] = message.split(" ")
		console.log("intra: "+ intra);
		


		if(messageFrom == "!cmd") {
			if(fullCommand[0].includes("/new")) {
				//schau ob nuzer nuzer und ob der bereit vorhanden in der liste vorhanden ist
				if(!fullCommand[1].includes("#") && !this.checkUserInList(fullCommand[1])){
					//füge nutzer zur liste hinzu
					this.channelArrayProvider.addUserToList(fullCommand[1]);
					console.log(this.channelArrayProvider.getUserList());
					return new chatEmitDTO('newchat', fullCommand[1],["new Conversation", "left"] );
				}
				if(fullCommand[1].includes("#") && !this.checkChannelInList(fullCommand[1])) {
					this.channelArrayProvider.addChannel(fullCommand[1]);
					this.channelArrayProvider.addUserToList(intra);
					
					console.log(this.channelArrayProvider.getChannels() + "| user in this channel: " + this.channelArrayProvider.getUserList());
					this.channelArrayProvider.addChannelEntry([intra], fullCommand[1]);
					console.log(this.channelArrayProvider.getChannelEntrys())
					//logic channel owner & channel admin
					//falls user joinenen tut wird er in eine map gespeichert
					
					client.join(fullCommand[1]);
					console.log(client.to("#ch1").clients);
					return new chatEmitDTO('newchat', fullCommand[1], ["new Conversation", "left"]);
				}
				else if(fullCommand[1].includes("#") && this.checkChannelInList(fullCommand[1])) {
					client.join(fullCommand[1]);
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
	

	//mjeyavat MSG messageTo : was geht

}
