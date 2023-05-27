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
  async updateFullName(client: any, payload: string): Promise<string>{
	const [login] = client.rooms;

	this.prismaService.updateFullName(login, payload)
	return payload
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
