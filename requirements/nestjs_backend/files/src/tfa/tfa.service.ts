import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class TfaService {

	genTfaSecret() {
		const secret = speakeasy.generateSecret({
			length: 20,
			name: "Mighty RMMLD"
		});

		return (secret);
	}

	async genQrCode(secret: any): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
				if (err) {
					reject(err);
				} else {
					console.log("QR Code: " + data_url);
					resolve(data_url);
				}
			});
		});
	}
}
