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
		msg: [string, string] | string,

	){
		this.modus = modus;
		this.messageTo = messageTo;
		this.msg = msg;
	}

	readonly modus: string;
	readonly messageTo: string;
	readonly msg: [string, string] | string;

}