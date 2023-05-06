import { Controller, Get, Query } from '@nestjs/common';
import { TfaService } from './tfa.service';
import * as speakeasy from 'speakeasy';

@Controller('tfa')
export class TfaController {
	private secret: string;
	constructor(private tfaService: TfaService) {}

	@Get('init')
	async initTFA() {
		const secret = this.tfaService.genTfaSecret();
		// console.log("Secret: " + Object.keys(secret));
		// console.log("Secret: " + secret.ascii);
		const qrCode = await this.tfaService.genQrCode(secret);
		const html = `
		<html>
			<head>
				<title>TFA</title>
			</head>
			<body>
				<img src="${qrCode}">
				<br>
				<p>Secret: ${secret.ascii}</p>
				<br>
				<br>
				<form action="verify">
					<label for="fname">Token:</label><br>
					<input type="text" id="token" name="token" value=""><br>
					<input type="submit" value="Submit">
				</form>
			</body>
		</html>
		`;
		this.secret = secret.ascii;
		console.log("initTFA: secret - " + this.secret);
		return (html);
	}
	
	@Get('verify')
	async verifyTFA(@Query('token') token: string) {
		console.log("verifyAuth: secret - " + this.secret);
		const res = this.tfaService.verifyTFA(this.secret, token);
		console.log("Verified: " + res);
		const html = `
		<html>
			<head>
			<title>TFA Verify</title>
			</head>
			<body>
				<p>Secret: ${this.secret}</p>
				<p>Token: ${token}</p>
				<p>Verified: ${res}</p>
			</body>
		</html>
		`;
		return (html);
	}
}
