// import { Injectable } from '@nestjs/common';
// import { DirectFrindsDTO } from 'src/chat/dtos/DirectFriendsDTO';
// import { Socket } from 'socket.io';

// @Injectable()
// export class ChannelArrayProvider {

// 	private channelEntrys: Map<string, Socket[]> = new Map<string, Socket[]>();
// 	private userList : Map<string, string[]> = new Map<string, string[]>();

// 	deleteUserToDiconnect(intra: string) {
// 		//einmal in userlist
// 		const tmpMap = this.userList;
// 		const tmpMap2 = this.channelEntrys;
		
// 		this.userList = this.eraseAllOcurenceInMap(intra, tmpMap);
// 		//einmal in channelEntry
// 		this.channelEntrys = this.eraseAllOcurenceInMap(intra, tmpMap2);
// 	}

// 	private eraseAllOcurenceInMap(userToDelete: string, sourceMap: Map<string, string[]>) : Map<string, string[]> {
// 		for(const [key, value] of this.userList) {
// 			const updataValues = value.filter((val) => val !== userToDelete);
// 			if(key === userToDelete || updataValues.length === 0) {
// 				sourceMap.delete(userToDelete);
// 			} else {
// 				sourceMap.set(userToDelete, updataValues);
// 			}
// 		}
// 		return sourceMap;
// 	}

// 	getUserListMap(): Map<string, string[]> {
// 		return this.userList;
// 	}

// 	getUserListForThisUser(requestedUser: string): string[] {
// 		return this.userList.get(requestedUser);
// 	}

// 	addUserToList(requestedUser: string, userName: string) :void {
// 		if(this.userExists(requestedUser, userName) === -1 ) {
// 			const existingUserList: string[] = this.userList.get(requestedUser);
// 			existingUserList.push(userName);
// 		}
// 		if(this.userExists(userName, requestedUser) === -1) {
// 			const existingUserList: string[] = this.userList.get(userName);
// 			existingUserList.push(requestedUser);
// 		}
// 	}

// 	createUserEntry(requestedUser: string) : boolean{
// 		if(!this.userList.has(requestedUser)) {
// 			this.userList.set(requestedUser, []);
// 			return true;
// 		}
// 		return false;
// 	}

// 	deleteUserFromList(requestedUser: string, userName: string): void {
// 		const existingUserListForKey = this.userList.get(requestedUser);
// 		const updatedUserListForKey = existingUserListForKey.filter((user) => user !== userName);
// 		this.userList.set(requestedUser, updatedUserListForKey);
// 	}

// 	userExists(requesteduser: string,userName: string) : number {
// 		const existingUserList = this.userList.get(requesteduser);
// 		return existingUserList.indexOf(userName);
// 	}

// 	getChannelEntrys(): Map<string , Socket[]> {return this.channelEntrys;}
// 	addChannelEntry(userList: Socket[], channelName: string): void {this.channelEntrys.set(channelName, userList);}
// 	deleteChannelEntry(channelName: string): void {this.channelEntrys.delete(channelName);}

// 	addUserToChannel(channelName: string, userSocket: Socket): void{
// 		const userListToUpadte = this.channelEntrys.get(channelName);
// 		if(userListToUpadte !== undefined) {
// 			userListToUpadte.push(userSocket);
// 			this.deleteChannelEntry(channelName);
// 			this.addChannelEntry(userListToUpadte, channelName);
// 		}
// 	}

// 	deleteUserFromChannels(userName: string) : void {
// 		const tmpEntrs = this.channelEntrys;
// 		this.channelEntrys.forEach((value, key) => {
// 			const currentUserList = tmpEntrs.get(key);
// 			if(currentUserList.includes(userName)) {
// 				const index = currentUserList.indexOf(userName);
// 				currentUserList.splice(index, 1);
// 				tmpEntrs.delete(key);
// 				tmpEntrs.set(key, currentUserList);
// 			}

// 		});
// 		this.channelEntrys = tmpEntrs;
// 	}

// 	getChannels(): string[] {
// 		return this.channels;
// 	}
	
// 	addChannel(channelName: string) : void {
// 		this.channels.push(channelName);
// 	}

// 	deletChannel(channelName: string) : void {
// 		if(this.channelExists(channelName)){
// 			const index = this.channels.indexOf(channelName);
// 			this.channels.splice(index, 1);
// 		}
// 	}

// 	channelExists(channelName: string) : boolean {
// 		return this.channels.includes(channelName);
// 	}

// }