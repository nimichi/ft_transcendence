import { Injectable } from '@nestjs/common';
import { channelDTO, emitDTO, processDTO } from './dtos/chatDTO';
// import { CommandDTO } from './dtos/CommandDTO';
// import { ChannelArrayProvider } from '../commonProvider/ChannelArrayProvider';
import { Event } from './enums/events';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocketGateway } from 'src/socket/socket.gateway';


@Injectable()
export class ChatService {
	private channelDtos: channelDTO[];
	private queue: Set<string> = new Set<string>();

	constructor(private prismaService: PrismaService, private socketGateway: SocketGateway){
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
					responses.push(new emitDTO(Event.NEWCHAT, processDto.from, {name: channelName, msgs: [{msg: "new channel created, you are channel owner", align: 'left'}]}));
				}else if(dto.hidden) {
					// case deny join private channel
					responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: "!cmd", msg: "this channel is private"}));
				}else if (dto.password !== password) {
					// case deny join wrong pwd
					responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: "!cmd", msg: "Wrong Password"}));
				}
				else{
					// case join existing channel
					processDto.client.join(channelName);
					responses.push(new emitDTO(Event.CHATRECV, processDto.window, {window: channelName, msg: `user ${processDto.from} joined the channel`}));
					responses.push(new emitDTO(Event.NEWCHAT, processDto.from, {name: channelName, msgs: [{msg: "channel joined", align: 'left'}]}));
				}
			}
			else {
				// case new user
				responses.push(new emitDTO(Event.NEWCHAT, processDto.from , {name: processDto.msgParts[1], msgs: [{msg: "new connversation", align: 'left'}]}));
			}
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
						const channelInfo : string = JSON.stringify (channel);
						console.log("channelInfo : " + channelInfo);
						responses.push(new emitDTO(Event.STYLEDLIST, processDto.from, [channelInfo, 'left']));
						break;
					}
					responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "not enough rights"} ));
					break;
				}
				case "/invite": {
					if (this.hasAdminRights(processDto.from, channel) === false) {
						responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "error: no rights to invite users"} ));
						break;
					}
					if (processDto.msgParts.length < 2){
						responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "incorrect format: expected '/invite intra'"} ));
						break;
					}
					responses.push(new emitDTO(Event.CHATRECV, processDto.msgParts[1], {window: processDto.from, msg: `${processDto.from} invited you to join the channel ${processDto.window}. Type '/enter ${processDto.window}' to join`}));
					responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: `user ${processDto.msgParts[1]} has been invited to join the channel`}));
					this.queue.add(processDto.msgParts[1] + processDto.window);
					break;
				}
				case "/setadmin": {
					if (processDto.msgParts.length < 2) {
						responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "error: wrong format\n</setadmin intraname>"}));
						break;
					}
					if (this.hasAdminRights(processDto.from, channel) === true) {
						this.setNewAdmin(processDto.msgParts[1], channel);
						responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: `user ${processDto.msgParts[1]} recieved admin rights`}));
						break;
					}
					else{
						responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "error: no rights to set admin"}));
						break;
					}
				}
				case "/ban": {
					if (!this.hasAdminRights(processDto.from, channel)){
						responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "not authorized"} ));
						break;
					}
					const userToBan = processDto.msgParts[1];
					if(channel.owner === userToBan) {
						responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "error:" + userToBan + " is owner!"}));
						break;
					}
					channel.banned.add(userToBan);
					const clientToBan = (await this.socketGateway.server.fetchSockets()).find((s) => s.data.username === userToBan);
					clientToBan.leave(processDto.window);
					responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: `user ${userToBan} is banned`}));
					responses.push(new emitDTO(Event.CHATRECV, processDto.window, {window: processDto.window, msg: `user ${userToBan} was banned`}));
					break;
				}
				case "/kick": {
					if (!this.hasAdminRights(processDto.from, channel)){
						responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "not authorized"} ));
						break;
					}
					const userToKick = processDto.msgParts[1];
					if(channel.owner === userToKick) {
						responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "error: " + userToKick + " is owner!"}));
						break;
					}
					const clientToKick = (await this.socketGateway.server.fetchSockets()).find((s) => s.data.username === userToKick);
					if (clientToKick){
						responses.push(new emitDTO(Event.CHATRECV, userToKick, {window: processDto.window, msg: "you have been kicked!"}));
						clientToKick.leave(processDto.window);
					}
					responses.push(new emitDTO(Event.CHATRECV, processDto.window, {window: processDto.window, msg: "user " + userToKick + " has been kicked"}));
					break;
				}
				case "/mute": {
					if (!this.hasAdminRights(processDto.from, channel)){
						responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "not authorized"} ));
						break;
					}
					if (processDto.msgParts.length >= 2){
						const userToMute = processDto.msgParts[1];
						if(channel.owner === userToMute) {
							responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "error: wrong format\n</mute intra>"} ));
							break;
						}
						else{
							channel.muted.set(userToMute, Date.now() + 2 * 60 * 1000 );
							responses.push(new emitDTO(Event.CHATRECV, processDto.window, {window: processDto.window, msg: "user "+ userToMute + " has been muted for 2 minutes"} ));
							responses.push(new emitDTO(Event.CHATRECV,  processDto.from, {window: processDto.window, msg: "user " + userToMute + " is muted for 2 minutes"}));
							break;
						}
					}
				}
				case "/pwd": {
					const channelDto = this.channelDtos.find((c) => c.channelName ===  processDto.window);
					if (                        channelDto.owner !== processDto.from){
						responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "not authorized"} ));
						break;
					}
					let newpwd: string;
					if(processDto.msgParts.length === 2) {
						newpwd = processDto.msgParts[1];
					}
					responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "password has been updated"} ));
					break;
				}
				default: {
					const channelDto = this.channelDtos.find((c) => c.channelName === processDto.window);
					if(channel.banned.has(processDto.from)) {//bann
						responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "not authorized"} ));
						break;
					}
					if(!processDto.client.rooms.has(processDto.window)) { //kick rejoin
						processDto.client.join(processDto.window);
						responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "you joined the channel"}));
						responses.push(new emitDTO(Event.CHATRECV, processDto.window, {window: processDto.window, msg: "user " + processDto.from + " joined back in"}));
					}
					if(channelDto.muted.has(processDto.from) && channelDto.muted.get(processDto.from) >= Date.now()) //mute
					{
						responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "you are muted, try again later"}));
						break;
					}
					responses.push(new emitDTO(Event.CHATRECV, processDto.window, {window: processDto.window, msg: processDto.from + ': ' + processDto.msg}));
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
					responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "only possible with other user"}));
					break;
				}
				const id = processDto.from + '!g' +processDto.window;
				if(this.queue.has(id)){
					this.queue.delete(id);
					responses.push(new emitDTO(Event.NAVTOPRIVGAME, processDto.window, {window: processDto.from, msg: processDto.from + " accepted yout invite"}));
					responses.push(new emitDTO(Event.NAVTOPRIVGAME, processDto.from ,{gameid: processDto.from + processDto.window, powup: true}));
					responses.push(new emitDTO(Event.NAVTOPRIVGAME, processDto.window ,{gameid: processDto.from + processDto.window, powup: true}));
				}
				else{
					const rid = processDto.window + '!g' + processDto.from;
					this.queue.add(rid);
					responses.push(new emitDTO(Event.CHATRECV, processDto.window, {window: processDto.from, msg: processDto.from + " wants to play against you. type '/game' to confirm"}));
				}
				break;
			}
			case "/friend": { // start game
				if(processDto.from === processDto.window){
					responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "only possible with other user"}));
					break;
				}
				const id = processDto.from + '!f' +processDto.window;
				if(this.queue.has(id)){
					this.queue.delete(id);
					this.prismaService.addFriend(processDto.client, processDto.window);
					responses.push(new emitDTO(Event.CHATRECV, processDto.window, {window: processDto.from, msg: processDto.from + " accepted your invite"}));
				}
				else{
					const rid = processDto.window + '!f' + processDto.from;
					this.queue.add(rid);
					responses.push(new emitDTO(Event.CHATRECV, processDto.window, {window: processDto.from, msg: processDto.from + " wants to be your friend. type '/friend' to confirm"}));
				}
				break;
			}
			case "/enter": { // enter ptivate channel
				if(processDto.msgParts.length < 2){
					responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "incorrect format: expected '/enter #channel'"}));
					break;
				}
				if(this.queue.has(processDto.from + processDto.msgParts[1])){
					this.queue.delete(processDto.from + processDto.msgParts[1]);
					processDto.client.join(processDto.msgParts[1]);
					responses.push(new emitDTO(Event.NEWCHAT, processDto.from, {name: processDto.msgParts[1], msgs: [{msg: "channel joined", align: 'left'}]}));
				}
				else{
					responses.push(new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "no invitation pending for '" + processDto.msgParts[2] + "'"}));
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
				return new emitDTO(Event.CHATRECV, processDto.window, {window: processDto.from, msg: processDto.msg});
			}
		}
		return new emitDTO(Event.CHATRECV, processDto.from, {window: processDto.window, msg: "could not deliver message. user not available"});
	}
}