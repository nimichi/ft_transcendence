import { Injectable } from '@nestjs/common';
import { channelDTO, emitDTO, processDTO } from './dtos/chatDTO';
// import { CommandDTO } from './dtos/CommandDTO';
// import { ChannelArrayProvider } from '../commonProvider/ChannelArrayProvider';
import { Event } from './enums/events';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { PrismaGateway } from '../prisma/prisma.gateway';


@Injectable()
export class ChatService {
	private channelDtos: channelDTO[];
	private queue: Set<string> = new Set<string>();

	constructor(private prismaService: PrismaService, private prismaGateway: PrismaGateway, private socketGateway: SocketGateway){
		this.channelDtos = [];
	};

	private setChannelDTOs(owner: string, channelName: string, password: string, hidden: boolean): channelDTO {
		return new channelDTO(owner, channelName, hidden, password);
	}

	async processInput(processDto: processDTO): Promise<emitDTO[]>{
		let responses: emitDTO[];

		if (processDto.window === "!cmd"){
			responses = await this.processCommandWindowInput(processDto)
		}
		else if(processDto.window.startsWith("#")){
			responses = await this.processChannelInput(processDto)
		}
		else{
			responses = await this.processPrivateInput(processDto)
		}
		return responses
	}

	async processCommandWindowInput(processDto: processDTO): Promise<emitDTO[]>{
		let responses: emitDTO[] = [];

		if(processDto.msgParts.length >= 2 && processDto.msgParts[0] === "/new") {
			// case new channel
			if (processDto.msgParts[1].startsWith("#")){
				let password : string;
				let hide: boolean = false;
				const channelName: string = processDto.msgParts[1];
				const dto = this.channelDtos.find((channel) => (channel.channelName === channelName));
				if(processDto.msgParts.length >= 4 && processDto.msgParts[2] == "-pwd"){
					// read pwd
					password = processDto.msgParts[3];

				}else if(processDto.msgParts.length >= 3 && processDto.msgParts[2] === "-pvt") {
					// case private channel
					hide = true;
				}
				if(dto === undefined) {
					// case create channel
					this.channelDtos.push(this.setChannelDTOs(processDto.from, channelName, password, hide));
					processDto.client.join(channelName);
					responses.push(new emitDTO(Event.NEWCHAT, processDto.from, {name: channelName, msgs: [
						{msg: "see commands with '/cmnds'", align: 'left'},
						{msg: "you have admin rights.", align: 'left'},
						{msg: "you are channel owner.", align: 'left'},
						{msg: "new channel created.", align: 'left'},
					]}));
				}else if(dto.hidden) {
					// case deny join private channel
					responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: "!cmd", msg: "this channel is private"}));
				}else if (dto.password !== password) {
					// case deny join wrong pwd
					responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: "!cmd", msg: "Wrong Password"}));
				}
				else{
					// case join existing channel
					processDto.client.join(channelName);
					responses.push(new emitDTO(Event.SENDMSG, channelName, {window: channelName, msg: `user ${processDto.from} joined the channel`}));
					let msgs: {msg: string, align: string}[] = [];
					if (dto.admin.has(processDto.from)){
						msgs.push({msg: "see commands with '/cmnds'", align: 'left'});
						msgs.push({msg: "you have admin rights.", align: 'left'});
					}
					if (dto.owner === processDto.from)
						msgs.push({msg: "you are channel owner", align: 'left'});
					msgs.push({msg: "channel joined", align: 'left'});
					responses.push(new emitDTO(Event.NEWCHAT, processDto.from, {name: channelName, msgs: msgs}));
				}
			}
			else {
				// case new user
				responses.push(new emitDTO(Event.NEWCHAT, processDto.from , {name: processDto.msgParts[1], msgs: [{msg: "new connversation", align: 'left'}]}));
			}
		}
		else if(processDto.msgParts.length >= 2 && processDto.msgParts[0] === "/block"){
			this.queue.delete(processDto.window + '!f' + processDto.from);
			this.queue.delete(processDto.window + '!g' + processDto.from)
			this.prismaService.blockUser(processDto.msgParts[1], processDto.from);
			responses.push(new emitDTO(Event.BLOCKUSER, processDto.from, processDto.msgParts[1]));
			responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: "!cmd", msg: `${processDto.msgParts[1]} has been blocked`}));
		}
		else if(processDto.msgParts.length >= 2 && processDto.msgParts[0] === "/unblock"){
			this.prismaService.unblockUser(processDto.msgParts[1], processDto.from);
			responses.push(new emitDTO(Event.UNBLOCKUSER, processDto.from, processDto.msgParts[1]));
			responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: "!cmd", msg: `${processDto.msgParts[1]} has been unblocked`}));
		}
		else if(processDto.msgParts.length >= 1 && processDto.msgParts[0] === "/blocked"){
			responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: "!cmd", msg: (await this.prismaService.getBlockedUsers(processDto.from)).toString()}));
		}
		return responses;
	}

	async processChannelInput(processDto: processDTO): Promise<emitDTO[]>{
		let responses: emitDTO[] = [];
		const channel: channelDTO | undefined = this.channelDtos.find((c) => c.channelName === processDto.window);

		if (channel)
		{
			switch (processDto.msgParts[0]){
				case "/info": {
					if(this.hasAdminRights(processDto.from, channel)) {
						const channelInfo : string = JSON.stringify (channel, null, " ");
						console.log("channelInfo : " + channelInfo);
						responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: channelInfo}));
						break;
					}
					responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "not authorized"} ));
					break;
				}
				case "/cmnds": {
					if(!this.hasAdminRights(processDto.from, channel)) {
						responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "not authorized"} ));
						break;
					}
					responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "/info: see channel info"}));
					responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "/invite 'intra': invite user to channel"}));
					responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "/setadmin 'intra': give admin rights"}));
					responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "/ban 'intra': ban user"}));
					responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "/kick 'intra': kick user"}));
					responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "/mute 'intra': mute user for 2 minutes"}));
					if(channel.owner == processDto.from){
						responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "/pwd 'password': set or update password"}));
						responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "/pwd: remove password"}));
					}
					break;
				}
				case "/invite": {
					if (this.hasAdminRights(processDto.from, channel) === false) {
						responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "not authorized"} ));
						break;
					}
					if (processDto.msgParts.length < 2){
						responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "incorrect format: expected '/invite intra'"} ));
						break;
					}
					responses.push(new emitDTO(Event.SENDMSG, processDto.msgParts[1], {window: processDto.from, msg: `${processDto.from} invited you to join the channel ${processDto.window}. Type '/enter ${processDto.window}' to join`}));
					responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: `user ${processDto.msgParts[1]} has been invited to join the channel`}));
					this.queue.add(processDto.msgParts[1] + processDto.window);
					break;
				}
				case "/setadmin": {
					if (processDto.msgParts.length < 2) {
						responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "error: wrong format\n</setadmin intraname>"}));
						break;
					}
					if (this.hasAdminRights(processDto.from, channel) === true) {
						this.setNewAdmin(processDto.msgParts[1], channel);
						responses.push(new emitDTO(Event.SENDMSG, processDto.window, {window: processDto.window, msg: `user ${processDto.msgParts[1]} received admin rights`}));
						break;
					}
					else{
						responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "not authorized"}));
						break;
					}
				}
				case "/ban": {
					if (!this.hasAdminRights(processDto.from, channel)){
						responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "not authorized"} ));
						break;
					}
					const userToBan = processDto.msgParts[1];
					if(channel.owner === userToBan) {
						responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "error:" + userToBan + " is owner!"}));
						break;
					}
					channel.banned.add(userToBan);
					const clientToBan = (await this.socketGateway.server.fetchSockets()).find((s) => s.data.username === userToBan);
					clientToBan.leave(processDto.window);
					responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: `user ${userToBan} is banned`}));
					responses.push(new emitDTO(Event.SENDMSG, processDto.window, {window: processDto.window, msg: `user ${userToBan} was banned`}));
					break;
				}
				case "/kick": {
					if (!this.hasAdminRights(processDto.from, channel)){
						responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "not authorized"} ));
						break;
					}
					const userToKick = processDto.msgParts[1];
					if(channel.owner === userToKick) {
						responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "error: " + userToKick + " is owner!"}));
						break;
					}
					const clientToKick = (await this.socketGateway.server.fetchSockets()).find((s) => s.data.username === userToKick);
					if (clientToKick){
						responses.push(new emitDTO(Event.SENDMSG, userToKick, {window: processDto.window, msg: "you have been kicked!"}));
						clientToKick.leave(processDto.window);
					}
					responses.push(new emitDTO(Event.SENDMSG, processDto.window, {window: processDto.window, msg: "user " + userToKick + " has been kicked"}));
					break;
				}
				case "/mute": {
					if (!this.hasAdminRights(processDto.from, channel)){
						responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "not authorized"} ));
						break;
					}
					if (processDto.msgParts.length >= 2){
						const userToMute = processDto.msgParts[1];
						if(channel.owner === userToMute) {
							responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: `not authorized. ${userToMute} is channel owner`} ));
							break;
						}
						else{
							channel.muted.set(userToMute, Date.now() + 2 * 60 * 1000 );
							responses.push(new emitDTO(Event.SENDMSG, processDto.window, {window: processDto.window, msg: "user "+ userToMute + " has been muted for 2 minutes"} ));
							responses.push(new emitDTO(Event.SENDMSG,  processDto.from, {window: processDto.window, msg: "user " + userToMute + " is muted for 2 minutes"}));
							break;
						}
					}
					responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "error: wrong format\n</mute intra>"} ));
					break;
				}
				case "/pwd": {
					const channelDto = this.channelDtos.find((c) => c.channelName ===  processDto.window);
					if (                        channelDto.owner !== processDto.from){
						responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "not authorized"} ));
						break;
					}
					let newpwd: string;
					if(processDto.msgParts.length === 2) {
						newpwd = processDto.msgParts[1];
					}
					channelDto.password = newpwd;
					responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "password has been updated"} ));
					break;
				}
				default: {
					const channelDto = this.channelDtos.find((c) => c.channelName === processDto.window);
					if(channel.banned.has(processDto.from)) {//bann
						responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "not authorized"} ));
						break;
					}
					if(!processDto.client.rooms.has(processDto.window)) { //kick rejoin
						processDto.client.join(processDto.window);
						responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "you joined the channel"}));
						responses.push(new emitDTO(Event.SENDMSG, processDto.window, {window: processDto.window, msg: "user " + processDto.from + " joined back in"}));
					}
					if(channelDto.muted.has(processDto.from) && channelDto.muted.get(processDto.from) >= Date.now()) //mute
					{
						responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "you are muted, try again later"}));
						break;
					}
					responses.push(new emitDTO(Event.SENDBLOCKABLEMSG, processDto.window, {window: processDto.window, msg: processDto.from + ': ' + processDto.msg, sender: processDto.from}));
					break
				}
			}
		}
		return responses;
	}

	async processPrivateInput(processDto: processDTO): Promise<emitDTO[]>{
		let responses: emitDTO[] = [];

		switch (processDto.msgParts[0]){
			case "/game": { // start game
				if(processDto.from === processDto.window){
					responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "only possible with other user"}));
					break;
				}
				const id = processDto.from + '!g' +processDto.window;
				console.log(this.queue)
				if(this.queue.has(id)){
					this.queue.delete(id);
					responses.push(new emitDTO(Event.SENDMSG, processDto.window, {window: processDto.from, msg: processDto.from + " accepted yout invite"}));
					responses.push(new emitDTO(Event.NAVTOPRIVGAME, processDto.from ,{gameid: processDto.from + processDto.window, powup: false}));
					responses.push(new emitDTO(Event.NAVTOPRIVGAME, processDto.window ,{gameid: processDto.from + processDto.window, powup: false}));
				}
				else if(this.queue.has(id + "!p")){
					this.queue.delete(id + "!p");
					responses.push(new emitDTO(Event.SENDMSG, processDto.window, {window: processDto.from, msg: processDto.from + " accepted yout invite"}));
					responses.push(new emitDTO(Event.NAVTOPRIVGAME, processDto.from ,{gameid: processDto.from + processDto.window, powup: true}));
					responses.push(new emitDTO(Event.NAVTOPRIVGAME, processDto.window ,{gameid: processDto.from + processDto.window, powup: true}));
				}
				else{
					const rid = processDto.window + '!g' + processDto.from;
					if (processDto.msgParts.length >= 2 && processDto.msgParts[1] === "-p"){
						this.queue.delete(rid);
						this.queue.add(rid + "!p");
					}
					else{
						this.queue.delete(rid + "!p");
						this.queue.add(rid);
					}
					responses.push(new emitDTO(Event.SENDBLOCKABLEMSG, processDto.window, {window: processDto.from, msg: processDto.from + " wants to play against you. type '/game' to confirm", sender: processDto.from}));
				}
				break;
			}
			case "/friend": { // start game
				if(processDto.from === processDto.window){
					responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "only possible with other user"}));
					break;
				}
				const id = processDto.from + '!f' +processDto.window;
				if(this.queue.has(id)){
					this.queue.delete(id);
					this.prismaGateway.addFriend(processDto.client, processDto.window);
					responses.push(new emitDTO(Event.SENDMSG, processDto.window, {window: processDto.from, msg: processDto.from + " accepted your invite"}));
				}
				else{
					const rid = processDto.window + '!f' + processDto.from;
					this.queue.add(rid);
					responses.push(new emitDTO(Event.SENDBLOCKABLEMSG, processDto.window, {window: processDto.from, msg: processDto.from + " wants to be your friend. type '/friend' to confirm", sender: processDto.from}));
				}
				break;
			}
			case "/enter": { // enter ptivate channel
				if(processDto.msgParts.length < 2){
					responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "incorrect format: expected '/enter #channel'"}));
					break;
				}
				if(this.queue.has(processDto.from + processDto.msgParts[1])){
					this.queue.delete(processDto.from + processDto.msgParts[1]);
					processDto.client.join(processDto.msgParts[1]);
					responses.push(new emitDTO(Event.NEWCHAT, processDto.from, {name: processDto.msgParts[1], msgs: [{msg: "channel joined", align: 'left'}]}));
				}
				else{
					responses.push(new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "no invitation pending for '" + processDto.msgParts[2] + "'"}));
				}
				break;
			}
			case "/visit": { // visit profile page
				responses.push(new emitDTO(Event.NAVTOPROFILE, processDto.from, processDto.window));
				break;
			}
			default: {
				responses.push(await this.sendPrivateMessage(processDto));
			}
		}

		return responses;
	}

	private hasAdminRights(askingClient: string, channel: channelDTO) :boolean {
		return channel.admin.has(askingClient);
	}

	private setNewAdmin(newAdmin: string, channel: channelDTO) {
		channel.admin.add(newAdmin);

	}

	private async sendPrivateMessage(processDto: processDTO) : Promise<emitDTO>{
		const sockets = await this.socketGateway.server.fetchSockets();
		for(let socket of sockets) {
			if(socket.data.username === processDto.window) {
				console.log(processDto.msg)
				return new emitDTO(Event.SENDBLOCKABLEMSG, processDto.window, {window: processDto.from, msg: processDto.msg, sender: processDto.from});
			}
		}
		return new emitDTO(Event.SENDMSG, processDto.from, {window: processDto.window, msg: "could not deliver message. user not available"});
	}
}