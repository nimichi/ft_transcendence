import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { PrismaService } from './prisma.service';

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
	constructor(private prismaService: PrismaService) {}

  @SubscribeMessage('getpic')
  async getUserName(client: any, intra: string): Promise<string> {
	const user = await this.prismaService.findUserByIntra(intra);

    return (user.picture);
  }

  @SubscribeMessage('updatefullname')
  async updateFullName(client: any, newName: string): Promise<{name: string, success: boolean}>{
	if (!await this.prismaService.findUserByIntra(client.data.username)) {
		return {name: "Error! User not found.", success: false};
	}
	if (await this.prismaService.checkIfFullnameExists(newName)){
		return {name: "Name already in use!", success: false}
	}
	await this.prismaService.updateFullName(client.data.username, newName)
	return {name: newName, success: true}
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
	return await this.prismaService.getFriends(intra);
  }

  @SubscribeMessage('userdata')
  async handleUserDataMessage(client: any, intra: string|null): Promise<User> {
	  if (!intra)
	  	intra = client.data.username;
	  return await this.prismaService.getUserdata(intra);
  }
}
