import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class TfaService {

	async genTfaSecret(login: string) {
		const secret = speakeasy.generateSecret({
			length: 20,
			name: "Mighty RMMLD for " + login
		});

		return (secret);
	}

	async genQrCode(secret: any): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
				if (err) {
					reject(err);
				} else {
					resolve(data_url);
				}
			});
		});
	}

	verifyTFA(secret: string, token: string): boolean {

		return ( speakeasy.totp.verify({
			secret: secret,
			encoding: 'ascii',
			token: token
		}) );
	}
}
