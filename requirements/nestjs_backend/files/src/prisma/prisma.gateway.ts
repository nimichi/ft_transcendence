import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { PrismaService } from './prisma.service';
// import { File } from 'express';
import { writeFile } from "fs";

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

  @SubscribeMessage('updatePicture')
  async updatePicture(client: any, payload: Buffer): Promise<any> {
	const [login] = client.rooms;
	const user = await this.prismaService.findUserByIntra(login);
	const file_path = `./upload/pic/${user.intra_name}.jpeg`; // TODO: replace hard-coded path and ext?, mkdir upload/pic if it doesn't exist
	console.log(payload);
	writeFile(file_path, payload, () => {});

	// this.prismaService.updatePicture(login, file_path);
	return "updatePicture()";
  }
}
