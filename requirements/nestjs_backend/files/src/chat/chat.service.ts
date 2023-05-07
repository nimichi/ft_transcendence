import { Injectable } from '@nestjs/common';
import { messageDTO } from './MessageDTO';
import { ChannelArrayProvider } from 'src/commonProvider/ChannelArrayProvider';

@Injectable()
export class ChatService {
	private userList: string[];
	constructor(private channelArrayProvider: ChannelArrayProvider)
	{
		this.userList = [];
	};

	async reciveMsg(messageFrom: string,message: string) {
		const dataTransferObject = this.parseMessage(messageFrom, message);
		this.addChannel(dataTransferObject);
		return dataTransferObject;
	}

	async disconnectUser(intra: string) {
		if(this.userList.length !== 0 && this.userList.includes(intra)) {
			const index = this.userList.indexOf(intra);
			this.userList.splice(index, 1);
		}
	}

	async connectUser(intra: string) {
		//is user in channle
		if(this.userList.length !== 0 && !this.userList.includes(intra)) {
			this.userList.push(intra);
		}
	}

	private parseMessage(messageFrom: string, messageString: string) : messageDTO {
		///MSG mjeyavat: bla bla
		const messageValues = messageString.split(":");
		const messageMetaInf = messageValues[0].split(" ");
		//create vals
		const joinCmd = messageMetaInf[0].includes("JOIN") === true ? messageMetaInf[0] : "";
		const messageCmd = messageMetaInf[0].includes("MSG") === true ? messageMetaInf[0] : "";
		const channel = messageMetaInf[1].includes("#") === true ? messageMetaInf[1] : "";
		const messageTo = messageMetaInf[1].includes("#") === false ? messageMetaInf[1] : ""; 
		
		const message = messageValues[1];

		return new messageDTO(messageFrom, joinCmd, messageCmd, channel, messageTo, message);

	}

	private addChannel(obj: messageDTO) : void {
		if(!this.channelArrayProvider.channelExists(obj.channel)) {
			this.channelArrayProvider.addChannel(obj.channel);
		}
	}

}
