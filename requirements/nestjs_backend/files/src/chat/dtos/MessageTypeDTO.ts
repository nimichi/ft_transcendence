export class MessageTypeDTO {
	constructor (
		commandChannel: string,
		directChannelToUser: string,
		directChannelToUserGroupe: string,
		incomingMessage: string,
	) {
		this.commandChanel = commandChannel;
		this.directChannelToUser = directChannelToUser;
		this.directChannelToUserGroupe = directChannelToUserGroupe;
		this.incomingMessage = incomingMessage;
	}
	readonly commandChanel: string | undefined;
	readonly directChannelToUser: string | undefined;
	readonly directChannelToUserGroupe: string | undefined;
	readonly incomingMessage: string | undefined;
}

export class chatEmitDTO {
	constructor (
		modus: string,
		messageTo: string,
		msg: [string, string] | string | [string[], string] | string[],

	){
		this.modus = modus;
		this.messageTo = messageTo;
		this.msg = msg;
	}

	readonly modus: string;
	readonly messageTo: string;
	readonly msg: [string, string] | string | [string[], string] | string[];

}

export class channelDTO {
	constructor(
		owner: string,
		channelName: string,
		admin: string,
		hidden: boolean, //private heist kommt nicht in der offizielen list vor
		password: string | undefined, //kann für public und private sein
	){
		this.owner = owner;
		this.channelName = channelName;
		this.admin = admin;
		this.hidden = hidden;
	}
	readonly owner: string;
	readonly hidden: boolean;
	channelName: string;
	admin: string[];
	banned: string[];
	muted: Map<string, number>;
	password: string | undefined;
	

}

export class Block {
	readonly fromUser: string;
	readonly 
}