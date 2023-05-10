export class ChannelDTO {
	constructor (
		Admin: string | undefined,
		channelEntrys: Map<string, string[]>,
		Owner: string | undefined
	){}

	readonly Admin: string | undefined;
	readonly Owner: string | undefined;
	readonly channelEntrys: Map<string, string[]>;
}