import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { TfaService } from './tfa.service';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway()
export class TfaGateway {

	preSecretList: {intra: string, secret: any}[] = []

	constructor(private tfaService: TfaService, private prismaService: PrismaService) {}

	@SubscribeMessage('initTFA')
	async initTFA(client: any, payload: any): Promise<string> {
		let login;
		[login] = client.rooms;

		const secret = await this.tfaService.genTfaSecret(login);
		this.preSecretList.forEach((item, index, object) => {
			if (item.intra == login){
				object.splice(index, 1);
			}
		})
		this.preSecretList.push({intra: login, secret: secret})
		// this.prismaService.updateTFA(login, secret.base32);
		const qrcode = await this.tfaService.genQrCode(secret);

		return (qrcode);
	}

	@SubscribeMessage('verifyTFA')
	async verifyTFA(client: any, payload: any): Promise<boolean> {
		let login;
		[login] = client.rooms;
		let secret: any;

		this.preSecretList.forEach((item, index, object) => {
			if (item.intra == login){
				secret = item.secret;
				object.splice(index, 1);
			}
		})
		if (secret && this.tfaService.verifyTFA(secret.base32, payload)){
			this.prismaService.updateTFA(login, secret.base32);
			return true;
		}
		else{
			return false;
		}
	}
}
