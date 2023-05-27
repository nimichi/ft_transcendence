import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { UploadImgService } from './upload_img.service';

@WebSocketGateway()
export class UploadImgGateway {
	constructor(private uploadImgService: UploadImgService) {}

	@SubscribeMessage('userpic')
	async savePicture(client: any, payload: any) {
		const [login] = client.rooms;

		const ret = this.uploadImgService.uploadImg(login, payload);
		console.log("File name:", ret);
	}
}
