export class CommandDTO {
	constructor (
		command: string,
		commandMetaInfo: string,
	)
	{
		this.command = command;
		this.commandMetaInfo = commandMetaInfo;
	}
	readonly command: string;
	readonly commandMetaInfo: string;
}