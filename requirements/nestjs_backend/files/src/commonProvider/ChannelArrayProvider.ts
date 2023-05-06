import { Injectable } from '@nestjs/common';

@Injectable()
export class ChannelArrayProvider {
	private channels: string[] = [];

	getChannels(): string[] {
		return this.channels;
	}
	
	addChannel(channelName: string) : void {
		this.channels.push(channelName);
	}

	deletChannel(channelName: string) : void {
		if(this.channelExists(channelName)){
			const index = this.channels.indexOf(channelName);
			this.channels.splice(index, 1);
		}
	}

	channelExists(channelName: string) : boolean {
		return this.channels.includes(channelName);
	}

}