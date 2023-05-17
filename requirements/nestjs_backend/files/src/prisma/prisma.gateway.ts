import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { PrismaService } from './prisma.service';

@WebSocketGateway()
export class PrismaGateway {
	constructor(private prismaService: PrismaService) {}

  @SubscribeMessage('getUserNamePicture')
  async getUserName(client: any, payload: any): Promise<string> {
	const [login] = client.rooms;

	const user = await this.prismaService.findUserByIntra(login);

    return (user.picture);
  }

  @SubscribeMessage('updatefullname')
  async updateFullName(client: any, payload: string): Promise<string>{
	const [login] = client.rooms;

	this.prismaService.updateFullName(login, payload)
	return payload
  }
}
