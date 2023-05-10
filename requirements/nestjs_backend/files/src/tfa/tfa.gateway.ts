import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { TfaService } from './tfa.service';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway()
export class TfaGateway {

	constructor(private tfaService: TfaService, private prismaService: PrismaService) {}

	@SubscribeMessage('initTFA')
	async initTFA(client: any, payload: any): Promise<string> {
		let login;
		[login] = client.rooms;

		const secret = await this.tfaService.genTfaSecret(login);
		this.prismaService.updateTFA(login, secret.base32);
		const qrcode = await this.tfaService.genQrCode(secret);

		return (qrcode);
	}

	@SubscribeMessage('verifyTFA')
	async verifyTFA(client: any, payload: any): Promise<boolean> {
		let login;
		[login] = client.rooms;

		const secret =  await this.prismaService.getTfaSecret(login);
		const res = this.tfaService.verifyTFA(secret, payload);
		return (res);
	}
}
