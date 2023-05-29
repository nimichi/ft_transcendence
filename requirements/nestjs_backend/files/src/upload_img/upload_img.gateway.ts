import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { UploadImgService } from './upload_img.service';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway()
export class UploadImgGateway {
	constructor(private uploadImgService: UploadImgService,
				private prismaService: PrismaService) {}

	@SubscribeMessage('uploadUserpic')
	async savePicture(client: any, payload: any) {
		const [login] = client.rooms;

		const file_name = await this.uploadImgService.uploadImg(login, payload);
		console.log("File name:", file_name);
		this.prismaService.updatePicture(login, file_name);
		console.log("PIC:", await this.prismaService.getPicture(login));
	}

	@SubscribeMessage('fetchUserpic')
	async fetchPicture(client: any, payload: any) {
		const [login] = client.rooms;

		const file_name = await this.prismaService.getPicture(login);
		const img = this.uploadImgService.fetchImgAsDataURL(file_name);
		
		return (img);
	}
}
