import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { PrismaService } from './prisma.service';
import { UploadImgService } from 'src/prisma/services/upload_img.service';
import { Socket } from 'socket.io';

type User = {
	pic:		String | ArrayBuffer | null;
	intra:		String;
	fullName:	String;
	wins:		number;
	losses:		number;
	level:		number;
}

@WebSocketGateway()
export class PrismaGateway {
	constructor(private prismaService: PrismaService, private uploadImgService: UploadImgService) {}

  @SubscribeMessage('uploadUserpic')
  async savePicture(client: any, payload: any) {
	  const [login] = client.rooms;

	  const file_name = await this.uploadImgService.uploadImg(login, payload);
	  console.log("File name:", file_name);
	  this.prismaService.updatePicture(login, file_name);
	  console.log("PIC:", await this.prismaService.getPicture(login));
  }

  @SubscribeMessage('fetchUserpic')
  async fetchPicture(client: any, intra: string | null) {
	  if (!intra)
	  	intra = client.data.username
	  const file_name = await this.prismaService.getPicture(intra);
	  const img = this.uploadImgService.fetchImgAsDataURL(file_name);

	  return (img);
  }

  @SubscribeMessage('getTfa')
  async getTfa(client: any, payload: any): Promise<boolean> {
	const [login] = client.rooms;
	const user = await this.prismaService.findUserByIntra(login);

    return (user.tfa);
  }

  @SubscribeMessage('getuserlist')
  async getUserList(client: any): Promise<{name: string, intra: string, pic: string}[]> {
	const users = await this.prismaService.getAllUsers();
	let userList: {name: string, intra: string, pic: string}[] = [];
	for (let user of users){
		userList.push({name: user.full_name, intra: user.intra_name, pic: this.uploadImgService.fetchImgAsDataURL(user.picture)})
	}
    return (userList);
  }

  @SubscribeMessage('updatefullname')
  async updateFullName(client: any, newName: string): Promise<{name: string, success: boolean}>{
	const re = /^[0-9A-Za-z\s\-]+$/;
	if (!re.test(newName)) {
		return {name: "Must contain only letters, numbers and dashes!", success: false};
	}
	if (!await this.prismaService.findUserByIntra(client.data.username)) {
		return {name: "Error! User not found.", success: false};
	}
	if (await this.prismaService.checkIfFullnameExists(newName)){
		return {name: "Name already in use!", success: false}
	}
	await this.prismaService.updateFullName(client.data.username, newName)
	return {name: newName, success: true}
  }

  @SubscribeMessage('blockedusers')
  async getBlockedUsers(client: any): Promise<string[]>{
	return await this.prismaService.getBlockedUsers(client.data.username);
  }

  @SubscribeMessage('gethistory')
  async getHistory(client: any, intra: string|null){
	if (intra == null)
		intra = client.data.username;
	return await this.prismaService.getHistory(intra);
  }

  @SubscribeMessage('getfriends')
  async getFriends(client: any, payload: null){

	const intra = client.data.username;
	let friends = await this.prismaService.getFriends(intra);
	for (let friend of friends){
		console.log(friend.pic)
		friend.pic = this.uploadImgService.fetchImgAsDataURL(friend.pic);
	}
	return friends
  }

  @SubscribeMessage('userdata')
  async handleUserDataMessage(client: any, intra: string|null): Promise<User> {
    if (!intra)
    	intra = client.data.username;
    let user = await this.prismaService.getUserdata(intra);
	user.pic = this.uploadImgService.fetchImgAsDataURL(user.pic);
    return user;
  }

  async addFriend(client: Socket, friend_intra: string) {
	if (client.data.username == friend_intra) {
		console.log("Can not be friends with themselves.");
		return (false);
	}
	if (await this.prismaService.addFriendToDb(client.data.username, friend_intra) == false)
		return false;
	const friend = await this.prismaService.findUserByIntra(friend_intra)
	client.emit('newfriend', {name: friend.full_name, intra: friend_intra, status: 0, pic: this.uploadImgService.fetchImgAsDataURL(friend.picture)})
	if (await this.prismaService.addFriendToDb(friend_intra, client.data.username) == false)
		return false;
	const friend2 = await this.prismaService.findUserByIntra(client.data.username)
	client.to(friend_intra).emit('newfriend', {name: friend2.full_name, intra: client.data.username, status: 0, pic: this.uploadImgService.fetchImgAsDataURL(friend2.picture)})
	return true;
  }
}


