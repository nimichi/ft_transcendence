import { Injectable } from '@nestjs/common';
import { messageDTO } from './MessageDTO';
import { ChannelArrayProvider } from 'src/commonProvider/ChannelArrayProvider';
import { ChannelDTO } from './ChannelDTO';

@Injectable()
export class ChatService {
	constructor(private channelArrayProvider: ChannelArrayProvider){};

	async reciveMsg(messageFrom: string,message: string) {
		const dataTransferObject = this.parseMessage(messageFrom, message);
		this.addChannel(dataTransferObject);
		return dataTransferObject;
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

	//das ist case mjeyavat /MSG channel "hallpo"
	private messageSendToChannel (obj: messageDTO) : ChannelDTO  | string{
		if(obj.messageCmd.length > 0 && this.channelArrayProvider.channelExists(obj.channel) ) {
			return new ChannelDTO(obj.messageFrom, this.channelArrayProvider.getChannelEntrys(), obj.message);
		} else {
			return obj.channel + "does not exsists";
		}
	}

	//mjeyavat JOIN #channel
	private joinRequestToChannel (obj: messageDTO) : ChannelDTO | string {
		if(obj.joinCmd.length > 0 && this.channelArrayProvider.channelExists(obj.channel)) {
			//schau ob user schon da ist
			this.channelArrayProvider.addUserToChannel(obj.channel, obj.messageFrom);
			return new ChannelDTO(obj.messageFrom,this.channelArrayProvider.getChannelEntrys(), obj.message);
		} else {
			if(!this.channelArrayProvider.channelExists(obj.channel)) {
				this.channelArrayProvider.addChannel(obj.channel);
				//erstelle eine userListe
				const userList: string[] = [obj.messageFrom];
				this.channelArrayProvider.addChannelEntry(userList, obj.channel);
				return new ChannelDTO(obj.messageFrom, this.channelArrayProvider.getChannelEntrys(), obj.message);
			}
		}
	}

	//mjeyavat MSG messageTo : was geht

}
