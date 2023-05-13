import { Injectable } from '@nestjs/common';

@Injectable()
export class ChannelArrayProvider {
	private channels: string[] = [];
	private channelEntrys: Map<string, string[]> = new Map<string, string[]>() ;
	private userList: string[] = [];


	getUserList(): string[] {
		return this.userList;
	}

	addUserToList(userName: string) :void {
		this.userList.push(userName);
	}

	deleteUserFromList(userName: string): void {
		if(this.userList.includes(userName)) {
			const index = this.userList.indexOf(userName);
			this.userList.splice(index, 1);
		}
	}

	userExists(userName: string) : boolean {
		return this.userList.includes(userName);
	}

	getChannelEntrys(): Map<string , string[]> {
		return this.channelEntrys;
	}

	addChannelEntry(userList: string[], channelName: string): void {
		this.channelEntrys.set(channelName, userList);
	}

	deleteChannelEntry(channelName: string): void {
		this.channelEntrys.delete(channelName);
	}

	addUserToChannel(channelName: string, userName: string): void{
		const userListToUpadte = this.channelEntrys.get(channelName);
		if(userListToUpadte !== undefined) {
			userListToUpadte.push(userName);
			this.deleteChannelEntry(channelName);
			this.addChannelEntry(userListToUpadte, channelName);
		}
	}

	deleteUserFromChannels(userName: string) : void {
		const tmpEntrs = this.channelEntrys;
		this.channelEntrys.forEach((value, key) => {
			const currentUserList = tmpEntrs.get(key);
			if(currentUserList.includes(userName)) {
				const index = currentUserList.indexOf(userName);
				currentUserList.splice(index, 1);
				tmpEntrs.delete(key);
				tmpEntrs.set(key, currentUserList);
			}

		});
		this.channelEntrys = tmpEntrs;
	}

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