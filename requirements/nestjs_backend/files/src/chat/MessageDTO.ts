export class messageDTO {
	constructor (
		joinCmd: string | null,
		messageCmd: string | null,
		messageTo: string | null,
		channel: string | null,
		message: string,
		messageFrom: string
	) {}

	readonly joinCmd: string | null;
	readonly messageCmd: string | null;
	readonly messageTo: string | null;
	readonly channel: string | null;
	readonly message: string;
	readonly messageFrom: string;
	readonly reciverList: string[];
}