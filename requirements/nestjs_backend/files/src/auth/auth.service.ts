import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios'
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs'

@Injectable()
export class AuthService {

	constructor(private readonly jwtService: JwtService, private readonly httpService: HttpService) {}

	successAuth(code: string) {
		if (code === undefined)
			return '<h1 style="color: red">FAIL</h1>';

		const data = {
			'grant_type': 'authorization_code',
			'client_id': process.env.API_UID,
			'client_secret' : process.env.API_SECRET,
			'code' : code,
			'redirect_uri' : process.env.API_REDIRECT

		};
		return this.httpService.post('https://api.intra.42.fr/oauth/token', data).pipe(map(response => response.data));

		//  curl -F grant_type=authorization_code \
		//  -F client_id=u-s4t2ud-c382e100c622295e93e44462a9d52a641082cd42bdfb563a589339714ddf3b08 \
		//  -F client_secret=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 \
		//  -F code=708e5d6e1b2a0f755c0265f8072ecd2af8bb5bf9b06ee38fc282e133e1f2c06b \
		//  -F redirect_uri=https://localhost:3000/auth \
		//  -X POST https://api.intra.42.fr/oauth/token


		// const payload = await this.jwtService.verifyAsync(token, {secret: process.env.JWT_SECRET});

		// return "<p>SUCCESFUL MY FRIEND!! :DD</p>";
	}
}
