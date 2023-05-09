export class ChannelDTO {
	constructor (
		messageFrom: string | undefined,
		channelEntrys: Map<string, string[]>,
		message: string | undefined
	){}

	readonly messageFrom: string | undefined;
	readonly channelEntrys: Map<string, string[]>;
	readonly message: string | undefined;
}