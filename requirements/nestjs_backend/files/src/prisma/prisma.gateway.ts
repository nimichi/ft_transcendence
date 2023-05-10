import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { PrismaService } from './prisma.service';

@WebSocketGateway()
export class PrismaGateway {
	constructor(private prismaService: PrismaService) {}

  @SubscribeMessage('getUserNamePicture')
  async getUserName(client: any, payload: any): Promise<string> {
	let login;
	[login] = client.rooms;

	const user = await this.prismaService.findUserByIntra(login);

    return (user.picture);
  }
}
