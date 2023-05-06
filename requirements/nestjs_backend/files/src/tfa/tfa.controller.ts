import { Controller, Get } from '@nestjs/common';
import { TfaService } from './tfa.service';

@Controller('tfa')
export class TfaController {
	constructor(private tfaService: TfaService) {}

	@Get('init')
	async initTFA() {
		const secret = this.tfaService.genTfaSecret();
		// console.log(secret.otpauth_url);
		const qrCode = await this.tfaService.genQrCode(secret);
		// console.log("QR CODE: " + qrCode);
		return ('<img src="' + qrCode + '">');
	}
}
