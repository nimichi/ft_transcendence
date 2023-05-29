import { Socket } from 'socket.io';
import { Event } from '../enums/events';

export class processDTO {
	constructor (
		window: string,
		from: string,
		client: Socket,
		msg: string,
		msgParts: string[]
	) {
		this.window = window;
		this.from = from;
		this.client = client;
		this.msg = msg;
		this.msgParts = msgParts;
	}
	readonly window: string;
	readonly from: string;
	readonly client: Socket;
	readonly msg: string;
	readonly msgParts: string[];
}

export class emitDTO {
	constructor (
		event: Event,
		to: string,
		payload: any,

	){
		this.event = event;
		this.to = to;
		this.payload = payload;
	}

	readonly event: Event;
	readonly to: string;
	readonly payload: any;

}

export class channelDTO {
	constructor(
		owner: string,
		channelName: string,
		hidden: boolean, //private heist kommt nicht in der offizielen list vor
		password: string | undefined, //kann für public und private sein
	){
		this.owner = owner;
		this.channelName = channelName;
		this.admin = new Set<string>;
		this.admin.add(owner)
		this.banned = new Set<string>;
		this.muted = new Map<string, number>;
		this.hidden = hidden;
		this.password = password;
	}
	readonly owner: string;
	readonly hidden: boolean;
	readonly channelName: string;
	admin: Set<string>;
	banned: Set<string>;
	muted: Map<string, number>;
	password: string | undefined;


}
