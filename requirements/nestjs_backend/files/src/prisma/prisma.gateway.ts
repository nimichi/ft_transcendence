import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { PrismaService } from './prisma.service';

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
}
